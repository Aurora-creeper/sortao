import { bench, describe } from 'vitest';
import { BlockArray, BlockDeque, BlockList } from '../../src';

describe('Flat Containers Mutation Bench (N=500,000)', () => {
  const SIZE = 500_000;
  const BLOCK_SIZE = 512;

  describe('Tail Mutation (Push/Pop)', () => {
    const native = new Array(SIZE).fill(0);
    const ba = new BlockArray<number>(BLOCK_SIZE);
    const bl = new BlockList<number>(BLOCK_SIZE);
    const bd = new BlockDeque<number>(BLOCK_SIZE);
    for (let i = 0; i < SIZE; i++) {
      ba.push(i);
      bl.push(i);
      bd.push(i);
    }

    bench('Native Array', () => {
      native.push(1);
      native.pop();
    });

    bench('BlockArray', () => {
      ba.push(1);
      ba.pop();
    });

    bench('BlockList', () => {
      bl.push(1);
      bl.pop();
    });

    bench('BlockDeque', () => {
      bd.push(1);
      bd.pop();
    });
  });

  describe('Head Mutation (Unshift/Shift)', () => {
    const native = new Array(SIZE).fill(0);
    const ba = new BlockArray<number>(BLOCK_SIZE);
    const bl = new BlockList<number>(BLOCK_SIZE);
    const bd = new BlockDeque<number>(BLOCK_SIZE);
    for (let i = 0; i < SIZE; i++) {
      ba.push(i);
      bl.push(i);
      bd.push(i);
    }

    bench('Native Array (O(N))', () => {
      native.unshift(1);
      native.shift();
    });

    bench('BlockArray', () => {
      ba.unshift(1);
      ba.shift();
    });

    bench('BlockList (Cascade Backward)', () => {
      bl.unshift(1);
      bl.shift();
    });

    bench('BlockDeque (O(1))', () => {
      bd.unshift(1);
      bd.shift();
    });
  });

  describe('Middle Mutation (Insert/Delete at N/2)', () => {
    const native = new Array(SIZE).fill(0);
    const ba = new BlockArray<number>(BLOCK_SIZE);
    const bl = new BlockList<number>(BLOCK_SIZE);
    const bd = new BlockDeque<number>(BLOCK_SIZE);
    const mid = SIZE / 2;
    for (let i = 0; i < SIZE; i++) {
      ba.push(i);
      bl.push(i);
      bd.push(i);
    }

    bench('Native Array (O(N))', () => {
      native.splice(mid, 0, 1);
      native.splice(mid, 1);
    });

    bench('BlockArray (O(B + N/B))', () => {
      ba.insert(mid, 1);
      ba.delete(mid);
    });

    bench('BlockList (Cascade Backward)', () => {
      bl.insert(mid, 1);
      bl.delete(mid);
    });

    bench('BlockDeque (Half Cascade)', () => {
      bd.insert(mid, 1);
      bd.delete(mid);
    });
  });

  describe('Near Head Mutation (Insert/Delete at index 600)', () => {
    const native = new Array(SIZE).fill(0);
    const ba = new BlockArray<number>(BLOCK_SIZE);
    const bl = new BlockList<number>(BLOCK_SIZE);
    const bd = new BlockDeque<number>(BLOCK_SIZE);
    const nearHead = 600; // Just past the first block
    for (let i = 0; i < SIZE; i++) {
      ba.push(i);
      bl.push(i);
      bd.push(i);
    }

    bench('Native Array (O(N))', () => {
      native.splice(nearHead, 0, 1);
      native.splice(nearHead, 1);
    });

    bench('BlockArray (Local Splice)', () => {
      ba.insert(nearHead, 1);
      ba.delete(nearHead);
    });

    bench('BlockList (Cascade to Tail, ~99k shifted)', () => {
      bl.insert(nearHead, 1);
      bl.delete(nearHead);
    });

    bench('BlockDeque (Cascade to Head, ~600 shifted)', () => {
      bd.insert(nearHead, 1);
      bd.delete(nearHead);
    });
  });

  describe('Near Tail Mutation (Insert/Delete at N - 600)', () => {
    const native = new Array(SIZE).fill(0);
    const ba = new BlockArray<number>(BLOCK_SIZE);
    const bl = new BlockList<number>(BLOCK_SIZE);
    const bd = new BlockDeque<number>(BLOCK_SIZE);
    const nearTail = SIZE - 600; // Just before the last block
    for (let i = 0; i < SIZE; i++) {
      ba.push(i);
      bl.push(i);
      bd.push(i);
    }

    bench('Native Array (O(1) practically)', () => {
      native.splice(nearTail, 0, 1);
      native.splice(nearTail, 1);
    });

    bench('BlockArray (Local Splice)', () => {
      ba.insert(nearTail, 1);
      ba.delete(nearTail);
    });

    bench('BlockList (Cascade to Tail, ~600 shifted)', () => {
      bl.insert(nearTail, 1);
      bl.delete(nearTail);
    });

    bench('BlockDeque (Cascade to Tail, ~600 shifted)', () => {
      bd.insert(nearTail, 1);
      bd.delete(nearTail);
    });
  });
});
