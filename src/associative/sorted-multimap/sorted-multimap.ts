// src/sorted-multi-map/sorted-multi-map.ts

import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { CursorState, RandomAccessCursor } from '../../cursor';
import { InternalMapIterable } from '../../internal-map-iterable';
import { MapEntry } from '../../traits';

export class SortedMultimapCursor<K, V, C extends RandomAccessCursor<MapEntry<K, V>>> {
  constructor(public inner: C) { }

  get key(): K | undefined { return this.inner.value?.k; }
  get value(): V | undefined { return this.inner.value?.v; }
  get active(): boolean { return this.inner.active; }
  get state(): CursorState { return this.inner.state; }
  get index(): number { return this.inner.index; }

  next(): boolean { return this.inner.next(); }
  prev(): boolean { return this.inner.prev(); }
  clone(): SortedMultimapCursor<K, V, C> { return new SortedMultimapCursor(this.inner.clone()); }
  advance(offset: number): boolean { return this.inner.advance(offset); }
  seek(index: number): boolean { return this.inner.seek(index); }

  refresh(
    this: C extends { refresh: () => boolean }
      ? SortedMultimapCursor<K, V, C>
      : never): boolean {
    return this.inner.refresh();
  }
}

type ThisCursor<K, V, Kernel extends SortedKernel<MapEntry<K, V>>>
  = SortedMultimapCursor<K, V, ReturnType<Kernel['cursor']>>;

/**
 * A sorted map that allows duplicate keys.
 * Built with a pluggable kernel architecture.
 */
export class SortedMultimap<
  K,
  V,
  Kernel extends SortedKernel<MapEntry<K, V>> = SortedBlockArray<MapEntry<K, V>>
> extends InternalMapIterable<K, V> {

  public readonly kernel: Kernel;
  public readonly keyCompare: (a: K, b: K) => number;

  /**
   * @param compareFn Optional comparison function for keys.
   * @param kernelFactory Optional factory function to provide a custom storage kernel.
   */
  constructor(
    compareFn?: (a: K, b: K) => number,
    kernelFactory?: (comp: (a: MapEntry<K, V>, b: MapEntry<K, V>) => number) => Kernel
  ) {
    super();
    this.keyCompare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));

    const entryCompare = (a: MapEntry<K, V>, b: MapEntry<K, V>) => this.keyCompare(a.k, b.k);

    this.kernel = kernelFactory
      ? kernelFactory(entryCompare)
      : (new SortedBlockArray<MapEntry<K, V>>(entryCompare) as unknown as Kernel);
  }

  get size(): number { return this.kernel.length; }
  get length(): number { return this.kernel.length; }

  public _traverse(callback: (value: V, key: K, index: number) => boolean | void): void {
    this.kernel._traverse((entry, index) => callback(entry.v, entry.k, index));
  }

  /**
   * Adds a key-value pair. Allows duplicate keys.
   */
  add(key: K, value: V): this {
    this.kernel.insert(new MapEntry(key, value));
    return this;
  }

  /**
   * Returns an ES2015 iterator for all values associated with the key.
   */
  *get(key: K): IterableIterator<V> {
    const cur = this.lower_bound(key);
    while (cur.active && this.keyCompare(cur.key!, key) === 0) {
      yield cur.value!;
      cur.next();
    }
  }

  has(key: K): boolean {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    return cur.active && this.keyCompare(cur.value!.k, key) === 0;
  }

  /**
   * Returns the number of entries with the specified key.
   */
  count(key: K): number {
    const range = this.equal_range(key);
    return range[1].index - range[0].index;
  }

  /**
   * Removes all entries with the specified key.
   * Returns the number of entries removed.
   */
  delete(key: K): number {
    const range = this.equal_range(key);
    const start = range[0].index;
    const count = range[1].index - start;
    for (let i = 0; i < count; i++) {
      this.kernel.deleteAt(start);
    }
    return count;
  }

  /**
   * Removes one entry with the specified key.
   */
  deleteOne(key: K): V | undefined {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    if (cur.active && this.keyCompare(cur.value!.k, key) === 0) {
      return this.kernel.deleteCursor(cur)?.v;
    }
  }

  deleteCursor(cur: ThisCursor<K, V, Kernel>): V | undefined {
    return this.kernel.deleteCursor(cur.inner)?.v;
  }

  deleteAt(index: number): [K, V] | undefined {
    const it = this.kernel.deleteAt(index);
    return it ? [it.k, it.v] : undefined;
  }

  clear(reuse: boolean = true): void { this.kernel.clear(reuse); }

  cursor(index: number = 0): ThisCursor<K, V, Kernel> {
    const cur = this.kernel.cursor(index);
    return new SortedMultimapCursor<K, V, any>(cur);
  }

  lower_bound(key: K): ThisCursor<K, V, Kernel> {
    const cur = this.kernel.lower_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    return new SortedMultimapCursor<K, V, any>(cur);
  }

  upper_bound(key: K): ThisCursor<K, V, Kernel> {
    const cur = this.kernel.upper_bound_key(key, (entry, k) => this.keyCompare(entry.k, k));
    return new SortedMultimapCursor<K, V, any>(cur);
  }

  equal_range(key: K): [ThisCursor<K, V, Kernel>, ThisCursor<K, V, Kernel>] {
    return [this.lower_bound(key), this.upper_bound(key)];
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
