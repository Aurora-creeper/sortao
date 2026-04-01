import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { CursorState, RandomAccessCursor } from '../../cursor';
import { InternalMapIterable } from '../../internal-map-iterable';
import { MapEntry } from '../../traits';
export declare class SortedMapCursor<K, V, C extends RandomAccessCursor<MapEntry<K, V>> = any> {
    inner: C;
    constructor(inner: C);
    get key(): K | undefined;
    get value(): V | undefined;
    get active(): boolean;
    get state(): CursorState;
    get index(): number;
    next(): boolean;
    prev(): boolean;
    clone(): SortedMapCursor<K, V>;
    advance(offset: number): boolean;
    seek(index: number): boolean;
    refresh(this: C extends {
        refresh: () => boolean;
    } ? SortedMapCursor<K, V, C> : never): boolean;
}
export declare class SortedMap<K, V, Kernel extends SortedKernel<MapEntry<K, V>> = SortedBlockArray<MapEntry<K, V>>> extends InternalMapIterable<K, V> {
    readonly kernel: Kernel;
    readonly keyCompare: (a: K, b: K) => number;
    /**
     * @param compareFn Optional comparison function for keys.
     * @param kernelFactory Optional factory function to provide a custom storage kernel. Defaults to SortedBlockArray.
     */
    constructor(compareFn?: (a: K, b: K) => number, kernelFactory?: (comp: (a: MapEntry<K, V>, b: MapEntry<K, V>) => number) => Kernel);
    get size(): number;
    get length(): number;
    _traverse(callback: (value: V, key: K, index: number) => boolean | void): void;
    /**
     * Sets the value for the key in the map.
     * If the key already exists, updates the value without physical movement.
     * @param [updateKey=false] If true, overwrites the existing key reference with the new one.
     */
    set(key: K, value: V, updateKey?: boolean): this;
    /**
     * Returns the value associated to the key, or undefined if none.
     */
    get(key: K): [K, V] | undefined;
    /**
     * Returns a boolean asserting whether a value has been associated to the key.
     */
    has(key: K): boolean;
    /**
     * Removes the specified element from the map.
     * Returns true if an element existed and has been removed.
     */
    delete(key: K): [K, V] | undefined;
    deleteAt(index: number): [K, V] | undefined;
    deleteCursor(cur: SortedMapCursor<K, V>): [K, V] | undefined;
    clear(reuse?: boolean): void;
    cursor(index?: number): SortedMapCursor<K, V>;
    lower_bound(key: K): SortedMapCursor<K, V>;
    upper_bound(key: K): SortedMapCursor<K, V>;
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
