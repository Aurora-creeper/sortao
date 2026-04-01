import { describe, it, expect } from 'vitest';
import { BlockArray } from '../src/block-array';
import { BlockDeque } from '../src/block-deque';
import { BlockList } from '../src/block-list';
import { SortedBlockArray } from '../src/sorted-block-array';
import { SortedBlockDeque } from '../src/sorted-block-deque';
import { SortedBlockList } from '../src/sorted-block-list';
import { SplayTree } from '../src/splay';
import { SortedMap, SortedSet, SortedMultimap, SortedMultiset } from '../src/associative';


describe('deleteCursor operation on Kernels', () => {
  const KERNELS = [
    { name: 'BlockArray', create: () => new BlockArray<number>(4) },
    { name: 'BlockDeque', create: () => new BlockDeque<number>(4) },
    { name: 'BlockList', create: () => new BlockList<number>(4) },
    { name: 'SortedBlockArray', create: () => new SortedBlockArray<number>((a, b) => a - b, 4) },
    { name: 'SortedBlockDeque', create: () => new SortedBlockDeque<number>((a, b) => a - b, 4) },
    { name: 'SortedBlockList', create: () => new SortedBlockList<number>((a, b) => a - b, 4) },
    { name: 'SplayTree', create: () => new SplayTree<number, any>((a, b) => a - b) },
  ];

  for (const { name, create } of KERNELS) {
    it(`should successfully delete the element at the cursor for ${name}`, () => {
      const kernel = create() as any;
      if (kernel.push) kernel.push(10, 20, 30, 40, 50);
      else if (kernel.insertMany) kernel.insertMany([10, 20, 30, 40, 50]);
      else {
        [10, 20, 30, 40, 50].forEach(v => kernel.insert(v));
      }

      // [10, 20, 30, 40, 50]
      expect(kernel.length).toBe(5);

      const cur = kernel.cursor(2);
      expect(cur.active).toBe(true);

      kernel.deleteCursor(cur);

      expect(kernel.length).toBe(4);

      const val = kernel.get ? kernel.get(2) : kernel.kth(2);
      expect(val).toBe(40);
    });
  }
});

describe('deleteCursor operation on Set Wrappers', () => {
  const WRAPPERS = [
    { name: 'SortedSet', create: () => new SortedSet<number>() },
    { name: 'SortedMultiset', create: () => new SortedMultiset<number>() },
  ];

  for (const { name, create } of WRAPPERS) {
    it(`should successfully delete the element at the cursor for ${name}`, () => {
      const wrapper = create() as any;
      wrapper.add(10);
      wrapper.add(20);
      wrapper.add(30);

      const cur = wrapper.cursor(1); // 20
      expect(cur.active).toBe(true);

      wrapper.deleteCursor(cur);

      expect(wrapper.size || wrapper.length).toBe(2);
      expect(wrapper.has(20)).toBe(false);
      expect(wrapper.toArray()).toEqual([10, 30]);
    });
  }
});

describe('deleteCursor operation on Map Wrappers', () => {
  const MAPS = [
    { name: 'SortedMap', create: () => new SortedMap<number, string>() },
    { name: 'SortedMultimap', create: () => new SortedMultimap<number, string>() },
  ];

  for (const { name, create } of MAPS) {
    it(`should successfully delete the element at the cursor for ${name}`, () => {
      const map = create() as any;
      map.add ? map.add(10, 'A') : map.set(10, 'A');
      map.add ? map.add(20, 'B') : map.set(20, 'B');
      map.add ? map.add(30, 'C') : map.set(30, 'C');

      const cur = map.cursor(1); //  20
      expect(cur.active).toBe(true);

      map.deleteCursor(cur);

      expect(map.size || map.length).toBe(2);
      expect(map.has(20)).toBe(false);

      const arr: number[] = [];
      map.forEach((v: any, k: any) => { arr.push(k); });
      expect(arr).toEqual([10, 30]);
    });
  }
});
