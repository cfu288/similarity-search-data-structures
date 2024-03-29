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

## Performance vs Array

```bash
┌─────────┬─────────────────────────┬──────────┬────────────────────┬───────────┬─────────┐
│ (index) │        Task Name        │ ops/sec  │ Average Time (ns)  │  Margin   │ Samples │
├─────────┼─────────────────────────┼──────────┼────────────────────┼───────────┼─────────┤
│    0    │ 'Skip List insert 1000' │  '108'   │ 9248976.727778262  │ '±34.50%' │   11    │
│    1    │    'Array push 1000'    │ '37,717' │ 26512.765575472902 │ '±38.36%' │  3772   │
│    2    │   'Array insert 1000'   │  '558'   │ 1789605.8269101998 │ '±13.84%' │   58    │
└─────────┴─────────────────────────┴──────────┴────────────────────┴───────────┴─────────┘
Benchmarking insert on 5000...
┌─────────┬─────────────────────────┬─────────┬────────────────────┬───────────┬─────────┐
│ (index) │        Task Name        │ ops/sec │ Average Time (ns)  │  Margin   │ Samples │
├─────────┼─────────────────────────┼─────────┼────────────────────┼───────────┼─────────┤
│    0    │ 'Skip List insert 5000' │   '2'   │ 413521448.9981532  │ '±51.49%' │   10    │
│    1    │    'Array push 5000'    │ '9,611' │ 104045.05807542262 │ '±40.78%' │  1064   │
│    2    │   'Array insert 5000'   │  '126'  │ 7885494.997868171  │ '±35.70%' │   13    │
└─────────┴─────────────────────────┴─────────┴────────────────────┴───────────┴─────────┘
Benchmarking find on 1000...
┌─────────┬───────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │       Task Name       │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼───────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'Skip List find 1000' │ '5,923' │ 168819.03031021103 │ '±0.94%' │   593   │
│    1    │   'Array find 1000'   │  '133'  │ 7485664.501786232  │ '±1.44%' │   14    │
└─────────┴───────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
Benchmarking find on 5000...
┌─────────┬───────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │       Task Name       │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼───────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'Skip List find 5000' │  '775'  │ 1289162.4864095298 │ '±3.07%' │   78    │
│    1    │   'Array find 5000'   │   '5'   │ 182015212.7996087  │ '±1.29%' │   10    │
└─────────┴───────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
Benchmarking find on 10000...
┌─────────┬────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │       Task Name        │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'Skip List find 10000' │  '631'  │ 1582415.2184650302 │ '±1.72%' │   64    │
│    1    │   'Array find 10000'   │  '42'   │ 23499736.899137497 │ '±2.16%' │   10    │
└─────────┴────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
Benchmarking delete on 5000...
┌─────────┬─────────────────────────┬─────────┬───────────────────┬──────────┬─────────┐
│ (index) │        Task Name        │ ops/sec │ Average Time (ns) │  Margin  │ Samples │
├─────────┼─────────────────────────┼─────────┼───────────────────┼──────────┼─────────┤
│    0    │ 'Skip List delete 5000' │ '1,465' │ 682334.632289653  │ '±1.28%' │   147   │
│    1    │   'Array delete 5000'   │ '3,178' │ 314657.4745575587 │ '±1.79%' │   318   │
└─────────┴─────────────────────────┴─────────┴───────────────────┴──────────┴─────────┘
Benchmarking delete on 10000...
┌─────────┬──────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │        Task Name         │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼──────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │ 'Skip List delete 10000' │  '688'  │ 1453352.1738173305 │ '±1.16%' │   69    │
│    1    │   'Array delete 10000'   │  '699'  │ 1429299.943787711  │ '±1.72%' │   70    │
└─────────┴──────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
```

### Comparison with optimized Skip List implementation

```bash
┌─────────┬───────────────────────────────────┬─────────┬────────────────────┬───────────┬─────────┐
│ (index) │             Task Name             │ ops/sec │ Average Time (ns)  │  Margin   │ Samples │
├─────────┼───────────────────────────────────┼─────────┼────────────────────┼───────────┼─────────┤
│    0    │      'Skip List insert 1000'      │  '35'   │ 28117740.200459957 │ '±45.30%' │   10    │
│    1    │ 'Optimized Skip List insert 1000' │  '104'  │ 9597851.089455865  │ '±41.70%' │   11    │
└─────────┴───────────────────────────────────┴─────────┴────────────────────┴───────────┴─────────┘
Benchmarking insert on 5000...
┌─────────┬───────────────────────────────────┬─────────┬───────────────────┬───────────┬─────────┐
│ (index) │             Task Name             │ ops/sec │ Average Time (ns) │  Margin   │ Samples │
├─────────┼───────────────────────────────────┼─────────┼───────────────────┼───────────┼─────────┤
│    0    │      'Skip List insert 5000'      │   '0'   │ 1166466551.798582 │ '±48.29%' │   10    │
│    1    │ 'Optimized Skip List insert 5000' │   '2'   │ 338017844.4996476 │ '±56.49%' │   10    │
└─────────┴───────────────────────────────────┴─────────┴───────────────────┴───────────┴─────────┘
Benchmarking find on 1000...
┌─────────┬─────────────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │            Task Name            │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼─────────────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │      'Skip List find 1000'      │ '5,636' │ 177404.47008123633 │ '±1.03%' │   564   │
│    1    │ 'Optimized Skip List find 1000' │ '6,214' │ 160911.5885672462  │ '±0.50%' │   622   │
└─────────┴─────────────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
Benchmarking find on 5000...
┌─────────┬─────────────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │            Task Name            │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼─────────────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │      'Skip List find 5000'      │  '861'  │ 1160869.9431707119 │ '±1.04%' │   87    │
│    1    │ 'Optimized Skip List find 5000' │  '855'  │ 1169116.8602122816 │ '±0.99%' │   86    │
└─────────┴─────────────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
Benchmarking find on 10000...
┌─────────┬──────────────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │            Task Name             │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼──────────────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │      'Skip List find 10000'      │  '778'  │ 1284454.972889179  │ '±0.57%' │   78    │
│    1    │ 'Optimized Skip List find 10000' │  '649'  │ 1538843.9549849583 │ '±1.53%' │   65    │
└─────────┴──────────────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
Benchmarking delete on 5000...
┌─────────┬───────────────────────────────────┬─────────┬───────────────────┬──────────┬─────────┐
│ (index) │             Task Name             │ ops/sec │ Average Time (ns) │  Margin  │ Samples │
├─────────┼───────────────────────────────────┼─────────┼───────────────────┼──────────┼─────────┤
│    0    │      'Skip List delete 5000'      │ '1,661' │ 601903.2876827046 │ '±1.68%' │   167   │
│    1    │ 'Optimized Skip List delete 5000' │ '1,446' │ 691166.1994868312 │ '±1.21%' │   145   │
└─────────┴───────────────────────────────────┴─────────┴───────────────────┴──────────┴─────────┘
Benchmarking delete on 10000...
┌─────────┬────────────────────────────────────┬─────────┬────────────────────┬──────────┬─────────┐
│ (index) │             Task Name              │ ops/sec │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼────────────────────────────────────┼─────────┼────────────────────┼──────────┼─────────┤
│    0    │      'Skip List delete 10000'      │  '864'  │ 1156932.9887285999 │ '±1.71%' │   87    │
│    1    │ 'Optimized Skip List delete 10000' │  '718'  │ 1392335.6264001792 │ '±3.92%' │   72    │
└─────────┴────────────────────────────────────┴─────────┴────────────────────┴──────────┴─────────┘
```
