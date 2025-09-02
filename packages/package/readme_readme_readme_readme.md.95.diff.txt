BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\why-is-node-running\README.md
---- DIFF ----
# why-is-node-running
Node is running but you don't know why? `why-is-node-running` is here to help you.
## Installation
Node 8 and above:
```bash
npm i why-is-node-running -g
Earlier Node versions (no longer supported):
```bash
npm i why-is-node-running@v1.x -g
const log = require('why-is-node-running') // should be your first require
const net = require('net')
function createServer () {
  const server = net.createServer()
  setInterval(function () {}, 1000)
  server.listen(0)
}
createServer()
createServer()
setTimeout(function () {
  log() // logs out active handles that are keeping node running
}, 100)
Save the file as `example.js`, then execute:
```bash
node ./example.js
```
Here's the output:
```
There are 5 handle(s) keeping the process running
# Timeout
/home/maf/dev/node_modules/why-is-node-running/example.js:6  - setInterval(function () {}, 1000)
/home/maf/dev/node_modules/why-is-node-running/example.js:10 - createServer()
# TCPSERVERWRAP
/home/maf/dev/node_modules/why-is-node-running/example.js:7  - server.listen(0)
/home/maf/dev/node_modules/why-is-node-running/example.js:10 - createServer()
# Timeout
/home/maf/dev/node_modules/why-is-node-running/example.js:6  - setInterval(function () {}, 1000)
/home/maf/dev/node_modules/why-is-node-running/example.js:11 - createServer()
# TCPSERVERWRAP
/home/maf/dev/node_modules/why-is-node-running/example.js:7  - server.listen(0)
/home/maf/dev/node_modules/why-is-node-running/example.js:11 - createServer()
# Timeout
/home/maf/dev/node_modules/why-is-node-running/example.js:13 - setTimeout(function () {
```
**Important Note!**
`unref`ed timers do not prevent the Node process from exiting. If you are running with Node v11.0.0 and above, `unref`ed timers will not be listed in the above list. Unfortunately, this is not supported in node versions below v11.0.0.
## CLI
You can also run `why-is-node-running` as a standalone if you don't want to include it inside your code. Sending `SIGUSR1`/`SIGINFO` signal to the process will produce the log. (`Ctrl + T` on macOS and BSD systems)
```bash
why-is-node-running /path/to/some/file.js
```
```
probing module /path/to/some/file.js
kill -SIGUSR1 31115 for logging
```
To trigger the log:
```
kill -SIGUSR1 31115
```
## Require CLI Option

You can also use the node `-r` option to include `why-is-node-running`:

```bash
node -r why-is-node-running/include /path/to/some/file.js
```

The steps are otherwise the same as the above CLI section

## License

MIT

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
