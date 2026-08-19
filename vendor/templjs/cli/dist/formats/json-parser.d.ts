/**
 * JSON format parser
 */
import { FormatParser } from './types.js';
export declare class JsonParser implements FormatParser {
    formatName: string;
    parse(content: string): Record<string, unknown>;
}
