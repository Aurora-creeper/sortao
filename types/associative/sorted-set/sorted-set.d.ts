import { SortedKernel } from '../../sorted-kernel';
import { SortedBlockArray } from '../../sorted-block-array';
import { InternalIterable } from '../../internal-iterable';
/**
 * A highly optimized set that maintains its elements in sorted order.
 * Built with a pluggable kernel architecture.
 */
export declare class SortedSet<T, Kernel extends SortedKernel<T, any> = SortedBlockArray<T>> extends InternalIterable<T> {
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
     * Adds a value to the set. If the value already exists, does nothing.
     */
    add(value: T): this;
    has(value: T): boolean;
    delete(value: T): T | undefined;
    deleteCursor(cur: ReturnType<Kernel['cursor']>): T | undefined;
    deleteAt(index: number): T | undefined;
    clear(reuse?: boolean): void;
    cursor(index?: number): ReturnType<Kernel['cursor']>;
    lower_bound(value: T): ReturnType<Kernel['lower_bound_key']>;
    upper_bound(value: T): ReturnType<Kernel['upper_bound_key']>;
    lowerBound(value: T): number;
    upperBound(value: T): number;
    rank(value: T): number;
    kth(index: number): T | undefined;
    min(): T | undefined;
    max(): T | undefined;
    [Symbol.iterator](): IterableIterator<T>;
}
