/**
 * Trọ Việt - AI Natural Language Search Evaluation Suite
 * Evaluates real-world student and tenant queries in Da Nang.
 */
export interface AIEvalTestCase {
    query: string;
    expectedPropertyType?: string;
    expectedMaxRent?: number;
    expectedMinRent?: number;
    expectedWardCode?: string;
    expectedAmenities?: string[];
}
export declare const AI_SEARCH_EVAL_CASES: AIEvalTestCase[];
export declare function runAISearchEval(): {
    total: number;
    passed: number;
    accuracyRate: number;
    failures: Array<{
        query: string;
        reason: string;
    }>;
};
