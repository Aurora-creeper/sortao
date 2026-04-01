import { bench, describe } from 'vitest';
import { BlockArray, BlockDeque, BlockList } from '../../src';

describe('Flat Containers access Bench (N=500,000)', () => {
  const SIZE = 500_000;
  const BLOCK_SIZE = 512;

  describe('Tail Mutation (Push/Pop)', () => {
    const native = new Array(SIZE).fill(0);
    const ba = new BlockArray<number>(BLOCK_SIZE);
    const bax = new BlockArray<number>(BLOCK_SIZE);
    const bl = new BlockList<number>(BLOCK_SIZE);
    const bd = new BlockDeque<number>(BLOCK_SIZE);

    // @ts-expect-error
    bax.isUniform = false;

    const sz = 2 ** 18;
    const mask = sz - 1;
    const randomIndices = Array.from({ length: sz }, () => Math.floor(Math.random() * SIZE));

    if(sz > SIZE) throw new Error('Random indices size cannot be greater than array size');
    let seqIdx = 0;

    for (let i = 0; i < SIZE; i++) {
      ba.push(i);
      bax.push(i);
      bl.push(i);
      bd.push(i);
    }

    bench('Native Array', () => {
      const idx = randomIndices[seqIdx];
      const _ = native[idx];
      seqIdx = (seqIdx + 1) & mask;
    });

    bench('BlockArray', () => {
      const idx = randomIndices[seqIdx];
      ba.get(idx);
      seqIdx = (seqIdx + 1) & mask;
    });

    bench('BlockArray.n', () => {
      const idx = randomIndices[seqIdx];
      bax.get(idx);
      seqIdx = (seqIdx + 1) & mask;
    });

    bench('BlockList', () => {
      const idx = randomIndices[seqIdx];
      bl.get(idx);
      seqIdx = (seqIdx + 1) & mask;
    });

    bench('BlockDeque', () => {
      const idx = randomIndices[seqIdx];
      bd.get(idx);
      seqIdx = (seqIdx + 1) & mask;
    });
  });
});
