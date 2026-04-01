import { describe, it, expect } from 'vitest';
import { SortedBlockList } from '../sorted-block-list';

describe('SortedBlockList', () => {
  it('should insert items in sorted order', () => {
    const list = new SortedBlockList<number>((a, b) => a - b, 4);
    list.insert(5);
    list.insert(1);
    list.insert(3);
    list.insert(2);
    list.insert(4);

    expect(list.length).toBe(5);
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
    
    // Invariant check: B=4, length=5 -> blocks: [4], [1]
    const blocks = (list as any).list.blocks;
    expect(blocks.length).toBe(2);
    expect(blocks[0].length).toBe(4);
    expect(blocks[1].length).toBe(1);
  });

  it('should find index of elements', () => {
    const list = new SortedBlockList<number>((a, b) => a - b, 4);
    list.insertMany([10, 20, 20, 20, 30]);

    expect(list.indexOf(20)).toBe(1);
    expect(list.lastIndexOf(20)).toBe(3);
    expect(list.indexOf(10)).toBe(0);
    expect(list.indexOf(30)).toBe(4);
    expect(list.indexOf(15)).toBe(-1);
    expect(list.includes(20)).toBe(true);
    expect(list.includes(99)).toBe(false);
  });

  it('should maintain stable insertion for duplicate elements', () => {
    // Objects to check reference stability
    const item1 = { val: 10, id: 1 };
    const item2 = { val: 10, id: 2 };
    const item3 = { val: 10, id: 3 };
    
    const list = new SortedBlockList<{val: number, id: number}>((a, b) => a.val - b.val, 4);
    list.insert(item1);
    list.insert(item2);
    list.insert(item3);
    
    const arr = list.toArray();
    expect(arr[0].id).toBe(1);
    expect(arr[1].id).toBe(2);
    expect(arr[2].id).toBe(3);
  });

  it('should cascade backward correctly during deletion', () => {
    const list = new SortedBlockList<number>((a, b) => a - b, 4);
    list.insertMany([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    // 9 items -> [4], [4], [1]
    list.delete(3);
    // 8 items -> [4], [4]
    
    expect(list.length).toBe(8);
    expect(list.toArray()).toEqual([1, 2, 4, 5, 6, 7, 8, 9]);
    
    const blocks = (list as any).list.blocks;
    expect(blocks.length).toBe(2);
    expect(blocks[0].length).toBe(4);
    expect(blocks[1].length).toBe(4);
  });

  it('should support rebase', () => {
    const list = new SortedBlockList<number>((a, b) => a - b, 4);
    list.insertMany([1, 2, 3, 4, 5, 6, 7]);
    
    list.rebase(8);
    expect((list as any).B).toBe(8);
    expect(list.length).toBe(7);
    
    const blocks = (list as any).list.blocks;
    expect(blocks.length).toBe(1);
    expect(blocks[0].length).toBe(7);
  });
});
