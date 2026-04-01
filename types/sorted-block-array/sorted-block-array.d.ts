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
export declare class SortedBlockArray<T> extends BlockArrayBase<T> implements SortedKernel<T, SortedBlockArrayCursor<T>> {
    private readonly compare;
    constructor(compareFn?: (a: T, b: T) => number, blockSize?: number);
    _make_cursor(bi?: number, li?: number): SortedBlockArrayCursor<T>;
    cursor(index?: number): SortedBlockArrayCursor<T>;
    /**
     * Primary source of truth for searching.
     * Returns a Cursor pointing to the first element >= value.
     * Time Complexity: O(log N)
     */
    lower_bound(value: T): SortedBlockArrayCursor<T>;
    /**
     * Heterogeneous searching: returns a Cursor pointing to the first element
     * where compare(item, key) >= 0.
     */
    lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): SortedBlockArrayCursor<T>;
    /**
     * Primary source of truth for searching.
     * Returns a Cursor pointing to the first element > value.
     * Time Complexity: O(log N)
     */
    upper_bound(value: T): SortedBlockArrayCursor<T>;
    /**
     * Heterogeneous searching: returns a Cursor pointing to the first element
     * where compare(item, key) > 0.
     */
    upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): SortedBlockArrayCursor<T>;
    lowerBound(value: T): number;
    upperBound(value: T): number;
    lowerBoundKey<K>(key: K, compare: (item: T, key: K) => number): number;
    upperBoundKey<K>(key: K, compare: (item: T, key: K) => number): number;
    equal_range(value: T): [SortedBlockArrayCursor<T>, SortedBlockArrayCursor<T>];
    rank(value: T): number;
    get(index: number): T | undefined;
    at(index: number): T | undefined;
    kth(index: number): T | undefined;
    insert(value: T): void;
    insertMany(values: T[]): void;
    delete(value: T): boolean;
    deleteAt(index: number): T | undefined;
    deleteCursor(cursor: SortedBlockArrayCursor<T>): T | undefined;
    rebase(newBlockSize?: number): void;
    indexOf(value: T): number;
    lastIndexOf(value: T): number;
    includes(value: T): boolean;
}
