/**
 * TTY (terminal) detection for CLI
 * Determines if input/output is interactive or piped
 */
/**
 * Detect if we're running in an interactive terminal
 * @returns TTY detection result
 */
export function detectTTY() {
    const stdinIsTTY = process.stdin.isTTY ?? false;
    const stdoutIsTTY = process.stdout.isTTY ?? false;
    const stderrIsTTY = process.stderr.isTTY ?? false;
    // Interactive mode is when both stdin and stdout are TTYs.
    // stderr being a TTY is reported separately and not required for interactivity.
    const isInteractive = stdinIsTTY && stdoutIsTTY;
    return {
        stdinIsTTY,
        stdoutIsTTY,
        stderrIsTTY,
        isInteractive,
    };
}
/**
 * Get appropriate timeout based on interactive mode
 * Interactive mode typically needs longer timeout for user input
 * Pipe mode should timeout faster to avoid hanging in pipelines
 * @param isInteractive - Whether running in interactive mode
 * @param interactiveMs - Timeout for interactive mode (default: 30000ms)
 * @param pipeMs - Timeout for pipe mode (default: 5000ms)
 * @returns Timeout in milliseconds
 */
export function getTimeoutForMode(isInteractive, interactiveMs = 30000, pipeMs = 5000) {
    return isInteractive ? interactiveMs : pipeMs;
}
//# sourceMappingURL=tty-detection.js.map