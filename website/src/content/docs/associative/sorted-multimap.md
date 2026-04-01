---
title: Sorted-Multimap<K, V>
description: 详细的 SortedMultimap API 参考文档。
sidebar:
  order: 3
---

`SortedMultimap` 是一种保持键（Key）始终有序的关联容器，且**允许存在重复的键**。

默认情况下，它使用 `SortedBlockArray` 以换取最佳的综合读写性能，见 [解决方案](../../core/solution)。

多数方法会返回形如 `[K, V]` 的键值对。


## 声明

```typescript
export class SortedMultimap<
  K, 
  V, 
  Kernel extends SortedKernel<MapEntry<K, V>> = SortedBlockArray<MapEntry<K, V>>
> extends InternalMapIterable<K, V>;
```

## 成员函数

### 构造函数

| 方法 | 描述 |
| :--- | :--- |
| **constructor(compareFn?, kernelFactory?)** | 构造一个新的 `SortedMultimap`。`compareFn` 定义键的排序规则；`kernelFactory` 可选，用于提供自定义存储内核实例。 |

### 核心操作

| 方法 | 描述 | 复杂度 (默认内核) |
| :--- | :--- | :--- |
| **add(key, value)** | 向容器中插入一个新的键值对，允许键重复。 | *O*(*B* + *N*/*B*) |
| **get(key)** | 返回一个包含该键所有关联值的 ES6 迭代器 (IterableIterator<V>)。如果键不存在，则返回一个空迭代器。 | *O*(log *N*) |
| **has(key)** | 检查容器中是否存在指定的键。 | *O*(log *N*) |
| **delete(key)** | 移除指定键值对的**所有**副本。返回是否移除成功。 | *O*(*B* + *N*/*B*) |
| **deleteOne(key)** | 仅移除一个精确匹配的 `[key, value]` 键值对。 | *O*(*B* + *N*/*B*) |

插入与删除是稳定的操作，对于相同的键（Key），其行为类似一个队列：
- 当 `add` 重复的键时，新元素总是被插入到相同键值的最后。
- 当 `deleteOne` 时，总是删除最早插入的键值对。
- 如果需要更灵活的删除行为，请使用后文的方法。

### 范围查询与排名

| 方法 | 描述 | 复杂度 (默认内核) |
| :--- | :--- | :--- |
| **count(key)** | 返回指定键在容器中出现的次数。 | *O*(log *N*) |
| **equal_range(key)** | 返回一个游标元组 `[start, end]`，包含所有等于该键的元素。 | *O*(log *N*) |
| **lower_bound(key)** | 返回指向第一个**不小于**给定键的键值对游标。 | *O*(log *N*) |
| **upper_bound(key)** | 返回指向第一个**大于**给定键的键值对游标。 | *O*(log *N*) |
| **lowerBound(key)** | 返回第一个不小于给定键的元素的逻辑排名。 | *O*(log *N*) |
| **upperBound(key)** | 返回第一个大于给定键的元素的逻辑排名。 | *O*(log *N*) |
| **kth(index)** | 返回逻辑排名为 `index` 的键值对。 | *O*(log *N*) |
| **min() / max()** | 返回键最小/最大的键值对。 | *O*(1) |

### 容量与状态

| 方法 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| **size / length** | 返回容器中键值对的总数。 | *O*(1) |
| **isEmpty()** | 检查容器是否为空。 | *O*(1) |
| **clear(reuse = true)** | 清空所有数据。 | *O*(1) |

### 迭代器与访问

| 方法 | 描述 |
| :--- | :--- |
| **cursor(index = 0)** | 返回一个指向指定逻辑排名的双向随机访问游标。 |
| **keys() / values() / entries()** | 返回对应的 ES6 迭代器。 |
| **\[Symbol.iterator\]()** | 默认迭代器，等同于 `entries()`。 |

:::tip[性能说明]
- 相比原生迭代器，建议在性能敏感场景下使用 `forEach()` 等 [InternalMapIterable](../../protocols/internal-iterable) 提供的方法。真的更快。
:::

## 继承的方法

该类继承自 [Internal-Map-Iterable](../../protocols/internal-iterable)。
