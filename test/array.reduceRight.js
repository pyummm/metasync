'use strict';

const metasync = require('..');
const metatests = require('metatests');

metatests.test('reduceRight with initial / array', test => {
  const arr = [1, 2, 3, 4, 5];
  const initial = 10;
  const expectedRes = 25;

  metasync.reduceRight(
    arr,
    (prev, cur, callback) => process.nextTick(() => callback(null, prev + cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    },
    initial
  );
});

metatests.test('reduce with initial / set', test => {
  const set = new Set([1, 2, 3, 4, 5]);
  const initial = 10;
  const expectedRes = 25;

  metasync.reduceRight(
    set,
    (prev, cur, callback) => process.nextTick(() => callback(null, prev + cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    },
    initial
  );
});

metatests.test('reduce with initial / map', test => {
  const map = new Map([[1, 'a'], [2, 'b'], [3, 'c']]);
  const initial = 10;
  const expectedRes = '103,c2,b1,a';

  metasync.reduceRight(
    map,
    (prev, cur, callback) => process.nextTick(() => callback(null, prev + cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    },
    initial
  );
});

metatests.test('reduce with initial / string', test => {
  const str = '1111111111';
  const expectedRes = 20;
  const initial = 10;

  metasync.reduceRight(
    str,
    (prev, cur, callback) =>
      process.nextTick(() => callback(null, +prev + +cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    },
    initial
  );
});

metatests.test('reduceRight with initial and empty array', test => {
  const arr = [];
  const initial = 10;
  const expectedRes = 10;

  metasync.reduceRight(
    arr,
    (prev, cur, callback) => process.nextTick(() => callback(null, prev + cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    },
    initial
  );
});

metatests.test('reduceRight without initial and with empty array', test => {
  const arr = [];
  const expectedError = new TypeError(
    'Reduce of empty array with no initial value'
  );

  metasync.reduceRight(
    arr,
    (prev, cur, callback) => process.nextTick(() => callback(null, prev + cur)),
    (err, res) => {
      test.strictSame(err, expectedError);
      test.strictSame(res, undefined);
      test.end();
    }
  );
});

metatests.test(
  'reduceRight without initial and with single-element array',
  test => {
    const arr = [2];

    metasync.reduceRight(
      arr,
      (prev, cur, callback) =>
        process.nextTick(() => callback(null, prev + cur)),
      (err, res) => {
        test.strictSame(err, null);
        test.strictSame(res, 2);
        test.end();
      }
    );
  }
);

metatests.test('reduceRight without initial', test => {
  const arr = [1, 2, 3, 4, 5];
  const expectedRes = 15;

  metasync.reduceRight(
    arr,
    (prev, cur, callback) => process.nextTick(() => callback(null, prev + cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    }
  );
});

metatests.test('reduceRight with asymetric function', test => {
  const arr = '10110011';
  const expectedRes = 205;

  metasync.reduceRight(
    arr,
    (prev, cur, callback) =>
      process.nextTick(() => callback(null, prev * 2 + +cur)),
    (err, res) => {
      test.error(err);
      test.strictSame(res, expectedRes);
      test.end();
    }
  );
});

metatests.test('reduceRight with error', test => {
  const arr = '10120011';
  const reduceError = new Error('Reduce error');

  metasync.reduce(
    arr,
    (prev, cur, callback) =>
      process.nextTick(() => {
        const digit = +cur;
        if (digit > 1) {
          callback(reduceError);
          return;
        }
        callback(null, prev * 2 + digit);
      }),
    (err, res) => {
      test.strictSame(err, reduceError);
      test.strictSame(res, undefined);
      test.end();
    }
  );
});
