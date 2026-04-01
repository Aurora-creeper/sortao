---
title: Sorted-Set<T>
description: 详细的 SortedSet API 参考文档。
sidebar:
  order: 2
---

`SortedSet` 是一种保持元素（Value）始终有序且不重复的集合容器。

默认情况下，它使用 `SortedBlockArray` 以换取最佳的综合读写性能，见 [解决方案](../../core/solution)。

## 声明

```typescript
export class SortedSet<
  T, 
  Kernel extends SortedKernel<T> = SortedBlockArray<T>
> extends InternalIterable<T>;
```

## 成员函数

### 构造函数

| 方法 | 描述 |
| :--- | :--- |
| **constructor(compareFn?, kernelFactory?)** | 构造一个新的 `SortedSet`。`compareFn` 定义元素的排序规则；`kernelFactory` 可选，用于提供自定义存储内核实例。 |

### 核心操作

| 方法 | 描述 | 复杂度 (默认内核) |
| :--- | :--- | :--- |
| **add(value)** | 向集合中添加一个元素。如果已存在则跳过。 | *O*(*B* + *N*/*B*) |
| **has(value)** | 检查集合中是否存在指定的元素。 | *O*(log *N*) |
| **delete(value)** | 移除指定的元素。返回是否移除成功。 | *O*(*B* + *N*/*B*) |

### 范围查询与排名

| 方法 | 描述 | 复杂度 (默认内核) |
| :--- | :--- | :--- |
| **lower_bound(value)** | 返回指向第一个**不小于**给定值的元素游标。 | *O*(log *N*) |
| **upper_bound(value)** | 返回指向第一个**大于**给定值的元素游标。 | *O*(log *N*) |
| **lowerBound(value)** | 返回第一个不小于给定值的元素的逻辑排名 (Rank)。 | *O*(log *N*) |
| **upperBound(value)** | 返回第一个大于给定值的元素的逻辑排名 (Rank)。 | *O*(log *N*) |
| **rank(value)** | `lowerBound` 的别名。 | *O*(log *N*) |
| **kth(index)** | 返回逻辑排名为 `index` 的元素。 | *O*(log *N*) |
| **min()** | 返回集合中最小的元素。 | *O*(1) |
| **max()** | 返回集合中最大的元素。 | *O*(1) |

### 容量与状态

| 方法 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| **size** | 返回集合中元素的总数。 | *O*(1) |
| **length** | `size` 的别名。 | *O*(1) |
| **isEmpty()** | 检查集合是否为空。 | *O*(1) |
| **clear(reuse = true)** | 清空所有数据。 | *O*(1) |

### 迭代器与访问

| 方法 | 描述 |
| :--- | :--- |
| **cursor(index = 0)** | 返回一个指向指定逻辑排名的双向随机访问游标。 |
| **values()** | 返回所有元素的 ES6 迭代器。 |
| **\[Symbol.iterator\]()** | 默认迭代器，等同于 `values()`。 |

:::tip[性能说明]
- 相比原生迭代器，建议在性能敏感场景下使用 `forEach()` 等 [InternalIterable](../../protocols/internal-iterable) 提供的方法，以减少对象分配。真的更快。
:::

## 继承的方法

该类继承自 [Internal-Iterable](../../protocols/internal-iterable)。
