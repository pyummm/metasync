'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('successful some / array', test => {
  const arr = [1, 2, 3];

  const predicate = (x, callback) => callback(null, x % 2 === 0);
  metasync.some(arr, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, true);
    test.end();
  });
});

metatests.test('successful some / set', test => {
  const set = new Set([1, 2, 3, 4, 5]);

  const predicate = (x, callback) => callback(null, x % 2 === 0);
  metasync.some(set, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, true);
    test.end();
  });
});

metatests.test('successful some / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);

  const predicate = (x, callback) => callback(null, x[0] % 2 === 0);
  metasync.some(map, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, true);
    test.end();
  });
});

metatests.test('successful some / string', test => {
  const string = 'abcdeeef12343';

  const predicate = (x, callback) => callback(null, x === 'e');
  metasync.some(string, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, true);
    test.end();
  });
});

metatests.test('failing some / array', test => {
  const arr = [1, 2, 3];

  const predicate = (x, callback) => callback(null, x > 3);
  metasync.some(arr, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('failing some / set', test => {
  const set = new Set([1, 2, 3, 4, 5]);

  const predicate = (x, callback) => callback(null, x > 6);
  metasync.some(set, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('failing some / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);

  const predicate = (x, callback) => callback(null, x[0] > 3);
  metasync.some(map, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('failing some / string', test => {
  const string = 'abcdeeef12343';

  const predicate = (x, callback) => callback(null, x === 'u');
  metasync.some(string, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('some with empty / array', test => {
  const arr = [];

  const predicate = (x, callback) => callback(null, x > 3);
  metasync.some(arr, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('some with empty / set', test => {
  const set = new Set();

  const predicate = (x, callback) => callback(null, x > 3);
  metasync.some(set, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('some with empty / map', test => {
  const map = new Map();

  const predicate = (x, callback) => callback(null, x[0] > 3);
  metasync.some(map, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('some with empty / string', test => {
  const string = '';

  const predicate = (x, callback) => callback(null, x === 'e');
  metasync.some(string, predicate, (err, accepted) => {
    test.error(err);
    test.strictSame(accepted, false);
    test.end();
  });
});

metatests.test('erroneous some', test => {
  const arr = [1, 2, 3];
  const someError = new Error('Some error');

  const predicate = (x, callback) =>
    x % 2 === 0 ? callback(someError) : callback(null, false);
  metasync.some(arr, predicate, (err, accepted) => {
    test.strictSame(err, someError);
    test.strictSame(accepted, undefined);
    test.end();
  });
});
