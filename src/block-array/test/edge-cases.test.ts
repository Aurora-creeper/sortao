import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

describe('BlockArray Edge Cases & Constraints', () => {
  it('should handle resize() with a massive gap safely', () => {
    const arr = new BlockArray<number>(4);
    arr.push(1);
    arr.resize(16, 999);

    expect(arr.length).toBe(16);
    expect(arr.get(0)).toBe(1);
    expect(arr.get(1)).toBe(999);
    expect(arr.get(14)).toBe(999);
    expect(arr.get(15)).toBe(999);

    const prefixSums = (arr as any).prefixSums as number[];
    expect(prefixSums[prefixSums.length - 1]).toBeLessThan(16);
  });

  it('should maintain prefix sums during extreme continuous splitting', () => {
    const B = 2; // Split happens at > 4
    const arr = new BlockArray<number>(B);
    
    // Always insert at index 0 to force continuous splitting of the first block
    for (let i = 0; i < 20; i++) {
      arr.insert(0, i);
    }

    expect(arr.length).toBe(20);
    expect(arr.get(0)).toBe(19);
    expect(arr.get(19)).toBe(0);

    const prefixSums = (arr as any).prefixSums as number[];
    const blocks = (arr as any).blocks as number[][];
    
    expect(prefixSums.length).toBe(blocks.length);
    let expectedSum = 0;
    for (let i = 0; i < blocks.length; i++) {
      expect(prefixSums[i]).toBe(expectedSum);
      expectedSum += blocks[i].length;
    }
  });

  it('should maintain prefix sums during massive continuous merging', () => {
    const B = 4;
    const arr = new BlockArray<number>(B);
    for (let i = 0; i < 20; i++) arr.push(i);

    // We have ~5 blocks. Let's delete every other element to force shrinking.
    for (let i = 18; i >= 0; i -= 2) {
      arr.delete(i);
    }

    expect(arr.length).toBe(10);
    
    const prefixSums = (arr as any).prefixSums as number[];
    const blocks = (arr as any).blocks as number[][];

    expect(prefixSums.length).toBe(blocks.length);
    let expectedSum = 0;
    for (let i = 0; i < blocks.length; i++) {
      expect(prefixSums[i]).toBe(expectedSum);
      expectedSum += blocks[i].length;
    }
  });

  it('should handle clearing an empty array', () => {
    const arr = new BlockArray<number>(4);
    arr.clear();
    expect(arr.length).toBe(0);
    expect(arr.isEmpty()).toBe(true);
    expect((arr as any).blocks.length).toBe(1);
    expect((arr as any).prefixSums.length).toBe(1);
  });

  it('should handle out of bounds gracefully for retrieval', () => {
    const arr = new BlockArray<number>(4);
    expect(arr.get(100)).toBeUndefined();
    expect(arr.at(-100)).toBeUndefined();
  });
});
