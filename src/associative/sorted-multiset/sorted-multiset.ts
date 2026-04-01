// src/sorted-multi-set/sorted-multi-set.ts

import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { RandomAccessCursor } from '../../cursor';
import { InternalIterable } from '../../internal-iterable';

/**
 * A sorted collection that allows duplicate elements.
 * Built with a pluggable kernel architecture.
 */
export class SortedMultiset<
  T,
  Kernel extends SortedKernel<T> = SortedBlockArray<T>
> extends InternalIterable<T> {

  public readonly kernel: Kernel;
  public readonly compare: (a: T, b: T) => number;

  /**
   * @param compareFn Optional comparison function.
   * @param kernelFactory Optional factory function to provide a custom storage kernel.
   */
  constructor(
    compareFn?: (a: T, b: T) => number,
    kernelFactory?: (comp: (a: T, b: T) => number) => Kernel
  ) {
    super();
    this.compare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));

    // Default to SortedBlockArray if no kernel factory is provided
    this.kernel = kernelFactory
      ? kernelFactory(this.compare)
      : (new SortedBlockArray<T>(this.compare) as unknown as Kernel);
  }

  get size(): number {
    return this.kernel.length;
  }

  get length(): number {
    return this.kernel.length;
  }

  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    this.kernel._traverse(callback);
  }

  /**
   * Adds a value to the multiset. Allows duplicates.
   */
  add(value: T): this {
    this.kernel.insert(value);
    return this;
  }

  /**
   * Returns the number of occurrences of the value.
   */
  count(value: T): number {
    const range = this.equal_range(value);
    return range[1].index - range[0].index;
  }

  has(value: T): boolean {
    const cur = this.kernel.lower_bound_key(value, (item, val) => this.compare(item, val));
    return cur.active && this.compare(cur.value!, value) === 0;
  }

  /**
   * Removes one occurrence of the value.
   */
  deleteOne(value: T): T | undefined {
    const cur = this.kernel.lower_bound_key(value, (item, val) => this.compare(item, val));
    if (cur.active && this.compare(cur.value!, value) === 0) {
      return this.kernel.deleteCursor(cur);
    }
  }

  deleteCursor(cur: ReturnType<Kernel['cursor']>): T | undefined {
    return this.kernel.deleteCursor(cur);
  }

  /**
   * Removes all occurrences of the value.
   * Returns the number of elements removed.
   */
  delete(value: T): number {
    const range = this.equal_range(value);
    const start = range[0].index;
    const count = range[1].index - start;
    if (count > 0) {
      // Loop for now, bulk delete optimization in future
      for (let i = 0; i < count; i++) {
        this.kernel.deleteAt(start);
      }
    }
    return count;
  }

  /**
   * Removes an element at the given logical rank.
   */
  deleteAt(index: number): T | undefined {
    return this.kernel.deleteAt(index);
  }

  clear(reuse: boolean = true): void {
    this.kernel.clear(reuse);
  }

  cursor(index: number = 0): ReturnType<Kernel['cursor']> {
    return this.kernel.cursor(index) satisfies RandomAccessCursor<T> as any;
  }

  lower_bound(value: T): ReturnType<Kernel['cursor']> {
    return this.kernel.lower_bound_key(
      value, (item, val) => this.compare(item, val)
    ) satisfies RandomAccessCursor<T> as any;
  }

  upper_bound(value: T): ReturnType<Kernel['cursor']> {
    return this.kernel.upper_bound_key(
      value, (item, val) => this.compare(item, val)
    ) satisfies RandomAccessCursor<T> as any;
  }

  equal_range(value: T): [ReturnType<Kernel['cursor']>, ReturnType<Kernel['cursor']>] {
    return [this.lower_bound(value), this.upper_bound(value)];
  }

  lowerBound(value: T): number {
    return this.lower_bound(value).index;
  }

  upperBound(value: T): number {
    return this.upper_bound(value).index;
  }

  rank(value: T): number {
    return this.lowerBound(value);
  }

  kth(index: number): T | undefined {
    return this.kernel.get(index);
  }

  min(): T | undefined {
    return this.kernel.get(0);
  }

  max(): T | undefined {
    return this.kernel.get(this.kernel.length - 1);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.kernel[Symbol.iterator]();
  }
}
