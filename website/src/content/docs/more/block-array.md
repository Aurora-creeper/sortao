---
title: Block-Array<T>
description: 详细的 BlockArray API 参考文档。
sidebar:
  order: 3
---

`BlockArray` 是一种基于分块技术的线性容器。它主要解决原生数组在处理中大规模数据时，在中段批量插入/删除操作导致的性能退化问题。通过分块技术，我们可以分摊内存重排的开销，将插入、删除的复杂度维持在 _O_(_B_/_w_ + _N_/_B_)。

按下标访问的效率约为原生数组的 1/2。满足 isUniform 时，访问效率与原生数组一致。见 [基准测试](../../core/bench/)。

## 声明

```typescript
export class BlockArray<T> extends InternalIterable<T>;
```

## 成员函数

### 构造函数

| 方法                             | 描述                                                                                  |
| :------------------------------- | :------------------------------------------------------------------------------------ |
| **constructor(blockSize = 512)** | 构造一个新的 `BlockArray` 实例。 <br> `blockSize` (即 B) 决定了内部物理块的期望大小。 |

### 元素访问

| 方法                  | 描述                               | 复杂度                 |
| :-------------------- | :--------------------------------- | :--------------------- |
| **at(index)**         | 访问指定位置的元素，支持负数索引。 | _O_(1) 或 _O_(log _N_) |
| **get(index)**        | 访问指定位置的元素。               | _O_(1) 或 _O_(log _N_) |
| **set(index, value)** | 替换指定位置的元素。               | _O_(1) 或 _O_(log _N_) |

在 isUniform 条件下，可以保证 _O_(1) 的访问速度。

### 修改器

| 方法                     | 描述                           | 复杂度                                   |
| :----------------------- | :----------------------------- | :--------------------------------------- |
| **push(...values)**      | 在末尾添加一个或多个元素。     | _O_(1)                                   |
| **pop()**                | 移除并返回最后一个元素。       | _O_(1)                                   |
| **unshift(...values)**   | 在头部插入一个或多个元素。     | _O_(_B_ + _N_/_B_) 或 _O_(_K_ + _N_/_B_) |
| **shift()**              | 移除并返回第一个元素。         | _O_(_B_ + _N_/_B_)                       |
| **insert(index, value)** | 在指定位置插入单个元素。       | _O_(_B_ + _N_/_B_)                       |
| **delete(index)**        | 删除指定位置的元素，并返回它。 | _O_(_B_ + _N_/_B_)                       |
| **deleteCursor(cur)**    | 删除游标指向的元素，并返回它。 | _O_(_B_ + _N_/_B_)                       |

- `push()` 和 `pop()` 不会改变容器的 isUniform 状态。
- 其余方法均会使得容器的 isUniform 状态变为 false。

### 其他方法

| 方法                                  | 描述                                                         | 复杂度                   |
| :------------------------------------ | :----------------------------------------------------------- | :----------------------- |
| **pushAll(values[])**                 | 同 `push`。但参数为数组。                                    | _O_(_K_)                 |
| **splice(start, count?, ...items)**   | 切片修改。支持批量删除和插入。                               | _O_(_K_ + _B_ + _N_/_B_) |
| **spliceAll(start, count?, items[])** | 同 `splice`，但第三个参数为数组。                            | _O_(_K_ + _B_ + _N_/_B_) |
| **slice(start?, end?)**               | 返回一个指定范围的浅拷贝 `BlockArray`。                      | _O_(_K_ + log _N_)       |
| **concat(...items)**                  | 拼接元素、数组、或 `BlockArray`。返回一个新的 `BlockArray`。 | _O_(_K_)                 |
| **reverse()**                         | 原地反转容器内的所有元素。                                   | _O_(_N_)                 |
| **rebase(newBlockSize?)**             | 动态修改 `blockSize`，且使容器进入 `isUniform` 状态。        | _O_(_N_)                 |

- `pushAll()` 不会改变容器的 isUniform 状态。
- `splice()`, `spliceAll()`, `reverse()` 会使得容器的 isUniform 状态变为 false。
- `rebase()` 总是使得 isUniform 变为 true。
- 不保证 `slice()` 和 `concat()` 返回一个 isUniform 的容器。

可以在修改完成后使用 `rebase()` 花费 _O_(_N_) 的代价来恢复 _O_(1) 寻址。

### 迭代器与游标

| 方法                      | 描述                                     |
| :------------------------ | :--------------------------------------- |
| **cursor(index = 0)**     | 返回一个指向指定索引的双向随机访问游标。 |
| **\[Symbol.iterator\]()** | 返回原生迭代器，支持 `for..of` 循环。    |

### 容量与状态

| 方法                            | 描述                                                   | 复杂度   |
| :------------------------------ | :----------------------------------------------------- | :------- |
| **length**                      | 返回容器中的逻辑元素总数。                             | _O_(1)   |
| **capacity**                    | 返回当前物理块分配的总容量。                           | _O_(1)   |
| **isEmpty()**                   | 检查容器是否为空。                                     | _O_(1)   |
| **resize(newSize, fillValue?)** | 调整容器大小。缩小时截断数据，扩大时填充 `fillValue`。 | _O_(_N_) |
| **clear()**                     | 清空容器。                                             | _O_(1)   |

:::danger
`resize()` 默认会填充 undefined 值（并绕过类型检查）从而可能使元素类型不符合 `T`.  
请总是在必要时传入 `fillValue`。
:::

## 继承的方法

- [Internal-Iterable](../../protocols/internal-iterable)

## Benchmarks

在包含 **500,000** 个元素的容器上进行对比测试，您还可以在本地运行储存库中的测试。

```bash frame="none"
✓ test/bench/block-array-comprehensive.bench.ts > BlockArray vs Array - Middle Insert (Batch: 50,000 items) 1223ms
    name                hz     min      max    mean     p75      p99     p995     p999     rme  samples
  · Native Array    290.20  2.0167  12.6129  3.4459  3.1426  11.4050  12.6129  12.6129  ±9.37%      146
  · BlockArray    1,803.92  0.4399   1.5574  0.5543  0.5294   1.2488   1.3141   1.5574  ±2.09%      902

✓ test/bench/block-array-comprehensive.bench.ts > BlockArray vs Array - Middle Insert (Frequent Small: 100 items) 1222ms
    name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
  · Native Array    220.36  3.7880  8.7093  4.5380  4.4313  8.3863  8.7093  8.7093  ±4.66%      111
  · BlockArray    1,558.31  0.5175  1.4664  0.6417  0.6318  1.2931  1.3599  1.4664  ±1.84%      780
```

1.  单次在容器中段替换 50,000 个元素。
2.  在容器中段频繁进行小规模切片（连续 50 次，每次约 100 个元素）。

单点插入的效率显著高于原生数组，见 [基准测试](../../core/bench)
