import { describe, it, expect } from 'vitest';
import { BlockArray } from '../block-array';

describe('BlockArray Uniformity Bug in slice()', () => {
  it('should not crash when accessing sliced array with non-uniform head', () => {
    const B = 4;
    const arr = new BlockArray<number>(B);
    for (let i = 0; i < 12; i++) arr.push(i); // 0 ~ 11
    
    // Slice starting from the middle of the first block
    const res = arr.slice(2, 10); 
    // Elements: [2, 3, 4, 5, 6, 7, 8, 9]
    // Expected physical blocks in res: [2, 3], [4, 5, 6, 7], [8, 9]
    
    expect(res.length).toBe(8);
    expect(res.get(7)).toBe(9);
  });
});
