import type ProjectType from "../Types/ProjectType";
import type { AddProjectDto, UpdateProjectDto } from "../Types/Dto/ProjectDto";

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
    addProject: async (project: AddProjectDto): Promise<boolean> => {
        const response = await fetch('/api/add-project', {
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(project)
        });
        responseAction(response);
        return true;
    },
    updateProject: async (project: UpdateProjectDto): Promise<boolean> => {
        const response = await fetch(`/api/update-project`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        method: 'PUT',
        body: JSON.stringify(project)
        });
        responseAction(response);
        return true;
    },
    deleteProject: async (id: number, title: string): Promise<boolean> => {
        const prompt = window.confirm(`Är du säker på att du vill ta bort projektet ${title}? Detta kan inte ångras.`);
        if (!prompt) return false;
        const response = await fetch(`/api/delete-project/${id}`, {
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