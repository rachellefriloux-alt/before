BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\parent-module\readme.md
---- DIFF ----
# parent-module [![Build Status](https://travis-ci.org/sindresorhus/parent-module.svg?branch=master)](https://travis-ci.org/sindresorhus/parent-module)
> Get the path of the parent module
Node.js exposes `module.parent`, but it only gives you the first cached parent, which is not necessarily the actual parent.
$ npm install parent-module
// bar.js
const parentModule = require('parent-module');
module.exports = () => {
	console.log(parentModule());
	//=> '/Users/sindresorhus/dev/unicorn/foo.js'
};
```js
// foo.js
const bar = require('./bar');
bar();
```
### parentModule([filepath])
By default, it will return the path of the immediate parent.
#### filepath
Type: `string`<br>
Default: [`__filename`](https://nodejs.org/api/globals.html#globals_filename)
Filepath of the module of which to get the parent path.
Useful if you want it to work [multiple module levels down](https://github.com/sindresorhus/parent-module/tree/master/fixtures/filepath).
## Tip
Combine it with [`read-pkg-up`](https://github.com/sindresorhus/read-pkg-up) to read the package.json of the parent module.
```js
const path = require('path');
const readPkgUp = require('read-pkg-up');
const parentModule = require('parent-module');
console.log(readPkgUp.sync({cwd: path.dirname(parentModule())}).pkg);
//=> {name: 'chalk', version: '1.0.0', …}
```
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
## Related
- [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple “Least Recently Used” (LRU) cache
