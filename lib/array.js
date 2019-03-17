'use strict';

const common = require('@metarhia/common');

const copy = name => {
  switch (name) {
    case 'Set':
      return new Set();
    case 'Map':
      return new Map();
    case 'Array':
      return [];
    case 'String':
      return '';
  }
  return null;
};

// Asynchronous map (iterate parallel)
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in the array
//     current - <any>, current element being processed in the array
//     callback - <Function>
//       err - <Error> | <null>
//       value - <any>
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <Array>
const map = (
  // Asynchronous map (iterate parallel)
  items, // array, incoming
  fn, // function, (current, callback) => callback(err, value)
  //   to be executed for each value in the array
  //   current - current element being processed in the array
  //   callback - function(err, value)
  done // function (optional), on done callback function(err, result)
) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  const name = items.constructor.name;
  let result = copy(name);
  if (!len) {
    done(null, result);
    return;
  }
  let errored = false;
  let count = 0;
  const data = items[Symbol.iterator]();

  const next = (err, value) => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    if (name === 'Array') result.push(value);
    else if (name === 'Set') result.add(value);
    else if (name === 'Map') result.set(value[0], value[1]);
    else result += value;
    count++;
    if (count === len) done(null, result);
  };

  let i = 0;
  while (i < len) {
    const item = data.next();
    fn(item.value, next);
    i++;
  }
};

const DEFAULT_OPTIONS = { min: 5, percent: 0.7 };

// Non-blocking synchronous map
//   items - <Array>, incoming dataset
//   fn - <Function>
//     item - <any>
//     index - <number>
//   options - <Object>, map params { min, percent }
//     min - <number>, min number of items in one next call
//     percent - <number>, ratio of map time to all time
//   done - <Function>, call on done
//     err - <Error> | <null>
//     result - <Array>
const asyncMap = (items, fn, options = {}, done) => {
  if (typeof options === 'function') {
    done = options;
    options = DEFAULT_OPTIONS;
  }

  const len = items.length || items.size;
  const name = items.constructor.name;
  let result = done ? copy(name) : null;
  const data = items[Symbol.iterator]();

  if (!len) {
    if (done) done(null, result);
    return;
  }

  const min = options.min || DEFAULT_OPTIONS.min;
  const percent = options.percent || DEFAULT_OPTIONS.percent;

  let begin;
  let sum = 0;
  let count = 0;

  const ratio = percent / (1 - percent);

  const countNumber = () => {
    const loopTime = Date.now() - begin;
    const itemTime = sum / count;
    const necessaryNumber = (ratio * loopTime) / itemTime;
    return Math.max(necessaryNumber, min);
  };

  const next = () => {
    const itemsNumber = count ? countNumber() : min;
    const iterMax = Math.min(len, itemsNumber + count);

    begin = Date.now();
    for (; count < iterMax; count++) {
      const itemResult = fn(data.next().value, count);
      if (done) {
        if (name === 'Array') result.push(itemResult);
        else if (name === 'Set') result.add(itemResult);
        else if (name === 'Map') result.set(itemResult[0], itemResult[1]);
        else result += itemResult;
      }
    }
    sum += Date.now() - begin;

    if (count < len) {
      begin = Date.now();
      setTimeout(next, 0);
    } else if (done) {
      done(null, result);
    }
  };

  next();
};

// Asynchrous filter (iterate parallel)
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in the array
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <Array>
const filter = (items, fn, done) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  const data = items[Symbol.iterator]();
  const name = items.constructor.name;
  let result = copy(name);

  if (!len) {
    done(null, result);
    return;
  }

  let count = 0;

  const next = (value, err, accepted) => {
    if (accepted && !err) {
      if (name === 'Array') result.push(value);
      else if (name === 'Set') result.add(value);
      else if (name === 'Map') result.set(value[0], value[1]);
      else result += value;
    }
    count++;
    if (count === len) {
      done(null, result);
    }
  };

  let i = 0;
  while (i < len) {
    const item = data.next();
    fn(item.value, next.bind(null, item.value));
    i++;
  }
};

const REDUCE_EMPTY_ARR =
  'Metasync: reduce of empty array with no initial value';

// Asynchronous reduce
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in array
//     previous - <any>, value previously returned in the last iteration
//     current - <any>, current element being processed in the array
//     callback - <Function>, callback for returning value
//         back to reduce function
//       err - <Error> | <null>
//       data - <any>, resulting value
//     counter - <number>, index of the current element
//         being processed in array
//     items - <Array>, the array reduce was called upon
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <Array>
//   initial - <any>, optional value to be used as first
//       argument in first iteration
const reduce = (items, fn, done, initial) => {
  done = done || common.emptyness;
  const len = items.length || items.size || 0;
  items = [...items];
  const hasInitial = typeof initial !== 'undefined';

  if (len === 0 && !hasInitial) {
    done(new TypeError(REDUCE_EMPTY_ARR), initial);
    return;
  }

  let previous = hasInitial ? initial : items[0];
  if ((len === 0 && hasInitial) || (len === 1 && !hasInitial)) {
    done(null, previous);
    return;
  }

  let count = hasInitial ? 0 : 1;
  let current = items[count];
  const last = len - 1;

  const next = (err, data) => {
    if (err) {
      done(err);
      return;
    }
    if (count === last) {
      done(null, data);
      return;
    }
    count++;
    previous = data;
    current = items[count];
    fn(previous, current, next, count, items);
  };

  fn(previous, current, next, count, items);
};

const REDUCE_RIGHT_EMPTY_ARR =
  'Metasync: reduceRight of empty array with no initial value';

// Asynchronous reduceRight
//   items - <Array>, incoming
//   fn - <Function>, to be executed for each value in array
//     previous - <any>, value previously returned in the last iteration
//     current - <any>, current element being processed in the array
//     callback - <Function>, callback for returning value
//         back to reduce function
//       err - <Error> | <null>
//       data - <any>, resulting value
//     counter - <number>, index of the current element
//         being processed in array
//     items - <Array>, the array reduce was called upon
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <Array>
//   initial - <any>, optional value to be used as first
//       argument in first iteration
const reduceRight = (items, fn, done, initial) => {
  done = done || common.emptyness;
  const len = items.length || items.size || 0;
  items = [...items];
  const hasInitial = typeof initial !== 'undefined';

  if (len === 0 && !hasInitial) {
    done(new TypeError(REDUCE_RIGHT_EMPTY_ARR), initial);
    return;
  }

  let previous = hasInitial ? initial : items[len - 1];
  if ((len === 0 && hasInitial) || (len === 1 && !hasInitial)) {
    done(null, previous);
    return;
  }

  let count = hasInitial ? len - 1 : len - 2;
  let current = items[count];
  const last = 0;

  const next = (err, data) => {
    if (err) {
      done(err);
      return;
    }
    if (count === last) {
      done(null, data);
      return;
    }
    count--;
    previous = data;
    current = items[count];
    fn(previous, current, next, count, items);
  };

  fn(previous, current, next, count, items);
};

// Asynchronous each (iterate in parallel)
//   items - <Array>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     items - <Array>
const each = (
  // Asynchronous each (iterate in parallel)
  items, // array, incoming
  fn, // function, (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback function(err)
  done // function (optional), on done callback function(err, items)
) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  if (!len) {
    done(null, items);
    return;
  }
  let count = 0;
  let errored = false;

  const next = err => {
    if (errored) return;
    if (err) {
      errored = true;
      done(err);
      return;
    }
    count++;
    if (count === len) done(null);
  };

  for (const item of items) fn(item, next);
};

// Asynchronous series
//   items - <Array>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     items - <Array>
const series = (
  // Asynchronous series
  items, // array, incoming
  fn, // function, (value, callback) => callback(err)
  //   value - item from items array
  //   callback - callback (err)
  done // function (optional), on done callback (err, items)
) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  const data = items[Symbol.iterator]();
  let i = -1;

  const next = () => {
    i++;
    if (i === len) {
      done(null, items);
      return;
    }
    fn(data.next().value, err => {
      if (err) {
        done(err);
        return;
      }
      setImmediate(next);
    });
  };
  next();
};

// Asynchronous find (iterate in series)
//   items - <Array>, incoming
//   fn - <Function>,
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <any>
const find = (items, fn, done) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  const data = items[Symbol.iterator]();
  if (!len) {
    done();
    return;
  }
  let finished = false;
  const last = len - 1;

  const next = (index, item, err, accepted) => {
    if (finished) return;
    if (err) {
      finished = true;
      done(err);
      return;
    }
    if (accepted) {
      finished = true;
      done(null, item);
      return;
    }
    if (index === last) done(null);
  };

  for (let i = 0; i < len; i++) {
    const item = data.next().value;
    fn(item, next.bind(null, i, item));
  }
};

// Asynchronous every
//   items - <Array>, incoming
//   fn - <Function>,
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done, optional
//     err - <Error> | <null>
//     result - <boolean>
const every = (
  // Asynchronous every
  items, // array, incoming
  fn, // function, (value, callback) => callback(err, fits)
  //   value - item from items array
  //   callback - callback function(err, fits)
  done // function, optional on done callback function(err, result)
) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  if (!len) {
    done(null, true);
    return;
  }
  let proceedItemsCount = 0;

  const finish = (err, accepted) => {
    if (!done) return;
    if (err || !accepted) {
      done(err, false);
      done = null;
      return;
    }
    proceedItemsCount++;
    if (proceedItemsCount === len) done(null, true);
  };
  for (const item of items) fn(item, finish);
};

// Asynchronous some (iterate in series)
//   items - <Array>, incoming
//   fn - <Function>
//     value - <any>, item from items array
//     callback - <Function>
//       err - <Error> | <null>
//       accepted - <boolean>
//   done - <Function>, on done
//     err - <Error> | <null>
//     result - <boolean>
const some = (items, fn, done) => {
  done = done || common.emptyness;
  const len = items.length || items.size;
  const data = items[Symbol.iterator]();
  let i = 0;

  const next = () => {
    if (i === len) {
      done(null, false);
      return;
    }
    fn(data.next().value, (err, accepted) => {
      if (err) {
        done(err);
        return;
      }
      if (accepted) {
        done(null, true);
        return;
      }
      i++;
      next();
    });
  };

  if (len > 0) next();
  else done(null, false);
};

module.exports = {
  map,
  filter,
  reduce,
  reduceRight,
  each,
  series,
  find,
  every,
  some,
  asyncMap,
};
