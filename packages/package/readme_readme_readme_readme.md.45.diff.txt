BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\fast-levenshtein\README.md
---- DIFF ----
# fast-levenshtein - Levenshtein algorithm in Javascript
[![Build Status](https://secure.travis-ci.org/hiddentao/fast-levenshtein.png)](http://travis-ci.org/hiddentao/fast-levenshtein)
[![NPM module](https://badge.fury.io/js/fast-levenshtein.png)](https://badge.fury.io/js/fast-levenshtein)
[![NPM downloads](https://img.shields.io/npm/dm/fast-levenshtein.svg?maxAge=2592000)](https://www.npmjs.com/package/fast-levenshtein)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/hiddentao)
An efficient Javascript implementation of the [Levenshtein algorithm](http://en.wikipedia.org/wiki/Levenshtein_distance) with locale-specific collator support.
## Features
* Works in node.js and in the browser.
* Better performance than other implementations by not needing to store the whole matrix ([more info](http://www.codeproject.com/Articles/13525/Fast-memory-efficient-Levenshtein-algorithm)).
* Locale-sensitive string comparisions if needed.
* Comprehensive test suite and performance benchmark.
* Small: <1 KB minified and gzipped
## Installation
### node.js
Install using [npm](http://npmjs.org/):
```bash
$ npm install fast-levenshtein
### Browser
Using bower:
```bash
$ bower install fast-levenshtein
If you are not using any module loader system then the API will then be accessible via the `window.Levenshtein` object.
## Examples
**Default usage**
```javascript
var levenshtein = require('fast-levenshtein');
var distance = levenshtein.get('back', 'book');   // 2
var distance = levenshtein.get('我愛你', '我叫你');   // 1
**Locale-sensitive string comparisons**
It supports using [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator) for locale-sensitive  string comparisons:
```javascript
var levenshtein = require('fast-levenshtein');
levenshtein.get('mikailovitch', 'Mikhaïlovitch', { useCollator: true});
// 1
```
## Building and Testing
To build the code and run the tests:
```bash
$ npm install -g grunt-cli
$ npm install
$ npm run build
```
## Performance
_Thanks to [Titus Wormer](https://github.com/wooorm) for [encouraging me](https://github.com/hiddentao/fast-levenshtein/issues/1) to do this._
Benchmarked against other node.js levenshtein distance modules (on Macbook Air 2012, Core i7, 8GB RAM):
```bash
Running suite Implementation comparison [benchmark/speed.js]...
>> levenshtein-edit-distance x 234 ops/sec ±3.02% (73 runs sampled)
>> levenshtein-component x 422 ops/sec ±4.38% (83 runs sampled)
>> levenshtein-deltas x 283 ops/sec ±3.83% (78 runs sampled)
>> natural x 255 ops/sec ±0.76% (88 runs sampled)
>> levenshtein x 180 ops/sec ±3.55% (86 runs sampled)
>> fast-levenshtein x 1,792 ops/sec ±2.72% (95 runs sampled)
Benchmark done.
Fastest test is fast-levenshtein at 4.2x faster than levenshtein-component
```
You can run this benchmark yourself by doing:

```bash
$ npm install
$ npm run build
$ npm run benchmark
```

## Contributing

If you wish to submit a pull request please update and/or create new tests for any changes you make and ensure the grunt build passes.

See [CONTRIBUTING.md](https://github.com/hiddentao/fast-levenshtein/blob/master/CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/fast-levenshtein/blob/master/LICENSE.md)

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
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
