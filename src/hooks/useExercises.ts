import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '../api/ExerciseService';
import type { AddExerciseDto, UpdateExerciseDto } from '../Types/Dto/ExerciseDto';

export function useExercises() {
    return useQuery({
        queryKey: ['exercises'],
        queryFn: exerciseService.fetchExercises,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAddExercise() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (exercise: AddExerciseDto) => exerciseService.addExercise(exercise),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });
}

export function useUpdateExercise() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (exercise: UpdateExerciseDto) => exerciseService.updateExercise(exercise),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });
}
export function useDeleteExercise() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: number; title: string }) => exerciseService.deleteExercise(data.id, data.title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        }
    });
}