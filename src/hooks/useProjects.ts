import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../api/ProjectService';
import type { AddProjectDto, UpdateProjectDto } from '../Types/Dto/ProjectDto';

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: projectService.fetchProjects,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAddProject() {
    const queryClient = useQueryClient();   
    return useMutation({
        mutationFn: (project: AddProjectDto) => projectService.addProject(project),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}   

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (project: UpdateProjectDto) => projectService.updateProject(project),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    }); 
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: number; title: string }) => projectService.deleteProject(data.id, data.title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}