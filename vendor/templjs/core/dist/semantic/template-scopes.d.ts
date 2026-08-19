import type { LexerOptions } from '../lexer/types.js';
import type { PathSegment } from '../parser/types.js';
export type TemplateBindingKind = 'for-alias' | 'for-value-alias' | 'set-variable';
export interface TemplateBinding {
    kind: TemplateBindingKind;
    name: string;
    scopeStartOffset: number;
    scopeEndOffset: number;
    declarationStartOffset?: number;
    declarationEndOffset?: number;
    sourcePath?: string;
    sourceExpression?: string;
    inferredPaths?: string[];
}
export declare function pathSegmentToString(segment: PathSegment): string;
export declare function getTemplateBindingsAtOffset(bindings: TemplateBinding[], offset: number): TemplateBinding[];
export declare function extractTemplateBindings(template: string, options?: LexerOptions): TemplateBinding[];
