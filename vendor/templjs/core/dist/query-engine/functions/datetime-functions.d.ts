/**
 * DateTime Functions
 *
 * Functions for date and time manipulation including formatting,
 * parsing, arithmetic, and timezone operations.
 */
import type { FunctionSignature, FilterFunction } from '../types.js';
export declare const nowSignature: FunctionSignature;
export declare const formatSignature: FunctionSignature;
export declare const parseSignature: FunctionSignature;
export declare const addDaysSignature: FunctionSignature;
export declare const addHoursSignature: FunctionSignature;
export declare const addMinutesSignature: FunctionSignature;
export declare const getYearSignature: FunctionSignature;
export declare const getMonthSignature: FunctionSignature;
export declare const getDaySignature: FunctionSignature;
export declare const getHourSignature: FunctionSignature;
export declare const timezoneSignature: FunctionSignature;
export declare const timestampSignature: FunctionSignature;
export declare const getDateSignature: FunctionSignature;
export declare const getDayOfWeekSignature: FunctionSignature;
export declare const toISOSignature: FunctionSignature;
export declare const fromISOSignature: FunctionSignature;
export declare const diffSignature: FunctionSignature;
export declare const now: FilterFunction;
export declare const format: FilterFunction;
export declare const parse: FilterFunction;
export declare const addDays: FilterFunction;
export declare const addHours: FilterFunction;
export declare const addMinutes: FilterFunction;
export declare const getYear: FilterFunction;
export declare const getMonth: FilterFunction;
export declare const getDay: FilterFunction;
export declare const getHour: FilterFunction;
export declare const timezone: FilterFunction;
export declare const timestamp: FilterFunction;
export declare const getDate: FilterFunction;
export declare const getDayOfWeek: FilterFunction;
export declare const toISO: FilterFunction;
export declare const fromISO: FilterFunction;
export declare const diff: FilterFunction;
/**
 * Export all datetime function registrations
 */
export declare const datetimeFunctions: {
    signature: FunctionSignature;
    handler: FilterFunction;
}[];
