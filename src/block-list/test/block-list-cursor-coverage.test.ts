import { describe, it, expect } from 'vitest';
import { BlockList } from '../block-list';

describe('BlockListCursor Coverage', () => {
  it('should handle value getting when invalid', () => {
    const list = new BlockList<number>(4);
    const cursor = list.cursor(100); // Completely out of bounds
    expect(cursor.active).toBe(false);
    expect(cursor.value).toBeUndefined();
  });

  it('should handle set correctly and throw on out of bounds', () => {
    const list = new BlockList<number>(4);
    list.push(10);
    
    const cursor = list.cursor(0);
    expect(cursor.active).toBe(true);
    
    // Normal set
    cursor.set(99);
    expect(cursor.value).toBe(99);
    expect(list.get(0)).toBe(99);

    // OOB set
    const oobCursor = list.cursor(10);
    expect(() => oobCursor.set(100)).toThrow(RangeError);
  });

  it('should return false on next() when reaching the end', () => {
    const list = new BlockList<number>(4);
    list.push(1, 2, 3);
    
    const cursor = list.cursor(2); // Points to last element
    expect(cursor.active).toBe(true);
    
    // Move past the end
    const hasNext = cursor.next();
    expect(hasNext).toBe(false);
    expect(cursor.active).toBe(false);
    expect(cursor.value).toBeUndefined();
    
    // Calling next again should still be false
    expect(cursor.next()).toBe(false);
  });

  it('should support prev() traversal across blocks', () => {
    const list = new BlockList<number>(4);
    for (let i = 0; i < 10; i++) list.push(i);
    // Blocks: [0,1,2,3], [4,5,6,7], [8,9]
    
    const cursor = list.cursor(5); // Points to 5
    expect(cursor.value).toBe(5);
    
    expect(cursor.prev()).toBe(true);
    expect(cursor.value).toBe(4);
    
    // Cross block boundary backwards
    expect(cursor.prev()).toBe(true);
    expect(cursor.value).toBe(3);
    
    // Move to front
    cursor.seek(0);
    expect(cursor.prev()).toBe(false); // Can't go before 0
    expect(cursor.active).toBe(false);
  });

  it('should support advance()', () => {
    const list = new BlockList<number>(4);
    for (let i = 0; i < 10; i++) list.push(i);
    
    const cursor = list.cursor(2);
    expect(cursor.value).toBe(2);
    
    // Advance forward
    cursor.advance(5);
    expect(cursor.index).toBe(7);
    expect(cursor.value).toBe(7);
    
    // Advance backward
    cursor.advance(-4);
    expect(cursor.index).toBe(3);
    expect(cursor.value).toBe(3);
    
    // Advance out of bounds
    expect(cursor.advance(100)).toBe(false);
    expect(cursor.active).toBe(false);
  });

  it('should support clone()', () => {
    const list = new BlockList<number>(4);
    for (let i = 0; i < 5; i++) list.push(i);
    
    const cursor = list.cursor(2);
    const cloned = cursor.clone();
    
    expect(cloned.index).toBe(2);
    expect(cloned.value).toBe(2);
    
    // Modify clone, original shouldn't move
    cloned.next();
    expect(cloned.index).toBe(3);
    expect(cursor.index).toBe(2); // original unchanged
    
    // Modify underlying list via clone
    cloned.set(99);
    expect(list.get(3)).toBe(99);
  });
});
