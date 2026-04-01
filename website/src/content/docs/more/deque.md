---
title: Deque<T>
description: 高性能环形缓冲区双端队列。
sidebar:
  order: 1
---

`Deque`（Double-Ended Queue，双端队列）是 SortAO 提供的一个基础物理容器。它直接在原生的 JavaScript 数组上实现了一个环形缓冲区 (Circular Buffer)。可以在常数时间 *O*(1) 内在两端进行推入和弹出操作，并访问任意位置的元素。

## 声明

```typescript
export class Deque<T> extends InternalIterable<T>;
```

## 成员函数

### 构造函数

| 方法 | 描述 |
| :--- | :--- |
| **constructor(capacity?)** | 创建一个指定初始容量的 Deque。容量会自动调整为 2 的幂。 |

### 修改器

| 方法 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| **pushBack(value)** | 在尾部插入元素。 | 均摊 *O*(1) |
| **popBack()** | 弹出尾部元素。 | 均摊 *O*(1) |
| **pushFront(value)** | 在头部插入元素。 | 均摊 *O*(1) |
| **popFront()** | 弹出头部元素。 | 均摊 *O*(1) |
| **insert(index, value)** | 在指定位置插入元素。 | *O*(*N*) |
| **remove(index)** | 移除指定位置的元素。 | *O*(*N*) |
| **resize(newSize, fill?)** | 调整容器大小。 | *O*(*K*) |

### 访问

| 方法 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| **get(index)** | 访问指定逻辑位置的元素。 | *O(1)* |
| **set(index, value)** | 修改指定逻辑位置的元素。 | *O(1)* |
| **peekFront()** | 获取头部元素（不弹出）。 | *O(1)* |
| **peekBack()** | 获取尾部元素（不弹出）。 | *O(1)* |

### 迭代器

| 方法 | 描述 |
| :--- | :--- |
| **[Symbol.iterator]** | 返回原生迭代器。 |

### 容量与状态

| 方法 | 描述 |复杂度|
| :--- | :--- | :--- |
| **length** | 返回当前元素数量。 | *O*(1)|
| **capacity** | 返回底层缓冲区的总容量。 |*O*(1)|
| **isEmpty()** | 检查队列是否为空。 |*O*(1)|
| **reserve(n)** | 扩容至至少能容纳 *n* 个元素。 |*O*(*N*)|
| **shrinkToFit()** | 释放多余容量。 |*O*(*N*)|
| **clear()** | 清空队列。 | *O*(*N*)|



## 继承的方法

该类继承自 [Internal-Iterable](../../protocols/internal-iterable)。