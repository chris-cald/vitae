/**
 * TOML format parser
 */
import * as tomlParser from '@iarna/toml';
export class TomlParser {
    formatName = 'TOML';
    parse(content) {
        try {
            const parsed = tomlParser.parse(content);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Input data must be a TOML table (object)');
            }
            return parsed;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid TOML: ${message}`, { cause: error });
        }
    }
}
//# sourceMappingURL=toml-parser.js.map