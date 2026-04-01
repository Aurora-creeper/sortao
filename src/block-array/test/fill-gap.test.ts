import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

describe('BlockArray resize', () => {
  it('should expand the array and maintain prefixSums', () => {
    const B = 4;
    const arr = new BlockArray<number>(B);
    
    arr.push(1, 2);
    expect(arr.length).toBe(2);
    expect((arr as any).prefixSums).toEqual([0]);

    // Expand
    arr.resize(11, 99);

    expect(arr.length).toBe(11);
    expect(arr.get(10)).toBe(99);
    expect(arr.get(0)).toBe(1);
    expect(arr.get(3)).toBe(99);
    expect(arr.get(4)).toBe(99);

    // Internal Check
    const blocks = (arr as any).blocks as any[][];
    const prefixSums = (arr as any).prefixSums as number[];
    
    expect(blocks.length).toBe(3);
    expect(prefixSums.length).toBe(3);
    
    let sum = 0;
    for (let i = 0; i < blocks.length; i++) {
      expect(prefixSums[i]).toBe(sum);
      sum += blocks[i].length;
    }
    expect(arr.length).toBe(sum);
  });

  it('should shrink the array correctly', () => {
    const B = 4;
    const arr = new BlockArray<number>(B);
    for (let i = 0; i < 20; i++) arr.push(i);
    
    expect(arr.length).toBe(20);
    expect((arr as any).blocks.length).toBeGreaterThan(1);
    
    arr.resize(5);
    
    expect(arr.length).toBe(5);
    expect(arr.get(4)).toBe(4);
    expect(arr.get(5)).toBeUndefined();
    
    const blocks = (arr as any).blocks as any[][];
    const prefixSums = (arr as any).prefixSums as number[];
    
    // 5 elements with B=4 means 2 blocks
    expect(blocks.length).toBe(2);
    expect(prefixSums.length).toBe(2);
    expect(blocks[1].length).toBe(1);
    expect(prefixSums[1]).toBe(4);
  });

  it('should throw RangeError if setting out of bounds', () => {
    const arr = new BlockArray<number>(4);
    arr.push(1);
    expect(() => arr.set(5, 10)).toThrowError(RangeError);
  });
});
