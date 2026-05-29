import { describe, it, expect } from 'vitest';
import {
  mean,
  median,
  min,
  max,
  stdDev,
  summarize,
  isClassDay,
  dateKey,
  seatOccupancy,
  countFullyBookedTables,
} from '@/lib/statistics';

describe('mean()', () => {
  it('returns 0 for empty', () => expect(mean([])).toBe(0));
  it('averages values', () => expect(mean([2, 4, 6])).toBe(4));
  it('handles a single value', () => expect(mean([5])).toBe(5));
  it('is a true average, not the middle element', () => {
    expect(mean([1, 2, 9])).toBe(4); // middle element (2) would be wrong
    expect(mean([10, 20])).toBe(15); // even length: no middle element
  });
});

describe('median()', () => {
  it('returns 0 for empty', () => expect(median([])).toBe(0));
  it('middle of odd-length sorted', () => expect(median([3, 1, 2])).toBe(2));
  it('averages the two middles for even length', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  it('does not mutate input', () => {
    const arr = [3, 1, 2];
    median(arr);
    expect(arr).toEqual([3, 1, 2]);
  });
});

describe('min() / max()', () => {
  it('0 for empty', () => {
    expect(min([])).toBe(0);
    expect(max([])).toBe(0);
  });
  it('finds extremes incl. negatives', () => {
    expect(min([-3, 5, 0])).toBe(-3);
    expect(max([-3, 5, 0])).toBe(5);
  });
});

describe('stdDev()', () => {
  it('0 for empty', () => expect(stdDev([])).toBe(0));
  it('0 when all equal', () => expect(stdDev([4, 4, 4])).toBe(0));
  it('0 for a single element', () => expect(stdDev([5])).toBe(0));
  it('population std dev of [2,4,6] is ~1.633', () => {
    expect(stdDev([2, 4, 6])).toBeCloseTo(1.6329931, 5);
  });
});

describe('summarize()', () => {
  it('bundles all stats', () => {
    const s = summarize([2, 4, 6]);
    expect(s).toMatchObject({ mean: 4, median: 4, min: 2, max: 6, count: 3 });
    expect(s.stdDev).toBeCloseTo(1.6329931, 5);
  });
  it('empty array gives zeros and count 0', () => {
    expect(summarize([])).toEqual({ mean: 0, median: 0, min: 0, max: 0, stdDev: 0, count: 0 });
  });
});

describe('dateKey()', () => {
  it('formats local date as YYYY-MM-DD with padding', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('isClassDay()', () => {
  const noNoClass = new Set<string>();
  it('true for Mon–Thu', () => {
    expect(isClassDay(new Date(2026, 4, 25), noNoClass)).toBe(true); // Mon
    expect(isClassDay(new Date(2026, 4, 28), noNoClass)).toBe(true); // Thu
  });
  it('false for Fri/Sat/Sun', () => {
    expect(isClassDay(new Date(2026, 4, 29), noNoClass)).toBe(false); // Fri
    expect(isClassDay(new Date(2026, 4, 30), noNoClass)).toBe(false); // Sat
    expect(isClassDay(new Date(2026, 4, 31), noNoClass)).toBe(false); // Sun
  });
  it('false when the day is a NoClass day', () => {
    const noClass = new Set(['2026-05-25']);
    expect(isClassDay(new Date(2026, 4, 25), noClass)).toBe(false);
  });
});

describe('seatOccupancy()', () => {
  it('computes available and pct', () => {
    expect(seatOccupancy(12, 15)).toEqual({ designated: 12, available: 3, capacity: 15, pct: 80 });
  });
  it('full room: 0 available, 100%', () => {
    expect(seatOccupancy(8, 8)).toEqual({ designated: 8, available: 0, capacity: 8, pct: 100 });
  });
  it('clamps available at 0 when over capacity', () => {
    const o = seatOccupancy(10, 8);
    expect(o.available).toBe(0);
    expect(o.pct).toBe(125);
  });
  it('handles zero capacity without dividing by zero', () => {
    expect(seatOccupancy(0, 0)).toEqual({ designated: 0, available: 0, capacity: 0, pct: 0 });
  });
});

describe('countFullyBookedTables()', () => {
  const slots = (row: number, column: number, n: number) =>
    Array.from({ length: n }, () => ({ row, column }));

  it('returns 0 for no assignments', () => {
    expect(countFullyBookedTables([], 6)).toBe(0);
  });

  it('counts a table at exactly the threshold', () => {
    expect(countFullyBookedTables(slots(1, 1, 6), 6)).toBe(1);
  });

  it('does not count a table below the threshold', () => {
    expect(countFullyBookedTables(slots(1, 1, 5), 6)).toBe(0);
  });

  it('counts above the threshold (all 8 slots)', () => {
    expect(countFullyBookedTables(slots(2, 3, 8), 6)).toBe(1);
  });

  it('counts each qualifying table independently', () => {
    const assignments = [
      ...slots(1, 1, 6), // full
      ...slots(1, 2, 7), // full
      ...slots(2, 1, 3), // not full
    ];
    expect(countFullyBookedTables(assignments, 6)).toBe(2);
  });

  it('treats same row/col as one table even if column repeats elsewhere', () => {
    // (1,1) has 4 slots, (2,1) has 4 slots — neither reaches 6 despite both column 1
    const assignments = [...slots(1, 1, 4), ...slots(2, 1, 4)];
    expect(countFullyBookedTables(assignments, 6)).toBe(0);
  });
});
