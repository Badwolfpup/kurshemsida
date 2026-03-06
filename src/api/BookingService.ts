// kurshemsida/src/api/BookingService.ts
export const API_URL = '/api/admin-availability';
const NEW_API = '/api';

export interface Availability {
  id: number;
  adminId: number;
  adminName?: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface Booking {
  id: number;
  adminId: number;
  adminAvailabilityId: number | null;
  coachId: number | null;
  studentId: number | null;
  startTime: string;
  endTime: string;
  bookedAt: string;
  note: string;
  meetingType: string;
  status: string;
  reason?: string;
  seen?: boolean;
  rescheduledBy?: string;
}

// ── New consolidated API functions ──

export interface CreateBookingData {
  adminAvailabilityId?: number | null;
  adminId?: number | null;
  coachId?: number | null;
  studentId?: number | null;
  note?: string;
  meetingType?: string;
  startTime: string;
  endTime: string;
  force?: boolean;
}

/** Unified booking creation via new POST /api/bookings */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const res = await fetch(`${NEW_API}/bookings`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 409) {
    const parsed = await res.json();
    const err = new Error('conflict') as BookingConflictError;
    err.conflictData = parsed;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Booking creation failed (${res.status})`);
  }
  return res.json();
}

/** Role-filtered bookings via new GET /api/bookings */
export async function getBookingsNew(): Promise<Booking[]> {
  const res = await fetch(`${NEW_API}/bookings`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch bookings (${res.status})`);
  return res.json();
}

/** Role-filtered availabilities via new GET /api/availability */
export async function getAvailabilitiesNew(): Promise<Availability[]> {
  const res = await fetch(`${NEW_API}/availability`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch availabilities (${res.status})`);
  return res.json();
}

/** Update booking status via new PUT /api/bookings/{id}/status */
export async function updateBookingStatusNew(id: number, status: string, reason?: string): Promise<Booking> {
  const res = await fetch(`${NEW_API}/bookings/${id}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason: reason ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Status update failed (${res.status})`);
  }
  return res.json();
}

/** Cancel booking via new PUT /api/bookings/{id}/cancel */
export async function cancelBookingNew(id: number, reason?: string): Promise<Booking> {
  const res = await fetch(`${NEW_API}/bookings/${id}/cancel`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'declined', reason: reason ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Cancel failed (${res.status})`);
  }
  return res.json();
}

/** Reschedule booking via new PUT /api/bookings/{id}/reschedule */
export async function rescheduleBookingNew(id: number, startTime: string, endTime: string, reason?: string, rescheduledBy?: string): Promise<Booking> {
  const res = await fetch(`${NEW_API}/bookings/${id}/reschedule`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, startTime, endTime, reason: reason ?? '', rescheduledBy: rescheduledBy ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Reschedule failed (${res.status})`);
  }
  return res.json();
}

/** Add availability via new POST /api/availability */
export async function addAvailabilityNew(data: { adminId: number; startTime: Date | string; endTime: Date | string }): Promise<Availability> {
  const res = await fetch(`${NEW_API}/availability`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminId: data.adminId,
      startTime: toLocalIso(data.startTime),
      endTime: toLocalIso(data.endTime),
    }),
  });
  if (!res.ok) throw new Error(`Failed to add availability (${res.status})`);
  return res.json();
}

/** Update availability via new PUT /api/availability/{id} */
export async function updateAvailabilityNew(id: number, data: { startTime: string; endTime: string; isBooked: boolean }): Promise<Availability> {
  const res = await fetch(`${NEW_API}/availability/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update availability (${res.status})`);
  return res.json();
}

/** Delete availability via new DELETE /api/availability/{id} */
export async function deleteAvailabilityNew(id: number): Promise<void> {
  const res = await fetch(`${NEW_API}/availability/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed (${res.status})`);
  }
}

export function toLocalIso(d: Date | string): string {
  if (typeof d === 'string') return d;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export interface BookingConflictError extends Error {
  conflictData: { type: 'conflict' | 'warning'; bookings: Booking[] };
}

