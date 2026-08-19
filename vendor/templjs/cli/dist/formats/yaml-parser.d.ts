/**
 * YAML format parser
 */
import { FormatParser } from './types.js';
export declare class YamlParser implements FormatParser {
    formatName: string;
    parse(content: string): Record<string, unknown>;
}
