BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\http-errors\README.md
---- DIFF ----
# http-errors
[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][node-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]
Create HTTP errors for Express, Koa, Connect, etc. with ease.
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```console
$ npm install http-errors
## Example
var createError = require('http-errors')
var express = require('express')
var app = express()
app.use(function (req, res, next) {
  if (!req.user) return next(createError(401, 'Please login to view this page.'))
  next()
})
This is the current API, currently extracted from Koa and subject to change.
### Error Properties
- `expose` - can be used to signal if `message` should be sent to the client,
  defaulting to `false` when `status` >= 500
- `headers` - can be an object of header names to values to be sent to the
  client, defaulting to `undefined`. When defined, the key names should all
  be lower-cased
- `message` - the traditional error message, which should be kept short and all
  single line
- `status` - the status code of the error, mirroring `statusCode` for general
  compatibility
- `statusCode` - the status code of the error, defaulting to `500`
### createError([status], [message], [properties])
Create a new error object with the given message `msg`.
The error object inherits from `createError.HttpError`.
```js
var err = createError(404, 'This video does not exist!')
- `status: 500` - the status code as a number
- `message` - the message of the error, defaulting to node's text for that status code.
- `properties` - custom properties to attach to the object
### createError([status], [error], [properties])
Extend the given `error` object with `createError.HttpError`
properties. This will not alter the inheritance of the given
`error` object, and the modified `error` object is the
return value.
<!-- eslint-disable no-redeclare -->
```js
fs.readFile('foo.txt', function (err, buf) {
  if (err) {
    if (err.code === 'ENOENT') {
      var httpError = createError(404, err, { expose: false })
    } else {
      var httpError = createError(500, err)
    }
  }
})
```
- `status` - the status code as a number
- `error` - the error object to extend
- `properties` - custom properties to attach to the object
### createError.isHttpError(val)
Determine if the provided `val` is an `HttpError`. This will return `true`
if the error inherits from the `HttpError` constructor of this module or
matches the "duck type" for an error this module creates. All outputs from
the `createError` factory will return `true` for this function, including
if an non-`HttpError` was passed into the factory.
### new createError\[code || name\](\[msg]\))
Create a new error object with the given message `msg`.
The error object inherits from `createError.HttpError`.
```js
var err = new createError.NotFound()
```
- `code` - the status code as a number
- `name` - the name of the error as a "bumpy case", i.e. `NotFound` or `InternalServerError`.
#### List of all constructors

|Status Code|Constructor Name             |
|-----------|-----------------------------|
|400        |BadRequest                   |
|401        |Unauthorized                 |
|402        |PaymentRequired              |
|403        |Forbidden                    |
|404        |NotFound                     |
|405        |MethodNotAllowed             |
|406        |NotAcceptable                |
|407        |ProxyAuthenticationRequired  |
|408        |RequestTimeout               |
|409        |Conflict                     |
|410        |Gone                         |
|411        |LengthRequired               |
|412        |PreconditionFailed           |
|413        |PayloadTooLarge              |
|414        |URITooLong                   |
|415        |UnsupportedMediaType         |
|416        |RangeNotSatisfiable          |
|417        |ExpectationFailed            |
|418        |ImATeapot                    |
|421        |MisdirectedRequest           |
|422        |UnprocessableEntity          |
|423        |Locked                       |
|424        |FailedDependency             |
|425        |TooEarly                     |
|426        |UpgradeRequired              |
|428        |PreconditionRequired         |
|429        |TooManyRequests              |
|431        |RequestHeaderFieldsTooLarge  |
|451        |UnavailableForLegalReasons   |
|500        |InternalServerError          |
|501        |NotImplemented               |
|502        |BadGateway                   |
|503        |ServiceUnavailable           |
|504        |GatewayTimeout               |
|505        |HTTPVersionNotSupported      |
|506        |VariantAlsoNegotiates        |
|507        |InsufficientStorage          |
|508        |LoopDetected                 |
|509        |BandwidthLimitExceeded       |
|510        |NotExtended                  |
|511        |NetworkAuthenticationRequired|

## License

[MIT](LICENSE)

[ci-image]: https://badgen.net/github/checks/jshttp/http-errors/master?label=ci
[ci-url]: https://github.com/jshttp/http-errors/actions?query=workflow%3Aci
[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/http-errors/master
[coveralls-url]: https://coveralls.io/r/jshttp/http-errors?branch=master
[node-image]: https://badgen.net/npm/node/http-errors
[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/http-errors
[npm-url]: https://npmjs.org/package/http-errors
[npm-version-image]: https://badgen.net/npm/v/http-errors
[travis-image]: https://badgen.net/travis/jshttp/http-errors/master
[travis-url]: https://travis-ci.org/jshttp/http-errors

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
