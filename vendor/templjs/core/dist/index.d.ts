/**
 * @templjs/core - Core template parser, renderer, and query engine
 *
 * This is the main library for the templjs meta-templating system.
 * It provides functionality for parsing templates, rendering output,
 * and querying structured data.
 */
export declare const version: string;
export type * from './lexer/types.js';
export type * from './parser/types.js';
export type * from './schema/types.js';
export type * from './query-engine/types.js';
export type * from './semantic/template-scopes.js';
export type * from './semantic/semantic-context.js';
export type * from './semantic/expression-references.js';
export type { FilterFunction } from './query-engine/types.js';
export type * from './renderer/types.js';
export { TokenType, DEFAULT_DELIMITERS } from './lexer/types.js';
export { tokenize } from './lexer/lexer.js';
export { parse } from './parser/parser.js';
export { createCharContextIterator } from './parser/parsers.js';
export type { CharContextFrame, CharContextSummary } from './parser/parsers.js';
export { SchemaValidator } from './schema/SchemaValidator.js';
export { extractPaths, isValidPath } from './schema/queryPathValidator.js';
export { inferSchemaFromValue, mergeSchemas } from './schema/schemaInference.js';
export { extractTemplateBindings, getTemplateBindingsAtOffset, } from './semantic/template-scopes.js';
export { extractExpressionFilterReferences, extractExpressionVariableReferences, } from './semantic/expression-references.js';
export { detectFrontmatterRange, getSemanticProfileId, getFrontmatterKeyValueAtOffset, getFrontmatterSchemaSources, getFrontmatterSchemaReferenceAtOffset, getTokenAtOffset, isOffsetInFrontmatter, resolveSemanticHostLanguage, resolveSemanticZone, resolveSemanticZoneByHostLanguage, resolveSemanticZoneSegment, toSemanticZone, } from './semantic/semantic-context.js';
export { extractTemplateStatementExpression, parseTemplateForHeader, validateTemplateStatementSyntax, } from './semantic/statement-syntax.js';
export type { TemplateForHeader, TemplateStatementExpression, TemplateStatementSyntaxValidationResult, } from './semantic/statement-syntax.js';
export type { ValidationResult, ValidationError, SchemaMetadata, JSONSchema, } from './schema/types.js';
export { QueryEngine, filter, query } from './query-engine/query-engine.js';
export type { FunctionSignature } from './query-engine/types.js';
export { Renderer, render } from './renderer/renderer.js';
export { BUILTIN_FILTER_NAMES, getBuiltinFilterNames, clearFormatterCaches, } from './renderer/filter-engine.js';
export { isHighlightablePosition, UNKNOWN_POSITION } from './renderer/evaluators.js';
import { QueryEngine } from './query-engine/query-engine.js';
import type { FunctionSignature } from './query-engine/types.js';
import { tokenize } from './lexer/lexer.js';
import type { Position } from './lexer/types.js';
import { parse } from './parser/parser.js';
import type { ParseDiagnosticPhase } from './parser/types.js';
import { render } from './renderer/renderer.js';
import { extractTemplateBindings } from './semantic/template-scopes.js';
import { extractExpressionFilterReferences } from './semantic/expression-references.js';
import { extractExpressionVariableReferences } from './semantic/expression-references.js';
import type { RenderOptions } from './renderer/types.js';
/**
 * Create a lexer instance for tokenizing templates
 *
 * @returns Lexer interface with tokenize function
 */
export declare function createLexer(): {
    tokenize: typeof tokenize;
};
/**
 * Create a parser instance for generating AST from tokens
 *
 * @returns Parser interface with parse function
 */
export declare function createParser(): {
    parse: typeof parse;
};
/**
 * Create a renderer instance for rendering templates
 *
 * @returns Renderer interface with render function
 */
export declare function createRenderer(): {
    render: typeof render;
};
/**
 * Create a fully configured query engine instance.
 */
export declare function createQueryEngine(): QueryEngine;
/**
 * Get built-in filter signatures registered by the query engine.
 *
 * Note: if a function has multiple overload signatures in `metadata.functions`,
 * this API exposes only the first signature (`signatures[0]`) for that function
 * in `cachedBuiltinFilterSignatures`.
 *
 * Callers that need all overloads should use `getBuiltinFilterOverloads()`.
 */
export declare function getBuiltinFilterSignatures(): Record<string, import('./query-engine/types.js').FunctionSignature>;
/**
 * Get all built-in filter signatures registered by the query engine.
 *
 * This overload-aware API preserves every signature registered for overloaded
 * functions such as `reverse`, while `getBuiltinFilterSignatures()` remains the
 * backward-compatible one-signature-per-filter convenience API.
 */
export declare function getBuiltinFilterOverloads(): Record<string, FunctionSignature[]>;
/**
 * Render a template string with the provided data
 * @param template - Template string to render
 * @param data - Data for rendering
 * @param options - Optional render options
 * @returns Rendered template output
 * @throws Error if tokenization, parsing, or rendering fails
 */
export declare function renderTemplate(template: string, data: Record<string, unknown>, options?: RenderOptions): string;
export interface SyntaxDiagnosticRecord {
    phase: ParseDiagnosticPhase;
    severity: 1 | 2 | 3 | 4;
    message: string;
    location?: Position;
    source: 'templjs.core';
}
export interface ValidateTemplateResult {
    valid: boolean;
    syntaxDiagnostics: SyntaxDiagnosticRecord[];
}
/**
 * Validate a template string for syntax errors.
 * @param template - Template string to validate.
 * @returns Validation result with structured syntax diagnostics.
 */
export declare function validateTemplate(template: string): ValidateTemplateResult;
declare const _default: {
    version: string;
    createLexer: typeof createLexer;
    createParser: typeof createParser;
    createRenderer: typeof createRenderer;
    createQueryEngine: typeof createQueryEngine;
    extractTemplateBindings: typeof extractTemplateBindings;
    extractExpressionFilterReferences: typeof extractExpressionFilterReferences;
    extractExpressionVariableReferences: typeof extractExpressionVariableReferences;
    renderTemplate: typeof renderTemplate;
    validateTemplate: typeof validateTemplate;
};
export default _default;
