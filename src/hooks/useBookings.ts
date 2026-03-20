import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookingsNew,
  getAvailabilitiesNew,
  createBooking,
  updateBookingStatusNew,
  cancelBookingNew,
  rescheduleBookingNew,
  transferBooking,
  addAvailabilityNew,
  updateAvailabilityNew,
  deleteAvailabilityNew,
  getBusyTimes,
  addBusyTime,
  updateBusyTime,
  deleteBusyTime,
  type CreateBookingData,
} from '@/api/BookingService';

/** SCENARIO: Any authenticated user fetches bookings; admin=all, coach=own, student=own */
export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getBookingsNew,
    staleTime: 30_000,
  });
}

/** SCENARIO: Any authenticated user fetches availability slots; admin/teacher=all, coach/student=unbooked */
export function useAvailabilities() {
  return useQuery({
    queryKey: ['availabilities'],
    queryFn: getAvailabilitiesNew,
    staleTime: 30_000,
  });
}

/**
 * SCENARIO: Create a booking — role-detected from JWT (admin=pending appointment, coach=slot booking or suggestion, student=pending with admin)
 * CALLS: POST /api/bookings (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates Booking record (backend)
 *   - Marks AdminAvailability.IsBooked = true if fully booked (backend)
 *   - Sends email notification via BookingNotifier (backend, EmailService)
 *   - Returns 409 on conflict (hard) or warning (soft, Force=true bypasses)
 *   - Invalidates ["bookings"] and ["availabilities"] cache
 */
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingData) => createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Accept or decline a booking — admin/teacher=any, coach=own pending/rescheduled, student=own pending/rescheduled
 * CALLS: PUT /api/bookings/{id}/status (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Sets booking Status + Reason (backend)
 *   - If declining: re-evaluates parent availability IsBooked (backend)
 *   - Sends email via BookingNotifier (backend, EmailService)
 *   - Invalidates ["bookings"] and ["availabilities"] cache
 */
export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: string; reason?: string }) =>
      updateBookingStatusNew(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Cancel a booking — sets status to declined. Admin=any, coach=own, student=own
 * CALLS: PUT /api/bookings/{id}/cancel (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Sets booking Status = "declined" (backend)
 *   - Re-evaluates parent availability IsBooked (backend)
 *   - Sends email via BookingNotifier — student cancel followup notifies admin + coach (backend, EmailService)
 *   - Invalidates ["bookings"] and ["availabilities"] cache
 */
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      cancelBookingNew(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Reschedule a booking — sets new times, status=rescheduled
 * CALLS: PUT /api/bookings/{id}/reschedule (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates StartTime, EndTime, Reason, Status=rescheduled, RescheduledBy (backend)
 *   - Sends email via BookingNotifier (backend, EmailService)
 *   - Invalidates ["bookings"] cache
 */
export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, startTime, endTime, reason, rescheduledBy }: {
      id: number; startTime: string; endTime: string; reason?: string; rescheduledBy?: string;
    }) => rescheduleBookingNew(id, startTime, endTime, reason, rescheduledBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Transfer a booking to another teacher — admin/teacher only
 * CALLS: PUT /api/bookings/{id}/transfer (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates booking.AdminId to targetAdminId (backend)
 *   - If booking was pending, sets status to "accepted" (backend)
 *   - Sends transfer notification email via BookingNotifier.NotifyTransferred (backend, EmailService)
 *   - Invalidates ["bookings"] cache
 */
export function useTransferBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetAdminId, reason }: { id: number; targetAdminId: number; reason?: string }) =>
      transferBooking(id, targetAdminId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher adds an availability slot; adjacent unbooked slots are merged
 * CALLS: POST /api/availability (AvailabilityEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates AdminAvailability record, merging with adjacent unbooked slots (backend)
 *   - Invalidates ["availabilities"] cache
 */
export function useAddAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { adminId: number; startTime: Date | string; endTime: Date | string }) =>
      addAvailabilityNew(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher updates an availability slot's time or booked status
 * CALLS: PUT /api/availability/{id} (AvailabilityEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates StartTime, EndTime, IsBooked on AdminAvailability (backend)
 *   - Invalidates ["availabilities"] cache
 */
export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; startTime: string; endTime: string; isBooked: boolean }) =>
      updateAvailabilityNew(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher deletes an availability slot; linked bookings remain orphaned
 * CALLS: DELETE /api/availability/{id} (AvailabilityEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes AdminAvailability record; linked Booking.AdminAvailabilityId set to null (cascade, backend)
 *   - Invalidates ["availabilities"] cache
 */
export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAvailabilityNew(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

// ── Busy Time hooks ──

/** SCENARIO: Any authenticated user fetches all busy time blocks */
export function useBusyTimes() {
  return useQuery({
    queryKey: ['busyTimes'],
    queryFn: getBusyTimes,
    staleTime: 30_000,
  });
}

/**
 * SCENARIO: Admin/Teacher creates a busy time block; overlapping availability is trimmed/split, overlapping bookings require confirmation
 * CALLS: POST /api/busy-time (BusyTimeEndpoints.cs)
 * SIDE EFFECTS:
 *   - Returns 409 {type:"confirm", bookings} if non-declined bookings overlap (unless force=true)
 *   - With force=true: cancels overlapping bookings, trims/splits availability (backend)
 *   - Creates BusyTime record (backend)
 *   - Invalidates ["busyTimes"], ["availabilities"], ["bookings"] cache
 */
export function useAddBusyTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { adminId: number; startTime: Date | string; endTime: Date | string; note?: string; force?: boolean }) =>
      addBusyTime(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['busyTimes'] });
      qc.invalidateQueries({ queryKey: ['availabilities'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher updates a busy time block's time or note; rejects if overlapping bookings exist
 * CALLS: PUT /api/busy-time/{id} (BusyTimeEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates StartTime, EndTime, Note on BusyTime (backend)
 *   - Returns 409 if new time range overlaps non-declined bookings
 *   - Invalidates ["busyTimes"] cache
 */
export function useUpdateBusyTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; startTime: string; endTime: string; note?: string | null }) =>
      updateBusyTime(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['busyTimes'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher deletes a busy time block
 * CALLS: DELETE /api/busy-time/{id} (BusyTimeEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes the BusyTime record (backend)
 *   - Invalidates ["busyTimes"] cache
 */
export function useDeleteBusyTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBusyTime(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['busyTimes'] });
    },
  });
}
