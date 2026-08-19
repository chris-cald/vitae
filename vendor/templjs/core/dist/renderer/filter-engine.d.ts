/**
 * Filter and function application engine
 */
import type { FilterFunction } from './types.js';
type AnyValue = any;
export declare const MAX_FORMATTER_CACHE_SIZE = 256;
export declare function getBuiltinFilterNames(): string[];
export declare const BUILTIN_FILTER_NAMES: string[];
/**
 * Clears the module-level Intl.NumberFormat caches for number and currency
 * formatters. Call this in long-running or dynamic-locale scenarios to free
 * memory accumulated from many distinct locale/currency combinations.
 */
export declare function clearFormatterCaches(): void;
/**
 * Filter application engine
 */
export declare class FilterEngine {
    private filters;
    constructor(initialFilters?: Record<string, FilterFunction>);
    /**
     * Register a filter function
     */
    registerFilter(name: string, fn: FilterFunction): void;
    /**
     * Apply a single filter to a value
     */
    applyFilter(name: string, value: AnyValue, args?: AnyValue[]): AnyValue;
    /**
     * Apply multiple filters in sequence
     */
    chainFilters(value: AnyValue, filters: Array<{
        name: string;
        args: AnyValue[];
    }>): AnyValue;
    /**
     * Get all registered filter names
     */
    getFilterNames(): string[];
}
export declare function createBuiltinFilterMap(): Map<string, FilterFunction>;
export {};
