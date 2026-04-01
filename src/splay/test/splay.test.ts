import { describe, it, expect } from 'vitest';
import { SplayNode, SplayTree, DefaultSplayNode } from '../splay';

class MyNode extends SplayNode<number, MyNode> {
  pushup(): void {
    this.size = 1 + (this.left ? this.left.size : 0) + (this.right ? this.right.size : 0);
  }
}

describe('SplayTree', () => {
  it('should handle isEmpty() and length correctly', () => {
    const tree = new SplayTree<number>();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.length).toBe(0);

    tree.insert(10);
    expect(tree.isEmpty()).toBe(false);
    expect(tree.length).toBe(1);

    tree.clear();
    expect(tree.isEmpty()).toBe(true);
    expect(tree.length).toBe(0);
  });

  it('should insert and splay correctly', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    tree.insert(10);
    expect(tree.root?.value).toBe(10);
    expect(tree.root?.size).toBe(1);

    tree.insert(5);
    expect(tree.root?.value).toBe(5);
    expect(tree.root?.size).toBe(2);
    // 5 < 10, then 10 is right child of 5
    expect(tree.root?.right?.value).toBe(10);

    tree.insert(15);
    expect(tree.root?.value).toBe(15);
    expect(tree.root?.size).toBe(3);
  });

  it('should find and splay correctly', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    tree.insert(10);
    tree.insert(5);
    tree.insert(15);

    const found = tree.findNode(5);
    expect(found?.value).toBe(5);
    expect(tree.root?.value).toBe(5);

    const notFound = tree.findNode(99);
    expect(notFound).toBeNull();
    expect(tree.root?.value).toBe(15);
  });

  it('should calculate rank correctly (0-based strictly less)', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    [10, 5, 15, 2, 20].forEach(k => tree.insert(k));
    // Sorted: 2, 5, 10, 15, 20

    expect(tree.rank(2)).toBe(0);
    expect(tree.rank(5)).toBe(1);
    expect(tree.rank(10)).toBe(2);
    expect(tree.rank(15)).toBe(3);
    expect(tree.rank(20)).toBe(4);
    expect(tree.rank(12)).toBe(3); // 12 is greater than 2, 5, 10
  });

  it('should get elements and nodes by index correctly', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    [10, 5, 15, 2, 20].forEach(k => tree.insert(k));
    // Sorted: 2, 5, 10, 15, 20

    expect(tree.get(0)).toBe(2);
    expect(tree.get(2)).toBe(10);
    expect(tree.get(4)).toBe(20);
    expect(tree.get(5)).toBeUndefined();

    expect(tree.kthNode(0)?.value).toBe(2);
    expect(tree.kthNode(2)?.value).toBe(10);
    expect(tree.kth(0)).toBe(2); // kth is an alias for kthNode
  });

  it('should delete correctly', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    [10, 5, 15].forEach(k => tree.insert(k));

    // Delete 5
    expect(tree.delete(5)).not.toBe(undefined);
    expect(tree.findNode(5)).toBeNull();

    // 10, 15
    expect(tree.rank(10)).toBe(0);
    expect(tree.rank(15)).toBe(1);

    // Delete remaining
    expect(tree.delete(10)).not.toBe(undefined);
    expect(tree.delete(15)).not.toBe(undefined);
    expect(tree.root).toBeNull();
  });

  it('should deleteAt index correctly', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    [10, 5, 15].forEach(k => tree.insert(k));
    // Sorted: 5, 10, 15

    expect(tree.deleteAt(1)).toBe(10);
    expect(tree.get(0)).toBe(5);
    expect(tree.get(1)).toBe(15);
  });

  it('should find predecessor and successor correctly', () => {
    const tree = new SplayTree<number, MyNode>(undefined, MyNode);
    [10, 5, 15, 2, 8].forEach(k => tree.insert(k));
    // Sorted: 2, 5, 8, 10, 15

    expect(tree.prev(8)?.value).toBe(5);
    expect(tree.prev(2)).toBeNull();
    expect(tree.prev(100)?.value).toBe(15);

    expect(tree.next(8)?.value).toBe(10);
    expect(tree.next(15)).toBeNull();
    expect(tree.next(0)?.value).toBe(2);
  });

  it('should join two trees correctly (including empty scenarios)', () => {
    // 1. Full receiver, Full other
    const tree1 = new SplayTree<number, MyNode>(undefined, MyNode);
    const tree2 = new SplayTree<number, MyNode>(undefined, MyNode);
    [1, 3, 5].forEach(k => tree1.insert(k));
    [10, 12, 14].forEach(k => tree2.insert(k));
    tree1.join(tree2);
    expect(tree1.length).toBe(6);
    expect(tree2.length).toBe(0);

    // 2. Empty receiver, Full other
    const treeEmpty = new SplayTree<number, MyNode>(undefined, MyNode);
    const treeFull = new SplayTree<number, MyNode>(undefined, MyNode);
    [100, 200].forEach(k => treeFull.insert(k));
    treeEmpty.join(treeFull);
    expect(treeEmpty.length).toBe(2);
    expect(treeEmpty.get(0)).toBe(100);
    expect(treeFull.length).toBe(0);

    // 3. Full receiver, Empty other
    const treeFull2 = new SplayTree<number, MyNode>(undefined, MyNode);
    const treeEmpty2 = new SplayTree<number, MyNode>(undefined, MyNode);
    treeFull2.insert(500);
    treeFull2.join(treeEmpty2);
    expect(treeFull2.length).toBe(1);
  });

  it('should merge two trees correctly', () => {
    const tree1 = new SplayTree<number, MyNode>(undefined, MyNode);
    const tree2 = new SplayTree<number, MyNode>(undefined, MyNode);

    [1, 10, 5].forEach(k => tree1.insert(k));
    [3, 8, 12].forEach(k => tree2.insert(k));

    tree1.merge(tree2);

    // Should contain all elements: 1, 3, 5, 8, 10, 12
    expect(tree1.length).toBe(6);
    expect(tree1.get(0)).toBe(1);
    expect(tree1.get(1)).toBe(3);
    expect(tree1.get(3)).toBe(8);
    expect(tree1.get(5)).toBe(12);
  });

  it('should support [Symbol.iterator]() for-of loops', () => {
    const tree = new SplayTree<number>();
    const values = [30, 10, 20, 50, 40];
    values.forEach(v => tree.insert(v));

    const result: number[] = [];
    for (const val of tree) {
      result.push(val);
    }
    expect(result).toEqual([10, 20, 30, 40, 50]);
  });

  it('should handle duplicate inserts by splaying existing node', () => {
    const tree = new SplayTree<number>();
    tree.insert(10);
    tree.insert(10);
    expect(tree.length).toBe(2);
    expect(tree.root?.value).toBe(10);
  });

  it('should correctly execute upper_bound_key', () => {
    const tree = new SplayTree<number>();
    [10, 20, 30].forEach(k => tree.insert(k));

    // > 15 is 20
    const cur1 = tree.upper_bound_key(15, (a, b) => a - b);
    expect(cur1.value).toBe(20);

    // > 20 is 30
    const cur2 = tree.upper_bound_key(20, (a, b) => a - b);
    expect(cur2.value).toBe(30);

    // > 30 is end
    const cur3 = tree.upper_bound_key(30, (a, b) => a - b);
    expect(cur3.active).toBe(false);
  });

  it('should handle _traverse scale and early termination', () => {
    const tree = new SplayTree<number>();
    // Insert in a way that creates a complex structure
    [50, 25, 75, 10, 40, 60, 90].forEach(k => tree.insert(k));

    let count = 0;
    tree.forEach((v, idx) => {
      count++;
      if (idx === 3) return true; // Early termination at 4th element
    });
    expect(count).toBe(4);
  });

  it('should handle large-scale operations correctly with DefaultSplayNode', () => {
    const tree = new SplayTree<number>();
    const N = 1000;
    const values: number[] = [];

    for (let i = 0; i < N; i++) values.push(i);
    // Shuffle
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    values.forEach(v => tree.insert(v));

    expect(tree.length).toBe(N);

    // Verify sorted order via get
    const sorted = [...values].sort((a, b) => a - b);
    for (let i = 0; i < N; i++) {
      expect(tree.get(i)).toBe(sorted[i]);
    }

    // Delete half
    const toDelete = values.slice(0, Math.floor(N / 2));
    toDelete.forEach(v => {
      expect(tree.delete(v)).not.toBe(undefined);
    });

    const remainingCount = N - toDelete.length;
    expect(tree.length).toBe(remainingCount);

    // Test rank
    const remainingUnique = values.slice(Math.floor(N / 2)).sort((a, b) => a - b);
    remainingUnique.forEach((v, idx) => {
      expect(tree.rank(v)).toBe(idx);
    });
  });
});
