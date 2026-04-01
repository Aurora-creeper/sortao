import { InternalIterable } from '../internal-iterable';
/**
 * RandomizedHeap: A high-performance mergeable priority queue.
 *
 * Uses a randomized binary tree structure to maintain heap order.
 * It provides O(log N) expected time for push, pop, and meld operations.
 *
 * Compared to a standard Array-based Binary Heap, it allows O(log N) merging
 * of two heaps, at the cost of slightly higher memory overhead and lack of
 * O(1) random access.
 */
export declare class RandomizedHeap<T> extends InternalIterable<T> {
    private root;
    private _length;
    private readonly compare;
    private seed;
    /**
     * Creates a RandomizedHeap from an iterable.
     * Time Complexity: O(N)
     */
    static from<T>(iterable: Iterable<T>, compareFn?: (a: T, b: T) => number): RandomizedHeap<T>;
    /**
     * @param compareFn Optional comparison function. Defaults to a min-heap.
     */
    constructor(compareFn?: (a: T, b: T) => number);
    private xorshift;
    /**
     * Internal traversal primitive required by InternalIterable.
     * Performs a recursive DFS over the heap structure.
     */
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    get length(): number;
    isEmpty(): boolean;
    /**
     * Adds a new value to the heap.
     * Time Complexity: O(log N) expected.
     */
    push(value: T): void;
    /**
     * Removes and returns the top element (smallest if min-heap).
     * Time Complexity: O(log N) expected.
     */
    pop(): T | undefined;
    /**
     * Returns the top element without removing it.
     * Time Complexity: O(1).
     */
    top(): T | undefined;
    /**
     * Merges another heap into this one. The other heap will be cleared.
     * Time Complexity: O(log N) expected.
     */
    meld(other: RandomizedHeap<T>): void;
    /**
     * Internal recursive meld operation.
     * Highly efficient due to binary tree structure and expected log-depth.
     */
    private _meld;
    /**
     * Clears the heap.
     */
    clear(): void;
    /**
     * Returns all elements as a native array (unordered).
     * Time Complexity: O(N)
     */
    toArray(): T[];
}
