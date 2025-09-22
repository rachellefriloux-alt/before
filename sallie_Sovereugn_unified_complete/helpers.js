/**
* Get original stacktrace without source map support the most performant way.
* - Create only 1 stack frame.
* - Rewrite prepareStackTrace to bypass "support-stack-trace" (usually takes ~250ms).
*/
function createSimpleStackTrace(options) {
	const { message = "$$stack trace error", stackTraceLimit = 1 } = options || {};
	const limit = Error.stackTraceLimit;
	const prepareStackTrace = Error.prepareStackTrace;
	Error.stackTraceLimit = stackTraceLimit;
	Error.prepareStackTrace = (e) => e.stack;
	const err = new Error(message);
	const stackTrace = err.stack || "";
	Error.prepareStackTrace = prepareStackTrace;
	Error.stackTraceLimit = limit;
	return stackTrace;
}
function notNullish(v) {
	return v != null;
}
function assertTypes(value, name, types) {
	const receivedType = typeof value;
	const pass = types.includes(receivedType);
	if (!pass) {
		throw new TypeError(`${name} value must be ${types.join(" or ")}, received "${receivedType}"`);
	}
}
function isPrimitive(value) {
	return value === null || typeof value !== "function" && typeof value !== "object";
}
function slash(path) {
	return path.replace(/\\/g, "/");
}
// convert RegExp.toString to RegExp
function parseRegexp(input) {
	// Parse input
	// eslint-disable-next-line regexp/no-misleading-capturing-group
	const m = input.match(/(\/?)(.+)\1([a-z]*)/i);
	// match nothing
	if (!m) {
		return /$^/;
	}
	// Invalid flags
	// eslint-disable-next-line regexp/optimal-quantifier-concatenation
	if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
		return new RegExp(input);
	}
	// Create the regular expression
	return new RegExp(m[2], m[3]);
}
function toArray(array) {
	if (array === null || array === undefined) {
		array = [];
	}
	if (Array.isArray(array)) {
		return array;
	}
	return [array];
}
function isObject(item) {
	return item != null && typeof item === "object" && !Array.isArray(item);
}
function isFinalObj(obj) {
	return obj === Object.prototype || obj === Function.prototype || obj === RegExp.prototype;
}
function getType(value) {
	return Object.prototype.toString.apply(value).slice(8, -1);
}
function collectOwnProperties(obj, collector) {
	const collect = typeof collector === "function" ? collector : (key) => collector.add(key);
	Object.getOwnPropertyNames(obj).forEach(collect);
	Object.getOwnPropertySymbols(obj).forEach(collect);
}
function getOwnProperties(obj) {
	const ownProps = new Set();
	if (isFinalObj(obj)) {
		return [];
	}
	collectOwnProperties(obj, ownProps);
	return Array.from(ownProps);
}
const defaultCloneOptions = { forceWritable: false };
function deepClone(val, options = defaultCloneOptions) {
	const seen = new WeakMap();
	return clone(val, seen, options);
}
function clone(val, seen, options = defaultCloneOptions) {
	let k, out;
	if (seen.has(val)) {
		return seen.get(val);
	}
	if (Array.isArray(val)) {
		out = Array.from({ length: k = val.length });
		seen.set(val, out);
		while (k--) {
			out[k] = clone(val[k], seen, options);
		}
		return out;
	}
	if (Object.prototype.toString.call(val) === "[object Object]") {
		out = Object.create(Object.getPrototypeOf(val));
		seen.set(val, out);
		// we don't need properties from prototype
		const props = getOwnProperties(val);
		for (const k of props) {
			const descriptor = Object.getOwnPropertyDescriptor(val, k);
			if (!descriptor) {
				continue;
			}
			const cloned = clone(val[k], seen, options);
			if (options.forceWritable) {
				Object.defineProperty(out, k, {
					enumerable: descriptor.enumerable,
					configurable: true,
					writable: true,
					value: cloned
				});
			} else if ("get" in descriptor) {
				Object.defineProperty(out, k, {
					...descriptor,
					get() {
						return cloned;
					}
				});
			} else {
				Object.defineProperty(out, k, {
					...descriptor,
					value: cloned
				});
			}
		}
		return out;
	}
	return val;
}
function noop() {}
function objectAttr(source, path, defaultValue = undefined) {
	// a[3].b -> a.3.b
	const paths = path.replace(/\[(\d+)\]/g, ".$1").split(".");
	let result = source;
	for (const p of paths) {
		result = new Object(result)[p];
		if (result === undefined) {
			return defaultValue;
		}
	}
	return result;
}
function createDefer() {
	let resolve = null;
	let reject = null;
	const p = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	p.resolve = resolve;
	p.reject = reject;
	return p;
}
/**
* If code starts with a function call, will return its last index, respecting arguments.
* This will return 25 - last ending character of toMatch ")"
* Also works with callbacks
* ```
* toMatch({ test: '123' });
* toBeAliased('123')
* ```
*/
function getCallLastIndex(code) {
	let charIndex = -1;
	let inString = null;
	let startedBracers = 0;
	let endedBracers = 0;
	let beforeChar = null;
	while (charIndex <= code.length) {
		beforeChar = code[charIndex];
		charIndex++;
		const char = code[charIndex];
		const isCharString = char === "\"" || char === "'" || char === "`";
		if (isCharString && beforeChar !== "\\") {
			if (inString === char) {
				inString = null;
			} else if (!inString) {
				inString = char;
			}
		}
		if (!inString) {
			if (char === "(") {
				startedBracers++;
			}
			if (char === ")") {
				endedBracers++;
			}
		}
		if (startedBracers && endedBracers && startedBracers === endedBracers) {
			return charIndex;
		}
	}
	return null;
}
function isNegativeNaN(val) {
	if (!Number.isNaN(val)) {
		return false;
	}
	const f64 = new Float64Array(1);
	f64[0] = val;
	const u32 = new Uint32Array(f64.buffer);
	const isNegative = u32[1] >>> 31 === 1;
	return isNegative;
}
function toString(v) {
	return Object.prototype.toString.call(v);
}
function isPlainObject(val) {
	return toString(val) === "[object Object]" && (!val.constructor || val.constructor.name === "Object");
}
function isMergeableObject(item) {
	return isPlainObject(item) && !Array.isArray(item);
}
/**
* Deep merge :P
*
* Will merge objects only if they are plain
*
* Do not merge types - it is very expensive and usually it's better to case a type here
*/
function deepMerge(target, ...sources) {
	if (!sources.length) {
		return target;
	}
	const source = sources.shift();
	if (source === undefined) {
		return target;
	}
	if (isMergeableObject(target) && isMergeableObject(source)) {
		Object.keys(source).forEach((key) => {
			const _source = source;
			if (isMergeableObject(_source[key])) {
				if (!target[key]) {
					target[key] = {};
				}
				deepMerge(target[key], _source[key]);
			} else {
				target[key] = _source[key];
			}
		});
	}
	return deepMerge(target, ...sources);
}

export { assertTypes, clone, createDefer, createSimpleStackTrace, deepClone, deepMerge, getCallLastIndex, getOwnProperties, getType, isNegativeNaN, isObject, isPrimitive, noop, notNullish, objectAttr, parseRegexp, slash, toArray };


const ansiColors = {
    bold: ['1', '22'],
    dim: ['2', '22'],
    italic: ['3', '23'],
    underline: ['4', '24'],
    // 5 & 6 are blinking
    inverse: ['7', '27'],
    hidden: ['8', '28'],
    strike: ['9', '29'],
    // 10-20 are fonts
    // 21-29 are resets for 1-9
    black: ['30', '39'],
    red: ['31', '39'],
    green: ['32', '39'],
    yellow: ['33', '39'],
    blue: ['34', '39'],
    magenta: ['35', '39'],
    cyan: ['36', '39'],
    white: ['37', '39'],
    brightblack: ['30;1', '39'],
    brightred: ['31;1', '39'],
    brightgreen: ['32;1', '39'],
    brightyellow: ['33;1', '39'],
    brightblue: ['34;1', '39'],
    brightmagenta: ['35;1', '39'],
    brightcyan: ['36;1', '39'],
    brightwhite: ['37;1', '39'],
    grey: ['90', '39'],
};
const styles = {
    special: 'cyan',
    number: 'yellow',
    bigint: 'yellow',
    boolean: 'yellow',
    undefined: 'grey',
    null: 'bold',
    string: 'green',
    symbol: 'green',
    date: 'magenta',
    regexp: 'red',
};
export const truncator = '…';
function colorise(value, styleType) {
    const color = ansiColors[styles[styleType]] || ansiColors[styleType] || '';
    if (!color) {
        return String(value);
    }
    return `\u001b[${color[0]}m${String(value)}\u001b[${color[1]}m`;
}
export function normaliseOptions({ showHidden = false, depth = 2, colors = false, customInspect = true, showProxy = false, maxArrayLength = Infinity, breakLength = Infinity, seen = [], 
// eslint-disable-next-line no-shadow
truncate = Infinity, stylize = String, } = {}, inspect) {
    const options = {
        showHidden: Boolean(showHidden),
        depth: Number(depth),
        colors: Boolean(colors),
        customInspect: Boolean(customInspect),
        showProxy: Boolean(showProxy),
        maxArrayLength: Number(maxArrayLength),
        breakLength: Number(breakLength),
        truncate: Number(truncate),
        seen,
        inspect,
        stylize,
    };
    if (options.colors) {
        options.stylize = colorise;
    }
    return options;
}
function isHighSurrogate(char) {
    return char >= '\ud800' && char <= '\udbff';
}
export function truncate(string, length, tail = truncator) {
    string = String(string);
    const tailLength = tail.length;
    const stringLength = string.length;
    if (tailLength > length && stringLength > tailLength) {
        return tail;
    }
    if (stringLength > length && stringLength > tailLength) {
        let end = length - tailLength;
        if (end > 0 && isHighSurrogate(string[end - 1])) {
            end = end - 1;
        }
        return `${string.slice(0, end)}${tail}`;
    }
    return string;
}
// eslint-disable-next-line complexity
export function inspectList(list, options, inspectItem, separator = ', ') {
    inspectItem = inspectItem || options.inspect;
    const size = list.length;
    if (size === 0)
        return '';
    const originalLength = options.truncate;
    let output = '';
    let peek = '';
    let truncated = '';
    for (let i = 0; i < size; i += 1) {
        const last = i + 1 === list.length;
        const secondToLast = i + 2 === list.length;
        truncated = `${truncator}(${list.length - i})`;
        const value = list[i];
        // If there is more than one remaining we need to account for a separator of `, `
        options.truncate = originalLength - output.length - (last ? 0 : separator.length);
        const string = peek || inspectItem(value, options) + (last ? '' : separator);
        const nextLength = output.length + string.length;
        const truncatedLength = nextLength + truncated.length;
        // If this is the last element, and adding it would
        // take us over length, but adding the truncator wouldn't - then break now
        if (last && nextLength > originalLength && output.length + truncated.length <= originalLength) {
            break;
        }
        // If this isn't the last or second to last element to scan,
        // but the string is already over length then break here
        if (!last && !secondToLast && truncatedLength > originalLength) {
            break;
        }
        // Peek at the next string to determine if we should
        // break early before adding this item to the output
        peek = last ? '' : inspectItem(list[i + 1], options) + (secondToLast ? '' : separator);
        // If we have one element left, but this element and
        // the next takes over length, the break early
        if (!last && secondToLast && truncatedLength > originalLength && nextLength + peek.length > originalLength) {
            break;
        }
        output += string;
        // If the next element takes us to length -
        // but there are more after that, then we should truncate now
        if (!last && !secondToLast && nextLength + peek.length >= originalLength) {
            truncated = `${truncator}(${list.length - i - 1})`;
            break;
        }
        truncated = '';
    }
    return `${output}${truncated}`;
}
function quoteComplexKey(key) {
    if (key.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
        return key;
    }
    return JSON.stringify(key)
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"')
        .replace(/(^"|"$)/g, "'");
}
export function inspectProperty([key, value], options) {
    options.truncate -= 2;
    if (typeof key === 'string') {
        key = quoteComplexKey(key);
    }
    else if (typeof key !== 'number') {
        key = `[${options.inspect(key, options)}]`;
    }
    options.truncate -= key.length;
    value = options.inspect(value, options);
    return `${key}: ${value}`;
}


/**
* Get original stacktrace without source map support the most performant way.
* - Create only 1 stack frame.
* - Rewrite prepareStackTrace to bypass "support-stack-trace" (usually takes ~250ms).
*/
function createSimpleStackTrace(options) {
	const { message = "$$stack trace error", stackTraceLimit = 1 } = options || {};
	const limit = Error.stackTraceLimit;
	const prepareStackTrace = Error.prepareStackTrace;
	Error.stackTraceLimit = stackTraceLimit;
	Error.prepareStackTrace = (e) => e.stack;
	const err = new Error(message);
	const stackTrace = err.stack || "";
	Error.prepareStackTrace = prepareStackTrace;
	Error.stackTraceLimit = limit;
	return stackTrace;
}
function notNullish(v) {
	return v != null;
}
function assertTypes(value, name, types) {
	const receivedType = typeof value;
	const pass = types.includes(receivedType);
	if (!pass) {
		throw new TypeError(`${name} value must be ${types.join(" or ")}, received "${receivedType}"`);
	}
}
function isPrimitive(value) {
	return value === null || typeof value !== "function" && typeof value !== "object";
}
function slash(path) {
	return path.replace(/\\/g, "/");
}
// convert RegExp.toString to RegExp
function parseRegexp(input) {
	// Parse input
	// eslint-disable-next-line regexp/no-misleading-capturing-group
	const m = input.match(/(\/?)(.+)\1([a-z]*)/i);
	// match nothing
	if (!m) {
		return /$^/;
	}
	// Invalid flags
	// eslint-disable-next-line regexp/optimal-quantifier-concatenation
	if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
		return new RegExp(input);
	}
	// Create the regular expression
	return new RegExp(m[2], m[3]);
}
function toArray(array) {
	if (array === null || array === undefined) {
		array = [];
	}
	if (Array.isArray(array)) {
		return array;
	}
	return [array];
}
function isObject(item) {
	return item != null && typeof item === "object" && !Array.isArray(item);
}
function isFinalObj(obj) {
	return obj === Object.prototype || obj === Function.prototype || obj === RegExp.prototype;
}
function getType(value) {
	return Object.prototype.toString.apply(value).slice(8, -1);
}
function collectOwnProperties(obj, collector) {
	const collect = typeof collector === "function" ? collector : (key) => collector.add(key);
	Object.getOwnPropertyNames(obj).forEach(collect);
	Object.getOwnPropertySymbols(obj).forEach(collect);
}
function getOwnProperties(obj) {
	const ownProps = new Set();
	if (isFinalObj(obj)) {
		return [];
	}
	collectOwnProperties(obj, ownProps);
	return Array.from(ownProps);
}
const defaultCloneOptions = { forceWritable: false };
function deepClone(val, options = defaultCloneOptions) {
	const seen = new WeakMap();
	return clone(val, seen, options);
}
function clone(val, seen, options = defaultCloneOptions) {
	let k, out;
	if (seen.has(val)) {
		return seen.get(val);
	}
	if (Array.isArray(val)) {
		out = Array.from({ length: k = val.length });
		seen.set(val, out);
		while (k--) {
			out[k] = clone(val[k], seen, options);
		}
		return out;
	}
	if (Object.prototype.toString.call(val) === "[object Object]") {
		out = Object.create(Object.getPrototypeOf(val));
		seen.set(val, out);
		// we don't need properties from prototype
		const props = getOwnProperties(val);
		for (const k of props) {
			const descriptor = Object.getOwnPropertyDescriptor(val, k);
			if (!descriptor) {
				continue;
			}
			const cloned = clone(val[k], seen, options);
			if (options.forceWritable) {
				Object.defineProperty(out, k, {
					enumerable: descriptor.enumerable,
					configurable: true,
					writable: true,
					value: cloned
				});
			} else if ("get" in descriptor) {
				Object.defineProperty(out, k, {
					...descriptor,
					get() {
						return cloned;
					}
				});
			} else {
				Object.defineProperty(out, k, {
					...descriptor,
					value: cloned
				});
			}
		}
		return out;
	}
	return val;
}
function noop() {}
function objectAttr(source, path, defaultValue = undefined) {
	// a[3].b -> a.3.b
	const paths = path.replace(/\[(\d+)\]/g, ".$1").split(".");
	let result = source;
	for (const p of paths) {
		result = new Object(result)[p];
		if (result === undefined) {
			return defaultValue;
		}
	}
	return result;
}
function createDefer() {
	let resolve = null;
	let reject = null;
	const p = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	p.resolve = resolve;
	p.reject = reject;
	return p;
}
/**
* If code starts with a function call, will return its last index, respecting arguments.
* This will return 25 - last ending character of toMatch ")"
* Also works with callbacks
* ```
* toMatch({ test: '123' });
* toBeAliased('123')
* ```
*/
function getCallLastIndex(code) {
	let charIndex = -1;
	let inString = null;
	let startedBracers = 0;
	let endedBracers = 0;
	let beforeChar = null;
	while (charIndex <= code.length) {
		beforeChar = code[charIndex];
		charIndex++;
		const char = code[charIndex];
		const isCharString = char === "\"" || char === "'" || char === "`";
		if (isCharString && beforeChar !== "\\") {
			if (inString === char) {
				inString = null;
			} else if (!inString) {
				inString = char;
			}
		}
		if (!inString) {
			if (char === "(") {
				startedBracers++;
			}
			if (char === ")") {
				endedBracers++;
			}
		}
		if (startedBracers && endedBracers && startedBracers === endedBracers) {
			return charIndex;
		}
	}
	return null;
}
function isNegativeNaN(val) {
	if (!Number.isNaN(val)) {
		return false;
	}
	const f64 = new Float64Array(1);
	f64[0] = val;
	const u32 = new Uint32Array(f64.buffer);
	const isNegative = u32[1] >>> 31 === 1;
	return isNegative;
}
function toString(v) {
	return Object.prototype.toString.call(v);
}
function isPlainObject(val) {
	return toString(val) === "[object Object]" && (!val.constructor || val.constructor.name === "Object");
}
function isMergeableObject(item) {
	return isPlainObject(item) && !Array.isArray(item);
}
/**
* Deep merge :P
*
* Will merge objects only if they are plain
*
* Do not merge types - it is very expensive and usually it's better to case a type here
*/
function deepMerge(target, ...sources) {
	if (!sources.length) {
		return target;
	}
	const source = sources.shift();
	if (source === undefined) {
		return target;
	}
	if (isMergeableObject(target) && isMergeableObject(source)) {
		Object.keys(source).forEach((key) => {
			const _source = source;
			if (isMergeableObject(_source[key])) {
				if (!target[key]) {
					target[key] = {};
				}
				deepMerge(target[key], _source[key]);
			} else {
				target[key] = _source[key];
			}
		});
	}
	return deepMerge(target, ...sources);
}

export { assertTypes, clone, createDefer, createSimpleStackTrace, deepClone, deepMerge, getCallLastIndex, getOwnProperties, getType, isNegativeNaN, isObject, isPrimitive, noop, notNullish, objectAttr, parseRegexp, slash, toArray };


const ansiColors = {
    bold: ['1', '22'],
    dim: ['2', '22'],
    italic: ['3', '23'],
    underline: ['4', '24'],
    // 5 & 6 are blinking
    inverse: ['7', '27'],
    hidden: ['8', '28'],
    strike: ['9', '29'],
    // 10-20 are fonts
    // 21-29 are resets for 1-9
    black: ['30', '39'],
    red: ['31', '39'],
    green: ['32', '39'],
    yellow: ['33', '39'],
    blue: ['34', '39'],
    magenta: ['35', '39'],
    cyan: ['36', '39'],
    white: ['37', '39'],
    brightblack: ['30;1', '39'],
    brightred: ['31;1', '39'],
    brightgreen: ['32;1', '39'],
    brightyellow: ['33;1', '39'],
    brightblue: ['34;1', '39'],
    brightmagenta: ['35;1', '39'],
    brightcyan: ['36;1', '39'],
    brightwhite: ['37;1', '39'],
    grey: ['90', '39'],
};
const styles = {
    special: 'cyan',
    number: 'yellow',
    bigint: 'yellow',
    boolean: 'yellow',
    undefined: 'grey',
    null: 'bold',
    string: 'green',
    symbol: 'green',
    date: 'magenta',
    regexp: 'red',
};
export const truncator = '…';
function colorise(value, styleType) {
    const color = ansiColors[styles[styleType]] || ansiColors[styleType] || '';
    if (!color) {
        return String(value);
    }
    return `\u001b[${color[0]}m${String(value)}\u001b[${color[1]}m`;
}
export function normaliseOptions({ showHidden = false, depth = 2, colors = false, customInspect = true, showProxy = false, maxArrayLength = Infinity, breakLength = Infinity, seen = [], 
// eslint-disable-next-line no-shadow
truncate = Infinity, stylize = String, } = {}, inspect) {
    const options = {
        showHidden: Boolean(showHidden),
        depth: Number(depth),
        colors: Boolean(colors),
        customInspect: Boolean(customInspect),
        showProxy: Boolean(showProxy),
        maxArrayLength: Number(maxArrayLength),
        breakLength: Number(breakLength),
        truncate: Number(truncate),
        seen,
        inspect,
        stylize,
    };
    if (options.colors) {
        options.stylize = colorise;
    }
    return options;
}
function isHighSurrogate(char) {
    return char >= '\ud800' && char <= '\udbff';
}
export function truncate(string, length, tail = truncator) {
    string = String(string);
    const tailLength = tail.length;
    const stringLength = string.length;
    if (tailLength > length && stringLength > tailLength) {
        return tail;
    }
    if (stringLength > length && stringLength > tailLength) {
        let end = length - tailLength;
        if (end > 0 && isHighSurrogate(string[end - 1])) {
            end = end - 1;
        }
        return `${string.slice(0, end)}${tail}`;
    }
    return string;
}
// eslint-disable-next-line complexity
export function inspectList(list, options, inspectItem, separator = ', ') {
    inspectItem = inspectItem || options.inspect;
    const size = list.length;
    if (size === 0)
        return '';
    const originalLength = options.truncate;
    let output = '';
    let peek = '';
    let truncated = '';
    for (let i = 0; i < size; i += 1) {
        const last = i + 1 === list.length;
        const secondToLast = i + 2 === list.length;
        truncated = `${truncator}(${list.length - i})`;
        const value = list[i];
        // If there is more than one remaining we need to account for a separator of `, `
        options.truncate = originalLength - output.length - (last ? 0 : separator.length);
        const string = peek || inspectItem(value, options) + (last ? '' : separator);
        const nextLength = output.length + string.length;
        const truncatedLength = nextLength + truncated.length;
        // If this is the last element, and adding it would
        // take us over length, but adding the truncator wouldn't - then break now
        if (last && nextLength > originalLength && output.length + truncated.length <= originalLength) {
            break;
        }
        // If this isn't the last or second to last element to scan,
        // but the string is already over length then break here
        if (!last && !secondToLast && truncatedLength > originalLength) {
            break;
        }
        // Peek at the next string to determine if we should
        // break early before adding this item to the output
        peek = last ? '' : inspectItem(list[i + 1], options) + (secondToLast ? '' : separator);
        // If we have one element left, but this element and
        // the next takes over length, the break early
        if (!last && secondToLast && truncatedLength > originalLength && nextLength + peek.length > originalLength) {
            break;
        }
        output += string;
        // If the next element takes us to length -
        // but there are more after that, then we should truncate now
        if (!last && !secondToLast && nextLength + peek.length >= originalLength) {
            truncated = `${truncator}(${list.length - i - 1})`;
            break;
        }
        truncated = '';
    }
    return `${output}${truncated}`;
}
function quoteComplexKey(key) {
    if (key.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
        return key;
    }
    return JSON.stringify(key)
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"')
        .replace(/(^"|"$)/g, "'");
}
export function inspectProperty([key, value], options) {
    options.truncate -= 2;
    if (typeof key === 'string') {
        key = quoteComplexKey(key);
    }
    else if (typeof key !== 'number') {
        key = `[${options.inspect(key, options)}]`;
    }
    options.truncate -= key.length;
    value = options.inspect(value, options);
    return `${key}: ${value}`;
}
