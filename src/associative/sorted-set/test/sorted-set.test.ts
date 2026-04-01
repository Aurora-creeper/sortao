import { describe, it, expect } from 'vitest';
import { SortedSet } from '../sorted-set';
import { KERNELS } from '../../../../test/kernels';

describe('SortedSet', () => {
  for (const { name, factory } of KERNELS) {
    describe(`With Kernel: ${name}`, () => {
      it('should support basic add, has, and delete operations', () => {
        const set = new SortedSet<number>(undefined, factory);

        set.add(20);
        set.add(10);
        set.add(30);

        expect(set.size).toBe(3);
        expect(set.has(10)).toBe(true);
        expect(set.has(20)).toBe(true);
        expect(set.has(30)).toBe(true);
        expect(set.has(15)).toBe(false);

        expect(set.delete(20)).toBe(20);
        expect(set.size).toBe(2);
        expect(set.has(20)).toBe(false);
        expect(set.delete(99)).toBe(undefined);
      });

      it('should ensure element uniqueness', () => {
        const set = new SortedSet<number>(undefined, factory);
        set.add(10);
        set.add(10); // Duplicate
        set.add(10);

        expect(set.size).toBe(1);
        expect(set.toArray()).toEqual([10]);
      });

      it('should maintain elements in sorted order', () => {
        const set = new SortedSet<number>((a, b) => a - b, factory);
        [50, 10, 40, 20, 30].forEach(v => set.add(v));

        expect(set.toArray()).toEqual([10, 20, 30, 40, 50]);
        expect([...set]).toEqual([10, 20, 30, 40, 50]);
      });

      it('should correctly support rank and kth queries', () => {
        const set = new SortedSet<number>((a, b) => a - b, factory);
        [10, 20, 30, 40, 50].forEach(v => set.add(v));

        expect(set.rank(10)).toBe(0);
        expect(set.rank(25)).toBe(2);
        expect(set.rank(50)).toBe(4);
        expect(set.rank(100)).toBe(5);

        expect(set.kth(0)).toBe(10);
        expect(set.kth(2)).toBe(30);
        expect(set.kth(4)).toBe(50);
        expect(set.kth(5)).toBeUndefined();
      });

      it('should support lower_bound, upper_bound and upperBound rank', () => {
        const set = new SortedSet<number>((a, b) => a - b, factory);
        [10, 20, 30, 40].forEach(v => set.add(v));

        // lower_bound
        const lb = set.lower_bound(20);
        expect(lb.value).toBe(20);
        expect(lb.index).toBe(1);

        // upper_bound
        const ub = set.upper_bound(20);
        expect(ub.value).toBe(30);
        expect(ub.index).toBe(2);

        // upperBound (rank)
        expect(set.upperBound(20)).toBe(2);
        expect(set.upperBound(25)).toBe(2);
        expect(set.upperBound(40)).toBe(4); // past end
      });

      it('should support cursor navigation', () => {
        const set = new SortedSet<number>((a, b) => a - b, factory);
        [10, 20, 30, 40].forEach(v => set.add(v));

        const cur = set.cursor(1); // points to 20
        expect(cur.value).toBe(20);
        expect(cur.index).toBe(1);

        cur.next();
        expect(cur.value).toBe(30);
        expect(cur.index).toBe(2);

        cur.prev();
        expect(cur.value).toBe(20);
        expect(cur.index).toBe(1);

        expect(cur.seek(3)).toBe(true);
        expect(cur.value).toBe(40);
      });

      it('should support min and max', () => {
        const set = new SortedSet<number>((a, b) => a - b, factory);
        expect(set.min()).toBeUndefined();
        expect(set.max()).toBeUndefined();

        set.add(100).add(50).add(150);
        expect(set.min()).toBe(50);
        expect(set.max()).toBe(150);
      });

      it('should work with InternalIterable functional methods', () => {
        const set = new SortedSet<number>((a, b) => a - b, factory);
        [1, 2, 3, 4, 5].forEach(v => set.add(v));

        const doubled = set.map(v => v * 2);
        expect(doubled).toEqual([2, 4, 6, 8, 10]);

        const filtered = set.filter(v => v % 2 === 0);
        expect(filtered).toEqual([2, 4]);

        let sum = 0;
        set.forEach(v => { sum += v; });
        expect(sum).toBe(15);
      });

      it('should clear correctly', () => {
        const set = new SortedSet<number>(undefined, factory);
        set.add(1).add(2);
        set.clear();
        expect(set.size).toBe(0);
        expect(set.has(1)).toBe(false);
      });
    });
  }
});
