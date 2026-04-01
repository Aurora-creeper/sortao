import { describe, it, expect } from 'vitest';
import { BlockArray, BlockList, BlockDeque, SortedBlockArray, SortedBlockList, SortedBlockDeque } from '../src';

describe('Internal Iteration (forEach, map, filter, etc.)', () => {
  const collections = [
    { name: 'BlockArray', create: () => new BlockArray<number>(4) },
    { name: 'BlockList', create: () => new BlockList<number>(4) },
    { name: 'BlockDeque', create: () => new BlockDeque<number>(4) },
    { name: 'SortedBlockArray', create: () => new SortedBlockArray<number>((a, b) => a - b, 4) },
    { name: 'SortedBlockList', create: () => new SortedBlockList<number>((a, b) => a - b, 4) },
    { name: 'SortedBlockDeque', create: () => new SortedBlockDeque<number>((a, b) => a - b, 4) },
  ];

  collections.forEach(({ name, create }) => {
    it(`should support functional methods for ${name}`, () => {
      const col = create() as any;
      if ('push' in col) {
        col.push(1, 2, 3, 4, 5);
      } else if ('insert' in col) {
        col.insert(1); col.insert(2); col.insert(3); col.insert(4); col.insert(5);
      }

      // forEach (Verify it doesn't short-circuit accidentally)
      const res: number[] = [];
      col.forEach((v: number) => res.push(v));
      expect(res).toEqual([1, 2, 3, 4, 5]);

      // map
      expect(col.map((v: number) => v * 10)).toEqual([10, 20, 30, 40, 50]);

      // filter
      expect(col.filter((v: number) => v % 2 === 0)).toEqual([2, 4]);

      // some (short-circuit)
      let count = 0;
      expect(col.some((v: number) => {
        count++;
        return v === 3;
      })).toBe(true);
      expect(count).toBe(3); // Should stop at 3

      // every (short-circuit)
      count = 0;
      expect(col.every((v: number) => {
        count++;
        return v < 3;
      })).toBe(false);
      expect(count).toBe(3); // Should stop at 3 (where 3 < 3 is false)

      // find / findIndex
      expect(col.find((v: number) => v > 3)).toBe(4);
      expect(col.findIndex((v: number) => v > 3)).toBe(3);

      // reduce
      expect(col.reduce((acc: number, v: number) => acc + v, 0)).toBe(15);

      // indexOf / includes
      expect(col.indexOf(3)).toBe(2);
      expect(col.includes(5)).toBe(true);
      expect(col.includes(99)).toBe(false);
    });
  });
});

describe('Heterogeneous Searching (lower_bound_key)', () => {
  const sortedCollections = [
    { name: 'SortedBlockArray', create: () => new SortedBlockArray<{ k: number, v: string }>((a, b) => a.k - b.k, 4) },
    { name: 'SortedBlockList', create: () => new SortedBlockList<{ k: number, v: string }>((a, b) => a.k - b.k, 4) },
    { name: 'SortedBlockDeque', create: () => new SortedBlockDeque<{ k: number, v: string }>((a, b) => a.k - b.k, 4) },
  ];

  sortedCollections.forEach(({ name, create }) => {
    it(`should support lower_bound_key for ${name}`, () => {
      const col = create() as any;
      col.insert({ k: 10, v: 'a' });
      col.insert({ k: 20, v: 'b' });
      col.insert({ k: 30, v: 'c' });

      // Search by raw key
      const cur = col.lower_bound_key(20, (item: any, key: number) => item.k - key);
      expect(cur.active).toBe(true);
      expect(cur.value.v).toBe('b');
      expect(cur.index).toBe(1);

      const uCur = col.upper_bound_key(20, (item: any, key: number) => item.k - key);
      expect(uCur.active).toBe(true);
      expect(uCur.value.v).toBe('c');
      expect(uCur.index).toBe(2);

      expect(col.lowerBoundKey(20, (item: any, key: number) => item.k - key)).toBe(1);
      expect(col.upperBoundKey(20, (item: any, key: number) => item.k - key)).toBe(2);
    });
  });
});
