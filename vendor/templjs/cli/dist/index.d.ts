/**
 * @templjs/cli - Command-line interface for templjs
 *
 * Provides command-line tools for processing templates,
 * validating syntax, and generating output files.
 */
export declare const version: string;
/**
 * Process a template with data
 * @param template - Template string to process
 * @param data - Data for rendering
 * @returns Rendered template output
 */
export declare function processTemplate(template: string, data: Record<string, unknown>): string;
/**
 * Validate template syntax
 * @param template - Template string to validate
 * @returns Whether the template is valid
 */
export declare function validateTemplate(template: string): boolean;
declare const _default: {
    version: string;
    processTemplate: typeof processTemplate;
    validateTemplate: typeof validateTemplate;
};
export default _default;
