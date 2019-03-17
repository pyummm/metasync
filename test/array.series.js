'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful series / array', test => {
  const arr = [1, 2, 3, 4];
  const expectedElements = arr;
  const elements = [];
  metasync.series(
    arr,
    (el, callback) => {
      elements.push(el);
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(elements, expectedElements);
      test.end();
    }
  );
});

metatests.test('successful series / set', test => {
  const set = new Set([1, 2, 3, 4]);
  const expectedElements = set;
  const elements = new Set();
  metasync.series(
    set,
    (el, callback) => {
      elements.add(el);
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(elements, expectedElements);
      test.end();
    }
  );
});

metatests.test('successful series / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);
  const expectedElements = new Set(map);
  const elements = new Set();
  metasync.series(
    map,
    (el, callback) => {
      elements.add(el);
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(elements, expectedElements);
      test.end();
    }
  );
});

metatests.test('successful series / string', test => {
  const string = 'abcdefg1234';
  const expectedElements = new Set(string);
  const elements = new Set();
  metasync.series(
    string,
    (el, callback) => {
      elements.add(el);
      callback(null);
    },
    err => {
      test.error(err);
      test.strictSame(elements, expectedElements);
      test.end();
    }
  );
});

metatests.test('series with error', test => {
  const arr = [1, 2, 3, 4];
  const expectedElements = [1, 2];
  const expectedElementsCount = 2;

  const elements = [];
  let count = 0;
  const seriesError = new Error('seriesError');

  metasync.series(
    arr,
    (el, callback) => {
      elements.push(el);
      count++;
      if (count === expectedElementsCount) {
        callback(seriesError);
      } else {
        callback(null);
      }
    },
    err => {
      test.strictSame(err, seriesError);
      test.strictSame(elements, expectedElements);
      test.end();
    }
  );
});
