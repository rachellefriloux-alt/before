BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\math-intrinsics\README.md
---- DIFF ----
# math-intrinsics <sup>[![Version Badge][npm-version-svg]][package-url]</sup>
[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![npm badge][npm-badge-png]][package-url]
ES Math-related intrinsics and helpers, robustly cached.
 - `abs`
 - `floor`
 - `isFinite`
 - `isInteger`
 - `isNaN`
 - `isNegativeZero`
 - `max`
 - `min`
 - `mod`
 - `pow`
 - `round`
 - `sign`
 - `constants/maxArrayLength`
 - `constants/maxSafeInteger`
 - `constants/maxValue`
## Tests
Simply clone the repo, `npm install`, and run `npm test`
## Security
Please email [@ljharb](https://github.com/ljharb) or see https://tidelift.com/security if you have a potential security vulnerability to report.
[package-url]: https://npmjs.org/package/math-intrinsics
[npm-version-svg]: https://versionbadg.es/es-shims/math-intrinsics.svg
[deps-svg]: https://david-dm.org/es-shims/math-intrinsics.svg
[deps-url]: https://david-dm.org/es-shims/math-intrinsics
[dev-deps-svg]: https://david-dm.org/es-shims/math-intrinsics/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/math-intrinsics#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/math-intrinsics.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/math-intrinsics.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/es-object.svg
[downloads-url]: https://npm-stat.com/charts.html?package=math-intrinsics
[codecov-image]: https://codecov.io/gh/es-shims/math-intrinsics/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/math-intrinsics/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/es-shims/math-intrinsics
[actions-url]: https://github.com/es-shims/math-intrinsics/actions
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
```
$ npm install yocto-queue
```
## Usage
```js
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

