// src/block-array/block-array-base.ts

import { InternalIterable } from '../internal-iterable';

/**
 * Manages chunk splitting, merging, prefix sums, and element splice operations.
 */
export abstract class BlockArrayBase<T> extends InternalIterable<T> {
  public blocks: T[][] = [[]];
  public prefixSums: number[] = [0];
  protected _length: number = 0;
  protected B: number;
  protected isUniform: boolean = true;

  constructor(blockSize: number = 512) {
    super();
    this.B = blockSize;
  }

  public _traverse(callback: (val: T, index: number) => boolean | void): void {
    let globalIdx = 0;
    const blocks = this.blocks;
    const bLen = blocks.length;
    for (let bi = 0; bi < bLen; bi++) {
      const block = blocks[bi];
      const liLen = block.length;
      for (let li = 0; li < liLen; li++) {
        if (callback(block[li], globalIdx++) === true) return;
      }
    }
  }

  /** Subclasses must still implement the cursor entry point. */
  abstract cursor(bi?: number, li?: number): any;

  get length(): number { return this._length; }
  get capacity(): number { return this._length; }

  isEmpty(): boolean { return this._length === 0; }

  clear(reuse: boolean = true): void {
    if (reuse && this.blocks.length > 0) {
      this.blocks[0].length = 0;
      this.blocks.length = 1;
    } else {
      this.blocks = [[]];
    }
    this.prefixSums = [0];
    this._length = 0;
    this.isUniform = true;
  }

  /** @deprecated duck, no-op */
  reserve(_n: number): void { }

  /** @deprecated duck, no-op */
  shrinkToFit(): void { }

  protected rebuildPrefixSums(): void {
    const numBlocks = this.blocks.length;
    this.prefixSums.length = numBlocks;
    let sum = 0;
    for (let i = 0; i < numBlocks; i++) {
      this.prefixSums[i] = sum;
      sum += this.blocks[i].length;
    }
  }

  protected _findBlockByIndex(index: number): [number, number] {
    if (this.isUniform) {
      const bi = (index / this.B) | 0;
      if (bi < this.blocks.length) {
        return [bi, index - bi * this.B];
      }
    }

    const pre = this.prefixSums;
    let L = 0;
    let R = this.blocks.length - 1;

    while (L <= R) {
      const mid = (L + R) >> 1;
      if (pre[mid] <= index) {
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    const pos = L - 1;
    return [pos, index - pre[pos]];
  }

  protected _insertAt(bi: number, li: number, value: T): void {
    this.isUniform = false;
    this.blocks[bi].splice(li, 0, value);
    this._length++;

    for (let i = bi + 1; i < this.prefixSums.length; i++) {
      this.prefixSums[i]++;
    }

    if (this.blocks[bi].length > 2 * this.B) {
      this._split(bi);
    }
  }

  protected _deleteAt(bi: number, li: number): T {
    this.isUniform = false;
    const removed = this.blocks[bi].splice(li, 1)[0];
    this._length--;

    for (let i = bi + 1; i < this.prefixSums.length; i++) {
      this.prefixSums[i]--;
    }

    this._tryMerge(bi);
    return removed;
  }

  protected _split(bi: number): void {
    const block = this.blocks[bi];
    const mid = Math.floor(block.length / 2);
    const newBlock = block.splice(mid);
    this.blocks.splice(bi + 1, 0, newBlock);
    this.prefixSums.splice(bi + 1, 0, this.prefixSums[bi] + block.length);
  }

  protected _tryMerge(bi: number): void {
    if (bi < 0 || bi >= this.blocks.length) return;

    if (this.blocks[bi].length === 0 && this.blocks.length > 1) {
      this.blocks.splice(bi, 1);
      this.prefixSums.splice(bi, 1);
      return;
    }

    if (bi < this.blocks.length - 1) {
      if (this.blocks[bi].length + this.blocks[bi + 1].length <= this.B) {
        const nextBlock = this.blocks.splice(bi + 1, 1)[0];
        this.blocks[bi] = this.blocks[bi].concat(nextBlock);
        this.prefixSums.splice(bi + 1, 1);
        return;
      }
    }

    if (bi > 0) {
      if (this.blocks[bi].length + this.blocks[bi - 1].length <= this.B) {
        const currentBlock = this.blocks.splice(bi, 1)[0];
        this.blocks[bi - 1] = this.blocks[bi - 1].concat(currentBlock);
        this.prefixSums.splice(bi, 1);
      }
    }
  }

  toArray(): T[] {
    return this.blocks.flat();
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (const block of this.blocks) {
      for (const value of block) {
        yield value;
      }
    }
  }
}
