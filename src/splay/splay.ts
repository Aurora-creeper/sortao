// src/splay/splay.ts

import { InternalIterable } from '../internal-iterable';
import { SortedKernel } from '../sorted-kernel';
import { SplayCursor } from './splay-cursor';

/**
 * Base class for a Splay Tree Node. \
 * Users should extend this class to add custom properties and implement `pushup`.
 */
export abstract class SplayNode<T, Node extends SplayNode<T, Node>> {
  value: T;
  parent: Node | null = null;
  left: Node | null = null;
  right: Node | null = null;
  size: number = 1;

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Updates the node's information based on its children. \
   * This is called automatically after rotations and structural changes. \
   * Example: this.size = (this.left?.size ?? 0) + (this.right?.size ?? 0) + 1;
   */
  abstract pushup(): void;
}

export class DefaultSplayNode<T> extends SplayNode<T, DefaultSplayNode<T>> {
  pushup(): void {
    this.size = (this.left?.size ?? 0) + (this.right?.size ?? 0) + 1;
  }
}

/**
 * A generic Splay Tree implementation.
 */
export class SplayTree<
  T,
  Node extends SplayNode<T, Node> = DefaultSplayNode<T>
>
  extends InternalIterable<T>
  implements SortedKernel<T, SplayCursor<T, Node>> {

  root: Node | null = null;
  private _length: number = 0;
  private NodeCtor: new (value: T) => Node;
  private compare: (a: T, b: T) => number;

  /**
   * @param compareFn Optional comparison function. Defaults to (a, b) => a - b for numbers.
   * @param NodeCtor The constructor for the node class. Defaults to DefaultSplayNode.
   */
  constructor(
    compareFn?: (a: T, b: T) => number,
    NodeCtor?: new (value: T) => Node
  ) {
    super();
    this.compare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
    this.NodeCtor = NodeCtor || (DefaultSplayNode as unknown as new (value: T) => Node);
  }

  /**
   * Internal traversal required by InternalIterable.
   * Uses an iterative successor-based approach with zero extra space.
   */
  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    let curr = this.root;
    if (!curr) return;

    // Move to the leftmost node (the minimum)
    while (curr.left) curr = curr.left;

    let index = 0;
    while (curr) {
      if (callback(curr.value, index++) === true) return;

      // Find successor in O(tree height)
      if (curr.right) {
        curr = curr.right;
        while (curr.left) curr = curr.left;
      } else {
        while (curr.parent && curr.parent.right === curr) {
          curr = curr.parent;
        }
        curr = curr.parent;
      }
    }
  }

  get length(): number {
    return this._length;
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  clear(_reuse?: boolean): void {
    this.root = null;
    this._length = 0;
  }

  /**
   * Helper to perform pushup on a node if it exists.
   */
  pushup(node: Node | null) {
    if (node) node.pushup();
  }

  /**
   * Rotates node x upwards.
   */
  rotate(x: Node) {
    const y = x.parent!;
    const z = y.parent;
    const isLeft = y.left === x;

    if (z) {
      if (z.left === y) z.left = x;
      else z.right = x;
    }
    x.parent = z;

    if (isLeft) {
      y.left = x.right;
      if (y.left) y.left.parent = y;
      x.right = y;
    } else {
      y.right = x.left;
      if (y.right) y.right.parent = y;
      x.left = y;
    }
    y.parent = x;

    y.pushup();
    x.pushup();
  }

  /**
   * Splays node x to the target position (root if target is null).
   */
  splay(x: Node, target: Node | null = null) {
    while (x.parent !== target) {
      const y = x.parent!;
      const z = y.parent;
      if (z !== target) {
        // Zig-zig or Zig-zag
        if ((y.left === x) === (z!.left === y)) {
          this.rotate(y);
        } else {
          this.rotate(x);
        }
      }
      this.rotate(x);
    }
    if (target === null) {
      this.root = x;
    }
  }

  /**
   * Inserts a value into the tree. \
   * Allows duplicate values (Multiset behavior).
   */
  insert(value: T): Node {
    if (!this.root) {
      this.root = new this.NodeCtor(value);
      this._length++;
      this.root.pushup();
      return this.root;
    }

    let curr = this.root;
    while (true) {
      const cmp = this.compare(value, curr.value);
      const next = cmp < 0 ? curr.left : curr.right;
      if (!next) {
        const node = new this.NodeCtor(value);
        node.parent = curr;
        if (cmp < 0) curr.left = node;
        else curr.right = node;

        this._length++;
        this.splay(node);
        return node;
      }
      curr = next;
    }
  }

  /**
   * Finds a value in the tree. Splays the node to root if found. \
   * If not found, splays the last accessed node to root.
   */
  findNode(value: T): Node | null {
    if (!this.root) return null;
    let curr: Node | null = this.root;
    let last = curr;
    while (curr) {
      last = curr;
      const cmp = this.compare(value, curr.value);
      if (cmp === 0) {
        this.splay(curr);
        return curr;
      }
      curr = cmp < 0 ? curr.left : curr.right;
    }
    this.splay(last);
    return null;
  }

  /**
   * Finds the maximum value in the tree. Splays the node to root.
   */
  findMax(): Node | null {
    if (!this.root) return null;
    let curr = this.root;
    while (curr.right) curr = curr.right;
    this.splay(curr);
    return curr;
  }

  /**
   * Finds the minimum value in the tree. Splays the node to root.
   */
  findMin(): Node | null {
    if (!this.root) return null;
    let curr = this.root;
    while (curr.left) curr = curr.left;
    this.splay(curr);
    return curr;
  }

  lower_bound_key<K>(key: K, compare: (item: T, key: K) => number): SplayCursor<T, Node> {
    let curr = this.root;
    let lastVisited: Node | null = null;
    let best: Node | null = null;

    while (curr) {
      lastVisited = curr;
      const cmp = compare(curr.value, key);
      if (cmp >= 0) {
        best = curr;
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    const nodeToSplay = best || lastVisited;
    if (nodeToSplay) {
      this.splay(nodeToSplay);
    }

    if (!best) return new SplayCursor(this, null, 1); // 1 = End

    return new SplayCursor(this, best, 0); // 0 = Valid
  }

  upper_bound_key<K>(key: K, compare: (item: T, key: K) => number): SplayCursor<T, Node> {
    let curr = this.root;
    let lastVisited: Node | null = null;
    let best: Node | null = null;

    while (curr) {
      lastVisited = curr;
      const cmp = compare(curr.value, key);
      if (cmp > 0) {
        best = curr;
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    const nodeToSplay = best || lastVisited;
    if (nodeToSplay) {
      this.splay(nodeToSplay);
    }

    if (!best) return new SplayCursor(this, null, 1); // 1 = End

    return new SplayCursor(this, best, 0); // 0 = Valid
  }

  cursor(index: number = 0): SplayCursor<T, Node> {
    if (index < 0) return new SplayCursor(this, null, 2); // 2 = Begin
    if (index >= this._length) return new SplayCursor(this, null, 1); // 1 = End
    const node = this.kthNode(index);
    return new SplayCursor(this, node, 0); // 0 = Valid
  }

  protected _deleteNode(node: Node): void {
    // node is at root due to splay
    if (!node.left) {
      this.root = node.right;
      if (this.root) this.root.parent = null;
    } else if (!node.right) {
      this.root = node.left;
      if (this.root) this.root.parent = null;
    } else {
      // Both children exist.
      // 1. Cut the right subtree
      const rightTree = node.right;
      rightTree.parent = null;

      // 2. Make left child the new root temporarily
      this.root = node.left;
      this.root.parent = null;

      // 3. Splay the maximum node in the left subtree to the root
      // This effectively makes the largest node of the left subtree the new root
      // which will have no right child, allowing us to attach the right subtree there.
      // @ts-ignore: side effect
      const maxLeft = this.findMax()!;

      // 4. Attach right subtree
      this.root.right = rightTree;
      rightTree.parent = this.root;
      this.root.pushup();
    }

    // Clear references for the deleted node
    node.left = null;
    node.right = null;
    node.parent = null;

    this._length--;
  }

  /**
   * Deletes a value from the tree.
   */
  delete(value: T): T | undefined {
    const node = this.findNode(value);
    if (!node || this.compare(node.value, value) !== 0) return undefined;
    const result = node.value;
    this._deleteNode(node);
    return result;
  }

  /**
   * Deletes a node by its 0-based logical index.
   */
  deleteAt(index: number): T | undefined {
    const node = this.kthNode(index);
    if (!node) return undefined;
    const value = node.value;
    this._deleteNode(node);
    return value;
  }

  deleteCursor(cursor: SplayCursor<T, Node>): T | undefined {
    if (!cursor.active) return undefined;
    if (!cursor.node) return undefined;
    const value = cursor.node.value;
    this._deleteNode(cursor.node);
    return value;
  }

  /**
   * Gets the rank of a value (number of values strictly less than it). \
   * Returns 0 if tree is empty.
   */
  rank(value: T): number {
    return this.lower_bound_key(value, (item, k) => this.compare(item, k)).index;
  }

  kthNode(index: number): Node | null {
    if (index < 0 || index >= this._length) return null;
    let curr = this.root;
    while (curr) {
      const leftSize = curr.left ? curr.left.size : 0;
      if (index === leftSize) {
        this.splay(curr);
        return curr;
      }
      if (index < leftSize) {
        curr = curr.left;
      } else {
        index -= leftSize + 1;
        curr = curr.right;
      }
    }
    return null;
  }

  get(index: number): T | undefined {
    return this.kthNode(index)?.value;
  }

  kth(k: number): T | undefined {
    return this.kthNode(k)?.value;
  }

  /**
   * Finds the predecessor of the given value (the largest node strictly smaller than value). \
   * Splays the found node to the root.
   */
  prev(value: T): Node | null {
    let curr = this.root;
    let result: Node | null = null;

    while (curr) {
      if (this.compare(curr.value, value) < 0) {
        result = curr;
        curr = curr.right;
      } else {
        curr = curr.left;
      }
    }
    if (result) {
      this.splay(result);
    }
    return result;
  }

  /**
   * Finds the successor of the given value (the smallest node strictly greater than value). \
   * Splays the found node to the root.
   */
  next(value: T): Node | null {
    let curr = this.root;
    let result: Node | null = null;

    while (curr) {
      if (this.compare(curr.value, value) > 0) {
        result = curr;
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }
    if (result) {
      this.splay(result);
    }
    return result;
  }

  /**
   * Joins another tree to the right of this tree. \
   * REQUIREMENT: All values in `this` tree must be smaller than all values in `other` tree. \
   * This operation is O(log N).
   */
  join(other: SplayTree<T, Node>): void {
    if (!other.root) return;
    if (!this.root) {
      this.root = other.root;
      this._length = other._length;
      other.root = null; // Transfer ownership
      other._length = 0;
      return;
    }

    // 1. Splay the maximum node of this tree to the root.
    const maxNode = this.findMax()!;
    // Now maxNode is root and has no right child (since it's max).

    // 2. Attach other tree as right child.
    maxNode.right = other.root;
    if (other.root) other.root.parent = maxNode;

    // 3. Update pushup
    this.pushup(maxNode);

    // Update length
    this._length += other._length;

    // Clear other tree root to avoid shared ownership issues
    other.root = null;
    other._length = 0;
  }

  /**
   * Merges another tree into this tree. \
   * This is a general merge that inserts all nodes from `other` into `this`. \
   * Destroys the `other` tree structure. \
   * Complexity: 
   *  -  O(M log (N+M)) where M is size of other tree.
   *  -  O(M log (N/M + 1)) if M <= N.
   */
  merge(other: SplayTree<T, Node>): void {
    if (!other.root) return;

    // Helper to traverse and insert
    const traverse = (node: Node | null) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      this.insert(node.value);
    };

    traverse(other.root);
    other.root = null;
    other._length = 0;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let curr = this.root;
    if (!curr) return;

    // Move to the leftmost node
    while (curr.left) curr = curr.left;

    while (curr) {
      yield curr.value;

      // Find successor
      if (curr.right) {
        curr = curr.right;
        while (curr.left) curr = curr.left;
      } else {
        while (curr.parent && curr.parent.right === curr) {
          curr = curr.parent;
        }
        curr = curr.parent;
      }
    }
  }
}
