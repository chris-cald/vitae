/**
 * JSON Schema inference from sample data
 */
import type { JSONSchema } from './types.js';
/**
 * Infer JSON type from a value
 * @param value - Value to inspect
 * @returns JSON Schema type string
 */
export declare function inferType(value: unknown): string;
/**
 * Infer JSON Schema from an object
 * @param obj - Object to infer from
 * @returns JSON Schema for the object
 */
export declare function inferObjectSchema(obj: Record<string, unknown>): JSONSchema;
/**
 * Infer JSON Schema from an array
 * @param arr - Array to infer from
 * @returns JSON Schema for the array
 */
export declare function inferArraySchema(arr: unknown[]): JSONSchema;
/**
 * Infer JSON Schema from a value
 * @param value - Value to infer from
 * @returns JSON Schema
 */
export declare function inferSchemaFromValue(value: unknown): JSONSchema;
/**
 * Merge multiple JSON Schemas into one
 * Useful for inferring schema from multiple samples
 * @param schemas - Schemas to merge
 * @returns Merged schema
 */
export declare function mergeSchemas(...schemas: JSONSchema[]): JSONSchema;
