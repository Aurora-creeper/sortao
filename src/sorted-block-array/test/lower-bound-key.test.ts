import { describe, it, expect } from 'vitest';
import { SortedBlockArray } from '../sorted-block-array';

interface Entry { k: number; v: string; }

describe('SortedBlockArray.lower_bound_key', () => {
  it('should find elements by key without creating dummy objects', () => {
    const sba = new SortedBlockArray<Entry>((a, b) => a.k - b.k, 4);
    sba.insertMany([
      { k: 10, v: 'a' },
      { k: 20, v: 'b' },
      { k: 30, v: 'c' },
      { k: 40, v: 'd' },
    ]);

    // Exact match
    const cur1 = sba.lower_bound_key(20, (item, k) => item.k - k);
    expect(cur1.active).toBe(true);
    expect(cur1.value?.v).toBe('b');
    expect(cur1.index).toBe(1);

    // In-between match
    const cur2 = sba.lower_bound_key(25, (item, k) => item.k - k);
    expect(cur2.active).toBe(true);
    expect(cur2.value?.v).toBe('c');
    expect(cur2.index).toBe(2);

    // Past the end
    const cur3 = sba.lower_bound_key(50, (item, k) => item.k - k);
    expect(cur3.active).toBe(false);
    expect(cur3.index).toBe(4);
  });

  it('should support upper_bound_key', () => {
    const sba = new SortedBlockArray<Entry>((a, b) => a.k - b.k, 4);
    sba.insertMany([
      { k: 10, v: 'a' },
      { k: 20, v: 'b1' },
      { k: 20, v: 'b2' },
      { k: 30, v: 'c' },
    ]);

    const cur = sba.upper_bound_key(20, (item, k) => item.k - k);
    expect(cur.value?.v).toBe('c');
    expect(cur.index).toBe(3);
  });
});
