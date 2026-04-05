import { BlockArrayBase } from './block-array-base';
import { BlockArrayCursor } from './block-array-cursor';
import type { RandomAccessCursor, MutableCursor } from '../cursor';
/**
 * A high-performance Block Array implementation.
 * Offering fast insertions/deletions at arbitrary positions,
 * while maintaining relatively fast random access.
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
     * Time Complexity: O(1) for a single value.
     */
    push(...values: T[]): void;
    /**
     * Appends an array of elements to the end.
     * Time Complexity: O(1) for a single value.
     */
    pushAll(values: T[]): void;
    /**
     * Removes and returns the last element of the array.
     * Time Complexity: O(1)
     */
    pop(): T | undefined;
    /**
     * Inserts one or more elements to the beginning of the array.
     */
    unshift(...values: T[]): void;
    /**
     * Removes and returns the first element of the array.
     */
    shift(): T | undefined;
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    spliceAll(start: number, deleteCount: number | undefined, items: T[]): T[];
    /**
     * Returns a section of an array as a new BlockArray.
     */
    slice(start?: number, end?: number): BlockArray<T>;
    /**
     * Combines two or more arrays.
     */
    concat(...items: (T | T[] | BlockArray<T>)[]): BlockArray<T>;
    /**
     * Re-organizes the internal block structure.
     * Can be used to change the block size (B) dynamically or to defragment.
     * Sets `isUniform` to true.
     * Time Complexity: O(N)
     */
    rebase(newBlockSize?: number): void;
    reverse(): this;
}
