import { describe, it, expect } from 'vitest';
import { BlockDeque } from '../block-deque';

describe('BlockDeque Coverage & Edge Cases', () => {
  it('should correctly handle capacity, isEmpty, reserve, and shrinkToFit', () => {
    const bd = new BlockDeque<number>(16);
    expect(bd.isEmpty()).toBe(true);
    expect(bd.capacity).toBe(16); // 1 block

    bd.push(1);
    expect(bd.isEmpty()).toBe(false);

    // reserve adds blocks to pool
    bd.reserve(100);
    expect(bd.capacity).toBeGreaterThanOrEqual(100);

    // shrinkToFit empties the pool
    bd.shrinkToFit();
    expect(bd.capacity).toBe(16);
    expect((bd as any).pool.length).toBe(0);
  });

  it('should gracefully return undefined or throw RangeError for OOB access', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(10, 20);

    // get
    expect(bd.get(-1)).toBeUndefined();
    expect(bd.get(2)).toBeUndefined();
    expect(bd.get(100)).toBeUndefined();

    // set
    expect(() => bd.set(-3, 99)).toThrow(RangeError); // length is 2, -3 is out of bounds
    expect(() => bd.set(2, 99)).toThrow(RangeError);
    expect(() => bd.set(100, 99)).toThrow(RangeError);

    // insert
    expect(() => bd.insert(-1, 99)).toThrow(RangeError);
    expect(() => bd.insert(3, 99)).toThrow(RangeError); // len=2, index 3 is OOB

    // delete
    expect(bd.delete(-1)).toBeUndefined();
    expect(bd.delete(2)).toBeUndefined();
    expect(bd.delete(100)).toBeUndefined();

    // resize
    expect(() => bd.resize(-1)).toThrow(RangeError);
  });

  it('should support at() with negative indexing', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(10, 20, 30);

    expect(bd.at(0)).toBe(10);
    expect(bd.at(2)).toBe(30);
    expect(bd.at(-1)).toBe(30);
    expect(bd.at(-3)).toBe(10);
    expect(bd.at(-4)).toBeUndefined();
    expect(bd.at(3)).toBeUndefined();
  });

  it('should safely return undefined when pop/shift on empty array', () => {
    const bd = new BlockDeque<number>(4);
    expect(bd.length).toBe(0);
    expect(bd.pop()).toBeUndefined();
    expect(bd.shift()).toBeUndefined();
  });

  it('should accurately process reverse()', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(1, 2, 3, 4, 5);
    bd.reverse();
    expect(bd.toArray()).toEqual([5, 4, 3, 2, 1]);

    const empty = new BlockDeque<number>(4);
    empty.reverse();
    expect(empty.toArray()).toEqual([]);

    const single = new BlockDeque<number>(4);
    single.push(1);
    single.reverse();
    expect(single.toArray()).toEqual([1]);
  });

  it('should accurately process slice()', () => {
    const bd = new BlockDeque<number>(4);
    for (let i = 0; i < 10; i++) bd.push(i);

    const sliced = bd.slice(2, 7);
    expect(sliced.toArray()).toEqual([2, 3, 4, 5, 6]);
    expect(sliced.length).toBe(5);

    // Negative indices
    const slicedNeg = bd.slice(-4, -1);
    expect(slicedNeg.toArray()).toEqual([6, 7, 8]);
    
    // Out of bounds slice
    const slicedOOB = bd.slice(5, 2);
    expect(slicedOOB.toArray()).toEqual([]);
  });

  it('should accurately process concat()', () => {
    const bd1 = new BlockDeque<number>(4);
    bd1.push(1, 2);

    const bd2 = new BlockDeque<number>(4);
    bd2.push(3, 4);

    const combined = bd1.concat(bd2, [5, 6], 7);
    expect(combined.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(combined.length).toBe(7);

    // Verify originals untouched
    expect(bd1.toArray()).toEqual([1, 2]);
    expect(bd2.toArray()).toEqual([3, 4]);
  });

  it('should accurately process splice()', () => {
    const bd = new BlockDeque<number>(4);
    for (let i = 0; i < 5; i++) bd.push(i); // 0, 1, 2, 3, 4

    const removed = bd.splice(1, 2, 99, 100);
    expect(removed).toEqual([1, 2]);
    expect(bd.toArray()).toEqual([0, 99, 100, 3, 4]);

    // Omit delete count
    const removed2 = bd.splice(3);
    expect(removed2).toEqual([3, 4]);
    expect(bd.toArray()).toEqual([0, 99, 100]);
    
    // Negative start
    bd.splice(-1, 1, 88);
    expect(bd.toArray()).toEqual([0, 99, 88]);
  });

  it('should support native iteration [Symbol.iterator]()', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(10, 20, 30, 40, 50);

    const res: number[] = [];
    for (const val of bd) {
      res.push(val);
    }
    expect(res).toEqual([10, 20, 30, 40, 50]);
  });
});
