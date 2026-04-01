// src/block-array/block-array.ts

import { BlockArrayBase } from './block-array-base';
import { BlockArrayCursor } from './block-array-cursor';
import type { RandomAccessCursor, MutableCursor } from '../cursor';

/**
 * A high-performance Block Array implementation.
 * Offering fast insertions/deletions at arbitrary positions, 
 * while maintaining relatively fast random access.
 * 
 * Space Complexity: O(N).
 */
export class BlockArray<T> extends BlockArrayBase<T> {
  constructor(blockSize: number = 512) {
    super(blockSize);
  }

  /**
   * Returns a cursor pointing to the specified index (default 0).
   * Cursors provide O(1) continuous iteration and modification performance.
   * Time Complexity: O(1) for index 0, O(log(N/B)) for arbitrary indices.  
   */
  cursor(index: number = 0): RandomAccessCursor<T> & MutableCursor<T> {
    return new BlockArrayCursor<T>(this, index);
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) {
      return undefined;
    }
    const [bi, li] = this._findBlockByIndex(index);
    return this.blocks[bi][li];
  }

  at(index: number): T | undefined {
    if (index < 0) {
      index += this._length;
    }
    return this.get(index);
  }

  set(index: number, value: T): void {
    if (index < 0) {
      index += this._length;
    }
    if (index < 0 || index >= this._length) {
      throw new RangeError('Index out of bounds');
    }
    const [bi, li] = this._findBlockByIndex(index);
    this.blocks[bi][li] = value;
  }

  resize(newSize: number, fillValue?: T): void {
    if (newSize < 0) throw new RangeError('Invalid size');
    if (newSize === this._length) return;

    if (newSize < this._length) {
      if (newSize === 0) {
        this.clear();
        return;
      }

      const [bi, li] = this._findBlockByIndex(newSize - 1);
      this.blocks[bi].length = li + 1;
      this.blocks.length = bi + 1;
      this.prefixSums.length = bi + 1;
      this._length = newSize;
    } else {
      let count = newSize - this._length;
      let lastBlock = this.blocks[this.blocks.length - 1];

      // 1. Fill the current last block until it reaches size B
      while (count > 0 && lastBlock.length < this.B) {
        lastBlock.push(fillValue as any);
        this._length++;
        count--;
      }

      // 2. Add full blocks of size B
      while (count >= this.B) {
        this.prefixSums.push(this._length);
        this.blocks.push(new Array(this.B).fill(fillValue));
        this._length += this.B;
        count -= this.B;
      }

      // 3. Create a new block for the remainder
      if (count > 0) {
        this.prefixSums.push(this._length);
        this.blocks.push(new Array(count).fill(fillValue));
        this._length += count;
      }
    }
  }

  /**
   * Inserts an element at the specified index.
   * Time Complexity: O(B + N/B)
   */
  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError('Index out of bounds');
    }
    const [bi, li] = this._findBlockByIndex(index);
    this._insertAt(bi, li, value);
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._length) {
      return undefined;
    }
    const [bi, li] = this._findBlockByIndex(index);
    return this._deleteAt(bi, li);
  }

  deleteCursor(cursor: BlockArrayCursor<T>): T | undefined {
    if (!cursor.active) return undefined;
    return this._deleteAt(cursor.blockIndex, cursor.localIndex);
  }

  /**
   * Appends one or more elements to the end of the array.
   * Time Complexity: O(1) for a single value.
   */
  push(...values: T[]): void {
    if (values.length > 0) {
      this.pushAll(values);
    }
  }

  /**
   * Appends an array of elements to the end.
   * Time Complexity: O(1) for a single value.
   */
  pushAll(values: T[]): void {
    if (values.length === 0) return;

    const lastBlock = this.blocks[this.blocks.length - 1];
    let i = 0;

    // 1. Fill the last block up to B
    if (lastBlock.length < this.B) {
      const addCount = Math.min(this.B - lastBlock.length, values.length);
      for (; i < addCount; i++) {
        lastBlock.push(values[i]);
      }
      this._length += addCount;
    }

    // 2. Append remaining elements as new blocks
    for (; i < values.length; i += this.B) {
      const chunk = values.slice(i, i + this.B);
      this.prefixSums.push(this._length);
      this.blocks.push(chunk);
      this._length += chunk.length;
    }
  }

  /**
   * Removes and returns the last element of the array.
   * Time Complexity: O(1)
   */
  pop(): T | undefined {
    if (this._length === 0) return undefined;
    const lastBi = this.blocks.length - 1;
    const lastBlock = this.blocks[lastBi];
    const val = lastBlock.pop();
    this._length--;

    if (lastBlock.length === 0 && this.blocks.length > 1) {
      this.blocks.pop();
      this.prefixSums.pop();
    } else {
      this._tryMerge(lastBi);
    }
    return val;
  }

  /**
   * Inserts one or more elements to the beginning of the array.
   */
  unshift(...values: T[]): void {
    this.isUniform = false;
    if (values.length === 1) {
      const firstBlock = this.blocks[0];
      if (firstBlock.length < 2 * this.B) {
        firstBlock.unshift(values[0]);
        this._length++;
        for (let i = 1; i < this.prefixSums.length; i++) {
          this.prefixSums[i]++;
        }
        return;
      }
      this.insert(0, values[0]);
    } else if (values.length > 1) {
      this.spliceAll(0, 0, values);
    }
  }

  /**
   * Removes and returns the first element of the array.
   */
  shift(): T | undefined {
    if (this._length === 0) return undefined;
    this.isUniform = false;
    const firstBlock = this.blocks[0];
    const val = firstBlock.shift();
    this._length--;

    for (let i = 1; i < this.prefixSums.length; i++) {
      this.prefixSums[i]--;
    }

    if (firstBlock.length === 0 && this.blocks.length > 1) {
      this.blocks.shift();
      this.prefixSums.shift();
    } else {
      this._tryMerge(0);
    }
    return val;
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    return this.spliceAll(start, deleteCount, items);
  }

  spliceAll(start: number, deleteCount: number | undefined, items: T[]): T[] {
    this.isUniform = false;
    let actualStart = start < 0 ? Math.max(this._length + start, 0) : Math.min(start, this._length);
    let actualDeleteCount: number;

    if (deleteCount === undefined) {
      actualDeleteCount = this._length - actualStart;
    } else {
      actualDeleteCount = Math.max(Math.min(deleteCount, this._length - actualStart), 0);
    }

    // 1. Locate start and end boundaries
    const [bi_start, li_start] = this._findBlockByIndex(actualStart);
    const [bi_end, li_end] = this._findBlockByIndex(actualStart + actualDeleteCount);

    // 2. Collect removed elements across the range
    const removed: T[] = [];
    for (let i = bi_start; i <= bi_end; i++) {
      const block = this.blocks[i];
      const s = (i === bi_start) ? li_start : 0;
      const e = (i === bi_end) ? li_end : block.length;
      if (s < e) {
        removed.push(...block.slice(s, e));
      }
    }

    // 3. Avoid giant intermediate array
    const head = this.blocks[bi_start].slice(0, li_start);
    const tail = this.blocks[bi_end].slice(li_end);

    const newBlocks: T[][] = [];

    if (items.length === 0) {
      const combinedEdge = head.concat(tail);
      if (combinedEdge.length > 0) {
        for (let i = 0; i < combinedEdge.length; i += this.B) {
          newBlocks.push(combinedEdge.slice(i, i + this.B));
        }
      }
    } else {
      if (items.length < this.B * 2) {
        // Small insertion: simple concat is efficient enough
        const combined = head.concat(items, tail);
        for (let i = 0; i < combined.length; i += this.B) {
          newBlocks.push(combined.slice(i, i + this.B));
        }
      } else {
        // Large insertion: Zero-Flattening chunking
        const firstChunkLen = Math.max(0, this.B - head.length);
        newBlocks.push(head.concat(items.slice(0, firstChunkLen)));

        const middleEnd = items.length - this.B;
        let i = firstChunkLen;
        for (; i < middleEnd; i += this.B) {
          newBlocks.push(items.slice(i, i + this.B));
        }

        newBlocks.push(items.slice(i).concat(tail));
      }
    }

    // 5. Structural Replacement
    const blocksToRemove = bi_end - bi_start + 1;
    this.blocks.splice(bi_start, blocksToRemove, ...newBlocks);

    // Ensure we don't leave the structure completely block-less
    if (this.blocks.length === 0) {
      this.blocks.push([]);
    }

    // 6. State Recovery
    this._length += items.length - actualDeleteCount;
    this.rebuildPrefixSums();

    this._tryMerge(bi_start + newBlocks.length - 1);
    this._tryMerge(bi_start);

    return removed;
  }

  /**
   * Returns a section of an array as a new BlockArray.
   */
  slice(start?: number, end?: number): BlockArray<T> {
    const s = start === undefined ? 0 : start < 0 ? Math.max(this._length + start, 0) : Math.min(start, this._length);
    const e = end === undefined ? this._length : end < 0 ? Math.max(this._length + end, 0) : Math.min(end, this._length);

    const res = new BlockArray<T>(this.B);
    if (s >= e) return res;

    const [bi_start, li_start] = this._findBlockByIndex(s);
    const [bi_end, li_end] = this._findBlockByIndex(e);

    const newBlocks: T[][] = [];

    if (bi_start === bi_end) {
      newBlocks.push(this.blocks[bi_start].slice(li_start, li_end));
    } else {
      // 1. Head: part of the first block
      newBlocks.push(this.blocks[bi_start].slice(li_start));

      // 2. Middle: full blocks (with shallow copy)
      for (let i = bi_start + 1; i < bi_end; i++) {
        newBlocks.push([...this.blocks[i]]);
      }

      // 3. Tail: part of the last block
      if (li_end > 0) {
        newBlocks.push(this.blocks[bi_end].slice(0, li_end));
      }
    }

    res.blocks = newBlocks;
    res._length = e - s;
    res.rebuildPrefixSums();
    res.isUniform = (s % this.B === 0); // Only uniform if slice starts at a block boundary

    res._tryMerge(0);
    res._tryMerge(res.blocks.length - 1);

    return res;
  }

  /**
   * Combines two or more arrays.
   */
  concat(...items: (T | T[] | BlockArray<T>)[]): BlockArray<T> {
    const res = this.slice(); // Starts with a shallow copy of current instance

    for (const item of items) {
      const lastBiBeforeAdd = res.blocks.length - 1;

      if (item instanceof BlockArray) {
        for (const block of item.blocks) {
          if (block.length > 0) {
            res.blocks.push([...block]);
            res._length += block.length;
          }
        }
      } else if (Array.isArray(item)) {
        if (item.length > 0) {
          for (let i = 0; i < item.length; i += this.B) {
            const chunk = item.slice(i, i + this.B);
            res.blocks.push(chunk);
            res._length += chunk.length;
          }
        }
      } else { // Single item
        const lastBlock = res.blocks[res.blocks.length - 1];
        if (lastBlock.length < this.B * 2) {
          lastBlock.push(item);
        } else {
          res.blocks.push([item]);
        }
        res._length++;
      }

      res._tryMerge(lastBiBeforeAdd);
    }

    res.isUniform = false;
    res.rebuildPrefixSums();
    return res;
  }

  /**
   * Re-organizes the internal block structure.
   * Can be used to change the block size (B) dynamically or to defragment.
   * Sets `isUniform` to true.
   * Time Complexity: O(N)
   */
  rebase(newBlockSize?: number): void {
    if (newBlockSize !== undefined && newBlockSize > 0) {
      this.B = newBlockSize;
    }

    if (this._length === 0) {
      this.clear();
      return;
    }

    const allItems = this.toArray();
    const newBlocks: T[][] = [];
    for (let i = 0; i < allItems.length; i += this.B) {
      newBlocks.push(allItems.slice(i, i + this.B));
    }

    this.blocks = newBlocks;
    this.rebuildPrefixSums();
    this.isUniform = true;
  }

  reverse(): this {
    if (this._length <= 1) return this;

    this.blocks.reverse();
    for (const block of this.blocks) {
      block.reverse();
    }

    this.rebuildPrefixSums();
    this.isUniform = false;
    return this;
  }
}
