import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '../api/ExerciseService';

/** SCENARIO: Student views their AI-generated project history on the Sparade tab */
export function useProjectHistory() {
    return useQuery({
        queryKey: ['projectHistory'],
        queryFn: exerciseService.fetchProjectHistory,
        staleTime: 5 * 60 * 1000,
    });
}
