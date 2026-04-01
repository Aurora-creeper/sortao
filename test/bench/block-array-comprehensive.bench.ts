import { bench, describe } from 'vitest';
import { BlockArray } from '../../src/block-array/block-array';

const N = 500_000;

describe(`BlockArray vs Array - Middle Insert (Batch: 50,000 items)`, () => {
  const BATCH_SIZE = 50_000;
  const itemsToInsert = new Array(BATCH_SIZE).fill(1);

  bench('Native Array', () => {
    const arr = new Array(N).fill(0);
    const mid = N / 2;
    arr.splice(mid, 0, ...itemsToInsert);
  });

  bench('BlockArray', () => {
    const ba = new BlockArray<number>(512);
    ba.resize(N, 0);
    const mid = N / 2;
    ba.spliceAll(mid, 0, itemsToInsert);
  });
});

describe(`BlockArray vs Array - Middle Insert (Frequent Small: 100 items)`, () => {
  const SMALL_BATCH = 100;
  const smallItems = new Array(SMALL_BATCH).fill(1);

  bench('Native Array', () => {
    const arr = new Array(N).fill(0);
    let mid = N / 2;
    for (let i = 0; i < 50; i++) {
      arr.splice(mid, 0, ...smallItems);
      mid += 10;
    }
  });

  bench('BlockArray', () => {
    const ba = new BlockArray<number>(512);
    ba.resize(N, 0);
    let mid = N / 2;
    for (let i = 0; i < 50; i++) {
      ba.spliceAll(mid, 0, smallItems);
      mid += 10;
    }
  });
});
