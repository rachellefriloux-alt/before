BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\get-proto\README.md
---- DIFF ----
# get-proto <sup>[![Version Badge][npm-version-svg]][package-url]</sup>
[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![npm badge][npm-badge-png]][package-url]
Robustly get the [[Prototype]] of an object. Uses the best available method.
## Getting started
```sh
npm install --save get-proto
## Usage/Examples
const assert = require('assert');
const getProto = require('get-proto');
const a = { a: 1, b: 2, [Symbol.toStringTag]: 'foo' };
const b = { c: 3, __proto__: a };
assert.equal(getProto(b), a);
assert.equal(getProto(a), Object.prototype);
assert.equal(getProto({ __proto__: null }), null);
## Tests
Clone the repo, `npm install`, and run `npm test`
[package-url]: https://npmjs.org/package/get-proto
[npm-version-svg]: https://versionbadg.es/ljharb/get-proto.svg
[deps-svg]: https://david-dm.org/ljharb/get-proto.svg
[deps-url]: https://david-dm.org/ljharb/get-proto
[dev-deps-svg]: https://david-dm.org/ljharb/get-proto/dev-status.svg
[dev-deps-url]: https://david-dm.org/ljharb/get-proto#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/get-proto.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/get-proto.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/get-proto.svg
[downloads-url]: https://npm-stat.com/charts.html?package=get-proto
[codecov-image]: https://codecov.io/gh/ljharb/get-proto/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/ljharb/get-proto/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/ljharb/get-proto
[actions-url]: https://github.com/ljharb/get-proto/actions
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
## Usage
const Queue = require('yocto-queue');
const queue = new Queue();
queue.enqueue('🦄');
queue.enqueue('🌈');
console.log(queue.size);
//=> 2
console.log(...queue);
//=> '🦄 🌈'

console.log(queue.dequeue());
//=> '🦄'
console.log(queue.dequeue());
//=> '🌈'
```

## API

### `queue = new Queue()`

The instance is an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols), which means you can iterate over the queue front to back with a “for…of” loop, or use spreading to convert the queue to an array. Don't do this unless you really need to though, since it's slow.

#### `.enqueue(value)`

Add a value to the queue.

#### `.dequeue()`

Remove the next value in the queue.
Returns the removed value or `undefined` if the queue is empty.

#### `.clear()`

Clear the queue.

#### `.size`

The size of the queue.

## Related

- [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple “Least Recently Used” (LRU) cache

