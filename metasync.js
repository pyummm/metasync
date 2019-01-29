'use strict';

const common = require('@metarhia/common');
const nodeVerion = common.between(process.version, 'v', '.');

const submodules = [
  'adapters', // Adapters to convert different async contracts
  'array', // Array utilities
  'control', // Control flow utilities
  'do', // Simple chain/do
  'fp', // Async utils for functional programming
  'poolify', // Create pool from factory
  'throttle', // Throttling utilities
].map(path => require('./lib/' + path));

// Process arrays sync and async array in chain
const { forArrayChain } = require('./lib/chain.js');

const { collect } = require('./lib/collector.js'); // DataCollector
const { compose } = require('./lib/composition.js'); // Unified abstraction
const { memoize } = require('./lib/memoize.js'); // Async memoization
const { queue } = require('./lib/queue.js'); // Concurrent queue

if (nodeVerion >= 10) {
  submodules.push(require('./lib/async-iterator'));
}

module.exports = Object.assign(
  compose,
  ...submodules,
  { collect },
  { compose },
  { memoize },
  { queue },
  { for: forArrayChain }
);
