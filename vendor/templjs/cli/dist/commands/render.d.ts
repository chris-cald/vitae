/**
 * @templjs/cli - render command
 * Renders a template with input data
 */
import type { SupportedFormat } from '../formats/types.js';
export interface RenderCommandOptions {
    experimentalStreamJson?: boolean;
    inputFormat?: SupportedFormat;
    outputFormat?: 'text' | 'json' | 'html' | 'markdown';
    validateInput?: boolean;
    validateOutput?: boolean;
    progressReporter?: (message: string) => void;
}
export declare function calculateProgressPercent(bytesRead: number, totalBytes: number): number;
export declare function renderCommand(templatePath: string, dataOrPath: string, options?: RenderCommandOptions): Promise<string>;
