/**
 * String Functions (20 functions)
 *
 * Functions for string manipulation including case transformations,
 * trimming, searching, and pattern matching.
 */
// String function signatures
export const upperSignature = {
    name: 'upper',
    category: 'string',
    description: 'Convert string to uppercase',
    parameters: [],
    returnType: 'string',
    examples: ['upper("hello") → "HELLO"'],
};
export const lowerSignature = {
    name: 'lower',
    category: 'string',
    description: 'Convert string to lowercase',
    parameters: [],
    returnType: 'string',
    examples: ['lower("HELLO") → "hello"'],
};
export const capitalizeSignature = {
    name: 'capitalize',
    category: 'string',
    description: 'Capitalize the first character of a string.',
    parameters: [],
    returnType: 'string',
    examples: ['capitalize("hello") → "Hello"'],
};
export const trimSignature = {
    name: 'trim',
    category: 'string',
    description: 'Trim whitespace from both ends of a string.',
    parameters: [],
    returnType: 'string',
    examples: ['trim("  hello  ") → "hello"'],
};
export const ltrimSignature = {
    name: 'ltrim',
    category: 'string',
    description: 'Remove whitespace from left side',
    parameters: [],
    returnType: 'string',
    examples: ['ltrim("  hello  ") → "hello  "'],
};
export const rtrimSignature = {
    name: 'rtrim',
    category: 'string',
    description: 'Remove whitespace from right side',
    parameters: [],
    returnType: 'string',
    examples: ['rtrim("  hello  ") → "  hello"'],
};
export const replaceSignature = {
    name: 'replace',
    category: 'string',
    description: 'Replace all occurrences of a substring in a string.',
    parameters: [
        { name: 'search', type: 'string', required: true, description: 'String to search for' },
        {
            name: 'replacement',
            type: 'string',
            required: true,
            description: 'Replacement string',
        },
    ],
    returnType: 'string',
    examples: ['replace("hello world", "world", "there") → "hello there"'],
};
export const sliceSignature = {
    name: 'slice',
    category: 'string',
    description: 'Extract a substring',
    parameters: [
        { name: 'start', type: 'number', required: true, description: 'Start index' },
        { name: 'end', type: 'number', required: false, description: 'End index (exclusive)' },
    ],
    returnType: 'string',
    examples: ['slice("hello", 0, 3) → "hel"', 'slice("hello", 1) → "ello"'],
};
export const splitSignature = {
    name: 'split',
    category: 'string',
    description: 'Split a string into a list using a delimiter.',
    parameters: [
        {
            name: 'delimiter',
            type: 'string',
            required: true,
            description: 'Delimiter to split on',
        },
    ],
    returnType: 'array',
    examples: ['split("a,b,c", ",") → ["a", "b", "c"]'],
};
export const joinSignature = {
    name: 'join',
    category: 'string',
    description: 'Join a list of values into a string.',
    parameters: [
        {
            name: 'separator',
            type: 'string',
            required: true,
            description: 'String to join with',
        },
    ],
    returnType: 'string',
    examples: ['join(["a", "b", "c"], ",") → "a,b,c"'],
};
export const startsWithSignature = {
    name: 'startsWith',
    category: 'string',
    description: 'Check if string starts with prefix',
    parameters: [{ name: 'prefix', type: 'string', required: true, description: 'Prefix to check' }],
    returnType: 'boolean',
    examples: ['startsWith("hello", "he") → true', 'startsWith("hello", "lo") → false'],
};
export const endsWithSignature = {
    name: 'endsWith',
    category: 'string',
    description: 'Check if string ends with suffix',
    parameters: [{ name: 'suffix', type: 'string', required: true, description: 'Suffix to check' }],
    returnType: 'boolean',
    examples: ['endsWith("hello", "lo") → true', 'endsWith("hello", "he") → false'],
};
export const includesSignature = {
    name: 'includes',
    category: 'string',
    description: 'Check if string contains substring',
    parameters: [
        { name: 'substring', type: 'string', required: true, description: 'Substring to find' },
    ],
    returnType: 'boolean',
    examples: ['includes("hello world", "world") → true', 'includes("hello", "xyz") → false'],
};
export const indexOfSignature = {
    name: 'indexOf',
    category: 'string',
    description: 'Find index of substring',
    parameters: [
        { name: 'substring', type: 'string', required: true, description: 'Substring to find' },
    ],
    returnType: 'number',
    examples: ['indexOf("hello world", "world") → 6', 'indexOf("hello", "xyz") → -1'],
};
export const padStartSignature = {
    name: 'padStart',
    category: 'string',
    description: 'Pad string from start to target length',
    parameters: [
        { name: 'length', type: 'number', required: true, description: 'Target length' },
        {
            name: 'fillStr',
            type: 'string',
            required: false,
            description: 'Fill string (default: " ")',
        },
    ],
    returnType: 'string',
    examples: ['padStart("5", 3, "0") → "005"', 'padStart("hello", 7) → "  hello"'],
};
export const padEndSignature = {
    name: 'padEnd',
    category: 'string',
    description: 'Pad string from end to target length',
    parameters: [
        { name: 'length', type: 'number', required: true, description: 'Target length' },
        {
            name: 'fillStr',
            type: 'string',
            required: false,
            description: 'Fill string (default: " ")',
        },
    ],
    returnType: 'string',
    examples: ['padEnd("5", 3, "0") → "500"', 'padEnd("hello", 7) → "hello  "'],
};
export const repeatSignature = {
    name: 'repeat',
    category: 'string',
    description: 'Repeat string n times',
    parameters: [
        { name: 'count', type: 'number', required: true, description: 'Number of repetitions' },
    ],
    returnType: 'string',
    examples: ['repeat("ab", 3) → "ababab"', 'repeat("x", 5) → "xxxxx"'],
};
export const reverseSignature = {
    name: 'reverse',
    category: 'string',
    description: 'Reverse the characters in a string.',
    parameters: [],
    returnType: 'string',
    examples: ['reverse("hello") → "olleh"'],
};
export const escapeSignature = {
    name: 'escape',
    category: 'string',
    description: 'HTML escape string',
    parameters: [],
    returnType: 'string',
    examples: ['escape("<script>") → "&lt;script&gt;"'],
};
export const noEscapeSignature = {
    name: 'no_escape',
    category: 'string',
    description: 'Return trusted content unchanged for raw template output.',
    parameters: [],
    returnType: 'any',
    examples: ['no_escape("<strong>safe</strong>") → "<strong>safe</strong>"'],
};
export const truncateSignature = {
    name: 'truncate',
    category: 'string',
    description: 'Truncate a string to a maximum of N characters, then append the optional suffix (suffix is added after truncation and may cause the result to exceed N).',
    parameters: [
        { name: 'length', type: 'number', required: true, description: 'Maximum string length' },
        { name: 'suffix', type: 'string', required: false, description: 'Optional suffix' },
    ],
    returnType: 'string',
    examples: [
        'truncate("hello world", 5) → "hello..."',
        'truncate("hello world", 5, "!") → "hello!"',
        'truncate("hello", 10) → "hello"',
    ],
};
// String function handlers
export const upper = (value) => {
    return String(value).toUpperCase();
};
export const lower = (value) => {
    return String(value).toLowerCase();
};
export const capitalize = (value) => {
    const str = String(value);
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};
export const trim = (value) => {
    return String(value).trim();
};
export const ltrim = (value) => {
    return String(value).replace(/^\s+/, '');
};
export const rtrim = (value) => {
    return String(value).replace(/\s+$/, '');
};
export const replace = (value, search, replacement) => {
    const str = String(value);
    const searchStr = String(search);
    const replaceStr = String(replacement);
    return str.replace(new RegExp(searchStr, 'g'), replaceStr);
};
export const slice = (value, start, end) => {
    const str = String(value);
    const startIdx = Number(start);
    const endIdx = end !== undefined ? Number(end) : undefined;
    return str.slice(startIdx, endIdx);
};
export const split = (value, delimiter) => {
    return String(value).split(String(delimiter));
};
export const join = (value, separator) => {
    if (!Array.isArray(value)) {
        throw new Error('join expects an array');
    }
    return value.join(String(separator));
};
export const startsWith = (value, prefix) => {
    return String(value).startsWith(String(prefix));
};
export const endsWith = (value, suffix) => {
    return String(value).endsWith(String(suffix));
};
export const includes = (value, substring) => {
    return String(value).includes(String(substring));
};
export const indexOf = (value, substring) => {
    return String(value).indexOf(String(substring));
};
export const padStart = (value, length, fillStr) => {
    return String(value).padStart(Number(length), fillStr ? String(fillStr) : ' ');
};
export const padEnd = (value, length, fillStr) => {
    return String(value).padEnd(Number(length), fillStr ? String(fillStr) : ' ');
};
export const repeat = (value, count) => {
    return String(value).repeat(Number(count));
};
export const reverse = (value) => {
    return String(value).split('').reverse().join('');
};
export const escape = (value) => {
    const str = String(value);
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, (char) => escapeMap[char]);
};
export const noEscape = (value) => {
    return value;
};
export const truncate = (value, length, suffix) => {
    const str = String(value);
    const maxLength = Number(length);
    const suffixValue = suffix !== undefined ? String(suffix) : '...';
    if (!Number.isFinite(maxLength) || maxLength < 0) {
        return str;
    }
    return str.length > maxLength ? `${str.slice(0, maxLength)}${suffixValue}` : str;
};
/**
 * Export all string function registrations
 */
export const stringFunctions = [
    { signature: upperSignature, handler: upper },
    { signature: lowerSignature, handler: lower },
    { signature: capitalizeSignature, handler: capitalize },
    { signature: trimSignature, handler: trim },
    { signature: ltrimSignature, handler: ltrim },
    { signature: rtrimSignature, handler: rtrim },
    { signature: replaceSignature, handler: replace },
    { signature: sliceSignature, handler: slice },
    { signature: splitSignature, handler: split },
    { signature: joinSignature, handler: join },
    { signature: startsWithSignature, handler: startsWith },
    { signature: endsWithSignature, handler: endsWith },
    { signature: includesSignature, handler: includes },
    { signature: indexOfSignature, handler: indexOf },
    { signature: padStartSignature, handler: padStart },
    { signature: padEndSignature, handler: padEnd },
    { signature: repeatSignature, handler: repeat },
    { signature: reverseSignature, handler: reverse },
    { signature: escapeSignature, handler: escape },
    { signature: noEscapeSignature, handler: noEscape },
    { signature: truncateSignature, handler: truncate },
];
//# sourceMappingURL=string-functions.js.map