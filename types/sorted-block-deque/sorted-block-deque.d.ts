import { BlockDequeCursor } from '../block-deque';
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
export declare class SortedBlockDeque<T> extends InternalIterable<T> implements SortedKernel<T, BlockDequeCursor<T>> {
    private deque;
    private readonly compare;
    /**
     * @param compareFn Optional comparison function. Defaults to ascending.
     * @param blockSize The strict size limit for all internal blocks except boundaries.
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
    cursor(index?: number): BlockDequeCursor<T>;
    get(index: number): T | undefined;
    at(index: number): T | undefined;
    kth(index: number): T | undefined;
    /**
     * Primary source of truth for searching: returns a Cursor pointing to the
     * first element that is not less than (>=) the given value.
     * Time Complexity: O(log N)
     */
    lower_bound(value: T): BlockDequeCursor<T>;
    /**
     * Heterogeneous searching: returns a Cursor pointing to the first element
     * where compare(item, key) >= 0.
     */
    lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockDequeCursor<T>;
    /**
     * Primary source of truth for searching: returns a Cursor pointing to the
     * first element that is strictly greater than (>) the given value.
     * Time Complexity: O(log N)
     */
    upper_bound(value: T): BlockDequeCursor<T>;
    /**
     * Heterogeneous searching: returns a Cursor pointing to the first element
     * where compare(item, key) > 0.
     */
    upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): BlockDequeCursor<T>;
    lowerBound(value: T): number;
    upperBound(value: T): number;
    lowerBoundKey<K>(key: K, compare: (item: T, key: K) => number): number;
    upperBoundKey<K>(key: K, compare: (item: T, key: K) => number): number;
    equal_range(value: T): [BlockDequeCursor<T>, BlockDequeCursor<T>];
    rank(value: T): number;
    insert(value: T): void;
    insertMany(values: T[]): void;
    delete(value: T): boolean;
    deleteAt(index: number): T | undefined;
    deleteCursor(cursor: BlockDequeCursor<T>): T | undefined;
    shift(): T | undefined;
    pop(): T | undefined;
    rebase(newBlockSize?: number): void;
    indexOf(value: T): number;
    lastIndexOf(value: T): number;
    includes(value: T): boolean;
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
}
