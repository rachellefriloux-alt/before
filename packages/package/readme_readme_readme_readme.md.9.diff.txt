BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\strip-json-comments\readme.md
---- DIFF ----
# strip-json-comments [![Build Status](https://travis-ci.com/sindresorhus/strip-json-comments.svg?branch=master)](https://travis-ci.com/github/sindresorhus/strip-json-comments)
> Strip comments from JSON. Lets you use comments in your JSON files!
This is now possible:
{
	// Rainbows
	"unicorn": /* ❤ */ "cake"
}
It will replace single-line comments `//` and multi-line comments `/**/` with whitespace. This allows JSON error positions to remain as close as possible to the original source.
Also available as a [Gulp](https://github.com/sindresorhus/gulp-strip-json-comments)/[Grunt](https://github.com/sindresorhus/grunt-strip-json-comments)/[Broccoli](https://github.com/sindresorhus/broccoli-strip-json-comments) plugin.
$ npm install strip-json-comments
```js
const json = `{
	// Rainbows
	"unicorn": /* ❤ */ "cake"
}`;
JSON.parse(stripJsonComments(json));
//=> {unicorn: 'cake'}
```
### stripJsonComments(jsonString, options?)
#### jsonString
Type: `string`
Accepts a string with JSON and returns a string without comments.
#### options
Type: `object`
##### whitespace
Type: `boolean`\
Default: `true`
Replace comments with whitespace instead of stripping them entirely.
## Benchmark
```
$ npm run bench
```
- [strip-json-comments-cli](https://github.com/sindresorhus/strip-json-comments-cli) - CLI for this module
- [strip-css-comments](https://github.com/sindresorhus/strip-css-comments) - Strip comments from CSS
---
<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-strip-json-comments?utm_source=npm-strip-json-comments&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
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
- [quick-lru](https://github.com/sindresorhus/quick-lru) - Simple “Least Recently Used” (LRU) cache

