BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\color-convert\README.md
---- DIFF ----
# color-convert
[![Build Status](https://travis-ci.org/Qix-/color-convert.svg?branch=master)](https://travis-ci.org/Qix-/color-convert)
Color-convert is a color conversion library for JavaScript and node.
It converts all ways between `rgb`, `hsl`, `hsv`, `hwb`, `cmyk`, `ansi`, `ansi16`, `hex` strings, and CSS `keyword`s (will round to closest):
var convert = require('color-convert');
convert.rgb.hsl(140, 200, 100);             // [96, 48, 59]
convert.keyword.rgb('blue');                // [0, 0, 255]
var rgbChannels = convert.rgb.channels;     // 3
var cmykChannels = convert.cmyk.channels;   // 4
var ansiChannels = convert.ansi16.channels; // 1
# Install
```console
$ npm install color-convert
# API
Simply get the property of the _from_ and _to_ conversion that you're looking for.
All functions have a rounded and unrounded variant. By default, return values are rounded. To get the unrounded (raw) results, simply tack on `.raw` to the function.
All 'from' functions have a hidden property called `.channels` that indicates the number of channels the function expects (not including alpha).
```js
var convert = require('color-convert');
// Hex to LAB
convert.hex.lab('DEADBF');         // [ 76, 21, -2 ]
convert.hex.lab.raw('DEADBF');     // [ 75.56213190997677, 20.653827952644754, -2.290532499330533 ]
// RGB to CMYK
convert.rgb.cmyk(167, 255, 4);     // [ 35, 0, 98, 0 ]
convert.rgb.cmyk.raw(167, 255, 4); // [ 34.509803921568626, 0, 98.43137254901961, 0 ]
### Arrays
All functions that accept multiple arguments also support passing an array.
Note that this does **not** apply to functions that convert from a color that only requires one value (e.g. `keyword`, `ansi256`, `hex`, etc.)
```js
var convert = require('color-convert');
convert.rgb.hex(123, 45, 67);      // '7B2D43'
convert.rgb.hex([123, 45, 67]);    // '7B2D43'
```
## Routing
Conversions that don't have an _explicitly_ defined conversion (in [conversions.js](conversions.js)), but can be converted by means of sub-conversions (e.g. XYZ -> **RGB** -> CMYK), are automatically routed together. This allows just about any color model supported by `color-convert` to be converted to any other model, so long as a sub-conversion path exists. This is also true for conversions requiring more than one step in between (e.g. LCH -> **LAB** -> **XYZ** -> **RGB** -> Hex).
Keep in mind that extensive conversions _may_ result in a loss of precision, and exist only to be complete. For a list of "direct" (single-step) conversions, see [conversions.js](conversions.js).
# Contribute
If there is a new model you would like to support, or want to add a direct conversion between two existing models, please send us a pull request.
# License
Copyright &copy; 2011-2016, Heather Arthur and Josh Junon. Licensed under the [MIT License](LICENSE).
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

