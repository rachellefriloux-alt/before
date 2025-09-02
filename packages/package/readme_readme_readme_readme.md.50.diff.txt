BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\fast-deep-equal\README.md
---- DIFF ----
# fast-deep-equal
The fastest deep equal with ES6 Map, Set and Typed arrays support.
[![Build Status](https://travis-ci.org/epoberezkin/fast-deep-equal.svg?branch=master)](https://travis-ci.org/epoberezkin/fast-deep-equal)
[![npm](https://img.shields.io/npm/v/fast-deep-equal.svg)](https://www.npmjs.com/package/fast-deep-equal)
[![Coverage Status](https://coveralls.io/repos/github/epoberezkin/fast-deep-equal/badge.svg?branch=master)](https://coveralls.io/github/epoberezkin/fast-deep-equal?branch=master)
```bash
npm install fast-deep-equal
## Features
- ES5 compatible
- works in node.js (8+) and browsers (IE9+)
- checks equality of Date and RegExp objects by value.
ES6 equal (`require('fast-deep-equal/es6')`) also supports:
- Maps
- Sets
- Typed arrays
```javascript
var equal = require('fast-deep-equal');
console.log(equal({foo: 'bar'}, {foo: 'bar'})); // true
To support ES6 Maps, Sets and Typed arrays equality use:
```javascript
var equal = require('fast-deep-equal/es6');
console.log(equal(Int16Array([1, 2]), Int16Array([1, 2]))); // true
To use with React (avoiding the traversal of React elements' _owner
property that contains circular references and is not needed when
comparing the elements - borrowed from [react-fast-compare](https://github.com/FormidableLabs/react-fast-compare)):
```javascript
var equal = require('fast-deep-equal/react');
var equal = require('fast-deep-equal/es6/react');
```
## Performance benchmark
Node.js v12.6.0:
```
fast-deep-equal x 261,950 ops/sec ±0.52% (89 runs sampled)
fast-deep-equal/es6 x 212,991 ops/sec ±0.34% (92 runs sampled)
fast-equals x 230,957 ops/sec ±0.83% (85 runs sampled)
nano-equal x 187,995 ops/sec ±0.53% (88 runs sampled)
shallow-equal-fuzzy x 138,302 ops/sec ±0.49% (90 runs sampled)
underscore.isEqual x 74,423 ops/sec ±0.38% (89 runs sampled)
lodash.isEqual x 36,637 ops/sec ±0.72% (90 runs sampled)
deep-equal x 2,310 ops/sec ±0.37% (90 runs sampled)
deep-eql x 35,312 ops/sec ±0.67% (91 runs sampled)
ramda.equals x 12,054 ops/sec ±0.40% (91 runs sampled)
util.isDeepStrictEqual x 46,440 ops/sec ±0.43% (90 runs sampled)
assert.deepStrictEqual x 456 ops/sec ±0.71% (88 runs sampled)
The fastest is fast-deep-equal
```
To run benchmark (requires node.js 6+):
```bash
npm run benchmark
```
__Please note__: this benchmark runs against the available test cases. To choose the most performant library for your application, it is recommended to benchmark against your data and to NOT expect this benchmark to reflect the performance difference in your application.
## Enterprise support
fast-deep-equal package is a part of [Tidelift enterprise subscription](https://tidelift.com/subscription/pkg/npm-fast-deep-equal?utm_source=npm-fast-deep-equal&utm_medium=referral&utm_campaign=enterprise&utm_term=repo) - it provides a centralised commercial support to open-source software users, in addition to the support provided by software maintainers.
## Security contact

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure. Please do NOT report security vulnerability via GitHub issues.


## License

[MIT](https://github.com/epoberezkin/fast-deep-equal/blob/master/LICENSE)

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
$ npm install yocto-queue
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
