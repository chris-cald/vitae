export interface ExpressionVariableReference {
    path: string;
    start: number;
    end: number;
}
export interface ExpressionFilterReference {
    name: string;
    start: number;
    end: number;
}
export declare function extractExpressionVariableReferences(content: string): ExpressionVariableReference[];
export declare function extractExpressionFilterReferences(content: string): ExpressionFilterReference[];
