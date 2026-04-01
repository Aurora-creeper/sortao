import { describe, it, expect } from 'vitest';
import { SortedBlockArray } from '../sorted-block-array';

describe('SortedBlockArrayCursor', () => {
  it('should lazy-calculate index accurately across blocks', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 2);
    // Push elements to force splitting (B=2 means split at > 4)
    sba.insertMany([10, 20, 30, 40, 50, 60, 70, 80]);
    // Array: ~3 or 4 blocks

    // Get cursor at start
    const cur = sba.cursor(0, 0);
    expect(cur.index).toBe(0);
    expect(cur.value).toBe(10);

    // Manual cross-block navigation
    let count = 0;
    while (cur.active) {
      expect(cur.index).toBe(count);
      expect(cur.value).toBe((count + 1) * 10);
      cur.next();
      count++;
    }
    expect(count).toBe(8);
  });

  it('should handle invalid states safely (value, next, prev, index)', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([1, 2, 3]);

    const cur = sba.cursor(); // points to 0

    // Seek out of bounds
    expect(cur.seek(100)).toBe(false);
    expect(cur.active).toBe(false);
    expect(cur.value).toBeUndefined();
    expect(cur.next()).toBe(false); // next when invalid

    // Index when out of bounds should clamp to length
    expect(cur.index).toBe(sba.length);

    // Prev at 0
    cur.seek(0);
    expect(cur.prev()).toBe(false);

    // Advance out of bounds
    expect(cur.advance(10)).toBe(false);
    expect(cur.active).toBe(false);
  });

  it('should support prev() and next() across block boundaries', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 2);
    sba.insertMany([1, 2, 3, 4, 5, 6, 7]);

    const cur = sba.cursor();
    cur.seek(6); // Last element

    expect(cur.value).toBe(7);
    expect(cur.index).toBe(6);

    // Go backwards through all elements
    const values: number[] = [];
    while (cur.active) {
      values.push(cur.value!);
      if (!cur.prev()) break;
    }

    expect(values).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  it('should integrate correctly with lower_bound and upper_bound', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([10, 20, 20, 20, 30]);

    // lower_bound
    const lCur = sba.lower_bound(20);
    expect(lCur.active).toBe(true);
    expect(lCur.index).toBe(1);
    expect(lCur.value).toBe(20);

    // upper_bound
    const uCur = sba.upper_bound(20);
    expect(uCur.active).toBe(true);
    expect(uCur.index).toBe(4);
    expect(uCur.value).toBe(30);

    // bounds beyond all elements
    const endCur = sba.lower_bound(999);
    expect(endCur.active).toBe(false);
    expect(endCur.index).toBe(sba.length); // Clamped to end
  });

  it('should support cloning without affecting original', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([1, 2, 3, 4, 5]);

    const cur = sba.cursor();
    cur.seek(2);

    const cloned = cur.clone();
    expect(cloned.value).toBe(3);

    cloned.next();
    expect(cloned.value).toBe(4);

    // Original untouched
    expect(cur.value).toBe(3);
  });
});

