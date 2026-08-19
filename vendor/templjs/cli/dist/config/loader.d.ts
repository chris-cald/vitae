/**
 * Config file discovery, loading, validation, and merging
 */
import { CliConfig, ResolvedConfig } from './types.js';
/**
 * Loads CLI config with full discovery, validation, and merging
 */
export declare function loadConfig(cliFlags?: Record<string, unknown>): ResolvedConfig;
/**
 * Applies config values to command options (as plain object).
 * Config defaults only fill in missing values (not overriding explicit options).
 */
export type AppliedConfigOptions = Partial<{
    template: string;
    output: string;
    inputFormat: 'json' | 'yaml' | 'toml' | 'xml';
    outputFormat: 'text' | 'json' | 'html' | 'markdown';
    validateInput: boolean;
    validateOutput: boolean;
    schema: string;
}>;
export declare function applyConfig<TOptions extends object>(options: TOptions, config: ResolvedConfig): TOptions & AppliedConfigOptions;
export type { CliConfig, ResolvedConfig };
