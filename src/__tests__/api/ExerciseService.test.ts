import { describe, it, expect } from 'vitest';
import { computeLightbulbs } from '@/api/ExerciseService';

describe('computeLightbulbs()', () => {
  it('difficulty 0 → all false', () => {
    expect(computeLightbulbs(0)).toEqual([false, false, false, false, false]);
  });

  it('difficulty 1 → first one true', () => {
    expect(computeLightbulbs(1)).toEqual([true, false, false, false, false]);
  });

  it('difficulty 3 → first 3 true', () => {
    expect(computeLightbulbs(3)).toEqual([true, true, true, false, false]);
  });

  it('difficulty 5 → all true', () => {
    expect(computeLightbulbs(5)).toEqual([true, true, true, true, true]);
  });

  it('difficulty > 5 → all true (clamped by array length)', () => {
    expect(computeLightbulbs(10)).toEqual([true, true, true, true, true]);
  });

  it('always returns an array of length 5', () => {
    expect(computeLightbulbs(0)).toHaveLength(5);
    expect(computeLightbulbs(5)).toHaveLength(5);
  });
});
