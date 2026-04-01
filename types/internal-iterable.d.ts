/**
 * A iteration base class for data structures.
 */
export declare abstract class InternalIterable<T> {
    /**
     * Must return the total number of elements. Used for map() pre-allocation.
     */
    abstract get length(): number;
    /**
     * Internal traversal primitive. Must be implemented by subclasses.
     *
     * @param callback A function to execute for each element.
     *                 If it returns `true` (strictly), the traversal is immediately aborted.
     */
    abstract _traverse(callback: (val: T, index: number) => boolean | void): void;
    /**
     * Executes a provided function once for each element.
     * Supports early termination if the callback explicitly returns `true`.
     */
    forEach(callback: (val: T, index: number) => boolean | void): void;
    /**
     * Tests whether at least one element in the collection passes the test.
     */
    some(predicate: (val: T, index: number) => boolean): boolean;
    /**
     * Tests whether all elements in the collection pass the test.
     */
    every(predicate: (val: T, index: number) => boolean): boolean;
    /**
     * Returns the value of the first element that satisfies the provided testing function.
     */
    find(predicate: (val: T, index: number) => boolean): T | undefined;
    /**
     * Returns the index of the first element that satisfies the provided testing function.
     */
    findIndex(predicate: (val: T, index: number) => boolean): number;
    /**
     * Returns the first index at which a given element can be found, or -1 if not present.
     */
    indexOf(value: T): number;
    /**
     * Determines whether the collection includes a certain value.
     */
    includes(value: T): boolean;
    /**
     * Executes a reducer function on each element, resulting in a single output value.
     */
    reduce<U>(callback: (accumulator: U, currentValue: T, index: number) => U, initialValue: U): U;
    /**
     * Creates a new native array with all elements that pass the test.
     */
    filter(predicate: (val: T, index: number) => boolean): T[];
    /**
     * Creates a new native array populated with the results of calling a
     * provided function on every element.
     */
    map<U>(callback: (val: T, index: number) => U): U[];
    /**
     * Returns a new native array containing all elements in this collection.
     */
    toArray(): T[];
}
