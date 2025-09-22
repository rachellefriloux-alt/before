import { RFC1738 } from "./formats.mjs";
import { isArray } from "../utils/values.mjs";
export let has = (obj, key) => ((has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
    has(obj, key));
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
        if (isArray(obj)) {
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
export function merge(target, source, options = {}) {
    if (!source) {
        return target;
    }
    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        }
        else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has(Object.prototype, source)) {
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
    if (isArray(target) && !isArray(source)) {
        // @ts-ignore
        mergeTarget = array_to_object(target, options);
    }
    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has(target, i)) {
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
        if (has(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
}
export function assign_single_source(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
}
export function decode(str, _, charset) {
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
export const encode = (str, _defaultEncoder, charset, _kind, format) => {
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
                (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
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
export function compact(value) {
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
export function is_regexp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}
export function is_buffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
export function combine(a, b) {
    return [].concat(a, b);
}
export function maybe_map(val, fn) {
    if (isArray(val)) {
        const mapped = [];
        for (let i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
}
//# sourceMappingURL=utils.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export * from "./utils/values.mjs";
export * from "./utils/base64.mjs";
export * from "./utils/env.mjs";
export * from "./utils/log.mjs";
export * from "./utils/uuid.mjs";
export * from "./utils/sleep.mjs";
//# sourceMappingURL=utils.mjs.map

import { g as normalizeWindowsPath, j as join } from './shared/pathe.M-eThtNZ.mjs';

const pathSeparators = /* @__PURE__ */ new Set(["/", "\\", void 0]);
const normalizedAliasSymbol = Symbol.for("pathe:normalizedAlias");
const SLASH_RE = /[/\\]/;
function normalizeAliases(_aliases) {
  if (_aliases[normalizedAliasSymbol]) {
    return _aliases;
  }
  const aliases = Object.fromEntries(
    Object.entries(_aliases).sort(([a], [b]) => _compareAliases(a, b))
  );
  for (const key in aliases) {
    for (const alias in aliases) {
      if (alias === key || key.startsWith(alias)) {
        continue;
      }
      if (aliases[key]?.startsWith(alias) && pathSeparators.has(aliases[key][alias.length])) {
        aliases[key] = aliases[alias] + aliases[key].slice(alias.length);
      }
    }
  }
  Object.defineProperty(aliases, normalizedAliasSymbol, {
    value: true,
    enumerable: false
  });
  return aliases;
}
function resolveAlias(path, aliases) {
  const _path = normalizeWindowsPath(path);
  aliases = normalizeAliases(aliases);
  for (const [alias, to] of Object.entries(aliases)) {
    if (!_path.startsWith(alias)) {
      continue;
    }
    const _alias = hasTrailingSlash(alias) ? alias.slice(0, -1) : alias;
    if (hasTrailingSlash(_path[_alias.length])) {
      return join(to, _path.slice(alias.length));
    }
  }
  return _path;
}
function reverseResolveAlias(path, aliases) {
  const _path = normalizeWindowsPath(path);
  aliases = normalizeAliases(aliases);
  const matches = [];
  for (const [to, alias] of Object.entries(aliases)) {
    if (!_path.startsWith(alias)) {
      continue;
    }
    const _alias = hasTrailingSlash(alias) ? alias.slice(0, -1) : alias;
    if (hasTrailingSlash(_path[_alias.length])) {
      matches.push(join(to, _path.slice(alias.length)));
    }
  }
  return matches.sort((a, b) => b.length - a.length);
}
function filename(path) {
  const base = path.split(SLASH_RE).pop();
  if (!base) {
    return void 0;
  }
  const separatorIndex = base.lastIndexOf(".");
  if (separatorIndex <= 0) {
    return base;
  }
  return base.slice(0, separatorIndex);
}
function _compareAliases(a, b) {
  return b.split("/").length - a.split("/").length;
}
function hasTrailingSlash(path = "/") {
  const lastChar = path[path.length - 1];
  return lastChar === "/" || lastChar === "\\";
}

export { filename, normalizeAliases, resolveAlias, reverseResolveAlias };


import { existsSync, promises } from 'node:fs';
import { builtinModules } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, join, dirname } from 'pathe';

const isWindows = process.platform === "win32";
const drive = isWindows ? process.cwd()[0] : null;
const driveOpposite = drive ? drive === drive.toUpperCase() ? drive.toLowerCase() : drive.toUpperCase() : null;
const driveRegexp = drive ? new RegExp(`(?:^|/@fs/)${drive}(\:[\\/])`) : null;
const driveOppositeRegext = driveOpposite ? new RegExp(`(?:^|/@fs/)${driveOpposite}(\:[\\/])`) : null;
function slash(str) {
	return str.replace(/\\/g, "/");
}
const bareImportRE = /^(?![a-z]:)[\w@](?!.*:\/\/)/i;
function isBareImport(id) {
	return bareImportRE.test(id);
}
const VALID_ID_PREFIX = "/@id/";
function normalizeRequestId(id, base) {
	if (base && id.startsWith(withTrailingSlash(base))) id = `/${id.slice(base.length)}`;
	// keep drive the same as in process cwd. ideally, this should be resolved on Vite side
	// Vite always resolves drive letters to the upper case because of the use of `realpathSync`
	// https://github.com/vitejs/vite/blob/0ab20a3ee26eacf302415b3087732497d0a2f358/packages/vite/src/node/utils.ts#L635
	if (driveRegexp && !(driveRegexp === null || driveRegexp === void 0 ? void 0 : driveRegexp.test(id)) && (driveOppositeRegext === null || driveOppositeRegext === void 0 ? void 0 : driveOppositeRegext.test(id))) id = id.replace(driveOppositeRegext, `${drive}$1`);
	if (id.startsWith("file://")) {
		// preserve hash/query
		const { file, postfix } = splitFileAndPostfix(id);
		return fileURLToPath(file) + postfix;
	}
	return id.replace(/^\/@id\/__x00__/, "\0").replace(/^\/@id\//, "").replace(/^__vite-browser-external:/, "").replace(/\?v=\w+/, "?").replace(/&v=\w+/, "").replace(/\?t=\w+/, "?").replace(/&t=\w+/, "").replace(/\?import/, "?").replace(/&import/, "").replace(/\?&/, "?").replace(/\?+$/, "");
}
const postfixRE = /[?#].*$/;
function cleanUrl(url) {
	return url.replace(postfixRE, "");
}
function splitFileAndPostfix(path) {
	const file = cleanUrl(path);
	return {
		file,
		postfix: path.slice(file.length)
	};
}
const internalRequests = ["@vite/client", "@vite/env"];
const internalRequestRegexp = new RegExp(`^/?(?:${internalRequests.join("|")})$`);
function isInternalRequest(id) {
	return internalRequestRegexp.test(id);
}
// https://nodejs.org/api/modules.html#built-in-modules-with-mandatory-node-prefix
const prefixedBuiltins = new Set([
	"node:sea",
	"node:sqlite",
	"node:test",
	"node:test/reporters"
]);
const builtins = new Set([
	...builtinModules,
	"assert/strict",
	"diagnostics_channel",
	"dns/promises",
	"fs/promises",
	"path/posix",
	"path/win32",
	"readline/promises",
	"stream/consumers",
	"stream/promises",
	"stream/web",
	"timers/promises",
	"util/types",
	"wasi"
]);
function normalizeModuleId(id) {
	// unique id that is not available as "test"
	if (prefixedBuiltins.has(id)) return id;
	if (id.startsWith("file://")) return fileURLToPath(id);
	return id.replace(/\\/g, "/").replace(/^\/@fs\//, isWindows ? "" : "/").replace(/^node:/, "").replace(/^\/+/, "/");
}
function isPrimitive(v) {
	return v !== Object(v);
}
function toFilePath(id, root) {
	let { absolute, exists } = (() => {
		if (id.startsWith("/@fs/")) return {
			absolute: id.slice(4),
			exists: true
		};
		// check if /src/module.js -> <root>/src/module.js
		if (!id.startsWith(withTrailingSlash(root)) && id.startsWith("/")) {
			const resolved = resolve(root, id.slice(1));
			if (existsSync(cleanUrl(resolved))) return {
				absolute: resolved,
				exists: true
			};
		} else if (id.startsWith(withTrailingSlash(root)) && existsSync(cleanUrl(id))) return {
			absolute: id,
			exists: true
		};
		return {
			absolute: id,
			exists: false
		};
	})();
	if (absolute.startsWith("//")) absolute = absolute.slice(1);
	// disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
	return {
		path: isWindows && absolute.startsWith("/") ? slash(fileURLToPath(pathToFileURL(absolute.slice(1)).href)) : absolute,
		exists
	};
}
const NODE_BUILTIN_NAMESPACE = "node:";
function isNodeBuiltin(id) {
	if (prefixedBuiltins.has(id)) return true;
	return builtins.has(id.startsWith(NODE_BUILTIN_NAMESPACE) ? id.slice(NODE_BUILTIN_NAMESPACE.length) : id);
}
/**
* Convert `Arrayable<T>` to `Array<T>`
*
* @category Array
*/
function toArray(array) {
	if (array === null || array === void 0) array = [];
	if (Array.isArray(array)) return array;
	return [array];
}
function getCachedData(cache, basedir, originalBasedir) {
	const pkgData = cache.get(getFnpdCacheKey(basedir));
	if (pkgData) {
		traverseBetweenDirs(originalBasedir, basedir, (dir) => {
			cache.set(getFnpdCacheKey(dir), pkgData);
		});
		return pkgData;
	}
}
function setCacheData(cache, data, basedir, originalBasedir) {
	cache.set(getFnpdCacheKey(basedir), data);
	traverseBetweenDirs(originalBasedir, basedir, (dir) => {
		cache.set(getFnpdCacheKey(dir), data);
	});
}
function getFnpdCacheKey(basedir) {
	return `fnpd_${basedir}`;
}
/**
* Traverse between `longerDir` (inclusive) and `shorterDir` (exclusive) and call `cb` for each dir.
* @param longerDir Longer dir path, e.g. `/User/foo/bar/baz`
* @param shorterDir Shorter dir path, e.g. `/User/foo`
*/
function traverseBetweenDirs(longerDir, shorterDir, cb) {
	while (longerDir !== shorterDir) {
		cb(longerDir);
		longerDir = dirname(longerDir);
	}
}
function withTrailingSlash(path) {
	if (path[path.length - 1] !== "/") return `${path}/`;
	return path;
}
function createImportMetaEnvProxy() {
	// packages/vitest/src/node/plugins/index.ts:146
	const booleanKeys = [
		"DEV",
		"PROD",
		"SSR"
	];
	return new Proxy(process.env, {
		get(_, key) {
			if (typeof key !== "string") return void 0;
			if (booleanKeys.includes(key)) return !!process.env[key];
			return process.env[key];
		},
		set(_, key, value) {
			if (typeof key !== "string") return true;
			if (booleanKeys.includes(key)) process.env[key] = value ? "1" : "";
			else process.env[key] = value;
			return true;
		}
	});
}
const packageCache = /* @__PURE__ */ new Map();
async function findNearestPackageData(basedir) {
	const originalBasedir = basedir;
	while (basedir) {
		var _await$fsp$stat$catch;
		const cached = getCachedData(packageCache, basedir, originalBasedir);
		if (cached) return cached;
		const pkgPath = join(basedir, "package.json");
		if ((_await$fsp$stat$catch = await promises.stat(pkgPath).catch(() => {})) === null || _await$fsp$stat$catch === void 0 ? void 0 : _await$fsp$stat$catch.isFile()) {
			const pkgData = JSON.parse(await promises.readFile(pkgPath, "utf8"));
			if (packageCache) setCacheData(packageCache, pkgData, basedir, originalBasedir);
			return pkgData;
		}
		const nextBasedir = dirname(basedir);
		if (nextBasedir === basedir) break;
		basedir = nextBasedir;
	}
	return {};
}

export { VALID_ID_PREFIX, cleanUrl, createImportMetaEnvProxy, findNearestPackageData, getCachedData, isBareImport, isInternalRequest, isNodeBuiltin, isPrimitive, isWindows, normalizeModuleId, normalizeRequestId, setCacheData, slash, toArray, toFilePath, withTrailingSlash };


import { RFC1738 } from "./formats.mjs";
import { isArray } from "../utils/values.mjs";
export let has = (obj, key) => ((has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
    has(obj, key));
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
        if (isArray(obj)) {
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
export function merge(target, source, options = {}) {
    if (!source) {
        return target;
    }
    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        }
        else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has(Object.prototype, source)) {
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
    if (isArray(target) && !isArray(source)) {
        // @ts-ignore
        mergeTarget = array_to_object(target, options);
    }
    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has(target, i)) {
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
        if (has(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
}
export function assign_single_source(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
}
export function decode(str, _, charset) {
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
export const encode = (str, _defaultEncoder, charset, _kind, format) => {
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
                (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
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
export function compact(value) {
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
export function is_regexp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}
export function is_buffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
export function combine(a, b) {
    return [].concat(a, b);
}
export function maybe_map(val, fn) {
    if (isArray(val)) {
        const mapped = [];
        for (let i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
}
//# sourceMappingURL=utils.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export * from "./utils/values.mjs";
export * from "./utils/base64.mjs";
export * from "./utils/env.mjs";
export * from "./utils/log.mjs";
export * from "./utils/uuid.mjs";
export * from "./utils/sleep.mjs";
//# sourceMappingURL=utils.mjs.map

import { g as normalizeWindowsPath, j as join } from './shared/pathe.M-eThtNZ.mjs';

const pathSeparators = /* @__PURE__ */ new Set(["/", "\\", void 0]);
const normalizedAliasSymbol = Symbol.for("pathe:normalizedAlias");
const SLASH_RE = /[/\\]/;
function normalizeAliases(_aliases) {
  if (_aliases[normalizedAliasSymbol]) {
    return _aliases;
  }
  const aliases = Object.fromEntries(
    Object.entries(_aliases).sort(([a], [b]) => _compareAliases(a, b))
  );
  for (const key in aliases) {
    for (const alias in aliases) {
      if (alias === key || key.startsWith(alias)) {
        continue;
      }
      if (aliases[key]?.startsWith(alias) && pathSeparators.has(aliases[key][alias.length])) {
        aliases[key] = aliases[alias] + aliases[key].slice(alias.length);
      }
    }
  }
  Object.defineProperty(aliases, normalizedAliasSymbol, {
    value: true,
    enumerable: false
  });
  return aliases;
}
function resolveAlias(path, aliases) {
  const _path = normalizeWindowsPath(path);
  aliases = normalizeAliases(aliases);
  for (const [alias, to] of Object.entries(aliases)) {
    if (!_path.startsWith(alias)) {
      continue;
    }
    const _alias = hasTrailingSlash(alias) ? alias.slice(0, -1) : alias;
    if (hasTrailingSlash(_path[_alias.length])) {
      return join(to, _path.slice(alias.length));
    }
  }
  return _path;
}
function reverseResolveAlias(path, aliases) {
  const _path = normalizeWindowsPath(path);
  aliases = normalizeAliases(aliases);
  const matches = [];
  for (const [to, alias] of Object.entries(aliases)) {
    if (!_path.startsWith(alias)) {
      continue;
    }
    const _alias = hasTrailingSlash(alias) ? alias.slice(0, -1) : alias;
    if (hasTrailingSlash(_path[_alias.length])) {
      matches.push(join(to, _path.slice(alias.length)));
    }
  }
  return matches.sort((a, b) => b.length - a.length);
}
function filename(path) {
  const base = path.split(SLASH_RE).pop();
  if (!base) {
    return void 0;
  }
  const separatorIndex = base.lastIndexOf(".");
  if (separatorIndex <= 0) {
    return base;
  }
  return base.slice(0, separatorIndex);
}
function _compareAliases(a, b) {
  return b.split("/").length - a.split("/").length;
}
function hasTrailingSlash(path = "/") {
  const lastChar = path[path.length - 1];
  return lastChar === "/" || lastChar === "\\";
}

export { filename, normalizeAliases, resolveAlias, reverseResolveAlias };


import { existsSync, promises } from 'node:fs';
import { builtinModules } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, join, dirname } from 'pathe';

const isWindows = process.platform === "win32";
const drive = isWindows ? process.cwd()[0] : null;
const driveOpposite = drive ? drive === drive.toUpperCase() ? drive.toLowerCase() : drive.toUpperCase() : null;
const driveRegexp = drive ? new RegExp(`(?:^|/@fs/)${drive}(\:[\\/])`) : null;
const driveOppositeRegext = driveOpposite ? new RegExp(`(?:^|/@fs/)${driveOpposite}(\:[\\/])`) : null;
function slash(str) {
	return str.replace(/\\/g, "/");
}
const bareImportRE = /^(?![a-z]:)[\w@](?!.*:\/\/)/i;
function isBareImport(id) {
	return bareImportRE.test(id);
}
const VALID_ID_PREFIX = "/@id/";
function normalizeRequestId(id, base) {
	if (base && id.startsWith(withTrailingSlash(base))) id = `/${id.slice(base.length)}`;
	// keep drive the same as in process cwd. ideally, this should be resolved on Vite side
	// Vite always resolves drive letters to the upper case because of the use of `realpathSync`
	// https://github.com/vitejs/vite/blob/0ab20a3ee26eacf302415b3087732497d0a2f358/packages/vite/src/node/utils.ts#L635
	if (driveRegexp && !(driveRegexp === null || driveRegexp === void 0 ? void 0 : driveRegexp.test(id)) && (driveOppositeRegext === null || driveOppositeRegext === void 0 ? void 0 : driveOppositeRegext.test(id))) id = id.replace(driveOppositeRegext, `${drive}$1`);
	if (id.startsWith("file://")) {
		// preserve hash/query
		const { file, postfix } = splitFileAndPostfix(id);
		return fileURLToPath(file) + postfix;
	}
	return id.replace(/^\/@id\/__x00__/, "\0").replace(/^\/@id\//, "").replace(/^__vite-browser-external:/, "").replace(/\?v=\w+/, "?").replace(/&v=\w+/, "").replace(/\?t=\w+/, "?").replace(/&t=\w+/, "").replace(/\?import/, "?").replace(/&import/, "").replace(/\?&/, "?").replace(/\?+$/, "");
}
const postfixRE = /[?#].*$/;
function cleanUrl(url) {
	return url.replace(postfixRE, "");
}
function splitFileAndPostfix(path) {
	const file = cleanUrl(path);
	return {
		file,
		postfix: path.slice(file.length)
	};
}
const internalRequests = ["@vite/client", "@vite/env"];
const internalRequestRegexp = new RegExp(`^/?(?:${internalRequests.join("|")})$`);
function isInternalRequest(id) {
	return internalRequestRegexp.test(id);
}
// https://nodejs.org/api/modules.html#built-in-modules-with-mandatory-node-prefix
const prefixedBuiltins = new Set([
	"node:sea",
	"node:sqlite",
	"node:test",
	"node:test/reporters"
]);
const builtins = new Set([
	...builtinModules,
	"assert/strict",
	"diagnostics_channel",
	"dns/promises",
	"fs/promises",
	"path/posix",
	"path/win32",
	"readline/promises",
	"stream/consumers",
	"stream/promises",
	"stream/web",
	"timers/promises",
	"util/types",
	"wasi"
]);
function normalizeModuleId(id) {
	// unique id that is not available as "test"
	if (prefixedBuiltins.has(id)) return id;
	if (id.startsWith("file://")) return fileURLToPath(id);
	return id.replace(/\\/g, "/").replace(/^\/@fs\//, isWindows ? "" : "/").replace(/^node:/, "").replace(/^\/+/, "/");
}
function isPrimitive(v) {
	return v !== Object(v);
}
function toFilePath(id, root) {
	let { absolute, exists } = (() => {
		if (id.startsWith("/@fs/")) return {
			absolute: id.slice(4),
			exists: true
		};
		// check if /src/module.js -> <root>/src/module.js
		if (!id.startsWith(withTrailingSlash(root)) && id.startsWith("/")) {
			const resolved = resolve(root, id.slice(1));
			if (existsSync(cleanUrl(resolved))) return {
				absolute: resolved,
				exists: true
			};
		} else if (id.startsWith(withTrailingSlash(root)) && existsSync(cleanUrl(id))) return {
			absolute: id,
			exists: true
		};
		return {
			absolute: id,
			exists: false
		};
	})();
	if (absolute.startsWith("//")) absolute = absolute.slice(1);
	// disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
	return {
		path: isWindows && absolute.startsWith("/") ? slash(fileURLToPath(pathToFileURL(absolute.slice(1)).href)) : absolute,
		exists
	};
}
const NODE_BUILTIN_NAMESPACE = "node:";
function isNodeBuiltin(id) {
	if (prefixedBuiltins.has(id)) return true;
	return builtins.has(id.startsWith(NODE_BUILTIN_NAMESPACE) ? id.slice(NODE_BUILTIN_NAMESPACE.length) : id);
}
/**
* Convert `Arrayable<T>` to `Array<T>`
*
* @category Array
*/
function toArray(array) {
	if (array === null || array === void 0) array = [];
	if (Array.isArray(array)) return array;
	return [array];
}
function getCachedData(cache, basedir, originalBasedir) {
	const pkgData = cache.get(getFnpdCacheKey(basedir));
	if (pkgData) {
		traverseBetweenDirs(originalBasedir, basedir, (dir) => {
			cache.set(getFnpdCacheKey(dir), pkgData);
		});
		return pkgData;
	}
}
function setCacheData(cache, data, basedir, originalBasedir) {
	cache.set(getFnpdCacheKey(basedir), data);
	traverseBetweenDirs(originalBasedir, basedir, (dir) => {
		cache.set(getFnpdCacheKey(dir), data);
	});
}
function getFnpdCacheKey(basedir) {
	return `fnpd_${basedir}`;
}
/**
* Traverse between `longerDir` (inclusive) and `shorterDir` (exclusive) and call `cb` for each dir.
* @param longerDir Longer dir path, e.g. `/User/foo/bar/baz`
* @param shorterDir Shorter dir path, e.g. `/User/foo`
*/
function traverseBetweenDirs(longerDir, shorterDir, cb) {
	while (longerDir !== shorterDir) {
		cb(longerDir);
		longerDir = dirname(longerDir);
	}
}
function withTrailingSlash(path) {
	if (path[path.length - 1] !== "/") return `${path}/`;
	return path;
}
function createImportMetaEnvProxy() {
	// packages/vitest/src/node/plugins/index.ts:146
	const booleanKeys = [
		"DEV",
		"PROD",
		"SSR"
	];
	return new Proxy(process.env, {
		get(_, key) {
			if (typeof key !== "string") return void 0;
			if (booleanKeys.includes(key)) return !!process.env[key];
			return process.env[key];
		},
		set(_, key, value) {
			if (typeof key !== "string") return true;
			if (booleanKeys.includes(key)) process.env[key] = value ? "1" : "";
			else process.env[key] = value;
			return true;
		}
	});
}
const packageCache = /* @__PURE__ */ new Map();
async function findNearestPackageData(basedir) {
	const originalBasedir = basedir;
	while (basedir) {
		var _await$fsp$stat$catch;
		const cached = getCachedData(packageCache, basedir, originalBasedir);
		if (cached) return cached;
		const pkgPath = join(basedir, "package.json");
		if ((_await$fsp$stat$catch = await promises.stat(pkgPath).catch(() => {})) === null || _await$fsp$stat$catch === void 0 ? void 0 : _await$fsp$stat$catch.isFile()) {
			const pkgData = JSON.parse(await promises.readFile(pkgPath, "utf8"));
			if (packageCache) setCacheData(packageCache, pkgData, basedir, originalBasedir);
			return pkgData;
		}
		const nextBasedir = dirname(basedir);
		if (nextBasedir === basedir) break;
		basedir = nextBasedir;
	}
	return {};
}

export { VALID_ID_PREFIX, cleanUrl, createImportMetaEnvProxy, findNearestPackageData, getCachedData, isBareImport, isInternalRequest, isNodeBuiltin, isPrimitive, isWindows, normalizeModuleId, normalizeRequestId, setCacheData, slash, toArray, toFilePath, withTrailingSlash };
