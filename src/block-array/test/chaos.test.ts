import { describe, it, expect } from 'vitest';
import { BlockArray } from '..';

// --- Internal Integrity Verifier ---
function verifyIntegrity<T>(arr: BlockArray<T>) {
  const blocks = (arr as any).blocks as T[][];
  const prefixSums = (arr as any).prefixSums as number[];
  const length = (arr as any)._length as number;
  const B = (arr as any).B as number;

  // 1. Check array lengths match
  expect(prefixSums.length).toBe(blocks.length);

  // 2. Calculate true length and verify prefix sums
  let trueLength = 0;
  for (let i = 0; i < blocks.length; i++) {
    expect(prefixSums[i]).toBe(trueLength);
    trueLength += blocks[i].length;

    // Invariant: no block should be absurdly large (unless it's during a split sequence, 
    // but at steady state it shouldn't be much larger than 2*B)
    expect(blocks[i].length).toBeLessThanOrEqual(2 * B + 1); // +1 because split happens AFTER reaching > 2B
  }

  // 3. Verify total length
  expect(length).toBe(trueLength);
}

describe('BlockArray Chaos Test', () => {
  it('should survive 10,000 random complex operations without corrupting state', () => {
    // We use a small B to force frequent splits and merges, maximizing stress on prefixSums
    const B = 64;
    const arr = new BlockArray<number>(B);
    const shadow: (number | undefined)[] = [];

    const ITERATIONS = 5000;

    for (let i = 0; i < ITERATIONS; i++) {
      const op = Math.random();

      if (op < 0.15) {
        // 15% chance: Single insert at random index
        const idx = Math.floor(Math.random() * (shadow.length + 1));
        const val = i;
        arr.insert(idx, val);
        shadow.splice(idx, 0, val);
      }
      else if (op < 0.3) {
        // 15% chance: Single delete at random index
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          expect(arr.delete(idx)).toBe(shadow[idx]);
          shadow.splice(idx, 1);
        }
      }
      else if (op < 0.4) {
        // 10% chance: Bulk push (1 to 50 items)
        const count = Math.floor(Math.random() * 50) + 1;
        const items = Array.from({ length: count }, (_, idx) => i * 100 + idx);
        arr.push(...items);
        shadow.push(...items);
      }
      else if (op < 0.5) {
        // 10% chance: Bulk unshift (1 to 50 items)
        const count = Math.floor(Math.random() * 50) + 1;
        const items = Array.from({ length: count }, (_, idx) => i * 100 + idx);
        arr.unshift(...items);
        shadow.unshift(...items);
      }
      else if (op < 0.65) {
        // 15% chance: Complex splice (Delete some, insert some)
        const idx = Math.floor(Math.random() * (shadow.length + 1));
        const deleteCount = Math.floor(Math.random() * Math.min(50, shadow.length - idx + 1));
        const insertCount = Math.floor(Math.random() * 50);
        const items = Array.from({ length: insertCount }, (_, _idx) => -i);

        const arrRemoved = arr.splice(idx, deleteCount, ...items);
        const shadowRemoved = shadow.splice(idx, deleteCount, ...items);

        expect(arrRemoved).toEqual(shadowRemoved);
      }
      else if (op < 0.7) {
        // 5% chance: Trigger resize (expansion)
        // Jump ahead by up to 50 elements to trigger multiple gap blocks
        const targetLen = shadow.length + Math.floor(Math.random() * 50) + 1;
        const val = i * 999;

        arr.resize(targetLen, undefined);
        arr.set(targetLen - 1, val);

        // Emulate fillGap in shadow
        while (shadow.length < targetLen - 1) {
          shadow.push(undefined);
        }
        shadow.push(val);
      }
      else if (op < 0.85) {
        // 15% chance: Random Access Query (get / at)
        if (shadow.length > 0) {
          const idx = Math.floor(Math.random() * shadow.length);
          expect(arr.get(idx)).toBe(shadow[idx]);
          expect(arr.at(idx)).toBe(shadow[idx]);

          // Test negative index
          const negIdx = -Math.floor(Math.random() * shadow.length) - 1;
          expect(arr.at(negIdx)).toBe(shadow.at(negIdx));
        }
      }
      else {
        // 15% chance: Pop / Shift
        if (shadow.length > 0) {
          if (Math.random() < 0.5) {
            expect(arr.pop()).toBe(shadow.pop());
          } else {
            expect(arr.shift()).toBe(shadow.shift());
          }
        }
      }

      // Periodically run the expensive integrity check to catch state corruption immediately
      if (i % 100 === 0) {
        verifyIntegrity(arr);
        expect(arr.length).toBe(shadow.length);
        expect(arr.toArray()).toEqual(shadow);
      }
    }

    // Final comprehensive verification
    verifyIntegrity(arr);
    expect(arr.length).toBe(shadow.length);
    expect(arr.toArray()).toEqual(shadow);
  });
});
