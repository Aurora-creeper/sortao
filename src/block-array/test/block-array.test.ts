import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

describe('BlockArray', () => {
  it('should perform basic push and pop operations', () => {
    const arr = new BlockArray<number>(4);
    arr.push(1);
    arr.push(2);
    arr.push(3);

    expect(arr.length).toBe(3);
    expect(arr.get(0)).toBe(1);
    expect(arr.get(2)).toBe(3);
    expect(arr.pop()).toBe(3);
    expect(arr.length).toBe(2);
  });

  it('should insert and delete at specific indices', () => {
    const arr = new BlockArray<number>(4);
    arr.push(1);
    arr.push(3);
    arr.insert(1, 2); // [1, 2, 3]

    expect(arr.toArray()).toEqual([1, 2, 3]);
    expect(arr.delete(1)).toBe(2);
    expect(arr.toArray()).toEqual([1, 3]);
  });

  it('should split blocks when exceeding 2B', () => {
    // B = 2, so 2B = 4. 5th element should trigger split.
    const arr = new BlockArray<number>(2);
    for (let i = 1; i <= 5; i++) arr.push(i);

    expect(arr.length).toBe(5);
    // Accessing internal private property for structural validation
    const blocks = (arr as any).blocks;
    expect(blocks.length).toBeGreaterThan(2);
    expect(blocks[0].length).toBeLessThan(4); // Mid point of 5 is 2
    expect(blocks[1].length).toBeLessThan(4);
  });

  it('should merge blocks when combined size <= B', () => {
    // B = 4. Combined size 4 should trigger merge.
    const arr = new BlockArray<number>(4);
    // Fill to create two blocks: [1, 2, 3, 4, 5, 6, 7, 8, 9] 
    // After split (at > 8): blocks will be [1,2,3,4], [5,6,7,8,9]
    for (let i = 1; i <= 9; i++) arr.push(i);
    
    let blocks = (arr as any).blocks;
    expect(blocks.length).toBeGreaterThan(2);

    // Delete elements to trigger merge
    // Current sizes: 4 and 5. Total 9.
    // Delete from block 1 until total size <= B (4)
    for (let i = 0; i < 5; i++) {
      arr.delete(0);
    }
    
    // Now total size is 4, which is <= B. Should be merged.
    blocks = (arr as any).blocks;
    expect(blocks.length).toBe(1);
    expect(arr.length).toBe(4);
    expect(arr.toArray()).toEqual([6, 7, 8, 9]);
  });

  it('should handle index out of bounds', () => {
    const arr = new BlockArray<number>(4);
    expect(arr.get(0)).toBeUndefined();
    expect(() => arr.insert(1, 10)).toThrow(RangeError);
    
    arr.push(1);
    expect(arr.get(1)).toBeUndefined();
    expect(arr.delete(1)).toBeUndefined();
  });

  it('should set values correctly', () => {
    const arr = new BlockArray<number>(4);
    arr.push(10);
    arr.set(0, 20);
    expect(arr.get(0)).toBe(20);
  });

  it('should handle large scale random operations', () => {
    const arr = new BlockArray<number>(32);
    const shadow: number[] = [];
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const op = Math.random();
      if (op < 0.6) {
        // Insert
        const val = Math.floor(Math.random() * 1000);
        const idx = Math.floor(Math.random() * (shadow.length + 1));
        arr.insert(idx, val);
        shadow.splice(idx, 0, val);
      } else if (shadow.length > 0) {
        // Delete
        const idx = Math.floor(Math.random() * shadow.length);
        expect(arr.delete(idx)).toBe(shadow[idx]);
        shadow.splice(idx, 1);
      }
      
      if (i % 100 === 0) {
        expect(arr.length).toBe(shadow.length);
        expect(arr.toArray()).toEqual(shadow);
      }
    }

    expect(arr.toArray()).toEqual(shadow);
  });
});
