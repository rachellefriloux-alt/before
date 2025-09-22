BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\std-env\README.md
---- DIFF ----
# std-env
[![npm](https://img.shields.io/npm/dm/std-env.svg?style=flat-square)](http://npmjs.com/package/std-env)
[![npm](https://img.shields.io/npm/v/std-env.svg?style=flat-square)](http://npmjs.com/package/std-env)
[![bundlephobia](https://img.shields.io/bundlephobia/min/std-env/latest.svg?style=flat-square)](https://bundlephobia.com/result?p=std-env)
> Runtime agnostic JS utils
## Installation
```sh
# Using npm
npm i std-env
# Using pnpm
pnpm i std-env
# Using yarn
yarn add std-env
// ESM
import { env, isDevelopment, isProduction } from "std-env";
// CommonJS
const { env, isDevelopment, isProduction } = require("std-env");
## Flags
- `hasTTY`
- `hasWindow`
- `isDebug`
- `isDevelopment`
- `isLinux`
- `isMacOS`
- `isMinimal`
- `isProduction`
- `isTest`
- `isWindows`
- `platform`
- `isColorSupported`
- `nodeVersion`
- `nodeMajorVersion`
You can read more about how each flag works from [./src/flags.ts](./src/flags.ts).
## Provider Detection
`std-env` can automatically detect the current runtime provider based on environment variables.
You can use `isCI` and `platform` exports to detect it:
```ts
import { isCI, provider, providerInfo } from "std-env";
console.log({
  isCI, // true
  provider, // "github_actions"
  providerInfo, // { name: "github_actions", isCI: true }
});
List of well known providers can be found from [./src/providers.ts](./src/providers.ts).
## Runtime Detection
`std-env` can automatically detect the current JavaScript runtime based on global variables, following the [WinterCG Runtime Keys proposal](https://runtime-keys.proposal.wintercg.org/):
```ts
import { runtime, runtimeInfo } from "std-env";
// "" | "node" | "deno" | "bun" | "workerd" ...
console.log(runtime);
// { name: "node" }
console.log(runtimeInfo);
```
You can also use individual named exports for each runtime detection:
> [!NOTE]
> When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
>
> Use `runtime === "node"` if you need strict check for Node.js runtime.
- `isNode`
- `isBun`
- `isDeno`
- `isNetlify`
- `isEdgeLight`
- `isWorkerd`
- `isFastly`
List of well known providers can be found from [./src/runtimes.ts](./src/runtimes.ts).
## Platform-Agnostic `env`

`std-env` provides a lightweight proxy to access environment variables in a platform agnostic way.

```ts
import { env } from "std-env";
```

## Platform-Agnostic `process`

`std-env` provides a lightweight proxy to access [`process`](https://nodejs.org/api/process.html) object in a platform agnostic way.

```ts
import { process } from "std-env";
```

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
