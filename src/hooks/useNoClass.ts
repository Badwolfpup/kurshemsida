import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noClassService } from '../api/NoClassService';

export function useNoClasses() {
    return useQuery({
        queryKey: ['noClasses'],
        queryFn: noClassService.fetchNoClasses,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useUpdateNoClasses() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (date: string) => noClassService.updateNoClasses(date),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['noClasses'] });
        },
    });
}