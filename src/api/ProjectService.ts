import type ProjectType from "../Types/ProjectType";

export function computeLightbulbs(difficulty: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < difficulty);
}

export const projectService = {
    fetchProjects: async (): Promise<ProjectType[]> => {
        const response = await fetch('/api/fetch-projects', {
            credentials: 'include',
        });
        responseAction(response);
        const data = await response.json() as ProjectType[];
        data.forEach(proj => {
            proj.lightbulbs = computeLightbulbs(proj.difficulty);
        });
        return data;

    },

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