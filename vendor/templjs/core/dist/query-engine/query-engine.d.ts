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
import type { FunctionSignature, FilterFunction, QueryMetadata, QueryOptions, TypeInfo } from './types.js';
/**
 * Main Query Engine class.
 *
 * Provides query processing with support for dot notation, array access,
 * filters, and 50+ built-in functions.
 */
export declare class QueryEngine {
    private registry;
    private metadata;
    /**
     * Register a custom function or built-in function.
     *
     * @param sig - Function signature with metadata
     * @param handler - Handler function that implements the logic
     */
    registerFunction(sig: FunctionSignature, handler: FilterFunction): void;
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
    query(data: unknown, path: string, options?: QueryOptions): unknown;
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
    applyFilter(value: unknown, name: string, args: unknown[]): unknown;
    /**
     * Get metadata about registered functions.
     *
     * @returns QueryMetadata with function signatures and type information
     */
    getMetadata(): QueryMetadata;
    /**
     * Get a specific function signature.
     *
     * @param name - Name of the function
     * @returns Function signature or undefined
     */
    getFunction(name: string): FunctionSignature | undefined;
    /**
     * Get all signatures for a specific function name.
     */
    getFunctionSignatures(name: string): FunctionSignature[];
    /**
     * Register type metadata for a variable name.
     */
    registerVariableType(name: string, typeInfo: TypeInfo): void;
    /**
     * Register multiple variable type metadata entries.
     */
    registerVariables(variables: Record<string, TypeInfo>): void;
    /**
     * Get variable type metadata by name.
     */
    getVariableType(name: string): TypeInfo | undefined;
    /**
     * Clear all variable type metadata.
     */
    clearVariableMetadata(): void;
    /**
     * Get all registered function names.
     *
     * @returns Array of function names
     */
    listFunctions(): string[];
    /**
     * Get all functions in a specific category.
     *
     * @param category - Function category
     * @returns Array of function names in that category
     */
    getFunctionsByCategory(category: 'string' | 'number' | 'datetime' | 'array' | 'object' | 'utility'): string[];
    private selectRegistryEntry;
    private canAcceptArgs;
    private validateFilterArgs;
    private isTypeMatch;
    private isSingleTypeMatch;
    private getRuntimeType;
    private matchesCategory;
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
    private resolvePath;
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
    private parsePath;
    private resolveIndex;
}
/**
 * Default singleton instance of the query engine.
 */
export declare const defaultEngine: QueryEngine;
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
export declare function query(data: unknown, path: string): unknown;
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
export declare function filter(value: unknown, name: string, args: unknown[]): unknown;
