---
title: Tests
description: Tests
sidebar:
  order: 1
---

For unit tests and coverage, please refer to https://coverage.sortao.com/

## Run unit tests

After cloning the repository, you can use the following commands: 

1. Testing with hot reloading
```bash
pnpm test
```

2. Single test  
```bash
pnpm test run
```

3. Single test, and generate a coverage report.
```bash
pnpm coverage

# View Report
cd ./coverage
pnpm vite
```

## Run Benchmark Tests 

4. Run the benchmark
```bash
pnpm bench
```

Since running the full set of tests can be time-consuming, you can also add a path at the end to execute specific test or benchmark test files.