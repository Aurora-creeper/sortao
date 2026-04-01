import { describe, it, expect } from 'vitest';
import { SortedMap } from '../sorted-map';
import { KERNELS } from '../../../../test/kernels';

describe('SortedMap Bounds and Rank Queries', () => {
  for (const { name, factory } of KERNELS) {
    describe(`With Kernel: ${name}`, () => {

      it('should correctly execute lower_bound and upper_bound (Cursor returns)', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);

        map.set(10, 'A');
        map.set(20, 'B');
        map.set(20, 'C'); // Overwrites B
        map.set(30, 'D');
        map.set(40, 'E');

        // Keys: 10, 20, 30, 40

        // lower_bound: first element >= 20 (which is 20)
        let cur = map.lower_bound(20);
        expect(cur.active).toBe(true);
        expect(cur.key).toBe(20);
        expect(cur.value).toBe('C');

        // upper_bound: first element > 20 (which is 30)
        cur = map.upper_bound(20);
        expect(cur.active).toBe(true);
        expect(cur.key).toBe(30);

        // lower_bound for non-existent value in the middle: >= 25 (which is 30)
        cur = map.lower_bound(25);
        expect(cur.active).toBe(true);
        expect(cur.key).toBe(30);

        // upper_bound for max value: > 40 (out of bounds)
        cur = map.upper_bound(40);
        expect(cur.active).toBe(false);
      });

      it('should correctly execute lowerBound and upperBound (Rank returns)', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);

        [10, 20, 30, 40, 50].forEach(k => map.set(k, `V${k}`));

        expect(map.lowerBound(30)).toBe(2); // index of 30 is 2
        expect(map.upperBound(30)).toBe(3); // index of 40 is 3

        expect(map.lowerBound(25)).toBe(2); // first >= 25 is 30 (index 2)
        expect(map.upperBound(25)).toBe(2); // first > 25 is 30 (index 2)

        expect(map.lowerBound(100)).toBe(5); // out of bounds
      });

      it('should correctly execute rank and kth', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);

        // Insert out of order
        map.set(50, 'E');
        map.set(10, 'A');
        map.set(30, 'C');
        map.set(40, 'D');
        map.set(20, 'B');

        // Sorted: [10, A], [20, B], [30, C], [40, D], [50, E]

        // rank checks
        expect(map.rank(10)).toBe(0);
        expect(map.rank(25)).toBe(2); // 10 and 20 are strictly less than 25
        expect(map.rank(50)).toBe(4);
        expect(map.rank(100)).toBe(5);

        // kth checks
        expect(map.kth(0)).toEqual([10, 'A']);
        expect(map.kth(2)).toEqual([30, 'C']);
        expect(map.kth(4)).toEqual([50, 'E']);
        expect(map.kth(5)).toBeUndefined();
        expect(map.kth(-1)).toBeUndefined();
      });

      it('should support min and max', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);
        expect(map.min()).toBeUndefined();
        expect(map.max()).toBeUndefined();

        map.set(15, 'XV');
        map.set(5, 'V');
        map.set(25, 'XXV');

        expect(map.min()).toEqual([5, 'V']);
        expect(map.max()).toEqual([25, 'XXV']);
      });

      it('should work seamlessly with InternalIterable traversal', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);
        map.set(2, 'Two');
        map.set(1, 'One');
        map.set(3, 'Three');

        const keys = map.map((v, k) => k);
        expect(keys).toEqual([1, 2, 3]);

        const firstOver1 = map.findNode((v, k) => k > 1);
        expect(firstOver1).toEqual([2, 'Two']);
      });

    });
  }
});
