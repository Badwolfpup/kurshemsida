import { describe, it, expect } from 'vitest';
import {
  STATUS_ONSITE,
  STATUS_DISTANCE,
  STATUS_PAUSED,
  isReducedAttendance,
  statusTagLabel,
  statusFullLabel,
} from '@/lib/participantStatus';

describe('isReducedAttendance()', () => {
  it('returns false for on-site', () => {
    expect(isReducedAttendance(STATUS_ONSITE)).toBe(false);
  });

  it('returns true for distance', () => {
    expect(isReducedAttendance(STATUS_DISTANCE)).toBe(true);
  });

  it('returns true for paused', () => {
    expect(isReducedAttendance(STATUS_PAUSED)).toBe(true);
  });

  it('treats undefined as on-site (not reduced)', () => {
    expect(isReducedAttendance(undefined)).toBe(false);
  });

  it('treats null as on-site (not reduced)', () => {
    expect(isReducedAttendance(null)).toBe(false);
  });

  it('returns false for an unknown/out-of-range value', () => {
    expect(isReducedAttendance(0)).toBe(false);
    expect(isReducedAttendance(99)).toBe(false);
  });
});

describe('statusTagLabel()', () => {
  it('returns null for on-site (no tag shown)', () => {
    expect(statusTagLabel(STATUS_ONSITE)).toBeNull();
  });

  it('returns "Distans" for distance', () => {
    expect(statusTagLabel(STATUS_DISTANCE)).toBe('Distans');
  });

  it('returns "Pausad" for paused', () => {
    expect(statusTagLabel(STATUS_PAUSED)).toBe('Pausad');
  });

  it('returns null for undefined', () => {
    expect(statusTagLabel(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(statusTagLabel(null)).toBeNull();
  });

  it('returns null for an unknown value', () => {
    expect(statusTagLabel(0)).toBeNull();
    expect(statusTagLabel(99)).toBeNull();
    expect(statusTagLabel(-1)).toBeNull();
  });
});

describe('statusFullLabel()', () => {
  it('returns null for on-site', () => {
    expect(statusFullLabel(STATUS_ONSITE)).toBeNull();
  });

  it('returns the distance phrase', () => {
    expect(statusFullLabel(STATUS_DISTANCE)).toBe('studerar på distans');
  });

  it('returns the paused phrase', () => {
    expect(statusFullLabel(STATUS_PAUSED)).toBe('har en tillfällig paus');
  });

  it('returns null for undefined', () => {
    expect(statusFullLabel(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(statusFullLabel(null)).toBeNull();
  });

  it('returns null for an unknown value', () => {
    expect(statusFullLabel(99)).toBeNull();
    expect(statusFullLabel(-1)).toBeNull();
  });
});
