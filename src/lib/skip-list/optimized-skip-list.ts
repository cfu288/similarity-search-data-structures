import { Comparable } from "./comparable";
import { MAX_LEVELS } from "./constants";
import { calculateLevels } from "./helpers";

/**
 * A Skip List implementation with optimized memory usage, improved insert performance but worse delete performance.
 * Instead of using Node objects, this implementation uses arrays to store the values and next pointers.
 *
 * ```ts
 * import { OptimizedSkipList } from "similarity-search-data-structures/skip-list";
 *
 * const list = new OptimizedSkipList<number>();
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
export class OptimizedSkipList<T extends Comparable> {
  private values: (T | null)[] = [];
  private next: number[][] = [];
  private firstEmptyCell: number = -1; // Indicates the first empty cell or -1 if there's none
  private maxLevels: number;
  private headerNode: number; // Index of the header node in the values array

  constructor(maxLevels = MAX_LEVELS) {
    this.maxLevels = maxLevels;
    // Initialize the header node with null value and maxLevels height
    this.headerNode = this.createNode(null, maxLevels);
  }

  private createNode(value: T | null, levels: number): number {
    if (this.firstEmptyCell !== -1) {
      const index = this.firstEmptyCell;
      this.firstEmptyCell = this.next[0][index]; // Update firstEmptyCell to the next in the empty list
      this.values[index] = value;
      this.next.forEach((level) => (level[index] = -1));
      return index;
    } else {
      const index = this.values.length;
      this.values.push(value);
      this.next.forEach((level) => level.push(-1));
      while (this.next.length < levels) {
        this.next.push(Array(index + 1).fill(-1));
      }
      return index;
    }
  }

  private compareValues(value1: T | null, value2: T | null): number {
    if (value1 === null || value2 === null) return 0;
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
    const levels = calculateLevels();
    const newNodeIndex = this.createNode(value, levels);
    let current = this.headerNode;
    for (let level = levels - 1; level >= 0; level--) {
      while (
        this.next[level][current] !== -1 &&
        this.compareValues(this.values[this.next[level][current]], value) < 0
      ) {
        current = this.next[level][current];
      }
      this.next[level][newNodeIndex] = this.next[level][current];
      this.next[level][current] = newNodeIndex;
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
    let targetIndex = -1;

    // Search for the node to delete and update links in the same loop
    for (let i = this.maxLevels - 1; i >= 0; i--) {
      while (
        this.next[i][current] !== -1 &&
        this.compareValues(this.values[this.next[i][current]], value) < 0
      ) {
        current = this.next[i][current];
      }
      if (
        this.next[i][current] !== -1 &&
        this.compareValues(this.values[this.next[i][current]], value) === 0
      ) {
        targetIndex = this.next[i][current];
        this.next[i][current] = this.next[i][targetIndex];
        found = true;
      }
    }

    // If the node was found, clear the value and add it to the empty list
    if (found && targetIndex !== -1) {
      this.values[targetIndex] = null; // Clear the value
      this.next[0][targetIndex] = this.firstEmptyCell; // Add to the empty list
      this.firstEmptyCell = targetIndex;
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
        this.next[i][current] !== -1 &&
        this.compareValues(this.values[this.next[i][current]], value) < 0
      ) {
        current = this.next[i][current];
      }
      const nextIndex = this.next[i][current];
      if (
        nextIndex !== -1 &&
        this.values[nextIndex] !== null && // Check if the value is not null
        this.compareValues(this.values[nextIndex], value) === 0
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
        this.next[i][current] !== -1 &&
        this.compareValues(this.values[this.next[i][current]], value) < 0
      ) {
        current = this.next[i][current];
      }
      if (
        this.next[i][current] !== -1 &&
        this.compareValues(this.values[this.next[i][current]], value) === 0
      ) {
        return this.values[this.next[i][current]] as T;
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
      this.next[0][current] !== -1 &&
      this.compareValues(this.values[this.next[0][current]], value) < 0
    ) {
      index++;
      current = this.next[0][current];
    }
    if (
      this.next[0][current] !== -1 &&
      this.compareValues(this.values[this.next[0][current]], value) === 0
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
    while (this.next[0][current] !== -1) {
      size++;
      current = this.next[0][current];
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
    const totalLength = this.size();
    let paddedValuesByLevel: string[][] = Array(this.maxLevels)
      .fill(null)
      .map(() => Array(totalLength).fill(" ".repeat(paddingLength)));

    for (let level = 0; level < this.maxLevels; level++) {
      let current = this.headerNode;
      while (this.next[level][current] !== -1) {
        current = this.next[level][current];
        const value = `${this.values[current]}`;
        const index = this.indexOf(this.values[current] as T);
        paddedValuesByLevel[level][index] = value.padStart(paddingLength, " ");
      }
    }

    for (let level = this.maxLevels - 1; level >= 0; level--) {
      let line = `${level + 1}:\t[${paddedValuesByLevel[level].join(" ")}]`;
      if (paddedValuesByLevel[level].some((value) => value.trim().length > 0)) {
        representation += line + "\n";
      }
    }

    return representation.trim();
  }

  private maxLengthOfValue = (): number => {
    let maxValue = Math.max(
      ...this.values.map((value) => {
        return value ? `${value}`.length : 1;
      })
    );
    return maxValue;
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
  [Symbol.iterator] = function* () {
    let current = this.next[0][this.headerNode];
    while (current !== -1) {
      yield this.values[current];
      current = this.next[0][current];
    }
  };
}
