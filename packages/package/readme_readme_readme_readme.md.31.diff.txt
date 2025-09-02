BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\json-schema-traverse\README.md
---- DIFF ----
# json-schema-traverse
Traverse JSON Schema passing each schema object to callback
[![Build Status](https://travis-ci.org/epoberezkin/json-schema-traverse.svg?branch=master)](https://travis-ci.org/epoberezkin/json-schema-traverse)
[![npm version](https://badge.fury.io/js/json-schema-traverse.svg)](https://www.npmjs.com/package/json-schema-traverse)
[![Coverage Status](https://coveralls.io/repos/github/epoberezkin/json-schema-traverse/badge.svg?branch=master)](https://coveralls.io/github/epoberezkin/json-schema-traverse?branch=master)
npm install json-schema-traverse
```javascript
const traverse = require('json-schema-traverse');
const schema = {
  properties: {
    foo: {type: 'string'},
    bar: {type: 'integer'}
  }
};
traverse(schema, {cb});
// cb is called 3 times with:
// 1. root schema
// 2. {type: 'string'}
// 3. {type: 'integer'}
// Or:
traverse(schema, {cb: {pre, post}});
// pre is called 3 times with:
// 1. root schema
// 2. {type: 'string'}
// 3. {type: 'integer'}
//
// post is called 3 times with:
// 1. {type: 'string'}
// 2. {type: 'integer'}
// 3. root schema
Callback function `cb` is called for each schema object (not including draft-06 boolean schemas), including the root schema, in pre-order traversal. Schema references ($ref) are not resolved, they are passed as is.  Alternatively, you can pass a `{pre, post}` object as `cb`, and then `pre` will be called before traversing child elements, and `post` will be called after all child elements have been traversed.
Callback is passed these parameters:
- _schema_: the current schema object
- _JSON pointer_: from the root schema to the current schema object
- _root schema_: the schema passed to `traverse` object
- _parent JSON pointer_: from the root schema to the parent schema object (see below)
- _parent keyword_: the keyword inside which this schema appears (e.g. `properties`, `anyOf`, etc.)
- _parent schema_: not necessarily parent object/array; in the example above the parent schema for `{type: 'string'}` is the root schema
- _index/property_: index or property name in the array/object containing multiple schemas; in the example above for `{type: 'string'}` the property name is `'foo'`
## Traverse objects in all unknown keywords
```javascript
const traverse = require('json-schema-traverse');
const schema = {
  mySchema: {
    minimum: 1,
    maximum: 2
  }
};
traverse(schema, {allKeys: true, cb});
// cb is called 2 times with:
// 1. root schema
// 2. mySchema
```
Without option `allKeys: true` callback will be called only with root schema.
## License
[MIT](https://github.com/epoberezkin/json-schema-traverse/blob/master/LICENSE)
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
$ npm install yocto-queue
```js
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

