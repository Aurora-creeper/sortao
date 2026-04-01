// src/internal-map-iterable.ts

/**
 * A iteration base class for Map structures.
 */
export abstract class InternalMapIterable<K, V> {
  /**
   * Must return the total number of entries. Used for map() pre-allocation.
   */
  abstract get length(): number;

  /**
   * Internal traversal primitive. Must be implemented by subclasses.
   * 
   * @param callback A function to execute for each entry.
   *                 If it returns `true` (strictly), the traversal is immediately aborted.
   */
  abstract _traverse(callback: (value: V, key: K, index: number) => boolean | void): void;

  /**
   * Executes a provided function once for each key-value pair.
   * Supports early termination if the callback explicitly returns `true`.
   */
  forEach(callback: (value: V, key: K, index: number) => boolean | void): void {
    this._traverse((v, k, idx) => {
      return callback(v, k, idx);
    });
  }

  /**
   * Tests whether at least one entry passes the test.
   */
  some(predicate: (value: V, key: K, index: number) => boolean): boolean {
    let found = false;
    this._traverse((v, k, idx) => {
      if (predicate(v, k, idx)) {
        found = true;
        return true;
      }
    });
    return found;
  }

  /**
   * Tests whether all entries pass the test.
   */
  every(predicate: (value: V, key: K, index: number) => boolean): boolean {
    let all = true;
    this._traverse((v, k, idx) => {
      if (!predicate(v, k, idx)) {
        all = false;
        return true;
      }
    });
    return all;
  }

  /**
   * Returns the [Key, Value] tuple of the first entry that satisfies the testing function.
   * Allocates a tuple ONLY when the item is found.
   */
  findNode(predicate: (value: V, key: K, index: number) => boolean): [K, V] | undefined {
    let result: [K, V] | undefined = undefined;
    this._traverse((v, k, idx) => {
      if (predicate(v, k, idx)) {
        result = [k, v];
        return true;
      }
    });
    return result;
  }

  /**
   * Returns the value of the first entry that satisfies the testing function.
   */
  find(predicate: (value: V, key: K, index: number) => boolean): V | undefined {
    let result: V | undefined = undefined;
    this._traverse((v, k, idx) => {
      if (predicate(v, k, idx)) {
        result = v;
        return true;
      }
    });
    return result;
  }

  /**
   * Returns the index of the first entry that satisfies the testing function.
   */
  findIndex(predicate: (value: V, key: K, index: number) => boolean): number {
    let result = -1;
    this._traverse((v, k, idx) => {
      if (predicate(v, k, idx)) {
        result = idx;
        return true;
      }
    });
    return result;
  }

  /**
   * Executes a reducer function on each entry.
   */
  reduce<U>(callback: (accumulator: U, value: V, key: K, index: number) => U, initialValue: U): U {
    let accumulator = initialValue;
    this._traverse((v, k, idx) => {
      accumulator = callback(accumulator, v, k, idx);
    });
    return accumulator;
  }

  /**
   * Creates a new native array of [Key, Value] tuples that pass the test.
   */
  filter(predicate: (value: V, key: K, index: number) => boolean): [K, V][] {
    const result: [K, V][] = [];
    this._traverse((v, k, idx) => {
      if (predicate(v, k, idx)) {
        result.push([k, v]);
      }
    });
    return result;
  }

  /**
   * Creates a new native array populated with the results of the callback.
   */
  map<U>(callback: (value: V, key: K, index: number) => U): U[] {
    const len = this.length;
    const result: U[] = new Array(len);
    let ptr = 0;
    this._traverse((v, k, idx) => {
      result[ptr++] = callback(v, k, idx);
    });
    return result;
  }

  /**
   * Returns a new native array of [Key, Value] tuples for all entries.
   */
  toArray(): [K, V][] {
    const len = this.length;
    const result: [K, V][] = new Array(len);
    let ptr = 0;
    this._traverse((v, k) => {
      result[ptr++] = [k, v];
    });
    return result;
  }
}
