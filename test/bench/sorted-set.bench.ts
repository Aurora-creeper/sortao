import { bench, describe } from 'vitest';
import {
  SortedSet,
  SortedBlockArray,
  SortedBlockList,
  SortedBlockDeque,
  SplayTree,
} from '../../src';

describe('SortedSet Comprehensive Bench (N=500,000)', () => {
  const SIZE = 500_000;
  const B = 1024;
  const SAMPLE_SIZE = 2 ** 10;
  const mask = SAMPLE_SIZE - 1;

  // Pre-generate random samples to minimize overhead in the hot loop
  const randomIndices = Array.from({ length: SAMPLE_SIZE }, () => Math.floor(Math.random() * SIZE));
  const randomValues = Array.from({ length: SAMPLE_SIZE }, () => Math.floor(Math.random() * SIZE * 10));

  const setup = (factory: (comp: any) => any) => {
    const set = new SortedSet<number>(undefined, factory);
    for (let i = 0; i < SIZE; i++) {
      set.add(i * 10);
    }
    return set;
  };

  describe('Random Rank Access (kth/at)', () => {
    const sba = setup((comp) => new SortedBlockArray(comp, B));
    const sbl = setup((comp) => new SortedBlockList(comp, B));
    const sbd = setup((comp) => new SortedBlockDeque(comp, B));
    const splay = setup((comp) => new SplayTree(comp));

    let i = 0;

    bench('SBA', () => {
      sba.kth(randomIndices[i]);
      i = (i + 1) & mask;
    });

    bench('SBL', () => {
      sbl.kth(randomIndices[i]);
      i = (i + 1) & mask;
    });

    bench('SBD', () => {
      sbd.kth(randomIndices[i]);
      i = (i + 1) & mask;
    });

    bench('Splay', () => {
      splay.kth(randomIndices[i]);
      i = (i + 1) & mask;
    });

  });

  describe('Random Insert/Delete (heavy)', () => {
    const sba = setup((comp) => new SortedBlockArray(comp, B));
    const sbl = setup((comp) => new SortedBlockList(comp, B));
    const sbd = setup((comp) => new SortedBlockDeque(comp, B));
    const splay = setup((comp) => new SplayTree(comp));

    let i = 0;
    let j = SAMPLE_SIZE / 2;

    bench('SBA', () => {
      const v = randomValues[i];
      sba.add(v);
      sba.delete(v);
      i = (i + 1) & mask;
    });

    bench('SBL', () => {
      const v = randomValues[i];
      sbl.add(v);
      sbl.delete(v);
      i = (i + 1) & mask;
    });

    bench('SBD', () => {
      const v = randomValues[i];
      sbd.add(v);
      sbd.delete(v);
      i = (i + 1) & mask;
    });

    bench('Splay', () => {
      const v = randomValues[i];
      const x = randomValues[j];
      splay.add(v);
      splay.delete(x);
      i = (i + 1) & mask;
      j = (j + 1) & mask;
    });
  });
});
