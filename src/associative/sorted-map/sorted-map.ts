// src/sorted-map/sorted-map.ts

import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { CursorState, RandomAccessCursor } from '../../cursor';
import { InternalMapIterable } from '../../internal-map-iterable';
import { MapEntry } from '../../traits';

export class SortedMapCursor<K, V, C extends RandomAccessCursor<MapEntry<K, V>> = any> {
  constructor(public inner: C) { }

  get key(): K | undefined { return this.inner.value?.k; }
  get value(): V | undefined { return this.inner.value?.v; }
  get active(): boolean { return this.inner.active; }
  get state(): CursorState { return this.inner.state; }
  get index(): number { return this.inner.index; }

  next(): boolean { return this.inner.next(); }
  prev(): boolean { return this.inner.prev(); }
  clone(): SortedMapCursor<K, V> { return new SortedMapCursor(this.inner.clone()); }
  advance(offset: number): boolean { return this.inner.advance(offset); }
  seek(index: number): boolean { return this.inner.seek(index); }

  refresh(
    this: C extends { refresh: () => boolean }
      ? SortedMapCursor<K, V, C>
      : never): boolean {
    return this.inner.refresh();
  }
}

export class SortedMap<
  K,
  V,
  Kernel extends SortedKernel<MapEntry<K, V>> = SortedBlockArray<MapEntry<K, V>>
> extends InternalMapIterable<K, V> {

  public readonly kernel: Kernel;
  public readonly keyCompare: (a: K, b: K) => number;

  /**
   * @param compareFn Optional comparison function for keys.
   * @param kernelFactory Optional factory function to provide a custom storage kernel. Defaults to SortedBlockArray.
   */
  constructor(
    compareFn?: (a: K, b: K) => number,
    kernelFactory?: (comp: (a: MapEntry<K, V>, b: MapEntry<K, V>) => number) => Kernel
  ) {
    super();
    this.keyCompare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));

    const entryCompare = (a: MapEntry<K, V>, b: MapEntry<K, V>) => this.keyCompare(a.k, b.k);

    // Default to SortedBlockArray if no kernel factory is provided
    this.kernel = kernelFactory
      ? kernelFactory(entryCompare)
      : (new SortedBlockArray<MapEntry<K, V>>(entryCompare) as unknown as Kernel);
  }

  get size(): number { return this.kernel.length; }
  get length(): number { return this.kernel.length; }
  _traverse(callback: (value: V, key: K, index: number) => boolean | void): void {
    this.kernel._traverse((entry, index) => callback(entry.v, entry.k, index));
  }

  /**
   * Sets the value for the key in the map.
   * If the key already exists, updates the value without physical movement.
   * @param [updateKey=false] If true, overwrites the existing key reference with the new one.
   */
  set(key: K, value: V, updateKey: boolean = false): this {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));

    if (cur.active && this.keyCompare(cur.value!.k, key) === 0) {
      // Key exists, update value in-place
      cur.value!.v = value;
      if (updateKey) cur.value!.k = key;
    } else {
      // Key does not exist, insert new entry
      this.kernel.insert(new MapEntry(key, value));
    }
    return this;
  }

  /**
   * Returns the value associated to the key, or undefined if none.
   */
  get(key: K): [K, V] | undefined {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    if (cur.active && this.keyCompare(cur.value!.k, key) === 0) {
      return [cur.value!.k, cur.value!.v];
    }
    return undefined;
  }

  /**
   * Returns a boolean asserting whether a value has been associated to the key.
   */
  has(key: K): boolean {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    return cur.active && this.keyCompare(cur.value!.k, key) === 0;
  }

  /**
   * Removes the specified element from the map.
   * Returns true if an element existed and has been removed.
   */
  delete(key: K): [K, V] | undefined {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    if (cur.active && this.keyCompare(cur.value!.k, key) === 0) {
      const it = this.kernel.deleteCursor(cur)!;
      return [it.k, it.v];
    }
  }

  deleteAt(index: number): [K, V] | undefined {
    const it = this.kernel.deleteAt(index);
    return it ? [it.k, it.v] : undefined;
  }

  deleteCursor(cur: SortedMapCursor<K, V>): [K, V] | undefined {
    const it = this.kernel.deleteCursor(cur.inner);
    return it ? [it.k, it.v] : undefined;
  }

  clear(reuse: boolean = true): void { this.kernel.clear(reuse); }

  cursor(index: number = 0): SortedMapCursor<K, V> {
    const cur = this.kernel.cursor(index);
    return new SortedMapCursor<K, V>(cur);
  }

  lower_bound(key: K): SortedMapCursor<K, V> {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    return new SortedMapCursor<K, V>(cur);
  }

  upper_bound(key: K): SortedMapCursor<K, V> {
    const cur = this.kernel.upper_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    return new SortedMapCursor<K, V>(cur);
  }

  lowerBound(key: K): number { return this.lower_bound(key).index; }
  upperBound(key: K): number { return this.upper_bound(key).index; }
  rank(key: K): number { return this.lowerBound(key); }

  kth(index: number): [K, V] | undefined {
    const entry = this.kernel.get(index);
    return entry ? [entry.k, entry.v] : undefined;
  }

  min(): [K, V] | undefined {
    const entry = this.kernel.get(0);
    return entry ? [entry.k, entry.v] : undefined;
  }

  max(): [K, V] | undefined {
    const entry = this.kernel.get(this.kernel.length - 1);
    return entry ? [entry.k, entry.v] : undefined;
  }

  *keys(): IterableIterator<K> {
    const cur = this.kernel.cursor();
    while (cur.active) { yield cur.value!.k; cur.next(); }
  }

  *values(): IterableIterator<V> {
    const cur = this.kernel.cursor();
    while (cur.active) { yield cur.value!.v; cur.next(); }
  }

  *entries(): IterableIterator<[K, V]> {
    const cur = this.kernel.cursor();
    while (cur.active) { yield [cur.value!.k, cur.value!.v]; cur.next(); }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> { return this.entries(); }
}
