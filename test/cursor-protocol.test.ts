import { describe, it, expect } from 'vitest';
import { BlockArray } from '../src/block-array';
import { BlockDeque } from '../src/block-deque';
import { BlockList } from '../src/block-list';
import { SortedBlockArray } from '../src/sorted-block-array';
import { SortedBlockDeque } from '../src/sorted-block-deque';
import { SortedBlockList } from '../src/sorted-block-list';
import { SplayTree } from '../src/splay';

const ALL_CURSOR_PROVIDERS = [
  { name: 'BlockArray', factory: () => new BlockArray<number>(4) },
  { name: 'BlockDeque', factory: () => new BlockDeque<number>(4) },
  { name: 'BlockList', factory: () => new BlockList<number>(4) },
  { name: 'SortedBlockArray', factory: () => new SortedBlockArray<number>((a, b) => a - b, 4) },
  { name: 'SortedBlockDeque', factory: () => new SortedBlockDeque<number>((a, b) => a - b, 4) },
  { name: 'SortedBlockList', factory: () => new SortedBlockList<number>((a, b) => a - b, 4) },
  { name: 'SplayTree', factory: () => new SplayTree<number, any>((a, b) => a - b) },
];

describe('Cursor Protocol Compliance (Unified State Machine)', () => {
  ALL_CURSOR_PROVIDERS.forEach(({ name, factory }) => {
    describe(`Implementation: ${name}`, () => {

      it('should enforce strict boundary clamping on seek()', () => {
        const container = factory();
        // Populate data
        if ('push' in container) {
          container.push(10, 20, 30);
        } else {
          container.insert(10);
          container.insert(20);
          container.insert(30);
        }

        const len = container.length;
        const cur = container.cursor(0);

        // Right Boundary (End)
        expect(cur.seek(999)).toBe(false);
        expect(cur.state).toBe(1);
        expect(cur.index).toBe(len);
        expect(cur.active).toBe(false);

        // Left Boundary (Begin)
        expect(cur.seek(-999)).toBe(false);
        expect(cur.state).toBe(2);
        expect(cur.index).toBe(-1);
        expect(cur.active).toBe(false);
      });

      it('should support boundary recovery', () => {
        const container = factory();
        if ('push' in container) (container as any).push(10, 20, 30);
        else (container as any).insertMany?.([10, 20, 30]) || (container as any).insert(10);

        const cur = container.cursor(0);

        // Recovery from Begin -> First Element
        cur.seek(-1);
        expect(cur.next()).toBe(true);
        expect(cur.state).toBe(0);
        expect(cur.index).toBe(0);
        expect(cur.value).toBeDefined();

        // Recovery from End -> Last Element
        cur.seek(container.length);
        expect(cur.prev()).toBe(true);
        expect(cur.state).toBe(0);
        expect(cur.index).toBe(container.length - 1);
        expect(cur.value).toBeDefined();
      });

      it('should stay at boundaries when hitting the wall', () => {
        const container = factory();
        if ('push' in container) (container as any).push(10, 20, 30);
        else (container as any).insertMany?.([10, 20, 30]) || (container as any).insert(10);

        const cur = container.cursor(0);

        // Hitting the Left Wall
        cur.seek(-1);
        expect(cur.prev()).toBe(false);
        expect(cur.state).toBe(2);
        expect(cur.index).toBe(-1);

        // Hitting the Right Wall
        cur.seek(container.length);
        expect(cur.next()).toBe(false);
        expect(cur.state).toBe(1);
        expect(cur.index).toBe(container.length);
      });

      it('should handle empty container boundaries correctly', () => {
        const container = factory(); // Empty
        expect(container.length).toBe(0);

        const cur = container.cursor(0);

        // Empty initial state should be End
        expect(cur.active).toBe(false);
        expect(cur.state).toBe(1);
        expect(cur.index).toBe(0);

        // prev() from End on empty should go to Begin
        expect(cur.prev()).toBe(false);
        expect(cur.state).toBe(2);
        expect(cur.index).toBe(-1);

        // next() from Begin on empty should return to End
        expect(cur.next()).toBe(false);
        expect(cur.state).toBe(1);
        expect(cur.index).toBe(0);
      });

      it('should maintain static index increment during traversal', () => {
        const container = factory();
        const data = [10, 20, 30, 40, 50];
        if ('push' in container) (container as any).push(...data);
        else data.forEach(v => (container as any).insert(v));

        const cur = container.cursor(0);
        let expectedIndex = 0;

        while (cur.active) {
          expect(cur.index).toBe(expectedIndex);
          cur.next();
          expectedIndex++;
        }
        expect(cur.index).toBe(data.length);
        expect(cur.state).toBe(1);
      });
    });
  });
});
