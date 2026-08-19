/**
 * String Functions (20 functions)
 *
 * Functions for string manipulation including case transformations,
 * trimming, searching, and pattern matching.
 */
import type { FunctionSignature, FilterFunction } from '../types.js';
export declare const upperSignature: FunctionSignature;
export declare const lowerSignature: FunctionSignature;
export declare const capitalizeSignature: FunctionSignature;
export declare const trimSignature: FunctionSignature;
export declare const ltrimSignature: FunctionSignature;
export declare const rtrimSignature: FunctionSignature;
export declare const replaceSignature: FunctionSignature;
export declare const sliceSignature: FunctionSignature;
export declare const splitSignature: FunctionSignature;
export declare const joinSignature: FunctionSignature;
export declare const startsWithSignature: FunctionSignature;
export declare const endsWithSignature: FunctionSignature;
export declare const includesSignature: FunctionSignature;
export declare const indexOfSignature: FunctionSignature;
export declare const padStartSignature: FunctionSignature;
export declare const padEndSignature: FunctionSignature;
export declare const repeatSignature: FunctionSignature;
export declare const reverseSignature: FunctionSignature;
export declare const escapeSignature: FunctionSignature;
export declare const noEscapeSignature: FunctionSignature;
export declare const truncateSignature: FunctionSignature;
export declare const upper: FilterFunction;
export declare const lower: FilterFunction;
export declare const capitalize: FilterFunction;
export declare const trim: FilterFunction;
export declare const ltrim: FilterFunction;
export declare const rtrim: FilterFunction;
export declare const replace: FilterFunction;
export declare const slice: FilterFunction;
export declare const split: FilterFunction;
export declare const join: FilterFunction;
export declare const startsWith: FilterFunction;
export declare const endsWith: FilterFunction;
export declare const includes: FilterFunction;
export declare const indexOf: FilterFunction;
export declare const padStart: FilterFunction;
export declare const padEnd: FilterFunction;
export declare const repeat: FilterFunction;
export declare const reverse: FilterFunction;
export declare const escape: FilterFunction;
export declare const noEscape: FilterFunction;
export declare const truncate: FilterFunction;
/**
 * Export all string function registrations
 */
export declare const stringFunctions: {
    signature: FunctionSignature;
    handler: FilterFunction;
}[];
