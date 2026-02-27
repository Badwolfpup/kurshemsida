import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('merges two class strings', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy conditional classes', () => {
    expect(cn('base', false && 'hidden', undefined)).toBe('base');
  });

  it('handles object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('handles mixed string and object inputs', () => {
    expect(cn('p-2', { 'font-bold': true, italic: false })).toBe('p-2 font-bold');
  });
});
