BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@humanwhocodes\retry\README.md
---- DIFF ----
# Retry utility
by [Nicholas C. Zakas](https://humanwhocodes.com)
If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate) or [nominate me](https://stars.github.com/nominate/) for a GitHub Star.
## Description
A utility for retrying failed async JavaScript calls based on the error returned.
### Node.js
Install using [npm][npm] or [yarn][yarn]:
npm install @humanwhocodes/retry
# or
yarn add @humanwhocodes/retry
Import into your Node.js project:
// CommonJS
const { Retrier } = require("@humanwhocodes/retry");
// ESM
import { Retrier } from "@humanwhocodes/retry";
### Deno
Install using [JSR](https://jsr.io):
```shell
deno add @humanwhocodes/retry
#or
jsr add @humanwhocodes/retry
```
Then import into your Deno project:
```js
import { Retrier } from "@humanwhocodes/retry";
```
### Bun
Install using this command:
```
bun add @humanwhocodes/retry
```
Import into your Bun project:
```js
import { Retrier } from "@humanwhocodes/retry";
```
### Browser
It's recommended to import the minified version to save bandwidth:
```js
import { Retrier } from "https://cdn.skypack.dev/@humanwhocodes/retry?min";
```

However, you can also import the unminified version for debugging purposes:

```js
import { Retrier } from "https://cdn.skypack.dev/@humanwhocodes/retry";
```


After importing, create a new instance of `Retrier` and specify the function to run on the error. This function should return `true` if you want the call retried and `false` if not.

```js
// this instance will retry if the specific error code is found
const retrier = new Retrier(error => {
    return error.code === "ENFILE" || error.code === "EMFILE";
});
```

Then, call the `retry()` method around the function you'd like to retry, such as:

```js
import fs from "fs/promises";

const retrier = new Retrier(error => {
    return error.code === "ENFILE" || error.code === "EMFILE";
});

const text = await retrier.retry(() => fs.readFile("README.md", "utf8"));
```

The `retry()` method will either pass through the result on success or wait and retry on failure. Any error that isn't caught by the retrier is automatically rejected so the end result is a transparent passing through of both success and failure.

### Setting a Timeout

You can control how long a task will attempt to retry before giving up by passing the `timeout` option to the `Retrier` constructor. By default, the timeout is one minute.

```js
import fs from "fs/promises";

const retrier = new Retrier(error => {
    return error.code === "ENFILE" || error.code === "EMFILE";
}, { timeout: 100_000 });

const text = await retrier.retry(() => fs.readFile("README.md", "utf8"));
```

When a call times out, it rejects the first error that was received from calling the function.

### Setting a Concurrency Limit

When processing a large number of function calls, you can limit the number of concurrent function calls by passing the `concurrency` option to the `Retrier` constructor. By default, `concurrency` is 1000.

```js
import fs from "fs/promises";

const retrier = new Retrier(error => {
    return error.code === "ENFILE" || error.code === "EMFILE";
}, { concurrency: 100 });

const filenames = getFilenames();
const contents = await Promise.all(
    filenames.map(filename => retrier.retry(() => fs.readFile(filename, "utf8"))
);
```

### Aborting with `AbortSignal`

You can also pass an `AbortSignal` to cancel a retry:

```js
import fs from "fs/promises";

const controller = new AbortController();
const retrier = new Retrier(error => {
    return error.code === "ENFILE" || error.code === "EMFILE";
});

const text = await retrier.retry(
    () => fs.readFile("README.md", "utf8"),
    { signal: controller.signal }
);
```

## Developer Setup

1. Fork the repository
2. Clone your fork
3. Run `npm install` to setup dependencies
4. Run `npm test` to run tests

### Debug Output

Enable debugging output by setting the `DEBUG` environment variable to `"@hwc/retry"` before running.

## License

Apache 2.0

## Prior Art

This utility is inspired by, and contains code from [`graceful-fs`](https://github.com/isaacs/node-graceful-fs).

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
