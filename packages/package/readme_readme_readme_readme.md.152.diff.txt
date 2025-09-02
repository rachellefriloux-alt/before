BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\check-error\README.md
---- DIFF ----
<h1 align=center>
  <a href="http://chaijs.com" title="Chai Documentation">
    <img alt="ChaiJS" src="http://chaijs.com/img/chai-logo.png">
  </a>
  <br>
  check-error
</h1>
<p align=center>
  Error comparison and information related utility for <a href="http://nodejs.org">node</a> and the browser.
</p>
## What is Check-Error?
Check-Error is a module which you can use to retrieve an Error's information such as its `message` or `constructor` name and also to check whether two Errors are compatible based on their messages, constructors or even instances.
## Installation
### Node.js
`check-error` is available on [npm](http://npmjs.org). To install it, type:
    $ npm install check-error
### Browsers
You can also use it within the browser; install via npm and use the `check-error.js` file found within the download. For example:
```html
<script src="./node_modules/check-error/check-error.js"></script>
The primary export of `check-error` is an object which has the following methods:
* `compatibleInstance(err, errorLike)` - Checks if an error is compatible with another `errorLike` object. If `errorLike` is an error instance we do a strict comparison, otherwise we return `false` by default, because instances of objects can only be compatible if they're both error instances.
* `compatibleConstructor(err, errorLike)` - Checks if an error's constructor is compatible with another `errorLike` object. If `err` has the same constructor as `errorLike` or if `err` is an instance of `errorLike`.
* `compatibleMessage(err, errMatcher)` - Checks if an error message is compatible with an `errMatcher` RegExp or String (we check if the message contains the String).
* `getConstructorName(errorLike)` - Retrieves the name of a constructor, an error's constructor or `errorLike` itself if it's not an error instance or constructor.
* `getMessage(err)` - Retrieves the message of an error or `err` itself if it's a String. If `err` or `err.message` is undefined we return an empty String.
var checkError = require('check-error');
#### .compatibleInstance(err, errorLike)
```js
var checkError = require('check-error');
var funcThatThrows = function() { throw new TypeError('I am a TypeError') };
var caughtErr;
try {
  funcThatThrows();
} catch(e) {
  caughtErr = e;
}
var sameInstance = caughtErr;
checkError.compatibleInstance(caughtErr, sameInstance); // true
checkError.compatibleInstance(caughtErr, new TypeError('Another error')); // false
#### .compatibleConstructor(err, errorLike)
```js
var checkError = require('check-error');
var funcThatThrows = function() { throw new TypeError('I am a TypeError') };
var caughtErr;
try {
  funcThatThrows();
} catch(e) {
  caughtErr = e;
}
checkError.compatibleConstructor(caughtErr, Error); // true
checkError.compatibleConstructor(caughtErr, TypeError); // true
checkError.compatibleConstructor(caughtErr, RangeError); // false
```
#### .compatibleMessage(err, errMatcher)
```js
var checkError = require('check-error');
var funcThatThrows = function() { throw new TypeError('I am a TypeError') };
var caughtErr;

try {
  funcThatThrows();
} catch(e) {
  caughtErr = e;
}

var sameInstance = caughtErr;

checkError.compatibleMessage(caughtErr, /TypeError$/); // true
checkError.compatibleMessage(caughtErr, 'I am a'); // true
checkError.compatibleMessage(caughtErr, /unicorn/); // false
checkError.compatibleMessage(caughtErr, 'I do not exist'); // false
```

#### .getConstructorName(errorLike)

```js
var checkError = require('check-error');

var funcThatThrows = function() { throw new TypeError('I am a TypeError') };
var caughtErr;

try {
  funcThatThrows();
} catch(e) {
  caughtErr = e;
}

var sameInstance = caughtErr;

checkError.getConstructorName(caughtErr) // 'TypeError'
```

#### .getMessage(err)

```js
var checkError = require('check-error');

var funcThatThrows = function() { throw new TypeError('I am a TypeError') };
var caughtErr;

try {
  funcThatThrows();
} catch(e) {
  caughtErr = e;
}

var sameInstance = caughtErr;

checkError.getMessage(caughtErr) // 'I am a TypeError'
```

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
