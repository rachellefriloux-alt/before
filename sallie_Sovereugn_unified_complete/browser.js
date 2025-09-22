export { M as ModuleMocker, c as createCompilerHints } from './chunk-mocker.js';
import { M as MockerRegistry } from './chunk-registry.js';
import { c as createManualModuleSource, a as cleanUrl } from './chunk-utils.js';
export { M as ModuleMockerServerInterceptor } from './chunk-interceptor-native.js';
import './index.js';
import './chunk-pathe.M-eThtNZ.js';

class ModuleMockerMSWInterceptor {
	mocks = new MockerRegistry();
	startPromise;
	worker;
	constructor(options = {}) {
		this.options = options;
		if (!options.globalThisAccessor) {
			options.globalThisAccessor = "\"__vitest_mocker__\"";
		}
	}
	async register(module) {
		await this.init();
		this.mocks.add(module);
	}
	async delete(url) {
		await this.init();
		this.mocks.delete(url);
	}
	async invalidate() {
		this.mocks.clear();
	}
	async resolveManualMock(mock) {
		const exports = Object.keys(await mock.resolve());
		const text = createManualModuleSource(mock.url, exports, this.options.globalThisAccessor);
		return new Response(text, { headers: { "Content-Type": "application/javascript" } });
	}
	async init() {
		if (this.worker) {
			return this.worker;
		}
		if (this.startPromise) {
			return this.startPromise;
		}
		const worker = this.options.mswWorker;
		this.startPromise = Promise.all([worker ? { setupWorker(handler) {
			worker.use(handler);
			return worker;
		} } : import('msw/browser'), import('msw/core/http')]).then(([{ setupWorker }, { http }]) => {
			const worker = setupWorker(http.get(/.+/, async ({ request }) => {
				const path = cleanQuery(request.url.slice(location.origin.length));
				if (!this.mocks.has(path)) {
					return passthrough();
				}
				const mock = this.mocks.get(path);
				switch (mock.type) {
					case "manual": return this.resolveManualMock(mock);
					case "automock":
					case "autospy": return Response.redirect(injectQuery(path, `mock=${mock.type}`));
					case "redirect": return Response.redirect(mock.redirect);
					default: throw new Error(`Unknown mock type: ${mock.type}`);
				}
			}));
			return worker.start(this.options.mswOptions).then(() => worker);
		}).finally(() => {
			this.worker = worker;
			this.startPromise = undefined;
		});
		return await this.startPromise;
	}
}
const trailingSeparatorRE = /[?&]$/;
const timestampRE = /\bt=\d{13}&?\b/;
const versionRE = /\bv=\w{8}&?\b/;
function cleanQuery(url) {
	return url.replace(timestampRE, "").replace(versionRE, "").replace(trailingSeparatorRE, "");
}
function passthrough() {
	return new Response(null, {
		status: 302,
		statusText: "Passthrough",
		headers: { "x-msw-intention": "passthrough" }
	});
}
const replacePercentageRE = /%/g;
function injectQuery(url, queryToInject) {
	// encode percents for consistent behavior with pathToFileURL
	// see #2614 for details
	const resolvedUrl = new URL(url.replace(replacePercentageRE, "%25"), location.href);
	const { search, hash } = resolvedUrl;
	const pathname = cleanUrl(url);
	return `${pathname}?${queryToInject}${search ? `&${search.slice(1)}` : ""}${hash ?? ""}`;
}

export { ModuleMockerMSWInterceptor };


/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	let m;

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	// eslint-disable-next-line no-return-assign
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


import {
  a as t,
  b as o,
  c as r
} from "./chunk-BVHSVHOK.js";

// src/browser.ts
function p() {
  return o();
}
function a() {
  return r();
}
var s = r();
export {
  a as createColors,
  s as default,
  t as getDefaultColors,
  p as isSupported
};


export { l as loadDiffConfig, b as loadSnapshotSerializers, c as setupCommonEnv, s as startCoverageInsideWorker, a as stopCoverageInsideWorker, t as takeCoverageInsideWorker } from './chunks/setup-common.Dd054P77.js';
export { collectTests, processError, startTests } from '@vitest/runner';
import * as spy from '@vitest/spy';
export { spy as SpyModule };
export { format, getSafeTimers, inspect, stringify } from '@vitest/utils';
export { TraceMap, originalPositionFor } from '@vitest/utils/source-map';
import './chunks/coverage.DVF1vEu8.js';
import '@vitest/snapshot';


export { M as ModuleMocker, c as createCompilerHints } from './chunk-mocker.js';
import { M as MockerRegistry } from './chunk-registry.js';
import { c as createManualModuleSource, a as cleanUrl } from './chunk-utils.js';
export { M as ModuleMockerServerInterceptor } from './chunk-interceptor-native.js';
import './index.js';
import './chunk-pathe.M-eThtNZ.js';

class ModuleMockerMSWInterceptor {
	mocks = new MockerRegistry();
	startPromise;
	worker;
	constructor(options = {}) {
		this.options = options;
		if (!options.globalThisAccessor) {
			options.globalThisAccessor = "\"__vitest_mocker__\"";
		}
	}
	async register(module) {
		await this.init();
		this.mocks.add(module);
	}
	async delete(url) {
		await this.init();
		this.mocks.delete(url);
	}
	async invalidate() {
		this.mocks.clear();
	}
	async resolveManualMock(mock) {
		const exports = Object.keys(await mock.resolve());
		const text = createManualModuleSource(mock.url, exports, this.options.globalThisAccessor);
		return new Response(text, { headers: { "Content-Type": "application/javascript" } });
	}
	async init() {
		if (this.worker) {
			return this.worker;
		}
		if (this.startPromise) {
			return this.startPromise;
		}
		const worker = this.options.mswWorker;
		this.startPromise = Promise.all([worker ? { setupWorker(handler) {
			worker.use(handler);
			return worker;
		} } : import('msw/browser'), import('msw/core/http')]).then(([{ setupWorker }, { http }]) => {
			const worker = setupWorker(http.get(/.+/, async ({ request }) => {
				const path = cleanQuery(request.url.slice(location.origin.length));
				if (!this.mocks.has(path)) {
					return passthrough();
				}
				const mock = this.mocks.get(path);
				switch (mock.type) {
					case "manual": return this.resolveManualMock(mock);
					case "automock":
					case "autospy": return Response.redirect(injectQuery(path, `mock=${mock.type}`));
					case "redirect": return Response.redirect(mock.redirect);
					default: throw new Error(`Unknown mock type: ${mock.type}`);
				}
			}));
			return worker.start(this.options.mswOptions).then(() => worker);
		}).finally(() => {
			this.worker = worker;
			this.startPromise = undefined;
		});
		return await this.startPromise;
	}
}
const trailingSeparatorRE = /[?&]$/;
const timestampRE = /\bt=\d{13}&?\b/;
const versionRE = /\bv=\w{8}&?\b/;
function cleanQuery(url) {
	return url.replace(timestampRE, "").replace(versionRE, "").replace(trailingSeparatorRE, "");
}
function passthrough() {
	return new Response(null, {
		status: 302,
		statusText: "Passthrough",
		headers: { "x-msw-intention": "passthrough" }
	});
}
const replacePercentageRE = /%/g;
function injectQuery(url, queryToInject) {
	// encode percents for consistent behavior with pathToFileURL
	// see #2614 for details
	const resolvedUrl = new URL(url.replace(replacePercentageRE, "%25"), location.href);
	const { search, hash } = resolvedUrl;
	const pathname = cleanUrl(url);
	return `${pathname}?${queryToInject}${search ? `&${search.slice(1)}` : ""}${hash ?? ""}`;
}

export { ModuleMockerMSWInterceptor };


/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	let m;

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	// eslint-disable-next-line no-return-assign
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


'use strict';
module.exports = {
	stdout: false,
	stderr: false
};


import {
  a as t,
  b as o,
  c as r
} from "./chunk-BVHSVHOK.js";

// src/browser.ts
function p() {
  return o();
}
function a() {
  return r();
}
var s = r();
export {
  a as createColors,
  s as default,
  t as getDefaultColors,
  p as isSupported
};



/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}


export { l as loadDiffConfig, b as loadSnapshotSerializers, c as setupCommonEnv, s as startCoverageInsideWorker, a as stopCoverageInsideWorker, t as takeCoverageInsideWorker } from './chunks/setup-common.Dd054P77.js';
export { collectTests, processError, startTests } from '@vitest/runner';
import * as spy from '@vitest/spy';
export { spy as SpyModule };
export { format, getSafeTimers, inspect, stringify } from '@vitest/utils';
export { TraceMap, originalPositionFor } from '@vitest/utils/source-map';
import './chunks/coverage.DVF1vEu8.js';
import '@vitest/snapshot';
