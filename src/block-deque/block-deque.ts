// src/block-deque/block-deque.ts

import { Deque } from '../deque/deque';
import { BlockDequeCursor } from './block-deque-cursor';
import { InternalIterable } from '../internal-iterable';
import { nextPowerOfTwo } from '../math';

/**
 * BlockDeque: A Deque-backed Tiered Vector.
 * Provides strict O(1) random access along with O(1) bidirectional mutations (push, pop, unshift, shift).
 * Internal elements are maintained in strictly sized Deque blocks, allowing pure mathematical indexing.
 */
export class BlockDeque<T> extends InternalIterable<T> {
  public blocks: Deque<Deque<T>> = new Deque<Deque<T>>(16);
  private _length: number = 0;
  public readonly B: number;
  private pool: Deque<T>[] = [];

  constructor(blockSize: number = 512) {
    super();
    this.B = nextPowerOfTwo(blockSize);
    this.blocks.pushBack(this._allocateBlock());
  }

  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    let globalIdx = 0;
    const blocks = this.blocks;
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks.get(bi)!;
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

  get capacity(): number {
    return (this.blocks.length + this.pool.length) * this.B;
  }

  isEmpty(): boolean {
    return this._length === 0;
  }

  clear(reuse: boolean = true): void {
    if (reuse) {
      for (const block of this.blocks) {
        this._recycleBlock(block);
      }
    }
    this.blocks.clear();
    this.blocks.pushBack(this._allocateBlock());
    this._length = 0;
  }

  reserve(n: number): void {
    const currentCap = this.capacity;
    if (n <= currentCap) return;

    const needed = (n - currentCap + this.B - 1) / this.B;
    for (let i = 0; i < needed; i++) {
      this.pool.push(new Deque<T>(this.B));
    }
  }

  shrinkToFit(): void {
    this.pool.length = 0;
    this.blocks.shrinkToFit();
  }

  cursor(index: number = 0): BlockDequeCursor<T> {
    return new BlockDequeCursor<T>(this, index);
  }

  /**
   * Internal helper to map global index to physical block and local index.
   */
  _resolveIndex(index: number): [number, number] {
    const L0 = this.blocks.peekFront()!.length;
    if (index < L0) {
      return [0, index];
    }
    const relIdx = index - L0;
    const bi = (relIdx / this.B | 0) + 1;
    const li = relIdx % this.B;
    return [bi, li];
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    const [bi, li] = this._resolveIndex(index);
    return this.blocks.get(bi)!.get(li);
  }

  at(index: number): T | undefined {
    if (index < 0) index += this._length;
    return this.get(index);
  }

  set(index: number, value: T): void {
    if (index < 0) index += this._length;
    if (index < 0 || index >= this._length) throw new RangeError('Index out of bounds');
    const [bi, li] = this._resolveIndex(index);
    this.blocks.get(bi)!.set(li, value);
  }

  push(...values: T[]): void {
    this.pushAll(values);
  }

  pushAll(values: T[]): void {
    for (let i = 0; i < values.length; i++) {
      let last = this.blocks.peekBack()!;
      if (last.length >= this.B) {
        last = this._allocateBlock();
        this.blocks.pushBack(last);
      }
      last.pushBack(values[i]);
      this._length++;
    }
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined;

    const targetBlock = this.blocks.peekBack()!;
    const val = targetBlock.popBack();
    this._length--;

    if (targetBlock.length === 0 && this.blocks.length > 1) {
      this._recycleBlock(this.blocks.popBack()!);
    }

    return val;
  }

  unshift(...values: T[]): void {
    for (let i = values.length - 1; i >= 0; i--) {
      let first = this.blocks.peekFront()!;
      if (first.length >= this.B) {
        first = this._allocateBlock();
        this.blocks.pushFront(first);
      }
      first.pushFront(values[i]);
      this._length++;
    }
  }

  shift(): T | undefined {
    if (this._length === 0) return undefined;

    const targetBlock = this.blocks.peekFront()!;
    const val = targetBlock.popFront();
    this._length--;

    if (targetBlock.length === 0 && this.blocks.length > 1) {
      this._recycleBlock(this.blocks.popFront()!);
    }

    return val;
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) throw new RangeError('Index out of bounds');
    if (index === 0) return this.unshift(value);
    if (index === this._length) return this.push(value);

    let [bi, li] = this._resolveIndex(index);

    if (bi < this.blocks.length / 2) {
      // Closer to head, cascade backward
      if (this.blocks.peekFront()!.length >= this.B) {
        this.blocks.pushFront(this._allocateBlock());
        bi++; // Shift target block index to the right
      }

      for (let i = 1; i < bi; i++) {
        const overflow = this.blocks.get(i)!.popFront()!;
        this.blocks.get(i - 1)!.pushBack(overflow);
      }

      if (bi > 0) {
        if (li > 0) {
          const overflow = this.blocks.get(bi)!.popFront()!;
          this.blocks.get(bi - 1)!.pushBack(overflow);
          this.blocks.get(bi)!.insert(li - 1, value);
        } else {
          this.blocks.get(bi - 1)!.pushBack(value);
        }
      } else {
        this.blocks.get(bi)!.insert(li, value);
      }
    } else {
      // Closer to tail, cascade forward
      if (this.blocks.peekBack()!.length >= this.B) {
        this.blocks.pushBack(this._allocateBlock());
      }

      for (let i = this.blocks.length - 2; i > bi; i--) {
        const overflow = this.blocks.get(i)!.popBack()!;
        this.blocks.get(i + 1)!.pushFront(overflow);
      }

      if (bi < this.blocks.length - 1) {
        const overflow = this.blocks.get(bi)!.popBack()!;
        this.blocks.get(bi + 1)!.pushFront(overflow);
        this.blocks.get(bi)!.insert(li, value);
      } else {
        this.blocks.get(bi)!.insert(li, value);
      }
    }

    this._length++;
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    if (index === 0) return this.shift();
    if (index === this._length - 1) return this.pop();

    const [bi, li] = this._resolveIndex(index);
    const removed = this.blocks.get(bi)!.remove(li);
    this._length--;

    if (bi < this.blocks.length / 2) {
      // Pull from left to right
      for (let i = bi; i > 0; i--) {
        const filler = this.blocks.get(i - 1)!.popBack()!;
        this.blocks.get(i)!.pushFront(filler);
      }

      while (this.blocks.length > 1 && this.blocks.peekFront()!.length === 0) {
        this._recycleBlock(this.blocks.popFront()!);
      }
    } else {
      // Pull from right to left
      for (let i = bi; i < this.blocks.length - 1; i++) {
        const filler = this.blocks.get(i + 1)!.popFront()!;
        this.blocks.get(i)!.pushBack(filler);
      }

      while (this.blocks.length > 1 && this.blocks.peekBack()!.length === 0) {
        this._recycleBlock(this.blocks.popBack()!);
      }
    }

    return removed;
  }

  deleteCursor(cursor: BlockDequeCursor<T>): T | undefined {
    if (!cursor.active) return undefined;
    return this.delete(cursor.index);
  }

  resize(newSize: number, fillValue?: T): void {
    if (newSize < 0) throw new RangeError('Invalid size');
    if (newSize === this._length) return;

    if (newSize < this._length) {
      if (newSize === 0) return this.clear();
      const [bi, li] = this._resolveIndex(newSize - 1);

      this.blocks.get(bi)!.resize(li + 1);

      while (this.blocks.length > bi + 1) {
        this._recycleBlock(this.blocks.popBack()!);
      }
      this._length = newSize;
    } else {
      while (this._length < newSize) {
        this.push(fillValue as T);
      }
    }
  }

  rebase(newBlockSize?: number): void {
    if (newBlockSize !== undefined && newBlockSize > 0) {
      // @ts-ignore
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

  slice(start?: number, end?: number): BlockDeque<T> {
    const s = start === undefined ? 0 : start < 0 ? Math.max(this._length + start, 0) : Math.min(start, this._length);
    const e = end === undefined ? this._length : end < 0 ? Math.max(this._length + end, 0) : Math.min(end, this._length);

    const res = new BlockDeque<T>(this.B);
    res.pop();

    if (s >= e) return res;

    const cur = this.cursor(s);
    let count = e - s;
    while (cur.active && count > 0) {
      res.push(cur.value!);
      cur.next();
      count--;
    }

    return res;
  }

  concat(...items: (T | T[] | BlockDeque<T>)[]): BlockDeque<T> {
    const res = this.slice();

    for (const item of items) {
      if (item instanceof BlockDeque) {
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

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    let actualStart = start < 0 ? Math.max(this._length + start, 0) : Math.min(start, this._length);
    let actualDeleteCount = deleteCount === undefined
      ? this._length - actualStart
      : Math.max(Math.min(deleteCount, this._length - actualStart), 0);

    const removed: T[] = [];
    for (let i = 0; i < actualDeleteCount; i++) {
      removed.push(this.delete(actualStart)!);
    }

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
