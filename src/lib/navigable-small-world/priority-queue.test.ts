import { describe, expect, it } from "vitest";
import { PriorityQueue } from "./priority-queue";

describe("PriorityQueue", () => {
  it("returns lowest value when peek() is called without removing the value from the queue", () => {
    const pq = new PriorityQueue();
    pq.push(4);
    pq.push(2);
    pq.push(1);
    pq.push(5);

    expect(pq.peek()).toBe(1);
    expect(pq.asArray().length).toBe(4);
  });
  it("returns lowest value with pop() by default and removes element from queue", () => {
    const pq = new PriorityQueue();
    pq.push(4);
    pq.push(2);
    pq.push(1);
    pq.push(5);

    expect(pq.pop()).toBe(1);
    expect(pq.asArray().length).toBe(3);
  });

  it("returns undefined when pop() is called on empty queue", () => {
    const pq = new PriorityQueue();
    expect(pq.pop()).toBe(undefined);
  });

  it("works with custom comparer", () => {
    const minPQ = new PriorityQueue({
      comparator: (
        a: {
          distance: number;
        },
        b: {
          distance: number;
        }
      ) => a.distance - b.distance,
    });

    minPQ.push({
      distance: 2,
    });
    minPQ.push({
      distance: 3,
    });
    minPQ.push({
      distance: 5,
    });
    minPQ.push({
      distance: 1,
    });

    expect(minPQ.pop()?.distance).toBe(1);
    expect(minPQ.pop()?.distance).toBe(2);
    expect(minPQ.pop()?.distance).toBe(3);
    expect(minPQ.pop()?.distance).toBe(5);
  });

  it("returns multiple values in sorted order with popN()", () => {
    const pq = new PriorityQueue();
    pq.push(4);
    pq.push(2);
    pq.push(1);
    pq.push(5);

    expect(pq.popN(4)).toStrictEqual([1, 2, 4, 5]);
  });

  it("returns a list of only the remaining values when popN() is called with a number greater than the number of items left", () => {
    const pq = new PriorityQueue();
    pq.push(4);
    pq.push(2);
    pq.push(1);
    pq.push(5);

    expect(pq.popN(5)).toStrictEqual([1, 2, 4, 5]);
  });
});
