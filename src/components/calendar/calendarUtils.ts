import type { Availability, Booking } from '@/api/BookingService';

export const WORKDAY_START_HOUR = 8;
export const WORKDAY_END_HOUR = 15;

export const DAY_NAMES = ['', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export const ADMIN_COLORS = ['#2563eb', '#c6a04a', '#b45309', '#be123c', '#4338ca', '#0369a1', '#8b5cf6', '#7c2d12'];

export const RECURRING_EVENT_COLOR = '#9ca3af'; // gray-400
export const BUSY_TIME_COLOR = '#4b5563'; // gray-600

export const STATUS_COLORS = {
  pending: { bg: '#f59e0b', opacity: 0.75 },
  rescheduled: { bg: '#8b5cf6', opacity: 0.9 },
  accepted: { bg: '#22c55e', opacity: 1 },
  declined: { bg: '#ef4444', opacity: 0.6 },
} as const;

/** Subtract non-declined bookings from availability to get free time segments */
export function getFreeSegments(avail: Availability, bookings: Booking[]): { start: Date; end: Date }[] {
  const aStart = new Date(avail.startTime);
  const aEnd = new Date(avail.endTime);

  const sorted = bookings
    .filter((b) => b.adminAvailabilityId === avail.id && b.status !== 'declined')
    .map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) }))
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
  for (let h = WORKDAY_START_HOUR; h <= WORKDAY_END_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === WORKDAY_END_HOUR && m > 0) break;
      opts.push({ hour: h, minute: m, label: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` });
    }
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

export function isWithinWorkHours(date: Date): boolean {
  const h = date.getHours();
  return h >= WORKDAY_START_HOUR && h < WORKDAY_END_HOUR;
}

/** Format hour+minute to TimeSpan string "HH:mm:00" */
export function padTime(h: number, m: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
}
