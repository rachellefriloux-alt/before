BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@eslint\eslintrc\README.md
---- DIFF ----
# ESLintRC Library
This repository contains the legacy ESLintRC configuration file format for ESLint. This package is not intended for use outside of the ESLint ecosystem. It is ESLint-specific and not intended for use in other programs.
**Note:** This package is frozen except for critical bug fixes as ESLint moves to a new config system.
## Installation
You can install the package as follows:
```shell
npm install @eslint/eslintrc -D
# or
yarn add @eslint/eslintrc -D
# or
pnpm install @eslint/eslintrc -D
# or
bun install @eslint/eslintrc -D
## Usage (ESM)
The primary class in this package is `FlatCompat`, which is a utility to translate ESLintRC-style configs into flat configs. Here's how you use it inside of your `eslint.config.js` file:
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";
// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,                  // optional; default: process.cwd()
    resolvePluginsRelativeTo: __dirname,       // optional
    recommendedConfig: js.configs.recommended, // optional unless you're using "eslint:recommended"
    allConfig: js.configs.all,                 // optional unless you're using "eslint:all"
});
export default [
    // mimic ESLintRC-style extends
    ...compat.extends("standard", "example", "plugin:react/recommended"),
    // mimic environments
    ...compat.env({
        es2020: true,
        node: true
    }),
    // mimic plugins
    ...compat.plugins("jsx-a11y", "react"),
    // translate an entire config
    ...compat.config({
        plugins: ["jsx-a11y", "react"],
        extends: "standard",
        env: {
            es2020: true,
            node: true
        },
        rules: {
            semi: "error"
        }
    })
];
## Usage (CommonJS)
Using `FlatCompat` in CommonJS files is similar to ESM, but you'll use `require()` and `module.exports` instead of `import` and `export`. Here's how you use it inside of your `eslint.config.js` CommonJS file:
```js
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const compat = new FlatCompat({
    baseDirectory: __dirname,                  // optional; default: process.cwd()
    resolvePluginsRelativeTo: __dirname,       // optional
    recommendedConfig: js.configs.recommended, // optional unless using "eslint:recommended"
    allConfig: js.configs.all,                 // optional unless using "eslint:all"
});
module.exports = [
    // mimic ESLintRC-style extends
    ...compat.extends("standard", "example", "plugin:react/recommended"),
    // mimic environments
    ...compat.env({
        es2020: true,
        node: true
    }),
    // mimic plugins
    ...compat.plugins("jsx-a11y", "react"),
    // translate an entire config
    ...compat.config({
        plugins: ["jsx-a11y", "react"],
        extends: "standard",
        env: {
            es2020: true,
            node: true
        },
        rules: {
            semi: "error"
        }
    })
];
## Troubleshooting
**TypeError: Missing parameter 'recommendedConfig' in FlatCompat constructor**
The `recommendedConfig` option is required when any config uses `eslint:recommended`, including any config in an `extends` clause. To fix this, follow the example above using `@eslint/js` to provide the `eslint:recommended` config.
**TypeError: Missing parameter 'allConfig' in FlatCompat constructor**

The `allConfig` option is required when any config uses `eslint:all`, including any config in an `extends` clause. To fix this, follow the example above using `@eslint/js` to provide the `eslint:all` config.


## License

MIT License

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
## Usage
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
