/**
 * Query Engine - Core Query Processing System
 *
 * The query engine handles:
 * - Dot notation path resolution (user.profile.name)
 * - Array access ([0], [index])
 * - Filter application and chaining
 * - Function registry and dispatch
 * - Type inference and metadata
 */
import { arrayFunctions } from './functions/array-functions.js';
import { datetimeFunctions } from './functions/datetime-functions.js';
import { numberFunctions } from './functions/number-functions.js';
import { objectFunctions } from './functions/object-functions.js';
import { stringFunctions } from './functions/string-functions.js';
import { utilityFunctions } from './functions/utility-functions.js';
const builtinFunctions = [
    ...stringFunctions,
    ...numberFunctions,
    ...datetimeFunctions,
    ...arrayFunctions,
    ...objectFunctions,
    ...utilityFunctions,
];
function addRegistryEntry(registry, metadataFunctions, signature, handler) {
    const registrySignature = cloneFunctionSignature(signature);
    const metadataSignature = cloneFunctionSignature(signature);
    const registryEntries = registry.get(signature.name) ?? [];
    registryEntries.push({ signature: registrySignature, handler });
    registry.set(signature.name, registryEntries);
    const metadataEntries = metadataFunctions.get(signature.name) ?? [];
    metadataEntries.push(metadataSignature);
    metadataFunctions.set(signature.name, metadataEntries);
}
function createBuiltinState() {
    const registry = new Map();
    const metadataFunctions = new Map();
    for (const builtin of builtinFunctions) {
        addRegistryEntry(registry, metadataFunctions, builtin.signature, builtin.handler);
    }
    return { registry, metadataFunctions };
}
function cloneFunctionSignature(signature) {
    return {
        ...signature,
        parameters: signature.parameters.map((parameter) => ({
            ...parameter,
            examples: parameter.examples ? [...parameter.examples] : undefined,
        })),
        examples: [...signature.examples],
    };
}
function cloneRegistry(registry) {
    return new Map(Array.from(registry.entries(), ([name, entries]) => [
        name,
        entries.map((entry) => ({ ...entry, signature: cloneFunctionSignature(entry.signature) })),
    ]));
}
function cloneFunctionMetadata(metadataFunctions) {
    return new Map(Array.from(metadataFunctions.entries(), ([name, signatures]) => [
        name,
        signatures.map(cloneFunctionSignature),
    ]));
}
const sharedBuiltinState = createBuiltinState();
/**
 * Main Query Engine class.
 *
 * Provides query processing with support for dot notation, array access,
 * filters, and 50+ built-in functions.
 */
export class QueryEngine {
    registry = cloneRegistry(sharedBuiltinState.registry);
    metadata = {
        functions: cloneFunctionMetadata(sharedBuiltinState.metadataFunctions),
        variables: new Map(),
    };
    /**
     * Register a custom function or built-in function.
     *
     * @param sig - Function signature with metadata
     * @param handler - Handler function that implements the logic
     */
    registerFunction(sig, handler) {
        addRegistryEntry(this.registry, this.metadata.functions, sig, handler);
    }
    /**
     * Query data using dot notation and array access.
     *
     * @param data - The data object to query
     * @param path - Query path (e.g., `user.profile.name` or `items[0]`)
     * @param options - Query options
     * @returns The resolved value or undefined
     *
     * @example
     * query({ user: { name: 'Alice' } }, 'user.name')  // 'Alice'
     * query({ items: ['a', 'b'] }, 'items[0]')         // 'a'
     */
    query(data, path, options) {
        try {
            const result = this.resolvePath(data, path, options?.maxDepth ?? 100);
            if (result.error && options?.strict) {
                throw new Error(result.error);
            }
            if (result.isUndefined) {
                return options?.defaultValue;
            }
            return result.value;
        }
        catch (error) {
            if (options?.strict) {
                throw error;
            }
            return options?.defaultValue;
        }
    }
    /**
     * Apply a filter/function to a value.
     *
     * @param value - The value to filter
     * @param name - The name of the filter/function
     * @param args - Arguments to pass to the function
     * @returns The filtered value
     *
     * @example
     * applyFilter('hello', 'upper', [])  // 'HELLO'
     * applyFilter('hello', 'replace', ['o', '0'])  // 'hell0'
     */
    applyFilter(value, name, args) {
        const entries = this.registry.get(name);
        if (!entries || entries.length === 0) {
            throw new Error(`Unknown filter: ${name}`);
        }
        const entry = this.selectRegistryEntry(entries, value, args);
        this.validateFilterArgs(entry.signature, args);
        try {
            return entry.handler(value, ...args);
        }
        catch (error) {
            throw new Error(`Error applying filter "${name}": ${error instanceof Error ? error.message : String(error)}`, { cause: error });
        }
    }
    /**
     * Get metadata about registered functions.
     *
     * @returns QueryMetadata with function signatures and type information
     */
    getMetadata() {
        return this.metadata;
    }
    /**
     * Get a specific function signature.
     *
     * @param name - Name of the function
     * @returns Function signature or undefined
     */
    getFunction(name) {
        return this.metadata.functions.get(name)?.[0];
    }
    /**
     * Get all signatures for a specific function name.
     */
    getFunctionSignatures(name) {
        return this.metadata.functions.get(name) ?? [];
    }
    /**
     * Register type metadata for a variable name.
     */
    registerVariableType(name, typeInfo) {
        this.metadata.variables.set(name, typeInfo);
    }
    /**
     * Register multiple variable type metadata entries.
     */
    registerVariables(variables) {
        for (const [name, typeInfo] of Object.entries(variables)) {
            this.metadata.variables.set(name, typeInfo);
        }
    }
    /**
     * Get variable type metadata by name.
     */
    getVariableType(name) {
        return this.metadata.variables.get(name);
    }
    /**
     * Clear all variable type metadata.
     */
    clearVariableMetadata() {
        this.metadata.variables.clear();
    }
    /**
     * Get all registered function names.
     *
     * @returns Array of function names
     */
    listFunctions() {
        return Array.from(this.registry.keys()).sort();
    }
    /**
     * Get all functions in a specific category.
     *
     * @param category - Function category
     * @returns Array of function names in that category
     */
    getFunctionsByCategory(category) {
        const names = new Set();
        for (const entries of this.registry.values()) {
            for (const entry of entries) {
                if (entry.signature.category === category) {
                    names.add(entry.signature.name);
                }
            }
        }
        return Array.from(names).sort();
    }
    selectRegistryEntry(entries, value, args) {
        if (entries.length === 1) {
            return entries[0];
        }
        const categoryMatches = entries.filter((entry) => this.matchesCategory(value, entry.signature.category));
        if (categoryMatches.length === 1) {
            return categoryMatches[0];
        }
        const argMatches = entries.filter((entry) => this.canAcceptArgs(entry.signature, args));
        if (argMatches.length === 1) {
            return argMatches[0];
        }
        if (categoryMatches.length > 0) {
            return categoryMatches[0];
        }
        return entries[0];
    }
    canAcceptArgs(signature, args) {
        const variadicParam = signature.parameters.at(-1);
        const hasVariadic = Boolean(variadicParam?.variadic);
        const requiredCount = signature.parameters.filter((parameter) => parameter.required).length;
        if (args.length < requiredCount) {
            return false;
        }
        if (!hasVariadic && args.length > signature.parameters.length) {
            return false;
        }
        for (let i = 0; i < args.length; i++) {
            const parameter = signature.parameters[i] ?? (hasVariadic ? variadicParam : undefined);
            if (parameter && !this.isTypeMatch(args[i], parameter.type)) {
                return false;
            }
        }
        return true;
    }
    validateFilterArgs(signature, args) {
        const variadicParam = signature.parameters.at(-1);
        const hasVariadic = Boolean(variadicParam?.variadic);
        const requiredCount = signature.parameters.filter((parameter) => parameter.required).length;
        if (args.length < requiredCount) {
            throw new Error(`Filter "${signature.name}" expects at least ${requiredCount} argument(s), received ${args.length}`);
        }
        if (!hasVariadic && args.length > signature.parameters.length) {
            throw new Error(`Filter "${signature.name}" expects at most ${signature.parameters.length} argument(s), received ${args.length}`);
        }
        for (let i = 0; i < args.length; i++) {
            const parameter = signature.parameters[i] ?? (hasVariadic ? variadicParam : undefined);
            if (!parameter) {
                continue;
            }
            if (!this.isTypeMatch(args[i], parameter.type)) {
                throw new Error(`Filter "${signature.name}" argument "${parameter.name}" expected type "${parameter.type}", received "${this.getRuntimeType(args[i])}"`);
            }
        }
    }
    isTypeMatch(value, typeSpec) {
        if (typeSpec === 'any') {
            return true;
        }
        const acceptedTypes = typeSpec.split('|').map((type) => type.trim());
        return acceptedTypes.some((acceptedType) => this.isSingleTypeMatch(value, acceptedType));
    }
    isSingleTypeMatch(value, typeName) {
        switch (typeName) {
            case 'any':
                return true;
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !Number.isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'function':
                return typeof value === 'function';
            case 'null':
                return value === null;
            default:
                return false;
        }
    }
    getRuntimeType(value) {
        if (value === null) {
            return 'null';
        }
        if (Array.isArray(value)) {
            return 'array';
        }
        return typeof value;
    }
    matchesCategory(value, category) {
        switch (category) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'datetime':
                return typeof value === 'number' || typeof value === 'string' || value instanceof Date;
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'utility':
                return true;
            default:
                return false;
        }
    }
    /**
     * Resolve a property path in an object.
     *
     * Supports:
     * - Dot notation: user.profile.name
     * - Array access: items[0], items[i]
     * - Mixed: user.items[0].name
     *
     * @param data - The data to traverse
     * @param path - The path to resolve
     * @param maxDepth - Maximum nesting depth to prevent infinite loops
     * @returns QueryResult with value and error info
     */
    resolvePath(data, path, maxDepth) {
        let current = data;
        let depth = 0;
        // Split path into property/index segments and resolve sequentially.
        const parts = this.parsePath(path);
        for (const part of parts) {
            depth++;
            if (depth > maxDepth) {
                return {
                    value: undefined,
                    error: `Max nesting depth (${maxDepth}) exceeded`,
                    isUndefined: true,
                };
            }
            if (current === null || current === undefined) {
                return {
                    value: undefined,
                    error: `Cannot access property "${part.value}" of ${current}`,
                    isUndefined: true,
                };
            }
            if (part.type === 'property') {
                current = current[part.value];
            }
            else {
                const index = this.resolveIndex(part.value, data, current, maxDepth - depth);
                current = current[index];
            }
        }
        return {
            value: current,
            isUndefined: current === undefined,
        };
    }
    /**
     * Parse a path string into parts.
     *
     * Handles:
     * - Simple paths: user.name
     * - Array access: items[0], items[index]
     * - Mixed: user.items[0].name
     *
     * @param path - The path string to parse
     * @returns Array of path parts
     */
    parsePath(path) {
        const parts = [];
        let buffer = '';
        let bracketBuffer = '';
        let inBrackets = false;
        for (let i = 0; i < path.length; i++) {
            const char = path[i];
            if (inBrackets) {
                if (char === ']') {
                    parts.push({ type: 'index', value: bracketBuffer.trim() });
                    bracketBuffer = '';
                    inBrackets = false;
                }
                else {
                    bracketBuffer += char;
                }
                continue;
            }
            if (char === '.') {
                if (buffer) {
                    parts.push({ type: 'property', value: buffer });
                    buffer = '';
                }
                continue;
            }
            if (char === '[') {
                if (buffer) {
                    parts.push({ type: 'property', value: buffer });
                    buffer = '';
                }
                inBrackets = true;
                continue;
            }
            buffer += char;
        }
        if (buffer) {
            parts.push({ type: 'property', value: buffer });
        }
        if (inBrackets && bracketBuffer) {
            parts.push({ type: 'index', value: bracketBuffer.trim() });
        }
        return parts;
    }
    resolveIndex(rawIndex, rootData, currentData, remainingDepth) {
        const trimmed = rawIndex.trim();
        if (/^(['"]).*\1$/.test(trimmed)) {
            return trimmed.slice(1, -1);
        }
        if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
            return Number(trimmed);
        }
        if (remainingDepth > 0) {
            const resolved = this.resolvePath(rootData, trimmed, remainingDepth);
            if (!resolved.isUndefined) {
                return resolved.value;
            }
        }
        if (currentData &&
            typeof currentData === 'object' &&
            Object.prototype.hasOwnProperty.call(currentData, trimmed)) {
            return currentData[trimmed];
        }
        return trimmed;
    }
}
/**
 * Default singleton instance of the query engine.
 */
export const defaultEngine = new QueryEngine();
/**
 * Convenience function to query using the default engine.
 *
 * @param data - The data to query
 * @param path - The query path
 * @returns The resolved value
 *
 * @example
 * query({ user: { name: 'Alice' } }, 'user.name')  // 'Alice'
 */
export function query(data, path) {
    return defaultEngine.query(data, path);
}
/**
 * Convenience function to apply a filter using the default engine.
 *
 * @param value - The value to filter
 * @param name - The filter name
 * @param args - Filter arguments
 * @returns The filtered value
 *
 * @example
 * filter('hello', 'upper', [])  // 'HELLO'
 */
export function filter(value, name, args) {
    return defaultEngine.applyFilter(value, name, args);
}
//# sourceMappingURL=query-engine.js.map