import { describe, it, expect } from 'vitest';
import { SortedMultimap } from '../sorted-multimap';
import { KERNELS } from '../../../../test/kernels';

describe('SortedMultimap', () => {
  for (const { name, factory } of KERNELS) {
    describe(`With Kernel: ${name}`, () => {
      it('should support adding multiple values for the same key', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        
        mm.add('a', 1);
        mm.add('b', 2);
        mm.add('a', 3);

        expect(mm.size).toBe(3);
        expect(mm.count('a')).toBe(2);
        expect(mm.count('b')).toBe(1);
        expect(mm.count('c')).toBe(0);

        expect([...mm.get('a')]).toEqual([1, 3]);
        expect([...mm.get('b')]).toEqual([2]);
      });

      it('should maintain keys in sorted order', () => {
        const mm = new SortedMultimap<number, string>((a, b) => a - b, factory);
        mm.add(30, 'v30');
        mm.add(10, 'v10-1');
        mm.add(20, 'v20');
        mm.add(10, 'v10-2');

        const keys = [...mm.keys()];
        expect(keys).toEqual([10, 10, 20, 30]);
        
        const entries = [...mm.entries()];
        expect(entries).toEqual([
          [10, 'v10-1'],
          [10, 'v10-2'],
          [20, 'v20'],
          [30, 'v30']
        ]);
      });

      it('should delete all entries associated with a key', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        mm.add('a', 1).add('a', 2).add('b', 3);

        expect(mm.delete('a')).toBe(2);
        expect(mm.size).toBe(1);
        expect(mm.count('a')).toBe(0);
        expect(mm.has('a')).toBe(false);
        expect(mm.get('b').next().value).toBe(3);
      });

      it('should correctly support equal_range and rank-based bounds', () => {
        const mm = new SortedMultimap<number, string>((a, b) => a - b, factory);
        mm.add(10, 'a1');
        mm.add(20, 'b1');
        mm.add(20, 'b2');
        mm.add(20, 'b3');
        mm.add(30, 'c1');

        const [start, end] = mm.equal_range(20);
        expect(start.index).toBe(1); // first 20
        expect(end.index).toBe(4);   // first element > 20 (which is 30)

        // rank-based bounds
        expect(mm.lowerBound(20)).toBe(1);
        expect(mm.upperBound(20)).toBe(4);
        expect(mm.rank(20)).toBe(1);
        expect(mm.rank(25)).toBe(4);

        // kth
        expect(mm.kth(1)).toEqual([20, 'b1']);
        expect(mm.kth(3)).toEqual([20, 'b3']);

        const values: string[] = [];
        for (let cur = start.clone(); cur.index < end.index; cur.next()) {
          values.push(cur.value!);
        }
        expect(values).toEqual(['b1', 'b2', 'b3']);
      });

      it('should support values() and [Symbol.iterator]()', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        mm.add('a', 1).add('b', 2).add('a', 3);

        expect([...mm.values()]).toEqual([1, 3, 2]);
        expect([...mm]).toEqual([
          ['a', 1],
          ['a', 3],
          ['b', 2]
        ]);
      });

      it('should support deleteOne to remove a single entry', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        mm.add('a', 1).add('a', 2).add('b', 3);

        expect(mm.deleteOne('a')).toBe(1);
        expect(mm.size).toBe(2);
        expect(mm.count('a')).toBe(1);
        expect([...mm.get('a')]).toEqual([2]); // Assumes stable insertion
      });

      it('should support min and max', () => {
        const mm = new SortedMultimap<number, string>((a, b) => a - b, factory);
        expect(mm.min()).toBeUndefined();

        mm.add(20, 'b');
        mm.add(10, 'a1');
        mm.add(10, 'a2');
        mm.add(30, 'c');

        expect(mm.min()).toEqual([10, 'a1']);
        expect(mm.max()).toEqual([30, 'c']);
      });

      it('should support cursor navigation (next, prev, seek, advance)', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        mm.add('a', 1).add('b', 2).add('c', 3);

        const cur = mm.cursor(1); // points to 'b':2
        expect(cur.key).toBe('b');
        expect(cur.value).toBe(2);
        
        cur.next();
        expect(cur.key).toBe('c');
        
        cur.prev();
        expect(cur.key).toBe('b');

        expect(cur.seek(0)).toBe(true);
        expect(cur.key).toBe('a');

        expect(cur.advance(2)).toBe(true);
        expect(cur.key).toBe('c');
      });

      it('should handle complex objects and multi-indexing simulation', () => {
        interface User { id: number; age: number; name: string }
        const users: User[] = [
          { id: 1, age: 25, name: 'Alice' },
          { id: 2, age: 30, name: 'Bob' },
          { id: 3, age: 25, name: 'Charlie' },
          { id: 4, age: 20, name: 'David' },
        ];

        // Creating an index by Age
        const ageIndex = new SortedMultimap<number, User>((a, b) => a - b, factory);
        users.forEach(u => ageIndex.add(u.age, u));

        expect(ageIndex.size).toBe(4);
        
        // Find everyone aged 25
        const age25 = [...ageIndex.get(25)];
        expect(age25.length).toBe(2);
        expect(age25.map(u => u.name)).toContain('Alice');
        expect(age25.map(u => u.name)).toContain('Charlie');

        // Find everyone younger than 30 (range query)
        const youngerThan30: User[] = [];
        const endCur = ageIndex.lower_bound(30);
        for (let cur = ageIndex.cursor(0); cur.index < endCur.index; cur.next()) {
          youngerThan30.push(cur.value!);
        }
        expect(youngerThan30.map(u => u.name)).toEqual(['David', 'Alice', 'Charlie']);
      });

      it('should work with InternalMapIterable functional methods (Unpacked)', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        mm.add('a', 10).add('a', 20).add('b', 30);

        // map should receive (value, key, index)
        const results = mm.map((v, k) => `${k}:${v}`);
        expect(results).toEqual(['a:10', 'a:20', 'b:30']);

        let total = 0;
        mm.forEach(v => total += v);
        expect(total).toBe(60);
      });

      it('should handle edge cases like deleting non-existent keys', () => {
        const mm = new SortedMultimap<number, number>(undefined, factory);
        mm.add(1, 100);
        expect(mm.delete(99)).toBe(0);
        expect(mm.size).toBe(1);
      });

      it('should clear correctly', () => {
        const mm = new SortedMultimap<string, number>(undefined, factory);
        mm.add('a', 1).add('b', 2);
        mm.clear();
        expect(mm.size).toBe(0);
        expect(mm.has('a')).toBe(false);
      });
    });
  }
});
