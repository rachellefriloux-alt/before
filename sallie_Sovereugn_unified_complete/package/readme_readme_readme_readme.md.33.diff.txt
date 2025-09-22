BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\isexe\README.md
---- DIFF ----
# isexe
Minimal module to check if a file is executable, and a normal file.
Uses `fs.stat` and tests against the `PATHEXT` environment variable on
Windows.
```javascript
var isexe = require('isexe')
isexe('some-file-name', function (err, isExe) {
  if (err) {
    console.error('probably file does not exist or something', err)
  } else if (isExe) {
    console.error('this thing can be run')
  } else {
    console.error('cannot be run')
  }
})
// same thing but synchronous, throws errors
var isExe = isexe.sync('some-file-name')
// treat errors as just "not executable"
isexe('maybe-missing-file', { ignoreErrors: true }, callback)
var isExe = isexe.sync('maybe-missing-file', { ignoreErrors: true })
### `isexe(path, [options], [callback])`
Check if the path is executable.  If no callback provided, and a
global `Promise` object is available, then a Promise will be returned.
Will raise whatever errors may be raised by `fs.stat`, unless
`options.ignoreErrors` is set to true.
### `isexe.sync(path, [options])`
Same as `isexe` but returns the value and throws any errors raised.
### Options
* `ignoreErrors` Treat all errors as "no, this is not executable", but
  don't raise them.
* `uid` Number to use as the user id
* `gid` Number to use as the group id
* `pathExt` List of path extensions to use instead of `PATHEXT`
  environment variable on Windows.
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
```
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

