BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\siginfo\README.md
---- DIFF ----
# `siginfo`
[![Build Status](https://travis-ci.org/emilbayes/siginfo.svg?branch=master)](https://travis-ci.org/eemilbayes/siginfo)
> Utility module to print pretty messages on SIGINFO/SIGUSR1
`SIGINFO` on BSD / macOS and `SIGUSR1` on Linux, usually triggered by
`Ctrl + T`, are by convention used to print information about
a long running process internal state. Eg. `dd` will tell you how many blocks it
has written and at what speed, while `xz` will tell you progress, compression
ratio and estimated time remaining.
This module wraps both signals, checks if the process is connected to TTY and
lets you do whatever you want.
var siginfo = require('siginfo')
var pkg = require('./package.json')
siginfo(function () {
  console.dir({
    version: pkg.version,
    uptime: process.uptime()
  })
})
### `var removeListener = siginfo(queryFn, [force])`
`queryFn` can be used for whatever you want (logging, sending a UDP message, etc.).
Setting `force = true` will attach the event handlers whether a TTY is present
or not.
```sh
npm install siginfo
## License
[ISC](LICENSE)
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

