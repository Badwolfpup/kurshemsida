import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '../api/ExerciseService';

/** SCENARIO: Student views their AI-generated exercise history on the Sparade tab */
export function useExerciseHistory() {
    return useQuery({
        queryKey: ['exerciseHistory'],
        queryFn: exerciseService.fetchExerciseHistory,
        staleTime: 5 * 60 * 1000,
    });
}
