import { describe, it, expect } from 'vitest';
import { BlockArrayBase } from '../block-array-base';

// @ts-expect-error
// A minimal concrete class to expose protected methods for testing the Base core
class TestBaseArray<T> extends BlockArrayBase<T> {
  constructor(B: number = 4) {
    super(B);
  }

  public insertAt(bi: number, li: number, value: T) {
    this._insertAt(bi, li, value);
  }

  public deleteAt(bi: number, li: number): T {
    return this._deleteAt(bi, li);
  }

  public forceMerge(bi: number) {
    this._tryMerge(bi);
  }

  // Helper to force state for precise boundary testing
  public setState(blocks: T[][]) {
    this.blocks = blocks;
    this.rebuildPrefixSums();
    this._length = this.prefixSums[this.prefixSums.length - 1] + this.blocks[this.blocks.length - 1].length;
  }
}

describe('BlockArrayBase Coverage', () => {
  it('should handle capacity, clear(reuse), reserve, and shrinkToFit', () => {
    const arr = new TestBaseArray<number>(4);
    arr.insertAt(0, 0, 10);
    arr.insertAt(0, 1, 20);

    expect(arr.isEmpty()).toBe(false);
    expect(arr.capacity).toBe(2); // capacity matches length in BA

    // Call no-ops to satisfy coverage
    expect(() => arr.reserve(100)).not.toThrow();
    expect(() => arr.shrinkToFit()).not.toThrow();

    // Test clear(true) - Reuse
    const oldFirstBlock = arr.blocks[0];
    arr.clear(true);
    expect(arr.isEmpty()).toBe(true);
    expect(arr.length).toBe(0);
    // The physical array reference should be retained but emptied
    expect(arr.blocks[0]).toBe(oldFirstBlock);
    expect(arr.blocks[0].length).toBe(0);

    // Test clear(false) - No Reuse
    arr.insertAt(0, 0, 99);
    const newFirstBlock = arr.blocks[0];
    arr.clear(false);
    expect(arr.isEmpty()).toBe(true);
    // The physical array reference should be completely new
    expect(arr.blocks[0]).not.toBe(newFirstBlock);
    expect(arr.blocks[0].length).toBe(0);
  });

  it('should support native iteration via Symbol.iterator', () => {
    const arr = new TestBaseArray<number>(2); // B=2
    arr.insertAt(0, 0, 1);
    arr.insertAt(0, 1, 2);
    arr.insertAt(0, 2, 3);
    // At this point it should have split into two blocks: [1], [2, 3]

    const result = [];
    for (const val of arr) {
      result.push(val);
    }
    expect(result).toEqual([1, 2, 3]);
  });

  describe('_tryMerge Boundary Tests', () => {
    it('should merge with the next block if combined size <= B', () => {
      const arr = new TestBaseArray<number>(4);
      arr.setState([[1, 2], [3, 4], [5, 6]]);

      // Force tryMerge on block 0. 
      // Block 0 (len 2) + Block 1 (len 2) <= 4. It should merge with next.
      arr.forceMerge(0);

      expect(arr.blocks.length).toBe(2);
      expect(arr.blocks[0]).toEqual([1, 2, 3, 4]);
      expect(arr.blocks[1]).toEqual([5, 6]);
      // Verify prefix sums are rebuilt correctly inside tryMerge
      expect(arr.prefixSums).toEqual([0, 4]);
    });

    it('should merge with the previous block if next block is too large, but previous is small', () => {
      const arr = new TestBaseArray<number>(4);
      arr.setState([[1, 2], [3, 4], [5, 6, 7]]);

      // Force tryMerge on block 1.
      // Block 1 (len 2) + Block 2 (len 3) = 5 > 4. (Cannot merge with next).
      // Block 1 (len 2) + Block 0 (len 2) = 4 <= 4. (Should merge with previous).
      arr.forceMerge(1);

      expect(arr.blocks.length).toBe(2);
      expect(arr.blocks[0]).toEqual([1, 2, 3, 4]);
      expect(arr.blocks[1]).toEqual([5, 6, 7]);
    });

    it('should merge with previous block if it is the very last block', () => {
      const arr = new TestBaseArray<number>(4);
      arr.setState([[1, 2, 3], [4], [5]]);

      // Force tryMerge on block 2 (the last block).
      // No next block exists.
      // Block 2 (len 1) + Block 1 (len 1) = 2 <= 4.
      arr.forceMerge(2);

      expect(arr.blocks.length).toBe(2);
      expect(arr.blocks[0]).toEqual([1, 2, 3]);
      expect(arr.blocks[1]).toEqual([4, 5]);
    });

    it('should cleanly remove a block if it becomes completely empty (except last block)', () => {
      const arr = new TestBaseArray<number>(4);
      arr.setState([[1, 2], [], [3, 4]]);

      arr.forceMerge(1); // Merge empty block

      expect(arr.blocks.length).toBe(2);
      expect(arr.blocks[0]).toEqual([1, 2]);
      expect(arr.blocks[1]).toEqual([3, 4]);
    });

    it('should organically trigger tryMerge via deleteAt', () => {
      const arr = new TestBaseArray<number>(4);
      arr.setState([[1, 2], [3, 4]]);

      // Delete from block 0
      const removed = arr.deleteAt(0, 1); // removes '2'
      expect(removed).toBe(2);

      // Block 0 becomes [1], Block 1 is [3, 4]. 
      // 1 + 2 = 3 <= 4, so they should merge!
      expect(arr.blocks.length).toBe(1);
      expect(arr.blocks[0]).toEqual([1, 3, 4]);
      expect(arr.length).toBe(3);
    });
  });
});
