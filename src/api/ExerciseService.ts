import type ExerciseType from "../Types/ExerciseType";
import type { AddExerciseDto, UpdateExerciseDto } from "../Types/Dto/ExerciseDto";

export const exerciseService = {
    async fetchExercises(): Promise<ExerciseType[]> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch('/api/fetch-exercises', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as ExerciseType[];
        data.forEach(proj => {
            proj.lightbulbs = Array(5).fill(false).map((_, i) => i < proj.difficulty);
        });
        return data;
    },
    async addExercise(exercise: AddExerciseDto): Promise<boolean> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch('/api/add-exercise', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(exercise)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    },
    async updateExercise(exercise: UpdateExerciseDto): Promise<boolean> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`/api/update-exercise`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(exercise)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    },
    async deleteExercise(id: number, title: string): Promise<boolean> {
        const prompt = window.confirm(`Är du säker på att du vill ta bort övningen ${title}? Detta kan inte ångras.`);
        if (!prompt) return false;
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`/api/delete-exercise/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;;
    }
}