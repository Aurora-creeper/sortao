import { describe, it, expect } from 'vitest';
import { SortedBlockArray } from '../sorted-block-array';

describe('SortedBlockArray Edge Cases & Coverage', () => {
  it('should handle operations on an empty array gracefully', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    
    // Bounds on empty
    expect(sba.lower_bound(10).active).toBe(false);
    expect(sba.upper_bound(10).active).toBe(false);
    expect(sba.lowerBound(10)).toBe(0);
    expect(sba.upperBound(10)).toBe(0);
    
    // Range on empty
    const [l, u] = sba.equal_range(10);
    expect(l.active).toBe(false);
    expect(u.active).toBe(false);

    // Deletions on empty
    expect(sba.delete(10)).toBe(false);
    expect(sba.deleteAt(0)).toBeUndefined();
    expect(sba.deleteAt(-1)).toBeUndefined();

    // Index finding on empty
    expect(sba.indexOf(10)).toBe(-1);
    expect(sba.lastIndexOf(10)).toBe(-1);

    // Retrievals on empty
    expect(sba.get(0)).toBeUndefined();
    expect(sba.at(0)).toBeUndefined();
    expect(sba.kth(0)).toBeUndefined();
    expect(sba.includes(10)).toBe(false);
  });

  it('should support equal_range correctly', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([10, 20, 20, 20, 30]);

    const [lower, upper] = sba.equal_range(20);
    
    expect(lower.index).toBe(1);
    expect(lower.value).toBe(20);
    
    expect(upper.index).toBe(4);
    expect(upper.value).toBe(30);

    // Range for non-existent element
    const [l2, u2] = sba.equal_range(25);
    expect(l2.index).toBe(4); // points to 30
    expect(u2.index).toBe(4); // points to 30
  });

  it('should support get, at, and kth', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([1, 2, 3, 4, 5]);

    // get
    expect(sba.get(2)).toBe(3);
    expect(sba.get(10)).toBeUndefined();

    // at
    expect(sba.at(2)).toBe(3);
    expect(sba.at(-1)).toBe(5);
    expect(sba.at(-5)).toBe(1);
    expect(sba.at(-6)).toBeUndefined();

    // kth (alias for get)
    expect(sba.kth(2)).toBe(3);
    expect(sba.kth(10)).toBeUndefined();
  });

  it('should return -1 for indexOf and lastIndexOf when element is not found', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([10, 20, 30]);

    // Value smaller than all
    expect(sba.indexOf(5)).toBe(-1);
    expect(sba.lastIndexOf(5)).toBe(-1);

    // Value between elements
    expect(sba.indexOf(15)).toBe(-1);
    expect(sba.lastIndexOf(15)).toBe(-1);

    // Value larger than all
    expect(sba.indexOf(40)).toBe(-1);
    expect(sba.lastIndexOf(40)).toBe(-1);
  });

  it('should return correct boolean for delete on non-existent elements', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);
    sba.insertMany([10, 20, 30]);

    // Try to delete something smaller
    expect(sba.delete(5)).toBe(false);
    expect(sba.length).toBe(3);

    // Try to delete something in the middle
    expect(sba.delete(15)).toBe(false);

    // Try to delete something larger
    expect(sba.delete(40)).toBe(false);
    
    // Actually delete something
    expect(sba.delete(20)).toBe(true);
    expect(sba.length).toBe(2);
    expect(sba.toArray()).toEqual([10, 30]);
  });
});
