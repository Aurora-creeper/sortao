// src/sorted-block-deque/sorted-block-deque.ts

import { BlockDeque, BlockDequeCursor } from '../block-deque';
import { InternalIterable } from '../internal-iterable';
import { SortedKernel } from '../sorted-kernel';

/**
 * A Deque-backed Tiered Vector maintaining perfect sorted order.  
 * Can be used as ultimate Double-Ended Priority Queue.
 * 
 * Internally wraps a BlockDeque.
 * 
 * It provides 
 *  - strict O(1) rank access, O(1) minimum/maximum mutation.
 *  - Operations near the extreme values are faster.
 * 
 */
export class SortedBlockDeque<T> extends InternalIterable<T> implements SortedKernel<T, BlockDequeCursor<T>> {
  private deque: BlockDeque<T>;
  private readonly compare: (a: T, b: T) => number;

  /**
   * @param compareFn Optional comparison function. Defaults to ascending.
   * @param blockSize The strict size limit for all internal blocks except boundaries.
   */
  constructor(compareFn?: (a: T, b: T) => number, blockSize: number = 512) {
    super();
    this.deque = new BlockDeque<T>(blockSize);
    this.compare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
  }

  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    this.deque._traverse(callback);
  }

  get length(): number { return this.deque.length; }
  get capacity(): number { return this.deque.capacity; }
  get B(): number { return this.deque.B; }

  isEmpty(): boolean { return this.deque.isEmpty(); }
  clear(reuse: boolean = true): void { this.deque.clear(reuse); }
  reserve(n: number): void { this.deque.reserve(n); }
  shrinkToFit(): void { this.deque.shrinkToFit(); }

  cursor(index: number = 0): BlockDequeCursor<T> {
    return this.deque.cursor(index);
  }

  get(index: number): T | undefined { return this.deque.get(index); }
  at(index: number): T | undefined { return this.deque.at(index); }
  kth(index: number): T | undefined { return this.deque.get(index); }

  /**
   * Primary source of truth for searching: returns a Cursor pointing to the 
   * first element that is not less than (>=) the given value.
   * Time Complexity: O(log N)
   */
  lower_bound(value: T): BlockDequeCursor<T> {
    let L = 0;
    let R = this.deque.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      const midVal = this.deque.get(mid)!;

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
  lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockDequeCursor<T> {
    let L = 0;
    let R = this.deque.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (compare(this.deque.get(mid)!, key) < 0) {
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
  upper_bound(value: T): BlockDequeCursor<T> {
    let L = 0;
    let R = this.deque.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      const midVal = this.deque.get(mid)!;

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
  upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockDequeCursor<T> {
    let L = 0;
    let R = this.deque.length - 1;
    while (L <= R) {
      const mid = (L + R) >> 1;
      if (compare(this.deque.get(mid)!, key) <= 0) {
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

  equal_range(value: T): [BlockDequeCursor<T>, BlockDequeCursor<T>] {
    return [this.lower_bound(value), this.upper_bound(value)];
  }

  rank(value: T): number { return this.lowerBound(value); }

  insert(value: T): void {
    const index = this.upperBound(value);
    this.deque.insert(index, value);
  }

  insertMany(values: T[]): void {
    const sorted = [...values].sort(this.compare);
    for (let i = 0; i < sorted.length; i++) {
      this.insert(sorted[i]);
    }
  }

  delete(value: T): boolean {
    const idx = this.lowerBound(value);
    if (idx < this.deque.length) {
      const actualVal = this.deque.get(idx)!;
      if (this.compare(actualVal, value) === 0) {
        this.deque.delete(idx);
        return true;
      }
    }
    return false;
  }

  deleteAt(index: number): T | undefined {
    return this.deque.delete(index);
  }

  deleteCursor(cursor: BlockDequeCursor<T>): T | undefined {
    if (!cursor.active) return undefined;
    return this.deque.delete(cursor.index);
  }

  shift(): T | undefined { return this.deque.shift(); }
  pop(): T | undefined { return this.deque.pop(); }

  rebase(newBlockSize?: number): void {
    this.deque.rebase(newBlockSize);
  }

  indexOf(value: T): number {
    const idx = this.lowerBound(value);
    if (idx < this.deque.length && this.compare(this.deque.get(idx)!, value) === 0) {
      return idx;
    }
    return -1;
  }

  lastIndexOf(value: T): number {
    const idx = this.upperBound(value) - 1;
    if (idx >= 0 && this.compare(this.deque.get(idx)!, value) === 0) {
      return idx;
    }
    return -1;
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  toArray(): T[] { return this.deque.toArray(); }

  *[Symbol.iterator](): IterableIterator<T> { yield* this.deque; }
}
