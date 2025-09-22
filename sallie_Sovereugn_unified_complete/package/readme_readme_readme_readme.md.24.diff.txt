BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\natural-compare\README.md
---- DIFF ----
[Build]:    http://img.shields.io/travis/litejs/natural-compare-lite.png
[Coverage]: http://img.shields.io/coveralls/litejs/natural-compare-lite.png
[1]: https://travis-ci.org/litejs/natural-compare-lite
[2]: https://coveralls.io/r/litejs/natural-compare-lite
[npm package]: https://npmjs.org/package/natural-compare-lite
[GitHub repo]: https://github.com/litejs/natural-compare-lite
    @version    1.4.0
    @date       2015-10-26
    @stability  3 - Stable
Natural Compare &ndash; [![Build][]][1] [![Coverage][]][2]
===============
Compare strings containing a mix of letters and numbers
in the way a human being would in sort order.
This is described as a "natural ordering".
```text
Standard sorting:   Natural order sorting:
    img1.png            img1.png
    img10.png           img2.png
    img12.png           img10.png
    img2.png            img12.png
String.naturalCompare returns a number indicating
whether a reference string comes before or after or is the same
as the given string in sort order.
Use it with builtin sort() function.
### Installation
- In browser
```html
<script src=min.natural-compare.js></script>
- In node.js: `npm install natural-compare-lite`
```javascript
require("natural-compare-lite")
### Usage
```javascript
// Simple case sensitive example
var a = ["z1.doc", "z10.doc", "z17.doc", "z2.doc", "z23.doc", "z3.doc"];
a.sort(String.naturalCompare);
// ["z1.doc", "z2.doc", "z3.doc", "z10.doc", "z17.doc", "z23.doc"]
// Use wrapper function for case insensitivity
a.sort(function(a, b){
  return String.naturalCompare(a.toLowerCase(), b.toLowerCase());
})
// In most cases we want to sort an array of objects
var a = [ {"street":"350 5th Ave", "room":"A-1021"}
        , {"street":"350 5th Ave", "room":"A-21046-b"} ];
// sort by street, then by room
a.sort(function(a, b){
  return String.naturalCompare(a.street, b.street) || String.naturalCompare(a.room, b.room);
})
// When text transformation is needed (eg toLowerCase()),
// it is best for performance to keep
// transformed key in that object.
// There are no need to do text transformation
// on each comparision when sorting.
var a = [ {"make":"Audi", "model":"A6"}
        , {"make":"Kia",  "model":"Rio"} ];
// sort by make, then by model
a.map(function(car){
  car.sort_key = (car.make + " " + car.model).toLowerCase();
})
a.sort(function(a, b){
  return String.naturalCompare(a.sort_key, b.sort_key);
})
```
- Works well with dates in ISO format eg "Rev 2012-07-26.doc".
### Custom alphabet
It is possible to configure a custom alphabet
to achieve a desired order.
```javascript
// Estonian alphabet
String.alphabet = "ABDEFGHIJKLMNOPRSŠZŽTUVÕÄÖÜXYabdefghijklmnoprsšzžtuvõäöüxy"
["t", "z", "x", "õ"].sort(String.naturalCompare)
// ["z", "t", "õ", "x"]

// Russian alphabet
String.alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя"
["Ё", "А", "Б"].sort(String.naturalCompare)
// ["А", "Б", "Ё"]
```


External links
--------------

-   [GitHub repo][https://github.com/litejs/natural-compare-lite]
-   [jsperf test](http://jsperf.com/natural-sort-2/12)


Licence
-------

Copyright (c) 2012-2015 Lauri Rooden &lt;lauri@rooden.ee&gt;  
[The MIT License](http://lauri.rooden.ee/mit-license.txt)



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
