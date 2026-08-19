/**
 * TTY (terminal) detection for CLI
 * Determines if input/output is interactive or piped
 */
export interface TTYDetectionResult {
    stdinIsTTY: boolean;
    stdoutIsTTY: boolean;
    stderrIsTTY: boolean;
    isInteractive: boolean;
}
/**
 * Detect if we're running in an interactive terminal
 * @returns TTY detection result
 */
export declare function detectTTY(): TTYDetectionResult;
/**
 * Get appropriate timeout based on interactive mode
 * Interactive mode typically needs longer timeout for user input
 * Pipe mode should timeout faster to avoid hanging in pipelines
 * @param isInteractive - Whether running in interactive mode
 * @param interactiveMs - Timeout for interactive mode (default: 30000ms)
 * @param pipeMs - Timeout for pipe mode (default: 5000ms)
 * @returns Timeout in milliseconds
 */
export declare function getTimeoutForMode(isInteractive: boolean, interactiveMs?: number, pipeMs?: number): number;
