BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@types\chai\README.md
---- DIFF ----
# Installation
> `npm install --save @types/chai`
# Summary
This package contains type definitions for chai (http://chaijs.com/).
# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/chai.
### Additional Details
 * Last updated: Mon, 05 May 2025 21:33:58 GMT
 * Dependencies: [@types/deep-eql](https://npmjs.com/package/@types/deep-eql)
# Credits
These definitions were written by [Bart van der Schoor](https://github.com/Bartvds), [Andrew Brown](https://github.com/AGBrown), [Olivier Chevet](https://github.com/olivr70), [Matt Wistrand](https://github.com/mwistrand), [Shaun Luttin](https://github.com/shaunluttin), [Satana Charuwichitratana](https://github.com/micksatana), [Erik Schierboom](https://github.com/ErikSchierboom), [Bogdan Paranytsia](https://github.com/bparan), [CXuesong](https://github.com/CXuesong), and [Joey Kilpatrick](https://github.com/joeykilpatrick).
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install

```
$ npm install yocto-queue
```

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

