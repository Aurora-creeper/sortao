import type { BlockDeque } from './block-deque';
import type { RandomAccessCursor, MutableCursor, CursorState } from '../cursor';
export declare class BlockDequeCursor<T> implements RandomAccessCursor<T>, MutableCursor<T> {
    private blockIndex;
    private localIndex;
    state: CursorState;
    index: number;
    private readonly deque;
    constructor(deque: BlockDeque<T>, startIndex?: number);
    get active(): boolean;
    get value(): T | undefined;
    set(value: T): void;
    next(): boolean;
    prev(): boolean;
    seek(targetIndex: number): boolean;
    advance(offset: number): boolean;
    clone(): this;
}
