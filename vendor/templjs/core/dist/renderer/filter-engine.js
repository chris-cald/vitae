/**
 * Filter and function application engine
 */
const HTML_ESCAPE_PATTERN = /[&<>"']/g;
const HTML_ESCAPE_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
export const MAX_FORMATTER_CACHE_SIZE = 256;
const NUMBER_FORMATTER_CACHE = new Map();
const CURRENCY_FORMATTER_CACHE = new Map();
const MAX_INTL_FRACTION_DIGITS = 20;
function getLruCacheValue(cache, key) {
    const value = cache.get(key);
    if (!value) {
        return undefined;
    }
    // Promote accessed entry to most-recently-used position.
    cache.delete(key);
    cache.set(key, value);
    return value;
}
function setLruCacheValue(cache, key, value) {
    if (cache.has(key)) {
        cache.delete(key);
    }
    cache.set(key, value);
    if (cache.size > MAX_FORMATTER_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        if (typeof oldestKey === 'string') {
            cache.delete(oldestKey);
        }
    }
}
function getCachedNumberFormatter(locale, minimumFractionDigits, maximumFractionDigits) {
    const cacheKey = `${locale}|${minimumFractionDigits}|${maximumFractionDigits}`;
    const cachedFormatter = getLruCacheValue(NUMBER_FORMATTER_CACHE, cacheKey);
    if (cachedFormatter) {
        return cachedFormatter;
    }
    const formatter = new Intl.NumberFormat(locale, {
        useGrouping: true,
        minimumFractionDigits,
        maximumFractionDigits,
    });
    setLruCacheValue(NUMBER_FORMATTER_CACHE, cacheKey, formatter);
    return formatter;
}
function getCachedCurrencyFormatter(locale, currencyCode) {
    const cacheKey = `${locale}|${currencyCode}`;
    const cachedFormatter = getLruCacheValue(CURRENCY_FORMATTER_CACHE, cacheKey);
    if (cachedFormatter) {
        return cachedFormatter;
    }
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    });
    setLruCacheValue(CURRENCY_FORMATTER_CACHE, cacheKey, formatter);
    return formatter;
}
function getCurrencyFractionDigits(resolvedCurrencyCode, resolvedLocale) {
    const localesToTry = [resolvedLocale, 'en-US', undefined];
    for (const locale of localesToTry) {
        try {
            const formatter = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: resolvedCurrencyCode,
            });
            return formatter.resolvedOptions().maximumFractionDigits ?? 2;
        }
        catch {
            continue;
        }
    }
    return 2;
}
function toFiniteNumber(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
            return null;
        }
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }
    return null;
}
function escapeHtml(value) {
    return value.replace(HTML_ESCAPE_PATTERN, (char) => HTML_ESCAPE_ENTITIES[char] ?? char);
}
function getLength(value) {
    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length;
    }
    if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length;
    }
    return 0;
}
/**
 * Built-in filters for template processing
 */
const BUILTIN_FILTERS = {
    /**
     * Convert to uppercase
     */
    upper: (value) => {
        if (typeof value === 'string') {
            return value.toUpperCase();
        }
        return value;
    },
    /**
     * Convert to lowercase
     */
    lower: (value) => {
        if (typeof value === 'string') {
            return value.toLowerCase();
        }
        return value;
    },
    /**
     * Capitalize first letter
     */
    capitalize: (value) => {
        if (typeof value === 'string' && value.length > 0) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
    },
    /**
     * Remove whitespace from both ends
     */
    trim: (value) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    },
    /**
     * Reverse a string or array
     */
    reverse: (value) => {
        if (typeof value === 'string') {
            return value.split('').reverse().join('');
        }
        if (Array.isArray(value)) {
            return [...value].reverse();
        }
        return value;
    },
    /**
     * Get length of string or array
     */
    length: (value) => getLength(value),
    /**
     * Alias for length (string/array/object size)
     */
    size: (value) => getLength(value),
    /**
     * Join array elements
     */
    join: (value, separator = ',') => {
        if (Array.isArray(value)) {
            return value.join(separator);
        }
        return value;
    },
    /**
     * Split string into array
     */
    split: (value, separator = ',') => {
        if (typeof value === 'string') {
            return value.split(separator);
        }
        return value;
    },
    /**
     * Replace substring
     */
    replace: (value, search, replacement) => {
        if (typeof value === 'string' && typeof search === 'string') {
            return value.replaceAll(search, String(replacement));
        }
        return value;
    },
    /**
     * Truncate string to length
     */
    truncate: (value, length, suffix = '...') => {
        if (typeof value === 'string') {
            const len = typeof length === 'number' ? length : 0;
            if (value.length > len) {
                return value.slice(0, len) + suffix;
            }
        }
        return value;
    },
    /**
     * Convert to string
     */
    string: (value) => {
        if (value === null) {
            return '';
        }
        if (value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number') {
            return String(value);
        }
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        if (Array.isArray(value)) {
            return value.map((v) => BUILTIN_FILTERS.string(v)).join(',');
        }
        if (typeof value === 'object') {
            return '[object Object]';
        }
        return String(value);
    },
    /**
     * Compatibility no-op filter that returns the value unchanged.
     */
    no_escape: (value) => value,
    /**
     * Convert to number
     */
    number: function (value, fallback) {
        const numericValue = toFiniteNumber(value);
        if (numericValue !== null) {
            return numericValue;
        }
        return arguments.length > 1 ? fallback : null;
    },
    /**
     * Locale-aware number formatting using Intl.NumberFormat
     */
    format_number: (value, locale = 'en-US', minimumFractionDigits = 0, maximumFractionDigits = minimumFractionDigits) => {
        const numericValue = toFiniteNumber(value);
        if (numericValue === null) {
            return value;
        }
        const resolvedLocale = typeof locale === 'string' && locale.trim() ? locale.trim() : 'en-US';
        const minDigits = Math.min(MAX_INTL_FRACTION_DIGITS, typeof minimumFractionDigits === 'number' && Number.isFinite(minimumFractionDigits)
            ? Math.max(0, Math.floor(minimumFractionDigits))
            : 0);
        const maxDigitsCandidate = Math.min(MAX_INTL_FRACTION_DIGITS, typeof maximumFractionDigits === 'number' && Number.isFinite(maximumFractionDigits)
            ? Math.max(0, Math.floor(maximumFractionDigits))
            : minDigits);
        const maxDigits = Math.max(minDigits, maxDigitsCandidate);
        try {
            return getCachedNumberFormatter(resolvedLocale, minDigits, maxDigits).format(numericValue);
        }
        catch {
            return getCachedNumberFormatter('en-US', minDigits, maxDigits).format(numericValue);
        }
    },
    /**
     * Locale-aware currency formatting using Intl.NumberFormat
     */
    format_currency: (value, currencyCode, locale = 'en-US') => {
        const numericValue = toFiniteNumber(value);
        if (numericValue === null) {
            return value;
        }
        if (typeof currencyCode !== 'string') {
            return value;
        }
        const resolvedCurrencyCode = currencyCode.trim().toUpperCase();
        if (!resolvedCurrencyCode) {
            return value;
        }
        const resolvedLocale = typeof locale === 'string' && locale.trim() ? locale.trim() : 'en-US';
        try {
            return getCachedCurrencyFormatter(resolvedLocale, resolvedCurrencyCode).format(numericValue);
        }
        catch {
            try {
                return getCachedCurrencyFormatter('en-US', resolvedCurrencyCode).format(numericValue);
            }
            catch {
                const fractionDigits = getCurrencyFractionDigits(resolvedCurrencyCode, resolvedLocale);
                return `${resolvedCurrencyCode} ${numericValue.toFixed(fractionDigits)}`;
            }
        }
    },
    /**
     * Default value if falsy
     */
    default: (value, defaultValue) => {
        if (value === null || value === undefined || value === '' || value === false) {
            return defaultValue;
        }
        return value;
    },
    /**
     * Filter array by key
     */
    where: (value, key) => {
        if (!Array.isArray(value)) {
            return value;
        }
        if (typeof key !== 'string') {
            return value;
        }
        return value.filter((item) => {
            if (typeof item === 'object' && item !== null) {
                return item[key];
            }
            return false;
        });
    },
    /**
     * Get first element
     */
    first: (value) => {
        if (Array.isArray(value) && value.length > 0) {
            return value[0];
        }
        if (typeof value === 'string' && value.length > 0) {
            return value.charAt(0);
        }
        return undefined;
    },
    /**
     * Get last element
     */
    last: (value) => {
        if (Array.isArray(value) && value.length > 0) {
            return value[value.length - 1];
        }
        if (typeof value === 'string' && value.length > 0) {
            return value.charAt(value.length - 1);
        }
        return undefined;
    },
    /**
     * Get absolute value
     */
    abs: (value) => {
        if (typeof value === 'number') {
            return Math.abs(value);
        }
        return value;
    },
    /**
     * Round number
     */
    round: (value, precision = 0) => {
        if (typeof value === 'number') {
            const factor = Math.pow(10, precision);
            return Math.round(value * factor) / factor;
        }
        return value;
    },
    /**
     * JSON.stringify
     */
    json: (value) => {
        return JSON.stringify(value);
    },
    /**
     * Escape HTML-sensitive characters
     */
    escape: (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        return escapeHtml(String(value));
    },
    /**
     * Alias for HTML escape
     */
    e: (value) => {
        return BUILTIN_FILTERS.escape(value);
    },
    /**
     * JavaScript-like type inspection with null/array handling
     */
    typeof: (value) => {
        if (value === null) {
            return 'null';
        }
        if (Array.isArray(value)) {
            return 'array';
        }
        return typeof value;
    },
    /**
     * Alias for typeof, matching common template-engine type filters.
     */
    type: (value) => {
        return BUILTIN_FILTERS.typeof(value);
    },
};
export function getBuiltinFilterNames() {
    return Object.keys(BUILTIN_FILTERS);
}
export const BUILTIN_FILTER_NAMES = getBuiltinFilterNames();
/**
 * Clears the module-level Intl.NumberFormat caches for number and currency
 * formatters. Call this in long-running or dynamic-locale scenarios to free
 * memory accumulated from many distinct locale/currency combinations.
 */
export function clearFormatterCaches() {
    NUMBER_FORMATTER_CACHE.clear();
    CURRENCY_FORMATTER_CACHE.clear();
}
/**
 * Filter application engine
 */
export class FilterEngine {
    filters = createBuiltinFilterMap();
    constructor(initialFilters) {
        if (initialFilters) {
            Object.entries(initialFilters).forEach(([name, fn]) => {
                this.filters.set(name, fn);
            });
        }
    }
    /**
     * Register a filter function
     */
    registerFilter(name, fn) {
        this.filters.set(name, fn);
    }
    /**
     * Apply a single filter to a value
     */
    applyFilter(name, value, args = []) {
        const filter = this.filters.get(name);
        if (!filter) {
            throw new Error(`Unknown filter: ${name}`);
        }
        try {
            switch (args.length) {
                case 0:
                    return filter(value);
                case 1:
                    return filter(value, args[0]);
                case 2:
                    return filter(value, args[0], args[1]);
                case 3:
                    return filter(value, args[0], args[1], args[2]);
                default: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const fn = filter;
                    return fn(value, ...args);
                }
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Filter '${name}' failed: ${message}`, { cause: error });
        }
    }
    /**
     * Apply multiple filters in sequence
     */
    chainFilters(value, filters) {
        let result = value;
        for (const filter of filters) {
            result = this.applyFilter(filter.name, result, filter.args);
        }
        return result;
    }
    /**
     * Get all registered filter names
     */
    getFilterNames() {
        return Array.from(this.filters.keys());
    }
}
export function createBuiltinFilterMap() {
    return new Map(Object.entries(BUILTIN_FILTERS));
}
//# sourceMappingURL=filter-engine.js.map