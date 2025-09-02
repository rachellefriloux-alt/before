BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\pathval\README.md
---- DIFF ----
<h1 align=center>
  <a href="http://chaijs.com" title="Chai Documentation">
    <img alt="ChaiJS" src="http://chaijs.com/img/chai-logo.png">
  </a>
  <br>
  pathval
</h1>
<p align=center>
   Tool for Object value retrieval given a string path for <a href="http://nodejs.org">node</a> and the browser.
</p>
<p align=center>
  <a href="./LICENSE">
    <img
      alt="license:mit"
      src="https://img.shields.io/badge/license-mit-green.svg?style=flat-square"
    />
  </a>
  <a href="https://github.com/chaijs/pathval/releases">
    <img
      alt="tag:?"
      src="https://img.shields.io/github/tag/chaijs/pathval.svg?style=flat-square"
    />
  </a>
  <a href="https://travis-ci.org/chaijs/pathval">
    <img
      alt="build:?"
      src="https://img.shields.io/travis/chaijs/pathval/master.svg?style=flat-square"
    />
  </a>
  <a href="https://coveralls.io/r/chaijs/pathval">
    <img
      alt="coverage:?"
      src="https://img.shields.io/coveralls/chaijs/pathval/master.svg?style=flat-square"
    />
  </a>
  <a href="https://www.npmjs.com/packages/pathval">
    <img
      alt="npm:?"
      src="https://img.shields.io/npm/v/pathval.svg?style=flat-square"
    />
  </a>
  <a href="https://www.npmjs.com/packages/pathval">
    <img
      alt="dependencies:?"
      src="https://img.shields.io/npm/dm/pathval.svg?style=flat-square"
    />
  </a>
  <a href="">
    <img
      alt="devDependencies:?"
      src="https://img.shields.io/david/chaijs/pathval.svg?style=flat-square"
    />
  </a>
  <br/>
  <a href="https://saucelabs.com/u/chaijs-pathval">
    <img
      alt="Selenium Test Status"
      src="https://saucelabs.com/browser-matrix/chaijs-pathval.svg"
    />
  </a>
  <br>
  <a href="https://chai-slack.herokuapp.com/">
    <img
      alt="Join the Slack chat"
      src="https://img.shields.io/badge/slack-join%20chat-E2206F.svg?style=flat-square"
    />
  </a>
  <a href="https://gitter.im/chaijs/chai">
    <img
      alt="Join the Gitter chat"
      src="https://img.shields.io/badge/gitter-join%20chat-D0104D.svg?style=flat-square"
    />
  </a>
</p>
## What is pathval?
Pathval is a module which you can use to retrieve or set an Object's property for a given `String` path.
## Installation
### Node.js
`pathval` is available on [npm](http://npmjs.org). To install it, type:
    $ npm install pathval
### Browsers
You can also use it within the browser; install via npm and use the `pathval.js` file found within the download. For example:
```html
<script src="./node_modules/pathval/pathval.js"></script>
The primary export of `pathval` is an object which has the following methods:
* `hasProperty(object, name)` - Checks whether an `object` has `name`d property or numeric array index.
* `getPathInfo(object, path)` - Returns an object with info indicating the value of the `parent` of that path, the `name ` of the property we're retrieving and its `value`.
* `getPathValue(object, path)` - Retrieves the value of a property at a given `path` inside an `object`'.
* `setPathValue(object, path, value)` - Sets the `value` of a property at a given `path` inside an `object` and returns the object in which the property has been set.
var pathval = require('pathval');
#### .hasProperty(object, name)
```js
var pathval = require('pathval');
var obj = { prop: 'a value' };
pathval.hasProperty(obj, 'prop'); // true
#### .getPathInfo(object, path)
```js
var pathval = require('pathval');
var obj = { earth: { country: 'Brazil' } };
pathval.getPathInfo(obj, 'earth.country'); // { parent: { country: 'Brazil'  }, name: 'country', value: 'Brazil', exists: true }
```
#### .getPathValue(object, path)
```js
var pathval = require('pathval');
var obj = { earth: { country: 'Brazil' } };
pathval.getPathValue(obj, 'earth.country'); // 'Brazil'
```
#### .setPathValue(object, path, value)
```js
var pathval = require('pathval');
var obj = { earth: { country: 'Brazil' } };
pathval.setPathValue(obj, 'earth.country', 'USA');
obj.earth.country; // 'USA'
```

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
