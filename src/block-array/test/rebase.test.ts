import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

describe('BlockArray.rebase()', () => {
  it('should change block size B and maintain content', () => {
    const ba = new BlockArray<number>(10);
    for (let i = 0; i < 100; i++) ba.push(i);

    expect(ba.length).toBe(100);
    // Initially should have multiple blocks
    expect((ba as any).blocks.length).toBeGreaterThan(5);

    // Rebase to B=100 (should become 1 block)
    ba.rebase(100);
    expect(ba.length).toBe(100);
    expect((ba as any).blocks.length).toBe(1);
    expect(ba.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i));
  });

  it('should defragment half-empty blocks to full blocks', () => {
    const ba = new BlockArray<number>(10);
    // Fill it
    for (let i = 0; i < 100; i++) ba.push(i);

    // Delete every other element to create gaps/half-full blocks
    for (let i = 99; i >= 0; i -= 2) {
      ba.delete(i);
    }

    expect(ba.length).toBe(50);
    // After rebase with same B, density should be 100% (5 blocks of 10)
    ba.rebase();
    expect((ba as any).blocks.length).toBe(5);
    for (const block of (ba as any).blocks) {
      expect(block.length).toBe(10);
    }
  });

  it('should handle empty array', () => {
    const ba = new BlockArray<number>(10);
    ba.rebase(20);
    expect(ba.length).toBe(0);
    expect((ba as any).B).toBe(20);
  });
});
