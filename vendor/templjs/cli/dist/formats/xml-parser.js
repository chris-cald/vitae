/**
 * XML format parser
 */
import { parseStringPromise } from 'xml2js';
export class XmlParser {
    formatName = 'XML';
    async parseAsync(content) {
        try {
            const result = await parseStringPromise(content);
            if (!result || typeof result !== 'object' || Array.isArray(result)) {
                throw new Error('Input data must be valid XML element');
            }
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid XML: ${message}`, { cause: error });
        }
    }
    /**
     * Synchronous parse method for compatibility with other parsers
     * Note: XML parsing is async, so we throw an error
     */
    parse(_content) {
        throw new Error('XML parsing requires async method. Use parseAsync() instead or use a different format.');
    }
}
//# sourceMappingURL=xml-parser.js.map