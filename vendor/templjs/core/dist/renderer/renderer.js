/**
 * Template rendering engine that traverses AST and produces output
 */
import { VariableResolver } from './variable-resolver.js';
import { createBuiltinFilterMap } from './filter-engine.js';
import { evaluateExpression as evaluateStandaloneExpression } from './evaluators.js';
/**
 * Default render options
 */
const DEFAULT_OPTIONS = {
    throwOnError: false,
    undefinedValue: undefined,
    maxDepth: 100,
    debug: false,
};
/**
 * Main template renderer
 *
 * Traverses AST and generates rendered output with proper variable resolution,
 * filter application, and scope management.
 */
export class Renderer {
    options;
    filters;
    /**
     * Create a new renderer instance
     */
    constructor(options) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.filters = createBuiltinFilterMap();
    }
    /**
     * Register a custom filter
     */
    registerFilter(name, fn) {
        this.filters.set(name, fn);
    }
    /**
     * Render an AST with the given data
     *
     * @param ast - The abstract syntax tree to render
     * @param data - The data context for variable resolution
     * @returns The rendered output and any errors that occurred
     */
    render(ast, data) {
        const context = {
            data: typeof data === 'object' && data !== null ? data : {},
            scopes: [],
            filters: new Map(this.filters),
            functions: new Map(),
            errors: [],
            options: this.options,
        };
        try {
            const output = renderNode(ast, context);
            const hasRuntimeError = context.errors.some((e) => e.type === 'runtime_error');
            return {
                output,
                errors: context.errors,
                success: !hasRuntimeError,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (this.options.throwOnError) {
                throw error;
            }
            context.errors.push({
                message,
                path: '',
                type: 'runtime_error',
            });
            return {
                output: '',
                errors: context.errors,
                success: false,
            };
        }
    }
}
class BaseNodeRenderer {
    static sharedVariableResolver = new VariableResolver();
    variableResolver;
    constructor() {
        this.variableResolver = BaseNodeRenderer.sharedVariableResolver;
    }
    /**
     * Evaluate an expression to a value
     */
    evaluateExpression(expr, context) {
        return evaluateStandaloneExpression(expr, context);
    }
}
class UnknownNodeRenderer extends BaseNodeRenderer {
    render(node, context) {
        context.errors.push({
            message: `Unknown node type: ${node?.type}`,
            path: '',
            type: 'runtime_error',
        });
        return '';
    }
}
class ExpressionStatementNodeRenderer extends BaseNodeRenderer {
    /**
     * Render an expression to a string
     */
    render(expr, context) {
        if (!expr || typeof expr !== 'object' || typeof expr.type !== 'string') {
            context.errors.push({
                message: 'Invalid or missing expression node',
                path: '',
                type: 'runtime_error',
            });
            return '';
        }
        const value = this.evaluateExpression(expr.value, context);
        if (value === undefined && context.options.undefinedValue !== undefined) {
            return context.options.undefinedValue;
        }
        return this.variableResolver.toString(value);
    }
}
class TemplateNodeRenderer extends BaseNodeRenderer {
    render(node, context) {
        return node.children.map((child) => renderNode(child, context)).join('');
    }
}
class TextNodeRenderer extends BaseNodeRenderer {
    render(node, _context) {
        return node.value;
    }
}
class IfNodeRenderer extends BaseNodeRenderer {
    render(node, context) {
        const condition = this.evaluateExpression(node.condition, context);
        const isTruthy = this.variableResolver.toBoolean(condition);
        if (isTruthy) {
            return node.body.map((child) => renderNode(child, context)).join('');
        }
        else if (node.elseBody) {
            return node.elseBody.map((child) => renderNode(child, context)).join('');
        }
        return '';
    }
}
class ForNodeRenderer extends BaseNodeRenderer {
    render(node, context) {
        const iterable = this.evaluateExpression(node.iterable, context);
        const isPairIteration = typeof node.valueIterator === 'string' && node.valueIterator.length > 0;
        const pairEntries = isPairIteration
            ? Array.isArray(iterable)
                ? iterable.map((value, index) => [index, value])
                : typeof iterable === 'object' && iterable !== null
                    ? Object.entries(iterable)
                    : null
            : null;
        if (!isPairIteration && !Array.isArray(iterable)) {
            const error = {
                message: `Cannot iterate over non-array value: ${this.variableResolver.getType(iterable)}`,
                path: `for.iterable`,
                type: 'type_error',
                location: { start: node.start, end: node.end },
            };
            context.errors.push(error);
            if (context.options.throwOnError) {
                throw new Error(error.message);
            }
            return '';
        }
        if (isPairIteration && !pairEntries) {
            const error = {
                message: `Cannot iterate with key/value aliases over non-object value: ${this.variableResolver.getType(iterable)}`,
                path: `for.iterable`,
                type: 'type_error',
                location: { start: node.start, end: node.end },
            };
            context.errors.push(error);
            if (context.options.throwOnError) {
                throw new Error(error.message);
            }
            return '';
        }
        const output = [];
        const iterationEntries = pairEntries ?? iterable.map((item) => [undefined, item]);
        // Check max depth
        if (context.scopes.length >= (context.options.maxDepth ?? DEFAULT_OPTIONS.maxDepth)) {
            const error = {
                message: 'Maximum nesting depth exceeded',
                path: 'for',
                type: 'runtime_error',
                location: { start: node.start, end: node.end },
            };
            context.errors.push(error);
            if (context.options.throwOnError) {
                throw new Error(error.message);
            }
            return '';
        }
        iterationEntries.forEach(([key, item], index) => {
            const loopScope = isPairIteration && node.valueIterator
                ? {
                    [node.iterator]: key,
                    [node.valueIterator]: item,
                }
                : {
                    [node.iterator]: item,
                };
            // Push a new scope with the loop variable and loop object
            context.scopes.push({
                ...loopScope,
                loop: {
                    index: index + 1, // 1-indexed for templates
                    first: index === 0,
                    last: index === iterationEntries.length - 1,
                    length: iterationEntries.length,
                },
            });
            // Render the loop body
            output.push(node.body.map((child) => renderNode(child, context)).join(''));
            // Pop the scope
            context.scopes.pop();
        });
        return output.join('');
    }
}
class SetNodeRenderer extends BaseNodeRenderer {
    render(node, context) {
        if (!node.name ||
            typeof node.name !== 'string' ||
            !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(node.name)) {
            const error = {
                message: `Invalid or missing variable name for set statement: ${JSON.stringify(node.name)}`,
                path: 'set.name',
                type: 'runtime_error',
                location: { start: node.start, end: node.end },
            };
            context.errors.push(error);
            if (context.options.throwOnError) {
                throw new Error(error.message);
            }
            return '';
        }
        let value;
        try {
            value = this.evaluateExpression(node.value, context);
        }
        catch (err) {
            const error = {
                message: `Error evaluating set value for "${node.name}": ${err instanceof Error ? err.message : String(err)}`,
                path: 'set.value',
                type: 'runtime_error',
                location: { start: node.start, end: node.end },
            };
            context.errors.push(error);
            if (context.options.throwOnError) {
                throw err;
            }
            return '';
        }
        for (let i = context.scopes.length - 1; i >= 0; i--) {
            const scope = context.scopes[i];
            if (Object.prototype.hasOwnProperty.call(scope, node.name)) {
                scope[node.name] = value;
                return '';
            }
        }
        if (Object.prototype.hasOwnProperty.call(context.data, node.name)) {
            context.data[node.name] = value;
            return '';
        }
        if (context.scopes.length > 0) {
            context.scopes[context.scopes.length - 1][node.name] = value;
            return '';
        }
        context.data[node.name] = value;
        return '';
    }
}
const nodeRendererRegistry = new Map([
    ['template', new TemplateNodeRenderer()],
    ['text', new TextNodeRenderer()],
    ['expression_statement', new ExpressionStatementNodeRenderer()],
    ['if', new IfNodeRenderer()],
    ['for', new ForNodeRenderer()],
    ['set', new SetNodeRenderer()],
    ['unknown', new UnknownNodeRenderer()],
    ['undefined', new UnknownNodeRenderer()],
    ['null', new UnknownNodeRenderer()],
]);
/**
 * Render a single AST node
 */
function renderNode(node, context) {
    if (!node || typeof node !== 'object' || typeof node.type !== 'string') {
        context.errors.push({
            message: 'Unknown or invalid AST node',
            path: '',
            type: 'runtime_error',
        });
        return '';
    }
    if (!nodeRendererRegistry.has(node.type)) {
        return nodeRendererRegistry.get('unknown').render(node, context);
    }
    else {
        return nodeRendererRegistry.get(node.type).render(node, context);
    }
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
export function render(ast, data, options) {
    const renderer = new Renderer(options);
    return renderer.render(ast, data);
}
//# sourceMappingURL=renderer.js.map