BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\fdir\README.md
---- DIFF ----
<p align="center">
<img src="https://github.com/thecodrr/fdir/raw/master/assets/fdir.gif" width="75%"/>
<h1 align="center">The Fastest Directory Crawler & Globber for NodeJS</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/fdir"><img src="https://img.shields.io/npm/v/fdir?style=for-the-badge"/></a>
  <a href="https://www.npmjs.com/package/fdir"><img src="https://img.shields.io/npm/dw/fdir?style=for-the-badge"/></a>
  <a href="https://codeclimate.com/github/thecodrr/fdir/maintainability"><img src="https://img.shields.io/codeclimate/maintainability-percentage/thecodrr/fdir?style=for-the-badge"/></a>
  <a href="https://coveralls.io/github/thecodrr/fdir?branch=master"><img src="https://img.shields.io/coveralls/github/thecodrr/fdir?style=for-the-badge"/></a>
  <a href="https://www.npmjs.com/package/fdir"><img src="https://img.shields.io/bundlephobia/minzip/fdir?style=for-the-badge"/></a>
  <a href="https://www.producthunt.com/posts/fdir-every-millisecond-matters"><img src="https://img.shields.io/badge/ProductHunt-Upvote-red?style=for-the-badge&logo=product-hunt"/></a>
  <a href="https://dev.to/thecodrr/how-i-wrote-the-fastest-directory-crawler-ever-3p9c"><img src="https://img.shields.io/badge/dev.to-Read%20Blog-black?style=for-the-badge&logo=dev.to"/></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/thecodrr/fdir?style=for-the-badge"/></a>
</p>
⚡ **The Fastest:** Nothing similar (in the NodeJS world) beats `fdir` in speed. It can easily crawl a directory containing **1 million files in < 1 second.**
💡 **Stupidly Easy:** `fdir` uses expressive Builder pattern to build the crawler increasing code readability.
🤖 **Zero Dependencies\*:** `fdir` only uses NodeJS `fs` & `path` modules.
🕺 **Astonishingly Small:** < 2KB in size gzipped & minified.
🖮 **Hackable:** Extending `fdir` is extremely simple now that the new Builder API is here. Feel free to experiment around.
_\* `picomatch` must be installed manually by the user to support globbing._
## 🚄 Quickstart
### Installation
You can install using `npm`:
```sh
$ npm i fdir
or Yarn:
```sh
$ yarn add fdir
### Usage
```ts
import { fdir } from "fdir";
// create the builder
const api = new fdir().withFullPaths().crawl("path/to/dir");
// get all files in a directory synchronously
const files = api.sync();
// or asynchronously
api.withPromise().then((files) => {
  // do something with the result here.
});
## Documentation:
Documentation for all methods is available [here](/documentation.md).
## 📊 Benchmarks:
Please check the benchmark against the latest version [here](/BENCHMARKS.md).
## 🙏Used by:
`fdir` is downloaded over 200k+ times a week by projects around the world. Here's a list of some notable projects using `fdir` in production:
> Note: if you think your project should be here, feel free to open an issue. Notable is anything with a considerable amount of GitHub stars.
1. [rollup/plugins](https://github.com/rollup/plugins)
2. [SuperchupuDev/tinyglobby](https://github.com/SuperchupuDev/tinyglobby)
3. [pulumi/pulumi](https://github.com/pulumi/pulumi)
4. [dotenvx/dotenvx](https://github.com/dotenvx/dotenvx)
5. [mdn/yari](https://github.com/mdn/yari)
6. [streetwriters/notesnook](https://github.com/streetwriters/notesnook)
7. [imba/imba](https://github.com/imba/imba)
8. [moroshko/react-scanner](https://github.com/moroshko/react-scanner)
9. [netlify/build](https://github.com/netlify/build)
10. [yassinedoghri/astro-i18next](https://github.com/yassinedoghri/astro-i18next)
11. [selfrefactor/rambda](https://github.com/selfrefactor/rambda)
12. [whyboris/Video-Hub-App](https://github.com/whyboris/Video-Hub-App)
## 🦮 LICENSE
Copyright &copy; 2024 Abdullah Atta under MIT. [Read full text here.](https://github.com/thecodrr/fdir/raw/master/LICENSE)

# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
$ npm install yocto-queue
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
