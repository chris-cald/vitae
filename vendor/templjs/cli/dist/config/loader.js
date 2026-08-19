/**
 * Config file discovery, loading, validation, and merging
 */
import { accessSync, constants, readFileSync } from 'fs';
import { resolve, dirname, parse } from 'path';
import { cwd } from 'process';
import Ajv from 'ajv';
import { CLI_CONFIG_SCHEMA } from './schema.js';
const CONFIG_FILENAME = '.templjs.json';
// ENV_VAR_PATTERN: Matches ${VAR} or ${VAR:-fallback} syntax.
// Limitations: Does not support nested ${...} in fallbacks (e.g., ${VAR:-${OTHER}})
// because the non-greedy .*? stops at the first }. Also, ${VAR:-} yields an empty fallback.
// For nested variable support, replace this regex with a proper parser or recursive resolver.
const ENV_VAR_PATTERN = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-(.*?))?\}/g;
const ajv = new Ajv({ allErrors: true });
const validateCliConfig = ajv.compile(CLI_CONFIG_SCHEMA);
/**
 * Validates config object against schema
 */
function validateConfig(config) {
    return validateCliConfig(config);
}
function getValidationErrorDetails() {
    const details = validateCliConfig.errors
        ?.map((error) => `${error.instancePath || '/'}: ${error.message || 'invalid value'}`)
        .join('; ');
    return details || 'config does not match schema';
}
function assertValidConfig(config, context) {
    if (!validateConfig(config)) {
        throw new Error(`Invalid .templjs.json (${context}): ${getValidationErrorDetails()}`);
    }
}
function resolveEnvValue(value) {
    return value.replace(ENV_VAR_PATTERN, (_match, name, fallback) => {
        const envValue = process.env[name];
        if (envValue !== undefined) {
            return envValue;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        throw new Error(`Missing environment variable "${name}" referenced in .templjs.json`);
    });
}
function resolveEnvPlaceholders(value) {
    if (typeof value === 'string') {
        return resolveEnvValue(value);
    }
    if (Array.isArray(value)) {
        return value.map(resolveEnvPlaceholders);
    }
    if (value !== null && typeof value === 'object') {
        const resolved = {};
        for (const [key, nested] of Object.entries(value)) {
            resolved[key] = resolveEnvPlaceholders(nested);
        }
        return resolved;
    }
    return value;
}
/**
 * Recursively searches for .templjs.json from current directory up to root
 */
function findConfigFile(startDir = cwd()) {
    let currentDir = resolve(startDir);
    const root = parse(currentDir).root;
    while (true) {
        const configPath = resolve(currentDir, CONFIG_FILENAME);
        try {
            // Check if file exists and is readable without loading content yet
            accessSync(configPath, constants.R_OK);
            return configPath;
        }
        catch (error) {
            const code = error.code;
            if (code !== 'ENOENT') {
                throw error;
            }
        }
        if (currentDir === root) {
            break;
        }
        currentDir = dirname(currentDir);
    }
    return null;
}
/**
 * Loads and parses .templjs.json config file
 */
function loadConfigFile(configPath) {
    try {
        const content = readFileSync(configPath, 'utf-8');
        const rawConfig = JSON.parse(content);
        const config = resolveEnvPlaceholders(rawConfig);
        assertValidConfig(config, 'file validation failed');
        return config;
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in ${configPath}: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
/**
 * Merges config file with CLI flags (CLI flags take precedence)
 */
function mergeConfigs(configFile, cliFlags) {
    const merged = { ...configFile };
    // CLI flags override config file values (only override if explicitly provided)
    if (cliFlags.inputFormat !== undefined && typeof cliFlags.inputFormat === 'string') {
        merged.inputFormat = cliFlags.inputFormat;
    }
    if (cliFlags.outputFormat !== undefined && typeof cliFlags.outputFormat === 'string') {
        merged.outputFormat = cliFlags.outputFormat;
    }
    if (cliFlags.defaultTemplate !== undefined && typeof cliFlags.defaultTemplate === 'string') {
        merged.defaultTemplate = cliFlags.defaultTemplate;
    }
    if (cliFlags.defaultOutput !== undefined && typeof cliFlags.defaultOutput === 'string') {
        merged.defaultOutput = cliFlags.defaultOutput;
    }
    if (cliFlags.templateDelimiters !== undefined &&
        cliFlags.templateDelimiters !== null &&
        typeof cliFlags.templateDelimiters === 'object') {
        merged.templateDelimiters = cliFlags.templateDelimiters;
    }
    if (cliFlags.validation !== undefined &&
        cliFlags.validation !== null &&
        typeof cliFlags.validation === 'object') {
        merged.validation = cliFlags.validation;
    }
    return merged;
}
/**
 * Loads CLI config with full discovery, validation, and merging
 */
export function loadConfig(cliFlags = {}) {
    const configPath = findConfigFile();
    if (!configPath) {
        // No config file found, return empty config with CLI flags only
        const merged = mergeConfigs({}, cliFlags);
        assertValidConfig(merged, 'CLI flag overrides are invalid');
        return merged;
    }
    try {
        const configFile = loadConfigFile(configPath);
        const merged = mergeConfigs(configFile, cliFlags);
        assertValidConfig(merged, 'merged config is invalid');
        return {
            ...merged,
            configPath,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load .templjs.json: ${message}`, { cause: error });
    }
}
export function applyConfig(options, config) {
    const result = { ...options };
    const optionValues = options;
    // Apply config defaults only if CLI option was not provided
    if (config.defaultTemplate !== undefined && optionValues.template === undefined) {
        result.template = config.defaultTemplate;
    }
    if (config.defaultOutput !== undefined && optionValues.output === undefined) {
        result.output = config.defaultOutput;
    }
    if (config.inputFormat !== undefined && optionValues.inputFormat === undefined) {
        result.inputFormat = config.inputFormat;
    }
    if (config.outputFormat !== undefined && optionValues.outputFormat === undefined) {
        result.outputFormat = config.outputFormat;
    }
    // Validation config
    if (config.validation) {
        if (config.validation.validateInput !== undefined && optionValues.validateInput === undefined) {
            result.validateInput = config.validation.validateInput;
        }
        if (config.validation.validateOutput !== undefined &&
            optionValues.validateOutput === undefined) {
            result.validateOutput = config.validation.validateOutput;
        }
        if (config.validation.schemaPath !== undefined && optionValues.schema === undefined) {
            result.schema = config.validation.schemaPath;
        }
    }
    return result;
}
//# sourceMappingURL=loader.js.map