import { describe, expect, test as it } from "vitest";

import { SkipList } from "./skip-list.ts";

describe("SkipList", () => {
  it("can insert with insert() and check inserted with contains()", () => {
    const list = new SkipList();

    const max = 100;
    for (let i = 1; i < max; i++) {
      list.insert(i);
    }

    for (let i = 1; i < max; i++) {
      expect(list.contains(i)).toBe(true);
    }

    expect(list.contains(0)).toBe(false);
    expect(list.contains(101)).toBe(false);
  });

  it("can delete with delete() and check deleted with contains()", () => {
    const list = new SkipList();

    const max = 100;
    for (let i = 1; i < max; i++) {
      list.insert(i);
    }

    for (let i = 1; i < max; i++) {
      expect(list.delete(i)).toBe(true);
      expect(list.contains(i)).toBe(false);
      expect(list.delete(i)).toBe(false);
    }
    expect(list.delete(0)).toBe(false);
    expect(list.delete(101)).toBe(false);
  });

  it("can get current size with size()", () => {
    const list = new SkipList();

    const max = 100;
    for (let i = 1; i <= max; i++) {
      list.insert(i);
    }

    expect(list.size()).toBe(max);
  });

  it("can get values with get()", () => {
    const list = new SkipList();

    const max = 10;
    for (let i = 1; i <= max; i++) {
      list.insert(i);
    }

    for (let i = 1; i <= max; i++) {
      expect(list.get(i)).toBe(i);
    }
    expect(list.get(0)).toBe(undefined);
    expect(list.get(11)).toBe(undefined);
  });

  it("can get index of value with indexOf()", () => {
    const list = new SkipList();

    const max = 10;
    for (let i = 1; i <= max; i++) {
      list.insert(i);
    }

    for (let i = 0; i < max; i++) {
      expect(list.indexOf(i + 1)).toBe(i);
    }
    expect(list.indexOf(0)).toBe(-1);
    expect(list.indexOf(11)).toBe(-1);
  });

  it("can pretty print with toPrettyString()", () => {
    const list = new SkipList();

    const max = 10;
    for (let i = 1; i < max; i++) {
      list.insert(i);
    }

    for (let i = 1; i < max; i++) {
      expect(list.contains(i)).toBe(true);
    }

    expect(list.toPrettyString()).toBeTruthy();
  });

  it("returns size of 0 when size() is called on empty list", () => {
    const list = new SkipList();
    expect(list.size()).toBe(0);
  });

  it("is enumerable", () => {
    const list = new SkipList();

    const max = 10;
    for (let i = 1; i <= max; i++) {
      list.insert(i);
    }

    const arr = Array.from(list);
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  // it("is sorted even if inserts are out of order", () => {
  //   const list = new SkipList();

  //   const max = 10;
  //   // insert in reverse order
  //   for (let i = max; i > 0; i--) {
  //     list.insert(i);
  //   }

  //   // check if sorted
  //   const arr = Array.from(list);
  //   expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  // });
});
