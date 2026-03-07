import { describe, it, expect } from 'vitest';
import { parseAsserts, runTests } from '@/lib/exerciseTestRunner';

describe('parseAsserts()', () => {
  it('returns empty array for null', () => {
    expect(parseAsserts(null)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseAsserts('')).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(parseAsserts('not json')).toEqual([]);
  });

  it('returns parsed value for non-array JSON (no runtime validation)', () => {
    // The function uses `as ParsedAssert[]` — no runtime array check.
    // Passing a non-array JSON returns the parsed value as-is.
    const result = parseAsserts('{"comment":"a","code":"b"}');
    expect(Array.isArray(result)).toBe(false);
  });

  it('parses valid JSON array of asserts', () => {
    const json = JSON.stringify([
      { comment: 'test 1', code: 'expect(1).toBe(1)' },
      { comment: 'test 2', code: 'expect(2).toBe(2)' },
    ]);
    const result = parseAsserts(json);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ comment: 'test 1', code: 'expect(1).toBe(1)' });
    expect(result[1]).toEqual({ comment: 'test 2', code: 'expect(2).toBe(2)' });
  });

  it('parses empty JSON array', () => {
    expect(parseAsserts('[]')).toEqual([]);
  });
});

describe('runTests()', () => {
  describe('toBe matcher', () => {
    it('passes when values are strictly equal', () => {
      const results = runTests(
        'function add(a, b) { return a + b; }',
        [{ comment: 'adds numbers', code: 'expect(add(1, 2)).toBe(3)' }]
      );
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
      expect(results[0].error).toBeUndefined();
    });

    it('fails when values differ', () => {
      const results = runTests(
        'function add(a, b) { return a - b; }',
        [{ comment: 'adds numbers', code: 'expect(add(1, 2)).toBe(3)' }]
      );
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toContain('Förväntat');
    });

    it('uses strict equality (not deep)', () => {
      const results = runTests(
        '',
        [{ comment: 'strict check', code: 'expect("3").toBe(3)' }]
      );
      expect(results[0].passed).toBe(false);
    });
  });

  describe('toEqual matcher', () => {
    it('passes for deeply equal arrays', () => {
      const results = runTests(
        'function getArr() { return [1, 2, 3]; }',
        [{ comment: 'array equality', code: 'expect(getArr()).toEqual([1, 2, 3])' }]
      );
      expect(results[0].passed).toBe(true);
    });

    it('fails for different arrays', () => {
      const results = runTests(
        'function getArr() { return [1, 2]; }',
        [{ comment: 'array equality', code: 'expect(getArr()).toEqual([1, 2, 3])' }]
      );
      expect(results[0].passed).toBe(false);
    });

    it('passes for deeply equal objects', () => {
      const results = runTests(
        'function getObj() { return { a: 1, b: "x" }; }',
        [{ comment: 'object equality', code: 'expect(getObj()).toEqual({ a: 1, b: "x" })' }]
      );
      expect(results[0].passed).toBe(true);
    });
  });

  describe('toBeTruthy / toBeFalsy matchers', () => {
    it('toBeTruthy passes for truthy values', () => {
      const results = runTests('', [
        { comment: 'truthy', code: 'expect(1).toBeTruthy()' },
      ]);
      expect(results[0].passed).toBe(true);
    });

    it('toBeTruthy fails for falsy values', () => {
      const results = runTests('', [
        { comment: 'falsy input', code: 'expect(0).toBeTruthy()' },
      ]);
      expect(results[0].passed).toBe(false);
    });

    it('toBeFalsy passes for falsy values', () => {
      const results = runTests('', [
        { comment: 'falsy', code: 'expect(0).toBeFalsy()' },
      ]);
      expect(results[0].passed).toBe(true);
    });

    it('toBeFalsy fails for truthy values', () => {
      const results = runTests('', [
        { comment: 'truthy input', code: 'expect("hello").toBeFalsy()' },
      ]);
      expect(results[0].passed).toBe(false);
    });
  });

  describe('toContain matcher', () => {
    it('passes when string contains substring', () => {
      const results = runTests('', [
        { comment: 'string contains', code: 'expect("hello world").toContain("world")' },
      ]);
      expect(results[0].passed).toBe(true);
    });

    it('fails when string does not contain substring', () => {
      const results = runTests('', [
        { comment: 'string missing', code: 'expect("hello").toContain("world")' },
      ]);
      expect(results[0].passed).toBe(false);
    });

    it('passes when array contains item', () => {
      const results = runTests('', [
        { comment: 'array contains', code: 'expect([1, 2, 3]).toContain(2)' },
      ]);
      expect(results[0].passed).toBe(true);
    });

    it('fails when array does not contain item', () => {
      const results = runTests('', [
        { comment: 'array missing', code: 'expect([1, 2, 3]).toContain(5)' },
      ]);
      expect(results[0].passed).toBe(false);
    });
  });

  describe('toThrow matcher', () => {
    it('passes when function throws', () => {
      const results = runTests(
        'function boom() { throw new Error("oops"); }',
        [{ comment: 'throws', code: 'expect(boom).toThrow()' }]
      );
      expect(results[0].passed).toBe(true);
    });

    it('fails when function does not throw', () => {
      const results = runTests(
        'function safe() { return 1; }',
        [{ comment: 'no throw', code: 'expect(safe).toThrow()' }]
      );
      expect(results[0].passed).toBe(false);
    });

    it('fails when value is not a function', () => {
      const results = runTests('', [
        { comment: 'not a fn', code: 'expect(42).toThrow()' },
      ]);
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toContain('funktion');
    });
  });

  describe('error handling', () => {
    it('catches syntax errors in user code', () => {
      const results = runTests(
        'function broken( { }',
        [{ comment: 'syntax error', code: 'expect(1).toBe(1)' }]
      );
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toMatch(/unexpected|expected|syntax/i);
    });

    it('catches runtime errors in assert code', () => {
      const results = runTests(
        '',
        [{ comment: 'runtime error', code: 'undefinedVar.method()' }]
      );
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toMatch(/not defined|cannot read/i);
    });

    it('returns results for each assert independently', () => {
      const results = runTests(
        'function double(n) { return n * 2; }',
        [
          { comment: 'pass', code: 'expect(double(2)).toBe(4)' },
          { comment: 'fail', code: 'expect(double(3)).toBe(5)' },
          { comment: 'pass again', code: 'expect(double(0)).toBe(0)' },
        ]
      );
      expect(results).toHaveLength(3);
      expect(results[0].passed).toBe(true);
      expect(results[1].passed).toBe(false);
      expect(results[2].passed).toBe(true);
    });

    it('preserves comment and code in results', () => {
      const results = runTests('', [
        { comment: 'my test', code: 'expect(1).toBe(1)' },
      ]);
      expect(results[0].comment).toBe('my test');
      expect(results[0].code).toBe('expect(1).toBe(1)');
    });
  });

  describe('multiple expect calls in one assert', () => {
    it('fails if any expect in the block fails', () => {
      const results = runTests(
        'function add(a, b) { return a + b; }',
        [{ comment: 'multi', code: 'expect(add(1, 2)).toBe(3); expect(add(1, 1)).toBe(99)' }]
      );
      expect(results[0].passed).toBe(false);
    });

    it('fails even if the last expect passes but an earlier one failed', () => {
      const results = runTests(
        'function add(a, b) { return a + b; }',
        [{ comment: 'first fails last passes', code: 'expect(add(1, 1)).toBe(99); expect(add(1, 2)).toBe(3)' }]
      );
      expect(results[0].passed).toBe(false);
    });
  });

  describe('console.assert support', () => {
    it('fails when console.assert receives false', () => {
      const results = runTests('', [
        { comment: 'console assert', code: 'console.assert(false, "check failed")' },
      ]);
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toContain('check failed');
    });

    it('passes when console.assert receives true', () => {
      const results = runTests('', [
        { comment: 'console assert pass', code: 'console.assert(true, "should not fail")' },
      ]);
      expect(results[0].passed).toBe(true);
    });
  });

  describe('empty inputs', () => {
    it('returns empty array for empty asserts', () => {
      expect(runTests('function x() {}', [])).toEqual([]);
    });
  });
});
