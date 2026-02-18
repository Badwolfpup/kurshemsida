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
  adminAvailabilityId: number;
  coachId: number;
  studentId: number | null;
  startTime: string;
  endTime: string;
  bookedAt: string;
  note: string;
  meetingType: string;
  status: string;
  seen?: boolean;
}

// Get free (available) time slots for coaches to book
export async function getAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_URL}/free`, { credentials: 'include' });
  return res.json();
}

// Get all availabilities (for admin view)
export async function getAllAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_URL}/all`, { credentials: 'include' });
  return res.json();
}

// Add new availability (for admin)
function toLocalIso(d: Date | string): string {
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

// Book an availability (for coach)
export async function bookAvailability(data: {
  adminAvailabilityId: number;
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

// Get all bookings (for admin)
export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings`, { credentials: 'include' });
  return res.json();
}

// Update booking status (accept/decline) — for admin
export async function updateBookingStatus(id: number, status: string): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Status update failed (${res.status})`);
  }
  return res.json();
}

// Get bookings visible to coaches
export async function getVisibleBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings/visible`, { credentials: 'include' });
  return res.json();
}
