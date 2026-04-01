import { describe, it, expect } from 'vitest';
import { BlockArray } from '../block-array';

describe('BlockArray Mutation Isolation (Strict N^2 Test)', () => {
  it('should maintain isolation for ALL possible slice intervals [i, j]', () => {
    const N = 50; // 用 50 个元素进行 N^2 测试，共 1225 个区间，足以覆盖逻辑
    const B = 8;  // 较小的 B 以产生更多的块边界情况
    
    // 初始化 0, 1, 2... N-1
    const original = new BlockArray<number>(B);
    for (let i = 0; i < N; i++) original.push(i);

    // 笛卡尔积遍历所有可能的 start 和 end
    for (let i = 0; i <= N; i++) {
      for (let j = i; j <= N; j++) {
        // 1. 执行 slice
        const sliced = original.slice(i, j);
        const expected = Array.from({ length: j - i }, (_, idx) => i + idx);
        
        // 验证初始内容
        expect(sliced.toArray(), `Initial match failed for interval [${i}, ${j}]`).toEqual(expected);

        // 2. 干扰原数组：将原数组对应区间全部改为 -1
        // 注意：为了不影响后续的循环，我们每次干扰完都要改回来，或者使用副本
        // 这里采用：修改原数组 -> 验证 slice 不受影响 -> 恢复原数组
        for (let k = i; k < j; k++) {
          original.set(k, -1);
        }

        // 验证 slice 依然保持原始值 (隔离性验证)
        expect(sliced.toArray(), `Isolation failed for interval [${i}, ${j}] after mutating original`).toEqual(expected);

        // 恢复原数组
        for (let k = i; k < j; k++) {
          original.set(k, k);
        }
      }
    }
  });

  it('should maintain isolation for concat with all possible split points', () => {
    const N = 50;
    const B = 8;

    for (let i = 0; i <= N; i++) {
      const a = new BlockArray<number>(B);
      const b = new BlockArray<number>(B);
      
      for (let k = 0; k < i; k++) a.push(k);
      for (let k = i; k < N; k++) b.push(k);

      const combined = a.concat(b);
      const expected = Array.from({ length: N }, (_, idx) => idx);

      // 干扰 a 和 b
      for (let k = 0; k < a.length; k++) a.set(k, -1);
      for (let k = 0; k < b.length; k++) b.set(k, -1);

      // 验证 combined 不受影响
      expect(combined.toArray(), `Concat isolation failed at split point ${i}`).toEqual(expected);
    }
  });
});
