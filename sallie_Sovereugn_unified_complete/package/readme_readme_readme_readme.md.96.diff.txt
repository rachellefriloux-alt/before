BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\vue\README.md
---- DIFF ----
# vue
## Which dist file to use?
### From CDN or without a Bundler
- **`vue(.runtime).global(.prod).js`**:
  - For direct use via `<script src="...">` in the browser. Exposes the `Vue` global.
  - Note that global builds are not [UMD](https://github.com/umdjs/umd) builds. They are built as [IIFEs](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) and is only meant for direct use via `<script src="...">`.
  - In-browser template compilation:
    - **`vue.global.js`** is the "full" build that includes both the compiler and the runtime so it supports compiling templates on the fly.
    - **`vue.runtime.global.js`** contains only the runtime and requires templates to be pre-compiled during a build step.
  - Inlines all Vue core internal packages - i.e. it's a single file with no dependencies on other files. This means you **must** import everything from this file and this file only to ensure you are getting the same instance of code.
  - Contains hard-coded prod/dev branches, and the prod build is pre-minified. Use the `*.prod.js` files for production.
- **`vue(.runtime).esm-browser(.prod).js`**:
  - For usage via native ES modules imports (in browser via `<script type="module">`).
  - Shares the same runtime compilation, dependency inlining and hard-coded prod/dev behavior with the global build.
### With a Bundler
- **`vue(.runtime).esm-bundler.js`**:
  - For use with bundlers like `webpack`, `rollup` and `parcel`.
  - Leaves prod/dev branches with `process.env.NODE_ENV` guards (must be replaced by bundler)
  - Does not ship minified builds (to be done together with the rest of the code after bundling)
  - Imports dependencies (e.g. `@vue/runtime-core`, `@vue/compiler-core`)
    - Imported dependencies are also `esm-bundler` builds and will in turn import their dependencies (e.g. `@vue/runtime-core` imports `@vue/reactivity`)
    - This means you **can** install/import these deps individually without ending up with different instances of these dependencies, but you must make sure they all resolve to the same version.
  - In-browser template compilation:
    - **`vue.runtime.esm-bundler.js` (default)** is runtime only, and requires all templates to be pre-compiled. This is the default entry for bundlers (via `module` field in `package.json`) because when using a bundler templates are typically pre-compiled (e.g. in `*.vue` files).
    - **`vue.esm-bundler.js`**: includes the runtime compiler. Use this if you are using a bundler but still want runtime template compilation (e.g. in-DOM templates or templates via inline JavaScript strings). You will need to configure your bundler to alias `vue` to this file.
#### Bundler Build Feature Flags
[Detailed Reference on vuejs.org](https://vuejs.org/api/compile-time-flags.html)
`esm-bundler` builds of Vue expose global feature flags that can be overwritten at compile time:
- `__VUE_OPTIONS_API__`
  - Default: `true`
  - Enable / disable Options API support
- `__VUE_PROD_DEVTOOLS__`
  - Default: `false`
  - Enable / disable devtools support in production
- `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`
  - Default: `false`
  - Enable / disable detailed warnings for hydration mismatches in production
The build will work without configuring these flags, however it is **strongly recommended** to properly configure them in order to get proper tree-shaking in the final bundle.
### For Server-Side Rendering
- **`vue.cjs(.prod).js`**:
  - For use in Node.js server-side rendering via `require()`.
  - If you bundle your app with webpack with `target: 'node'` and properly externalize `vue`, this is the build that will be loaded.
  - The dev/prod files are pre-built, but the appropriate file is automatically required based on `process.env.NODE_ENV`.
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

