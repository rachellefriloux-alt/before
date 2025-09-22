BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@eslint-community\eslint-utils\README.md
---- DIFF ----
# @eslint-community/eslint-utils
[![npm version](https://img.shields.io/npm/v/@eslint-community/eslint-utils.svg)](https://www.npmjs.com/package/@eslint-community/eslint-utils)
[![Downloads/month](https://img.shields.io/npm/dm/@eslint-community/eslint-utils.svg)](http://www.npmtrends.com/@eslint-community/eslint-utils)
[![Build Status](https://github.com/eslint-community/eslint-utils/workflows/CI/badge.svg)](https://github.com/eslint-community/eslint-utils/actions)
[![Coverage Status](https://codecov.io/gh/eslint-community/eslint-utils/branch/main/graph/badge.svg)](https://codecov.io/gh/eslint-community/eslint-utils)
## 🏁 Goal
This package provides utility functions and classes for make ESLint custom rules.
For examples:
-   [`getStaticValue`](https://eslint-community.github.io/eslint-utils/api/ast-utils.html#getstaticvalue) evaluates static value on AST.
-   [`ReferenceTracker`](https://eslint-community.github.io/eslint-utils/api/scope-utils.html#referencetracker-class) checks the members of modules/globals as handling assignments and destructuring.
## 📖 Usage
See [documentation](https://eslint-community.github.io/eslint-utils).
## 📰 Changelog
See [releases](https://github.com/eslint-community/eslint-utils/releases).
## ❤️ Contributing
Welcome contributing!
Please use GitHub's Issues/PRs.
### Development Tools
-   `npm run test-coverage` runs tests and measures coverage.
-   `npm run clean` removes the coverage result of `npm run test-coverage` command.
-   `npm run coverage` shows the coverage result of the last `npm run test-coverage` command.
-   `npm run lint` runs ESLint.
-   `npm run watch` runs tests on each file change.
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

