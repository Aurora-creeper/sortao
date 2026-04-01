import { describe, it, expect } from 'vitest';
import { SplayTree } from '../splay';

describe('SplayCursor - Defensive Coverage', () => {
  it('should hit failsafe in next() when node is maliciously nullified', () => {
    const tree = new SplayTree<number>();
    tree.insert(10);
    tree.insert(20);

    const cursor = tree.cursor();
    expect(cursor.active).toBe(true);

    // Maliciously destroy the internal node reference to simulate invariant breakage
    (cursor as any).node = null;

    // This should hit the 'if (!this.node) return false;' failsafe in next()
    expect(cursor.next()).toBe(false);
    
    // The state is still 0, but node is null, so valid is false
    expect(cursor.active).toBe(false);
  });

  it('should hit failsafe in prev() when node is maliciously nullified', () => {
    const tree = new SplayTree<number>();
    tree.insert(10);
    tree.insert(20);

    const cursor = tree.cursor(1);
    expect(cursor.active).toBe(true);

    // Maliciously destroy the internal node reference
    (cursor as any).node = null;

    // This should hit the 'if (!this.node) return false;' failsafe in prev()
    expect(cursor.prev()).toBe(false);
    expect(cursor.active).toBe(false);
  });

  it('should hit failsafe in seek() if tree structure is corrupted', () => {
    const tree = new SplayTree<number>();
    tree.insert(10);

    const cursor = tree.cursor();

    // Forcefully overwrite the tree's kthNode method to return null 
    // to simulate a catastrophic internal tree corruption where a valid 
    // index somehow yields no node.
    (tree as any).kthNode = () => null;

    // index 0 is mathematically within bounds [0, 1), so it passes the first check.
    // It then asks the tree for the node, gets null, and hits the final failsafe.
    expect(cursor.seek(0)).toBe(false);
    
    // The failsafe design assumes that if it can't find it, it defaults to State 1 (End)
    expect((cursor as any).state).toBe(1);
  });
});
