# Asynchronous Programming Library

[![TravisCI](https://travis-ci.org/metarhia/metasync.svg?branch=master)](https://travis-ci.org/metarhia/metasync)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/60fe108b31614b4191cd557d49112169)](https://www.codacy.com/app/metarhia/metasync)
[![NPM Version](https://badge.fury.io/js/metasync.svg)](https://badge.fury.io/js/metasync)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/metasync.svg)](https://www.npmjs.com/package/metasync)
[![NPM Downloads](https://img.shields.io/npm/dt/metasync.svg)](https://www.npmjs.com/package/metasync)

## Installation

```bash
$ npm install metasync
```

## Asynchronous functions composition
`metasync(fns)(data, done)`
- `fns` - array of callback-last functions, callback contranct err-first
- `data` - input data (optional)
- `done` - err-first callback
- Returns: composed callback-last / err-first function

![composition](https://cloud.githubusercontent.com/assets/4405297/16968374/1b81f160-4e17-11e6-96fa-9d7e2b422396.png)

```js
const composed = metasync(
  [f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]
);
```

- Array of functions gives sequential execution: `[f1, f2, f3]`
- Double brackets array of functions gives parallel execution: `[[f1, f2, f3]]`

_Example:_

```js
const metasync = require('metasync');
const fs = require('fs');

// Data collector (collect keys by count)
const dc = metasync.collect(4);

dc.pick('user', { name: 'Marcus Aurelius' });
fs.readFile('HISTORY.md',
  (err, data) => dc.collect('history', err, data)
);
dc.take('readme', fs.readFile, 'README.md');
setTimeout(() => dc.pick('timer', { date: new Date() }), 1000);

// Key collector (collect certain keys by names)
const kc = metasync
  .collect(['user', 'history', 'readme', 'timer'])
  .timeout(2000)
  .distinct()
  .done((err, data) => console.log(data));

kc.pick('user', { name: 'Marcus Aurelius' });
kc.take('history', fs.readFile, 'HISTORY.md');
kc.take('readme', fs.readFile, 'README.md');
setTimeout(() => kc.pick('timer', { date: new Date() }), 1000);
```

## API

### Interface: adapters

#### callbackify(fn)

- `fn`: [`<Function>`] promise-returning function

_Returns:_ [`<Function>`]

Convert Promise-returning to callback-last / error-first contract


#### asyncify(fn)

- `fn`: [`<Function>`] regular synchronous function

_Returns:_ [`<Function>`] with contract: callback-last / error-first

Convert sync function to callback-last / error-first contract


#### promiseToCallbackLast(promise, callback)

- `promise`: `<Promise>`
- `callback`: [`<Function>`]

Convert Promise to callback-last


#### promisify(fn)

- `fn`: [`<Function>`] callback-last function

_Returns:_ [`<Function>`] Promise-returning function

Convert async function to Promise-returning function


#### promisifySync(fn)

- `fn`: [`<Function>`] regular synchronous function

_Returns:_ [`<Function>`] Promise-returning function

Convert sync function to Promise object


### Interface: array

#### map(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`] to be executed for each value in the array
  - `current`: `<any>` current element being processed in the array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
    - `value`: `<any>`
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<Array>`]

Asynchronous map (iterate parallel)


#### filter(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`] to be executed for each value in the array
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
    - `accepted`: [`<boolean>`]
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<Array>`]

Asynchrous filter (iterate parallel)

_Example:_
```js

metasync.filter(
  ['data', 'to', 'filter'],
  (item, callback) => callback(item.length > 2),
  (err, result) => console.dir(result)
);
```


#### reduce(items, fn, done, initial)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`] to be executed for each value in array
  - `previous`: `<any>` value previously returned in the last iteration
  - `current`: `<any>` current element being processed in the array
  - `callback`: [`<Function>`] callback for returning value back to reduce
        function
    - `err`: [`<Error>`]` | `[`<null>`]
    - `data`: `<any>` resulting value
  - `counter`: [`<number>`] index of the current element being processed in
        array
  - `items`: [`<Array>`] the array reduce was called upon
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<Array>`]
- `initial`: `<any>` optional value to be used as first argument in first
      iteration

Asynchronous reduce


#### reduceRight(items, fn, done, initial)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`] to be executed for each value in array
  - `previous`: `<any>` value previously returned in the last iteration
  - `current`: `<any>` current element being processed in the array
  - `callback`: [`<Function>`] callback for returning value back to reduce
        function
    - `err`: [`<Error>`]` | `[`<null>`]
    - `data`: `<any>` resulting value
  - `counter`: [`<number>`] index of the current element being processed in
        array
  - `items`: [`<Array>`] the array reduce was called upon
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<Array>`]
- `initial`: `<any>` optional value to be used as first argument in first
      iteration

Asynchronous reduceRight


#### each(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `items`: [`<Array>`]

Asynchronous each (iterate in parallel)

_Example:_
```js

metasync.each(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ each: item });
    callback();
  },
  (err, data) => console.dir('each done')
);
```


#### series(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `items`: [`<Array>`]

Asynchronous series

_Example:_
```js

metasync.series(
  ['a', 'b', 'c'],
  (item, callback) => {
    console.dir({ series: item });
    callback();
  },
  (err, data) => {
    console.dir('series done');
  }
);
```


#### find(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
    - `accepted`: [`<boolean>`]
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: `<any>`

Asynchronous find (iterate in series)

_Example:_
```js

metasync.find(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  (item, callback) => (
    callback(null, item % 3 === 0 && item % 5 === 0)
  ),
  (err, result) => {
    console.dir(result);
  }
);
```


#### every(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
    - `accepted`: [`<boolean>`]
- `done`: [`<Function>`] on done, optional
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<boolean>`]

Asynchronous every


#### some(items, fn, done)

- `items`: [`<Array>`] incoming
- `fn`: [`<Function>`]
  - `value`: `<any>` item from items array
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
    - `accepted`: [`<boolean>`]
- `done`: [`<Function>`] on done
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<boolean>`]

Asynchronous some (iterate in series)


#### asyncMap(items, fn, options, done)

- `items`: [`<Array>`] incoming dataset
- `fn`: [`<Function>`]
  - `item`: `<any>`
  - `index`: [`<number>`]
- `options`: [`<Object>`] map params { min, percent }
  - `min`: [`<number>`] min number of items in one next call
  - `percent`: [`<number>`] ratio of map time to all time
- `done`: [`<Function>`] call on done
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: [`<Array>`]

Non-blocking synchronous map


### Interface: async-iterator

#### asyncIter(array)

- `array`: [`<Array>`] start mutations from this data

_Returns:_ [`<AsyncIterator>`]

Create AsyncIterator instance


#### AsyncIterator()



#### AsyncIterator.prototype.constructor()



#### AsyncIterator.prototype.next()



#### AsyncIterator.prototype.count()



#### AsyncIterator.prototype.each()



#### AsyncIterator.prototype.forEach()



#### AsyncIterator.prototype.parallel()



#### AsyncIterator.prototype.every()



#### AsyncIterator.prototype.find()



#### AsyncIterator.prototype.includes()



#### AsyncIterator.prototype.reduce()



#### AsyncIterator.prototype.some()



#### AsyncIterator.prototype.someCount()



#### AsyncIterator.prototype.collectTo()



#### AsyncIterator.prototype.collectWith()



#### AsyncIterator.prototype.join()



#### AsyncIterator.prototype.toArray()



#### AsyncIterator.prototype.map()



#### AsyncIterator.prototype.filter()



#### AsyncIterator.prototype.flat()



#### AsyncIterator.prototype.flatMap()



#### AsyncIterator.prototype.zip()



#### AsyncIterator.prototype.chain()



#### AsyncIterator.prototype.take()



#### AsyncIterator.prototype.takeWhile()



#### AsyncIterator.prototype.skip()



#### AsyncIterator.prototype.throttle()



#### AsyncIterator.prototype.enumerate()



### Interface: chain

#### forArrayChain(array)

- `array`: [`<Array>`] start mutations from this data

_Returns:_ [`<ArrayChain>`]

Create ArrayChain instance


#### ArrayChain()



#### ArrayChain.prototype.constructor()



#### ArrayChain.prototype.execute()



#### ArrayChain.prototype.fetch()



#### ArrayChain.prototype.map()



#### ArrayChain.prototype.filter()



#### ArrayChain.prototype.reduce()



#### ArrayChain.prototype.each()



#### ArrayChain.prototype.series()



#### ArrayChain.prototype.find()



#### ArrayChain.prototype.concat()



#### ArrayChain.prototype.slice()



#### ArrayChain.prototype.includes()



#### ArrayChain.prototype.reverse()



#### ArrayChain.prototype.sort()



#### ArrayChain.prototype.shift()



#### ArrayChain.prototype.unshift()



#### ArrayChain.prototype.push()



#### ArrayChain.prototype.pop()



### Interface: collector

#### collect(expected)

- `expected`: [`<number>`]` | `[`<string[]>`][`<string>`]

_Returns:_ [`<Collector>`]

Create Collector instance


#### Collector()


Data collector


#### Collector.prototype.constructor(expected)

- `expected`: [`<number>`]` | `[`<string[]>`][`<string>`] count or keys

Data collector


#### Collector.prototype.collect(key, err, value)

- `key`: [`<string>`]
- `err`: [`<Error>`]
- `value`: `<any>`

_Returns:_ [`<this>`]

Pick or fail key


#### Collector.prototype.pick(key, value)

- `key`: [`<string>`]
- `value`: `<any>`

_Returns:_ [`<this>`]

Pick key


#### Collector.prototype.fail(key, err)

- `key`: [`<string>`]
- `err`: [`<Error>`]

_Returns:_ [`<this>`]

Fail key


#### Collector.prototype.take(key, fn, args)

- `key`: [`<string>`]
- `fn`: [`<Function>`]
- `args`: [`<Array>`] rest arguments, to be passed in fn

_Returns:_ [`<this>`]

Take method result


#### Collector.prototype.timeout(msec)

- `msec`: [`<number>`]

_Returns:_ [`<this>`]

Set timeout


#### Collector.prototype.done(callback)

- `callback`: [`<Function>`]
  - `err`: [`<Error>`]
  - `data`: `<any>`

_Returns:_ [`<this>`]

Set on done listener


#### Collector.prototype.finalize()



#### Collector.prototype.distinct(value)

- `value`: [`<boolean>`]

_Returns:_ [`<this>`]

Deny or allow unlisted keys


#### Collector.prototype.cancel()



#### Collector.prototype.then()



### Interface: composition

#### compose(flow)

- `flow`: [`<Function[]>`][`<Function>`] callback-last / err-first

_Returns:_ [`<Function>`] composed callback-last / err-first

Asynchronous functions composition

Array of functions gives sequential execution: `[f1, f2, f3]`
Double brackets array of functions gives parallel execution: `[[f1, f2, f3]]`

_Example:_
```js

const composed = metasync(
  [f1, f2, f3, [[f4, f5, [f6, f7], f8]], f9]
);
```


#### Composition()



#### Composition.prototype.constructor()



#### Composition.prototype.on()



#### Composition.prototype.finalize()



#### Composition.prototype.collect()



#### Composition.prototype.parallel()



#### Composition.prototype.sequential()



#### Composition.prototype.then()



#### Composition.prototype.clone()


Clone composed


#### Composition.prototype.pause()


Pause execution


#### Composition.prototype.resume()


Resume execution


#### Composition.prototype.timeout(msec)

- `msec`: [`<number>`]

Set timeout


#### Composition.prototype.cancel()


Cancel execution where possible


### Interface: control

#### firstOf(fns, callback)

- `fns`: [`<Function[]>`][`<Function>`] callback-last / err-first
- `callback`: [`<Function>`] on done, err-first

Executes all asynchronous functions and pass first result to callback


#### parallel(fns, context, callback)

- `fns`: [`<Function[]>`][`<Function>`] callback-last / err-first
- `context`: [`<Object>`] incoming data, optional
- `callback`: [`<Function>`] on done, err-first

Parallel execution

_Example:_
```js

metasync.parallel([f1, f2, f3], (err, data) => {});
```


#### sequential(fns, context, callback)

- `fns`: [`<Function[]>`][`<Function>`] callback-last with err-first contract
- `context`: [`<Object>`] incoming data, optional
- `callback`: [`<Function>`] err-first on done

Sequential execution

_Example:_
```js

metasync.sequential([f1, f2, f3], (err, data) => {});
```


### Interface: do

#### do()



#### do.prototype.constructor()



### Interface: fp

#### toAsync(fn)

- `fn`: [`<Function>`] callback-last / err-first

_Returns:_ [`<Function>`]

Convert synchronous function to asynchronous

Transform function with args arguments and callback
to function with args as separate values and callback


#### asAsync(fn, args)

- `fn`: [`<Function>`] asynchronous
- `args`: [`<Array>`] its arguments

Wrap function adding async chain methods


#### of(args)

- `args`: [`<Array>`]

Applicative f => a -> f a


#### concat(fn1, fn2)

- `fn1`: [`<Function>`]
- `fn2`: [`<Function>`]

Monoid m => a -> a -> a


#### fmap(fn1, f)

- `fn1`: [`<Function>`]
- `f`: [`<Function>`]

Functor f => (a -> b) -> f a -> f b


#### ap(fn, funcA)

- `fn`: [`<Function>`]
- `funcA`: [`<Function>`]

Applicative f => f (a -> b) -> f a -> f b


### Interface: memoize

#### memoize(fn)

- `fn`: [`<Function>`] sync or async

_Returns:_ [`<Function>`] memoized

Create memoized function


#### Memoized()



#### Memoized.prototype.constructor()



#### Memoized.prototype.clear()



#### Memoized.prototype.add()



#### Memoized.prototype.del()



#### Memoized.prototype.get()



#### Memoized.prototype.on(eventName, listener)

- `eventName`: [`<string>`]
- `listener`: [`<Function>`] handler

Add event listener

_Example:_
```js

const collector = new Collector();
collector.on('memoize', (err, data) => { ... });
collector.on('add', (key, err, data) => { ... });
collector.on('del', (key) => { ... })
collector.on('clear', () => { ... })
```


#### Memoized.prototype.emit(eventName, args)

- `eventName`: [`<string>`]
- `args`: `<any>` rest arguments

Emit Collector events


### Interface: poolify

#### poolify()



### Interface: queue

#### queue(concurrency)

- `concurrency`: [`<number>`] simultaneous and asynchronously executing tasks

_Returns:_ [`<Queue>`]

Create Queue instance


#### Queue()


Queue constructor


#### Queue.prototype.constructor(concurrency)

- `concurrency`: [`<number>`] asynchronous concurrency

Queue constructor


#### Queue.prototype.wait(msec)

- `msec`: [`<number>`] wait timeout for single item

_Returns:_ [`<this>`]

Set wait before processing timeout


#### Queue.prototype.throttle(count, interval)

- `count`: [`<number>`] item count
- `interval`: [`<number>`] per interval, optional default: 1000 msec

_Returns:_ [`<this>`]

Throttle to limit throughput


#### Queue.prototype.add(item, factor, priority)

- `item`: [`<Object>`] to be added
- `factor`: [`<number>`]` | `[`<string>`] type, source, destination or path,
      optional
- `priority`: [`<number>`] optional

_Returns:_ [`<this>`]

Add item to queue


#### Queue.prototype.next(task)

- `task`: [`<Array>`] next task [item, factor, priority]

_Returns:_ [`<this>`]

Process next item


#### Queue.prototype.takeNext()


_Returns:_ [`<this>`]

Prepare next item for processing


#### Queue.prototype.pause()


_Returns:_ [`<this>`]

Pause queue

This function is not completely implemented yet


#### Queue.prototype.resume()


_Returns:_ [`<this>`]

Resume queue

This function is not completely implemented yet


#### Queue.prototype.clear()


_Returns:_ [`<this>`]

Clear queue


#### Queue.prototype.timeout(msec, onTimeout)

- `msec`: [`<number>`] process timeout for single item
- `onTimeout`: [`<Function>`]

_Returns:_ [`<this>`]

Set timeout interval and listener


#### Queue.prototype.process(fn)

- `fn`: [`<Function>`]
  - `item`: [`<Object>`]
  - `callback`: [`<Function>`]
    - `err`: [`<Error>`]` | `[`<null>`]
    - `result`: `<any>`

_Returns:_ [`<this>`]

Set processing function


#### Queue.prototype.done(fn)

- `fn`: [`<Function>`] done listener
  - `err`: [`<Error>`]` | `[`<null>`]
  - `result`: `<any>`

_Returns:_ [`<this>`]

Set listener on processing done


#### Queue.prototype.success(listener)

- `listener`: [`<Function>`] on success
  - `item`: `<any>`

_Returns:_ [`<this>`]

Set listener on processing success


#### Queue.prototype.failure(listener)

- `listener`: [`<Function>`] on failure
  - `err`: [`<Error>`]` | `[`<null>`]

_Returns:_ [`<this>`]

Set listener on processing error


#### Queue.prototype.drain(listener)

- `listener`: [`<Function>`] on drain

_Returns:_ [`<this>`]

Set listener on drain Queue


#### Queue.prototype.fifo()


_Returns:_ [`<this>`]

Switch to FIFO mode (default for Queue)


#### Queue.prototype.lifo()


_Returns:_ [`<this>`]

Switch to LIFO mode


#### Queue.prototype.priority(flag)

- `flag`: [`<boolean>`] default: true, false will disable priority mode

_Returns:_ [`<this>`]

Activate or deactivate priority mode


#### Queue.prototype.roundRobin(flag)

- `flag`: [`<boolean>`] default: true, false will disable roundRobin mode

_Returns:_ [`<this>`]

Activate or deactivate round robin mode


#### Queue.prototype.pipe(dest)

- `dest`: [`<Queue>`] destination queue

_Returns:_ [`<this>`]

Pipe processed items to different queue


### Interface: throttle

#### throttle(timeout, fn, args)

- `timeout`: [`<number>`] msec interval
- `fn`: [`<Function>`] to be throttled
- `args`: [`<Array>`] arguments for fn, optional

_Returns:_ [`<Function>`]

Get throttling function, executed once per interval


#### debounce(timeout, fn, args)

- `timeout`: [`<number>`] msec
- `fn`: [`<Function>`] to be debounced
- `args`: [`<Array>`] arguments for fn, optional

Debounce function, delayed execution


#### timeout(timeout, fn, callback)

- `timeout`: [`<number>`] time interval
- `fn`: [`<Function>`] to be executed
- `callback`: [`<Function>`] callback(...args), on done
  - `args`: [`<Array>`]

Set timeout for asynchronous function execution


## Contributors

- Timur Shemsedinov (marcusaurelius)
- See github for full [contributors list](https://github.com/metarhia/metasync/graphs/contributors)


[`<AsyncIterator>`]: https://github.com/metarhia/metasync/blob/master/lib/async-iterator.js
[`<ArrayChain>`]: https://github.com/metarhia/metasync/blob/master/lib/chain.js
[`<Collector>`]: https://github.com/metarhia/metasync/blob/master/lib/collector.js
[`<Queue>`]: https://github.com/metarhia/metasync/blob/master/lib/queue.js
[`<Object>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[`<Function>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[`<Array>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[`<Error>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
[`<boolean>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[`<null>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type
[`<number>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`<string>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[`<this>`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
