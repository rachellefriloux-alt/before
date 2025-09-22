BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\import-fresh\readme.md
---- DIFF ----
# import-fresh
> Import a module while bypassing the [cache](https://nodejs.org/api/modules.html#modules_caching)
Useful for testing purposes when you need to freshly import a module.
## ESM
For ESM, you can use this snippet:
const importFresh = moduleName => import(`${moduleName}?${Date.now()}`);
const {default: foo} = await importFresh('foo');
**This snippet causes a memory leak, so only use it for short-lived tests.**
```sh
npm install import-fresh
```js
// foo.js
let i = 0;
module.exports = () => ++i;
```js
const importFresh = require('import-fresh');
require('./foo')();
//=> 1
require('./foo')();
importFresh('./foo')();
//=> 1
importFresh('./foo')();
//=> 1
```
- [clear-module](https://github.com/sindresorhus/clear-module) - Clear a module from the import cache
- [import-from](https://github.com/sindresorhus/import-from) - Import a module from a given path
- [import-cwd](https://github.com/sindresorhus/import-cwd) - Import a module from the current working directory
- [import-lazy](https://github.com/sindresorhus/import-lazy) - Import modules lazily
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


- [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple “Least Recently Used” (LRU) cache

