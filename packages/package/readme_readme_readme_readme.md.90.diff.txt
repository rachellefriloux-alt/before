BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@eslint-community\regexpp\README.md
---- DIFF ----
# @eslint-community/regexpp
[![npm version](https://img.shields.io/npm/v/@eslint-community/regexpp.svg)](https://www.npmjs.com/package/@eslint-community/regexpp)
[![Downloads/month](https://img.shields.io/npm/dm/@eslint-community/regexpp.svg)](http://www.npmtrends.com/@eslint-community/regexpp)
[![Build Status](https://github.com/eslint-community/regexpp/workflows/CI/badge.svg)](https://github.com/eslint-community/regexpp/actions)
[![codecov](https://codecov.io/gh/eslint-community/regexpp/branch/main/graph/badge.svg)](https://codecov.io/gh/eslint-community/regexpp)
A regular expression parser for ECMAScript.
## 💿 Installation
```bash
$ npm install @eslint-community/regexpp
- require Node@^12.0.0 || ^14.0.0 || >=16.0.0.
## 📖 Usage
```ts
import {
    AST,
    RegExpParser,
    RegExpValidator,
    RegExpVisitor,
    parseRegExpLiteral,
    validateRegExpLiteral,
    visitRegExpAST
} from "@eslint-community/regexpp"
### parseRegExpLiteral(source, options?)
Parse a given regular expression literal then make AST object.
This is equivalent to `new RegExpParser(options).parseLiteral(source)`.
- **Parameters:**
    - `source` (`string | RegExp`) The source code to parse.
    - `options?` ([`RegExpParser.Options`]) The options to parse.
- **Return:**
    - The AST of the regular expression.
### validateRegExpLiteral(source, options?)
Validate a given regular expression literal.
This is equivalent to `new RegExpValidator(options).validateLiteral(source)`.
- **Parameters:**
    - `source` (`string`) The source code to validate.
    - `options?` ([`RegExpValidator.Options`]) The options to validate.
### visitRegExpAST(ast, handlers)
Visit each node of a given AST.
This is equivalent to `new RegExpVisitor(handlers).visit(ast)`.
- **Parameters:**
    - `ast` ([`AST.Node`]) The AST to visit.
    - `handlers` ([`RegExpVisitor.Handlers`]) The callbacks.
### RegExpParser
#### new RegExpParser(options?)
- **Parameters:**
    - `options?` ([`RegExpParser.Options`]) The options to parse.
#### parser.parseLiteral(source, start?, end?)
Parse a regular expression literal.
- **Parameters:**
    - `source` (`string`) The source code to parse. E.g. `"/abc/g"`.
    - `start?` (`number`) The start index in the source code. Default is `0`.
    - `end?` (`number`) The end index in the source code. Default is `source.length`.
- **Return:**
    - The AST of the regular expression.
#### parser.parsePattern(source, start?, end?, flags?)
Parse a regular expression pattern.
- **Parameters:**
    - `source` (`string`) The source code to parse. E.g. `"abc"`.
    - `start?` (`number`) The start index in the source code. Default is `0`.
    - `end?` (`number`) The end index in the source code. Default is `source.length`.
    - `flags?` (`{ unicode?: boolean, unicodeSets?: boolean }`) The flags to enable Unicode mode, and Unicode Set mode.
- **Return:**
    - The AST of the regular expression pattern.

#### parser.parseFlags(source, start?, end?)

Parse a regular expression flags.

- **Parameters:**
    - `source` (`string`) The source code to parse. E.g. `"gim"`.
    - `start?` (`number`) The start index in the source code. Default is `0`.
    - `end?` (`number`) The end index in the source code. Default is `source.length`.
- **Return:**
    - The AST of the regular expression flags.

### RegExpValidator

#### new RegExpValidator(options)

- **Parameters:**
    - `options` ([`RegExpValidator.Options`]) The options to validate.

#### validator.validateLiteral(source, start, end)

Validate a regular expression literal.

- **Parameters:**
    - `source` (`string`) The source code to validate.
    - `start?` (`number`) The start index in the source code. Default is `0`.
    - `end?` (`number`) The end index in the source code. Default is `source.length`.

#### validator.validatePattern(source, start, end, flags)

Validate a regular expression pattern.

- **Parameters:**
    - `source` (`string`) The source code to validate.
    - `start?` (`number`) The start index in the source code. Default is `0`.
    - `end?` (`number`) The end index in the source code. Default is `source.length`.
    - `flags?` (`{ unicode?: boolean, unicodeSets?: boolean }`) The flags to enable Unicode mode, and Unicode Set mode.

#### validator.validateFlags(source, start, end)

Validate a regular expression flags.

- **Parameters:**
    - `source` (`string`) The source code to validate.
    - `start?` (`number`) The start index in the source code. Default is `0`.
    - `end?` (`number`) The end index in the source code. Default is `source.length`.

### RegExpVisitor

#### new RegExpVisitor(handlers)

- **Parameters:**
    - `handlers` ([`RegExpVisitor.Handlers`]) The callbacks.

#### visitor.visit(ast)

Validate a regular expression literal.

- **Parameters:**
    - `ast` ([`AST.Node`]) The AST to visit.

## 📰 Changelog

- [GitHub Releases](https://github.com/eslint-community/regexpp/releases)

## 🍻 Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run build` compiles TypeScript source code to `index.js`, `index.js.map`, and `index.d.ts`.
- `npm run clean` removes the temporary files which are created by `npm test` and `npm run build`.
- `npm run lint` runs ESLint.
- `npm run update:test` updates test fixtures.
- `npm run update:ids` updates `src/unicode/ids.ts`.
- `npm run watch` runs tests with `--watch` option.

[`AST.Node`]: src/ast.ts#L4
[`RegExpParser.Options`]: src/parser.ts#L743
[`RegExpValidator.Options`]: src/validator.ts#L220
[`RegExpVisitor.Handlers`]: src/visitor.ts#L291

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
