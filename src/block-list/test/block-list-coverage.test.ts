import { describe, it, expect } from 'vitest';
import { BlockList } from '../block-list';

describe('BlockList Coverage & Edge Cases', () => {
  it('should test capacity, isEmpty, reserve, and shrinkToFit', () => {
    const list = new BlockList<number>(16);
    expect(list.isEmpty()).toBe(true);
    expect(list.capacity).toBe(16); // 1 block of size 16

    list.push(1);
    expect(list.isEmpty()).toBe(false);

    // Test reserve
    list.reserve(100);
    // 100 elements / 16 = 6.25 -> 7 blocks total needed for 112 capacity.
    // 1 block is in `this.blocks` (size 16). 
    // pool will receive 6 blocks (6 * 16 = 96).
    // Total capacity = 16 + 96 = 112.
    expect(list.capacity).toBeGreaterThanOrEqual(100);

    // Test shrinkToFit
    list.shrinkToFit();
    expect(list.capacity).toBe(16); // Pool is emptied, only blocks left
    expect((list as any).pool.length).toBe(0);
  });

  it('should return undefined when get is out of bounds', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2);
    expect(list.get(-1)).toBeUndefined();
    expect(list.get(2)).toBeUndefined();
    expect(list.get(100)).toBeUndefined();
  });

  it('should support at() with positive and negative indices', () => {
    const list = new BlockList<number>(4);
    list.push(10, 20, 30);
    
    // Positive
    expect(list.at(0)).toBe(10);
    expect(list.at(2)).toBe(30);
    
    // Negative
    expect(list.at(-1)).toBe(30);
    expect(list.at(-3)).toBe(10);
    
    // Out of bounds
    expect(list.at(-4)).toBeUndefined();
    expect(list.at(3)).toBeUndefined();
  });

  it('should throw RangeError for set out of bounds and support negative indices', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2, 3);

    // Normal and negative set
    list.set(-1, 99);
    expect(list.get(2)).toBe(99);
    
    list.set(0, 88);
    expect(list.get(0)).toBe(88);

    // OOB set
    expect(() => list.set(3, 100)).toThrow(RangeError);
    expect(() => list.set(-4, 100)).toThrow(RangeError);
  });

  it('should throw RangeError for insert out of bounds', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2);

    expect(() => list.insert(-1, 99)).toThrow(RangeError);
    expect(() => list.insert(3, 99)).toThrow(RangeError); // length is 2, index 3 is OOB
    
    // Valid end insert
    list.insert(2, 99);
    expect(list.length).toBe(3);
  });

  it('should return undefined for delete out of bounds', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2);

    expect(list.delete(-1)).toBeUndefined();
    expect(list.delete(2)).toBeUndefined();
    expect(list.length).toBe(2);
  });

  it('should throw RangeError for invalid resize', () => {
    const list = new BlockList<number>(4);
    expect(() => list.resize(-1)).toThrow(RangeError);
  });

  it('should support [Symbol.iterator]()', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2, 3, 4, 5); // Spans 2 blocks

    const result = [];
    for (const item of list) {
      result.push(item);
    }

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
