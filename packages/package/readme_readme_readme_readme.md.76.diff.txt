BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\acorn-jsx\README.md
---- DIFF ----
# Acorn-JSX
[![Build Status](https://travis-ci.org/acornjs/acorn-jsx.svg?branch=master)](https://travis-ci.org/acornjs/acorn-jsx)
[![NPM version](https://img.shields.io/npm/v/acorn-jsx.svg)](https://www.npmjs.org/package/acorn-jsx)
This is plugin for [Acorn](http://marijnhaverbeke.nl/acorn/) - a tiny, fast JavaScript parser, written completely in JavaScript.
It was created as an experimental alternative, faster [React.js JSX](http://facebook.github.io/react/docs/jsx-in-depth.html) parser. Later, it replaced the [official parser](https://github.com/facebookarchive/esprima) and these days is used by many prominent development tools.
## Transpiler
Please note that this tool only parses source code to JSX AST, which is useful for various language tools and services. If you want to transpile your code to regular ES5-compliant JavaScript with source map, check out [Babel](https://babeljs.io/) and [Buble](https://buble.surge.sh/) transpilers which use `acorn-jsx` under the hood.
Requiring this module provides you with an Acorn plugin that you can use like this:
```javascript
var acorn = require("acorn");
var jsx = require("acorn-jsx");
acorn.Parser.extend(jsx()).parse("my(<jsx/>, 'code');");
Note that official spec doesn't support mix of XML namespaces and object-style access in tag names (#27) like in `<namespace:Object.Property />`, so it was deprecated in `acorn-jsx@3.0`. If you still want to opt-in to support of such constructions, you can pass the following option:
```javascript
acorn.Parser.extend(jsx({ allowNamespacedObjects: true }))
Also, since most apps use pure React transformer, a new option was introduced that allows to prohibit namespaces completely:
```javascript
acorn.Parser.extend(jsx({ allowNamespaces: false }))
Note that by default `allowNamespaces` is enabled for spec compliancy.
## License
This plugin is issued under the [MIT license](./LICENSE).
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
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

