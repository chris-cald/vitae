/**
 * @templjs/cli - init command
 * Generates starter templates for a requested output format.
 */
export interface InitCommandOptions {
    format: string;
    output?: string;
}
export declare function initCommand(options: InitCommandOptions): Promise<string>;
