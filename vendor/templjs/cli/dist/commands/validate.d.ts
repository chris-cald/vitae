/**
 * @templjs/cli - validate command
 * Validates template syntax and optionally validates input data against a schema
 */
export declare function clearSharedSchemaValidatorCache(): void;
export interface ValidateCommandResult {
    valid: boolean;
    errors: string[];
}
export declare function validateCommand(templatePath: string, schemaPath?: string, inputPath?: string): Promise<ValidateCommandResult>;
