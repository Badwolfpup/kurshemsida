export default interface AssertExerciseType {
    topic: string;
    language: string;
    difficulty: number;
}

export interface AssertExerciseResponse {
    success: boolean;
    title?: string;
    description?: string;
    example?: string;
    assumptions?: string;
    functionSignature?: string;
    solution?: string;
    asserts?: AssertExerciseItem[];
    error?: string | null;
}

export type AssertExerciseItem= {
    comment: string;
    code: string;
}