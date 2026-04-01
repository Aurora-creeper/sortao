import type { BlockArray } from './block-array';
import type { RandomAccessCursor, MutableCursor, CursorState } from '../cursor';
export declare class BlockArrayCursor<T> implements RandomAccessCursor<T>, MutableCursor<T> {
    blockIndex: number;
    localIndex: number;
    state: CursorState;
    index: number;
    readonly array: BlockArray<T>;
    constructor(array: BlockArray<T>, startIndex?: number);
    get active(): boolean;
    get value(): T | undefined;
    set(value: T): void;
    next(): boolean;
    prev(): boolean;
    seek(targetIndex: number): boolean;
    advance(offset: number): boolean;
    clone(): this;
}
