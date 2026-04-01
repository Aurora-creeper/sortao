---
title: Sorted-Map<K, V>
description: 详细的 SortedMap API 参考文档。
sidebar:
  order: 1
---

`SortedMap` 是一种保持键（Key）始终有序的关联容器。

默认情况下，它使用 `SortedBlockArray` 以换取最佳的综合读写性能，见 [解决方案](../../core/solution/)

多数方法会返回形如 `[K, V]` 的键值对。

## 声明

```typescript
export class SortedMap<
  K, 
  V, 
  Kernel extends SortedKernel<MapEntry<K, V>> = SortedBlockArray<MapEntry<K, V>>
> extends InternalMapIterable<K, V>;
```

## 成员函数

### 构造函数

| 方法 | 描述 |
| :--- | :--- |
| **constructor(compareFn?, kernelFactory?)** | 构造一个新的 `SortedMap`。`compareFn` 定义键的排序规则；`kernelFactory` 可选，用于提供自定义存储内核实例。 |

### 核心操作

| 方法 | 描述 | 复杂度 (默认内核) |
| :--- | :--- | :--- |
| **set(key, value, u?)** | 插入或更新键值对。 | *O*(*B* + *N*/*B*) |
| **get(key)** | 获取指定键对应的键值对。不存在则返回 `undefined`。 | *O*(log *N*) |
| **has(key)** | 检查容器中是否存在指定的键。 | *O*(log *N*) |
| **delete(key)** | 移除指定的键值对。返回键值对或 `undefined`。 | *O*(*B* + *N*/*B*) |
| **deleteAt(index)** | 按下标移除指定的键值对。返回键值对或 `undefined`。 | *O*(*B* + *N*/*B*) |
| **deleteCursor(cur)** | 移除游标处的键值对。返回键值对或 `undefined`。 | *O*(*B* + *N*/*B*) |

set 的第三个参数为 `updateKey? = false`; 表示当存在相同的键时，是否更新键值对。

以下是一个键为 Object 的例子，比较函数仅按 `id` 进行比较：
```ts ins={10} ins="true"
const map = new SortedMap<Object, string>( comp_by_id );

map.set({ id: 1 , s: 1 }, 's'); 
// 容器: [{ id: 1 , s: 1 }, 's']

map.set({ id: 1 , a: 2 }, 'a'); 
// 容器: [{ id: 1 , s: 1 }, 'a'], 默认不会更新 key

map.set({ id: 1 , o: 3 }, 'o', true);
// 容器: [{ id: 1 , o: 3 }, 'o'], 更新 key

console.log(map.get({ id: 1 }))
// 返回 [{ id: 1 , o: 3 }, 'o']
```

### 范围查询与排名

| 方法 | 描述 | 复杂度 (默认内核) |
| :--- | :--- | :--- |
| **lower_bound(key)** | 返回指向第一个**不小于**给定键的键值对游标。 | *O*(log *N*) |
| **upper_bound(key)** | 返回指向第一个**大于**给定键的键值对游标。 | *O*(log *N*) |
| **lowerBound(key)** | 返回第一个不小于给定键的元素的逻辑排名 (Rank)。 | *O*(log *N*) |
| **upperBound(key)** | 返回第一个大于给定键的元素的逻辑排名 (Rank)。 | *O*(log *N*) |
| **rank(key)** | `lowerBound` 的别名。 | *O*(log *N*) |
| **kth(index)** | 返回逻辑排名为 `index` 的键值对。 | *O*(log *N*) |
| **min()** | 返回键最小的键值对。 | *O*(1) |
| **max()** | 返回键最大的键值对。 | *O*(1) |

### 容量与状态

| 方法 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| **size** | 返回容器中键值对的总数。 | *O*(1) |
| **length** | `size` 的别名。 | *O*(1) |
| **isEmpty()** | 检查容器是否为空。 | *O*(1) |
| **clear(reuse = true)** | 清空所有数据。 | *O*(1) |

### 迭代器与访问

| 方法 | 描述 |
| :--- | :--- |
| **cursor(index = 0)** | 返回一个指向指定逻辑排名的双向随机访问游标。 |
| **keys()** | 返回所有键的 ES6 迭代器。 |
| **values()** | 返回所有值的 ES6 迭代器。 |
| **entries()** | 返回所有键值对的 ES6 迭代器。 |
| **\[Symbol.iterator\]()** | 默认迭代器，等同于 `entries()`。 |

:::tip[性能说明]
- 相比原生迭代器，建议在性能敏感场景下使用 `forEach()` 等 [Internal-Map-Iterable](../../protocols/internal-iterable/) 提供的方法，以减少对象分配。真的更快。
:::

## 继承的方法

该类继承自 [Internal-Map-Iterable](../../protocols/internal-iterable/)。