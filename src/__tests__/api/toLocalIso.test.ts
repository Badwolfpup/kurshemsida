import { describe, it, expect } from 'vitest';
import { toLocalIso } from '@/api/BookingService';

describe('toLocalIso()', () => {
  it('returns the same string when given a string', () => {
    expect(toLocalIso('2026-03-06T10:30:00')).toBe('2026-03-06T10:30:00');
  });

  it('converts a Date to local ISO string without timezone offset', () => {
    const date = new Date(2026, 2, 6, 10, 30, 0); // March 6, 2026 10:30:00
    expect(toLocalIso(date)).toBe('2026-03-06T10:30:00');
  });

  it('zero-pads single-digit months and days', () => {
    const date = new Date(2026, 0, 5, 9, 5, 3); // Jan 5, 2026 09:05:03
    expect(toLocalIso(date)).toBe('2026-01-05T09:05:03');
  });

  it('handles midnight correctly', () => {
    const date = new Date(2026, 11, 31, 0, 0, 0); // Dec 31, 2026 00:00:00
    expect(toLocalIso(date)).toBe('2026-12-31T00:00:00');
  });

  it('handles end-of-day times', () => {
    const date = new Date(2026, 2, 6, 23, 59, 59);
    expect(toLocalIso(date)).toBe('2026-03-06T23:59:59');
  });
});
