import { InternalIterable } from '../internal-iterable';
import { SortedKernel } from '../sorted-kernel';
import { SplayCursor } from './splay-cursor';
/**
 * Base class for a Splay Tree Node. \
 * Users should extend this class to add custom properties and implement `pushup`.
 */
export declare abstract class SplayNode<T, Node extends SplayNode<T, Node>> {
    value: T;
    parent: Node | null;
    left: Node | null;
    right: Node | null;
    size: number;
    constructor(value: T);
    /**
     * Updates the node's information based on its children. \
     * This is called automatically after rotations and structural changes. \
     * Example: this.size = (this.left?.size ?? 0) + (this.right?.size ?? 0) + 1;
     */
    abstract pushup(): void;
}
export declare class DefaultSplayNode<T> extends SplayNode<T, DefaultSplayNode<T>> {
    pushup(): void;
}
/**
 * A generic Splay Tree implementation.
 */
export declare class SplayTree<T, Node extends SplayNode<T, Node> = DefaultSplayNode<T>> extends InternalIterable<T> implements SortedKernel<T, SplayCursor<T, Node>> {
    root: Node | null;
    private _length;
    private NodeCtor;
    private compare;
    /**
     * @param compareFn Optional comparison function. Defaults to (a, b) => a - b for numbers.
     * @param NodeCtor The constructor for the node class. Defaults to DefaultSplayNode.
     */
    constructor(compareFn?: (a: T, b: T) => number, NodeCtor?: new (value: T) => Node);
    /**
     * Internal traversal required by InternalIterable.
     * Uses an iterative successor-based approach with zero extra space.
     */
    _traverse(callback: (val: T, index: number) => boolean | void): void;
    get length(): number;
    isEmpty(): boolean;
    clear(_reuse?: boolean): void;
    /**
     * Helper to perform pushup on a node if it exists.
     */
    pushup(node: Node | null): void;
    /**
     * Rotates node x upwards.
     */
    rotate(x: Node): void;
    /**
     * Splays node x to the target position (root if target is null).
     */
    splay(x: Node, target?: Node | null): void;
    /**
     * Inserts a value into the tree. \
     * Allows duplicate values (Multiset behavior).
     */
    insert(value: T): Node;
    /**
     * Finds a value in the tree. Splays the node to root if found. \
     * If not found, splays the last accessed node to root.
     */
    findNode(value: T): Node | null;
    /**
     * Finds the maximum value in the tree. Splays the node to root.
     */
    findMax(): Node | null;
    /**
     * Finds the minimum value in the tree. Splays the node to root.
     */
    findMin(): Node | null;
    lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): SplayCursor<T, Node>;
    upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): SplayCursor<T, Node>;
    cursor(index?: number): SplayCursor<T, Node>;
    protected _deleteNode(node: Node): void;
    /**
     * Deletes a value from the tree.
     */
    delete(value: T): T | undefined;
    /**
     * Deletes a node by its 0-based logical index.
     */
    deleteAt(index: number): T | undefined;
    deleteCursor(cursor: SplayCursor<T, Node>): T | undefined;
    /**
     * Gets the rank of a value (number of values strictly less than it). \
     * Returns 0 if tree is empty.
     */
    rank(value: T): number;
    kthNode(index: number): Node | null;
    get(index: number): T | undefined;
    kth(k: number): T | undefined;
    /**
     * Finds the predecessor of the given value (the largest node strictly smaller than value). \
     * Splays the found node to the root.
     */
    prev(value: T): Node | null;
    /**
     * Finds the successor of the given value (the smallest node strictly greater than value). \
     * Splays the found node to the root.
     */
    next(value: T): Node | null;
    /**
     * Joins another tree to the right of this tree. \
     * REQUIREMENT: All values in `this` tree must be smaller than all values in `other` tree. \
     * This operation is O(log N).
     */
    join(other: SplayTree<T, Node>): void;
    /**
     * Merges another tree into this tree. \
     * This is a general merge that inserts all nodes from `other` into `this`. \
     * Destroys the `other` tree structure. \
     * Complexity:
     *  -  O(M log (N+M)) where M is size of other tree.
     *  -  O(M log (N/M + 1)) if M <= N.
     */
    merge(other: SplayTree<T, Node>): void;
    [Symbol.iterator](): IterableIterator<T>;
}
