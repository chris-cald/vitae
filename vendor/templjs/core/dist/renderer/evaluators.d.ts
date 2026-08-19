import type { BinaryOpNode, ExpressionNode, ErrorNode, FilterNode, LiteralNode, ParenNode, TernaryNode, UnaryOpNode, VariableNode } from '../parser/types.js';
import type { RenderContext } from './types.js';
type AnyValue = any;
/**
 * Sentinel position used when a node has no source-location information.
 * `line` is 1-based; `column` is 0-based. Consumer-facing helper for IDE/Volar integration.
 */
export declare const UNKNOWN_POSITION: {
    readonly line: -1;
    readonly column: -1;
};
/**
 * Type guard for a usable source position.
 * Accepts an undefined or partial position object and returns `true` only when
 * both `line` (≥ 1, 1-based) and `column` (≥ 0, 0-based) are present numeric
 * values. Consumer-facing helper for IDE/Volar integration.
 */
export declare function isHighlightablePosition(position: Partial<{
    line: number;
    column: number;
}> | null | undefined): position is {
    line: number;
    column: number;
};
/**
 * Evaluate a literal expression
 */
export declare function evaluateLiteral(expr: LiteralNode, _context: RenderContext): AnyValue;
/**
 * Resolve a variable reference by traversing scopes and data
 */
export declare function evaluateVariable(node: VariableNode, context: RenderContext): AnyValue;
/**
 * Evaluate a filter chain expression
 */
export declare function evaluateFilter(expr: FilterNode, context: RenderContext): AnyValue;
/**
 * Evaluate a binary operation with JavaScript-correct semantics
 */
export declare function evaluateBinaryOp(node: BinaryOpNode, context: RenderContext): AnyValue;
/**
 * Evaluate a unary operation
 */
export declare function evaluateUnaryOp(node: UnaryOpNode, context: RenderContext): AnyValue;
/**
 * Evaluate a parenthesized expression
 */
export declare function evaluateParen(node: ParenNode, context: RenderContext): AnyValue;
/**
 * Evaluate a ternary conditional expression
 */
export declare function evaluateTernary(node: TernaryNode, context: RenderContext): AnyValue;
/**
 * Handle parse error expressions
 */
export declare function evaluateError(expr: ErrorNode, context: RenderContext): AnyValue;
/**
 * Main expression evaluator - dispatches to specific evaluators
 * This is the core evaluation function called by the renderer
 */
export declare function evaluateExpression(expr: ExpressionNode, context: RenderContext): AnyValue;
export {};
