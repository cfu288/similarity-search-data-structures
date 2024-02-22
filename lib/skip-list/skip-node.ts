import { Comparable } from "./comparable";

/**
 * Nodes are of variable height, containing between 1 and O(log n) next pointers.
 * Pointers point to the start of each node
 */
export class SkipNode<T extends Comparable> {
  public value: Comparable;
  public next: SkipNode<T>[];

  constructor(value: Comparable, levels: number) {
    this.value = value;
    this.next = new Array(levels);
  }
}
