/**
 * Format detection and parser factory
 */
import { FormatParser, SupportedFormat, SUPPORTED_EXTENSIONS } from './types.js';
export type { FormatParser, SupportedFormat };
export { SUPPORTED_EXTENSIONS };
export { JsonParser } from './json-parser.js';
export { YamlParser } from './yaml-parser.js';
export { TomlParser } from './toml-parser.js';
export { XmlParser } from './xml-parser.js';
/**
 * Detect format from file path extension
 * @param filePath File path to detect format from
 * @returns Detected format or null if not recognized
 */
export declare function detectFormat(filePath: string): SupportedFormat | null;
/**
 * Get parser for detected format
 * @param format Format type
 * @returns Parser instance for the format
 */
export declare function getParser(format: SupportedFormat): FormatParser;
/**
 * Parse content with auto-detection from file path
 * @param content Content to parse
 * @param filePath File path for format detection
 * @returns Parsed data
 */
export declare function parseData(content: string, filePath: string): Record<string, unknown>;
/**
 * Parse content with async support for XML
 * @param content Content to parse
 * @param filePath File path for format detection (use "-" for stdin, defaults to JSON)
 * @returns Promise resolving to parsed data
 */
export declare function parseDataAsync(content: string, filePath: string): Promise<Record<string, unknown>>;
