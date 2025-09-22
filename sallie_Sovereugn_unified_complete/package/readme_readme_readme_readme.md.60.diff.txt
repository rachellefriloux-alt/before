BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\eslint-plugin-vue\README.md
---- DIFF ----
# eslint-plugin-vue
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-vue.svg?style=flat)](https://npmjs.org/package/eslint-plugin-vue)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-vue.svg?style=flat)](https://npmjs.org/package/eslint-plugin-vue)
[![CI](https://img.shields.io/github/actions/workflow/status/vuejs/eslint-plugin-vue/CI.yml?style=flat&label=CI)](https://github.com/vuejs/eslint-plugin-vue/actions/workflows/CI.yml)
[![License](https://img.shields.io/github/license/vuejs/eslint-plugin-vue.svg?style=flat)](https://github.com/vuejs/eslint-plugin-vue/blob/master/LICENSE)
> Official ESLint plugin for Vue.js
## :book: Documentation
Please refer to the [official website](https://eslint.vuejs.org).
## :anchor: Versioning Policy
This plugin follows [Semantic Versioning].
However, please note that we do not follow [ESLint's Semantic Versioning Policy].
In minor version releases, this plugin may change the sharable configs provided by the plugin or the default behavior of the plugin's rules in order to add features to the plugin. Because we want to add many features to the plugin soon, so that users can easily take advantage of new features in Vue and Nuxt.
According to our policy, any minor update may report more linting errors than the previous release. As such, we recommend using the [tilde (`~`)](https://semver.npmjs.com/#syntax-examples) in `package.json` to guarantee the results of your builds.
[Semantic Versioning]: https://semver.org/
[ESLint's Semantic Versioning Policy]: https://github.com/eslint/eslint#semantic-versioning-policy
## :newspaper: Releases
This project uses [GitHub Releases](https://github.com/vuejs/eslint-plugin-vue/releases).
## :beers: Contribution Guide
Contributing is welcome! See the [ESLint Vue Plugin Developer Guide](https://eslint.vuejs.org/developer-guide).
### Working With Rules
Be sure to read the [official ESLint guide](https://eslint.org/docs/developer-guide/working-with-rules) before you start writing a new rule.
To see what an abstract syntax tree (AST) of your code looks like, you may use [AST Explorer](https://astexplorer.net). After opening [AST Explorer](https://astexplorer.net), select `Vue` as the syntax and `vue-eslint-parser` as the parser.
The default JavaScript parser must be replaced because [Vue.js single file components](https://vuejs.org/guide/scaling-up/sfc.html) are not plain JavaScript, but a custom file format. [`vue-eslint-parser`](https://github.com/vuejs/vue-eslint-parser) is a replacement parser that generates an enhanced AST with nodes that represent specific parts of the template syntax, as well as the contents of the `<script>` tag.
To learn more about certain nodes in a produced AST, see the [ESTree project page](https://github.com/estree/estree) and the [vue-eslint-parser AST documentation](https://github.com/vuejs/vue-eslint-parser/blob/master/docs/ast.md).
`vue-eslint-parser` provides a few useful parser services to help traverse the produced AST and access template tokens:
- `context.parserServices.defineTemplateBodyVisitor(visitor, scriptVisitor)`
- `context.parserServices.getTemplateBodyTokenStore()`
Check out an [example rule](https://github.com/vuejs/eslint-plugin-vue/blob/master/lib/rules/mustache-interpolation-spacing.js) to see usage of these services.
Be aware that depending on the code samples you write in tests, the `RuleTester` parser property must be set accordingly (this can be done on a test by test basis). See an [example here](https://github.com/vuejs/eslint-plugin-vue/blob/master/tests/lib/rules/attribute-hyphenation.js#L19).
If you're stuck, remember there are many rules available for reference. If you can't find the right solution, don't hesitate to reach out in [issues](https://github.com/vuejs/eslint-plugin-vue/issues) – we're happy to help!
## :lock: License
See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
# yocto-queue [![](https://badgen.net/bundlephobia/minzip/yocto-queue)](https://bundlephobia.com/result?p=yocto-queue)
> Tiny queue data structure
You should use this package instead of an array if you do a lot of `Array#push()` and `Array#shift()` on large arrays, since `Array#shift()` has [linear time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(N)%E2%80%94Linear%20Time) *O(n)* while `Queue#dequeue()` has [constant time complexity](https://medium.com/@ariel.salem1989/an-easy-to-use-guide-to-big-o-time-complexity-5dcf4be8a444#:~:text=O(1)%20%E2%80%94%20Constant%20Time) *O(1)*. That makes a huge difference for large arrays.
> A [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) is an ordered list of elements where an element is inserted at the end of the queue and is removed from the front of the queue. A queue works based on the first-in, first-out ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) principle.
## Install
```
$ npm install yocto-queue
```
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

