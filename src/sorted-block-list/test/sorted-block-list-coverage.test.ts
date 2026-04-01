import { describe, it, expect } from 'vitest';
import { SortedBlockList } from '../sorted-block-list';

describe('SortedBlockList Delegated APIs Coverage', () => {
  it('should call delegated memory management and status APIs (tested thoroughly in BlockList)', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);

    // isEmpty
    expect(sbl.isEmpty()).toBe(true);

    // reserve and capacity
    sbl.reserve(100);
    expect(sbl.capacity).toBeGreaterThanOrEqual(100);

    sbl.insertMany([1, 2, 3]);
    expect(sbl.isEmpty()).toBe(false);

    // shrinkToFit
    sbl.shrinkToFit(); // Just ensuring it doesn't throw

    // clear(reuse)
    sbl.clear(true);
    expect(sbl.isEmpty()).toBe(true);
    expect(sbl.length).toBe(0);

    // clear(no-reuse)
    sbl.insert(99);
    sbl.clear(false);
    expect(sbl.isEmpty()).toBe(true);
  });

  it('should call delegated access APIs: get, at, kth (tested thoroughly in BlockList)', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([10, 20, 30, 40]);

    // get
    expect(sbl.get(1)).toBe(20);
    expect(sbl.get(10)).toBeUndefined();

    // at (supports negative)
    expect(sbl.at(-1)).toBe(40);
    expect(sbl.at(-4)).toBe(10);
    expect(sbl.at(10)).toBeUndefined();

    // kth (alias for get)
    expect(sbl.kth(2)).toBe(30);
    expect(sbl.kth(10)).toBeUndefined();
  });

  it('should support equal_range', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([10, 20, 20, 20, 30]);

    const [lower, upper] = sbl.equal_range(20);

    expect(lower.index).toBe(1);
    expect(lower.value).toBe(20);

    expect(upper.index).toBe(4);
    expect(upper.value).toBe(30);

    // Empty range for non-existent element
    const [l2, u2] = sbl.equal_range(25);
    expect(l2.index).toBe(4); // points to 30
    expect(u2.index).toBe(4); // points to 30
  });

  it('should support native iteration [Symbol.iterator]()', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([5, 4, 3, 2, 1]);

    const result: number[] = [];
    for (const val of sbl) {
      result.push(val);
    }

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return -1 for unfound lastIndexOf', () => {
    const sbl = new SortedBlockList<number>(undefined, 4);
    sbl.insertMany([5, 4, 3, 2, 1]);

    expect(sbl.lastIndexOf(9)).toEqual(-1);
  })
});
