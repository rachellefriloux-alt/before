BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\path-to-regexp\Readme.md
---- DIFF ----
# Path-to-RegExp
> Turn a path string such as `/user/:name` into a regular expression.
[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][build-image]][build-url]
[![Build coverage][coverage-image]][coverage-url]
[![License][license-image]][license-url]
## Installation
npm install path-to-regexp --save
const {
  match,
  pathToRegexp,
  compile,
  parse,
  stringify,
} = require("path-to-regexp");
### Parameters
Parameters match arbitrary strings in a path by matching up to the end of the segment, or up to any proceeding tokens. They are defined by prefixing a colon to the parameter name (`:foo`). Parameter names can use any valid JavaScript identifier, or be double quoted to use other characters (`:"param-name"`).
```js
const fn = match("/:foo/:bar");
fn("/test/route");
//=> { path: '/test/route', params: { foo: 'test', bar: 'route' } }
```
### Wildcard
Wildcard parameters match one or more characters across multiple segments. They are defined the same way as regular parameters, but are prefixed with an asterisk (`*foo`).
```js
const fn = match("/*splat");
fn("/bar/baz");
//=> { path: '/bar/baz', params: { splat: [ 'bar', 'baz' ] } }
```
### Optional
Braces can be used to define parts of the path that are optional.
```js
const fn = match("/users{/:id}/delete");
fn("/users/delete");
//=> { path: '/users/delete', params: {} }
fn("/users/123/delete");
//=> { path: '/users/123/delete', params: { id: '123' } }
```
## Match
The `match` function returns a function for matching strings against a path:
- **path** String or array of strings.
- **options** _(optional)_ (Extends [pathToRegexp](#pathToRegexp) options)
  - **decode** Function for decoding strings to params, or `false` to disable all processing. (default: `decodeURIComponent`)
```js
const fn = match("/foo/:bar");
```
**Please note:** `path-to-regexp` is intended for ordered data (e.g. paths, hosts). It can not handle arbitrarily ordered data (e.g. query strings, URL fragments, JSON, etc).
## PathToRegexp
The `pathToRegexp` function returns a regular expression for matching strings against paths. It
- **path** String or array of strings.
- **options** _(optional)_ (See [parse](#parse) for more options)
  - **sensitive** Regexp will be case sensitive. (default: `false`)
  - **end** Validate the match reaches the end of the string. (default: `true`)
  - **delimiter** The default delimiter for segments, e.g. `[^/]` for `:named` parameters. (default: `'/'`)
  - **trailing** Allows optional trailing delimiter to match. (default: `true`)
```js
const { regexp, keys } = pathToRegexp("/foo/:bar");
```

## Compile ("Reverse" Path-To-RegExp)

The `compile` function will return a function for transforming parameters into a valid path:

- **path** A string.
- **options** (See [parse](#parse) for more options)
  - **delimiter** The default delimiter for segments, e.g. `[^/]` for `:named` parameters. (default: `'/'`)
  - **encode** Function for encoding input strings for output into the path, or `false` to disable entirely. (default: `encodeURIComponent`)

```js
const toPath = compile("/user/:id");

toPath({ id: "name" }); //=> "/user/name"
toPath({ id: "café" }); //=> "/user/caf%C3%A9"

const toPathRepeated = compile("/*segment");

toPathRepeated({ segment: ["foo"] }); //=> "/foo"
toPathRepeated({ segment: ["a", "b", "c"] }); //=> "/a/b/c"

// When disabling `encode`, you need to make sure inputs are encoded correctly. No arrays are accepted.
const toPathRaw = compile("/user/:id", { encode: false });

toPathRaw({ id: "%3A%2F" }); //=> "/user/%3A%2F"
```

## Stringify

Transform `TokenData` (a sequence of tokens) back into a Path-to-RegExp string.

- **data** A `TokenData` instance

```js
const data = new TokenData([
  { type: "text", value: "/" },
  { type: "param", name: "foo" },
]);

const path = stringify(data); //=> "/:foo"
```

## Developers

- If you are rewriting paths with match and compile, consider using `encode: false` and `decode: false` to keep raw paths passed around.
- To ensure matches work on paths containing characters usually encoded, such as emoji, consider using [encodeurl](https://github.com/pillarjs/encodeurl) for `encodePath`.

### Parse

The `parse` function accepts a string and returns `TokenData`, the set of tokens and other metadata parsed from the input string. `TokenData` is can used with `match` and `compile`.

- **path** A string.
- **options** _(optional)_
  - **encodePath** A function for encoding input strings. (default: `x => x`, recommended: [`encodeurl`](https://github.com/pillarjs/encodeurl))

### Tokens

`TokenData` is a sequence of tokens, currently of types `text`, `parameter`, `wildcard`, or `group`.

### Custom path

In some applications, you may not be able to use the `path-to-regexp` syntax, but still want to use this library for `match` and `compile`. For example:

```js
import { TokenData, match } from "path-to-regexp";

const tokens = [
  { type: "text", value: "/" },
  { type: "parameter", name: "foo" },
];
const path = new TokenData(tokens);
const fn = match(path);

fn("/test"); //=> { path: '/test', index: 0, params: { foo: 'test' } }
```

## Errors

An effort has been made to ensure ambiguous paths from previous releases throw an error. This means you might be seeing an error when things worked before.

### Unexpected `?` or `+`

In past releases, `?`, `*`, and `+` were used to denote optional or repeating parameters. As an alternative, try these:

- For optional (`?`), use an empty segment in a group such as `/:file{.:ext}`.
- For repeating (`+`), only wildcard matching is supported, such as `/*path`.
- For optional repeating (`*`), use a group and a wildcard parameter such as `/files{/*path}`.

### Unexpected `(`, `)`, `[`, `]`, etc.

Previous versions of Path-to-RegExp used these for RegExp features. This version no longer supports them so they've been reserved to avoid ambiguity. To use these characters literally, escape them with a backslash, e.g. `"\\("`.

### Missing parameter name

Parameter names must be provided after `:` or `*`, and they must be a valid JavaScript identifier. If you want an parameter name that isn't a JavaScript identifier, such as starting with a number, you can wrap the name in quotes like `:"my-name"`.

### Unterminated quote

Parameter names can be wrapped in double quote characters, and this error means you forgot to close the quote character.

### Express <= 4.x

Path-To-RegExp breaks compatibility with Express <= `4.x` in the following ways:

- The wildcard `*` must have a name, matching the behavior of parameters `:`.
- The optional character `?` is no longer supported, use braces instead: `/:file{.:ext}`.
- Regexp characters are not supported.
- Some characters have been reserved to avoid confusion during upgrade (`()[]?+!`).
- Parameter names now support valid JavaScript identifiers, or quoted like `:"this"`.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/path-to-regexp
[npm-url]: https://npmjs.org/package/path-to-regexp
[downloads-image]: https://img.shields.io/npm/dm/path-to-regexp
[downloads-url]: https://npmjs.org/package/path-to-regexp
[build-image]: https://img.shields.io/github/actions/workflow/status/pillarjs/path-to-regexp/ci.yml?branch=master
[build-url]: https://github.com/pillarjs/path-to-regexp/actions/workflows/ci.yml?query=branch%3Amaster
[coverage-image]: https://img.shields.io/codecov/c/gh/pillarjs/path-to-regexp
[coverage-url]: https://codecov.io/gh/pillarjs/path-to-regexp
[license-image]: http://img.shields.io/npm/l/path-to-regexp.svg?style=flat
[license-url]: LICENSE.md

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
