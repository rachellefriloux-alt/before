
//#region src/utils.ts
const postfixRE = /[?#].*$/;
function cleanUrl(url) {
	return url.replace(postfixRE, "");
}
function extractQueryWithoutFragment(url) {
	const questionMarkIndex = url.indexOf("?");
	if (questionMarkIndex === -1) return "";
	const fragmentIndex = url.indexOf("#", questionMarkIndex);
	if (fragmentIndex === -1) return url.substring(questionMarkIndex);
	else return url.substring(questionMarkIndex, fragmentIndex);
}

//#endregion
//#region src/composable-filters.ts
var And = class {
	kind;
	args;
	constructor(...args) {
		if (args.length === 0) throw new Error("`And` expects at least one operand");
		this.args = args;
		this.kind = "and";
	}
};
var Or = class {
	kind;
	args;
	constructor(...args) {
		if (args.length === 0) throw new Error("`Or` expects at least one operand");
		this.args = args;
		this.kind = "or";
	}
};
var Not = class {
	kind;
	expr;
	constructor(expr) {
		this.expr = expr;
		this.kind = "not";
	}
};
var Id = class {
	kind;
	pattern;
	params;
	constructor(pattern, params) {
		this.pattern = pattern;
		this.kind = "id";
		this.params = params ?? { cleanUrl: false };
	}
};
var ModuleType = class {
	kind;
	pattern;
	constructor(pattern) {
		this.pattern = pattern;
		this.kind = "moduleType";
	}
};
var Code = class {
	kind;
	pattern;
	constructor(expr) {
		this.pattern = expr;
		this.kind = "code";
	}
};
var Query = class {
	kind;
	key;
	pattern;
	constructor(key, pattern) {
		this.pattern = pattern;
		this.key = key;
		this.kind = "query";
	}
};
var Include = class {
	kind;
	expr;
	constructor(expr) {
		this.expr = expr;
		this.kind = "include";
	}
};
var Exclude = class {
	kind;
	expr;
	constructor(expr) {
		this.expr = expr;
		this.kind = "exclude";
	}
};
function and(...args) {
	return new And(...args);
}
function or(...args) {
	return new Or(...args);
}
function not(expr) {
	return new Not(expr);
}
function id(pattern, params) {
	return new Id(pattern, params);
}
function moduleType(pattern) {
	return new ModuleType(pattern);
}
function code(pattern) {
	return new Code(pattern);
}
function query(key, pattern) {
	return new Query(key, pattern);
}
function include(expr) {
	return new Include(expr);
}
function exclude(expr) {
	return new Exclude(expr);
}
/**
* convert a queryObject to FilterExpression like
* ```js
*   and(query(k1, v1), query(k2, v2))
* ```
* @param queryFilterObject The query filter object needs to be matched.
* @returns a `And` FilterExpression
*/
function queries(queryFilter) {
	let arr = Object.entries(queryFilter).map(([key, value]) => {
		return new Query(key, value);
	});
	return and(...arr);
}
function interpreter(exprs, code$1, id$1, moduleType$1) {
	let arr = [];
	if (Array.isArray(exprs)) arr = exprs;
	else arr = [exprs];
	return interpreterImpl(arr, code$1, id$1, moduleType$1);
}
function interpreterImpl(expr, code$1, id$1, moduleType$1, ctx = {}) {
	let hasInclude = false;
	for (const e of expr) switch (e.kind) {
		case "include": {
			hasInclude = true;
			if (exprInterpreter(e.expr, code$1, id$1, moduleType$1, ctx)) return true;
			break;
		}
		case "exclude": {
			if (exprInterpreter(e.expr, code$1, id$1, moduleType$1)) return false;
			break;
		}
	}
	return !hasInclude;
}
function exprInterpreter(expr, code$1, id$1, moduleType$1, ctx = {}) {
	switch (expr.kind) {
		case "and": return expr.args.every((e) => exprInterpreter(e, code$1, id$1, moduleType$1, ctx));
		case "or": return expr.args.some((e) => exprInterpreter(e, code$1, id$1, moduleType$1, ctx));
		case "not": return !exprInterpreter(expr.expr, code$1, id$1, moduleType$1, ctx);
		case "id": {
			if (id$1 === void 0) throw new Error("`id` is required for `id` expression");
			if (expr.params.cleanUrl) id$1 = cleanUrl(id$1);
			return typeof expr.pattern === "string" ? id$1 === expr.pattern : expr.pattern.test(id$1);
		}
		case "moduleType": {
			if (moduleType$1 === void 0) throw new Error("`moduleType` is required for `moduleType` expression");
			return moduleType$1 === expr.pattern;
		}
		case "code": {
			if (code$1 === void 0) throw new Error("`code` is required for `code` expression");
			return typeof expr.pattern === "string" ? code$1.includes(expr.pattern) : expr.pattern.test(code$1);
		}
		case "query": {
			if (id$1 === void 0) throw new Error("`id` is required for `Query` expression");
			if (!ctx.urlSearchParamsCache) {
				let queryString = extractQueryWithoutFragment(id$1);
				ctx.urlSearchParamsCache = new URLSearchParams(queryString);
			}
			let urlParams = ctx.urlSearchParamsCache;
			if (typeof expr.pattern === "boolean") if (expr.pattern) return urlParams.has(expr.key);
			else return !urlParams.has(expr.key);
			else if (typeof expr.pattern === "string") return urlParams.get(expr.key) === expr.pattern;
			else return expr.pattern.test(urlParams.get(expr.key) ?? "");
		}
		default: throw new Error(`Expression ${JSON.stringify(expr)} is not expected.`);
	}
}

//#endregion
//#region src/simple-filters.ts
/**
* Constructs a RegExp that matches the exact string specified.
*
* This is useful for plugin hook filters.
*
* @param str the string to match.
* @param flags flags for the RegExp.
*
* @example
* ```ts
* import { exactRegex } from '@rolldown/pluginutils';
* const plugin = {
*   name: 'plugin',
*   resolveId: {
*     filter: { id: exactRegex('foo') },
*     handler(id) {} // will only be called for `foo`
*   }
* }
* ```
*/
function exactRegex(str, flags) {
	return new RegExp(`^${escapeRegex(str)}$`, flags);
}
/**
* Constructs a RegExp that matches a value that has the specified prefix.
*
* This is useful for plugin hook filters.
*
* @param str the string to match.
* @param flags flags for the RegExp.
*
* @example
* ```ts
* import { prefixRegex } from '@rolldown/pluginutils';
* const plugin = {
*   name: 'plugin',
*   resolveId: {
*     filter: { id: prefixRegex('foo') },
*     handler(id) {} // will only be called for IDs starting with `foo`
*   }
* }
* ```
*/
function prefixRegex(str, flags) {
	return new RegExp(`^${escapeRegex(str)}`, flags);
}
const escapeRegexRE = /[-/\\^$*+?.()|[\]{}]/g;
function escapeRegex(str) {
	return str.replace(escapeRegexRE, "\\$&");
}
function makeIdFiltersToMatchWithQuery(input) {
	if (!Array.isArray(input)) return makeIdFilterToMatchWithQuery(input);
	return input.map((i) => makeIdFilterToMatchWithQuery(i));
}
function makeIdFilterToMatchWithQuery(input) {
	if (typeof input === "string") return `${input}{?*,}`;
	return makeRegexIdFilterToMatchWithQuery(input);
}
function makeRegexIdFilterToMatchWithQuery(input) {
	return new RegExp(input.source.replace(/(?<!\\)\$/g, "(?:\\?.*)?$"), input.flags);
}

//#endregion
exports.and = and;
exports.code = code;
exports.exactRegex = exactRegex;
exports.exclude = exclude;
exports.exprInterpreter = exprInterpreter;
exports.id = id;
exports.include = include;
exports.interpreter = interpreter;
exports.interpreterImpl = interpreterImpl;
exports.makeIdFiltersToMatchWithQuery = makeIdFiltersToMatchWithQuery;
exports.moduleType = moduleType;
exports.not = not;
exports.or = or;
exports.prefixRegex = prefixRegex;
exports.queries = queries;
exports.query = query;

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const path = __toESM(require("path"));
const fs = __toESM(require("fs"));

//#region src/utils.ts
function cleanPath(path$1) {
	let normalized = (0, path.normalize)(path$1);
	if (normalized.length > 1 && normalized[normalized.length - 1] === path.sep) normalized = normalized.substring(0, normalized.length - 1);
	return normalized;
}
const SLASHES_REGEX = /[\\/]/g;
function convertSlashes(path$1, separator) {
	return path$1.replace(SLASHES_REGEX, separator);
}
const WINDOWS_ROOT_DIR_REGEX = /^[a-z]:[\\/]$/i;
function isRootDirectory(path$1) {
	return path$1 === "/" || WINDOWS_ROOT_DIR_REGEX.test(path$1);
}
function normalizePath(path$1, options) {
	const { resolvePaths, normalizePath: normalizePath$1, pathSeparator } = options;
	const pathNeedsCleaning = process.platform === "win32" && path$1.includes("/") || path$1.startsWith(".");
	if (resolvePaths) path$1 = (0, path.resolve)(path$1);
	if (normalizePath$1 || pathNeedsCleaning) path$1 = cleanPath(path$1);
	if (path$1 === ".") return "";
	const needsSeperator = path$1[path$1.length - 1] !== pathSeparator;
	return convertSlashes(needsSeperator ? path$1 + pathSeparator : path$1, pathSeparator);
}

//#endregion
//#region src/api/functions/join-path.ts
function joinPathWithBasePath(filename, directoryPath) {
	return directoryPath + filename;
}
function joinPathWithRelativePath(root, options) {
	return function(filename, directoryPath) {
		const sameRoot = directoryPath.startsWith(root);
		if (sameRoot) return directoryPath.slice(root.length) + filename;
		else return convertSlashes((0, path.relative)(root, directoryPath), options.pathSeparator) + options.pathSeparator + filename;
	};
}
function joinPath(filename) {
	return filename;
}
function joinDirectoryPath(filename, directoryPath, separator) {
	return directoryPath + filename + separator;
}
function build$7(root, options) {
	const { relativePaths, includeBasePath } = options;
	return relativePaths && root ? joinPathWithRelativePath(root, options) : includeBasePath ? joinPathWithBasePath : joinPath;
}

//#endregion
//#region src/api/functions/push-directory.ts
function pushDirectoryWithRelativePath(root) {
	return function(directoryPath, paths) {
		paths.push(directoryPath.substring(root.length) || ".");
	};
}
function pushDirectoryFilterWithRelativePath(root) {
	return function(directoryPath, paths, filters) {
		const relativePath = directoryPath.substring(root.length) || ".";
		if (filters.every((filter) => filter(relativePath, true))) paths.push(relativePath);
	};
}
const pushDirectory = (directoryPath, paths) => {
	paths.push(directoryPath || ".");
};
const pushDirectoryFilter = (directoryPath, paths, filters) => {
	const path$1 = directoryPath || ".";
	if (filters.every((filter) => filter(path$1, true))) paths.push(path$1);
};
const empty$2 = () => {};
function build$6(root, options) {
	const { includeDirs, filters, relativePaths } = options;
	if (!includeDirs) return empty$2;
	if (relativePaths) return filters && filters.length ? pushDirectoryFilterWithRelativePath(root) : pushDirectoryWithRelativePath(root);
	return filters && filters.length ? pushDirectoryFilter : pushDirectory;
}

//#endregion
//#region src/api/functions/push-file.ts
const pushFileFilterAndCount = (filename, _paths, counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) counts.files++;
};
const pushFileFilter = (filename, paths, _counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) paths.push(filename);
};
const pushFileCount = (_filename, _paths, counts, _filters) => {
	counts.files++;
};
const pushFile = (filename, paths) => {
	paths.push(filename);
};
const empty$1 = () => {};
function build$5(options) {
	const { excludeFiles, filters, onlyCounts } = options;
	if (excludeFiles) return empty$1;
	if (filters && filters.length) return onlyCounts ? pushFileFilterAndCount : pushFileFilter;
	else if (onlyCounts) return pushFileCount;
	else return pushFile;
}

//#endregion
//#region src/api/functions/get-array.ts
const getArray = (paths) => {
	return paths;
};
const getArrayGroup = () => {
	return [""].slice(0, 0);
};
function build$4(options) {
	return options.group ? getArrayGroup : getArray;
}

//#endregion
//#region src/api/functions/group-files.ts
const groupFiles = (groups, directory, files) => {
	groups.push({
		directory,
		files,
		dir: directory
	});
};
const empty = () => {};
function build$3(options) {
	return options.group ? groupFiles : empty;
}

//#endregion
//#region src/api/functions/resolve-symlink.ts
const resolveSymlinksAsync = function(path$1, state, callback$1) {
	const { queue, fs: fs$1, options: { suppressErrors } } = state;
	queue.enqueue();
	fs$1.realpath(path$1, (error, resolvedPath) => {
		if (error) return queue.dequeue(suppressErrors ? null : error, state);
		fs$1.stat(resolvedPath, (error$1, stat) => {
			if (error$1) return queue.dequeue(suppressErrors ? null : error$1, state);
			if (stat.isDirectory() && isRecursive(path$1, resolvedPath, state)) return queue.dequeue(null, state);
			callback$1(stat, resolvedPath);
			queue.dequeue(null, state);
		});
	});
};
const resolveSymlinks = function(path$1, state, callback$1) {
	const { queue, fs: fs$1, options: { suppressErrors } } = state;
	queue.enqueue();
	try {
		const resolvedPath = fs$1.realpathSync(path$1);
		const stat = fs$1.statSync(resolvedPath);
		if (stat.isDirectory() && isRecursive(path$1, resolvedPath, state)) return;
		callback$1(stat, resolvedPath);
	} catch (e) {
		if (!suppressErrors) throw e;
	}
};
function build$2(options, isSynchronous) {
	if (!options.resolveSymlinks || options.excludeSymlinks) return null;
	return isSynchronous ? resolveSymlinks : resolveSymlinksAsync;
}
function isRecursive(path$1, resolved, state) {
	if (state.options.useRealPaths) return isRecursiveUsingRealPaths(resolved, state);
	let parent = (0, path.dirname)(path$1);
	let depth = 1;
	while (parent !== state.root && depth < 2) {
		const resolvedPath = state.symlinks.get(parent);
		const isSameRoot = !!resolvedPath && (resolvedPath === resolved || resolvedPath.startsWith(resolved) || resolved.startsWith(resolvedPath));
		if (isSameRoot) depth++;
		else parent = (0, path.dirname)(parent);
	}
	state.symlinks.set(path$1, resolved);
	return depth > 1;
}
function isRecursiveUsingRealPaths(resolved, state) {
	return state.visited.includes(resolved + state.options.pathSeparator);
}

//#endregion
//#region src/api/functions/invoke-callback.ts
const onlyCountsSync = (state) => {
	return state.counts;
};
const groupsSync = (state) => {
	return state.groups;
};
const defaultSync = (state) => {
	return state.paths;
};
const limitFilesSync = (state) => {
	return state.paths.slice(0, state.options.maxFiles);
};
const onlyCountsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.counts, state.options.suppressErrors);
	return null;
};
const defaultAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths, state.options.suppressErrors);
	return null;
};
const limitFilesAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths.slice(0, state.options.maxFiles), state.options.suppressErrors);
	return null;
};
const groupsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.groups, state.options.suppressErrors);
	return null;
};
function report(error, callback$1, output, suppressErrors) {
	if (error && !suppressErrors) callback$1(error, output);
	else callback$1(null, output);
}
function build$1(options, isSynchronous) {
	const { onlyCounts, group, maxFiles } = options;
	if (onlyCounts) return isSynchronous ? onlyCountsSync : onlyCountsAsync;
	else if (group) return isSynchronous ? groupsSync : groupsAsync;
	else if (maxFiles) return isSynchronous ? limitFilesSync : limitFilesAsync;
	else return isSynchronous ? defaultSync : defaultAsync;
}

//#endregion
//#region src/api/functions/walk-directory.ts
const readdirOpts = { withFileTypes: true };
const walkAsync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	state.queue.enqueue();
	if (currentDepth < 0) return state.queue.dequeue(null, state);
	const { fs: fs$1 } = state;
	state.visited.push(crawlPath);
	state.counts.directories++;
	fs$1.readdir(crawlPath || ".", readdirOpts, (error, entries = []) => {
		callback$1(entries, directoryPath, currentDepth);
		state.queue.dequeue(state.options.suppressErrors ? null : error, state);
	});
};
const walkSync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	const { fs: fs$1 } = state;
	if (currentDepth < 0) return;
	state.visited.push(crawlPath);
	state.counts.directories++;
	let entries = [];
	try {
		entries = fs$1.readdirSync(crawlPath || ".", readdirOpts);
	} catch (e) {
		if (!state.options.suppressErrors) throw e;
	}
	callback$1(entries, directoryPath, currentDepth);
};
function build(isSynchronous) {
	return isSynchronous ? walkSync : walkAsync;
}

//#endregion
//#region src/api/queue.ts
/**
* This is a custom stateless queue to track concurrent async fs calls.
* It increments a counter whenever a call is queued and decrements it
* as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
*/
var Queue = class {
	count = 0;
	constructor(onQueueEmpty) {
		this.onQueueEmpty = onQueueEmpty;
	}
	enqueue() {
		this.count++;
		return this.count;
	}
	dequeue(error, output) {
		if (this.onQueueEmpty && (--this.count <= 0 || error)) {
			this.onQueueEmpty(error, output);
			if (error) {
				output.controller.abort();
				this.onQueueEmpty = void 0;
			}
		}
	}
};

//#endregion
//#region src/api/counter.ts
var Counter = class {
	_files = 0;
	_directories = 0;
	set files(num) {
		this._files = num;
	}
	get files() {
		return this._files;
	}
	set directories(num) {
		this._directories = num;
	}
	get directories() {
		return this._directories;
	}
	/**
	* @deprecated use `directories` instead
	*/
	/* c8 ignore next 3 */
	get dirs() {
		return this._directories;
	}
};

//#endregion
//#region src/api/aborter.ts
/**
* AbortController is not supported on Node 14 so we use this until we can drop
* support for Node 14.
*/
var Aborter = class {
	aborted = false;
	abort() {
		this.aborted = true;
	}
};

//#endregion
//#region src/api/walker.ts
var Walker = class {
	root;
	isSynchronous;
	state;
	joinPath;
	pushDirectory;
	pushFile;
	getArray;
	groupFiles;
	resolveSymlink;
	walkDirectory;
	callbackInvoker;
	constructor(root, options, callback$1) {
		this.isSynchronous = !callback$1;
		this.callbackInvoker = build$1(options, this.isSynchronous);
		this.root = normalizePath(root, options);
		this.state = {
			root: isRootDirectory(this.root) ? this.root : this.root.slice(0, -1),
			paths: [""].slice(0, 0),
			groups: [],
			counts: new Counter(),
			options,
			queue: new Queue((error, state) => this.callbackInvoker(state, error, callback$1)),
			symlinks: /* @__PURE__ */ new Map(),
			visited: [""].slice(0, 0),
			controller: new Aborter(),
			fs: options.fs || fs
		};
		this.joinPath = build$7(this.root, options);
		this.pushDirectory = build$6(this.root, options);
		this.pushFile = build$5(options);
		this.getArray = build$4(options);
		this.groupFiles = build$3(options);
		this.resolveSymlink = build$2(options, this.isSynchronous);
		this.walkDirectory = build(this.isSynchronous);
	}
	start() {
		this.pushDirectory(this.root, this.state.paths, this.state.options.filters);
		this.walkDirectory(this.state, this.root, this.root, this.state.options.maxDepth, this.walk);
		return this.isSynchronous ? this.callbackInvoker(this.state, null) : null;
	}
	walk = (entries, directoryPath, depth) => {
		const { paths, options: { filters, resolveSymlinks: resolveSymlinks$1, excludeSymlinks, exclude, maxFiles, signal, useRealPaths, pathSeparator }, controller } = this.state;
		if (controller.aborted || signal && signal.aborted || maxFiles && paths.length > maxFiles) return;
		const files = this.getArray(this.state.paths);
		for (let i = 0; i < entries.length; ++i) {
			const entry = entries[i];
			if (entry.isFile() || entry.isSymbolicLink() && !resolveSymlinks$1 && !excludeSymlinks) {
				const filename = this.joinPath(entry.name, directoryPath);
				this.pushFile(filename, files, this.state.counts, filters);
			} else if (entry.isDirectory()) {
				let path$1 = joinDirectoryPath(entry.name, directoryPath, this.state.options.pathSeparator);
				if (exclude && exclude(entry.name, path$1)) continue;
				this.pushDirectory(path$1, paths, filters);
				this.walkDirectory(this.state, path$1, path$1, depth - 1, this.walk);
			} else if (this.resolveSymlink && entry.isSymbolicLink()) {
				let path$1 = joinPathWithBasePath(entry.name, directoryPath);
				this.resolveSymlink(path$1, this.state, (stat, resolvedPath) => {
					if (stat.isDirectory()) {
						resolvedPath = normalizePath(resolvedPath, this.state.options);
						if (exclude && exclude(entry.name, useRealPaths ? resolvedPath : path$1 + pathSeparator)) return;
						this.walkDirectory(this.state, resolvedPath, useRealPaths ? resolvedPath : path$1 + pathSeparator, depth - 1, this.walk);
					} else {
						resolvedPath = useRealPaths ? resolvedPath : path$1;
						const filename = (0, path.basename)(resolvedPath);
						const directoryPath$1 = normalizePath((0, path.dirname)(resolvedPath), this.state.options);
						resolvedPath = this.joinPath(filename, directoryPath$1);
						this.pushFile(resolvedPath, files, this.state.counts, filters);
					}
				});
			}
		}
		this.groupFiles(this.state.groups, directoryPath, files);
	};
};

//#endregion
//#region src/api/async.ts
function promise(root, options) {
	return new Promise((resolve$1, reject) => {
		callback(root, options, (err, output) => {
			if (err) return reject(err);
			resolve$1(output);
		});
	});
}
function callback(root, options, callback$1) {
	let walker = new Walker(root, options, callback$1);
	walker.start();
}

//#endregion
//#region src/api/sync.ts
function sync(root, options) {
	const walker = new Walker(root, options);
	return walker.start();
}

//#endregion
//#region src/builder/api-builder.ts
var APIBuilder = class {
	constructor(root, options) {
		this.root = root;
		this.options = options;
	}
	withPromise() {
		return promise(this.root, this.options);
	}
	withCallback(cb) {
		callback(this.root, this.options, cb);
	}
	sync() {
		return sync(this.root, this.options);
	}
};

//#endregion
//#region src/builder/index.ts
let pm = null;
/* c8 ignore next 6 */
try {
	require.resolve("picomatch");
	pm = require("picomatch");
} catch {}
var Builder = class {
	globCache = {};
	options = {
		maxDepth: Infinity,
		suppressErrors: true,
		pathSeparator: path.sep,
		filters: []
	};
	globFunction;
	constructor(options) {
		this.options = {
			...this.options,
			...options
		};
		this.globFunction = this.options.globFunction;
	}
	group() {
		this.options.group = true;
		return this;
	}
	withPathSeparator(separator) {
		this.options.pathSeparator = separator;
		return this;
	}
	withBasePath() {
		this.options.includeBasePath = true;
		return this;
	}
	withRelativePaths() {
		this.options.relativePaths = true;
		return this;
	}
	withDirs() {
		this.options.includeDirs = true;
		return this;
	}
	withMaxDepth(depth) {
		this.options.maxDepth = depth;
		return this;
	}
	withMaxFiles(limit) {
		this.options.maxFiles = limit;
		return this;
	}
	withFullPaths() {
		this.options.resolvePaths = true;
		this.options.includeBasePath = true;
		return this;
	}
	withErrors() {
		this.options.suppressErrors = false;
		return this;
	}
	withSymlinks({ resolvePaths = true } = {}) {
		this.options.resolveSymlinks = true;
		this.options.useRealPaths = resolvePaths;
		return this.withFullPaths();
	}
	withAbortSignal(signal) {
		this.options.signal = signal;
		return this;
	}
	normalize() {
		this.options.normalizePath = true;
		return this;
	}
	filter(predicate) {
		this.options.filters.push(predicate);
		return this;
	}
	onlyDirs() {
		this.options.excludeFiles = true;
		this.options.includeDirs = true;
		return this;
	}
	exclude(predicate) {
		this.options.exclude = predicate;
		return this;
	}
	onlyCounts() {
		this.options.onlyCounts = true;
		return this;
	}
	crawl(root) {
		return new APIBuilder(root || ".", this.options);
	}
	withGlobFunction(fn) {
		this.globFunction = fn;
		return this;
	}
	/**
	* @deprecated Pass options using the constructor instead:
	* ```ts
	* new fdir(options).crawl("/path/to/root");
	* ```
	* This method will be removed in v7.0
	*/
	/* c8 ignore next 4 */
	crawlWithOptions(root, options) {
		this.options = {
			...this.options,
			...options
		};
		return new APIBuilder(root || ".", this.options);
	}
	glob(...patterns) {
		if (this.globFunction) return this.globWithOptions(patterns);
		return this.globWithOptions(patterns, ...[{ dot: true }]);
	}
	globWithOptions(patterns, ...options) {
		const globFn = this.globFunction || pm;
		/* c8 ignore next 5 */
		if (!globFn) throw new Error("Please specify a glob function to use glob matching.");
		var isMatch = this.globCache[patterns.join("\0")];
		if (!isMatch) {
			isMatch = globFn(patterns, ...options);
			this.globCache[patterns.join("\0")] = isMatch;
		}
		this.options.filters.push((path$1) => isMatch(path$1));
		return this;
	}
};

//#endregion
exports.fdir = Builder;

let crypto = require('crypto')

let { urlAlphabet } = require('../url-alphabet/index.cjs')

// `crypto.randomFill()` is a little faster than `crypto.randomBytes()`,
// because it is possible to use in combination with `Buffer.allocUnsafe()`.
let random = bytes =>
  new Promise((resolve, reject) => {
    // `Buffer.allocUnsafe()` is faster because it doesn’t flush the memory.
    // Memory flushing is unnecessary since the buffer allocation itself resets
    // the memory with the new bytes.
    crypto.randomFill(Buffer.allocUnsafe(bytes), (err, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf)
      }
    })
  })

let customAlphabet = (alphabet, defaultSize = 21) => {
  // First, a bitmask is necessary to generate the ID. The bitmask makes bytes
  // values closer to the alphabet size. The bitmask calculates the closest
  // `2^31 - 1` number, which exceeds the alphabet size.
  // For example, the bitmask for the alphabet size 30 is 31 (00011111).
  let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  // Though, the bitmask solution is not perfect since the bytes exceeding
  // the alphabet size are refused. Therefore, to reliably generate the ID,
  // the random bytes redundancy has to be satisfied.

  // Note: every hardware random generator call is performance expensive,
  // because the system call for entropy collection takes a lot of time.
  // So, to avoid additional system calls, extra bytes are requested in advance.

  // Next, a step determines how many random bytes to generate.
  // The number of random bytes gets decided upon the ID size, mask,
  // alphabet size, and magic number 1.6 (using 1.6 peaks at performance
  // according to benchmarks).
  let step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)

  let tick = (id, size = defaultSize) =>
    random(step).then(bytes => {
      // A compact alternative for `for (var i = 0; i < step; i++)`.
      let i = step
      while (i--) {
        // Adding `|| ''` refuses a random byte that exceeds the alphabet size.
        id += alphabet[bytes[i] & mask] || ''
        if (id.length >= size) return id
      }
      return tick(id, size)
    })

  return size => tick('', size)
}

let nanoid = (size = 21) =>
  random((size |= 0)).then(bytes => {
    let id = ''
    // A compact alternative for `for (var i = 0; i < step; i++)`.
    while (size--) {
      // It is incorrect to use bytes exceeding the alphabet size.
      // The following mask reduces the random byte in the 0-255 value
      // range to the 0-63 value range. Therefore, adding hacks, such
      // as empty string fallback or magic numbers, is unneccessary because
      // the bitmask trims bytes down to the alphabet size.
      id += urlAlphabet[bytes[size] & 63]
    }
    return id
  })

module.exports = { nanoid, customAlphabet, random }


let crypto = require('crypto')

let { urlAlphabet } = require('./url-alphabet/index.cjs')

// It is best to make fewer, larger requests to the crypto module to
// avoid system call overhead. So, random numbers are generated in a
// pool. The pool is a Buffer that is larger than the initial random
// request size by this multiplier. The pool is enlarged if subsequent
// requests exceed the maximum buffer size.
const POOL_SIZE_MULTIPLIER = 128
let pool, poolOffset

let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER)
    crypto.randomFillSync(pool)
    poolOffset = 0
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool)
    poolOffset = 0
  }
  poolOffset += bytes
}

let random = bytes => {
  // `|=` convert `bytes` to number to prevent `valueOf` abusing and pool pollution
  fillPool((bytes |= 0))
  return pool.subarray(poolOffset - bytes, poolOffset)
}

let customRandom = (alphabet, defaultSize, getRandom) => {
  // First, a bitmask is necessary to generate the ID. The bitmask makes bytes
  // values closer to the alphabet size. The bitmask calculates the closest
  // `2^31 - 1` number, which exceeds the alphabet size.
  // For example, the bitmask for the alphabet size 30 is 31 (00011111).
  let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  // Though, the bitmask solution is not perfect since the bytes exceeding
  // the alphabet size are refused. Therefore, to reliably generate the ID,
  // the random bytes redundancy has to be satisfied.

  // Note: every hardware random generator call is performance expensive,
  // because the system call for entropy collection takes a lot of time.
  // So, to avoid additional system calls, extra bytes are requested in advance.

  // Next, a step determines how many random bytes to generate.
  // The number of random bytes gets decided upon the ID size, mask,
  // alphabet size, and magic number 1.6 (using 1.6 peaks at performance
  // according to benchmarks).
  let step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)

  return (size = defaultSize) => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      // A compact alternative for `for (let i = 0; i < step; i++)`.
      let i = step
      while (i--) {
        // Adding `|| ''` refuses a random byte that exceeds the alphabet size.
        id += alphabet[bytes[i] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}

let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random)

let nanoid = (size = 21) => {
  // `|=` convert `size` to number to prevent `valueOf` abusing and pool pollution
  fillPool((size |= 0))
  let id = ''
  // We are reading directly from the random pool to avoid creating new array
  for (let i = poolOffset - size; i < poolOffset; i++) {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unneccessary because
    // the bitmask trims bytes down to the alphabet size.
    id += urlAlphabet[pool[i] & 63]
  }
  return id
}

module.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random }


// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// References to the same file (works both for gzip and brotli):
// `'use`, `andom`, and `rict'`
// References to the brotli default dictionary:
// `-26T`, `1983`, `40px`, `75px`, `bush`, `jack`, `mind`, `very`, and `wolf`
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

let customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    let id = ''
    // A compact alternative for `for (var i = 0; i < step; i++)`.
    let i = size | 0
    while (i--) {
      // `| 0` is more compact and faster than `Math.floor()`.
      id += alphabet[(Math.random() * alphabet.length) | 0]
    }
    return id
  }
}

let nanoid = (size = 21) => {
  let id = ''
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size | 0
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}

module.exports = { nanoid, customAlphabet }


// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// Same as in non-secure/index.js
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

module.exports = { urlAlphabet }


'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _path = require('./shared/pathe.BSlhyZSM.cjs');

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: void 0, win32: void 0 };
const mix = (del = delimiter) => {
  return new Proxy(_path._path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path._path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

exports.basename = _path.basename;
exports.dirname = _path.dirname;
exports.extname = _path.extname;
exports.format = _path.format;
exports.isAbsolute = _path.isAbsolute;
exports.join = _path.join;
exports.matchesGlob = _path.matchesGlob;
exports.normalize = _path.normalize;
exports.normalizeString = _path.normalizeString;
exports.parse = _path.parse;
exports.relative = _path.relative;
exports.resolve = _path.resolve;
exports.sep = _path.sep;
exports.toNamespacedPath = _path.toNamespacedPath;
exports.default = posix;
exports.delimiter = delimiter;
exports.posix = posix;
exports.win32 = win32;


"use strict";var B=Object.defineProperty;var p=Object.getOwnPropertySymbols;var b=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable;var C=(i,e,E)=>e in i?B(i,e,{enumerable:!0,configurable:!0,writable:!0,value:E}):i[e]=E,A=(i,e)=>{for(var E in e||(e={}))b.call(e,E)&&C(i,E,e[E]);if(p)for(var E of p(e))g.call(e,E)&&C(i,E,e[E]);return i};var O,_,D,a,L,c,S,N,u,P;const r$2=Object.create(null),s=i=>{var e,E;return((e=globalThis.process)==null?void 0:e.env)||void 0||((E=globalThis.Deno)==null?void 0:E.env.toObject())||globalThis.__env__||(i?r$2:globalThis)},env=new Proxy(r$2,{get(i,e){var E;return(E=s()[e])!=null?E:r$2[e]},has(i,e){const E=s();return e in E||e in r$2},set(i,e,E){const n=s(!0);return n[e]=E,!0},deleteProperty(i,e){if(!e)return!1;const E=s(!0);return delete E[e],!0},ownKeys(){const i=s(!0);return Object.keys(i)}}),nodeENV=typeof process<"u"&&process.env&&process.env.NODE_ENV||"",r$1=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:!0}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:!0}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:!0}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:!1}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:!1}],["VERCEL","VERCEL_ENV",{ci:!1}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:!1}],["CODESANDBOX","CODESANDBOX_HOST",{ci:!1}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:!0}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:!0}]];function I(){var i,e,E,n,T,R;if((i=globalThis.process)!=null&&i.env)for(const l of r$1){const d=l[1]||l[0];if((e=globalThis.process)!=null&&e.env[d])return A({name:l[0].toLowerCase()},l[2])}return((n=(E=globalThis.process)==null?void 0:E.env)==null?void 0:n.SHELL)==="/bin/jsh"&&((R=(T=globalThis.process)==null?void 0:T.versions)!=null&&R.webcontainer)?{name:"stackblitz",ci:!1}:{name:"",ci:!1}}const providerInfo=I(),provider=providerInfo.name;function toBoolean(i){return i?i!=="false":!1}const platform=((O=globalThis.process)==null?void 0:O.platform)||"",isCI=toBoolean(env.CI)||providerInfo.ci!==!1,hasTTY=toBoolean(((_=globalThis.process)==null?void 0:_.stdout)&&((D=globalThis.process)==null?void 0:D.stdout.isTTY)),hasWindow=typeof window<"u",isDebug=toBoolean(env.DEBUG),isTest=nodeENV==="test"||toBoolean(env.TEST),isProduction=nodeENV==="production",isDevelopment=nodeENV==="dev"||nodeENV==="development",isMinimal=toBoolean(env.MINIMAL)||isCI||isTest||!hasTTY,isWindows=/^win/i.test(platform),isLinux=/^linux/i.test(platform),isMacOS=/^darwin/i.test(platform),isColorSupported=!toBoolean(env.NO_COLOR)&&(toBoolean(env.FORCE_COLOR)||(hasTTY||isWindows)&&env.TERM!=="dumb"||isCI),nodeVersion=(((L=(a=globalThis.process)==null?void 0:a.versions)==null?void 0:L.node)||"").replace(/^v/,"")||null,nodeMajorVersion=Number(nodeVersion==null?void 0:nodeVersion.split(".")[0])||null,o$1=globalThis.process||Object.create(null),r={versions:{}},process$1=new Proxy(o$1,{get(i,e){if(e==="env")return env;if(e in i)return i[e];if(e in r)return r[e]}}),isNode=((S=(c=globalThis.process)==null?void 0:c.release)==null?void 0:S.name)==="node",isBun=!!globalThis.Bun||!!((u=(N=globalThis.process)==null?void 0:N.versions)!=null&&u.bun),isDeno=!!globalThis.Deno,isFastly=!!globalThis.fastly,isNetlify=!!globalThis.Netlify,isEdgeLight=!!globalThis.EdgeRuntime,isWorkerd=((P=globalThis.navigator)==null?void 0:P.userAgent)==="Cloudflare-Workers",t=[[isNetlify,"netlify"],[isEdgeLight,"edge-light"],[isWorkerd,"workerd"],[isFastly,"fastly"],[isDeno,"deno"],[isBun,"bun"],[isNode,"node"]];function o(){const i=t.find(e=>e[0]);if(i)return{name:i[1]}}const runtimeInfo=o(),runtime=(runtimeInfo==null?void 0:runtimeInfo.name)||"";exports.env=env,exports.hasTTY=hasTTY,exports.hasWindow=hasWindow,exports.isBun=isBun,exports.isCI=isCI,exports.isColorSupported=isColorSupported,exports.isDebug=isDebug,exports.isDeno=isDeno,exports.isDevelopment=isDevelopment,exports.isEdgeLight=isEdgeLight,exports.isFastly=isFastly,exports.isLinux=isLinux,exports.isMacOS=isMacOS,exports.isMinimal=isMinimal,exports.isNetlify=isNetlify,exports.isNode=isNode,exports.isProduction=isProduction,exports.isTest=isTest,exports.isWindows=isWindows,exports.isWorkerd=isWorkerd,exports.nodeENV=nodeENV,exports.nodeMajorVersion=nodeMajorVersion,exports.nodeVersion=nodeVersion,exports.platform=platform,exports.process=process$1,exports.provider=provider,exports.providerInfo=providerInfo,exports.runtime=runtime,exports.runtimeInfo=runtimeInfo;


'use strict';

const jsTokens = require('js-tokens');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const jsTokens__default = /*#__PURE__*/_interopDefaultCompat(jsTokens);

function stripLiteralJsTokens(code, options) {
  const FILL = options?.fillChar ?? " ";
  const FILL_COMMENT = " ";
  let result = "";
  const filter = options?.filter ?? (() => true);
  const tokens = [];
  for (const token of jsTokens__default(code, { jsx: false })) {
    tokens.push(token);
    if (token.type === "SingleLineComment") {
      result += FILL_COMMENT.repeat(token.value.length);
      continue;
    }
    if (token.type === "MultiLineComment") {
      result += token.value.replace(/[^\n]/g, FILL_COMMENT);
      continue;
    }
    if (token.type === "StringLiteral") {
      if (!token.closed) {
        result += token.value;
        continue;
      }
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += token.value[0] + FILL.repeat(body.length) + token.value[token.value.length - 1];
        continue;
      }
    }
    if (token.type === "NoSubstitutionTemplate") {
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "RegularExpressionLiteral") {
      const body = token.value;
      if (filter(body)) {
        result += body.replace(/\/(.*)\/(\w?)$/g, (_, $1, $2) => `/${FILL.repeat($1.length)}/${$2}`);
        continue;
      }
    }
    if (token.type === "TemplateHead") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    if (token.type === "TemplateTail") {
      const body = token.value.slice(0, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "TemplateMiddle") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    result += token.value;
  }
  return {
    result,
    tokens
  };
}

function stripLiteral(code, options) {
  return stripLiteralDetailed(code, options).result;
}
function stripLiteralDetailed(code, options) {
  return stripLiteralJsTokens(code, options);
}

exports.stripLiteral = stripLiteral;
exports.stripLiteralDetailed = stripLiteralDetailed;
exports.stripLiteralJsTokens = stripLiteralJsTokens;


"use strict";
var x = Object.defineProperty;
var G = Object.getOwnPropertyDescriptor;
var J = Object.getOwnPropertyNames;
var U = Object.prototype.hasOwnProperty;
var q = (n) => {
  throw TypeError(n);
};
var W = (n, s, t) => s in n ? x(n, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[s] = t;
var X = (n, s) => {
  for (var t in s)
    x(n, t, { get: s[t], enumerable: !0 });
}, Z = (n, s, t, e) => {
  if (s && typeof s == "object" || typeof s == "function")
    for (let r of J(s))
      !U.call(n, r) && r !== t && x(n, r, { get: () => s[r], enumerable: !(e = G(s, r)) || e.enumerable });
  return n;
};
var tt = (n) => Z(x({}, "__esModule", { value: !0 }), n);
var M = (n, s, t) => W(n, typeof s != "symbol" ? s + "" : s, t), S = (n, s, t) => s.has(n) || q("Cannot " + t);
var d = (n, s, t) => (S(n, s, "read from private field"), t ? t.call(n) : s.get(n)), L = (n, s, t) => s.has(n) ? q("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(n) : s.set(n, t), f = (n, s, t, e) => (S(n, s, "write to private field"), e ? e.call(n, t) : s.set(n, t), t);
var N = (n, s, t, e) => ({
  set _(r) {
    f(n, s, r, t);
  },
  get _() {
    return d(n, s, e);
  }
});

// src/index.ts
var ot = {};
X(ot, {
  Bench: () => k,
  Task: () => v,
  hrtimeNow: () => z,
  now: () => A
});
module.exports = tt(ot);

// node_modules/.pnpm/yocto-queue@1.0.0/node_modules/yocto-queue/index.js
var B = class {
  constructor(s) {
    M(this, "value");
    M(this, "next");
    this.value = s;
  }
}, m, E, b, g = class {
  constructor() {
    L(this, m);
    L(this, E);
    L(this, b);
    this.clear();
  }
  enqueue(s) {
    let t = new B(s);
    d(this, m) ? (d(this, E).next = t, f(this, E, t)) : (f(this, m, t), f(this, E, t)), N(this, b)._++;
  }
  dequeue() {
    let s = d(this, m);
    if (s)
      return f(this, m, d(this, m).next), N(this, b)._--, s.value;
  }
  clear() {
    f(this, m, void 0), f(this, E, void 0), f(this, b, 0);
  }
  get size() {
    return d(this, b);
  }
  *[Symbol.iterator]() {
    let s = d(this, m);
    for (; s; )
      yield s.value, s = s.next;
  }
};
m = new WeakMap(), E = new WeakMap(), b = new WeakMap();

// node_modules/.pnpm/p-limit@4.0.0/node_modules/p-limit/index.js
function y(n) {
  if (!((Number.isInteger(n) || n === Number.POSITIVE_INFINITY) && n > 0))
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  let s = new g(), t = 0, e = () => {
    t--, s.size > 0 && s.dequeue()();
  }, r = async (h, p, a) => {
    t++;
    let l = (async () => h(...a))();
    p(l);
    try {
      await l;
    } catch (T) {
    }
    e();
  }, i = (h, p, a) => {
    s.enqueue(r.bind(void 0, h, p, a)), (async () => (await Promise.resolve(), t < n && s.size > 0 && s.dequeue()()))();
  }, c = (h, ...p) => new Promise((a) => {
    i(h, a, p);
  });
  return Object.defineProperties(c, {
    activeCount: {
      get: () => t
    },
    pendingCount: {
      get: () => s.size
    },
    clearQueue: {
      value: () => {
        s.clear();
      }
    }
  }), c;
}

// src/event.ts
function o(n, s = null) {
  let t = new Event(n);
  return s && Object.defineProperty(t, "task", {
    value: s,
    enumerable: !0,
    writable: !1,
    configurable: !1
  }), t;
}

// src/constants.ts
var et = {
  1: 12.71,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228,
  11: 2.201,
  12: 2.179,
  13: 2.16,
  14: 2.145,
  15: 2.131,
  16: 2.12,
  17: 2.11,
  18: 2.101,
  19: 2.093,
  20: 2.086,
  21: 2.08,
  22: 2.074,
  23: 2.069,
  24: 2.064,
  25: 2.06,
  26: 2.056,
  27: 2.052,
  28: 2.048,
  29: 2.045,
  30: 2.042,
  31: 2.0399,
  32: 2.0378,
  33: 2.0357,
  34: 2.0336,
  35: 2.0315,
  36: 2.0294,
  37: 2.0273,
  38: 2.0252,
  39: 2.0231,
  40: 2.021,
  41: 2.0198,
  42: 2.0186,
  43: 2.0174,
  44: 2.0162,
  45: 2.015,
  46: 2.0138,
  47: 2.0126,
  48: 2.0114,
  49: 2.0102,
  50: 2.009,
  51: 2.0081,
  52: 2.0072,
  53: 2.0063,
  54: 2.0054,
  55: 2.0045,
  56: 2.0036,
  57: 2.0027,
  58: 2.0018,
  59: 2.0009,
  60: 2,
  61: 1.9995,
  62: 1.999,
  63: 1.9985,
  64: 1.998,
  65: 1.9975,
  66: 1.997,
  67: 1.9965,
  68: 1.996,
  69: 1.9955,
  70: 1.995,
  71: 1.9945,
  72: 1.994,
  73: 1.9935,
  74: 1.993,
  75: 1.9925,
  76: 1.992,
  77: 1.9915,
  78: 1.991,
  79: 1.9905,
  80: 1.99,
  81: 1.9897,
  82: 1.9894,
  83: 1.9891,
  84: 1.9888,
  85: 1.9885,
  86: 1.9882,
  87: 1.9879,
  88: 1.9876,
  89: 1.9873,
  90: 1.987,
  91: 1.9867,
  92: 1.9864,
  93: 1.9861,
  94: 1.9858,
  95: 1.9855,
  96: 1.9852,
  97: 1.9849,
  98: 1.9846,
  99: 1.9843,
  100: 1.984,
  101: 1.9838,
  102: 1.9836,
  103: 1.9834,
  104: 1.9832,
  105: 1.983,
  106: 1.9828,
  107: 1.9826,
  108: 1.9824,
  109: 1.9822,
  110: 1.982,
  111: 1.9818,
  112: 1.9816,
  113: 1.9814,
  114: 1.9812,
  115: 1.9819,
  116: 1.9808,
  117: 1.9806,
  118: 1.9804,
  119: 1.9802,
  120: 1.98,
  infinity: 1.96
}, P = et;

// src/utils.ts
var st = (n) => n / 1e6, z = () => st(Number(process.hrtime.bigint())), A = () => performance.now();
function nt(n) {
  return n !== null && typeof n == "object" && typeof n.then == "function";
}
var j = (n, s) => n.reduce((e, r) => e + (r - s) ** 2, 0) / (n.length - 1) || 0, rt = (async () => {
}).constructor, it = (n) => n.constructor === rt, H = async (n) => {
  if (it(n.fn))
    return !0;
  try {
    if (n.opts.beforeEach != null)
      try {
        await n.opts.beforeEach.call(n);
      } catch (e) {
      }
    let s = n.fn(), t = nt(s);
    if (t)
      try {
        await s;
      } catch (e) {
      }
    if (n.opts.afterEach != null)
      try {
        await n.opts.afterEach.call(n);
      } catch (e) {
      }
    return t;
  } catch (s) {
    return !1;
  }
};

// src/task.ts
var v = class extends EventTarget {
  constructor(t, e, r, i = {}) {
    super();
    /*
     * the number of times the task
     * function has been executed
     */
    this.runs = 0;
    this.bench = t, this.name = e, this.fn = r, this.opts = i;
  }
  async loop(t, e) {
    var T;
    let r = this.bench.concurrency === "task", { threshold: i } = this.bench, c = 0, h = [];
    if (this.opts.beforeAll != null)
      try {
        await this.opts.beforeAll.call(this);
      } catch (u) {
        return { error: u };
      }
    let p = await H(this), a = async () => {
      this.opts.beforeEach != null && await this.opts.beforeEach.call(this);
      let u = 0;
      if (p) {
        let w = this.bench.now();
        await this.fn.call(this), u = this.bench.now() - w;
      } else {
        let w = this.bench.now();
        this.fn.call(this), u = this.bench.now() - w;
      }
      h.push(u), c += u, this.opts.afterEach != null && await this.opts.afterEach.call(this);
    }, l = y(i);
    try {
      let u = [];
      for (; (c < t || h.length + l.activeCount + l.pendingCount < e) && !((T = this.bench.signal) != null && T.aborted); )
        r ? u.push(l(a)) : await a();
      u.length && await Promise.all(u);
    } catch (u) {
      return { error: u };
    }
    if (this.opts.afterAll != null)
      try {
        await this.opts.afterAll.call(this);
      } catch (u) {
        return { error: u };
      }
    return { samples: h };
  }
  /**
   * run the current task and write the results in `Task.result` object
   */
  async run() {
    var r, i;
    if ((r = this.result) != null && r.error)
      return this;
    this.dispatchEvent(o("start", this)), await this.bench.setup(this, "run");
    let { samples: t, error: e } = await this.loop(this.bench.time, this.bench.iterations);
    if (this.bench.teardown(this, "run"), t) {
      let c = t.reduce((O, F) => O + F, 0);
      this.runs = t.length, t.sort((O, F) => O - F);
      let h = c / this.runs, p = 1e3 / h, a = t.length, l = a - 1, T = t[0], u = t[l], w = c / t.length || 0, R = j(t, w), I = Math.sqrt(R), _ = I / Math.sqrt(a), K = P[String(Math.round(l) || 1)] || P.infinity, C = _ * K, V = C / w * 100, Q = t[Math.ceil(a * 0.75) - 1], Y = t[Math.ceil(a * 0.99) - 1], $ = t[Math.ceil(a * 0.995) - 1], D = t[Math.ceil(a * 0.999) - 1];
      if ((i = this.bench.signal) != null && i.aborted)
        return this;
      this.setResult({
        totalTime: c,
        min: T,
        max: u,
        hz: p,
        period: h,
        samples: t,
        mean: w,
        variance: R,
        sd: I,
        sem: _,
        df: l,
        critical: K,
        moe: C,
        rme: V,
        p75: Q,
        p99: Y,
        p995: $,
        p999: D
      });
    }
    if (e) {
      if (this.setResult({ error: e }), this.bench.throws)
        throw e;
      this.dispatchEvent(o("error", this)), this.bench.dispatchEvent(o("error", this));
    }
    return this.dispatchEvent(o("cycle", this)), this.bench.dispatchEvent(o("cycle", this)), this.dispatchEvent(o("complete", this)), this;
  }
  /**
   * warmup the current task
   */
  async warmup() {
    var e;
    if ((e = this.result) != null && e.error)
      return;
    this.dispatchEvent(o("warmup", this)), await this.bench.setup(this, "warmup");
    let { error: t } = await this.loop(this.bench.warmupTime, this.bench.warmupIterations);
    if (this.bench.teardown(this, "warmup"), t && (this.setResult({ error: t }), this.bench.throws))
      throw t;
  }
  addEventListener(t, e, r) {
    super.addEventListener(t, e, r);
  }
  removeEventListener(t, e, r) {
    super.removeEventListener(t, e, r);
  }
  /**
   * change the result object values
   */
  setResult(t) {
    this.result = { ...this.result, ...t }, Object.freeze(this.result);
  }
  /**
   * reset the task to make the `Task.runs` a zero-value and remove the `Task.result`
   * object
   */
  reset() {
    this.dispatchEvent(o("reset", this)), this.runs = 0, this.result = void 0;
  }
};

// src/bench.ts
var k = class extends EventTarget {
  constructor(t = {}) {
    var e, r, i, c, h, p, a, l;
    super();
    /*
     * @private the task map
     */
    this._tasks = /* @__PURE__ */ new Map();
    this._todos = /* @__PURE__ */ new Map();
    /**
    * Executes tasks concurrently based on the specified concurrency mode.
    *
    * - When `mode` is set to `null` (default), concurrency is disabled.
    * - When `mode` is set to 'task', each task's iterations (calls of a task function) run concurrently.
    * - When `mode` is set to 'bench', different tasks within the bench run concurrently.
    */
    this.concurrency = null;
    /**
     * The maximum number of concurrent tasks to run. Defaults to Infinity.
     */
    this.threshold = 1 / 0;
    this.warmupTime = 100;
    this.warmupIterations = 5;
    this.time = 500;
    this.iterations = 10;
    this.now = A;
    this.now = (e = t.now) != null ? e : this.now, this.warmupTime = (r = t.warmupTime) != null ? r : this.warmupTime, this.warmupIterations = (i = t.warmupIterations) != null ? i : this.warmupIterations, this.time = (c = t.time) != null ? c : this.time, this.iterations = (h = t.iterations) != null ? h : this.iterations, this.signal = t.signal, this.throws = (p = t.throws) != null ? p : !1, this.setup = (a = t.setup) != null ? a : () => {
    }, this.teardown = (l = t.teardown) != null ? l : () => {
    }, this.signal && this.signal.addEventListener(
      "abort",
      () => {
        this.dispatchEvent(o("abort"));
      },
      { once: !0 }
    );
  }
  runTask(t) {
    var e;
    return (e = this.signal) != null && e.aborted ? t : t.run();
  }
  /**
   * run the added tasks that were registered using the
   * {@link add} method.
   * Note: This method does not do any warmup. Call {@link warmup} for that.
   */
  async run() {
    if (this.concurrency === "bench")
      return this.runConcurrently(this.threshold, this.concurrency);
    this.dispatchEvent(o("start"));
    let t = [];
    for (let e of [...this._tasks.values()])
      t.push(await this.runTask(e));
    return this.dispatchEvent(o("complete")), t;
  }
  /**
   * See Bench.{@link concurrency}
   */
  async runConcurrently(t = 1 / 0, e = "bench") {
    if (this.threshold = t, this.concurrency = e, e === "task")
      return this.run();
    this.dispatchEvent(o("start"));
    let r = y(t), i = [];
    for (let h of [...this._tasks.values()])
      i.push(r(() => this.runTask(h)));
    let c = await Promise.all(i);
    return this.dispatchEvent(o("complete")), c;
  }
  /**
   * warmup the benchmark tasks.
   * This is not run by default by the {@link run} method.
   */
  async warmup() {
    if (this.concurrency === "bench") {
      await this.warmupConcurrently(this.threshold, this.concurrency);
      return;
    }
    this.dispatchEvent(o("warmup"));
    for (let [, t] of this._tasks)
      await t.warmup();
  }
  /**
   * warmup the benchmark tasks concurrently.
   * This is not run by default by the {@link runConcurrently} method.
   */
  async warmupConcurrently(t = 1 / 0, e = "bench") {
    if (this.threshold = t, this.concurrency = e, e === "task") {
      await this.warmup();
      return;
    }
    this.dispatchEvent(o("warmup"));
    let r = y(t), i = [];
    for (let [, c] of this._tasks)
      i.push(r(() => c.warmup()));
    await Promise.all(i);
  }
  /**
   * reset each task and remove its result
   */
  reset() {
    this.dispatchEvent(o("reset")), this._tasks.forEach((t) => {
      t.reset();
    });
  }
  /**
   * add a benchmark task to the task map
   */
  add(t, e, r = {}) {
    let i = new v(this, t, e, r);
    return this._tasks.set(t, i), this.dispatchEvent(o("add", i)), this;
  }
  /**
   * add a benchmark todo to the todo map
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  todo(t, e = () => {
  }, r = {}) {
    let i = new v(this, t, e, r);
    return this._todos.set(t, i), this.dispatchEvent(o("todo", i)), this;
  }
  /**
   * remove a benchmark task from the task map
   */
  remove(t) {
    let e = this.getTask(t);
    return e && (this.dispatchEvent(o("remove", e)), this._tasks.delete(t)), this;
  }
  addEventListener(t, e, r) {
    super.addEventListener(t, e, r);
  }
  removeEventListener(t, e, r) {
    super.removeEventListener(t, e, r);
  }
  /**
   * table of the tasks results
   */
  table(t) {
    return this.tasks.map((e) => {
      if (e.result) {
        if (e.result.error)
          throw e.result.error;
        return (t == null ? void 0 : t(e)) || {
          "Task Name": e.name,
          "ops/sec": e.result.error ? "NaN" : parseInt(e.result.hz.toString(), 10).toLocaleString(),
          "Average Time (ns)": e.result.error ? "NaN" : e.result.mean * 1e3 * 1e3,
          Margin: e.result.error ? "NaN" : `\xB1${e.result.rme.toFixed(2)}%`,
          Samples: e.result.error ? "NaN" : e.result.samples.length
        };
      }
      return null;
    });
  }
  /**
   * (getter) tasks results as an array
   */
  get results() {
    return [...this._tasks.values()].map((t) => t.result);
  }
  /**
   * (getter) tasks as an array
   */
  get tasks() {
    return [...this._tasks.values()];
  }
  get todos() {
    return [...this._todos.values()];
  }
  /**
   * get a task based on the task name
   */
  getTask(t) {
    return this._tasks.get(t);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bench,
  Task,
  hrtimeNow,
  now
});


'use strict';



throw new Error(
  'Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.'
  + '\n\nIf you are using "import" in your source code, then it\'s possible it was bundled into require() automatically by your bundler. '
  + 'In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.',
)


'use strict';

var posixPath = require('./std__path/posix.cjs');
var windowsPath = require('./std__path/windows.cjs');
var minimatch = require('minimatch');
var createDebug = require('debug');
var objectSchema = require('@eslint/object-schema');

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var posixPath__namespace = /*#__PURE__*/_interopNamespaceDefault(posixPath);
var windowsPath__namespace = /*#__PURE__*/_interopNamespaceDefault(windowsPath);

/**
 * @fileoverview ConfigSchema
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/** @typedef {import("@eslint/object-schema").PropertyDefinition} PropertyDefinition */
/** @typedef {import("@eslint/object-schema").ObjectDefinition} ObjectDefinition */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * A strategy that does nothing.
 * @type {PropertyDefinition}
 */
const NOOP_STRATEGY = {
	required: false,
	merge() {
		return undefined;
	},
	validate() {},
};

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * The base schema that every ConfigArray uses.
 * @type {ObjectDefinition}
 */
const baseSchema = Object.freeze({
	name: {
		required: false,
		merge() {
			return undefined;
		},
		validate(value) {
			if (typeof value !== "string") {
				throw new TypeError("Property must be a string.");
			}
		},
	},
	basePath: NOOP_STRATEGY,
	files: NOOP_STRATEGY,
	ignores: NOOP_STRATEGY,
});

/**
 * @fileoverview ConfigSchema
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Asserts that a given value is an array.
 * @param {*} value The value to check.
 * @returns {void}
 * @throws {TypeError} When the value is not an array.
 */
function assertIsArray(value) {
	if (!Array.isArray(value)) {
		throw new TypeError("Expected value to be an array.");
	}
}

/**
 * Asserts that a given value is an array containing only strings and functions.
 * @param {*} value The value to check.
 * @returns {void}
 * @throws {TypeError} When the value is not an array of strings and functions.
 */
function assertIsArrayOfStringsAndFunctions(value) {
	assertIsArray(value);

	if (
		value.some(
			item => typeof item !== "string" && typeof item !== "function",
		)
	) {
		throw new TypeError(
			"Expected array to only contain strings and functions.",
		);
	}
}

/**
 * Asserts that a given value is a non-empty array.
 * @param {*} value The value to check.
 * @returns {void}
 * @throws {TypeError} When the value is not an array or an empty array.
 */
function assertIsNonEmptyArray(value) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new TypeError("Expected value to be a non-empty array.");
	}
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

/**
 * The schema for `files` and `ignores` that every ConfigArray uses.
 * @type {ObjectDefinition}
 */
const filesAndIgnoresSchema = Object.freeze({
	basePath: {
		required: false,
		merge() {
			return undefined;
		},
		validate(value) {
			if (typeof value !== "string") {
				throw new TypeError("Expected value to be a string.");
			}
		},
	},
	files: {
		required: false,
		merge() {
			return undefined;
		},
		validate(value) {
			// first check if it's an array
			assertIsNonEmptyArray(value);

			// then check each member
			value.forEach(item => {
				if (Array.isArray(item)) {
					assertIsArrayOfStringsAndFunctions(item);
				} else if (
					typeof item !== "string" &&
					typeof item !== "function"
				) {
					throw new TypeError(
						"Items must be a string, a function, or an array of strings and functions.",
					);
				}
			});
		},
	},
	ignores: {
		required: false,
		merge() {
			return undefined;
		},
		validate: assertIsArrayOfStringsAndFunctions,
	},
});

/**
 * @fileoverview ConfigArray
 * @author Nicholas C. Zakas
 */


//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/** @typedef {import("./types.ts").ConfigObject} ConfigObject */
/** @typedef {import("minimatch").IMinimatchStatic} IMinimatchStatic */
/** @typedef {import("minimatch").IMinimatch} IMinimatch */
/** @typedef {import("@jsr/std__path")} PathImpl */

/*
 * This is a bit of a hack to make TypeScript happy with the Rollup-created
 * CommonJS file. Rollup doesn't do object destructuring for imported files
 * and instead imports the default via `require()`. This messes up type checking
 * for `ObjectSchema`. To work around that, we just import the type manually
 * and give it a different name to use in the JSDoc comments.
 */
/** @typedef {import("@eslint/object-schema").ObjectSchema} ObjectSchemaInstance */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const Minimatch = minimatch.Minimatch;
const debug = createDebug("@eslint/config-array");

/**
 * A cache for minimatch instances.
 * @type {Map<string, IMinimatch>}
 */
const minimatchCache = new Map();

/**
 * A cache for negated minimatch instances.
 * @type {Map<string, IMinimatch>}
 */
const negatedMinimatchCache = new Map();

/**
 * Options to use with minimatch.
 * @type {Object}
 */
const MINIMATCH_OPTIONS = {
	// matchBase: true,
	dot: true,
	allowWindowsEscape: true,
};

/**
 * The types of config objects that are supported.
 * @type {Set<string>}
 */
const CONFIG_TYPES = new Set(["array", "function"]);

/**
 * Fields that are considered metadata and not part of the config object.
 * @type {Set<string>}
 */
const META_FIELDS = new Set(["name", "basePath"]);

/**
 * A schema containing just files and ignores for early validation.
 * @type {ObjectSchemaInstance}
 */
const FILES_AND_IGNORES_SCHEMA = new objectSchema.ObjectSchema(filesAndIgnoresSchema);

// Precomputed constant objects returned by `ConfigArray.getConfigWithStatus`.

const CONFIG_WITH_STATUS_EXTERNAL = Object.freeze({ status: "external" });
const CONFIG_WITH_STATUS_IGNORED = Object.freeze({ status: "ignored" });
const CONFIG_WITH_STATUS_UNCONFIGURED = Object.freeze({
	status: "unconfigured",
});

// Match two leading dots followed by a slash or the end of input.
const EXTERNAL_PATH_REGEX = /^\.\.(?:\/|$)/u;

/**
 * Wrapper error for config validation errors that adds a name to the front of the
 * error message.
 */
class ConfigError extends Error {
	/**
	 * Creates a new instance.
	 * @param {string} name The config object name causing the error.
	 * @param {number} index The index of the config object in the array.
	 * @param {Object} options The options for the error.
	 * @param {Error} [options.cause] The error that caused this error.
	 * @param {string} [options.message] The message to use for the error.
	 */
	constructor(name, index, { cause, message }) {
		const finalMessage = message || cause.message;

		super(`Config ${name}: ${finalMessage}`, { cause });

		// copy over custom properties that aren't represented
		if (cause) {
			for (const key of Object.keys(cause)) {
				if (!(key in this)) {
					this[key] = cause[key];
				}
			}
		}

		/**
		 * The name of the error.
		 * @type {string}
		 * @readonly
		 */
		this.name = "ConfigError";

		/**
		 * The index of the config object in the array.
		 * @type {number}
		 * @readonly
		 */
		this.index = index;
	}
}

/**
 * Gets the name of a config object.
 * @param {ConfigObject} config The config object to get the name of.
 * @returns {string} The name of the config object.
 */
function getConfigName(config) {
	if (config && typeof config.name === "string" && config.name) {
		return `"${config.name}"`;
	}

	return "(unnamed)";
}

/**
 * Rethrows a config error with additional information about the config object.
 * @param {object} config The config object to get the name of.
 * @param {number} index The index of the config object in the array.
 * @param {Error} error The error to rethrow.
 * @throws {ConfigError} When the error is rethrown for a config.
 */
function rethrowConfigError(config, index, error) {
	const configName = getConfigName(config);
	throw new ConfigError(configName, index, { cause: error });
}

/**
 * Shorthand for checking if a value is a string.
 * @param {any} value The value to check.
 * @returns {boolean} True if a string, false if not.
 */
function isString(value) {
	return typeof value === "string";
}

/**
 * Creates a function that asserts that the config is valid
 * during normalization. This checks that the config is not nullish
 * and that files and ignores keys  of a config object are valid as per base schema.
 * @param {Object} config The config object to check.
 * @param {number} index The index of the config object in the array.
 * @returns {void}
 * @throws {ConfigError} If the files and ignores keys of a config object are not valid.
 */
function assertValidBaseConfig(config, index) {
	if (config === null) {
		throw new ConfigError(getConfigName(config), index, {
			message: "Unexpected null config.",
		});
	}

	if (config === undefined) {
		throw new ConfigError(getConfigName(config), index, {
			message: "Unexpected undefined config.",
		});
	}

	if (typeof config !== "object") {
		throw new ConfigError(getConfigName(config), index, {
			message: "Unexpected non-object config.",
		});
	}

	const validateConfig = {};

	if ("basePath" in config) {
		validateConfig.basePath = config.basePath;
	}

	if ("files" in config) {
		validateConfig.files = config.files;
	}

	if ("ignores" in config) {
		validateConfig.ignores = config.ignores;
	}

	try {
		FILES_AND_IGNORES_SCHEMA.validate(validateConfig);
	} catch (validationError) {
		rethrowConfigError(config, index, validationError);
	}
}

/**
 * Wrapper around minimatch that caches minimatch patterns for
 * faster matching speed over multiple file path evaluations.
 * @param {string} filepath The file path to match.
 * @param {string} pattern The glob pattern to match against.
 * @param {object} options The minimatch options to use.
 * @returns
 */
function doMatch(filepath, pattern, options = {}) {
	let cache = minimatchCache;

	if (options.flipNegate) {
		cache = negatedMinimatchCache;
	}

	let matcher = cache.get(pattern);

	if (!matcher) {
		matcher = new Minimatch(
			pattern,
			Object.assign({}, MINIMATCH_OPTIONS, options),
		);
		cache.set(pattern, matcher);
	}

	return matcher.match(filepath);
}

/**
 * Normalizes a pattern by removing the leading "./" if present.
 * @param {string} pattern The pattern to normalize.
 * @returns {string} The normalized pattern.
 */
function normalizePattern(pattern) {
	if (isString(pattern)) {
		if (pattern.startsWith("./")) {
			return pattern.slice(2);
		}

		if (pattern.startsWith("!./")) {
			return `!${pattern.slice(3)}`;
		}
	}

	return pattern;
}

/**
 * Checks if a given pattern requires normalization.
 * @param {any} pattern The pattern to check.
 * @returns {boolean} True if the pattern needs normalization, false otherwise.
 *
 */
function needsPatternNormalization(pattern) {
	return (
		isString(pattern) &&
		(pattern.startsWith("./") || pattern.startsWith("!./"))
	);
}

/**
 * Normalizes `files` and `ignores` patterns in a config by removing "./" prefixes.
 * @param {Object} config The config object to normalize patterns in.
 * @param {string} namespacedBasePath The namespaced base path of the directory to which config base path is relative.
 * @param {PathImpl} path Path-handling implementation.
 * @returns {Object} The normalized config object.
 */
function normalizeConfigPatterns(config, namespacedBasePath, path) {
	if (!config) {
		return config;
	}

	const hasBasePath = typeof config.basePath === "string";

	let needsNormalization = false;

	if (hasBasePath) {
		needsNormalization = true;
	}

	if (!needsNormalization && Array.isArray(config.files)) {
		needsNormalization = config.files.some(pattern => {
			if (Array.isArray(pattern)) {
				return pattern.some(needsPatternNormalization);
			}
			return needsPatternNormalization(pattern);
		});
	}

	if (!needsNormalization && Array.isArray(config.ignores)) {
		needsNormalization = config.ignores.some(needsPatternNormalization);
	}

	if (!needsNormalization) {
		return config;
	}

	const newConfig = { ...config };

	if (hasBasePath) {
		if (path.isAbsolute(config.basePath)) {
			newConfig.basePath = path.toNamespacedPath(config.basePath);
		} else {
			newConfig.basePath = path.resolve(
				namespacedBasePath,
				config.basePath,
			);
		}
	}

	if (Array.isArray(newConfig.files)) {
		newConfig.files = newConfig.files.map(pattern => {
			if (Array.isArray(pattern)) {
				return pattern.map(normalizePattern);
			}
			return normalizePattern(pattern);
		});
	}

	if (Array.isArray(newConfig.ignores)) {
		newConfig.ignores = newConfig.ignores.map(normalizePattern);
	}

	return newConfig;
}

/**
 * Normalizes a `ConfigArray` by flattening it and executing any functions
 * that are found inside.
 * @param {Array} items The items in a `ConfigArray`.
 * @param {Object} context The context object to pass into any function
 *      found.
 * @param {Array<string>} extraConfigTypes The config types to check.
 * @param {string} namespacedBasePath The namespaced base path of the directory to which config base paths are relative.
 * @param {PathImpl} path Path-handling implementation.
 * @returns {Promise<Array>} A flattened array containing only config objects.
 * @throws {TypeError} When a config function returns a function.
 */
async function normalize(
	items,
	context,
	extraConfigTypes,
	namespacedBasePath,
	path,
) {
	const allowFunctions = extraConfigTypes.includes("function");
	const allowArrays = extraConfigTypes.includes("array");

	async function* flatTraverse(array) {
		for (let item of array) {
			if (typeof item === "function") {
				if (!allowFunctions) {
					throw new TypeError("Unexpected function.");
				}

				item = item(context);
				if (item.then) {
					item = await item;
				}
			}

			if (Array.isArray(item)) {
				if (!allowArrays) {
					throw new TypeError("Unexpected array.");
				}
				yield* flatTraverse(item);
			} else if (typeof item === "function") {
				throw new TypeError(
					"A config function can only return an object or array.",
				);
			} else {
				yield item;
			}
		}
	}

	/*
	 * Async iterables cannot be used with the spread operator, so we need to manually
	 * create the array to return.
	 */
	const asyncIterable = await flatTraverse(items);
	const configs = [];

	for await (const config of asyncIterable) {
		configs.push(normalizeConfigPatterns(config, namespacedBasePath, path));
	}

	return configs;
}

/**
 * Normalizes a `ConfigArray` by flattening it and executing any functions
 * that are found inside.
 * @param {Array} items The items in a `ConfigArray`.
 * @param {Object} context The context object to pass into any function
 *      found.
 * @param {Array<string>} extraConfigTypes The config types to check.
 * @param {string} namespacedBasePath The namespaced base path of the directory to which config base paths are relative.
 * @param {PathImpl} path Path-handling implementation
 * @returns {Array} A flattened array containing only config objects.
 * @throws {TypeError} When a config function returns a function.
 */
function normalizeSync(
	items,
	context,
	extraConfigTypes,
	namespacedBasePath,
	path,
) {
	const allowFunctions = extraConfigTypes.includes("function");
	const allowArrays = extraConfigTypes.includes("array");

	function* flatTraverse(array) {
		for (let item of array) {
			if (typeof item === "function") {
				if (!allowFunctions) {
					throw new TypeError("Unexpected function.");
				}

				item = item(context);
				if (item.then) {
					throw new TypeError(
						"Async config functions are not supported.",
					);
				}
			}

			if (Array.isArray(item)) {
				if (!allowArrays) {
					throw new TypeError("Unexpected array.");
				}

				yield* flatTraverse(item);
			} else if (typeof item === "function") {
				throw new TypeError(
					"A config function can only return an object or array.",
				);
			} else {
				yield item;
			}
		}
	}

	const configs = [];

	for (const config of flatTraverse(items)) {
		configs.push(normalizeConfigPatterns(config, namespacedBasePath, path));
	}

	return configs;
}

/**
 * Converts a given path to a relative path with all separator characters replaced by forward slashes (`"/"`).
 * @param {string} fileOrDirPath The unprocessed path to convert.
 * @param {string} namespacedBasePath The namespaced base path of the directory to which the calculated path shall be relative.
 * @param {PathImpl} path Path-handling implementations.
 * @returns {string} A relative path with all separator characters replaced by forward slashes.
 */
function toRelativePath(fileOrDirPath, namespacedBasePath, path) {
	const fullPath = path.resolve(namespacedBasePath, fileOrDirPath);
	const namespacedFullPath = path.toNamespacedPath(fullPath);
	const relativePath = path.relative(namespacedBasePath, namespacedFullPath);
	return relativePath.replaceAll(path.SEPARATOR, "/");
}

/**
 * Determines if a given file path should be ignored based on the given
 * matcher.
 * @param {Array<{ basePath?: string, ignores: Array<string|((string) => boolean)>}>} configs Configuration objects containing `ignores`.
 * @param {string} filePath The unprocessed file path to check.
 * @param {string} relativeFilePath The path of the file to check relative to the base path,
 * 		using forward slash (`"/"`) as a separator.
 * @param {Object} [basePathData] Additional data needed to recalculate paths for configuration objects
 *  	that have `basePath` property.
 * @param {string} [basePathData.basePath] Namespaced path to witch `relativeFilePath` is relative.
 * @param {PathImpl} [basePathData.path] Path-handling implementation.
 * @returns {boolean} True if the path should be ignored and false if not.
 */
function shouldIgnorePath(
	configs,
	filePath,
	relativeFilePath,
	{ basePath, path } = {},
) {
	let shouldIgnore = false;

	for (const config of configs) {
		let relativeFilePathToCheck = relativeFilePath;
		if (config.basePath) {
			relativeFilePathToCheck = toRelativePath(
				path.resolve(basePath, relativeFilePath),
				config.basePath,
				path,
			);

			if (
				relativeFilePathToCheck === "" ||
				EXTERNAL_PATH_REGEX.test(relativeFilePathToCheck)
			) {
				continue;
			}

			if (relativeFilePath.endsWith("/")) {
				relativeFilePathToCheck += "/";
			}
		}
		shouldIgnore = config.ignores.reduce((ignored, matcher) => {
			if (!ignored) {
				if (typeof matcher === "function") {
					return matcher(filePath);
				}

				// don't check negated patterns because we're not ignored yet
				if (!matcher.startsWith("!")) {
					return doMatch(relativeFilePathToCheck, matcher);
				}

				// otherwise we're still not ignored
				return false;
			}

			// only need to check negated patterns because we're ignored
			if (typeof matcher === "string" && matcher.startsWith("!")) {
				return !doMatch(relativeFilePathToCheck, matcher, {
					flipNegate: true,
				});
			}

			return ignored;
		}, shouldIgnore);
	}

	return shouldIgnore;
}

/**
 * Determines if a given file path is matched by a config. If the config
 * has no `files` field, then it matches; otherwise, if a `files` field
 * is present then we match the globs in `files` and exclude any globs in
 * `ignores`.
 * @param {string} filePath The unprocessed file path to check.
 * @param {string} relativeFilePath The path of the file to check relative to the base path,
 * 		using forward slash (`"/"`) as a separator.
 * @param {Object} config The config object to check.
 * @returns {boolean} True if the file path is matched by the config,
 *      false if not.
 */
function pathMatches(filePath, relativeFilePath, config) {
	// match both strings and functions
	function match(pattern) {
		if (isString(pattern)) {
			return doMatch(relativeFilePath, pattern);
		}

		if (typeof pattern === "function") {
			return pattern(filePath);
		}

		throw new TypeError(`Unexpected matcher type ${pattern}.`);
	}

	// check for all matches to config.files
	let filePathMatchesPattern = config.files.some(pattern => {
		if (Array.isArray(pattern)) {
			return pattern.every(match);
		}

		return match(pattern);
	});

	/*
	 * If the file path matches the config.files patterns, then check to see
	 * if there are any files to ignore.
	 */
	if (filePathMatchesPattern && config.ignores) {
		/*
		 * Pass config object without `basePath`, because `relativeFilePath` is already
		 * calculated as relative to it.
		 */
		filePathMatchesPattern = !shouldIgnorePath(
			[{ ignores: config.ignores }],
			filePath,
			relativeFilePath,
		);
	}

	return filePathMatchesPattern;
}

/**
 * Ensures that a ConfigArray has been normalized.
 * @param {ConfigArray} configArray The ConfigArray to check.
 * @returns {void}
 * @throws {Error} When the `ConfigArray` is not normalized.
 */
function assertNormalized(configArray) {
	// TODO: Throw more verbose error
	if (!configArray.isNormalized()) {
		throw new Error(
			"ConfigArray must be normalized to perform this operation.",
		);
	}
}

/**
 * Ensures that config types are valid.
 * @param {Array<string>} extraConfigTypes The config types to check.
 * @returns {void}
 * @throws {TypeError} When the config types array is invalid.
 */
function assertExtraConfigTypes(extraConfigTypes) {
	if (extraConfigTypes.length > 2) {
		throw new TypeError(
			"configTypes must be an array with at most two items.",
		);
	}

	for (const configType of extraConfigTypes) {
		if (!CONFIG_TYPES.has(configType)) {
			throw new TypeError(
				`Unexpected config type "${configType}" found. Expected one of: "object", "array", "function".`,
			);
		}
	}
}

/**
 * Returns path-handling implementations for Unix or Windows, depending on a given absolute path.
 * @param {string} fileOrDirPath The absolute path to check.
 * @returns {PathImpl} Path-handling implementations for the specified path.
 * @throws {Error} An error is thrown if the specified argument is not an absolute path.
 */
function getPathImpl(fileOrDirPath) {
	// Posix absolute paths always start with a slash.
	if (fileOrDirPath.startsWith("/")) {
		return posixPath__namespace;
	}

	// Windows absolute paths start with a letter followed by a colon and at least one backslash,
	// or with two backslashes in the case of UNC paths.
	// Forward slashed are automatically normalized to backslashes.
	if (/^(?:[A-Za-z]:[/\\]|[/\\]{2})/u.test(fileOrDirPath)) {
		return windowsPath__namespace;
	}

	throw new Error(
		`Expected an absolute path but received "${fileOrDirPath}"`,
	);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

const ConfigArraySymbol = {
	isNormalized: Symbol("isNormalized"),
	configCache: Symbol("configCache"),
	schema: Symbol("schema"),
	finalizeConfig: Symbol("finalizeConfig"),
	preprocessConfig: Symbol("preprocessConfig"),
};

// used to store calculate data for faster lookup
const dataCache = new WeakMap();

/**
 * Represents an array of config objects and provides method for working with
 * those config objects.
 */
class ConfigArray extends Array {
	/**
	 * The namespaced path of the config file directory.
	 * @type {string}
	 */
	#namespacedBasePath;

	/**
	 * Path-handling implementations.
	 * @type {PathImpl}
	 */
	#path;

	/**
	 * Creates a new instance of ConfigArray.
	 * @param {Iterable|Function|Object} configs An iterable yielding config
	 *      objects, or a config function, or a config object.
	 * @param {Object} options The options for the ConfigArray.
	 * @param {string} [options.basePath="/"] The absolute path of the config file directory.
	 * 		Defaults to `"/"`.
	 * @param {boolean} [options.normalized=false] Flag indicating if the
	 *      configs have already been normalized.
	 * @param {Object} [options.schema] The additional schema
	 *      definitions to use for the ConfigArray schema.
	 * @param {Array<string>} [options.extraConfigTypes] List of config types supported.
	 * @throws {TypeError} When the `basePath` is not a non-empty string,
	 */
	constructor(
		configs,
		{
			basePath = "/",
			normalized = false,
			schema: customSchema,
			extraConfigTypes = [],
		} = {},
	) {
		super();

		/**
		 * Tracks if the array has been normalized.
		 * @property isNormalized
		 * @type {boolean}
		 * @private
		 */
		this[ConfigArraySymbol.isNormalized] = normalized;

		/**
		 * The schema used for validating and merging configs.
		 * @property schema
		 * @type {ObjectSchemaInstance}
		 * @private
		 */
		this[ConfigArraySymbol.schema] = new objectSchema.ObjectSchema(
			Object.assign({}, customSchema, baseSchema),
		);

		if (!isString(basePath) || !basePath) {
			throw new TypeError("basePath must be a non-empty string");
		}

		/**
		 * The path of the config file that this array was loaded from.
		 * This is used to calculate filename matches.
		 * @property basePath
		 * @type {string}
		 */
		this.basePath = basePath;

		assertExtraConfigTypes(extraConfigTypes);

		/**
		 * The supported config types.
		 * @type {Array<string>}
		 */
		this.extraConfigTypes = [...extraConfigTypes];
		Object.freeze(this.extraConfigTypes);

		/**
		 * A cache to store calculated configs for faster repeat lookup.
		 * @property configCache
		 * @type {Map<string, Object>}
		 * @private
		 */
		this[ConfigArraySymbol.configCache] = new Map();

		// init cache
		dataCache.set(this, {
			explicitMatches: new Map(),
			directoryMatches: new Map(),
			files: undefined,
			ignores: undefined,
		});

		// load the configs into this array
		if (Array.isArray(configs)) {
			this.push(...configs);
		} else {
			this.push(configs);
		}

		// select path-handling implementations depending on the base path
		this.#path = getPathImpl(basePath);

		// On Windows, `path.relative()` returns an absolute path when given two paths on different drives.
		// The namespaced base path is useful to make sure that calculated relative paths are always relative.
		// On Unix, it is identical to the base path.
		this.#namespacedBasePath = this.#path.toNamespacedPath(basePath);
	}

	/**
	 * Prevent normal array methods from creating a new `ConfigArray` instance.
	 * This is to ensure that methods such as `slice()` won't try to create a
	 * new instance of `ConfigArray` behind the scenes as doing so may throw
	 * an error due to the different constructor signature.
	 * @type {ArrayConstructor} The `Array` constructor.
	 */
	static get [Symbol.species]() {
		return Array;
	}

	/**
	 * Returns the `files` globs from every config object in the array.
	 * This can be used to determine which files will be matched by a
	 * config array or to use as a glob pattern when no patterns are provided
	 * for a command line interface.
	 * @returns {Array<string|Function>} An array of matchers.
	 */
	get files() {
		assertNormalized(this);

		// if this data has been cached, retrieve it
		const cache = dataCache.get(this);

		if (cache.files) {
			return cache.files;
		}

		// otherwise calculate it

		const result = [];

		for (const config of this) {
			if (config.files) {
				config.files.forEach(filePattern => {
					result.push(filePattern);
				});
			}
		}

		// store result
		cache.files = result;
		dataCache.set(this, cache);

		return result;
	}

	/**
	 * Returns ignore matchers that should always be ignored regardless of
	 * the matching `files` fields in any configs. This is necessary to mimic
	 * the behavior of things like .gitignore and .eslintignore, allowing a
	 * globbing operation to be faster.
	 * @returns {Object[]} An array of config objects representing global ignores.
	 */
	get ignores() {
		assertNormalized(this);

		// if this data has been cached, retrieve it
		const cache = dataCache.get(this);

		if (cache.ignores) {
			return cache.ignores;
		}

		// otherwise calculate it

		const result = [];

		for (const config of this) {
			/*
			 * We only count ignores if there are no other keys in the object.
			 * In this case, it acts list a globally ignored pattern. If there
			 * are additional keys, then ignores act like exclusions.
			 */
			if (
				config.ignores &&
				Object.keys(config).filter(key => !META_FIELDS.has(key))
					.length === 1
			) {
				result.push(config);
			}
		}

		// store result
		cache.ignores = result;
		dataCache.set(this, cache);

		return result;
	}

	/**
	 * Indicates if the config array has been normalized.
	 * @returns {boolean} True if the config array is normalized, false if not.
	 */
	isNormalized() {
		return this[ConfigArraySymbol.isNormalized];
	}

	/**
	 * Normalizes a config array by flattening embedded arrays and executing
	 * config functions.
	 * @param {Object} [context] The context object for config functions.
	 * @returns {Promise<ConfigArray>} The current ConfigArray instance.
	 */
	async normalize(context = {}) {
		if (!this.isNormalized()) {
			const normalizedConfigs = await normalize(
				this,
				context,
				this.extraConfigTypes,
				this.#namespacedBasePath,
				this.#path,
			);
			this.length = 0;
			this.push(
				...normalizedConfigs.map(
					this[ConfigArraySymbol.preprocessConfig].bind(this),
				),
			);
			this.forEach(assertValidBaseConfig);
			this[ConfigArraySymbol.isNormalized] = true;

			// prevent further changes
			Object.freeze(this);
		}

		return this;
	}

	/**
	 * Normalizes a config array by flattening embedded arrays and executing
	 * config functions.
	 * @param {Object} [context] The context object for config functions.
	 * @returns {ConfigArray} The current ConfigArray instance.
	 */
	normalizeSync(context = {}) {
		if (!this.isNormalized()) {
			const normalizedConfigs = normalizeSync(
				this,
				context,
				this.extraConfigTypes,
				this.#namespacedBasePath,
				this.#path,
			);
			this.length = 0;
			this.push(
				...normalizedConfigs.map(
					this[ConfigArraySymbol.preprocessConfig].bind(this),
				),
			);
			this.forEach(assertValidBaseConfig);
			this[ConfigArraySymbol.isNormalized] = true;

			// prevent further changes
			Object.freeze(this);
		}

		return this;
	}

	/* eslint-disable class-methods-use-this -- Desired as instance methods */

	/**
	 * Finalizes the state of a config before being cached and returned by
	 * `getConfig()`. Does nothing by default but is provided to be
	 * overridden by subclasses as necessary.
	 * @param {Object} config The config to finalize.
	 * @returns {Object} The finalized config.
	 */
	[ConfigArraySymbol.finalizeConfig](config) {
		return config;
	}

	/**
	 * Preprocesses a config during the normalization process. This is the
	 * method to override if you want to convert an array item before it is
	 * validated for the first time. For example, if you want to replace a
	 * string with an object, this is the method to override.
	 * @param {Object} config The config to preprocess.
	 * @returns {Object} The config to use in place of the argument.
	 */
	[ConfigArraySymbol.preprocessConfig](config) {
		return config;
	}

	/* eslint-enable class-methods-use-this -- Desired as instance methods */

	/**
	 * Returns the config object for a given file path and a status that can be used to determine why a file has no config.
	 * @param {string} filePath The path of a file to get a config for.
	 * @returns {{ config?: Object, status: "ignored"|"external"|"unconfigured"|"matched" }}
	 * An object with an optional property `config` and property `status`.
	 * `config` is the config object for the specified file as returned by {@linkcode ConfigArray.getConfig},
	 * `status` a is one of the constants returned by {@linkcode ConfigArray.getConfigStatus}.
	 */
	getConfigWithStatus(filePath) {
		assertNormalized(this);

		const cache = this[ConfigArraySymbol.configCache];

		// first check the cache for a filename match to avoid duplicate work
		if (cache.has(filePath)) {
			return cache.get(filePath);
		}

		// check to see if the file is outside the base path

		const relativeToBaseFilePath = toRelativePath(
			filePath,
			this.#namespacedBasePath,
			this.#path,
		);

		if (EXTERNAL_PATH_REGEX.test(relativeToBaseFilePath)) {
			debug(`No config for file ${filePath} outside of base path`);

			// cache and return result
			cache.set(filePath, CONFIG_WITH_STATUS_EXTERNAL);
			return CONFIG_WITH_STATUS_EXTERNAL;
		}

		// next check to see if the file should be ignored

		// check if this should be ignored due to its directory
		if (this.isDirectoryIgnored(this.#path.dirname(filePath))) {
			debug(`Ignoring ${filePath} based on directory pattern`);

			// cache and return result
			cache.set(filePath, CONFIG_WITH_STATUS_IGNORED);
			return CONFIG_WITH_STATUS_IGNORED;
		}

		if (
			shouldIgnorePath(this.ignores, filePath, relativeToBaseFilePath, {
				basePath: this.#namespacedBasePath,
				path: this.#path,
			})
		) {
			debug(`Ignoring ${filePath} based on file pattern`);

			// cache and return result
			cache.set(filePath, CONFIG_WITH_STATUS_IGNORED);
			return CONFIG_WITH_STATUS_IGNORED;
		}

		// filePath isn't automatically ignored, so try to construct config

		const matchingConfigIndices = [];
		let matchFound = false;
		const universalPattern = /^\*$|^!|\/\*{1,2}$/u;

		this.forEach((config, index) => {
			const relativeFilePath = config.basePath
				? toRelativePath(
						this.#path.resolve(this.#namespacedBasePath, filePath),
						config.basePath,
						this.#path,
					)
				: relativeToBaseFilePath;

			if (config.basePath && EXTERNAL_PATH_REGEX.test(relativeFilePath)) {
				debug(
					`Skipped config found for ${filePath} (based on config's base path: ${config.basePath}`,
				);
				return;
			}

			if (!config.files) {
				if (!config.ignores) {
					debug(`Universal config found for ${filePath}`);
					matchingConfigIndices.push(index);
					return;
				}

				if (
					Object.keys(config).filter(key => !META_FIELDS.has(key))
						.length === 1
				) {
					debug(
						`Skipped config found for ${filePath} (global ignores)`,
					);
					return;
				}

				/*
				 * Pass config object without `basePath`, because `relativeFilePath` is already
				 * calculated as relative to it.
				 */
				if (
					shouldIgnorePath(
						[{ ignores: config.ignores }],
						filePath,
						relativeFilePath,
					)
				) {
					debug(
						`Skipped config found for ${filePath} (based on ignores: ${config.ignores})`,
					);
					return;
				}

				debug(
					`Matching config found for ${filePath} (based on ignores: ${config.ignores})`,
				);
				matchingConfigIndices.push(index);
				return;
			}

			/*
			 * If a config has a files pattern * or patterns ending in /** or /*,
			 * and the filePath only matches those patterns, then the config is only
			 * applied if there is another config where the filePath matches
			 * a file with a specific extensions such as *.js.
			 */

			const nonUniversalFiles = [];
			const universalFiles = config.files.filter(element => {
				if (Array.isArray(element)) {
					/*
					 * filePath matches an element that is an array only if it matches
					 * all patterns in it (AND operation). Therefore, if there is at least
					 * one non-universal pattern in the array, and filePath matches the array,
					 * then we know for sure that filePath matches at least one non-universal
					 * pattern, so we can consider the entire array to be non-universal.
					 * In other words, all patterns in the array need to be universal
					 * for it to be considered universal.
					 */
					if (
						element.every(pattern => universalPattern.test(pattern))
					) {
						return true;
					}

					nonUniversalFiles.push(element);
					return false;
				}

				// element is a string

				if (universalPattern.test(element)) {
					return true;
				}

				nonUniversalFiles.push(element);
				return false;
			});

			// universal patterns were found so we need to check the config twice
			if (universalFiles.length) {
				debug("Universal files patterns found. Checking carefully.");

				// check that the config matches without the non-universal files first
				if (
					nonUniversalFiles.length &&
					pathMatches(filePath, relativeFilePath, {
						files: nonUniversalFiles,
						ignores: config.ignores,
					})
				) {
					debug(`Matching config found for ${filePath}`);
					matchingConfigIndices.push(index);
					matchFound = true;
					return;
				}

				// if there wasn't a match then check if it matches with universal files
				if (
					universalFiles.length &&
					pathMatches(filePath, relativeFilePath, {
						files: universalFiles,
						ignores: config.ignores,
					})
				) {
					debug(`Matching config found for ${filePath}`);
					matchingConfigIndices.push(index);
					return;
				}

				// if we make here, then there was no match
				return;
			}

			// the normal case
			if (pathMatches(filePath, relativeFilePath, config)) {
				debug(`Matching config found for ${filePath}`);
				matchingConfigIndices.push(index);
				matchFound = true;
			}
		});

		// if matching both files and ignores, there will be no config to create
		if (!matchFound) {
			debug(`No matching configs found for ${filePath}`);

			// cache and return result
			cache.set(filePath, CONFIG_WITH_STATUS_UNCONFIGURED);
			return CONFIG_WITH_STATUS_UNCONFIGURED;
		}

		// check to see if there is a config cached by indices
		const indicesKey = matchingConfigIndices.toString();
		let configWithStatus = cache.get(indicesKey);

		if (configWithStatus) {
			// also store for filename for faster lookup next time
			cache.set(filePath, configWithStatus);

			return configWithStatus;
		}

		// otherwise construct the config

		// eslint-disable-next-line array-callback-return, consistent-return -- rethrowConfigError always throws an error
		let finalConfig = matchingConfigIndices.reduce((result, index) => {
			try {
				return this[ConfigArraySymbol.schema].merge(
					result,
					this[index],
				);
			} catch (validationError) {
				rethrowConfigError(this[index], index, validationError);
			}
		}, {});

		finalConfig = this[ConfigArraySymbol.finalizeConfig](finalConfig);

		configWithStatus = Object.freeze({
			config: finalConfig,
			status: "matched",
		});
		cache.set(filePath, configWithStatus);
		cache.set(indicesKey, configWithStatus);

		return configWithStatus;
	}

	/**
	 * Returns the config object for a given file path.
	 * @param {string} filePath The path of a file to get a config for.
	 * @returns {Object|undefined} The config object for this file or `undefined`.
	 */
	getConfig(filePath) {
		return this.getConfigWithStatus(filePath).config;
	}

	/**
	 * Determines whether a file has a config or why it doesn't.
	 * @param {string} filePath The path of the file to check.
	 * @returns {"ignored"|"external"|"unconfigured"|"matched"} One of the following values:
	 * * `"ignored"`: the file is ignored
	 * * `"external"`: the file is outside the base path
	 * * `"unconfigured"`: the file is not matched by any config
	 * * `"matched"`: the file has a matching config
	 */
	getConfigStatus(filePath) {
		return this.getConfigWithStatus(filePath).status;
	}

	/**
	 * Determines if the given filepath is ignored based on the configs.
	 * @param {string} filePath The path of a file to check.
	 * @returns {boolean} True if the path is ignored, false if not.
	 * @deprecated Use `isFileIgnored` instead.
	 */
	isIgnored(filePath) {
		return this.isFileIgnored(filePath);
	}

	/**
	 * Determines if the given filepath is ignored based on the configs.
	 * @param {string} filePath The path of a file to check.
	 * @returns {boolean} True if the path is ignored, false if not.
	 */
	isFileIgnored(filePath) {
		return this.getConfigStatus(filePath) === "ignored";
	}

	/**
	 * Determines if the given directory is ignored based on the configs.
	 * This checks only default `ignores` that don't have `files` in the
	 * same config. A pattern such as `/foo` be considered to ignore the directory
	 * while a pattern such as `/foo/**` is not considered to ignore the
	 * directory because it is matching files.
	 * @param {string} directoryPath The path of a directory to check.
	 * @returns {boolean} True if the directory is ignored, false if not. Will
	 * 		return true for any directory that is not inside of `basePath`.
	 * @throws {Error} When the `ConfigArray` is not normalized.
	 */
	isDirectoryIgnored(directoryPath) {
		assertNormalized(this);

		const relativeDirectoryPath = toRelativePath(
			directoryPath,
			this.#namespacedBasePath,
			this.#path,
		);

		// basePath directory can never be ignored
		if (relativeDirectoryPath === "") {
			return false;
		}

		if (EXTERNAL_PATH_REGEX.test(relativeDirectoryPath)) {
			return true;
		}

		// first check the cache
		const cache = dataCache.get(this).directoryMatches;

		if (cache.has(relativeDirectoryPath)) {
			return cache.get(relativeDirectoryPath);
		}

		const directoryParts = relativeDirectoryPath.split("/");
		let relativeDirectoryToCheck = "";
		let result;

		/*
		 * In order to get the correct gitignore-style ignores, where an
		 * ignored parent directory cannot have any descendants unignored,
		 * we need to check every directory starting at the parent all
		 * the way down to the actual requested directory.
		 *
		 * We aggressively cache all of this info to make sure we don't
		 * have to recalculate everything for every call.
		 */
		do {
			relativeDirectoryToCheck += `${directoryParts.shift()}/`;

			result = shouldIgnorePath(
				this.ignores,
				this.#path.join(this.basePath, relativeDirectoryToCheck),
				relativeDirectoryToCheck,
				{
					basePath: this.#namespacedBasePath,
					path: this.#path,
				},
			);

			cache.set(relativeDirectoryToCheck, result);
		} while (!result && directoryParts.length);

		// also cache the result for the requested path
		cache.set(relativeDirectoryPath, result);

		return result;
	}
}

Object.defineProperty(exports, "ObjectSchema", {
	enumerable: true,
	get: function () { return objectSchema.ObjectSchema; }
});
exports.ConfigArray = ConfigArray;
exports.ConfigArraySymbol = ConfigArraySymbol;


'use strict';

/**
 * @fileoverview defineConfig helper
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("eslint").Linter.Config} Config */
/** @typedef {import("eslint").Linter.LegacyConfig} LegacyConfig */
/** @typedef {import("eslint").ESLint.Plugin} Plugin */
/** @typedef {import("eslint").Linter.RuleEntry} RuleEntry */
/** @typedef {import("./types.ts").ExtendsElement} ExtendsElement */
/** @typedef {import("./types.ts").SimpleExtendsElement} SimpleExtendsElement */
/** @typedef {import("./types.ts").ConfigWithExtends} ConfigWithExtends */
/** @typedef {import("./types.ts").InfiniteArray<Config>} InfiniteConfigArray */
/** @typedef {import("./types.ts").ConfigWithExtendsArray} ConfigWithExtendsArray */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const eslintrcKeys = [
	"env",
	"extends",
	"globals",
	"ignorePatterns",
	"noInlineConfig",
	"overrides",
	"parser",
	"parserOptions",
	"reportUnusedDisableDirectives",
	"root",
];

const allowedGlobalIgnoreKeys = new Set(["basePath", "ignores", "name"]);

/**
 * Gets the name of a config object.
 * @param {Config} config The config object.
 * @param {string} indexPath The index path of the config object.
 * @return {string} The name of the config object.
 */
function getConfigName(config, indexPath) {
	if (config.name) {
		return config.name;
	}

	return `UserConfig${indexPath}`;
}

/**
 * Gets the name of an extension.
 * @param {SimpleExtendsElement} extension The extension.
 * @param {string} indexPath The index of the extension.
 * @return {string} The name of the extension.
 */
function getExtensionName(extension, indexPath) {
	if (typeof extension === "string") {
		return extension;
	}

	if (extension.name) {
		return extension.name;
	}

	return `ExtendedConfig${indexPath}`;
}

/**
 * Determines if a config object is a legacy config.
 * @param {Config|LegacyConfig} config The config object to check.
 * @return {config is LegacyConfig} `true` if the config object is a legacy config.
 */
function isLegacyConfig(config) {
	for (const key of eslintrcKeys) {
		if (key in config) {
			return true;
		}
	}

	return false;
}

/**
 * Determines if a config object is a global ignores config.
 * @param {Config} config The config object to check.
 * @return {boolean} `true` if the config object is a global ignores config.
 */
function isGlobalIgnores(config) {
	return Object.keys(config).every(key => allowedGlobalIgnoreKeys.has(key));
}

/**
 * Parses a plugin member ID (rule, processor, etc.) and returns
 * the namespace and member name.
 * @param {string} id The ID to parse.
 * @returns {{namespace:string, name:string}} The namespace and member name.
 */
function getPluginMember(id) {
	const firstSlashIndex = id.indexOf("/");

	if (firstSlashIndex === -1) {
		return { namespace: "", name: id };
	}

	let namespace = id.slice(0, firstSlashIndex);

	/*
	 * Special cases:
	 * 1. The namespace is `@`, that means it's referring to the
	 *    core plugin so `@` is the full namespace.
	 * 2. The namespace starts with `@`, that means it's referring to
	 *    an npm scoped package. That means the namespace is the scope
	 *    and the package name (i.e., `@eslint/core`).
	 */
	if (namespace[0] === "@" && namespace !== "@") {
		const secondSlashIndex = id.indexOf("/", firstSlashIndex + 1);
		if (secondSlashIndex !== -1) {
			namespace = id.slice(0, secondSlashIndex);
			return { namespace, name: id.slice(secondSlashIndex + 1) };
		}
	}

	const name = id.slice(firstSlashIndex + 1);

	return { namespace, name };
}

/**
 * Normalizes the plugin config by replacing the namespace with the plugin namespace.
 * @param {string} userNamespace The namespace of the plugin.
 * @param {Plugin} plugin The plugin config object.
 * @param {Config} config The config object to normalize.
 * @return {Config} The normalized config object.
 */
function normalizePluginConfig(userNamespace, plugin, config) {
	const pluginNamespace = plugin.meta?.namespace;

	// don't do anything if the plugin doesn't have a namespace or rules
	if (
		!pluginNamespace ||
		pluginNamespace === userNamespace ||
		(!config.rules && !config.processor && !config.language)
	) {
		return config;
	}

	const result = { ...config };

	// update the rules
	if (result.rules) {
		const ruleIds = Object.keys(result.rules);

		/** @type {Record<string,RuleEntry|undefined>} */
		const newRules = {};

		for (let i = 0; i < ruleIds.length; i++) {
			const ruleId = ruleIds[i];
			const { namespace: ruleNamespace, name: ruleName } =
				getPluginMember(ruleId);

			if (ruleNamespace === pluginNamespace) {
				newRules[`${userNamespace}/${ruleName}`] = result.rules[ruleId];
			} else {
				newRules[ruleId] = result.rules[ruleId];
			}
		}

		result.rules = newRules;
	}

	// update the processor

	if (typeof result.processor === "string") {
		const { namespace: processorNamespace, name: processorName } =
			getPluginMember(result.processor);

		if (processorNamespace) {
			if (processorNamespace === pluginNamespace) {
				result.processor = `${userNamespace}/${processorName}`;
			}
		}
	}

	// update the language
	if (typeof result.language === "string") {
		const { namespace: languageNamespace, name: languageName } =
			getPluginMember(result.language);

		if (languageNamespace === pluginNamespace) {
			result.language = `${userNamespace}/${languageName}`;
		}
	}

	return result;
}

/**
 * Deeply normalizes a plugin config, traversing recursively into an arrays.
 * @param {string} userPluginNamespace The namespace of the plugin.
 * @param {Plugin} plugin The plugin object.
 * @param {Config|LegacyConfig|(Config|LegacyConfig)[]} pluginConfig The plugin config to normalize.
 * @param {string} pluginConfigName The name of the plugin config.
 * @return {InfiniteConfigArray} The normalized plugin config.
 * @throws {TypeError} If the plugin config is a legacy config.
 */
function deepNormalizePluginConfig(
	userPluginNamespace,
	plugin,
	pluginConfig,
	pluginConfigName,
) {
	// if it's an array then it's definitely a new config
	if (Array.isArray(pluginConfig)) {
		return pluginConfig.map(pluginSubConfig =>
			deepNormalizePluginConfig(
				userPluginNamespace,
				plugin,
				pluginSubConfig,
				pluginConfigName,
			),
		);
	}

	// if it's a legacy config, throw an error
	if (isLegacyConfig(pluginConfig)) {
		throw new TypeError(
			`Plugin config "${pluginConfigName}" is an eslintrc config and cannot be used in this context.`,
		);
	}

	return normalizePluginConfig(userPluginNamespace, plugin, pluginConfig);
}

/**
 * Finds a plugin config by name in the given config.
 * @param {Config} config The config object.
 * @param {string} pluginConfigName The name of the plugin config.
 * @return {InfiniteConfigArray} The plugin config.
 * @throws {TypeError} If the plugin config is not found or is a legacy config.
 */
function findPluginConfig(config, pluginConfigName) {
	const { namespace: userPluginNamespace, name: configName } =
		getPluginMember(pluginConfigName);
	const plugin = config.plugins?.[userPluginNamespace];

	if (!plugin) {
		throw new TypeError(`Plugin "${userPluginNamespace}" not found.`);
	}

	const directConfig = plugin.configs?.[configName];
	if (directConfig) {
		// Arrays are always flat configs, and non-legacy configs can be used directly
		if (Array.isArray(directConfig) || !isLegacyConfig(directConfig)) {
			return deepNormalizePluginConfig(
				userPluginNamespace,
				plugin,
				directConfig,
				pluginConfigName,
			);
		}

		// If it's a legacy config, look for the flat version
		const flatConfig = plugin.configs?.[`flat/${configName}`];

		if (
			flatConfig &&
			(Array.isArray(flatConfig) || !isLegacyConfig(flatConfig))
		) {
			return deepNormalizePluginConfig(
				userPluginNamespace,
				plugin,
				flatConfig,
				pluginConfigName,
			);
		}

		throw new TypeError(
			`Plugin config "${configName}" in plugin "${userPluginNamespace}" is an eslintrc config and cannot be used in this context.`,
		);
	}

	throw new TypeError(
		`Plugin config "${configName}" not found in plugin "${userPluginNamespace}".`,
	);
}

/**
 * Flattens an array while keeping track of the index path.
 * @param {any[]} configList The array to traverse.
 * @param {string} indexPath The index path of the value in a multidimensional array.
 * @return {IterableIterator<{indexPath:string, value:any}>} The flattened list of values.
 */
function* flatTraverse(configList, indexPath = "") {
	for (let i = 0; i < configList.length; i++) {
		const newIndexPath = indexPath ? `${indexPath}[${i}]` : `[${i}]`;

		// if it's an array then traverse it as well
		if (Array.isArray(configList[i])) {
			yield* flatTraverse(configList[i], newIndexPath);
			continue;
		}

		yield { indexPath: newIndexPath, value: configList[i] };
	}
}

/**
 * Extends a list of config files by creating every combination of base and extension files.
 * @param {(string|string[])[]} [baseFiles] The base files.
 * @param {(string|string[])[]} [extensionFiles] The extension files.
 * @return {(string|string[])[]} The extended files.
 */
function extendConfigFiles(baseFiles = [], extensionFiles = []) {
	if (!extensionFiles.length) {
		return baseFiles.concat();
	}

	if (!baseFiles.length) {
		return extensionFiles.concat();
	}

	/** @type {(string|string[])[]} */
	const result = [];

	for (const baseFile of baseFiles) {
		for (const extensionFile of extensionFiles) {
			/*
			 * Each entry can be a string or array of strings. The end result
			 * needs to be an array of strings, so we need to be sure to include
			 * all of the items when there's an array.
			 */

			const entry = [];

			if (Array.isArray(baseFile)) {
				entry.push(...baseFile);
			} else {
				entry.push(baseFile);
			}

			if (Array.isArray(extensionFile)) {
				entry.push(...extensionFile);
			} else {
				entry.push(extensionFile);
			}

			result.push(entry);
		}
	}

	return result;
}

/**
 * Extends a config object with another config object.
 * @param {Config} baseConfig The base config object.
 * @param {string} baseConfigName The name of the base config object.
 * @param {Config} extension The extension config object.
 * @param {string} extensionName The index of the extension config object.
 * @return {Config} The extended config object.
 */
function extendConfig(baseConfig, baseConfigName, extension, extensionName) {
	const result = { ...extension };

	// for global ignores there is no further work to be done, we just keep everything
	if (!isGlobalIgnores(extension)) {
		// for files we need to create every combination of base and extension files
		if (baseConfig.files) {
			result.files = extendConfigFiles(baseConfig.files, extension.files);
		}

		// for ignores we just concatenation the extension ignores onto the base ignores
		if (baseConfig.ignores) {
			result.ignores = baseConfig.ignores.concat(extension.ignores ?? []);
		}
	}

	result.name = `${baseConfigName} > ${extensionName}`;

	// @ts-ignore -- ESLint types aren't updated yet
	if (baseConfig.basePath) {
		// @ts-ignore -- ESLint types aren't updated yet
		result.basePath = baseConfig.basePath;
	}

	return result;
}

/**
 * Processes a list of extends elements.
 * @param {ConfigWithExtends} config The config object.
 * @param {WeakMap<Config, string>} configNames The map of config objects to their names.
 * @return {Config[]} The flattened list of config objects.
 * @throws {TypeError} If the `extends` property is not an array or if nested `extends` is found.
 */
function processExtends(config, configNames) {
	if (!config.extends) {
		return [config];
	}

	if (!Array.isArray(config.extends)) {
		throw new TypeError("The `extends` property must be an array.");
	}

	const {
		/** @type {Config[]} */
		extends: extendsList,

		/** @type {Config} */
		...configObject
	} = config;

	const extensionNames = new WeakMap();

	// replace strings with the actual configs
	const objectExtends = extendsList.map(extendsElement => {
		if (typeof extendsElement === "string") {
			const pluginConfig = findPluginConfig(config, extendsElement);

			// assign names
			if (Array.isArray(pluginConfig)) {
				pluginConfig.forEach((pluginConfigElement, index) => {
					extensionNames.set(
						pluginConfigElement,
						`${extendsElement}[${index}]`,
					);
				});
			} else {
				extensionNames.set(pluginConfig, extendsElement);
			}

			return pluginConfig;
		}

		return /** @type {Config} */ (extendsElement);
	});

	const result = [];

	for (const { indexPath, value: extendsElement } of flatTraverse(
		objectExtends,
	)) {
		const extension = /** @type {Config} */ (extendsElement);

		if ("basePath" in extension) {
			throw new TypeError("'basePath' in `extends` is not allowed.");
		}

		if ("extends" in extension) {
			throw new TypeError("Nested 'extends' is not allowed.");
		}

		const baseConfigName = /** @type {string} */ (configNames.get(config));
		const extensionName =
			extensionNames.get(extendsElement) ??
			getExtensionName(extendsElement, indexPath);

		result.push(
			extendConfig(
				configObject,
				baseConfigName,
				extension,
				extensionName,
			),
		);
	}

	/*
	 * If the base config object has only `ignores` and `extends`, then
	 * removing `extends` turns it into a global ignores, which is not what
	 * we want. So we need to check if the base config object is a global ignores
	 * and if so, we don't add it to the array.
	 *
	 * (The other option would be to add a `files` entry, but that would result
	 * in a config that didn't actually do anything because there are no
	 * other keys in the config.)
	 */
	if (!isGlobalIgnores(configObject)) {
		result.push(configObject);
	}

	return result.flat();
}

/**
 * Processes a list of config objects and arrays.
 * @param {ConfigWithExtends[]} configList The list of config objects and arrays.
 * @param {WeakMap<Config, string>} configNames The map of config objects to their names.
 * @return {Config[]} The flattened list of config objects.
 */
function processConfigList(configList, configNames) {
	return configList.flatMap(config => processExtends(config, configNames));
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Helper function to define a config array.
 * @param {ConfigWithExtendsArray} args The arguments to the function.
 * @returns {Config[]} The config array.
 * @throws {TypeError} If no arguments are provided or if an argument is not an object.
 */
function defineConfig(...args) {
	const configNames = new WeakMap();
	const configs = [];

	if (args.length === 0) {
		throw new TypeError("Expected one or more arguments.");
	}

	// first flatten the list of configs and get the names
	for (const { indexPath, value } of flatTraverse(args)) {
		if (typeof value !== "object" || value === null) {
			throw new TypeError(
				`Expected an object but received ${String(value)}.`,
			);
		}

		const config = /** @type {ConfigWithExtends} */ (value);

		// save config name for easy reference later
		configNames.set(config, getConfigName(config, indexPath));
		configs.push(config);
	}

	return processConfigList(configs, configNames);
}

/**
 * @fileoverview Global ignores helper function.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

let globalIgnoreCount = 0;

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Creates a global ignores config with the given patterns.
 * @param {string[]} ignorePatterns The ignore patterns.
 * @param {string} [name] The name of the global ignores config.
 * @returns {Config} The global ignores config.
 * @throws {TypeError} If ignorePatterns is not an array or if it is empty.
 */
function globalIgnores(ignorePatterns, name) {
	if (!Array.isArray(ignorePatterns)) {
		throw new TypeError("ignorePatterns must be an array");
	}

	if (ignorePatterns.length === 0) {
		throw new TypeError("ignorePatterns must contain at least one pattern");
	}

	const id = globalIgnoreCount++;

	return {
		name: name || `globalIgnores ${id}`,
		ignores: ignorePatterns,
	};
}

exports.defineConfig = defineConfig;
exports.globalIgnores = globalIgnores;


'use strict';

/**
 * @fileoverview Merge Strategy
 */

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

/**
 * Container class for several different merge strategies.
 */
class MergeStrategy {
	/**
	 * Merges two keys by overwriting the first with the second.
	 * @param {*} value1 The value from the first object key.
	 * @param {*} value2 The value from the second object key.
	 * @returns {*} The second value.
	 */
	static overwrite(value1, value2) {
		return value2;
	}

	/**
	 * Merges two keys by replacing the first with the second only if the
	 * second is defined.
	 * @param {*} value1 The value from the first object key.
	 * @param {*} value2 The value from the second object key.
	 * @returns {*} The second value if it is defined.
	 */
	static replace(value1, value2) {
		if (typeof value2 !== "undefined") {
			return value2;
		}

		return value1;
	}

	/**
	 * Merges two properties by assigning properties from the second to the first.
	 * @param {*} value1 The value from the first object key.
	 * @param {*} value2 The value from the second object key.
	 * @returns {*} A new object containing properties from both value1 and
	 *      value2.
	 */
	static assign(value1, value2) {
		return Object.assign({}, value1, value2);
	}
}

/**
 * @fileoverview Validation Strategy
 */

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

/**
 * Container class for several different validation strategies.
 */
class ValidationStrategy {
	/**
	 * Validates that a value is an array.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static array(value) {
		if (!Array.isArray(value)) {
			throw new TypeError("Expected an array.");
		}
	}

	/**
	 * Validates that a value is a boolean.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static boolean(value) {
		if (typeof value !== "boolean") {
			throw new TypeError("Expected a Boolean.");
		}
	}

	/**
	 * Validates that a value is a number.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static number(value) {
		if (typeof value !== "number") {
			throw new TypeError("Expected a number.");
		}
	}

	/**
	 * Validates that a value is a object.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static object(value) {
		if (!value || typeof value !== "object") {
			throw new TypeError("Expected an object.");
		}
	}

	/**
	 * Validates that a value is a object or null.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static "object?"(value) {
		if (typeof value !== "object") {
			throw new TypeError("Expected an object or null.");
		}
	}

	/**
	 * Validates that a value is a string.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static string(value) {
		if (typeof value !== "string") {
			throw new TypeError("Expected a string.");
		}
	}

	/**
	 * Validates that a value is a non-empty string.
	 * @param {*} value The value to validate.
	 * @returns {void}
	 * @throws {TypeError} If the value is invalid.
	 */
	static "string!"(value) {
		if (typeof value !== "string" || value.length === 0) {
			throw new TypeError("Expected a non-empty string.");
		}
	}
}

/**
 * @fileoverview Object Schema
 */


//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("./types.ts").ObjectDefinition} ObjectDefinition */
/** @typedef {import("./types.ts").PropertyDefinition} PropertyDefinition */

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------

/**
 * Validates a schema strategy.
 * @param {string} name The name of the key this strategy is for.
 * @param {PropertyDefinition} definition The strategy for the object key.
 * @returns {void}
 * @throws {Error} When the strategy is missing a name.
 * @throws {Error} When the strategy is missing a merge() method.
 * @throws {Error} When the strategy is missing a validate() method.
 */
function validateDefinition(name, definition) {
	let hasSchema = false;
	if (definition.schema) {
		if (typeof definition.schema === "object") {
			hasSchema = true;
		} else {
			throw new TypeError("Schema must be an object.");
		}
	}

	if (typeof definition.merge === "string") {
		if (!(definition.merge in MergeStrategy)) {
			throw new TypeError(
				`Definition for key "${name}" missing valid merge strategy.`,
			);
		}
	} else if (!hasSchema && typeof definition.merge !== "function") {
		throw new TypeError(
			`Definition for key "${name}" must have a merge property.`,
		);
	}

	if (typeof definition.validate === "string") {
		if (!(definition.validate in ValidationStrategy)) {
			throw new TypeError(
				`Definition for key "${name}" missing valid validation strategy.`,
			);
		}
	} else if (!hasSchema && typeof definition.validate !== "function") {
		throw new TypeError(
			`Definition for key "${name}" must have a validate() method.`,
		);
	}
}

//-----------------------------------------------------------------------------
// Errors
//-----------------------------------------------------------------------------

/**
 * Error when an unexpected key is found.
 */
class UnexpectedKeyError extends Error {
	/**
	 * Creates a new instance.
	 * @param {string} key The key that was unexpected.
	 */
	constructor(key) {
		super(`Unexpected key "${key}" found.`);
	}
}

/**
 * Error when a required key is missing.
 */
class MissingKeyError extends Error {
	/**
	 * Creates a new instance.
	 * @param {string} key The key that was missing.
	 */
	constructor(key) {
		super(`Missing required key "${key}".`);
	}
}

/**
 * Error when a key requires other keys that are missing.
 */
class MissingDependentKeysError extends Error {
	/**
	 * Creates a new instance.
	 * @param {string} key The key that was unexpected.
	 * @param {Array<string>} requiredKeys The keys that are required.
	 */
	constructor(key, requiredKeys) {
		super(`Key "${key}" requires keys "${requiredKeys.join('", "')}".`);
	}
}

/**
 * Wrapper error for errors occuring during a merge or validate operation.
 */
class WrapperError extends Error {
	/**
	 * Creates a new instance.
	 * @param {string} key The object key causing the error.
	 * @param {Error} source The source error.
	 */
	constructor(key, source) {
		super(`Key "${key}": ${source.message}`, { cause: source });

		// copy over custom properties that aren't represented
		for (const sourceKey of Object.keys(source)) {
			if (!(sourceKey in this)) {
				this[sourceKey] = source[sourceKey];
			}
		}
	}
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

/**
 * Represents an object validation/merging schema.
 */
class ObjectSchema {
	/**
	 * Track all definitions in the schema by key.
	 * @type {Map<string, PropertyDefinition>}
	 */
	#definitions = new Map();

	/**
	 * Separately track any keys that are required for faster validtion.
	 * @type {Map<string, PropertyDefinition>}
	 */
	#requiredKeys = new Map();

	/**
	 * Creates a new instance.
	 * @param {ObjectDefinition} definitions The schema definitions.
	 */
	constructor(definitions) {
		if (!definitions) {
			throw new Error("Schema definitions missing.");
		}

		// add in all strategies
		for (const key of Object.keys(definitions)) {
			validateDefinition(key, definitions[key]);

			// normalize merge and validate methods if subschema is present
			if (typeof definitions[key].schema === "object") {
				const schema = new ObjectSchema(definitions[key].schema);
				definitions[key] = {
					...definitions[key],
					merge(first = {}, second = {}) {
						return schema.merge(first, second);
					},
					validate(value) {
						ValidationStrategy.object(value);
						schema.validate(value);
					},
				};
			}

			// normalize the merge method in case there's a string
			if (typeof definitions[key].merge === "string") {
				definitions[key] = {
					...definitions[key],
					merge: MergeStrategy[
						/** @type {string} */ (definitions[key].merge)
					],
				};
			}

			// normalize the validate method in case there's a string
			if (typeof definitions[key].validate === "string") {
				definitions[key] = {
					...definitions[key],
					validate:
						ValidationStrategy[
							/** @type {string} */ (definitions[key].validate)
						],
				};
			}

			this.#definitions.set(key, definitions[key]);

			if (definitions[key].required) {
				this.#requiredKeys.set(key, definitions[key]);
			}
		}
	}

	/**
	 * Determines if a strategy has been registered for the given object key.
	 * @param {string} key The object key to find a strategy for.
	 * @returns {boolean} True if the key has a strategy registered, false if not.
	 */
	hasKey(key) {
		return this.#definitions.has(key);
	}

	/**
	 * Merges objects together to create a new object comprised of the keys
	 * of the all objects. Keys are merged based on the each key's merge
	 * strategy.
	 * @param {...Object} objects The objects to merge.
	 * @returns {Object} A new object with a mix of all objects' keys.
	 * @throws {Error} If any object is invalid.
	 */
	merge(...objects) {
		// double check arguments
		if (objects.length < 2) {
			throw new TypeError("merge() requires at least two arguments.");
		}

		if (
			objects.some(
				object => object === null || typeof object !== "object",
			)
		) {
			throw new TypeError("All arguments must be objects.");
		}

		return objects.reduce((result, object) => {
			this.validate(object);

			for (const [key, strategy] of this.#definitions) {
				try {
					if (key in result || key in object) {
						const merge = /** @type {Function} */ (strategy.merge);
						const value = merge.call(
							this,
							result[key],
							object[key],
						);
						if (value !== undefined) {
							result[key] = value;
						}
					}
				} catch (ex) {
					throw new WrapperError(key, ex);
				}
			}
			return result;
		}, {});
	}

	/**
	 * Validates an object's keys based on the validate strategy for each key.
	 * @param {Object} object The object to validate.
	 * @returns {void}
	 * @throws {Error} When the object is invalid.
	 */
	validate(object) {
		// check existing keys first
		for (const key of Object.keys(object)) {
			// check to see if the key is defined
			if (!this.hasKey(key)) {
				throw new UnexpectedKeyError(key);
			}

			// validate existing keys
			const definition = this.#definitions.get(key);

			// first check to see if any other keys are required
			if (Array.isArray(definition.requires)) {
				if (
					!definition.requires.every(otherKey => otherKey in object)
				) {
					throw new MissingDependentKeysError(
						key,
						definition.requires,
					);
				}
			}

			// now apply remaining validation strategy
			try {
				const validate = /** @type {Function} */ (definition.validate);
				validate.call(definition, object[key]);
			} catch (ex) {
				throw new WrapperError(key, ex);
			}
		}

		// ensure required keys aren't missing
		for (const [key] of this.#requiredKeys) {
			if (!(key in object)) {
				throw new MissingKeyError(key);
			}
		}
	}
}

exports.MergeStrategy = MergeStrategy;
exports.ObjectSchema = ObjectSchema;
exports.ValidationStrategy = ValidationStrategy;


'use strict';

var levn = require('levn');

/**
 * @fileoverview Config Comment Parser
 * @author Nicholas C. Zakas
 */


//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("@eslint/core").RuleConfig} RuleConfig */
/** @typedef {import("@eslint/core").RulesConfig} RulesConfig */
/** @typedef {import("./types.ts").StringConfig} StringConfig */
/** @typedef {import("./types.ts").BooleanConfig} BooleanConfig */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const directivesPattern = /^([a-z]+(?:-[a-z]+)*)(?:\s|$)/u;
const validSeverities = new Set([0, 1, 2, "off", "warn", "error"]);

/**
 * Determines if the severity in the rule configuration is valid.
 * @param {RuleConfig} ruleConfig A rule's configuration.
 * @returns {boolean} `true` if the severity is valid, otherwise `false`.
 */
function isSeverityValid(ruleConfig) {
	const severity = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;
	return validSeverities.has(severity);
}

/**
 * Determines if all severities in the rules configuration are valid.
 * @param {RulesConfig} rulesConfig The rules configuration to check.
 * @returns {boolean} `true` if all severities are valid, otherwise `false`.
 */
function isEverySeverityValid(rulesConfig) {
	return Object.values(rulesConfig).every(isSeverityValid);
}

/**
 * Represents a directive comment.
 */
class DirectiveComment {
	/**
	 * The label of the directive, such as "eslint", "eslint-disable", etc.
	 * @type {string}
	 */
	label = "";

	/**
	 * The value of the directive (the string after the label).
	 * @type {string}
	 */
	value = "";

	/**
	 * The justification of the directive (the string after the --).
	 * @type {string}
	 */
	justification = "";

	/**
	 * Creates a new directive comment.
	 * @param {string} label The label of the directive.
	 * @param {string} value The value of the directive.
	 * @param {string} justification The justification of the directive.
	 */
	constructor(label, value, justification) {
		this.label = label;
		this.value = value;
		this.justification = justification;
	}
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Object to parse ESLint configuration comments.
 */
class ConfigCommentParser {
	/**
	 * Parses a list of "name:string_value" or/and "name" options divided by comma or
	 * whitespace. Used for "global" comments.
	 * @param {string} string The string to parse.
	 * @returns {StringConfig} Result map object of names and string values, or null values if no value was provided.
	 */
	parseStringConfig(string) {
		const items = /** @type {StringConfig} */ ({});

		// Collapse whitespace around `:` and `,` to make parsing easier
		const trimmedString = string
			.trim()
			.replace(/(?<!\s)\s*([:,])\s*/gu, "$1");

		trimmedString.split(/\s|,+/u).forEach(name => {
			if (!name) {
				return;
			}

			// value defaults to null (if not provided), e.g: "foo" => ["foo", null]
			const [key, value = null] = name.split(":");

			items[key] = value;
		});

		return items;
	}

	/**
	 * Parses a JSON-like config.
	 * @param {string} string The string to parse.
	 * @returns {({ok: true, config: RulesConfig}|{ok: false, error: {message: string}})} Result map object
	 */
	parseJSONLikeConfig(string) {
		// Parses a JSON-like comment by the same way as parsing CLI option.
		try {
			const items =
				/** @type {RulesConfig} */ (levn.parse("Object", string)) || {};

			/*
			 * When the configuration has any invalid severities, it should be completely
			 * ignored. This is because the configuration is not valid and should not be
			 * applied.
			 *
			 * For example, the following configuration is invalid:
			 *
			 *    "no-alert: 2 no-console: 2"
			 *
			 * This results in a configuration of { "no-alert": "2 no-console: 2" }, which is
			 * not valid. In this case, the configuration should be ignored.
			 */
			if (isEverySeverityValid(items)) {
				return {
					ok: true,
					config: items,
				};
			}
		} catch {
			// levn parsing error: ignore to parse the string by a fallback.
		}

		/*
		 * Optionator cannot parse commaless notations.
		 * But we are supporting that. So this is a fallback for that.
		 */
		const normalizedString = string
			.replace(/(?<![-a-zA-Z0-9/])([-a-zA-Z0-9/]+):/gu, '"$1":')
			.replace(/(\]|[0-9])\s+(?=")/u, "$1,");

		try {
			const items = JSON.parse(`{${normalizedString}}`);

			return {
				ok: true,
				config: items,
			};
		} catch (ex) {
			const errorMessage = ex instanceof Error ? ex.message : String(ex);

			return {
				ok: false,
				error: {
					message: `Failed to parse JSON from '${normalizedString}': ${errorMessage}`,
				},
			};
		}
	}

	/**
	 * Parses a config of values separated by comma.
	 * @param {string} string The string to parse.
	 * @returns {BooleanConfig} Result map of values and true values
	 */
	parseListConfig(string) {
		const items = /** @type {BooleanConfig} */ ({});

		string.split(",").forEach(name => {
			const trimmedName = name
				.trim()
				.replace(
					/^(?<quote>['"]?)(?<ruleId>.*)\k<quote>$/su,
					"$<ruleId>",
				);

			if (trimmedName) {
				items[trimmedName] = true;
			}
		});

		return items;
	}

	/**
	 * Extract the directive and the justification from a given directive comment and trim them.
	 * @param {string} value The comment text to extract.
	 * @returns {{directivePart: string, justificationPart: string}} The extracted directive and justification.
	 */
	#extractDirectiveComment(value) {
		const match = /\s-{2,}\s/u.exec(value);

		if (!match) {
			return { directivePart: value.trim(), justificationPart: "" };
		}

		const directive = value.slice(0, match.index).trim();
		const justification = value.slice(match.index + match[0].length).trim();

		return { directivePart: directive, justificationPart: justification };
	}

	/**
	 * Parses a directive comment into directive text and value.
	 * @param {string} string The string with the directive to be parsed.
	 * @returns {DirectiveComment|undefined} The parsed directive or `undefined` if the directive is invalid.
	 */
	parseDirective(string) {
		const { directivePart, justificationPart } =
			this.#extractDirectiveComment(string);
		const match = directivesPattern.exec(directivePart);

		if (!match) {
			return undefined;
		}

		const directiveText = match[1];
		const directiveValue = directivePart.slice(
			match.index + directiveText.length,
		);

		return new DirectiveComment(
			directiveText,
			directiveValue.trim(),
			justificationPart,
		);
	}
}

/**
 * @fileoverview A collection of helper classes for implementing `SourceCode`.
 * @author Nicholas C. Zakas
 */

/* eslint class-methods-use-this: off -- Required to complete interface. */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("@eslint/core").VisitTraversalStep} VisitTraversalStep */
/** @typedef {import("@eslint/core").CallTraversalStep} CallTraversalStep */
/** @typedef {import("@eslint/core").TraversalStep} TraversalStep */
/** @typedef {import("@eslint/core").SourceLocation} SourceLocation */
/** @typedef {import("@eslint/core").SourceLocationWithOffset} SourceLocationWithOffset */
/** @typedef {import("@eslint/core").SourceRange} SourceRange */
/** @typedef {import("@eslint/core").Directive} IDirective */
/** @typedef {import("@eslint/core").DirectiveType} DirectiveType */
/** @typedef {import("@eslint/core").SourceCodeBaseTypeOptions} SourceCodeBaseTypeOptions */
/**
 * @typedef {import("@eslint/core").TextSourceCode<Options>} TextSourceCode<Options>
 * @template {SourceCodeBaseTypeOptions} [Options=SourceCodeBaseTypeOptions]
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Determines if a node has ESTree-style loc information.
 * @param {object} node The node to check.
 * @returns {node is {loc:SourceLocation}} `true` if the node has ESTree-style loc information, `false` if not.
 */
function hasESTreeStyleLoc(node) {
	return "loc" in node;
}

/**
 * Determines if a node has position-style loc information.
 * @param {object} node The node to check.
 * @returns {node is {position:SourceLocation}} `true` if the node has position-style range information, `false` if not.
 */
function hasPosStyleLoc(node) {
	return "position" in node;
}

/**
 * Determines if a node has ESTree-style range information.
 * @param {object} node The node to check.
 * @returns {node is {range:SourceRange}} `true` if the node has ESTree-style range information, `false` if not.
 */
function hasESTreeStyleRange(node) {
	return "range" in node;
}

/**
 * Determines if a node has position-style range information.
 * @param {object} node The node to check.
 * @returns {node is {position:SourceLocationWithOffset}} `true` if the node has position-style range information, `false` if not.
 */
function hasPosStyleRange(node) {
	return "position" in node;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * A class to represent a step in the traversal process where a node is visited.
 * @implements {VisitTraversalStep}
 */
class VisitNodeStep {
	/**
	 * The type of the step.
	 * @type {"visit"}
	 * @readonly
	 */
	type = "visit";

	/**
	 * The kind of the step. Represents the same data as the `type` property
	 * but it's a number for performance.
	 * @type {1}
	 * @readonly
	 */
	kind = 1;

	/**
	 * The target of the step.
	 * @type {object}
	 */
	target;

	/**
	 * The phase of the step.
	 * @type {1|2}
	 */
	phase;

	/**
	 * The arguments of the step.
	 * @type {Array<any>}
	 */
	args;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the step.
	 * @param {object} options.target The target of the step.
	 * @param {1|2} options.phase The phase of the step.
	 * @param {Array<any>} options.args The arguments of the step.
	 */
	constructor({ target, phase, args }) {
		this.target = target;
		this.phase = phase;
		this.args = args;
	}
}

/**
 * A class to represent a step in the traversal process where a
 * method is called.
 * @implements {CallTraversalStep}
 */
class CallMethodStep {
	/**
	 * The type of the step.
	 * @type {"call"}
	 * @readonly
	 */
	type = "call";

	/**
	 * The kind of the step. Represents the same data as the `type` property
	 * but it's a number for performance.
	 * @type {2}
	 * @readonly
	 */
	kind = 2;

	/**
	 * The name of the method to call.
	 * @type {string}
	 */
	target;

	/**
	 * The arguments to pass to the method.
	 * @type {Array<any>}
	 */
	args;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the step.
	 * @param {string} options.target The target of the step.
	 * @param {Array<any>} options.args The arguments of the step.
	 */
	constructor({ target, args }) {
		this.target = target;
		this.args = args;
	}
}

/**
 * A class to represent a directive comment.
 * @implements {IDirective}
 */
class Directive {
	/**
	 * The type of directive.
	 * @type {DirectiveType}
	 * @readonly
	 */
	type;

	/**
	 * The node representing the directive.
	 * @type {unknown}
	 * @readonly
	 */
	node;

	/**
	 * Everything after the "eslint-disable" portion of the directive,
	 * but before the "--" that indicates the justification.
	 * @type {string}
	 * @readonly
	 */
	value;

	/**
	 * The justification for the directive.
	 * @type {string}
	 * @readonly
	 */
	justification;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the directive.
	 * @param {"disable"|"enable"|"disable-next-line"|"disable-line"} options.type The type of directive.
	 * @param {unknown} options.node The node representing the directive.
	 * @param {string} options.value The value of the directive.
	 * @param {string} options.justification The justification for the directive.
	 */
	constructor({ type, node, value, justification }) {
		this.type = type;
		this.node = node;
		this.value = value;
		this.justification = justification;
	}
}

/**
 * Source Code Base Object
 * @template {SourceCodeBaseTypeOptions & {SyntaxElementWithLoc: object}} [Options=SourceCodeBaseTypeOptions & {SyntaxElementWithLoc: object}]
 * @implements {TextSourceCode<Options>}
 */
class TextSourceCodeBase {
	/**
	 * The lines of text in the source code.
	 * @type {Array<string>}
	 */
	#lines;

	/**
	 * The AST of the source code.
	 * @type {Options['RootNode']}
	 */
	ast;

	/**
	 * The text of the source code.
	 * @type {string}
	 */
	text;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.text The source code text.
	 * @param {Options['RootNode']} options.ast The root AST node.
	 * @param {RegExp} [options.lineEndingPattern] The pattern to match lineEndings in the source code.
	 */
	constructor({ text, ast, lineEndingPattern = /\r?\n/u }) {
		this.ast = ast;
		this.text = text;
		this.#lines = text.split(lineEndingPattern);
	}

	/**
	 * Returns the loc information for the given node or token.
	 * @param {Options['SyntaxElementWithLoc']} nodeOrToken The node or token to get the loc information for.
	 * @returns {SourceLocation} The loc information for the node or token.
	 * @throws {Error} If the node or token does not have loc information.
	 */
	getLoc(nodeOrToken) {
		if (hasESTreeStyleLoc(nodeOrToken)) {
			return nodeOrToken.loc;
		}

		if (hasPosStyleLoc(nodeOrToken)) {
			return nodeOrToken.position;
		}

		throw new Error(
			"Custom getLoc() method must be implemented in the subclass.",
		);
	}

	/**
	 * Returns the range information for the given node or token.
	 * @param {Options['SyntaxElementWithLoc']} nodeOrToken The node or token to get the range information for.
	 * @returns {SourceRange} The range information for the node or token.
	 * @throws {Error} If the node or token does not have range information.
	 */
	getRange(nodeOrToken) {
		if (hasESTreeStyleRange(nodeOrToken)) {
			return nodeOrToken.range;
		}

		if (hasPosStyleRange(nodeOrToken)) {
			return [
				nodeOrToken.position.start.offset,
				nodeOrToken.position.end.offset,
			];
		}

		throw new Error(
			"Custom getRange() method must be implemented in the subclass.",
		);
	}

	/* eslint-disable no-unused-vars -- Required to complete interface. */
	/**
	 * Returns the parent of the given node.
	 * @param {Options['SyntaxElementWithLoc']} node The node to get the parent of.
	 * @returns {Options['SyntaxElementWithLoc']|undefined} The parent of the node.
	 * @throws {Error} If the method is not implemented in the subclass.
	 */
	getParent(node) {
		throw new Error("Not implemented.");
	}
	/* eslint-enable no-unused-vars -- Required to complete interface. */

	/**
	 * Gets all the ancestors of a given node
	 * @param {Options['SyntaxElementWithLoc']} node The node
	 * @returns {Array<Options['SyntaxElementWithLoc']>} All the ancestor nodes in the AST, not including the provided node, starting
	 * from the root node at index 0 and going inwards to the parent node.
	 * @throws {TypeError} When `node` is missing.
	 */
	getAncestors(node) {
		if (!node) {
			throw new TypeError("Missing required argument: node.");
		}

		const ancestorsStartingAtParent = [];

		for (
			let ancestor = this.getParent(node);
			ancestor;
			ancestor = this.getParent(ancestor)
		) {
			ancestorsStartingAtParent.push(ancestor);
		}

		return ancestorsStartingAtParent.reverse();
	}

	/**
	 * Gets the source code for the given node.
	 * @param {Options['SyntaxElementWithLoc']} [node] The AST node to get the text for.
	 * @param {number} [beforeCount] The number of characters before the node to retrieve.
	 * @param {number} [afterCount] The number of characters after the node to retrieve.
	 * @returns {string} The text representing the AST node.
	 * @public
	 */
	getText(node, beforeCount, afterCount) {
		if (node) {
			const range = this.getRange(node);
			return this.text.slice(
				Math.max(range[0] - (beforeCount || 0), 0),
				range[1] + (afterCount || 0),
			);
		}
		return this.text;
	}

	/**
	 * Gets the entire source text split into an array of lines.
	 * @returns {Array<string>} The source text as an array of lines.
	 * @public
	 */
	get lines() {
		return this.#lines;
	}

	/**
	 * Traverse the source code and return the steps that were taken.
	 * @returns {Iterable<TraversalStep>} The steps that were taken while traversing the source code.
	 */
	traverse() {
		throw new Error("Not implemented.");
	}
}

exports.CallMethodStep = CallMethodStep;
exports.ConfigCommentParser = ConfigCommentParser;
exports.Directive = Directive;
exports.TextSourceCodeBase = TextSourceCodeBase;
exports.VisitNodeStep = VisitNodeStep;



//#region src/utils.ts
const postfixRE = /[?#].*$/;
function cleanUrl(url) {
	return url.replace(postfixRE, "");
}
function extractQueryWithoutFragment(url) {
	const questionMarkIndex = url.indexOf("?");
	if (questionMarkIndex === -1) return "";
	const fragmentIndex = url.indexOf("#", questionMarkIndex);
	if (fragmentIndex === -1) return url.substring(questionMarkIndex);
	else return url.substring(questionMarkIndex, fragmentIndex);
}

//#endregion
//#region src/composable-filters.ts
var And = class {
	kind;
	args;
	constructor(...args) {
		if (args.length === 0) throw new Error("`And` expects at least one operand");
		this.args = args;
		this.kind = "and";
	}
};
var Or = class {
	kind;
	args;
	constructor(...args) {
		if (args.length === 0) throw new Error("`Or` expects at least one operand");
		this.args = args;
		this.kind = "or";
	}
};
var Not = class {
	kind;
	expr;
	constructor(expr) {
		this.expr = expr;
		this.kind = "not";
	}
};
var Id = class {
	kind;
	pattern;
	params;
	constructor(pattern, params) {
		this.pattern = pattern;
		this.kind = "id";
		this.params = params ?? { cleanUrl: false };
	}
};
var ModuleType = class {
	kind;
	pattern;
	constructor(pattern) {
		this.pattern = pattern;
		this.kind = "moduleType";
	}
};
var Code = class {
	kind;
	pattern;
	constructor(expr) {
		this.pattern = expr;
		this.kind = "code";
	}
};
var Query = class {
	kind;
	key;
	pattern;
	constructor(key, pattern) {
		this.pattern = pattern;
		this.key = key;
		this.kind = "query";
	}
};
var Include = class {
	kind;
	expr;
	constructor(expr) {
		this.expr = expr;
		this.kind = "include";
	}
};
var Exclude = class {
	kind;
	expr;
	constructor(expr) {
		this.expr = expr;
		this.kind = "exclude";
	}
};
function and(...args) {
	return new And(...args);
}
function or(...args) {
	return new Or(...args);
}
function not(expr) {
	return new Not(expr);
}
function id(pattern, params) {
	return new Id(pattern, params);
}
function moduleType(pattern) {
	return new ModuleType(pattern);
}
function code(pattern) {
	return new Code(pattern);
}
function query(key, pattern) {
	return new Query(key, pattern);
}
function include(expr) {
	return new Include(expr);
}
function exclude(expr) {
	return new Exclude(expr);
}
/**
* convert a queryObject to FilterExpression like
* ```js
*   and(query(k1, v1), query(k2, v2))
* ```
* @param queryFilterObject The query filter object needs to be matched.
* @returns a `And` FilterExpression
*/
function queries(queryFilter) {
	let arr = Object.entries(queryFilter).map(([key, value]) => {
		return new Query(key, value);
	});
	return and(...arr);
}
function interpreter(exprs, code$1, id$1, moduleType$1) {
	let arr = [];
	if (Array.isArray(exprs)) arr = exprs;
	else arr = [exprs];
	return interpreterImpl(arr, code$1, id$1, moduleType$1);
}
function interpreterImpl(expr, code$1, id$1, moduleType$1, ctx = {}) {
	let hasInclude = false;
	for (const e of expr) switch (e.kind) {
		case "include": {
			hasInclude = true;
			if (exprInterpreter(e.expr, code$1, id$1, moduleType$1, ctx)) return true;
			break;
		}
		case "exclude": {
			if (exprInterpreter(e.expr, code$1, id$1, moduleType$1)) return false;
			break;
		}
	}
	return !hasInclude;
}
function exprInterpreter(expr, code$1, id$1, moduleType$1, ctx = {}) {
	switch (expr.kind) {
		case "and": return expr.args.every((e) => exprInterpreter(e, code$1, id$1, moduleType$1, ctx));
		case "or": return expr.args.some((e) => exprInterpreter(e, code$1, id$1, moduleType$1, ctx));
		case "not": return !exprInterpreter(expr.expr, code$1, id$1, moduleType$1, ctx);
		case "id": {
			if (id$1 === void 0) throw new Error("`id` is required for `id` expression");
			if (expr.params.cleanUrl) id$1 = cleanUrl(id$1);
			return typeof expr.pattern === "string" ? id$1 === expr.pattern : expr.pattern.test(id$1);
		}
		case "moduleType": {
			if (moduleType$1 === void 0) throw new Error("`moduleType` is required for `moduleType` expression");
			return moduleType$1 === expr.pattern;
		}
		case "code": {
			if (code$1 === void 0) throw new Error("`code` is required for `code` expression");
			return typeof expr.pattern === "string" ? code$1.includes(expr.pattern) : expr.pattern.test(code$1);
		}
		case "query": {
			if (id$1 === void 0) throw new Error("`id` is required for `Query` expression");
			if (!ctx.urlSearchParamsCache) {
				let queryString = extractQueryWithoutFragment(id$1);
				ctx.urlSearchParamsCache = new URLSearchParams(queryString);
			}
			let urlParams = ctx.urlSearchParamsCache;
			if (typeof expr.pattern === "boolean") if (expr.pattern) return urlParams.has(expr.key);
			else return !urlParams.has(expr.key);
			else if (typeof expr.pattern === "string") return urlParams.get(expr.key) === expr.pattern;
			else return expr.pattern.test(urlParams.get(expr.key) ?? "");
		}
		default: throw new Error(`Expression ${JSON.stringify(expr)} is not expected.`);
	}
}

//#endregion
//#region src/simple-filters.ts
/**
* Constructs a RegExp that matches the exact string specified.
*
* This is useful for plugin hook filters.
*
* @param str the string to match.
* @param flags flags for the RegExp.
*
* @example
* ```ts
* import { exactRegex } from '@rolldown/pluginutils';
* const plugin = {
*   name: 'plugin',
*   resolveId: {
*     filter: { id: exactRegex('foo') },
*     handler(id) {} // will only be called for `foo`
*   }
* }
* ```
*/
function exactRegex(str, flags) {
	return new RegExp(`^${escapeRegex(str)}$`, flags);
}
/**
* Constructs a RegExp that matches a value that has the specified prefix.
*
* This is useful for plugin hook filters.
*
* @param str the string to match.
* @param flags flags for the RegExp.
*
* @example
* ```ts
* import { prefixRegex } from '@rolldown/pluginutils';
* const plugin = {
*   name: 'plugin',
*   resolveId: {
*     filter: { id: prefixRegex('foo') },
*     handler(id) {} // will only be called for IDs starting with `foo`
*   }
* }
* ```
*/
function prefixRegex(str, flags) {
	return new RegExp(`^${escapeRegex(str)}`, flags);
}
const escapeRegexRE = /[-/\\^$*+?.()|[\]{}]/g;
function escapeRegex(str) {
	return str.replace(escapeRegexRE, "\\$&");
}
function makeIdFiltersToMatchWithQuery(input) {
	if (!Array.isArray(input)) return makeIdFilterToMatchWithQuery(input);
	return input.map((i) => makeIdFilterToMatchWithQuery(i));
}
function makeIdFilterToMatchWithQuery(input) {
	if (typeof input === "string") return `${input}{?*,}`;
	return makeRegexIdFilterToMatchWithQuery(input);
}
function makeRegexIdFilterToMatchWithQuery(input) {
	return new RegExp(input.source.replace(/(?<!\\)\$/g, "(?:\\?.*)?$"), input.flags);
}

//#endregion
exports.and = and;
exports.code = code;
exports.exactRegex = exactRegex;
exports.exclude = exclude;
exports.exprInterpreter = exprInterpreter;
exports.id = id;
exports.include = include;
exports.interpreter = interpreter;
exports.interpreterImpl = interpreterImpl;
exports.makeIdFiltersToMatchWithQuery = makeIdFiltersToMatchWithQuery;
exports.moduleType = moduleType;
exports.not = not;
exports.or = or;
exports.prefixRegex = prefixRegex;
exports.queries = queries;
exports.query = query;

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const path = __toESM(require("path"));
const fs = __toESM(require("fs"));

//#region src/utils.ts
function cleanPath(path$1) {
	let normalized = (0, path.normalize)(path$1);
	if (normalized.length > 1 && normalized[normalized.length - 1] === path.sep) normalized = normalized.substring(0, normalized.length - 1);
	return normalized;
}
const SLASHES_REGEX = /[\\/]/g;
function convertSlashes(path$1, separator) {
	return path$1.replace(SLASHES_REGEX, separator);
}
const WINDOWS_ROOT_DIR_REGEX = /^[a-z]:[\\/]$/i;
function isRootDirectory(path$1) {
	return path$1 === "/" || WINDOWS_ROOT_DIR_REGEX.test(path$1);
}
function normalizePath(path$1, options) {
	const { resolvePaths, normalizePath: normalizePath$1, pathSeparator } = options;
	const pathNeedsCleaning = process.platform === "win32" && path$1.includes("/") || path$1.startsWith(".");
	if (resolvePaths) path$1 = (0, path.resolve)(path$1);
	if (normalizePath$1 || pathNeedsCleaning) path$1 = cleanPath(path$1);
	if (path$1 === ".") return "";
	const needsSeperator = path$1[path$1.length - 1] !== pathSeparator;
	return convertSlashes(needsSeperator ? path$1 + pathSeparator : path$1, pathSeparator);
}

//#endregion
//#region src/api/functions/join-path.ts
function joinPathWithBasePath(filename, directoryPath) {
	return directoryPath + filename;
}
function joinPathWithRelativePath(root, options) {
	return function(filename, directoryPath) {
		const sameRoot = directoryPath.startsWith(root);
		if (sameRoot) return directoryPath.slice(root.length) + filename;
		else return convertSlashes((0, path.relative)(root, directoryPath), options.pathSeparator) + options.pathSeparator + filename;
	};
}
function joinPath(filename) {
	return filename;
}
function joinDirectoryPath(filename, directoryPath, separator) {
	return directoryPath + filename + separator;
}
function build$7(root, options) {
	const { relativePaths, includeBasePath } = options;
	return relativePaths && root ? joinPathWithRelativePath(root, options) : includeBasePath ? joinPathWithBasePath : joinPath;
}

//#endregion
//#region src/api/functions/push-directory.ts
function pushDirectoryWithRelativePath(root) {
	return function(directoryPath, paths) {
		paths.push(directoryPath.substring(root.length) || ".");
	};
}
function pushDirectoryFilterWithRelativePath(root) {
	return function(directoryPath, paths, filters) {
		const relativePath = directoryPath.substring(root.length) || ".";
		if (filters.every((filter) => filter(relativePath, true))) paths.push(relativePath);
	};
}
const pushDirectory = (directoryPath, paths) => {
	paths.push(directoryPath || ".");
};
const pushDirectoryFilter = (directoryPath, paths, filters) => {
	const path$1 = directoryPath || ".";
	if (filters.every((filter) => filter(path$1, true))) paths.push(path$1);
};
const empty$2 = () => {};
function build$6(root, options) {
	const { includeDirs, filters, relativePaths } = options;
	if (!includeDirs) return empty$2;
	if (relativePaths) return filters && filters.length ? pushDirectoryFilterWithRelativePath(root) : pushDirectoryWithRelativePath(root);
	return filters && filters.length ? pushDirectoryFilter : pushDirectory;
}

//#endregion
//#region src/api/functions/push-file.ts
const pushFileFilterAndCount = (filename, _paths, counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) counts.files++;
};
const pushFileFilter = (filename, paths, _counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) paths.push(filename);
};
const pushFileCount = (_filename, _paths, counts, _filters) => {
	counts.files++;
};
const pushFile = (filename, paths) => {
	paths.push(filename);
};
const empty$1 = () => {};
function build$5(options) {
	const { excludeFiles, filters, onlyCounts } = options;
	if (excludeFiles) return empty$1;
	if (filters && filters.length) return onlyCounts ? pushFileFilterAndCount : pushFileFilter;
	else if (onlyCounts) return pushFileCount;
	else return pushFile;
}

//#endregion
//#region src/api/functions/get-array.ts
const getArray = (paths) => {
	return paths;
};
const getArrayGroup = () => {
	return [""].slice(0, 0);
};
function build$4(options) {
	return options.group ? getArrayGroup : getArray;
}

//#endregion
//#region src/api/functions/group-files.ts
const groupFiles = (groups, directory, files) => {
	groups.push({
		directory,
		files,
		dir: directory
	});
};
const empty = () => {};
function build$3(options) {
	return options.group ? groupFiles : empty;
}

//#endregion
//#region src/api/functions/resolve-symlink.ts
const resolveSymlinksAsync = function(path$1, state, callback$1) {
	const { queue, fs: fs$1, options: { suppressErrors } } = state;
	queue.enqueue();
	fs$1.realpath(path$1, (error, resolvedPath) => {
		if (error) return queue.dequeue(suppressErrors ? null : error, state);
		fs$1.stat(resolvedPath, (error$1, stat) => {
			if (error$1) return queue.dequeue(suppressErrors ? null : error$1, state);
			if (stat.isDirectory() && isRecursive(path$1, resolvedPath, state)) return queue.dequeue(null, state);
			callback$1(stat, resolvedPath);
			queue.dequeue(null, state);
		});
	});
};
const resolveSymlinks = function(path$1, state, callback$1) {
	const { queue, fs: fs$1, options: { suppressErrors } } = state;
	queue.enqueue();
	try {
		const resolvedPath = fs$1.realpathSync(path$1);
		const stat = fs$1.statSync(resolvedPath);
		if (stat.isDirectory() && isRecursive(path$1, resolvedPath, state)) return;
		callback$1(stat, resolvedPath);
	} catch (e) {
		if (!suppressErrors) throw e;
	}
};
function build$2(options, isSynchronous) {
	if (!options.resolveSymlinks || options.excludeSymlinks) return null;
	return isSynchronous ? resolveSymlinks : resolveSymlinksAsync;
}
function isRecursive(path$1, resolved, state) {
	if (state.options.useRealPaths) return isRecursiveUsingRealPaths(resolved, state);
	let parent = (0, path.dirname)(path$1);
	let depth = 1;
	while (parent !== state.root && depth < 2) {
		const resolvedPath = state.symlinks.get(parent);
		const isSameRoot = !!resolvedPath && (resolvedPath === resolved || resolvedPath.startsWith(resolved) || resolved.startsWith(resolvedPath));
		if (isSameRoot) depth++;
		else parent = (0, path.dirname)(parent);
	}
	state.symlinks.set(path$1, resolved);
	return depth > 1;
}
function isRecursiveUsingRealPaths(resolved, state) {
	return state.visited.includes(resolved + state.options.pathSeparator);
}

//#endregion
//#region src/api/functions/invoke-callback.ts
const onlyCountsSync = (state) => {
	return state.counts;
};
const groupsSync = (state) => {
	return state.groups;
};
const defaultSync = (state) => {
	return state.paths;
};
const limitFilesSync = (state) => {
	return state.paths.slice(0, state.options.maxFiles);
};
const onlyCountsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.counts, state.options.suppressErrors);
	return null;
};
const defaultAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths, state.options.suppressErrors);
	return null;
};
const limitFilesAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths.slice(0, state.options.maxFiles), state.options.suppressErrors);
	return null;
};
const groupsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.groups, state.options.suppressErrors);
	return null;
};
function report(error, callback$1, output, suppressErrors) {
	if (error && !suppressErrors) callback$1(error, output);
	else callback$1(null, output);
}
function build$1(options, isSynchronous) {
	const { onlyCounts, group, maxFiles } = options;
	if (onlyCounts) return isSynchronous ? onlyCountsSync : onlyCountsAsync;
	else if (group) return isSynchronous ? groupsSync : groupsAsync;
	else if (maxFiles) return isSynchronous ? limitFilesSync : limitFilesAsync;
	else return isSynchronous ? defaultSync : defaultAsync;
}

//#endregion
//#region src/api/functions/walk-directory.ts
const readdirOpts = { withFileTypes: true };
const walkAsync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	state.queue.enqueue();
	if (currentDepth < 0) return state.queue.dequeue(null, state);
	const { fs: fs$1 } = state;
	state.visited.push(crawlPath);
	state.counts.directories++;
	fs$1.readdir(crawlPath || ".", readdirOpts, (error, entries = []) => {
		callback$1(entries, directoryPath, currentDepth);
		state.queue.dequeue(state.options.suppressErrors ? null : error, state);
	});
};
const walkSync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	const { fs: fs$1 } = state;
	if (currentDepth < 0) return;
	state.visited.push(crawlPath);
	state.counts.directories++;
	let entries = [];
	try {
		entries = fs$1.readdirSync(crawlPath || ".", readdirOpts);
	} catch (e) {
		if (!state.options.suppressErrors) throw e;
	}
	callback$1(entries, directoryPath, currentDepth);
};
function build(isSynchronous) {
	return isSynchronous ? walkSync : walkAsync;
}

//#endregion
//#region src/api/queue.ts
/**
* This is a custom stateless queue to track concurrent async fs calls.
* It increments a counter whenever a call is queued and decrements it
* as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
*/
var Queue = class {
	count = 0;
	constructor(onQueueEmpty) {
		this.onQueueEmpty = onQueueEmpty;
	}
	enqueue() {
		this.count++;
		return this.count;
	}
	dequeue(error, output) {
		if (this.onQueueEmpty && (--this.count <= 0 || error)) {
			this.onQueueEmpty(error, output);
			if (error) {
				output.controller.abort();
				this.onQueueEmpty = void 0;
			}
		}
	}
};

//#endregion
//#region src/api/counter.ts
var Counter = class {
	_files = 0;
	_directories = 0;
	set files(num) {
		this._files = num;
	}
	get files() {
		return this._files;
	}
	set directories(num) {
		this._directories = num;
	}
	get directories() {
		return this._directories;
	}
	/**
	* @deprecated use `directories` instead
	*/
	/* c8 ignore next 3 */
	get dirs() {
		return this._directories;
	}
};

//#endregion
//#region src/api/aborter.ts
/**
* AbortController is not supported on Node 14 so we use this until we can drop
* support for Node 14.
*/
var Aborter = class {
	aborted = false;
	abort() {
		this.aborted = true;
	}
};

//#endregion
//#region src/api/walker.ts
var Walker = class {
	root;
	isSynchronous;
	state;
	joinPath;
	pushDirectory;
	pushFile;
	getArray;
	groupFiles;
	resolveSymlink;
	walkDirectory;
	callbackInvoker;
	constructor(root, options, callback$1) {
		this.isSynchronous = !callback$1;
		this.callbackInvoker = build$1(options, this.isSynchronous);
		this.root = normalizePath(root, options);
		this.state = {
			root: isRootDirectory(this.root) ? this.root : this.root.slice(0, -1),
			paths: [""].slice(0, 0),
			groups: [],
			counts: new Counter(),
			options,
			queue: new Queue((error, state) => this.callbackInvoker(state, error, callback$1)),
			symlinks: /* @__PURE__ */ new Map(),
			visited: [""].slice(0, 0),
			controller: new Aborter(),
			fs: options.fs || fs
		};
		this.joinPath = build$7(this.root, options);
		this.pushDirectory = build$6(this.root, options);
		this.pushFile = build$5(options);
		this.getArray = build$4(options);
		this.groupFiles = build$3(options);
		this.resolveSymlink = build$2(options, this.isSynchronous);
		this.walkDirectory = build(this.isSynchronous);
	}
	start() {
		this.pushDirectory(this.root, this.state.paths, this.state.options.filters);
		this.walkDirectory(this.state, this.root, this.root, this.state.options.maxDepth, this.walk);
		return this.isSynchronous ? this.callbackInvoker(this.state, null) : null;
	}
	walk = (entries, directoryPath, depth) => {
		const { paths, options: { filters, resolveSymlinks: resolveSymlinks$1, excludeSymlinks, exclude, maxFiles, signal, useRealPaths, pathSeparator }, controller } = this.state;
		if (controller.aborted || signal && signal.aborted || maxFiles && paths.length > maxFiles) return;
		const files = this.getArray(this.state.paths);
		for (let i = 0; i < entries.length; ++i) {
			const entry = entries[i];
			if (entry.isFile() || entry.isSymbolicLink() && !resolveSymlinks$1 && !excludeSymlinks) {
				const filename = this.joinPath(entry.name, directoryPath);
				this.pushFile(filename, files, this.state.counts, filters);
			} else if (entry.isDirectory()) {
				let path$1 = joinDirectoryPath(entry.name, directoryPath, this.state.options.pathSeparator);
				if (exclude && exclude(entry.name, path$1)) continue;
				this.pushDirectory(path$1, paths, filters);
				this.walkDirectory(this.state, path$1, path$1, depth - 1, this.walk);
			} else if (this.resolveSymlink && entry.isSymbolicLink()) {
				let path$1 = joinPathWithBasePath(entry.name, directoryPath);
				this.resolveSymlink(path$1, this.state, (stat, resolvedPath) => {
					if (stat.isDirectory()) {
						resolvedPath = normalizePath(resolvedPath, this.state.options);
						if (exclude && exclude(entry.name, useRealPaths ? resolvedPath : path$1 + pathSeparator)) return;
						this.walkDirectory(this.state, resolvedPath, useRealPaths ? resolvedPath : path$1 + pathSeparator, depth - 1, this.walk);
					} else {
						resolvedPath = useRealPaths ? resolvedPath : path$1;
						const filename = (0, path.basename)(resolvedPath);
						const directoryPath$1 = normalizePath((0, path.dirname)(resolvedPath), this.state.options);
						resolvedPath = this.joinPath(filename, directoryPath$1);
						this.pushFile(resolvedPath, files, this.state.counts, filters);
					}
				});
			}
		}
		this.groupFiles(this.state.groups, directoryPath, files);
	};
};

//#endregion
//#region src/api/async.ts
function promise(root, options) {
	return new Promise((resolve$1, reject) => {
		callback(root, options, (err, output) => {
			if (err) return reject(err);
			resolve$1(output);
		});
	});
}
function callback(root, options, callback$1) {
	let walker = new Walker(root, options, callback$1);
	walker.start();
}

//#endregion
//#region src/api/sync.ts
function sync(root, options) {
	const walker = new Walker(root, options);
	return walker.start();
}

//#endregion
//#region src/builder/api-builder.ts
var APIBuilder = class {
	constructor(root, options) {
		this.root = root;
		this.options = options;
	}
	withPromise() {
		return promise(this.root, this.options);
	}
	withCallback(cb) {
		callback(this.root, this.options, cb);
	}
	sync() {
		return sync(this.root, this.options);
	}
};

//#endregion
//#region src/builder/index.ts
let pm = null;
/* c8 ignore next 6 */
try {
	require.resolve("picomatch");
	pm = require("picomatch");
} catch {}
var Builder = class {
	globCache = {};
	options = {
		maxDepth: Infinity,
		suppressErrors: true,
		pathSeparator: path.sep,
		filters: []
	};
	globFunction;
	constructor(options) {
		this.options = {
			...this.options,
			...options
		};
		this.globFunction = this.options.globFunction;
	}
	group() {
		this.options.group = true;
		return this;
	}
	withPathSeparator(separator) {
		this.options.pathSeparator = separator;
		return this;
	}
	withBasePath() {
		this.options.includeBasePath = true;
		return this;
	}
	withRelativePaths() {
		this.options.relativePaths = true;
		return this;
	}
	withDirs() {
		this.options.includeDirs = true;
		return this;
	}
	withMaxDepth(depth) {
		this.options.maxDepth = depth;
		return this;
	}
	withMaxFiles(limit) {
		this.options.maxFiles = limit;
		return this;
	}
	withFullPaths() {
		this.options.resolvePaths = true;
		this.options.includeBasePath = true;
		return this;
	}
	withErrors() {
		this.options.suppressErrors = false;
		return this;
	}
	withSymlinks({ resolvePaths = true } = {}) {
		this.options.resolveSymlinks = true;
		this.options.useRealPaths = resolvePaths;
		return this.withFullPaths();
	}
	withAbortSignal(signal) {
		this.options.signal = signal;
		return this;
	}
	normalize() {
		this.options.normalizePath = true;
		return this;
	}
	filter(predicate) {
		this.options.filters.push(predicate);
		return this;
	}
	onlyDirs() {
		this.options.excludeFiles = true;
		this.options.includeDirs = true;
		return this;
	}
	exclude(predicate) {
		this.options.exclude = predicate;
		return this;
	}
	onlyCounts() {
		this.options.onlyCounts = true;
		return this;
	}
	crawl(root) {
		return new APIBuilder(root || ".", this.options);
	}
	withGlobFunction(fn) {
		this.globFunction = fn;
		return this;
	}
	/**
	* @deprecated Pass options using the constructor instead:
	* ```ts
	* new fdir(options).crawl("/path/to/root");
	* ```
	* This method will be removed in v7.0
	*/
	/* c8 ignore next 4 */
	crawlWithOptions(root, options) {
		this.options = {
			...this.options,
			...options
		};
		return new APIBuilder(root || ".", this.options);
	}
	glob(...patterns) {
		if (this.globFunction) return this.globWithOptions(patterns);
		return this.globWithOptions(patterns, ...[{ dot: true }]);
	}
	globWithOptions(patterns, ...options) {
		const globFn = this.globFunction || pm;
		/* c8 ignore next 5 */
		if (!globFn) throw new Error("Please specify a glob function to use glob matching.");
		var isMatch = this.globCache[patterns.join("\0")];
		if (!isMatch) {
			isMatch = globFn(patterns, ...options);
			this.globCache[patterns.join("\0")] = isMatch;
		}
		this.options.filters.push((path$1) => isMatch(path$1));
		return this;
	}
};

//#endregion
exports.fdir = Builder;

let crypto = require('crypto')

let { urlAlphabet } = require('../url-alphabet/index.cjs')

// `crypto.randomFill()` is a little faster than `crypto.randomBytes()`,
// because it is possible to use in combination with `Buffer.allocUnsafe()`.
let random = bytes =>
  new Promise((resolve, reject) => {
    // `Buffer.allocUnsafe()` is faster because it doesn’t flush the memory.
    // Memory flushing is unnecessary since the buffer allocation itself resets
    // the memory with the new bytes.
    crypto.randomFill(Buffer.allocUnsafe(bytes), (err, buf) => {
      if (err) {
        reject(err)
      } else {
        resolve(buf)
      }
    })
  })

let customAlphabet = (alphabet, defaultSize = 21) => {
  // First, a bitmask is necessary to generate the ID. The bitmask makes bytes
  // values closer to the alphabet size. The bitmask calculates the closest
  // `2^31 - 1` number, which exceeds the alphabet size.
  // For example, the bitmask for the alphabet size 30 is 31 (00011111).
  let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  // Though, the bitmask solution is not perfect since the bytes exceeding
  // the alphabet size are refused. Therefore, to reliably generate the ID,
  // the random bytes redundancy has to be satisfied.

  // Note: every hardware random generator call is performance expensive,
  // because the system call for entropy collection takes a lot of time.
  // So, to avoid additional system calls, extra bytes are requested in advance.

  // Next, a step determines how many random bytes to generate.
  // The number of random bytes gets decided upon the ID size, mask,
  // alphabet size, and magic number 1.6 (using 1.6 peaks at performance
  // according to benchmarks).
  let step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)

  let tick = (id, size = defaultSize) =>
    random(step).then(bytes => {
      // A compact alternative for `for (var i = 0; i < step; i++)`.
      let i = step
      while (i--) {
        // Adding `|| ''` refuses a random byte that exceeds the alphabet size.
        id += alphabet[bytes[i] & mask] || ''
        if (id.length >= size) return id
      }
      return tick(id, size)
    })

  return size => tick('', size)
}

let nanoid = (size = 21) =>
  random((size |= 0)).then(bytes => {
    let id = ''
    // A compact alternative for `for (var i = 0; i < step; i++)`.
    while (size--) {
      // It is incorrect to use bytes exceeding the alphabet size.
      // The following mask reduces the random byte in the 0-255 value
      // range to the 0-63 value range. Therefore, adding hacks, such
      // as empty string fallback or magic numbers, is unneccessary because
      // the bitmask trims bytes down to the alphabet size.
      id += urlAlphabet[bytes[size] & 63]
    }
    return id
  })

module.exports = { nanoid, customAlphabet, random }


let crypto = require('crypto')

let { urlAlphabet } = require('./url-alphabet/index.cjs')

// It is best to make fewer, larger requests to the crypto module to
// avoid system call overhead. So, random numbers are generated in a
// pool. The pool is a Buffer that is larger than the initial random
// request size by this multiplier. The pool is enlarged if subsequent
// requests exceed the maximum buffer size.
const POOL_SIZE_MULTIPLIER = 128
let pool, poolOffset

let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER)
    crypto.randomFillSync(pool)
    poolOffset = 0
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool)
    poolOffset = 0
  }
  poolOffset += bytes
}

let random = bytes => {
  // `|=` convert `bytes` to number to prevent `valueOf` abusing and pool pollution
  fillPool((bytes |= 0))
  return pool.subarray(poolOffset - bytes, poolOffset)
}

let customRandom = (alphabet, defaultSize, getRandom) => {
  // First, a bitmask is necessary to generate the ID. The bitmask makes bytes
  // values closer to the alphabet size. The bitmask calculates the closest
  // `2^31 - 1` number, which exceeds the alphabet size.
  // For example, the bitmask for the alphabet size 30 is 31 (00011111).
  let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  // Though, the bitmask solution is not perfect since the bytes exceeding
  // the alphabet size are refused. Therefore, to reliably generate the ID,
  // the random bytes redundancy has to be satisfied.

  // Note: every hardware random generator call is performance expensive,
  // because the system call for entropy collection takes a lot of time.
  // So, to avoid additional system calls, extra bytes are requested in advance.

  // Next, a step determines how many random bytes to generate.
  // The number of random bytes gets decided upon the ID size, mask,
  // alphabet size, and magic number 1.6 (using 1.6 peaks at performance
  // according to benchmarks).
  let step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)

  return (size = defaultSize) => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      // A compact alternative for `for (let i = 0; i < step; i++)`.
      let i = step
      while (i--) {
        // Adding `|| ''` refuses a random byte that exceeds the alphabet size.
        id += alphabet[bytes[i] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}

let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random)

let nanoid = (size = 21) => {
  // `|=` convert `size` to number to prevent `valueOf` abusing and pool pollution
  fillPool((size |= 0))
  let id = ''
  // We are reading directly from the random pool to avoid creating new array
  for (let i = poolOffset - size; i < poolOffset; i++) {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unneccessary because
    // the bitmask trims bytes down to the alphabet size.
    id += urlAlphabet[pool[i] & 63]
  }
  return id
}

module.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random }


// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// References to the same file (works both for gzip and brotli):
// `'use`, `andom`, and `rict'`
// References to the brotli default dictionary:
// `-26T`, `1983`, `40px`, `75px`, `bush`, `jack`, `mind`, `very`, and `wolf`
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

let customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    let id = ''
    // A compact alternative for `for (var i = 0; i < step; i++)`.
    let i = size | 0
    while (i--) {
      // `| 0` is more compact and faster than `Math.floor()`.
      id += alphabet[(Math.random() * alphabet.length) | 0]
    }
    return id
  }
}

let nanoid = (size = 21) => {
  let id = ''
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size | 0
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}

module.exports = { nanoid, customAlphabet }


// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// Same as in non-secure/index.js
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

module.exports = { urlAlphabet }


'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _path = require('./shared/pathe.BSlhyZSM.cjs');

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: void 0, win32: void 0 };
const mix = (del = delimiter) => {
  return new Proxy(_path._path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path._path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

exports.basename = _path.basename;
exports.dirname = _path.dirname;
exports.extname = _path.extname;
exports.format = _path.format;
exports.isAbsolute = _path.isAbsolute;
exports.join = _path.join;
exports.matchesGlob = _path.matchesGlob;
exports.normalize = _path.normalize;
exports.normalizeString = _path.normalizeString;
exports.parse = _path.parse;
exports.relative = _path.relative;
exports.resolve = _path.resolve;
exports.sep = _path.sep;
exports.toNamespacedPath = _path.toNamespacedPath;
exports.default = posix;
exports.delimiter = delimiter;
exports.posix = posix;
exports.win32 = win32;


"use strict";var B=Object.defineProperty;var p=Object.getOwnPropertySymbols;var b=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable;var C=(i,e,E)=>e in i?B(i,e,{enumerable:!0,configurable:!0,writable:!0,value:E}):i[e]=E,A=(i,e)=>{for(var E in e||(e={}))b.call(e,E)&&C(i,E,e[E]);if(p)for(var E of p(e))g.call(e,E)&&C(i,E,e[E]);return i};var O,_,D,a,L,c,S,N,u,P;const r$2=Object.create(null),s=i=>{var e,E;return((e=globalThis.process)==null?void 0:e.env)||void 0||((E=globalThis.Deno)==null?void 0:E.env.toObject())||globalThis.__env__||(i?r$2:globalThis)},env=new Proxy(r$2,{get(i,e){var E;return(E=s()[e])!=null?E:r$2[e]},has(i,e){const E=s();return e in E||e in r$2},set(i,e,E){const n=s(!0);return n[e]=E,!0},deleteProperty(i,e){if(!e)return!1;const E=s(!0);return delete E[e],!0},ownKeys(){const i=s(!0);return Object.keys(i)}}),nodeENV=typeof process<"u"&&process.env&&process.env.NODE_ENV||"",r$1=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:!0}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:!0}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:!0}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:!1}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:!1}],["VERCEL","VERCEL_ENV",{ci:!1}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:!1}],["CODESANDBOX","CODESANDBOX_HOST",{ci:!1}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:!0}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:!0}]];function I(){var i,e,E,n,T,R;if((i=globalThis.process)!=null&&i.env)for(const l of r$1){const d=l[1]||l[0];if((e=globalThis.process)!=null&&e.env[d])return A({name:l[0].toLowerCase()},l[2])}return((n=(E=globalThis.process)==null?void 0:E.env)==null?void 0:n.SHELL)==="/bin/jsh"&&((R=(T=globalThis.process)==null?void 0:T.versions)!=null&&R.webcontainer)?{name:"stackblitz",ci:!1}:{name:"",ci:!1}}const providerInfo=I(),provider=providerInfo.name;function toBoolean(i){return i?i!=="false":!1}const platform=((O=globalThis.process)==null?void 0:O.platform)||"",isCI=toBoolean(env.CI)||providerInfo.ci!==!1,hasTTY=toBoolean(((_=globalThis.process)==null?void 0:_.stdout)&&((D=globalThis.process)==null?void 0:D.stdout.isTTY)),hasWindow=typeof window<"u",isDebug=toBoolean(env.DEBUG),isTest=nodeENV==="test"||toBoolean(env.TEST),isProduction=nodeENV==="production",isDevelopment=nodeENV==="dev"||nodeENV==="development",isMinimal=toBoolean(env.MINIMAL)||isCI||isTest||!hasTTY,isWindows=/^win/i.test(platform),isLinux=/^linux/i.test(platform),isMacOS=/^darwin/i.test(platform),isColorSupported=!toBoolean(env.NO_COLOR)&&(toBoolean(env.FORCE_COLOR)||(hasTTY||isWindows)&&env.TERM!=="dumb"||isCI),nodeVersion=(((L=(a=globalThis.process)==null?void 0:a.versions)==null?void 0:L.node)||"").replace(/^v/,"")||null,nodeMajorVersion=Number(nodeVersion==null?void 0:nodeVersion.split(".")[0])||null,o$1=globalThis.process||Object.create(null),r={versions:{}},process$1=new Proxy(o$1,{get(i,e){if(e==="env")return env;if(e in i)return i[e];if(e in r)return r[e]}}),isNode=((S=(c=globalThis.process)==null?void 0:c.release)==null?void 0:S.name)==="node",isBun=!!globalThis.Bun||!!((u=(N=globalThis.process)==null?void 0:N.versions)!=null&&u.bun),isDeno=!!globalThis.Deno,isFastly=!!globalThis.fastly,isNetlify=!!globalThis.Netlify,isEdgeLight=!!globalThis.EdgeRuntime,isWorkerd=((P=globalThis.navigator)==null?void 0:P.userAgent)==="Cloudflare-Workers",t=[[isNetlify,"netlify"],[isEdgeLight,"edge-light"],[isWorkerd,"workerd"],[isFastly,"fastly"],[isDeno,"deno"],[isBun,"bun"],[isNode,"node"]];function o(){const i=t.find(e=>e[0]);if(i)return{name:i[1]}}const runtimeInfo=o(),runtime=(runtimeInfo==null?void 0:runtimeInfo.name)||"";exports.env=env,exports.hasTTY=hasTTY,exports.hasWindow=hasWindow,exports.isBun=isBun,exports.isCI=isCI,exports.isColorSupported=isColorSupported,exports.isDebug=isDebug,exports.isDeno=isDeno,exports.isDevelopment=isDevelopment,exports.isEdgeLight=isEdgeLight,exports.isFastly=isFastly,exports.isLinux=isLinux,exports.isMacOS=isMacOS,exports.isMinimal=isMinimal,exports.isNetlify=isNetlify,exports.isNode=isNode,exports.isProduction=isProduction,exports.isTest=isTest,exports.isWindows=isWindows,exports.isWorkerd=isWorkerd,exports.nodeENV=nodeENV,exports.nodeMajorVersion=nodeMajorVersion,exports.nodeVersion=nodeVersion,exports.platform=platform,exports.process=process$1,exports.provider=provider,exports.providerInfo=providerInfo,exports.runtime=runtime,exports.runtimeInfo=runtimeInfo;


'use strict';

const jsTokens = require('js-tokens');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const jsTokens__default = /*#__PURE__*/_interopDefaultCompat(jsTokens);

function stripLiteralJsTokens(code, options) {
  const FILL = options?.fillChar ?? " ";
  const FILL_COMMENT = " ";
  let result = "";
  const filter = options?.filter ?? (() => true);
  const tokens = [];
  for (const token of jsTokens__default(code, { jsx: false })) {
    tokens.push(token);
    if (token.type === "SingleLineComment") {
      result += FILL_COMMENT.repeat(token.value.length);
      continue;
    }
    if (token.type === "MultiLineComment") {
      result += token.value.replace(/[^\n]/g, FILL_COMMENT);
      continue;
    }
    if (token.type === "StringLiteral") {
      if (!token.closed) {
        result += token.value;
        continue;
      }
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += token.value[0] + FILL.repeat(body.length) + token.value[token.value.length - 1];
        continue;
      }
    }
    if (token.type === "NoSubstitutionTemplate") {
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "RegularExpressionLiteral") {
      const body = token.value;
      if (filter(body)) {
        result += body.replace(/\/(.*)\/(\w?)$/g, (_, $1, $2) => `/${FILL.repeat($1.length)}/${$2}`);
        continue;
      }
    }
    if (token.type === "TemplateHead") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    if (token.type === "TemplateTail") {
      const body = token.value.slice(0, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "TemplateMiddle") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    result += token.value;
  }
  return {
    result,
    tokens
  };
}

function stripLiteral(code, options) {
  return stripLiteralDetailed(code, options).result;
}
function stripLiteralDetailed(code, options) {
  return stripLiteralJsTokens(code, options);
}

exports.stripLiteral = stripLiteral;
exports.stripLiteralDetailed = stripLiteralDetailed;
exports.stripLiteralJsTokens = stripLiteralJsTokens;


"use strict";
var x = Object.defineProperty;
var G = Object.getOwnPropertyDescriptor;
var J = Object.getOwnPropertyNames;
var U = Object.prototype.hasOwnProperty;
var q = (n) => {
  throw TypeError(n);
};
var W = (n, s, t) => s in n ? x(n, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[s] = t;
var X = (n, s) => {
  for (var t in s)
    x(n, t, { get: s[t], enumerable: !0 });
}, Z = (n, s, t, e) => {
  if (s && typeof s == "object" || typeof s == "function")
    for (let r of J(s))
      !U.call(n, r) && r !== t && x(n, r, { get: () => s[r], enumerable: !(e = G(s, r)) || e.enumerable });
  return n;
};
var tt = (n) => Z(x({}, "__esModule", { value: !0 }), n);
var M = (n, s, t) => W(n, typeof s != "symbol" ? s + "" : s, t), S = (n, s, t) => s.has(n) || q("Cannot " + t);
var d = (n, s, t) => (S(n, s, "read from private field"), t ? t.call(n) : s.get(n)), L = (n, s, t) => s.has(n) ? q("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(n) : s.set(n, t), f = (n, s, t, e) => (S(n, s, "write to private field"), e ? e.call(n, t) : s.set(n, t), t);
var N = (n, s, t, e) => ({
  set _(r) {
    f(n, s, r, t);
  },
  get _() {
    return d(n, s, e);
  }
});

// src/index.ts
var ot = {};
X(ot, {
  Bench: () => k,
  Task: () => v,
  hrtimeNow: () => z,
  now: () => A
});
module.exports = tt(ot);

// node_modules/.pnpm/yocto-queue@1.0.0/node_modules/yocto-queue/index.js
var B = class {
  constructor(s) {
    M(this, "value");
    M(this, "next");
    this.value = s;
  }
}, m, E, b, g = class {
  constructor() {
    L(this, m);
    L(this, E);
    L(this, b);
    this.clear();
  }
  enqueue(s) {
    let t = new B(s);
    d(this, m) ? (d(this, E).next = t, f(this, E, t)) : (f(this, m, t), f(this, E, t)), N(this, b)._++;
  }
  dequeue() {
    let s = d(this, m);
    if (s)
      return f(this, m, d(this, m).next), N(this, b)._--, s.value;
  }
  clear() {
    f(this, m, void 0), f(this, E, void 0), f(this, b, 0);
  }
  get size() {
    return d(this, b);
  }
  *[Symbol.iterator]() {
    let s = d(this, m);
    for (; s; )
      yield s.value, s = s.next;
  }
};
m = new WeakMap(), E = new WeakMap(), b = new WeakMap();

// node_modules/.pnpm/p-limit@4.0.0/node_modules/p-limit/index.js
function y(n) {
  if (!((Number.isInteger(n) || n === Number.POSITIVE_INFINITY) && n > 0))
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  let s = new g(), t = 0, e = () => {
    t--, s.size > 0 && s.dequeue()();
  }, r = async (h, p, a) => {
    t++;
    let l = (async () => h(...a))();
    p(l);
    try {
      await l;
    } catch (T) {
    }
    e();
  }, i = (h, p, a) => {
    s.enqueue(r.bind(void 0, h, p, a)), (async () => (await Promise.resolve(), t < n && s.size > 0 && s.dequeue()()))();
  }, c = (h, ...p) => new Promise((a) => {
    i(h, a, p);
  });
  return Object.defineProperties(c, {
    activeCount: {
      get: () => t
    },
    pendingCount: {
      get: () => s.size
    },
    clearQueue: {
      value: () => {
        s.clear();
      }
    }
  }), c;
}

// src/event.ts
function o(n, s = null) {
  let t = new Event(n);
  return s && Object.defineProperty(t, "task", {
    value: s,
    enumerable: !0,
    writable: !1,
    configurable: !1
  }), t;
}

// src/constants.ts
var et = {
  1: 12.71,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228,
  11: 2.201,
  12: 2.179,
  13: 2.16,
  14: 2.145,
  15: 2.131,
  16: 2.12,
  17: 2.11,
  18: 2.101,
  19: 2.093,
  20: 2.086,
  21: 2.08,
  22: 2.074,
  23: 2.069,
  24: 2.064,
  25: 2.06,
  26: 2.056,
  27: 2.052,
  28: 2.048,
  29: 2.045,
  30: 2.042,
  31: 2.0399,
  32: 2.0378,
  33: 2.0357,
  34: 2.0336,
  35: 2.0315,
  36: 2.0294,
  37: 2.0273,
  38: 2.0252,
  39: 2.0231,
  40: 2.021,
  41: 2.0198,
  42: 2.0186,
  43: 2.0174,
  44: 2.0162,
  45: 2.015,
  46: 2.0138,
  47: 2.0126,
  48: 2.0114,
  49: 2.0102,
  50: 2.009,
  51: 2.0081,
  52: 2.0072,
  53: 2.0063,
  54: 2.0054,
  55: 2.0045,
  56: 2.0036,
  57: 2.0027,
  58: 2.0018,
  59: 2.0009,
  60: 2,
  61: 1.9995,
  62: 1.999,
  63: 1.9985,
  64: 1.998,
  65: 1.9975,
  66: 1.997,
  67: 1.9965,
  68: 1.996,
  69: 1.9955,
  70: 1.995,
  71: 1.9945,
  72: 1.994,
  73: 1.9935,
  74: 1.993,
  75: 1.9925,
  76: 1.992,
  77: 1.9915,
  78: 1.991,
  79: 1.9905,
  80: 1.99,
  81: 1.9897,
  82: 1.9894,
  83: 1.9891,
  84: 1.9888,
  85: 1.9885,
  86: 1.9882,
  87: 1.9879,
  88: 1.9876,
  89: 1.9873,
  90: 1.987,
  91: 1.9867,
  92: 1.9864,
  93: 1.9861,
  94: 1.9858,
  95: 1.9855,
  96: 1.9852,
  97: 1.9849,
  98: 1.9846,
  99: 1.9843,
  100: 1.984,
  101: 1.9838,
  102: 1.9836,
  103: 1.9834,
  104: 1.9832,
  105: 1.983,
  106: 1.9828,
  107: 1.9826,
  108: 1.9824,
  109: 1.9822,
  110: 1.982,
  111: 1.9818,
  112: 1.9816,
  113: 1.9814,
  114: 1.9812,
  115: 1.9819,
  116: 1.9808,
  117: 1.9806,
  118: 1.9804,
  119: 1.9802,
  120: 1.98,
  infinity: 1.96
}, P = et;

// src/utils.ts
var st = (n) => n / 1e6, z = () => st(Number(process.hrtime.bigint())), A = () => performance.now();
function nt(n) {
  return n !== null && typeof n == "object" && typeof n.then == "function";
}
var j = (n, s) => n.reduce((e, r) => e + (r - s) ** 2, 0) / (n.length - 1) || 0, rt = (async () => {
}).constructor, it = (n) => n.constructor === rt, H = async (n) => {
  if (it(n.fn))
    return !0;
  try {
    if (n.opts.beforeEach != null)
      try {
        await n.opts.beforeEach.call(n);
      } catch (e) {
      }
    let s = n.fn(), t = nt(s);
    if (t)
      try {
        await s;
      } catch (e) {
      }
    if (n.opts.afterEach != null)
      try {
        await n.opts.afterEach.call(n);
      } catch (e) {
      }
    return t;
  } catch (s) {
    return !1;
  }
};

// src/task.ts
var v = class extends EventTarget {
  constructor(t, e, r, i = {}) {
    super();
    /*
     * the number of times the task
     * function has been executed
     */
    this.runs = 0;
    this.bench = t, this.name = e, this.fn = r, this.opts = i;
  }
  async loop(t, e) {
    var T;
    let r = this.bench.concurrency === "task", { threshold: i } = this.bench, c = 0, h = [];
    if (this.opts.beforeAll != null)
      try {
        await this.opts.beforeAll.call(this);
      } catch (u) {
        return { error: u };
      }
    let p = await H(this), a = async () => {
      this.opts.beforeEach != null && await this.opts.beforeEach.call(this);
      let u = 0;
      if (p) {
        let w = this.bench.now();
        await this.fn.call(this), u = this.bench.now() - w;
      } else {
        let w = this.bench.now();
        this.fn.call(this), u = this.bench.now() - w;
      }
      h.push(u), c += u, this.opts.afterEach != null && await this.opts.afterEach.call(this);
    }, l = y(i);
    try {
      let u = [];
      for (; (c < t || h.length + l.activeCount + l.pendingCount < e) && !((T = this.bench.signal) != null && T.aborted); )
        r ? u.push(l(a)) : await a();
      u.length && await Promise.all(u);
    } catch (u) {
      return { error: u };
    }
    if (this.opts.afterAll != null)
      try {
        await this.opts.afterAll.call(this);
      } catch (u) {
        return { error: u };
      }
    return { samples: h };
  }
  /**
   * run the current task and write the results in `Task.result` object
   */
  async run() {
    var r, i;
    if ((r = this.result) != null && r.error)
      return this;
    this.dispatchEvent(o("start", this)), await this.bench.setup(this, "run");
    let { samples: t, error: e } = await this.loop(this.bench.time, this.bench.iterations);
    if (this.bench.teardown(this, "run"), t) {
      let c = t.reduce((O, F) => O + F, 0);
      this.runs = t.length, t.sort((O, F) => O - F);
      let h = c / this.runs, p = 1e3 / h, a = t.length, l = a - 1, T = t[0], u = t[l], w = c / t.length || 0, R = j(t, w), I = Math.sqrt(R), _ = I / Math.sqrt(a), K = P[String(Math.round(l) || 1)] || P.infinity, C = _ * K, V = C / w * 100, Q = t[Math.ceil(a * 0.75) - 1], Y = t[Math.ceil(a * 0.99) - 1], $ = t[Math.ceil(a * 0.995) - 1], D = t[Math.ceil(a * 0.999) - 1];
      if ((i = this.bench.signal) != null && i.aborted)
        return this;
      this.setResult({
        totalTime: c,
        min: T,
        max: u,
        hz: p,
        period: h,
        samples: t,
        mean: w,
        variance: R,
        sd: I,
        sem: _,
        df: l,
        critical: K,
        moe: C,
        rme: V,
        p75: Q,
        p99: Y,
        p995: $,
        p999: D
      });
    }
    if (e) {
      if (this.setResult({ error: e }), this.bench.throws)
        throw e;
      this.dispatchEvent(o("error", this)), this.bench.dispatchEvent(o("error", this));
    }
    return this.dispatchEvent(o("cycle", this)), this.bench.dispatchEvent(o("cycle", this)), this.dispatchEvent(o("complete", this)), this;
  }
  /**
   * warmup the current task
   */
  async warmup() {
    var e;
    if ((e = this.result) != null && e.error)
      return;
    this.dispatchEvent(o("warmup", this)), await this.bench.setup(this, "warmup");
    let { error: t } = await this.loop(this.bench.warmupTime, this.bench.warmupIterations);
    if (this.bench.teardown(this, "warmup"), t && (this.setResult({ error: t }), this.bench.throws))
      throw t;
  }
  addEventListener(t, e, r) {
    super.addEventListener(t, e, r);
  }
  removeEventListener(t, e, r) {
    super.removeEventListener(t, e, r);
  }
  /**
   * change the result object values
   */
  setResult(t) {
    this.result = { ...this.result, ...t }, Object.freeze(this.result);
  }
  /**
   * reset the task to make the `Task.runs` a zero-value and remove the `Task.result`
   * object
   */
  reset() {
    this.dispatchEvent(o("reset", this)), this.runs = 0, this.result = void 0;
  }
};

// src/bench.ts
var k = class extends EventTarget {
  constructor(t = {}) {
    var e, r, i, c, h, p, a, l;
    super();
    /*
     * @private the task map
     */
    this._tasks = /* @__PURE__ */ new Map();
    this._todos = /* @__PURE__ */ new Map();
    /**
    * Executes tasks concurrently based on the specified concurrency mode.
    *
    * - When `mode` is set to `null` (default), concurrency is disabled.
    * - When `mode` is set to 'task', each task's iterations (calls of a task function) run concurrently.
    * - When `mode` is set to 'bench', different tasks within the bench run concurrently.
    */
    this.concurrency = null;
    /**
     * The maximum number of concurrent tasks to run. Defaults to Infinity.
     */
    this.threshold = 1 / 0;
    this.warmupTime = 100;
    this.warmupIterations = 5;
    this.time = 500;
    this.iterations = 10;
    this.now = A;
    this.now = (e = t.now) != null ? e : this.now, this.warmupTime = (r = t.warmupTime) != null ? r : this.warmupTime, this.warmupIterations = (i = t.warmupIterations) != null ? i : this.warmupIterations, this.time = (c = t.time) != null ? c : this.time, this.iterations = (h = t.iterations) != null ? h : this.iterations, this.signal = t.signal, this.throws = (p = t.throws) != null ? p : !1, this.setup = (a = t.setup) != null ? a : () => {
    }, this.teardown = (l = t.teardown) != null ? l : () => {
    }, this.signal && this.signal.addEventListener(
      "abort",
      () => {
        this.dispatchEvent(o("abort"));
      },
      { once: !0 }
    );
  }
  runTask(t) {
    var e;
    return (e = this.signal) != null && e.aborted ? t : t.run();
  }
  /**
   * run the added tasks that were registered using the
   * {@link add} method.
   * Note: This method does not do any warmup. Call {@link warmup} for that.
   */
  async run() {
    if (this.concurrency === "bench")
      return this.runConcurrently(this.threshold, this.concurrency);
    this.dispatchEvent(o("start"));
    let t = [];
    for (let e of [...this._tasks.values()])
      t.push(await this.runTask(e));
    return this.dispatchEvent(o("complete")), t;
  }
  /**
   * See Bench.{@link concurrency}
   */
  async runConcurrently(t = 1 / 0, e = "bench") {
    if (this.threshold = t, this.concurrency = e, e === "task")
      return this.run();
    this.dispatchEvent(o("start"));
    let r = y(t), i = [];
    for (let h of [...this._tasks.values()])
      i.push(r(() => this.runTask(h)));
    let c = await Promise.all(i);
    return this.dispatchEvent(o("complete")), c;
  }
  /**
   * warmup the benchmark tasks.
   * This is not run by default by the {@link run} method.
   */
  async warmup() {
    if (this.concurrency === "bench") {
      await this.warmupConcurrently(this.threshold, this.concurrency);
      return;
    }
    this.dispatchEvent(o("warmup"));
    for (let [, t] of this._tasks)
      await t.warmup();
  }
  /**
   * warmup the benchmark tasks concurrently.
   * This is not run by default by the {@link runConcurrently} method.
   */
  async warmupConcurrently(t = 1 / 0, e = "bench") {
    if (this.threshold = t, this.concurrency = e, e === "task") {
      await this.warmup();
      return;
    }
    this.dispatchEvent(o("warmup"));
    let r = y(t), i = [];
    for (let [, c] of this._tasks)
      i.push(r(() => c.warmup()));
    await Promise.all(i);
  }
  /**
   * reset each task and remove its result
   */
  reset() {
    this.dispatchEvent(o("reset")), this._tasks.forEach((t) => {
      t.reset();
    });
  }
  /**
   * add a benchmark task to the task map
   */
  add(t, e, r = {}) {
    let i = new v(this, t, e, r);
    return this._tasks.set(t, i), this.dispatchEvent(o("add", i)), this;
  }
  /**
   * add a benchmark todo to the todo map
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  todo(t, e = () => {
  }, r = {}) {
    let i = new v(this, t, e, r);
    return this._todos.set(t, i), this.dispatchEvent(o("todo", i)), this;
  }
  /**
   * remove a benchmark task from the task map
   */
  remove(t) {
    let e = this.getTask(t);
    return e && (this.dispatchEvent(o("remove", e)), this._tasks.delete(t)), this;
  }
  addEventListener(t, e, r) {
    super.addEventListener(t, e, r);
  }
  removeEventListener(t, e, r) {
    super.removeEventListener(t, e, r);
  }
  /**
   * table of the tasks results
   */
  table(t) {
    return this.tasks.map((e) => {
      if (e.result) {
        if (e.result.error)
          throw e.result.error;
        return (t == null ? void 0 : t(e)) || {
          "Task Name": e.name,
          "ops/sec": e.result.error ? "NaN" : parseInt(e.result.hz.toString(), 10).toLocaleString(),
          "Average Time (ns)": e.result.error ? "NaN" : e.result.mean * 1e3 * 1e3,
          Margin: e.result.error ? "NaN" : `\xB1${e.result.rme.toFixed(2)}%`,
          Samples: e.result.error ? "NaN" : e.result.samples.length
        };
      }
      return null;
    });
  }
  /**
   * (getter) tasks results as an array
   */
  get results() {
    return [...this._tasks.values()].map((t) => t.result);
  }
  /**
   * (getter) tasks as an array
   */
  get tasks() {
    return [...this._tasks.values()];
  }
  get todos() {
    return [...this._todos.values()];
  }
  /**
   * get a task based on the task name
   */
  getTask(t) {
    return this._tasks.get(t);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bench,
  Task,
  hrtimeNow,
  now
});


'use strict';



throw new Error(
  'Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.'
  + '\n\nIf you are using "import" in your source code, then it\'s possible it was bundled into require() automatically by your bundler. '
  + 'In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.',
)
