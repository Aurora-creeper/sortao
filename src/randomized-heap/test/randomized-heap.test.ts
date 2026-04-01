import { describe, it, expect } from 'vitest';
import { RandomizedHeap } from '../randomized-heap';

describe('RandomizedHeap', () => {
  it('should maintain heap property (min-heap)', () => {
    const heap = new RandomizedHeap<number>();
    const values = [5, 2, 8, 1, 9, 3];
    for (const v of values) heap.push(v);

    expect(heap.length).toBe(6);
    expect(heap.top()).toBe(1);

    const sorted = [];
    while (!heap.isEmpty()) {
      sorted.push(heap.pop());
    }
    expect(sorted).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('should support custom comparator (max-heap)', () => {
    const heap = new RandomizedHeap<number>((a, b) => b - a);
    const values = [5, 2, 8, 1, 9, 3];
    for (const v of values) heap.push(v);

    expect(heap.top()).toBe(9);

    const sorted = [];
    while (!heap.isEmpty()) {
      sorted.push(heap.pop());
    }
    expect(sorted).toEqual([9, 8, 5, 3, 2, 1]);
  });

  it('should support meld operation', () => {
    const h1 = new RandomizedHeap<number>();
    const h2 = new RandomizedHeap<number>();

    h1.push(10); h1.push(30);
    h2.push(20); h2.push(40);

    h1.meld(h2);

    expect(h1.length).toBe(4);
    expect(h2.length).toBe(0);
    expect(h2.top()).toBeUndefined();

    const results = [];
    while (!h1.isEmpty()) results.push(h1.pop());
    expect(results).toEqual([10, 20, 30, 40]);
  });

  it('should handle large amounts of data without crashing (depth test)', () => {
    const heap = new RandomizedHeap<number>();
    const SIZE = 10000;
    for (let i = SIZE; i > 0; i--) {
      heap.push(i);
    }

    expect(heap.length).toBe(SIZE);
    expect(heap.top()).toBe(1);

    for (let i = 1; i <= SIZE; i++) {
      expect(heap.pop()).toBe(i);
    }
  });

  it('should support forEach and toArray', () => {
    const heap = new RandomizedHeap<number>();
    heap.push(1); heap.push(2); heap.push(3);

    const arr = heap.toArray();
    expect(arr.length).toBe(3);
    expect(arr).toContain(1);
    expect(arr).toContain(2);
    expect(arr).toContain(3);
  });

  it('should support static from method', () => {
    const values = [5, 2, 8, 1, 9, 3];
    const heap = RandomizedHeap.from(values);

    expect(heap.length).toBe(6);
    expect(heap.top()).toBe(1);

    const sorted = [];
    while (!heap.isEmpty()) {
      sorted.push(heap.pop());
    }
    expect(sorted).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('should support static from with custom comparator', () => {
    const values = [5, 2, 8, 1, 9, 3];
    const heap = RandomizedHeap.from(values, (a, b) => b - a);

    expect(heap.top()).toBe(9);
    const sorted = [];
    while (!heap.isEmpty()) sorted.push(heap.pop());
    expect(sorted).toEqual([9, 8, 5, 3, 2, 1]);
  });

  it('should handle empty iterable in static from', () => {
    const heap = RandomizedHeap.from([]);
    expect(heap.length).toBe(0);
    expect(heap.top()).toBeUndefined();
  });
});
