import type { BookingActor, BookingStatus, MeetingType } from '@/Types/CalendarTypes';

const API = '/api';

export interface Availability {
  id: number;
  adminId: number;
  adminName?: string;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: number;
  adminId: number;
  coachId: number | null;
  studentId: number | null;
  startTime: string;
  endTime: string;
  bookedAt: string;
  note: string;
  meetingType: MeetingType;
  status: BookingStatus;
  reason?: string;
  seen?: boolean;
  rescheduledBy?: BookingActor | null;
  createdByRole?: BookingActor;
}

export interface CreateBookingData {
  adminId?: number | null;
  coachId?: number | null;
  studentId?: number | null;
  note?: string;
  meetingType: MeetingType;
  startTime: string;
  endTime: string;
}

export interface BookingConflictError extends Error {
  bookings: Booking[];
}

/** POST /api/bookings — creates Pending suggestion. 409 only on Accepted overlap (B1). */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 409) {
    const parsed = await res.json().catch(() => ({}));
    const err = new Error('Tiden är redan bokad.') as BookingConflictError;
    err.bookings = parsed.bookings ?? [];
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Booking creation failed (${res.status})`);
  }
  return res.json();
}

export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${API}/bookings`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch bookings (${res.status})`);
  return res.json();
}

export async function getAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API}/availability`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch availabilities (${res.status})`);
  return res.json();
}

export async function updateBookingStatus(id: number, status: BookingStatus, reason?: string): Promise<Booking> {
  const res = await fetch(`${API}/bookings/${id}/status`, {
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

export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const res = await fetch(`${API}/bookings/${id}/cancel`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Declined', reason: reason ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Cancel failed (${res.status})`);
  }
  return res.json();
}

export async function rescheduleBooking(
  id: number,
  startTime: string,
  endTime: string,
  rescheduledBy: BookingActor,
  reason?: string,
): Promise<Booking> {
  const res = await fetch(`${API}/bookings/${id}/reschedule`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, startTime, endTime, rescheduledBy, reason: reason ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Reschedule failed (${res.status})`);
  }
  return res.json();
}

export async function transferBooking(id: number, targetAdminId: number, reason?: string): Promise<Booking> {
  const res = await fetch(`${API}/bookings/${id}/transfer`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetAdminId, reason: reason ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Transfer failed (${res.status})`);
  }
  return res.json();
}

export async function addAvailability(data: { adminId: number; startTime: Date | string; endTime: Date | string }): Promise<Availability> {
  const res = await fetch(`${API}/availability`, {
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

export async function updateAvailability(id: number, data: { startTime: string; endTime: string }): Promise<Availability> {
  const res = await fetch(`${API}/availability/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error(`Failed to update availability (${res.status})`);
  return res.json();
}

export async function deleteAvailability(id: number): Promise<void> {
  const res = await fetch(`${API}/availability/${id}`, {
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

// ── Busy Time API ──

export interface BusyTime {
  id: number;
  adminId: number;
  startTime: string;
  endTime: string;
  note?: string | null;
}

export async function getBusyTimes(): Promise<BusyTime[]> {
  const res = await fetch(`${API}/busy-time`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch busy times (${res.status})`);
  return res.json();
}

export async function addBusyTime(data: { adminId: number; startTime: Date | string; endTime: Date | string; note?: string }): Promise<BusyTime> {
  const res = await fetch(`${API}/busy-time`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminId: data.adminId,
      startTime: toLocalIso(data.startTime),
      endTime: toLocalIso(data.endTime),
      note: data.note ?? null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to add busy time (${res.status})`);
  }
  return res.json();
}

export async function updateBusyTime(id: number, data: { startTime: string; endTime: string; note?: string | null }): Promise<BusyTime> {
  const res = await fetch(`${API}/busy-time/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update busy time (${res.status})`);
  return res.json();
}

export async function deleteBusyTime(id: number): Promise<void> {
  const res = await fetch(`${API}/busy-time/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to delete busy time (${res.status})`);
  }
}
