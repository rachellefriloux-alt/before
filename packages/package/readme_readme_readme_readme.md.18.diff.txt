BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\path-exists\readme.md
---- DIFF ----
# path-exists [![Build Status](https://travis-ci.org/sindresorhus/path-exists.svg?branch=master)](https://travis-ci.org/sindresorhus/path-exists)
> Check if a path exists
NOTE: `fs.existsSync` has been un-deprecated in Node.js since 6.8.0. If you only need to check synchronously, this module is not needed.
While [`fs.exists()`](https://nodejs.org/api/fs.html#fs_fs_exists_path_callback) is being [deprecated](https://github.com/iojs/io.js/issues/103), there's still a genuine use-case of being able to check if a path exists for other purposes than doing IO with it.
Never use this before handling a file though:
> In particular, checking if a file exists before opening it is an anti-pattern that leaves you vulnerable to race conditions: another process may remove the file between the calls to `fs.exists()` and `fs.open()`. Just open the file and handle the error when it's not there.
$ npm install path-exists
// foo.js
const pathExists = require('path-exists');
(async () => {
	console.log(await pathExists('foo.js'));
	//=> true
})();
### pathExists(path)
Returns a `Promise<boolean>` of whether the path exists.
### pathExists.sync(path)
Returns a `boolean` of whether the path exists.
- [path-exists-cli](https://github.com/sindresorhus/path-exists-cli) - CLI for this module
## License
MIT © [Sindre Sorhus](https://sindresorhus.com)
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

