import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { CursorState, RandomAccessCursor } from '../../cursor';
import { InternalMapIterable } from '../../internal-map-iterable';
import { MapEntry } from '../../traits';
export declare class SortedMultimapCursor<K, V, C extends RandomAccessCursor<MapEntry<K, V>>> {
    inner: C;
    constructor(inner: C);
    get key(): K | undefined;
    get value(): V | undefined;
    get active(): boolean;
    get state(): CursorState;
    get index(): number;
    next(): boolean;
    prev(): boolean;
    clone(): SortedMultimapCursor<K, V, C>;
    advance(offset: number): boolean;
    seek(index: number): boolean;
    refresh(this: C extends {
        refresh: () => boolean;
    } ? SortedMultimapCursor<K, V, C> : never): boolean;
}
type ThisCursor<K, V, Kernel extends SortedKernel<MapEntry<K, V>>> = SortedMultimapCursor<K, V, ReturnType<Kernel['cursor']>>;
/**
 * A sorted map that allows duplicate keys.
 * Built with a pluggable kernel architecture.
 */
export declare class SortedMultimap<K, V, Kernel extends SortedKernel<MapEntry<K, V>> = SortedBlockArray<MapEntry<K, V>>> extends InternalMapIterable<K, V> {
    readonly kernel: Kernel;
    readonly keyCompare: (a: K, b: K) => number;
    /**
     * @param compareFn Optional comparison function for keys.
     * @param kernelFactory Optional factory function to provide a custom storage kernel.
     */
    constructor(compareFn?: (a: K, b: K) => number, kernelFactory?: (comp: (a: MapEntry<K, V>, b: MapEntry<K, V>) => number) => Kernel);
    get size(): number;
    get length(): number;
    _traverse(callback: (value: V, key: K, index: number) => boolean | void): void;
    /**
     * Adds a key-value pair. Allows duplicate keys.
     */
    add(key: K, value: V): this;
    /**
     * Returns an ES2015 iterator for all values associated with the key.
     */
    get(key: K): IterableIterator<V>;
    has(key: K): boolean;
    /**
     * Returns the number of entries with the specified key.
     */
    count(key: K): number;
    /**
     * Removes all entries with the specified key.
     * Returns the number of entries removed.
     */
    delete(key: K): number;
    /**
     * Removes one entry with the specified key.
     */
    deleteOne(key: K): V | undefined;
    deleteCursor(cur: ThisCursor<K, V, Kernel>): V | undefined;
    deleteAt(index: number): [K, V] | undefined;
    clear(reuse?: boolean): void;
    cursor(index?: number): ThisCursor<K, V, Kernel>;
    lower_bound(key: K): ThisCursor<K, V, Kernel>;
    upper_bound(key: K): ThisCursor<K, V, Kernel>;
    equal_range(key: K): [ThisCursor<K, V, Kernel>, ThisCursor<K, V, Kernel>];
    lowerBound(key: K): number;
    upperBound(key: K): number;
    rank(key: K): number;
    kth(index: number): [K, V] | undefined;
    min(): [K, V] | undefined;
    max(): [K, V] | undefined;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
}
export {};
