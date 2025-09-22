BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@humanwhocodes\module-importer\README.md
---- DIFF ----
# ModuleImporter
by [Nicholas C. Zakas](https://humanwhocodes.com)
If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate).
## Description
A utility for seamlessly importing modules in Node.js regardless if they are CommonJS or ESM format. Under the hood, this uses `import()` and relies on Node.js's CommonJS compatibility to work correctly. This ensures that the correct locations and formats are used for CommonJS so you can call one method and not worry about any compatibility issues.
The problem with the default `import()` is that it always resolves relative to the file location in which it is called. If you want to resolve from a different location, you need to jump through a few hoops to achieve that. This package makes it easy to both resolve and import modules from any directory.
### Node.js
Install using [npm][npm] or [yarn][yarn]:
npm install @humanwhocodes/module-importer
# or
yarn add @humanwhocodes/module-importer
Import into your Node.js project:
// CommonJS
const { ModuleImporter } = require("@humanwhocodes/module-importer");
// ESM
import { ModuleImporter } from "@humanwhocodes/module-importer";
### Bun
Install using this command:
```
bun add @humanwhocodes/module-importer
```
Import into your Bun project:
```js
import { ModuleImporter } from "@humanwhocodes/module-importer";
```
After importing, create a new instance of `ModuleImporter` to start emitting events:
```js
// cwd can be omitted to use process.cwd()
const importer = new ModuleImporter(cwd);
// you can resolve the location of any package
const location = importer.resolve("./some-file.cjs");
// you can also import directly
const module = importer.import("./some-file.cjs");
```
For both `resolve()` and `import()`, you can pass in package names and filenames.
## Developer Setup
1. Fork the repository
2. Clone your fork
3. Run `npm install` to setup dependencies
4. Run `npm test` to run tests
## License

Apache 2.0

[npm]: https://npmjs.com/
[yarn]: https://yarnpkg.com/

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
