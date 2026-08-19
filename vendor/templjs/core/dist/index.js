/**
 * @templjs/core - Core template parser, renderer, and query engine
 *
 * This is the main library for the templjs meta-templating system.
 * It provides functionality for parsing templates, rendering output,
 * and querying structured data.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
export const version = packageJson.version;
// Export runtime values from lexer/types
export { TokenType, DEFAULT_DELIMITERS } from './lexer/types.js';
// Export lexer functions
export { tokenize } from './lexer/lexer.js';
// Export parser functions
export { parse } from './parser/parser.js';
export { createCharContextIterator } from './parser/parsers.js';
// Export schema validation
export { SchemaValidator } from './schema/SchemaValidator.js';
export { extractPaths, isValidPath } from './schema/queryPathValidator.js';
export { inferSchemaFromValue, mergeSchemas } from './schema/schemaInference.js';
export { extractTemplateBindings, getTemplateBindingsAtOffset, } from './semantic/template-scopes.js';
export { extractExpressionFilterReferences, extractExpressionVariableReferences, } from './semantic/expression-references.js';
export { detectFrontmatterRange, getSemanticProfileId, getFrontmatterKeyValueAtOffset, getFrontmatterSchemaSources, getFrontmatterSchemaReferenceAtOffset, getTokenAtOffset, isOffsetInFrontmatter, resolveSemanticHostLanguage, resolveSemanticZone, resolveSemanticZoneByHostLanguage, resolveSemanticZoneSegment, toSemanticZone, } from './semantic/semantic-context.js';
export { extractTemplateStatementExpression, parseTemplateForHeader, validateTemplateStatementSyntax, } from './semantic/statement-syntax.js';
// Export query engine
export { QueryEngine, filter, query } from './query-engine/query-engine.js';
// Export renderer
export { Renderer, render } from './renderer/renderer.js';
// Clears process-global Intl formatter caches. Intended for test isolation or
// explicit memory-pressure control, not routine request-path usage.
export { BUILTIN_FILTER_NAMES, getBuiltinFilterNames, clearFormatterCaches, } from './renderer/filter-engine.js';
export { isHighlightablePosition, UNKNOWN_POSITION } from './renderer/evaluators.js';
import { QueryEngine } from './query-engine/query-engine.js';
import { tokenize } from './lexer/lexer.js';
import { parse } from './parser/parser.js';
import { render } from './renderer/renderer.js';
import { extractTemplateBindings } from './semantic/template-scopes.js';
import { extractExpressionFilterReferences } from './semantic/expression-references.js';
import { extractExpressionVariableReferences } from './semantic/expression-references.js';
/**
 * Create a lexer instance for tokenizing templates
 *
 * @returns Lexer interface with tokenize function
 */
export function createLexer() {
    return {
        tokenize,
    };
}
/**
 * Create a parser instance for generating AST from tokens
 *
 * @returns Parser interface with parse function
 */
export function createParser() {
    return {
        parse,
    };
}
/**
 * Create a renderer instance for rendering templates
 *
 * @returns Renderer interface with render function
 */
export function createRenderer() {
    return {
        render,
    };
}
/**
 * Create a fully configured query engine instance.
 */
export function createQueryEngine() {
    return new QueryEngine();
}
let cachedBuiltinFilterSignatures;
let cachedBuiltinFilterOverloads;
/**
 * Get built-in filter signatures registered by the query engine.
 *
 * Note: if a function has multiple overload signatures in `metadata.functions`,
 * this API exposes only the first signature (`signatures[0]`) for that function
 * in `cachedBuiltinFilterSignatures`.
 *
 * Callers that need all overloads should use `getBuiltinFilterOverloads()`.
 */
export function getBuiltinFilterSignatures() {
    if (cachedBuiltinFilterSignatures) {
        return cachedBuiltinFilterSignatures;
    }
    const engine = createQueryEngine();
    const metadata = engine.getMetadata();
    const result = {};
    for (const [name, signatures] of metadata.functions.entries()) {
        if (signatures.length > 0) {
            result[name] = signatures[0];
        }
    }
    cachedBuiltinFilterSignatures = result;
    return cachedBuiltinFilterSignatures;
}
/**
 * Get all built-in filter signatures registered by the query engine.
 *
 * This overload-aware API preserves every signature registered for overloaded
 * functions such as `reverse`, while `getBuiltinFilterSignatures()` remains the
 * backward-compatible one-signature-per-filter convenience API.
 */
export function getBuiltinFilterOverloads() {
    if (cachedBuiltinFilterOverloads) {
        return cachedBuiltinFilterOverloads;
    }
    const engine = createQueryEngine();
    const metadata = engine.getMetadata();
    const result = {};
    for (const [name, signatures] of metadata.functions.entries()) {
        if (signatures.length > 0) {
            result[name] = [...signatures];
        }
    }
    cachedBuiltinFilterOverloads = result;
    return cachedBuiltinFilterOverloads;
}
/**
 * Render a template string with the provided data
 * @param template - Template string to render
 * @param data - Data for rendering
 * @param options - Optional render options
 * @returns Rendered template output
 * @throws Error if tokenization, parsing, or rendering fails
 */
export function renderTemplate(template, data, options) {
    try {
        // Tokenize the template
        const tokens = tokenize(template);
        // Parse the tokens
        const parseResult = parse(tokens);
        if (parseResult.errors.length > 0) {
            const errorMessages = parseResult.errors.map((error) => `${error.type}: ${error.message}`);
            throw new Error(`Failed to parse template: ${errorMessages.join('; ')}`);
        }
        if (!parseResult.ast) {
            throw new Error('Failed to parse template: no AST generated');
        }
        // Render the AST
        const renderResult = render(parseResult.ast, data, options);
        if (!renderResult.success && options?.throwOnError) {
            const errorMessages = renderResult.errors.map((e) => e.message).join('; ');
            throw new Error(errorMessages);
        }
        return renderResult.output;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.startsWith('Render failed:')) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(message, { cause: error });
        }
        throw new Error(`Render failed: ${message}`, { cause: error });
    }
}
/**
 * Validate a template string for syntax errors.
 * @param template - Template string to validate.
 * @returns Validation result with structured syntax diagnostics.
 */
export function validateTemplate(template) {
    try {
        // Tokenize the template
        const tokens = tokenize(template);
        // Parse the tokens
        const parseResult = parse(tokens);
        // Check for parse errors
        if (parseResult.errors && parseResult.errors.length > 0) {
            return {
                valid: false,
                syntaxDiagnostics: parseResult.errors.map((err) => ({
                    phase: err.type,
                    severity: 1,
                    message: err.message,
                    location: err.location,
                    source: 'templjs.core',
                })),
            };
        }
        // Check if AST was generated
        if (!parseResult.ast) {
            return {
                valid: false,
                syntaxDiagnostics: [
                    {
                        phase: 'parse',
                        severity: 1,
                        message: 'Failed to generate AST from template',
                        source: 'templjs.core',
                    },
                ],
            };
        }
        return { valid: true, syntaxDiagnostics: [] };
    }
    catch (error) {
        return {
            valid: false,
            syntaxDiagnostics: [
                {
                    phase: 'lexical',
                    severity: 1,
                    message: error instanceof Error ? error.message : String(error),
                    source: 'templjs.core',
                },
            ],
        };
    }
}
export default {
    version,
    createLexer,
    createParser,
    createRenderer,
    createQueryEngine,
    extractTemplateBindings,
    extractExpressionFilterReferences,
    extractExpressionVariableReferences,
    renderTemplate,
    validateTemplate,
};
//# sourceMappingURL=index.js.map