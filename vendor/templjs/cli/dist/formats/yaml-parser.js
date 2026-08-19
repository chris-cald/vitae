/**
 * YAML format parser
 */
import * as jsYaml from 'js-yaml';
export class YamlParser {
    formatName = 'YAML';
    parse(content) {
        try {
            const parsed = jsYaml.load(content);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Input data must be a YAML object (mapping/hash)');
            }
            return parsed;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid YAML: ${message}`, { cause: error });
        }
    }
}
//# sourceMappingURL=yaml-parser.js.map