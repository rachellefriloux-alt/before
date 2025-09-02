BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\file-entry-cache\README.md
---- DIFF ----
# file-entry-cache
> Super simple cache for file metadata, useful for process that work on a given series of files
> and that only need to repeat the job on the changed ones since the previous run of the process — Edit
[![NPM Version](https://img.shields.io/npm/v/file-entry-cache.svg?style=flat)](https://npmjs.org/package/file-entry-cache)
[![tests](https://github.com/jaredwray/file-entry-cache/actions/workflows/tests.yaml/badge.svg?branch=master)](https://github.com/jaredwray/file-entry-cache/actions/workflows/tests.yaml)
[![codecov](https://codecov.io/github/jaredwray/file-entry-cache/graph/badge.svg?token=37tZMQE0Sy)](https://codecov.io/github/jaredwray/file-entry-cache)
[![npm](https://img.shields.io/npm/dm/file-entry-cache)](https://npmjs.com/package/file-entry-cache)
```bash
npm i --save file-entry-cache
The module exposes two functions `create` and `createFromFile`.
## `create(cacheName, [directory, useCheckSum])`
- **cacheName**: the name of the cache to be created
- **directory**: Optional the directory to load the cache from
- **usecheckSum**: Whether to use md5 checksum to verify if file changed. If false the default will be to use the mtime and size of the file.
## `createFromFile(pathToCache, [useCheckSum])`
- **pathToCache**: the path to the cache file (this combines the cache name and directory)
- **useCheckSum**: Whether to use md5 checksum to verify if file changed. If false the default will be to use the mtime and size of the file.
// loads the cache, if one does not exists for the given
// Id a new one will be prepared to be created
var fileEntryCache = require('file-entry-cache');
var cache = fileEntryCache.create('testCache');
var files = expand('../fixtures/*.txt');
// the first time this method is called, will return all the files
var oFiles = cache.getUpdatedFiles(files);
// this will persist this to disk checking each file stats and
// updating the meta attributes `size` and `mtime`.
// custom fields could also be added to the meta object and will be persisted
// in order to retrieve them later
cache.reconcile();
// use this if you want the non visited file entries to be kept in the cache
// for more than one execution
//
// cache.reconcile( true /* noPrune */)
// on a second run
var cache2 = fileEntryCache.create('testCache');
// will return now only the files that were modified or none
// if no files were modified previous to the execution of this function
var oFiles = cache.getUpdatedFiles(files);
// if you want to prevent a file from being considered non modified
// something useful if a file failed some sort of validation
// you can then remove the entry from the cache doing
cache.removeEntry('path/to/file'); // path to file should be the same path of the file received on `getUpdatedFiles`
// that will effectively make the file to appear again as modified until the validation is passed. In that
// case you should not remove it from the cache
// if you need all the files, so you can determine what to do with the changed ones
// you can call
var oFiles = cache.normalizeEntries(files);
// oFiles will be an array of objects like the following
entry = {
  key: 'some/name/file', the path to the file
  changed: true, // if the file was changed since previous run
  meta: {
    size: 3242, // the size of the file
    mtime: 231231231, // the modification time of the file
    data: {} // some extra field stored for this file (useful to save the result of a transformation on the file
  }
}
## Motivation for this module
I needed a super simple and dumb **in-memory cache** with optional disk persistence (write-back cache) in order to make
a script that will beautify files with `esformatter` to execute only on the files that were changed since the last run.
In doing so the process of beautifying files was reduced from several seconds to a small fraction of a second.
This module uses [flat-cache](https://www.npmjs.com/package/flat-cache) a super simple `key/value` cache storage with
optional file persistance.
The main idea is to read the files when the task begins, apply the transforms required, and if the process succeed,
then store the new state of the files. The next time this module request for `getChangedFiles` will return only
the files that were modified. Making the process to end faster.
This module could also be used by processes that modify the files applying a transform, in that case the result of the
transform could be stored in the `meta` field, of the entries. Anything added to the meta field will be persisted.
Those processes won't need to call `getChangedFiles` they will instead call `normalizeEntries` that will return the
entries with a `changed` field that can be used to determine if the file was changed or not. If it was not changed
the transformed stored data could be used instead of actually applying the transformation, saving time in case of only
a few files changed.
In the worst case scenario all the files will be processed. In the best case scenario only a few of them will be processed.
## Important notes
- The values set on the meta attribute of the entries should be `stringify-able` ones if possible, flat-cache uses `circular-json` to try to persist circular structures, but this should be considered experimental. The best results are always obtained with non circular values
- All the changes to the cache state are done to memory first and only persisted after reconcile.

## License

MIT



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
