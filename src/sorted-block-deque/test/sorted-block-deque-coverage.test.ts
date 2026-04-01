import { describe, it, expect } from 'vitest';
import { SortedBlockDeque } from '../sorted-block-deque';

describe('SortedBlockDeque Delegated APIs Coverage', () => {
  it('should call delegated memory management and status APIs', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    
    expect(sbd.isEmpty()).toBe(true);
    
    // reserve and capacity
    sbd.reserve(100);
    expect(sbd.capacity).toBeGreaterThanOrEqual(100); 
    
    sbd.insertMany([1, 2, 3]);
    expect(sbd.isEmpty()).toBe(false);

    // shrinkToFit
    sbd.shrinkToFit(); 
    expect(sbd.capacity).toBeLessThan(100); // Because it drops unused pool blocks

    // clear(reuse)
    sbd.clear(true);
    expect(sbd.isEmpty()).toBe(true);
    expect(sbd.length).toBe(0);

    // clear(no-reuse)
    sbd.insert(99);
    sbd.clear(false);
    expect(sbd.isEmpty()).toBe(true);
  });

  it('should call delegated access APIs: get, at, kth', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([10, 20, 30, 40]);

    // get
    expect(sbd.get(1)).toBe(20);
    expect(sbd.get(10)).toBeUndefined();
    
    // at
    expect(sbd.at(-1)).toBe(40);
    expect(sbd.at(-4)).toBe(10);
    expect(sbd.at(10)).toBeUndefined();

    // kth
    expect(sbd.kth(2)).toBe(30);
    expect(sbd.kth(10)).toBeUndefined();
  });

  it('should support equal_range', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([10, 20, 20, 20, 30]);

    const [lower, upper] = sbd.equal_range(20);
    
    expect(lower.index).toBe(1);
    expect(lower.value).toBe(20);
    
    expect(upper.index).toBe(4);
    expect(upper.value).toBe(30);

    // Non-existent
    const [l2, u2] = sbd.equal_range(25);
    expect(l2.index).toBe(4);
    expect(u2.index).toBe(4);
  });

  it('should correctly handle indexOf and lastIndexOf returning -1 for missing values', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([10, 20, 20, 30]);

    expect(sbd.indexOf(20)).toBe(1);
    expect(sbd.lastIndexOf(20)).toBe(2);

    expect(sbd.indexOf(15)).toBe(-1);
    expect(sbd.lastIndexOf(15)).toBe(-1);

    expect(sbd.indexOf(40)).toBe(-1);
    expect(sbd.lastIndexOf(40)).toBe(-1);
    
    expect(sbd.indexOf(5)).toBe(-1);
    expect(sbd.lastIndexOf(5)).toBe(-1);
  });

  it('should support native iteration [Symbol.iterator]()', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([5, 4, 3, 2, 1]); // Will be sorted to 1,2,3,4,5

    const result: number[] = [];
    for (const val of sbd) {
      result.push(val);
    }

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
