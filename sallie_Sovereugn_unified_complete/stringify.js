"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = stringify;
const utils_1 = require("./utils.js");
const formats_1 = require("./formats.js");
const values_1 = require("../utils/values.js");
const array_prefix_generators = {
    brackets(prefix) {
        return String(prefix) + '[]';
    },
    comma: 'comma',
    indices(prefix, key) {
        return String(prefix) + '[' + key + ']';
    },
    repeat(prefix) {
        return String(prefix);
    },
};
const push_to_array = function (arr, value_or_array) {
    Array.prototype.push.apply(arr, (0, values_1.isArray)(value_or_array) ? value_or_array : [value_or_array]);
};
let toISOString;
const defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: utils_1.encode,
    encodeValuesOnly: false,
    format: formats_1.default_format,
    formatter: formats_1.default_formatter,
    /** @deprecated */
    indices: false,
    serializeDate(date) {
        return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
    },
    skipNulls: false,
    strictNullHandling: false,
};
function is_non_nullish_primitive(v) {
    return (typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        typeof v === 'symbol' ||
        typeof v === 'bigint');
}
const sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
    let obj = object;
    let tmp_sc = sideChannel;
    let step = 0;
    let find_flag = false;
    while ((tmp_sc = tmp_sc.get(sentinel)) !== void undefined && !find_flag) {
        // Where object last appeared in the ref tree
        const pos = tmp_sc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            }
            else {
                find_flag = true; // Break while
            }
        }
        if (typeof tmp_sc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    }
    else if (obj instanceof Date) {
        obj = serializeDate?.(obj);
    }
    else if (generateArrayPrefix === 'comma' && (0, values_1.isArray)(obj)) {
        obj = (0, utils_1.maybe_map)(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate?.(value);
            }
            return value;
        });
    }
    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ?
                // @ts-expect-error
                encoder(prefix, defaults.encoder, charset, 'key', format)
                : prefix;
        }
        obj = '';
    }
    if (is_non_nullish_primitive(obj) || (0, utils_1.is_buffer)(obj)) {
        if (encoder) {
            const key_value = encodeValuesOnly ? prefix
                // @ts-expect-error
                : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [
                formatter?.(key_value) +
                    '=' +
                    // @ts-expect-error
                    formatter?.(encoder(obj, defaults.encoder, charset, 'value', format)),
            ];
        }
        return [formatter?.(prefix) + '=' + formatter?.(String(obj))];
    }
    const values = [];
    if (typeof obj === 'undefined') {
        return values;
    }
    let obj_keys;
    if (generateArrayPrefix === 'comma' && (0, values_1.isArray)(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            // @ts-expect-error values only
            obj = (0, utils_1.maybe_map)(obj, encoder);
        }
        obj_keys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    }
    else if ((0, values_1.isArray)(filter)) {
        obj_keys = filter;
    }
    else {
        const keys = Object.keys(obj);
        obj_keys = sort ? keys.sort(sort) : keys;
    }
    const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);
    const adjusted_prefix = commaRoundTrip && (0, values_1.isArray)(obj) && obj.length === 1 ? encoded_prefix + '[]' : encoded_prefix;
    if (allowEmptyArrays && (0, values_1.isArray)(obj) && obj.length === 0) {
        return adjusted_prefix + '[]';
    }
    for (let j = 0; j < obj_keys.length; ++j) {
        const key = obj_keys[j];
        const value = 
        // @ts-ignore
        typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];
        if (skipNulls && value === null) {
            continue;
        }
        // @ts-ignore
        const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, '%2E') : key;
        const key_prefix = (0, values_1.isArray)(obj) ?
            typeof generateArrayPrefix === 'function' ?
                generateArrayPrefix(adjusted_prefix, encoded_key)
                : adjusted_prefix
            : adjusted_prefix + (allowDots ? '.' + encoded_key : '[' + encoded_key + ']');
        sideChannel.set(object, step);
        const valueSideChannel = new WeakMap();
        valueSideChannel.set(sentinel, sideChannel);
        push_to_array(values, inner_stringify(value, key_prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, 
        // @ts-ignore
        generateArrayPrefix === 'comma' && encodeValuesOnly && (0, values_1.isArray)(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }
    return values;
}
function normalize_stringify_options(opts = defaults) {
    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }
    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }
    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }
    const charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    let format = formats_1.default_format;
    if (typeof opts.format !== 'undefined') {
        if (!(0, utils_1.has)(formats_1.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    const formatter = formats_1.formatters[format];
    let filter = defaults.filter;
    if (typeof opts.filter === 'function' || (0, values_1.isArray)(opts.filter)) {
        filter = opts.filter;
    }
    let arrayFormat;
    if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
        arrayFormat = opts.arrayFormat;
    }
    else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = defaults.arrayFormat;
    }
    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    const allowDots = typeof opts.allowDots === 'undefined' ?
        !!opts.encodeDotInKeys === true ?
            true
            : defaults.allowDots
        : !!opts.allowDots;
    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        // @ts-ignore
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        // @ts-ignore
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
    };
}
function stringify(object, opts = {}) {
    let obj = object;
    const options = normalize_stringify_options(opts);
    let obj_keys;
    let filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    }
    else if ((0, values_1.isArray)(options.filter)) {
        filter = options.filter;
        obj_keys = filter;
    }
    const keys = [];
    if (typeof obj !== 'object' || obj === null) {
        return '';
    }
    const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
    const commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;
    if (!obj_keys) {
        obj_keys = Object.keys(obj);
    }
    if (options.sort) {
        obj_keys.sort(options.sort);
    }
    const sideChannel = new WeakMap();
    for (let i = 0; i < obj_keys.length; ++i) {
        const key = obj_keys[i];
        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        push_to_array(keys, inner_stringify(obj[key], key, 
        // @ts-expect-error
        generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
    }
    const joined = keys.join(options.delimiter);
    let prefix = options.addQueryPrefix === true ? '?' : '';
    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        }
        else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }
    return joined.length > 0 ? prefix + joined : '';
}
//# sourceMappingURL=stringify.js.map

'use strict'

let Stringifier = require('./stringifier')

function stringify(node, builder) {
  let str = new Stringifier(builder)
  str.stringify(node)
}

module.exports = stringify
stringify.default = stringify


'use strict';

var getSideChannel = require('side-channel');
var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    commaRoundTrip: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: utils.encode,
    encodeValuesOnly: false,
    filter: void undefined,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var sentinel = {};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    commaRoundTrip,
    allowEmptyArrays,
    strictNullHandling,
    skipNulls,
    encodeDotInKeys,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    format,
    formatter,
    encodeValuesOnly,
    charset,
    sideChannel
) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            obj = utils.maybeMap(obj, encoder);
        }
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);

    var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + '[]' : encodedPrefix;

    if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
        return adjustedPrefix + '[]';
    }

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === 'object' && key && typeof key.value !== 'undefined'
            ? key.value
            : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, '%2E') : String(key);
        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix
            : adjustedPrefix + (allowDots ? '.' + encodedKey : '[' + encodedKey + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            allowEmptyArrays,
            strictNullHandling,
            skipNulls,
            encodeDotInKeys,
            generateArrayPrefix === 'comma' && encodeValuesOnly && isArray(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    var arrayFormat;
    if (opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = defaults.arrayFormat;
    }

    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
    var commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        var value = obj[key];

        if (options.skipNulls && value === null) {
            continue;
        }
        pushToArray(keys, stringify(
            value,
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.allowEmptyArrays,
            options.strictNullHandling,
            options.skipNulls,
            options.encodeDotInKeys,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};


'use strict';

var test = require('tape');
var qs = require('../');
var utils = require('../lib/utils');
var iconv = require('iconv-lite');
var SaferBuffer = require('safer-buffer').Buffer;
var hasSymbols = require('has-symbols');
var mockProperty = require('mock-property');
var emptyTestCases = require('./empty-keys-cases').emptyTestCases;
var hasProto = require('has-proto')();
var hasBigInt = require('has-bigints')();

test('stringify()', function (t) {
    t.test('stringifies a querystring object', function (st) {
        st.equal(qs.stringify({ a: 'b' }), 'a=b');
        st.equal(qs.stringify({ a: 1 }), 'a=1');
        st.equal(qs.stringify({ a: 1, b: 2 }), 'a=1&b=2');
        st.equal(qs.stringify({ a: 'A_Z' }), 'a=A_Z');
        st.equal(qs.stringify({ a: '€' }), 'a=%E2%82%AC');
        st.equal(qs.stringify({ a: '' }), 'a=%EE%80%80');
        st.equal(qs.stringify({ a: 'א' }), 'a=%D7%90');
        st.equal(qs.stringify({ a: '𐐷' }), 'a=%F0%90%90%B7');
        st.end();
    });

    t.test('stringifies falsy values', function (st) {
        st.equal(qs.stringify(undefined), '');
        st.equal(qs.stringify(null), '');
        st.equal(qs.stringify(null, { strictNullHandling: true }), '');
        st.equal(qs.stringify(false), '');
        st.equal(qs.stringify(0), '');
        st.end();
    });

    t.test('stringifies symbols', { skip: !hasSymbols() }, function (st) {
        st.equal(qs.stringify(Symbol.iterator), '');
        st.equal(qs.stringify([Symbol.iterator]), '0=Symbol%28Symbol.iterator%29');
        st.equal(qs.stringify({ a: Symbol.iterator }), 'a=Symbol%28Symbol.iterator%29');
        st.equal(
            qs.stringify({ a: [Symbol.iterator] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'a[]=Symbol%28Symbol.iterator%29'
        );
        st.end();
    });

    t.test('stringifies bigints', { skip: !hasBigInt }, function (st) {
        var three = BigInt(3);
        var encodeWithN = function (value, defaultEncoder, charset) {
            var result = defaultEncoder(value, defaultEncoder, charset);
            return typeof value === 'bigint' ? result + 'n' : result;
        };
        st.equal(qs.stringify(three), '');
        st.equal(qs.stringify([three]), '0=3');
        st.equal(qs.stringify([three], { encoder: encodeWithN }), '0=3n');
        st.equal(qs.stringify({ a: three }), 'a=3');
        st.equal(qs.stringify({ a: three }, { encoder: encodeWithN }), 'a=3n');
        st.equal(
            qs.stringify({ a: [three] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'a[]=3'
        );
        st.equal(
            qs.stringify({ a: [three] }, { encodeValuesOnly: true, encoder: encodeWithN, arrayFormat: 'brackets' }),
            'a[]=3n'
        );
        st.end();
    });

    t.test('encodes dot in key of object when encodeDotInKeys and allowDots is provided', function (st) {
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: false }
            ),
            'name.obj%5Bfirst%5D=John&name.obj%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: false }
            ),
            'name.obj.first=John&name.obj.last=Doe',
            'with allowDots true and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: true }
            ),
            'name%252Eobj%5Bfirst%5D=John&name%252Eobj%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys true'
        );
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: true }
            ),
            'name%252Eobj.first=John&name%252Eobj.last=Doe',
            'with allowDots true and encodeDotInKeys true'
        );

        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: false }
            ),
            'name.obj.subobject%5Bfirst.godly.name%5D=John&name.obj.subobject%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: false }
            ),
            'name.obj.subobject.first.godly.name=John&name.obj.subobject.last=Doe',
            'with allowDots false and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: true }
            ),
            'name%252Eobj%252Esubobject%5Bfirst.godly.name%5D=John&name%252Eobj%252Esubobject%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys true'
        );
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: true }
            ),
            'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
            'with allowDots true and encodeDotInKeys true'
        );

        st.end();
    });

    t.test('should encode dot in key of object, and automatically set allowDots to `true` when encodeDotInKeys is true and allowDots in undefined', function (st) {
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { encodeDotInKeys: true }
            ),
            'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
            'with allowDots undefined and encodeDotInKeys true'
        );
        st.end();
    });

    t.test('should encode dot in key of object when encodeDotInKeys and allowDots is provided, and nothing else when encodeValuesOnly is provided', function (st) {
        st.equal(
            qs.stringify({ 'name.obj': { first: 'John', last: 'Doe' } }, {
                encodeDotInKeys: true, allowDots: true, encodeValuesOnly: true
            }),
            'name%2Eobj.first=John&name%2Eobj.last=Doe'
        );

        st.equal(
            qs.stringify({ 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } }, { allowDots: true, encodeDotInKeys: true, encodeValuesOnly: true }),
            'name%2Eobj%2Esubobject.first%2Egodly%2Ename=John&name%2Eobj%2Esubobject.last=Doe'
        );

        st.end();
    });

    t.test('throws when `commaRoundTrip` is not a boolean', function (st) {
        st['throws'](
            function () { qs.stringify({}, { commaRoundTrip: 'not a boolean' }); },
            TypeError,
            'throws when `commaRoundTrip` is not a boolean'
        );

        st.end();
    });

    t.test('throws when `encodeDotInKeys` is not a boolean', function (st) {
        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: 0 }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: null }); },
            TypeError
        );

        st.end();
    });

    t.test('adds query prefix', function (st) {
        st.equal(qs.stringify({ a: 'b' }, { addQueryPrefix: true }), '?a=b');
        st.end();
    });

    t.test('with query prefix, outputs blank string given an empty object', function (st) {
        st.equal(qs.stringify({}, { addQueryPrefix: true }), '');
        st.end();
    });

    t.test('stringifies nested falsy values', function (st) {
        st.equal(qs.stringify({ a: { b: { c: null } } }), 'a%5Bb%5D%5Bc%5D=');
        st.equal(qs.stringify({ a: { b: { c: null } } }, { strictNullHandling: true }), 'a%5Bb%5D%5Bc%5D');
        st.equal(qs.stringify({ a: { b: { c: false } } }), 'a%5Bb%5D%5Bc%5D=false');
        st.end();
    });

    t.test('stringifies a nested object', function (st) {
        st.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');
        st.equal(qs.stringify({ a: { b: { c: { d: 'e' } } } }), 'a%5Bb%5D%5Bc%5D%5Bd%5D=e');
        st.end();
    });

    t.test('`allowDots` option: stringifies a nested object with dots notation', function (st) {
        st.equal(qs.stringify({ a: { b: 'c' } }, { allowDots: true }), 'a.b=c');
        st.equal(qs.stringify({ a: { b: { c: { d: 'e' } } } }, { allowDots: true }), 'a.b.c.d=e');
        st.end();
    });

    t.test('stringifies an array value', function (st) {
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'indices' }),
            'a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'brackets' }),
            'a%5B%5D=b&a%5B%5D=c&a%5B%5D=d',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'comma' }),
            'a=b%2Cc%2Cd',
            'comma => comma'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'comma', commaRoundTrip: true }),
            'a=b%2Cc%2Cd',
            'comma round trip => comma'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }),
            'a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d',
            'default => indices'
        );
        st.end();
    });

    t.test('`skipNulls` option', function (st) {
        st.equal(
            qs.stringify({ a: 'b', c: null }, { skipNulls: true }),
            'a=b',
            'omits nulls when asked'
        );

        st.equal(
            qs.stringify({ a: { b: 'c', d: null } }, { skipNulls: true }),
            'a%5Bb%5D=c',
            'omits nested nulls when asked'
        );

        st.end();
    });

    t.test('omits array indices when asked', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c', 'd'] }, { indices: false }), 'a=b&a=c&a=d');

        st.end();
    });

    t.test('omits object key/value pair when value is empty array', function (st) {
        st.equal(qs.stringify({ a: [], b: 'zz' }), 'b=zz');

        st.end();
    });

    t.test('should not omit object key/value pair when value is empty array and when asked', function (st) {
        st.equal(qs.stringify({ a: [], b: 'zz' }), 'b=zz');
        st.equal(qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: false }), 'b=zz');
        st.equal(qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: true }), 'a[]&b=zz');

        st.end();
    });

    t.test('should throw when allowEmptyArrays is not of type boolean', function (st) {
        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: 0 }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: null }); },
            TypeError
        );

        st.end();
    });

    t.test('allowEmptyArrays + strictNullHandling', function (st) {
        st.equal(
            qs.stringify(
                { testEmptyArray: [] },
                { strictNullHandling: true, allowEmptyArrays: true }
            ),
            'testEmptyArray[]'
        );

        st.end();
    });

    t.test('stringifies an array value with one item vs multiple items', function (st) {
        st.test('non-array item', function (s2t) {
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a=c');
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a=c');
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c');
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true }), 'a=c');

            s2t.end();
        });

        st.test('array with a single item', function (s2t) {
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[0]=c');
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=c');
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c');
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'comma', commaRoundTrip: true }), 'a[]=c'); // so it parses back as an array
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true }), 'a[0]=c');

            s2t.end();
        });

        st.test('array with multiple items', function (s2t) {
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[0]=c&a[1]=d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=c&a[]=d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c,d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'comma', commaRoundTrip: true }), 'a=c,d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true }), 'a[0]=c&a[1]=d');

            s2t.end();
        });

        st.test('array with multiple items with a comma inside', function (s2t) {
            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c%2Cd,e');
            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { arrayFormat: 'comma' }), 'a=c%2Cd%2Ce');

            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { encodeValuesOnly: true, arrayFormat: 'comma', commaRoundTrip: true }), 'a=c%2Cd,e');
            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { arrayFormat: 'comma', commaRoundTrip: true }), 'a=c%2Cd%2Ce');

            s2t.end();
        });

        st.end();
    });

    t.test('stringifies a nested array value', function (st) {
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[b][0]=c&a[b][1]=d');
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[b][]=c&a[b][]=d');
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a[b]=c,d');
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true }), 'a[b][0]=c&a[b][1]=d');
        st.end();
    });

    t.test('stringifies comma and empty array values', function (st) {
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'indices' }), 'a[0]=,&a[1]=&a[2]=c,d%');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'brackets' }), 'a[]=,&a[]=&a[]=c,d%');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'comma' }), 'a=,,,c,d%');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'repeat' }), 'a=,&a=&a=c,d%');

        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[0]=%2C&a[1]=&a[2]=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=%2C&a[]=&a[]=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=%2C,,c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a=%2C&a=&a=c%2Cd%25');

        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'indices' }), 'a%5B0%5D=%2C&a%5B1%5D=&a%5B2%5D=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'brackets' }), 'a%5B%5D=%2C&a%5B%5D=&a%5B%5D=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'comma' }), 'a=%2C%2C%2Cc%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'repeat' }), 'a=%2C&a=&a=c%2Cd%25');

        st.end();
    });

    t.test('stringifies comma and empty non-array values', function (st) {
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'indices' }), 'a=,&b=&c=c,d%');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'brackets' }), 'a=,&b=&c=c,d%');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'comma' }), 'a=,&b=&c=c,d%');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'repeat' }), 'a=,&b=&c=c,d%');

        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'indices' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a=%2C&b=&c=c%2Cd%25');

        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'indices' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'brackets' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'comma' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'repeat' }), 'a=%2C&b=&c=c%2Cd%25');

        st.end();
    });

    t.test('stringifies a nested array value with dots notation', function (st) {
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true, arrayFormat: 'indices' }
            ),
            'a.b[0]=c&a.b[1]=d',
            'indices: stringifies with dots + indices'
        );
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true, arrayFormat: 'brackets' }
            ),
            'a.b[]=c&a.b[]=d',
            'brackets: stringifies with dots + brackets'
        );
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true, arrayFormat: 'comma' }
            ),
            'a.b=c,d',
            'comma: stringifies with dots + comma'
        );
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true }
            ),
            'a.b[0]=c&a.b[1]=d',
            'default: stringifies with dots + indices'
        );
        st.end();
    });

    t.test('stringifies an object inside an array', function (st) {
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { arrayFormat: 'indices', encodeValuesOnly: true }),
            'a[0][b]=c',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { arrayFormat: 'repeat', encodeValuesOnly: true }),
            'a[b]=c',
            'repeat => repeat'
        );
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { arrayFormat: 'brackets', encodeValuesOnly: true }),
            'a[][b]=c',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { encodeValuesOnly: true }),
            'a[0][b]=c',
            'default => indices'
        );

        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { arrayFormat: 'indices', encodeValuesOnly: true }),
            'a[0][b][c][0]=1',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { arrayFormat: 'repeat', encodeValuesOnly: true }),
            'a[b][c]=1',
            'repeat => repeat'
        );
        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { arrayFormat: 'brackets', encodeValuesOnly: true }),
            'a[][b][c][]=1',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { encodeValuesOnly: true }),
            'a[0][b][c][0]=1',
            'default => indices'
        );

        st.end();
    });

    t.test('stringifies an array with mixed objects and primitives', function (st) {
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true, arrayFormat: 'indices' }),
            'a[0][b]=1&a[1]=2&a[2]=3',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'a[][b]=1&a[]=2&a[]=3',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true, arrayFormat: 'comma' }),
            '???',
            'brackets => brackets',
            { skip: 'TODO: figure out what this should do' }
        );
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true }),
            'a[0][b]=1&a[1]=2&a[2]=3',
            'default => indices'
        );

        st.end();
    });

    t.test('stringifies an object inside an array with dots notation', function (st) {
        st.equal(
            qs.stringify(
                { a: [{ b: 'c' }] },
                { allowDots: true, encode: false, arrayFormat: 'indices' }
            ),
            'a[0].b=c',
            'indices => indices'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: 'c' }] },
                { allowDots: true, encode: false, arrayFormat: 'brackets' }
            ),
            'a[].b=c',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: 'c' }] },
                { allowDots: true, encode: false }
            ),
            'a[0].b=c',
            'default => indices'
        );

        st.equal(
            qs.stringify(
                { a: [{ b: { c: [1] } }] },
                { allowDots: true, encode: false, arrayFormat: 'indices' }
            ),
            'a[0].b.c[0]=1',
            'indices => indices'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: { c: [1] } }] },
                { allowDots: true, encode: false, arrayFormat: 'brackets' }
            ),
            'a[].b.c[]=1',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: { c: [1] } }] },
                { allowDots: true, encode: false }
            ),
            'a[0].b.c[0]=1',
            'default => indices'
        );

        st.end();
    });

    t.test('does not omit object keys when indices = false', function (st) {
        st.equal(qs.stringify({ a: [{ b: 'c' }] }, { indices: false }), 'a%5Bb%5D=c');
        st.end();
    });

    t.test('uses indices notation for arrays when indices=true', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { indices: true }), 'a%5B0%5D=b&a%5B1%5D=c');
        st.end();
    });

    t.test('uses indices notation for arrays when no arrayFormat is specified', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }), 'a%5B0%5D=b&a%5B1%5D=c');
        st.end();
    });

    t.test('uses indices notation for arrays when arrayFormat=indices', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' }), 'a%5B0%5D=b&a%5B1%5D=c');
        st.end();
    });

    t.test('uses repeat notation for arrays when arrayFormat=repeat', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' }), 'a=b&a=c');
        st.end();
    });

    t.test('uses brackets notation for arrays when arrayFormat=brackets', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' }), 'a%5B%5D=b&a%5B%5D=c');
        st.end();
    });

    t.test('stringifies a complicated object', function (st) {
        st.equal(qs.stringify({ a: { b: 'c', d: 'e' } }), 'a%5Bb%5D=c&a%5Bd%5D=e');
        st.end();
    });

    t.test('stringifies an empty value', function (st) {
        st.equal(qs.stringify({ a: '' }), 'a=');
        st.equal(qs.stringify({ a: null }, { strictNullHandling: true }), 'a');

        st.equal(qs.stringify({ a: '', b: '' }), 'a=&b=');
        st.equal(qs.stringify({ a: null, b: '' }, { strictNullHandling: true }), 'a&b=');

        st.equal(qs.stringify({ a: { b: '' } }), 'a%5Bb%5D=');
        st.equal(qs.stringify({ a: { b: null } }, { strictNullHandling: true }), 'a%5Bb%5D');
        st.equal(qs.stringify({ a: { b: null } }, { strictNullHandling: false }), 'a%5Bb%5D=');

        st.end();
    });

    t.test('stringifies an empty array in different arrayFormat', function (st) {
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false }), 'b[0]=&c=c');
        // arrayFormat default
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'indices' }), 'b[0]=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'brackets' }), 'b[]=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'repeat' }), 'b=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma' }), 'b=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', commaRoundTrip: true }), 'b[]=&c=c');
        // with strictNullHandling
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'indices', strictNullHandling: true }), 'b[0]&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'brackets', strictNullHandling: true }), 'b[]&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'repeat', strictNullHandling: true }), 'b&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', strictNullHandling: true }), 'b&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', strictNullHandling: true, commaRoundTrip: true }), 'b[]&c=c');
        // with skipNulls
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'indices', skipNulls: true }), 'c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'brackets', skipNulls: true }), 'c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'repeat', skipNulls: true }), 'c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', skipNulls: true }), 'c=c');

        st.end();
    });

    t.test('stringifies a null object', { skip: !hasProto }, function (st) {
        st.equal(qs.stringify({ __proto__: null, a: 'b' }), 'a=b');
        st.end();
    });

    t.test('returns an empty string for invalid input', function (st) {
        st.equal(qs.stringify(undefined), '');
        st.equal(qs.stringify(false), '');
        st.equal(qs.stringify(null), '');
        st.equal(qs.stringify(''), '');
        st.end();
    });

    t.test('stringifies an object with a null object as a child', { skip: !hasProto }, function (st) {
        st.equal(qs.stringify({ a: { __proto__: null, b: 'c' } }), 'a%5Bb%5D=c');
        st.end();
    });

    t.test('drops keys with a value of undefined', function (st) {
        st.equal(qs.stringify({ a: undefined }), '');

        st.equal(qs.stringify({ a: { b: undefined, c: null } }, { strictNullHandling: true }), 'a%5Bc%5D');
        st.equal(qs.stringify({ a: { b: undefined, c: null } }, { strictNullHandling: false }), 'a%5Bc%5D=');
        st.equal(qs.stringify({ a: { b: undefined, c: '' } }), 'a%5Bc%5D=');
        st.end();
    });

    t.test('url encodes values', function (st) {
        st.equal(qs.stringify({ a: 'b c' }), 'a=b%20c');
        st.end();
    });

    t.test('stringifies a date', function (st) {
        var now = new Date();
        var str = 'a=' + encodeURIComponent(now.toISOString());
        st.equal(qs.stringify({ a: now }), str);
        st.end();
    });

    t.test('stringifies the weird object from qs', function (st) {
        st.equal(qs.stringify({ 'my weird field': '~q1!2"\'w$5&7/z8)?' }), 'my%20weird%20field=~q1%212%22%27w%245%267%2Fz8%29%3F');
        st.end();
    });

    t.test('skips properties that are part of the object prototype', function (st) {
        st.intercept(Object.prototype, 'crash', { value: 'test' });

        st.equal(qs.stringify({ a: 'b' }), 'a=b');
        st.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');

        st.end();
    });

    t.test('stringifies boolean values', function (st) {
        st.equal(qs.stringify({ a: true }), 'a=true');
        st.equal(qs.stringify({ a: { b: true } }), 'a%5Bb%5D=true');
        st.equal(qs.stringify({ b: false }), 'b=false');
        st.equal(qs.stringify({ b: { c: false } }), 'b%5Bc%5D=false');
        st.end();
    });

    t.test('stringifies buffer values', function (st) {
        st.equal(qs.stringify({ a: SaferBuffer.from('test') }), 'a=test');
        st.equal(qs.stringify({ a: { b: SaferBuffer.from('test') } }), 'a%5Bb%5D=test');
        st.end();
    });

    t.test('stringifies an object using an alternative delimiter', function (st) {
        st.equal(qs.stringify({ a: 'b', c: 'd' }, { delimiter: ';' }), 'a=b;c=d');
        st.end();
    });

    t.test('does not blow up when Buffer global is missing', function (st) {
        var restore = mockProperty(global, 'Buffer', { 'delete': true });

        var result = qs.stringify({ a: 'b', c: 'd' });

        restore();

        st.equal(result, 'a=b&c=d');
        st.end();
    });

    t.test('does not crash when parsing circular references', function (st) {
        var a = {};
        a.b = a;

        st['throws'](
            function () { qs.stringify({ 'foo[bar]': 'baz', 'foo[baz]': a }); },
            /RangeError: Cyclic object value/,
            'cyclic values throw'
        );

        var circular = {
            a: 'value'
        };
        circular.a = circular;
        st['throws'](
            function () { qs.stringify(circular); },
            /RangeError: Cyclic object value/,
            'cyclic values throw'
        );

        var arr = ['a'];
        st.doesNotThrow(
            function () { qs.stringify({ x: arr, y: arr }); },
            'non-cyclic values do not throw'
        );

        st.end();
    });

    t.test('non-circular duplicated references can still work', function (st) {
        var hourOfDay = {
            'function': 'hour_of_day'
        };

        var p1 = {
            'function': 'gte',
            arguments: [hourOfDay, 0]
        };
        var p2 = {
            'function': 'lte',
            arguments: [hourOfDay, 23]
        };

        st.equal(
            qs.stringify({ filters: { $and: [p1, p2] } }, { encodeValuesOnly: true, arrayFormat: 'indices' }),
            'filters[$and][0][function]=gte&filters[$and][0][arguments][0][function]=hour_of_day&filters[$and][0][arguments][1]=0&filters[$and][1][function]=lte&filters[$and][1][arguments][0][function]=hour_of_day&filters[$and][1][arguments][1]=23'
        );
        st.equal(
            qs.stringify({ filters: { $and: [p1, p2] } }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'filters[$and][][function]=gte&filters[$and][][arguments][][function]=hour_of_day&filters[$and][][arguments][]=0&filters[$and][][function]=lte&filters[$and][][arguments][][function]=hour_of_day&filters[$and][][arguments][]=23'
        );
        st.equal(
            qs.stringify({ filters: { $and: [p1, p2] } }, { encodeValuesOnly: true, arrayFormat: 'repeat' }),
            'filters[$and][function]=gte&filters[$and][arguments][function]=hour_of_day&filters[$and][arguments]=0&filters[$and][function]=lte&filters[$and][arguments][function]=hour_of_day&filters[$and][arguments]=23'
        );

        st.end();
    });

    t.test('selects properties when filter=array', function (st) {
        st.equal(qs.stringify({ a: 'b' }, { filter: ['a'] }), 'a=b');
        st.equal(qs.stringify({ a: 1 }, { filter: [] }), '');

        st.equal(
            qs.stringify(
                { a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' },
                { filter: ['a', 'b', 0, 2], arrayFormat: 'indices' }
            ),
            'a%5Bb%5D%5B0%5D=1&a%5Bb%5D%5B2%5D=3',
            'indices => indices'
        );
        st.equal(
            qs.stringify(
                { a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' },
                { filter: ['a', 'b', 0, 2], arrayFormat: 'brackets' }
            ),
            'a%5Bb%5D%5B%5D=1&a%5Bb%5D%5B%5D=3',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify(
                { a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' },
                { filter: ['a', 'b', 0, 2] }
            ),
            'a%5Bb%5D%5B0%5D=1&a%5Bb%5D%5B2%5D=3',
            'default => indices'
        );

        st.end();
    });

    t.test('supports custom representations when filter=function', function (st) {
        var calls = 0;
        var obj = { a: 'b', c: 'd', e: { f: new Date(1257894000000) } };
        var filterFunc = function (prefix, value) {
            calls += 1;
            if (calls === 1) {
                st.equal(prefix, '', 'prefix is empty');
                st.equal(value, obj);
            } else if (prefix === 'c') {
                return void 0;
            } else if (value instanceof Date) {
                st.equal(prefix, 'e[f]');
                return value.getTime();
            }
            return value;
        };

        st.equal(qs.stringify(obj, { filter: filterFunc }), 'a=b&e%5Bf%5D=1257894000000');
        st.equal(calls, 5);
        st.end();
    });

    t.test('can disable uri encoding', function (st) {
        st.equal(qs.stringify({ a: 'b' }, { encode: false }), 'a=b');
        st.equal(qs.stringify({ a: { b: 'c' } }, { encode: false }), 'a[b]=c');
        st.equal(qs.stringify({ a: 'b', c: null }, { strictNullHandling: true, encode: false }), 'a=b&c');
        st.end();
    });

    t.test('can sort the keys', function (st) {
        var sort = function (a, b) {
            return a.localeCompare(b);
        };
        st.equal(qs.stringify({ a: 'c', z: 'y', b: 'f' }, { sort: sort }), 'a=c&b=f&z=y');
        st.equal(qs.stringify({ a: 'c', z: { j: 'a', i: 'b' }, b: 'f' }, { sort: sort }), 'a=c&b=f&z%5Bi%5D=b&z%5Bj%5D=a');
        st.end();
    });

    t.test('can sort the keys at depth 3 or more too', function (st) {
        var sort = function (a, b) {
            return a.localeCompare(b);
        };
        st.equal(
            qs.stringify(
                { a: 'a', z: { zj: { zjb: 'zjb', zja: 'zja' }, zi: { zib: 'zib', zia: 'zia' } }, b: 'b' },
                { sort: sort, encode: false }
            ),
            'a=a&b=b&z[zi][zia]=zia&z[zi][zib]=zib&z[zj][zja]=zja&z[zj][zjb]=zjb'
        );
        st.equal(
            qs.stringify(
                { a: 'a', z: { zj: { zjb: 'zjb', zja: 'zja' }, zi: { zib: 'zib', zia: 'zia' } }, b: 'b' },
                { sort: null, encode: false }
            ),
            'a=a&z[zj][zjb]=zjb&z[zj][zja]=zja&z[zi][zib]=zib&z[zi][zia]=zia&b=b'
        );
        st.end();
    });

    t.test('can stringify with custom encoding', function (st) {
        st.equal(qs.stringify({ 県: '大阪府', '': '' }, {
            encoder: function (str) {
                if (str.length === 0) {
                    return '';
                }
                var buf = iconv.encode(str, 'shiftjis');
                var result = [];
                for (var i = 0; i < buf.length; ++i) {
                    result.push(buf.readUInt8(i).toString(16));
                }
                return '%' + result.join('%');
            }
        }), '%8c%a7=%91%e5%8d%e3%95%7b&=');
        st.end();
    });

    t.test('receives the default encoder as a second argument', function (st) {
        st.plan(8);

        qs.stringify({ a: 1, b: new Date(), c: true, d: [1] }, {
            encoder: function (str) {
                st.match(typeof str, /^(?:string|number|boolean)$/);
                return '';
            }
        });

        st.end();
    });

    t.test('receives the default encoder as a second argument', function (st) {
        st.plan(2);

        qs.stringify({ a: 1 }, {
            encoder: function (str, defaultEncoder) {
                st.equal(defaultEncoder, utils.encode);
            }
        });

        st.end();
    });

    t.test('throws error with wrong encoder', function (st) {
        st['throws'](function () {
            qs.stringify({}, { encoder: 'string' });
        }, new TypeError('Encoder has to be a function.'));
        st.end();
    });

    t.test('can use custom encoder for a buffer object', { skip: typeof Buffer === 'undefined' }, function (st) {
        st.equal(qs.stringify({ a: SaferBuffer.from([1]) }, {
            encoder: function (buffer) {
                if (typeof buffer === 'string') {
                    return buffer;
                }
                return String.fromCharCode(buffer.readUInt8(0) + 97);
            }
        }), 'a=b');

        st.equal(qs.stringify({ a: SaferBuffer.from('a b') }, {
            encoder: function (buffer) {
                return buffer;
            }
        }), 'a=a b');
        st.end();
    });

    t.test('serializeDate option', function (st) {
        var date = new Date();
        st.equal(
            qs.stringify({ a: date }),
            'a=' + date.toISOString().replace(/:/g, '%3A'),
            'default is toISOString'
        );

        var mutatedDate = new Date();
        mutatedDate.toISOString = function () {
            throw new SyntaxError();
        };
        st['throws'](function () {
            mutatedDate.toISOString();
        }, SyntaxError);
        st.equal(
            qs.stringify({ a: mutatedDate }),
            'a=' + Date.prototype.toISOString.call(mutatedDate).replace(/:/g, '%3A'),
            'toISOString works even when method is not locally present'
        );

        var specificDate = new Date(6);
        st.equal(
            qs.stringify(
                { a: specificDate },
                { serializeDate: function (d) { return d.getTime() * 7; } }
            ),
            'a=42',
            'custom serializeDate function called'
        );

        st.equal(
            qs.stringify(
                { a: [date] },
                {
                    serializeDate: function (d) { return d.getTime(); },
                    arrayFormat: 'comma'
                }
            ),
            'a=' + date.getTime(),
            'works with arrayFormat comma'
        );
        st.equal(
            qs.stringify(
                { a: [date] },
                {
                    serializeDate: function (d) { return d.getTime(); },
                    arrayFormat: 'comma',
                    commaRoundTrip: true
                }
            ),
            'a%5B%5D=' + date.getTime(),
            'works with arrayFormat comma'
        );

        st.end();
    });

    t.test('RFC 1738 serialization', function (st) {
        st.equal(qs.stringify({ a: 'b c' }, { format: qs.formats.RFC1738 }), 'a=b+c');
        st.equal(qs.stringify({ 'a b': 'c d' }, { format: qs.formats.RFC1738 }), 'a+b=c+d');
        st.equal(qs.stringify({ 'a b': SaferBuffer.from('a b') }, { format: qs.formats.RFC1738 }), 'a+b=a+b');

        st.equal(qs.stringify({ 'foo(ref)': 'bar' }, { format: qs.formats.RFC1738 }), 'foo(ref)=bar');

        st.end();
    });

    t.test('RFC 3986 spaces serialization', function (st) {
        st.equal(qs.stringify({ a: 'b c' }, { format: qs.formats.RFC3986 }), 'a=b%20c');
        st.equal(qs.stringify({ 'a b': 'c d' }, { format: qs.formats.RFC3986 }), 'a%20b=c%20d');
        st.equal(qs.stringify({ 'a b': SaferBuffer.from('a b') }, { format: qs.formats.RFC3986 }), 'a%20b=a%20b');

        st.end();
    });

    t.test('Backward compatibility to RFC 3986', function (st) {
        st.equal(qs.stringify({ a: 'b c' }), 'a=b%20c');
        st.equal(qs.stringify({ 'a b': SaferBuffer.from('a b') }), 'a%20b=a%20b');

        st.end();
    });

    t.test('Edge cases and unknown formats', function (st) {
        ['UFO1234', false, 1234, null, {}, []].forEach(function (format) {
            st['throws'](
                function () {
                    qs.stringify({ a: 'b c' }, { format: format });
                },
                new TypeError('Unknown format option provided.')
            );
        });
        st.end();
    });

    t.test('encodeValuesOnly', function (st) {
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
                { encodeValuesOnly: true, arrayFormat: 'indices' }
            ),
            'a=b&c[0]=d&c[1]=e%3Df&f[0][0]=g&f[1][0]=h',
            'encodeValuesOnly + indices'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
                { encodeValuesOnly: true, arrayFormat: 'brackets' }
            ),
            'a=b&c[]=d&c[]=e%3Df&f[][]=g&f[][]=h',
            'encodeValuesOnly + brackets'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
                { encodeValuesOnly: true, arrayFormat: 'repeat' }
            ),
            'a=b&c=d&c=e%3Df&f=g&f=h',
            'encodeValuesOnly + repeat'
        );

        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e'], f: [['g'], ['h']] },
                { arrayFormat: 'indices' }
            ),
            'a=b&c%5B0%5D=d&c%5B1%5D=e&f%5B0%5D%5B0%5D=g&f%5B1%5D%5B0%5D=h',
            'no encodeValuesOnly + indices'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e'], f: [['g'], ['h']] },
                { arrayFormat: 'brackets' }
            ),
            'a=b&c%5B%5D=d&c%5B%5D=e&f%5B%5D%5B%5D=g&f%5B%5D%5B%5D=h',
            'no encodeValuesOnly + brackets'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e'], f: [['g'], ['h']] },
                { arrayFormat: 'repeat' }
            ),
            'a=b&c=d&c=e&f=g&f=h',
            'no encodeValuesOnly + repeat'
        );

        st.end();
    });

    t.test('encodeValuesOnly - strictNullHandling', function (st) {
        st.equal(
            qs.stringify(
                { a: { b: null } },
                { encodeValuesOnly: true, strictNullHandling: true }
            ),
            'a[b]'
        );
        st.end();
    });

    t.test('throws if an invalid charset is specified', function (st) {
        st['throws'](function () {
            qs.stringify({ a: 'b' }, { charset: 'foobar' });
        }, new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined'));
        st.end();
    });

    t.test('respects a charset of iso-8859-1', function (st) {
        st.equal(qs.stringify({ æ: 'æ' }, { charset: 'iso-8859-1' }), '%E6=%E6');
        st.end();
    });

    t.test('encodes unrepresentable chars as numeric entities in iso-8859-1 mode', function (st) {
        st.equal(qs.stringify({ a: '☺' }, { charset: 'iso-8859-1' }), 'a=%26%239786%3B');
        st.end();
    });

    t.test('respects an explicit charset of utf-8 (the default)', function (st) {
        st.equal(qs.stringify({ a: 'æ' }, { charset: 'utf-8' }), 'a=%C3%A6');
        st.end();
    });

    t.test('`charsetSentinel` option', function (st) {
        st.equal(
            qs.stringify({ a: 'æ' }, { charsetSentinel: true, charset: 'utf-8' }),
            'utf8=%E2%9C%93&a=%C3%A6',
            'adds the right sentinel when instructed to and the charset is utf-8'
        );

        st.equal(
            qs.stringify({ a: 'æ' }, { charsetSentinel: true, charset: 'iso-8859-1' }),
            'utf8=%26%2310003%3B&a=%E6',
            'adds the right sentinel when instructed to and the charset is iso-8859-1'
        );

        st.end();
    });

    t.test('does not mutate the options argument', function (st) {
        var options = {};
        qs.stringify({}, options);
        st.deepEqual(options, {});
        st.end();
    });

    t.test('strictNullHandling works with custom filter', function (st) {
        var filter = function (prefix, value) {
            return value;
        };

        var options = { strictNullHandling: true, filter: filter };
        st.equal(qs.stringify({ key: null }, options), 'key');
        st.end();
    });

    t.test('strictNullHandling works with null serializeDate', function (st) {
        var serializeDate = function () {
            return null;
        };
        var options = { strictNullHandling: true, serializeDate: serializeDate };
        var date = new Date();
        st.equal(qs.stringify({ key: date }, options), 'key');
        st.end();
    });

    t.test('allows for encoding keys and values differently', function (st) {
        var encoder = function (str, defaultEncoder, charset, type) {
            if (type === 'key') {
                return defaultEncoder(str, defaultEncoder, charset, type).toLowerCase();
            }
            if (type === 'value') {
                return defaultEncoder(str, defaultEncoder, charset, type).toUpperCase();
            }
            throw 'this should never happen! type: ' + type;
        };

        st.deepEqual(qs.stringify({ KeY: 'vAlUe' }, { encoder: encoder }), 'key=VALUE');
        st.end();
    });

    t.test('objects inside arrays', function (st) {
        var obj = { a: { b: { c: 'd', e: 'f' } } };
        var withArray = { a: { b: [{ c: 'd', e: 'f' }] } };

        st.equal(qs.stringify(obj, { encode: false }), 'a[b][c]=d&a[b][e]=f', 'no array, no arrayFormat');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'brackets' }), 'a[b][c]=d&a[b][e]=f', 'no array, bracket');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'indices' }), 'a[b][c]=d&a[b][e]=f', 'no array, indices');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'repeat' }), 'a[b][c]=d&a[b][e]=f', 'no array, repeat');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'comma' }), 'a[b][c]=d&a[b][e]=f', 'no array, comma');

        st.equal(qs.stringify(withArray, { encode: false }), 'a[b][0][c]=d&a[b][0][e]=f', 'array, no arrayFormat');
        st.equal(qs.stringify(withArray, { encode: false, arrayFormat: 'brackets' }), 'a[b][][c]=d&a[b][][e]=f', 'array, bracket');
        st.equal(qs.stringify(withArray, { encode: false, arrayFormat: 'indices' }), 'a[b][0][c]=d&a[b][0][e]=f', 'array, indices');
        st.equal(qs.stringify(withArray, { encode: false, arrayFormat: 'repeat' }), 'a[b][c]=d&a[b][e]=f', 'array, repeat');
        st.equal(
            qs.stringify(withArray, { encode: false, arrayFormat: 'comma' }),
            '???',
            'array, comma',
            { skip: 'TODO: figure out what this should do' }
        );

        st.end();
    });

    t.test('stringifies sparse arrays', function (st) {
        /* eslint no-sparse-arrays: 0 */
        st.equal(qs.stringify({ a: [, '2', , , '1'] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1]=2&a[4]=1');
        st.equal(qs.stringify({ a: [, '2', , , '1'] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=2&a[]=1');
        st.equal(qs.stringify({ a: [, '2', , , '1'] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a=2&a=1');

        st.equal(qs.stringify({ a: [, { b: [, , { c: '1' }] }] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1][b][2][c]=1');
        st.equal(qs.stringify({ a: [, { b: [, , { c: '1' }] }] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[][b][][c]=1');
        st.equal(qs.stringify({ a: [, { b: [, , { c: '1' }] }] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a[b][c]=1');

        st.equal(qs.stringify({ a: [, [, , [, , , { c: '1' }]]] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1][2][3][c]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: '1' }]]] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[][][][c]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: '1' }]]] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a[c]=1');

        st.equal(qs.stringify({ a: [, [, , [, , , { c: [, '1'] }]]] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1][2][3][c][1]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: [, '1'] }]]] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[][][][c][]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: [, '1'] }]]] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a[c]=1');

        st.end();
    });

    t.test('encodes a very long string', function (st) {
        var chars = [];
        var expected = [];
        for (var i = 0; i < 5e3; i++) {
            chars.push(' ' + i);

            expected.push('%20' + i);
        }

        var obj = {
            foo: chars.join('')
        };

        st.equal(
            qs.stringify(obj, { arrayFormat: 'brackets', charset: 'utf-8' }),
            'foo=' + expected.join('')
        );

        st.end();
    });

    t.end();
});

test('stringifies empty keys', function (t) {
    emptyTestCases.forEach(function (testCase) {
        t.test('stringifies an object with empty string key with ' + testCase.input, function (st) {
            st.deepEqual(
                qs.stringify(testCase.withEmptyKeys, { encode: false, arrayFormat: 'indices' }),
                testCase.stringifyOutput.indices,
                'test case: ' + testCase.input + ', indices'
            );
            st.deepEqual(
                qs.stringify(testCase.withEmptyKeys, { encode: false, arrayFormat: 'brackets' }),
                testCase.stringifyOutput.brackets,
                'test case: ' + testCase.input + ', brackets'
            );
            st.deepEqual(
                qs.stringify(testCase.withEmptyKeys, { encode: false, arrayFormat: 'repeat' }),
                testCase.stringifyOutput.repeat,
                'test case: ' + testCase.input + ', repeat'
            );

            st.end();
        });
    });

    t.test('edge case with object/arrays', function (st) {
        st.deepEqual(qs.stringify({ '': { '': [2, 3] } }, { encode: false }), '[][0]=2&[][1]=3');
        st.deepEqual(qs.stringify({ '': { '': [2, 3], a: 2 } }, { encode: false }), '[][0]=2&[][1]=3&[a]=2');
        st.deepEqual(qs.stringify({ '': { '': [2, 3] } }, { encode: false, arrayFormat: 'indices' }), '[][0]=2&[][1]=3');
        st.deepEqual(qs.stringify({ '': { '': [2, 3], a: 2 } }, { encode: false, arrayFormat: 'indices' }), '[][0]=2&[][1]=3&[a]=2');

        st.end();
    });

    t.test('stringifies non-string keys', function (st) {
        var actual = qs.stringify({ a: 'b', 'false': {} }, {
            filter: ['a', false, null],
            allowDots: true,
            encodeDotInKeys: true
        });

        st.equal(actual, 'a=b', 'stringifies correctly');

        st.end();
    });
});


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = stringify;
const utils_1 = require("./utils.js");
const formats_1 = require("./formats.js");
const values_1 = require("../utils/values.js");
const array_prefix_generators = {
    brackets(prefix) {
        return String(prefix) + '[]';
    },
    comma: 'comma',
    indices(prefix, key) {
        return String(prefix) + '[' + key + ']';
    },
    repeat(prefix) {
        return String(prefix);
    },
};
const push_to_array = function (arr, value_or_array) {
    Array.prototype.push.apply(arr, (0, values_1.isArray)(value_or_array) ? value_or_array : [value_or_array]);
};
let toISOString;
const defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: utils_1.encode,
    encodeValuesOnly: false,
    format: formats_1.default_format,
    formatter: formats_1.default_formatter,
    /** @deprecated */
    indices: false,
    serializeDate(date) {
        return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
    },
    skipNulls: false,
    strictNullHandling: false,
};
function is_non_nullish_primitive(v) {
    return (typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        typeof v === 'symbol' ||
        typeof v === 'bigint');
}
const sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
    let obj = object;
    let tmp_sc = sideChannel;
    let step = 0;
    let find_flag = false;
    while ((tmp_sc = tmp_sc.get(sentinel)) !== void undefined && !find_flag) {
        // Where object last appeared in the ref tree
        const pos = tmp_sc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            }
            else {
                find_flag = true; // Break while
            }
        }
        if (typeof tmp_sc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    }
    else if (obj instanceof Date) {
        obj = serializeDate?.(obj);
    }
    else if (generateArrayPrefix === 'comma' && (0, values_1.isArray)(obj)) {
        obj = (0, utils_1.maybe_map)(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate?.(value);
            }
            return value;
        });
    }
    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ?
                // @ts-expect-error
                encoder(prefix, defaults.encoder, charset, 'key', format)
                : prefix;
        }
        obj = '';
    }
    if (is_non_nullish_primitive(obj) || (0, utils_1.is_buffer)(obj)) {
        if (encoder) {
            const key_value = encodeValuesOnly ? prefix
                // @ts-expect-error
                : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [
                formatter?.(key_value) +
                    '=' +
                    // @ts-expect-error
                    formatter?.(encoder(obj, defaults.encoder, charset, 'value', format)),
            ];
        }
        return [formatter?.(prefix) + '=' + formatter?.(String(obj))];
    }
    const values = [];
    if (typeof obj === 'undefined') {
        return values;
    }
    let obj_keys;
    if (generateArrayPrefix === 'comma' && (0, values_1.isArray)(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            // @ts-expect-error values only
            obj = (0, utils_1.maybe_map)(obj, encoder);
        }
        obj_keys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    }
    else if ((0, values_1.isArray)(filter)) {
        obj_keys = filter;
    }
    else {
        const keys = Object.keys(obj);
        obj_keys = sort ? keys.sort(sort) : keys;
    }
    const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);
    const adjusted_prefix = commaRoundTrip && (0, values_1.isArray)(obj) && obj.length === 1 ? encoded_prefix + '[]' : encoded_prefix;
    if (allowEmptyArrays && (0, values_1.isArray)(obj) && obj.length === 0) {
        return adjusted_prefix + '[]';
    }
    for (let j = 0; j < obj_keys.length; ++j) {
        const key = obj_keys[j];
        const value = 
        // @ts-ignore
        typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];
        if (skipNulls && value === null) {
            continue;
        }
        // @ts-ignore
        const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, '%2E') : key;
        const key_prefix = (0, values_1.isArray)(obj) ?
            typeof generateArrayPrefix === 'function' ?
                generateArrayPrefix(adjusted_prefix, encoded_key)
                : adjusted_prefix
            : adjusted_prefix + (allowDots ? '.' + encoded_key : '[' + encoded_key + ']');
        sideChannel.set(object, step);
        const valueSideChannel = new WeakMap();
        valueSideChannel.set(sentinel, sideChannel);
        push_to_array(values, inner_stringify(value, key_prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, 
        // @ts-ignore
        generateArrayPrefix === 'comma' && encodeValuesOnly && (0, values_1.isArray)(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }
    return values;
}
function normalize_stringify_options(opts = defaults) {
    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }
    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }
    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }
    const charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    let format = formats_1.default_format;
    if (typeof opts.format !== 'undefined') {
        if (!(0, utils_1.has)(formats_1.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    const formatter = formats_1.formatters[format];
    let filter = defaults.filter;
    if (typeof opts.filter === 'function' || (0, values_1.isArray)(opts.filter)) {
        filter = opts.filter;
    }
    let arrayFormat;
    if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
        arrayFormat = opts.arrayFormat;
    }
    else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = defaults.arrayFormat;
    }
    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    const allowDots = typeof opts.allowDots === 'undefined' ?
        !!opts.encodeDotInKeys === true ?
            true
            : defaults.allowDots
        : !!opts.allowDots;
    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        // @ts-ignore
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        // @ts-ignore
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
    };
}
function stringify(object, opts = {}) {
    let obj = object;
    const options = normalize_stringify_options(opts);
    let obj_keys;
    let filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    }
    else if ((0, values_1.isArray)(options.filter)) {
        filter = options.filter;
        obj_keys = filter;
    }
    const keys = [];
    if (typeof obj !== 'object' || obj === null) {
        return '';
    }
    const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
    const commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;
    if (!obj_keys) {
        obj_keys = Object.keys(obj);
    }
    if (options.sort) {
        obj_keys.sort(options.sort);
    }
    const sideChannel = new WeakMap();
    for (let i = 0; i < obj_keys.length; ++i) {
        const key = obj_keys[i];
        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        push_to_array(keys, inner_stringify(obj[key], key, 
        // @ts-expect-error
        generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
    }
    const joined = keys.join(options.delimiter);
    let prefix = options.addQueryPrefix === true ? '?' : '';
    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        }
        else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }
    return joined.length > 0 ? prefix + joined : '';
}
//# sourceMappingURL=stringify.js.map

'use strict'

let Stringifier = require('./stringifier')

function stringify(node, builder) {
  let str = new Stringifier(builder)
  str.stringify(node)
}

module.exports = stringify
stringify.default = stringify


'use strict';

var getSideChannel = require('side-channel');
var utils = require('./utils');
var formats = require('./formats');
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    commaRoundTrip: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: utils.encode,
    encodeValuesOnly: false,
    filter: void undefined,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var sentinel = {};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    commaRoundTrip,
    allowEmptyArrays,
    strictNullHandling,
    skipNulls,
    encodeDotInKeys,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    format,
    formatter,
    encodeValuesOnly,
    charset,
    sideChannel
) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== void undefined && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            obj = utils.maybeMap(obj, encoder);
        }
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);

    var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + '[]' : encodedPrefix;

    if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
        return adjustedPrefix + '[]';
    }

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === 'object' && key && typeof key.value !== 'undefined'
            ? key.value
            : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, '%2E') : String(key);
        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix
            : adjustedPrefix + (allowDots ? '.' + encodedKey : '[' + encodedKey + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            commaRoundTrip,
            allowEmptyArrays,
            strictNullHandling,
            skipNulls,
            encodeDotInKeys,
            generateArrayPrefix === 'comma' && encodeValuesOnly && isArray(obj) ? null : encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    var arrayFormat;
    if (opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = defaults.arrayFormat;
    }

    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
    var commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        var value = obj[key];

        if (options.skipNulls && value === null) {
            continue;
        }
        pushToArray(keys, stringify(
            value,
            key,
            generateArrayPrefix,
            commaRoundTrip,
            options.allowEmptyArrays,
            options.strictNullHandling,
            options.skipNulls,
            options.encodeDotInKeys,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};


'use strict';

var test = require('tape');
var qs = require('../');
var utils = require('../lib/utils');
var iconv = require('iconv-lite');
var SaferBuffer = require('safer-buffer').Buffer;
var hasSymbols = require('has-symbols');
var mockProperty = require('mock-property');
var emptyTestCases = require('./empty-keys-cases').emptyTestCases;
var hasProto = require('has-proto')();
var hasBigInt = require('has-bigints')();

test('stringify()', function (t) {
    t.test('stringifies a querystring object', function (st) {
        st.equal(qs.stringify({ a: 'b' }), 'a=b');
        st.equal(qs.stringify({ a: 1 }), 'a=1');
        st.equal(qs.stringify({ a: 1, b: 2 }), 'a=1&b=2');
        st.equal(qs.stringify({ a: 'A_Z' }), 'a=A_Z');
        st.equal(qs.stringify({ a: '€' }), 'a=%E2%82%AC');
        st.equal(qs.stringify({ a: '' }), 'a=%EE%80%80');
        st.equal(qs.stringify({ a: 'א' }), 'a=%D7%90');
        st.equal(qs.stringify({ a: '𐐷' }), 'a=%F0%90%90%B7');
        st.end();
    });

    t.test('stringifies falsy values', function (st) {
        st.equal(qs.stringify(undefined), '');
        st.equal(qs.stringify(null), '');
        st.equal(qs.stringify(null, { strictNullHandling: true }), '');
        st.equal(qs.stringify(false), '');
        st.equal(qs.stringify(0), '');
        st.end();
    });

    t.test('stringifies symbols', { skip: !hasSymbols() }, function (st) {
        st.equal(qs.stringify(Symbol.iterator), '');
        st.equal(qs.stringify([Symbol.iterator]), '0=Symbol%28Symbol.iterator%29');
        st.equal(qs.stringify({ a: Symbol.iterator }), 'a=Symbol%28Symbol.iterator%29');
        st.equal(
            qs.stringify({ a: [Symbol.iterator] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'a[]=Symbol%28Symbol.iterator%29'
        );
        st.end();
    });

    t.test('stringifies bigints', { skip: !hasBigInt }, function (st) {
        var three = BigInt(3);
        var encodeWithN = function (value, defaultEncoder, charset) {
            var result = defaultEncoder(value, defaultEncoder, charset);
            return typeof value === 'bigint' ? result + 'n' : result;
        };
        st.equal(qs.stringify(three), '');
        st.equal(qs.stringify([three]), '0=3');
        st.equal(qs.stringify([three], { encoder: encodeWithN }), '0=3n');
        st.equal(qs.stringify({ a: three }), 'a=3');
        st.equal(qs.stringify({ a: three }, { encoder: encodeWithN }), 'a=3n');
        st.equal(
            qs.stringify({ a: [three] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'a[]=3'
        );
        st.equal(
            qs.stringify({ a: [three] }, { encodeValuesOnly: true, encoder: encodeWithN, arrayFormat: 'brackets' }),
            'a[]=3n'
        );
        st.end();
    });

    t.test('encodes dot in key of object when encodeDotInKeys and allowDots is provided', function (st) {
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: false }
            ),
            'name.obj%5Bfirst%5D=John&name.obj%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: false }
            ),
            'name.obj.first=John&name.obj.last=Doe',
            'with allowDots true and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: true }
            ),
            'name%252Eobj%5Bfirst%5D=John&name%252Eobj%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys true'
        );
        st.equal(
            qs.stringify(
                { 'name.obj': { first: 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: true }
            ),
            'name%252Eobj.first=John&name%252Eobj.last=Doe',
            'with allowDots true and encodeDotInKeys true'
        );

        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: false }
            ),
            'name.obj.subobject%5Bfirst.godly.name%5D=John&name.obj.subobject%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: false }
            ),
            'name.obj.subobject.first.godly.name=John&name.obj.subobject.last=Doe',
            'with allowDots false and encodeDotInKeys false'
        );
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: false, encodeDotInKeys: true }
            ),
            'name%252Eobj%252Esubobject%5Bfirst.godly.name%5D=John&name%252Eobj%252Esubobject%5Blast%5D=Doe',
            'with allowDots false and encodeDotInKeys true'
        );
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { allowDots: true, encodeDotInKeys: true }
            ),
            'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
            'with allowDots true and encodeDotInKeys true'
        );

        st.end();
    });

    t.test('should encode dot in key of object, and automatically set allowDots to `true` when encodeDotInKeys is true and allowDots in undefined', function (st) {
        st.equal(
            qs.stringify(
                { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
                { encodeDotInKeys: true }
            ),
            'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
            'with allowDots undefined and encodeDotInKeys true'
        );
        st.end();
    });

    t.test('should encode dot in key of object when encodeDotInKeys and allowDots is provided, and nothing else when encodeValuesOnly is provided', function (st) {
        st.equal(
            qs.stringify({ 'name.obj': { first: 'John', last: 'Doe' } }, {
                encodeDotInKeys: true, allowDots: true, encodeValuesOnly: true
            }),
            'name%2Eobj.first=John&name%2Eobj.last=Doe'
        );

        st.equal(
            qs.stringify({ 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } }, { allowDots: true, encodeDotInKeys: true, encodeValuesOnly: true }),
            'name%2Eobj%2Esubobject.first%2Egodly%2Ename=John&name%2Eobj%2Esubobject.last=Doe'
        );

        st.end();
    });

    t.test('throws when `commaRoundTrip` is not a boolean', function (st) {
        st['throws'](
            function () { qs.stringify({}, { commaRoundTrip: 'not a boolean' }); },
            TypeError,
            'throws when `commaRoundTrip` is not a boolean'
        );

        st.end();
    });

    t.test('throws when `encodeDotInKeys` is not a boolean', function (st) {
        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: 0 }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { encodeDotInKeys: null }); },
            TypeError
        );

        st.end();
    });

    t.test('adds query prefix', function (st) {
        st.equal(qs.stringify({ a: 'b' }, { addQueryPrefix: true }), '?a=b');
        st.end();
    });

    t.test('with query prefix, outputs blank string given an empty object', function (st) {
        st.equal(qs.stringify({}, { addQueryPrefix: true }), '');
        st.end();
    });

    t.test('stringifies nested falsy values', function (st) {
        st.equal(qs.stringify({ a: { b: { c: null } } }), 'a%5Bb%5D%5Bc%5D=');
        st.equal(qs.stringify({ a: { b: { c: null } } }, { strictNullHandling: true }), 'a%5Bb%5D%5Bc%5D');
        st.equal(qs.stringify({ a: { b: { c: false } } }), 'a%5Bb%5D%5Bc%5D=false');
        st.end();
    });

    t.test('stringifies a nested object', function (st) {
        st.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');
        st.equal(qs.stringify({ a: { b: { c: { d: 'e' } } } }), 'a%5Bb%5D%5Bc%5D%5Bd%5D=e');
        st.end();
    });

    t.test('`allowDots` option: stringifies a nested object with dots notation', function (st) {
        st.equal(qs.stringify({ a: { b: 'c' } }, { allowDots: true }), 'a.b=c');
        st.equal(qs.stringify({ a: { b: { c: { d: 'e' } } } }, { allowDots: true }), 'a.b.c.d=e');
        st.end();
    });

    t.test('stringifies an array value', function (st) {
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'indices' }),
            'a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'brackets' }),
            'a%5B%5D=b&a%5B%5D=c&a%5B%5D=d',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'comma' }),
            'a=b%2Cc%2Cd',
            'comma => comma'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }, { arrayFormat: 'comma', commaRoundTrip: true }),
            'a=b%2Cc%2Cd',
            'comma round trip => comma'
        );
        st.equal(
            qs.stringify({ a: ['b', 'c', 'd'] }),
            'a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d',
            'default => indices'
        );
        st.end();
    });

    t.test('`skipNulls` option', function (st) {
        st.equal(
            qs.stringify({ a: 'b', c: null }, { skipNulls: true }),
            'a=b',
            'omits nulls when asked'
        );

        st.equal(
            qs.stringify({ a: { b: 'c', d: null } }, { skipNulls: true }),
            'a%5Bb%5D=c',
            'omits nested nulls when asked'
        );

        st.end();
    });

    t.test('omits array indices when asked', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c', 'd'] }, { indices: false }), 'a=b&a=c&a=d');

        st.end();
    });

    t.test('omits object key/value pair when value is empty array', function (st) {
        st.equal(qs.stringify({ a: [], b: 'zz' }), 'b=zz');

        st.end();
    });

    t.test('should not omit object key/value pair when value is empty array and when asked', function (st) {
        st.equal(qs.stringify({ a: [], b: 'zz' }), 'b=zz');
        st.equal(qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: false }), 'b=zz');
        st.equal(qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: true }), 'a[]&b=zz');

        st.end();
    });

    t.test('should throw when allowEmptyArrays is not of type boolean', function (st) {
        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: 0 }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.stringify({ a: [], b: 'zz' }, { allowEmptyArrays: null }); },
            TypeError
        );

        st.end();
    });

    t.test('allowEmptyArrays + strictNullHandling', function (st) {
        st.equal(
            qs.stringify(
                { testEmptyArray: [] },
                { strictNullHandling: true, allowEmptyArrays: true }
            ),
            'testEmptyArray[]'
        );

        st.end();
    });

    t.test('stringifies an array value with one item vs multiple items', function (st) {
        st.test('non-array item', function (s2t) {
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a=c');
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a=c');
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c');
            s2t.equal(qs.stringify({ a: 'c' }, { encodeValuesOnly: true }), 'a=c');

            s2t.end();
        });

        st.test('array with a single item', function (s2t) {
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[0]=c');
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=c');
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c');
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true, arrayFormat: 'comma', commaRoundTrip: true }), 'a[]=c'); // so it parses back as an array
            s2t.equal(qs.stringify({ a: ['c'] }, { encodeValuesOnly: true }), 'a[0]=c');

            s2t.end();
        });

        st.test('array with multiple items', function (s2t) {
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[0]=c&a[1]=d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=c&a[]=d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c,d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true, arrayFormat: 'comma', commaRoundTrip: true }), 'a=c,d');
            s2t.equal(qs.stringify({ a: ['c', 'd'] }, { encodeValuesOnly: true }), 'a[0]=c&a[1]=d');

            s2t.end();
        });

        st.test('array with multiple items with a comma inside', function (s2t) {
            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=c%2Cd,e');
            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { arrayFormat: 'comma' }), 'a=c%2Cd%2Ce');

            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { encodeValuesOnly: true, arrayFormat: 'comma', commaRoundTrip: true }), 'a=c%2Cd,e');
            s2t.equal(qs.stringify({ a: ['c,d', 'e'] }, { arrayFormat: 'comma', commaRoundTrip: true }), 'a=c%2Cd%2Ce');

            s2t.end();
        });

        st.end();
    });

    t.test('stringifies a nested array value', function (st) {
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[b][0]=c&a[b][1]=d');
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[b][]=c&a[b][]=d');
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true, arrayFormat: 'comma' }), 'a[b]=c,d');
        st.equal(qs.stringify({ a: { b: ['c', 'd'] } }, { encodeValuesOnly: true }), 'a[b][0]=c&a[b][1]=d');
        st.end();
    });

    t.test('stringifies comma and empty array values', function (st) {
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'indices' }), 'a[0]=,&a[1]=&a[2]=c,d%');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'brackets' }), 'a[]=,&a[]=&a[]=c,d%');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'comma' }), 'a=,,,c,d%');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: false, arrayFormat: 'repeat' }), 'a=,&a=&a=c,d%');

        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[0]=%2C&a[1]=&a[2]=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=%2C&a[]=&a[]=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=%2C,,c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a=%2C&a=&a=c%2Cd%25');

        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'indices' }), 'a%5B0%5D=%2C&a%5B1%5D=&a%5B2%5D=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'brackets' }), 'a%5B%5D=%2C&a%5B%5D=&a%5B%5D=c%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'comma' }), 'a=%2C%2C%2Cc%2Cd%25');
        st.equal(qs.stringify({ a: [',', '', 'c,d%'] }, { encode: true, encodeValuesOnly: false, arrayFormat: 'repeat' }), 'a=%2C&a=&a=c%2Cd%25');

        st.end();
    });

    t.test('stringifies comma and empty non-array values', function (st) {
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'indices' }), 'a=,&b=&c=c,d%');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'brackets' }), 'a=,&b=&c=c,d%');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'comma' }), 'a=,&b=&c=c,d%');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: false, arrayFormat: 'repeat' }), 'a=,&b=&c=c,d%');

        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'indices' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'comma' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a=%2C&b=&c=c%2Cd%25');

        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'indices' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'brackets' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'comma' }), 'a=%2C&b=&c=c%2Cd%25');
        st.equal(qs.stringify({ a: ',', b: '', c: 'c,d%' }, { encode: true, encodeValuesOnly: false, arrayFormat: 'repeat' }), 'a=%2C&b=&c=c%2Cd%25');

        st.end();
    });

    t.test('stringifies a nested array value with dots notation', function (st) {
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true, arrayFormat: 'indices' }
            ),
            'a.b[0]=c&a.b[1]=d',
            'indices: stringifies with dots + indices'
        );
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true, arrayFormat: 'brackets' }
            ),
            'a.b[]=c&a.b[]=d',
            'brackets: stringifies with dots + brackets'
        );
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true, arrayFormat: 'comma' }
            ),
            'a.b=c,d',
            'comma: stringifies with dots + comma'
        );
        st.equal(
            qs.stringify(
                { a: { b: ['c', 'd'] } },
                { allowDots: true, encodeValuesOnly: true }
            ),
            'a.b[0]=c&a.b[1]=d',
            'default: stringifies with dots + indices'
        );
        st.end();
    });

    t.test('stringifies an object inside an array', function (st) {
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { arrayFormat: 'indices', encodeValuesOnly: true }),
            'a[0][b]=c',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { arrayFormat: 'repeat', encodeValuesOnly: true }),
            'a[b]=c',
            'repeat => repeat'
        );
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { arrayFormat: 'brackets', encodeValuesOnly: true }),
            'a[][b]=c',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: [{ b: 'c' }] }, { encodeValuesOnly: true }),
            'a[0][b]=c',
            'default => indices'
        );

        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { arrayFormat: 'indices', encodeValuesOnly: true }),
            'a[0][b][c][0]=1',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { arrayFormat: 'repeat', encodeValuesOnly: true }),
            'a[b][c]=1',
            'repeat => repeat'
        );
        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { arrayFormat: 'brackets', encodeValuesOnly: true }),
            'a[][b][c][]=1',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: [{ b: { c: [1] } }] }, { encodeValuesOnly: true }),
            'a[0][b][c][0]=1',
            'default => indices'
        );

        st.end();
    });

    t.test('stringifies an array with mixed objects and primitives', function (st) {
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true, arrayFormat: 'indices' }),
            'a[0][b]=1&a[1]=2&a[2]=3',
            'indices => indices'
        );
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'a[][b]=1&a[]=2&a[]=3',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true, arrayFormat: 'comma' }),
            '???',
            'brackets => brackets',
            { skip: 'TODO: figure out what this should do' }
        );
        st.equal(
            qs.stringify({ a: [{ b: 1 }, 2, 3] }, { encodeValuesOnly: true }),
            'a[0][b]=1&a[1]=2&a[2]=3',
            'default => indices'
        );

        st.end();
    });

    t.test('stringifies an object inside an array with dots notation', function (st) {
        st.equal(
            qs.stringify(
                { a: [{ b: 'c' }] },
                { allowDots: true, encode: false, arrayFormat: 'indices' }
            ),
            'a[0].b=c',
            'indices => indices'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: 'c' }] },
                { allowDots: true, encode: false, arrayFormat: 'brackets' }
            ),
            'a[].b=c',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: 'c' }] },
                { allowDots: true, encode: false }
            ),
            'a[0].b=c',
            'default => indices'
        );

        st.equal(
            qs.stringify(
                { a: [{ b: { c: [1] } }] },
                { allowDots: true, encode: false, arrayFormat: 'indices' }
            ),
            'a[0].b.c[0]=1',
            'indices => indices'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: { c: [1] } }] },
                { allowDots: true, encode: false, arrayFormat: 'brackets' }
            ),
            'a[].b.c[]=1',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify(
                { a: [{ b: { c: [1] } }] },
                { allowDots: true, encode: false }
            ),
            'a[0].b.c[0]=1',
            'default => indices'
        );

        st.end();
    });

    t.test('does not omit object keys when indices = false', function (st) {
        st.equal(qs.stringify({ a: [{ b: 'c' }] }, { indices: false }), 'a%5Bb%5D=c');
        st.end();
    });

    t.test('uses indices notation for arrays when indices=true', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { indices: true }), 'a%5B0%5D=b&a%5B1%5D=c');
        st.end();
    });

    t.test('uses indices notation for arrays when no arrayFormat is specified', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }), 'a%5B0%5D=b&a%5B1%5D=c');
        st.end();
    });

    t.test('uses indices notation for arrays when arrayFormat=indices', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' }), 'a%5B0%5D=b&a%5B1%5D=c');
        st.end();
    });

    t.test('uses repeat notation for arrays when arrayFormat=repeat', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' }), 'a=b&a=c');
        st.end();
    });

    t.test('uses brackets notation for arrays when arrayFormat=brackets', function (st) {
        st.equal(qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' }), 'a%5B%5D=b&a%5B%5D=c');
        st.end();
    });

    t.test('stringifies a complicated object', function (st) {
        st.equal(qs.stringify({ a: { b: 'c', d: 'e' } }), 'a%5Bb%5D=c&a%5Bd%5D=e');
        st.end();
    });

    t.test('stringifies an empty value', function (st) {
        st.equal(qs.stringify({ a: '' }), 'a=');
        st.equal(qs.stringify({ a: null }, { strictNullHandling: true }), 'a');

        st.equal(qs.stringify({ a: '', b: '' }), 'a=&b=');
        st.equal(qs.stringify({ a: null, b: '' }, { strictNullHandling: true }), 'a&b=');

        st.equal(qs.stringify({ a: { b: '' } }), 'a%5Bb%5D=');
        st.equal(qs.stringify({ a: { b: null } }, { strictNullHandling: true }), 'a%5Bb%5D');
        st.equal(qs.stringify({ a: { b: null } }, { strictNullHandling: false }), 'a%5Bb%5D=');

        st.end();
    });

    t.test('stringifies an empty array in different arrayFormat', function (st) {
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false }), 'b[0]=&c=c');
        // arrayFormat default
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'indices' }), 'b[0]=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'brackets' }), 'b[]=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'repeat' }), 'b=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma' }), 'b=&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', commaRoundTrip: true }), 'b[]=&c=c');
        // with strictNullHandling
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'indices', strictNullHandling: true }), 'b[0]&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'brackets', strictNullHandling: true }), 'b[]&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'repeat', strictNullHandling: true }), 'b&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', strictNullHandling: true }), 'b&c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', strictNullHandling: true, commaRoundTrip: true }), 'b[]&c=c');
        // with skipNulls
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'indices', skipNulls: true }), 'c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'brackets', skipNulls: true }), 'c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'repeat', skipNulls: true }), 'c=c');
        st.equal(qs.stringify({ a: [], b: [null], c: 'c' }, { encode: false, arrayFormat: 'comma', skipNulls: true }), 'c=c');

        st.end();
    });

    t.test('stringifies a null object', { skip: !hasProto }, function (st) {
        st.equal(qs.stringify({ __proto__: null, a: 'b' }), 'a=b');
        st.end();
    });

    t.test('returns an empty string for invalid input', function (st) {
        st.equal(qs.stringify(undefined), '');
        st.equal(qs.stringify(false), '');
        st.equal(qs.stringify(null), '');
        st.equal(qs.stringify(''), '');
        st.end();
    });

    t.test('stringifies an object with a null object as a child', { skip: !hasProto }, function (st) {
        st.equal(qs.stringify({ a: { __proto__: null, b: 'c' } }), 'a%5Bb%5D=c');
        st.end();
    });

    t.test('drops keys with a value of undefined', function (st) {
        st.equal(qs.stringify({ a: undefined }), '');

        st.equal(qs.stringify({ a: { b: undefined, c: null } }, { strictNullHandling: true }), 'a%5Bc%5D');
        st.equal(qs.stringify({ a: { b: undefined, c: null } }, { strictNullHandling: false }), 'a%5Bc%5D=');
        st.equal(qs.stringify({ a: { b: undefined, c: '' } }), 'a%5Bc%5D=');
        st.end();
    });

    t.test('url encodes values', function (st) {
        st.equal(qs.stringify({ a: 'b c' }), 'a=b%20c');
        st.end();
    });

    t.test('stringifies a date', function (st) {
        var now = new Date();
        var str = 'a=' + encodeURIComponent(now.toISOString());
        st.equal(qs.stringify({ a: now }), str);
        st.end();
    });

    t.test('stringifies the weird object from qs', function (st) {
        st.equal(qs.stringify({ 'my weird field': '~q1!2"\'w$5&7/z8)?' }), 'my%20weird%20field=~q1%212%22%27w%245%267%2Fz8%29%3F');
        st.end();
    });

    t.test('skips properties that are part of the object prototype', function (st) {
        st.intercept(Object.prototype, 'crash', { value: 'test' });

        st.equal(qs.stringify({ a: 'b' }), 'a=b');
        st.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');

        st.end();
    });

    t.test('stringifies boolean values', function (st) {
        st.equal(qs.stringify({ a: true }), 'a=true');
        st.equal(qs.stringify({ a: { b: true } }), 'a%5Bb%5D=true');
        st.equal(qs.stringify({ b: false }), 'b=false');
        st.equal(qs.stringify({ b: { c: false } }), 'b%5Bc%5D=false');
        st.end();
    });

    t.test('stringifies buffer values', function (st) {
        st.equal(qs.stringify({ a: SaferBuffer.from('test') }), 'a=test');
        st.equal(qs.stringify({ a: { b: SaferBuffer.from('test') } }), 'a%5Bb%5D=test');
        st.end();
    });

    t.test('stringifies an object using an alternative delimiter', function (st) {
        st.equal(qs.stringify({ a: 'b', c: 'd' }, { delimiter: ';' }), 'a=b;c=d');
        st.end();
    });

    t.test('does not blow up when Buffer global is missing', function (st) {
        var restore = mockProperty(global, 'Buffer', { 'delete': true });

        var result = qs.stringify({ a: 'b', c: 'd' });

        restore();

        st.equal(result, 'a=b&c=d');
        st.end();
    });

    t.test('does not crash when parsing circular references', function (st) {
        var a = {};
        a.b = a;

        st['throws'](
            function () { qs.stringify({ 'foo[bar]': 'baz', 'foo[baz]': a }); },
            /RangeError: Cyclic object value/,
            'cyclic values throw'
        );

        var circular = {
            a: 'value'
        };
        circular.a = circular;
        st['throws'](
            function () { qs.stringify(circular); },
            /RangeError: Cyclic object value/,
            'cyclic values throw'
        );

        var arr = ['a'];
        st.doesNotThrow(
            function () { qs.stringify({ x: arr, y: arr }); },
            'non-cyclic values do not throw'
        );

        st.end();
    });

    t.test('non-circular duplicated references can still work', function (st) {
        var hourOfDay = {
            'function': 'hour_of_day'
        };

        var p1 = {
            'function': 'gte',
            arguments: [hourOfDay, 0]
        };
        var p2 = {
            'function': 'lte',
            arguments: [hourOfDay, 23]
        };

        st.equal(
            qs.stringify({ filters: { $and: [p1, p2] } }, { encodeValuesOnly: true, arrayFormat: 'indices' }),
            'filters[$and][0][function]=gte&filters[$and][0][arguments][0][function]=hour_of_day&filters[$and][0][arguments][1]=0&filters[$and][1][function]=lte&filters[$and][1][arguments][0][function]=hour_of_day&filters[$and][1][arguments][1]=23'
        );
        st.equal(
            qs.stringify({ filters: { $and: [p1, p2] } }, { encodeValuesOnly: true, arrayFormat: 'brackets' }),
            'filters[$and][][function]=gte&filters[$and][][arguments][][function]=hour_of_day&filters[$and][][arguments][]=0&filters[$and][][function]=lte&filters[$and][][arguments][][function]=hour_of_day&filters[$and][][arguments][]=23'
        );
        st.equal(
            qs.stringify({ filters: { $and: [p1, p2] } }, { encodeValuesOnly: true, arrayFormat: 'repeat' }),
            'filters[$and][function]=gte&filters[$and][arguments][function]=hour_of_day&filters[$and][arguments]=0&filters[$and][function]=lte&filters[$and][arguments][function]=hour_of_day&filters[$and][arguments]=23'
        );

        st.end();
    });

    t.test('selects properties when filter=array', function (st) {
        st.equal(qs.stringify({ a: 'b' }, { filter: ['a'] }), 'a=b');
        st.equal(qs.stringify({ a: 1 }, { filter: [] }), '');

        st.equal(
            qs.stringify(
                { a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' },
                { filter: ['a', 'b', 0, 2], arrayFormat: 'indices' }
            ),
            'a%5Bb%5D%5B0%5D=1&a%5Bb%5D%5B2%5D=3',
            'indices => indices'
        );
        st.equal(
            qs.stringify(
                { a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' },
                { filter: ['a', 'b', 0, 2], arrayFormat: 'brackets' }
            ),
            'a%5Bb%5D%5B%5D=1&a%5Bb%5D%5B%5D=3',
            'brackets => brackets'
        );
        st.equal(
            qs.stringify(
                { a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' },
                { filter: ['a', 'b', 0, 2] }
            ),
            'a%5Bb%5D%5B0%5D=1&a%5Bb%5D%5B2%5D=3',
            'default => indices'
        );

        st.end();
    });

    t.test('supports custom representations when filter=function', function (st) {
        var calls = 0;
        var obj = { a: 'b', c: 'd', e: { f: new Date(1257894000000) } };
        var filterFunc = function (prefix, value) {
            calls += 1;
            if (calls === 1) {
                st.equal(prefix, '', 'prefix is empty');
                st.equal(value, obj);
            } else if (prefix === 'c') {
                return void 0;
            } else if (value instanceof Date) {
                st.equal(prefix, 'e[f]');
                return value.getTime();
            }
            return value;
        };

        st.equal(qs.stringify(obj, { filter: filterFunc }), 'a=b&e%5Bf%5D=1257894000000');
        st.equal(calls, 5);
        st.end();
    });

    t.test('can disable uri encoding', function (st) {
        st.equal(qs.stringify({ a: 'b' }, { encode: false }), 'a=b');
        st.equal(qs.stringify({ a: { b: 'c' } }, { encode: false }), 'a[b]=c');
        st.equal(qs.stringify({ a: 'b', c: null }, { strictNullHandling: true, encode: false }), 'a=b&c');
        st.end();
    });

    t.test('can sort the keys', function (st) {
        var sort = function (a, b) {
            return a.localeCompare(b);
        };
        st.equal(qs.stringify({ a: 'c', z: 'y', b: 'f' }, { sort: sort }), 'a=c&b=f&z=y');
        st.equal(qs.stringify({ a: 'c', z: { j: 'a', i: 'b' }, b: 'f' }, { sort: sort }), 'a=c&b=f&z%5Bi%5D=b&z%5Bj%5D=a');
        st.end();
    });

    t.test('can sort the keys at depth 3 or more too', function (st) {
        var sort = function (a, b) {
            return a.localeCompare(b);
        };
        st.equal(
            qs.stringify(
                { a: 'a', z: { zj: { zjb: 'zjb', zja: 'zja' }, zi: { zib: 'zib', zia: 'zia' } }, b: 'b' },
                { sort: sort, encode: false }
            ),
            'a=a&b=b&z[zi][zia]=zia&z[zi][zib]=zib&z[zj][zja]=zja&z[zj][zjb]=zjb'
        );
        st.equal(
            qs.stringify(
                { a: 'a', z: { zj: { zjb: 'zjb', zja: 'zja' }, zi: { zib: 'zib', zia: 'zia' } }, b: 'b' },
                { sort: null, encode: false }
            ),
            'a=a&z[zj][zjb]=zjb&z[zj][zja]=zja&z[zi][zib]=zib&z[zi][zia]=zia&b=b'
        );
        st.end();
    });

    t.test('can stringify with custom encoding', function (st) {
        st.equal(qs.stringify({ 県: '大阪府', '': '' }, {
            encoder: function (str) {
                if (str.length === 0) {
                    return '';
                }
                var buf = iconv.encode(str, 'shiftjis');
                var result = [];
                for (var i = 0; i < buf.length; ++i) {
                    result.push(buf.readUInt8(i).toString(16));
                }
                return '%' + result.join('%');
            }
        }), '%8c%a7=%91%e5%8d%e3%95%7b&=');
        st.end();
    });

    t.test('receives the default encoder as a second argument', function (st) {
        st.plan(8);

        qs.stringify({ a: 1, b: new Date(), c: true, d: [1] }, {
            encoder: function (str) {
                st.match(typeof str, /^(?:string|number|boolean)$/);
                return '';
            }
        });

        st.end();
    });

    t.test('receives the default encoder as a second argument', function (st) {
        st.plan(2);

        qs.stringify({ a: 1 }, {
            encoder: function (str, defaultEncoder) {
                st.equal(defaultEncoder, utils.encode);
            }
        });

        st.end();
    });

    t.test('throws error with wrong encoder', function (st) {
        st['throws'](function () {
            qs.stringify({}, { encoder: 'string' });
        }, new TypeError('Encoder has to be a function.'));
        st.end();
    });

    t.test('can use custom encoder for a buffer object', { skip: typeof Buffer === 'undefined' }, function (st) {
        st.equal(qs.stringify({ a: SaferBuffer.from([1]) }, {
            encoder: function (buffer) {
                if (typeof buffer === 'string') {
                    return buffer;
                }
                return String.fromCharCode(buffer.readUInt8(0) + 97);
            }
        }), 'a=b');

        st.equal(qs.stringify({ a: SaferBuffer.from('a b') }, {
            encoder: function (buffer) {
                return buffer;
            }
        }), 'a=a b');
        st.end();
    });

    t.test('serializeDate option', function (st) {
        var date = new Date();
        st.equal(
            qs.stringify({ a: date }),
            'a=' + date.toISOString().replace(/:/g, '%3A'),
            'default is toISOString'
        );

        var mutatedDate = new Date();
        mutatedDate.toISOString = function () {
            throw new SyntaxError();
        };
        st['throws'](function () {
            mutatedDate.toISOString();
        }, SyntaxError);
        st.equal(
            qs.stringify({ a: mutatedDate }),
            'a=' + Date.prototype.toISOString.call(mutatedDate).replace(/:/g, '%3A'),
            'toISOString works even when method is not locally present'
        );

        var specificDate = new Date(6);
        st.equal(
            qs.stringify(
                { a: specificDate },
                { serializeDate: function (d) { return d.getTime() * 7; } }
            ),
            'a=42',
            'custom serializeDate function called'
        );

        st.equal(
            qs.stringify(
                { a: [date] },
                {
                    serializeDate: function (d) { return d.getTime(); },
                    arrayFormat: 'comma'
                }
            ),
            'a=' + date.getTime(),
            'works with arrayFormat comma'
        );
        st.equal(
            qs.stringify(
                { a: [date] },
                {
                    serializeDate: function (d) { return d.getTime(); },
                    arrayFormat: 'comma',
                    commaRoundTrip: true
                }
            ),
            'a%5B%5D=' + date.getTime(),
            'works with arrayFormat comma'
        );

        st.end();
    });

    t.test('RFC 1738 serialization', function (st) {
        st.equal(qs.stringify({ a: 'b c' }, { format: qs.formats.RFC1738 }), 'a=b+c');
        st.equal(qs.stringify({ 'a b': 'c d' }, { format: qs.formats.RFC1738 }), 'a+b=c+d');
        st.equal(qs.stringify({ 'a b': SaferBuffer.from('a b') }, { format: qs.formats.RFC1738 }), 'a+b=a+b');

        st.equal(qs.stringify({ 'foo(ref)': 'bar' }, { format: qs.formats.RFC1738 }), 'foo(ref)=bar');

        st.end();
    });

    t.test('RFC 3986 spaces serialization', function (st) {
        st.equal(qs.stringify({ a: 'b c' }, { format: qs.formats.RFC3986 }), 'a=b%20c');
        st.equal(qs.stringify({ 'a b': 'c d' }, { format: qs.formats.RFC3986 }), 'a%20b=c%20d');
        st.equal(qs.stringify({ 'a b': SaferBuffer.from('a b') }, { format: qs.formats.RFC3986 }), 'a%20b=a%20b');

        st.end();
    });

    t.test('Backward compatibility to RFC 3986', function (st) {
        st.equal(qs.stringify({ a: 'b c' }), 'a=b%20c');
        st.equal(qs.stringify({ 'a b': SaferBuffer.from('a b') }), 'a%20b=a%20b');

        st.end();
    });

    t.test('Edge cases and unknown formats', function (st) {
        ['UFO1234', false, 1234, null, {}, []].forEach(function (format) {
            st['throws'](
                function () {
                    qs.stringify({ a: 'b c' }, { format: format });
                },
                new TypeError('Unknown format option provided.')
            );
        });
        st.end();
    });

    t.test('encodeValuesOnly', function (st) {
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
                { encodeValuesOnly: true, arrayFormat: 'indices' }
            ),
            'a=b&c[0]=d&c[1]=e%3Df&f[0][0]=g&f[1][0]=h',
            'encodeValuesOnly + indices'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
                { encodeValuesOnly: true, arrayFormat: 'brackets' }
            ),
            'a=b&c[]=d&c[]=e%3Df&f[][]=g&f[][]=h',
            'encodeValuesOnly + brackets'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
                { encodeValuesOnly: true, arrayFormat: 'repeat' }
            ),
            'a=b&c=d&c=e%3Df&f=g&f=h',
            'encodeValuesOnly + repeat'
        );

        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e'], f: [['g'], ['h']] },
                { arrayFormat: 'indices' }
            ),
            'a=b&c%5B0%5D=d&c%5B1%5D=e&f%5B0%5D%5B0%5D=g&f%5B1%5D%5B0%5D=h',
            'no encodeValuesOnly + indices'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e'], f: [['g'], ['h']] },
                { arrayFormat: 'brackets' }
            ),
            'a=b&c%5B%5D=d&c%5B%5D=e&f%5B%5D%5B%5D=g&f%5B%5D%5B%5D=h',
            'no encodeValuesOnly + brackets'
        );
        st.equal(
            qs.stringify(
                { a: 'b', c: ['d', 'e'], f: [['g'], ['h']] },
                { arrayFormat: 'repeat' }
            ),
            'a=b&c=d&c=e&f=g&f=h',
            'no encodeValuesOnly + repeat'
        );

        st.end();
    });

    t.test('encodeValuesOnly - strictNullHandling', function (st) {
        st.equal(
            qs.stringify(
                { a: { b: null } },
                { encodeValuesOnly: true, strictNullHandling: true }
            ),
            'a[b]'
        );
        st.end();
    });

    t.test('throws if an invalid charset is specified', function (st) {
        st['throws'](function () {
            qs.stringify({ a: 'b' }, { charset: 'foobar' });
        }, new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined'));
        st.end();
    });

    t.test('respects a charset of iso-8859-1', function (st) {
        st.equal(qs.stringify({ æ: 'æ' }, { charset: 'iso-8859-1' }), '%E6=%E6');
        st.end();
    });

    t.test('encodes unrepresentable chars as numeric entities in iso-8859-1 mode', function (st) {
        st.equal(qs.stringify({ a: '☺' }, { charset: 'iso-8859-1' }), 'a=%26%239786%3B');
        st.end();
    });

    t.test('respects an explicit charset of utf-8 (the default)', function (st) {
        st.equal(qs.stringify({ a: 'æ' }, { charset: 'utf-8' }), 'a=%C3%A6');
        st.end();
    });

    t.test('`charsetSentinel` option', function (st) {
        st.equal(
            qs.stringify({ a: 'æ' }, { charsetSentinel: true, charset: 'utf-8' }),
            'utf8=%E2%9C%93&a=%C3%A6',
            'adds the right sentinel when instructed to and the charset is utf-8'
        );

        st.equal(
            qs.stringify({ a: 'æ' }, { charsetSentinel: true, charset: 'iso-8859-1' }),
            'utf8=%26%2310003%3B&a=%E6',
            'adds the right sentinel when instructed to and the charset is iso-8859-1'
        );

        st.end();
    });

    t.test('does not mutate the options argument', function (st) {
        var options = {};
        qs.stringify({}, options);
        st.deepEqual(options, {});
        st.end();
    });

    t.test('strictNullHandling works with custom filter', function (st) {
        var filter = function (prefix, value) {
            return value;
        };

        var options = { strictNullHandling: true, filter: filter };
        st.equal(qs.stringify({ key: null }, options), 'key');
        st.end();
    });

    t.test('strictNullHandling works with null serializeDate', function (st) {
        var serializeDate = function () {
            return null;
        };
        var options = { strictNullHandling: true, serializeDate: serializeDate };
        var date = new Date();
        st.equal(qs.stringify({ key: date }, options), 'key');
        st.end();
    });

    t.test('allows for encoding keys and values differently', function (st) {
        var encoder = function (str, defaultEncoder, charset, type) {
            if (type === 'key') {
                return defaultEncoder(str, defaultEncoder, charset, type).toLowerCase();
            }
            if (type === 'value') {
                return defaultEncoder(str, defaultEncoder, charset, type).toUpperCase();
            }
            throw 'this should never happen! type: ' + type;
        };

        st.deepEqual(qs.stringify({ KeY: 'vAlUe' }, { encoder: encoder }), 'key=VALUE');
        st.end();
    });

    t.test('objects inside arrays', function (st) {
        var obj = { a: { b: { c: 'd', e: 'f' } } };
        var withArray = { a: { b: [{ c: 'd', e: 'f' }] } };

        st.equal(qs.stringify(obj, { encode: false }), 'a[b][c]=d&a[b][e]=f', 'no array, no arrayFormat');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'brackets' }), 'a[b][c]=d&a[b][e]=f', 'no array, bracket');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'indices' }), 'a[b][c]=d&a[b][e]=f', 'no array, indices');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'repeat' }), 'a[b][c]=d&a[b][e]=f', 'no array, repeat');
        st.equal(qs.stringify(obj, { encode: false, arrayFormat: 'comma' }), 'a[b][c]=d&a[b][e]=f', 'no array, comma');

        st.equal(qs.stringify(withArray, { encode: false }), 'a[b][0][c]=d&a[b][0][e]=f', 'array, no arrayFormat');
        st.equal(qs.stringify(withArray, { encode: false, arrayFormat: 'brackets' }), 'a[b][][c]=d&a[b][][e]=f', 'array, bracket');
        st.equal(qs.stringify(withArray, { encode: false, arrayFormat: 'indices' }), 'a[b][0][c]=d&a[b][0][e]=f', 'array, indices');
        st.equal(qs.stringify(withArray, { encode: false, arrayFormat: 'repeat' }), 'a[b][c]=d&a[b][e]=f', 'array, repeat');
        st.equal(
            qs.stringify(withArray, { encode: false, arrayFormat: 'comma' }),
            '???',
            'array, comma',
            { skip: 'TODO: figure out what this should do' }
        );

        st.end();
    });

    t.test('stringifies sparse arrays', function (st) {
        /* eslint no-sparse-arrays: 0 */
        st.equal(qs.stringify({ a: [, '2', , , '1'] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1]=2&a[4]=1');
        st.equal(qs.stringify({ a: [, '2', , , '1'] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[]=2&a[]=1');
        st.equal(qs.stringify({ a: [, '2', , , '1'] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a=2&a=1');

        st.equal(qs.stringify({ a: [, { b: [, , { c: '1' }] }] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1][b][2][c]=1');
        st.equal(qs.stringify({ a: [, { b: [, , { c: '1' }] }] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[][b][][c]=1');
        st.equal(qs.stringify({ a: [, { b: [, , { c: '1' }] }] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a[b][c]=1');

        st.equal(qs.stringify({ a: [, [, , [, , , { c: '1' }]]] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1][2][3][c]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: '1' }]]] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[][][][c]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: '1' }]]] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a[c]=1');

        st.equal(qs.stringify({ a: [, [, , [, , , { c: [, '1'] }]]] }, { encodeValuesOnly: true, arrayFormat: 'indices' }), 'a[1][2][3][c][1]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: [, '1'] }]]] }, { encodeValuesOnly: true, arrayFormat: 'brackets' }), 'a[][][][c][]=1');
        st.equal(qs.stringify({ a: [, [, , [, , , { c: [, '1'] }]]] }, { encodeValuesOnly: true, arrayFormat: 'repeat' }), 'a[c]=1');

        st.end();
    });

    t.test('encodes a very long string', function (st) {
        var chars = [];
        var expected = [];
        for (var i = 0; i < 5e3; i++) {
            chars.push(' ' + i);

            expected.push('%20' + i);
        }

        var obj = {
            foo: chars.join('')
        };

        st.equal(
            qs.stringify(obj, { arrayFormat: 'brackets', charset: 'utf-8' }),
            'foo=' + expected.join('')
        );

        st.end();
    });

    t.end();
});

test('stringifies empty keys', function (t) {
    emptyTestCases.forEach(function (testCase) {
        t.test('stringifies an object with empty string key with ' + testCase.input, function (st) {
            st.deepEqual(
                qs.stringify(testCase.withEmptyKeys, { encode: false, arrayFormat: 'indices' }),
                testCase.stringifyOutput.indices,
                'test case: ' + testCase.input + ', indices'
            );
            st.deepEqual(
                qs.stringify(testCase.withEmptyKeys, { encode: false, arrayFormat: 'brackets' }),
                testCase.stringifyOutput.brackets,
                'test case: ' + testCase.input + ', brackets'
            );
            st.deepEqual(
                qs.stringify(testCase.withEmptyKeys, { encode: false, arrayFormat: 'repeat' }),
                testCase.stringifyOutput.repeat,
                'test case: ' + testCase.input + ', repeat'
            );

            st.end();
        });
    });

    t.test('edge case with object/arrays', function (st) {
        st.deepEqual(qs.stringify({ '': { '': [2, 3] } }, { encode: false }), '[][0]=2&[][1]=3');
        st.deepEqual(qs.stringify({ '': { '': [2, 3], a: 2 } }, { encode: false }), '[][0]=2&[][1]=3&[a]=2');
        st.deepEqual(qs.stringify({ '': { '': [2, 3] } }, { encode: false, arrayFormat: 'indices' }), '[][0]=2&[][1]=3');
        st.deepEqual(qs.stringify({ '': { '': [2, 3], a: 2 } }, { encode: false, arrayFormat: 'indices' }), '[][0]=2&[][1]=3&[a]=2');

        st.end();
    });

    t.test('stringifies non-string keys', function (st) {
        var actual = qs.stringify({ a: 'b', 'false': {} }, {
            filter: ['a', false, null],
            allowDots: true,
            encodeDotInKeys: true
        });

        st.equal(actual, 'a=b', 'stringifies correctly');

        st.end();
    });
});
