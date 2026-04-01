// src/splay/splay-cursor.ts

import type { SplayTree, SplayNode } from './splay';
import type { RandomAccessCursor, CursorState } from '../cursor';

/**
 * Cursor for SplayTree.
 */
export class SplayCursor<K, Node extends SplayNode<K, Node>> implements RandomAccessCursor<K> {
  public state: CursorState = 0;
  public index: number = 0;

  constructor(
    private tree: SplayTree<K, Node>,
    public node: Node | null,
    state: CursorState = 0
  ) {
    this.state = state;
    this.refresh();
  }

  get value(): K | undefined {
    return this.node?.value;
  }

  get active(): boolean {
    return this.state === 0 && this.node !== null;
  }

  refresh(): boolean {
    if (this.state === 1) { this.index = this.tree.length; return false; }
    if (this.state === 2) { this.index = -1; return false; }

    if (!this.node) {
      this.state = 1;
      this.index = this.tree.length;
      return false;
    }

    let r = this.node.left ? this.node.left.size : 0;
    let curr = this.node;
    while (curr.parent) {
      if (curr.parent.right === curr) {
        r += (curr.parent.left ? curr.parent.left.size : 0) + 1;
      }
      curr = curr.parent;
    }

    if (curr !== this.tree.root) {
      this.node = null;
      this.state = 1;
      this.index = this.tree.length;
      return false;
    }

    this.index = r;
    return true;
  }

  next(): boolean {
    if (this.state === 1) return false;
    if (this.state === 2) {
      this.node = this.tree.findMin();
      if (this.node) {
        this.state = 0;
        this.index = 0;
        return true;
      }
      this.state = 1;
      this.index = 0;
      return false;
    }

    if (!this.node) {
      this.state = 1;
      this.index = this.tree.length;
      return false;
    }

    let curr = this.node;
    if (curr.right) {
      curr = curr.right as Node;
      while (curr.left) curr = curr.left as Node;
      this.node = curr;
    } else {
      while (curr.parent && curr.parent.right === curr) {
        curr = curr.parent as Node;
      }
      this.node = curr.parent as Node;
    }

    if (!this.node) {
      this.state = 1;
      this.index++;
      return false;
    }
    
    this.index++;
    return true;
  }

  prev(): boolean {
    if (this.state === 2) return false;
    if (this.state === 1) {
      this.node = this.tree.findMax();
      if (this.node) {
        this.state = 0;
        this.index = this.tree.length - 1;
        return true;
      }
      this.state = 2;
      this.index = -1;
      return false;
    }

    if (!this.node) {
      this.state = 2;
      this.index = -1;
      return false;
    }

    let curr = this.node;
    if (curr.left) {
      curr = curr.left as Node;
      while (curr.right) curr = curr.right as Node;
      this.node = curr;
    } else {
      while (curr.parent && curr.parent.left === curr) {
        curr = curr.parent as Node;
      }
      this.node = curr.parent as Node;
    }

    if (!this.node) {
      this.state = 2;
      this.index--;
      return false;
    }

    this.index--;
    return true;
  }

  seek(index: number): boolean {
    if (index < 0) {
      this.node = null;
      this.state = 2;
      this.index = -1;
      return false;
    }
    if (index >= this.tree.length) {
      this.node = null;
      this.state = 1;
      this.index = this.tree.length;
      return false;
    }

    this.node = this.tree.kthNode(index);
    if (this.node) {
      this.state = 0;
      this.index = index;
      return true;
    }

    this.state = 1;
    this.index = this.tree.length;
    return false;
  }

  advance(offset: number): boolean {
    if (offset === 0) return this.active;
    if (offset > 0) {
      for (let i = 0; i < offset; i++) {
        if (!this.next()) return false;
      }
    } else {
      const steps = -offset;
      for (let i = 0; i < steps; i++) {
        if (!this.prev()) return false;
      }
    }
    return true;
  }

  clone(): this {
    const cloned = new SplayCursor(this.tree, this.node, this.state);
    cloned.index = this.index;
    return cloned as any;
  }
}
