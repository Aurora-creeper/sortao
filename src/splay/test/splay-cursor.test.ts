import { describe, it, expect } from 'vitest';
import { SplayTree } from '../splay';

describe('SplayCursor', () => {
  it('should handle an empty tree', () => {
    const tree = new SplayTree<number>();
    const cursor = tree.cursor();
    
    expect(cursor.active).toBe(false);
    expect(cursor.value).toBeUndefined();
    expect(cursor.index).toBe(0);
    
    expect(cursor.next()).toBe(false);
    expect(cursor.prev()).toBe(false);
    expect(cursor.seek(0)).toBe(false);

    // Cover state 2 -> next on empty tree
    const curBegin = tree.cursor(-1);
    expect(curBegin.next()).toBe(false);

    // Cover state 1 -> prev on empty tree
    const curEnd = tree.cursor(1);
    expect(curEnd.prev()).toBe(false);
  });

  it('should traverse forward using next()', () => {
    const tree = new SplayTree<number>();
    [10, 20, 30, 40, 50].forEach(k => tree.insert(k));

    const cursor = tree.cursor(); // Defaults to index 0
    expect(cursor.active).toBe(true);
    expect(cursor.value).toBe(10);
    expect(cursor.index).toBe(0);

    expect(cursor.next()).toBe(true);
    expect(cursor.value).toBe(20);
    expect(cursor.index).toBe(1);

    cursor.next(); // 30
    cursor.next(); // 40
    cursor.next(); // 50
    
    expect(cursor.value).toBe(50);
    expect(cursor.index).toBe(4);

    expect(cursor.next()).toBe(false); // Move past end
    expect(cursor.active).toBe(false);
    expect(cursor.value).toBeUndefined();
    expect(cursor.index).toBe(5);
  });

  it('should traverse backward using prev()', () => {
    const tree = new SplayTree<number>();
    [10, 20, 30, 40, 50].forEach(k => tree.insert(k));

    // Start at the last element
    const cursor = tree.cursor(tree.length - 1);
    expect(cursor.active).toBe(true);
    expect(cursor.value).toBe(50);
    expect(cursor.index).toBe(4);

    expect(cursor.prev()).toBe(true);
    expect(cursor.value).toBe(40);
    expect(cursor.index).toBe(3);

    cursor.prev(); // 30
    cursor.prev(); // 20
    cursor.prev(); // 10
    
    expect(cursor.value).toBe(10);
    expect(cursor.index).toBe(0);

    expect(cursor.prev()).toBe(false); // Move past beginning
    expect(cursor.active).toBe(false);
    expect(cursor.value).toBeUndefined();
    expect(cursor.index).toBe(-1);
  });

  it('should allow seeking to specific indices', () => {
    const tree = new SplayTree<number>();
    [5, 15, 25, 35, 45].forEach(k => tree.insert(k));

    const cursor = tree.cursor();
    
    expect(cursor.seek(2)).toBe(true);
    expect(cursor.value).toBe(25);
    
    expect(cursor.seek(4)).toBe(true);
    expect(cursor.value).toBe(45);
    
    expect(cursor.seek(0)).toBe(true);
    expect(cursor.value).toBe(5);

    expect(cursor.seek(5)).toBe(false); // Out of bounds
    expect(cursor.active).toBe(false);
    
    expect(cursor.seek(-1)).toBe(false); // Out of bounds
  });

  it('should support advancing by an offset', () => {
    const tree = new SplayTree<number>();
    [1, 2, 3, 4, 5, 6, 7].forEach(k => tree.insert(k));

    const cursor = tree.cursor(2); // points to 3
    expect(cursor.value).toBe(3);

    expect(cursor.advance(3)).toBe(true); // points to 6
    expect(cursor.value).toBe(6);
    expect(cursor.index).toBe(5);

    expect(cursor.advance(-4)).toBe(true); // points to 2
    expect(cursor.value).toBe(2);
    expect(cursor.index).toBe(1);

    expect(cursor.advance(10)).toBe(false); // beyond end
    expect(cursor.active).toBe(false);
  });

  it('should create independent clones', () => {
    const tree = new SplayTree<number>();
    [100, 200, 300].forEach(k => tree.insert(k));

    const cursor1 = tree.cursor(1); // points to 200
    const cursor2 = cursor1.clone();

    expect(cursor1.value).toBe(200);
    expect(cursor2.value).toBe(200);

    cursor1.next(); // cursor1 -> 300
    cursor2.prev(); // cursor2 -> 100

    expect(cursor1.value).toBe(300);
    expect(cursor2.value).toBe(100);
  });

  it('should support recovering from invalid state via seek', () => {
    const tree = new SplayTree<number>();
    [10, 20].forEach(k => tree.insert(k));

    const cursor = tree.cursor(1);
    cursor.next(); // Moves to index 2 (invalid)
    
    expect(cursor.active).toBe(false);
    
    // Seek back to a valid index
    expect(cursor.seek(0)).toBe(true);
    expect(cursor.active).toBe(true);
    expect(cursor.value).toBe(10);
  });

  it('should handle large sequential reads efficiently', () => {
    const tree = new SplayTree<number>();
    const N = 5000;
    for (let i = 0; i < N; i++) {
      tree.insert(i);
    }

    const cursor = tree.cursor();
    let count = 0;
    while (cursor.active) {
      expect(cursor.value).toBe(count);
      cursor.next();
      count++;
    }
    expect(count).toBe(N);
  });

  it('should recover from Begin state (state 2) using next()', () => {
    const tree = new SplayTree<number>();
    [10, 20].forEach(k => tree.insert(k));

    const cursor = tree.cursor(-1); // Starts at Begin (state 2)
    expect(cursor.active).toBe(false);
    expect(cursor.index).toBe(-1);

    expect(cursor.next()).toBe(true);
    expect(cursor.active).toBe(true);
    expect(cursor.value).toBe(10);
    expect(cursor.index).toBe(0);
  });

  it('should recover from End state (state 1) using prev()', () => {
    const tree = new SplayTree<number>();
    [10, 20].forEach(k => tree.insert(k));

    const cursor = tree.cursor(2); // Starts at End (state 1), since length is 2
    expect(cursor.active).toBe(false);
    expect(cursor.index).toBe(2);

    expect(cursor.prev()).toBe(true);
    expect(cursor.active).toBe(true);
    expect(cursor.value).toBe(20);
    expect(cursor.index).toBe(1);
  });

  it('should handle advance from out of bounds states', () => {
    const tree = new SplayTree<number>();
    [10, 20, 30].forEach(k => tree.insert(k));

    const cur1 = tree.cursor(-1); // Begin
    expect(cur1.advance(1)).toBe(true); // From -1 to 0
    expect(cur1.value).toBe(10);
    expect(cur1.advance(-2)).toBe(false); // Valid (0) to Begin
    expect(cur1.active).toBe(false);
    expect(cur1.index).toBe(-1); // Clamps to -1

    const cur2 = tree.cursor(3); // End
    expect(cur2.advance(-1)).toBe(true); // From 3 to 2
    expect(cur2.value).toBe(30);
    expect(cur2.advance(2)).toBe(false); // Valid (2) to End
    expect(cur2.active).toBe(false);
    expect(cur2.index).toBe(3); // Clamps to length
  });
});
