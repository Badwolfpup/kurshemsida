import { describe, it, expect } from 'vitest';
import { hasAbsenceAlert } from '@/components/deltagare/DeltagareList';
import type { Participant } from '@/pages/Deltagare';
import { STATUS_DISTANCE, STATUS_PAUSED } from '@/lib/participantStatus';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function makeParticipant(active: boolean, attendance: Record<string, boolean>, status?: number): Participant {
  return { active, attendance, status } as Participant;
}

describe('hasAbsenceAlert()', () => {
  it('returns false when participant is inactive (even with absences)', () => {
    const p = makeParticipant(false, { [daysAgo(5)]: false });
    expect(hasAbsenceAlert(p)).toBe(false);
  });

  it('returns false when active and present at least once in last 14 days', () => {
    const p = makeParticipant(true, { [daysAgo(3)]: true });
    expect(hasAbsenceAlert(p)).toBe(false);
  });

  it('returns true when active and only absences in last 14 days', () => {
    const p = makeParticipant(true, { [daysAgo(5)]: false });
    expect(hasAbsenceAlert(p)).toBe(true);
  });

  it('returns true when active and only attendance record is older than 14 days', () => {
    const p = makeParticipant(true, { [daysAgo(20)]: true });
    expect(hasAbsenceAlert(p)).toBe(true);
  });

  it('returns true when active with no attendance records', () => {
    const p = makeParticipant(true, {});
    expect(hasAbsenceAlert(p)).toBe(true);
  });

  it('returns false when active, present recently AND absent recently', () => {
    const p = makeParticipant(true, {
      [daysAgo(2)]: true,
      [daysAgo(7)]: false,
    });
    expect(hasAbsenceAlert(p)).toBe(false);
  });

  it('returns false for a distans student despite no recent attendance', () => {
    const p = makeParticipant(true, { [daysAgo(20)]: true }, STATUS_DISTANCE);
    expect(hasAbsenceAlert(p)).toBe(false);
  });

  it('returns false for a paused student despite no attendance records', () => {
    const p = makeParticipant(true, {}, STATUS_PAUSED);
    expect(hasAbsenceAlert(p)).toBe(false);
  });
});
