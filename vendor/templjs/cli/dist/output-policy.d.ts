import type { Command } from 'commander';
export interface OutputMode {
    quiet: boolean;
    verbose: boolean;
    json: boolean;
}
export interface JsonSuccessPayload {
    command: 'render' | 'validate' | 'init';
    data: Record<string, unknown>;
}
export declare function resolveOutputModeFromCommand(command: Command): OutputMode;
export declare function resolveOutputModeFromArgv(argv: string[]): OutputMode;
export declare function writeVerbose(mode: OutputMode, message: string): void;
/**
 * Writes success output according to the selected output mode.
 *
 * In JSON mode, output is newline-terminated.
 * In text mode, `textOutput` is written as-is via `process.stdout.write(textOutput)`
 * without appending a trailing `\n` to preserve streaming/chunked output behavior.
 */
export declare function writeSuccess(mode: OutputMode, payload: JsonSuccessPayload, textOutput?: string): void;
export declare function writeError(mode: OutputMode, command: string, message: string, suggestion?: string): void;
