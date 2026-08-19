/**
 * Expression parsing module with priority-based rule dispatch
 *
 * This module implements the core logic for parsing template expressions into AST nodes.
 * It uses a priority-ordered rule list to dispatch expression parsing to the most
 * appropriate parser based on the expression type.
 *
 * Key features:
 * - Priority-based parsing: Rules are evaluated in order of priority (lower number = higher priority)
 * - Binary operator: Operators are matched with proper precedence (e.g., && before ||, * before +)
 * - Quote-aware splitting: Operator detection respects string literal boundaries
 * - Unary and ternary support: Handles unary operators, ternary conditionals
 * - Error handling: Creates error expressions for malformed input
 *
 * @module parser/parsers
 *
 * @example
 * ```ts
 * const expr = 'x && y || z';
 * const result = parseExpressionWithPriorityList(expr, context);
 * // Returns: logical_op { operator: '||', left: 'x && y', right: 'z' }
 * ```
 */
import type { ExpressionNode, LiteralNode, FilterNode, VariableNode, FunctionCallNode } from './types.js';
/**
 * Result of binary operator matching with left and right operands
 */
export interface BinaryMatch {
    /** The matched operator (e.g., '+', '&&', '||') */
    operator: string;
    /** Left operand string */
    left: string;
    /** Right operand string */
    right: string;
}
/**
 * Context object passed to expression parser rules and helper functions
 * Provides access to parsing functions and utilities
 */
export interface ExpressionParserContext {
    /** Parse a general expression string into an AST node */
    parseExpression: (expr: string) => ExpressionNode;
    /** Parse a literal value (string, number, boolean, null) */
    parseLiteral: (expr: string) => LiteralNode | null;
    /** Parse a filter expression (e.g., user | upper) */
    parseFilterExpression: (expr: string) => FilterNode;
    /** Parse a variable reference or function call */
    parseVariable: (expr: string) => VariableNode | FunctionCallNode;
    /** Parse object literal properties */
    parseObjectProperties: (inner: string) => Array<{
        key: string;
        value: ExpressionNode;
    }>;
    /** Split a string by delimiter respecting nesting */
    splitTopLevel: (str: string, delimiter: string) => string[];
    /** Check if a character can start a variable name */
    isVariableStart: (char: string) => boolean;
    /** Create an error expression node */
    createErrorExpression: (message: string) => ExpressionNode;
}
/**
 * Snapshot emitted by createCharContextIterator for each visited character.
 *
 * Because the iterator skips characters inside quoted string literals and template-literal body
 * segments before invoking the visitor, emitted CharContextFrame values will have
 * inSingleQuote, inDoubleQuote, and inTemplateBody set to false.
 *
 * To reason about template-literal/interpolation nesting in emitted frames, use
 * inTemplateExpr, templateLiteralDepth, and templateExprDepth. The inTemplateBody field is
 * retained for API compatibility and is always false for emitted frames.
 */
export interface CharContextFrame {
    index: number;
    ch: string;
    nextCh: string | undefined;
    depthBefore: number;
    depthAfter: number;
    /**
     * Always false for emitted frames.
     *
     * createCharContextIterator does not invoke the visitor while scanning template literal body
     * content. This field is retained as a compatibility marker for existing consumers.
     */
    inTemplateBody: boolean;
    inTemplateExpr: boolean;
    inSingleQuote: boolean;
    inDoubleQuote: boolean;
    templateLiteralDepth: number;
    templateExprDepth: number;
}
export interface CharContextSummary {
    depth: number;
    inSingleQuote: boolean;
    inDoubleQuote: boolean;
    templateLiteralDepth: number;
    templateExprDepth: number;
    templateContextDepth: number;
    inLineComment: boolean;
    inBlockComment: boolean;
}
/**
 * Consumer-facing character iterator for expression scanning and structural analysis.
 *
 * Walks each character in `expr`, tracks nesting, string-literal, comment, and template-literal
 * state, and emits {@link CharContextFrame} snapshots to `visitor` for characters that are
 * structurally relevant to downstream parsing helpers.
 *
 * Note: characters inside template literal bodies (outside `${...}` interpolation segments) are
 * not emitted to `visitor`. As a result, emitted {@link CharContextFrame}.inTemplateBody is
 * always false.
 *
 * This is primarily used by parser utilities that need quote-aware and template-aware traversal
 * without re-implementing state management. Consumers can inspect each emitted
 * {@link CharContextFrame} to determine whether a character should be treated as structural at the
 * current point in the scan.
 *
 * @param expr - Expression source to scan character by character.
 * @param visitor - Callback invoked with each emitted {@link CharContextFrame}. Returning `false`
 * stops iteration immediately; returning `void` or any other value continues scanning.
 * @param options - Iterator configuration.
 * @param options.allowStructuralInTemplateExpr - When `true`, characters inside template
 * expression segments such as `${...}` are still emitted to `visitor` and can affect structural
 * parsing with one intentional asymmetry: interpolation-control braces (`{` / `}`) are consumed by
 * template-expression tracking and do not contribute to general `depth`, while structural
 * parentheses and brackets (`(` / `)` / `[` / `]`) inside `${...}` still contribute to `depth`.
 * For example, `${ { a: 1 } }` does not increment general structural depth for the interpolation
 * braces, but `${ (a + b) }` does for the parentheses. When `false`, template-expression contents
 * are tracked for state only and skipped from structural visitation, which is useful when callers
 * want to ignore operators and delimiters nested inside template interpolations.
 * @returns {@link CharContextSummary} describing the final scan state after iteration stops or
 * completes. `depth` is the final structural nesting depth for `()`, `[]`, and `{}` outside
 * interpolation-control braces (`${` / `}`) that are handled by template-expression tracking;
 * quote flags
 * indicate whether scanning ended inside single or double quoted strings; `templateLiteralDepth`
 * and `templateExprDepth` report remaining open template literal and interpolation nesting;
 * `templateContextDepth` reports the total active template-context stack depth; and
 * `inLineComment` / `inBlockComment` indicate whether scanning ended inside an unterminated line
 * or block comment. Consumers should use the returned {@link CharContextSummary} to detect
 * unbalanced or unterminated constructs after visiting frames.
 */
export declare function createCharContextIterator(expr: string, visitor: (frame: CharContextFrame) => boolean | void, options?: {
    allowStructuralInTemplateExpr?: boolean;
}): CharContextSummary;
/**
 * Check whether an expression is wrapped by exactly one outermost pair of parentheses.
 *
 * The expression must begin with `(` and end with `)`, and no closing parenthesis may
 * bring nesting back to depth 0 before the final character. This helper also tracks
 * template literal and interpolation state so that parentheses inside template literals
 * are treated as non-structural, while parentheses inside `${...}` expressions remain
 * structural.
 *
 * @param expr - Expression text to inspect.
 * @returns `true` when the entire expression is enclosed by a single outer pair of
 * parentheses; otherwise `false`.
 *
 * @example
 * isWrappedByOutermostParens('(x + y)'); // true
 * isWrappedByOutermostParens('(x) + (y)'); // false
 * isWrappedByOutermostParens('(`${a}`)'); // true
 */
export declare function isWrappedByOutermostParens(expr: string): boolean;
/**
 * Parse an expression string into an AST node using priority-based rule dispatch
 *
 * Evaluates registered expression parser rules in order of priority until one matches.
 * Falls back to error expression if no rule matches the input.
 *
 * @param expr - The expression string to parse
 * @param context - Parser context providing helper functions and callbacks
 * @returns Parsed expression AST node
 *
 * @example
 * ```ts
 * const node = parseExpressionWithPriorityList('x + 1', context);
 * // Returns: { type: 'binary_op', operator: '+', ... }
 * ```
 */
export declare function parseExpressionWithPriorityList(expr: string, context: ExpressionParserContext): ExpressionNode;
/**
 * Match a binary operator in an expression with proper precedence handling
 *
 * Scans for binary operators in order of precedence (lowest to highest),
 * respecting string literal boundaries and nested structures.
 * Stops at the lowest-precedence operator found.
 *
 * Precedence levels (from lowest to highest priority):
 * - 15: || (logical or)
 * - 14: && (logical and)
 * - 12: | (filter)
 * - 11: in, not in
 * - 9: ===, !==, ==, !=
 * - 10: <=, >=, <, >
 * - 11: +, -
 * - 12: *, /, %
 *
 * @param expr - The expression string to scan
 * @returns {@link BinaryMatch} with operator and operands, or null if no match found
 *
 * @example
 * ```ts
 * const match = matchBinaryOpWithPrecedence('x && y || z');
 * // Returns: { operator: '||', left: 'x && y', right: 'z' }
 * ```
 */
export declare function matchBinaryOpWithPrecedence(expr: string): BinaryMatch | null;
/**
 * Split an expression at an operator, scanning from left to right (left-associative)
 *
 * Finds the first occurrence of the operator at depth 0 (outside of nested structures
 * and string literals), splitting the expression into left and right operands.
 *
 * Key features:
 * - Quote-aware: Ignores operators inside single or double quoted strings
 * - Escape-aware: Handles escaped characters (e.g., \\" in strings)
 * - Depth-aware: Ignores operators inside parentheses, brackets, or braces
 * - Left-associative: Returns the leftmost operator match
 *
 * @param expr - The expression string to split
 * @param op - The operator to split on
 * @returns Split result with left and right operands, or null if operator not found
 *
 * @example
 * ```ts
 * splitByOperatorFromLeft('x + y + z', '+');
 * // Returns: { left: 'x ', right: ' y + z' }
 * splitByOperatorFromLeft('add("x+y") + z', '+');
 * // Returns: { left: 'add("x+y") ', right: ' z' }
 * ```
 */
export declare function splitByOperatorFromLeft(expr: string, op: string): {
    left: string;
    right: string;
} | null;
/**
 * Split an expression at an operator, scanning from left to right but returning rightmost match
 * (right-associative)
 *
 * Finds the rightmost occurrence of the operator at depth 0 (outside of nested structures
 * and string literals), splitting the expression into left and right operands.
 *
 * Key features:
 * - Quote-aware: Ignores operators inside single or double quoted strings
 * - Escape-aware: Handles escaped characters (e.g., \\" in strings)
 * - Depth-aware: Ignores operators inside parentheses, brackets, or braces
 * - Right-associative: Returns the rightmost operator match
 *
 * @param expr - The expression string to split
 * @param op - The operator to split on
 * @returns Split result with left and right operands, or null if operator not found
 *
 * @example
 * ```ts
 * splitByOperatorFromRight('x + y + z', '+');
 * // Returns: { left: 'x + y ', right: ' z' }
 * splitByOperatorFromRight('add("x+y") + z', '+');
 * // Returns: { left: 'add("x+y") ', right: ' z' }
 * ```
 */
export declare function splitByOperatorFromRight(expr: string, op: string): {
    left: string;
    right: string;
} | null;
