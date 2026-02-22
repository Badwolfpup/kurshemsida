import type AssertExerciseType from "../Types/AssertExerciseType.ts";
import type { AssertExerciseResponse } from "../Types/AssertExerciseType.ts";
import type AssertProjectType from "../Types/AssertProjectType.ts";
import type { AssertProjectResponse } from "../Types/AssertProjectType.ts";


export const assertService = {

    fetchExerciseAssert: async (assert: AssertExerciseType, model:string = 'anthropic', timeoutMs: number = 90000): Promise<AssertExerciseResponse | null>  => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(`/api/${model}/exercise-asserts`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assert),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await response.json() as AssertExerciseResponse;
            if (!data.success) {
                throw new Error(`Assert failed: ${data.error}`);
            }
            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Begäran tog för lång tid och avbröts. Försök igen.');
            }
            console.error('Error fetching assert:', error);
            throw error;
        }
    },
    fetchProjectAssert: async (assert: AssertProjectType, model:string = 'anthropic', timeoutMs: number = 90000): Promise<AssertProjectResponse | null>  => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            console.log('Sending to backend:', assert);
            const response = await fetch(`/api/${model}/project-asserts`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assert),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const data = await response.json() as AssertProjectResponse;
            if (!data.success) {
                throw new Error(`Assert failed: ${data.error}`);
            }
            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Begäran tog för lång tid och avbröts. Försök igen.');
            }
            console.error('Error fetching project:', error);
            throw error;
        }
    },
    submitExerciseFeedback: async (data: {
        topic: string;
        language: string;
        difficulty: number;
        title: string;
        description: string;
        solution?: string;
        asserts?: string;
        isCompleted: boolean;
        isPositive?: boolean;
        feedbackReason?: string;
        feedbackComment?: string;
    }) => {
        const response = await fetch('/api/exercise-feedback', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to submit feedback');
    },
}



