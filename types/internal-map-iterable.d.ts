/**
 * A iteration base class for Map structures.
 */
export declare abstract class InternalMapIterable<K, V> {
    /**
     * Must return the total number of entries. Used for map() pre-allocation.
     */
    abstract get length(): number;
    /**
     * Internal traversal primitive. Must be implemented by subclasses.
     *
     * @param callback A function to execute for each entry.
     *                 If it returns `true` (strictly), the traversal is immediately aborted.
     */
    abstract _traverse(callback: (value: V, key: K, index: number) => boolean | void): void;
    /**
     * Executes a provided function once for each key-value pair.
     * Supports early termination if the callback explicitly returns `true`.
     */
    forEach(callback: (value: V, key: K, index: number) => boolean | void): void;
    /**
     * Tests whether at least one entry passes the test.
     */
    some(predicate: (value: V, key: K, index: number) => boolean): boolean;
    /**
     * Tests whether all entries pass the test.
     */
    every(predicate: (value: V, key: K, index: number) => boolean): boolean;
    /**
     * Returns the [Key, Value] tuple of the first entry that satisfies the testing function.
     * Allocates a tuple ONLY when the item is found.
     */
    findNode(predicate: (value: V, key: K, index: number) => boolean): [K, V] | undefined;
    /**
     * Returns the value of the first entry that satisfies the testing function.
     */
    find(predicate: (value: V, key: K, index: number) => boolean): V | undefined;
    /**
     * Returns the index of the first entry that satisfies the testing function.
     */
    findIndex(predicate: (value: V, key: K, index: number) => boolean): number;
    /**
     * Executes a reducer function on each entry.
     */
    reduce<U>(callback: (accumulator: U, value: V, key: K, index: number) => U, initialValue: U): U;
    /**
     * Creates a new native array of [Key, Value] tuples that pass the test.
     */
    filter(predicate: (value: V, key: K, index: number) => boolean): [K, V][];
    /**
     * Creates a new native array populated with the results of the callback.
     */
    map<U>(callback: (value: V, key: K, index: number) => U): U[];
    /**
     * Returns a new native array of [Key, Value] tuples for all entries.
     */
    toArray(): [K, V][];
}
