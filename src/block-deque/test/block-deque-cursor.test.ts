import { describe, it, expect } from 'vitest';
import { BlockDeque } from '../block-deque';

describe('BlockDequeCursor', () => {
  it('should traverse forward correctly, handling L0 offsets', () => {
    const bd = new BlockDeque<number>(4);
    // Push elements to create multiple blocks.
    // Let's create an asymmetrical L0 block by unshifting!
    bd.unshift(3, 2, 1); // block 0 is now size 3 (not 4), elements are [3, 2, 1]
    bd.push(4, 5, 6, 7, 8, 9); // block 1 is size 4, block 2 is size 2

    const cur = bd.cursor(0);
    const results: number[] = [];
    while (cur.active) {
      results.push(cur.value!);
      cur.next();
    }
    expect(results).toEqual([3, 2, 1, 4, 5, 6, 7, 8, 9]);
    
    // next() when invalid should remain invalid and false
    expect(cur.next()).toBe(false);
    expect(cur.value).toBeUndefined();
  });

  it('should traverse backward correctly, handling L0 offsets', () => {
    const bd = new BlockDeque<number>(4);
    bd.unshift(3, 2, 1);
    bd.push(4, 5, 6, 7, 8, 9);

    const cur = bd.cursor(bd.length - 1);
    const results: number[] = [];
    while (cur.active) {
      results.push(cur.value!);
      cur.prev();
    }
    expect(results).toEqual([9, 8, 7, 6, 5, 4, 1, 2, 3]);
    
    // prev() when invalid should remain invalid and false
    expect(cur.prev()).toBe(false);
    expect(cur.value).toBeUndefined();
  });

  it('should support seek and advance', () => {
    const bd = new BlockDeque<number>(4);
    bd.unshift(3, 2, 1); // [3, 2, 1]
    bd.push(4, 5, 6, 7, 8, 9); // [3, 2, 1, 4, 5, 6, 7, 8, 9]

    const cur = bd.cursor(4); // Value 5
    expect(cur.value).toBe(5);
    expect(cur.index).toBe(4);

    cur.advance(3); // Index 7 -> Value 8
    expect(cur.value).toBe(8);

    cur.advance(-6); // Index 1 -> Value 2
    expect(cur.value).toBe(2);

    // Seek directly
    cur.seek(8); // Value 9
    expect(cur.value).toBe(9);
  });

  it('should mutate values correctly', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(10, 20, 30);

    const cur = bd.cursor(1);
    cur.set(99);
    
    expect(cur.value).toBe(99);
    expect(bd.get(1)).toBe(99);
  });

  it('should handle invalid state gracefully', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(1, 2, 3);

    const cur = bd.cursor(100);
    expect(cur.active).toBe(false);
    expect(cur.value).toBeUndefined();
    
    expect(() => cur.set(99)).toThrow(RangeError);
    
    // prev from out of bounds goes to last element (recovery)
    expect(cur.prev()).toBe(true);
    expect(cur.index).toBe(2);
    expect(cur.value).toBe(3);

    // seek to just past the end
    cur.seek(3);
    expect(cur.active).toBe(false);
    expect(cur.prev()).toBe(true); // Going back into valid bounds!
    expect(cur.index).toBe(2);
    expect(cur.value).toBe(3);

    // next from end
    cur.seek(3);
    expect(cur.active).toBe(false);
    expect(cur.next()).toBe(false); // remains invalid and clamped
    expect(cur.index).toBe(3);
  });

  it('should support clone', () => {
    const bd = new BlockDeque<number>(4);
    bd.push(1, 2, 3, 4, 5);

    const c1 = bd.cursor(2);
    const c2 = c1.clone();

    c1.next(); // c1 is now at index 3 (value 4)

    expect(c1.value).toBe(4);
    expect(c2.value).toBe(3); // c2 is unaffected
    
    // Mutate via clone
    c2.set(99);
    expect(bd.get(2)).toBe(99);
  });
});
