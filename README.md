# SortAO

SortAO is a fast, zero-dependency sorted container suite for JavaScript & TypeScript!

We provides 4 advanced wrappers out of the box:

- `Sortedmap`, `Sortedset`, `SortedMultimap`, `SortedMultiset`

These wrappers can replace the underlying data structure to adapt to different performance patterns.

- **Flat:** `SortedBlockArray`, `SortedBlockList`, `SortedBlockDeque`
- **Tree:** `SplayTree`

## Installation

```bash
npm i sortao
```

## Usage

Full documentation is available at [sortao.com](https://sortao.com/en).

```ts
import { SortedSet } from "sortao";
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
