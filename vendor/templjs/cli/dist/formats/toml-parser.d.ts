/**
 * TOML format parser
 */
import { FormatParser } from './types.js';
export declare class TomlParser implements FormatParser {
    formatName: string;
    parse(content: string): Record<string, unknown>;
}
