#!/usr/bin/env node
/**
 * @templjs/cli - Command-line interface for templjs
 *
 * Usage:
 *   templjs render --template <path> --input <path|->
 *   templjs validate --template <path>
 *   templjs init --format <markdown|html|json|yaml>
 *   templjs --help
 *   templjs --version
 */
export declare function main(argv?: string[]): Promise<void>;
export declare function isDirectCliExecution(argvPath?: string): boolean;
