BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\media-typer\README.md
---- DIFF ----
# media-typer
[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
Simple RFC 6838 media type parser.
This module will parse a given media type into it's component parts, like type,
subtype, and suffix. A formatter is also provided to put them back together and
the two can be combined to normalize media types into a canonical form.
If you are looking to parse the string that represents a media type and it's
parameters in HTTP (for example, the `Content-Type` header), use the
[content-type module](https://www.npmjs.com/package/content-type).
## Installation
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```sh
$ npm install media-typer
<!-- eslint-disable no-unused-vars -->
var typer = require('media-typer')
### typer.parse(string)
<!-- eslint-disable no-undef, no-unused-vars -->
```js
var obj = typer.parse('image/svg+xml')
Parse a media type string. This will return an object with the following
properties (examples are shown for the string `'image/svg+xml; charset=utf-8'`):
 - `type`: The type of the media type (always lower case). Example: `'image'`
 - `subtype`: The subtype of the media type (always lower case). Example: `'svg'`
 - `suffix`: The suffix of the media type (always lower case). Example: `'xml'`
If the given type string is invalid, then a `TypeError` is thrown.
### typer.format(obj)
<!-- eslint-disable no-undef, no-unused-vars -->
```js
var obj = typer.format({ type: 'image', subtype: 'svg', suffix: 'xml' })
```
Format an object into a media type string. This will return a string of the
mime type for the given object. For the properties of the object, see the
documentation for `typer.parse(string)`.
If any of the given object values are invalid, then a `TypeError` is thrown.
### typer.test(string)
<!-- eslint-disable no-undef, no-unused-vars -->
```js
var valid = typer.test('image/svg+xml')
```
Validate a media type string. This will return `true` is the string is a well-
formatted media type, or `false` otherwise.
## License

[MIT](LICENSE)

[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/media-typer/master
[coveralls-url]: https://coveralls.io/r/jshttp/media-typer?branch=master
[node-version-image]: https://badgen.net/npm/node/media-typer
[node-version-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/media-typer
[npm-url]: https://npmjs.org/package/media-typer
[npm-version-image]: https://badgen.net/npm/v/media-typer
[travis-image]: https://badgen.net/travis/jshttp/media-typer/master
[travis-url]: https://travis-ci.org/jshttp/media-typer

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
