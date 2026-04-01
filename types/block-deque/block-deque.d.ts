import { Deque } from '../deque/deque';
import { BlockDequeCursor } from './block-deque-cursor';
import { InternalIterable } from '../internal-iterable';
/**
 * BlockDeque: A Deque-backed Tiered Vector.
 * Provides strict O(1) random access along with O(1) bidirectional mutations (push, pop, unshift, shift).
 * Internal elements are maintained in strictly sized Deque blocks, allowing pure mathematical indexing.
 */
export declare class BlockDeque<T> extends InternalIterable<T> {
    blocks: Deque<Deque<T>>;
    private _length;
    readonly B: number;
    private pool;
    constructor(blockSize?: number);
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    private _allocateBlock;
    private _recycleBlock;
    get length(): number;
    get capacity(): number;
    isEmpty(): boolean;
    clear(reuse?: boolean): void;
    reserve(n: number): void;
    shrinkToFit(): void;
    cursor(index?: number): BlockDequeCursor<T>;
    /**
     * Internal helper to map global index to physical block and local index.
     */
    _resolveIndex(index: number): [number, number];
    get(index: number): T | undefined;
    at(index: number): T | undefined;
    set(index: number, value: T): void;
    push(...values: T[]): void;
    pushAll(values: T[]): void;
    pop(): T | undefined;
    unshift(...values: T[]): void;
    shift(): T | undefined;
    insert(index: number, value: T): void;
    delete(index: number): T | undefined;
    deleteCursor(cursor: BlockDequeCursor<T>): T | undefined;
    resize(newSize: number, fillValue?: T): void;
    rebase(newBlockSize?: number): void;
    reverse(): this;
    slice(start?: number, end?: number): BlockDeque<T>;
    concat(...items: (T | T[] | BlockDeque<T>)[]): BlockDeque<T>;
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
}
