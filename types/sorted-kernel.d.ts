import { InternalIterable } from './internal-iterable';
import { Cursor, RandomAccessCursor } from './cursor';
/**
 * The standard contract for a sorted physical storage kernel.
 * Any container implementing this interface can be used as the underlying
 * storage for high-level associative containers like SortedMap.
 */
export interface SortedKernel<T, C extends RandomAccessCursor<T> = RandomAccessCursor<T>> extends InternalIterable<T>, Iterable<T> {
    readonly length: number;
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Heterogeneous lookup: Returns a cursor pointing to the first element
     * where compare(item, key) >= 0.
     */
    lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): C;
    /**
     * Heterogeneous lookup: Returns a cursor pointing to the first element
     * where compare(item, key) > 0.
     */
    upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): C;
    /**
     * Inserts an element into the correct sorted position.
     */
    insert(item: T): void;
    /**
     * Deletes an element at the specified logical index.
     */
    deleteAt(index: number): T | undefined;
    /**
     * Deletes an element, using a cursor.
     */
    deleteCursor(cursor: Cursor<T>): T | undefined;
    /**
     * Retrieves an element at the specified logical index.
     */
    get(index: number): T | undefined;
    /**
     * Returns a cursor starting at the specified logical index.
     */
    cursor(index?: number): C;
    /**
     * Clears the container.
     */
    clear(reuse?: boolean): void;
}
