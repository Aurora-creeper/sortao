// src/sorted-block-array/sorted-block-array.ts

import { BlockArrayBase } from '../block-array/block-array-base';
import { SortedKernel } from '../sorted-kernel';
import { SortedBlockArrayCursor } from './sorted-block-array-cursor';

/**
 * SortedBlockArray: A B+ Tree style Tiered Vector with loose boundaries.
 * It automatically maintains elements in sorted order and provides fast
 * insertion (O(B + N/B)), deletion, and O(log N) value searching.
 * 
 * Inherits the core physical chunking mechanics from BlockArrayBase.
 */
export class SortedBlockArray<T>
  extends BlockArrayBase<T>
  implements SortedKernel<T, SortedBlockArrayCursor<T>> {

  private readonly compare: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number, blockSize: number = 512) {
    super(blockSize);
    this.compare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
  }

  _make_cursor(bi: number = 0, li: number = 0): SortedBlockArrayCursor<T> {
    return new SortedBlockArrayCursor<T>(this, bi, li);
  }

  cursor(index: number = 0): SortedBlockArrayCursor<T> {
    const cur = this._make_cursor(0, 0);
    if (index !== 0) cur.seek(index);
    return cur;
  }

  /**
   * Primary source of truth for searching.
   * Returns a Cursor pointing to the first element >= value.
   * Time Complexity: O(log N)
   */
  lower_bound(value: T): SortedBlockArrayCursor<T> {
    if (this._length === 0) return this._make_cursor(0, 0);

    let low = 0;
    let high = this.blocks.length - 1;
    let bi = this.blocks.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const block = this.blocks[mid];
      if (block.length > 0 && this.compare(block[block.length - 1], value) >= 0) {
        bi = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    const block = this.blocks[bi];
    let L = 0, R = block.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (this.compare(block[mid], value) < 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }

    return this._make_cursor(bi, L);
  }

  /**
   * Heterogeneous searching: returns a Cursor pointing to the first element 
   * where compare(item, key) >= 0.
   */
  lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): SortedBlockArrayCursor<T> {
    if (this._length === 0) return this._make_cursor(0, 0);

    let low = 0;
    let high = this.blocks.length - 1;
    let bi = this.blocks.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const block = this.blocks[mid];
      if (block.length > 0 && compare(block[block.length - 1], key) >= 0) {
        bi = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    const block = this.blocks[bi];
    let L = 0, R = block.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (compare(block[mid], key) < 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }

    return this._make_cursor(bi, L);
  }

  /**
   * Primary source of truth for searching.
   * Returns a Cursor pointing to the first element > value.
   * Time Complexity: O(log N)
   */
  upper_bound(value: T): SortedBlockArrayCursor<T> {
    if (this._length === 0) return this._make_cursor(0, 0);

    let low = 0;
    let high = this.blocks.length - 1;
    let bi = this.blocks.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const block = this.blocks[mid];
      if (block.length > 0 && this.compare(block[block.length - 1], value) > 0) {
        bi = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    const block = this.blocks[bi];
    let L = 0, R = block.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (this.compare(block[mid], value) <= 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }

    return this._make_cursor(bi, L);
  }

  /**
   * Heterogeneous searching: returns a Cursor pointing to the first element 
   * where compare(item, key) > 0.
   */
  upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): SortedBlockArrayCursor<T> {
    if (this._length === 0) return this._make_cursor(0, 0);

    let low = 0;
    let high = this.blocks.length - 1;
    let bi = this.blocks.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const block = this.blocks[mid];
      if (block.length > 0 && compare(block[block.length - 1], key) > 0) {
        bi = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    const block = this.blocks[bi];
    let L = 0, R = block.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (compare(block[mid], key) <= 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }

    return this._make_cursor(bi, L);
  }

  lowerBound(value: T): number {
    return this.lower_bound(value).index;
  }

  upperBound(value: T): number {
    return this.upper_bound(value).index;
  }

  lowerBoundKey<K>(key: K, compare: (item: T, key: K) => number): number {
    return this.lower_bound_key(key, compare).index;
  }

  upperBoundKey<K>(key: K, compare: (item: T, key: K) => number): number {
    return this.upper_bound_key(key, compare).index;
  }

  equal_range(value: T): [SortedBlockArrayCursor<T>, SortedBlockArrayCursor<T>] {
    return [this.lower_bound(value), this.upper_bound(value)];
  }

  rank(value: T): number {
    return this.lowerBound(value);
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    const [bi, li] = this._findBlockByIndex(index);
    return this.blocks[bi][li];
  }

  at(index: number): T | undefined {
    if (index < 0) index += this._length;
    return this.get(index);
  }

  kth(index: number): T | undefined {
    return this.get(index);
  }

  insert(value: T): void {
    const cursor = this.upper_bound(value);
    this._insertAt(cursor.blockIndex, cursor.localIndex, value);
  }

  insertMany(values: T[]): void {
    const sorted = [...values].sort(this.compare);
    for (let i = 0; i < sorted.length; i++) {
      this.insert(sorted[i]);
    }
  }

  delete(value: T): boolean {
    if (this._length === 0) return false;
    const cursor = this.lower_bound(value);
    if (cursor.active && this.compare(cursor.value!, value) === 0) {
      this._deleteAt(cursor.blockIndex, cursor.localIndex);
      return true;
    }
    return false;
  }

  deleteAt(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    const [bi, li] = this._findBlockByIndex(index);
    return this._deleteAt(bi, li);
  }

  deleteCursor(cursor: SortedBlockArrayCursor<T>): T | undefined {
    if (!cursor.active) return undefined;
    return this._deleteAt(cursor.blockIndex, cursor.localIndex);
  }

  rebase(newBlockSize?: number): void {
    if (newBlockSize !== undefined && newBlockSize > 0) {
      this.B = newBlockSize;
    }

    if (this._length === 0) {
      this.clear();
      return;
    }

    const allItems = this.toArray();
    const newBlocks: T[][] = [];
    for (let i = 0; i < allItems.length; i += this.B) {
      newBlocks.push(allItems.slice(i, i + this.B));
    }

    this.blocks = newBlocks;
    this.rebuildPrefixSums();
    this.isUniform = true;
  }

  indexOf(value: T): number {
    if (this._length === 0) return -1;
    const cursor = this.lower_bound(value);
    if (cursor.active && this.compare(cursor.value!, value) === 0) {
      return cursor.index;
    }
    return -1;
  }

  lastIndexOf(value: T): number {
    if (this._length === 0) return -1;
    const cursor = this.upper_bound(value);
    cursor.prev(); // Move back one step to the last element <= value
    if (cursor.active && this.compare(cursor.value!, value) === 0) {
      return cursor.index;
    }
    return -1;
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1;
  }
}
