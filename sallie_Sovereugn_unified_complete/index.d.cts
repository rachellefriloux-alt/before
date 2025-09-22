//#region src/composable-filters.d.ts
type StringOrRegExp = string | RegExp;
type PluginModuleType = "js" | "jsx" | "ts" | "tsx" | "json" | "text" | "base64" | "dataurl" | "binary" | "empty" | (string & {});
type FilterExpressionKind = FilterExpression["kind"];
type FilterExpression = And | Or | Not | Id | ModuleType | Code | Query;
type TopLevelFilterExpression = Include | Exclude;
declare class And {
  kind: "and";
  args: FilterExpression[];
  constructor(...args: FilterExpression[]);
}
declare class Or {
  kind: "or";
  args: FilterExpression[];
  constructor(...args: FilterExpression[]);
}
declare class Not {
  kind: "not";
  expr: FilterExpression;
  constructor(expr: FilterExpression);
}
interface QueryFilterObject {
  [key: string]: StringOrRegExp | boolean;
}
interface IdParams {
  cleanUrl?: boolean;
}
declare class Id {
  kind: "id";
  pattern: StringOrRegExp;
  params: IdParams;
  constructor(pattern: StringOrRegExp, params?: IdParams);
}
declare class ModuleType {
  kind: "moduleType";
  pattern: PluginModuleType;
  constructor(pattern: PluginModuleType);
}
declare class Code {
  kind: "code";
  pattern: StringOrRegExp;
  constructor(expr: StringOrRegExp);
}
declare class Query {
  kind: "query";
  key: string;
  pattern: StringOrRegExp | boolean;
  constructor(key: string, pattern: StringOrRegExp | boolean);
}
declare class Include {
  kind: "include";
  expr: FilterExpression;
  constructor(expr: FilterExpression);
}
declare class Exclude {
  kind: "exclude";
  expr: FilterExpression;
  constructor(expr: FilterExpression);
}
declare function and(...args: FilterExpression[]): And;
declare function or(...args: FilterExpression[]): Or;
declare function not(expr: FilterExpression): Not;
declare function id(pattern: StringOrRegExp, params?: IdParams): Id;
declare function moduleType(pattern: PluginModuleType): ModuleType;
declare function code(pattern: StringOrRegExp): Code;
declare function query(key: string, pattern: StringOrRegExp | boolean): Query;
declare function include(expr: FilterExpression): Include;
declare function exclude(expr: FilterExpression): Exclude;
/**
* convert a queryObject to FilterExpression like
* ```js
*   and(query(k1, v1), query(k2, v2))
* ```
* @param queryFilterObject The query filter object needs to be matched.
* @returns a `And` FilterExpression
*/
declare function queries(queryFilter: QueryFilterObject): And;
declare function interpreter(exprs: TopLevelFilterExpression | TopLevelFilterExpression[], code?: string, id?: string, moduleType?: PluginModuleType): boolean;
interface InterpreterCtx {
  urlSearchParamsCache?: URLSearchParams;
}
declare function interpreterImpl(expr: TopLevelFilterExpression[], code?: string, id?: string, moduleType?: PluginModuleType, ctx?: InterpreterCtx): boolean;
declare function exprInterpreter(expr: FilterExpression, code?: string, id?: string, moduleType?: PluginModuleType, ctx?: InterpreterCtx): boolean;
//#endregion
//#region src/simple-filters.d.ts
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
declare function exactRegex(str: string, flags?: string): RegExp;
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
declare function prefixRegex(str: string, flags?: string): RegExp;
type WidenString<T> = T extends string ? string : T;
/**
* Converts a id filter to match with an id with a query.
*
* @param input the id filters to convert.
*
* @example
* ```ts
* import { makeIdFiltersToMatchWithQuery } from '@rolldown/pluginutils';
* const plugin = {
*   name: 'plugin',
*   transform: {
*     filter: { id: makeIdFiltersToMatchWithQuery(['**' + '/*.js', /\.ts$/]) },
*     // The handler will be called for IDs like:
*     // - foo.js
*     // - foo.js?foo
*     // - foo.txt?foo.js
*     // - foo.ts
*     // - foo.ts?foo
*     // - foo.txt?foo.ts
*     handler(code, id) {}
*   }
* }
* ```
*/
declare function makeIdFiltersToMatchWithQuery<T extends string | RegExp>(input: T): WidenString<T>;
declare function makeIdFiltersToMatchWithQuery<T extends string | RegExp>(input: readonly T[]): WidenString<T>[];
declare function makeIdFiltersToMatchWithQuery(input: string | RegExp | readonly (string | RegExp)[]): string | RegExp | (string | RegExp)[];
//#endregion
export { FilterExpression, FilterExpressionKind, QueryFilterObject, TopLevelFilterExpression, and, code, exactRegex, exclude, exprInterpreter, id, include, interpreter, interpreterImpl, makeIdFiltersToMatchWithQuery, moduleType, not, or, prefixRegex, queries, query };

/// <reference types="node" />
import * as nativeFs from "fs";
import picomatch from "picomatch";

//#region src/api/aborter.d.ts
/**
 * AbortController is not supported on Node 14 so we use this until we can drop
 * support for Node 14.
 */
declare class Aborter {
  aborted: boolean;
  abort(): void;
}
//#endregion
//#region src/api/queue.d.ts
type OnQueueEmptyCallback = (error: Error | null, output: WalkerState) => void;
/**
 * This is a custom stateless queue to track concurrent async fs calls.
 * It increments a counter whenever a call is queued and decrements it
 * as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
 */
declare class Queue {
  private onQueueEmpty?;
  count: number;
  constructor(onQueueEmpty?: OnQueueEmptyCallback | undefined);
  enqueue(): number;
  dequeue(error: Error | null, output: WalkerState): void;
}
//#endregion
//#region src/types.d.ts
type Counts = {
  files: number;
  directories: number;
  /**
   * @deprecated use `directories` instead. Will be removed in v7.0.
   */
  dirs: number;
};
type Group = {
  directory: string;
  files: string[];
  /**
   * @deprecated use `directory` instead. Will be removed in v7.0.
   */
  dir: string;
};
type GroupOutput = Group[];
type OnlyCountsOutput = Counts;
type PathsOutput = string[];
type Output = OnlyCountsOutput | PathsOutput | GroupOutput;
type FSLike = {
  readdir: typeof nativeFs.readdir;
  readdirSync: typeof nativeFs.readdirSync;
  realpath: typeof nativeFs.realpath;
  realpathSync: typeof nativeFs.realpathSync;
  stat: typeof nativeFs.stat;
  statSync: typeof nativeFs.statSync;
};
type WalkerState = {
  root: string;
  paths: string[];
  groups: Group[];
  counts: Counts;
  options: Options;
  queue: Queue;
  controller: Aborter;
  fs: FSLike;
  symlinks: Map<string, string>;
  visited: string[];
};
type ResultCallback<TOutput extends Output> = (error: Error | null, output: TOutput) => void;
type FilterPredicate = (path: string, isDirectory: boolean) => boolean;
type ExcludePredicate = (dirName: string, dirPath: string) => boolean;
type PathSeparator = "/" | "\\";
type Options<TGlobFunction = unknown> = {
  includeBasePath?: boolean;
  includeDirs?: boolean;
  normalizePath?: boolean;
  maxDepth: number;
  maxFiles?: number;
  resolvePaths?: boolean;
  suppressErrors: boolean;
  group?: boolean;
  onlyCounts?: boolean;
  filters: FilterPredicate[];
  resolveSymlinks?: boolean;
  useRealPaths?: boolean;
  excludeFiles?: boolean;
  excludeSymlinks?: boolean;
  exclude?: ExcludePredicate;
  relativePaths?: boolean;
  pathSeparator: PathSeparator;
  signal?: AbortSignal;
  globFunction?: TGlobFunction;
  fs?: FSLike;
};
type GlobMatcher = (test: string) => boolean;
type GlobFunction = (glob: string | string[], ...params: unknown[]) => GlobMatcher;
type GlobParams<T> = T extends ((globs: string | string[], ...params: infer TParams extends unknown[]) => GlobMatcher) ? TParams : [];
//#endregion
//#region src/builder/api-builder.d.ts
declare class APIBuilder<TReturnType extends Output> {
  private readonly root;
  private readonly options;
  constructor(root: string, options: Options);
  withPromise(): Promise<TReturnType>;
  withCallback(cb: ResultCallback<TReturnType>): void;
  sync(): TReturnType;
}
//#endregion
//#region src/builder/index.d.ts
declare class Builder<TReturnType extends Output = PathsOutput, TGlobFunction = typeof picomatch> {
  private readonly globCache;
  private options;
  private globFunction?;
  constructor(options?: Partial<Options<TGlobFunction>>);
  group(): Builder<GroupOutput, TGlobFunction>;
  withPathSeparator(separator: "/" | "\\"): this;
  withBasePath(): this;
  withRelativePaths(): this;
  withDirs(): this;
  withMaxDepth(depth: number): this;
  withMaxFiles(limit: number): this;
  withFullPaths(): this;
  withErrors(): this;
  withSymlinks({
    resolvePaths
  }?: {
    resolvePaths?: boolean | undefined;
  }): this;
  withAbortSignal(signal: AbortSignal): this;
  normalize(): this;
  filter(predicate: FilterPredicate): this;
  onlyDirs(): this;
  exclude(predicate: ExcludePredicate): this;
  onlyCounts(): Builder<OnlyCountsOutput, TGlobFunction>;
  crawl(root?: string): APIBuilder<TReturnType>;
  withGlobFunction<TFunc>(fn: TFunc): Builder<TReturnType, TFunc>;
  /**
   * @deprecated Pass options using the constructor instead:
   * ```ts
   * new fdir(options).crawl("/path/to/root");
   * ```
   * This method will be removed in v7.0
   */
  crawlWithOptions(root: string, options: Partial<Options<TGlobFunction>>): APIBuilder<TReturnType>;
  glob(...patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[], ...options: GlobParams<TGlobFunction>): Builder<TReturnType, TGlobFunction>;
}
//#endregion
//#region src/index.d.ts
type Fdir = typeof Builder;
//#endregion
export { Counts, ExcludePredicate, FSLike, Fdir, FilterPredicate, GlobFunction, GlobMatcher, GlobParams, Group, GroupOutput, OnlyCountsOutput, Options, Output, PathSeparator, PathsOutput, ResultCallback, WalkerState, Builder as fdir };

/**
 * Generate secure URL-friendly unique ID.
 *
 * By default, the ID will have 21 symbols to have a collision probability
 * similar to UUID v4.
 *
 * ```js
 * import { nanoid } from 'nanoid'
 * model.id = nanoid() //=> "Uakgb_J5m9g-0JDMbcJqL"
 * ```
 *
 * @param size Size of the ID. The default size is 21.
 * @returns A random string.
 */
export function nanoid(size?: number): string

/**
 * Generate secure unique ID with custom alphabet.
 *
 * Alphabet must contain 256 symbols or less. Otherwise, the generator
 * will not be secure.
 *
 * @param alphabet Alphabet used to generate the ID.
 * @param defaultSize Size of the ID. The default size is 21.
 * @returns A random string generator.
 *
 * ```js
 * const { customAlphabet } = require('nanoid')
 * const nanoid = customAlphabet('0123456789абвгдеё', 5)
 * nanoid() //=> "8ё56а"
 * ```
 */
export function customAlphabet(
  alphabet: string,
  defaultSize?: number
): (size?: number) => string

/**
 * Generate unique ID with custom random generator and alphabet.
 *
 * Alphabet must contain 256 symbols or less. Otherwise, the generator
 * will not be secure.
 *
 * ```js
 * import { customRandom } from 'nanoid/format'
 *
 * const nanoid = customRandom('abcdef', 5, size => {
 *   const random = []
 *   for (let i = 0; i < size; i++) {
 *     random.push(randomByte())
 *   }
 *   return random
 * })
 *
 * nanoid() //=> "fbaef"
 * ```
 *
 * @param alphabet Alphabet used to generate a random string.
 * @param size Size of the random string.
 * @param random A random bytes generator.
 * @returns A random string generator.
 */
export function customRandom(
  alphabet: string,
  size: number,
  random: (bytes: number) => Uint8Array
): () => string

/**
 * URL safe symbols.
 *
 * ```js
 * import { urlAlphabet } from 'nanoid'
 * const nanoid = customAlphabet(urlAlphabet, 10)
 * nanoid() //=> "Uakgb_J5m9"
 * ```
 */
export const urlAlphabet: string

/**
 * Generate an array of random bytes collected from hardware noise.
 *
 * ```js
 * import { customRandom, random } from 'nanoid'
 * const nanoid = customRandom("abcdef", 5, random)
 * ```
 *
 * @param bytes Size of the array.
 * @returns An array of random bytes.
 */
export function random(bytes: number): Uint8Array


import * as path from 'node:path';
import path__default from 'node:path';

/**
 * Constant for path separator.
 *
 * Always equals to `"/"`.
 */
declare const sep = "/";
declare const normalize: typeof path__default.normalize;
declare const join: typeof path__default.join;
declare const resolve: typeof path__default.resolve;
/**
 * Resolves a string path, resolving '.' and '.' segments and allowing paths above the root.
 *
 * @param path - The path to normalise.
 * @param allowAboveRoot - Whether to allow the resulting path to be above the root directory.
 * @returns the normalised path string.
 */
declare function normalizeString(path: string, allowAboveRoot: boolean): string;
declare const isAbsolute: typeof path__default.isAbsolute;
declare const toNamespacedPath: typeof path__default.toNamespacedPath;
declare const extname: typeof path__default.extname;
declare const relative: typeof path__default.relative;
declare const dirname: typeof path__default.dirname;
declare const format: typeof path__default.format;
declare const basename: typeof path__default.basename;
declare const parse: typeof path__default.parse;
/**
 * The `path.matchesGlob()` method determines if `path` matches the `pattern`.
 * @param path The path to glob-match against.
 * @param pattern The glob to check the path against.
 */
declare const matchesGlob: (path: string, pattern: string | string[]) => boolean;

type NodePath = typeof path;
/**
 * The platform-specific file delimiter.
 *
 * Equals to `";"` in windows and `":"` in all other platforms.
 */
declare const delimiter: ";" | ":";
declare const posix: NodePath["posix"];
declare const win32: NodePath["win32"];
declare const _default: NodePath;

export { basename, _default as default, delimiter, dirname, extname, format, isAbsolute, join, matchesGlob, normalize, normalizeString, parse, posix, relative, resolve, sep, toNamespacedPath, win32 };


type EnvObject = Record<string, string | undefined>;
declare const env: EnvObject;
declare const nodeENV: string;

/** Value of process.platform */
declare const platform: NodeJS.Platform;
/** Detect if `CI` environment variable is set or a provider CI detected */
declare const isCI: boolean;
/** Detect if stdout.TTY is available */
declare const hasTTY: boolean;
/** Detect if global `window` object is available */
declare const hasWindow: boolean;
/** Detect if `DEBUG` environment variable is set */
declare const isDebug: boolean;
/** Detect if `NODE_ENV` environment variable is `test` */
declare const isTest: boolean;
/** Detect if `NODE_ENV` environment variable is `production` */
declare const isProduction: boolean;
/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
declare const isDevelopment: boolean;
/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
declare const isMinimal: boolean;
/** Detect if process.platform is Windows */
declare const isWindows: boolean;
/** Detect if process.platform is Linux */
declare const isLinux: boolean;
/** Detect if process.platform is macOS (darwin kernel) */
declare const isMacOS: boolean;
/** Color Support */
declare const isColorSupported: boolean;
/** Node.js versions */
declare const nodeVersion: string | null;
declare const nodeMajorVersion: number | null;

interface Process extends Partial<Omit<typeof globalThis.process, "versions">> {
    env: EnvObject;
    versions: Record<string, string>;
}
declare const process: Process;

type ProviderName = "" | "appveyor" | "aws_amplify" | "azure_pipelines" | "azure_static" | "appcircle" | "bamboo" | "bitbucket" | "bitrise" | "buddy" | "buildkite" | "circle" | "cirrus" | "cloudflare_pages" | "cloudflare_workers" | "codebuild" | "codefresh" | "drone" | "drone" | "dsari" | "github_actions" | "gitlab" | "gocd" | "layerci" | "hudson" | "jenkins" | "magnum" | "netlify" | "nevercode" | "render" | "sail" | "semaphore" | "screwdriver" | "shippable" | "solano" | "strider" | "teamcity" | "travis" | "vercel" | "appcenter" | "codesandbox" | "stackblitz" | "stormkit" | "cleavr" | "zeabur" | "codesphere" | "railway" | "deno-deploy" | "firebase_app_hosting";
type ProviderInfo = {
    name: ProviderName;
    ci?: boolean;
    [meta: string]: any;
};
/** Current provider info */
declare const providerInfo: ProviderInfo;
declare const provider: ProviderName;

type RuntimeName = "workerd" | "deno" | "netlify" | "node" | "bun" | "edge-light" | "fastly" | "";
type RuntimeInfo = {
    name: RuntimeName;
};
/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * **Note:** When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
 *
 * Use `runtime === "node"` if you need strict check for Node.js runtime.
 */
declare const isNode: boolean;
/**
 * Indicates if running in Bun runtime.
 */
declare const isBun: boolean;
/**
 * Indicates if running in Deno runtime.
 */
declare const isDeno: boolean;
/**
 * Indicates if running in Fastly runtime.
 */
declare const isFastly: boolean;
/**
 * Indicates if running in Netlify runtime.
 */
declare const isNetlify: boolean;
/**
 *
 * Indicates if running in EdgeLight (Vercel Edge) runtime.
 */
declare const isEdgeLight: boolean;
/**
 * Indicates if running in Cloudflare Workers runtime.
 */
declare const isWorkerd: boolean;
declare const runtimeInfo: RuntimeInfo | undefined;
declare const runtime: RuntimeName;

export { env, hasTTY, hasWindow, isBun, isCI, isColorSupported, isDebug, isDeno, isDevelopment, isEdgeLight, isFastly, isLinux, isMacOS, isMinimal, isNetlify, isNode, isProduction, isTest, isWindows, isWorkerd, nodeENV, nodeMajorVersion, nodeVersion, platform, process, provider, providerInfo, runtime, runtimeInfo };
export type { EnvObject, Process, ProviderInfo, ProviderName, RuntimeInfo, RuntimeName };


import * as js_tokens from 'js-tokens';
import { Token } from 'js-tokens';

interface StripLiteralOptions {
    /**
     * Will be called for each string literal. Return false to skip stripping.
     */
    filter?: (s: string) => boolean;
    /**
     * Fill the stripped literal with this character.
     * It must be a single character.
     *
     * @default ' '
     */
    fillChar?: string;
}

declare function stripLiteralJsTokens(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: Token[];
};

/**
 * Strip literal from code.
 */
declare function stripLiteral(code: string, options?: StripLiteralOptions): string;
/**
 * Strip literal from code, return more detailed information.
 */
declare function stripLiteralDetailed(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: js_tokens.Token[];
};

export { type StripLiteralOptions, stripLiteral, stripLiteralDetailed, stripLiteralJsTokens };


/**
 * A class that represents each benchmark task in Tinybench. It keeps track of the
 * results, name, Bench instance, the task function and the number times the task
 * function has been executed.
 */
declare class Task extends EventTarget {
    bench: Bench;
    /**
     * task name
     */
    name: string;
    fn: Fn;
    runs: number;
    /**
     * the result object
     */
    result?: TaskResult;
    /**
     * Task options
     */
    opts: FnOptions;
    constructor(bench: Bench, name: string, fn: Fn, opts?: FnOptions);
    private loop;
    /**
     * run the current task and write the results in `Task.result` object
     */
    run(): Promise<this>;
    /**
     * warmup the current task
     */
    warmup(): Promise<void>;
    addEventListener<K extends TaskEvents, T = TaskEventsMap[K]>(type: K, listener: T, options?: AddEventListenerOptionsArgument): void;
    removeEventListener<K extends TaskEvents, T = TaskEventsMap[K]>(type: K, listener: T, options?: RemoveEventListenerOptionsArgument): void;
    /**
     * change the result object values
     */
    setResult(result: Partial<TaskResult>): void;
    /**
     * reset the task to make the `Task.runs` a zero-value and remove the `Task.result`
     * object
     */
    reset(): void;
}

/**
 * the task function
 */
type Fn = () => any | Promise<any>;
interface FnOptions {
    /**
     * An optional function that is run before iterations of this task begin
     */
    beforeAll?: (this: Task) => void | Promise<void>;
    /**
     * An optional function that is run before each iteration of this task
     */
    beforeEach?: (this: Task) => void | Promise<void>;
    /**
     * An optional function that is run after each iteration of this task
     */
    afterEach?: (this: Task) => void | Promise<void>;
    /**
     * An optional function that is run after all iterations of this task end
     */
    afterAll?: (this: Task) => void | Promise<void>;
}
/**
 * the benchmark task result object
 */
type TaskResult = {
    error?: unknown;
    /**
     * The amount of time in milliseconds to run the benchmark task (cycle).
     */
    totalTime: number;
    /**
     * the minimum value in the samples
     */
    min: number;
    /**
     * the maximum value in the samples
     */
    max: number;
    /**
     * the number of operations per second
     */
    hz: number;
    /**
     * how long each operation takes (ms)
     */
    period: number;
    /**
     * task samples of each task iteration time (ms)
     */
    samples: number[];
    /**
     * samples mean/average (estimate of the population mean)
     */
    mean: number;
    /**
     * samples variance (estimate of the population variance)
     */
    variance: number;
    /**
     * samples standard deviation (estimate of the population standard deviation)
     */
    sd: number;
    /**
     * standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean)
     */
    sem: number;
    /**
     * degrees of freedom
     */
    df: number;
    /**
     * critical value of the samples
     */
    critical: number;
    /**
     * margin of error
     */
    moe: number;
    /**
     * relative margin of error
     */
    rme: number;
    /**
     * p75 percentile
     */
    p75: number;
    /**
     * p99 percentile
     */
    p99: number;
    /**
     * p995 percentile
     */
    p995: number;
    /**
     * p999 percentile
     */
    p999: number;
};
/**
  * Both the `Task` and `Bench` objects extend the `EventTarget` object,
  * so you can attach a listeners to different types of events
  * to each class instance using the universal `addEventListener` and
 * `removeEventListener`
 */
/**
 * Bench events
 */
type BenchEvents = 'abort' | 'complete' | 'error' | 'reset' | 'start' | 'warmup' | 'cycle' | 'add' | 'remove' | 'todo';
type Hook = (task: Task, mode: 'warmup' | 'run') => void | Promise<void>;
type NoopEventListener = () => any | Promise<any>;
type TaskEventListener = (e: Event & {
    task: Task;
}) => any | Promise<any>;
interface BenchEventsMap {
    abort: NoopEventListener;
    start: NoopEventListener;
    complete: NoopEventListener;
    warmup: NoopEventListener;
    reset: NoopEventListener;
    add: TaskEventListener;
    remove: TaskEventListener;
    cycle: TaskEventListener;
    error: TaskEventListener;
    todo: TaskEventListener;
}
/**
 * task events
 */
type TaskEvents = 'abort' | 'complete' | 'error' | 'reset' | 'start' | 'warmup' | 'cycle';
type TaskEventsMap = {
    abort: NoopEventListener;
    start: TaskEventListener;
    error: TaskEventListener;
    cycle: TaskEventListener;
    complete: TaskEventListener;
    warmup: TaskEventListener;
    reset: TaskEventListener;
};
type Options = {
    /**
     * time needed for running a benchmark task (milliseconds) @default 500
     */
    time?: number;
    /**
     * number of times that a task should run if even the time option is finished @default 10
     */
    iterations?: number;
    /**
     * function to get the current timestamp in milliseconds
     */
    now?: () => number;
    /**
     * An AbortSignal for aborting the benchmark
     */
    signal?: AbortSignal;
    /**
     * Throw if a task fails (events will not work if true)
     */
    throws?: boolean;
    /**
     * warmup time (milliseconds) @default 100ms
     */
    warmupTime?: number;
    /**
     * warmup iterations @default 5
     */
    warmupIterations?: number;
    /**
     * setup function to run before each benchmark task (cycle)
     */
    setup?: Hook;
    /**
     * teardown function to run after each benchmark task (cycle)
     */
    teardown?: Hook;
};
type BenchEvent = Event & {
    task: Task | null;
};
type RemoveEventListenerOptionsArgument = Parameters<typeof EventTarget.prototype.removeEventListener>[2];
type AddEventListenerOptionsArgument = Parameters<typeof EventTarget.prototype.addEventListener>[2];

/**
 * The Benchmark instance for keeping track of the benchmark tasks and controlling
 * them.
 */
declare class Bench extends EventTarget {
    _tasks: Map<string, Task>;
    _todos: Map<string, Task>;
    /**
   * Executes tasks concurrently based on the specified concurrency mode.
   *
   * - When `mode` is set to `null` (default), concurrency is disabled.
   * - When `mode` is set to 'task', each task's iterations (calls of a task function) run concurrently.
   * - When `mode` is set to 'bench', different tasks within the bench run concurrently.
   */
    concurrency: 'task' | 'bench' | null;
    /**
     * The maximum number of concurrent tasks to run. Defaults to Infinity.
     */
    threshold: number;
    signal?: AbortSignal;
    throws: boolean;
    warmupTime: number;
    warmupIterations: number;
    time: number;
    iterations: number;
    now: () => number;
    setup: Hook;
    teardown: Hook;
    constructor(options?: Options);
    private runTask;
    /**
     * run the added tasks that were registered using the
     * {@link add} method.
     * Note: This method does not do any warmup. Call {@link warmup} for that.
     */
    run(): Promise<Task[]>;
    /**
     * See Bench.{@link concurrency}
     */
    runConcurrently(threshold?: number, mode?: NonNullable<Bench['concurrency']>): Promise<Task[]>;
    /**
     * warmup the benchmark tasks.
     * This is not run by default by the {@link run} method.
     */
    warmup(): Promise<void>;
    /**
     * warmup the benchmark tasks concurrently.
     * This is not run by default by the {@link runConcurrently} method.
     */
    warmupConcurrently(threshold?: number, mode?: NonNullable<Bench['concurrency']>): Promise<void>;
    /**
     * reset each task and remove its result
     */
    reset(): void;
    /**
     * add a benchmark task to the task map
     */
    add(name: string, fn: Fn, opts?: FnOptions): this;
    /**
     * add a benchmark todo to the todo map
     */
    todo(name: string, fn?: Fn, opts?: FnOptions): this;
    /**
     * remove a benchmark task from the task map
     */
    remove(name: string): this;
    addEventListener<K extends BenchEvents, T = BenchEventsMap[K]>(type: K, listener: T, options?: AddEventListenerOptionsArgument): void;
    removeEventListener<K extends BenchEvents, T = BenchEventsMap[K]>(type: K, listener: T, options?: RemoveEventListenerOptionsArgument): void;
    /**
     * table of the tasks results
     */
    table(convert?: (task: Task) => Record<string, string | number> | undefined): (Record<string, string | number> | null)[];
    /**
     * (getter) tasks results as an array
     */
    get results(): (TaskResult | undefined)[];
    /**
     * (getter) tasks as an array
     */
    get tasks(): Task[];
    get todos(): Task[];
    /**
     * get a task based on the task name
     */
    getTask(name: string): Task | undefined;
}

declare const hrtimeNow: () => number;
declare const now: () => number;

export { Bench, type BenchEvent, type BenchEvents, type Fn, type Hook, type Options, Task, type TaskEvents, type TaskResult, hrtimeNow, now };


export * from './dist/index.js'


export { ObjectSchema } from "@eslint/object-schema";
export type PropertyDefinition = import("@eslint/object-schema").PropertyDefinition;
export type ObjectDefinition = import("@eslint/object-schema").ObjectDefinition;
export type ConfigObject = import("./types.cts").ConfigObject;
export type IMinimatchStatic = import("minimatch").IMinimatchStatic;
export type IMinimatch = import("minimatch").IMinimatch;
export type PathImpl = typeof import("@jsr/std__path");
export type ObjectSchemaInstance = import("@eslint/object-schema").ObjectSchema;
/**
 * Represents an array of config objects and provides method for working with
 * those config objects.
 */
export class ConfigArray extends Array<any> {
    [x: symbol]: (config: any) => any;
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
    constructor(configs: Iterable<any> | Function | any, { basePath, normalized, schema: customSchema, extraConfigTypes, }?: {
        basePath?: string;
        normalized?: boolean;
        schema?: any;
        extraConfigTypes?: Array<string>;
    });
    /**
     * The path of the config file that this array was loaded from.
     * This is used to calculate filename matches.
     * @property basePath
     * @type {string}
     */
    basePath: string;
    /**
     * The supported config types.
     * @type {Array<string>}
     */
    extraConfigTypes: Array<string>;
    /**
     * Returns the `files` globs from every config object in the array.
     * This can be used to determine which files will be matched by a
     * config array or to use as a glob pattern when no patterns are provided
     * for a command line interface.
     * @returns {Array<string|Function>} An array of matchers.
     */
    get files(): Array<string | Function>;
    /**
     * Returns ignore matchers that should always be ignored regardless of
     * the matching `files` fields in any configs. This is necessary to mimic
     * the behavior of things like .gitignore and .eslintignore, allowing a
     * globbing operation to be faster.
     * @returns {Object[]} An array of config objects representing global ignores.
     */
    get ignores(): any[];
    /**
     * Indicates if the config array has been normalized.
     * @returns {boolean} True if the config array is normalized, false if not.
     */
    isNormalized(): boolean;
    /**
     * Normalizes a config array by flattening embedded arrays and executing
     * config functions.
     * @param {Object} [context] The context object for config functions.
     * @returns {Promise<ConfigArray>} The current ConfigArray instance.
     */
    normalize(context?: any): Promise<ConfigArray>;
    /**
     * Normalizes a config array by flattening embedded arrays and executing
     * config functions.
     * @param {Object} [context] The context object for config functions.
     * @returns {ConfigArray} The current ConfigArray instance.
     */
    normalizeSync(context?: any): ConfigArray;
    /**
     * Returns the config object for a given file path and a status that can be used to determine why a file has no config.
     * @param {string} filePath The path of a file to get a config for.
     * @returns {{ config?: Object, status: "ignored"|"external"|"unconfigured"|"matched" }}
     * An object with an optional property `config` and property `status`.
     * `config` is the config object for the specified file as returned by {@linkcode ConfigArray.getConfig},
     * `status` a is one of the constants returned by {@linkcode ConfigArray.getConfigStatus}.
     */
    getConfigWithStatus(filePath: string): {
        config?: any;
        status: "ignored" | "external" | "unconfigured" | "matched";
    };
    /**
     * Returns the config object for a given file path.
     * @param {string} filePath The path of a file to get a config for.
     * @returns {Object|undefined} The config object for this file or `undefined`.
     */
    getConfig(filePath: string): any | undefined;
    /**
     * Determines whether a file has a config or why it doesn't.
     * @param {string} filePath The path of the file to check.
     * @returns {"ignored"|"external"|"unconfigured"|"matched"} One of the following values:
     * * `"ignored"`: the file is ignored
     * * `"external"`: the file is outside the base path
     * * `"unconfigured"`: the file is not matched by any config
     * * `"matched"`: the file has a matching config
     */
    getConfigStatus(filePath: string): "ignored" | "external" | "unconfigured" | "matched";
    /**
     * Determines if the given filepath is ignored based on the configs.
     * @param {string} filePath The path of a file to check.
     * @returns {boolean} True if the path is ignored, false if not.
     * @deprecated Use `isFileIgnored` instead.
     */
    isIgnored(filePath: string): boolean;
    /**
     * Determines if the given filepath is ignored based on the configs.
     * @param {string} filePath The path of a file to check.
     * @returns {boolean} True if the path is ignored, false if not.
     */
    isFileIgnored(filePath: string): boolean;
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
    isDirectoryIgnored(directoryPath: string): boolean;
    #private;
}
export namespace ConfigArraySymbol {
    let isNormalized: symbol;
    let configCache: symbol;
    let schema: symbol;
    let finalizeConfig: symbol;
    let preprocessConfig: symbol;
}


export type Config = import("eslint").Linter.Config;
export type LegacyConfig = import("eslint").Linter.LegacyConfig;
export type Plugin = import("eslint").ESLint.Plugin;
export type RuleEntry = import("eslint").Linter.RuleEntry;
export type ExtendsElement = import("./types.cts").ExtendsElement;
export type SimpleExtendsElement = import("./types.cts").SimpleExtendsElement;
export type ConfigWithExtends = import("./types.cts").ConfigWithExtends;
export type InfiniteConfigArray = import("./types.cts").InfiniteArray<Config>;
export type ConfigWithExtendsArray = import("./types.cts").ConfigWithExtendsArray;
/**
 * Helper function to define a config array.
 * @param {ConfigWithExtendsArray} args The arguments to the function.
 * @returns {Config[]} The config array.
 * @throws {TypeError} If no arguments are provided or if an argument is not an object.
 */
export function defineConfig(...args: ConfigWithExtendsArray): Config[];
/**
 * Creates a global ignores config with the given patterns.
 * @param {string[]} ignorePatterns The ignore patterns.
 * @param {string} [name] The name of the global ignores config.
 * @returns {Config} The global ignores config.
 * @throws {TypeError} If ignorePatterns is not an array or if it is empty.
 */
export function globalIgnores(ignorePatterns: string[], name?: string): Config;


export type ObjectDefinition = import("./types.cts").ObjectDefinition;
export type PropertyDefinition = import("./types.cts").PropertyDefinition;
/**
 * @fileoverview Merge Strategy
 */
/**
 * Container class for several different merge strategies.
 */
export class MergeStrategy {
    /**
     * Merges two keys by overwriting the first with the second.
     * @param {*} value1 The value from the first object key.
     * @param {*} value2 The value from the second object key.
     * @returns {*} The second value.
     */
    static overwrite(value1: any, value2: any): any;
    /**
     * Merges two keys by replacing the first with the second only if the
     * second is defined.
     * @param {*} value1 The value from the first object key.
     * @param {*} value2 The value from the second object key.
     * @returns {*} The second value if it is defined.
     */
    static replace(value1: any, value2: any): any;
    /**
     * Merges two properties by assigning properties from the second to the first.
     * @param {*} value1 The value from the first object key.
     * @param {*} value2 The value from the second object key.
     * @returns {*} A new object containing properties from both value1 and
     *      value2.
     */
    static assign(value1: any, value2: any): any;
}
/**
 * Represents an object validation/merging schema.
 */
export class ObjectSchema {
    /**
     * Creates a new instance.
     * @param {ObjectDefinition} definitions The schema definitions.
     */
    constructor(definitions: ObjectDefinition);
    /**
     * Determines if a strategy has been registered for the given object key.
     * @param {string} key The object key to find a strategy for.
     * @returns {boolean} True if the key has a strategy registered, false if not.
     */
    hasKey(key: string): boolean;
    /**
     * Merges objects together to create a new object comprised of the keys
     * of the all objects. Keys are merged based on the each key's merge
     * strategy.
     * @param {...Object} objects The objects to merge.
     * @returns {Object} A new object with a mix of all objects' keys.
     * @throws {Error} If any object is invalid.
     */
    merge(...objects: any[]): any;
    /**
     * Validates an object's keys based on the validate strategy for each key.
     * @param {Object} object The object to validate.
     * @returns {void}
     * @throws {Error} When the object is invalid.
     */
    validate(object: any): void;
    #private;
}
/**
 * @fileoverview Validation Strategy
 */
/**
 * Container class for several different validation strategies.
 */
export class ValidationStrategy {
    /**
     * Validates that a value is an array.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static array(value: any): void;
    /**
     * Validates that a value is a boolean.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static boolean(value: any): void;
    /**
     * Validates that a value is a number.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static number(value: any): void;
    /**
     * Validates that a value is a object.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static object(value: any): void;
    /**
     * Validates that a value is a object or null.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static "object?"(value: any): void;
    /**
     * Validates that a value is a string.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static string(value: any): void;
    /**
     * Validates that a value is a non-empty string.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid.
     */
    static "string!"(value: any): void;
}


export type VisitTraversalStep = import("@eslint/core").VisitTraversalStep;
export type CallTraversalStep = import("@eslint/core").CallTraversalStep;
export type TraversalStep = import("@eslint/core").TraversalStep;
export type SourceLocation = import("@eslint/core").SourceLocation;
export type SourceLocationWithOffset = import("@eslint/core").SourceLocationWithOffset;
export type SourceRange = import("@eslint/core").SourceRange;
export type IDirective = import("@eslint/core").Directive;
export type DirectiveType = import("@eslint/core").DirectiveType;
export type SourceCodeBaseTypeOptions = import("@eslint/core").SourceCodeBaseTypeOptions;
/**
 * <Options>
 */
export type TextSourceCode<Options extends SourceCodeBaseTypeOptions = import("@eslint/core").SourceCodeBaseTypeOptions> = import("@eslint/core").TextSourceCode<Options>;
export type RuleConfig = import("@eslint/core").RuleConfig;
export type RulesConfig = import("@eslint/core").RulesConfig;
export type StringConfig = import("./types.cts").StringConfig;
export type BooleanConfig = import("./types.cts").BooleanConfig;
/**
 * A class to represent a step in the traversal process where a
 * method is called.
 * @implements {CallTraversalStep}
 */
export class CallMethodStep implements CallTraversalStep {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the step.
     * @param {string} options.target The target of the step.
     * @param {Array<any>} options.args The arguments of the step.
     */
    constructor({ target, args }: {
        target: string;
        args: Array<any>;
    });
    /**
     * The type of the step.
     * @type {"call"}
     * @readonly
     */
    readonly type: "call";
    /**
     * The kind of the step. Represents the same data as the `type` property
     * but it's a number for performance.
     * @type {2}
     * @readonly
     */
    readonly kind: 2;
    /**
     * The name of the method to call.
     * @type {string}
     */
    target: string;
    /**
     * The arguments to pass to the method.
     * @type {Array<any>}
     */
    args: Array<any>;
}
/**
 * Object to parse ESLint configuration comments.
 */
export class ConfigCommentParser {
    /**
     * Parses a list of "name:string_value" or/and "name" options divided by comma or
     * whitespace. Used for "global" comments.
     * @param {string} string The string to parse.
     * @returns {StringConfig} Result map object of names and string values, or null values if no value was provided.
     */
    parseStringConfig(string: string): StringConfig;
    /**
     * Parses a JSON-like config.
     * @param {string} string The string to parse.
     * @returns {({ok: true, config: RulesConfig}|{ok: false, error: {message: string}})} Result map object
     */
    parseJSONLikeConfig(string: string): ({
        ok: true;
        config: RulesConfig;
    } | {
        ok: false;
        error: {
            message: string;
        };
    });
    /**
     * Parses a config of values separated by comma.
     * @param {string} string The string to parse.
     * @returns {BooleanConfig} Result map of values and true values
     */
    parseListConfig(string: string): BooleanConfig;
    /**
     * Parses a directive comment into directive text and value.
     * @param {string} string The string with the directive to be parsed.
     * @returns {DirectiveComment|undefined} The parsed directive or `undefined` if the directive is invalid.
     */
    parseDirective(string: string): DirectiveComment | undefined;
    #private;
}
/**
 * A class to represent a directive comment.
 * @implements {IDirective}
 */
export class Directive implements IDirective {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the directive.
     * @param {"disable"|"enable"|"disable-next-line"|"disable-line"} options.type The type of directive.
     * @param {unknown} options.node The node representing the directive.
     * @param {string} options.value The value of the directive.
     * @param {string} options.justification The justification for the directive.
     */
    constructor({ type, node, value, justification }: {
        type: "disable" | "enable" | "disable-next-line" | "disable-line";
        node: unknown;
        value: string;
        justification: string;
    });
    /**
     * The type of directive.
     * @type {DirectiveType}
     * @readonly
     */
    readonly type: DirectiveType;
    /**
     * The node representing the directive.
     * @type {unknown}
     * @readonly
     */
    readonly node: unknown;
    /**
     * Everything after the "eslint-disable" portion of the directive,
     * but before the "--" that indicates the justification.
     * @type {string}
     * @readonly
     */
    readonly value: string;
    /**
     * The justification for the directive.
     * @type {string}
     * @readonly
     */
    readonly justification: string;
}
/**
 * Source Code Base Object
 * @template {SourceCodeBaseTypeOptions & {SyntaxElementWithLoc: object}} [Options=SourceCodeBaseTypeOptions & {SyntaxElementWithLoc: object}]
 * @implements {TextSourceCode<Options>}
 */
export class TextSourceCodeBase<Options extends SourceCodeBaseTypeOptions & {
    SyntaxElementWithLoc: object;
} = import("@eslint/core").SourceCodeBaseTypeOptions & {
    SyntaxElementWithLoc: object;
}> implements TextSourceCode<Options> {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the instance.
     * @param {string} options.text The source code text.
     * @param {Options['RootNode']} options.ast The root AST node.
     * @param {RegExp} [options.lineEndingPattern] The pattern to match lineEndings in the source code.
     */
    constructor({ text, ast, lineEndingPattern }: {
        text: string;
        ast: Options["RootNode"];
        lineEndingPattern?: RegExp;
    });
    /**
     * The AST of the source code.
     * @type {Options['RootNode']}
     */
    ast: Options["RootNode"];
    /**
     * The text of the source code.
     * @type {string}
     */
    text: string;
    /**
     * Returns the loc information for the given node or token.
     * @param {Options['SyntaxElementWithLoc']} nodeOrToken The node or token to get the loc information for.
     * @returns {SourceLocation} The loc information for the node or token.
     * @throws {Error} If the node or token does not have loc information.
     */
    getLoc(nodeOrToken: Options["SyntaxElementWithLoc"]): SourceLocation;
    /**
     * Returns the range information for the given node or token.
     * @param {Options['SyntaxElementWithLoc']} nodeOrToken The node or token to get the range information for.
     * @returns {SourceRange} The range information for the node or token.
     * @throws {Error} If the node or token does not have range information.
     */
    getRange(nodeOrToken: Options["SyntaxElementWithLoc"]): SourceRange;
    /**
     * Returns the parent of the given node.
     * @param {Options['SyntaxElementWithLoc']} node The node to get the parent of.
     * @returns {Options['SyntaxElementWithLoc']|undefined} The parent of the node.
     * @throws {Error} If the method is not implemented in the subclass.
     */
    getParent(node: Options["SyntaxElementWithLoc"]): Options["SyntaxElementWithLoc"] | undefined;
    /**
     * Gets all the ancestors of a given node
     * @param {Options['SyntaxElementWithLoc']} node The node
     * @returns {Array<Options['SyntaxElementWithLoc']>} All the ancestor nodes in the AST, not including the provided node, starting
     * from the root node at index 0 and going inwards to the parent node.
     * @throws {TypeError} When `node` is missing.
     */
    getAncestors(node: Options["SyntaxElementWithLoc"]): Array<Options["SyntaxElementWithLoc"]>;
    /**
     * Gets the source code for the given node.
     * @param {Options['SyntaxElementWithLoc']} [node] The AST node to get the text for.
     * @param {number} [beforeCount] The number of characters before the node to retrieve.
     * @param {number} [afterCount] The number of characters after the node to retrieve.
     * @returns {string} The text representing the AST node.
     * @public
     */
    public getText(node?: Options["SyntaxElementWithLoc"], beforeCount?: number, afterCount?: number): string;
    /**
     * Gets the entire source text split into an array of lines.
     * @returns {Array<string>} The source text as an array of lines.
     * @public
     */
    public get lines(): Array<string>;
    /**
     * Traverse the source code and return the steps that were taken.
     * @returns {Iterable<TraversalStep>} The steps that were taken while traversing the source code.
     */
    traverse(): Iterable<TraversalStep>;
    #private;
}
/**
 * A class to represent a step in the traversal process where a node is visited.
 * @implements {VisitTraversalStep}
 */
export class VisitNodeStep implements VisitTraversalStep {
    /**
     * Creates a new instance.
     * @param {Object} options The options for the step.
     * @param {object} options.target The target of the step.
     * @param {1|2} options.phase The phase of the step.
     * @param {Array<any>} options.args The arguments of the step.
     */
    constructor({ target, phase, args }: {
        target: object;
        phase: 1 | 2;
        args: Array<any>;
    });
    /**
     * The type of the step.
     * @type {"visit"}
     * @readonly
     */
    readonly type: "visit";
    /**
     * The kind of the step. Represents the same data as the `type` property
     * but it's a number for performance.
     * @type {1}
     * @readonly
     */
    readonly kind: 1;
    /**
     * The target of the step.
     * @type {object}
     */
    target: object;
    /**
     * The phase of the step.
     * @type {1|2}
     */
    phase: 1 | 2;
    /**
     * The arguments of the step.
     * @type {Array<any>}
     */
    args: Array<any>;
}
/**
 * Represents a directive comment.
 */
declare class DirectiveComment {
    /**
     * Creates a new directive comment.
     * @param {string} label The label of the directive.
     * @param {string} value The value of the directive.
     * @param {string} justification The justification of the directive.
     */
    constructor(label: string, value: string, justification: string);
    /**
     * The label of the directive, such as "eslint", "eslint-disable", etc.
     * @type {string}
     */
    label: string;
    /**
     * The value of the directive (the string after the label).
     * @type {string}
     */
    value: string;
    /**
     * The justification of the directive (the string after the --).
     * @type {string}
     */
    justification: string;
}
export {};


//#region src/composable-filters.d.ts
type StringOrRegExp = string | RegExp;
type PluginModuleType = "js" | "jsx" | "ts" | "tsx" | "json" | "text" | "base64" | "dataurl" | "binary" | "empty" | (string & {});
type FilterExpressionKind = FilterExpression["kind"];
type FilterExpression = And | Or | Not | Id | ModuleType | Code | Query;
type TopLevelFilterExpression = Include | Exclude;
declare class And {
  kind: "and";
  args: FilterExpression[];
  constructor(...args: FilterExpression[]);
}
declare class Or {
  kind: "or";
  args: FilterExpression[];
  constructor(...args: FilterExpression[]);
}
declare class Not {
  kind: "not";
  expr: FilterExpression;
  constructor(expr: FilterExpression);
}
interface QueryFilterObject {
  [key: string]: StringOrRegExp | boolean;
}
interface IdParams {
  cleanUrl?: boolean;
}
declare class Id {
  kind: "id";
  pattern: StringOrRegExp;
  params: IdParams;
  constructor(pattern: StringOrRegExp, params?: IdParams);
}
declare class ModuleType {
  kind: "moduleType";
  pattern: PluginModuleType;
  constructor(pattern: PluginModuleType);
}
declare class Code {
  kind: "code";
  pattern: StringOrRegExp;
  constructor(expr: StringOrRegExp);
}
declare class Query {
  kind: "query";
  key: string;
  pattern: StringOrRegExp | boolean;
  constructor(key: string, pattern: StringOrRegExp | boolean);
}
declare class Include {
  kind: "include";
  expr: FilterExpression;
  constructor(expr: FilterExpression);
}
declare class Exclude {
  kind: "exclude";
  expr: FilterExpression;
  constructor(expr: FilterExpression);
}
declare function and(...args: FilterExpression[]): And;
declare function or(...args: FilterExpression[]): Or;
declare function not(expr: FilterExpression): Not;
declare function id(pattern: StringOrRegExp, params?: IdParams): Id;
declare function moduleType(pattern: PluginModuleType): ModuleType;
declare function code(pattern: StringOrRegExp): Code;
declare function query(key: string, pattern: StringOrRegExp | boolean): Query;
declare function include(expr: FilterExpression): Include;
declare function exclude(expr: FilterExpression): Exclude;
/**
* convert a queryObject to FilterExpression like
* ```js
*   and(query(k1, v1), query(k2, v2))
* ```
* @param queryFilterObject The query filter object needs to be matched.
* @returns a `And` FilterExpression
*/
declare function queries(queryFilter: QueryFilterObject): And;
declare function interpreter(exprs: TopLevelFilterExpression | TopLevelFilterExpression[], code?: string, id?: string, moduleType?: PluginModuleType): boolean;
interface InterpreterCtx {
  urlSearchParamsCache?: URLSearchParams;
}
declare function interpreterImpl(expr: TopLevelFilterExpression[], code?: string, id?: string, moduleType?: PluginModuleType, ctx?: InterpreterCtx): boolean;
declare function exprInterpreter(expr: FilterExpression, code?: string, id?: string, moduleType?: PluginModuleType, ctx?: InterpreterCtx): boolean;
//#endregion
//#region src/simple-filters.d.ts
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
declare function exactRegex(str: string, flags?: string): RegExp;
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
declare function prefixRegex(str: string, flags?: string): RegExp;
type WidenString<T> = T extends string ? string : T;
/**
* Converts a id filter to match with an id with a query.
*
* @param input the id filters to convert.
*
* @example
* ```ts
* import { makeIdFiltersToMatchWithQuery } from '@rolldown/pluginutils';
* const plugin = {
*   name: 'plugin',
*   transform: {
*     filter: { id: makeIdFiltersToMatchWithQuery(['**' + '/*.js', /\.ts$/]) },
*     // The handler will be called for IDs like:
*     // - foo.js
*     // - foo.js?foo
*     // - foo.txt?foo.js
*     // - foo.ts
*     // - foo.ts?foo
*     // - foo.txt?foo.ts
*     handler(code, id) {}
*   }
* }
* ```
*/
declare function makeIdFiltersToMatchWithQuery<T extends string | RegExp>(input: T): WidenString<T>;
declare function makeIdFiltersToMatchWithQuery<T extends string | RegExp>(input: readonly T[]): WidenString<T>[];
declare function makeIdFiltersToMatchWithQuery(input: string | RegExp | readonly (string | RegExp)[]): string | RegExp | (string | RegExp)[];
//#endregion
export { FilterExpression, FilterExpressionKind, QueryFilterObject, TopLevelFilterExpression, and, code, exactRegex, exclude, exprInterpreter, id, include, interpreter, interpreterImpl, makeIdFiltersToMatchWithQuery, moduleType, not, or, prefixRegex, queries, query };

/// <reference types="node" />
import * as nativeFs from "fs";
import picomatch from "picomatch";

//#region src/api/aborter.d.ts
/**
 * AbortController is not supported on Node 14 so we use this until we can drop
 * support for Node 14.
 */
declare class Aborter {
  aborted: boolean;
  abort(): void;
}
//#endregion
//#region src/api/queue.d.ts
type OnQueueEmptyCallback = (error: Error | null, output: WalkerState) => void;
/**
 * This is a custom stateless queue to track concurrent async fs calls.
 * It increments a counter whenever a call is queued and decrements it
 * as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
 */
declare class Queue {
  private onQueueEmpty?;
  count: number;
  constructor(onQueueEmpty?: OnQueueEmptyCallback | undefined);
  enqueue(): number;
  dequeue(error: Error | null, output: WalkerState): void;
}
//#endregion
//#region src/types.d.ts
type Counts = {
  files: number;
  directories: number;
  /**
   * @deprecated use `directories` instead. Will be removed in v7.0.
   */
  dirs: number;
};
type Group = {
  directory: string;
  files: string[];
  /**
   * @deprecated use `directory` instead. Will be removed in v7.0.
   */
  dir: string;
};
type GroupOutput = Group[];
type OnlyCountsOutput = Counts;
type PathsOutput = string[];
type Output = OnlyCountsOutput | PathsOutput | GroupOutput;
type FSLike = {
  readdir: typeof nativeFs.readdir;
  readdirSync: typeof nativeFs.readdirSync;
  realpath: typeof nativeFs.realpath;
  realpathSync: typeof nativeFs.realpathSync;
  stat: typeof nativeFs.stat;
  statSync: typeof nativeFs.statSync;
};
type WalkerState = {
  root: string;
  paths: string[];
  groups: Group[];
  counts: Counts;
  options: Options;
  queue: Queue;
  controller: Aborter;
  fs: FSLike;
  symlinks: Map<string, string>;
  visited: string[];
};
type ResultCallback<TOutput extends Output> = (error: Error | null, output: TOutput) => void;
type FilterPredicate = (path: string, isDirectory: boolean) => boolean;
type ExcludePredicate = (dirName: string, dirPath: string) => boolean;
type PathSeparator = "/" | "\\";
type Options<TGlobFunction = unknown> = {
  includeBasePath?: boolean;
  includeDirs?: boolean;
  normalizePath?: boolean;
  maxDepth: number;
  maxFiles?: number;
  resolvePaths?: boolean;
  suppressErrors: boolean;
  group?: boolean;
  onlyCounts?: boolean;
  filters: FilterPredicate[];
  resolveSymlinks?: boolean;
  useRealPaths?: boolean;
  excludeFiles?: boolean;
  excludeSymlinks?: boolean;
  exclude?: ExcludePredicate;
  relativePaths?: boolean;
  pathSeparator: PathSeparator;
  signal?: AbortSignal;
  globFunction?: TGlobFunction;
  fs?: FSLike;
};
type GlobMatcher = (test: string) => boolean;
type GlobFunction = (glob: string | string[], ...params: unknown[]) => GlobMatcher;
type GlobParams<T> = T extends ((globs: string | string[], ...params: infer TParams extends unknown[]) => GlobMatcher) ? TParams : [];
//#endregion
//#region src/builder/api-builder.d.ts
declare class APIBuilder<TReturnType extends Output> {
  private readonly root;
  private readonly options;
  constructor(root: string, options: Options);
  withPromise(): Promise<TReturnType>;
  withCallback(cb: ResultCallback<TReturnType>): void;
  sync(): TReturnType;
}
//#endregion
//#region src/builder/index.d.ts
declare class Builder<TReturnType extends Output = PathsOutput, TGlobFunction = typeof picomatch> {
  private readonly globCache;
  private options;
  private globFunction?;
  constructor(options?: Partial<Options<TGlobFunction>>);
  group(): Builder<GroupOutput, TGlobFunction>;
  withPathSeparator(separator: "/" | "\\"): this;
  withBasePath(): this;
  withRelativePaths(): this;
  withDirs(): this;
  withMaxDepth(depth: number): this;
  withMaxFiles(limit: number): this;
  withFullPaths(): this;
  withErrors(): this;
  withSymlinks({
    resolvePaths
  }?: {
    resolvePaths?: boolean | undefined;
  }): this;
  withAbortSignal(signal: AbortSignal): this;
  normalize(): this;
  filter(predicate: FilterPredicate): this;
  onlyDirs(): this;
  exclude(predicate: ExcludePredicate): this;
  onlyCounts(): Builder<OnlyCountsOutput, TGlobFunction>;
  crawl(root?: string): APIBuilder<TReturnType>;
  withGlobFunction<TFunc>(fn: TFunc): Builder<TReturnType, TFunc>;
  /**
   * @deprecated Pass options using the constructor instead:
   * ```ts
   * new fdir(options).crawl("/path/to/root");
   * ```
   * This method will be removed in v7.0
   */
  crawlWithOptions(root: string, options: Partial<Options<TGlobFunction>>): APIBuilder<TReturnType>;
  glob(...patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[], ...options: GlobParams<TGlobFunction>): Builder<TReturnType, TGlobFunction>;
}
//#endregion
//#region src/index.d.ts
type Fdir = typeof Builder;
//#endregion
export { Counts, ExcludePredicate, FSLike, Fdir, FilterPredicate, GlobFunction, GlobMatcher, GlobParams, Group, GroupOutput, OnlyCountsOutput, Options, Output, PathSeparator, PathsOutput, ResultCallback, WalkerState, Builder as fdir };

/**
 * Generate secure URL-friendly unique ID.
 *
 * By default, the ID will have 21 symbols to have a collision probability
 * similar to UUID v4.
 *
 * ```js
 * import { nanoid } from 'nanoid'
 * model.id = nanoid() //=> "Uakgb_J5m9g-0JDMbcJqL"
 * ```
 *
 * @param size Size of the ID. The default size is 21.
 * @returns A random string.
 */
export function nanoid(size?: number): string

/**
 * Generate secure unique ID with custom alphabet.
 *
 * Alphabet must contain 256 symbols or less. Otherwise, the generator
 * will not be secure.
 *
 * @param alphabet Alphabet used to generate the ID.
 * @param defaultSize Size of the ID. The default size is 21.
 * @returns A random string generator.
 *
 * ```js
 * const { customAlphabet } = require('nanoid')
 * const nanoid = customAlphabet('0123456789абвгдеё', 5)
 * nanoid() //=> "8ё56а"
 * ```
 */
export function customAlphabet(
  alphabet: string,
  defaultSize?: number
): (size?: number) => string

/**
 * Generate unique ID with custom random generator and alphabet.
 *
 * Alphabet must contain 256 symbols or less. Otherwise, the generator
 * will not be secure.
 *
 * ```js
 * import { customRandom } from 'nanoid/format'
 *
 * const nanoid = customRandom('abcdef', 5, size => {
 *   const random = []
 *   for (let i = 0; i < size; i++) {
 *     random.push(randomByte())
 *   }
 *   return random
 * })
 *
 * nanoid() //=> "fbaef"
 * ```
 *
 * @param alphabet Alphabet used to generate a random string.
 * @param size Size of the random string.
 * @param random A random bytes generator.
 * @returns A random string generator.
 */
export function customRandom(
  alphabet: string,
  size: number,
  random: (bytes: number) => Uint8Array
): () => string

/**
 * URL safe symbols.
 *
 * ```js
 * import { urlAlphabet } from 'nanoid'
 * const nanoid = customAlphabet(urlAlphabet, 10)
 * nanoid() //=> "Uakgb_J5m9"
 * ```
 */
export const urlAlphabet: string

/**
 * Generate an array of random bytes collected from hardware noise.
 *
 * ```js
 * import { customRandom, random } from 'nanoid'
 * const nanoid = customRandom("abcdef", 5, random)
 * ```
 *
 * @param bytes Size of the array.
 * @returns An array of random bytes.
 */
export function random(bytes: number): Uint8Array


import * as path from 'node:path';
import path__default from 'node:path';

/**
 * Constant for path separator.
 *
 * Always equals to `"/"`.
 */
declare const sep = "/";
declare const normalize: typeof path__default.normalize;
declare const join: typeof path__default.join;
declare const resolve: typeof path__default.resolve;
/**
 * Resolves a string path, resolving '.' and '.' segments and allowing paths above the root.
 *
 * @param path - The path to normalise.
 * @param allowAboveRoot - Whether to allow the resulting path to be above the root directory.
 * @returns the normalised path string.
 */
declare function normalizeString(path: string, allowAboveRoot: boolean): string;
declare const isAbsolute: typeof path__default.isAbsolute;
declare const toNamespacedPath: typeof path__default.toNamespacedPath;
declare const extname: typeof path__default.extname;
declare const relative: typeof path__default.relative;
declare const dirname: typeof path__default.dirname;
declare const format: typeof path__default.format;
declare const basename: typeof path__default.basename;
declare const parse: typeof path__default.parse;
/**
 * The `path.matchesGlob()` method determines if `path` matches the `pattern`.
 * @param path The path to glob-match against.
 * @param pattern The glob to check the path against.
 */
declare const matchesGlob: (path: string, pattern: string | string[]) => boolean;

type NodePath = typeof path;
/**
 * The platform-specific file delimiter.
 *
 * Equals to `";"` in windows and `":"` in all other platforms.
 */
declare const delimiter: ";" | ":";
declare const posix: NodePath["posix"];
declare const win32: NodePath["win32"];
declare const _default: NodePath;

export { basename, _default as default, delimiter, dirname, extname, format, isAbsolute, join, matchesGlob, normalize, normalizeString, parse, posix, relative, resolve, sep, toNamespacedPath, win32 };


type EnvObject = Record<string, string | undefined>;
declare const env: EnvObject;
declare const nodeENV: string;

/** Value of process.platform */
declare const platform: NodeJS.Platform;
/** Detect if `CI` environment variable is set or a provider CI detected */
declare const isCI: boolean;
/** Detect if stdout.TTY is available */
declare const hasTTY: boolean;
/** Detect if global `window` object is available */
declare const hasWindow: boolean;
/** Detect if `DEBUG` environment variable is set */
declare const isDebug: boolean;
/** Detect if `NODE_ENV` environment variable is `test` */
declare const isTest: boolean;
/** Detect if `NODE_ENV` environment variable is `production` */
declare const isProduction: boolean;
/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
declare const isDevelopment: boolean;
/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
declare const isMinimal: boolean;
/** Detect if process.platform is Windows */
declare const isWindows: boolean;
/** Detect if process.platform is Linux */
declare const isLinux: boolean;
/** Detect if process.platform is macOS (darwin kernel) */
declare const isMacOS: boolean;
/** Color Support */
declare const isColorSupported: boolean;
/** Node.js versions */
declare const nodeVersion: string | null;
declare const nodeMajorVersion: number | null;

interface Process extends Partial<Omit<typeof globalThis.process, "versions">> {
    env: EnvObject;
    versions: Record<string, string>;
}
declare const process: Process;

type ProviderName = "" | "appveyor" | "aws_amplify" | "azure_pipelines" | "azure_static" | "appcircle" | "bamboo" | "bitbucket" | "bitrise" | "buddy" | "buildkite" | "circle" | "cirrus" | "cloudflare_pages" | "cloudflare_workers" | "codebuild" | "codefresh" | "drone" | "drone" | "dsari" | "github_actions" | "gitlab" | "gocd" | "layerci" | "hudson" | "jenkins" | "magnum" | "netlify" | "nevercode" | "render" | "sail" | "semaphore" | "screwdriver" | "shippable" | "solano" | "strider" | "teamcity" | "travis" | "vercel" | "appcenter" | "codesandbox" | "stackblitz" | "stormkit" | "cleavr" | "zeabur" | "codesphere" | "railway" | "deno-deploy" | "firebase_app_hosting";
type ProviderInfo = {
    name: ProviderName;
    ci?: boolean;
    [meta: string]: any;
};
/** Current provider info */
declare const providerInfo: ProviderInfo;
declare const provider: ProviderName;

type RuntimeName = "workerd" | "deno" | "netlify" | "node" | "bun" | "edge-light" | "fastly" | "";
type RuntimeInfo = {
    name: RuntimeName;
};
/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * **Note:** When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
 *
 * Use `runtime === "node"` if you need strict check for Node.js runtime.
 */
declare const isNode: boolean;
/**
 * Indicates if running in Bun runtime.
 */
declare const isBun: boolean;
/**
 * Indicates if running in Deno runtime.
 */
declare const isDeno: boolean;
/**
 * Indicates if running in Fastly runtime.
 */
declare const isFastly: boolean;
/**
 * Indicates if running in Netlify runtime.
 */
declare const isNetlify: boolean;
/**
 *
 * Indicates if running in EdgeLight (Vercel Edge) runtime.
 */
declare const isEdgeLight: boolean;
/**
 * Indicates if running in Cloudflare Workers runtime.
 */
declare const isWorkerd: boolean;
declare const runtimeInfo: RuntimeInfo | undefined;
declare const runtime: RuntimeName;

export { env, hasTTY, hasWindow, isBun, isCI, isColorSupported, isDebug, isDeno, isDevelopment, isEdgeLight, isFastly, isLinux, isMacOS, isMinimal, isNetlify, isNode, isProduction, isTest, isWindows, isWorkerd, nodeENV, nodeMajorVersion, nodeVersion, platform, process, provider, providerInfo, runtime, runtimeInfo };
export type { EnvObject, Process, ProviderInfo, ProviderName, RuntimeInfo, RuntimeName };


import * as js_tokens from 'js-tokens';
import { Token } from 'js-tokens';

interface StripLiteralOptions {
    /**
     * Will be called for each string literal. Return false to skip stripping.
     */
    filter?: (s: string) => boolean;
    /**
     * Fill the stripped literal with this character.
     * It must be a single character.
     *
     * @default ' '
     */
    fillChar?: string;
}

declare function stripLiteralJsTokens(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: Token[];
};

/**
 * Strip literal from code.
 */
declare function stripLiteral(code: string, options?: StripLiteralOptions): string;
/**
 * Strip literal from code, return more detailed information.
 */
declare function stripLiteralDetailed(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: js_tokens.Token[];
};

export { type StripLiteralOptions, stripLiteral, stripLiteralDetailed, stripLiteralJsTokens };


/**
 * A class that represents each benchmark task in Tinybench. It keeps track of the
 * results, name, Bench instance, the task function and the number times the task
 * function has been executed.
 */
declare class Task extends EventTarget {
    bench: Bench;
    /**
     * task name
     */
    name: string;
    fn: Fn;
    runs: number;
    /**
     * the result object
     */
    result?: TaskResult;
    /**
     * Task options
     */
    opts: FnOptions;
    constructor(bench: Bench, name: string, fn: Fn, opts?: FnOptions);
    private loop;
    /**
     * run the current task and write the results in `Task.result` object
     */
    run(): Promise<this>;
    /**
     * warmup the current task
     */
    warmup(): Promise<void>;
    addEventListener<K extends TaskEvents, T = TaskEventsMap[K]>(type: K, listener: T, options?: AddEventListenerOptionsArgument): void;
    removeEventListener<K extends TaskEvents, T = TaskEventsMap[K]>(type: K, listener: T, options?: RemoveEventListenerOptionsArgument): void;
    /**
     * change the result object values
     */
    setResult(result: Partial<TaskResult>): void;
    /**
     * reset the task to make the `Task.runs` a zero-value and remove the `Task.result`
     * object
     */
    reset(): void;
}

/**
 * the task function
 */
type Fn = () => any | Promise<any>;
interface FnOptions {
    /**
     * An optional function that is run before iterations of this task begin
     */
    beforeAll?: (this: Task) => void | Promise<void>;
    /**
     * An optional function that is run before each iteration of this task
     */
    beforeEach?: (this: Task) => void | Promise<void>;
    /**
     * An optional function that is run after each iteration of this task
     */
    afterEach?: (this: Task) => void | Promise<void>;
    /**
     * An optional function that is run after all iterations of this task end
     */
    afterAll?: (this: Task) => void | Promise<void>;
}
/**
 * the benchmark task result object
 */
type TaskResult = {
    error?: unknown;
    /**
     * The amount of time in milliseconds to run the benchmark task (cycle).
     */
    totalTime: number;
    /**
     * the minimum value in the samples
     */
    min: number;
    /**
     * the maximum value in the samples
     */
    max: number;
    /**
     * the number of operations per second
     */
    hz: number;
    /**
     * how long each operation takes (ms)
     */
    period: number;
    /**
     * task samples of each task iteration time (ms)
     */
    samples: number[];
    /**
     * samples mean/average (estimate of the population mean)
     */
    mean: number;
    /**
     * samples variance (estimate of the population variance)
     */
    variance: number;
    /**
     * samples standard deviation (estimate of the population standard deviation)
     */
    sd: number;
    /**
     * standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean)
     */
    sem: number;
    /**
     * degrees of freedom
     */
    df: number;
    /**
     * critical value of the samples
     */
    critical: number;
    /**
     * margin of error
     */
    moe: number;
    /**
     * relative margin of error
     */
    rme: number;
    /**
     * p75 percentile
     */
    p75: number;
    /**
     * p99 percentile
     */
    p99: number;
    /**
     * p995 percentile
     */
    p995: number;
    /**
     * p999 percentile
     */
    p999: number;
};
/**
  * Both the `Task` and `Bench` objects extend the `EventTarget` object,
  * so you can attach a listeners to different types of events
  * to each class instance using the universal `addEventListener` and
 * `removeEventListener`
 */
/**
 * Bench events
 */
type BenchEvents = 'abort' | 'complete' | 'error' | 'reset' | 'start' | 'warmup' | 'cycle' | 'add' | 'remove' | 'todo';
type Hook = (task: Task, mode: 'warmup' | 'run') => void | Promise<void>;
type NoopEventListener = () => any | Promise<any>;
type TaskEventListener = (e: Event & {
    task: Task;
}) => any | Promise<any>;
interface BenchEventsMap {
    abort: NoopEventListener;
    start: NoopEventListener;
    complete: NoopEventListener;
    warmup: NoopEventListener;
    reset: NoopEventListener;
    add: TaskEventListener;
    remove: TaskEventListener;
    cycle: TaskEventListener;
    error: TaskEventListener;
    todo: TaskEventListener;
}
/**
 * task events
 */
type TaskEvents = 'abort' | 'complete' | 'error' | 'reset' | 'start' | 'warmup' | 'cycle';
type TaskEventsMap = {
    abort: NoopEventListener;
    start: TaskEventListener;
    error: TaskEventListener;
    cycle: TaskEventListener;
    complete: TaskEventListener;
    warmup: TaskEventListener;
    reset: TaskEventListener;
};
type Options = {
    /**
     * time needed for running a benchmark task (milliseconds) @default 500
     */
    time?: number;
    /**
     * number of times that a task should run if even the time option is finished @default 10
     */
    iterations?: number;
    /**
     * function to get the current timestamp in milliseconds
     */
    now?: () => number;
    /**
     * An AbortSignal for aborting the benchmark
     */
    signal?: AbortSignal;
    /**
     * Throw if a task fails (events will not work if true)
     */
    throws?: boolean;
    /**
     * warmup time (milliseconds) @default 100ms
     */
    warmupTime?: number;
    /**
     * warmup iterations @default 5
     */
    warmupIterations?: number;
    /**
     * setup function to run before each benchmark task (cycle)
     */
    setup?: Hook;
    /**
     * teardown function to run after each benchmark task (cycle)
     */
    teardown?: Hook;
};
type BenchEvent = Event & {
    task: Task | null;
};
type RemoveEventListenerOptionsArgument = Parameters<typeof EventTarget.prototype.removeEventListener>[2];
type AddEventListenerOptionsArgument = Parameters<typeof EventTarget.prototype.addEventListener>[2];

/**
 * The Benchmark instance for keeping track of the benchmark tasks and controlling
 * them.
 */
declare class Bench extends EventTarget {
    _tasks: Map<string, Task>;
    _todos: Map<string, Task>;
    /**
   * Executes tasks concurrently based on the specified concurrency mode.
   *
   * - When `mode` is set to `null` (default), concurrency is disabled.
   * - When `mode` is set to 'task', each task's iterations (calls of a task function) run concurrently.
   * - When `mode` is set to 'bench', different tasks within the bench run concurrently.
   */
    concurrency: 'task' | 'bench' | null;
    /**
     * The maximum number of concurrent tasks to run. Defaults to Infinity.
     */
    threshold: number;
    signal?: AbortSignal;
    throws: boolean;
    warmupTime: number;
    warmupIterations: number;
    time: number;
    iterations: number;
    now: () => number;
    setup: Hook;
    teardown: Hook;
    constructor(options?: Options);
    private runTask;
    /**
     * run the added tasks that were registered using the
     * {@link add} method.
     * Note: This method does not do any warmup. Call {@link warmup} for that.
     */
    run(): Promise<Task[]>;
    /**
     * See Bench.{@link concurrency}
     */
    runConcurrently(threshold?: number, mode?: NonNullable<Bench['concurrency']>): Promise<Task[]>;
    /**
     * warmup the benchmark tasks.
     * This is not run by default by the {@link run} method.
     */
    warmup(): Promise<void>;
    /**
     * warmup the benchmark tasks concurrently.
     * This is not run by default by the {@link runConcurrently} method.
     */
    warmupConcurrently(threshold?: number, mode?: NonNullable<Bench['concurrency']>): Promise<void>;
    /**
     * reset each task and remove its result
     */
    reset(): void;
    /**
     * add a benchmark task to the task map
     */
    add(name: string, fn: Fn, opts?: FnOptions): this;
    /**
     * add a benchmark todo to the todo map
     */
    todo(name: string, fn?: Fn, opts?: FnOptions): this;
    /**
     * remove a benchmark task from the task map
     */
    remove(name: string): this;
    addEventListener<K extends BenchEvents, T = BenchEventsMap[K]>(type: K, listener: T, options?: AddEventListenerOptionsArgument): void;
    removeEventListener<K extends BenchEvents, T = BenchEventsMap[K]>(type: K, listener: T, options?: RemoveEventListenerOptionsArgument): void;
    /**
     * table of the tasks results
     */
    table(convert?: (task: Task) => Record<string, string | number> | undefined): (Record<string, string | number> | null)[];
    /**
     * (getter) tasks results as an array
     */
    get results(): (TaskResult | undefined)[];
    /**
     * (getter) tasks as an array
     */
    get tasks(): Task[];
    get todos(): Task[];
    /**
     * get a task based on the task name
     */
    getTask(name: string): Task | undefined;
}

declare const hrtimeNow: () => number;
declare const now: () => number;

export { Bench, type BenchEvent, type BenchEvents, type Fn, type Hook, type Options, Task, type TaskEvents, type TaskResult, hrtimeNow, now };


export * from './dist/index.js'
