# Skip Lists, Navigable Small World, and HNSW

A repo for re-implementation of Skip Lists, Navigable Small World, and HNSW from scratch in order to better understand the algorithms and their applicability to the problem of approximate nearest neighbor search.

## Run locally

```bash
npm install
```

## Run tests

```bash
npm test
```

## Run benchmarks

```bash
npm run bench
```

# Skip Lists

## Usage

```ts
import { SkipList } from "similarity-search-data-structures/skip-list";

const list = new SkipList<number>();
list.insert(1);
list.insert(2);
list.insert(3);

console.log(list.contains(2)); // true
console.log(list.contains(4)); // false
console.log(list.size()); // 3
console.log([...list]); // [1, 2, 3]
```
