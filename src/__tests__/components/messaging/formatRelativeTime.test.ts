import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatRelativeTime } from '@/components/messaging/ThreadList';

function minutesAgo(n: number): string {
  const d = new Date(NOW.getTime() - n * 60_000);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  return minutesAgo(n * 60);
}

function daysAgo(n: number): string {
  return minutesAgo(n * 60 * 24);
}

const NOW = new Date('2026-03-06T12:00:00.000Z');

describe('formatRelativeTime()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Nu" for a date less than 1 minute ago', () => {
    expect(formatRelativeTime(minutesAgo(0))).toBe('Nu');
  });

  it('returns "Nu" for a date 30 seconds ago', () => {
    const d = new Date(NOW.getTime() - 30_000);
    expect(formatRelativeTime(d.toISOString())).toBe('Nu');
  });

  it('returns minutes for 1 minute ago', () => {
    expect(formatRelativeTime(minutesAgo(1))).toBe('1 min');
  });

  it('returns minutes for 59 minutes ago', () => {
    expect(formatRelativeTime(minutesAgo(59))).toBe('59 min');
  });

  it('returns hours for exactly 60 minutes ago', () => {
    expect(formatRelativeTime(minutesAgo(60))).toBe('1 h');
  });

  it('returns hours for 23 hours ago', () => {
    expect(formatRelativeTime(hoursAgo(23))).toBe('23 h');
  });

  it('returns days for exactly 24 hours ago', () => {
    expect(formatRelativeTime(hoursAgo(24))).toBe('1 d');
  });

  it('returns days for 6 days ago', () => {
    expect(formatRelativeTime(daysAgo(6))).toBe('6 d');
  });

  it('returns locale date for 7 days ago', () => {
    const result = formatRelativeTime(daysAgo(7));
    // 7 days before 2026-03-06 12:00 UTC = 2026-02-27
    expect(result).toBe('2026-02-27');
  });

  it('returns locale date for 30 days ago', () => {
    const result = formatRelativeTime(daysAgo(30));
    // 30 days before 2026-03-06 12:00 UTC = 2026-02-04
    expect(result).toBe('2026-02-04');
  });
});
