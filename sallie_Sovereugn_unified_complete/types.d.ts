import { DiffOptions } from '@vitest/utils/diff';
import { F as File, a as Test, S as Suite, L as TaskResultPack, z as TaskEventPack, N as TestAnnotation, U as TestContext, I as ImportDuration, t as SequenceHooks, u as SequenceSetupFiles } from './tasks.d-CkscK4of.js';
export { A as AfterAllListener, b as AfterEachListener, B as BeforeAllListener, d as BeforeEachListener, g as Custom, j as CustomAPI, D as DoneCallback, E as ExtendedContext, m as Fixture, n as FixtureFn, o as FixtureOptions, p as Fixtures, H as HookCleanupCallback, q as HookListener, r as InferFixturesTypes, O as OnTestFailedHandler, f as OnTestFinishedHandler, R as RunMode, s as RuntimeContext, k as SuiteAPI, l as SuiteCollector, v as SuiteFactory, h as SuiteHooks, T as Task, w as TaskBase, x as TaskContext, y as TaskCustomOptions, e as TaskHook, G as TaskMeta, J as TaskPopulated, K as TaskResult, M as TaskState, i as TaskUpdateEvent, j as TestAPI, P as TestAnnotationLocation, Q as TestAttachment, V as TestFunction, W as TestOptions, X as Use } from './tasks.d-CkscK4of.js';
import '@vitest/utils';

/**
* This is a subset of Vitest config that's required for the runner to work.
*/
interface VitestRunnerConfig {
	root: string;
	setupFiles: string[];
	name?: string;
	passWithNoTests: boolean;
	testNamePattern?: RegExp;
	allowOnly?: boolean;
	sequence: {
		shuffle?: boolean
		concurrent?: boolean
		seed: number
		hooks: SequenceHooks
		setupFiles: SequenceSetupFiles
	};
	chaiConfig?: {
		truncateThreshold?: number
	};
	maxConcurrency: number;
	testTimeout: number;
	hookTimeout: number;
	retry: number;
	includeTaskLocation?: boolean;
	diffOptions?: DiffOptions;
}
/**
* Possible options to run a single file in a test.
*/
interface FileSpecification {
	filepath: string;
	testLocations: number[] | undefined;
}
type VitestRunnerImportSource = "collect" | "setup";
interface VitestRunnerConstructor {
	new (config: VitestRunnerConfig): VitestRunner;
}
type CancelReason = "keyboard-input" | "test-failure" | (string & Record<string, never>);
interface VitestRunner {
	/**
	* First thing that's getting called before actually collecting and running tests.
	*/
	onBeforeCollect?: (paths: string[]) => unknown;
	/**
	* Called after the file task was created but not collected yet.
	*/
	onCollectStart?: (file: File) => unknown;
	/**
	* Called after collecting tests and before "onBeforeRun".
	*/
	onCollected?: (files: File[]) => unknown;
	/**
	* Called when test runner should cancel next test runs.
	* Runner should listen for this method and mark tests and suites as skipped in
	* "onBeforeRunSuite" and "onBeforeRunTask" when called.
	*/
	cancel?: (reason: CancelReason) => unknown;
	/**
	* Called before running a single test. Doesn't have "result" yet.
	*/
	onBeforeRunTask?: (test: Test) => unknown;
	/**
	* Called before actually running the test function. Already has "result" with "state" and "startTime".
	*/
	onBeforeTryTask?: (test: Test, options: {
		retry: number
		repeats: number
	}) => unknown;
	/**
	* When the task has finished running, but before cleanup hooks are called
	*/
	onTaskFinished?: (test: Test) => unknown;
	/**
	* Called after result and state are set.
	*/
	onAfterRunTask?: (test: Test) => unknown;
	/**
	* Called right after running the test function. Doesn't have new state yet. Will not be called, if the test function throws.
	*/
	onAfterTryTask?: (test: Test, options: {
		retry: number
		repeats: number
	}) => unknown;
	/**
	* Called before running a single suite. Doesn't have "result" yet.
	*/
	onBeforeRunSuite?: (suite: Suite) => unknown;
	/**
	* Called after running a single suite. Has state and result.
	*/
	onAfterRunSuite?: (suite: Suite) => unknown;
	/**
	* If defined, will be called instead of usual Vitest suite partition and handling.
	* "before" and "after" hooks will not be ignored.
	*/
	runSuite?: (suite: Suite) => Promise<void>;
	/**
	* If defined, will be called instead of usual Vitest handling. Useful, if you have your custom test function.
	* "before" and "after" hooks will not be ignored.
	*/
	runTask?: (test: Test) => Promise<void>;
	/**
	* Called, when a task is updated. The same as "onTaskUpdate" in a reporter, but this is running in the same thread as tests.
	*/
	onTaskUpdate?: (task: TaskResultPack[], events: TaskEventPack[]) => Promise<void>;
	/**
	* Called when annotation is added via the `context.annotate` method.
	*/
	onTestAnnotate?: (test: Test, annotation: TestAnnotation) => Promise<TestAnnotation>;
	/**
	* Called before running all tests in collected paths.
	*/
	onBeforeRunFiles?: (files: File[]) => unknown;
	/**
	* Called right after running all tests in collected paths.
	*/
	onAfterRunFiles?: (files: File[]) => unknown;
	/**
	* Called when new context for a test is defined. Useful if you want to add custom properties to the context.
	* If you only want to define custom context, consider using "beforeAll" in "setupFiles" instead.
	*
	* @see https://vitest.dev/advanced/runner#your-task-function
	*/
	extendTaskContext?: (context: TestContext) => TestContext;
	/**
	* Called when test and setup files are imported. Can be called in two situations: when collecting tests and when importing setup files.
	*/
	importFile: (filepath: string, source: VitestRunnerImportSource) => unknown;
	/**
	* Function that is called when the runner attempts to get the value when `test.extend` is used with `{ injected: true }`
	*/
	injectValue?: (key: string) => unknown;
	/**
	* Gets the time spent importing each individual non-externalized file that Vitest collected.
	*/
	getImportDurations?: () => Record<string, ImportDuration>;
	/**
	* Publicly available configuration.
	*/
	config: VitestRunnerConfig;
	/**
	* The name of the current pool. Can affect how stack trace is inferred on the server side.
	*/
	pool?: string;
	/**
	* Return the worker context for fixtures specified with `scope: 'worker'`
	*/
	getWorkerContext?: () => Record<string, unknown>;
	onCleanupWorkerContext?: (cleanup: () => unknown) => void;
	/** @private */
	_currentTaskStartTime?: number;
	/** @private */
	_currentTaskTimeout?: number;
}

export { File, ImportDuration, SequenceHooks, SequenceSetupFiles, Suite, TaskEventPack, TaskResultPack, Test, TestAnnotation, TestContext };
export type { CancelReason, FileSpecification, VitestRunner, VitestRunnerConfig, VitestRunnerConstructor, VitestRunnerImportSource };


export * from './dist/types.js'


type Awaitable<T> = T | PromiseLike<T>;
type Nullable<T> = T | null | undefined;
type Arrayable<T> = T | Array<T>;
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never;
type MergeInsertions<T> = T extends object ? { [K in keyof T] : MergeInsertions<T[K]> } : T;
type DeepMerge<
	F,
	S
> = MergeInsertions<{ [K in keyof F | keyof S] : K extends keyof S & keyof F ? DeepMerge<F[K], S[K]> : K extends keyof S ? S[K] : K extends keyof F ? F[K] : never }>;
type MutableArray<T extends readonly any[]> = { -readonly [k in keyof T] : T[k] };
interface Constructable {
	new (...args: any[]): any;
}
interface ParsedStack {
	method: string;
	file: string;
	line: number;
	column: number;
}
interface SerializedError {
	message: string;
	stack?: string;
	name?: string;
	stacks?: ParsedStack[];
	cause?: SerializedError;
	[key: string]: unknown;
}
interface TestError extends SerializedError {
	cause?: TestError;
	diff?: string;
	actual?: string;
	expected?: string;
}
/**
* @deprecated Use `TestError` instead
*/
interface ErrorWithDiff {
	message: string;
	name?: string;
	cause?: unknown;
	stack?: string;
	stacks?: ParsedStack[];
	showDiff?: boolean;
	actual?: any;
	expected?: any;
	operator?: string;
	type?: string;
	frame?: string;
	diff?: string;
	codeFrame?: string;
}

export type { ArgumentsType, Arrayable, Awaitable, Constructable, DeepMerge, ErrorWithDiff, MergeInsertions, MutableArray, Nullable, ParsedStack, SerializedError, TestError };


export type Inspect = (value: unknown, options: Options) => string;
export interface Options {
    showHidden: boolean;
    depth: number;
    colors: boolean;
    customInspect: boolean;
    showProxy: boolean;
    maxArrayLength: number;
    breakLength: number;
    truncate: number;
    seen: unknown[];
    inspect: Inspect;
    stylize: (value: string, styleType: string) => string;
}
//# sourceMappingURL=types.d.ts.map

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
    encoder?: (str: any, defaultEncoder: DefaultEncoder, charset: string, type: 'key' | 'value', format?: Format) => string;
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
export type NonNullableProperties<T> = {
    [K in keyof T]-?: Exclude<T[K], undefined | null>;
};
//# sourceMappingURL=types.d.ts.map

export type PromiseOrValue<T> = T | Promise<T>;
export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type KeysEnum<T> = {
    [P in keyof Required<T>]: true;
};
export type FinalizedRequestInit = RequestInit & {
    headers: Headers;
};
type NotAny<T> = [0] extends [1 & T] ? never : T;
/**
 * Some environments overload the global fetch function, and Parameters<T> only gets the last signature.
 */
type OverloadedParameters<T> = T extends ({
    (...args: infer A): unknown;
    (...args: infer B): unknown;
    (...args: infer C): unknown;
    (...args: infer D): unknown;
}) ? A | B | C | D : T extends ({
    (...args: infer A): unknown;
    (...args: infer B): unknown;
    (...args: infer C): unknown;
}) ? A | B | C : T extends ({
    (...args: infer A): unknown;
    (...args: infer B): unknown;
}) ? A | B : T extends (...args: infer A) => unknown ? A : never;
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
type NodeFetch3RequestInit = NotAny<import('../node_modules/node-fetch').RequestInit> | NotAny<import('../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/node-fetch').RequestInit>;
/** @ts-ignore For users who use Deno */
type FetchRequestInit = NonNullable<OverloadedParameters<typeof fetch>[1]>;
type RequestInits = NotAny<UndiciTypesRequestInit> | NotAny<UndiciRequestInit> | NotAny<BunRequestInit> | NotAny<NodeFetch2RequestInit> | NotAny<NodeFetch3RequestInit> | NotAny<RequestInit> | NotAny<FetchRequestInit>;
/**
 * This type contains `RequestInit` options that may be available on the current runtime,
 * including per-platform extensions like `dispatcher`, `agent`, `client`, etc.
 */
export type MergedRequestInit = RequestInits & 
/** We don't include these in the types as they'll be overridden for every request. */
Partial<Record<'body' | 'headers' | 'method' | 'signal', never>>;
export {};
//# sourceMappingURL=types.d.ts.map

export type Formatter = (input: string | number | null | undefined) => string

export interface Colors {
	isColorSupported: boolean

	reset: Formatter
	bold: Formatter
	dim: Formatter
	italic: Formatter
	underline: Formatter
	inverse: Formatter
	hidden: Formatter
	strikethrough: Formatter

	black: Formatter
	red: Formatter
	green: Formatter
	yellow: Formatter
	blue: Formatter
	magenta: Formatter
	cyan: Formatter
	white: Formatter
	gray: Formatter

	bgBlack: Formatter
	bgRed: Formatter
	bgGreen: Formatter
	bgYellow: Formatter
	bgBlue: Formatter
	bgMagenta: Formatter
	bgCyan: Formatter
	bgWhite: Formatter

	blackBright: Formatter
	redBright: Formatter
	greenBright: Formatter
	yellowBright: Formatter
	blueBright: Formatter
	magentaBright: Formatter
	cyanBright: Formatter
	whiteBright: Formatter

	bgBlackBright: Formatter
	bgRedBright: Formatter
	bgGreenBright: Formatter
	bgYellowBright: Formatter
	bgBlueBright: Formatter
	bgMagentaBright: Formatter
	bgCyanBright: Formatter
	bgWhiteBright: Formatter
}


export { D as DecodedSourceMap, E as EncodedSourceMap, S as SourceMapInput } from './trace-mapping.d-DLVdEqOp.js';
export { A as Arrayable, h as Awaitable, k as CreateHotContextFunction, D as DebuggerOptions, c as DepsHandlingOptions, i as FetchFunction, F as FetchResult, b as HotContext, l as ModuleCache, M as ModuleCacheMap, f as ModuleExecutionInfo, N as Nullable, R as RawSourceMap, j as ResolveIdFunction, S as StartOfSourceMap, d as ViteNodeResolveId, n as ViteNodeResolveModule, m as ViteNodeRunnerOptions, V as ViteNodeServerOptions } from './index.d-DGmxD2U7.js';


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
export type ExtendsElement = SimpleExtendsElement | InfiniteArray<Linter.Config>;
/**
 * Config with extends. Valid only inside of `defineConfig()`.
 */
export interface ConfigWithExtends extends Linter.Config {
    extends?: ExtendsElement[];
}
export type ConfigWithExtendsArray = InfiniteArray<ConfigWithExtends>[];


/**
 * @fileoverview Shared types for ESLint Core.
 */
import type { JSONSchema4 } from "json-schema";
/**
 * Represents an error inside of a file.
 */
export interface FileError {
    message: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
}
/**
 * Represents a problem found in a file.
 */
export interface FileProblem {
    ruleId: string | null;
    message: string;
    loc: SourceLocation;
}
/**
 * Represents the start and end coordinates of a node inside the source.
 */
export interface SourceLocation {
    start: Position;
    end: Position;
}
/**
 * Represents the start and end coordinates of a node inside the source with an offset.
 */
export interface SourceLocationWithOffset {
    start: PositionWithOffset;
    end: PositionWithOffset;
}
/**
 * Represents a location coordinate inside the source. ESLint-style formats
 * have just `line` and `column` while others may have `offset` as well.
 */
export interface Position {
    line: number;
    column: number;
}
/**
 * Represents a location coordinate inside the source with an offset.
 */
export interface PositionWithOffset extends Position {
    offset: number;
}
/**
 * Represents a range of characters in the source.
 */
export type SourceRange = [number, number];
/**
 * What the rule is responsible for finding:
 * - `problem` means the rule has noticed a potential error.
 * - `suggestion` means the rule suggests an alternate or better approach.
 * - `layout` means the rule is looking at spacing, indentation, etc.
 */
export type RuleType = "problem" | "suggestion" | "layout";
/**
 * The type of fix the rule can provide:
 * - `code` means the rule can fix syntax.
 * - `whitespace` means the rule can fix spacing and indentation.
 */
export type RuleFixType = "code" | "whitespace";
/**
 * An object containing visitor information for a rule. Each method is either the
 * name of a node type or a selector, or is a method that will be called at specific
 * times during the traversal.
 */
export type RuleVisitor = Record<string, ((...args: any[]) => void) | undefined>;
/**
 * Rule meta information used for documentation.
 */
export interface RulesMetaDocs {
    /**
     * A short description of the rule.
     */
    description?: string | undefined;
    /**
     * The URL to the documentation for the rule.
     */
    url?: string | undefined;
    /**
     * The category the rule falls under.
     * @deprecated No longer used.
     */
    category?: string | undefined;
    /**
     * Indicates if the rule is generally recommended for all users.
     *
     * Note - this will always be a boolean for core rules, but may be used in any way by plugins.
     */
    recommended?: unknown;
    /**
     * Indicates if the rule is frozen (no longer accepting feature requests).
     */
    frozen?: boolean | undefined;
}
/**
 * Meta information about a rule.
 */
export interface RulesMeta<MessageIds extends string = string, RuleOptions = unknown[], ExtRuleDocs = unknown> {
    /**
     * Properties that are used when documenting the rule.
     */
    docs?: (RulesMetaDocs & ExtRuleDocs) | undefined;
    /**
     * The type of rule.
     */
    type?: RuleType | undefined;
    /**
     * The schema for the rule options. Required if the rule has options.
     */
    schema?: JSONSchema4 | JSONSchema4[] | false | undefined;
    /**
     * Any default options to be recursively merged on top of any user-provided options.
     **/
    defaultOptions?: RuleOptions;
    /**
     * The messages that the rule can report.
     */
    messages?: Record<MessageIds, string>;
    /**
     * Indicates whether the rule has been deprecated or provides additional metadata about the deprecation. Omit if not deprecated.
     */
    deprecated?: boolean | DeprecatedInfo | undefined;
    /**
     * @deprecated Use deprecated.replacedBy instead.
     * The name of the rule(s) this rule was replaced by, if it was deprecated.
     */
    replacedBy?: readonly string[] | undefined;
    /**
     * Indicates if the rule is fixable, and if so, what type of fix it provides.
     */
    fixable?: RuleFixType | undefined;
    /**
     * Indicates if the rule may provide suggestions.
     */
    hasSuggestions?: boolean | undefined;
    /**
     * The language the rule is intended to lint.
     */
    language?: string;
    /**
     * The dialects of `language` that the rule is intended to lint.
     */
    dialects?: string[];
}
/**
 * Provides additional metadata about a deprecation.
 */
export interface DeprecatedInfo {
    /**
     * General message presented to the user, e.g. for the key rule why the rule
     * is deprecated or for info how to replace the rule.
     */
    message?: string;
    /**
     * URL to more information about this deprecation in general.
     */
    url?: string;
    /**
     * An empty array explicitly states that there is no replacement.
     */
    replacedBy?: ReplacedByInfo[];
    /**
     * The package version since when the rule is deprecated (should use full
     * semver without a leading "v").
     */
    deprecatedSince?: string;
    /**
     * The estimated version when the rule is removed (probably the next major
     * version). null means the rule is "frozen" (will be available but will not
     * be changed).
     */
    availableUntil?: string | null;
}
/**
 * Provides metadata about a replacement
 */
export interface ReplacedByInfo {
    /**
     * General message presented to the user, e.g. how to replace the rule
     */
    message?: string;
    /**
     * URL to more information about this replacement in general
     */
    url?: string;
    /**
     * Name should be "eslint" if the replacement is an ESLint core rule. Omit
     * the property if the replacement is in the same plugin.
     */
    plugin?: ExternalSpecifier;
    /**
     * Name and documentation of the replacement rule
     */
    rule?: ExternalSpecifier;
}
/**
 * Specifies the name and url of an external resource. At least one property
 * should be set.
 */
export interface ExternalSpecifier {
    /**
     * Name of the referenced plugin / rule.
     */
    name?: string;
    /**
     * URL pointing to documentation for the plugin / rule.
     */
    url?: string;
}
/**
 * Generic type for `RuleContext`.
 */
export interface RuleContextTypeOptions {
    LangOptions: LanguageOptions;
    Code: SourceCode;
    RuleOptions: unknown[];
    Node: unknown;
    MessageIds: string;
}
/**
 * Represents the context object that is passed to a rule. This object contains
 * information about the current state of the linting process and is the rule's
 * view into the outside world.
 */
export interface RuleContext<Options extends RuleContextTypeOptions = RuleContextTypeOptions> {
    /**
     * The current working directory for the session.
     */
    cwd: string;
    /**
     * Returns the current working directory for the session.
     * @deprecated Use `cwd` instead.
     */
    getCwd(): string;
    /**
     * The filename of the file being linted.
     */
    filename: string;
    /**
     * Returns the filename of the file being linted.
     * @deprecated Use `filename` instead.
     */
    getFilename(): string;
    /**
     * The physical filename of the file being linted.
     */
    physicalFilename: string;
    /**
     * Returns the physical filename of the file being linted.
     * @deprecated Use `physicalFilename` instead.
     */
    getPhysicalFilename(): string;
    /**
     * The source code object that the rule is running on.
     */
    sourceCode: Options["Code"];
    /**
     * Returns the source code object that the rule is running on.
     * @deprecated Use `sourceCode` instead.
     */
    getSourceCode(): Options["Code"];
    /**
     * Shared settings for the configuration.
     */
    settings: SettingsConfig;
    /**
     * Parser-specific options for the configuration.
     * @deprecated Use `languageOptions.parserOptions` instead.
     */
    parserOptions: Record<string, unknown>;
    /**
     * The language options for the configuration.
     */
    languageOptions: Options["LangOptions"];
    /**
     * The CommonJS path to the parser used while parsing this file.
     * @deprecated No longer used.
     */
    parserPath: string | undefined;
    /**
     * The rule ID.
     */
    id: string;
    /**
     * The rule's configured options.
     */
    options: Options["RuleOptions"];
    /**
     * The report function that the rule should use to report problems.
     * @param violation The violation to report.
     */
    report(violation: ViolationReport<Options["Node"], Options["MessageIds"]>): void;
}
/**
 * Manager of text edits for a rule fix.
 */
export interface RuleTextEditor<EditableSyntaxElement = unknown> {
    /**
     * Inserts text after the specified node or token.
     * @param syntaxElement The node or token to insert after.
     * @param text The edit to insert after the node or token.
     */
    insertTextAfter(syntaxElement: EditableSyntaxElement, text: string): RuleTextEdit;
    /**
     * Inserts text after the specified range.
     * @param range The range to insert after.
     * @param text The edit to insert after the range.
     */
    insertTextAfterRange(range: SourceRange, text: string): RuleTextEdit;
    /**
     * Inserts text before the specified node or token.
     * @param syntaxElement A syntax element with location information to insert before.
     * @param text The edit to insert before the node or token.
     */
    insertTextBefore(syntaxElement: EditableSyntaxElement, text: string): RuleTextEdit;
    /**
     * Inserts text before the specified range.
     * @param range The range to insert before.
     * @param text The edit to insert before the range.
     */
    insertTextBeforeRange(range: SourceRange, text: string): RuleTextEdit;
    /**
     * Removes the specified node or token.
     * @param syntaxElement A syntax element with location information to remove.
     * @returns The edit to remove the node or token.
     */
    remove(syntaxElement: EditableSyntaxElement): RuleTextEdit;
    /**
     * Removes the specified range.
     * @param range The range to remove.
     * @returns The edit to remove the range.
     */
    removeRange(range: SourceRange): RuleTextEdit;
    /**
     * Replaces the specified node or token with the given text.
     * @param syntaxElement A syntax element with location information to replace.
     * @param text The text to replace the node or token with.
     * @returns The edit to replace the node or token.
     */
    replaceText(syntaxElement: EditableSyntaxElement, text: string): RuleTextEdit;
    /**
     * Replaces the specified range with the given text.
     * @param range The range to replace.
     * @param text The text to replace the range with.
     * @returns The edit to replace the range.
     */
    replaceTextRange(range: SourceRange, text: string): RuleTextEdit;
}
/**
 * Represents a fix for a rule violation implemented as a text edit.
 */
export interface RuleTextEdit {
    /**
     * The range to replace.
     */
    range: SourceRange;
    /**
     * The text to insert.
     */
    text: string;
}
/**
 * Fixes a violation.
 * @param fixer The text editor to apply the fix.
 * @returns The fix(es) for the violation.
 */
type RuleFixer = (fixer: RuleTextEditor) => RuleTextEdit | Iterable<RuleTextEdit> | null;
interface ViolationReportBase {
    /**
     * The type of node that the violation is for.
     * @deprecated May be removed in the future.
     */
    nodeType?: string | undefined;
    /**
     * The data to insert into the message.
     */
    data?: Record<string, string> | undefined;
    /**
     * The fix to be applied for the violation.
     */
    fix?: RuleFixer | null | undefined;
    /**
     * An array of suggested fixes for the problem. These fixes may change the
     * behavior of the code, so they are not applied automatically.
     */
    suggest?: SuggestedEdit[] | null | undefined;
}
type ViolationMessage<MessageIds = string> = {
    message: string;
} | {
    messageId: MessageIds;
};
type ViolationLocation<Node> = {
    loc: SourceLocation | Position;
} | {
    node: Node;
};
export type ViolationReport<Node = unknown, MessageIds = string> = ViolationReportBase & ViolationMessage<MessageIds> & ViolationLocation<Node>;
interface SuggestedEditBase {
    /**
     * The data to insert into the message.
     */
    data?: Record<string, string> | undefined;
    /**
     * The fix to be applied for the suggestion.
     */
    fix?: RuleFixer | null | undefined;
}
type SuggestionMessage = {
    desc: string;
} | {
    messageId: string;
};
/**
 * A suggested edit for a rule violation.
 */
export type SuggestedEdit = SuggestedEditBase & SuggestionMessage;
/**
 * Generic options for the `RuleDefinition` type.
 */
export interface RuleDefinitionTypeOptions {
    LangOptions: LanguageOptions;
    Code: SourceCode;
    RuleOptions: unknown[];
    Visitor: RuleVisitor;
    Node: unknown;
    MessageIds: string;
    ExtRuleDocs: unknown;
}
/**
 * The definition of an ESLint rule.
 */
export interface RuleDefinition<Options extends RuleDefinitionTypeOptions = RuleDefinitionTypeOptions> {
    /**
     * The meta information for the rule.
     */
    meta?: RulesMeta<Options["MessageIds"], Options["RuleOptions"], Options["ExtRuleDocs"]>;
    /**
     * Creates the visitor that ESLint uses to apply the rule during traversal.
     * @param context The rule context.
     * @returns The rule visitor.
     */
    create(context: RuleContext<{
        LangOptions: Options["LangOptions"];
        Code: Options["Code"];
        RuleOptions: Options["RuleOptions"];
        Node: Options["Node"];
        MessageIds: Options["MessageIds"];
    }>): Options["Visitor"];
}
/**
 * Defaults for non-language-related `RuleDefinition` options.
 */
export interface CustomRuleTypeDefinitions {
    RuleOptions: unknown[];
    MessageIds: string;
    ExtRuleDocs: Record<string, unknown>;
}
/**
 * A helper type to define language specific specializations of the `RuleDefinition` type.
 *
 * @example
 * ```ts
 * type YourRuleDefinition<
 * 	Options extends Partial<CustomRuleTypeDefinitions> = {},
 * > = CustomRuleDefinitionType<
 * 	{
 * 		LangOptions: YourLanguageOptions;
 * 		Code: YourSourceCode;
 * 		Visitor: YourRuleVisitor;
 * 		Node: YourNode;
 * 	},
 * 	Options
 * >;
 * ```
 */
export type CustomRuleDefinitionType<LanguageSpecificOptions extends Omit<RuleDefinitionTypeOptions, keyof CustomRuleTypeDefinitions>, Options extends Partial<CustomRuleTypeDefinitions>> = RuleDefinition<LanguageSpecificOptions & Required<Options & Omit<CustomRuleTypeDefinitions, keyof Options>>>;
/**
 * The human readable severity level used in a configuration.
 */
export type SeverityName = "off" | "warn" | "error";
/**
 * The numeric severity level for a rule.
 *
 * - `0` means off.
 * - `1` means warn.
 * - `2` means error.
 */
export type SeverityLevel = 0 | 1 | 2;
/**
 * The severity of a rule in a configuration.
 */
export type Severity = SeverityName | SeverityLevel;
/**
 * Represents the configuration options for the core linter.
 */
export interface LinterOptionsConfig {
    /**
     * Indicates whether or not inline configuration is evaluated.
     */
    noInlineConfig?: boolean;
    /**
     * Indicates what to do when an unused disable directive is found.
     */
    reportUnusedDisableDirectives?: boolean | Severity;
    /**
     * A severity value indicating if and how unused inline configs should be
     * tracked and reported.
     */
    reportUnusedInlineConfigs?: Severity;
}
/**
 * The configuration for a rule.
 */
export type RuleConfig<RuleOptions extends unknown[] = unknown[]> = Severity | [Severity, ...Partial<RuleOptions>];
/**
 * A collection of rules and their configurations.
 */
export interface RulesConfig {
    [key: string]: RuleConfig;
}
/**
 * A collection of settings.
 */
export interface SettingsConfig {
    [key: string]: unknown;
}
/**
 * Generic options for the `Language` type.
 */
export interface LanguageTypeOptions {
    LangOptions: LanguageOptions;
    Code: SourceCode;
    RootNode: unknown;
    Node: unknown;
}
/**
 * Represents a plugin language.
 */
export interface Language<Options extends LanguageTypeOptions = {
    LangOptions: LanguageOptions;
    Code: SourceCode;
    RootNode: unknown;
    Node: unknown;
}> {
    /**
     * Indicates how ESLint should read the file.
     */
    fileType: "text";
    /**
     * First line number returned from the parser (text mode only).
     */
    lineStart: 0 | 1;
    /**
     * First column number returned from the parser (text mode only).
     */
    columnStart: 0 | 1;
    /**
     * The property to read the node type from. Used in selector querying.
     */
    nodeTypeKey: string;
    /**
     * The traversal path that tools should take when evaluating the AST
     */
    visitorKeys?: Record<string, string[]>;
    /**
     * Default language options. User-defined options are merged with this object.
     */
    defaultLanguageOptions?: LanguageOptions;
    /**
     * Validates languageOptions for this language.
     */
    validateLanguageOptions(languageOptions: Options["LangOptions"]): void;
    /**
     * Normalizes languageOptions for this language.
     */
    normalizeLanguageOptions?(languageOptions: Options["LangOptions"]): Options["LangOptions"];
    /**
     * Helper for esquery that allows languages to match nodes against
     * class. esquery currently has classes like `function` that will
     * match all the various function nodes. This method allows languages
     * to implement similar shorthands.
     */
    matchesSelectorClass?(className: string, node: Options["Node"], ancestry: Options["Node"][]): boolean;
    /**
     * Parses the given file input into its component parts. This file should not
     * throws errors for parsing errors but rather should return any parsing
     * errors as parse of the ParseResult object.
     */
    parse(file: File, context: LanguageContext<Options["LangOptions"]>): ParseResult<Options["RootNode"]>;
    /**
     * Creates SourceCode object that ESLint uses to work with a file.
     */
    createSourceCode(file: File, input: OkParseResult<Options["RootNode"]>, context: LanguageContext<Options["LangOptions"]>): Options["Code"];
}
/**
 * Plugin-defined options for the language.
 */
export type LanguageOptions = Record<string, unknown>;
/**
 * The context object that is passed to the language plugin methods.
 */
export interface LanguageContext<LangOptions = LanguageOptions> {
    languageOptions: LangOptions;
}
/**
 * Represents a file read by ESLint.
 */
export interface File {
    /**
     * The path that ESLint uses for this file. May be a virtual path
     * if it was returned by a processor.
     */
    path: string;
    /**
     * The path to the file on disk. This always maps directly to a file
     * regardless of whether it was returned from a processor.
     */
    physicalPath: string;
    /**
     * Indicates if the original source contained a byte-order marker.
     * ESLint strips the BOM from the `body`, but this info is needed
     * to correctly apply autofixing.
     */
    bom: boolean;
    /**
     * The body of the file to parse.
     */
    body: string | Uint8Array;
}
/**
 * Represents the successful result of parsing a file.
 */
export interface OkParseResult<RootNode = unknown> {
    /**
     * Indicates if the parse was successful. If true, the parse was successful
     * and ESLint should continue on to create a SourceCode object and run rules;
     * if false, ESLint should just report the error(s) without doing anything
     * else.
     */
    ok: true;
    /**
     * The abstract syntax tree created by the parser. (only when ok: true)
     */
    ast: RootNode;
    /**
     * Any additional data that the parser wants to provide.
     */
    [key: string]: any;
}
/**
 * Represents the unsuccessful result of parsing a file.
 */
export interface NotOkParseResult {
    /**
     * Indicates if the parse was successful. If true, the parse was successful
     * and ESLint should continue on to create a SourceCode object and run rules;
     * if false, ESLint should just report the error(s) without doing anything
     * else.
     */
    ok: false;
    /**
     * Any parsing errors, whether fatal or not. (only when ok: false)
     */
    errors: FileError[];
    /**
     * Any additional data that the parser wants to provide.
     */
    [key: string]: any;
}
export type ParseResult<RootNode = unknown> = OkParseResult<RootNode> | NotOkParseResult;
/**
 * Represents inline configuration found in the source code.
 */
interface InlineConfigElement {
    /**
     * The location of the inline config element.
     */
    loc: SourceLocation;
    /**
     * The interpreted configuration from the inline config element.
     */
    config: {
        rules: RulesConfig;
    };
}
/**
 * Generic options for the `SourceCodeBase` type.
 */
export interface SourceCodeBaseTypeOptions {
    LangOptions: LanguageOptions;
    RootNode: unknown;
    SyntaxElementWithLoc: unknown;
    ConfigNode: unknown;
}
/**
 * Represents the basic interface for a source code object.
 */
interface SourceCodeBase<Options extends SourceCodeBaseTypeOptions = {
    LangOptions: LanguageOptions;
    RootNode: unknown;
    SyntaxElementWithLoc: unknown;
    ConfigNode: unknown;
}> {
    /**
     * Root of the AST.
     */
    ast: Options["RootNode"];
    /**
     * The traversal path that tools should take when evaluating the AST.
     * When present, this overrides the `visitorKeys` on the language for
     * just this source code object.
     */
    visitorKeys?: Record<string, string[]>;
    /**
     * Retrieves the equivalent of `loc` for a given node or token.
     * @param syntaxElement The node or token to get the location for.
     * @returns The location of the node or token.
     */
    getLoc(syntaxElement: Options["SyntaxElementWithLoc"]): SourceLocation;
    /**
     * Retrieves the equivalent of `range` for a given node or token.
     * @param syntaxElement The node or token to get the range for.
     * @returns The range of the node or token.
     */
    getRange(syntaxElement: Options["SyntaxElementWithLoc"]): SourceRange;
    /**
     * Traversal of AST.
     */
    traverse(): Iterable<TraversalStep>;
    /**
     * Applies language options passed in from the ESLint core.
     */
    applyLanguageOptions?(languageOptions: Options["LangOptions"]): void;
    /**
     * Return all of the inline areas where ESLint should be disabled/enabled
     * along with any problems found in evaluating the directives.
     */
    getDisableDirectives?(): {
        directives: Directive[];
        problems: FileProblem[];
    };
    /**
     * Returns an array of all inline configuration nodes found in the
     * source code.
     */
    getInlineConfigNodes?(): Options["ConfigNode"][];
    /**
     * Applies configuration found inside of the source code. This method is only
     * called when ESLint is running with inline configuration allowed.
     */
    applyInlineConfig?(): {
        configs: InlineConfigElement[];
        problems: FileProblem[];
    };
    /**
     * Called by ESLint core to indicate that it has finished providing
     * information. We now add in all the missing variables and ensure that
     * state-changing methods cannot be called by rules.
     * @returns {void}
     */
    finalize?(): void;
}
/**
 * Represents the source of a text file being linted.
 */
export interface TextSourceCode<Options extends SourceCodeBaseTypeOptions = {
    LangOptions: LanguageOptions;
    RootNode: unknown;
    SyntaxElementWithLoc: unknown;
    ConfigNode: unknown;
}> extends SourceCodeBase<Options> {
    /**
     * The body of the file that you'd like rule developers to access.
     */
    text: string;
}
/**
 * Represents the source of a binary file being linted.
 */
export interface BinarySourceCode<Options extends SourceCodeBaseTypeOptions = {
    LangOptions: LanguageOptions;
    RootNode: unknown;
    SyntaxElementWithLoc: unknown;
    ConfigNode: unknown;
}> extends SourceCodeBase<Options> {
    /**
     * The body of the file that you'd like rule developers to access.
     */
    body: Uint8Array;
}
export type SourceCode<Options extends SourceCodeBaseTypeOptions = {
    LangOptions: LanguageOptions;
    RootNode: unknown;
    SyntaxElementWithLoc: unknown;
    ConfigNode: unknown;
}> = TextSourceCode<Options> | BinarySourceCode<Options>;
/**
 * Represents a traversal step visiting the AST.
 */
export interface VisitTraversalStep {
    kind: 1;
    target: unknown;
    phase: 1 | 2;
    args: unknown[];
}
/**
 * Represents a traversal step calling a function.
 */
export interface CallTraversalStep {
    kind: 2;
    target: string;
    phase?: string;
    args: unknown[];
}
export type TraversalStep = VisitTraversalStep | CallTraversalStep;
/**
 * The type of disable directive. This determines how ESLint will disable rules.
 */
export type DirectiveType = "disable" | "enable" | "disable-line" | "disable-next-line";
/**
 * Represents a disable directive.
 */
export interface Directive {
    /**
     * The type of directive.
     */
    type: DirectiveType;
    /**
     * The node of the directive. May be in the AST or a comment/token.
     */
    node: unknown;
    /**
     * The value of the directive.
     */
    value: string;
    /**
     * The justification for the directive.
     */
    justification?: string;
}
export {};


/**
 * @fileoverview Types for object-schema package.
 */
/**
 * Built-in validation strategies.
 */
export type BuiltInValidationStrategy = "array" | "boolean" | "number" | "object" | "object?" | "string" | "string!";
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
    merge: BuiltInMergeStrategy | ((target: any, source: any) => any);
    /**
     * The strategy to validate the property.
     */
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


import { DiffOptions } from '@vitest/utils/diff';
import { F as File, a as Test, S as Suite, L as TaskResultPack, z as TaskEventPack, N as TestAnnotation, U as TestContext, I as ImportDuration, t as SequenceHooks, u as SequenceSetupFiles } from './tasks.d-CkscK4of.js';
export { A as AfterAllListener, b as AfterEachListener, B as BeforeAllListener, d as BeforeEachListener, g as Custom, j as CustomAPI, D as DoneCallback, E as ExtendedContext, m as Fixture, n as FixtureFn, o as FixtureOptions, p as Fixtures, H as HookCleanupCallback, q as HookListener, r as InferFixturesTypes, O as OnTestFailedHandler, f as OnTestFinishedHandler, R as RunMode, s as RuntimeContext, k as SuiteAPI, l as SuiteCollector, v as SuiteFactory, h as SuiteHooks, T as Task, w as TaskBase, x as TaskContext, y as TaskCustomOptions, e as TaskHook, G as TaskMeta, J as TaskPopulated, K as TaskResult, M as TaskState, i as TaskUpdateEvent, j as TestAPI, P as TestAnnotationLocation, Q as TestAttachment, V as TestFunction, W as TestOptions, X as Use } from './tasks.d-CkscK4of.js';
import '@vitest/utils';

/**
* This is a subset of Vitest config that's required for the runner to work.
*/
interface VitestRunnerConfig {
	root: string;
	setupFiles: string[];
	name?: string;
	passWithNoTests: boolean;
	testNamePattern?: RegExp;
	allowOnly?: boolean;
	sequence: {
		shuffle?: boolean
		concurrent?: boolean
		seed: number
		hooks: SequenceHooks
		setupFiles: SequenceSetupFiles
	};
	chaiConfig?: {
		truncateThreshold?: number
	};
	maxConcurrency: number;
	testTimeout: number;
	hookTimeout: number;
	retry: number;
	includeTaskLocation?: boolean;
	diffOptions?: DiffOptions;
}
/**
* Possible options to run a single file in a test.
*/
interface FileSpecification {
	filepath: string;
	testLocations: number[] | undefined;
}
type VitestRunnerImportSource = "collect" | "setup";
interface VitestRunnerConstructor {
	new (config: VitestRunnerConfig): VitestRunner;
}
type CancelReason = "keyboard-input" | "test-failure" | (string & Record<string, never>);
interface VitestRunner {
	/**
	* First thing that's getting called before actually collecting and running tests.
	*/
	onBeforeCollect?: (paths: string[]) => unknown;
	/**
	* Called after the file task was created but not collected yet.
	*/
	onCollectStart?: (file: File) => unknown;
	/**
	* Called after collecting tests and before "onBeforeRun".
	*/
	onCollected?: (files: File[]) => unknown;
	/**
	* Called when test runner should cancel next test runs.
	* Runner should listen for this method and mark tests and suites as skipped in
	* "onBeforeRunSuite" and "onBeforeRunTask" when called.
	*/
	cancel?: (reason: CancelReason) => unknown;
	/**
	* Called before running a single test. Doesn't have "result" yet.
	*/
	onBeforeRunTask?: (test: Test) => unknown;
	/**
	* Called before actually running the test function. Already has "result" with "state" and "startTime".
	*/
	onBeforeTryTask?: (test: Test, options: {
		retry: number
		repeats: number
	}) => unknown;
	/**
	* When the task has finished running, but before cleanup hooks are called
	*/
	onTaskFinished?: (test: Test) => unknown;
	/**
	* Called after result and state are set.
	*/
	onAfterRunTask?: (test: Test) => unknown;
	/**
	* Called right after running the test function. Doesn't have new state yet. Will not be called, if the test function throws.
	*/
	onAfterTryTask?: (test: Test, options: {
		retry: number
		repeats: number
	}) => unknown;
	/**
	* Called before running a single suite. Doesn't have "result" yet.
	*/
	onBeforeRunSuite?: (suite: Suite) => unknown;
	/**
	* Called after running a single suite. Has state and result.
	*/
	onAfterRunSuite?: (suite: Suite) => unknown;
	/**
	* If defined, will be called instead of usual Vitest suite partition and handling.
	* "before" and "after" hooks will not be ignored.
	*/
	runSuite?: (suite: Suite) => Promise<void>;
	/**
	* If defined, will be called instead of usual Vitest handling. Useful, if you have your custom test function.
	* "before" and "after" hooks will not be ignored.
	*/
	runTask?: (test: Test) => Promise<void>;
	/**
	* Called, when a task is updated. The same as "onTaskUpdate" in a reporter, but this is running in the same thread as tests.
	*/
	onTaskUpdate?: (task: TaskResultPack[], events: TaskEventPack[]) => Promise<void>;
	/**
	* Called when annotation is added via the `context.annotate` method.
	*/
	onTestAnnotate?: (test: Test, annotation: TestAnnotation) => Promise<TestAnnotation>;
	/**
	* Called before running all tests in collected paths.
	*/
	onBeforeRunFiles?: (files: File[]) => unknown;
	/**
	* Called right after running all tests in collected paths.
	*/
	onAfterRunFiles?: (files: File[]) => unknown;
	/**
	* Called when new context for a test is defined. Useful if you want to add custom properties to the context.
	* If you only want to define custom context, consider using "beforeAll" in "setupFiles" instead.
	*
	* @see https://vitest.dev/advanced/runner#your-task-function
	*/
	extendTaskContext?: (context: TestContext) => TestContext;
	/**
	* Called when test and setup files are imported. Can be called in two situations: when collecting tests and when importing setup files.
	*/
	importFile: (filepath: string, source: VitestRunnerImportSource) => unknown;
	/**
	* Function that is called when the runner attempts to get the value when `test.extend` is used with `{ injected: true }`
	*/
	injectValue?: (key: string) => unknown;
	/**
	* Gets the time spent importing each individual non-externalized file that Vitest collected.
	*/
	getImportDurations?: () => Record<string, ImportDuration>;
	/**
	* Publicly available configuration.
	*/
	config: VitestRunnerConfig;
	/**
	* The name of the current pool. Can affect how stack trace is inferred on the server side.
	*/
	pool?: string;
	/**
	* Return the worker context for fixtures specified with `scope: 'worker'`
	*/
	getWorkerContext?: () => Record<string, unknown>;
	onCleanupWorkerContext?: (cleanup: () => unknown) => void;
	/** @private */
	_currentTaskStartTime?: number;
	/** @private */
	_currentTaskTimeout?: number;
}

export { File, ImportDuration, SequenceHooks, SequenceSetupFiles, Suite, TaskEventPack, TaskResultPack, Test, TestAnnotation, TestContext };
export type { CancelReason, FileSpecification, VitestRunner, VitestRunnerConfig, VitestRunnerConstructor, VitestRunnerImportSource };


export * from './dist/types.js'


type Awaitable<T> = T | PromiseLike<T>;
type Nullable<T> = T | null | undefined;
type Arrayable<T> = T | Array<T>;
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never;
type MergeInsertions<T> = T extends object ? { [K in keyof T] : MergeInsertions<T[K]> } : T;
type DeepMerge<
	F,
	S
> = MergeInsertions<{ [K in keyof F | keyof S] : K extends keyof S & keyof F ? DeepMerge<F[K], S[K]> : K extends keyof S ? S[K] : K extends keyof F ? F[K] : never }>;
type MutableArray<T extends readonly any[]> = { -readonly [k in keyof T] : T[k] };
interface Constructable {
	new (...args: any[]): any;
}
interface ParsedStack {
	method: string;
	file: string;
	line: number;
	column: number;
}
interface SerializedError {
	message: string;
	stack?: string;
	name?: string;
	stacks?: ParsedStack[];
	cause?: SerializedError;
	[key: string]: unknown;
}
interface TestError extends SerializedError {
	cause?: TestError;
	diff?: string;
	actual?: string;
	expected?: string;
}
/**
* @deprecated Use `TestError` instead
*/
interface ErrorWithDiff {
	message: string;
	name?: string;
	cause?: unknown;
	stack?: string;
	stacks?: ParsedStack[];
	showDiff?: boolean;
	actual?: any;
	expected?: any;
	operator?: string;
	type?: string;
	frame?: string;
	diff?: string;
	codeFrame?: string;
}

export type { ArgumentsType, Arrayable, Awaitable, Constructable, DeepMerge, ErrorWithDiff, MergeInsertions, MutableArray, Nullable, ParsedStack, SerializedError, TestError };


export type Inspect = (value: unknown, options: Options) => string;
export interface Options {
    showHidden: boolean;
    depth: number;
    colors: boolean;
    customInspect: boolean;
    showProxy: boolean;
    maxArrayLength: number;
    breakLength: number;
    truncate: number;
    seen: unknown[];
    inspect: Inspect;
    stylize: (value: string, styleType: string) => string;
}
//# sourceMappingURL=types.d.ts.map

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
    encoder?: (str: any, defaultEncoder: DefaultEncoder, charset: string, type: 'key' | 'value', format?: Format) => string;
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
export type NonNullableProperties<T> = {
    [K in keyof T]-?: Exclude<T[K], undefined | null>;
};
//# sourceMappingURL=types.d.ts.map

export type PromiseOrValue<T> = T | Promise<T>;
export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type KeysEnum<T> = {
    [P in keyof Required<T>]: true;
};
export type FinalizedRequestInit = RequestInit & {
    headers: Headers;
};
type NotAny<T> = [0] extends [1 & T] ? never : T;
/**
 * Some environments overload the global fetch function, and Parameters<T> only gets the last signature.
 */
type OverloadedParameters<T> = T extends ({
    (...args: infer A): unknown;
    (...args: infer B): unknown;
    (...args: infer C): unknown;
    (...args: infer D): unknown;
}) ? A | B | C | D : T extends ({
    (...args: infer A): unknown;
    (...args: infer B): unknown;
    (...args: infer C): unknown;
}) ? A | B | C : T extends ({
    (...args: infer A): unknown;
    (...args: infer B): unknown;
}) ? A | B : T extends (...args: infer A) => unknown ? A : never;
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
type NodeFetch3RequestInit = NotAny<import('../node_modules/node-fetch').RequestInit> | NotAny<import('../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../node_modules/node-fetch').RequestInit> | NotAny<import('../../../../../../../../../../node_modules/node-fetch').RequestInit>;
/** @ts-ignore For users who use Deno */
type FetchRequestInit = NonNullable<OverloadedParameters<typeof fetch>[1]>;
type RequestInits = NotAny<UndiciTypesRequestInit> | NotAny<UndiciRequestInit> | NotAny<BunRequestInit> | NotAny<NodeFetch2RequestInit> | NotAny<NodeFetch3RequestInit> | NotAny<RequestInit> | NotAny<FetchRequestInit>;
/**
 * This type contains `RequestInit` options that may be available on the current runtime,
 * including per-platform extensions like `dispatcher`, `agent`, `client`, etc.
 */
export type MergedRequestInit = RequestInits & 
/** We don't include these in the types as they'll be overridden for every request. */
Partial<Record<'body' | 'headers' | 'method' | 'signal', never>>;
export {};
//# sourceMappingURL=types.d.ts.map

export type Formatter = (input: string | number | null | undefined) => string

export interface Colors {
	isColorSupported: boolean

	reset: Formatter
	bold: Formatter
	dim: Formatter
	italic: Formatter
	underline: Formatter
	inverse: Formatter
	hidden: Formatter
	strikethrough: Formatter

	black: Formatter
	red: Formatter
	green: Formatter
	yellow: Formatter
	blue: Formatter
	magenta: Formatter
	cyan: Formatter
	white: Formatter
	gray: Formatter

	bgBlack: Formatter
	bgRed: Formatter
	bgGreen: Formatter
	bgYellow: Formatter
	bgBlue: Formatter
	bgMagenta: Formatter
	bgCyan: Formatter
	bgWhite: Formatter

	blackBright: Formatter
	redBright: Formatter
	greenBright: Formatter
	yellowBright: Formatter
	blueBright: Formatter
	magentaBright: Formatter
	cyanBright: Formatter
	whiteBright: Formatter

	bgBlackBright: Formatter
	bgRedBright: Formatter
	bgGreenBright: Formatter
	bgYellowBright: Formatter
	bgBlueBright: Formatter
	bgMagentaBright: Formatter
	bgCyanBright: Formatter
	bgWhiteBright: Formatter
}


export { D as DecodedSourceMap, E as EncodedSourceMap, S as SourceMapInput } from './trace-mapping.d-DLVdEqOp.js';
export { A as Arrayable, h as Awaitable, k as CreateHotContextFunction, D as DebuggerOptions, c as DepsHandlingOptions, i as FetchFunction, F as FetchResult, b as HotContext, l as ModuleCache, M as ModuleCacheMap, f as ModuleExecutionInfo, N as Nullable, R as RawSourceMap, j as ResolveIdFunction, S as StartOfSourceMap, d as ViteNodeResolveId, n as ViteNodeResolveModule, m as ViteNodeRunnerOptions, V as ViteNodeServerOptions } from './index.d-DGmxD2U7.js';
