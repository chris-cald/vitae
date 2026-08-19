import { type FSWatcher } from 'fs';
export interface WatchModeOptions {
    template: string;
    input: string;
    output?: string;
    debounceMs?: number;
}
export interface WatchModeDependencies {
    fileExists: (path: string) => boolean;
    render: (templatePath: string, dataOrPath: string) => Promise<string>;
    watchFile: (path: string, listener: () => void) => FSWatcher;
    writeOutput: (path: string, data: string, encoding: BufferEncoding) => void;
    writeStdout: (data: string) => boolean;
    writeStderr: (data: string) => boolean;
    addSignalListener: (signal: NodeJS.Signals, handler: () => void) => void;
    removeSignalListener: (signal: NodeJS.Signals, handler: () => void) => void;
    setProcessExitCode: (code: number) => void;
}
export declare const DEFAULT_DEBOUNCE_MS = 75;
export declare const WATCH_ERROR_PREFIXES: {
    readonly RENDER_ERROR_PREFIX: "Error: ";
    readonly WATCHER_ERROR_PREFIX: "Watch error: ";
    readonly RENDER_LOOP_ERROR_PREFIX: "Unexpected watch render loop error: ";
    readonly STARTUP_ERROR_PREFIX: "Unexpected watch mode startup error: ";
};
export declare const defaultWatchModeDependencies: WatchModeDependencies;
export declare function startRenderWatchMode(options: WatchModeOptions, deps: WatchModeDependencies): Promise<void>;
