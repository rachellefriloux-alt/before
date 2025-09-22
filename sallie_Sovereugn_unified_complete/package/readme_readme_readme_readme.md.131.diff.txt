BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\negotiator\README.md
---- DIFF ----
# negotiator
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][github-actions-ci-image]][github-actions-ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]
An HTTP content negotiator for Node.js
## Installation
```sh
$ npm install negotiator
var Negotiator = require('negotiator')
### Accept Negotiation
```js
availableMediaTypes = ['text/html', 'text/plain', 'application/json']
// The negotiator constructor receives a request object
negotiator = new Negotiator(request)
// Let's say Accept header is 'text/html, application/*;q=0.2, image/jpeg;q=0.8'
negotiator.mediaTypes()
// -> ['text/html', 'image/jpeg', 'application/*']
negotiator.mediaTypes(availableMediaTypes)
// -> ['text/html', 'application/json']
negotiator.mediaType(availableMediaTypes)
// -> 'text/html'
You can check a working example at `examples/accept.js`.
#### Methods
##### mediaType()
Returns the most preferred media type from the client.
##### mediaType(availableMediaType)
Returns the most preferred media type from a list of available media types.
##### mediaTypes()
Returns an array of preferred media types ordered by the client preference.
##### mediaTypes(availableMediaTypes)
Returns an array of preferred media types ordered by priority from a list of
available media types.
### Accept-Language Negotiation
```js
negotiator = new Negotiator(request)
availableLanguages = ['en', 'es', 'fr']
// Let's say Accept-Language header is 'en;q=0.8, es, pt'
negotiator.languages()
// -> ['es', 'pt', 'en']

negotiator.languages(availableLanguages)
// -> ['es', 'en']

language = negotiator.language(availableLanguages)
// -> 'es'
```

You can check a working example at `examples/language.js`.

#### Methods

##### language()

Returns the most preferred language from the client.

##### language(availableLanguages)

Returns the most preferred language from a list of available languages.

##### languages()

Returns an array of preferred languages ordered by the client preference.

##### languages(availableLanguages)

Returns an array of preferred languages ordered by priority from a list of
available languages.

### Accept-Charset Negotiation

```js
availableCharsets = ['utf-8', 'iso-8859-1', 'iso-8859-5']

negotiator = new Negotiator(request)

// Let's say Accept-Charset header is 'utf-8, iso-8859-1;q=0.8, utf-7;q=0.2'

negotiator.charsets()
// -> ['utf-8', 'iso-8859-1', 'utf-7']

negotiator.charsets(availableCharsets)
// -> ['utf-8', 'iso-8859-1']

negotiator.charset(availableCharsets)
// -> 'utf-8'
```

You can check a working example at `examples/charset.js`.

#### Methods

##### charset()

Returns the most preferred charset from the client.

##### charset(availableCharsets)

Returns the most preferred charset from a list of available charsets.

##### charsets()

Returns an array of preferred charsets ordered by the client preference.

##### charsets(availableCharsets)

Returns an array of preferred charsets ordered by priority from a list of
available charsets.

### Accept-Encoding Negotiation

```js
availableEncodings = ['identity', 'gzip']

negotiator = new Negotiator(request)

// Let's say Accept-Encoding header is 'gzip, compress;q=0.2, identity;q=0.5'

negotiator.encodings()
// -> ['gzip', 'identity', 'compress']

negotiator.encodings(availableEncodings)
// -> ['gzip', 'identity']

negotiator.encoding(availableEncodings)
// -> 'gzip'
```

You can check a working example at `examples/encoding.js`.

#### Methods

##### encoding()

Returns the most preferred encoding from the client.

##### encoding(availableEncodings)

Returns the most preferred encoding from a list of available encodings.

##### encoding(availableEncodings, { preferred })

Returns the most preferred encoding from a list of available encodings, while prioritizing based on `preferred` array between same-quality encodings.

##### encodings()

Returns an array of preferred encodings ordered by the client preference.

##### encodings(availableEncodings)

Returns an array of preferred encodings ordered by priority from a list of
available encodings.

##### encodings(availableEncodings, { preferred })

Returns an array of preferred encodings ordered by priority from a list of
available encodings, while prioritizing based on `preferred` array between same-quality encodings.

## See Also

The [accepts](https://npmjs.org/package/accepts#readme) module builds on
this module and provides an alternative interface, mime type validation,
and more.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/negotiator.svg
[npm-url]: https://npmjs.org/package/negotiator
[node-version-image]: https://img.shields.io/node/v/negotiator.svg
[node-version-url]: https://nodejs.org/en/download/
[coveralls-image]: https://img.shields.io/coveralls/jshttp/negotiator/master.svg
[coveralls-url]: https://coveralls.io/r/jshttp/negotiator?branch=master
[downloads-image]: https://img.shields.io/npm/dm/negotiator.svg
[downloads-url]: https://npmjs.org/package/negotiator
[github-actions-ci-image]: https://img.shields.io/github/workflow/status/jshttp/negotiator/ci/master?label=ci
[github-actions-ci-url]: https://github.com/jshttp/negotiator/actions/workflows/ci.yml

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
