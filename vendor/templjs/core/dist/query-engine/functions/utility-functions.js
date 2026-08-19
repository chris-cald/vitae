/**
 * Utility Functions
 *
 * Cross-category helper functions.
 */
export const defaultSignature = {
    name: 'default',
    category: 'utility',
    description: 'Provide a fallback when the input is null, undefined, or an empty string.',
    parameters: [{ name: 'fallback', type: 'any', required: true, description: 'Fallback value' }],
    returnType: 'any',
    examples: ['default(null, "Guest") → "Guest"', 'default("Alice", "Guest") → "Alice"'],
};
export const defaultValue = (value, fallback) => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return value;
};
export const typeofSignature = {
    name: 'typeof',
    category: 'utility',
    description: 'Return type of the value as a string',
    parameters: [],
    returnType: 'string',
    examples: ['typeof(123) → "number"', 'typeof("hello") → "string"', 'typeof(null) → "null"'],
};
export const typeSignature = {
    ...typeofSignature,
    name: 'type',
    description: 'Alias for typeof; return type of the value as a string',
    examples: ['type([1, 2]) → "array"', 'type(null) → "null"'],
};
export const stringSignature = {
    name: 'string',
    category: 'utility',
    description: 'Convert a value to a string representation.',
    parameters: [],
    returnType: 'string',
    examples: ['string(123) → "123"', 'string(true) → "true"'],
};
export const numberSignature = {
    name: 'number',
    category: 'utility',
    description: 'Convert a value to a number when possible, with an optional fallback.',
    parameters: [
        {
            name: 'fallback',
            type: 'any',
            required: false,
            description: 'Fallback value returned when the input cannot be converted to a number',
        },
    ],
    returnType: 'any',
    examples: ['number("42") → 42', 'number("abc") → null', 'number("abc", 0) → 0'],
};
export const jsonSignature = {
    name: 'json',
    category: 'utility',
    description: 'Serialize a value as JSON.',
    parameters: [],
    returnType: 'string',
    examples: [`json({a:1}) → '{"a":1}'`],
};
export const typeofFunction = (value) => {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    return typeof value;
};
export const stringFunction = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => stringFunction(item)).join(',');
    }
    if (typeof value === 'object') {
        return '[object Object]';
    }
    return String(value);
};
function toNumberOrNull(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }
        const num = Number(trimmed);
        return Number.isFinite(num) ? num : null;
    }
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }
    return null;
}
export const numberFunction = function (value, fallback) {
    const numericValue = toNumberOrNull(value);
    if (numericValue !== null) {
        return numericValue;
    }
    return arguments.length > 1 ? fallback : null;
};
export const jsonFunction = (value) => {
    try {
        const ancestry = [];
        const onPath = new WeakSet();
        return JSON.stringify(value, function (_key, candidate) {
            if (typeof candidate === 'bigint') {
                return candidate.toString();
            }
            if (candidate && typeof candidate === 'object') {
                const parent = this && typeof this === 'object' ? this : undefined;
                while (ancestry.length > 0 && ancestry[ancestry.length - 1] !== parent) {
                    const popped = ancestry.pop();
                    if (popped) {
                        onPath.delete(popped);
                    }
                }
                const current = candidate;
                if (onPath.has(current)) {
                    return '[Circular]';
                }
                ancestry.push(current);
                onPath.add(current);
            }
            return candidate;
        });
    }
    catch {
        return '"[unserializable]"';
    }
};
export const utilityFunctions = [
    { signature: defaultSignature, handler: defaultValue },
    { signature: typeofSignature, handler: typeofFunction },
    { signature: typeSignature, handler: typeofFunction },
    { signature: stringSignature, handler: stringFunction },
    { signature: numberSignature, handler: numberFunction },
    { signature: jsonSignature, handler: jsonFunction },
];
//# sourceMappingURL=utility-functions.js.map