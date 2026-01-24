export interface AddExerciseDto {
    title: string;
    description: string;
    javascript: string;
    expectedResult: string;
    difficulty: number;
    tags?: string[];
    clues?: string[];
}

export interface UpdateExerciseDto {
    id: number;
    title?: string;
    description?: string;
    javascript?: string;
    expectedResult?: string;
    difficulty?: number;
    tags?: string[];
    clues?: string[];
}