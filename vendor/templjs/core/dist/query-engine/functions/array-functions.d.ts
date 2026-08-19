/**
 * Array Functions (19 functions)
 *
 * Functions for array manipulation including filtering, mapping,
 * sorting, and other array operations.
 */
import type { FunctionSignature, FilterFunction } from '../types.js';
export declare const lengthSignature: FunctionSignature;
export declare const sizeSignature: FunctionSignature;
export declare const firstSignature: FunctionSignature;
export declare const lastSignature: FunctionSignature;
export declare const nthSignature: FunctionSignature;
export declare const reverseArraySignature: FunctionSignature;
export declare const sortSignature: FunctionSignature;
export declare const uniqueSignature: FunctionSignature;
export declare const filterSignature: FunctionSignature;
export declare const mapSignature: FunctionSignature;
export declare const reduceSignature: FunctionSignature;
export declare const joinArraySignature: FunctionSignature;
export declare const findSignature: FunctionSignature;
export declare const includesArraySignature: FunctionSignature;
export declare const indexOfArraySignature: FunctionSignature;
export declare const sliceArraySignature: FunctionSignature;
export declare const concatSignature: FunctionSignature;
export declare const flattenSignature: FunctionSignature;
export declare const whereSignature: FunctionSignature;
export declare const length: FilterFunction;
export declare const size: FilterFunction;
export declare const first: FilterFunction;
export declare const last: FilterFunction;
export declare const nth: FilterFunction;
export declare const reverseArray: FilterFunction;
export declare const sort: FilterFunction;
export declare const unique: FilterFunction;
export declare const filter: FilterFunction;
export declare const map: FilterFunction;
export declare const reduce: FilterFunction;
export declare const joinArray: FilterFunction;
export declare const find: FilterFunction;
export declare const includesArray: FilterFunction;
export declare const indexOfArray: FilterFunction;
export declare const sliceArray: FilterFunction;
export declare const concat: FilterFunction;
export declare const flatten: FilterFunction;
export declare const where: FilterFunction;
/**
 * Export all array function registrations
 */
export declare const arrayFunctions: {
    signature: FunctionSignature;
    handler: FilterFunction;
}[];
