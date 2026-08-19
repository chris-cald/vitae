/**
 * Object Functions (10 functions)
 *
 * Functions for object manipulation including key/value operations,
 * merging, picking, and property access.
 */
// Object function signatures
export const keysSignature = {
    name: 'keys',
    category: 'object',
    description: 'Get object keys',
    parameters: [],
    returnType: 'array',
    examples: ['keys({a: 1, b: 2}) → ["a", "b"]'],
};
export const valuesSignature = {
    name: 'values',
    category: 'object',
    description: 'Get object values',
    parameters: [],
    returnType: 'array',
    examples: ['values({a: 1, b: 2}) → [1, 2]'],
};
export const entriesSignature = {
    name: 'entries',
    category: 'object',
    description: 'Get object entries as [key, value] pairs',
    parameters: [],
    returnType: 'array',
    examples: ['entries({a: 1, b: 2}) → [["a", 1], ["b", 2]]'],
};
export const hasSignature = {
    name: 'has',
    category: 'object',
    description: 'Check if object has property',
    parameters: [
        { name: 'key', type: 'string', required: true, description: 'Property key to check' },
    ],
    returnType: 'boolean',
    examples: ['has({a: 1}, "a") → true', 'has({a: 1}, "b") → false'],
};
export const getSignature = {
    name: 'get',
    category: 'object',
    description: 'Get object property with optional default',
    parameters: [
        {
            name: 'path',
            type: 'string',
            required: true,
            description: 'Property path (e.g., "a.b.c")',
        },
        { name: 'defaultValue', type: 'any', required: false, description: 'Default value' },
    ],
    returnType: 'any',
    examples: ['get({a: {b: 1}}, "a.b") → 1', 'get({}, "a", 0) → 0'],
};
export const mergeSignature = {
    name: 'merge',
    category: 'object',
    description: 'Merge multiple objects',
    parameters: [
        { name: 'objects', type: 'object', required: true, description: 'Objects to merge' },
    ],
    returnType: 'object',
    examples: ['merge({a: 1}, {b: 2}) → {a: 1, b: 2}'],
};
export const pickSignature = {
    name: 'pick',
    category: 'object',
    description: 'Pick specific properties from object',
    parameters: [{ name: 'keys', type: 'array', required: true, description: 'Keys to pick' }],
    returnType: 'object',
    examples: ['pick({a: 1, b: 2, c: 3}, ["a", "c"]) → {a: 1, c: 3}'],
};
export const omitSignature = {
    name: 'omit',
    category: 'object',
    description: 'Omit specific properties from object',
    parameters: [{ name: 'keys', type: 'array', required: true, description: 'Keys to omit' }],
    returnType: 'object',
    examples: ['omit({a: 1, b: 2, c: 3}, ["b"]) → {a: 1, c: 3}'],
};
export const objectLengthSignature = {
    name: 'length',
    category: 'object',
    description: 'Get number of keys in object',
    parameters: [],
    returnType: 'number',
    examples: ['length({a: 1, b: 2}) → 2', 'length({}) → 0'],
};
export const assignSignature = {
    name: 'assign',
    category: 'object',
    description: 'Assign properties from source to target',
    parameters: [{ name: 'source', type: 'object', required: true, description: 'Source object' }],
    returnType: 'object',
    examples: ['assign({a: 1}, {b: 2}) → {a: 1, b: 2}'],
};
export const isEmptySignature = {
    name: 'isEmpty',
    category: 'object',
    description: 'Check if object is empty',
    parameters: [],
    returnType: 'boolean',
    examples: ['isEmpty({}) → true', 'isEmpty({a: 1}) → false'],
};
// Object function handlers
export const keys = (value) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('keys expects an object');
    }
    return Object.keys(value);
};
export const values = (value) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('values expects an object');
    }
    return Object.values(value);
};
export const entries = (value) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('entries expects an object');
    }
    return Object.entries(value);
};
export const has = (value, key) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('has expects an object');
    }
    return Object.prototype.hasOwnProperty.call(value, String(key));
};
export const get = (value, path, defaultValue) => {
    if (typeof value !== 'object' || value === null) {
        return defaultValue;
    }
    const pathStr = String(path);
    const parts = pathStr.split('.');
    let current = value;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return defaultValue;
        }
        current = current[part];
    }
    return current !== undefined ? current : defaultValue;
};
export const merge = (value, ...others) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('merge expects an object');
    }
    let result = { ...value };
    for (const other of others) {
        if (typeof other === 'object' && other !== null) {
            result = { ...result, ...other };
        }
    }
    return result;
};
export const pick = (value, keys) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('pick expects an object');
    }
    if (!Array.isArray(keys)) {
        throw new Error('pick expects keys to be an array');
    }
    const result = {};
    const obj = value;
    for (const key of keys) {
        const keyStr = String(key);
        if (Object.prototype.hasOwnProperty.call(obj, keyStr)) {
            result[keyStr] = obj[keyStr];
        }
    }
    return result;
};
export const omit = (value, keys) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('omit expects an object');
    }
    if (!Array.isArray(keys)) {
        throw new Error('omit expects keys to be an array');
    }
    const keySet = new Set(keys.map(String));
    const result = {};
    const obj = value;
    for (const key of Object.keys(obj)) {
        if (!keySet.has(key)) {
            result[key] = obj[key];
        }
    }
    return result;
};
export const objectLength = (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('length expects an object');
    }
    return Object.keys(value).length;
};
export const assign = (value, source) => {
    if (typeof value !== 'object' || value === null) {
        throw new Error('assign expects an object');
    }
    if (typeof source !== 'object' || source === null) {
        throw new Error('assign expects source to be an object');
    }
    return Object.assign({}, value, source);
};
export const isEmpty = (value) => {
    if (typeof value !== 'object' || value === null) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    return Object.keys(value).length === 0;
};
/**
 * Export all object function registrations
 */
export const objectFunctions = [
    { signature: keysSignature, handler: keys },
    { signature: valuesSignature, handler: values },
    { signature: entriesSignature, handler: entries },
    { signature: hasSignature, handler: has },
    { signature: getSignature, handler: get },
    { signature: mergeSignature, handler: merge },
    { signature: pickSignature, handler: pick },
    { signature: omitSignature, handler: omit },
    { signature: objectLengthSignature, handler: objectLength },
    { signature: assignSignature, handler: assign },
    { signature: isEmptySignature, handler: isEmpty },
];
//# sourceMappingURL=object-functions.js.map