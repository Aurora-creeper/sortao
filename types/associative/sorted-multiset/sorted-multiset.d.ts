import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { InternalIterable } from '../../internal-iterable';
/**
 * A sorted collection that allows duplicate elements.
 * Built with a pluggable kernel architecture.
 */
export declare class SortedMultiset<T, Kernel extends SortedKernel<T> = SortedBlockArray<T>> extends InternalIterable<T> {
    readonly kernel: Kernel;
    readonly compare: (a: T, b: T) => number;
    /**
     * @param compareFn Optional comparison function.
     * @param kernelFactory Optional factory function to provide a custom storage kernel.
     */
    constructor(compareFn?: (a: T, b: T) => number, kernelFactory?: (comp: (a: T, b: T) => number) => Kernel);
    get size(): number;
    get length(): number;
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    /**
     * Adds a value to the multiset. Allows duplicates.
     */
    add(value: T): this;
    /**
     * Returns the number of occurrences of the value.
     */
    count(value: T): number;
    has(value: T): boolean;
    /**
     * Removes one occurrence of the value.
     */
    deleteOne(value: T): T | undefined;
    deleteCursor(cur: ReturnType<Kernel['cursor']>): T | undefined;
    /**
     * Removes all occurrences of the value.
     * Returns the number of elements removed.
     */
    delete(value: T): number;
    /**
     * Removes an element at the given logical rank.
     */
    deleteAt(index: number): T | undefined;
    clear(reuse?: boolean): void;
    cursor(index?: number): ReturnType<Kernel['cursor']>;
    lower_bound(value: T): ReturnType<Kernel['cursor']>;
    upper_bound(value: T): ReturnType<Kernel['cursor']>;
    equal_range(value: T): [ReturnType<Kernel['cursor']>, ReturnType<Kernel['cursor']>];
    lowerBound(value: T): number;
    upperBound(value: T): number;
    rank(value: T): number;
    kth(index: number): T | undefined;
    min(): T | undefined;
    max(): T | undefined;
    [Symbol.iterator](): IterableIterator<T>;
}
