"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.path = exports.createPathTagFunction = void 0;
exports.encodeURIPath = encodeURIPath;
const error_1 = require("../../core/error.js");
/**
 * Percent-encode everything that isn't safe to have in a path without encoding safe chars.
 *
 * Taken from https://datatracker.ietf.org/doc/html/rfc3986#section-3.3:
 * > unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
 * > sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * > pchar       = unreserved / pct-encoded / sub-delims / ":" / "@"
 */
function encodeURIPath(str) {
    return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path(statics, ...params) {
    // If there are no params, no processing is needed.
    if (statics.length === 1)
        return statics[0];
    let postPath = false;
    const invalidSegments = [];
    const path = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
            postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)('' + value);
        if (index !== params.length &&
            (value == null ||
                (typeof value === 'object' &&
                    // handle values from other realms
                    value.toString ===
                        Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)
                            ?.toString))) {
            encoded = value + '';
            invalidSegments.push({
                start: previousValue.length + currentValue.length,
                length: encoded.length,
                error: `Value of type ${Object.prototype.toString
                    .call(value)
                    .slice(8, -1)} is not a valid path parameter`,
            });
        }
        return previousValue + currentValue + (index === params.length ? '' : encoded);
    }, '');
    const pathOnly = path.split(/[?#]/, 1)[0];
    const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
    let match;
    // Find all invalid segments
    while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
            start: match.index,
            length: match[0].length,
            error: `Value "${match[0]}" can\'t be safely passed as a path parameter`,
        });
    }
    invalidSegments.sort((a, b) => a.start - b.start);
    if (invalidSegments.length > 0) {
        let lastEnd = 0;
        const underline = invalidSegments.reduce((acc, segment) => {
            const spaces = ' '.repeat(segment.start - lastEnd);
            const arrows = '^'.repeat(segment.length);
            lastEnd = segment.start + segment.length;
            return acc + spaces + arrows;
        }, '');
        throw new error_1.OpenAIError(`Path parameters result in path with invalid segments:\n${invalidSegments
            .map((e) => e.error)
            .join('\n')}\n${path}\n${underline}`);
    }
    return path;
};
exports.createPathTagFunction = createPathTagFunction;
/**
 * URI-encodes path params and ensures no unsafe /./ or /../ path segments are introduced.
 */
exports.path = (0, exports.createPathTagFunction)(encodeURIPath);
//# sourceMappingURL=path.js.map

import { resolve } from 'node:path';
import url from 'node:url';

const rootDir = resolve(url.fileURLToPath(import.meta.url), "../../");
const distDir = resolve(url.fileURLToPath(import.meta.url), "../../dist");

export { distDir, rootDir };


/**
 * @fileoverview The Path class.
 * @author Nicholas C. Zakas
 */

/* globals URL */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef{import("@humanfs/types").HfsImpl} HfsImpl */
/** @typedef{import("@humanfs/types").HfsDirectoryEntry} HfsDirectoryEntry */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Normalizes a path to use forward slashes.
 * @param {string} filePath The path to normalize.
 * @returns {string} The normalized path.
 */
function normalizePath(filePath) {
	let startIndex = 0;
	let endIndex = filePath.length;

	if (/[a-z]:\//i.test(filePath)) {
		startIndex = 3;
	}

	if (filePath.startsWith("./")) {
		startIndex = 2;
	}

	if (filePath.startsWith("/")) {
		startIndex = 1;
	}

	if (filePath.endsWith("/")) {
		endIndex = filePath.length - 1;
	}

	return filePath.slice(startIndex, endIndex).replace(/\\/g, "/");
}

/**
 * Asserts that the given name is a non-empty string, no equal to "." or "..",
 * and does not contain a forward slash or backslash.
 * @param {string} name The name to check.
 * @returns {void}
 * @throws {TypeError} When name is not valid.
 */
function assertValidName(name) {
	if (typeof name !== "string") {
		throw new TypeError("name must be a string");
	}

	if (!name) {
		throw new TypeError("name cannot be empty");
	}

	if (name === ".") {
		throw new TypeError(`name cannot be "."`);
	}

	if (name === "..") {
		throw new TypeError(`name cannot be ".."`);
	}

	if (name.includes("/") || name.includes("\\")) {
		throw new TypeError(
			`name cannot contain a slash or backslash: "${name}"`,
		);
	}
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export class Path {
	/**
	 * The steps in the path.
	 * @type {Array<string>}
	 */
	#steps;

	/**
	 * Creates a new instance.
	 * @param {Iterable<string>} [steps] The steps to use for the path.
	 * @throws {TypeError} When steps is not iterable.
	 */
	constructor(steps = []) {
		if (typeof steps[Symbol.iterator] !== "function") {
			throw new TypeError("steps must be iterable");
		}

		this.#steps = [...steps];
		this.#steps.forEach(assertValidName);
	}

	/**
	 * Adds steps to the end of the path.
	 * @param  {...string} steps The steps to add to the path.
	 * @returns {void}
	 */
	push(...steps) {
		steps.forEach(assertValidName);
		this.#steps.push(...steps);
	}

	/**
	 * Removes the last step from the path.
	 * @returns {string} The last step in the path.
	 */
	pop() {
		return this.#steps.pop();
	}

	/**
	 * Returns an iterator for steps in the path.
	 * @returns {IterableIterator<string>} An iterator for the steps in the path.
	 */
	steps() {
		return this.#steps.values();
	}

	/**
	 * Returns an iterator for the steps in the path.
	 * @returns {IterableIterator<string>} An iterator for the steps in the path.
	 */
	[Symbol.iterator]() {
		return this.steps();
	}

	/**
	 * Retrieves the name (the last step) of the path.
	 * @type {string}
	 */
	get name() {
		return this.#steps[this.#steps.length - 1];
	}

	/**
	 * Sets the name (the last step) of the path.
	 * @type {string}
	 */
	set name(value) {
		assertValidName(value);
		this.#steps[this.#steps.length - 1] = value;
	}

	/**
	 * Retrieves the size of the path.
	 * @type {number}
	 */
	get size() {
		return this.#steps.length;
	}

	/**
	 * Returns the path as a string.
	 * @returns {string} The path as a string.
	 */
	toString() {
		return this.#steps.join("/");
	}

	/**
	 * Creates a new path based on the argument type. If the argument is a string,
	 * it is assumed to be a file or directory path and is converted to a Path
	 * instance. If the argument is a URL, it is assumed to be a file URL and is
	 * converted to a Path instance. If the argument is a Path instance, it is
	 * copied into a new Path instance. If the argument is an array, it is assumed
	 * to be the steps of a path and is used to create a new Path instance.
	 * @param {string|URL|Path|Array<string>} pathish The value to convert to a Path instance.
	 * @returns {Path} A new Path instance.
	 * @throws {TypeError} When pathish is not a string, URL, Path, or Array.
	 * @throws {TypeError} When pathish is a string and is empty.
	 */
	static from(pathish) {
		if (typeof pathish === "string") {
			if (!pathish) {
				throw new TypeError("argument cannot be empty");
			}

			return Path.fromString(pathish);
		}

		if (pathish instanceof URL) {
			return Path.fromURL(pathish);
		}

		if (pathish instanceof Path || Array.isArray(pathish)) {
			return new Path(pathish);
		}

		throw new TypeError("argument must be a string, URL, Path, or Array");
	}

	/**
	 * Creates a new Path instance from a string.
	 * @param {string} fileOrDirPath The file or directory path to convert.
	 * @returns {Path} A new Path instance.
	 * @deprecated Use Path.from() instead.
	 */
	static fromString(fileOrDirPath) {
		return new Path(normalizePath(fileOrDirPath).split("/"));
	}

	/**
	 * Creates a new Path instance from a URL.
	 * @param {URL} url The URL to convert.
	 * @returns {Path} A new Path instance.
	 * @throws {TypeError} When url is not a URL instance.
	 * @throws {TypeError} When url.pathname is empty.
	 * @throws {TypeError} When url.protocol is not "file:".
	 * @deprecated Use Path.from() instead.
	 */
	static fromURL(url) {
		if (!(url instanceof URL)) {
			throw new TypeError("url must be a URL instance");
		}

		if (!url.pathname || url.pathname === "/") {
			throw new TypeError("url.pathname cannot be empty");
		}

		if (url.protocol !== "file:") {
			throw new TypeError(`url.protocol must be "file:"`);
		}

		// Remove leading slash in pathname
		return new Path(normalizePath(url.pathname.slice(1)).split("/"));
	}
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.path = exports.createPathTagFunction = void 0;
exports.encodeURIPath = encodeURIPath;
const error_1 = require("../../core/error.js");
/**
 * Percent-encode everything that isn't safe to have in a path without encoding safe chars.
 *
 * Taken from https://datatracker.ietf.org/doc/html/rfc3986#section-3.3:
 * > unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
 * > sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * > pchar       = unreserved / pct-encoded / sub-delims / ":" / "@"
 */
function encodeURIPath(str) {
    return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path(statics, ...params) {
    // If there are no params, no processing is needed.
    if (statics.length === 1)
        return statics[0];
    let postPath = false;
    const invalidSegments = [];
    const path = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
            postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)('' + value);
        if (index !== params.length &&
            (value == null ||
                (typeof value === 'object' &&
                    // handle values from other realms
                    value.toString ===
                        Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)
                            ?.toString))) {
            encoded = value + '';
            invalidSegments.push({
                start: previousValue.length + currentValue.length,
                length: encoded.length,
                error: `Value of type ${Object.prototype.toString
                    .call(value)
                    .slice(8, -1)} is not a valid path parameter`,
            });
        }
        return previousValue + currentValue + (index === params.length ? '' : encoded);
    }, '');
    const pathOnly = path.split(/[?#]/, 1)[0];
    const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
    let match;
    // Find all invalid segments
    while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
            start: match.index,
            length: match[0].length,
            error: `Value "${match[0]}" can\'t be safely passed as a path parameter`,
        });
    }
    invalidSegments.sort((a, b) => a.start - b.start);
    if (invalidSegments.length > 0) {
        let lastEnd = 0;
        const underline = invalidSegments.reduce((acc, segment) => {
            const spaces = ' '.repeat(segment.start - lastEnd);
            const arrows = '^'.repeat(segment.length);
            lastEnd = segment.start + segment.length;
            return acc + spaces + arrows;
        }, '');
        throw new error_1.OpenAIError(`Path parameters result in path with invalid segments:\n${invalidSegments
            .map((e) => e.error)
            .join('\n')}\n${path}\n${underline}`);
    }
    return path;
};
exports.createPathTagFunction = createPathTagFunction;
/**
 * URI-encodes path params and ensures no unsafe /./ or /../ path segments are introduced.
 */
exports.path = (0, exports.createPathTagFunction)(encodeURIPath);
//# sourceMappingURL=path.js.map

import { resolve } from 'node:path';
import url from 'node:url';

const rootDir = resolve(url.fileURLToPath(import.meta.url), "../../");
const distDir = resolve(url.fileURLToPath(import.meta.url), "../../dist");

export { distDir, rootDir };
