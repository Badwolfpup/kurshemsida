import type ProjectType from "../Types/ProjectType";
import type { AddProjectDto, UpdateProjectDto } from "../Types/Dto/ProjectDto";

export const projectService = {
    fetchProjects: async (): Promise<ProjectType[]> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch('/api/fetch-projects', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as ProjectType[];
        data.forEach(proj => {
            proj.lightbulbs = Array(5).fill(false).map((_, i) => i < proj.difficulty);
        });
        return data;
        
    },
    addProject: async (project: AddProjectDto): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch('/api/add-project', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(project)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    },
    updateProject: async (project: UpdateProjectDto): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`/api/update-project`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(project)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    },
    deleteProject: async (id: number, title: string): Promise<boolean> => {
        const prompt = window.confirm(`Är du säker på att du vill ta bort projektet ${title}? Detta kan inte ångras.`);
        if (!prompt) return false;
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        const response = await fetch(`/api/delete-project/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    }

}