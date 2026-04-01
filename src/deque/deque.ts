// src/deque/deque.ts

import { InternalIterable } from '../internal-iterable';
import { nextPowerOfTwo } from '../math';

/**
 * A high-performance Double-Ended Queue (Deque) implemented with a circular buffer.
 * Uses power-of-two capacity to optimize circular indexing with bitwise masks.
 */
export class Deque<T> extends InternalIterable<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private mask: number;
  private _length: number = 0;

  constructor(initialCapacity: number = 16) {
    super();
    const capacity = nextPowerOfTwo(initialCapacity);
    this.buffer = new Array(capacity);
    this.mask = capacity - 1;
  }

  get length(): number { return this._length; }
  get capacity(): number { return this.buffer.length; }
  isEmpty(): boolean { return this._length === 0; }

  _traverse(callback: (val: T, index: number) => boolean | void) {
    for (let i = 0; i < this._length; i++) {
      const val = this.buffer[(this.head + i) & this.mask];
      if (callback(val as T, i) === true) return;
    }
  }

  /**
   * Clears the deque. 
   * O(N).
   */
  clear(): void {
    if (this._length > 0) {
      for (let i = 0; i < this._length; i++) {
        this.buffer[(this.head + i) & this.mask] = undefined;
      }
      this.head = 0;
      this.tail = 0;
      this._length = 0;
    }
  }

  /**
   * Adds an item to the end of the deque. 
   * O(1) amortized.
   */
  pushBack(value: T): void {
    if (this._length === this.buffer.length) {
      this._reallocate(this.buffer.length << 1);
    }
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) & this.mask;
    this._length++;
  }

  /**
   * Adds an item to the front of the deque. 
   * O(1) amortized.
   */
  pushFront(value: T): void {
    if (this._length === this.buffer.length) {
      this._reallocate(this.buffer.length << 1);
    }
    this.head = (this.head - 1) & this.mask;
    this.buffer[this.head] = value;
    this._length++;
  }

  /**
   * Removes and returns the item from the front of the deque.
   * O(1)
   */
  popFront(): T | undefined {
    if (this._length === 0) return undefined;
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) & this.mask;
    this._length--;
    return value;
  }

  /**
   * Removes and returns the item from the end of the deque.
   * O(1)
   */
  popBack(): T | undefined {
    if (this._length === 0) return undefined;
    this.tail = (this.tail - 1) & this.mask;
    const value = this.buffer[this.tail];
    this.buffer[this.tail] = undefined;
    this._length--;
    return value;
  }

  /**
   * Returns the item at the front without removing it.
   */
  peekFront(): T | undefined {
    return this._length === 0 ? undefined : this.buffer[this.head];
  }

  /**
   * Returns the item at the end without removing it.
   */
  peekBack(): T | undefined {
    return this._length === 0 ? undefined : this.buffer[(this.tail - 1) & this.mask];
  }

  /**
   * Gets the element at the given index (0-based from front).
   * O(1)
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    return this.buffer[(this.head + index) & this.mask];
  }

  /**
   * Sets the element at the given index.
   * O(1)
   */
  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError('Index out of bounds');
    }
    this.buffer[(this.head + index) & this.mask] = value;
  }

  /**
   * Inserts an element at the given index.
   * O(N) but optimized to shift the minimum number of elements.
   */
  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError('Index out of bounds');
    }

    if (index === 0) {
      this.pushFront(value);
      return;
    }
    if (index === this._length) {
      this.pushBack(value);
      return;
    }

    if (this._length === this.buffer.length) {
      this._reallocate(this.buffer.length << 1);
    }

    const mid = this._length >> 1;
    if (index < mid) {
      // Shift elements before index to the left
      this.head = (this.head - 1) & this.mask;
      for (let i = 0; i < index; i++) {
        this.buffer[(this.head + i) & this.mask] = this.buffer[(this.head + i + 1) & this.mask];
      }
    } else {
      // Shift elements after index to the right
      for (let i = this._length; i > index; i--) {
        this.buffer[(this.head + i) & this.mask] = this.buffer[(this.head + i - 1) & this.mask];
      }
      this.tail = (this.tail + 1) & this.mask;
    }

    this.buffer[(this.head + index) & this.mask] = value;
    this._length++;
  }

  /**
   * Removes and returns the element at the given index.
   * O(N) but optimized to shift the minimum number of elements.
   */
  remove(index: number): T | undefined {
    if (index < 0 || index >= this._length) {
      return undefined;
    }

    if (index === 0) return this.popFront();
    if (index === this._length - 1) return this.popBack();

    const value = this.buffer[(this.head + index) & this.mask];
    const mid = this._length >> 1;

    if (index < mid) {
      // Shift elements before index to the right
      for (let i = index; i > 0; i--) {
        this.buffer[(this.head + i) & this.mask] = this.buffer[(this.head + i - 1) & this.mask];
      }
      this.buffer[this.head] = undefined;
      this.head = (this.head + 1) & this.mask;
    } else {
      // Shift elements after index to the left
      for (let i = index; i < this._length - 1; i++) {
        this.buffer[(this.head + i) & this.mask] = this.buffer[(this.head + i + 1) & this.mask];
      }
      this.tail = (this.tail - 1) & this.mask;
      this.buffer[this.tail] = undefined;
    }

    this._length--;
    return value;
  }

  private _reallocate(newCapacity: number): void {
    const newBuffer = new Array(newCapacity);

    // Realign elements to the start of the new buffer
    for (let i = 0; i < this._length; i++) {
      newBuffer[i] = this.buffer[(this.head + i) & this.mask];
    }

    this.buffer = newBuffer;
    this.head = 0;
    this.tail = this._length;
    this.mask = newCapacity - 1;
  }

  /**
   * Physically reallocates the buffer to ensure it has at least `minCapacity`.
   * The new capacity will be rounded up to the nearest power of two.
   */
  reserve(minCapacity: number): void {
    const targetCapacity = nextPowerOfTwo(minCapacity);
    if (targetCapacity > this.buffer.length) {
      this._reallocate(targetCapacity);
    }
  }

  /**
   * Physically shrinks the internal buffer to exactly fit the current logical length
   * (rounded up to the nearest power of two, with a minimum of 16).
   */
  shrinkToFit(): void {
    const targetCapacity = nextPowerOfTwo(Math.max(this._length, 16));
    if (targetCapacity < this.buffer.length) {
      this._reallocate(targetCapacity);
    }
  }

  /**
   * Resizes the logical length of the deque.
   * If shrinking, excess elements are removed from the back and GC'd.
   * If expanding, new positions are filled with `fillValue` (defaults to undefined).
   */
  resize(newSize: number, fillValue?: T): void {
    if (newSize < 0) throw new RangeError('Invalid size');
    if (newSize === this._length) return;

    if (newSize < this._length) {
      // Shrink: clear references for GC
      for (let i = newSize; i < this._length; i++) {
        this.buffer[(this.head + i) & this.mask] = undefined;
      }
      this._length = newSize;
      this.tail = (this.head + newSize) & this.mask;
    } else {
      // Expand
      this.reserve(newSize); // Ensure physical capacity is sufficient upfront

      while (this._length < newSize) {
        this.buffer[this.tail] = fillValue as T;
        this.tail = (this.tail + 1) & this.mask;
        this._length++;
      }
    }
  }

  toArray(): T[] {
    const arr = new Array(this._length);
    for (let i = 0; i < this._length; i++) {
      arr[i] = this.buffer[(this.head + i) & this.mask];
    }
    return arr;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (let i = 0; i < this._length; i++) {
      yield this.buffer[(this.head + i) & this.mask] as T;
    }
  }
}
