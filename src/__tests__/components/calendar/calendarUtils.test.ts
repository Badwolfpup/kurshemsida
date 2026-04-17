import { describe, it, expect } from 'vitest';
import {
  getFreeSegments,
  generate30MinOptions,
  getAdminColorMap,
  WORKDAY_START_HOUR,
  WORKDAY_START_MINUTE,
  WORKDAY_END_HOUR,
  WORKDAY_END_MINUTE,
  ADMIN_COLORS,
} from '@/components/calendar/calendarUtils';
import type { Availability, Booking } from '@/api/BookingService';
import type { BookingStatus } from '@/Types/CalendarTypes';

function makeAvail(id: number, startH: number, endH: number): Availability {
  return {
    id,
    adminId: 1,
    startTime: new Date(2026, 2, 6, startH, 0).toISOString(),
    endTime: new Date(2026, 2, 6, endH, 0).toISOString(),
  };
}

function makeBooking(adminId: number, startH: number, endH: number, status: BookingStatus = 'Accepted'): Booking {
  return {
    id: Math.floor(Math.random() * 1_000_000),
    adminId,
    coachId: 2,
    studentId: 3,
    startTime: new Date(2026, 2, 6, startH, 0).toISOString(),
    endTime: new Date(2026, 2, 6, endH, 0).toISOString(),
    bookedAt: new Date().toISOString(),
    note: '',
    meetingType: 'Followup',
    status,
  };
}

describe('getFreeSegments()', () => {
  it('returns full availability when no bookings exist', () => {
    const avail = makeAvail(1, 9, 12);
    const result = getFreeSegments(avail, []);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].end.getHours()).toBe(12);
  });

  it('returns empty array when availability is fully booked', () => {
    const avail = makeAvail(1, 9, 11);
    const bookings = [makeBooking(1, 9, 11)];
    expect(getFreeSegments(avail, bookings)).toHaveLength(0);
  });

  it('returns gap before a booking', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(1, 10, 12)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].end.getHours()).toBe(10);
  });

  it('returns gap after a booking', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(1, 9, 10)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(10);
    expect(result[0].end.getHours()).toBe(12);
  });

  it('returns two gaps around a middle booking', () => {
    const avail = makeAvail(1, 9, 13);
    const bookings = [makeBooking(1, 10, 11)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(2);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].end.getHours()).toBe(10);
    expect(result[1].start.getHours()).toBe(11);
    expect(result[1].end.getHours()).toBe(13);
  });

  it('ignores declined bookings', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(1, 9, 12, 'Declined')];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].end.getHours()).toBe(12);
  });

  it('ignores bookings on a different admin', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(999, 9, 12)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
  });

  it('handles multiple contiguous bookings filling the slot', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(1, 9, 10), makeBooking(1, 10, 11), makeBooking(1, 11, 12)];
    expect(getFreeSegments(avail, bookings)).toHaveLength(0);
  });

  it('clamps a booking extending past availability end', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(1, 11, 14)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].end.getHours()).toBe(11);
  });

  it('ignores a booking outside availability window', () => {
    const avail = makeAvail(1, 9, 12);
    const bookings = [makeBooking(1, 13, 14)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(9);
    expect(result[0].end.getHours()).toBe(12);
  });

  it('handles overlapping bookings correctly', () => {
    const avail = makeAvail(1, 9, 12);
    const b1: Booking = {
      ...makeBooking(1, 9, 10),
      endTime: new Date(2026, 2, 6, 10, 30).toISOString(),
    };
    const b2 = makeBooking(1, 10, 11);
    const result = getFreeSegments(avail, [b1, b2]);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(11);
    expect(result[0].end.getHours()).toBe(12);
  });

  it('handles nested booking inside a longer one without leaking a false free segment', () => {
    // If the cursor guard is removed, a nested booking could rewind cursor
    // and emit a spurious free segment after the outer booking ends.
    const avail = makeAvail(1, 9, 13);
    const outer = makeBooking(1, 9, 12);
    const inner = makeBooking(1, 10, 11);
    const result = getFreeSegments(avail, [outer, inner]);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(12);
    expect(result[0].end.getHours()).toBe(13);
  });

  it('clamps a booking extending before availability start', () => {
    const avail = makeAvail(1, 10, 12);
    // Booking starts at 8 but availability starts at 10
    const bookings = [makeBooking(1, 8, 11)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(11);
    expect(result[0].end.getHours()).toBe(12);
  });

  it('treats a booking ending exactly at availability start as non-overlapping', () => {
    const avail = makeAvail(1, 10, 12);
    // Touching-but-not-overlapping — must not punch a hole
    const bookings = [makeBooking(1, 9, 10)];
    const result = getFreeSegments(avail, bookings);
    expect(result).toHaveLength(1);
    expect(result[0].start.getHours()).toBe(10);
    expect(result[0].end.getHours()).toBe(12);
  });
});

describe('generate30MinOptions()', () => {
  // WORKDAY is 08:00 – 16:00 → 16 half-hour steps + start = 17 options.
  // If this breaks, the production WORKDAY window changed — review both together.
  it('produces exactly 17 options for the 08:00–16:00 window', () => {
    const opts = generate30MinOptions();
    expect(opts).toHaveLength(17);
  });

  it('first option is WORKDAY_START', () => {
    const opts = generate30MinOptions();
    expect(opts[0].hour).toBe(WORKDAY_START_HOUR);
    expect(opts[0].minute).toBe(WORKDAY_START_MINUTE);
  });

  it('last option is WORKDAY_END', () => {
    const opts = generate30MinOptions();
    const last = opts[opts.length - 1];
    expect(last.hour).toBe(WORKDAY_END_HOUR);
    expect(last.minute).toBe(WORKDAY_END_MINUTE);
  });

  it('matches the expected full label sequence', () => {
    const opts = generate30MinOptions();
    expect(opts.map((o) => o.label)).toEqual([
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    ]);
  });

  it('produces correct hour/minute pairs (not just labels)', () => {
    const opts = generate30MinOptions();
    const nineThirty = opts.find((o) => o.label === '09:30');
    expect(nineThirty).toBeDefined();
    expect(nineThirty!.hour).toBe(9);
    expect(nineThirty!.minute).toBe(30);
  });
});

describe('getAdminColorMap()', () => {
  it('returns empty map for empty admins', () => {
    expect(getAdminColorMap([]).size).toBe(0);
  });

  it('assigns first color to first admin', () => {
    const map = getAdminColorMap([{ id: 10 }]);
    expect(map.get(10)).toBe(ADMIN_COLORS[0]);
  });

  it('assigns different colors to multiple admins', () => {
    const admins = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const map = getAdminColorMap(admins);
    expect(map.get(1)).toBe(ADMIN_COLORS[0]);
    expect(map.get(2)).toBe(ADMIN_COLORS[1]);
    expect(map.get(3)).toBe(ADMIN_COLORS[2]);
  });

  it('wraps around when more admins than colors', () => {
    const admins = Array.from({ length: ADMIN_COLORS.length + 2 }, (_, i) => ({ id: i }));
    const map = getAdminColorMap(admins);
    expect(map.get(ADMIN_COLORS.length)).toBe(ADMIN_COLORS[0]);
    expect(map.get(ADMIN_COLORS.length + 1)).toBe(ADMIN_COLORS[1]);
  });
});
