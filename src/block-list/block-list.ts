// src/block-list/block-list.ts

import { Deque } from '../deque/deque';
import { BlockListCursor } from './block-list-cursor';
import { InternalIterable } from '../internal-iterable';
import { nextPowerOfTwo } from '../math';

/**
 * BlockList: An Array-backed Tiered Vector with strict O(1) random access.
 * 
 * Uses a Native Array of Deque blocks. Maintains an invariant that all blocks 
 * except the last are exactly size B. This allows pure mathematical indexing 
 * (index / B) instead of binary search on prefix sums.
 * 
 * Trade-off: Insertion/Deletion anywhere except the tail triggers a cascade 
 * towards the tail (O(N/B)), but random access is as fast as a native array.
 */
export class BlockList<T> extends InternalIterable<T> {
  public blocks: Deque<T>[] = [];
  private _length: number = 0;
  public readonly B: number;
  private pool: Deque<T>[] = [];

  /**
   * @param blockSize The strict size limit for all internal blocks except the last one.
   * Will be automatically rounded up to the nearest power of 2 to perfectly align with Deque capacity.
   */
  constructor(blockSize: number = 512) {
    super();
    this.B = nextPowerOfTwo(blockSize);
    this.blocks.push(this._allocateBlock());
  }

  /**
   * Returns a high-performance internal iterator for functional operations.
   */
  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    let globalIdx = 0;
    const blocks = this.blocks;
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks[bi];
      // Maybe no using iter
      for (const val of block) {
        if (callback(val, globalIdx++) === true) return;
      }
    }
  }

  private _allocateBlock(): Deque<T> {
    return this.pool.length > 0 ? this.pool.pop()! : new Deque<T>(this.B);
  }

  private _recycleBlock(block: Deque<T>): void {
    block.clear();
    this.pool.push(block);
  }

  get length(): number {
    return this._length;
  }

  /**
   * Returns the total number of elements the structure can hold without 
   * allocating new blocks from the system heap (includes active blocks and the object pool).
   */
  get capacity(): number {
    return (this.blocks.length + this.pool.length) * this.B;
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  /**
   * Clears the list.
   * @param reuse If true (default), blocks are cleaned and returned to the object pool (O(N)).
   *              If false, blocks are simply discarded for GC (O(1)).
   */
  clear(reuse: boolean = true): void {
    if (reuse) {
      for (const block of this.blocks) {
        this._recycleBlock(block);
      }
    }
    this.blocks = [this._allocateBlock()];
    this._length = 0;
  }

  /**
   * Pre-allocates enough blocks to ensure capacity for at least `n` elements.
   * Useful when you know the approximate size of data beforehand.
   */
  reserve(n: number): void {
    const currentCap = this.capacity;
    if (n <= currentCap) return;

    const needed = Math.ceil((n - currentCap) / this.B);
    for (let i = 0; i < needed; i++) {
      this.pool.push(new Deque<T>(this.B));
    }
  }

  /**
   * Releases all unused blocks currently stored in the object pool.
   */
  shrinkToFit(): void {
    this.pool.length = 0;
  }

  cursor(index: number = 0): BlockListCursor<T> {
    return new BlockListCursor<T>(this, index);
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    const bi = (index / this.B) | 0;
    const li = index % this.B;
    return this.blocks[bi].get(li);
  }

  at(index: number): T | undefined {
    if (index < 0) index += this._length;
    return this.get(index);
  }

  set(index: number, value: T): void {
    if (index < 0) index += this._length;
    if (index < 0 || index >= this._length) throw new RangeError('Index out of bounds');
    const bi = (index / this.B) | 0;
    const li = index % this.B;
    this.blocks[bi].set(li, value);
  }

  push(...values: T[]): void {
    this.pushAll(values);
  }

  /**
   * Appends multiple elements to the end of the list.
   * Direct array input prevents stack overflow from spread arguments.
   */
  pushAll(values: T[]): void {
    for (let i = 0; i < values.length; i++) {
      let last = this.blocks[this.blocks.length - 1];
      if (last.length >= this.B) {
        last = this._allocateBlock();
        this.blocks.push(last);
      }
      last.pushBack(values[i]);
      this._length++;
    }
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined;

    let targetBi = this.blocks.length - 1;
    let targetBlock = this.blocks[targetBi];

    // If the last block is an empty hysteresis buffer, we must discard it BEFORE
    // popping from the previous block. A buffer is only mathematically valid 
    // if the block preceding it is completely full (size B).
    if (targetBlock.length === 0 && targetBi > 0) {
      this._recycleBlock(this.blocks.pop()!);
      targetBi--;
      targetBlock = this.blocks[targetBi];
    }

    const val = targetBlock.popBack();
    this._length--;

    return val;
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) throw new RangeError('Index out of bounds');
    if (index === this._length) {
      this.push(value);
      return;
    }

    const bi = (index / this.B) | 0;
    const li = index % this.B;

    // Anticipatory Backward Cascade
    // We create space AT the target block by shifting the tail element of every block 
    // down to the target block into the head of the next block.
    // This guarantees the target block will have size B-1, safely avoiding Deque.grow()

    if (this.blocks[this.blocks.length - 1].length >= this.B) {
      this.blocks.push(this._allocateBlock());
    }

    for (let i = this.blocks.length - 2; i >= bi; i--) {
      const overflow = this.blocks[i].popBack()!;
      this.blocks[i + 1].pushFront(overflow);
    }

    this.blocks[bi].insert(li, value);
    this._length++;
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    if (index === this._length - 1) return this.pop();

    const bi = (index / this.B) | 0;
    const li = index % this.B;

    const removed = this.blocks[bi].remove(li);
    this._length--;

    this._cascadeBackward(bi);
    return removed;
  }

  deleteCursor(cursor: BlockListCursor<T>): T | undefined {
    if (!cursor.active) return undefined;
    return this.delete(cursor.index);
  }

  private _cascadeBackward(startBi: number): void {
    let bi = startBi;
    while (bi < this.blocks.length - 1) {
      const nextBlock = this.blocks[bi + 1];
      if (nextBlock.length === 0) {
        break;
      }
      const filler = nextBlock.popFront()!;
      this.blocks[bi].pushBack(filler);
      bi++;
    }

    // After a delete-cascade, we prune all empty trailing blocks to stay compact
    while (this.blocks.length > 1 && this.blocks[this.blocks.length - 1].length === 0) {
      this._recycleBlock(this.blocks.pop()!);
    }
  }

  /**
   * Resizes the array to contain `newSize` elements.
   */
  resize(newSize: number, fillValue?: T): void {
    if (newSize < 0) throw new RangeError('Invalid size');
    if (newSize === this._length) return;

    if (newSize < this._length) {
      if (newSize === 0) return this.clear();
      const lastIdx = newSize - 1;
      const bi = (lastIdx / this.B) | 0;
      const li = lastIdx % this.B;

      this.blocks[bi].resize(li + 1);

      while (this.blocks.length > bi + 1) {
        this._recycleBlock(this.blocks.pop()!);
      }
      this._length = newSize;
    } else {
      while (this._length < newSize) {
        this.push(fillValue as T);
      }
    }
  }

  shift(): T | undefined {
    return this.delete(0);
  }

  unshift(...values: T[]): void {
    // For BlockList, unshift requires cascading everything right.
    // We insert in reverse order to maintain the correct sequence.
    for (let i = values.length - 1; i >= 0; i--) {
      this.insert(0, values[i]);
    }
  }

  rebase(newBlockSize?: number): void {
    if (newBlockSize !== undefined && newBlockSize > 0) {
      // @ts-ignore - bypassing readonly for dynamic rebase
      this.B = nextPowerOfTwo(newBlockSize);
    }
    if (this._length === 0) {
      this.clear();
      return;
    }
    const allItems = this.toArray();
    this.clear();
    this.push(...allItems);
  }

  reverse(): this {
    if (this._length <= 1) return this;
    const allItems = this.toArray();
    allItems.reverse();
    this.clear();
    this.push(...allItems);
    return this;
  }

  slice(start?: number, end?: number): BlockList<T> {
    const s = start === undefined ? 0 : start < 0 ? Math.max(this._length + start, 0) : Math.min(start, this._length);
    const e = end === undefined ? this._length : end < 0 ? Math.max(this._length + end, 0) : Math.min(end, this._length);

    const res = new BlockList<T>(this.B);
    res.pop(); // Remove the initial empty block allocated by constructor

    if (s >= e) return res;

    // Use cursor for efficient O(K) sequential read
    const cur = this.cursor(s);
    let count = e - s;
    while (cur.active && count > 0) {
      res.push(cur.value!);
      cur.next();
      count--;
    }

    return res;
  }

  concat(...items: (T | T[] | BlockList<T>)[]): BlockList<T> {
    const res = this.slice(); // Clone self

    for (const item of items) {
      if (item instanceof BlockList) {
        const cur = item.cursor();
        while (cur.active) {
          res.push(cur.value!);
          cur.next();
        }
      } else if (Array.isArray(item)) {
        res.push(...item);
      } else {
        res.push(item as T);
      }
    }
    return res;
  }

  /**
   * WARNING: splice on BlockList is implemented via simple iteration for API completeness.
   * It performs O(K * N/B) cascading operations.
   * For heavy middle-array splicing, use BlockArray instead!
   * @todo Implement bulk-shift optimization if absolutely necessary.
   */
  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    return this.spliceAll(start, deleteCount, items);
  }

  /**
   * Array-based splice to prevent call stack overflow with huge numbers of items.
   */
  spliceAll(start: number, deleteCount?: number, items: T[] = []): T[] {
    let actualStart = start < 0 ? Math.max(this._length + start, 0) : Math.min(start, this._length);
    let actualDeleteCount = deleteCount === undefined
      ? this._length - actualStart
      : Math.max(Math.min(deleteCount, this._length - actualStart), 0);

    const removed: T[] = [];
    for (let i = 0; i < actualDeleteCount; i++) {
      removed.push(this.delete(actualStart)!);
    }

    // Insert new items
    for (let i = items.length - 1; i >= 0; i--) {
      this.insert(actualStart, items[i]);
    }

    return removed;
  }

  toArray(): T[] {
    const res = new Array(this._length);
    let ptr = 0;
    for (const block of this.blocks) {
      for (const val of block) {
        res[ptr++] = val;
      }
    }
    return res;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (const block of this.blocks) {
      yield* block;
    }
  }
}
