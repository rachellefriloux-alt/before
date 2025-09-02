BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\estraverse\README.md
---- DIFF ----
### Estraverse [![Build Status](https://secure.travis-ci.org/estools/estraverse.svg)](http://travis-ci.org/estools/estraverse)
Estraverse ([estraverse](http://github.com/estools/estraverse)) is
[ECMAScript](http://www.ecma-international.org/publications/standards/Ecma-262.htm)
traversal functions from [esmangle project](http://github.com/estools/esmangle).
### Documentation
You can find usage docs at [wiki page](https://github.com/estools/estraverse/wiki/Usage).
### Example Usage
The following code will output all variables declared at the root of a file.
```javascript
estraverse.traverse(ast, {
    enter: function (node, parent) {
        if (node.type == 'FunctionExpression' || node.type == 'FunctionDeclaration')
            return estraverse.VisitorOption.Skip;
    },
    leave: function (node, parent) {
        if (node.type == 'VariableDeclarator')
          console.log(node.id.name);
    }
});
We can use `this.skip`, `this.remove` and `this.break` functions instead of using Skip, Remove and Break.
```javascript
estraverse.traverse(ast, {
    enter: function (node) {
        this.break();
    }
});
And estraverse provides `estraverse.replace` function. When returning node from `enter`/`leave`, current node is replaced with it.
```javascript
result = estraverse.replace(tree, {
    enter: function (node) {
        // Replace it with replaced.
        if (node.type === 'Literal')
            return replaced;
    }
});
By passing `visitor.keys` mapping, we can extend estraverse traversing functionality.
```javascript
// This tree contains a user-defined `TestExpression` node.
var tree = {
    type: 'TestExpression',
    // This 'argument' is the property containing the other **node**.
    argument: {
        type: 'Literal',
        value: 20
    },
    // This 'extended' is the property not containing the other **node**.
    extended: true
};
estraverse.traverse(tree, {
    enter: function (node) { },
    // Extending the existing traversing rules.
    keys: {
        // TargetNodeName: [ 'keys', 'containing', 'the', 'other', '**node**' ]
        TestExpression: ['argument']
    }
});
```
By passing `visitor.fallback` option, we can control the behavior when encountering unknown nodes.
```javascript
// This tree contains a user-defined `TestExpression` node.
var tree = {
    type: 'TestExpression',
    // This 'argument' is the property containing the other **node**.
    argument: {
        type: 'Literal',
        value: 20
    },
    // This 'extended' is the property not containing the other **node**.
    extended: true
};
estraverse.traverse(tree, {
    enter: function (node) { },
    // Iterating the child **nodes** of unknown nodes.
    fallback: 'iteration'
});
```
When `visitor.fallback` is a function, we can determine which keys to visit on each node.
```javascript
// This tree contains a user-defined `TestExpression` node.
var tree = {
    type: 'TestExpression',
    // This 'argument' is the property containing the other **node**.
    argument: {
        type: 'Literal',
        value: 20
    },
    // This 'extended' is the property not containing the other **node**.
    extended: true
};
estraverse.traverse(tree, {
    enter: function (node) { },
    // Skip the `argument` property of each node
    fallback: function(node) {
        return Object.keys(node).filter(function(key) {
            return key !== 'argument';
        });
    }
});
```
### License
Copyright (C) 2012-2016 [Yusuke Suzuki](http://github.com/Constellation)
 (twitter: [@Constellation](http://twitter.com/Constellation)) and other contributors.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
