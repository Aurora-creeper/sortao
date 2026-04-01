import { describe, it, expect } from 'vitest';
import { BlockArray } from '../block-array';

describe('BlockArray Additional Coverage', () => {
  it('should reverse elements correctly', () => {
    const arr = new BlockArray<number>(2);
    // Push enough to create multiple blocks
    arr.push(1, 2, 3, 4, 5);
    
    // Reverse
    arr.reverse();
    expect(arr.toArray()).toEqual([5, 4, 3, 2, 1]);
    expect(arr.length).toBe(5);

    // Reverse empty or single element array
    const emptyArr = new BlockArray<number>(2);
    emptyArr.reverse();
    expect(emptyArr.toArray()).toEqual([]);

    const singleArr = new BlockArray<number>(2);
    singleArr.push(1);
    singleArr.reverse();
    expect(singleArr.toArray()).toEqual([1]);
  });

  it('should handle concat with Native Arrays and Single Items', () => {
    const arr = new BlockArray<number>(2);
    arr.push(1, 2);

    // Concat native array and a single item
    const combined = arr.concat([3, 4, 5], 6);
    
    expect(combined.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(combined.length).toBe(6);
    // Original untouched
    expect(arr.toArray()).toEqual([1, 2]);
  });

  it('should prevent blocks array from becoming entirely empty during massive splice', () => {
    const arr = new BlockArray<number>(2);
    arr.push(1, 2, 3, 4);

    // Splice all elements out
    arr.spliceAll(0, 4, []);
    
    expect(arr.length).toBe(0);
    expect(arr.blocks.length).toBe(1); // Should have pushed an empty block
    expect(arr.blocks[0]).toEqual([]);
    expect(arr.prefixSums).toEqual([0]);
  });

  it('should handle shift deleting the last element in a block', () => {
    const arr = new BlockArray<number>(2);
    // Create blocks [ [1, 2], [3] ] (approximately, depending on B=2 behavior)
    arr.push(1, 2, 3);
    
    // Shift until the first block empties out and triggers this.blocks.shift()
    expect(arr.shift()).toBe(1);
    expect(arr.shift()).toBe(2);
    
    // Now block 0 should have been shifted away, leaving only [3]
    expect(arr.length).toBe(1);
    expect(arr.blocks.length).toBe(1);
    expect(arr.blocks[0]).toEqual([3]);

    // Shift last element
    expect(arr.shift()).toBe(3);
    expect(arr.length).toBe(0);
    // Array should handle empty shift safely
    expect(arr.shift()).toBeUndefined();
  });

  it('should fallback to insert(0, val) when unshifting into a full block', () => {
    const B = 2;
    const arr = new BlockArray<number>(B);
    
    // B=2, Max block size is 2*B = 4. 
    // We will artificially fill the first block to 4 to force the fallback branch.
    arr.blocks = [[1, 2, 3, 4]];
    arr.prefixSums = [0];
    // @ts-expect-error
    arr._length = 4;

    // Unshift a single value. Since block len is 4 (not < 2*B), it must fallback to insert(0, val).
    arr.unshift(99);

    expect(arr.length).toBe(5);
    expect(arr.get(0)).toBe(99);
    // Because it used insert(0, val), it should have triggered a split!
    expect(arr.blocks.length).toBeGreaterThan(1);
  });

  it('should set values correctly with negative indices', () => {
    const arr = new BlockArray<number>(4);
    arr.push(10, 20, 30);

    // Set using negative index
    arr.set(-1, 99); // sets index 2
    expect(arr.get(2)).toBe(99);

    arr.set(-3, 88); // sets index 0
    expect(arr.get(0)).toBe(88);

    // Extremely negative out of bounds
    expect(() => arr.set(-4, 100)).toThrow(RangeError);
  });

  it('should handle resize edge cases: negative, zero, and unchanged', () => {
    const arr = new BlockArray<number>(4);
    arr.push(1, 2, 3);

    // newSize < 0
    expect(() => arr.resize(-1)).toThrow(RangeError);

    // newSize === length (No-op)
    arr.resize(3);
    expect(arr.length).toBe(3);
    expect(arr.toArray()).toEqual([1, 2, 3]);

    // newSize === 0
    arr.resize(0);
    expect(arr.length).toBe(0);
    expect(arr.blocks).toEqual([[]]);
    expect(arr.prefixSums).toEqual([0]);
  });
});
