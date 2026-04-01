import { describe, it, expect } from 'vitest';
import { BlockList } from '../block-list';

// Internal verifier to ensure strict invariants
function verifyIntegrity<T>(list: BlockList<T>) {
  const blocks = (list as any).blocks as any[];
  const B = (list as any).B as number;
  let trueLen = 0;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    trueLen += block.length;
    // Strict invariant: All blocks except the last MUST be exactly size B
    if (i < blocks.length - 1) {
      expect(block.length).toBe(B);
    } else {
      expect(block.length).toBeLessThanOrEqual(B);
    }
  }
  expect(list.length).toBe(trueLen);
}

describe('BlockList Chaos Test', () => {
  it('should survive 10,000 random complex operations without corrupting state', () => {
    const B = 16;
    const list = new BlockList<number>(B);
    const shadow: (number | undefined)[] = [];

    const ITERATIONS = 10000;

    for (let i = 0; i < ITERATIONS; i++) {
      const op = Math.random();

      if (op < 0.15) {
        // insert
        const idx = Math.floor(Math.random() * (shadow.length + 1));
        const val = i;
        list.insert(idx, val);
        shadow.splice(idx, 0, val);
      } else if (op < 0.3) {
        // delete
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          expect(list.delete(idx)).toBe(shadow[idx]);
          shadow.splice(idx, 1);
        }
      } else if (op < 0.45) {
        // push
        const count = Math.floor(Math.random() * 5) + 1;
        const items = Array.from({ length: count }, (_, idx) => i * 100 + idx);
        list.push(...items);
        shadow.push(...items);
      } else if (op < 0.6) {
        // resize
        const newSize = Math.floor(Math.random() * (shadow.length + 20));
        list.resize(newSize, i);
        while (shadow.length > newSize) shadow.pop();
        while (shadow.length < newSize) shadow.push(i);
      } else if (op < 0.75) {
        // set
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          list.set(idx, i);
          shadow[idx] = i;
        }
      } else if (op < 0.85) {
        // pop
        if (shadow.length > 0) {
          expect(list.pop()).toBe(shadow.pop());
        }
      } else {
        // random access
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          expect(list.get(idx)).toBe(shadow[idx]);
        }
      }

      if (i % 100 === 0) {
        verifyIntegrity(list);
        expect(list.length).toBe(shadow.length);
        expect(list.toArray()).toEqual(shadow);
      }
    }

    verifyIntegrity(list);
    expect(list.length).toBe(shadow.length);
    expect(list.toArray()).toEqual(shadow);
  });
});
