import { describe, it, expect } from 'vitest';
import { Deque } from '../..';

describe('Deque', () => {
  it('should perform pushBack and popBack correctly', () => {
    const deque = new Deque<number>(4);
    deque.pushBack(1);
    deque.pushBack(2);
    deque.pushBack(3);

    expect(deque.length).toBe(3);
    expect(deque.popBack()).toBe(3);
    expect(deque.popBack()).toBe(2);
    expect(deque.popBack()).toBe(1);
    expect(deque.popBack()).toBeUndefined();
    expect(deque.length).toBe(0);
  });

  it('should perform pushFront and popFront correctly', () => {
    const deque = new Deque<number>(4);
    deque.pushFront(1);
    deque.pushFront(2);
    deque.pushFront(3);

    expect(deque.length).toBe(3);
    expect(deque.popFront()).toBe(3);
    expect(deque.popFront()).toBe(2);
    expect(deque.popFront()).toBe(1);
    expect(deque.popFront()).toBeUndefined();
  });

  it('should support mixed operations', () => {
    const deque = new Deque<number>(4);
    deque.pushBack(1);
    deque.pushFront(2);
    deque.pushBack(3);
    deque.pushFront(4); // [4, 2, 1, 3]

    expect(deque.toArray()).toEqual([4, 2, 1, 3]);
    expect(deque.popBack()).toBe(3);
    expect(deque.popFront()).toBe(4);
    expect(deque.toArray()).toEqual([2, 1]);
  });

  it('should grow automatically when capacity is reached', () => {
    const deque = new Deque<number>(2); // Initial capacity 2
    for (let i = 1; i <= 5; i++) {
      deque.pushBack(i);
    }
    expect(deque.length).toBe(5);
    expect((deque as any).buffer.length).toBeGreaterThan(4);
    expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should support random access with get and set', () => {
    const deque = new Deque<number>(8);
    [10, 20, 30, 40].forEach(v => deque.pushBack(v));

    expect(deque.get(0)).toBe(10);
    expect(deque.get(2)).toBe(30);
    expect(deque.get(10)).toBeUndefined();

    deque.set(1, 99);
    expect(deque.get(1)).toBe(99);
    expect(() => deque.set(10, 0)).toThrow(RangeError);
  });

  it('should be iterable (for...of)', () => {
    const deque = new Deque<number>();
    const values = [1, 2, 3, 4];
    values.forEach(v => deque.pushBack(v));

    const result: number[] = [];
    for (const val of deque) {
      result.push(val);
    }
    expect(result).toEqual(values);
  });

  it('should handle wraparound correctly during grow', () => {
    const deque = new Deque<number>(4);
    deque.pushBack(1);
    deque.pushBack(2);
    deque.popFront(); // head = 1, tail = 2
    deque.pushBack(3);
    deque.pushBack(4);
    deque.pushBack(5); // Should trigger grow when full

    expect(deque.toArray()).toEqual([2, 3, 4, 5]);
    expect(deque.popFront()).toBe(2);
  });

  it('should peek values without removing', () => {
    const deque = new Deque<number>();
    deque.pushBack(10);
    deque.pushFront(20);

    expect(deque.peekFront()).toBe(20);
    expect(deque.peekBack()).toBe(10);
    expect(deque.length).toBe(2);
  });

  it('should insert at arbitrary indices correctly', () => {
    const deque = new Deque<number>(8);
    [1, 2, 4, 5].forEach(v => deque.pushBack(v));

    deque.insert(2, 3); // Insert 3 at index 2 -> [1, 2, 3, 4, 5]
    expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);

    deque.insert(0, 0); // Insert at front
    expect(deque.get(0)).toBe(0);

    deque.insert(6, 6); // Insert at back
    expect(deque.peekBack()).toBe(6);
  });

  it('should remove from arbitrary indices correctly', () => {
    const deque = new Deque<number>(8);
    [0, 1, 2, 3, 4].forEach(v => deque.pushBack(v));

    expect(deque.remove(2)).toBe(2); // Remove index 2 -> [0, 1, 3, 4]
    expect(deque.toArray()).toEqual([0, 1, 3, 4]);
    expect(deque.length).toBe(4);

    expect(deque.remove(0)).toBe(0); // Remove front
    expect(deque.remove(2)).toBe(4); // Remove back
    expect(deque.toArray()).toEqual([1, 3]);
  });
});
