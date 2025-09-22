BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@vitest\snapshot\README.md
---- DIFF ----
# @vitest/snapshot
Lightweight implementation of Jest's snapshots.
import { SnapshotClient } from '@vitest/snapshot'
import { NodeSnapshotEnvironment } from '@vitest/snapshot/environment'
import { SnapshotManager } from '@vitest/snapshot/manager'
const client = new SnapshotClient({
  // you need to provide your own equality check implementation if you use it
  // this function is called when `.toMatchSnapshot({ property: 1 })` is called
  isEqual: (received, expected) =>
    equals(received, expected, [iterableEquality, subsetEquality]),
})
// class that implements snapshot saving and reading
// by default uses fs module, but you can provide your own implementation depending on the environment
const environment = new NodeSnapshotEnvironment()
// you need to implement this yourselves,
// this depends on your runner
function getCurrentFilepath() {
  return '/file.spec.js'
}
function getCurrentTestName() {
  return 'test1'
}
// example for inline snapshots, nothing is required to support regular snapshots,
// just call `assert` with `isInline: false`
function wrapper(received) {
  function __INLINE_SNAPSHOT__(inlineSnapshot, message) {
    client.assert({
      received,
      message,
      isInline: true,
      inlineSnapshot,
      filepath: getCurrentFilepath(),
      name: getCurrentTestName(),
    })
  }
  return {
    // the name is hard-coded, it should be inside another function, so Vitest can find the actual test file where it was called (parses call stack trace + 2)
    // you can override this behaviour in SnapshotState's `_inferInlineSnapshotStack` method by providing your own SnapshotState to SnapshotClient constructor
    toMatchInlineSnapshot: (...args) => __INLINE_SNAPSHOT__(...args),
  }
}
const options = {
  updateSnapshot: 'new',
  snapshotEnvironment: environment,
}
await client.startCurrentRun(
  getCurrentFilepath(),
  getCurrentTestName(),
  options
)
// this will save snapshot to a file which is returned by "snapshotEnvironment.resolvePath"
client.assert({
  received: 'some text',
  isInline: false,
})
// uses "pretty-format", so it requires quotes
// also naming is hard-coded when parsing test files
wrapper('text 1').toMatchInlineSnapshot()
wrapper('text 2').toMatchInlineSnapshot('"text 2"')
const result = await client.finishCurrentRun() // this saves files and returns SnapshotResult
// you can use manager to manage several clients
const manager = new SnapshotManager(options)
manager.add(result)
// do something
// and then read the summary
console.log(manager.summary)
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
```
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

