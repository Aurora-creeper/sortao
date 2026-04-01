// src/sorted-block-array/sorted-block-array-cursor.ts

import type { SortedBlockArray } from './sorted-block-array';
import type { RandomAccessCursor, CursorState } from '../cursor';

export class SortedBlockArrayCursor<T> implements RandomAccessCursor<T> {
  public blockIndex: number = 0;
  public localIndex: number = 0;

  public state: CursorState = 0;
  public index: number = 0;

  private readonly list: SortedBlockArray<T>;

  constructor(list: SortedBlockArray<T>, bi: number = 0, li: number = 0) {
    this.list = list;
    this.blockIndex = bi;
    this.localIndex = li;
    
    if (bi < 0) {
      this.state = 2;
      this.index = -1;
    } else if (bi >= list.blocks.length || (bi === list.blocks.length - 1 && li >= list.blocks[bi].length)) {
      this.state = 1;
      this.index = list.length;
    } else {
      this.state = 0;
      this.index = list.prefixSums[bi] + li;
    }
  }

  get active(): boolean {
    return this.state === 0;
  }

  get value(): T | undefined {
    if (this.state !== 0) return undefined;
    const block = this.list.blocks[this.blockIndex];
    return block ? block[this.localIndex] : undefined;
  }

  // refresh(): boolean {
  //   if (this.state === 1) { this.index = this.list.length; return false; }
  //   if (this.state === 2) { this.index = -1; return false; }

  //   const block = this.list.blocks[this.blockIndex];
  //   if (!block || this.localIndex >= block.length) {
  //     this.state = 1;
  //     this.index = this.list.length;
  //     return false;
  //   }

  //   this.index = this.list.prefixSums[this.blockIndex] + this.localIndex;
  //   return true;
  // }

  next(): boolean {
    if (this.state === 1) return false;
    if (this.state === 2) {
      if (this.list.length === 0) {
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

    const block = this.list.blocks[this.blockIndex];
    if (!block) {
      this.state = 1;
      this.index = this.list.length;
      return false;
    }

    this.localIndex++;
    this.index++;
    if (this.localIndex >= block.length) {
      this.blockIndex++;
      this.localIndex = 0;
      if (this.blockIndex >= this.list.blocks.length) {
        this.state = 1;
        return false;
      }
    }
    return true;
  }

  prev(): boolean {
    if (this.state === 2) return false;
    if (this.state === 1) {
      if (this.list.length === 0) {
        this.state = 2;
        this.index = -1;
        return false;
      }
      this.state = 0;
      this.index = this.list.length - 1;
      this.blockIndex = this.list.blocks.length - 1;
      this.localIndex = this.list.blocks[this.blockIndex].length - 1;
      return true;
    }

    const block = this.list.blocks[this.blockIndex];
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
        this.localIndex = this.list.blocks[this.blockIndex].length - 1;
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
    if (targetIndex >= this.list.length) {
      this.state = 1;
      this.index = this.list.length;
      this.blockIndex = this.list.blocks.length;
      this.localIndex = 0;
      return false;
    }

    this.state = 0;
    this.index = targetIndex;
    // @ts-expect-error protected method access
    const [bi, li] = this.list._findBlockByIndex(targetIndex);
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
    const cloned = new SortedBlockArrayCursor<T>(this.list, 0, 0);
    cloned.state = this.state;
    cloned.index = this.index;
    cloned.blockIndex = this.blockIndex;
    cloned.localIndex = this.localIndex;
    return cloned as this;
  }
}
