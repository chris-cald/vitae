import type { Token, LexerOptions } from './types.js';
/**
 * Tokenize a template string into structured tokens
 *
 * @param template - The template string to tokenize
 * @param options - Lexer options including custom delimiters
 * @returns Array of tokens
 *
 * @example
 * ```typescript
 * const tokens = tokenize('Hello {{ name }}!');
 * // Returns: [
 * //   { type: 'TEXT', content: 'Hello ', ... },
 * //   { type: 'EXPRESSION', content: '{{ name }}', ... },
 * //   { type: 'TEXT', content: '!', ... }
 * // ]
 * ```
 */
export declare function tokenize(template: string, options?: LexerOptions): Token[];
