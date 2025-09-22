BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@types\deep-eql\README.md
---- DIFF ----
# Installation
> `npm install --save @types/deep-eql`
# Summary
This package contains type definitions for deep-eql (https://github.com/chaijs/deep-eql).
# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/deep-eql.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/deep-eql/index.d.ts)
````ts
declare namespace deepEqual {
    /**
     * Memoization class used to speed up comparison.
     */
    class MemoizeMap extends WeakMap<object, MemoizeMap | boolean> {}
    interface DeepEqualOptions<T1 = unknown, T2 = unknown> {
        /**
         * Override default algorithm, determining custom equality.
         */
        comparator?: (leftHandOperand: T1, rightHandOperand: T2) => boolean | null;
        /**
         * Provide a custom memoization object which will cache the results of
         * complex objects for a speed boost.
         *
         * By passing `false` you can disable memoization, but this will cause circular
         * references to blow the stack.
         */
        memoize?: MemoizeMap | false;
    }
}
/**
 * Assert deeply nested sameValue equality between two objects of any type.
 *
 * @param leftHandOperand
 * @param rightHandOperand
 * @param [options] Additional options
 * @return equal match
 */
declare function deepEqual<T1, T2>(
    leftHandOperand: T1,
    rightHandOperand: T2,
    options?: deepEqual.DeepEqualOptions<T1, T2>,
): boolean;
export = deepEqual;
````
### Additional Details
 * Last updated: Mon, 06 Nov 2023 22:41:05 GMT
 * Dependencies: none
# Credits
These definitions were written by [Rodrigo Pietnechuk](https://github.com/ghnoob).
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

