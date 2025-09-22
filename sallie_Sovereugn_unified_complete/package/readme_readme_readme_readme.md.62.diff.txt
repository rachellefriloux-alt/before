BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\cross-spawn\README.md
---- DIFF ----
# cross-spawn
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Build status][appveyor-image]][appveyor-url]
[npm-url]:https://npmjs.org/package/cross-spawn
[downloads-image]:https://img.shields.io/npm/dm/cross-spawn.svg
[npm-image]:https://img.shields.io/npm/v/cross-spawn.svg
[ci-url]:https://github.com/moxystudio/node-cross-spawn/actions/workflows/ci.yaml
[ci-image]:https://github.com/moxystudio/node-cross-spawn/actions/workflows/ci.yaml/badge.svg
[appveyor-url]:https://ci.appveyor.com/project/satazor/node-cross-spawn
[appveyor-image]:https://img.shields.io/appveyor/ci/satazor/node-cross-spawn/master.svg
A cross platform solution to node's spawn and spawnSync.
## Installation
Node.js version 8 and up:
`$ npm install cross-spawn`
Node.js version 7 and under:
`$ npm install cross-spawn@6`
## Why
Node has issues when using spawn on Windows:
- It ignores [PATHEXT](https://github.com/joyent/node/issues/2318)
- It does not support [shebangs](https://en.wikipedia.org/wiki/Shebang_(Unix))
- Has problems running commands with [spaces](https://github.com/nodejs/node/issues/7367)
- Has problems running commands with posix relative paths (e.g.: `./my-folder/my-executable`)
- Has an [issue](https://github.com/moxystudio/node-cross-spawn/issues/82) with command shims (files in `node_modules/.bin/`), where arguments with quotes and parenthesis would result in [invalid syntax error](https://github.com/moxystudio/node-cross-spawn/blob/e77b8f22a416db46b6196767bcd35601d7e11d54/test/index.test.js#L149)
- No `options.shell` support on node `<v4.8`
All these issues are handled correctly by `cross-spawn`.
There are some known modules, such as [win-spawn](https://github.com/ForbesLindesay/win-spawn), that try to solve this but they are either broken or provide faulty escaping of shell arguments.
Exactly the same way as node's [`spawn`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) or [`spawnSync`](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options), so it's a drop in replacement.
const spawn = require('cross-spawn');
// Spawn NPM asynchronously
const child = spawn('npm', ['list', '-g', '-depth', '0'], { stdio: 'inherit' });
// Spawn NPM synchronously
const result = spawn.sync('npm', ['list', '-g', '-depth', '0'], { stdio: 'inherit' });
## Caveats
### Using `options.shell` as an alternative to `cross-spawn`
Starting from node `v4.8`, `spawn` has a `shell` option that allows you run commands from within a shell. This new option solves
the [PATHEXT](https://github.com/joyent/node/issues/2318) issue but:
- It's not supported in node `<v4.8`
- You must manually escape the command and arguments which is very error prone, specially when passing user input
- There are a lot of other unresolved issues from the [Why](#why) section that you must take into account
If you are using the `shell` option to spawn a command in a cross platform way, consider using `cross-spawn` instead. You have been warned.
### `options.shell` support
While `cross-spawn` adds support for `options.shell` in node `<v4.8`, all of its enhancements are disabled.
This mimics the Node.js behavior. More specifically, the command and its arguments will not be automatically escaped nor shebang support will be offered. This is by design because if you are using `options.shell` you are probably targeting a specific platform anyway and you don't want things to get into your way.
### Shebangs support
While `cross-spawn` handles shebangs on Windows, its support is limited. More specifically, it just supports `#!/usr/bin/env <program>` where `<program>` must not contain any arguments.   
If you would like to have the shebang support improved, feel free to contribute via a pull-request.

Remember to always test your code on Windows!


## Tests

`$ npm test`   
`$ npm test -- --watch` during development


## License

Released under the [MIT License](https://www.opensource.org/licenses/mit-license.php).

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
