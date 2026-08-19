/**
 * Object Functions (10 functions)
 *
 * Functions for object manipulation including key/value operations,
 * merging, picking, and property access.
 */
import type { FunctionSignature, FilterFunction } from '../types.js';
export declare const keysSignature: FunctionSignature;
export declare const valuesSignature: FunctionSignature;
export declare const entriesSignature: FunctionSignature;
export declare const hasSignature: FunctionSignature;
export declare const getSignature: FunctionSignature;
export declare const mergeSignature: FunctionSignature;
export declare const pickSignature: FunctionSignature;
export declare const omitSignature: FunctionSignature;
export declare const objectLengthSignature: FunctionSignature;
export declare const assignSignature: FunctionSignature;
export declare const isEmptySignature: FunctionSignature;
export declare const keys: FilterFunction;
export declare const values: FilterFunction;
export declare const entries: FilterFunction;
export declare const has: FilterFunction;
export declare const get: FilterFunction;
export declare const merge: FilterFunction;
export declare const pick: FilterFunction;
export declare const omit: FilterFunction;
export declare const objectLength: FilterFunction;
export declare const assign: FilterFunction;
export declare const isEmpty: FilterFunction;
/**
 * Export all object function registrations
 */
export declare const objectFunctions: {
    signature: FunctionSignature;
    handler: FilterFunction;
}[];
