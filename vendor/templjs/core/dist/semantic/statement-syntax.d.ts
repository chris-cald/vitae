export interface TemplateStatementSyntaxValidationResult {
    valid: boolean;
    message?: string;
    suggestion?: string;
}
export interface TemplateForHeader {
    aliasName: string;
    aliasStart: number;
    aliasEnd: number;
    valueAliasName?: string;
    iterableExpression: string;
    iterableStart: number;
}
export interface TemplateStatementExpression {
    expression: string;
    startOffset: number;
}
export declare function parseTemplateForHeader(statementContent: string): TemplateForHeader | null;
export declare function extractTemplateStatementExpression(statementContent: string): TemplateStatementExpression | null;
export declare function validateTemplateStatementSyntax(tag: string, statementContent: string): TemplateStatementSyntaxValidationResult;
