"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.castToError = void 0;
exports.isAbortError = isAbortError;
function isAbortError(err) {
    return (typeof err === 'object' &&
        err !== null &&
        // Spec-compliant fetch implementations
        (('name' in err && err.name === 'AbortError') ||
            // Expo fetch
            ('message' in err && String(err.message).includes('FetchRequestCanceledException'))));
}
const castToError = (err) => {
    if (err instanceof Error)
        return err;
    if (typeof err === 'object' && err !== null) {
        try {
            if (Object.prototype.toString.call(err) === '[object Error]') {
                // @ts-ignore - not all envs have native support for cause yet
                const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
                if (err.stack)
                    error.stack = err.stack;
                // @ts-ignore - not all envs have native support for cause yet
                if (err.cause && !error.cause)
                    error.cause = err.cause;
                if (err.name)
                    error.name = err.name;
                return error;
            }
        }
        catch { }
        try {
            return new Error(JSON.stringify(err));
        }
        catch { }
    }
    return new Error(err);
};
exports.castToError = castToError;
//# sourceMappingURL=errors.js.map

/**
 * @fileoverview Common error classes
 * @author Nicholas C. Zakas
 */

/**
 * Error thrown when a file or directory is not found.
 */
export class NotFoundError extends Error {
	/**
	 * Name of the error class.
	 * @type {string}
	 */
	name = "NotFoundError";

	/**
	 * Error code.
	 * @type {string}
	 */
	code = "ENOENT";

	/**
	 * Creates a new instance.
	 * @param {string} message The error message.
	 */
	constructor(message) {
		super(`ENOENT: No such file or directory, ${message}`);
	}
}

/**
 * Error thrown when an operation is not permitted.
 */
export class PermissionError extends Error {
	/**
	 * Name of the error class.
	 * @type {string}
	 */
	name = "PermissionError";

	/**
	 * Error code.
	 * @type {string}
	 */
	code = "EPERM";

	/**
	 * Creates a new instance.
	 * @param {string} message The error message.
	 */
	constructor(message) {
		super(`EPERM: Operation not permitted, ${message}`);
	}
}

/**
 * Error thrown when an operation is not allowed on a directory.
 */

export class DirectoryError extends Error {
	/**
	 * Name of the error class.
	 * @type {string}
	 */
	name = "DirectoryError";

	/**
	 * Error code.
	 * @type {string}
	 */
	code = "EISDIR";

	/**
	 * Creates a new instance.
	 * @param {string} message The error message.
	 */
	constructor(message) {
		super(`EISDIR: Illegal operation on a directory, ${message}`);
	}
}

/**
 * Error thrown when a directory is not empty.
 */
export class NotEmptyError extends Error {
	/**
	 * Name of the error class.
	 * @type {string}
	 */
	name = "NotEmptyError";

	/**
	 * Error code.
	 * @type {string}
	 */
	code = "ENOTEMPTY";

	/**
	 * Creates a new instance.
	 * @param {string} message The error message.
	 */
	constructor(message) {
		super(`ENOTEMPTY: Directory not empty, ${message}`);
	}
}


"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.castToError = void 0;
exports.isAbortError = isAbortError;
function isAbortError(err) {
    return (typeof err === 'object' &&
        err !== null &&
        // Spec-compliant fetch implementations
        (('name' in err && err.name === 'AbortError') ||
            // Expo fetch
            ('message' in err && String(err.message).includes('FetchRequestCanceledException'))));
}
const castToError = (err) => {
    if (err instanceof Error)
        return err;
    if (typeof err === 'object' && err !== null) {
        try {
            if (Object.prototype.toString.call(err) === '[object Error]') {
                // @ts-ignore - not all envs have native support for cause yet
                const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
                if (err.stack)
                    error.stack = err.stack;
                // @ts-ignore - not all envs have native support for cause yet
                if (err.cause && !error.cause)
                    error.cause = err.cause;
                if (err.name)
                    error.name = err.name;
                return error;
            }
        }
        catch { }
        try {
            return new Error(JSON.stringify(err));
        }
        catch { }
    }
    return new Error(err);
};
exports.castToError = castToError;
//# sourceMappingURL=errors.js.map