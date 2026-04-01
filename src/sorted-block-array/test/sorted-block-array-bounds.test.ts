import { describe, it, expect } from 'vitest';
import { SortedBlockArray } from '../sorted-block-array';

describe('SortedBlockArray Bounds & Duplicates (N^2 Strict Tests)', () => {
  it('should flawlessly find lowerBound and upperBound for arrays filled entirely with the same value', () => {
    const MAX_N = 100;
    const B = 4; // Use a very small B to force multiple block splits (up to ~25 blocks)

    // Test for arrays of length 1 up to 100
    for (let N = 1; N <= MAX_N; N++) {
      const sba = new SortedBlockArray<number>((a, b) => a - b, B);

      // Fill with exactly N copies of the number 42
      for (let i = 0; i < N; i++) {
        sba.insert(42);
      }

      // Assertions
      expect(sba.length).toBe(N);

      // lowerBound of exact match must be the absolute FIRST element
      expect(sba.lowerBound(42)).toBe(0);

      // upperBound of exact match must be just PAST the absolute LAST element
      expect(sba.upperBound(42)).toBe(N);

      // Value smaller than everything
      expect(sba.lowerBound(10)).toBe(0);
      expect(sba.upperBound(10)).toBe(0);

      // Value larger than everything
      expect(sba.lowerBound(99)).toBe(N);
      expect(sba.upperBound(99)).toBe(N);
    }
  });

  it('should flawlessly find bounds when two duplicate groups meet at different split points', () => {
    const MAX_N = 100;
    const B = 4;

    // We test arrays of length N = 2 to 100
    for (let N = 2; N <= MAX_N; N++) {
      // We test every possible split point K between the 0s and 1s
      for (let K = 1; K < N; K++) {
        const sba = new SortedBlockArray<number>((a, b) => a - b, B);

        const items = [];
        for (let i = 0; i < K; i++) items.push(0);
        for (let i = 0; i < N - K; i++) items.push(1);

        sba.insertMany(items);

        // Verification
        // The first 1 should be exactly at index K
        expect(sba.lowerBound(1), `Failed lowerBound(1) at N=${N}, K=${K}`).toBe(K);

        // The element immediately after the last 0 should be exactly at index K
        expect(sba.upperBound(0), `Failed upperBound(0) at N=${N}, K=${K}`).toBe(K);

        // Edge bounds
        expect(sba.lowerBound(0)).toBe(0);
        expect(sba.upperBound(1)).toBe(N);

        // rank tests
        expect(sba.rank(0)).toBe(0);
        expect(sba.rank(1)).toBe(K);
        expect(sba.rank(2)).toBe(N);
      }
    }
  });

  it('should handle complex interleaving of duplicate values', () => {
    const sba = new SortedBlockArray<number>((a, b) => a - b, 4);

    // 5 copies of 10, 5 copies of 20, 5 copies of 30
    sba.insertMany([
      10, 10, 10, 10, 10,
      20, 20, 20, 20, 20,
      30, 30, 30, 30, 30
    ]);

    expect(sba.lowerBound(20)).toBe(5);
    expect(sba.upperBound(20)).toBe(10);

    expect(sba.lowerBound(15)).toBe(5);
    expect(sba.upperBound(15)).toBe(5);

    expect(sba.lowerBound(25)).toBe(10);
    expect(sba.upperBound(25)).toBe(10);

    expect(sba.lowerBound(10)).toBe(0);
    expect(sba.upperBound(10)).toBe(5);

    expect(sba.lowerBound(30)).toBe(10);
    expect(sba.upperBound(30)).toBe(15);
  });
});
