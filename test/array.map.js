'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('succesfull map / array', test => {
  const arr = [1, 2, 3];
  const expectedArr = [1, 4, 9];

  metasync.map(
    arr,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('succesfull map / set', test => {
  const set = new Set([1, 2, 3]);
  const expectedSet = new Set([1, 4, 9]);

  metasync.map(
    set,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedSet);
      test.end();
    }
  );
});

metatests.test('succesfull map / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);
  const expectedMap = new Map([[1, 'a'], [4, 'b'], [9, 'c']]);

  metasync.map(
    map,
    (x, callback) => process.nextTick(() => callback(null, x[0] * x[0])),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedMap);
      test.end();
    }
  );
});

metatests.test('succesfull map / string', test => {
  const string = 'abcdefgh';
  const expectedStr = 'ABCDEFGH';

  metasync.map(
    string,
    (x, callback) => process.nextTick(() => callback(null, x.toUpperCase())),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedStr);
      test.end();
    }
  );
});

metatests.test('map with empty / array', test => {
  const arr = [];
  const expectedArr = [];

  metasync.map(
    arr,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('map with empty / set', test => {
  const set = new Set();
  const expectedSet = new Set();

  metasync.map(
    set,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedSet);
      test.end();
    }
  );
});

metatests.test('map with empty / map', test => {
  const map = new Map();
  const expectedMap = new Map();

  metasync.map(
    map,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedMap);
      test.end();
    }
  );
});

metatests.test('map with empty / string', test => {
  const str = '';
  const expectedStr = '';

  metasync.map(
    str,
    (x, callback) => process.nextTick(() => callback(null, x * x)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedStr);
      test.end();
    }
  );
});

metatests.test('map with error', test => {
  const arr = [1, 2, 3];
  const mapError = new Error('Map error');
  let count = 0;

  metasync.map(
    arr,
    (x, callback) =>
      process.nextTick(() => {
        count++;
        if (count === 2) {
          callback(mapError);
          return;
        }
        callback(null, x * x);
      }),
    (err, res) => {
      test.strictSame(err, mapError);
      test.strictSame(res, undefined);
      test.end();
    }
  );
});
