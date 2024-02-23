import { Bench } from "tinybench";
import { SkipList } from "./skip-list";
import { SkipListOptimized } from "./skip-list-optimized";

/**
 * Benchmarking skip list vs optimized skip list
 */

const SMALL_COUNT = 1000;
const MED_COUNT = 5000;
const LARGE_COUNT = 10000;
let skipList = new SkipList<number>();
let optimizedSkip = new SkipListOptimized<number>();

const getRandomInteger = (min = 0, max = 100000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

(async () => {
  console.log(`Benchmarking insert on ${SMALL_COUNT}...`);

  const benchInsertSmall = new Bench({
    time: 100,
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
    },
  });

  benchInsertSmall
    .add(`Skip List insert ${SMALL_COUNT}`, () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        skipList.insert(getRandomInteger());
      }
    })
    .add(`Optimized Skip List insert ${SMALL_COUNT}`, async () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        optimizedSkip.insert(getRandomInteger());
      }
    });

  await benchInsertSmall.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
  await benchInsertSmall.run();

  console.table(benchInsertSmall.table());

  // ----------------------------

  console.log(`Benchmarking insert on ${MED_COUNT}...`);

  const benchInsertMed = new Bench({
    time: 100,
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
    },
  });

  benchInsertMed
    .add(`Skip List insert ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        skipList.insert(getRandomInteger());
      }
    })
    .add(`Optimized Skip List insert ${MED_COUNT}`, async () => {
      for (let i = 1; i < MED_COUNT; i++) {
        optimizedSkip.insert(getRandomInteger());
      }
    });

  await benchInsertMed.warmup(); // make results more reliable, ref:
  await benchInsertMed.run();

  console.table(benchInsertMed.table());

  // ----------------------------

  console.log(`Benchmarking find on ${SMALL_COUNT}...`);

  const benchFindSmall = new Bench({
    time: 100,
    setup: () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        skipList.insert(getRandomInteger());
        optimizedSkip.insert(getRandomInteger());
      }
    },
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
    },
  });

  benchFindSmall
    .add(`Skip List find ${SMALL_COUNT}`, () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        skipList.get(getRandomInteger());
      }
    })
    .add(`Optimized Skip List find ${SMALL_COUNT}`, async () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        optimizedSkip.get(getRandomInteger());
      }
    });

  await benchFindSmall.warmup();
  await benchFindSmall.run();

  console.table(benchFindSmall.table());

  // ----------------------------

  console.log(`Benchmarking find on ${MED_COUNT}...`);

  const benchFindMed = new Bench({
    time: 100,
    setup: () => {
      for (let i = 1; i < MED_COUNT; i++) {
        skipList.insert(getRandomInteger());
        optimizedSkip.insert(getRandomInteger());
      }
    },
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
    },
  });

  benchFindMed
    .add(`Skip List find ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        skipList.get(getRandomInteger());
      }
    })
    .add(`Optimized Skip List find ${MED_COUNT}`, async () => {
      for (let i = 1; i < MED_COUNT; i++) {
        optimizedSkip.get(getRandomInteger());
      }
    });

  await benchFindMed.warmup(); // make results more reliable, ref:
  await benchFindMed.run();

  console.table(benchFindMed.table());

  // ----------------------------

  console.log(`Benchmarking find on ${LARGE_COUNT}...`);

  const benchFindLarge = new Bench({
    time: 100,
    setup: () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        skipList.insert(i);
        optimizedSkip.insert(i);
      }
    },
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
    },
  });

  benchFindLarge
    .add(`Skip List find ${LARGE_COUNT}`, () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        skipList.get(i);
      }
    })
    .add(`Optimized Skip List find ${LARGE_COUNT}`, async () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        optimizedSkip.get(i);
      }
    });

  await benchFindLarge.warmup(); // make results more reliable, ref:
  await benchFindLarge.run();

  console.table(benchFindLarge.table());

  // ----------------------------

  console.log(`Benchmarking delete on ${MED_COUNT}...`);

  const getListInsertedValue = (set: Set<number>) => {
    const size = set.size;
    const randomIndex = Math.floor(Math.random() * size);
    const retVal = Array.from(set)[randomIndex];
    set.delete(retVal);
    return retVal;
  };

  let listSetOfInsertedValuesMed = new Set<number>();
  let arraySetOfInsertedValuesMed = new Set<number>();

  const benchDeleteMed = new Bench({
    time: 100,
    setup: () => {
      for (let i = 1; i < MED_COUNT; i++) {
        const randomValue = getRandomInteger();
        skipList.insert(randomValue);
        optimizedSkip.insert(randomValue);
        listSetOfInsertedValuesMed.add(randomValue);
        arraySetOfInsertedValuesMed.add(randomValue);
      }
    },
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
      listSetOfInsertedValuesMed = new Set<number>();
      arraySetOfInsertedValuesMed = new Set<number>();
    },
  });

  benchDeleteMed
    .add(`Skip List delete ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        skipList.delete(getListInsertedValue(listSetOfInsertedValuesMed));
      }
    })
    .add(`Optimized Skip List delete ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        optimizedSkip.delete(getListInsertedValue(listSetOfInsertedValuesMed));
      }
    });

  await benchDeleteMed.warmup(); // make results more reliable, ref:
  await benchDeleteMed.run();

  console.table(benchDeleteMed.table());

  console.log(`Benchmarking delete on ${LARGE_COUNT}...`);

  let listSetOfInsertedValues = new Set<number>();
  let arraySetOfInsertedValues = new Set<number>();

  const benchDeleteLarge = new Bench({
    time: 100,
    setup: () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        const randomValue = getRandomInteger();
        skipList.insert(randomValue);
        optimizedSkip.insert(randomValue);
        listSetOfInsertedValues.add(randomValue);
        arraySetOfInsertedValues.add(randomValue);
      }
    },
    teardown: () => {
      skipList = new SkipList<number>();
      optimizedSkip = new SkipListOptimized<number>();
      listSetOfInsertedValues = new Set<number>();
      arraySetOfInsertedValues = new Set<number>();
    },
  });

  benchDeleteLarge
    .add(`Skip List delete ${LARGE_COUNT}`, () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        skipList.delete(getListInsertedValue(listSetOfInsertedValues));
      }
    })
    .add(`Optimized Skip List delete ${LARGE_COUNT}`, () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        optimizedSkip.delete(getListInsertedValue(listSetOfInsertedValuesMed));
      }
    });

  await benchDeleteLarge.warmup(); // make results more reliable, ref:
  await benchDeleteLarge.run();

  console.table(benchDeleteLarge.table());
})();
