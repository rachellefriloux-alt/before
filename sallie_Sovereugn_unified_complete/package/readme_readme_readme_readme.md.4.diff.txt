BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\yocto-queue\readme.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\node_modules\vue-eslint-parser\README.md
---- DIFF ----
# vue-eslint-parser
[![npm version](https://img.shields.io/npm/v/vue-eslint-parser.svg)](https://www.npmjs.com/package/vue-eslint-parser)
[![Downloads/month](https://img.shields.io/npm/dm/vue-eslint-parser.svg)](http://www.npmtrends.com/vue-eslint-parser)
[![Build Status](https://github.com/vuejs/vue-eslint-parser/workflows/CI/badge.svg)](https://github.com/vuejs/vue-eslint-parser/actions)
The ESLint custom parser for `.vue` files.
## ⤴️ Motivation
This parser allows us to lint the `<template>` of `.vue` files. We can make mistakes easily on `<template>` if we use complex directives and expressions in the template. This parser and the rules of [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue) would catch some of the mistakes.
## 💿 Installation
```bash
npm install --save-dev eslint vue-eslint-parser
## 📖 Usage
Write `parser` option into your `eslint.config.*` file.
import vueParser from "vue-eslint-parser"
export default [
    js.configs.recommended,
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
        },
    }
]
## 🔧 Options
`parserOptions` has the same properties as what [espree](https://github.com/eslint/espree#usage), the default parser of ESLint, is supporting.
For example:
```js
import vueParser from "vue-eslint-parser"
export default [
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
            sourceType: "module",
            ecmaVersion: "latest",
            parserOptions: {
                ecmaFeatures: {
                    globalReturn: false,
                    impliedStrict: false,
                    jsx: false
                }
            }
        },
    }
]
### parserOptions.parser
You can use `parserOptions.parser` property to specify a custom parser to parse `<script>` tags.
Other properties than parser would be given to the specified parser.
For example:
```js
import vueParser from "vue-eslint-parser"
import babelParser from "@babel/eslint-parser"
export default [
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: babelParser,
            }
        },
    }
]
```
```js
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"
export default [
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
            }
        },
    }
]
```
You can also specify an object and change the parser separately for `<script lang="...">`.
```js
import vueParser from "vue-eslint-parser"
import tsParser from "@typescript-eslint/parser"
export default [
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                "parser": {
                    // Script parser for `<script>`
                    "js": "espree",
                    // Script parser for `<script lang="ts">`
                    "ts": tsParser,
                    // Script parser for vue directives (e.g. `v-if=` or `:attribute=`)
                    // and vue interpolations (e.g. `{{variable}}`).
                    // If not specified, the parser determined by `<script lang ="...">` is used.
                    "<template>": "espree",
                }
            }
        },
    }
]
```
If the `parserOptions.parser` is `false`, the `vue-eslint-parser` skips parsing `<script>` tags completely.
This is useful for people who use the language ESLint community doesn't provide custom parser implementation.
### parserOptions.vueFeatures
You can use `parserOptions.vueFeatures` property to specify how to parse related to Vue features.
For example:
```js
import vueParser from "vue-eslint-parser"
export default [
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                vueFeatures: {
                    filter: true,
                    interpolationAsNonHTML: true,
                    styleCSSVariableInjection: true,
                    customMacros: []
                }
            }
        },
    }
]
```
### parserOptions.vueFeatures.filter
You can use `parserOptions.vueFeatures.filter` property to specify whether to parse the Vue2 filter. If you specify `false`, the parser does not parse `|` as a filter.
For example:
```json
{
    "parserOptions": {
        "vueFeatures": {
            "filter": false
        }
    }
}
```
If you specify `false`, it can be parsed in the same way as Vue 3.
The following template parses as a bitwise operation.

```vue
<template>
  <div>{{ a | b }}</div>
</template>
```

However, the following template that are valid in Vue 2 cannot be parsed.

```vue
<template>
  <div>{{ a | valid:filter }}</div>
</template>
```

### parserOptions.vueFeatures.interpolationAsNonHTML

You can use `parserOptions.vueFeatures.interpolationAsNonHTML` property to specify whether to parse the interpolation as HTML. If you specify `true`, the parser handles the interpolation as non-HTML (However, you can use HTML escaping in the interpolation). Default is `true`.
For example:

```json
{
    "parserOptions": {
        "vueFeatures": {
            "interpolationAsNonHTML": true
        }
    }
}
```

If you specify `true`, it can be parsed in the same way as Vue 3.
The following template can be parsed well.

```vue
<template>
  <div>{{a<b}}</div>
</template>
```

But, it cannot be parsed with Vue 2.

### parserOptions.vueFeatures.styleCSSVariableInjection

If set to `true`, to parse expressions in `v-bind` CSS functions inside `<style>` tags. `v-bind()` is parsed into the `VExpressionContainer` AST node and held in the `VElement` of `<style>`. Default is `true`.

See also to [here](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0043-sfc-style-variables.md).

### parserOptions.vueFeatures.customMacros

Specifies an array of names of custom macros other than Vue standard macros.  
For example, if you have a custom macro `defineFoo()` and you want it processed by the parser, specify `["defineFoo"]`.

Note that this option only works in `<script setup>`.

### parserOptions.templateTokenizer

**This is an experimental feature. It may be changed or deleted without notice in the minor version.**

You can use `parserOptions.templateTokenizer` property to specify custom tokenizers to parse `<template lang="...">` tags.

For example to enable parsing of pug templates:

```jsonc
{
    "parserOptions": {
        "templateTokenizer": {
             // template tokenizer for `<template lang="pug">`
            "pug": "vue-eslint-parser-template-tokenizer-pug",
        }
    }
}
```

This option is only intended for plugin developers. **Be careful** when using this option directly, as it may change behaviour of rules you might have enabled.  
If you just want **pug** support, use [eslint-plugin-vue-pug](https://github.com/rashfael/eslint-plugin-vue-pug) instead, which uses this option internally.

See [implementing-custom-template-tokenizers.md](./docs/implementing-custom-template-tokenizers.md) for information on creating your own template tokenizer.

## 🎇 Usage for custom rules / plugins

- This parser provides `parserServices` to traverse `<template>`.
    - `defineTemplateBodyVisitor(templateVisitor, scriptVisitor, options)` ... returns ESLint visitor to traverse `<template>`.
    - `getTemplateBodyTokenStore()` ... returns ESLint `TokenStore` to get the tokens of `<template>`.
    - `getDocumentFragment()` ... returns the root `VDocumentFragment`.
    - `defineCustomBlocksVisitor(context, customParser, rule, scriptVisitor)` ... returns ESLint visitor that parses and traverses the contents of the custom block.
    - `defineDocumentVisitor(documentVisitor, options)` ... returns ESLint visitor to traverses the document.
- [ast.md](./docs/ast.md) is `<template>` AST specification.
- [mustache-interpolation-spacing.js](https://github.com/vuejs/eslint-plugin-vue/blob/b434ff99d37f35570fa351681e43ba2cf5746db3/lib/rules/mustache-interpolation-spacing.js) is an example.
- Check your version of ESLint as the location of `defineTemplateBodyVisitor` was moved from `context` to `context.sourceCode` after major version `9.x`

### `defineTemplateBodyVisitor(templateBodyVisitor, scriptVisitor, options)`

*Arguments*

- `templateBodyVisitor` ... Event handlers for `<template>`.
- `scriptVisitor` ... Event handlers for `<script>` or scripts. (optional)
- `options` ... Options. (optional)
  - `templateBodyTriggerSelector` ... Script AST node selector that triggers the templateBodyVisitor. Default is `"Program:exit"`. (optional)

```ts
import { AST } from "vue-eslint-parser"

export function create(context) {
    return context.sourceCode.parserServices.defineTemplateBodyVisitor(
        // Event handlers for <template>.
        {
            VElement(node: AST.VElement): void {
                //...
            }
        },
        // Event handlers for <script> or scripts. (optional)
        {
            Program(node: AST.ESLintProgram): void {
                //...
            }
        },
        // Options. (optional)
        {
            templateBodyTriggerSelector: "Program:exit"
        }
    )
}
```

## ⚠️ Known Limitations

Some rules make warnings due to the outside of `<script>` tags.
Please disable those rules for `.vue` files as necessary.

- [eol-last](http://eslint.org/docs/rules/eol-last)
- [linebreak-style](http://eslint.org/docs/rules/linebreak-style)
- [max-len](http://eslint.org/docs/rules/max-len)
- [max-lines](http://eslint.org/docs/rules/max-lines)
- [no-trailing-spaces](http://eslint.org/docs/rules/no-trailing-spaces)
- [unicode-bom](http://eslint.org/docs/rules/unicode-bom)
- Other rules which are using the source code text instead of AST might be confused as well.

## 📰 Changelog

- [GitHub Releases](https://github.com/vuejs/vue-eslint-parser/releases)

## 🍻 Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

If you want to write code, please execute `npm install` after you cloned this repository.
The `npm install` command installs dependencies.

### Development Tools

- `npm test` runs tests and measures coverage.
- `npm run build` compiles TypeScript source code to `index.js`, `index.js.map`, and `index.d.ts`.
- `npm run coverage` shows the coverage result of `npm test` command with the default browser.
- `npm run clean` removes the temporary files which are created by `npm test` and `npm run build`.
- `npm run lint` runs ESLint.
- `npm run update-fixtures` updates files in `test/fixtures/ast` directory based on `test/fixtures/ast/*/source.vue` files.
- `npm run watch` runs `build`, `update-fixtures`, and tests with `--watch` option.

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
