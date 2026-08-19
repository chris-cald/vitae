/**
 * JSON Schema validator using Ajv
 */
import type { ValidationResult, SchemaMetadata, JSONSchema } from './types.js';
/**
 * Schema validator with query path validation and schema inference
 */
export declare class SchemaValidator {
    private ajv;
    private currentSchema;
    private validPaths;
    private metadata;
    private validateFunction;
    private compileError;
    /**
     * Create a new SchemaValidator
     * @param schema - Optional JSON Schema to initialize with
     */
    constructor(schema?: JSONSchema);
    /**
     * Load and compile a JSON Schema
     * @param schema - JSON Schema object
     */
    loadSchema(schema: JSONSchema): void;
    /** Whether the schema compiled successfully. False means validation is skipped. */
    get isCompiled(): boolean;
    /** The compile error message if compilation failed, otherwise null. */
    get compilationError(): string | null;
    /**
     * Validate data against the loaded schema
     * @param data - Data to validate
     * @returns Validation result with errors if any
     */
    validate(data: unknown): ValidationResult;
    /**
     * Validate a query path against the schema
     * @param path - Query path (e.g., `user.name`, `users[0].email`)
     * @returns Validation result with suggestions if invalid
     */
    validateQueryPath(path: string): ValidationResult;
    /**
     * Infer a JSON Schema from sample data
     * @param data - Sample data to infer from
     * @returns Inferred JSON Schema
     */
    inferSchema(data: unknown): JSONSchema;
    /**
     * Get schema metadata for IDE completion
     * @returns Schema metadata with property information
     */
    getMetadata(): SchemaMetadata;
    /**
     * Get all valid paths from the current schema
     * @returns Set of valid paths
     */
    getValidPaths(): Set<string>;
    /**
     * Clear the shared process-wide compiled schema cache.
     */
    static clearCache(): void;
    /**
     * Clear compiled schema cache.
     *
     * @deprecated Prefer SchemaValidator.clearCache() to make the process-wide
     * side effect explicit.
     */
    clearCache(): void;
    /**
     * Get cache statistics
     * @returns Object with cache size and keys
     */
    getCacheStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Format Ajv validation errors
     * @param ajvErrors - Ajv error objects
     * @returns Formatted validation errors
     */
    private formatErrors;
    /**
     * Extract metadata from schema for IDE features
     * @param schema - JSON Schema
     * @param prefix - Current path prefix
     * @param parentRequired - Parent required field names
     * @returns Schema metadata
     */
    private extractMetadata;
    /**
     * Generate cache key for a schema
     * @param schema - JSON Schema
     * @param canonicalSchema - Canonical schema string
     * @returns Cache key string
     */
    private getCacheKey;
}
