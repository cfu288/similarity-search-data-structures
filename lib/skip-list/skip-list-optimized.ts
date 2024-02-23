import { Comparable } from "./comparable";
import { MAX_LEVELS } from "./constants";
import { calculateLevels } from "./helpers";

/**
 * A Skip List is a data structure that allows for fast search, insertion, and deletion of elements from a list.
 * It is a probabilistic data structure that uses multiple layers of linked lists to achieve fast search times.
 */
export class SkipListOptimized<T extends Comparable> {
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

  size(): number {
    let current = this.headerNode;
    let size = 0;
    while (this.next[0][current] !== -1) {
      size++;
      current = this.next[0][current];
    }
    return size;
  }

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

  [Symbol.iterator] = function* () {
    let current = this.next[0][this.headerNode];
    while (current !== -1) {
      yield this.values[current];
      current = this.next[0][current];
    }
  };
}
