import type { BlockList } from './block-list';
import type { RandomAccessCursor, MutableCursor, CursorState } from '../cursor';
export declare class BlockListCursor<T> implements RandomAccessCursor<T>, MutableCursor<T> {
    blockIndex: number;
    localIndex: number;
    state: CursorState;
    index: number;
    readonly list: BlockList<T>;
    constructor(list: BlockList<T>, startIndex?: number);
    get active(): boolean;
    get value(): T | undefined;
    set(value: T): void;
    next(): boolean;
    prev(): boolean;
    seek(targetIndex: number): boolean;
    advance(offset: number): boolean;
    clone(): this;
}
