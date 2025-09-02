BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@humanfs\core\README.md
---- DIFF ----
# `@humanfs/core`
by [Nicholas C. Zakas](https://humanwhocodes.com)
If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.
## Description
The core functionality for humanfs that is shared across all implementations for all runtimes. The contents of this package are intentionally runtime agnostic and are not intended to be used alone.
Currently, this package simply exports the `Hfs` class, which is an abstract base class intended to be inherited from in runtime-specific hfs packages (like `@humanfs/node`).
> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!
## Installation
### Node.js
Install using your favorite package manager for Node.js:
```shell
npm install @humanfs/core
# or
pnpm install @humanfs/core
# or
yarn add @humanfs/core
# or
bun install @humanfs/core
Then you can import the `Hfs` and `Path` classes like this:
import { Hfs, Path } from "@humanfs/core";
### Deno
Install using [JSR](https://jsr.io):
```shell
deno add @humanfs/core
# or
jsr add @humanfs/core
Then you can import the `Hfs` class like this:
```js
import { Hfs, Path } from "@humanfs/core";
```
### Browser
It's recommended to import the minified version to save bandwidth:
```js
import { Hfs, Path } from "https://cdn.skypack.dev/@humanfs/core?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { Hfs, Path } from "https://cdn.skypack.dev/@humanfs/core";
```


### `Hfs` Class

The `Hfs` class contains all of the basic functionality for an `Hfs` instance *without* a predefined impl. This class is mostly used for creating runtime-specific impls, such as `NodeHfs` and `DenoHfs`.

You can create your own instance by providing an `impl` directly:

```js
const hfs = new Hfs({ impl: { async text() {} }});
```

The specified `impl` becomes the base impl for the instance, meaning you can always reset back to it using `resetImpl()`.

You can also inherit from `Hfs` to create your own class with a preconfigured impl, such as:

```js
class MyHfs extends Hfs {
	constructor() {
		super({
			impl: myImpl
		});
	}
}
```

### `Path` Class

The `Path` class represents the path to a directory or file within a file system. It's an abstract representation that can be used even outside of traditional file systems where string paths might not make sense.

```js
const myPath = new Path(["dir", "subdir"]);
console.log(myPath.toString());		// "dir/subdir"

// add another step
myPath.push("file.txt");
console.log(myPath.toString());		// "dir/subdir/file.txt"

// get just the last step
console.log(myPath.name);			// "file.txt"

// change just the last step
myPath.name = "file.json";
console.log(myPath.name);			// "file.json"
console.log(myPath.toString());		// "dir/subdir/file.json"

// get the size of the path
console.log(myPath.size);			// 3

// remove the last step
myPath.pop();
console.log(myPath.toString());		// "dir/subdir"

// iterate over the steps
for (const step of myPath) {
	// do something
}

// create a new path from a string
const newPath = Path.fromString("/foo/bar");
```

## License

Apache 2.0

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
