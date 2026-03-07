import type ExerciseType from "../Types/ExerciseType";
import type { AddExerciseDto, UpdateExerciseDto } from "../Types/Dto/ExerciseDto";

export interface ExerciseHistoryItem {
    id: number;
    topic: string;
    language: string;
    difficulty: number;
    title: string;
    description: string;
    example: string | null;
    assumptions: string | null;
    functionSignature: string | null;
    solution: string | null;
    asserts: string | null;
    isCompleted: boolean;
    createdAt: string;
}

export interface ProjectHistoryItem {
    id: number;
    techStack: string;
    difficulty: number;
    title: string;
    description: string;
    learningGoals: string | null;
    userStories: string | null;
    designSpecs: string | null;
    assetsNeeded: string | null;
    starterHtml: string | null;
    bonusChallenges: string | null;
    solutionHtml: string | null;
    solutionCss: string | null;
    solutionJs: string | null;
    isCompleted: boolean;
    createdAt: string;
}

export function computeLightbulbs(difficulty: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < difficulty);
}

export const exerciseService = {
    async fetchExerciseHistory(): Promise<ExerciseHistoryItem[]> {
        const response = await fetch('/api/exercise-history', { credentials: 'include' });
        responseAction(response);
        return await response.json() as ExerciseHistoryItem[];
    },
    async fetchProjectHistory(): Promise<ProjectHistoryItem[]> {
        const response = await fetch('/api/project-history', { credentials: 'include' });
        responseAction(response);
        return await response.json() as ProjectHistoryItem[];
    },
    async fetchExercises(): Promise<ExerciseType[]> {

        const response = await fetch('/api/fetch-exercises', {
            credentials: 'include',
        });
        responseAction(response);
        const data = await response.json() as ExerciseType[];
        data.forEach(proj => {
            proj.lightbulbs = computeLightbulbs(proj.difficulty);
        });
        return data;
    },
    async addExercise(exercise: AddExerciseDto): Promise<boolean> {
        const response = await fetch('/api/add-exercise', {
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(exercise)
        });
        responseAction(response);
        return true;
    },
    async updateExercise(exercise: UpdateExerciseDto): Promise<boolean> {
        const response = await fetch(`/api/update-exercise`, {
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(exercise)
        });
        responseAction(response);
        return true;
    },
    async deleteExercise(id: number, title: string): Promise<boolean> {
        const prompt = window.confirm(`Är du säker på att du vill ta bort övningen ${title}? Detta kan inte ångras.`);
        if (!prompt) return false;
        
        const response = await fetch(`/api/delete-exercise/${id}`, {
            credentials: 'include',
            method: 'DELETE'
        });
        responseAction(response);
        return true;
    }
}

const responseAction = (response: Response): void => {
    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized. Redirecting to login.');
    }
    else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}