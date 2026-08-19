/**
 * XML format parser
 */
import { FormatParserAsync } from './types.js';
export declare class XmlParser implements FormatParserAsync {
    formatName: string;
    parseAsync(content: string): Promise<Record<string, unknown>>;
    /**
     * Synchronous parse method for compatibility with other parsers
     * Note: XML parsing is async, so we throw an error
     */
    parse(_content: string): Record<string, unknown>;
}
