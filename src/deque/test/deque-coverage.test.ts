import { describe, it, expect } from 'vitest';
import { Deque } from '../deque';

describe('Deque Edge Cases & Coverage', () => {
  it('should test capacity, isEmpty, reserve, and shrinkToFit', () => {
    const deque = new Deque<number>(16);
    
    // Test isEmpty
    expect(deque.isEmpty()).toBe(true);
    deque.pushBack(1);
    expect(deque.isEmpty()).toBe(false);

    // Test initial capacity (nextPowerOfTwo(16) -> 16)
    expect(deque.capacity).toBe(16);

    // Test reserve
    deque.reserve(100);
    // nextPowerOfTwo(100) -> 128
    expect(deque.capacity).toBe(128);

    // Test reserve ignoring smaller requests
    deque.reserve(50);
    expect(deque.capacity).toBe(128);

    // Test shrinkToFit
    deque.shrinkToFit();
    // length is 1, minimum capacity is 16. nextPowerOfTwo(max(1, 16)) -> 16
    expect(deque.capacity).toBe(16);
    
    // Fill to 20
    for (let i = 0; i < 20; i++) deque.pushBack(i);
    expect(deque.capacity).toBe(32); // grew organically
    
    deque.shrinkToFit();
    // length is 21, nextPowerOfTwo(21) -> 32. Should stay 32.
    expect(deque.capacity).toBe(32);
    
    // Drain and shrink
    for (let i = 0; i < 15; i++) deque.popBack();
    expect(deque.length).toBe(6);
    deque.shrinkToFit(); // Should shrink back to 16
    expect(deque.capacity).toBe(16);
  });

  it('should handle peekFront and peekBack when length == 0', () => {
    const deque = new Deque<number>();
    expect(deque.peekFront()).toBeUndefined();
    expect(deque.peekBack()).toBeUndefined();
    
    // Verify they work normally
    deque.pushBack(10);
    expect(deque.peekFront()).toBe(10);
    expect(deque.peekBack()).toBe(10);
  });

  it('should throw RangeError for insert bounds', () => {
    const deque = new Deque<number>();
    deque.pushBack(1);
    deque.pushBack(2);

    expect(() => deque.insert(-1, 99)).toThrow(RangeError);
    expect(() => deque.insert(3, 99)).toThrow(RangeError); // length is 2, index 3 is out of bounds
  });

  it('should return undefined for remove out of bounds', () => {
    const deque = new Deque<number>();
    deque.pushBack(1);
    deque.pushBack(2);

    expect(deque.remove(-1)).toBeUndefined();
    expect(deque.remove(2)).toBeUndefined(); // length is 2, max index is 1
    expect(deque.length).toBe(2);
  });

  it('should handle resize edge cases and expansion', () => {
    const deque = new Deque<number>();
    
    // Invalid resize
    expect(() => deque.resize(-1)).toThrow(RangeError);

    // Expand resize
    deque.resize(5, 99);
    expect(deque.length).toBe(5);
    expect(deque.capacity).toBeGreaterThanOrEqual(16); // Should have triggered reserve internally
    expect(deque.toArray()).toEqual([99, 99, 99, 99, 99]);
    
    // No-op resize
    deque.resize(5, 88);
    expect(deque.length).toBe(5);
  });
});
