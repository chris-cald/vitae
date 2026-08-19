/**
 * Error formatter for CLI output
 * Formats error messages with context snippets showing code around the error
 */
export interface ErrorContextOptions {
    contextLines?: number;
    showLineNumbers?: boolean;
    highlightColumn?: boolean;
}
export interface FormattedError {
    message: string;
    context?: string;
}
/**
 * Get a source snippet with context around a specific line
 * @param source - The source code/content
 * @param lineNumber - Line number (1-indexed) where error occurred
 * @param column - Column number (1-indexed) for error position
 * @param options - Formatting options
 * @returns Formatted error with context
 */
export declare function formatErrorContext(source: string, lineNumber: number, column: number, options?: ErrorContextOptions): FormattedError;
/**
 * Format a generic error with optional context
 * @param error - The error message or Error object
 * @param source - Optional source code to provide context
 * @param lineNumber - Optional line number for error location
 * @param column - Optional column number for error position
 * @param options - Formatting options
 * @returns Formatted error string
 */
export declare function formatError(error: string | Error, source?: string, lineNumber?: number, column?: number, options?: ErrorContextOptions): string;
/**
 * Try to provide helpful error message for common template/data errors
 */
export declare function provideErrorSuggestion(errorMessage: string): string | undefined;
