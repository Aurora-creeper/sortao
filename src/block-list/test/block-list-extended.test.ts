import { describe, it, expect } from 'vitest';
import { BlockList } from '../block-list';

describe('BlockList Extended APIs', () => {
  it('should shift and unshift correctly', () => {
    const list = new BlockList<number>(4);
    list.unshift(3);
    list.unshift(1, 2);
    expect(list.toArray()).toEqual([1, 2, 3]);

    expect(list.shift()).toBe(1);
    expect(list.shift()).toBe(2);
    expect(list.toArray()).toEqual([3]);
    
    // Check invariants after unshift/shift
    list.push(4, 5, 6, 7);
    expect((list as any).blocks[0].length).toBe(4);
  });

  it('should rebase block sizes correctly', () => {
    const list = new BlockList<number>(4);
    for (let i = 0; i < 10; i++) list.push(i);
    expect((list as any).blocks.length).toBe(3); // 4, 4, 2

    list.rebase(8);
    expect((list as any).B).toBe(8);
    expect(list.length).toBe(10);
    expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    const blocks = (list as any).blocks;
    expect(blocks.length).toBe(2);
    expect(blocks[0].length).toBe(8);
    expect(blocks[1].length).toBe(2);
  });

  it('should reverse elements in place', () => {
    const list = new BlockList<number>(4);
    for (let i = 0; i < 7; i++) list.push(i);
    
    list.reverse();
    expect(list.toArray()).toEqual([6, 5, 4, 3, 2, 1, 0]);
    
    // Ensure blocks are still properly sized
    const blocks = (list as any).blocks;
    expect(blocks[0].length).toBe(4);
    expect(blocks[1].length).toBe(3);
  });

  it('should slice lists correctly', () => {
    const list = new BlockList<number>(4);
    for (let i = 0; i < 10; i++) list.push(i);
    
    const sliced = list.slice(2, 7);
    expect(sliced.length).toBe(5);
    expect(sliced.toArray()).toEqual([2, 3, 4, 5, 6]);
    
    // Ensure sliced list has correct invariants (B=4, so sizes should be 4, 1)
    const blocks = (sliced as any).blocks;
    expect(blocks.length).toBe(2);
    expect(blocks[0].length).toBe(4);
    expect(blocks[1].length).toBe(1);
  });

  it('should concat with arrays and other BlockLists', () => {
    const list1 = new BlockList<number>(4);
    list1.push(1, 2);
    
    const list2 = new BlockList<number>(4);
    list2.push(3, 4, 5);
    
    const combined = list1.concat(list2, [6, 7], 8);
    expect(combined.length).toBe(8);
    expect(combined.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    
    // Invariants check
    const blocks = (combined as any).blocks;
    expect(blocks.length).toBe(2);
    expect(blocks[0].length).toBe(4);
    expect(blocks[1].length).toBe(4);
  });

  it('should splice elements using the fallback loop mechanism', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2, 3, 4, 5, 6);
    
    // remove 3, 4 and insert 99
    const removed = list.splice(2, 2, 99);
    
    expect(removed).toEqual([3, 4]);
    expect(list.length).toBe(5);
    expect(list.toArray()).toEqual([1, 2, 99, 5, 6]);
    
    // Invariant check
    const blocks = (list as any).blocks;
    expect(blocks[0].length).toBe(4);
    expect(blocks[1].length).toBe(1);
  });
});
