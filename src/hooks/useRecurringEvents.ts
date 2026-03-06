import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecurringEventInstances,
  createRecurringEvent,
  updateRecurringEvent,
  deleteRecurringEvent,
  setRecurringEventException,
  removeRecurringEventException,
  type CreateRecurringEventData,
  type UpdateRecurringEventData,
  type RecurringEventExceptionData,
} from '@/api/RecurringEventService';

/** SCENARIO: Any authenticated user fetches recurring event instances for a date range (NoClass days filtered out) */
export function useRecurringEvents(from: Date, to: Date) {
  return useQuery({
    queryKey: ['recurringEvents', from.toISOString(), to.toISOString()],
    queryFn: () => getRecurringEventInstances(from, to),
    staleTime: 60_000,
  });
}

/**
 * SCENARIO: Admin/Teacher creates a recurring event (optional adminId override for assigning another teacher)
 * CALLS: POST /api/recurring-events (RecurringEventEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates RecurringEvent record with AdminId = dto.adminId ?? JWT user (backend)
 *   - Invalidates ["recurringEvents"] cache
 */
export function useCreateRecurringEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringEventData) => createRecurringEvent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringEvents'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher updates a recurring event definition (Admin=all, Teacher=own)
 * CALLS: PUT /api/recurring-events/{id} (RecurringEventEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates RecurringEvent fields (backend)
 *   - Invalidates ["recurringEvents"] cache
 */
export function useUpdateRecurringEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRecurringEventData & { id: number }) =>
      updateRecurringEvent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringEvents'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher deletes a recurring event and all its exceptions (cascade)
 * CALLS: DELETE /api/recurring-events/{id} (RecurringEventEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes RecurringEvent + all RecurringEventException records (cascade, backend)
 *   - Invalidates ["recurringEvents"] cache
 */
export function useDeleteRecurringEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecurringEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringEvents'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher creates or updates a single-instance exception for a recurring event
 * CALLS: PUT /api/recurring-events/{id}/exceptions/{date} (RecurringEventEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates or updates RecurringEventException for the given event + date (backend)
 *   - Invalidates ["recurringEvents"] cache
 */
export function useSetRecurringEventException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, ...data }: RecurringEventExceptionData & { id: number; date: string }) =>
      setRecurringEventException(id, date, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringEvents'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher removes a single-instance exception (restores original occurrence)
 * CALLS: DELETE /api/recurring-events/{id}/exceptions/{date} (RecurringEventEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes RecurringEventException for the given event + date (backend)
 *   - Invalidates ["recurringEvents"] cache
 */
export function useRemoveRecurringEventException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) =>
      removeRecurringEventException(id, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurringEvents'] });
    },
  });
}
