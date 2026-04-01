// src/randomized-heap/randomized-heap.ts

import { InternalIterable } from '../internal-iterable';

/**
 * RandomizedHeapNode: Internal binary tree node for the Randomized Heap.
 */
class HeapNode<T> {
  constructor(
    public value: T,
    public left: HeapNode<T> | null = null,
    public right: HeapNode<T> | null = null
  ) { }
}

/**
 * RandomizedHeap: A high-performance mergeable priority queue.
 * 
 * Uses a randomized binary tree structure to maintain heap order.
 * It provides O(log N) expected time for push, pop, and meld operations.
 * 
 * Compared to a standard Array-based Binary Heap, it allows O(log N) merging 
 * of two heaps, at the cost of slightly higher memory overhead and lack of 
 * O(1) random access.
 */
export class RandomizedHeap<T> extends InternalIterable<T> {
  private root: HeapNode<T> | null = null;
  private _length: number = 0;
  private readonly compare: (a: T, b: T) => number;
  private seed: number = (Math.random() * 0xFFFFFFFF) >>> 0;

  /**
   * Creates a RandomizedHeap from an iterable.
   * Time Complexity: O(N)
   */
  static from<T>(iterable: Iterable<T>, compareFn?: (a: T, b: T) => number): RandomizedHeap<T> {
    const heap = new RandomizedHeap<T>(compareFn);
    const nodes: HeapNode<T>[] = [];

    for (const item of iterable) {
      nodes.push(new HeapNode(item));
    }

    heap._length = nodes.length;
    if (nodes.length === 0) return heap;

    // Bottom-up merge
    let currentLevel = nodes;
    while (currentLevel.length > 1) {
      const nextLevel: HeapNode<T>[] = [];
      for (let i = 0; i + 1 < currentLevel.length; i += 2) {
        nextLevel.push(heap._meld(currentLevel[i], currentLevel[i + 1])!);
      }
      if (currentLevel.length & 1) nextLevel.push(currentLevel[currentLevel.length - 1]);
      currentLevel = nextLevel;
    }
    heap.root = currentLevel[0];
    return heap;
  }

  /**
   * @param compareFn Optional comparison function. Defaults to a min-heap.
   */
  constructor(compareFn?: (a: T, b: T) => number) {
    super();
    this.compare = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
  }

  private xorshift(): number {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return this.seed;
  }

  /**
   * Internal traversal primitive required by InternalIterable.
   * Performs a recursive DFS over the heap structure.
   */
  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    let count = 0;
    const dfs = (node: HeapNode<T> | null): boolean => {
      if (!node) return false;
      if (callback(node.value, count++) === true) return true;
      if (dfs(node.left)) return true;
      if (dfs(node.right)) return true;
      return false;
    };
    dfs(this.root);
  }

  get length(): number {
    return this._length;
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  /**
   * Adds a new value to the heap.
   * Time Complexity: O(log N) expected.
   */
  push(value: T): void {
    const node = new HeapNode(value);
    this.root = this._meld(this.root, node);
    this._length++;
  }

  /**
   * Removes and returns the top element (smallest if min-heap).
   * Time Complexity: O(log N) expected.
   */
  pop(): T | undefined {
    if (!this.root) return undefined;
    const value = this.root.value;
    this.root = this._meld(this.root.left, this.root.right);
    this._length--;
    return value;
  }

  /**
   * Returns the top element without removing it.
   * Time Complexity: O(1).
   */
  top(): T | undefined {
    return this.root?.value;
  }

  /**
   * Merges another heap into this one. The other heap will be cleared.
   * Time Complexity: O(log N) expected.
   */
  meld(other: RandomizedHeap<T>): void {
    if (this === other || other._length === 0) return;
    this.root = this._meld(this.root, other.root);
    this._length += other._length;

    // Clear the other heap
    other.root = null;
    other._length = 0;
  }

  /**
   * Internal recursive meld operation.
   * Highly efficient due to binary tree structure and expected log-depth.
   */
  private _meld(h1: HeapNode<T> | null, h2: HeapNode<T> | null): HeapNode<T> | null {
    if (!h1) return h2;
    if (!h2) return h1;

    // Ensure h1 has the highest priority (top of heap)
    if (this.compare(h1.value, h2.value) > 0) {
      const temp = h1;
      h1 = h2;
      h2 = temp;
    }

    // Randomly decide which child to meld with 50% probability
    if ((this.xorshift() & 1) === 0) {
      h1.left = this._meld(h1.left, h2);
    } else {
      h1.right = this._meld(h1.right, h2);
    }

    return h1;
  }

  /**
   * Clears the heap.
   */
  clear(): void {
    this.root = null;
    this._length = 0;
  }

  /**
   * Returns all elements as a native array (unordered).
   * Time Complexity: O(N)
   */
  toArray(): T[] {
    const res: T[] = new Array(this._length);
    let ptr = 0;
    this._traverse((val) => {
      res[ptr++] = val;
    });
    return res;
  }
}
