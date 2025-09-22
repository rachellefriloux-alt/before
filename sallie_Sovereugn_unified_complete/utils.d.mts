import type { DefaultEncoder, Format } from "./types.mjs";
export declare let has: (obj: object, key: PropertyKey) => boolean;
export declare function merge(target: any, source: any, options?: {
    plainObjects?: boolean;
    allowPrototypes?: boolean;
}): any;
export declare function assign_single_source(target: any, source: any): any;
export declare function decode(str: string, _: any, charset: string): string;
export declare const encode: (str: any, defaultEncoder: DefaultEncoder, charset: string, type: 'key' | 'value', format: Format) => string;
export declare function compact(value: any): any;
export declare function is_regexp(obj: any): boolean;
export declare function is_buffer(obj: any): boolean;
export declare function combine(a: any, b: any): never[];
export declare function maybe_map<T>(val: T[], fn: (v: T) => T): T | T[];
//# sourceMappingURL=utils.d.mts.map

export * from "./utils/values.mjs";
export * from "./utils/base64.mjs";
export * from "./utils/env.mjs";
export * from "./utils/log.mjs";
export * from "./utils/uuid.mjs";
export * from "./utils/sleep.mjs";
//# sourceMappingURL=utils.d.mts.map

/**
 * Normalises alias mappings, ensuring that more specific aliases are resolved before less specific ones.
 * This function also ensures that aliases do not resolve to themselves cyclically.
 *
 * @param _aliases - A set of alias mappings where each key is an alias and its value is the actual path it points to.
 * @returns a set of normalised alias mappings.
 */
declare function normalizeAliases(_aliases: Record<string, string>): Record<string, string>;
/**
 * Resolves a path string to its alias if applicable, otherwise returns the original path.
 * This function normalises the path, resolves the alias and then joins it to the alias target if necessary.
 *
 * @param path - The path string to resolve.
 * @param aliases - A set of alias mappings to use for resolution.
 * @returns the resolved path as a string.
 */
declare function resolveAlias(path: string, aliases: Record<string, string>): string;
/**
 * Resolves a path string to its possible alias.
 *
 * Returns an array of possible alias resolutions (could be empty), sorted by specificity (longest first).
 */
declare function reverseResolveAlias(path: string, aliases: Record<string, string>): string[];
/**
 * Extracts the filename from a given path, excluding any directory paths and the file extension.
 *
 * @param path - The full path of the file from which to extract the filename.
 * @returns the filename without the extension, or `undefined` if the filename cannot be extracted.
 */
declare function filename(path: string): string | undefined;

export { filename, normalizeAliases, resolveAlias, reverseResolveAlias };


import type { DefaultEncoder, Format } from "./types.mjs";
export declare let has: (obj: object, key: PropertyKey) => boolean;
export declare function merge(target: any, source: any, options?: {
    plainObjects?: boolean;
    allowPrototypes?: boolean;
}): any;
export declare function assign_single_source(target: any, source: any): any;
export declare function decode(str: string, _: any, charset: string): string;
export declare const encode: (str: any, defaultEncoder: DefaultEncoder, charset: string, type: 'key' | 'value', format: Format) => string;
export declare function compact(value: any): any;
export declare function is_regexp(obj: any): boolean;
export declare function is_buffer(obj: any): boolean;
export declare function combine(a: any, b: any): never[];
export declare function maybe_map<T>(val: T[], fn: (v: T) => T): T | T[];
//# sourceMappingURL=utils.d.mts.map

export * from "./utils/values.mjs";
export * from "./utils/base64.mjs";
export * from "./utils/env.mjs";
export * from "./utils/log.mjs";
export * from "./utils/uuid.mjs";
export * from "./utils/sleep.mjs";
//# sourceMappingURL=utils.d.mts.map

/**
 * Normalises alias mappings, ensuring that more specific aliases are resolved before less specific ones.
 * This function also ensures that aliases do not resolve to themselves cyclically.
 *
 * @param _aliases - A set of alias mappings where each key is an alias and its value is the actual path it points to.
 * @returns a set of normalised alias mappings.
 */
declare function normalizeAliases(_aliases: Record<string, string>): Record<string, string>;
/**
 * Resolves a path string to its alias if applicable, otherwise returns the original path.
 * This function normalises the path, resolves the alias and then joins it to the alias target if necessary.
 *
 * @param path - The path string to resolve.
 * @param aliases - A set of alias mappings to use for resolution.
 * @returns the resolved path as a string.
 */
declare function resolveAlias(path: string, aliases: Record<string, string>): string;
/**
 * Resolves a path string to its possible alias.
 *
 * Returns an array of possible alias resolutions (could be empty), sorted by specificity (longest first).
 */
declare function reverseResolveAlias(path: string, aliases: Record<string, string>): string[];
/**
 * Extracts the filename from a given path, excluding any directory paths and the file extension.
 *
 * @param path - The full path of the file from which to extract the filename.
 * @returns the filename without the extension, or `undefined` if the filename cannot be extracted.
 */
declare function filename(path: string): string | undefined;

export { filename, normalizeAliases, resolveAlias, reverseResolveAlias };
