'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful filter / array', test => {
  const arr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ];
  const expectedArr = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'elit',
    'sed',
    'do',
    'ut',
    'et',
    'magna',
  ];

  metasync.filter(
    arr,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.same(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('successful filter / set', test => {
  const set = new Set([
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ]);
  const expectedSet = new Set([
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'elit',
    'sed',
    'magna',
  ]);
  const filterError = new Error('Filter error');

  metasync.filter(
    set,
    (str, callback) =>
      process.nextTick(() => {
        if (str.length === 2) {
          callback(filterError);
          return;
        }
        callback(null, str.length < 6);
      }),
    (err, res) => {
      test.error(err);
      test.same(res, expectedSet);
      test.end();
    }
  );
});

metatests.test('successful filter / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd'], [5, 'e']]);
  const expectedMap = new Map([[4, 'd'], [5, 'e']]);

  metasync.filter(
    map,
    (el, callback) =>
      process.nextTick(() => {
        callback(null, el[0] > 3);
      }),
    (err, res) => {
      test.error(err);
      test.same(res, expectedMap);
      test.end();
    }
  );
});

metatests.test('successful filter / string', test => {
  const string = 'aaabcfeeeeds';
  const expectedSet = 'aaaeeee';

  metasync.filter(
    string,
    (el, callback) =>
      process.nextTick(() => {
        callback(null, el === 'a' || el === 'e');
      }),
    (err, res) => {
      test.error(err);
      test.same(res, expectedSet);
      test.end();
    }
  );
});

metatests.test('filter with empty / array', test => {
  const arr = [];
  const expectedArr = [];

  metasync.filter(
    arr,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('filter with empty / set', test => {
  const set = new Set();
  const expectedArr = new Set();

  metasync.filter(
    set,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('filter with empty / map', test => {
  const set = new Map();
  const expectedArr = new Map();

  metasync.filter(
    set,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});

metatests.test('filter with empty / string', test => {
  const set = '';
  const expectedArr = '';

  metasync.filter(
    set,
    (str, callback) => process.nextTick(() => callback(null, str.length < 6)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedArr);
      test.end();
    }
  );
});
