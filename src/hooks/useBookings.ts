import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  getAvailabilities,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  transferBooking,
  addAvailability,
  updateAvailability,
  deleteAvailability,
  getBusyTimes,
  addBusyTime,
  updateBusyTime,
  deleteBusyTime,
  type CreateBookingData,
} from '@/api/BookingService';
import type { BookingActor, BookingStatus } from '@/Types/CalendarTypes';

/** SCENARIO: Authenticated user fetches bookings. Admin sees all; Coach sees own + masked others' accepted. */
export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
    staleTime: 30_000,
  });
}

/** SCENARIO: Authenticated user fetches availability overlays (decorative). */
export function useAvailabilities() {
  return useQuery({
    queryKey: ['availabilities'],
    queryFn: getAvailabilities,
    staleTime: 30_000,
  });
}

/**
 * SCENARIO: Admin/Teacher or Coach creates a booking as a Pending suggestion (non-creator approves).
 * CALLS: POST /api/bookings (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates Booking with Status = Pending (backend)
 *   - Sends email notification via BookingNotifier (backend, EmailService)
 *   - Throws BookingConflictError on 409 (overlap with Accepted booking)
 *   - Invalidates ["bookings"] cache
 */
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingData) => createBooking(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher or Coach responds to a pending booking — accept or decline.
 * CALLS: PUT /api/bookings/{id}/status (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Sets booking Status + Reason (backend)
 *   - Sends email via BookingNotifier (backend, EmailService)
 *   - Invalidates ["bookings"] cache
 */
export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: BookingStatus; reason?: string }) =>
      updateBookingStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Cancel a booking — sets Status = Declined. Admin any, Coach own.
 * CALLS: PUT /api/bookings/{id}/cancel (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Sets booking Status = Declined (backend)
 *   - Sends email via BookingNotifier (backend, EmailService)
 *   - Invalidates ["bookings"] cache
 */
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      cancelBooking(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Reschedule a booking — new times, status flips to Pending for re-approval.
 * CALLS: PUT /api/bookings/{id}/reschedule (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates StartTime, EndTime, Reason; sets Status = Pending, RescheduledBy (backend)
 *   - Sends email via BookingNotifier (backend, EmailService)
 *   - Invalidates ["bookings"] cache
 */
export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, startTime, endTime, rescheduledBy, reason }: {
      id: number; startTime: string; endTime: string; rescheduledBy: BookingActor; reason?: string;
    }) => rescheduleBooking(id, startTime, endTime, rescheduledBy, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher transfers a booking to another teacher.
 * CALLS: PUT /api/bookings/{id}/transfer (BookingEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates booking.AdminId to targetAdminId (backend)
 *   - If booking was Pending, sets Status = Accepted (backend)
 *   - Sends email via BookingNotifier.NotifyTransferred (backend, EmailService)
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
 * SCENARIO: Admin/Teacher adds a decorative availability overlay.
 * CALLS: POST /api/availability (AvailabilityEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates AdminAvailability record (backend)
 *   - Invalidates ["availabilities"] cache
 */
export function useAddAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { adminId: number; startTime: Date | string; endTime: Date | string }) =>
      addAvailability(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher updates an availability overlay's time window.
 * CALLS: PUT /api/availability/{id} (AvailabilityEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates StartTime, EndTime on AdminAvailability (backend)
 *   - Invalidates ["availabilities"] cache
 */
export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; startTime: string; endTime: string }) =>
      updateAvailability(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher deletes an availability overlay. Bookings are unaffected (independent).
 * CALLS: DELETE /api/availability/{id} (AvailabilityEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes AdminAvailability record (backend)
 *   - Invalidates ["availabilities"] cache
 */
export function useDeleteAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAvailability(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
}

// ── Busy Time hooks ──

/** SCENARIO: Any authenticated user fetches all busy time blocks. */
export function useBusyTimes() {
  return useQuery({
    queryKey: ['busyTimes'],
    queryFn: getBusyTimes,
    staleTime: 30_000,
  });
}

/**
 * SCENARIO: Admin/Teacher creates a busy time block. No conflict checks — admin resolves overlaps visually.
 * CALLS: POST /api/busy-time (BusyTimeEndpoints.cs)
 * SIDE EFFECTS:
 *   - Creates BusyTime record (backend)
 *   - Invalidates ["busyTimes"] cache
 */
export function useAddBusyTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { adminId: number; startTime: Date | string; endTime: Date | string; note?: string }) =>
      addBusyTime(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['busyTimes'] });
    },
  });
}

/**
 * SCENARIO: Admin/Teacher updates a busy time block's time or note. No conflict checks.
 * CALLS: PUT /api/busy-time/{id} (BusyTimeEndpoints.cs)
 * SIDE EFFECTS:
 *   - Updates StartTime, EndTime, Note on BusyTime (backend)
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
 * SCENARIO: Admin/Teacher deletes a busy time block.
 * CALLS: DELETE /api/busy-time/{id} (BusyTimeEndpoints.cs)
 * SIDE EFFECTS:
 *   - Removes BusyTime record (backend)
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
