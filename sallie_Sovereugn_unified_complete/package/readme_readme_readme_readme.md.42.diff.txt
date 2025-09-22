BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\flatted\README.md
---- DIFF ----
# flatted
[![Downloads](https://img.shields.io/npm/dm/flatted.svg)](https://www.npmjs.com/package/flatted) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/flatted/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/flatted?branch=main) [![Build Status](https://travis-ci.com/WebReflection/flatted.svg?branch=main)](https://travis-ci.com/WebReflection/flatted) [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC) ![WebReflection status](https://offline.report/status/webreflection.svg)
![snow flake](./flatted.jpg)
<sup>**Social Media Photo by [Matt Seymour](https://unsplash.com/@mattseymour) on [Unsplash](https://unsplash.com/)**</sup>
A super light (0.5K) and fast circular JSON parser, directly from the creator of [CircularJSON](https://github.com/WebReflection/circular-json/#circularjson).
Available also for **[PHP](./php/flatted.php)**.
Available also for **[Python](./python/flatted.py)**.
- - -
## Announcement 📣
There is a standard approach to recursion and more data-types than what JSON allows, and it's part of the [Structured Clone polyfill](https://github.com/ungap/structured-clone/#readme).
Beside acting as a polyfill, its `@ungap/structured-clone/json` export provides both `stringify` and `parse`, and it's been tested for being faster than *flatted*, but its produced output is also smaller than *flatted* in general.
The *@ungap/structured-clone* module is, in short, a drop in replacement for *flatted*, but it's not compatible with *flatted* specialized syntax.
However, if recursion, as well as more data-types, are what you are after, or interesting for your projects/use cases, consider switching to this new module whenever you can 👍
- - -
npm i flatted
Usable via [CDN](https://unpkg.com/flatted) or as regular module.
```js
// ESM
import {parse, stringify, toJSON, fromJSON} from 'flatted';
// CJS
const {parse, stringify, toJSON, fromJSON} = require('flatted');
const a = [{}];
a[0].a = a;
a.push(a);
stringify(a); // [["1","0"],{"a":"0"}]
## toJSON and fromJSON
If you'd like to implicitly survive JSON serialization, these two helpers helps:
```js
import {toJSON, fromJSON} from 'flatted';
class RecursiveMap extends Map {
  static fromJSON(any) {
    return new this(fromJSON(any));
  }
  toJSON() {
    return toJSON([...this.entries()]);
  }
}
const recursive = new RecursiveMap;
const same = {};
same.same = same;
recursive.set('same', same);
const asString = JSON.stringify(recursive);
const asMap = RecursiveMap.fromJSON(JSON.parse(asString));
asMap.get('same') === asMap.get('same').same;
// true
## Flatted VS JSON
As it is for every other specialized format capable of serializing and deserializing circular data, you should never `JSON.parse(Flatted.stringify(data))`, and you should never `Flatted.parse(JSON.stringify(data))`.

The only way this could work is to `Flatted.parse(Flatted.stringify(data))`, as it is also for _CircularJSON_ or any other, otherwise there's no granted data integrity.

Also please note this project serializes and deserializes only data compatible with JSON, so that sockets, or anything else with internal classes different from those allowed by JSON standard, won't be serialized and unserialized as expected.


### New in V1: Exact same JSON API

  * Added a [reviver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Syntax) parameter to `.parse(string, reviver)` and revive your own objects.
  * Added a [replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Syntax) and a `space` parameter to `.stringify(object, replacer, space)` for feature parity with JSON signature.


### Compatibility
All ECMAScript engines compatible with `Map`, `Set`, `Object.keys`, and `Array.prototype.reduce` will work, even if polyfilled.


### How does it work ?
While stringifying, all Objects, including Arrays, and strings, are flattened out and replaced as unique index. `*`

Once parsed, all indexes will be replaced through the flattened collection.

<sup><sub>`*` represented as string to avoid conflicts with numbers</sub></sup>

```js
// logic example
var a = [{one: 1}, {two: '2'}];
a[0].a = a;
// a is the main object, will be at index '0'
// {one: 1} is the second object, index '1'
// {two: '2'} the third, in '2', and it has a string
// which will be found at index '3'

Flatted.stringify(a);
// [["1","2"],{"one":1,"a":"0"},{"two":"3"},"2"]
// a[one,two]    {one: 1, a}    {two: '2'}  '2'
```

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
