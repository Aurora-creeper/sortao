import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

describe('BlockArrayCursor', () => {
  it('should traverse forward correctly', () => {
    const ba = new BlockArray<number>(2);
    [10, 20, 30, 40, 50].forEach(v => ba.push(v));

    const cursor = ba.cursor();
    const result: number[] = [];

    while (cursor.active) {
      result.push(cursor.value!);
      cursor.next();
    }

    expect(result).toEqual([10, 20, 30, 40, 50]);
  });

  it('should traverse backward correctly', () => {
    const ba = new BlockArray<number>(2);
    [10, 20, 30, 40, 50].forEach(v => ba.push(v));

    const cursor = ba.cursor(ba.length - 1);
    const result: number[] = [];

    while (cursor.active) {
      result.push(cursor.value!);
      cursor.prev();
    }

    expect(result).toEqual([50, 40, 30, 20, 10]);
  });

  it('should mutate values correctly', () => {
    const ba = new BlockArray<number>(2);
    [1, 2, 3, 4].forEach(v => ba.push(v));

    const cursor = ba.cursor();
    while (cursor.active) {
      cursor.set(cursor.value! * 10);
      cursor.next();
    }

    expect(ba.toArray()).toEqual([10, 20, 30, 40]);
  });

  it('should support seek and advance', () => {
    const ba = new BlockArray<number>(2);
    for (let i = 0; i < 10; i++) ba.push(i);

    const cursor = ba.cursor(5);
    expect(cursor.value).toBe(5);

    cursor.advance(3);
    expect(cursor.value).toBe(8);

    cursor.advance(-6);
    expect(cursor.value).toBe(2);

    expect(cursor.seek(20)).toBe(false);
    expect(cursor.active).toBe(false);
  });

  it('should support cloning', () => {
    const ba = new BlockArray<number>(2);
    [1, 2, 3, 4, 5].forEach(v => ba.push(v));

    const c1 = ba.cursor(2);
    const c2 = c1.clone();

    c1.next(); // c1 is now at 3

    expect(c1.value).toBe(4);
    expect(c2.value).toBe(3); // c2 is unaffected
  });

  it('should use binary search for seek() when block count is large (>= 32)', () => {
    const B = 2;
    const ba = new BlockArray<number>(B);
    const count = 100; // With B=2, 100 elements will create ~50 blocks
    for (let i = 0; i < count; i++) ba.push(i);

    const cursor = ba.cursor(0);
    expect((ba as any).blocks.length).toBeGreaterThanOrEqual(32);

    // Test multiple seeks to trigger binary search logic
    cursor.seek(50);
    expect(cursor.value).toBe(50);
    expect(cursor.index).toBe(50);

    cursor.seek(10);
    expect(cursor.value).toBe(10);

    cursor.seek(90);
    expect(cursor.value).toBe(90);

    // Out of bounds seek
    expect(cursor.seek(200)).toBe(false);
    expect(cursor.active).toBe(false);
  });

  describe('Edge Cases and Boundaries', () => {
    it('should return undefined for value when cursor is invalid', () => {
      const ba = new BlockArray<number>(2);
      ba.push(1);

      const cursor = ba.cursor(100);
      expect(cursor.active).toBe(false);
      expect(cursor.value).toBeUndefined();
    });

    it('should throw RangeError when calling set on an invalid cursor', () => {
      const ba = new BlockArray<number>(2);
      ba.push(1);

      const cursor = ba.cursor(100);
      expect(cursor.active).toBe(false);
      expect(() => cursor.set(99)).toThrow(RangeError);
    });

    it('should return false on next() when reaching the end, and stay invalid', () => {
      const ba = new BlockArray<number>(2);
      ba.push(1, 2, 3);

      const cursor = ba.cursor(2); // Points to the last element
      expect(cursor.active).toBe(true);
      expect(cursor.value).toBe(3);

      // Move past the end
      const hasNext = cursor.next();
      expect(hasNext).toBe(false);
      expect(cursor.active).toBe(false);
      expect(cursor.value).toBeUndefined();

      // Calling next again should still return false
      expect(cursor.next()).toBe(false);
    });

    it("should do nothing", () => {
      const ba = new BlockArray<number>(2);
      ba.push(1, 2, 3);
      // @ts-expect-error
      ba._tryMerge(-1);
      // @ts-expect-error
      ba._tryMerge(3);
    })
  });
});
