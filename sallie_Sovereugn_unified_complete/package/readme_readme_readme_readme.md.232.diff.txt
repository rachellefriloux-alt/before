BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\bytes\Readme.md
---- DIFF ----
# Bytes utility
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coveralls-image]][coveralls-url]
Utility to parse a string bytes (ex: `1TB`) to bytes (`1099511627776`) and vice-versa.
## Installation
This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):
```bash
$ npm install bytes
var bytes = require('bytes');
#### bytes(number｜string value, [options]): number｜string｜null
Default export function. Delegates to either `bytes.format` or `bytes.parse` based on the type of `value`.
**Arguments**
| Name    | Type     | Description        |
|---------|----------|--------------------|
| value   | `number`｜`string` | Number value to format or string value to parse |
| options | `Object` | Conversion options for `format` |
**Returns**
| Name    | Type             | Description                                     |
|---------|------------------|-------------------------------------------------|
| results | `string`｜`number`｜`null` | Return null upon error. Numeric value in bytes, or string value otherwise. |
**Example**
```js
bytes(1024);
// output: '1KB'
bytes('1KB');
// output: 1024
#### bytes.format(number value, [options]): string｜null
Format the given value in bytes into a string. If the value is negative, it is kept as such. If it is a float, it is
 rounded.
**Arguments**
| Name    | Type     | Description        |
|---------|----------|--------------------|
| value   | `number` | Value in bytes     |
| options | `Object` | Conversion options |
**Options**
| Property          | Type   | Description                                                                             |
|-------------------|--------|-----------------------------------------------------------------------------------------|
| decimalPlaces | `number`｜`null` | Maximum number of decimal places to include in output. Default value to `2`. |
| fixedDecimals | `boolean`｜`null` | Whether to always display the maximum number of decimal places. Default value to `false` |
| thousandsSeparator | `string`｜`null` | Example of values: `' '`, `','` and `'.'`... Default value to `''`. |
| unit | `string`｜`null` | The unit in which the result will be returned (B/KB/MB/GB/TB). Default value to `''` (which means auto detect). |
| unitSeparator | `string`｜`null` | Separator to use between number and unit. Default value to `''`. |
**Returns**
| Name    | Type             | Description                                     |
|---------|------------------|-------------------------------------------------|
| results | `string`｜`null` | Return null upon error. String value otherwise. |
**Example**
```js
bytes.format(1024);
// output: '1KB'
bytes.format(1000);
// output: '1000B'
bytes.format(1000, {thousandsSeparator: ' '});
// output: '1 000B'

bytes.format(1024 * 1.7, {decimalPlaces: 0});
// output: '2KB'

bytes.format(1024, {unitSeparator: ' '});
// output: '1 KB'
```

#### bytes.parse(string｜number value): number｜null

Parse the string value into an integer in bytes. If no unit is given, or `value`
is a number, it is assumed the value is in bytes.

Supported units and abbreviations are as follows and are case-insensitive:

  * `b` for bytes
  * `kb` for kilobytes
  * `mb` for megabytes
  * `gb` for gigabytes
  * `tb` for terabytes
  * `pb` for petabytes

The units are in powers of two, not ten. This means 1kb = 1024b according to this parser.

**Arguments**

| Name          | Type   | Description        |
|---------------|--------|--------------------|
| value   | `string`｜`number` | String to parse, or number in bytes.   |

**Returns**

| Name    | Type        | Description             |
|---------|-------------|-------------------------|
| results | `number`｜`null` | Return null upon error. Value in bytes otherwise. |

**Example**

```js
bytes.parse('1KB');
// output: 1024

bytes.parse('1024');
// output: 1024

bytes.parse(1024);
// output: 1024
```

## License

[MIT](LICENSE)

[ci-image]: https://badgen.net/github/checks/visionmedia/bytes.js/master?label=ci
[ci-url]: https://github.com/visionmedia/bytes.js/actions?query=workflow%3Aci
[coveralls-image]: https://badgen.net/coveralls/c/github/visionmedia/bytes.js/master
[coveralls-url]: https://coveralls.io/r/visionmedia/bytes.js?branch=master
[downloads-image]: https://badgen.net/npm/dm/bytes
[downloads-url]: https://npmjs.org/package/bytes
[npm-image]: https://badgen.net/npm/v/bytes
[npm-url]: https://npmjs.org/package/bytes

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
