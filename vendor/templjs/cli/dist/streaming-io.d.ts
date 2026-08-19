/**
 * Streaming I/O utilities for handling large files
 * Provides efficient reading/writing of files larger than memory buffers
 */
import type { WriteStream } from 'fs';
export declare const LARGE_FILE_THRESHOLD: number;
export interface StreamingReadOptions {
    encoding?: BufferEncoding;
    highWaterMark?: number;
    onProgress?: (bytesRead: number, totalBytes?: number) => void;
}
export interface StreamingWriteOptions {
    encoding?: BufferEncoding;
    highWaterMark?: number;
}
/**
 * Read a file in chunks, suitable for large files
 * @param path - File path to read
 * @param totalBytes - Total file size (optional, for progress)
 * @param options - Streaming options (`onProgress` fires every ~1MB and once at completion)
 * @returns Async iterator of chunks
 */
export declare function readFileStream(path: string, totalBytes?: number, options?: StreamingReadOptions): AsyncGenerator<string, void, unknown>;
/**
 * Write data to a file using streaming
 * @param path - File path to write to
 * @param options - Streaming options
 * @returns Write stream
 */
export declare function createFileWriteStream(path: string, options?: StreamingWriteOptions): WriteStream;
/**
 * Check if a file should be streamed based on size
 * @param fileSize - File size in bytes
 * @param threshold - Threshold for streaming (default: 10MB)
 * @returns True if file should be streamed
 */
export declare function shouldStream(fileSize: number, threshold?: number): boolean;
/**
 * Collect chunks from a stream into a single string
 * @param stream - Stream to read from
 * @returns Promise resolving to complete string
 */
export declare function streamToString(stream: AsyncIterable<string>): Promise<string>;
