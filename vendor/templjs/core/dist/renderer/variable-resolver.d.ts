/**
 * Variable and property resolution with dot notation and array access
 */
type AnyValue = any;
/**
 * Resolves variable references and property access
 *
 * Supports:
 * - Simple variables: "user"
 * - Property access: "user.name", "user.profile.email"
 * - Array access: "users[0]", "user.emails[1]"
 * - Mixed: "users[0].name"
 */
export declare class VariableResolver {
    /**
     * Resolve a variable path using dot notation and array access
     *
     * @param data - The data object to resolve from
     * @param path - The path string (e.g., "user.name" or "items[0].id")
     * @returns The resolved value, or undefined if not found
     */
    resolve(data: AnyValue, path: string): AnyValue;
    /**
     * Parse a path string into segments
     *
     * @example
     * parsePath("user.name") => [{ type: 'property', value: 'user' }, { type: 'property', value: 'name' }]
     * parsePath("items[0].name") => [{ type: 'property', value: 'items' }, { type: 'index', value: '0' }, { type: 'property', value: 'name' }]
     */
    private parsePath;
    /**
     * Get the type of a value
     */
    getType(value: AnyValue): string;
    /**
     * Check if a value is iterable (array or object)
     */
    isIterable(value: AnyValue): boolean;
    /**
     * Convert a value to boolean for conditional checks
     */
    toBoolean(value: AnyValue): boolean;
    /**
     * Convert a value to string
     */
    toString(value: AnyValue): string;
}
export {};
