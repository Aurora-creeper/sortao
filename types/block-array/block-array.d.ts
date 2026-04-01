import { BlockArrayBase } from './block-array-base';
import { BlockArrayCursor } from './block-array-cursor';
import type { RandomAccessCursor, MutableCursor } from '../cursor';
/**
 * A high-performance Tiered Vector (Block Array) implementation.
 * It provides a compromise between an Array and a LinkedList, offering fast
 * insertions/deletions at arbitrary positions while maintaining relatively fast
 * random access.
 *
 * Space Complexity: O(N).
 */
export declare class BlockArray<T> extends BlockArrayBase<T> {
    constructor(blockSize?: number);
    /**
     * Returns a cursor pointing to the specified index (default 0).
     * Cursors provide O(1) continuous iteration and modification performance.
     * Time Complexity: O(1) for index 0, O(log(N/B)) for arbitrary indices.
     */
    cursor(index?: number): RandomAccessCursor<T> & MutableCursor<T>;
    get(index: number): T | undefined;
    at(index: number): T | undefined;
    set(index: number, value: T): void;
    resize(newSize: number, fillValue?: T): void;
    /**
     * Inserts an element at the specified index.
     * Time Complexity: O(B + N/B)
     */
    insert(index: number, value: T): void;
    delete(index: number): T | undefined;
    deleteCursor(cursor: BlockArrayCursor<T>): T | undefined;
    /**
     * Appends one or more elements to the end of the array.
     * Time Complexity: Amortized O(1) for a single value.
     */
    push(...values: T[]): void;
    /**
     * Appends an array of elements to the end.
     * Highly optimized to bypass generic splice logic.
     * Time Complexity: O(K) for K values.
     */
    pushAll(values: T[]): void;
    /**
     * Removes and returns the last element of the array.
     * Time Complexity: Amortized O(1)
     */
    pop(): T | undefined;
    /**
     * Inserts one or more elements to the beginning of the array.
     * Time Complexity: Amortized O(B) for a single value. O(K + B + N/B) for K values.
     */
    unshift(...values: T[]): void;
    /**
     * Removes and returns the first element of the array.
     * Time Complexity: Amortized O(B), significantly faster than native array's O(N).
     */
    shift(): T | undefined;
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    /**
     * Direct array-based version of splice to avoid stack overflow when dealing with large datasets.
     * Time Complexity: O(K_in + K_out + B + N/B)
     */
    spliceAll(start: number, deleteCount: number | undefined, items: T[]): T[];
    /**
     * Returns a section of an array as a new BlockArray.
     * Performs a shallow copy of the elements into new blocks to prevent shared mutation.
     * Time Complexity: O(K + log(N/B))
     */
    slice(start?: number, end?: number): BlockArray<T>;
    /**
     * Combines two or more arrays.
     * Highly optimized for BlockArray inputs by copying whole blocks.
     * Time Complexity: O(N_total) but with fast block-level shallow copies.
     */
    concat(...items: (T | T[] | BlockArray<T>)[]): BlockArray<T>;
    /**
     * Re-organizes the internal block structure.
     * Can be used to change the block size (B) dynamically or to defragment
     * the array to achieve 100% block density for optimal performance.
     * Time Complexity: O(N)
     */
    rebase(newBlockSize?: number): void;
    reverse(): this;
}
