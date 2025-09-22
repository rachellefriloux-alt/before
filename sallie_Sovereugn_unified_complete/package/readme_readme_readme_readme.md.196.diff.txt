BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\toidentifier\README.md
---- DIFF ----
# toidentifier
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][github-actions-ci-image]][github-actions-ci-url]
[![Test Coverage][codecov-image]][codecov-url]
> Convert a string of words to a JavaScript identifier
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```bash
$ npm install toidentifier
## Example
var toIdentifier = require('toidentifier')
console.log(toIdentifier('Bad Request'))
// => "BadRequest"
This CommonJS module exports a single default function: `toIdentifier`.
### toIdentifier(string)
Given a string as the argument, it will be transformed according to
the following rules and the new string will be returned:
1. Split into words separated by space characters (`0x20`).
2. Upper case the first character of each word.
3. Join the words together with no separator.
4. Remove all non-word (`[0-9a-z_]`) characters.
## License
[MIT](LICENSE)
[codecov-image]: https://img.shields.io/codecov/c/github/component/toidentifier.svg
[codecov-url]: https://codecov.io/gh/component/toidentifier
[downloads-image]: https://img.shields.io/npm/dm/toidentifier.svg
[downloads-url]: https://npmjs.org/package/toidentifier
[github-actions-ci-image]: https://img.shields.io/github/workflow/status/component/toidentifier/ci/master?label=ci
[github-actions-ci-url]: https://github.com/component/toidentifier?query=workflow%3Aci
[npm-image]: https://img.shields.io/npm/v/toidentifier.svg
[npm-url]: https://npmjs.org/package/toidentifier
##
[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
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

