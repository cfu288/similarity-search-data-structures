import { Bench } from "tinybench";
// import { SkipList } from "./skip-list";
import { OptimizedSkipList as SkipList } from "./optimized-skip-list";

/**
 * Benchmarking skip list vs array
 */

const SMALL_COUNT = 1000;
const MED_COUNT = 5000;
const LARGE_COUNT = 10000;
let list = new SkipList<number>();
let array = new Array<number>();

const getRandomInteger = (min = 0, max = 100000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

(async () => {
  console.log(`Benchmarking insert on ${SMALL_COUNT}...`);

  const benchInsertSmall = new Bench({
    time: 100,
    teardown: () => {
      list = new SkipList<number>();
      array = new Array<number>();
    },
  });

  benchInsertSmall
    .add(`Skip List insert ${SMALL_COUNT}`, () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        list.insert(getRandomInteger());
      }
    })
    .add(`Array push ${SMALL_COUNT}`, async () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        array.push(getRandomInteger());
      }
    })
    .add(`Array insert ${SMALL_COUNT}`, async () => {
      // insert in middle
      for (let i = 1; i < SMALL_COUNT; i++) {
        array.splice(
          array.length % 2 === 0 ? array.length / 2 : array.length / 3,
          0,
          getRandomInteger()
        );
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
      list = new SkipList<number>();
      array = new Array<number>();
    },
  });

  benchInsertMed
    .add(`Skip List insert ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        list.insert(getRandomInteger());
      }
    })
    .add(`Array push ${MED_COUNT}`, async () => {
      for (let i = 1; i < MED_COUNT; i++) {
        array.push(getRandomInteger());
      }
    })
    .add(`Array insert ${MED_COUNT}`, async () => {
      // insert in middle
      for (let i = 1; i < MED_COUNT; i++) {
        array.splice(
          array.length % 2 === 0 ? array.length / 2 : array.length / 3,
          0,
          getRandomInteger()
        );
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
        list.insert(getRandomInteger());
        array.push(getRandomInteger());
      }
    },
    teardown: () => {
      list = new SkipList<number>();
      array = new Array<number>();
    },
  });

  benchFindSmall
    .add(`Skip List find ${SMALL_COUNT}`, () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        list.get(getRandomInteger());
      }
    })
    .add(`Array find ${SMALL_COUNT}`, async () => {
      for (let i = 1; i < SMALL_COUNT; i++) {
        array.find((el) => el === getRandomInteger());
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
        list.insert(getRandomInteger());
        array.push(getRandomInteger());
      }
    },
    teardown: () => {
      list = new SkipList<number>();
      array = new Array<number>();
    },
  });

  benchFindMed
    .add(`Skip List find ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        list.get(getRandomInteger());
      }
    })
    .add(`Array find ${MED_COUNT}`, async () => {
      for (let i = 1; i < MED_COUNT; i++) {
        array.find((el) => el === getRandomInteger());
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
        list.insert(i);
        array.push(i);
      }
    },
    teardown: () => {
      list = new SkipList<number>();
      array = new Array<number>();
    },
  });

  benchFindLarge
    .add(`Skip List find ${LARGE_COUNT}`, () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        list.get(i);
      }
    })
    .add(`Array find ${LARGE_COUNT}`, async () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        array.find((el) => el === i);
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
        list.insert(randomValue);
        array.push(randomValue);
        listSetOfInsertedValuesMed.add(randomValue);
        arraySetOfInsertedValuesMed.add(randomValue);
      }
    },
    teardown: () => {
      list = new SkipList<number>();
      array = new Array<number>();
      listSetOfInsertedValuesMed = new Set<number>();
      arraySetOfInsertedValuesMed = new Set<number>();
    },
  });

  benchDeleteMed
    .add(`Skip List delete ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        list.delete(getListInsertedValue(listSetOfInsertedValuesMed));
      }
    })
    .add(`Array delete ${MED_COUNT}`, () => {
      for (let i = 1; i < MED_COUNT; i++) {
        const val = getListInsertedValue(arraySetOfInsertedValuesMed);
        const index = array.indexOf(val);
        if (index !== -1) {
          array.splice(index, 1);
        }
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
        list.insert(randomValue);
        array.push(randomValue);
        listSetOfInsertedValues.add(randomValue);
        arraySetOfInsertedValues.add(randomValue);
      }
    },
    teardown: () => {
      list = new SkipList<number>();
      array = new Array<number>();
      listSetOfInsertedValues = new Set<number>();
      arraySetOfInsertedValues = new Set<number>();
    },
  });

  benchDeleteLarge
    .add(`Skip List delete ${LARGE_COUNT}`, () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        list.delete(getListInsertedValue(listSetOfInsertedValues));
      }
    })
    .add(`Array delete ${LARGE_COUNT}`, () => {
      for (let i = 1; i < LARGE_COUNT; i++) {
        const val = getListInsertedValue(listSetOfInsertedValues);
        const index = array.indexOf(val);
        if (index !== -1) {
          array.splice(index, 1);
        }
      }
    });

  await benchDeleteLarge.warmup(); // make results more reliable, ref:
  await benchDeleteLarge.run();

  console.table(benchDeleteLarge.table());
})();
