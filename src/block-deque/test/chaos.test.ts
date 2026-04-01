import { describe, it, expect } from 'vitest';
import { BlockDeque } from '../block-deque';

function verifyIntegrity<T>(deque: BlockDeque<T>) {
  const blocks = deque.blocks;
  const B = deque.B;
  let trueLen = 0;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks.get(i)!;
    trueLen += block.length;
    
    // Strict invariant: All blocks except first and last MUST be exactly size B
    if (i > 0 && i < blocks.length - 1) {
      expect(block.length).toBe(B);
    } else {
      expect(block.length).toBeLessThanOrEqual(B);
    }
  }
  expect(deque.length).toBe(trueLen);
}

describe('BlockDeque Chaos Test', () => {
  it('should survive 10,000 random complex operations without corrupting state', () => {
    const B = 16;
    const deque = new BlockDeque<number>(B);
    const shadow: (number | undefined)[] = [];

    const ITERATIONS = 10000;

    for (let i = 0; i < ITERATIONS; i++) {
      const op = Math.random();

      if (op < 0.15) {
        // insert
        const idx = Math.floor(Math.random() * (shadow.length + 1));
        const val = i;
        deque.insert(idx, val);
        shadow.splice(idx, 0, val);
      } else if (op < 0.3) {
        // delete
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          expect(deque.delete(idx)).toBe(shadow[idx]);
          shadow.splice(idx, 1);
        }
      } else if (op < 0.45) {
        // push
        const count = Math.floor(Math.random() * 5) + 1;
        const items = Array.from({ length: count }, (_, idx) => i * 100 + idx);
        deque.push(...items);
        shadow.push(...items);
      } else if (op < 0.60) {
        // unshift
        const count = Math.floor(Math.random() * 5) + 1;
        const items = Array.from({ length: count }, (_, idx) => i * 100 + idx);
        deque.unshift(...items);
        shadow.unshift(...items);
      } else if (op < 0.70) {
        // resize
        const newSize = Math.floor(Math.random() * (shadow.length + 20));
        deque.resize(newSize, i);
        while (shadow.length > newSize) shadow.pop();
        while (shadow.length < newSize) shadow.push(i);
      } else if (op < 0.80) {
        // set
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          deque.set(idx, i);
          shadow[idx] = i;
        }
      } else if (op < 0.90) {
        // pop / shift
        if (shadow.length > 0) {
          if (Math.random() < 0.5) {
            expect(deque.pop()).toBe(shadow.pop());
          } else {
            expect(deque.shift()).toBe(shadow.shift());
          }
        }
      } else {
        // random access
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          expect(deque.get(idx)).toBe(shadow[idx]);
        }
      }

      if (i % 100 === 0) {
        verifyIntegrity(deque);
        expect(deque.length).toBe(shadow.length);
        expect(deque.toArray()).toEqual(shadow);
      }
    }

    verifyIntegrity(deque);
    expect(deque.length).toBe(shadow.length);
    expect(deque.toArray()).toEqual(shadow);
  });
});
