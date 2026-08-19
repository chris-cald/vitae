/**
 * Number Functions
 *
 * Functions for numeric manipulation including rounding, absolute value,
 * trigonometric functions, and other mathematical operations.
 */
// Number function signatures
export const roundSignature = {
    name: 'round',
    category: 'number',
    description: 'Round a numeric value to the given number of decimal places.',
    parameters: [
        {
            name: 'decimals',
            type: 'number',
            required: false,
            description: 'Number of decimal places (default: 0)',
        },
    ],
    returnType: 'number',
    examples: ['round(3.14159, 2) → 3.14', 'round(3.7) → 4'],
};
export const floorSignature = {
    name: 'floor',
    category: 'number',
    description: 'Round number down to nearest integer',
    parameters: [],
    returnType: 'number',
    examples: ['floor(3.7) → 3', 'floor(-3.2) → -4'],
};
export const ceilSignature = {
    name: 'ceil',
    category: 'number',
    description: 'Round number up to nearest integer',
    parameters: [],
    returnType: 'number',
    examples: ['ceil(3.2) → 4', 'ceil(-3.7) → -3'],
};
export const absSignature = {
    name: 'abs',
    category: 'number',
    description: 'Return the absolute value of a number.',
    parameters: [],
    returnType: 'number',
    examples: ['abs(-5) → 5', 'abs(3.14) → 3.14'],
};
export const minSignature = {
    name: 'min',
    category: 'number',
    description: 'Find minimum value',
    parameters: [
        {
            name: 'other',
            type: 'number',
            required: false,
            variadic: true,
            description: 'Additional numbers to compare',
        },
    ],
    returnType: 'number',
    examples: ['min(5, 2, 8) → 2', 'min([5, 2, 8]) → 2'],
};
export const maxSignature = {
    name: 'max',
    category: 'number',
    description: 'Find maximum value',
    parameters: [
        {
            name: 'other',
            type: 'number',
            required: false,
            variadic: true,
            description: 'Additional numbers to compare',
        },
    ],
    returnType: 'number',
    examples: ['max(5, 2, 8) → 8', 'max([5, 2, 8]) → 8'],
};
export const clampSignature = {
    name: 'clamp',
    category: 'number',
    description: 'Clamp number between min and max',
    parameters: [
        { name: 'min', type: 'number', required: true, description: 'Minimum value' },
        { name: 'max', type: 'number', required: true, description: 'Maximum value' },
    ],
    returnType: 'number',
    examples: ['clamp(5, 1, 3) → 3', 'clamp(0, 1, 3) → 1', 'clamp(2, 1, 3) → 2'],
};
export const sqrtSignature = {
    name: 'sqrt',
    category: 'number',
    description: 'Square root',
    parameters: [],
    returnType: 'number',
    examples: ['sqrt(16) → 4', 'sqrt(2) → 1.414...'],
};
export const powSignature = {
    name: 'pow',
    category: 'number',
    description: 'Raise to power',
    parameters: [{ name: 'exponent', type: 'number', required: true, description: 'Exponent' }],
    returnType: 'number',
    examples: ['pow(2, 3) → 8', 'pow(5, 2) → 25'],
};
export const logSignature = {
    name: 'log',
    category: 'number',
    description: 'Calculate logarithm of value in optional base',
    parameters: [
        { name: 'base', type: 'number', required: false, description: 'Logarithm base (default: e)' },
    ],
    returnType: 'number',
    examples: ['log(8, 2) → 3', 'log(Math.E) → 1'],
};
export const expSignature = {
    name: 'exp',
    category: 'number',
    description: 'Calculate e to the power of value',
    parameters: [],
    returnType: 'number',
    examples: ['exp(1) → 2.718...', 'exp(0) → 1'],
};
export const sinSignature = {
    name: 'sin',
    category: 'number',
    description: 'Calculate sine of value (radians)',
    parameters: [],
    returnType: 'number',
    examples: ['sin(0) → 0'],
};
export const cosSignature = {
    name: 'cos',
    category: 'number',
    description: 'Calculate cosine of value (radians)',
    parameters: [],
    returnType: 'number',
    examples: ['cos(0) → 1'],
};
export const tanSignature = {
    name: 'tan',
    category: 'number',
    description: 'Calculate tangent of value (radians)',
    parameters: [],
    returnType: 'number',
    examples: ['tan(0) → 0'],
};
export const sumSignature = {
    name: 'sum',
    category: 'number',
    description: 'Sum all numbers in an array',
    parameters: [],
    returnType: 'number',
    examples: ['sum([1, 2, 3]) → 6'],
};
export const avgSignature = {
    name: 'avg',
    category: 'number',
    description: 'Compute average of numbers in an array',
    parameters: [],
    returnType: 'number',
    examples: ['avg([2, 4, 6]) → 4'],
};
export const productSignature = {
    name: 'product',
    category: 'number',
    description: 'Multiply all numbers in an array',
    parameters: [],
    returnType: 'number',
    examples: ['product([2, 3, 4]) → 24'],
};
export const signSignature = {
    name: 'sign',
    category: 'number',
    description: 'Get sign of number (-1, 0, or 1)',
    parameters: [],
    returnType: 'number',
    examples: ['sign(-5) → -1', 'sign(0) → 0', 'sign(3) → 1'],
};
export const toFixedSignature = {
    name: 'toFixed',
    category: 'number',
    description: 'Format number with fixed decimal places',
    parameters: [
        {
            name: 'decimals',
            type: 'number',
            required: false,
            description: 'Number of decimal places',
        },
    ],
    returnType: 'string',
    examples: ['toFixed(3.14159, 2) → "3.14"', 'toFixed(42, 2) → "42.00"'],
};
export const parseIntSignature = {
    name: 'parseInt',
    category: 'number',
    description: 'Parse string to integer',
    parameters: [
        { name: 'radix', type: 'number', required: false, description: 'Base (default: 10)' },
    ],
    returnType: 'number',
    examples: ['parseInt("42") → 42', 'parseInt("101", 2) → 5'],
};
export const parseFloatSignature = {
    name: 'parseFloat',
    category: 'number',
    description: 'Parse string to floating point number',
    parameters: [],
    returnType: 'number',
    examples: ['parseFloat("3.14") → 3.14', 'parseFloat("42") → 42'],
};
export const isNaNSignature = {
    name: 'isNaN',
    category: 'number',
    description: 'Check if value is NaN',
    parameters: [],
    returnType: 'boolean',
    examples: ['isNaN(NaN) → true', 'isNaN(42) → false', 'isNaN("hello") → true'],
};
export const isFiniteSignature = {
    name: 'isFinite',
    category: 'number',
    description: 'Check if value is finite',
    parameters: [],
    returnType: 'boolean',
    examples: ['isFinite(42) → true', 'isFinite(Infinity) → false', 'isFinite(NaN) → false'],
};
// Number function handlers
export const round = (value, decimals) => {
    const num = Number(value);
    const places = decimals !== undefined ? Number(decimals) : 0;
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
};
export const floor = (value) => {
    return Math.floor(Number(value));
};
export const ceil = (value) => {
    return Math.ceil(Number(value));
};
export const abs = (value) => {
    return Math.abs(Number(value));
};
export const min = (value, ...rest) => {
    if (Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Math.min(...value.map((v) => Number(v)));
    }
    return Math.min(Number(value), ...rest.map(Number));
};
export const max = (value, ...rest) => {
    if (Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Math.max(...value.map((v) => Number(v)));
    }
    return Math.max(Number(value), ...rest.map(Number));
};
export const clamp = (value, minVal, maxVal) => {
    const num = Number(value);
    const min = Number(minVal);
    const max = Number(maxVal);
    return Math.min(Math.max(num, min), max);
};
export const sqrt = (value) => {
    return Math.sqrt(Number(value));
};
export const pow = (value, exponent) => {
    return Math.pow(Number(value), Number(exponent));
};
export const log = (value, base) => {
    const num = Number(value);
    if (base === undefined) {
        return Math.log(num);
    }
    const baseNumber = Number(base);
    if (baseNumber <= 0 || baseNumber === 1) {
        throw new Error('log base must be greater than 0 and not equal to 1');
    }
    return Math.log(num) / Math.log(baseNumber);
};
export const exp = (value) => {
    return Math.exp(Number(value));
};
export const sin = (value) => {
    return Math.sin(Number(value));
};
export const cos = (value) => {
    return Math.cos(Number(value));
};
export const tan = (value) => {
    return Math.tan(Number(value));
};
export const sum = (value) => {
    if (!Array.isArray(value)) {
        throw new Error('sum expects an array');
    }
    return value.reduce((acc, item) => acc + Number(item), 0);
};
export const avg = (value) => {
    if (!Array.isArray(value)) {
        throw new Error('avg expects an array');
    }
    if (value.length === 0) {
        return 0;
    }
    return value.reduce((acc, item) => acc + Number(item), 0) / value.length;
};
export const product = (value) => {
    if (!Array.isArray(value)) {
        throw new Error('product expects an array');
    }
    if (value.length === 0) {
        return 0;
    }
    return value.reduce((acc, item) => acc * Number(item), 1);
};
export const sign = (value) => {
    return Math.sign(Number(value));
};
export const toFixed = (value, decimals) => {
    const num = Number(value);
    const places = decimals !== undefined ? Number(decimals) : 0;
    return num.toFixed(places);
};
export const parseInt = (value, radix) => {
    const base = radix !== undefined ? Number(radix) : 10;
    return globalThis.parseInt(String(value), base);
};
export const parseFloat = (value) => {
    return globalThis.parseFloat(String(value));
};
export const isNaN = (value) => {
    return Number.isNaN(Number(value));
};
export const isFinite = (value) => {
    return Number.isFinite(Number(value));
};
/**
 * Export all number function registrations
 */
export const numberFunctions = [
    { signature: roundSignature, handler: round },
    { signature: floorSignature, handler: floor },
    { signature: ceilSignature, handler: ceil },
    { signature: absSignature, handler: abs },
    { signature: minSignature, handler: min },
    { signature: maxSignature, handler: max },
    { signature: clampSignature, handler: clamp },
    { signature: sqrtSignature, handler: sqrt },
    { signature: powSignature, handler: pow },
    { signature: logSignature, handler: log },
    { signature: expSignature, handler: exp },
    { signature: sinSignature, handler: sin },
    { signature: cosSignature, handler: cos },
    { signature: tanSignature, handler: tan },
    { signature: sumSignature, handler: sum },
    { signature: avgSignature, handler: avg },
    { signature: productSignature, handler: product },
    { signature: signSignature, handler: sign },
    { signature: toFixedSignature, handler: toFixed },
    { signature: parseIntSignature, handler: parseInt },
    { signature: parseFloatSignature, handler: parseFloat },
    { signature: isNaNSignature, handler: isNaN },
    { signature: isFiniteSignature, handler: isFinite },
];
//# sourceMappingURL=number-functions.js.map