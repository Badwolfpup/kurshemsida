import { describe, it, expect } from 'vitest';
import { reducer } from '@/hooks/use-toast';

const baseState = { toasts: [] };

// Minimal toast shape — only fields the reducer actually reads
const toast = { id: '1', title: 'Hello', open: true } as any;

describe('toast reducer — ADD_TOAST', () => {
  it('adds a toast to empty state', () => {
    const next = reducer(baseState, { type: 'ADD_TOAST', toast });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe('1');
  });

  it('enforces TOAST_LIMIT of 1: new toast replaces old', () => {
    const state = { toasts: [{ ...toast, id: 'old' }] };
    const next = reducer(state, { type: 'ADD_TOAST', toast: { ...toast, id: 'new' } });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe('new');
  });
});

describe('toast reducer — UPDATE_TOAST', () => {
  it('merges new fields onto matching toast', () => {
    const state = { toasts: [toast] };
    const next = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'Updated' } });
    expect(next.toasts[0].title).toBe('Updated');
  });

  it('leaves non-matching toasts unchanged', () => {
    const state = { toasts: [toast, { ...toast, id: '2', title: 'Other' }] };
    const next = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'Changed' } });
    expect(next.toasts.find((t: any) => t.id === '2')?.title).toBe('Other');
  });
});

describe('toast reducer — DISMISS_TOAST', () => {
  it('sets open=false for the targeted toast', () => {
    const state = { toasts: [toast] };
    const next = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(next.toasts[0].open).toBe(false);
  });

  it('sets open=false for all toasts when no id given', () => {
    const state = { toasts: [{ ...toast, id: '1' }, { ...toast, id: '2' }] };
    const next = reducer(state, { type: 'DISMISS_TOAST' });
    expect(next.toasts.every((t: any) => t.open === false)).toBe(true);
  });

  it('leaves other toasts open when targeting one specific id', () => {
    const state = { toasts: [{ ...toast, id: '1' }, { ...toast, id: '2', open: true }] };
    const next = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(next.toasts.find((t: any) => t.id === '2')?.open).toBe(true);
  });
});

describe('toast reducer — REMOVE_TOAST', () => {
  it('removes the toast matching the given id', () => {
    const state = { toasts: [toast] };
    const next = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(next.toasts).toHaveLength(0);
  });

  it('clears all toasts when no id given', () => {
    const state = { toasts: [toast, { ...toast, id: '2' }] };
    const next = reducer(state, { type: 'REMOVE_TOAST' });
    expect(next.toasts).toHaveLength(0);
  });

  it('leaves other toasts when removing one specific id', () => {
    const state = { toasts: [toast, { ...toast, id: '2' }] };
    const next = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe('2');
  });
});
