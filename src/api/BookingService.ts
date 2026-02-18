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
  seen?: boolean;
}

// Get free (available) time slots for coaches to book
export async function getAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_URL}/free`);
  return res.json();
}

// Get all availabilities (for admin view)
export async function getAllAvailabilities(): Promise<Availability[]> {
  const res = await fetch(`${API_URL}/all`);
  return res.json();
}

// Add new availability (for admin)
export async function addAvailability(data: { adminId: number; startTime: Date | string; endTime: Date | string }): Promise<Availability> {
  const res = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminId: data.adminId,
      startTime: typeof data.startTime === 'string' ? data.startTime : data.startTime.toISOString(),
      endTime: typeof data.endTime === 'string' ? data.endTime : data.endTime.toISOString(),
    })
  });
  return res.json();
}

// Update availability (for admin)
export async function updateAvailability(data: { id: number; startTime: string; endTime: string; isBooked: boolean }): Promise<Availability> {
  const res = await fetch(`${API_URL}/update`, {
    method: 'POST',
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Get all bookings (for admin)
export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings`);
  return res.json();
}

// Get bookings visible to coaches
export async function getVisibleBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/bookings/visible`);
  return res.json();
}
