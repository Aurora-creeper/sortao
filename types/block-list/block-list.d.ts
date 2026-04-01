import { Deque } from '../deque/deque';
import { BlockListCursor } from './block-list-cursor';
import { InternalIterable } from '../internal-iterable';
/**
 * BlockList: An Array-backed Tiered Vector with strict O(1) random access.
 *
 * Uses a Native Array of Deque blocks. Maintains an invariant that all blocks
 * except the last are exactly size B. This allows pure mathematical indexing
 * (index / B) instead of binary search on prefix sums.
 *
 * Trade-off: Insertion/Deletion anywhere except the tail triggers a cascade
 * towards the tail (O(N/B)), but random access is as fast as a native array.
 */
export declare class BlockList<T> extends InternalIterable<T> {
    blocks: Deque<T>[];
    private _length;
    readonly B: number;
    private pool;
    /**
     * @param blockSize The strict size limit for all internal blocks except the last one.
     * Will be automatically rounded up to the nearest power of 2 to perfectly align with Deque capacity.
     */
    constructor(blockSize?: number);
    /**
     * Returns a high-performance internal iterator for functional operations.
     */
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    private _allocateBlock;
    private _recycleBlock;
    get length(): number;
    /**
     * Returns the total number of elements the structure can hold without
     * allocating new blocks from the system heap (includes active blocks and the object pool).
     */
    get capacity(): number;
    isEmpty(): boolean;
    /**
     * Clears the list.
     * @param reuse If true (default), blocks are cleaned and returned to the object pool (O(N)).
     *              If false, blocks are simply discarded for GC (O(1)).
     */
    clear(reuse?: boolean): void;
    /**
     * Pre-allocates enough blocks to ensure capacity for at least `n` elements.
     * Useful when you know the approximate size of data beforehand.
     */
    reserve(n: number): void;
    /**
     * Releases all unused blocks currently stored in the object pool.
     */
    shrinkToFit(): void;
    cursor(index?: number): BlockListCursor<T>;
    get(index: number): T | undefined;
    at(index: number): T | undefined;
    set(index: number, value: T): void;
    push(...values: T[]): void;
    /**
     * Appends multiple elements to the end of the list.
     * Direct array input prevents stack overflow from spread arguments.
     */
    pushAll(values: T[]): void;
    pop(): T | undefined;
    insert(index: number, value: T): void;
    delete(index: number): T | undefined;
    deleteCursor(cursor: BlockListCursor<T>): T | undefined;
    private _cascadeBackward;
    /**
     * Resizes the array to contain `newSize` elements.
     */
    resize(newSize: number, fillValue?: T): void;
    shift(): T | undefined;
    unshift(...values: T[]): void;
    rebase(newBlockSize?: number): void;
    reverse(): this;
    slice(start?: number, end?: number): BlockList<T>;
    concat(...items: (T | T[] | BlockList<T>)[]): BlockList<T>;
    /**
     * WARNING: splice on BlockList is implemented via simple iteration for API completeness.
     * It performs O(K * N/B) cascading operations.
     * For heavy middle-array splicing, use BlockArray instead!
     * @todo Implement bulk-shift optimization if absolutely necessary.
     */
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    /**
     * Array-based splice to prevent call stack overflow with huge numbers of items.
     */
    spliceAll(start: number, deleteCount?: number, items?: T[]): T[];
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
}
