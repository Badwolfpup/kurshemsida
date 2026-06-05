import { useQuery } from '@tanstack/react-query';
import { projectService } from '../api/ProjectService';

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: projectService.fetchProjects,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
