import { describe, it, expect } from 'vitest';
import { toLocalIso } from '@/api/BookingService';

describe('toLocalIso()', () => {
  it('returns string inputs unchanged', () => {
    expect(toLocalIso('2024-01-15T10:00:00')).toBe('2024-01-15T10:00:00');
  });

  it('formats a Date with zero-padded month and day', () => {
    // Jan 5 = month 1, day 5 — both need padding
    const d = new Date(2024, 0, 5, 9, 3, 7);
    expect(toLocalIso(d)).toBe('2024-01-05T09:03:07');
  });

  it('pads single-digit hours, minutes, seconds', () => {
    const d = new Date(2024, 11, 1, 0, 0, 0); // Dec 1, midnight
    expect(toLocalIso(d)).toBe('2024-12-01T00:00:00');
  });

  it('handles two-digit day and month without extra padding', () => {
    const d = new Date(2024, 9, 25, 14, 30, 45); // Oct 25
    expect(toLocalIso(d)).toBe('2024-10-25T14:30:45');
  });
});
