import type { SplayTree, SplayNode } from './splay';
import type { RandomAccessCursor, CursorState } from '../cursor';
/**
 * Cursor for SplayTree.
 */
export declare class SplayCursor<K, Node extends SplayNode<K, Node>> implements RandomAccessCursor<K> {
    private tree;
    node: Node | null;
    state: CursorState;
    index: number;
    constructor(tree: SplayTree<K, Node>, node: Node | null, state?: CursorState);
    get value(): K | undefined;
    get active(): boolean;
    refresh(): boolean;
    next(): boolean;
    prev(): boolean;
    seek(index: number): boolean;
    advance(offset: number): boolean;
    clone(): this;
}
