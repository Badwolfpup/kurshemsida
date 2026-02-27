// kurshemsida/src/api/BookingService.ts
export const API_URL = '/api/admin-availability';

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
  coachId: number;
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

// Get free (available) time slots for coaches to book
export async function getAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_URL}/free`, { credentials: 'include' });
  return res.json();
}

// Get a single availability by id — accessible by coaches too
export async function getAvailabilityById(id: number): Promise<Availability> {
  const res = await fetch(`${API_URL}/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch availability (${res.status})`);
  return res.json();
}

// Get all availabilities (for admin view)
export async function getAllAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_URL}/all`, { credentials: 'include' });
  return res.json();
}

// Add new availability (for admin)
export function toLocalIso(d: Date | string): string {
  if (typeof d === 'string') return d;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function addAvailability(data: { adminId: number; startTime: Date | string; endTime: Date | string }): Promise<Availability> {
  const res = await fetch(`${API_URL}/add`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminId: data.adminId,
      startTime: toLocalIso(data.startTime),
      endTime: toLocalIso(data.endTime),
    })
  });
  return res.json();
}

// Update availability (for admin)
export async function updateAvailability(data: { id: number; startTime: string; endTime: string; isBooked: boolean }): Promise<Availability> {
  const res = await fetch(`${API_URL}/update`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Delete availability (for admin)
export async function deleteAvailability(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed (${res.status})`);
  }
}

export interface BookingConflictError extends Error {
  conflictData: { type: 'conflict' | 'warning'; bookings: Booking[] };
}

// Book an availability slot (for coach)
export async function bookAvailability(data: {
  adminAvailabilityId: number | null;
  coachId: number;
  studentId: number | null;
  note: string;
  meetingType: string;
  startTime: string;
  endTime: string;
}): Promise<Booking> {
  const res = await fetch(`${API_URL}/book`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Booking failed (${res.status})`);
  }
  return res.json();
}

// Create standalone appointment (for admin/teacher) — returns 409 on conflict
export async function createAdminAppointment(data: {
  coachId: number;
  startTime: string;
  endTime: string;
  note: string;
  meetingType: string;
  force?: boolean;
}): Promise<Booking> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.status === 409) {
    const parsed = await res.json();
    const err = new Error('conflict') as BookingConflictError;
    err.conflictData = parsed;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Appointment creation failed (${res.status})`);
  }
  return res.json();
}

// Get all bookings (for admin)
export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings`, { credentials: 'include' });
  return res.json();
}

// Update booking status (accept/decline) — for admin/teacher
export async function updateBookingStatus(id: number, status: string, reason?: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason: reason ?? '' })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Status update failed (${res.status})`);
  }
  return res.json();
}

// Cancel a booking — for coach (own) or admin/teacher
export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}/cancel`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'declined', reason: reason ?? '' })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Cancel failed (${res.status})`);
  }
  return res.json();
}

// Reschedule a booking — for coach (own) or admin/teacher; sets status to rescheduled
export async function rescheduleBooking(id: number, startTime: string, endTime: string, reason?: string, rescheduledBy?: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}/reschedule`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, startTime, endTime, reason: reason ?? '', rescheduledBy: rescheduledBy ?? '' })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Reschedule failed (${res.status})`);
  }
  return res.json();
}

// Get bookings visible to coaches
export async function getVisibleBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings/visible`, { credentials: 'include' });
  return res.json();
}
