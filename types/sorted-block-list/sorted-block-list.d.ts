import { BlockListCursor } from '../block-list';
import { InternalIterable } from '../internal-iterable';
import { SortedKernel } from '../sorted-kernel';
/**
 * An Array-backed Tiered Vector with strict O(1) rank access.
 *
 * Internally wraps a BlockList.
 */
export declare class SortedBlockList<T> extends InternalIterable<T> implements SortedKernel<T, BlockListCursor<T>> {
    private list;
    private readonly compare;
    /**
     * @param compareFn Optional comparison function. Defaults to ascending.
     * @param blockSize The strict size limit for all internal blocks except the last one.
     */
    constructor(compareFn?: (a: T, b: T) => number, blockSize?: number);
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    get length(): number;
    get capacity(): number;
    get B(): number;
    isEmpty(): boolean;
    clear(reuse?: boolean): void;
    reserve(n: number): void;
    shrinkToFit(): void;
    cursor(index?: number): BlockListCursor<T>;
    get(index: number): T | undefined;
    at(index: number): T | undefined;
    kth(index: number): T | undefined;
    /**
     * Primary source of truth for searching: returns a Cursor pointing to the
     * first element that is not less than (>=) the given value.
     */
    lower_bound(value: T): BlockListCursor<T>;
    /**
     * Heterogeneous searching: returns a Cursor pointing to the first element
     * where compare(item, key) >= 0.
     */
    lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockListCursor<T>;
    /**
     * Primary source of truth for searching: returns a Cursor pointing to the
     * first element that is strictly greater than (>) the given value.
     * Time Complexity: O(log N)
     */
    upper_bound(value: T): BlockListCursor<T>;
    /**
     * Heterogeneous searching: returns a Cursor pointing to the first element
     * where compare(item, key) > 0.
     */
    upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockListCursor<T>;
    lowerBound(value: T): number;
    upperBound(value: T): number;
    lowerBoundKey<K>(key: K, compare: (item: T, key: K) => number): number;
    upperBoundKey<K>(key: K, compare: (item: T, key: K) => number): number;
    equal_range(value: T): [BlockListCursor<T>, BlockListCursor<T>];
    rank(value: T): number;
    insert(value: T): void;
    insertMany(values: T[]): void;
    delete(value: T): boolean;
    deleteAt(index: number): T | undefined;
    deleteCursor(cursor: BlockListCursor<T>): T | undefined;
    rebase(newBlockSize?: number): void;
    indexOf(value: T): number;
    lastIndexOf(value: T): number;
    includes(value: T): boolean;
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
}
