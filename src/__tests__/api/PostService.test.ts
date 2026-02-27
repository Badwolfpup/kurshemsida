import { describe, it, expect } from 'vitest';
import { sortPostsByDate } from '@/api/PostService';
import type PostType from '@/Types/PostType';

function makePost(id: number, publishedAt: string): PostType {
  return { id, publishedAt: new Date(publishedAt) } as PostType;
}

describe('sortPostsByDate()', () => {
  it('sorts newest first', () => {
    const posts = [
      makePost(1, '2024-01-01'),
      makePost(2, '2024-06-15'),
      makePost(3, '2024-03-10'),
    ];
    expect(sortPostsByDate(posts).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  it('returns empty array unchanged', () => {
    expect(sortPostsByDate([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const posts = [makePost(1, '2024-01-01'), makePost(2, '2024-06-15')];
    const original = [...posts];
    sortPostsByDate(posts);
    expect(posts[0].id).toBe(original[0].id);
    expect(posts[1].id).toBe(original[1].id);
  });

  it('handles single-element array', () => {
    const posts = [makePost(1, '2024-01-01')];
    expect(sortPostsByDate(posts)).toHaveLength(1);
    expect(sortPostsByDate(posts)[0].id).toBe(1);
  });

  it('handles same-date posts (preserves length)', () => {
    const posts = [makePost(1, '2024-01-01'), makePost(2, '2024-01-01')];
    expect(sortPostsByDate(posts)).toHaveLength(2);
  });
});
