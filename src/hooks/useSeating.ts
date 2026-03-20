import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeatingAssignments, assignSeat, clearSeat } from '@/api/SeatingService';

export function useSeatingAssignments(classroomId: number, dayOfWeek: number) {
  return useQuery({
    queryKey: ['seating', classroomId, dayOfWeek],
    queryFn: () => getSeatingAssignments(classroomId, dayOfWeek),
    staleTime: 30_000,
  });
}

export function useAssignSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignSeat,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seating'] });
    },
  });
}

export function useClearSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearSeat,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seating'] });
    },
  });
}
