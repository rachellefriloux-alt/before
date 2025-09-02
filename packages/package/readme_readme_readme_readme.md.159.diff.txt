BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\@vue\server-renderer\README.md
---- DIFF ----
# @vue/server-renderer
**Note: as of 3.2.13+, this package is included as a dependency of the main `vue` package and can be accessed as `vue/server-renderer`. This means you no longer need to explicitly install this package and ensure its version match that of `vue`'s. Just use the `vue/server-renderer` deep import instead.**
## Basic API
### `renderToString`
**Signature**
```ts
function renderToString(
  input: App | VNode,
  context?: SSRContext,
): Promise<string>
**Usage**
const { createSSRApp } = require('vue')
const { renderToString } = require('@vue/server-renderer')
const app = createSSRApp({
  data: () => ({ msg: 'hello' }),
  template: `<div>{{ msg }}</div>`,
})
;(async () => {
  const html = await renderToString(app)
  console.log(html)
})()
### Handling Teleports
If the rendered app contains teleports, the teleported content will not be part of the rendered string. Instead, they are exposed under the `teleports` property of the ssr context object:
```js
const ctx = {}
const html = await renderToString(app, ctx)
console.log(ctx.teleports) // { '#teleported': 'teleported content' }
## Streaming API
### `renderToNodeStream`
Renders input as a [Node.js Readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable).
**Signature**
```ts
function renderToNodeStream(input: App | VNode, context?: SSRContext): Readable
```
**Usage**
```js
// inside a Node.js http handler
renderToNodeStream(app).pipe(res)
```
**Note:** This method is not supported in the ESM build of `@vue/server-renderer`, which is decoupled from Node.js environments. Use `pipeToNodeWritable` instead.
### `pipeToNodeWritable`
Render and pipe to an existing [Node.js Writable stream](https://nodejs.org/api/stream.html#stream_writable_streams) instance.
**Signature**
```ts
function pipeToNodeWritable(
  input: App | VNode,
  context: SSRContext = {},
  writable: Writable,
): void
```
**Usage**
```js
// inside a Node.js http handler
pipeToNodeWritable(app, {}, res)
```
### `renderToWebStream`

Renders input as a [Web ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

**Signature**

```ts
function renderToWebStream(
  input: App | VNode,
  context?: SSRContext,
): ReadableStream
```

**Usage**

```js
// inside an environment with ReadableStream support
return new Response(renderToWebStream(app))
```

**Note:** in environments that do not expose `ReadableStream` constructor in the global scope, `pipeToWebWritable` should be used instead.

### `pipeToWebWritable`

Render and pipe to an existing [Web WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) instance.

**Signature**

```ts
function pipeToWebWritable(
  input: App | VNode,
  context: SSRContext = {},
  writable: WritableStream,
): void
```

**Usage**

This is typically used in combination with [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream):

```js
// TransformStream is available in environments such as CloudFlare workers.
// in Node.js, TransformStream needs to be explicitly imported from 'stream/web'
const { readable, writable } = new TransformStream()
pipeToWebWritable(app, {}, writable)

return new Response(readable)
```

### `renderToSimpleStream`

Renders input in streaming mode using a simple readable interface.

**Signature**

```ts
function renderToSimpleStream(
  input: App | VNode,
  context: SSRContext,
  options: SimpleReadable,
): SimpleReadable

interface SimpleReadable {
  push(content: string | null): void
  destroy(err: any): void
}
```

**Usage**

```js
let res = ''

renderToSimpleStream(
  app,
  {},
  {
    push(chunk) {
      if (chunk === null) {
        // done
        console(`render complete: ${res}`)
      } else {
        res += chunk
      }
    },
    destroy(err) {
      // error encountered
    },
  },
)
```

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
