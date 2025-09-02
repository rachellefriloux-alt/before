BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@humanfs\node\README.md
---- DIFF ----
# `@humanfs/node`
by [Nicholas C. Zakas](https://humanwhocodes.com)
If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.
## Description
The `hfs` bindings for use in Node.js and Node.js-compatible runtimes.
> [!WARNING]
> This project is **experimental** and may change significantly before v1.0.0. Use at your own caution and definitely not in production!
## Installation
Install using your favorite package manager:
```shell
npm install @humanfs/node
# or
pnpm install @humanfs/node
# or
yarn add @humanfs/node
# or
bun install @humanfs/node
The easiest way to use hfs in your project is to import the `hfs` object:
import { hfs } from "@humanfs/node";
Then, you can use the API methods:
```js
// 1. Files
// read from a text file
const text = await hfs.text("file.txt");
// read from a JSON file
const json = await hfs.json("file.json");
// read raw bytes from a text file
const arrayBuffer = await hfs.arrayBuffer("file.txt");
// write text to a file
await hfs.write("file.txt", "Hello world!");
// write bytes to a file
await hfs.write("file.txt", new TextEncoder().encode("Hello world!"));
// append text to a file
await hfs.append("file.txt", "Hello world!");
// append bytes to a file
await hfs.append("file.txt", new TextEncoder().encode("Hello world!"));
// does the file exist?
const found = await hfs.isFile("file.txt");
// how big is the file?
const size = await hfs.size("file.txt");

// when was the file modified?
const mtime = await hfs.lastModified("file.txt");

// copy a file from one location to another
await hfs.copy("file.txt", "file-copy.txt");

// move a file from one location to another
await hfs.move("file.txt", "renamed.txt");

// delete a file
await hfs.delete("file.txt");

// 2. Directories

// create a directory
await hfs.createDirectory("dir");

// create a directory recursively
await hfs.createDirectory("dir/subdir");

// does the directory exist?
const dirFound = await hfs.isDirectory("dir");

// copy the entire directory
hfs.copyAll("from-dir", "to-dir");

// move the entire directory
hfs.moveAll("from-dir", "to-dir");

// delete a directory
await hfs.delete("dir");

// delete a non-empty directory
await hfs.deleteAll("dir");

If you'd like to create your own instance, import the `NodeHfs` constructor:

```js
import { NodeHfs } from "@humanfs/node";
import fsp from "fs/promises";

const hfs = new NodeHfs();

// optionally specify the fs/promises object to use
const hfs = new NodeHfs({ fsp });
```

If you'd like to use just the impl, import the `NodeHfsImpl` constructor:

```js
import { NodeHfsImpl } from "@humanfs/node";
import fsp from "fs/promises";

const hfs = new NodeHfsImpl();

// optionally specify the fs/promises object to use
const hfs = new NodeHfsImpl({ fsp });
```

## Errors Handled

* `ENOENT` - in most cases, these errors are handled silently.
* `ENFILE` and `EMFILE` - calls that result in these errors are retried for up to 60 seconds before giving up for good.

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
