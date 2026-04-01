import type { SortedBlockArray } from './sorted-block-array';
import type { RandomAccessCursor, CursorState } from '../cursor';
export declare class SortedBlockArrayCursor<T> implements RandomAccessCursor<T> {
    blockIndex: number;
    localIndex: number;
    state: CursorState;
    index: number;
    private readonly list;
    constructor(list: SortedBlockArray<T>, bi?: number, li?: number);
    get active(): boolean;
    get value(): T | undefined;
    next(): boolean;
    prev(): boolean;
    seek(targetIndex: number): boolean;
    advance(offset: number): boolean;
    clone(): this;
}
