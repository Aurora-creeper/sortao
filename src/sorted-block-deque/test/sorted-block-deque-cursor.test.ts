import { describe, it, expect, expectTypeOf } from 'vitest';
import { SortedBlockDeque } from '../sorted-block-deque';

describe('SortedBlockDequeCursor', () => {
  it('should restrict direct mutation via setter (typing constraint)', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([10, 20, 30]);

    const cur = sbd.cursor(1);
    expect(cur.value).toBe(20);

    expectTypeOf(cur).not.toHaveProperty('set');
  });

  it('should traverse forward correctly', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([10, 30, 20, 40, 50]);

    const cur = sbd.cursor(0);
    const results: number[] = [];
    while (cur.active) {
      results.push(cur.value!);
      cur.next();
    }
    // Should be sorted
    expect(results).toEqual([10, 20, 30, 40, 50]);
  });

  it('should traverse backward correctly', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([10, 30, 20, 40, 50]);

    const cur = sbd.cursor(sbd.length - 1);
    const results: number[] = [];
    while (cur.active) {
      results.push(cur.value!);
      cur.prev();
    }
    expect(results).toEqual([50, 40, 30, 20, 10]);
  });

  it('should support seek and advance', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const cur = sbd.cursor(4);
    expect(cur.value).toBe(5);

    cur.advance(3);
    expect(cur.value).toBe(8);

    cur.advance(-6);
    expect(cur.value).toBe(2);

    cur.seek(8);
    expect(cur.value).toBe(9);
  });

  it('should clone safely', () => {
    const sbd = new SortedBlockDeque<number>((a, b) => a - b, 4);
    sbd.insertMany([1, 2, 3, 4, 5]);

    const c1 = sbd.cursor(2);
    const c2 = c1.clone();

    c1.next();

    expect(c1.value).toBe(4);
    expect(c2.value).toBe(3);
  });
});
