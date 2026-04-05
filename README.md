# SortAO

SortAO is a fast, zero-dependency sorted container suite for JavaScript & TypeScript!

We provides 4 advanced wrappers out of the box:

- `SortedMap`, `SortedSet`, `SortedMultimap`, `SortedMultiset`

These wrappers can replace the underlying data structure to adapt to different performance patterns.

- **Flat:** `SortedBlockArray` (default), `SortedBlockList`, `SortedBlockDeque`
- **Tree:** `SplayTree`

## Installation

```bash
npm i sortao
```

## Usage

Full documentation is available at [sortao.com](https://sortao.com/en/).

SortAO offers both JavaScript and C++ style functions.

Surely everyone is already familiar with the JavaScript-style syntax. Here, we will focus on demonstrating the C++ style functions.

```ts
import { SortedSet } from "sortao";

const set = new SortedSet<number>();
set.add(50).add(30).add(10).add(20).add(40); // [10, 20, 30, 40, 50]

const it = set.cursor(1); // rank 1 -> value 20

if (it.active) {
  console.log(it.value);
  it.prev(); // move to rank 0 -> value 10
  set.deleteCursor(it); // [20, 30, 40, 50]
}
```

More Cursor! The behavior of the cursor is similar to that in C++, for details, please refer to our documentation.

<!-- prettier-ignore -->
```ts
const rank = set.lowerBound(29);  // js  style returns rank 2
const iter = set.lower_bound(29); // cpp style returns cursor
console.log(iter.value);          // 30
```

## Coverage

See [coverage.sortao.com](https://coverage.sortao.com)

We have provided approximately 500 test cases, including large-scale stress tests.

You may clone the repository and manually run `pnpm test` or `pnpm coverage`.

## Benchmarks

Partial benchmarks and analyses can be found in the document.

You may clone the repository and manually run `pnpm bench`.

## License

MIT

## Performance Overview

See [sortao.com/en/core/bench/](https://sortao.com/en/core/bench/)

SortAO also attach great importance to **performance**.

The following table shows the number of operations that can be performed per second.

|                  |       Access by Rank       | Mid ins/del  | near Head (~600) ins/del  |
| :--------------: | :------------------------: | :----------: | :-----------------------: |
|      Array       |       23,000,000 hz        |   4,500 hz   |         2,000 hz          |
| SortedBlockArray | 11,000,000 hz <sup>1</sup> | 1,100,000 hz |        710,000 hz         |
| SortedBlockList  |       19,000,000 hz        |  140,000 hz  |         75,000 hz         |
| SortedBlockDeque |       16,000,000 hz        |  110,000 hz  | 2,800,000 hz <sup>2</sup> |

0. Array is used as a baseline for comparison.

1. By default, `SortedBlockArray` provides 1/2 the throughput of native array index access. Which is quite powerful for an ordered container.

2. If you are more interested in data near extreme values, `SortedBlockDeque` is the best option.

---

Let's take a look at their performance under wrappers such as `SortedSet`.

|                  | Random Rank Access | Random ins & del |
| :--------------: | :----------------: | :--------------: |
| SortedBlockArray |   11,000,000 hz    |    818,000 hz    |
| SortedBlockList  |   19,000,000 hz    |    200,000 hz    |
| SortedBlockDeque |   16,000,000 hz    |    220,000 hz    |
|    SplayTree     |    2,300,00 hz     |    460,000 hz    |

0. To ensure that the size of the container remains basically unchanged, we will insert one element and delete another element each time (there are two operations). 

1. We guarantee that these two elements exist and are randomly generated in advance, so the actual performance may be much higher than the test results.