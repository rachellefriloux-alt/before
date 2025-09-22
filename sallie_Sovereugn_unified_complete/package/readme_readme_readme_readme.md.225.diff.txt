BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\encodeurl\README.md
---- DIFF ----
# Encode URL
Encode a URL to a percent-encoded form, excluding already-encoded sequences.
## Installation
```sh
npm install encodeurl
var encodeUrl = require('encodeurl')
### encodeUrl(url)
Encode a URL to a percent-encoded form, excluding already-encoded sequences.
This function accepts a URL and encodes all the non-URL code points (as UTF-8 byte sequences). It will not encode the "%" character unless it is not part of a valid sequence (`%20` will be left as-is, but `%foo` will be encoded as `%25foo`).
This encode is meant to be "safe" and does not throw errors. It will try as hard as it can to properly encode the given URL, including replacing any raw, unpaired surrogate pairs with the Unicode replacement character prior to encoding.
## Examples
### Encode a URL containing user-controlled data
```js
var encodeUrl = require('encodeurl')
var escapeHtml = require('escape-html')
http.createServer(function onRequest (req, res) {
  // get encoded form of inbound url
  var url = encodeUrl(req.url)
  // create html message
  var body = '<p>Location ' + escapeHtml(url) + ' not found</p>'
  // send a 404
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('Content-Length', String(Buffer.byteLength(body, 'utf-8')))
  res.end(body, 'utf-8')
})
### Encode a URL for use in a header field
```js
var encodeUrl = require('encodeurl')
var escapeHtml = require('escape-html')
var url = require('url')
http.createServer(function onRequest (req, res) {
  // parse inbound url
  var href = url.parse(req)
  // set new host for redirect
  href.host = 'localhost'
  href.protocol = 'https:'
  href.slashes = true
  // create location header
  var location = encodeUrl(url.format(href))
  // create html message
  var body = '<p>Redirecting to new site: ' + escapeHtml(location) + '</p>'
  // send a 301
  res.statusCode = 301
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('Content-Length', String(Buffer.byteLength(body, 'utf-8')))
  res.setHeader('Location', location)
  res.end(body, 'utf-8')
})
```
## Similarities
This function is _similar_ to the intrinsic function `encodeURI`. However, it will not encode:
* The `\`, `^`, or `|` characters
* The `%` character when it's part of a valid sequence
* `[` and `]` (for IPv6 hostnames)
* Replaces raw, unpaired surrogate pairs with the Unicode replacement character
As a result, the encoding aligns closely with the behavior in the [WHATWG URL specification][whatwg-url]. However, this package only encodes strings and does not do any URL parsing or formatting.
It is expected that any output from `new URL(url)` will not change when used with this package, as the output has already been encoded. Additionally, if we were to encode before `new URL(url)`, we do not expect the before and after encoded formats to be parsed any differently.
## Testing

```sh
$ npm test
$ npm run lint
```

## References

- [RFC 3986: Uniform Resource Identifier (URI): Generic Syntax][rfc-3986]
- [WHATWG URL Living Standard][whatwg-url]

[rfc-3986]: https://tools.ietf.org/html/rfc3986
[whatwg-url]: https://url.spec.whatwg.org/

## License

[MIT](LICENSE)

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
