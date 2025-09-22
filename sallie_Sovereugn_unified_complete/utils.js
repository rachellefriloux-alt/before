"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allExpandedTypes = exports.VISITOR_KEYS = exports.NODE_PARENT_VALIDATIONS = exports.NODE_FIELDS = exports.FLIPPED_ALIAS_KEYS = exports.DEPRECATED_KEYS = exports.BUILDER_KEYS = exports.ALIAS_KEYS = void 0;
exports.arrayOf = arrayOf;
exports.arrayOfType = arrayOfType;
exports.assertEach = assertEach;
exports.assertNodeOrValueType = assertNodeOrValueType;
exports.assertNodeType = assertNodeType;
exports.assertOneOf = assertOneOf;
exports.assertOptionalChainStart = assertOptionalChainStart;
exports.assertShape = assertShape;
exports.assertValueType = assertValueType;
exports.chain = chain;
exports.default = defineType;
exports.defineAliasedType = defineAliasedType;
exports.validate = validate;
exports.validateArrayOfType = validateArrayOfType;
exports.validateOptional = validateOptional;
exports.validateOptionalType = validateOptionalType;
exports.validateType = validateType;
var _is = require("../validators/is.js");
var _validate = require("../validators/validate.js");
const VISITOR_KEYS = exports.VISITOR_KEYS = {};
const ALIAS_KEYS = exports.ALIAS_KEYS = {};
const FLIPPED_ALIAS_KEYS = exports.FLIPPED_ALIAS_KEYS = {};
const NODE_FIELDS = exports.NODE_FIELDS = {};
const BUILDER_KEYS = exports.BUILDER_KEYS = {};
const DEPRECATED_KEYS = exports.DEPRECATED_KEYS = {};
const NODE_PARENT_VALIDATIONS = exports.NODE_PARENT_VALIDATIONS = {};
function getType(val) {
  if (Array.isArray(val)) {
    return "array";
  } else if (val === null) {
    return "null";
  } else {
    return typeof val;
  }
}
function validate(validate) {
  return {
    validate
  };
}
function validateType(...typeNames) {
  return validate(assertNodeType(...typeNames));
}
function validateOptional(validate) {
  return {
    validate,
    optional: true
  };
}
function validateOptionalType(...typeNames) {
  return {
    validate: assertNodeType(...typeNames),
    optional: true
  };
}
function arrayOf(elementType) {
  return chain(assertValueType("array"), assertEach(elementType));
}
function arrayOfType(...typeNames) {
  return arrayOf(assertNodeType(...typeNames));
}
function validateArrayOfType(...typeNames) {
  return validate(arrayOfType(...typeNames));
}
function assertEach(callback) {
  const childValidator = process.env.BABEL_TYPES_8_BREAKING ? _validate.validateChild : () => {};
  function validator(node, key, val) {
    if (!Array.isArray(val)) return;
    let i = 0;
    const subKey = {
      toString() {
        return `${key}[${i}]`;
      }
    };
    for (; i < val.length; i++) {
      const v = val[i];
      callback(node, subKey, v);
      childValidator(node, subKey, v);
    }
  }
  validator.each = callback;
  return validator;
}
function assertOneOf(...values) {
  function validate(node, key, val) {
    if (!values.includes(val)) {
      throw new TypeError(`Property ${key} expected value to be one of ${JSON.stringify(values)} but got ${JSON.stringify(val)}`);
    }
  }
  validate.oneOf = values;
  return validate;
}
const allExpandedTypes = exports.allExpandedTypes = [];
function assertNodeType(...types) {
  const expandedTypes = new Set();
  allExpandedTypes.push({
    types,
    set: expandedTypes
  });
  function validate(node, key, val) {
    const valType = val == null ? void 0 : val.type;
    if (valType != null) {
      if (expandedTypes.has(valType)) {
        (0, _validate.validateChild)(node, key, val);
        return;
      }
      if (valType === "Placeholder") {
        for (const type of types) {
          if ((0, _is.default)(type, val)) {
            (0, _validate.validateChild)(node, key, val);
            return;
          }
        }
      }
    }
    throw new TypeError(`Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(types)} but instead got ${JSON.stringify(valType)}`);
  }
  validate.oneOfNodeTypes = types;
  return validate;
}
function assertNodeOrValueType(...types) {
  function validate(node, key, val) {
    const primitiveType = getType(val);
    for (const type of types) {
      if (primitiveType === type || (0, _is.default)(type, val)) {
        (0, _validate.validateChild)(node, key, val);
        return;
      }
    }
    throw new TypeError(`Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(types)} but instead got ${JSON.stringify(val == null ? void 0 : val.type)}`);
  }
  validate.oneOfNodeOrValueTypes = types;
  return validate;
}
function assertValueType(type) {
  function validate(node, key, val) {
    if (getType(val) === type) {
      return;
    }
    throw new TypeError(`Property ${key} expected type of ${type} but got ${getType(val)}`);
  }
  validate.type = type;
  return validate;
}
function assertShape(shape) {
  const keys = Object.keys(shape);
  function validate(node, key, val) {
    const errors = [];
    for (const property of keys) {
      try {
        (0, _validate.validateField)(node, property, val[property], shape[property]);
      } catch (error) {
        if (error instanceof TypeError) {
          errors.push(error.message);
          continue;
        }
        throw error;
      }
    }
    if (errors.length) {
      throw new TypeError(`Property ${key} of ${node.type} expected to have the following:\n${errors.join("\n")}`);
    }
  }
  validate.shapeOf = shape;
  return validate;
}
function assertOptionalChainStart() {
  function validate(node) {
    var _current;
    let current = node;
    while (node) {
      const {
        type
      } = current;
      if (type === "OptionalCallExpression") {
        if (current.optional) return;
        current = current.callee;
        continue;
      }
      if (type === "OptionalMemberExpression") {
        if (current.optional) return;
        current = current.object;
        continue;
      }
      break;
    }
    throw new TypeError(`Non-optional ${node.type} must chain from an optional OptionalMemberExpression or OptionalCallExpression. Found chain from ${(_current = current) == null ? void 0 : _current.type}`);
  }
  return validate;
}
function chain(...fns) {
  function validate(...args) {
    for (const fn of fns) {
      fn(...args);
    }
  }
  validate.chainOf = fns;
  if (fns.length >= 2 && "type" in fns[0] && fns[0].type === "array" && !("each" in fns[1])) {
    throw new Error(`An assertValueType("array") validator can only be followed by an assertEach(...) validator.`);
  }
  return validate;
}
const validTypeOpts = new Set(["aliases", "builder", "deprecatedAlias", "fields", "inherits", "visitor", "validate"]);
const validFieldKeys = new Set(["default", "optional", "deprecated", "validate"]);
const store = {};
function defineAliasedType(...aliases) {
  return (type, opts = {}) => {
    let defined = opts.aliases;
    if (!defined) {
      var _store$opts$inherits$;
      if (opts.inherits) defined = (_store$opts$inherits$ = store[opts.inherits].aliases) == null ? void 0 : _store$opts$inherits$.slice();
      defined != null ? defined : defined = [];
      opts.aliases = defined;
    }
    const additional = aliases.filter(a => !defined.includes(a));
    defined.unshift(...additional);
    defineType(type, opts);
  };
}
function defineType(type, opts = {}) {
  const inherits = opts.inherits && store[opts.inherits] || {};
  let fields = opts.fields;
  if (!fields) {
    fields = {};
    if (inherits.fields) {
      const keys = Object.getOwnPropertyNames(inherits.fields);
      for (const key of keys) {
        const field = inherits.fields[key];
        const def = field.default;
        if (Array.isArray(def) ? def.length > 0 : def && typeof def === "object") {
          throw new Error("field defaults can only be primitives or empty arrays currently");
        }
        fields[key] = {
          default: Array.isArray(def) ? [] : def,
          optional: field.optional,
          deprecated: field.deprecated,
          validate: field.validate
        };
      }
    }
  }
  const visitor = opts.visitor || inherits.visitor || [];
  const aliases = opts.aliases || inherits.aliases || [];
  const builder = opts.builder || inherits.builder || opts.visitor || [];
  for (const k of Object.keys(opts)) {
    if (!validTypeOpts.has(k)) {
      throw new Error(`Unknown type option "${k}" on ${type}`);
    }
  }
  if (opts.deprecatedAlias) {
    DEPRECATED_KEYS[opts.deprecatedAlias] = type;
  }
  for (const key of visitor.concat(builder)) {
    fields[key] = fields[key] || {};
  }
  for (const key of Object.keys(fields)) {
    const field = fields[key];
    if (field.default !== undefined && !builder.includes(key)) {
      field.optional = true;
    }
    if (field.default === undefined) {
      field.default = null;
    } else if (!field.validate && field.default != null) {
      field.validate = assertValueType(getType(field.default));
    }
    for (const k of Object.keys(field)) {
      if (!validFieldKeys.has(k)) {
        throw new Error(`Unknown field key "${k}" on ${type}.${key}`);
      }
    }
  }
  VISITOR_KEYS[type] = opts.visitor = visitor;
  BUILDER_KEYS[type] = opts.builder = builder;
  NODE_FIELDS[type] = opts.fields = fields;
  ALIAS_KEYS[type] = opts.aliases = aliases;
  aliases.forEach(alias => {
    FLIPPED_ALIAS_KEYS[alias] = FLIPPED_ALIAS_KEYS[alias] || [];
    FLIPPED_ALIAS_KEYS[alias].push(type);
  });
  if (opts.validate) {
    NODE_PARENT_VALIDATIONS[type] = opts.validate;
  }
  store[type] = opts;
}

//# sourceMappingURL=utils.js.map


'use strict'

/**
 * Module dependencies.
 */

var bytes = require('bytes')
var contentType = require('content-type')
var typeis = require('type-is')

/**
 * Module exports.
 */

module.exports = {
  getCharset,
  normalizeOptions
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset (req) {
  try {
    return (contentType.parse(req).parameters.charset || '').toLowerCase()
  } catch {
    return undefined
  }
}

/**
 * Get the simple type checker.
 *
 * @param {string | string[]} type
 * @return {function}
 */

function typeChecker (type) {
  return function checkType (req) {
    return Boolean(typeis(req, type))
  }
}

/**
 * Normalizes the common options for all parsers.
 *
 * @param {object} options options to normalize
 * @param {string | string[] | function} defaultType default content type(s) or a function to determine it
 * @returns {object}
 */
function normalizeOptions (options, defaultType) {
  if (!defaultType) {
    // Parsers must define a default content type
    throw new TypeError('defaultType must be provided')
  }

  var inflate = options?.inflate !== false
  var limit = typeof options?.limit !== 'number'
    ? bytes.parse(options?.limit || '100kb')
    : options?.limit
  var type = options?.type || defaultType
  var verify = options?.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  return {
    inflate,
    limit,
    verify,
    shouldParse
  }
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
const secret = Symbol('secret');
/**
 * @internal
 */
const mismatch = Symbol('mismatch');
/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf | .toEqualTypeOf()} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf | .toMatchTypeOf()}.
 *
 * @internal
 */
const avalue = Symbol('avalue');


/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @api private
 */

var { METHODS } = require('node:http');
var contentType = require('content-type');
var etag = require('etag');
var mime = require('mime-types')
var proxyaddr = require('proxy-addr');
var qs = require('qs');
var querystring = require('querystring');

/**
 * A list of lowercased HTTP methods that are supported by Node.js.
 * @api private
 */
exports.methods = METHODS.map((method) => method.toLowerCase());

/**
 * Return strong ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

exports.etag = createETagGenerator({ weak: false })

/**
 * Return weak ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

exports.wetag = createETagGenerator({ weak: true })

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {String} type
 * @return {Object}
 * @api private
 */

exports.normalizeType = function(type){
  return ~type.indexOf('/')
    ? acceptParams(type)
    : { value: (mime.lookup(type) || 'application/octet-stream'), params: {} }
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api private
 */

exports.normalizeTypes = function(types) {
  return types.map(exports.normalizeType);
};


/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function acceptParams (str) {
  var length = str.length;
  var colonIndex = str.indexOf(';');
  var index = colonIndex === -1 ? length : colonIndex;
  var ret = { value: str.slice(0, index).trim(), quality: 1, params: {} };

  while (index < length) {
    var splitIndex = str.indexOf('=', index);
    if (splitIndex === -1) break;

    var colonIndex = str.indexOf(';', index);
    var endIndex = colonIndex === -1 ? length : colonIndex;

    if (splitIndex > endIndex) {
      index = str.lastIndexOf(';', splitIndex - 1) + 1;
      continue;
    }

    var key = str.slice(index, splitIndex).trim();
    var value = str.slice(splitIndex + 1, endIndex).trim();

    if (key === 'q') {
      ret.quality = parseFloat(value);
    } else {
      ret.params[key] = value;
    }

    index = endIndex + 1;
  }

  return ret;
}

/**
 * Compile "etag" value to function.
 *
 * @param  {Boolean|String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileETag = function(val) {
  var fn;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
    case 'weak':
      fn = exports.wetag;
      break;
    case false:
      break;
    case 'strong':
      fn = exports.etag;
      break;
    default:
      throw new TypeError('unknown value for etag function: ' + val);
  }

  return fn;
}

/**
 * Compile "query parser" value to function.
 *
 * @param  {String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileQueryParser = function compileQueryParser(val) {
  var fn;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
    case 'simple':
      fn = querystring.parse;
      break;
    case false:
      break;
    case 'extended':
      fn = parseExtendedQueryString;
      break;
    default:
      throw new TypeError('unknown value for query parser function: ' + val);
  }

  return fn;
}

/**
 * Compile "proxy trust" value to function.
 *
 * @param  {Boolean|String|Number|Array|Function} val
 * @return {Function}
 * @api private
 */

exports.compileTrust = function(val) {
  if (typeof val === 'function') return val;

  if (val === true) {
    // Support plain true/false
    return function(){ return true };
  }

  if (typeof val === 'number') {
    // Support trusting hop count
    return function(a, i){ return i < val };
  }

  if (typeof val === 'string') {
    // Support comma-separated values
    val = val.split(',')
      .map(function (v) { return v.trim() })
  }

  return proxyaddr.compile(val || []);
}

/**
 * Set the charset in a given Content-Type string.
 *
 * @param {String} type
 * @param {String} charset
 * @return {String}
 * @api private
 */

exports.setCharset = function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  // parse type
  var parsed = contentType.parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return contentType.format(parsed);
};

/**
 * Create an ETag generator function, generating ETags with
 * the given options.
 *
 * @param {object} options
 * @return {function}
 * @private
 */

function createETagGenerator (options) {
  return function generateETag (body, encoding) {
    var buf = !Buffer.isBuffer(body)
      ? Buffer.from(body, encoding)
      : body

    return etag(buf, options)
  }
}

/**
 * Parse an extended query string with qs.
 *
 * @param {String} str
 * @return {Object}
 * @private
 */

function parseExtendedQueryString(str) {
  return qs.parse(str, {
    allowPrototypes: true
  });
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.has = void 0;
exports.merge = merge;
exports.assign_single_source = assign_single_source;
exports.decode = decode;
exports.compact = compact;
exports.is_regexp = is_regexp;
exports.is_buffer = is_buffer;
exports.combine = combine;
exports.maybe_map = maybe_map;
const formats_1 = require("./formats.js");
const values_1 = require("../utils/values.js");
let has = (obj, key) => ((exports.has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
    (0, exports.has)(obj, key));
exports.has = has;
const hex_table = /* @__PURE__ */ (() => {
    const array = [];
    for (let i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }
    return array;
})();
function compact_queue(queue) {
    while (queue.length > 1) {
        const item = queue.pop();
        if (!item)
            continue;
        const obj = item.obj[item.prop];
        if ((0, values_1.isArray)(obj)) {
            const compacted = [];
            for (let j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }
            // @ts-ignore
            item.obj[item.prop] = compacted;
        }
    }
}
function array_to_object(source, options) {
    const obj = options && options.plainObjects ? Object.create(null) : {};
    for (let i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }
    return obj;
}
function merge(target, source, options = {}) {
    if (!source) {
        return target;
    }
    if (typeof source !== 'object') {
        if ((0, values_1.isArray)(target)) {
            target.push(source);
        }
        else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !(0, exports.has)(Object.prototype, source)) {
                target[source] = true;
            }
        }
        else {
            return [target, source];
        }
        return target;
    }
    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }
    let mergeTarget = target;
    if ((0, values_1.isArray)(target) && !(0, values_1.isArray)(source)) {
        // @ts-ignore
        mergeTarget = array_to_object(target, options);
    }
    if ((0, values_1.isArray)(target) && (0, values_1.isArray)(source)) {
        source.forEach(function (item, i) {
            if ((0, exports.has)(target, i)) {
                const targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                }
                else {
                    target.push(item);
                }
            }
            else {
                target[i] = item;
            }
        });
        return target;
    }
    return Object.keys(source).reduce(function (acc, key) {
        const value = source[key];
        if ((0, exports.has)(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
}
function assign_single_source(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
}
function decode(str, _, charset) {
    const strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    }
    catch (e) {
        return strWithoutPlus;
    }
}
const limit = 1024;
const encode = (str, _defaultEncoder, charset, _kind, format) => {
    // This code was originally written by Brian White for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }
    let string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    }
    else if (typeof str !== 'string') {
        string = String(str);
    }
    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }
    let out = '';
    for (let j = 0; j < string.length; j += limit) {
        const segment = string.length >= limit ? string.slice(j, j + limit) : string;
        const arr = [];
        for (let i = 0; i < segment.length; ++i) {
            let c = segment.charCodeAt(i);
            if (c === 0x2d || // -
                c === 0x2e || // .
                c === 0x5f || // _
                c === 0x7e || // ~
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c >= 0x41 && c <= 0x5a) || // a-z
                (c >= 0x61 && c <= 0x7a) || // A-Z
                (format === formats_1.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }
            if (c < 0x80) {
                arr[arr.length] = hex_table[c];
                continue;
            }
            if (c < 0x800) {
                arr[arr.length] = hex_table[0xc0 | (c >> 6)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            if (c < 0xd800 || c >= 0xe000) {
                arr[arr.length] =
                    hex_table[0xe0 | (c >> 12)] + hex_table[0x80 | ((c >> 6) & 0x3f)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            i += 1;
            c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));
            arr[arr.length] =
                hex_table[0xf0 | (c >> 18)] +
                    hex_table[0x80 | ((c >> 12) & 0x3f)] +
                    hex_table[0x80 | ((c >> 6) & 0x3f)] +
                    hex_table[0x80 | (c & 0x3f)];
        }
        out += arr.join('');
    }
    return out;
};
exports.encode = encode;
function compact(value) {
    const queue = [{ obj: { o: value }, prop: 'o' }];
    const refs = [];
    for (let i = 0; i < queue.length; ++i) {
        const item = queue[i];
        // @ts-ignore
        const obj = item.obj[item.prop];
        const keys = Object.keys(obj);
        for (let j = 0; j < keys.length; ++j) {
            const key = keys[j];
            const val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }
    compact_queue(queue);
    return value;
}
function is_regexp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}
function is_buffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function combine(a, b) {
    return [].concat(a, b);
}
function maybe_map(val, fn) {
    if ((0, values_1.isArray)(val)) {
        const mapped = [];
        for (let i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
}
//# sourceMappingURL=utils.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("./tslib.js");
tslib_1.__exportStar(require("./utils/values.js"), exports);
tslib_1.__exportStar(require("./utils/base64.js"), exports);
tslib_1.__exportStar(require("./utils/env.js"), exports);
tslib_1.__exportStar(require("./utils/log.js"), exports);
tslib_1.__exportStar(require("./utils/uuid.js"), exports);
tslib_1.__exportStar(require("./utils/sleep.js"), exports);
//# sourceMappingURL=utils.js.map

/*global navigator*/
'use strict';

const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = require('./constants');

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.isWindows = () => {
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    return platform === 'win32' || platform === 'windows';
  }

  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'win32';
  }

  return false;
};

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};

exports.basename = (path, { windows } = {}) => {
  const segs = path.split(windows ? /[\\/]/ : '/');
  const last = segs[segs.length - 1];

  if (last === '') {
    return segs[segs.length - 2];
  }

  return last;
};


'use strict';

var formats = require('./formats');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? { __proto__: null } : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object' && typeof source !== 'function') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if (
                (options && (options.plainObjects || options.allowPrototypes))
                || !has.call(Object.prototype, source)
            ) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, defaultDecoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var limit = 1024;

/* eslint operator-linebreak: [2, "before"] */

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var j = 0; j < string.length; j += limit) {
        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
        var arr = [];

        for (var i = 0; i < segment.length; ++i) {
            var c = segment.charCodeAt(i);
            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
                || (format === formats.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }

            if (c < 0x80) {
                arr[arr.length] = hexTable[c];
                continue;
            }

            if (c < 0x800) {
                arr[arr.length] = hexTable[0xC0 | (c >> 6)]
                    + hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                arr[arr.length] = hexTable[0xE0 | (c >> 12)]
                    + hexTable[0x80 | ((c >> 6) & 0x3F)]
                    + hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (segment.charCodeAt(i) & 0x3FF));

            arr[arr.length] = hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        out += arr.join('');
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};


'use strict';

var test = require('tape');
var inspect = require('object-inspect');
var SaferBuffer = require('safer-buffer').Buffer;
var forEach = require('for-each');
var v = require('es-value-fixtures');

var utils = require('../lib/utils');

test('merge()', function (t) {
    t.deepEqual(utils.merge(null, true), [null, true], 'merges true into null');

    t.deepEqual(utils.merge(null, [42]), [null, 42], 'merges null into an array');

    t.deepEqual(utils.merge({ a: 'b' }, { a: 'c' }), { a: ['b', 'c'] }, 'merges two objects with the same key');

    var oneMerged = utils.merge({ foo: 'bar' }, { foo: { first: '123' } });
    t.deepEqual(oneMerged, { foo: ['bar', { first: '123' }] }, 'merges a standalone and an object into an array');

    var twoMerged = utils.merge({ foo: ['bar', { first: '123' }] }, { foo: { second: '456' } });
    t.deepEqual(twoMerged, { foo: { 0: 'bar', 1: { first: '123' }, second: '456' } }, 'merges a standalone and two objects into an array');

    var sandwiched = utils.merge({ foo: ['bar', { first: '123', second: '456' }] }, { foo: 'baz' });
    t.deepEqual(sandwiched, { foo: ['bar', { first: '123', second: '456' }, 'baz'] }, 'merges an object sandwiched by two standalones into an array');

    var nestedArrays = utils.merge({ foo: ['baz'] }, { foo: ['bar', 'xyzzy'] });
    t.deepEqual(nestedArrays, { foo: ['baz', 'bar', 'xyzzy'] });

    var noOptionsNonObjectSource = utils.merge({ foo: 'baz' }, 'bar');
    t.deepEqual(noOptionsNonObjectSource, { foo: 'baz', bar: true });

    var func = function f() {};
    t.deepEqual(
        utils.merge(func, { foo: 'bar' }),
        [func, { foo: 'bar' }],
        'functions can not be merged into'
    );

    func.bar = 'baz';
    t.deepEqual(
        utils.merge({ foo: 'bar' }, func),
        { foo: 'bar', bar: 'baz' },
        'functions can be merge sources'
    );

    t.test(
        'avoids invoking array setters unnecessarily',
        { skip: typeof Object.defineProperty !== 'function' },
        function (st) {
            var setCount = 0;
            var getCount = 0;
            var observed = [];
            Object.defineProperty(observed, 0, {
                get: function () {
                    getCount += 1;
                    return { bar: 'baz' };
                },
                set: function () { setCount += 1; }
            });
            utils.merge(observed, [null]);
            st.equal(setCount, 0);
            st.equal(getCount, 1);
            observed[0] = observed[0]; // eslint-disable-line no-self-assign
            st.equal(setCount, 1);
            st.equal(getCount, 2);
            st.end();
        }
    );

    t.end();
});

test('assign()', function (t) {
    var target = { a: 1, b: 2 };
    var source = { b: 3, c: 4 };
    var result = utils.assign(target, source);

    t.equal(result, target, 'returns the target');
    t.deepEqual(target, { a: 1, b: 3, c: 4 }, 'target and source are merged');
    t.deepEqual(source, { b: 3, c: 4 }, 'source is untouched');

    t.end();
});

test('combine()', function (t) {
    t.test('both arrays', function (st) {
        var a = [1];
        var b = [2];
        var combined = utils.combine(a, b);

        st.deepEqual(a, [1], 'a is not mutated');
        st.deepEqual(b, [2], 'b is not mutated');
        st.notEqual(a, combined, 'a !== combined');
        st.notEqual(b, combined, 'b !== combined');
        st.deepEqual(combined, [1, 2], 'combined is a + b');

        st.end();
    });

    t.test('one array, one non-array', function (st) {
        var aN = 1;
        var a = [aN];
        var bN = 2;
        var b = [bN];

        var combinedAnB = utils.combine(aN, b);
        st.deepEqual(b, [bN], 'b is not mutated');
        st.notEqual(aN, combinedAnB, 'aN + b !== aN');
        st.notEqual(a, combinedAnB, 'aN + b !== a');
        st.notEqual(bN, combinedAnB, 'aN + b !== bN');
        st.notEqual(b, combinedAnB, 'aN + b !== b');
        st.deepEqual([1, 2], combinedAnB, 'first argument is array-wrapped when not an array');

        var combinedABn = utils.combine(a, bN);
        st.deepEqual(a, [aN], 'a is not mutated');
        st.notEqual(aN, combinedABn, 'a + bN !== aN');
        st.notEqual(a, combinedABn, 'a + bN !== a');
        st.notEqual(bN, combinedABn, 'a + bN !== bN');
        st.notEqual(b, combinedABn, 'a + bN !== b');
        st.deepEqual([1, 2], combinedABn, 'second argument is array-wrapped when not an array');

        st.end();
    });

    t.test('neither is an array', function (st) {
        var combined = utils.combine(1, 2);
        st.notEqual(1, combined, '1 + 2 !== 1');
        st.notEqual(2, combined, '1 + 2 !== 2');
        st.deepEqual([1, 2], combined, 'both arguments are array-wrapped when not an array');

        st.end();
    });

    t.end();
});

test('decode', function (t) {
    t.equal(
        utils.decode('a+b'),
        'a b',
        'decodes + to space'
    );

    t.equal(
        utils.decode('name%2Eobj'),
        'name.obj',
        'decodes a string'
    );
    t.equal(
        utils.decode('name%2Eobj%2Efoo', null, 'iso-8859-1'),
        'name.obj.foo',
        'decodes a string in iso-8859-1'
    );

    t.end();
});

test('encode', function (t) {
    forEach(v.nullPrimitives, function (nullish) {
        t['throws'](
            function () { utils.encode(nullish); },
            TypeError,
            inspect(nullish) + ' is not a string'
        );
    });

    t.equal(utils.encode(''), '', 'empty string returns itself');
    t.deepEqual(utils.encode([]), [], 'empty array returns itself');
    t.deepEqual(utils.encode({ length: 0 }), { length: 0 }, 'empty arraylike returns itself');

    t.test('symbols', { skip: !v.hasSymbols }, function (st) {
        st.equal(utils.encode(Symbol('x')), 'Symbol%28x%29', 'symbol is encoded');

        st.end();
    });

    t.equal(
        utils.encode('(abc)'),
        '%28abc%29',
        'encodes parentheses'
    );
    t.equal(
        utils.encode({ toString: function () { return '(abc)'; } }),
        '%28abc%29',
        'toStrings and encodes parentheses'
    );

    t.equal(
        utils.encode('abc 123 💩', null, 'iso-8859-1'),
        'abc%20123%20%26%2355357%3B%26%2356489%3B',
        'encodes in iso-8859-1'
    );

    var longString = '';
    var expectedString = '';
    for (var i = 0; i < 1500; i++) {
        longString += ' ';
        expectedString += '%20';
    }

    t.equal(
        utils.encode(longString),
        expectedString,
        'encodes a long string'
    );

    t.equal(
        utils.encode('\x28\x29'),
        '%28%29',
        'encodes parens normally'
    );
    t.equal(
        utils.encode('\x28\x29', null, null, null, 'RFC1738'),
        '()',
        'does not encode parens in RFC1738'
    );

    // todo RFC1738 format

    t.equal(
        utils.encode('Āက豈'),
        '%C4%80%E1%80%80%EF%A4%80',
        'encodes multibyte chars'
    );

    t.equal(
        utils.encode('\uD83D \uDCA9'),
        '%F0%9F%90%A0%F0%BA%90%80',
        'encodes lone surrogates'
    );

    t.end();
});

test('isBuffer()', function (t) {
    forEach([null, undefined, true, false, '', 'abc', 42, 0, NaN, {}, [], function () {}, /a/g], function (x) {
        t.equal(utils.isBuffer(x), false, inspect(x) + ' is not a buffer');
    });

    var fakeBuffer = { constructor: Buffer };
    t.equal(utils.isBuffer(fakeBuffer), false, 'fake buffer is not a buffer');

    var saferBuffer = SaferBuffer.from('abc');
    t.equal(utils.isBuffer(saferBuffer), true, 'SaferBuffer instance is a buffer');

    var buffer = Buffer.from && Buffer.alloc ? Buffer.from('abc') : new Buffer('abc');
    t.equal(utils.isBuffer(buffer), true, 'real Buffer instance is a buffer');
    t.end();
});

test('isRegExp()', function (t) {
    t.equal(utils.isRegExp(/a/g), true, 'RegExp is a RegExp');
    t.equal(utils.isRegExp(new RegExp('a', 'g')), true, 'new RegExp is a RegExp');
    t.equal(utils.isRegExp(new Date()), false, 'Date is not a RegExp');

    forEach(v.primitives, function (primitive) {
        t.equal(utils.isRegExp(primitive), false, inspect(primitive) + ' is not a RegExp');
    });

    t.end();
});


import { getHandler, throwInNextTick } from "../utils-B--2TaWv.js";

export { getHandler, throwInNextTick };

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allExpandedTypes = exports.VISITOR_KEYS = exports.NODE_PARENT_VALIDATIONS = exports.NODE_FIELDS = exports.FLIPPED_ALIAS_KEYS = exports.DEPRECATED_KEYS = exports.BUILDER_KEYS = exports.ALIAS_KEYS = void 0;
exports.arrayOf = arrayOf;
exports.arrayOfType = arrayOfType;
exports.assertEach = assertEach;
exports.assertNodeOrValueType = assertNodeOrValueType;
exports.assertNodeType = assertNodeType;
exports.assertOneOf = assertOneOf;
exports.assertOptionalChainStart = assertOptionalChainStart;
exports.assertShape = assertShape;
exports.assertValueType = assertValueType;
exports.chain = chain;
exports.default = defineType;
exports.defineAliasedType = defineAliasedType;
exports.validate = validate;
exports.validateArrayOfType = validateArrayOfType;
exports.validateOptional = validateOptional;
exports.validateOptionalType = validateOptionalType;
exports.validateType = validateType;
var _is = require("../validators/is.js");
var _validate = require("../validators/validate.js");
const VISITOR_KEYS = exports.VISITOR_KEYS = {};
const ALIAS_KEYS = exports.ALIAS_KEYS = {};
const FLIPPED_ALIAS_KEYS = exports.FLIPPED_ALIAS_KEYS = {};
const NODE_FIELDS = exports.NODE_FIELDS = {};
const BUILDER_KEYS = exports.BUILDER_KEYS = {};
const DEPRECATED_KEYS = exports.DEPRECATED_KEYS = {};
const NODE_PARENT_VALIDATIONS = exports.NODE_PARENT_VALIDATIONS = {};
function getType(val) {
  if (Array.isArray(val)) {
    return "array";
  } else if (val === null) {
    return "null";
  } else {
    return typeof val;
  }
}
function validate(validate) {
  return {
    validate
  };
}
function validateType(...typeNames) {
  return validate(assertNodeType(...typeNames));
}
function validateOptional(validate) {
  return {
    validate,
    optional: true
  };
}
function validateOptionalType(...typeNames) {
  return {
    validate: assertNodeType(...typeNames),
    optional: true
  };
}
function arrayOf(elementType) {
  return chain(assertValueType("array"), assertEach(elementType));
}
function arrayOfType(...typeNames) {
  return arrayOf(assertNodeType(...typeNames));
}
function validateArrayOfType(...typeNames) {
  return validate(arrayOfType(...typeNames));
}
function assertEach(callback) {
  const childValidator = process.env.BABEL_TYPES_8_BREAKING ? _validate.validateChild : () => {};
  function validator(node, key, val) {
    if (!Array.isArray(val)) return;
    let i = 0;
    const subKey = {
      toString() {
        return `${key}[${i}]`;
      }
    };
    for (; i < val.length; i++) {
      const v = val[i];
      callback(node, subKey, v);
      childValidator(node, subKey, v);
    }
  }
  validator.each = callback;
  return validator;
}
function assertOneOf(...values) {
  function validate(node, key, val) {
    if (!values.includes(val)) {
      throw new TypeError(`Property ${key} expected value to be one of ${JSON.stringify(values)} but got ${JSON.stringify(val)}`);
    }
  }
  validate.oneOf = values;
  return validate;
}
const allExpandedTypes = exports.allExpandedTypes = [];
function assertNodeType(...types) {
  const expandedTypes = new Set();
  allExpandedTypes.push({
    types,
    set: expandedTypes
  });
  function validate(node, key, val) {
    const valType = val == null ? void 0 : val.type;
    if (valType != null) {
      if (expandedTypes.has(valType)) {
        (0, _validate.validateChild)(node, key, val);
        return;
      }
      if (valType === "Placeholder") {
        for (const type of types) {
          if ((0, _is.default)(type, val)) {
            (0, _validate.validateChild)(node, key, val);
            return;
          }
        }
      }
    }
    throw new TypeError(`Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(types)} but instead got ${JSON.stringify(valType)}`);
  }
  validate.oneOfNodeTypes = types;
  return validate;
}
function assertNodeOrValueType(...types) {
  function validate(node, key, val) {
    const primitiveType = getType(val);
    for (const type of types) {
      if (primitiveType === type || (0, _is.default)(type, val)) {
        (0, _validate.validateChild)(node, key, val);
        return;
      }
    }
    throw new TypeError(`Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(types)} but instead got ${JSON.stringify(val == null ? void 0 : val.type)}`);
  }
  validate.oneOfNodeOrValueTypes = types;
  return validate;
}
function assertValueType(type) {
  function validate(node, key, val) {
    if (getType(val) === type) {
      return;
    }
    throw new TypeError(`Property ${key} expected type of ${type} but got ${getType(val)}`);
  }
  validate.type = type;
  return validate;
}
function assertShape(shape) {
  const keys = Object.keys(shape);
  function validate(node, key, val) {
    const errors = [];
    for (const property of keys) {
      try {
        (0, _validate.validateField)(node, property, val[property], shape[property]);
      } catch (error) {
        if (error instanceof TypeError) {
          errors.push(error.message);
          continue;
        }
        throw error;
      }
    }
    if (errors.length) {
      throw new TypeError(`Property ${key} of ${node.type} expected to have the following:\n${errors.join("\n")}`);
    }
  }
  validate.shapeOf = shape;
  return validate;
}
function assertOptionalChainStart() {
  function validate(node) {
    var _current;
    let current = node;
    while (node) {
      const {
        type
      } = current;
      if (type === "OptionalCallExpression") {
        if (current.optional) return;
        current = current.callee;
        continue;
      }
      if (type === "OptionalMemberExpression") {
        if (current.optional) return;
        current = current.object;
        continue;
      }
      break;
    }
    throw new TypeError(`Non-optional ${node.type} must chain from an optional OptionalMemberExpression or OptionalCallExpression. Found chain from ${(_current = current) == null ? void 0 : _current.type}`);
  }
  return validate;
}
function chain(...fns) {
  function validate(...args) {
    for (const fn of fns) {
      fn(...args);
    }
  }
  validate.chainOf = fns;
  if (fns.length >= 2 && "type" in fns[0] && fns[0].type === "array" && !("each" in fns[1])) {
    throw new Error(`An assertValueType("array") validator can only be followed by an assertEach(...) validator.`);
  }
  return validate;
}
const validTypeOpts = new Set(["aliases", "builder", "deprecatedAlias", "fields", "inherits", "visitor", "validate"]);
const validFieldKeys = new Set(["default", "optional", "deprecated", "validate"]);
const store = {};
function defineAliasedType(...aliases) {
  return (type, opts = {}) => {
    let defined = opts.aliases;
    if (!defined) {
      var _store$opts$inherits$;
      if (opts.inherits) defined = (_store$opts$inherits$ = store[opts.inherits].aliases) == null ? void 0 : _store$opts$inherits$.slice();
      defined != null ? defined : defined = [];
      opts.aliases = defined;
    }
    const additional = aliases.filter(a => !defined.includes(a));
    defined.unshift(...additional);
    defineType(type, opts);
  };
}
function defineType(type, opts = {}) {
  const inherits = opts.inherits && store[opts.inherits] || {};
  let fields = opts.fields;
  if (!fields) {
    fields = {};
    if (inherits.fields) {
      const keys = Object.getOwnPropertyNames(inherits.fields);
      for (const key of keys) {
        const field = inherits.fields[key];
        const def = field.default;
        if (Array.isArray(def) ? def.length > 0 : def && typeof def === "object") {
          throw new Error("field defaults can only be primitives or empty arrays currently");
        }
        fields[key] = {
          default: Array.isArray(def) ? [] : def,
          optional: field.optional,
          deprecated: field.deprecated,
          validate: field.validate
        };
      }
    }
  }
  const visitor = opts.visitor || inherits.visitor || [];
  const aliases = opts.aliases || inherits.aliases || [];
  const builder = opts.builder || inherits.builder || opts.visitor || [];
  for (const k of Object.keys(opts)) {
    if (!validTypeOpts.has(k)) {
      throw new Error(`Unknown type option "${k}" on ${type}`);
    }
  }
  if (opts.deprecatedAlias) {
    DEPRECATED_KEYS[opts.deprecatedAlias] = type;
  }
  for (const key of visitor.concat(builder)) {
    fields[key] = fields[key] || {};
  }
  for (const key of Object.keys(fields)) {
    const field = fields[key];
    if (field.default !== undefined && !builder.includes(key)) {
      field.optional = true;
    }
    if (field.default === undefined) {
      field.default = null;
    } else if (!field.validate && field.default != null) {
      field.validate = assertValueType(getType(field.default));
    }
    for (const k of Object.keys(field)) {
      if (!validFieldKeys.has(k)) {
        throw new Error(`Unknown field key "${k}" on ${type}.${key}`);
      }
    }
  }
  VISITOR_KEYS[type] = opts.visitor = visitor;
  BUILDER_KEYS[type] = opts.builder = builder;
  NODE_FIELDS[type] = opts.fields = fields;
  ALIAS_KEYS[type] = opts.aliases = aliases;
  aliases.forEach(alias => {
    FLIPPED_ALIAS_KEYS[alias] = FLIPPED_ALIAS_KEYS[alias] || [];
    FLIPPED_ALIAS_KEYS[alias].push(type);
  });
  if (opts.validate) {
    NODE_PARENT_VALIDATIONS[type] = opts.validate;
  }
  store[type] = opts;
}

//# sourceMappingURL=utils.js.map


export { v as calculateSuiteHash, r as createChainable, w as createFileTask, x as generateFileHash, y as generateHash, D as getFullName, E as getNames, F as getSuites, G as getTasks, H as getTestName, I as getTests, J as hasFailed, K as hasTests, z as interpretTaskModes, L as isAtomTest, M as isTestCase, B as limitConcurrency, C as partitionSuiteChildren, A as someTasksAreOnly } from './chunk-hooks.js';
import '@vitest/utils';
import '@vitest/utils/source-map';
import '@vitest/utils/error';
import 'strip-literal';
import 'pathe';


'use strict'

/**
 * Module dependencies.
 */

var bytes = require('bytes')
var contentType = require('content-type')
var typeis = require('type-is')

/**
 * Module exports.
 */

module.exports = {
  getCharset,
  normalizeOptions
}

/**
 * Get the charset of a request.
 *
 * @param {object} req
 * @api private
 */

function getCharset (req) {
  try {
    return (contentType.parse(req).parameters.charset || '').toLowerCase()
  } catch {
    return undefined
  }
}

/**
 * Get the simple type checker.
 *
 * @param {string | string[]} type
 * @return {function}
 */

function typeChecker (type) {
  return function checkType (req) {
    return Boolean(typeis(req, type))
  }
}

/**
 * Normalizes the common options for all parsers.
 *
 * @param {object} options options to normalize
 * @param {string | string[] | function} defaultType default content type(s) or a function to determine it
 * @returns {object}
 */
function normalizeOptions (options, defaultType) {
  if (!defaultType) {
    // Parsers must define a default content type
    throw new TypeError('defaultType must be provided')
  }

  var inflate = options?.inflate !== false
  var limit = typeof options?.limit !== 'number'
    ? bytes.parse(options?.limit || '100kb')
    : options?.limit
  var type = options?.type || defaultType
  var verify = options?.verify || false

  if (verify !== false && typeof verify !== 'function') {
    throw new TypeError('option verify must be function')
  }

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type

  return {
    inflate,
    limit,
    verify,
    shouldParse
  }
}


/**
 * @fileoverview Define utility functions for token store.
 * @author Toru Nagashima
 */
"use strict";

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * Finds the index of the first token which is after the given location.
 * If it was not found, this returns `tokens.length`.
 * @param {(Token|Comment)[]} tokens It searches the token in this list.
 * @param {number} location The location to search.
 * @returns {number} The found index or `tokens.length`.
 */
exports.search = function search(tokens, location) {
	for (
		let minIndex = 0, maxIndex = tokens.length - 1;
		minIndex <= maxIndex;

	) {
		/*
		 * Calculate the index in the middle between minIndex and maxIndex.
		 * `| 0` is used to round a fractional value down to the nearest integer: this is similar to
		 * using `Math.trunc()` or `Math.floor()`, but performance tests have shown this method to
		 * be faster.
		 */
		const index = ((minIndex + maxIndex) / 2) | 0;
		const token = tokens[index];
		const tokenStartLocation = token.range[0];

		if (location <= tokenStartLocation) {
			if (index === minIndex) {
				return index;
			}
			maxIndex = index;
		} else {
			minIndex = index + 1;
		}
	}
	return tokens.length;
};

/**
 * Gets the index of the `startLoc` in `tokens`.
 * `startLoc` can be the value of `node.range[1]`, so this checks about `startLoc - 1` as well.
 * @param {(Token|Comment)[]} tokens The tokens to find an index.
 * @param {Object} indexMap The map from locations to indices.
 * @param {number} startLoc The location to get an index.
 * @returns {number} The index.
 */
exports.getFirstIndex = function getFirstIndex(tokens, indexMap, startLoc) {
	if (startLoc in indexMap) {
		return indexMap[startLoc];
	}
	if (startLoc - 1 in indexMap) {
		const index = indexMap[startLoc - 1];
		const token = tokens[index];

		// If the mapped index is out of bounds, the returned cursor index will point after the end of the tokens array.
		if (!token) {
			return tokens.length;
		}

		/*
		 * For the map of "comment's location -> token's index", it points the next token of a comment.
		 * In that case, +1 is unnecessary.
		 */
		if (token.range[0] >= startLoc) {
			return index;
		}
		return index + 1;
	}
	return 0;
};

/**
 * Gets the index of the `endLoc` in `tokens`.
 * The information of end locations are recorded at `endLoc - 1` in `indexMap`, so this checks about `endLoc - 1` as well.
 * @param {(Token|Comment)[]} tokens The tokens to find an index.
 * @param {Object} indexMap The map from locations to indices.
 * @param {number} endLoc The location to get an index.
 * @returns {number} The index.
 */
exports.getLastIndex = function getLastIndex(tokens, indexMap, endLoc) {
	if (endLoc in indexMap) {
		return indexMap[endLoc] - 1;
	}
	if (endLoc - 1 in indexMap) {
		const index = indexMap[endLoc - 1];
		const token = tokens[index];

		// If the mapped index is out of bounds, the returned cursor index will point before the end of the tokens array.
		if (!token) {
			return tokens.length - 1;
		}

		/*
		 * For the map of "comment's location -> token's index", it points the next token of a comment.
		 * In that case, -1 is necessary.
		 */
		if (token.range[1] > endLoc) {
			return index - 1;
		}
		return index;
	}
	return tokens.length - 1;
};


/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

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
*/


(function () {
    'use strict';

    exports.ast = require('./ast');
    exports.code = require('./code');
    exports.keyword = require('./keyword');
}());
/* vim: set sw=4 ts=4 et tw=80 : */


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
const secret = Symbol('secret');
/**
 * @internal
 */
const mismatch = Symbol('mismatch');
/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf | .toEqualTypeOf()} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf | .toMatchTypeOf()}.
 *
 * @internal
 */
const avalue = Symbol('avalue');


/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @api private
 */

var { METHODS } = require('node:http');
var contentType = require('content-type');
var etag = require('etag');
var mime = require('mime-types')
var proxyaddr = require('proxy-addr');
var qs = require('qs');
var querystring = require('querystring');

/**
 * A list of lowercased HTTP methods that are supported by Node.js.
 * @api private
 */
exports.methods = METHODS.map((method) => method.toLowerCase());

/**
 * Return strong ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

exports.etag = createETagGenerator({ weak: false })

/**
 * Return weak ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

exports.wetag = createETagGenerator({ weak: true })

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {String} type
 * @return {Object}
 * @api private
 */

exports.normalizeType = function(type){
  return ~type.indexOf('/')
    ? acceptParams(type)
    : { value: (mime.lookup(type) || 'application/octet-stream'), params: {} }
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api private
 */

exports.normalizeTypes = function(types) {
  return types.map(exports.normalizeType);
};


/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function acceptParams (str) {
  var length = str.length;
  var colonIndex = str.indexOf(';');
  var index = colonIndex === -1 ? length : colonIndex;
  var ret = { value: str.slice(0, index).trim(), quality: 1, params: {} };

  while (index < length) {
    var splitIndex = str.indexOf('=', index);
    if (splitIndex === -1) break;

    var colonIndex = str.indexOf(';', index);
    var endIndex = colonIndex === -1 ? length : colonIndex;

    if (splitIndex > endIndex) {
      index = str.lastIndexOf(';', splitIndex - 1) + 1;
      continue;
    }

    var key = str.slice(index, splitIndex).trim();
    var value = str.slice(splitIndex + 1, endIndex).trim();

    if (key === 'q') {
      ret.quality = parseFloat(value);
    } else {
      ret.params[key] = value;
    }

    index = endIndex + 1;
  }

  return ret;
}

/**
 * Compile "etag" value to function.
 *
 * @param  {Boolean|String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileETag = function(val) {
  var fn;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
    case 'weak':
      fn = exports.wetag;
      break;
    case false:
      break;
    case 'strong':
      fn = exports.etag;
      break;
    default:
      throw new TypeError('unknown value for etag function: ' + val);
  }

  return fn;
}

/**
 * Compile "query parser" value to function.
 *
 * @param  {String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileQueryParser = function compileQueryParser(val) {
  var fn;

  if (typeof val === 'function') {
    return val;
  }

  switch (val) {
    case true:
    case 'simple':
      fn = querystring.parse;
      break;
    case false:
      break;
    case 'extended':
      fn = parseExtendedQueryString;
      break;
    default:
      throw new TypeError('unknown value for query parser function: ' + val);
  }

  return fn;
}

/**
 * Compile "proxy trust" value to function.
 *
 * @param  {Boolean|String|Number|Array|Function} val
 * @return {Function}
 * @api private
 */

exports.compileTrust = function(val) {
  if (typeof val === 'function') return val;

  if (val === true) {
    // Support plain true/false
    return function(){ return true };
  }

  if (typeof val === 'number') {
    // Support trusting hop count
    return function(a, i){ return i < val };
  }

  if (typeof val === 'string') {
    // Support comma-separated values
    val = val.split(',')
      .map(function (v) { return v.trim() })
  }

  return proxyaddr.compile(val || []);
}

/**
 * Set the charset in a given Content-Type string.
 *
 * @param {String} type
 * @param {String} charset
 * @return {String}
 * @api private
 */

exports.setCharset = function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  // parse type
  var parsed = contentType.parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return contentType.format(parsed);
};

/**
 * Create an ETag generator function, generating ETags with
 * the given options.
 *
 * @param {object} options
 * @return {function}
 * @private
 */

function createETagGenerator (options) {
  return function generateETag (body, encoding) {
    var buf = !Buffer.isBuffer(body)
      ? Buffer.from(body, encoding)
      : body

    return etag(buf, options)
  }
}

/**
 * Parse an extended query string with qs.
 *
 * @param {String} str
 * @return {Object}
 * @private
 */

function parseExtendedQueryString(str) {
  return qs.parse(str, {
    allowPrototypes: true
  });
}


const fs = require('fs');
const path = require('path');
const flatted = require('flatted');

function tryParse(filePath, defaultValue) {
  let result;
  try {
    result = readJSON(filePath);
  } catch (ex) {
    result = defaultValue;
  }
  return result;
}

/**
 * Read json file synchronously using flatted
 *
 * @param  {String} filePath Json filepath
 * @returns {*} parse result
 */
function readJSON(filePath) {
  return flatted.parse(
    fs.readFileSync(filePath, {
      encoding: 'utf8',
    })
  );
}

/**
 * Write json file synchronously using circular-json
 *
 * @param  {String} filePath Json filepath
 * @param  {*} data Object to serialize
 */
function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true,
  });
  fs.writeFileSync(filePath, flatted.stringify(data));
}

module.exports = { tryParse, readJSON, writeJSON };


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.has = void 0;
exports.merge = merge;
exports.assign_single_source = assign_single_source;
exports.decode = decode;
exports.compact = compact;
exports.is_regexp = is_regexp;
exports.is_buffer = is_buffer;
exports.combine = combine;
exports.maybe_map = maybe_map;
const formats_1 = require("./formats.js");
const values_1 = require("../utils/values.js");
let has = (obj, key) => ((exports.has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
    (0, exports.has)(obj, key));
exports.has = has;
const hex_table = /* @__PURE__ */ (() => {
    const array = [];
    for (let i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }
    return array;
})();
function compact_queue(queue) {
    while (queue.length > 1) {
        const item = queue.pop();
        if (!item)
            continue;
        const obj = item.obj[item.prop];
        if ((0, values_1.isArray)(obj)) {
            const compacted = [];
            for (let j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }
            // @ts-ignore
            item.obj[item.prop] = compacted;
        }
    }
}
function array_to_object(source, options) {
    const obj = options && options.plainObjects ? Object.create(null) : {};
    for (let i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }
    return obj;
}
function merge(target, source, options = {}) {
    if (!source) {
        return target;
    }
    if (typeof source !== 'object') {
        if ((0, values_1.isArray)(target)) {
            target.push(source);
        }
        else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !(0, exports.has)(Object.prototype, source)) {
                target[source] = true;
            }
        }
        else {
            return [target, source];
        }
        return target;
    }
    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }
    let mergeTarget = target;
    if ((0, values_1.isArray)(target) && !(0, values_1.isArray)(source)) {
        // @ts-ignore
        mergeTarget = array_to_object(target, options);
    }
    if ((0, values_1.isArray)(target) && (0, values_1.isArray)(source)) {
        source.forEach(function (item, i) {
            if ((0, exports.has)(target, i)) {
                const targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                }
                else {
                    target.push(item);
                }
            }
            else {
                target[i] = item;
            }
        });
        return target;
    }
    return Object.keys(source).reduce(function (acc, key) {
        const value = source[key];
        if ((0, exports.has)(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
}
function assign_single_source(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
}
function decode(str, _, charset) {
    const strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    }
    catch (e) {
        return strWithoutPlus;
    }
}
const limit = 1024;
const encode = (str, _defaultEncoder, charset, _kind, format) => {
    // This code was originally written by Brian White for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }
    let string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    }
    else if (typeof str !== 'string') {
        string = String(str);
    }
    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }
    let out = '';
    for (let j = 0; j < string.length; j += limit) {
        const segment = string.length >= limit ? string.slice(j, j + limit) : string;
        const arr = [];
        for (let i = 0; i < segment.length; ++i) {
            let c = segment.charCodeAt(i);
            if (c === 0x2d || // -
                c === 0x2e || // .
                c === 0x5f || // _
                c === 0x7e || // ~
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c >= 0x41 && c <= 0x5a) || // a-z
                (c >= 0x61 && c <= 0x7a) || // A-Z
                (format === formats_1.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }
            if (c < 0x80) {
                arr[arr.length] = hex_table[c];
                continue;
            }
            if (c < 0x800) {
                arr[arr.length] = hex_table[0xc0 | (c >> 6)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            if (c < 0xd800 || c >= 0xe000) {
                arr[arr.length] =
                    hex_table[0xe0 | (c >> 12)] + hex_table[0x80 | ((c >> 6) & 0x3f)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            i += 1;
            c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));
            arr[arr.length] =
                hex_table[0xf0 | (c >> 18)] +
                    hex_table[0x80 | ((c >> 12) & 0x3f)] +
                    hex_table[0x80 | ((c >> 6) & 0x3f)] +
                    hex_table[0x80 | (c & 0x3f)];
        }
        out += arr.join('');
    }
    return out;
};
exports.encode = encode;
function compact(value) {
    const queue = [{ obj: { o: value }, prop: 'o' }];
    const refs = [];
    for (let i = 0; i < queue.length; ++i) {
        const item = queue[i];
        // @ts-ignore
        const obj = item.obj[item.prop];
        const keys = Object.keys(obj);
        for (let j = 0; j < keys.length; ++j) {
            const key = keys[j];
            const val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }
    compact_queue(queue);
    return value;
}
function is_regexp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}
function is_buffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function combine(a, b) {
    return [].concat(a, b);
}
function maybe_map(val, fn) {
    if ((0, values_1.isArray)(val)) {
        const mapped = [];
        for (let i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
}
//# sourceMappingURL=utils.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("./tslib.js");
tslib_1.__exportStar(require("./utils/values.js"), exports);
tslib_1.__exportStar(require("./utils/base64.js"), exports);
tslib_1.__exportStar(require("./utils/env.js"), exports);
tslib_1.__exportStar(require("./utils/log.js"), exports);
tslib_1.__exportStar(require("./utils/uuid.js"), exports);
tslib_1.__exportStar(require("./utils/sleep.js"), exports);
//# sourceMappingURL=utils.js.map

/*global navigator*/
'use strict';

const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = require('./constants');

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.isWindows = () => {
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    return platform === 'win32' || platform === 'windows';
  }

  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'win32';
  }

  return false;
};

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};

exports.basename = (path, { windows } = {}) => {
  const segs = path.split(windows ? /[\\/]/ : '/');
  const last = segs[segs.length - 1];

  if (last === '') {
    return segs[segs.length - 2];
  }

  return last;
};


'use strict';

var formats = require('./formats');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? { __proto__: null } : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object' && typeof source !== 'function') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if (
                (options && (options.plainObjects || options.allowPrototypes))
                || !has.call(Object.prototype, source)
            ) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, defaultDecoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var limit = 1024;

/* eslint operator-linebreak: [2, "before"] */

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var j = 0; j < string.length; j += limit) {
        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
        var arr = [];

        for (var i = 0; i < segment.length; ++i) {
            var c = segment.charCodeAt(i);
            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
                || (format === formats.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }

            if (c < 0x80) {
                arr[arr.length] = hexTable[c];
                continue;
            }

            if (c < 0x800) {
                arr[arr.length] = hexTable[0xC0 | (c >> 6)]
                    + hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                arr[arr.length] = hexTable[0xE0 | (c >> 12)]
                    + hexTable[0x80 | ((c >> 6) & 0x3F)]
                    + hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (segment.charCodeAt(i) & 0x3FF));

            arr[arr.length] = hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        out += arr.join('');
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};


'use strict';

var test = require('tape');
var inspect = require('object-inspect');
var SaferBuffer = require('safer-buffer').Buffer;
var forEach = require('for-each');
var v = require('es-value-fixtures');

var utils = require('../lib/utils');

test('merge()', function (t) {
    t.deepEqual(utils.merge(null, true), [null, true], 'merges true into null');

    t.deepEqual(utils.merge(null, [42]), [null, 42], 'merges null into an array');

    t.deepEqual(utils.merge({ a: 'b' }, { a: 'c' }), { a: ['b', 'c'] }, 'merges two objects with the same key');

    var oneMerged = utils.merge({ foo: 'bar' }, { foo: { first: '123' } });
    t.deepEqual(oneMerged, { foo: ['bar', { first: '123' }] }, 'merges a standalone and an object into an array');

    var twoMerged = utils.merge({ foo: ['bar', { first: '123' }] }, { foo: { second: '456' } });
    t.deepEqual(twoMerged, { foo: { 0: 'bar', 1: { first: '123' }, second: '456' } }, 'merges a standalone and two objects into an array');

    var sandwiched = utils.merge({ foo: ['bar', { first: '123', second: '456' }] }, { foo: 'baz' });
    t.deepEqual(sandwiched, { foo: ['bar', { first: '123', second: '456' }, 'baz'] }, 'merges an object sandwiched by two standalones into an array');

    var nestedArrays = utils.merge({ foo: ['baz'] }, { foo: ['bar', 'xyzzy'] });
    t.deepEqual(nestedArrays, { foo: ['baz', 'bar', 'xyzzy'] });

    var noOptionsNonObjectSource = utils.merge({ foo: 'baz' }, 'bar');
    t.deepEqual(noOptionsNonObjectSource, { foo: 'baz', bar: true });

    var func = function f() {};
    t.deepEqual(
        utils.merge(func, { foo: 'bar' }),
        [func, { foo: 'bar' }],
        'functions can not be merged into'
    );

    func.bar = 'baz';
    t.deepEqual(
        utils.merge({ foo: 'bar' }, func),
        { foo: 'bar', bar: 'baz' },
        'functions can be merge sources'
    );

    t.test(
        'avoids invoking array setters unnecessarily',
        { skip: typeof Object.defineProperty !== 'function' },
        function (st) {
            var setCount = 0;
            var getCount = 0;
            var observed = [];
            Object.defineProperty(observed, 0, {
                get: function () {
                    getCount += 1;
                    return { bar: 'baz' };
                },
                set: function () { setCount += 1; }
            });
            utils.merge(observed, [null]);
            st.equal(setCount, 0);
            st.equal(getCount, 1);
            observed[0] = observed[0]; // eslint-disable-line no-self-assign
            st.equal(setCount, 1);
            st.equal(getCount, 2);
            st.end();
        }
    );

    t.end();
});

test('assign()', function (t) {
    var target = { a: 1, b: 2 };
    var source = { b: 3, c: 4 };
    var result = utils.assign(target, source);

    t.equal(result, target, 'returns the target');
    t.deepEqual(target, { a: 1, b: 3, c: 4 }, 'target and source are merged');
    t.deepEqual(source, { b: 3, c: 4 }, 'source is untouched');

    t.end();
});

test('combine()', function (t) {
    t.test('both arrays', function (st) {
        var a = [1];
        var b = [2];
        var combined = utils.combine(a, b);

        st.deepEqual(a, [1], 'a is not mutated');
        st.deepEqual(b, [2], 'b is not mutated');
        st.notEqual(a, combined, 'a !== combined');
        st.notEqual(b, combined, 'b !== combined');
        st.deepEqual(combined, [1, 2], 'combined is a + b');

        st.end();
    });

    t.test('one array, one non-array', function (st) {
        var aN = 1;
        var a = [aN];
        var bN = 2;
        var b = [bN];

        var combinedAnB = utils.combine(aN, b);
        st.deepEqual(b, [bN], 'b is not mutated');
        st.notEqual(aN, combinedAnB, 'aN + b !== aN');
        st.notEqual(a, combinedAnB, 'aN + b !== a');
        st.notEqual(bN, combinedAnB, 'aN + b !== bN');
        st.notEqual(b, combinedAnB, 'aN + b !== b');
        st.deepEqual([1, 2], combinedAnB, 'first argument is array-wrapped when not an array');

        var combinedABn = utils.combine(a, bN);
        st.deepEqual(a, [aN], 'a is not mutated');
        st.notEqual(aN, combinedABn, 'a + bN !== aN');
        st.notEqual(a, combinedABn, 'a + bN !== a');
        st.notEqual(bN, combinedABn, 'a + bN !== bN');
        st.notEqual(b, combinedABn, 'a + bN !== b');
        st.deepEqual([1, 2], combinedABn, 'second argument is array-wrapped when not an array');

        st.end();
    });

    t.test('neither is an array', function (st) {
        var combined = utils.combine(1, 2);
        st.notEqual(1, combined, '1 + 2 !== 1');
        st.notEqual(2, combined, '1 + 2 !== 2');
        st.deepEqual([1, 2], combined, 'both arguments are array-wrapped when not an array');

        st.end();
    });

    t.end();
});

test('decode', function (t) {
    t.equal(
        utils.decode('a+b'),
        'a b',
        'decodes + to space'
    );

    t.equal(
        utils.decode('name%2Eobj'),
        'name.obj',
        'decodes a string'
    );
    t.equal(
        utils.decode('name%2Eobj%2Efoo', null, 'iso-8859-1'),
        'name.obj.foo',
        'decodes a string in iso-8859-1'
    );

    t.end();
});

test('encode', function (t) {
    forEach(v.nullPrimitives, function (nullish) {
        t['throws'](
            function () { utils.encode(nullish); },
            TypeError,
            inspect(nullish) + ' is not a string'
        );
    });

    t.equal(utils.encode(''), '', 'empty string returns itself');
    t.deepEqual(utils.encode([]), [], 'empty array returns itself');
    t.deepEqual(utils.encode({ length: 0 }), { length: 0 }, 'empty arraylike returns itself');

    t.test('symbols', { skip: !v.hasSymbols }, function (st) {
        st.equal(utils.encode(Symbol('x')), 'Symbol%28x%29', 'symbol is encoded');

        st.end();
    });

    t.equal(
        utils.encode('(abc)'),
        '%28abc%29',
        'encodes parentheses'
    );
    t.equal(
        utils.encode({ toString: function () { return '(abc)'; } }),
        '%28abc%29',
        'toStrings and encodes parentheses'
    );

    t.equal(
        utils.encode('abc 123 💩', null, 'iso-8859-1'),
        'abc%20123%20%26%2355357%3B%26%2356489%3B',
        'encodes in iso-8859-1'
    );

    var longString = '';
    var expectedString = '';
    for (var i = 0; i < 1500; i++) {
        longString += ' ';
        expectedString += '%20';
    }

    t.equal(
        utils.encode(longString),
        expectedString,
        'encodes a long string'
    );

    t.equal(
        utils.encode('\x28\x29'),
        '%28%29',
        'encodes parens normally'
    );
    t.equal(
        utils.encode('\x28\x29', null, null, null, 'RFC1738'),
        '()',
        'does not encode parens in RFC1738'
    );

    // todo RFC1738 format

    t.equal(
        utils.encode('Āက豈'),
        '%C4%80%E1%80%80%EF%A4%80',
        'encodes multibyte chars'
    );

    t.equal(
        utils.encode('\uD83D \uDCA9'),
        '%F0%9F%90%A0%F0%BA%90%80',
        'encodes lone surrogates'
    );

    t.end();
});

test('isBuffer()', function (t) {
    forEach([null, undefined, true, false, '', 'abc', 42, 0, NaN, {}, [], function () {}, /a/g], function (x) {
        t.equal(utils.isBuffer(x), false, inspect(x) + ' is not a buffer');
    });

    var fakeBuffer = { constructor: Buffer };
    t.equal(utils.isBuffer(fakeBuffer), false, 'fake buffer is not a buffer');

    var saferBuffer = SaferBuffer.from('abc');
    t.equal(utils.isBuffer(saferBuffer), true, 'SaferBuffer instance is a buffer');

    var buffer = Buffer.from && Buffer.alloc ? Buffer.from('abc') : new Buffer('abc');
    t.equal(utils.isBuffer(buffer), true, 'real Buffer instance is a buffer');
    t.end();
});

test('isRegExp()', function (t) {
    t.equal(utils.isRegExp(/a/g), true, 'RegExp is a RegExp');
    t.equal(utils.isRegExp(new RegExp('a', 'g')), true, 'new RegExp is a RegExp');
    t.equal(utils.isRegExp(new Date()), false, 'Date is not a RegExp');

    forEach(v.primitives, function (primitive) {
        t.equal(utils.isRegExp(primitive), false, inspect(primitive) + ' is not a RegExp');
    });

    t.end();
});


import { getHandler, throwInNextTick } from "../utils-B--2TaWv.js";

export { getHandler, throwInNextTick };