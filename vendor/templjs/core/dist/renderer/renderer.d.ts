/**
 * Template rendering engine that traverses AST and produces output
 */
import type { TemplateNode, ASTNode } from '../parser/types.js';
import type { RenderResult, RenderOptions } from './types.js';
type AnyValue = any;
/**
 * Main template renderer
 *
 * Traverses AST and generates rendered output with proper variable resolution,
 * filter application, and scope management.
 */
export declare class Renderer {
    private options;
    private filters;
    /**
     * Create a new renderer instance
     */
    constructor(options?: RenderOptions);
    /**
     * Register a custom filter
     */
    registerFilter(name: string, fn: (value: AnyValue, ...args: AnyValue[]) => AnyValue): void;
    /**
     * Render an AST with the given data
     *
     * @param ast - The abstract syntax tree to render
     * @param data - The data context for variable resolution
     * @returns The rendered output and any errors that occurred
     */
    render(ast: TemplateNode | ASTNode, data: AnyValue): RenderResult;
}
/**
 * Render an AST node with the provided data context.
 *
 * Convenience wrapper around `new Renderer(options).render(ast, data)`.
 *
 * @param ast - The abstract syntax tree to render (from `parse()`)
 * @param data - Data context used for variable resolution
 * @param options - Optional render configuration (errors, depth limit, debug)
 * @returns Render result with `output` string and `errors` array
 *
 * @example
 * ```typescript
 * const tokens = tokenize('Hello {{ name }}!');
 * const { ast } = parse(tokens);
 * const { output } = render(ast, { name: 'World' });
 * // output → 'Hello World!'
 * ```
 */
export declare function render(ast: TemplateNode | ASTNode, data: AnyValue, options?: RenderOptions): RenderResult;
export {};
