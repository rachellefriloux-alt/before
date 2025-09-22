BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\locate-path\readme.md
---- DIFF ----
# locate-path [![Build Status](https://travis-ci.com/sindresorhus/locate-path.svg?branch=master)](https://travis-ci.com/github/sindresorhus/locate-path)
> Get the first path that exists on disk of multiple paths
$ npm install locate-path
Here we find the first file that exists on disk, in array order.
const locatePath = require('locate-path');
const files = [
	'unicorn.png',
	'rainbow.png', // Only this one actually exists on disk
	'pony.png'
];
(async () => {
	console(await locatePath(files));
	//=> 'rainbow'
})();
### locatePath(paths, options?)
Returns a `Promise<string>` for the first path that exists or `undefined` if none exists.
#### paths
Type: `Iterable<string>`
Paths to check.
#### options
Type: `object`
##### concurrency
Type: `number`\
Default: `Infinity`\
Minimum: `1`
Number of concurrently pending promises.
##### preserveOrder
Type: `boolean`\
Default: `true`
Preserve `paths` order when searching.
Disable this to improve performance if you don't care about the order.
##### cwd
Type: `string`\
Default: `process.cwd()`
Current working directory.
##### type
Type: `string`\
Default: `'file'`\
Values: `'file' | 'directory'`

The type of paths that can match.

##### allowSymlinks

Type: `boolean`\
Default: `true`

Allow symbolic links to match if they point to the chosen path type.

### locatePath.sync(paths, options?)

Returns the first path that exists or `undefined` if none exists.

#### paths

Type: `Iterable<string>`

Paths to check.

#### options

Type: `object`

##### cwd

Same as above.

##### type

Same as above.

##### allowSymlinks

Same as above.


- [path-exists](https://github.com/sindresorhus/path-exists) - Check if a path exists

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-locate-path?utm_source=npm-locate-path&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>

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
