/**
 * JSON format parser
 */
export class JsonParser {
    formatName = 'JSON';
    parse(content) {
        try {
            const parsed = JSON.parse(content);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Input data must be a JSON object');
            }
            return parsed;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid JSON: ${message}`, { cause: error });
        }
    }
}
//# sourceMappingURL=json-parser.js.map