import type { Comparable } from "./comparable";
import { MAX_LEVELS } from "./constants";
import { calculateLevels } from "./helpers";
import { SkipNode } from "./skip-node";

/**
 * A Skip List is a data structure that allows for fast search, insertion, and deletion of elements from a list.
 * It is a probabilistic data structure that uses multiple layers of linked lists to achieve fast search times.
 *
 * ```ts
 * import { SkipList } from "similarity-search-data-structures/skip-list";
 *
 * const list = new SkipList<number>();
 * list.insert(1);
 * list.insert(2);
 * list.insert(3);
 *
 * console.log(list.contains(2)); // true
 * console.log(list.contains(4)); // false
 * console.log(list.size()); // 3
 * console.log([...list]); // [1, 2, 3]
 * ```
 */
export class SkipList<T extends Comparable> {
  private headerNode: SkipNode<T>;
  private maxLevels: number;

  constructor(maxLevels = MAX_LEVELS) {
    this.headerNode = new SkipNode<T>(
      0 as T, // Changed from undefined as unknown as T to 0, assuming 0 as a neutral value for initialization
      MAX_LEVELS
    );
    this.maxLevels = maxLevels;
  }

  private compareValues(value1: T, value2: T): number {
    if (typeof value1 === "number" && typeof value2 === "number") {
      return value1 - value2;
    } else if (typeof value1 === "string" && typeof value2 === "string") {
      return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
    }
    return 0; // Fallback or default comparison
  }

  /**
   * Inserts a value into the skip list.
   * This method calculates the level for the new node and inserts it into the appropriate levels.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * ```
   *
   * @param value The value to be inserted into the skip list.
   */
  insert(value: T): void {
    // Calculate the level for the new node based on probability
    const levels = calculateLevels();
    // Create a new node with the given value and calculated levels
    const newNode = new SkipNode<T>(value, levels);
    // Start from the header node
    let current = this.headerNode;
    // Iterate from the highest level down to the lowest
    for (let i = levels - 1; i >= 0; i--) {
      // Traverse the list to find the correct spot for the new node
      while (
        current.next[i] &&
        this.compareValues(current.next[i].value as T, value) < 0
      ) {
        // Move to the next node
        current = current.next[i];
      }
      // At this point, the current node is positioned correctly for the current level
      // Insert the new node between by adjusting the next pointers
      newNode.next[i] = current.next[i];
      current.next[i] = newNode;
      // Move to the next level and repeat the insert process
    }
  }

  /**
   * Deletes a value from the skip list.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log(list.delete(2)); // true
   * console.log(list.delete(4)); // false
   * console.log(list.size()); // 2
   * console.log([...list]); // [1, 3]
   * ```
   *
   * @param value The value to be deleted from the skip list.
   * @returns true if the value was found and deleted, false otherwise.
   */
  delete(value: T): boolean {
    let current = this.headerNode;
    let found = false;
    for (let i = this.maxLevels - 1; i >= 0; i--) {
      while (
        current.next[i] !== undefined &&
        this.compareValues(current.next[i].value as T, value) < 0
      ) {
        current = current.next[i];
      }
      if (
        current.next[i] !== undefined &&
        this.compareValues(current.next[i].value as T, value) === 0
      ) {
        found = true;
        current.next[i] = current.next[i].next[i];
      }
    }
    return found;
  }

  /**
   * Checks if the skip list contains a given value.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log(list.contains(2)); // true
   * console.log(list.contains(4)); // false
   * ```
   *
   * @param value The value to be checked for in the skip list.
   * @returns true if the value is found, false otherwise.
   */
  contains(value: T): boolean {
    let current = this.headerNode;
    for (let i = this.maxLevels - 1; i >= 0; i--) {
      while (
        current.next[i] !== undefined &&
        this.compareValues(current.next[i].value as T, value) < 0
      ) {
        current = current.next[i];
      }
      if (
        current.next[i] !== undefined &&
        this.compareValues(current.next[i].value as T, value) === 0
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the value from the skip list if it exists.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log(list.get(2)); // 2
   * console.log(list.get(4)); // undefined
   * ```
   *
   * @param value The value to be retrieved from the skip list.
   * @returns The value if it exists, undefined otherwise.
   */
  get(value: T): T | undefined {
    let current = this.headerNode;
    for (let i = this.maxLevels - 1; i >= 0; i--) {
      while (
        current.next[i] !== undefined &&
        this.compareValues(current.next[i].value as T, value) < 0
      ) {
        current = current.next[i];
      }
      if (
        current.next[i] !== undefined &&
        this.compareValues(current.next[i].value as T, value) === 0
      ) {
        return current.next[i].value as T;
      }
    }
    return undefined;
  }

  /**
   * Gets the index of a value in the lowest skip list layer.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log(list.indexOf(2)); // 1
   * console.log(list.indexOf(4)); // -1
   * ```
   *
   * @param value The value to be checked for in the skip list.
   * @returns The index of the value if it exists, -1 otherwise.
   */
  indexOf(value: T): number {
    let current = this.headerNode;
    let index = 0;
    while (
      current.next[0] &&
      this.compareValues(current.next[0].value as T, value) < 0
    ) {
      index++;
      current = current.next[0];
    }
    if (
      current.next[0] &&
      this.compareValues(current.next[0].value as T, value) === 0
    ) {
      return index;
    }

    return -1;
  }

  /**
   * Returns the number of elements in the skip list.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log(list.size()); // 3
   * ```
   * @returns The number of elements in the skip list.
   */
  size(): number {
    let current = this.headerNode;
    let size = 0;
    while (current.next[0]) {
      size++;
      current = current.next[0];
    }
    return size;
  }

  /**
   * Returns a string representation of the skip list, showing the layout of values across different levels.
   * This method is useful for debugging and understanding the structure of the skip list.
   * The output is a multi-line string with each line representing a level in the skip list.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log(list.toPrettyString());
   * // 3:      [  2  ]
   * // 2:      [  2 3]
   * // 1:      [1 2 3]
   * ```
   *
   * @returns A string representation of the skip list.
   */
  toPrettyString(): string {
    let representation = "";
    const paddingLength = this.maxLengthOfValue();
    for (let level = this.maxLevels - 1; level >= 0; level--) {
      let valuesInLevel: T[] = [];
      let node = this.headerNode.next[level];
      while (node) {
        valuesInLevel.push(node.value as T);
        node = node.next[level];
      }
      if (valuesInLevel.length > 0) {
        let totalLength = this.size();
        let paddedValues = Array(totalLength).fill(" ".repeat(paddingLength));
        valuesInLevel.forEach((value) => {
          const index = this.indexOf(value);
          paddedValues[index] = `${value}`.padStart(paddingLength, " ");
        });
        representation += `${level + 1}:\t[${paddedValues.join(" ")}]\n`;
      }
    }
    return representation.trim();
  }

  // Helper function to find the length of the largest value in the skip list for padding purposes
  private maxLengthOfValue = (): number => {
    let node = this.headerNode;
    while (node.next[0]) {
      node = node.next[0];
    }
    return `${node.value}`.length;
  };

  /**
   * Returns an iterator for the skip list that allows iterating over the values in the list.
   * This method is useful for using the skip list with the spread operator or iterate with a for loop.
   *
   * ```ts
   * const list = new SkipList<number>();
   * list.insert(1);
   * list.insert(2);
   * list.insert(3);
   *
   * console.log([...list]); // [1, 2, 3]
   *
   * for (const value of list) {
   *   console.log(value);
   * }
   * // 1
   * // 2
   * // 3
   * ```
   */
  [Symbol.iterator] = function* (this: SkipList<T>) {
    let current = this.headerNode.next[0];
    while (current) {
      yield current.value;
      current = current.next[0];
    }
  };
}
