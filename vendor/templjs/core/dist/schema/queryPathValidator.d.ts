/**
 * Query path validation utilities
 */
import type { JSONSchema } from './types.js';
/**
 * Extract all valid paths from a JSON Schema
 * @param schema - JSON Schema object
 * @param prefix - Current path prefix for recursion
 * @returns Set of valid dot-notation paths
 */
export declare function extractPaths(schema: JSONSchema, prefix?: string): Set<string>;
/**
 * Calculate Levenshtein distance between two strings
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance between strings
 */
export declare function levenshteinDistance(a: string, b: string): number;
/**
 * Find similar paths using fuzzy matching
 * @param input - Input path to match
 * @param validPaths - Set of valid paths
 * @param maxDistance - Maximum Levenshtein distance (default: 2)
 * @param maxResults - Maximum number of suggestions (default: 3)
 * @returns Array of suggested paths sorted by similarity
 */
export declare function fuzzyMatch(input: string, validPaths: Set<string>, maxDistance?: number, maxResults?: number): string[];
/**
 * Normalize path for comparison (handle array indices)
 * @param path - Path to normalize
 * @returns Normalized path
 */
export declare function normalizePath(path: string): string;
/**
 * Check if a path matches a schema pattern
 * @param path - Path to check
 * @param validPaths - Set of valid paths
 * @returns True if path is valid
 */
export declare function isValidPath(path: string, validPaths: Set<string>): boolean;
