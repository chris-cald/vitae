export type SemanticOperation = 'completion' | 'hover' | 'definition' | 'diagnostics';
export type SemanticZoneSegment = 'metadata' | 'content';
export type SemanticZoneKind = 'metadata' | 'content';
export type SemanticHostLanguage = 'markdown' | 'yaml' | 'json' | 'toml' | 'html' | 'xml' | 'plaintext';
export interface SemanticZone {
    kind: SemanticZoneKind;
    profileId: string;
    segment: SemanticZoneSegment;
}
export interface SemanticLocation {
    documentUri?: string;
    line: number;
    character: number;
    offset?: number;
}
export interface SemanticRequest {
    version: 'v1';
    operation: SemanticOperation;
    location: SemanticLocation;
    segment: SemanticZoneSegment;
    zone?: SemanticZone;
}
export interface SemanticCompletionItem {
    label: string;
    kind: 'variable' | 'property' | 'keyword' | 'filter';
    detail?: string;
    documentation?: string;
}
export interface SemanticHoverResult {
    markdown?: string;
    plaintext?: string;
}
export interface SemanticDefinitionResult {
    uri: string;
    range: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
}
export type DiagnosticSeverity = 1 | 2 | 3 | 4;
export interface SemanticDiagnosticRecord {
    message: string;
    severity: DiagnosticSeverity;
    range: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
    code?: string;
    source?: string;
}
export interface SemanticResponse {
    version: 'v1';
    revision: number;
    operation: SemanticOperation;
    segment: SemanticZoneSegment;
    zone?: SemanticZone;
    completionItems?: SemanticCompletionItem[];
    hover?: SemanticHoverResult | null;
    definition?: SemanticDefinitionResult | null;
    diagnostics?: SemanticDiagnosticRecord[];
}
/**
 * Derive a stable schema profile ID from a semantic zone segment name.
 *
 * @param segment - `"metadata"` or `"content"`
 * @returns Profile ID string (e.g. `"schema-metadata"`)
 */
export declare function getSemanticProfileId(segment: SemanticZoneSegment): string;
/**
 * Convert a semantic zone segment into a structured `SemanticZone`.
 *
 * @param segment - `"metadata"` or `"content"`
 * @returns `SemanticZone` with canonicalized segment metadata
 */
export declare function toSemanticZone(segment: SemanticZoneSegment): SemanticZone;
export interface FrontmatterRange {
    start: number;
    end: number;
}
export interface FrontmatterKeyValueAtOffset {
    key: string;
    valueToken: string;
}
/**
 * Detect the string index range (code unit offsets) occupied by a YAML
 * frontmatter block.
 *
 * @param text - Full document text to scan
 * @returns `FrontmatterRange` `{start, end}` if a `---`-delimited block is
 *   found at the document start, or `undefined` if none is present. These
 *   indices are intended for use with `text.slice(range.start, range.end)`.
 */
export declare function detectFrontmatterRange(text: string): FrontmatterRange | undefined;
/**
 * Return `true` when `offset` falls inside the frontmatter block.
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset to test
 * @returns `true` if the offset is within the `---` YAML frontmatter block
 */
export declare function isOffsetInFrontmatter(text: string, offset: number): boolean;
/**
 * Extract the token under (or immediately before) the given text offset.
 *
 * Token characters include alphanumerics plus path/symbol characters used by
 * schema and query references (`.`, `/`, `:`, `#`, `$`, `~`, `+`, `-`).
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset
 * @returns Token string with its start/end offsets, or `undefined` when no
 *   token is present at that location
 */
export declare function getTokenAtOffset(text: string, offset: number): {
    token: string;
    start: number;
    end: number;
} | undefined;
/**
 * Read canonical schema source keys from YAML frontmatter.
 *
 * @param text - Full document text
 * @returns Object with discovered schema URI values (if present)
 */
export declare function getFrontmatterSchemaSources(text: string): {
    schemaPath?: string;
    contentSchemaPath?: string;
};
/**
 * Resolve a schema URI reference when the cursor is on a canonical frontmatter
 * schema key or value token.
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset
 * @returns `{ value }` when offset targets a schema key/value, else `null`
 */
export declare function getFrontmatterSchemaReferenceAtOffset(text: string, offset: number): {
    value: string;
} | null;
/**
 * Parse the frontmatter key/value pair at a cursor offset.
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset
 * @returns Parsed key and normalized value token, or `null` if offset does not
 *   fall on a parseable key/value line
 */
export declare function getFrontmatterKeyValueAtOffset(text: string, offset: number): FrontmatterKeyValueAtOffset | null;
/**
 * Determine which semantic zone segment surrounds the given offset.
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset to classify
 * @returns `"metadata"` when offset is inside metadata block, `"content"` otherwise
 */
export declare function resolveSemanticZoneSegment(text: string, offset: number): SemanticZoneSegment;
/**
 * Resolve the full `SemanticZone` for the given offset.
 *
 * Convenience wrapper around `resolveSemanticZoneSegment` + `toSemanticZone`.
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset
 * @returns `SemanticZone` describing the zone at that offset
 */
export declare function resolveSemanticZone(text: string, offset: number): SemanticZone;
/**
 * Infer the host document language from the file URI extension.
 *
 * Recognises `.md.templ` / `.md.tmpl` / `.md.tpl`,
 * `.yml.templ` / `.yml.tmpl` / `.yml.tpl`,
 * `.yaml.templ` / `.yaml.tmpl` / `.yaml.tpl`,
 * `.json.templ` / `.json.tmpl` / `.json.tpl`,
 * `.toml.templ` / `.toml.tmpl` / `.toml.tpl`,
 * `.html.templ` / `.html.tmpl` / `.html.tpl`,
 * and `.xml.templ` / `.xml.tmpl` / `.xml.tpl`
 * double-extension conventions (and their reversed forms).
 *
 * @param documentUri - Optional document URI or path
 * @returns `SemanticHostLanguage` string (`"markdown"`, `"json"`, etc.)
 *   or `"plaintext"` if no recognised extension is found
 */
export declare function resolveSemanticHostLanguage(documentUri?: string): SemanticHostLanguage;
/**
 * Resolve semantic zone defaults based on host language + offset context.
 *
 * Frontmatter detection is only active for Markdown files. For JSON/YAML and
 * other host languages, all content is treated as the `content` zone.
 *
 * @param text - Full document text
 * @param offset - Zero-based character offset
 * @param hostLanguage - Host language inferred from file extension
 * @returns `SemanticZone` suitable for language-aware tooling behavior
 */
export declare function resolveSemanticZoneByHostLanguage(text: string, offset: number, hostLanguage: SemanticHostLanguage): SemanticZone;
