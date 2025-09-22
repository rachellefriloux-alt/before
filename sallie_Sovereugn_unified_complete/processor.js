'use strict'

let Document = require('./document')
let LazyResult = require('./lazy-result')
let NoWorkResult = require('./no-work-result')
let Root = require('./root')

class Processor {
  constructor(plugins = []) {
    this.version = '8.5.6'
    this.plugins = this.normalize(plugins)
  }

  normalize(plugins) {
    let normalized = []
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i()
      } else if (i.postcss) {
        i = i.postcss
      }

      if (typeof i === 'object' && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins)
      } else if (typeof i === 'object' && i.postcssPlugin) {
        normalized.push(i)
      } else if (typeof i === 'function') {
        normalized.push(i)
      } else if (typeof i === 'object' && (i.parse || i.stringify)) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(
            'PostCSS syntaxes cannot be used as plugins. Instead, please use ' +
              'one of the syntax/parser/stringifier options as outlined ' +
              'in your PostCSS runner documentation.'
          )
        }
      } else {
        throw new Error(i + ' is not a PostCSS plugin')
      }
    }
    return normalized
  }

  process(css, opts = {}) {
    if (
      !this.plugins.length &&
      !opts.parser &&
      !opts.stringifier &&
      !opts.syntax
    ) {
      return new NoWorkResult(this, css, opts)
    } else {
      return new LazyResult(this, css, opts)
    }
  }

  use(plugin) {
    this.plugins = this.plugins.concat(this.normalize([plugin]))
    return this
  }
}

module.exports = Processor
Processor.default = Processor

Root.registerProcessor(Processor)
Document.registerProcessor(Processor)

/**
 * @param {Map<string, string[]>} disableRuleKeys
 * @param {string} rule
 * @param {string} key
 */
function addDisableRule(disableRuleKeys, rule, key) {
  let keys = disableRuleKeys.get(rule)
  if (keys) {
    keys.push(key)
  } else {
    keys = [key]
    disableRuleKeys.set(rule, keys)
  }
}

/**
 * @param {LintMessage} message
 * @returns {string} message key
 */
function messageToKey(message) {
  return `line:${message.line},column${
    // -1 because +1 by ESLint's `report-translator`.
    message.column - 1
  }`
}

/**
 * Compares the locations of two objects in a source file
 * @param {Position} itemA The first object
 * @param {Position} itemB The second object
 * @returns {number} A value less than 1 if itemA appears before itemB in the source file, greater than 1 if
 * itemA appears after itemB in the source file, or 0 if itemA and itemB have the same location.
 */
function compareLocations(itemA, itemB) {
  return itemA.line - itemB.line || itemA.column - itemB.column
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function Processor(func, options) {
  this.func = func || function noop() {};
  this.funcRes = null;
  this.options = options;
}
