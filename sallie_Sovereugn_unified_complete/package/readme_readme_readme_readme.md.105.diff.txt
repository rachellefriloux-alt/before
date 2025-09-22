BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\tinyexec\README.md
---- DIFF ----
# tinyexec 📟
> A minimal package for executing commands
This package was created to provide a minimal way of interacting with child
processes without having to manually deal with streams, piping, etc.
## Installing
```sh
$ npm i -S tinyexec
A process can be spawned and awaited like so:
```ts
import {x} from 'tinyexec';
const result = await x('ls', ['-l']);
// result.stdout - the stdout as a string
// result.stderr - the stderr as a string
// result.exitCode - the process exit code as a number
You may also iterate over the lines of output via an async loop:
```ts
import {x} from 'tinyexec';
const proc = x('ls', ['-l']);
for await (const line of proc) {
  // line will be from stderr/stdout in the order you'd see it in a term
}
### Options
Options can be passed to have finer control over spawning of the process:
```ts
await x('ls', [], {
  timeout: 1000
});
```
The options object can have the following properties:
- `signal` - an `AbortSignal` to allow aborting of the execution
- `timeout` - time in milliseconds at which the process will be forceably killed
- `persist` - if `true`, the process will continue after the host exits
- `stdin` - another `Result` can be used as the input to this process
- `nodeOptions` - any valid options to node's underlying `spawn` function
- `throwOnError` - if true, non-zero exit codes will throw an error
### Piping to another process
You can pipe a process to another via the `pipe` method:
```ts
const proc1 = x('ls', ['-l']);
const proc2 = proc1.pipe('grep', ['.js']);
const result = await proc2;
console.log(result.stdout);
```
`pipe` takes the same options as a regular execution. For example, you can
pass a timeout to the pipe call:
```ts
proc1.pipe('grep', ['.js'], {
  timeout: 2000
});
```
### Killing a process
You can kill the process via the `kill` method:
```ts
const proc = x('ls');
proc.kill();

// or with a signal
proc.kill('SIGHUP');
```

### Node modules/binaries

By default, node's available binaries from `node_modules` will be accessible
in your command.

For example, in a repo which has `eslint` installed:

```ts
await x('eslint', ['.']);
```

In this example, `eslint` will come from the locally installed `node_modules`.

### Using an abort signal

An abort signal can be passed to a process in order to abort it at a later
time. This will result in the process being killed and `aborted` being set
to `true`.

```ts
const aborter = new AbortController();
const proc = x('node', ['./foo.mjs'], {
  signal: aborter.signal
});

// elsewhere...
aborter.abort();

await proc;

proc.aborted; // true
proc.killed; // true
```

### Using with command strings

If you need to continue supporting commands as strings (e.g. "command arg0 arg1"),
you can use [args-tokenizer](https://github.com/TrySound/args-tokenizer),
a lightweight library for parsing shell command strings into an array.

```ts
import {x} from 'tinyexec';
import {tokenizeArgs} from 'args-tokenizer';

const commandString = 'echo "Hello, World!"';
const [command, ...args] = tokenizeArgs(commandString);
const result = await x(command, args);

result.stdout; // Hello, World!
```


Calling `x(command[, args])` returns an awaitable `Result` which has the
following API methods and properties available:

### `pipe(command[, args[, options]])`

Pipes the current command to another. For example:

```ts
x('ls', ['-l'])
  .pipe('grep', ['js']);
```

The parameters are as follows:

- `command` - the command to execute (_without any arguments_)
- `args` - an array of arguments
- `options` - options object

### `process`

The underlying node `ChildProcess`. For example:

```ts
const proc = x('ls');

proc.process; // ChildProcess;
```

### `kill([signal])`

Kills the current process with the specified signal. By default, this will
use the `SIGTERM` signal.

For example:

```ts
const proc = x('ls');

proc.kill();
```

### `pid`

The current process ID. For example:

```ts
const proc = x('ls');

proc.pid; // number
```

### `aborted`

Whether the process has been aborted or not (via the `signal` originally
passed in the options object).

For example:

```ts
const proc = x('ls');

proc.aborted; // bool
```

### `killed`

Whether the process has been killed or not (e.g. via `kill()` or an abort
signal).

For example:

```ts
const proc = x('ls');

proc.killed; // bool
```

### `exitCode`

The exit code received when the process completed execution.

For example:

```ts
const proc = x('ls');

proc.exitCode; // number (e.g. 1)
```

## Comparison with other libraries

`tinyexec` aims to provide a lightweight layer on top of Node's own
`child_process` API.

Some clear benefits compared to other libraries are that `tinyexec` will be much lighter, have a much
smaller footprint and will have a less abstract interface (less "magic"). It
will also have equal security and cross-platform support to popular
alternatives.

There are various features other libraries include which we are unlikely
to ever implement, as they would prevent us from providing a lightweight layer.

For example, if you'd like write scripts rather than individual commands, and
prefer to use templating, we'd definitely recommend
[zx](https://github.com/google/zx). zx is a much higher level library which
does some of the same work `tinyexec` does but behind a template string
interface.

Similarly, libraries like `execa` will provide helpers for various things
like passing files as input to processes. We opt not to support features like
this since many of them are easy to do yourself (using Node's own APIs).

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
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
