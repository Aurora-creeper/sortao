import { describe, it, expect } from 'vitest';
import { SortedBlockArray } from '../sorted-block-array';

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

function verifyPrefixSums(arr: SortedBlockArray<number>) {
  const blocks = arr.blocks;
  const pre = arr.prefixSums;
  let sum = 0;
  for (let i = 0; i < blocks.length; i++) {
    expect(pre[i]).toBe(sum);
    sum += blocks[i].length;
  }
  expect(arr.length).toBe(sum);
}

describe('SortedBlockArray Chaos Test', () => {
  it('should survive 10,000 random complex operations without corrupting state or sorting', () => {
    const B = 16;
    const arr = new SortedBlockArray<number>((a, b) => a - b, B);
    const shadow: number[] = [];

    const ITERATIONS = 10000;

    for (let i = 0; i < ITERATIONS; i++) {
      const op = Math.random();

      if (op < 0.25) {
        // insert single
        const val = Math.floor(Math.random() * 1000);
        arr.insert(val);
        nativeInsert(shadow, val);
      } else if (op < 0.40) {
        // insertMany
        const count = Math.floor(Math.random() * 5) + 1;
        const vals = Array.from({ length: count }, () => Math.floor(Math.random() * 1000));
        arr.insertMany(vals);
        for (const val of vals) nativeInsert(shadow, val);
      } else if (op < 0.55) {
        // delete by value
        if (shadow.length > 0) {
          const val = Math.random() < 0.5 
            ? shadow[Math.floor(Math.random() * shadow.length)] 
            : Math.floor(Math.random() * 1000);
          
          const expected = nativeDelete(shadow, val);
          expect(arr.delete(val)).toBe(expected);
        }
      } else if (op < 0.70) {
        // deleteAt (by index)
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          const expected = shadow.splice(idx, 1)[0];
          expect(arr.deleteAt(idx)).toBe(expected);
        }
      } else if (op < 0.80) {
        // rebase
        const newB = Math.floor(Math.random() * 64) + 1;
        arr.rebase(newB);
      } else {
        // Queries
        if (shadow.length > 0) {
          const val = shadow[Math.floor(Math.random() * shadow.length)];
          
          let lBound = 0;
          while (lBound < shadow.length && shadow[lBound] < val) lBound++;
          
          let uBound = 0;
          while (uBound < shadow.length && shadow[uBound] <= val) uBound++;
          
          expect(arr.lowerBound(val)).toBe(lBound);
          expect(arr.upperBound(val)).toBe(uBound);
          expect(arr.rank(val)).toBe(lBound);
          expect(arr.indexOf(val)).toBe(lBound);
          expect(arr.lastIndexOf(val)).toBe(uBound - 1);
          expect(arr.includes(val)).toBe(true);
        }
      }

      if (i % 500 === 0) {
        verifyPrefixSums(arr);
        expect(arr.length).toBe(shadow.length);
        expect(arr.toArray()).toEqual(shadow);
      }
    }

    verifyPrefixSums(arr);
    expect(arr.length).toBe(shadow.length);
    expect(arr.toArray()).toEqual(shadow);
  });
});
