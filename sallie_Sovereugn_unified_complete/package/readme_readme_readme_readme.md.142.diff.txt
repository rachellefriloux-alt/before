BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\finalhandler\README.md
---- DIFF ----
# finalhandler
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][github-actions-ci-image]][github-actions-ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]
Node.js function to invoke as the final step to respond to HTTP request.
## Installation
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```sh
$ npm install finalhandler
var finalhandler = require('finalhandler')
### finalhandler(req, res, [options])
Returns function to be invoked as the final step for the given `req` and `res`.
This function is to be invoked as `fn(err)`. If `err` is falsy, the handler will
write out a 404 response to the `res`. If it is truthy, an error response will
be written out to the `res` or `res` will be terminated if a response has already
started.
When an error is written, the following information is added to the response:
  * The `res.statusCode` is set from `err.status` (or `err.statusCode`). If
    this value is outside the 4xx or 5xx range, it will be set to 500.
  * The `res.statusMessage` is set according to the status code.
  * The body will be the HTML of the status code message if `env` is
    `'production'`, otherwise will be `err.stack`.
  * Any headers specified in an `err.headers` object.
The final handler will also unpipe anything from `req` when it is invoked.
#### options.env
By default, the environment is determined by `NODE_ENV` variable, but it can be
overridden by this option.
#### options.onerror
Provide a function to be called with the `err` when it exists. Can be used for
writing errors to a central location without excessive function generation. Called
as `onerror(err, req, res)`.
## Examples
### always 404
```js
var finalhandler = require('finalhandler')
var http = require('http')
var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  done()
})
server.listen(3000)
### perform simple action
```js
var finalhandler = require('finalhandler')
var fs = require('fs')
var http = require('http')
var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  fs.readFile('index.html', function (err, buf) {
    if (err) return done(err)
    res.setHeader('Content-Type', 'text/html')
    res.end(buf)
  })
})
server.listen(3000)
```
### use with middleware-style functions
```js
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

var serve = serveStatic('public')

var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

server.listen(3000)
```

### keep log of all errors

```js
var finalhandler = require('finalhandler')
var fs = require('fs')
var http = require('http')

var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res, { onerror: logerror })

  fs.readFile('index.html', function (err, buf) {
    if (err) return done(err)
    res.setHeader('Content-Type', 'text/html')
    res.end(buf)
  })
})

server.listen(3000)

function logerror (err) {
  console.error(err.stack || err.toString())
}
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/finalhandler.svg
[npm-url]: https://npmjs.org/package/finalhandler
[node-image]: https://img.shields.io/node/v/finalhandler.svg
[node-url]: https://nodejs.org/en/download
[coveralls-image]: https://img.shields.io/coveralls/pillarjs/finalhandler.svg
[coveralls-url]: https://coveralls.io/r/pillarjs/finalhandler?branch=master
[downloads-image]: https://img.shields.io/npm/dm/finalhandler.svg
[downloads-url]: https://npmjs.org/package/finalhandler
[github-actions-ci-image]: https://github.com/pillarjs/finalhandler/actions/workflows/ci.yml/badge.svg
[github-actions-ci-url]: https://github.com/pillarjs/finalhandler/actions/workflows/ci.yml

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
