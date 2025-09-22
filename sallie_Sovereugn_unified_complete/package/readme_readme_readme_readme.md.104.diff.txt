BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\tinyglobby\README.md
---- DIFF ----
# tinyglobby
[![npm version](https://img.shields.io/npm/v/tinyglobby.svg?maxAge=3600)](https://npmjs.com/package/tinyglobby)
[![monthly downloads](https://img.shields.io/npm/dm/tinyglobby.svg?maxAge=3600)](https://npmjs.com/package/tinyglobby)
A fast and minimal alternative to globby and fast-glob, meant to behave the same way.
Both globby and fast-glob present some behavior no other globbing lib has,
which makes it hard to manually replace with something smaller and better.
This library uses only two subdependencies, compared to `globby`'s [23](https://npmgraph.js.org/?q=globby@14.1.0)
and `fast-glob`'s [17](https://npmgraph.js.org/?q=fast-glob@3.3.3).
import { glob, globSync } from 'tinyglobby';
await glob(['files/*.ts', '!**/*.d.ts'], { cwd: 'src' });
globSync(['src/**/*.ts'], { ignore: ['**/*.d.ts'] });
- `glob(patterns: string | string[], options: GlobOptions): Promise<string[]>`: Returns a promise with an array of matches.
- `globSync(patterns: string | string[], options: GlobOptions): string[]`: Returns an array of matches.
- `convertPathToPattern(path: string): string`: Converts a path to a pattern depending on the platform.
- `escapePath(path: string): string`: Escapes a path's special characters depending on the platform.
- `isDynamicPattern(pattern: string, options?: GlobOptions): boolean`: Checks if a pattern is dynamic.
## Options
- `patterns`: An array of glob patterns to search for. Defaults to `['**/*']`.
- `ignore`: An array of glob patterns to ignore.
- `cwd`: The current working directory in which to search. Defaults to `process.cwd()`.
- `absolute`: Whether to return absolute paths. Defaults to `false`.
- `dot`: Whether to allow entries starting with a dot. Defaults to `false`.
- `deep`: Maximum depth of a directory. Defaults to `Infinity`.
- `followSymbolicLinks`: Whether to traverse and include symbolic links. Defaults to `true`.
- `caseSensitiveMatch`: Whether to match in case-sensitive mode. Defaults to `true`.
- `expandDirectories`: Whether to expand directories. Disable to best match `fast-glob`. Defaults to `true`.
- `onlyDirectories`: Enable to only return directories. Disables `onlyFiles` if set. Defaults to `false`.
- `onlyFiles`: Enable to only return files. Defaults to `true`.
- `debug`: Enable debug logs. Useful for development purposes.
## Used by
`tinyglobby` is downloaded many times by projects all around the world. Here's a partial list of notable projects that use it:
<!-- should be sorted by weekly download count -->
- [`vite`](https://github.com/vitejs/vite)
- [`pnpm`](https://github.com/pnpm/pnpm)
- [`node-gyp`](https://github.com/nodejs/node-gyp)
- [`eslint-import-resolver-typescript`](https://github.com/import-js/eslint-import-resolver-typescript)
- [`vitest`](https://github.com/vitest-dev/vitest)
- [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin)
- [`storybook`](https://github.com/storybookjs/storybook)
- [`ts-morph`](https://github.com/dsherret/ts-morph)
- [`nx`](https://github.com/nrwl/nx)
- [`sort-package-json`](https://github.com/keithamus/sort-package-json)
- [`unimport`](https://github.com/unjs/unimport)
- [`tsup`](https://github.com/egoist/tsup)
- [`lerna`](https://github.com/lerna/lerna)
- [`cspell`](https://github.com/streetsidesoftware/cspell)
- [`nuxt`](https://github.com/nuxt/nuxt)
- [`postcss-mixins`](https://github.com/postcss/postcss-mixins)
- [`astro`](https://github.com/withastro/astro)
- [`unocss`](https://github.com/unocss/unocss)
- [`vitepress`](https://github.com/vuejs/vitepress)
- [`pkg-pr-new`](https://github.com/stackblitz-labs/pkg.pr.new)
- Your own project? [Open an issue](https://github.com/SuperchupuDev/tinyglobby/issues)
if you feel like this list is incomplete.
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

