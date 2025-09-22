export type Format = 'RFC1738' | 'RFC3986';

export type DefaultEncoder = (str: any, defaultEncoder?: any, charset?: string) => string;
export type DefaultDecoder = (str: string, decoder?: any, charset?: string) => string;

export type BooleanOptional = boolean | undefined;

export type StringifyBaseOptions = {
  delimiter?: string;
  allowDots?: boolean;
  encodeDotInKeys?: boolean;
  strictNullHandling?: boolean;
  skipNulls?: boolean;
  encode?: boolean;
  encoder?: (
    str: any,
    defaultEncoder: DefaultEncoder,
    charset: string,
    type: 'key' | 'value',
    format?: Format,
  ) => string;
  filter?: Array<PropertyKey> | ((prefix: PropertyKey, value: any) => any);
  arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
  indices?: boolean;
  sort?: ((a: PropertyKey, b: PropertyKey) => number) | null;
  serializeDate?: (d: Date) => string;
  format?: 'RFC1738' | 'RFC3986';
  formatter?: (str: PropertyKey) => string;
  encodeValuesOnly?: boolean;
  addQueryPrefix?: boolean;
  charset?: 'utf-8' | 'iso-8859-1';
  charsetSentinel?: boolean;
  allowEmptyArrays?: boolean;
  commaRoundTrip?: boolean;
};

export type StringifyOptions = StringifyBaseOptions;

export type ParseBaseOptions = {
  comma?: boolean;
  delimiter?: string | RegExp;
  depth?: number | false;
  decoder?: (str: string, defaultDecoder: DefaultDecoder, charset: string, type: 'key' | 'value') => any;
  arrayLimit?: number;
  parseArrays?: boolean;
  plainObjects?: boolean;
  allowPrototypes?: boolean;
  allowSparse?: boolean;
  parameterLimit?: number;
  strictDepth?: boolean;
  strictNullHandling?: boolean;
  ignoreQueryPrefix?: boolean;
  charset?: 'utf-8' | 'iso-8859-1';
  charsetSentinel?: boolean;
  interpretNumericEntities?: boolean;
  allowEmptyArrays?: boolean;
  duplicates?: 'combine' | 'first' | 'last';
  allowDots?: boolean;
  decodeDotInKeys?: boolean;
};

export type ParseOptions = ParseBaseOptions;

export type ParsedQs = {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
};

// Type to remove null or undefined union from each property
export type NonNullableProperties<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined | null>;
};


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export type PromiseOrValue<T> = T | Promise<T>;
export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type KeysEnum<T> = { [P in keyof Required<T>]: true };

export type FinalizedRequestInit = RequestInit & { headers: Headers };

type NotAny<T> = [0] extends [1 & T] ? never : T;

/**
 * Some environments overload the global fetch function, and Parameters<T> only gets the last signature.
 */
type OverloadedParameters<T> =
  T extends (
    {
      (...args: infer A): unknown;
      (...args: infer B): unknown;
      (...args: infer C): unknown;
      (...args: infer D): unknown;
    }
  ) ?
    A | B | C | D
  : T extends (
    {
      (...args: infer A): unknown;
      (...args: infer B): unknown;
      (...args: infer C): unknown;
    }
  ) ?
    A | B | C
  : T extends (
    {
      (...args: infer A): unknown;
      (...args: infer B): unknown;
    }
  ) ?
    A | B
  : T extends (...args: infer A) => unknown ? A
  : never;

/* eslint-disable */
/**
 * These imports attempt to get types from a parent package's dependencies.
 * Unresolved bare specifiers can trigger [automatic type acquisition][1] in some projects, which
 * would cause typescript to show types not present at runtime. To avoid this, we import
 * directly from parent node_modules folders.
 *
 * We need to check multiple levels because we don't know what directory structure we'll be in.
 * For example, pnpm generates directories like this:
 * ```
 * node_modules
 * ├── .pnpm
 * │   └── pkg@1.0.0
 * │       └── node_modules
 * │           └── pkg
 * │               └── internal
 * │                   └── types.d.ts
 * ├── pkg -> .pnpm/pkg@1.0.0/node_modules/pkg
 * └── undici
 * ```
 *
 * [1]: https://www.typescriptlang.org/tsconfig/#typeAcquisition
 */
/** @ts-ignore For users with \@types/node */
type UndiciTypesRequestInit = NotAny<import('../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/undici-types/index.d.ts').RequestInit>;
/** @ts-ignore For users with undici */
type UndiciRequestInit = NotAny<import('../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/undici/index.d.ts').RequestInit>;
/** @ts-ignore For users with \@types/bun */
type BunRequestInit = globalThis.FetchRequestInit;
/** @ts-ignore For users with node-fetch@2 */
type NodeFetch2RequestInit = NotAny<import('../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit>;
/** @ts-ignore For users with node-fetch@3, doesn't need file extension because types are at ./@types/index.d.ts */
type NodeFetch3RequestInit =  NotAny<import('../node_modules/node-fetch').RequestInit> | NotAny<import('../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/node-fetch').RequestInit>;
/** @ts-ignore For users who use Deno */
type FetchRequestInit = NonNullable<OverloadedParameters<typeof fetch>[1]>;
/* eslint-enable */

type RequestInits =
  | NotAny<UndiciTypesRequestInit>
  | NotAny<UndiciRequestInit>
  | NotAny<BunRequestInit>
  | NotAny<NodeFetch2RequestInit>
  | NotAny<NodeFetch3RequestInit>
  | NotAny<RequestInit>
  | NotAny<FetchRequestInit>;

/**
 * This type contains `RequestInit` options that may be available on the current runtime,
 * including per-platform extensions like `dispatcher`, `agent`, `client`, etc.
 */
export type MergedRequestInit = RequestInits &
  /** We don't include these in the types as they'll be overridden for every request. */
  Partial<Record<'body' | 'headers' | 'method' | 'signal', never>>;


/**
 * @fileoverview Types for the config-array package.
 * @author Nicholas C. Zakas
 */

export interface ConfigObject {
	/**
	 * The base path for files and ignores.
	 */
	basePath?: string;

	/**
	 * The files to include.
	 */
	files?: string[];

	/**
	 * The files to exclude.
	 */
	ignores?: string[];

	/**
	 * The name of the config object.
	 */
	name?: string;

	// may also have any number of other properties
	[key: string]: unknown;
}


/**
 * @fileoverview Types for the config-array package.
 * @author Nicholas C. Zakas
 */

export interface ConfigObject {
	/**
	 * The base path for files and ignores.
	 */
	basePath?: string;

	/**
	 * The files to include.
	 */
	files?: string[];

	/**
	 * The files to exclude.
	 */
	ignores?: string[];

	/**
	 * The name of the config object.
	 */
	name?: string;

	// may also have any number of other properties
	[key: string]: unknown;
}


/**
 * @fileoverview Types for this package.
 */

import type { Linter } from "eslint";

/**
 * Infinite array type.
 */
export type InfiniteArray<T> = T | InfiniteArray<T>[];

/**
 * The type of array element in the `extends` property after flattening.
 */
export type SimpleExtendsElement = string | Linter.Config;

/**
 * The type of array element in the `extends` property before flattening.
 */
export type ExtendsElement =
	| SimpleExtendsElement
	| InfiniteArray<Linter.Config>;

/**
 * Config with extends. Valid only inside of `defineConfig()`.
 */
export interface ConfigWithExtends extends Linter.Config {
	extends?: ExtendsElement[];
}

export type ConfigWithExtendsArray = InfiniteArray<ConfigWithExtends>[];


/**
 * @fileoverview Types for object-schema package.
 */

/**
 * Built-in validation strategies.
 */
export type BuiltInValidationStrategy =
	| "array"
	| "boolean"
	| "number"
	| "object"
	| "object?"
	| "string"
	| "string!";

/**
 * Built-in merge strategies.
 */
export type BuiltInMergeStrategy = "assign" | "overwrite" | "replace";

/**
 * Property definition.
 */
export interface PropertyDefinition {
	/**
	 * Indicates if the property is required.
	 */
	required: boolean;

	/**
	 * The other properties that must be present when this property is used.
	 */
	requires?: string[];

	/**
	 * The strategy to merge the property.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- https://github.com/eslint/rewrite/pull/90#discussion_r1687206213
	merge: BuiltInMergeStrategy | ((target: any, source: any) => any);

	/**
	 * The strategy to validate the property.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- https://github.com/eslint/rewrite/pull/90#discussion_r1687206213
	validate: BuiltInValidationStrategy | ((value: any) => void);

	/**
	 * The schema for the object value of this property.
	 */
	schema?: ObjectDefinition;
}

/**
 * Object definition.
 */
export type ObjectDefinition = Record<string, PropertyDefinition>;


/**
 * @fileoverview Types for object-schema package.
 */

/**
 * Built-in validation strategies.
 */
export type BuiltInValidationStrategy =
	| "array"
	| "boolean"
	| "number"
	| "object"
	| "object?"
	| "string"
	| "string!";

/**
 * Built-in merge strategies.
 */
export type BuiltInMergeStrategy = "assign" | "overwrite" | "replace";

/**
 * Property definition.
 */
export interface PropertyDefinition {
	/**
	 * Indicates if the property is required.
	 */
	required: boolean;

	/**
	 * The other properties that must be present when this property is used.
	 */
	requires?: string[];

	/**
	 * The strategy to merge the property.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- https://github.com/eslint/rewrite/pull/90#discussion_r1687206213
	merge: BuiltInMergeStrategy | ((target: any, source: any) => any);

	/**
	 * The strategy to validate the property.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- https://github.com/eslint/rewrite/pull/90#discussion_r1687206213
	validate: BuiltInValidationStrategy | ((value: any) => void);

	/**
	 * The schema for the object value of this property.
	 */
	schema?: ObjectDefinition;
}

/**
 * Object definition.
 */
export type ObjectDefinition = Record<string, PropertyDefinition>;


/**
 * @fileoverview Types for the plugin-kit package.
 * @author Nicholas C. Zakas
 */

export type StringConfig = Record<string, string | null>;
export type BooleanConfig = Record<string, boolean>;


export type Format = 'RFC1738' | 'RFC3986';

export type DefaultEncoder = (str: any, defaultEncoder?: any, charset?: string) => string;
export type DefaultDecoder = (str: string, decoder?: any, charset?: string) => string;

export type BooleanOptional = boolean | undefined;

export type StringifyBaseOptions = {
  delimiter?: string;
  allowDots?: boolean;
  encodeDotInKeys?: boolean;
  strictNullHandling?: boolean;
  skipNulls?: boolean;
  encode?: boolean;
  encoder?: (
    str: any,
    defaultEncoder: DefaultEncoder,
    charset: string,
    type: 'key' | 'value',
    format?: Format,
  ) => string;
  filter?: Array<PropertyKey> | ((prefix: PropertyKey, value: any) => any);
  arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
  indices?: boolean;
  sort?: ((a: PropertyKey, b: PropertyKey) => number) | null;
  serializeDate?: (d: Date) => string;
  format?: 'RFC1738' | 'RFC3986';
  formatter?: (str: PropertyKey) => string;
  encodeValuesOnly?: boolean;
  addQueryPrefix?: boolean;
  charset?: 'utf-8' | 'iso-8859-1';
  charsetSentinel?: boolean;
  allowEmptyArrays?: boolean;
  commaRoundTrip?: boolean;
};

export type StringifyOptions = StringifyBaseOptions;

export type ParseBaseOptions = {
  comma?: boolean;
  delimiter?: string | RegExp;
  depth?: number | false;
  decoder?: (str: string, defaultDecoder: DefaultDecoder, charset: string, type: 'key' | 'value') => any;
  arrayLimit?: number;
  parseArrays?: boolean;
  plainObjects?: boolean;
  allowPrototypes?: boolean;
  allowSparse?: boolean;
  parameterLimit?: number;
  strictDepth?: boolean;
  strictNullHandling?: boolean;
  ignoreQueryPrefix?: boolean;
  charset?: 'utf-8' | 'iso-8859-1';
  charsetSentinel?: boolean;
  interpretNumericEntities?: boolean;
  allowEmptyArrays?: boolean;
  duplicates?: 'combine' | 'first' | 'last';
  allowDots?: boolean;
  decodeDotInKeys?: boolean;
};

export type ParseOptions = ParseBaseOptions;

export type ParsedQs = {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
};

// Type to remove null or undefined union from each property
export type NonNullableProperties<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined | null>;
};


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export type PromiseOrValue<T> = T | Promise<T>;
export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type KeysEnum<T> = { [P in keyof Required<T>]: true };

export type FinalizedRequestInit = RequestInit & { headers: Headers };

type NotAny<T> = [0] extends [1 & T] ? never : T;

/**
 * Some environments overload the global fetch function, and Parameters<T> only gets the last signature.
 */
type OverloadedParameters<T> =
  T extends (
    {
      (...args: infer A): unknown;
      (...args: infer B): unknown;
      (...args: infer C): unknown;
      (...args: infer D): unknown;
    }
  ) ?
    A | B | C | D
  : T extends (
    {
      (...args: infer A): unknown;
      (...args: infer B): unknown;
      (...args: infer C): unknown;
    }
  ) ?
    A | B | C
  : T extends (
    {
      (...args: infer A): unknown;
      (...args: infer B): unknown;
    }
  ) ?
    A | B
  : T extends (...args: infer A) => unknown ? A
  : never;

/* eslint-disable */
/**
 * These imports attempt to get types from a parent package's dependencies.
 * Unresolved bare specifiers can trigger [automatic type acquisition][1] in some projects, which
 * would cause typescript to show types not present at runtime. To avoid this, we import
 * directly from parent node_modules folders.
 *
 * We need to check multiple levels because we don't know what directory structure we'll be in.
 * For example, pnpm generates directories like this:
 * ```
 * node_modules
 * ├── .pnpm
 * │   └── pkg@1.0.0
 * │       └── node_modules
 * │           └── pkg
 * │               └── internal
 * │                   └── types.d.ts
 * ├── pkg -> .pnpm/pkg@1.0.0/node_modules/pkg
 * └── undici
 * ```
 *
 * [1]: https://www.typescriptlang.org/tsconfig/#typeAcquisition
 */
/** @ts-ignore For users with \@types/node */
type UndiciTypesRequestInit = NotAny<import('../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../node_modules/undici-types/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/undici-types/index.d.ts').RequestInit>;
/** @ts-ignore For users with undici */
type UndiciRequestInit = NotAny<import('../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../node_modules/undici/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/undici/index.d.ts').RequestInit>;
/** @ts-ignore For users with \@types/bun */
type BunRequestInit = globalThis.FetchRequestInit;
/** @ts-ignore For users with node-fetch@2 */
type NodeFetch2RequestInit = NotAny<import('../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/@types/node-fetch/index.d.ts').RequestInit>;
/** @ts-ignore For users with node-fetch@3, doesn't need file extension because types are at ./@types/index.d.ts */
type NodeFetch3RequestInit =  NotAny<import('../node_modules/node-fetch').RequestInit> | NotAny<import('../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/node-fetch').RequestInit>;
/** @ts-ignore For users who use Deno */
type FetchRequestInit = NonNullable<OverloadedParameters<typeof fetch>[1]>;
/* eslint-enable */

type RequestInits =
  | NotAny<UndiciTypesRequestInit>
  | NotAny<UndiciRequestInit>
  | NotAny<BunRequestInit>
  | NotAny<NodeFetch2RequestInit>
  | NotAny<NodeFetch3RequestInit>
  | NotAny<RequestInit>
  | NotAny<FetchRequestInit>;

/**
 * This type contains `RequestInit` options that may be available on the current runtime,
 * including per-platform extensions like `dispatcher`, `agent`, `client`, etc.
 */
export type MergedRequestInit = RequestInits &
  /** We don't include these in the types as they'll be overridden for every request. */
  Partial<Record<'body' | 'headers' | 'method' | 'signal', never>>;
