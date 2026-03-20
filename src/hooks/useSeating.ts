import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSeatingAssignments, assignSeat, clearSeat } from '@/api/SeatingService';

/** SCENARIO: Admin/Teacher fetches seating assignments for a classroom and day */
export function useSeatingAssignments(classroomId: number, dayOfWeek: number) {
  return useQuery({
    queryKey: ['seating', classroomId, dayOfWeek],
    queryFn: () => getSeatingAssignments(classroomId, dayOfWeek),
    staleTime: 30_000,
  });
}

/**
 * SCENARIO: Admin/Teacher assigns a student to a seat (upsert)
 * CALLS: PUT /api/seating/assign (SeatingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates or updates SeatingAssignment record (backend)
 *   - Invalidates ["seating"] cache
 */
export function useAssignSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignSeat,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seating'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher removes a student from a seat
 * CALLS: DELETE /api/seating/clear (SeatingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes SeatingAssignment record (backend)
 *   - Invalidates ["seating"] cache
 */
export function useClearSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearSeat,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seating'] });
    },
  });
}
