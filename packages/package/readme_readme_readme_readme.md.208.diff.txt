BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\mime-db\README.md
---- DIFF ----
# mime-db
[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][ci-image]][ci-url]
[![Coverage Status][coveralls-image]][coveralls-url]
This is a large database of mime types and information about them.
It consists of a single, public JSON file and does not include any logic,
allowing it to remain as un-opinionated as possible with an API.
It aggregates data from the following sources:
- https://www.iana.org/assignments/media-types/media-types.xhtml
- https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
- https://hg.nginx.org/nginx/raw-file/default/conf/mime.types
## Installation
```bash
npm install mime-db
### Database Download
If you intend to use this in a web browser, you can conveniently access the JSON file via [jsDelivr](https://www.jsdelivr.com/), a popular CDN (Content Delivery Network). To ensure stability and compatibility, it is advisable to specify [a release tag](https://github.com/jshttp/mime-db/tags) instead of using the 'master' branch. This is because the JSON file's format might change in future updates, and relying on a specific release tag will prevent potential issues arising from these changes.
https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json
var db = require('mime-db')
// grab data on .js files
var data = db['application/javascript']
```
## Data Structure
The JSON file is a map lookup for lowercased mime types.
Each mime type has the following properties:
- `.source` - where the mime type is defined.
    If not set, it's probably a custom media type.
    - `apache` - [Apache common media types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)
    - `iana` - [IANA-defined media types](https://www.iana.org/assignments/media-types/media-types.xhtml)
    - `nginx` - [nginx media types](https://hg.nginx.org/nginx/raw-file/default/conf/mime.types)
- `.extensions[]` - known extensions associated with this mime type.
- `.compressible` - whether a file of this type can be gzipped.
- `.charset` - the default charset associated with this type, if any.
If unknown, every property could be `undefined`.
## Note on MIME Type Data and Semver
This package considers the programmatic api as the semver compatibility. This means the MIME type resolution is *not* considered
in the semver bumps. This means that if you want to pin your `mime-db` data you will need to do it in your application. While
this expectation was not set in docs until now, it is how the pacakge operated, so we do not feel this is a breaking change.
## Contributing
The primary way to contribute to this database is by updating the data in
one of the upstream sources. The database is updated from the upstreams
periodically and will pull in any changes.
### Registering Media Types
The best way to get new media types included in this library is to register
them with the IANA. The community registration procedure is outlined in
[RFC 6838 section 5](https://tools.ietf.org/html/rfc6838#section-5). Types
registered with the IANA are automatically pulled into this library.
### Direct Inclusion
If that is not possible / feasible, they can be added directly here as a
"custom" type. To do this, it is required to have a primary source that
definitively lists the media type. If an extension is going to be listed as
associated with this media type, the source must definitively link the
media type and extension as well.
To edit the database, only make PRs against `src/custom-types.json` or
`src/custom-suffix.json`.
The `src/custom-types.json` file is a JSON object with the MIME type as the
keys and the values being an object with the following keys:
- `compressible` - leave out if you don't know, otherwise `true`/`false` to
  indicate whether the data represented by the type is typically compressible.
- `extensions` - include an array of file extensions that are associated with
  the type.
- `notes` - human-readable notes about the type, typically what the type is.
- `sources` - include an array of URLs of where the MIME type and the associated
  extensions are sourced from. This needs to be a [primary source](https://en.wikipedia.org/wiki/Primary_source);
  links to type aggregating sites and Wikipedia are _not acceptable_.
To update the build, run `npm run build`.
[ci-image]: https://badgen.net/github/checks/jshttp/mime-db/master?label=ci
[ci-url]: https://github.com/jshttp/mime-db/actions/workflows/ci.yml
[coveralls-image]: https://badgen.net/coveralls/c/github/jshttp/mime-db/master
[coveralls-url]: https://coveralls.io/r/jshttp/mime-db?branch=master
[node-image]: https://badgen.net/npm/node/mime-db
[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/mime-db
[npm-url]: https://npmjs.org/package/mime-db
[npm-version-image]: https://badgen.net/npm/v/mime-db

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
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
