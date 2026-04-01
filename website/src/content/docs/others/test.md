---
title: 单元测试
description: 测试
sidebar:
  order: 1
---

单元测试与覆盖率请参见 https://coverage.sortao.com/

## 运行单元测试

在克隆仓库后，您可以使用以下命令：

1. 带热重载的测试 
```bash
pnpm test
```

2. 单次测试 
```bash
pnpm test run
```

3. 单次测试，并产生覆盖率报告
```bash
pnpm coverage

# 查看报告
cd ./coverage
pnpm vite
```

## 运行基准测试

4. 运行 benchmark
```bash
pnpm bench
```

由于全量运行较为耗时，您还可以在后面添加路径来执行特定的测试或基准测试文件。