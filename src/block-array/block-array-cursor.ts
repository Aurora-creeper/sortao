// src/block-array/block-array-cursor.ts

import type { BlockArray } from './block-array';
import type { RandomAccessCursor, MutableCursor, CursorState } from '../cursor';

export class BlockArrayCursor<T> implements RandomAccessCursor<T>, MutableCursor<T> {
  public blockIndex: number = 0;
  public localIndex: number = 0;

  public state: CursorState = 0;
  public index: number = 0;

  public readonly array: BlockArray<T>;

  constructor(array: BlockArray<T>, startIndex: number = 0) {
    this.array = array;
    this.seek(startIndex);
  }

  get active(): boolean {
    return this.state === 0;
  }

  get value(): T | undefined {
    if (this.state !== 0) return undefined;
    const block = this.array.blocks[this.blockIndex];
    return block ? block[this.localIndex] : undefined;
  }

  set(value: T): void {
    if (this.state !== 0) throw new RangeError('Cursor out of bounds');
    const block = this.array.blocks[this.blockIndex];
    if (!block || this.localIndex >= block.length) {
      throw new Error('Cursor invalidated by structural mutation.');
    }
    block[this.localIndex] = value;
  }

  // refresh(): boolean {
  //   if (this.state === 1) { this.index = this.array.length; return false; }
  //   if (this.state === 2) { this.index = -1; return false; }

  //   const block = this.array.blocks[this.blockIndex];
  //   if (!block || this.localIndex >= block.length) {
  //     this.state = 1;
  //     this.index = this.array.length;
  //     return false;
  //   }

  //   this.index = this.array.prefixSums[this.blockIndex] + this.localIndex;
  //   return true;
  // }

  next(): boolean {
    if (this.state === 1) return false;
    if (this.state === 2) {
      if (this.array.length === 0) {
        this.state = 1;
        this.index = 0;
        return false;
      }
      this.state = 0;
      this.index = 0;
      this.blockIndex = 0;
      this.localIndex = 0;
      return true;
    }

    const block = this.array.blocks[this.blockIndex];
    if (!block) {
      this.state = 1;
      this.index = this.array.length;
      return false;
    }

    this.localIndex++;
    this.index++;
    if (this.localIndex >= block.length) {
      this.blockIndex++;
      this.localIndex = 0;
      if (this.blockIndex >= this.array.blocks.length) {
        this.state = 1;
        return false;
      }
    }
    return true;
  }

  prev(): boolean {
    if (this.state === 2) return false;
    if (this.state === 1) {
      if (this.array.length === 0) {
        this.state = 2;
        this.index = -1;
        return false;
      }
      this.state = 0;
      this.index = this.array.length - 1;
      this.blockIndex = this.array.blocks.length - 1;
      this.localIndex = this.array.blocks[this.blockIndex].length - 1;
      return true;
    }

    const block = this.array.blocks[this.blockIndex];
    if (!block) {
      this.state = 2;
      this.index = -1;
      return false;
    }

    this.localIndex--;
    this.index--;
    if (this.localIndex < 0) {
      this.blockIndex--;
      if (this.blockIndex >= 0) {
        this.localIndex = this.array.blocks[this.blockIndex].length - 1;
      } else {
        this.localIndex = 0;
        this.state = 2;
        return false;
      }
    }
    return true;
  }

  seek(targetIndex: number): boolean {
    if (targetIndex < 0) {
      this.state = 2;
      this.index = -1;
      this.blockIndex = -1;
      this.localIndex = 0;
      return false;
    }
    if (targetIndex >= this.array.length) {
      this.state = 1;
      this.index = this.array.length;
      this.blockIndex = this.array.blocks.length;
      this.localIndex = 0;
      return false;
    }

    this.state = 0;
    this.index = targetIndex;
    // @ts-expect-error accessing protected method
    const [bi, li] = this.array._findBlockByIndex(targetIndex);
    this.blockIndex = bi;
    this.localIndex = li;

    return true;
  }

  advance(offset: number): boolean {
    if (offset === 0) return this.active;
    if (offset > 0) {
      for (let i = 0; i < offset; i++) {
        if (!this.next()) return false;
      }
    } else {
      const steps = -offset;
      for (let i = 0; i < steps; i++) {
        if (!this.prev()) return false;
      }
    }
    return true;
  }

  clone(): this {
    const cloned = new BlockArrayCursor<T>(this.array, 0);
    cloned.state = this.state;
    cloned.index = this.index;
    cloned.blockIndex = this.blockIndex;
    cloned.localIndex = this.localIndex;
    return cloned as this;
  }
}
