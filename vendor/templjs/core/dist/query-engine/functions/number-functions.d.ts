/**
 * Number Functions
 *
 * Functions for numeric manipulation including rounding, absolute value,
 * trigonometric functions, and other mathematical operations.
 */
import type { FunctionSignature, FilterFunction } from '../types.js';
export declare const roundSignature: FunctionSignature;
export declare const floorSignature: FunctionSignature;
export declare const ceilSignature: FunctionSignature;
export declare const absSignature: FunctionSignature;
export declare const minSignature: FunctionSignature;
export declare const maxSignature: FunctionSignature;
export declare const clampSignature: FunctionSignature;
export declare const sqrtSignature: FunctionSignature;
export declare const powSignature: FunctionSignature;
export declare const logSignature: FunctionSignature;
export declare const expSignature: FunctionSignature;
export declare const sinSignature: FunctionSignature;
export declare const cosSignature: FunctionSignature;
export declare const tanSignature: FunctionSignature;
export declare const sumSignature: FunctionSignature;
export declare const avgSignature: FunctionSignature;
export declare const productSignature: FunctionSignature;
export declare const signSignature: FunctionSignature;
export declare const toFixedSignature: FunctionSignature;
export declare const parseIntSignature: FunctionSignature;
export declare const parseFloatSignature: FunctionSignature;
export declare const isNaNSignature: FunctionSignature;
export declare const isFiniteSignature: FunctionSignature;
export declare const round: FilterFunction;
export declare const floor: FilterFunction;
export declare const ceil: FilterFunction;
export declare const abs: FilterFunction;
export declare const min: FilterFunction;
export declare const max: FilterFunction;
export declare const clamp: FilterFunction;
export declare const sqrt: FilterFunction;
export declare const pow: FilterFunction;
export declare const log: FilterFunction;
export declare const exp: FilterFunction;
export declare const sin: FilterFunction;
export declare const cos: FilterFunction;
export declare const tan: FilterFunction;
export declare const sum: FilterFunction;
export declare const avg: FilterFunction;
export declare const product: FilterFunction;
export declare const sign: FilterFunction;
export declare const toFixed: FilterFunction;
export declare const parseInt: FilterFunction;
export declare const parseFloat: FilterFunction;
export declare const isNaN: FilterFunction;
export declare const isFinite: FilterFunction;
/**
 * Export all number function registrations
 */
export declare const numberFunctions: {
    signature: FunctionSignature;
    handler: FilterFunction;
}[];
