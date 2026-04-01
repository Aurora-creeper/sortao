import { bench, describe } from 'vitest';
import { BlockArray } from '../../src';

describe('Sequential Iteration: Native vs BlockArray get() vs Cursor', () => {
  const SIZE = 500_000;
  const nativeArr = Array.from({ length: SIZE }, (_, i) => i);
  const blockArr = new BlockArray<number>(1024);

  for (let i = 0; i < SIZE; i++) {
    blockArr.push(i);
  }

  bench('Native Array for(i)', () => {
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += nativeArr[i];
    }
  });

  bench('Native Array for..of', () => {
    let sum = 0;
    for (const v of nativeArr) {
      sum += v;
    }
  });

  bench('BlockArray for(i) with get() (O(N*sqrt(N)))', () => {
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += blockArr.get(i)!;
    }
  });

  bench('BlockArray Cursor (O(N))', () => {
    let sum = 0;
    const cursor = blockArr.cursor();
    while (cursor.active) {
      sum += cursor.value!;
      cursor.next();
    }
  });

  bench('BlockArray Internal forEach (O(N))', () => {
    let sum = 0;
    blockArr.forEach(v => {
      sum += v;
    });
  });
});
