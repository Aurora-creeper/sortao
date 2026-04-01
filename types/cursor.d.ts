/**
 * Represents the topological boundary state of the cursor.
 * 0: Active (pointing to a real element)
 * 1: End (out of bounds on the right, conceptually ::end)
 * 2: Begin (out of bounds on the left, conceptually ::rend)
 */
export declare const enum CursorState {
    active = 0,
    end = 1,
    rend = 2
}
/**
 * Basic bidirectional cursor.
 * Ideal for traversing any sequential or tree-like structure.
 */
export interface Cursor<T> {
    /** The value at the current cursor position. Returns undefined if cursor is invalid. */
    readonly value: T | undefined;
    /** Indicates whether the cursor is pointing to a valid element (not out of bounds). */
    readonly active: boolean;
    /** The boundary state of the cursor (0: Valid, 1: End, 2: Begin). */
    readonly state: CursorState;
    /** Calculate the ranking of the position pointed to by the cursor. */
    readonly index: number;
    /**
     * Physically recalculates and synchronizes the logical `index`.
     * Essential if the underlying container was mutated while holding this cursor.
     * @returns true if the cursor's physical pointer is still a valid part of the container.
     */
    refresh?(): boolean;
    /**
     * Moves the cursor to the next element.
     * @returns true if the cursor is valid after moving.
     */
    next(): boolean;
    /**
     * Moves the cursor to the previous element.
     * @returns true if the cursor is valid after moving.
     */
    prev(): boolean;
    /**
     * Jumps relative to the current index (positive or negative offset).
     * @returns true if the resulting index is within valid bounds.
     */
    advance(offset: number): boolean;
    /** Creates an independent copy of this cursor. */
    clone(): this;
}
/**
 * Cursor with O(1) or near O(1) random access support.
 * Ideal for block arrays, tiered vectors, etc.
 */
export interface RandomAccessCursor<T> extends Cursor<T> {
    /**
     * Jumps directly to a specific logical index.
     * @returns true if the index is within valid bounds.
     */
    seek(index: number): boolean;
}
/**
 * Cursor that allows modifying the element it points to.
 */
export interface MutableCursor<T> extends Cursor<T> {
    /** Modifies the value at the current cursor position. Throws if invalid. */
    set(value: T): void;
}
