BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\http-errors\node_modules\statuses\README.md
---- DIFF ----
# statuses
[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]
HTTP status utility for node.
This module provides a list of status codes and messages sourced from
a few different projects:
  * The [IANA Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml)
  * The [Node.js project](https://nodejs.org/)
  * The [NGINX project](https://www.nginx.com/)
  * The [Apache HTTP Server project](https://httpd.apache.org/)
## Installation
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```sh
$ npm install statuses
<!-- eslint-disable no-unused-vars -->
var status = require('statuses')
### status(code)
Returns the status message string for a known HTTP status code. The code
may be a number or a string. An error is thrown for an unknown status code.
<!-- eslint-disable no-undef -->
```js
status(403) // => 'Forbidden'
status('403') // => 'Forbidden'
status(306) // throws
### status(msg)
Returns the numeric status code for a known HTTP status message. The message
is case-insensitive. An error is thrown for an unknown status message.
<!-- eslint-disable no-undef -->
```js
status('forbidden') // => 403
status('Forbidden') // => 403
status('foo') // throws
```
### status.codes
Returns an array of all the status codes as `Integer`s.
### status.code[msg]
Returns the numeric status code for a known status message (in lower-case),
otherwise `undefined`.
<!-- eslint-disable no-undef, no-unused-expressions -->
```js
status['not found'] // => 404
```
### status.empty[code]
Returns `true` if a status code expects an empty body.
<!-- eslint-disable no-undef, no-unused-expressions -->
```js
status.empty[200] // => undefined
status.empty[204] // => true
status.empty[304] // => true
```

### status.message[code]

Returns the string message for a known numeric status code, otherwise
`undefined`. This object is the same format as the
[Node.js http module `http.STATUS_CODES`](https://nodejs.org/dist/latest/docs/api/http.html#http_http_status_codes).

<!-- eslint-disable no-undef, no-unused-expressions -->

```js
status.message[404] // => 'Not Found'
```

### status.redirect[code]

Returns `true` if a status code is a valid redirect status.

<!-- eslint-disable no-undef, no-unused-expressions -->

```js
status.redirect[200] // => undefined
status.redirect[301] // => true
```

### status.retry[code]

Returns `true` if you should retry the rest.

<!-- eslint-disable no-undef, no-unused-expressions -->

```js
status.retry[501] // => undefined
status.retry[503] // => true
```

## License

[MIT](LICENSE)

[ci-image]: https://badgen.net/github/checks/jshttp/statuses/master?label=ci
[ci-url]: https://github.com/jshttp/statuses/actions?query=workflow%3Aci
[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/statuses/master
[coveralls-url]: https://coveralls.io/r/jshttp/statuses?branch=master
[node-version-image]: https://badgen.net/npm/node/statuses
[node-version-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/statuses
[npm-url]: https://npmjs.org/package/statuses
[npm-version-image]: https://badgen.net/npm/v/statuses

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
