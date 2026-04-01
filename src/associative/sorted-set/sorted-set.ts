// src/sorted-set/sorted-set.ts

import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { InternalIterable } from '../../internal-iterable';

/**
 * A highly optimized set that maintains its elements in sorted order.
 * Built with a pluggable kernel architecture.
 */
export class SortedSet<
  T,
  Kernel extends SortedKernel<T, any> = SortedBlockArray<T>
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
   * Adds a value to the set. If the value already exists, does nothing.
   */
  add(value: T): this {
    const cur = this.kernel.lower_bound_key(value, (item, val) => this.compare(item, val));
    if (cur.active && this.compare(cur.value!, value) === 0) {
      // Element already exists, skip
      // @todo: mutable
    } else {
      this.kernel.insert(value);
    }
    return this;
  }

  has(value: T): boolean {
    const cur = this.kernel.lower_bound_key(value, (item, val) => this.compare(item, val));
    return cur.active && this.compare(cur.value!, value) === 0;
  }

  delete(value: T): T | undefined {
    const cur = this.kernel.lower_bound_key(value, (item, val) => this.compare(item, val));
    if (cur.active && this.compare(cur.value!, value) === 0) {
      return this.kernel.deleteCursor(cur);
    }
  }

  deleteCursor(cur: ReturnType<Kernel['cursor']>): T | undefined {
    return this.kernel.deleteCursor(cur);
  }

  deleteAt(index: number): T | undefined {
    return this.kernel.deleteAt(index);
  }

  clear(reuse: boolean = true): void {
    this.kernel.clear(reuse);
  }

  cursor(index: number = 0): ReturnType<Kernel['cursor']> {
    return this.kernel.cursor(index);
  }

  lower_bound(value: T): ReturnType<Kernel['lower_bound_key']> {
    return this.kernel.lower_bound_key(value, (item, val) => this.compare(item, val));
  }

  upper_bound(value: T): ReturnType<Kernel['upper_bound_key']> {
    return this.kernel.upper_bound_key(value, (item, val) => this.compare(item, val));
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
