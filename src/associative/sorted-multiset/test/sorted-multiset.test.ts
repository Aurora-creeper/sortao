import { describe, it, expect } from 'vitest';
import { SortedMultiset } from '../sorted-multiset';
import { KERNELS } from '../../../../test/kernels';

describe('SortedMultiset', () => {
  for (const { name, factory } of KERNELS) {
    describe(`With Kernel: ${name}`, () => {
      it('should support multiple occurrences of the same value', () => {
        const ms = new SortedMultiset<number>(undefined, factory);
        
        ms.add(10);
        ms.add(20);
        ms.add(10);

        expect(ms.size).toBe(3);
        expect(ms.count(10)).toBe(2);
        expect(ms.count(20)).toBe(1);
        expect(ms.has(10)).toBe(true);
        expect(ms.has(30)).toBe(false);
      });

      it('should maintain elements in sorted order', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        [30, 10, 20, 10, 30].forEach(v => ms.add(v));

        expect(ms.toArray()).toEqual([10, 10, 20, 30, 30]);
        expect([...ms]).toEqual([10, 10, 20, 30, 30]);
      });

      it('should delete all occurrences of a value', () => {
        const ms = new SortedMultiset<number>(undefined, factory);
        ms.add(10).add(10).add(20);

        expect(ms.delete(10)).toBe(2);
        expect(ms.size).toBe(1);
        expect(ms.count(10)).toBe(0);
        expect(ms.has(10)).toBe(false);
      });

      it('should support deleteOne to remove a single occurrence', () => {
        const ms = new SortedMultiset<number>(undefined, factory);
        ms.add(10).add(10).add(20);

        expect(ms.deleteOne(10)).toBe(10);
        expect(ms.size).toBe(2);
        expect(ms.count(10)).toBe(1);
      });

      it('should support deleteAt a specific index', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        ms.add(10).add(10).add(20).add(30);
        // [10, 10, 20, 30]

        expect(ms.deleteAt(1)).toBe(10); // removes one of the 10s
        expect(ms.toArray()).toEqual([10, 20, 30]);
        expect(ms.size).toBe(3);
      });

      it('should correctly support rank, kth, and rank-based upperBound', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        [10, 10, 20, 30, 30].forEach(v => ms.add(v));

        expect(ms.rank(10)).toBe(0);
        expect(ms.rank(15)).toBe(2);
        expect(ms.rank(20)).toBe(2);
        expect(ms.rank(25)).toBe(3);
        expect(ms.rank(30)).toBe(3);
        expect(ms.rank(40)).toBe(5);

        expect(ms.upperBound(10)).toBe(2);
        expect(ms.upperBound(20)).toBe(3);
        expect(ms.upperBound(30)).toBe(5);

        expect(ms.kth(0)).toBe(10);
        expect(ms.kth(1)).toBe(10);
        expect(ms.kth(2)).toBe(20);
        expect(ms.kth(4)).toBe(30);
      });

      it('should support min and max', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        expect(ms.min()).toBeUndefined();

        ms.add(20).add(10).add(10).add(30);
        expect(ms.min()).toBe(10);
        expect(ms.max()).toBe(30);
      });

      it('should correctly support equal_range', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        [10, 20, 20, 20, 30].forEach(v => ms.add(v));

        const [start, end] = ms.equal_range(20);
        expect(start.index).toBe(1);
        expect(end.index).toBe(4);

        const sliced = ms.toArray().slice(start.index, end.index);
        expect(sliced).toEqual([20, 20, 20]);
      });

      it('should support lower_bound and upper_bound cursors', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        [10, 20, 20, 30].forEach(v => ms.add(v));

        const lb = ms.lower_bound(20);
        expect(lb.value).toBe(20);
        expect(lb.index).toBe(1);

        const ub = ms.upper_bound(20);
        expect(ub.value).toBe(30);
        expect(ub.index).toBe(3);
      });

      it('should support cursor navigation (next, prev, seek, advance)', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        [10, 20, 20, 30].forEach(v => ms.add(v));

        const cur = ms.cursor(1); // points to first 20
        expect(cur.value).toBe(20);
        expect(cur.index).toBe(1);

        cur.next();
        expect(cur.value).toBe(20);
        expect(cur.index).toBe(2);

        cur.prev();
        expect(cur.value).toBe(20);
        expect(cur.index).toBe(1);

        expect(cur.seek(3)).toBe(true);
        expect(cur.value).toBe(30);
      });

      it('should work with InternalIterable methods', () => {
        const ms = new SortedMultiset<number>((a, b) => a - b, factory);
        [1, 1, 2, 2].forEach(v => ms.add(v));

        const doubled = ms.map(v => v * 2);
        expect(doubled).toEqual([2, 2, 4, 4]);

        let sum = 0;
        ms.forEach(v => sum += v);
        expect(sum).toBe(6);
      });

      it('should clear correctly', () => {
        const ms = new SortedMultiset<number>(undefined, factory);
        ms.add(1).add(1);
        ms.clear();
        expect(ms.size).toBe(0);
        expect(ms.count(1)).toBe(0);
      });
    });
  }
});
