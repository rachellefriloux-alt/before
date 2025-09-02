BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\stackback\README.md
---- DIFF ----
# stackback
Returns an array of CallSite objects for a captured stacktrace. Useful if you want to access the frame for an error object.
## use
```javascript
var stackback = require('stackback');
// error generated from somewhere
var err = new Error('some sample error');
// stack is an array of CallSite objects
var stack = stackback(err);
## CallSite object
From the [V8 StackTrace API](https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi)
The structured stack trace is an Array of CallSite objects, each of which represents a stack frame. A CallSite object defines the following methods
getThis: returns the value of this  
getTypeName: returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.  
getFunction: returns the current function  
getFunctionName: returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.  
getMethodName: returns the name of the property of this or one of its prototypes that holds the current function  
getFileName: if this function was defined in a script returns the name of the script  
getLineNumber: if this function was defined in a script returns the current line number  
getColumnNumber: if this function was defined in a script returns the current column number  
getEvalOrigin: if this function was created using a call to eval returns a CallSite object representing the location where eval was called  
isToplevel: is this a toplevel invocation, that is, is this the global object?  
isEval: does this call take place in code defined by a call to eval?  
isNative: is this call in native V8 code?  
isConstructor: is this a constructor call?  
```shell
npm install stackback
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
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

