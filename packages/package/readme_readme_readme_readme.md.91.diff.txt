BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@eslint-community\eslint-utils\node_modules\eslint-visitor-keys\README.md
---- DIFF ----
# eslint-visitor-keys
[![npm version](https://img.shields.io/npm/v/eslint-visitor-keys.svg)](https://www.npmjs.com/package/eslint-visitor-keys)
[![Downloads/month](https://img.shields.io/npm/dm/eslint-visitor-keys.svg)](http://www.npmtrends.com/eslint-visitor-keys)
[![Build Status](https://github.com/eslint/eslint-visitor-keys/workflows/CI/badge.svg)](https://github.com/eslint/eslint-visitor-keys/actions)
Constants and utilities about visitor keys to traverse AST.
## 💿 Installation
Use [npm] to install.
```bash
$ npm install eslint-visitor-keys
### Requirements
- [Node.js] `^12.22.0`, `^14.17.0`, or `>=16.0.0`
## 📖 Usage
To use in an ESM file:
import * as evk from "eslint-visitor-keys"
To use in a CommonJS file:
```js
const evk = require("eslint-visitor-keys")
### evk.KEYS
> type: `{ [type: string]: string[] | undefined }`
Visitor keys. This keys are frozen.
This is an object. Keys are the type of [ESTree] nodes. Their values are an array of property names which have child nodes.
For example:
```
console.log(evk.KEYS.AssignmentExpression) // → ["left", "right"]
```
### evk.getKeys(node)
> type: `(node: object) => string[]`
Get the visitor keys of a given AST node.
This is similar to `Object.keys(node)` of ES Standard, but some keys are excluded: `parent`, `leadingComments`, `trailingComments`, and names which start with `_`.
This will be used to traverse unknown nodes.
For example:
```js
const node = {
    type: "AssignmentExpression",
    left: { type: "Identifier", name: "foo" },
    right: { type: "Literal", value: 0 }
}
console.log(evk.getKeys(node)) // → ["type", "left", "right"]
```
### evk.unionWith(additionalKeys)
> type: `(additionalKeys: object) => { [type: string]: string[] | undefined }`

Make the union set with `evk.KEYS` and the given keys.

- The order of keys is, `additionalKeys` is at first, then `evk.KEYS` is concatenated after that.
- It removes duplicated keys as keeping the first one.

For example:

```js
console.log(evk.unionWith({
    MethodDefinition: ["decorators"]
})) // → { ..., MethodDefinition: ["decorators", "key", "value"], ... }
```

## 📰 Change log

See [GitHub releases](https://github.com/eslint/eslint-visitor-keys/releases).

## 🍻 Contributing

Welcome. See [ESLint contribution guidelines](https://eslint.org/docs/developer-guide/contributing/).

### Development commands

- `npm test` runs tests and measures code coverage.
- `npm run lint` checks source codes with ESLint.
- `npm run test:open-coverage` opens the code coverage report of the previous test with your default browser.


[npm]: https://www.npmjs.com/
[Node.js]: https://nodejs.org/
[ESTree]: https://github.com/estree/estree

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
