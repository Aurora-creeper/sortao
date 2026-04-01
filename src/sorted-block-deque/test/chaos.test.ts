import { describe, it, expect } from 'vitest';
import { SortedBlockDeque } from '../sorted-block-deque';

function nativeInsert(arr: number[], val: number) {
  let L = 0;
  let R = arr.length - 1;
  while (L <= R) {
    const mid = (L + R) >> 1;
    if (arr[mid] <= val) L = mid + 1;
    else R = mid - 1;
  }
  arr.splice(L, 0, val);
}

function nativeDelete(arr: number[], val: number): boolean {
  let L = 0;
  let R = arr.length - 1;
  while (L <= R) {
    const mid = (L + R) >> 1;
    if (arr[mid] < val) L = mid + 1;
    else R = mid - 1;
  }
  if (L < arr.length && arr[L] === val) {
    arr.splice(L, 1);
    return true;
  }
  return false;
}

function verifyIntegrity(deque: SortedBlockDeque<number>) {
  const blocks = (deque as any).deque.blocks;
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

describe('SortedBlockDeque Chaos Test', () => {
  it('should survive 10,000 random complex operations without corrupting state or sorting', () => {
    const B = 16;
    const deque = new SortedBlockDeque<number>((a, b) => a - b, B);
    const shadow: number[] = [];

    const ITERATIONS = 10000;

    for (let i = 0; i < ITERATIONS; i++) {
      const op = Math.random();

      if (op < 0.25) {
        const val = Math.floor(Math.random() * 1000);
        deque.insert(val);
        nativeInsert(shadow, val);
      } else if (op < 0.40) {
        const count = Math.floor(Math.random() * 5) + 1;
        const vals = Array.from({ length: count }, () => Math.floor(Math.random() * 1000));
        deque.insertMany(vals);
        for (const val of vals) nativeInsert(shadow, val);
      } else if (op < 0.55) {
        if (shadow.length > 0) {
          const val = Math.random() < 0.5 
            ? shadow[Math.floor(Math.random() * shadow.length)] 
            : Math.floor(Math.random() * 1000);
          
          const expected = nativeDelete(shadow, val);
          expect(deque.delete(val)).toBe(expected);
        }
      } else if (op < 0.65) {
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          const expected = shadow.splice(idx, 1)[0];
          expect(deque.deleteAt(idx)).toBe(expected);
        }
      } else if (op < 0.75) {
        if (shadow.length > 0) {
          if (Math.random() < 0.5) {
            expect(deque.pop()).toBe(shadow.pop());
          } else {
            expect(deque.shift()).toBe(shadow.shift());
          }
        }
      } else if (op < 0.85) {
        const newB = Math.floor(Math.random() * 64) + 1;
        deque.rebase(newB);
        verifyIntegrity(deque);
      } else {
        if (shadow.length > 0) {
          const val = shadow[Math.floor(Math.random() * shadow.length)];
          
          let lBound = 0;
          while (lBound < shadow.length && shadow[lBound] < val) lBound++;
          
          let uBound = 0;
          while (uBound < shadow.length && shadow[uBound] <= val) uBound++;
          
          expect(deque.lowerBound(val)).toBe(lBound);
          expect(deque.upperBound(val)).toBe(uBound);
          expect(deque.rank(val)).toBe(lBound);
          expect(deque.indexOf(val)).toBe(lBound);
          expect(deque.lastIndexOf(val)).toBe(uBound - 1);
          expect(deque.includes(val)).toBe(true);
        }
      }

      if (i % 500 === 0) {
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
