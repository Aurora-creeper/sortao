import { SortedBlockArray } from '../src/sorted-block-array';
import { SortedBlockList } from '../src/sorted-block-list';
import { SortedBlockDeque } from '../src/sorted-block-deque';
import { SplayTree } from '../src/splay';

export const KERNELS: { name: string, factory: (comp: any) => any }[] = [
  { name: 'SortedBlockArray', factory: (comp: any) => new SortedBlockArray(comp) },
  { name: 'SortedBlockList', factory: (comp: any) => new SortedBlockList(comp) },
  { name: 'SortedBlockDeque', factory: (comp: any) => new SortedBlockDeque(comp) },
  { name: 'SplayTree', factory: (comp: any) => new SplayTree(comp) },
];
