import { S as Suite, F as File, T as Task, a as Test } from './tasks.d-CkscK4of.js';
export { C as ChainableFunction, c as createChainable } from './tasks.d-CkscK4of.js';
import { Arrayable } from '@vitest/utils';

/**
* If any tasks been marked as `only`, mark all other tasks as `skip`.
*/
declare function interpretTaskModes(file: Suite, namePattern?: string | RegExp, testLocations?: number[] | undefined, onlyMode?: boolean, parentIsOnly?: boolean, allowOnly?: boolean): void;
declare function someTasksAreOnly(suite: Suite): boolean;
declare function generateHash(str: string): string;
declare function calculateSuiteHash(parent: Suite): void;
declare function createFileTask(filepath: string, root: string, projectName: string | undefined, pool?: string): File;
/**
* Generate a unique ID for a file based on its path and project name
* @param file File relative to the root of the project to keep ID the same between different machines
* @param projectName The name of the test project
*/
declare function generateFileHash(file: string, projectName: string | undefined): string;

/**
* Return a function for running multiple async operations with limited concurrency.
*/
declare function limitConcurrency(concurrency?: number): <
	Args extends unknown[],
	T
>(func: (...args: Args) => PromiseLike<T> | T, ...args: Args) => Promise<T>;

/**
* Partition in tasks groups by consecutive concurrent
*/
declare function partitionSuiteChildren(suite: Suite): Task[][];

/**
* @deprecated use `isTestCase` instead
*/
declare function isAtomTest(s: Task): s is Test;
declare function isTestCase(s: Task): s is Test;
declare function getTests(suite: Arrayable<Task>): Test[];
declare function getTasks(tasks?: Arrayable<Task>): Task[];
declare function getSuites(suite: Arrayable<Task>): Suite[];
declare function hasTests(suite: Arrayable<Suite>): boolean;
declare function hasFailed(suite: Arrayable<Task>): boolean;
declare function getNames(task: Task): string[];
declare function getFullName(task: Task, separator?: string): string;
declare function getTestName(task: Task, separator?: string): string;

export { calculateSuiteHash, createFileTask, generateFileHash, generateHash, getFullName, getNames, getSuites, getTasks, getTestName, getTests, hasFailed, hasTests, interpretTaskModes, isAtomTest, isTestCase, limitConcurrency, partitionSuiteChildren, someTasksAreOnly };


export * from './dist/utils.js'


/**
 * Negates a boolean type.
 */
export type Not<T extends boolean> = T extends true ? false : true;
/**
 * Returns `true` if at least one of the types in the
 * {@linkcode Types} array is `true`, otherwise returns `false`.
 */
export type Or<Types extends boolean[]> = Types[number] extends false ? false : true;
/**
 * Checks if all the boolean types in the {@linkcode Types} array are `true`.
 */
export type And<Types extends boolean[]> = Types[number] extends true ? true : false;
/**
 * Represents an equality type that returns {@linkcode Right} if
 * {@linkcode Left} is `true`,
 * otherwise returns the negation of {@linkcode Right}.
 */
export type Eq<Left extends boolean, Right extends boolean> = Left extends true ? Right : Not<Right>;
/**
 * Represents the exclusive OR operation on a tuple of boolean types.
 * Returns `true` if exactly one of the boolean types is `true`,
 * otherwise returns `false`.
 */
export type Xor<Types extends [boolean, boolean]> = Not<Eq<Types[0], Types[1]>>;
/**
 * @internal
 */
declare const secret: unique symbol;
/**
 * @internal
 */
type Secret = typeof secret;
/**
 * Checks if the given type is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false;
/**
 * Checks if the given type is `any`.
 */
export type IsAny<T> = [T] extends [Secret] ? Not<IsNever<T>> : false;
/**
 * Determines if the given type is `unknown`.
 */
export type IsUnknown<T> = [unknown] extends [T] ? Not<IsAny<T>> : false;
/**
 * Determines if a type is either `never` or `any`.
 */
export type IsNeverOrAny<T> = Or<[IsNever<T>, IsAny<T>]>;
/**
 * Subjective "useful" keys from a type. For objects it's just `keyof` but for
 * tuples/arrays it's the number keys.
 *
 * @example
 * ```ts
 * UsefulKeys<{ a: 1; b: 2 }> // 'a' | 'b'
 *
 * UsefulKeys<['a', 'b']> // '0' | '1'
 *
 * UsefulKeys<string[]> // number
 * ```
 */
export type UsefulKeys<T> = T extends any[] ? {
    [K in keyof T]: K;
}[number] : keyof T;
/**
 * Extracts the keys from a type that are required (not optional).
 */
export type RequiredKeys<T> = Extract<{
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T], keyof T>;
/**
 * Gets the keys of an object type that are optional.
 */
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
/**
 * Extracts the keys from a type that are not `readonly`.
 */
export type ReadonlyKeys<T> = Extract<{
    [K in keyof T]-?: ReadonlyEquivalent<{
        [_K in K]: T[K];
    }, {
        -readonly [_K in K]: T[K];
    }> extends true ? never : K;
}[keyof T], keyof T>;
/**
 * Determines if two types, are equivalent in a `readonly` manner.
 *
 * @internal
 */
type ReadonlyEquivalent<X, Y> = Extends<(<T>() => T extends X ? true : false), (<T>() => T extends Y ? true : false)>;
/**
 * Checks if one type extends another. Note: this is not quite the same as `Left extends Right` because:
 * 1. If either type is `never`, the result is `true` iff the other type is also `never`.
 * 2. Types are wrapped in a 1-tuple so that union types are not distributed - instead we consider `string | number` to _not_ extend `number`. If we used `Left extends Right` directly you would get `Extends<string | number, number>` => `false | true` => `boolean`.
 */
export type Extends<Left, Right> = IsNever<Left> extends true ? IsNever<Right> : [Left] extends [Right] ? true : false;
/**
 * Checks if the {@linkcode Left} type extends the {@linkcode Right} type,
 * excluding `any` or `never`.
 */
export type ExtendsExcludingAnyOrNever<Left, Right> = IsAny<Left> extends true ? IsAny<Right> : Extends<Left, Right>;
/**
 * Checks if two types are strictly equal using
 * the TypeScript internal identical-to operator.
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122 | much history}
 */
export type StrictEqualUsingTSInternalIdenticalToOperator<L, R> = (<T>() => T extends (L & T) | T ? true : false) extends <T>() => T extends (R & T) | T ? true : false ? IsNever<L> extends IsNever<R> ? true : false : false;
/**
 * Checks that {@linkcode Left} and {@linkcode Right} extend each other.
 * Not quite the same as an equality check since `any` can make it resolve
 * to `true`. So should only be used when {@linkcode Left} and
 * {@linkcode Right} are known to avoid `any`.
 */
export type MutuallyExtends<Left, Right> = And<[Extends<Left, Right>, Extends<Right, Left>]>;
/**
 * @internal
 */
declare const mismatch: unique symbol;
/**
 * @internal
 */
type Mismatch = {
    [mismatch]: 'mismatch';
};
/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf | .toEqualTypeOf()} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf | .toMatchTypeOf()}.
 *
 * @internal
 */
declare const avalue: unique symbol;
/**
 * Represents a value that can be of various types.
 */
export type AValue = {
    [avalue]?: undefined;
} | string | number | boolean | symbol | bigint | null | undefined | void;
/**
 * Represents the type of mismatched arguments between
 * the actual result and the expected result.
 *
 * If {@linkcode ActualResult} and {@linkcode ExpectedResult} are equivalent,
 * the type resolves to an empty tuple `[]`, indicating no mismatch.
 * If they are not equivalent, it resolves to a tuple containing the element
 * {@linkcode Mismatch}, signifying a discrepancy between
 * the expected and actual results.
 */
export type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<ActualResult, ExpectedResult> extends true ? [] : [Mismatch];
/**
 * Represents the options for the {@linkcode ExpectTypeOf} function.
 */
export interface ExpectTypeOfOptions {
    positive: boolean;
    branded: boolean;
}
/**
 * Convert a union to an intersection.
 * `A | B | C` -\> `A & B & C`
 */
export type UnionToIntersection<Union> = (Union extends any ? (distributedUnion: Union) => void : never) extends (mergedIntersection: infer Intersection) => void ? Intersection : never;
/**
 * Get the last element of a union.
 * First, converts to a union of `() => T` functions,
 * then uses {@linkcode UnionToIntersection} to get the last one.
 */
export type LastOf<Union> = UnionToIntersection<Union extends any ? () => Union : never> extends () => infer R ? R : never;
/**
 * Intermediate type for {@linkcode UnionToTuple} which pushes the
 * "last" union member to the end of a tuple, and recursively prepends
 * the remainder of the union.
 */
export type TuplifyUnion<Union, LastElement = LastOf<Union>> = IsNever<Union> extends true ? [] : [...TuplifyUnion<Exclude<Union, LastElement>>, LastElement];
/**
 * Convert a union like `1 | 2 | 3` to a tuple like `[1, 2, 3]`.
 */
export type UnionToTuple<Union> = TuplifyUnion<Union>;
export type IsTuple<T> = Or<[Extends<T, []>, Extends<T, [any, ...any[]]>]>;
export type IsUnion<T> = Not<Extends<UnionToTuple<T>['length'], 1>>;
/**
 * A recursive version of `Pick` that selects properties from the left type that are present in the right type.
 * The "leaf" types from `Left` are used - only the keys of `Right` are considered.
 *
 * @example
 * ```ts
 * const user = {email: 'a@b.com', name: 'John Doe', address: {street: '123 2nd St', city: 'New York', zip: '10001', state: 'NY', country: 'USA'}}
 *
 * type Result = DeepPickMatchingProps<typeof user, {name: unknown; address: {city: unknown}}> // {name: string, address: {city: string}}
 * ```
 */
export type DeepPickMatchingProps<Left, Right> = Left extends Record<string, unknown> ? Pick<{
    [K in keyof Left]: K extends keyof Right ? DeepPickMatchingProps<Left[K], Right[K]> : never;
}, Extract<keyof Left, keyof Right>> : Left;
export {};


import type { DefaultEncoder, Format } from "./types.js";
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
//# sourceMappingURL=utils.d.ts.map

export * from "./utils/values.js";
export * from "./utils/base64.js";
export * from "./utils/env.js";
export * from "./utils/log.js";
export * from "./utils/uuid.js";
export * from "./utils/sleep.js";
//# sourceMappingURL=utils.d.ts.map

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


export * from "./dist/utils";


//#region src/entry/utils.d.ts
type Handler = Function;
declare function getHandler(filename: string, name: string): Promise<Handler | null>;
declare function throwInNextTick(error: Error): void;

//#endregion
export { getHandler, throwInNextTick };

import { N as Nullable, A as Arrayable } from './index.d-DGmxD2U7.js';
import './trace-mapping.d-DLVdEqOp.js';

declare const isWindows: boolean;
declare function slash(str: string): string;
declare function isBareImport(id: string): boolean;
declare const VALID_ID_PREFIX = "/@id/";
declare function normalizeRequestId(id: string, base?: string): string;
declare function cleanUrl(url: string): string;
declare function isInternalRequest(id: string): boolean;
declare function normalizeModuleId(id: string): string;
declare function isPrimitive(v: any): boolean;
declare function toFilePath(id: string, root: string): {
	path: string
	exists: boolean
};
declare function isNodeBuiltin(id: string): boolean;
/**
* Convert `Arrayable<T>` to `Array<T>`
*
* @category Array
*/
declare function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T>;
declare function getCachedData<T>(cache: Map<string, T>, basedir: string, originalBasedir: string): NonNullable<T> | undefined;
declare function setCacheData<T>(cache: Map<string, T>, data: T, basedir: string, originalBasedir: string): void;
declare function withTrailingSlash(path: string): string;
declare function createImportMetaEnvProxy(): NodeJS.ProcessEnv;
declare function findNearestPackageData(basedir: string): Promise<{
	type?: "module" | "commonjs"
}>;

export { VALID_ID_PREFIX, cleanUrl, createImportMetaEnvProxy, findNearestPackageData, getCachedData, isBareImport, isInternalRequest, isNodeBuiltin, isPrimitive, isWindows, normalizeModuleId, normalizeRequestId, setCacheData, slash, toArray, toFilePath, withTrailingSlash };


export * from './dist/utils.js'


import { S as Suite, F as File, T as Task, a as Test } from './tasks.d-CkscK4of.js';
export { C as ChainableFunction, c as createChainable } from './tasks.d-CkscK4of.js';
import { Arrayable } from '@vitest/utils';

/**
* If any tasks been marked as `only`, mark all other tasks as `skip`.
*/
declare function interpretTaskModes(file: Suite, namePattern?: string | RegExp, testLocations?: number[] | undefined, onlyMode?: boolean, parentIsOnly?: boolean, allowOnly?: boolean): void;
declare function someTasksAreOnly(suite: Suite): boolean;
declare function generateHash(str: string): string;
declare function calculateSuiteHash(parent: Suite): void;
declare function createFileTask(filepath: string, root: string, projectName: string | undefined, pool?: string): File;
/**
* Generate a unique ID for a file based on its path and project name
* @param file File relative to the root of the project to keep ID the same between different machines
* @param projectName The name of the test project
*/
declare function generateFileHash(file: string, projectName: string | undefined): string;

/**
* Return a function for running multiple async operations with limited concurrency.
*/
declare function limitConcurrency(concurrency?: number): <
	Args extends unknown[],
	T
>(func: (...args: Args) => PromiseLike<T> | T, ...args: Args) => Promise<T>;

/**
* Partition in tasks groups by consecutive concurrent
*/
declare function partitionSuiteChildren(suite: Suite): Task[][];

/**
* @deprecated use `isTestCase` instead
*/
declare function isAtomTest(s: Task): s is Test;
declare function isTestCase(s: Task): s is Test;
declare function getTests(suite: Arrayable<Task>): Test[];
declare function getTasks(tasks?: Arrayable<Task>): Task[];
declare function getSuites(suite: Arrayable<Task>): Suite[];
declare function hasTests(suite: Arrayable<Suite>): boolean;
declare function hasFailed(suite: Arrayable<Task>): boolean;
declare function getNames(task: Task): string[];
declare function getFullName(task: Task, separator?: string): string;
declare function getTestName(task: Task, separator?: string): string;

export { calculateSuiteHash, createFileTask, generateFileHash, generateHash, getFullName, getNames, getSuites, getTasks, getTestName, getTests, hasFailed, hasTests, interpretTaskModes, isAtomTest, isTestCase, limitConcurrency, partitionSuiteChildren, someTasksAreOnly };


export * from './dist/utils.js'


/**
 * Negates a boolean type.
 */
export type Not<T extends boolean> = T extends true ? false : true;
/**
 * Returns `true` if at least one of the types in the
 * {@linkcode Types} array is `true`, otherwise returns `false`.
 */
export type Or<Types extends boolean[]> = Types[number] extends false ? false : true;
/**
 * Checks if all the boolean types in the {@linkcode Types} array are `true`.
 */
export type And<Types extends boolean[]> = Types[number] extends true ? true : false;
/**
 * Represents an equality type that returns {@linkcode Right} if
 * {@linkcode Left} is `true`,
 * otherwise returns the negation of {@linkcode Right}.
 */
export type Eq<Left extends boolean, Right extends boolean> = Left extends true ? Right : Not<Right>;
/**
 * Represents the exclusive OR operation on a tuple of boolean types.
 * Returns `true` if exactly one of the boolean types is `true`,
 * otherwise returns `false`.
 */
export type Xor<Types extends [boolean, boolean]> = Not<Eq<Types[0], Types[1]>>;
/**
 * @internal
 */
declare const secret: unique symbol;
/**
 * @internal
 */
type Secret = typeof secret;
/**
 * Checks if the given type is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false;
/**
 * Checks if the given type is `any`.
 */
export type IsAny<T> = [T] extends [Secret] ? Not<IsNever<T>> : false;
/**
 * Determines if the given type is `unknown`.
 */
export type IsUnknown<T> = [unknown] extends [T] ? Not<IsAny<T>> : false;
/**
 * Determines if a type is either `never` or `any`.
 */
export type IsNeverOrAny<T> = Or<[IsNever<T>, IsAny<T>]>;
/**
 * Subjective "useful" keys from a type. For objects it's just `keyof` but for
 * tuples/arrays it's the number keys.
 *
 * @example
 * ```ts
 * UsefulKeys<{ a: 1; b: 2 }> // 'a' | 'b'
 *
 * UsefulKeys<['a', 'b']> // '0' | '1'
 *
 * UsefulKeys<string[]> // number
 * ```
 */
export type UsefulKeys<T> = T extends any[] ? {
    [K in keyof T]: K;
}[number] : keyof T;
/**
 * Extracts the keys from a type that are required (not optional).
 */
export type RequiredKeys<T> = Extract<{
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T], keyof T>;
/**
 * Gets the keys of an object type that are optional.
 */
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
/**
 * Extracts the keys from a type that are not `readonly`.
 */
export type ReadonlyKeys<T> = Extract<{
    [K in keyof T]-?: ReadonlyEquivalent<{
        [_K in K]: T[K];
    }, {
        -readonly [_K in K]: T[K];
    }> extends true ? never : K;
}[keyof T], keyof T>;
/**
 * Determines if two types, are equivalent in a `readonly` manner.
 *
 * @internal
 */
type ReadonlyEquivalent<X, Y> = Extends<(<T>() => T extends X ? true : false), (<T>() => T extends Y ? true : false)>;
/**
 * Checks if one type extends another. Note: this is not quite the same as `Left extends Right` because:
 * 1. If either type is `never`, the result is `true` iff the other type is also `never`.
 * 2. Types are wrapped in a 1-tuple so that union types are not distributed - instead we consider `string | number` to _not_ extend `number`. If we used `Left extends Right` directly you would get `Extends<string | number, number>` => `false | true` => `boolean`.
 */
export type Extends<Left, Right> = IsNever<Left> extends true ? IsNever<Right> : [Left] extends [Right] ? true : false;
/**
 * Checks if the {@linkcode Left} type extends the {@linkcode Right} type,
 * excluding `any` or `never`.
 */
export type ExtendsExcludingAnyOrNever<Left, Right> = IsAny<Left> extends true ? IsAny<Right> : Extends<Left, Right>;
/**
 * Checks if two types are strictly equal using
 * the TypeScript internal identical-to operator.
 *
 * @see {@link https://github.com/microsoft/TypeScript/issues/55188#issuecomment-1656328122 | much history}
 */
export type StrictEqualUsingTSInternalIdenticalToOperator<L, R> = (<T>() => T extends (L & T) | T ? true : false) extends <T>() => T extends (R & T) | T ? true : false ? IsNever<L> extends IsNever<R> ? true : false : false;
/**
 * Checks that {@linkcode Left} and {@linkcode Right} extend each other.
 * Not quite the same as an equality check since `any` can make it resolve
 * to `true`. So should only be used when {@linkcode Left} and
 * {@linkcode Right} are known to avoid `any`.
 */
export type MutuallyExtends<Left, Right> = And<[Extends<Left, Right>, Extends<Right, Left>]>;
/**
 * @internal
 */
declare const mismatch: unique symbol;
/**
 * @internal
 */
type Mismatch = {
    [mismatch]: 'mismatch';
};
/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf | .toEqualTypeOf()} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf | .toMatchTypeOf()}.
 *
 * @internal
 */
declare const avalue: unique symbol;
/**
 * Represents a value that can be of various types.
 */
export type AValue = {
    [avalue]?: undefined;
} | string | number | boolean | symbol | bigint | null | undefined | void;
/**
 * Represents the type of mismatched arguments between
 * the actual result and the expected result.
 *
 * If {@linkcode ActualResult} and {@linkcode ExpectedResult} are equivalent,
 * the type resolves to an empty tuple `[]`, indicating no mismatch.
 * If they are not equivalent, it resolves to a tuple containing the element
 * {@linkcode Mismatch}, signifying a discrepancy between
 * the expected and actual results.
 */
export type MismatchArgs<ActualResult extends boolean, ExpectedResult extends boolean> = Eq<ActualResult, ExpectedResult> extends true ? [] : [Mismatch];
/**
 * Represents the options for the {@linkcode ExpectTypeOf} function.
 */
export interface ExpectTypeOfOptions {
    positive: boolean;
    branded: boolean;
}
/**
 * Convert a union to an intersection.
 * `A | B | C` -\> `A & B & C`
 */
export type UnionToIntersection<Union> = (Union extends any ? (distributedUnion: Union) => void : never) extends (mergedIntersection: infer Intersection) => void ? Intersection : never;
/**
 * Get the last element of a union.
 * First, converts to a union of `() => T` functions,
 * then uses {@linkcode UnionToIntersection} to get the last one.
 */
export type LastOf<Union> = UnionToIntersection<Union extends any ? () => Union : never> extends () => infer R ? R : never;
/**
 * Intermediate type for {@linkcode UnionToTuple} which pushes the
 * "last" union member to the end of a tuple, and recursively prepends
 * the remainder of the union.
 */
export type TuplifyUnion<Union, LastElement = LastOf<Union>> = IsNever<Union> extends true ? [] : [...TuplifyUnion<Exclude<Union, LastElement>>, LastElement];
/**
 * Convert a union like `1 | 2 | 3` to a tuple like `[1, 2, 3]`.
 */
export type UnionToTuple<Union> = TuplifyUnion<Union>;
export type IsTuple<T> = Or<[Extends<T, []>, Extends<T, [any, ...any[]]>]>;
export type IsUnion<T> = Not<Extends<UnionToTuple<T>['length'], 1>>;
/**
 * A recursive version of `Pick` that selects properties from the left type that are present in the right type.
 * The "leaf" types from `Left` are used - only the keys of `Right` are considered.
 *
 * @example
 * ```ts
 * const user = {email: 'a@b.com', name: 'John Doe', address: {street: '123 2nd St', city: 'New York', zip: '10001', state: 'NY', country: 'USA'}}
 *
 * type Result = DeepPickMatchingProps<typeof user, {name: unknown; address: {city: unknown}}> // {name: string, address: {city: string}}
 * ```
 */
export type DeepPickMatchingProps<Left, Right> = Left extends Record<string, unknown> ? Pick<{
    [K in keyof Left]: K extends keyof Right ? DeepPickMatchingProps<Left[K], Right[K]> : never;
}, Extract<keyof Left, keyof Right>> : Left;
export {};


import type { DefaultEncoder, Format } from "./types.js";
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
//# sourceMappingURL=utils.d.ts.map

export * from "./utils/values.js";
export * from "./utils/base64.js";
export * from "./utils/env.js";
export * from "./utils/log.js";
export * from "./utils/uuid.js";
export * from "./utils/sleep.js";
//# sourceMappingURL=utils.d.ts.map

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


export * from "./dist/utils";


//#region src/entry/utils.d.ts
type Handler = Function;
declare function getHandler(filename: string, name: string): Promise<Handler | null>;
declare function throwInNextTick(error: Error): void;

//#endregion
export { getHandler, throwInNextTick };

import { N as Nullable, A as Arrayable } from './index.d-DGmxD2U7.js';
import './trace-mapping.d-DLVdEqOp.js';

declare const isWindows: boolean;
declare function slash(str: string): string;
declare function isBareImport(id: string): boolean;
declare const VALID_ID_PREFIX = "/@id/";
declare function normalizeRequestId(id: string, base?: string): string;
declare function cleanUrl(url: string): string;
declare function isInternalRequest(id: string): boolean;
declare function normalizeModuleId(id: string): string;
declare function isPrimitive(v: any): boolean;
declare function toFilePath(id: string, root: string): {
	path: string
	exists: boolean
};
declare function isNodeBuiltin(id: string): boolean;
/**
* Convert `Arrayable<T>` to `Array<T>`
*
* @category Array
*/
declare function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T>;
declare function getCachedData<T>(cache: Map<string, T>, basedir: string, originalBasedir: string): NonNullable<T> | undefined;
declare function setCacheData<T>(cache: Map<string, T>, data: T, basedir: string, originalBasedir: string): void;
declare function withTrailingSlash(path: string): string;
declare function createImportMetaEnvProxy(): NodeJS.ProcessEnv;
declare function findNearestPackageData(basedir: string): Promise<{
	type?: "module" | "commonjs"
}>;

export { VALID_ID_PREFIX, cleanUrl, createImportMetaEnvProxy, findNearestPackageData, getCachedData, isBareImport, isInternalRequest, isNodeBuiltin, isPrimitive, isWindows, normalizeModuleId, normalizeRequestId, setCacheData, slash, toArray, toFilePath, withTrailingSlash };


export * from './dist/utils.js'
