import type { Availability, Booking } from '@/api/BookingService';
import type { BookingStatus } from '@/Types/CalendarTypes';

export const WORKDAY_START_HOUR = 8;
export const WORKDAY_START_MINUTE = 0;
export const WORKDAY_END_HOUR = 16;
export const WORKDAY_END_MINUTE = 0;

export const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export const ADMIN_COLORS = ['#2563eb', '#c6a04a', '#b45309', '#be123c', '#4338ca', '#0369a1', '#8b5cf6', '#7c2d12'];

export const RECURRING_EVENT_COLOR = '#9ca3af'; // gray-400
export const BUSY_TIME_COLOR = '#4b5563'; // gray-600

export const STATUS_COLORS: Record<BookingStatus, { bg: string; opacity: number }> = {
  Pending: { bg: '#f59e0b', opacity: 0.75 },
  Accepted: { bg: '#22c55e', opacity: 1 },
  Declined: { bg: '#ef4444', opacity: 0.6 },
};

/**
 * Returns free time segments of an availability overlay after punching visual holes
 * for any non-declined bookings on the same admin that overlap the overlay window.
 * Bookings are independent entities; we match by adminId + time overlap (decorative only).
 */
export function getFreeSegments(avail: Availability, bookings: Booking[]): { start: Date; end: Date }[] {
  const aStart = new Date(avail.startTime);
  const aEnd = new Date(avail.endTime);

  const sorted = bookings
    .filter((b) => b.adminId === avail.adminId && b.status !== 'Declined')
    .map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) }))
    .filter((b) => b.start < aEnd && b.end > aStart)
    .map((b) => ({
      start: b.start < aStart ? aStart : b.start,
      end: b.end > aEnd ? aEnd : b.end,
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const segments: { start: Date; end: Date }[] = [];
  let cursor = aStart;

  for (const booking of sorted) {
    if (booking.start > cursor) segments.push({ start: cursor, end: booking.start });
    if (booking.end > cursor) cursor = booking.end;
  }

  if (cursor < aEnd) segments.push({ start: cursor, end: aEnd });
  return segments;
}

export function generate30MinOptions() {
  const opts: { hour: number; minute: number; label: string }[] = [];
  const startTotal = WORKDAY_START_HOUR * 60 + WORKDAY_START_MINUTE;
  const endTotal = WORKDAY_END_HOUR * 60 + WORKDAY_END_MINUTE;
  for (let t = startTotal; t <= endTotal; t += 30) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    opts.push({ hour: h, minute: m, label: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` });
  }
  return opts;
}

export const ALL_TIME_OPTIONS = generate30MinOptions();

export function getAdminColorMap(admins: { id: number }[]): Map<number, string> {
  const map = new Map<number, string>();
  admins.forEach((admin, index) => {
    map.set(admin.id, ADMIN_COLORS[index % ADMIN_COLORS.length]);
  });
  return map;
}

/** Format hour+minute to TimeSpan string "HH:mm:00" */
export function padTime(h: number, m: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
}
