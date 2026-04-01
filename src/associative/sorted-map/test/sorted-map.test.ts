import { describe, it, expect } from 'vitest';
import { SortedMap } from '../sorted-map';
import { KERNELS } from '../../../../test/kernels';

describe('SortedMap Core Operations', () => {
  for (const { name, factory } of KERNELS) {
    describe(`With Kernel: ${name}`, () => {

      it('should support basic set, get, and has operations', () => {
        const map = new SortedMap<string, number, any>(undefined, factory);

        map.set('b', 2);
        map.set('a', 1);
        map.set('c', 3);

        expect(map.size).toBe(3);
        expect(map.get('a')![1]).toBe(1);
        expect(map.get('b')![1]).toBe(2);
        expect(map.get('c')![1]).toBe(3);
        expect(map.has('b')).toBe(true);
        expect(map.has('d')).toBe(false);
      });

      it('should return undefined when getting a non-existent key', () => {
        const map = new SortedMap<string, number, any>(undefined, factory);
        map.set('a', 1);

        expect(map.get('b')).toBeUndefined();
        expect(map.get('A')).toBeUndefined(); // case-sensitive check
        expect(map.has('b')).toBe(false);
      });

      it('should overwrite existing values for the same key', () => {
        const map = new SortedMap<string, number, any>(undefined, factory);
        map.set('a', 1);
        map.set('a', 2); // Overwrite

        expect(map.size).toBe(1);
        expect(map.get('a')).toEqual(['a', 2]);
      });

      it('should support delete', () => {
        const map = new SortedMap<string, number, any>(undefined, factory);
        map.set('a', 1);
        map.set('b', 2);

        expect(map.delete('a')).toEqual(['a', 1]);
        expect(map.delete('a')).toBe(undefined);
        expect(map.size).toBe(1);
        expect(map.has('a')).toBe(false);
        expect(map.delete('c')).toBe(undefined);
      });

      it('should support clear', () => {
        const map = new SortedMap<string, number, any>(undefined, factory);
        map.set('a', 1);
        map.set('b', 2);

        map.clear();
        expect(map.size).toBe(0);
        expect(map.get('a')).toBeUndefined();
        expect(map.has('b')).toBe(false);

        // Ensure map is still usable after clear
        map.set('c', 3);
        expect(map.size).toBe(1);
        expect(map.get('c')).toEqual(["c", 3]);
      });

      it('should maintain sorted order in keys, values, and entries', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);
        map.set(30, 'c');
        map.set(10, 'a');
        map.set(20, 'b');

        expect([...map.keys()]).toEqual([10, 20, 30]);
        expect([...map.values()]).toEqual(['a', 'b', 'c']);
        expect([...map.entries()]).toEqual([
          [10, 'a'],
          [20, 'b'],
          [30, 'c'],
        ]);
        expect([...map]).toEqual([
          [10, 'a'],
          [20, 'b'],
          [30, 'c'],
        ]);
      });

      it('should support min and max', () => {
        const map = new SortedMap<number, string, any>((a, b) => a - b, factory);
        expect(map.min()).toBeUndefined();

        map.set(20, 'b');
        map.set(10, 'a');
        map.set(30, 'c');

        expect(map.min()).toEqual([10, 'a']);
        expect(map.max()).toEqual([30, 'c']);
      });

      it('should support cursor navigation (next, prev, seek, advance, clone)', () => {
        const map = new SortedMap<string, number, any>(undefined, factory);
        map.set('a', 1);
        map.set('b', 2);
        map.set('c', 3);
        map.set('d', 4);
        map.set('e', 5);

        // Basic next/prev
        const cur = map.cursor(1); // Point to 'b' (index 1)
        expect(cur.key).toBe('b');
        expect(cur.value).toBe(2);
        expect(cur.index).toBe(1);

        cur.next();
        expect(cur.key).toBe('c');
        expect(cur.index).toBe(2);

        cur.prev();
        expect(cur.key).toBe('b');

        // Seek
        expect(cur.seek(4)).toBe(true);
        expect(cur.key).toBe('e');
        expect(cur.seek(10)).toBe(false); // Out of bounds

        // Advance
        cur.seek(2); // 'c'
        expect(cur.advance(2)).toBe(true); // move +2 to 'e'
        expect(cur.key).toBe('e');

        expect(cur.advance(-3)).toBe(true); // move -3 to 'b'
        expect(cur.key).toBe('b');

        // Clone
        const curClone = cur.clone();
        expect(curClone.key).toBe('b');

        cur.next(); // move original to 'c'
        expect(cur.key).toBe('c');
        expect(curClone.key).toBe('b'); // clone should remain at 'b'
      });

      it('should correctly handle complex objects as keys with custom comparator', () => {
        interface Entity { id: number; name: string }

        // Comparator only compares 'id'
        const map = new SortedMap<Entity, string, any>((a, b) => a.id - b.id, factory);

        const key1: Entity = { id: 1, name: 'Alice' };
        const key2: Entity = { id: 2, name: 'Bob' };

        // Different object reference, but same 'id' (semantic equality)
        const key1_alt: Entity = { id: 1, name: 'Alice_Alt' };

        map.set(key1, 'First');
        map.set(key2, 'Second');

        expect(map.size).toBe(2);
        expect(map.get(key1)).toEqual([key1, 'First']);

        // Setting with a different object but same semantic key should OVERWRITE the value
        map.set(key1_alt, 'Updated');
        expect(map.size).toBe(2); // Size should not increase
        expect(map.get(key1)).toEqual([key1, 'Updated']);     // Access via original key
        expect(map.get(key1_alt)).toEqual([key1, 'Updated']); // Access via alternative key

        map.set(key1_alt, 'Updated', true);
        expect(map.size).toBe(2); // Size should not increase
        expect(map.get(key1)).toEqual([key1_alt, 'Updated']);     // Access via original key
        expect(map.get(key1_alt)).toEqual([key1_alt, 'Updated']); // Access via alternative key

        // Check if the original key reference is preserved (standard Map behavior)
        const keys = [...map.keys()];
        expect(keys[0]).toEqual(key1_alt);
        expect(keys[0]).not.toEqual(key1);
      });

    });
  }
});
