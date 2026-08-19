/**
 * Chevrotain-based parser that converts tokens into an Abstract Syntax Tree
 */
import type { Token } from '../lexer/types.js';
import type { ParseResult } from './types.js';
export type ExtractTokenInput = Pick<Token, 'content' | 'delimiterStart' | 'delimiterEnd'>;
export interface DelimiterConfig {
    start: string;
    end: string;
}
export interface ExtractedContent {
    content: string;
    contentStart: number;
    contentEnd: number;
}
/**
 * Parser for converting token stream into AST
 * Handles statements (if, for, set, block) and expressions
 */
export declare class TemplateParser {
    private tokens;
    private position;
    private errors;
    constructor(tokens: Token[]);
    /**
     * Parse the token stream into an AST
     */
    parse(): ParseResult;
    /**
     * Parse a text node
     */
    private parseText;
    /**
     * Parse a statement (if, for, set, block, etc.)
     */
    private parseStatement;
    /**
     * Parse an if/else statement
     * Syntax: {% if condition %}...{% else %}...{% endif %}
     */
    private parseIfStatement;
    /**
     * Parse a for loop
     * Syntax: {% for item in items %}...{% endfor %}
     * or {% for key, value in object %}...{% endfor %}
     */
    private parseForStatement;
    /**
     * Parse a set statement
     * Syntax: {% set x = value %}
     */
    private parseSetStatement;
    /**
     * Parse a block definition
     * Syntax: {% block name %}...{% endblock %}
     */
    private parseBlockStatement;
    /**
     * Parse an expression statement {{ ... }}
     */
    private parseExpressionStatement;
    /**
     * Parse body of a statement until a closing keyword
     */
    private parseStatementBody;
    /**
     * Parse a condition expression (for if statements)
     */
    private parseCondition;
    /**
     * Parse an expression string into an ExpressionNode
     * Supports: variables, literals, filters, function calls, operators
     */
    private parseExpression;
    /**
     * Parse a filter expression with pipes
     */
    private parseFilterExpression;
    /**
     * Parse a variable reference with path (properties and indices)
     */
    private parseVariable;
    /**
     * Parse the path part of a variable (properties and indices)
     */
    private parsePath;
    /**
     * Parse literal values (strings, numbers, booleans, null)
     */
    private parseLiteral;
    /**
     * Parse object properties
     */
    private parseObjectProperties;
    /**
     * Split string by delimiter respecting nested structures
     */
    private splitTopLevel;
    /**
     * Check if character can start a variable name
     */
    private isVariableStart;
    /**
     * Extract statement content between delimiters.
     *
     * Callers must provide delimiter information either via token metadata
     * (`delimiterStart`/`delimiterEnd`) or through `delimiters`.
     *
     * @param tokenOrContent - Statement token-like input or raw statement content.
     * @param delimiters - Optional explicit delimiter configuration used when input metadata is missing.
     * @returns Extracted statement text and content bounds relative to token.content start.
     */
    extractStatementContent(tokenOrContent: string | ExtractTokenInput, delimiters?: DelimiterConfig): ExtractedContent;
    /**
     * Extract expression content between delimiters.
     *
     * Callers must provide delimiter information either via token metadata
     * (`delimiterStart`/`delimiterEnd`) or through `delimiters`.
     *
     * @param tokenOrContent - Expression token-like input or raw expression content.
     * @param delimiters - Optional explicit delimiter configuration used when input metadata is missing.
     * @returns Extracted expression text and content bounds relative to token.content start.
     */
    extractExpressionContent(tokenOrContent: string | ExtractTokenInput, delimiters?: DelimiterConfig): ExtractedContent;
    /**
     * Parse an error statement
     */
    private parseErrorStatement;
    /**
     * Create an error expression
     */
    private createErrorExpression;
    /**
     * Create an error variable node
     */
    private createErrorVariable;
    /**
     * Create an error for node
     */
    private createErrorForNode;
    /**
     * Create an error set node
     */
    private createErrorSetNode;
    /**
     * Create an error block node
     */
    private createErrorBlockNode;
    /**
     * Add an error to the errors list
     */
    private addError;
    /**
     * Get current token without advancing
     */
    private peek;
    /**
     * Advance to next token and return current
     */
    private advance;
    /**
     * Check if at end of tokens
     */
    private isAtEnd;
}
/**
 * Parse tokens into an AST
 * @param tokens - Array of tokens from the lexer
 * @returns Parse result containing AST and any errors
 */
export declare function parse(tokens: Token[]): ParseResult;
/**
 * Extract statement content between delimiters without instantiating TemplateParser.
 *
 * @param tokenOrContent - Statement token-like input or raw statement content.
 * @param delimiters - Explicit delimiter configuration; required when token metadata is absent.
 * @returns Extracted statement text and content bounds relative to token.content start.
 */
export declare function extractStatementContent(tokenOrContent: string | ExtractTokenInput, delimiters?: DelimiterConfig): ExtractedContent;
/**
 * Extract expression content between delimiters without instantiating TemplateParser.
 *
 * @param tokenOrContent - Expression token-like input or raw expression content.
 * @param delimiters - Explicit delimiter configuration; required when token metadata is absent.
 * @returns Extracted expression text and content bounds relative to token.content start.
 */
export declare function extractExpressionContent(tokenOrContent: string | ExtractTokenInput, delimiters?: DelimiterConfig): ExtractedContent;
