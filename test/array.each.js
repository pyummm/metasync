'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful each / array', test => {
  const arr = [1, 2, 3, 4];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  metasync.each(
    arr,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('successful each / set', test => {
  const set = new Set([1, 2, 3, 4, 5]);
  const elementsSet = new Set();

  metasync.each(
    set,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, set);
      test.end();
    }
  );
});

metatests.test('successful each / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);

  const elementsSet = new Set();
  const expectedElementsSet = new Set(map);

  metasync.each(
    map,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('successful each / string', test => {
  const string = 'aaabcdeefff';

  const elementsSet = new Set();
  const expectedElementsSet = new Set();

  metasync.each(
    string,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('each with empty / array', test => {
  const arr = [];

  const elementsSet = new Set();
  const expectedElementsSet = new Set(arr);

  metasync.each(
    arr,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('each with empty / map', test => {
  const map = new Map();

  const elementsSet = new Set();
  const expectedElementsSet = new Set(map);

  metasync.each(
    map,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('each with empty / string', test => {
  const string = '';

  const elementsSet = new Set();
  const expectedElementsSet = new Set(string);

  metasync.each(
    string,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, expectedElementsSet);
      test.end();
    }
  );
});

metatests.test('each with empty / set', test => {
  const set = new Set();

  const elementsSet = new Set();

  metasync.each(
    set,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        callback(null);
      }),
    err => {
      test.error(err);
      test.strictSame(elementsSet, set);
      test.end();
    }
  );
});

metatests.test('each with error', test => {
  const arr = [1, 2, 3, 4];
  let count = 0;

  const elementsSet = new Set();
  const expectedElementsCount = 2;
  const eachError = new Error('Each error');

  metasync.each(
    arr,
    (el, callback) =>
      process.nextTick(() => {
        elementsSet.add(el);
        count++;
        if (count === expectedElementsCount) {
          callback(eachError);
        } else {
          callback(null);
        }
      }),
    err => {
      test.strictSame(err, eachError);
      test.strictSame(elementsSet.size, expectedElementsCount);
      test.end();
    }
  );
});
