import { describe, it, expect } from 'vitest';
import { SortedBlockList } from '../sorted-block-list';

describe('SortedBlockListCursor', () => {
  it('should traverse forward correctly', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([10, 20, 30, 40, 50]);

    const cur = sbl.cursor(0);
    const results: number[] = [];
    while (cur.active) {
      results.push(cur.value!);
      cur.next();
    }
    expect(results).toEqual([10, 20, 30, 40, 50]);
  });

  it('should traverse backward correctly', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([10, 20, 30, 40, 50]);

    const cur = sbl.cursor(4); // index of 50
    const results: number[] = [];
    while (cur.active) {
      results.push(cur.value!);
      cur.prev();
    }
    expect(results).toEqual([50, 40, 30, 20, 10]);
  });

  it('should support seek and advance', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    for (let i = 0; i < 10; i++) sbl.insert(i * 10);

    const cur = sbl.cursor(5); // value 50
    expect(cur.value).toBe(50);
    expect(cur.index).toBe(5);

    cur.advance(3); // index 8
    expect(cur.value).toBe(80);

    cur.advance(-6); // index 2
    expect(cur.value).toBe(20);

    // Seek directly
    cur.seek(9);
    expect(cur.value).toBe(90);
  });

  it('should handle invalid state safely', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([1, 2, 3]);

    const cur = sbl.cursor(100);
    expect(cur.active).toBe(false);
    expect(cur.value).toBeUndefined();
    expect(cur.index).toBe(3); // clamped to length

    // next from end remains false
    expect(cur.next()).toBe(false);
    expect(cur.index).toBe(3);

    // prev from end recovers
    expect(cur.prev()).toBe(true);
    expect(cur.index).toBe(2);
    expect(cur.value).toBe(3);

    // prev out of lower bound
    cur.seek(0);
    expect(cur.prev()).toBe(false);
    expect(cur.active).toBe(false);
    expect(cur.index).toBe(-1); // clamped to -1
  });

  it('should support clone', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([1, 2, 3, 4, 5]);

    const c1 = sbl.cursor(2);
    const c2 = c1.clone();

    c1.next(); // c1 is at index 3 (value 4)

    expect(c1.value).toBe(4);
    expect(c2.value).toBe(3); // cloned cursor is unaffected
  });

  it('should integrate with upper_bound and lower_bound', () => {
    const sbl = new SortedBlockList<number>((a, b) => a - b, 4);
    sbl.insertMany([10, 20, 20, 20, 30]);

    const lCur = sbl.lower_bound(20);
    expect(lCur.index).toBe(1);
    expect(lCur.value).toBe(20);

    const uCur = sbl.upper_bound(20);
    expect(uCur.index).toBe(4);
    expect(uCur.value).toBe(30);

    // They should be independent cursors that can be advanced
    lCur.next();
    expect(lCur.index).toBe(2);
    expect(uCur.index).toBe(4); // upper cursor is still 4
  });
});
