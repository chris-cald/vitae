/**
 * JSON Schema for .templjs.json configuration files
 */
export declare const CLI_CONFIG_SCHEMA: {
    $schema: string;
    title: string;
    description: string;
    type: string;
    properties: {
        inputFormat: {
            type: string;
            enum: string[];
            description: string;
        };
        outputFormat: {
            type: string;
            enum: string[];
            description: string;
        };
        defaultTemplate: {
            type: string;
            description: string;
        };
        defaultOutput: {
            type: string;
            description: string;
        };
        templateDelimiters: {
            type: string;
            properties: {
                statement_start: {
                    type: string;
                };
                statement_end: {
                    type: string;
                };
                expression_start: {
                    type: string;
                };
                expression_end: {
                    type: string;
                };
            };
            additionalProperties: boolean;
            description: string;
        };
        validation: {
            type: string;
            properties: {
                validateInput: {
                    type: string;
                };
                validateOutput: {
                    type: string;
                };
                schemaPath: {
                    type: string;
                };
            };
            additionalProperties: boolean;
            description: string;
        };
    };
    additionalProperties: boolean;
};
