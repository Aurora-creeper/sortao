import { describe, it, expect } from 'vitest';
import { SortedSet, SortedMap, SortedMultiset, SortedMultimap, SplayTree, SplayNode } from '../src';
import { MapEntry } from '../src/traits';

describe('test', () => {

    class MyNode extends SplayNode<number, MyNode> {
        size: number = 1;
        pushup() {
            this.size = (this.left?.size ?? 0) + (this.right?.size ?? 0) + 1;
        }
    }

    const tree = new SplayTree<number, MyNode>(undefined, MyNode);

    tree.insert(10);
    const node = tree.kth(0); // 10

    const some = new SortedMultimap<number, number, SplayTree<MapEntry<number, number>>>(
        undefined, (cmp) => new SplayTree(cmp)
    )
    // const some = new SortedMultimap<number, number>();
    const iter = some.cursor();
    iter.refresh();

    it('should work', () => {
        const scores = new SortedMultiset<number>();

        // Multiset 允许插入重复的值
        scores.add(45)
            .add(60).add(60).add(60)
            .add(75)
            .add(90);

        // 统计 60 的出现次数
        expect(scores.count(60)).toBe(3);

        // 查询排名，即有多少值小于询问值（排名从 0 开始）
        expect(scores.rank(10)).toBe(0);
        expect(scores.rank(45)).toBe(0);

        expect(scores.rank(60)).toBe(1);
        expect(scores.rank(61)).toBe(4);

        expect(scores.rank(90)).toBe(5);
        expect(scores.rank(91)).toBe(6);

        // 按排名查询
        expect(scores.kth(0)).toBe(45);
        expect(scores.kth(1)).toBe(60);
        expect(scores.kth(3)).toBe(60);
    })

    it("should work", () => {
        const users = new SortedMultimap<number, string>();

        users.add(10, "asahi")
            .add(10, "luna")
            .add(20, "resona");

        console.log(users.lowerBound(20));

        const cur = users.lower_bound(20);   // 返回一个游标
        console.log(cur.index, cur.value);   // 

        cur.prev();
        console.log(cur.index, cur.value);

        cur.prev();
        console.log(cur.index, cur.key, cur.value);   // 1, luna
    })

    it("should work", () => {

        const set = new SortedSet<number>();
        set.add(10).add(20).add(30).add(40).add(50);

        set.forEach((value, index) => {
            if (value > 30) return true; // 支持短路
            console.log(`Rank: ${index}, Value: ${value}`);
        });

        // 输出:
        // Rank: 0, Value: 10
        // Rank: 1, Value: 20
        // Rank: 2, Value: 30
    })

    it("should work", () => {
        const map = new SortedMap<number, string>();
        map.set(100, "Alice").set(200, "Bob");

        map.forEach((value, key, index) => {
            console.log(`Rank: ${index} | ${key} -> ${value}`);
        });

        const entries = map.toArray(); // [[100, "Alice"], [200, "Bob"]]
    })
})