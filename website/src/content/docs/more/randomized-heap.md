---
title: RandomizedHeap<T>
description: 基于随机化平衡的高性能可合并优先队列。
sidebar:
  order: 2
---

`RandomizedHeap` 是一种基于二进制树结构实现的优先队列（Heap）。与标准的基于数组的二叉堆（Binary Heap）相比，它可以在 *O*(log *N*) 期望复杂度下完成 **堆合并 (Meld)** 操作。

此处的期望常数 *c* 分析较紧凑，对于有 *N* 个元素的堆，其高度超过 *c* log(*N*) 的概率不超过 1/(*N*\*\**c*)。  
这一数据结构的表现相当不错，不仅保证了树高，也没有均摊其开销，在非极端效率场景下很好用。

## 声明

```typescript
export class RandomizedHeap<T> extends InternalIterable<T>;
```

## 静态方法

| 方法 | 描述 | 期望复杂度 |
| :--- | :--- | :--- |
| **from(iterable, compareFn?)** | 从可迭代对象中构造 RandomizedHeap。 | *O*(*N*) |

因为期望具有线性性，从给定的元素上建堆，期望复杂度依然可以做到 *O*(*N*)。

## 成员函数

### 构造函数

| 方法 | 描述 |
| :--- | :--- |
| **constructor(compareFn?)** | 构造实例。默认创建最小堆（Min-heap）。 |

### 核心操作

| 方法 | 描述 | 期望复杂度 |
| :--- | :--- | :--- |
| **push(value)** | 向堆中添加一个元素。 | *O*(log *N*) |
| **pop()** | 弹出并返回堆顶（极值）元素。 | *O*(log *N*) |
| **top()** | 返回堆顶元素但不弹出。 | *O*(1) |
| **meld(other)** | 将另一个堆合并入当前堆。**操作后 other 会被清空**。 | *O*(log *N*) |

### 容量与状态

| 方法 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| **length** | 返回堆中元素的总数。 | *O*(1) |
| **isEmpty()** | 检查堆是否为空。 | *O*(1) |
| **clear()** | 清空所有元素。 | *O*(1) |

## 继承的方法

该类继承自 [Internal-Iterable](../../protocols/internal-iterable)。

:::caution[注意]
这是一个堆！因此 `forEach`, `map`, `filter` `toArray` 等方法的遍历顺序都是 **没有保证** 的。  
如果希望按顺序遍历，请不断调用 `pop()`。
:::

## 补充资料

由于其使用了非均摊的复杂度，因此可以轻松实现持久化。而配对堆、斜堆则会退化。

类似地，左偏树往往效率比随机堆高，也可以实现持久化，但额外维护 dist 而使用了更多的空间。

@TODO 
1. 允许查询 topK()
2. 实现持久化（也许新建一个单独容器/包装器）。