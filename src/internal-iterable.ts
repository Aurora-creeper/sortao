// src/internal-iterable.ts

/**
 * A iteration base class for data structures.
 */
export abstract class InternalIterable<T> {
  /**
   * Must return the total number of elements. Used for map() pre-allocation.
   */
  abstract get length(): number;

  /**
   * Internal traversal primitive. Must be implemented by subclasses.
   * 
   * @param callback A function to execute for each element.
   *                 If it returns `true` (strictly), the traversal is immediately aborted.
   */
  abstract _traverse(callback: (val: T, index: number) => boolean | void): void;

  /**
   * Executes a provided function once for each element.
   * Supports early termination if the callback explicitly returns `true`.
   */
  forEach(callback: (val: T, index: number) => boolean | void): void {
    this._traverse((val, idx) => {
      return callback(val, idx);
    });
  }

  /**
   * Tests whether at least one element in the collection passes the test.
   */
  some(predicate: (val: T, index: number) => boolean): boolean {
    let found = false;
    this._traverse((val, idx) => {
      if (predicate(val, idx)) {
        found = true;
        return true;
      }
    });
    return found;
  }

  /**
   * Tests whether all elements in the collection pass the test.
   */
  every(predicate: (val: T, index: number) => boolean): boolean {
    let all = true;
    this._traverse((val, idx) => {
      if (!predicate(val, idx)) {
        all = false;
        return true;
      }
    });
    return all;
  }

  /**
   * Returns the value of the first element that satisfies the provided testing function.
   */
  find(predicate: (val: T, index: number) => boolean): T | undefined {
    let result: T | undefined = undefined;
    this._traverse((val, idx) => {
      if (predicate(val, idx)) {
        result = val;
        return true;
      }
    });
    return result;
  }

  /**
   * Returns the index of the first element that satisfies the provided testing function.
   */
  findIndex(predicate: (val: T, index: number) => boolean): number {
    let result = -1;
    this._traverse((val, idx) => {
      if (predicate(val, idx)) {
        result = idx;
        return true;
      }
    });
    return result;
  }

  /**
   * Returns the first index at which a given element can be found, or -1 if not present.
   */
  indexOf(value: T): number {
    let result = -1;
    this._traverse((val, idx) => {
      if (val === value) {
        result = idx;
        return true;
      }
    });
    return result;
  }

  /**
   * Determines whether the collection includes a certain value.
   */
  includes(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  /**
   * Executes a reducer function on each element, resulting in a single output value.
   */
  reduce<U>(callback: (accumulator: U, currentValue: T, index: number) => U, initialValue: U): U {
    let accumulator = initialValue;
    this._traverse((val, idx) => {
      accumulator = callback(accumulator, val, idx);
    });
    return accumulator;
  }

  /**
   * Creates a new native array with all elements that pass the test.
   */
  filter(predicate: (val: T, index: number) => boolean): T[] {
    const result: T[] = [];
    this._traverse((val, idx) => {
      if (predicate(val, idx)) {
        result.push(val);
      }
    });
    return result;
  }

  /**
   * Creates a new native array populated with the results of calling a 
   * provided function on every element.
   */
  map<U>(callback: (val: T, index: number) => U): U[] {
    const len = this.length;
    const result: U[] = new Array(len);
    let ptr = 0;
    this._traverse((val, idx) => {
      result[ptr++] = callback(val, idx);
    });
    return result;
  }

  /**
   * Returns a new native array containing all elements in this collection.
   */
  toArray(): T[] {
    const len = this.length;
    const result: T[] = new Array(len);
    let ptr = 0;
    this._traverse((val) => {
      result[ptr++] = val;
    });
    return result;
  }
}
