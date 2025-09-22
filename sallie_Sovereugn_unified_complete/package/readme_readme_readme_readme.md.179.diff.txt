BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@rolldown\pluginutils\README.md
---- DIFF ----
# @rolldown/pluginutils
A utility library for building flexible, composable filter expressions that can be used in plugin hook filters of Rolldown/Vite/Rollup/Unplugin plugins.
## Installation
```sh
pnpm add @rolldown/pluginutils
### Simple Filters
```ts
import {
  exactRegex,
  makeIdFiltersToMatchWithQuery,
  prefixRegex,
} from '@rolldown/pluginutils';
// Match exactly 'foo.js'
const filter = exactRegex('foo.js');
// Match any id starting with 'lib/'
const prefix = prefixRegex('lib/');
// Match ids with query params (e.g. 'foo.js?bar')
const idFilters = makeIdFiltersToMatchWithQuery(['**/*.js', /\.ts$/]);
// Usage in a plugin to define a hook filter
const myPlugin = {
  resolveId: {
    filter: {
      id: [exactRegex('MY_ID_TO_CHECK'), /some-other-regex/],
    },
    handler(id) {
      // Your code here
    },
  },
};
### Composable Filters
> [!WARNING] Composable filters are not yet supported in Vite, Rolldown-Vite or unplugin. They can be used in Rolldown plugins only.
```ts
import { and, id, include, moduleType, query } from '@rolldown/pluginutils';
// Build a filter expression
const filterExpr = and(
  id(/\.ts$/),
  moduleType('ts'),
  query('foo', true),
);
// Usage in a plugin to define a hook filter
const myPlugin = {
  transform: {
    filter: [include(filterExpr)],
    handler(code, id, options) {
      // Your code here
    },
  },
};
## API Reference
### Simple Filters
- `exactRegex(str: string, flags?: string): RegExp` — Matches the exact string.
- `prefixRegex(str: string, flags?: string): RegExp` — Matches values with the given prefix.
- `makeIdFiltersToMatchWithQuery(input: string | RegExp | (string | RegExp)[]): string | RegExp | (string | RegExp)[]` — Adapts filters to match ids with query params.
### Composable Filters
- `and(...exprs)` / `or(...exprs)` / `not(expr)` — Logical composition of filter expressions.
- `id(pattern, params?)` — Filter by id (string or RegExp).
- `moduleType(type)` — Filter by module type (e.g. 'js', 'tsx', or 'json').
- `code(pattern)` — Filter by code content.
- `query(key, pattern)` — Filter by query parameter.
- `include(expr)` / `exclude(expr)` — Top-level include/exclude wrappers.
- `queries(obj)` — Compose multiple query filters.
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

