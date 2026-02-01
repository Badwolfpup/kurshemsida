export interface AddExerciseDto {
    title: string;
    description: string;
    javascript: string;
    expectedResult: string;
    difficulty: number;
    clues?: string[];
    exerciseType: string;
    goodToKnow: string;
}

export interface UpdateExerciseDto {
    id: number;
    title?: string;
    description?: string;
    javascript?: string;
    expectedResult?: string;
    difficulty?: number;
    clues?: string[];
    exerciseType?: string;
    goodToKnow?: string;
}