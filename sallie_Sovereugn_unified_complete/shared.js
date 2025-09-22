"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=shared.js.map

/**
 * Converts a value to a string that may be printed in errors.
 * @param {any} value The invalid value.
 * @param {number} indentation How many spaces to indent
 * @returns {string} The value, stringified.
 */
function stringifyValueForError(value, indentation) {
	return value
		? JSON.stringify(value, null, 4).replace(
				/\n/gu,
				`\n${" ".repeat(indentation)}`,
			)
		: `${value}`;
}