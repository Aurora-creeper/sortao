import { describe, it, expect } from 'vitest';
import { BlockList } from '../block-list';

describe('BlockList', () => {
  it('should maintain strict O(1) mathematical indexing', () => {
    const B = 4;
    const list = new BlockList<number>(B);
    for (let i = 0; i < 10; i++) list.push(i);
    
    // 10 elements with B=4:
    // Block 0: [0, 1, 2, 3] (size 4)
    // Block 1: [4, 5, 6, 7] (size 4)
    // Block 2: [8, 9]       (size 2)
    
    expect(list.length).toBe(10);
    expect(list.get(0)).toBe(0);
    expect(list.get(4)).toBe(4);
    expect(list.get(9)).toBe(9);
    
    expect(list.blocks.length).toBe(3);
    expect(list.blocks[0].length).toBe(4);
    expect(list.blocks[1].length).toBe(4);
    expect(list.blocks[2].length).toBe(2);
  });

  it('should cascade forward correctly during insert', () => {
    const B = 4;
    const list = new BlockList<number>(B);
    for (let i = 0; i < 8; i++) list.push(i);
    // [0, 1, 2, 3], [4, 5, 6, 7]
    
    list.insert(2, 99);
    // [0, 1, 99, 2], [3, 4, 5, 6], [7]
    
    expect(list.length).toBe(9);
    expect(list.get(2)).toBe(99);
    expect(list.get(3)).toBe(2);
    expect(list.get(4)).toBe(3);
    expect(list.blocks.length).toBe(3);
    expect(list.blocks[0].length).toBe(4);
    expect(list.blocks[1].length).toBe(4);
    expect(list.blocks[2].length).toBe(1);
  });

  it('should cascade backward correctly during delete', () => {
    const B = 4;
    const list = new BlockList<number>(B);
    for (let i = 0; i < 9; i++) list.push(i);
    // [0, 1, 2, 3], [4, 5, 6, 7], [8]
    
    list.delete(2);
    // [0, 1, 3, 4], [5, 6, 7, 8]
    
    expect(list.length).toBe(8);
    expect(list.get(2)).toBe(3);
    expect(list.get(3)).toBe(4);
    expect(list.blocks.length).toBe(2);
    expect(list.blocks[0].length).toBe(4);
    expect(list.blocks[1].length).toBe(4);
  });

  it('should handle hysteresis tail buffer during pop', () => {
    const B = 4;
    const list = new BlockList<number>(B);
    list.push(1, 2, 3, 4, 5);
    // [1, 2, 3, 4], [5]
    
    list.pop(); // length 4, [1, 2, 3, 4], [] (hysteresis buffer)
    expect(list.blocks.length).toBe(2);
    expect(list.blocks[1].length).toBe(0);
    
    list.pop(); // length 3, [1, 2, 3], []
    // Wait, the hysteresis rule: keep at most one empty buffer.
    // When list.blocks[0] is not empty, list.blocks[1] can be empty.
    expect(list.blocks.length).toBe(1);
  });

  it('should support forEach and other CursorIterable methods', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2, 3);
    const res: number[] = [];
    list.forEach(v => res.push(v * 2));
    expect(res).toEqual([2, 4, 6]);
  });

  it('should not grow inner Deque capacity during middle insertion cascade', () => {
    const B = 16;
    const list = new BlockList<number>(B);
    // Fill up exactly 2 blocks
    for (let i = 0; i < 32; i++) list.push(i);
    
    // We spy on the internal buffer length of the first block
    const firstBlock = list.blocks[0] as any;
    const initialCapacity = firstBlock.buffer.length;
    
    // This expects to be 16 (since nextPowerOfTwo(16) = 16)
    expect(initialCapacity).toBe(16);
    
    // Now we trigger a cascade from the front
    // This will shift an element to block 1, and block 1 will shift to block 2
    list.insert(0, 999);
    
    // The capacity of block 0 should REMAIN 16, because of our Anticipatory Backward Cascade.
    // If it was broken (forward cascade), it would have grown to 32 before popping.
    expect(firstBlock.buffer.length).toBe(16);
    
    // Verify block 1 also didn't grow
    expect((list.blocks[1] as any).buffer.length).toBe(16);
    
    // Verify the state is correct
    expect(list.get(0)).toBe(999);
    expect(list.length).toBe(33);
    expect(list.blocks.length).toBe(3);
    expect(list.blocks[2].length).toBe(1);
  });
});
