import { describe, it, expect } from 'vitest';
import { SortedBlockList } from '../sorted-block-list';

// Helper to keep native array sorted
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

function verifyIntegrity(list: SortedBlockList<number>) {
  const blocks = (list as any).list.blocks;
  const B = list.B;
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

describe('SortedBlockList Chaos Test', () => {
  it('should survive 10,000 random complex operations without corrupting state or sorting', () => {
    const B = 16;
    const list = new SortedBlockList<number>((a, b) => a - b, B);
    const shadow: number[] = [];

    const ITERATIONS = 10000;

    for (let i = 0; i < ITERATIONS; i++) {
      const op = Math.random();

      if (op < 0.25) {
        // insert single
        const val = Math.floor(Math.random() * 1000);
        list.insert(val);
        nativeInsert(shadow, val);
      } else if (op < 0.40) {
        // insertMany
        const count = Math.floor(Math.random() * 5) + 1;
        const vals = Array.from({ length: count }, () => Math.floor(Math.random() * 1000));
        list.insertMany(vals);
        for (const val of vals) nativeInsert(shadow, val);
      } else if (op < 0.55) {
        // delete by value
        if (shadow.length > 0) {
          // 50% chance to pick an existing value, 50% to pick random
          const val = Math.random() < 0.5 
            ? shadow[Math.floor(Math.random() * shadow.length)] 
            : Math.floor(Math.random() * 1000);
          
          const expected = nativeDelete(shadow, val);
          expect(list.delete(val)).toBe(expected);
        }
      } else if (op < 0.70) {
        // deleteAt (by index)
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          const expected = shadow.splice(idx, 1)[0];
          expect(list.deleteAt(idx)).toBe(expected);
        }
      } else if (op < 0.80) {
        // rebase
        const newB = Math.floor(Math.random() * 64) + 1; // Random block size between 1 and 64
        list.rebase(newB);
        verifyIntegrity(list);
      } else {
        // Queries (lowerBound, upperBound, rank, kth, indexOf)
        if (shadow.length > 0) {
          const val = shadow[Math.floor(Math.random() * shadow.length)];
          
          // Native lower bound
          let lBound = 0;
          while (lBound < shadow.length && shadow[lBound] < val) lBound++;
          
          // Native upper bound
          let uBound = 0;
          while (uBound < shadow.length && shadow[uBound] <= val) uBound++;
          
          expect(list.lowerBound(val)).toBe(lBound);
          expect(list.upperBound(val)).toBe(uBound);
          expect(list.rank(val)).toBe(lBound);
          expect(list.indexOf(val)).toBe(lBound);
          expect(list.lastIndexOf(val)).toBe(uBound - 1);
          expect(list.includes(val)).toBe(true);
        }
      }

      // Check integrity periodically to fail fast if something breaks
      if (i % 500 === 0) {
        verifyIntegrity(list);
        expect(list.length).toBe(shadow.length);
        expect(list.toArray()).toEqual(shadow);
      }
    }

    // Final grand verification
    verifyIntegrity(list);
    expect(list.length).toBe(shadow.length);
    expect(list.toArray()).toEqual(shadow);
  });
});
