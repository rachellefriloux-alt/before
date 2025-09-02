BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\flat-cache\README.md
---- DIFF ----
# flat-cache
> A stupidly simple key/value storage using files to persist the data
[![NPM Version](https://img.shields.io/npm/v/flat-cache.svg?style=flat)](https://npmjs.org/package/flat-cache)
[![tests](https://github.com/jaredwray/flat-cache/actions/workflows/tests.yaml/badge.svg?branch=master)](https://github.com/jaredwray/flat-cache/actions/workflows/tests.yaml)
[![codecov](https://codecov.io/github/jaredwray/flat-cache/branch/master/graph/badge.svg?token=KxR95XT3NF)](https://codecov.io/github/jaredwray/flat-cache)
[![npm](https://img.shields.io/npm/dm/flat-cache)](https://npmjs.com/package/flat-cache)
```bash
npm i --save flat-cache
const flatCache = require('flat-cache');
// loads the cache, if one does not exists for the given
// Id a new one will be prepared to be created
const cache = flatCache.load('cacheId');
// sets a key on the cache
cache.setKey('key', { foo: 'var' });
// get a key from the cache
cache.getKey('key'); // { foo: 'var' }
// fetch the entire persisted object
cache.all(); // { 'key': { foo: 'var' } }
// remove a key
cache.removeKey('key'); // removes a key from the cache
// save it to disk
cache.save(); // very important, if you don't save no changes will be persisted.
// cache.save( true /* noPrune */) // can be used to prevent the removal of non visited keys
// loads the cache from a given directory, if one does
// not exists for the given Id a new one will be prepared to be created
const cache = flatCache.load('cacheId', path.resolve('./path/to/folder'));
// The following methods are useful to clear the cache
// delete a given cache
flatCache.clearCacheById('cacheId'); // removes the cacheId document if one exists.
// delete all cache
flatCache.clearAll(); // remove the cache directory
## Motivation for this module
I needed a super simple and dumb **in-memory cache** with optional disk persistance in order to make
a script that will beutify files with `esformatter` only execute on the files that were changed since the last run.
To make that possible we need to store the `fileSize` and `modificationTime` of the files. So a simple `key/value`
storage was needed and Bam! this module was born.
## Important notes
- If no directory is especified when the `load` method is called, a folder named `.cache` will be created
  inside the module directory when `cache.save` is called. If you're committing your `node_modules` to any vcs, you
  might want to ignore the default `.cache` folder, or specify a custom directory.
- The values set on the keys of the cache should be `stringify-able` ones, meaning no circular references
- All the changes to the cache state are done to memory
- I could have used a timer or `Object.observe` to deliver the changes to disk, but I wanted to keep this module
  intentionally dumb and simple
- Non visited keys are removed when `cache.save()` is called. If this is not desired, you can pass `true` to the save call
  like: `cache.save( true /* noPrune */ )`.
## License
MIT
## Changelog
[changelog](./changelog.md)
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
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
```
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

