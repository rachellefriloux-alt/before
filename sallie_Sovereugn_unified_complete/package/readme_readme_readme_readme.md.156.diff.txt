BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\assertion-error\README.md
---- DIFF ----
<p align=center>
  AssertionError and AssertionResult classes.
</p>
<p align=center>
  <a href="https://github.com/chaijs/assertion-error/actions">
    <img
      alt="build:?"
      src="https://github.com/chaijs/assertion-error/actions/workflows/nodejs.yml/badge.svg"
    />
  </a><a href="https://www.npmjs.com/package/assertion-error">
    <img
      alt="downloads:?"
      src="https://img.shields.io/npm/dm/assertion-error.svg"
    />
  </a><a href="">
    <img
      alt="devDependencies:none"
      src="https://img.shields.io/badge/dependencies-none-brightgreen"
    />
  </a>
</p>
## What is AssertionError?
Assertion Error is a module that contains two classes: `AssertionError`, which
is an instance of an `Error`, and `AssertionResult` which is not an instance of
Error.
These can be useful for returning from a function - if the function "succeeds"
return an `AssertionResult` and if the function fails return (or throw) an
`AssertionError`.
Both `AssertionError` and `AssertionResult` implement the `Result` interface:
```typescript
interface Result {
  name: "AssertionError" | "AssertionResult";
  ok: boolean;
  toJSON(...args: unknown[]): Record<string, unknown>;
}
So if a function returns `AssertionResult | AssertionError` it is easy to check
_which_ one is returned by checking either `.name` or `.ok`, or check
`instanceof Error`.
## Installation
### Node.js
`assertion-error` is available on [npm](http://npmjs.org).
$ npm install --save assertion-error
### Deno
`assertion_error` is available on
[Deno.land](https://deno.land/x/assertion_error)
```typescript
import {
  AssertionError,
  AssertionResult,
} from "https://deno.land/x/assertion_error@2.0.0/mod.ts";
```
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
## Usage
```js
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

