type PriorityQueueOptions<T> =
  | undefined
  | { comparator?: (a: T, b: T) => number };

export class PriorityQueue<T> {
  heap: T[];
  comparator?: (a: T, b: T) => number;

  constructor(options?: Partial<PriorityQueueOptions<T>>) {
    this.heap = [];
    this.comparator =
      options?.comparator || ((x, y) => (x > y ? 1 : x < y ? -1 : 0));
  }

  private parentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private rightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (
      index > 0 &&
      this.comparator(this.heap[this.parentIndex(index)], this.heap[index]) > 0
    ) {
      this.swap(this.parentIndex(index), index);
      index = this.parentIndex(index);
    }
  }

  private heapifyDown(): void {
    let index = 0;
    while (
      this.leftChildIndex(index) < this.heap.length ||
      this.rightChildIndex(index) < this.heap.length
    ) {
      let smallerChildIndex = this.leftChildIndex(index);
      if (
        this.rightChildIndex(index) < this.heap.length &&
        this.comparator(
          this.heap[this.rightChildIndex(index)],
          this.heap[this.leftChildIndex(index)]
        ) < 0
      ) {
        smallerChildIndex = this.rightChildIndex(index);
      }

      if (
        this.comparator(this.heap[smallerChildIndex], this.heap[index]) >= 0
      ) {
        break;
      }

      this.swap(smallerChildIndex, index);
      index = smallerChildIndex;
    }
  }

  push(value: T): void {
    this.heap.push(value);
    this.heapifyUp();
  }

  pop(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const root = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return root;
  }

  popN(num: number): T[] {
    let result: T[] = [];
    for (let i = 0; i < num; i++) {
      const popped = this.pop();
      if (popped) {
        result.push(popped);
      }
    }
    return result;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  asArray(): T[] {
    return [...this.heap].sort(this.comparator);
  }
}
