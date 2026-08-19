/**
 * Token types for the templjs templating system
 */
export var TokenType;
(function (TokenType) {
    /** Plain text content */
    TokenType["TEXT"] = "TEXT";
    /** Control flow statements like {% if %}, {% for %} */
    TokenType["STATEMENT"] = "STATEMENT";
    /** Variable expressions like {{ `user.name` }} */
    TokenType["EXPRESSION"] = "EXPRESSION";
    /** Comments like {# note #} - ignored in output */
    TokenType["COMMENT"] = "COMMENT";
})(TokenType || (TokenType = {}));
export function buildDefaultDelimiters(boundaries) {
    for (const [key, value] of Object.entries(boundaries)) {
        if (typeof value !== 'string' || value.length === 0) {
            throw new Error(`Delimiter "${key}" must be a non-empty string`);
        }
    }
    return {
        ...boundaries,
        statement: [boundaries.statement_start, boundaries.statement_end],
        expression: [boundaries.expression_start, boundaries.expression_end],
        comment: [boundaries.comment_start, boundaries.comment_end],
    };
}
/**
 * Default delimiter configuration
 */
export const DEFAULT_DELIMITERS = buildDefaultDelimiters({
    statement_start: '{%',
    statement_end: '%}',
    expression_start: '{{',
    expression_end: '}}',
    comment_start: '{#',
    comment_end: '#}',
});
/**
 * Merge a partial delimiter config with the defaults, returning a fully
 * resolved `Required<DelimiterConfig>`.  Tuple fields (`statement`,
 * `expression`, `comment`) take precedence over the matching scalar
 * `_start`/`_end` fields, matching the lexer's own resolution order.
 *
 * @example
 * const config = mergeDelimiterConfig({ expression: ['[[', ']]'] });
 * // config.expression        → ['[[', ']]']
 * // config.expression_start  → '[['
 * // config.expression_end    → ']]'
 * // config.statement_start   → '{%'  (default)
 */
export function mergeDelimiterConfig(partial) {
    const statementStart = partial.statement?.[0] ?? partial.statement_start ?? DEFAULT_DELIMITERS.statement_start;
    const statementEnd = partial.statement?.[1] ?? partial.statement_end ?? DEFAULT_DELIMITERS.statement_end;
    const expressionStart = partial.expression?.[0] ?? partial.expression_start ?? DEFAULT_DELIMITERS.expression_start;
    const expressionEnd = partial.expression?.[1] ?? partial.expression_end ?? DEFAULT_DELIMITERS.expression_end;
    const commentStart = partial.comment?.[0] ?? partial.comment_start ?? DEFAULT_DELIMITERS.comment_start;
    const commentEnd = partial.comment?.[1] ?? partial.comment_end ?? DEFAULT_DELIMITERS.comment_end;
    return buildDefaultDelimiters({
        statement_start: statementStart,
        statement_end: statementEnd,
        expression_start: expressionStart,
        expression_end: expressionEnd,
        comment_start: commentStart,
        comment_end: commentEnd,
    });
}
//# sourceMappingURL=types.js.map