/**
 * Signal handler for CLI process
 * Registers handlers for SIGINT, SIGTERM, and SIGPIPE
 */
export interface SignalHandlerOptions {
    onSigInt?: () => void | Promise<void>;
    onSigTerm?: () => void | Promise<void>;
    onSigPipe?: () => void | Promise<void>;
    cleanupTimeoutMs?: number;
}
/**
 * Register signal handlers with cleanup logic
 * - SIGINT (Ctrl+C): Graceful shutdown, exit code 130
 * - SIGTERM: Graceful shutdown, exit code 143
 * - SIGPIPE: Silent exit (broken pipe in pipelines), exit code 141
 */
export declare function registerSignalHandlers(options?: SignalHandlerOptions): () => void;
