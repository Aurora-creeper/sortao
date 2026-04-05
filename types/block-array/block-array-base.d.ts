import { InternalIterable } from '../internal-iterable';
/**
 * Manages chunk splitting, merging, prefix sums, and element splice operations.
 */
export declare abstract class BlockArrayBase<T> extends InternalIterable<T> {
    blocks: T[][];
    prefixSums: number[];
    protected _length: number;
    protected B: number;
    protected isUniform: boolean;
    constructor(blockSize?: number);
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    /** Subclasses must still implement the cursor entry point. */
    abstract cursor(bi?: number, li?: number): any;
    get length(): number;
    get capacity(): number;
    isEmpty(): boolean;
    clear(reuse?: boolean): void;
    /** @deprecated duck, no-op */
    reserve(_n: number): void;
    /** @deprecated duck, no-op */
    shrinkToFit(): void;
    protected rebuildPrefixSums(): void;
    protected _findBlockByIndex(index: number): [number, number];
    protected _insertAt(bi: number, li: number, value: T): void;
    protected _deleteAt(bi: number, li: number): T;
    protected _split(bi: number): void;
    protected _tryMerge(bi: number): void;
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
}
