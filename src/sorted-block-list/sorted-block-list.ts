// src/sorted-block-list/sorted-block-list.ts

import { BlockList, BlockListCursor } from '../block-list';
import { InternalIterable } from '../internal-iterable';
import { SortedKernel } from '../sorted-kernel';

/**
 * An Array-backed Tiered Vector with strict O(1) rank access.
 * 
 * Internally wraps a BlockList.
 */
export class SortedBlockList<T> extends InternalIterable<T> implements SortedKernel<T, BlockListCursor<T>> {
  private list: BlockList<T>;
  private readonly compare: (a: T, b: T) => number;

  /**
   * @param compareFn Optional comparison function. Defaults to ascending.
   * @param blockSize The strict size limit for all internal blocks except the last one.
   */
  constructor(compareFn?: (a: T, b: T) => number, blockSize: number = 512) {
    super();
    this.list = new BlockList<T>(blockSize);
    this.compare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
  }

  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    this.list._traverse(callback);
  }

  get length(): number { return this.list.length; }
  get capacity(): number { return this.list.capacity; }
  get B(): number { return this.list.B; }

  isEmpty(): boolean { return this.list.isEmpty(); }
  clear(reuse: boolean = true): void { this.list.clear(reuse); }
  reserve(n: number): void { this.list.reserve(n); }
  shrinkToFit(): void { this.list.shrinkToFit(); }

  cursor(index: number = 0): BlockListCursor<T> {
    return this.list.cursor(index);
  }

  get(index: number): T | undefined { return this.list.get(index); }
  at(index: number): T | undefined { return this.list.at(index); }
  kth(index: number): T | undefined { return this.list.get(index); }

  /**
   * Primary source of truth for searching: returns a Cursor pointing to the 
   * first element that is not less than (>=) the given value.
   */
  lower_bound(value: T): BlockListCursor<T> {
    let L = 0;
    let R = this.list.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      const midVal = this.list.get(mid)!;

      if (this.compare(midVal, value) < 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    return this.cursor(L);
  }

  /**
   * Heterogeneous searching: returns a Cursor pointing to the first element 
   * where compare(item, key) >= 0.
   */
  lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockListCursor<T> {
    let L = 0;
    let R = this.list.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (compare(this.list.get(mid)!, key) < 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    return this.cursor(L);
  }

  /**
   * Primary source of truth for searching: returns a Cursor pointing to the 
   * first element that is strictly greater than (>) the given value.
   * Time Complexity: O(log N)
   */
  upper_bound(value: T): BlockListCursor<T> {
    let L = 0;
    let R = this.list.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      const midVal = this.list.get(mid)!;

      if (this.compare(midVal, value) <= 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    return this.cursor(L);
  }

  /**
   * Heterogeneous searching: returns a Cursor pointing to the first element 
   * where compare(item, key) > 0.
   */
  upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockListCursor<T> {
    let L = 0;
    let R = this.list.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (compare(this.list.get(mid)!, key) <= 0) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    return this.cursor(L);
  }

  lowerBound(value: T): number { return this.lower_bound(value).index; }
  upperBound(value: T): number { return this.upper_bound(value).index; }

  lowerBoundKey<K>(key: K, compare: (item: T, key: K) => number): number {
    return this.lower_bound_key(key, compare).index;
  }

  upperBoundKey<K>(key: K, compare: (item: T, key: K) => number): number {
    return this.upper_bound_key(key, compare).index;
  }

  equal_range(value: T): [BlockListCursor<T>, BlockListCursor<T>] {
    return [this.lower_bound(value), this.upper_bound(value)];
  }

  rank(value: T): number { return this.lowerBound(value); }

  insert(value: T): void {
    const index = this.upperBound(value);
    this.list.insert(index, value);
  }

  insertMany(values: T[]): void {
    const sorted = [...values].sort(this.compare);
    for (let i = 0; i < sorted.length; i++) {
      this.insert(sorted[i]);
    }
  }

  delete(value: T): boolean {
    const idx = this.lowerBound(value);
    if (idx < this.list.length) {
      const actualVal = this.list.get(idx)!;
      if (this.compare(actualVal, value) === 0) {
        this.list.delete(idx);
        return true;
      }
    }
    return false;
  }

  deleteAt(index: number): T | undefined {
    return this.list.delete(index);
  }

  deleteCursor(cursor: BlockListCursor<T>): T | undefined {
    if (!cursor.active) return undefined;
    return this.list.delete(cursor.index);
  }

  rebase(newBlockSize?: number): void {
    this.list.rebase(newBlockSize);
  }

  indexOf(value: T): number {
    const idx = this.lowerBound(value);
    if (idx < this.list.length && this.compare(this.list.get(idx)!, value) === 0) {
      return idx;
    }
    return -1;
  }

  lastIndexOf(value: T): number {
    const idx = this.upperBound(value) - 1;
    if (idx >= 0 && this.compare(this.list.get(idx)!, value) === 0) {
      return idx;
    }
    return -1;
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  toArray(): T[] { return this.list.toArray(); }

  *[Symbol.iterator](): IterableIterator<T> { yield* this.list; }
}
