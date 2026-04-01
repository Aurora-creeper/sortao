import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

describe('BlockArray Splice Operations', () => {
  it('should handle asymmetrical splice: delete more than insert', () => {
    const arr = new BlockArray<number>(4);
    for (let i = 0; i < 10; i++) arr.push(i);

    const removed = arr.splice(2, 5, 99, 100);
    expect(removed).toEqual([2, 3, 4, 5, 6]);
    expect(arr.toArray()).toEqual([0, 1, 99, 100, 7, 8, 9]);
    expect(arr.length).toBe(7);
  });

  it('should handle asymmetrical splice: insert more than delete', () => {
    const arr = new BlockArray<number>(4);
    for (let i = 0; i < 5; i++) arr.push(i);

    const removed = arr.splice(1, 2, 10, 11, 12, 13, 14);
    expect(removed).toEqual([1, 2]);
    expect(arr.toArray()).toEqual([0, 10, 11, 12, 13, 14, 3, 4]);
    expect(arr.length).toBe(8);
  });

  it('should efficiently handle large deletions crossing multiple blocks', () => {
    const B = 4;
    const arr = new BlockArray<number>(B);
    for (let i = 0; i < 20; i++) arr.push(i);

    // Initial blocks: roughly 5 blocks of size 4
    const removed = arr.splice(3, 15);
    expect(removed).toEqual(Array.from({ length: 15 }, (_, i) => i + 3));
    expect(arr.toArray()).toEqual([0, 1, 2, 18, 19]);
    expect(arr.length).toBe(5);

    // Verify prefix sums internally by using indexOf which relies on length
    expect(arr.indexOf(18)).toBe(3);
  });

  it('should efficiently handle massive insertions creating new blocks', () => {
    const B = 4;
    const arr = new BlockArray<number>(B);
    arr.push(1, 2, 3);

    const massiveItems = Array.from({ length: 15 }, (_, i) => i + 10);
    arr.splice(1, 0, ...massiveItems);

    expect(arr.length).toBe(18);
    expect(arr.get(0)).toBe(1);
    expect(arr.get(1)).toBe(10);
    expect(arr.get(15)).toBe(24);
    expect(arr.get(16)).toBe(2);
    expect(arr.get(17)).toBe(3);

    // Ensure blocks were split/created correctly
    const blocks = (arr as any).blocks as any[];
    expect(blocks.length).toBeGreaterThan(3);
  });

  it('should handle negative start indices', () => {
    const arr = new BlockArray<number>(4);
    for (let i = 0; i < 10; i++) arr.push(i);

    const removed = arr.splice(-4, 2, 99); // Start at index 6, remove [6, 7], insert 99
    expect(removed).toEqual([6, 7]);
    expect(arr.toArray()).toEqual([0, 1, 2, 3, 4, 5, 99, 8, 9]);
  });

  it('should handle out-of-bounds start indices gracefully', () => {
    const arr = new BlockArray<number>(4);
    arr.push(1, 2, 3);

    // start > length -> acts like push
    arr.splice(100, 0, 4, 5);
    expect(arr.toArray()).toEqual([1, 2, 3, 4, 5]);

    // start < -length -> acts like unshift
    arr.splice(-100, 0, -1, 0);
    expect(arr.toArray()).toEqual([-1, 0, 1, 2, 3, 4, 5]);
  });

  it('should handle omitting deleteCount (deletes to the end)', () => {
    const arr = new BlockArray<number>(4);
    for (let i = 0; i < 10; i++) arr.push(i);

    // @ts-ignore - testing omitted parameter
    const removed = arr.splice(6);
    expect(removed).toEqual([6, 7, 8, 9]);
    expect(arr.toArray()).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
