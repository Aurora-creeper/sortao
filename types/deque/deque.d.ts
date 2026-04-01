import { InternalIterable } from '../internal-iterable';
/**
 * A high-performance Double-Ended Queue (Deque) implemented with a circular buffer.
 * Uses power-of-two capacity to optimize circular indexing with bitwise masks.
 */
export declare class Deque<T> extends InternalIterable<T> {
    private buffer;
    private head;
    private tail;
    private mask;
    private _length;
    constructor(initialCapacity?: number);
    get length(): number;
    get capacity(): number;
    isEmpty(): boolean;
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    /**
     * Clears the deque.
     * O(N).
     */
    clear(): void;
    /**
     * Adds an item to the end of the deque.
     * O(1) amortized.
     */
    pushBack(value: T): void;
    /**
     * Adds an item to the front of the deque.
     * O(1) amortized.
     */
    pushFront(value: T): void;
    /**
     * Removes and returns the item from the front of the deque.
     * O(1)
     */
    popFront(): T | undefined;
    /**
     * Removes and returns the item from the end of the deque.
     * O(1)
     */
    popBack(): T | undefined;
    /**
     * Returns the item at the front without removing it.
     */
    peekFront(): T | undefined;
    /**
     * Returns the item at the end without removing it.
     */
    peekBack(): T | undefined;
    /**
     * Gets the element at the given index (0-based from front).
     * O(1)
     */
    get(index: number): T | undefined;
    /**
     * Sets the element at the given index.
     * O(1)
     */
    set(index: number, value: T): void;
    /**
     * Inserts an element at the given index.
     * O(N) but optimized to shift the minimum number of elements.
     */
    insert(index: number, value: T): void;
    /**
     * Removes and returns the element at the given index.
     * O(N) but optimized to shift the minimum number of elements.
     */
    remove(index: number): T | undefined;
    private _reallocate;
    /**
     * Physically reallocates the buffer to ensure it has at least `minCapacity`.
     * The new capacity will be rounded up to the nearest power of two.
     */
    reserve(minCapacity: number): void;
    /**
     * Physically shrinks the internal buffer to exactly fit the current logical length
     * (rounded up to the nearest power of two, with a minimum of 16).
     */
    shrinkToFit(): void;
    /**
     * Resizes the logical length of the deque.
     * If shrinking, excess elements are removed from the back and GC'd.
     * If expanding, new positions are filled with `fillValue` (defaults to undefined).
     */
    resize(newSize: number, fillValue?: T): void;
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
}
