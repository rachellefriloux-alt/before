import { M as ModuleMockerInterceptor } from './mocker.d-Ce9_ySj5.js';
export { C as CompilerHintsOptions, b as ModuleMocker, a as ModuleMockerCompilerHints, d as ModuleMockerConfig, e as ModuleMockerRPC, R as ResolveIdResult, f as ResolveMockResult, c as createCompilerHints } from './mocker.d-Ce9_ySj5.js';
import { StartOptions, SetupWorker } from 'msw/browser';
import { c as MockerRegistry, g as MockedModule } from './registry.d-D765pazg.js';
import '@vitest/spy';
import './types.d-D_aRZRdy.js';

interface ModuleMockerMSWInterceptorOptions {
	/**
	* The identifier to access the globalThis object in the worker.
	* This will be injected into the script as is, so make sure it's a valid JS expression.
	* @example
	* ```js
	* // globalThisAccessor: '__my_variable__' produces:
	* globalThis[__my_variable__]
	* // globalThisAccessor: 'Symbol.for('secret:mocks')' produces:
	* globalThis[Symbol.for('secret:mocks')]
	* // globalThisAccessor: '"__vitest_mocker__"' (notice quotes) produces:
	* globalThis["__vitest_mocker__"]
	* ```
	* @default `"__vitest_mocker__"`
	*/
	globalThisAccessor?: string;
	/**
	* Options passed down to `msw.setupWorker().start(options)`
	*/
	mswOptions?: StartOptions;
	/**
	* A pre-configured `msw.setupWorker` instance.
	*/
	mswWorker?: SetupWorker;
}
declare class ModuleMockerMSWInterceptor implements ModuleMockerInterceptor {
	private readonly options;
	protected readonly mocks: MockerRegistry;
	private startPromise;
	private worker;
	constructor(options?: ModuleMockerMSWInterceptorOptions);
	register(module: MockedModule): Promise<void>;
	delete(url: string): Promise<void>;
	invalidate(): Promise<void>;
	private resolveManualMock;
	protected init(): Promise<SetupWorker>;
}

declare class ModuleMockerServerInterceptor implements ModuleMockerInterceptor {
	register(module: MockedModule): Promise<void>;
	delete(id: string): Promise<void>;
	invalidate(): Promise<void>;
}

export { ModuleMockerInterceptor, ModuleMockerMSWInterceptor, ModuleMockerServerInterceptor };
export type { ModuleMockerMSWInterceptorOptions };


import { C as Colors } from './index-8b61d5bc.js';
export { F as Formatter, g as getDefaultColors } from './index-8b61d5bc.js';

declare function isSupported(): boolean;
declare function createColors(): Colors;
declare const _default: Colors;

export { Colors, createColors, _default as default, isSupported };


export * from './dist/browser.js'


import { S as SerializedCoverageConfig, a as SerializedConfig } from './chunks/config.d.D2ROskhv.js';
import { R as RuntimeCoverageModuleLoader } from './chunks/coverage.d.S9RMNXIe.js';
import { SerializedDiffOptions } from '@vitest/utils/diff';
import { VitestExecutor } from './execute.js';
export { collectTests, processError, startTests } from '@vitest/runner';
import * as spy from '@vitest/spy';
export { spy as SpyModule };
export { LoupeOptions, ParsedStack, StringifyOptions, format, getSafeTimers, inspect, stringify } from '@vitest/utils';
export { TraceMap, originalPositionFor } from '@vitest/utils/source-map';
import '@vitest/pretty-format';
import '@vitest/snapshot';
import '@vitest/snapshot/environment';
import 'vite-node/client';
import 'vite-node';
import './chunks/worker.d.1GmBbd7G.js';
import './chunks/environment.d.cL3nLXbE.js';
import 'vitest/optional-types.js';
import 'node:vm';
import '@vitest/mocker';
import './chunks/mocker.d.BE_2ls6u.js';

declare function startCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: RuntimeCoverageModuleLoader, runtimeOptions: {
	isolate: boolean
}): Promise<unknown>;
declare function takeCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: RuntimeCoverageModuleLoader): Promise<unknown>;
declare function stopCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: RuntimeCoverageModuleLoader, runtimeOptions: {
	isolate: boolean
}): Promise<unknown>;

declare function setupCommonEnv(config: SerializedConfig): Promise<void>;
declare function loadDiffConfig(config: SerializedConfig, executor: VitestExecutor): Promise<SerializedDiffOptions | undefined>;
declare function loadSnapshotSerializers(config: SerializedConfig, executor: VitestExecutor): Promise<void>;

export { loadDiffConfig, loadSnapshotSerializers, setupCommonEnv, startCoverageInsideWorker, stopCoverageInsideWorker, takeCoverageInsideWorker };


import { M as ModuleMockerInterceptor } from './mocker.d-Ce9_ySj5.js';
export { C as CompilerHintsOptions, b as ModuleMocker, a as ModuleMockerCompilerHints, d as ModuleMockerConfig, e as ModuleMockerRPC, R as ResolveIdResult, f as ResolveMockResult, c as createCompilerHints } from './mocker.d-Ce9_ySj5.js';
import { StartOptions, SetupWorker } from 'msw/browser';
import { c as MockerRegistry, g as MockedModule } from './registry.d-D765pazg.js';
import '@vitest/spy';
import './types.d-D_aRZRdy.js';

interface ModuleMockerMSWInterceptorOptions {
	/**
	* The identifier to access the globalThis object in the worker.
	* This will be injected into the script as is, so make sure it's a valid JS expression.
	* @example
	* ```js
	* // globalThisAccessor: '__my_variable__' produces:
	* globalThis[__my_variable__]
	* // globalThisAccessor: 'Symbol.for('secret:mocks')' produces:
	* globalThis[Symbol.for('secret:mocks')]
	* // globalThisAccessor: '"__vitest_mocker__"' (notice quotes) produces:
	* globalThis["__vitest_mocker__"]
	* ```
	* @default `"__vitest_mocker__"`
	*/
	globalThisAccessor?: string;
	/**
	* Options passed down to `msw.setupWorker().start(options)`
	*/
	mswOptions?: StartOptions;
	/**
	* A pre-configured `msw.setupWorker` instance.
	*/
	mswWorker?: SetupWorker;
}
declare class ModuleMockerMSWInterceptor implements ModuleMockerInterceptor {
	private readonly options;
	protected readonly mocks: MockerRegistry;
	private startPromise;
	private worker;
	constructor(options?: ModuleMockerMSWInterceptorOptions);
	register(module: MockedModule): Promise<void>;
	delete(url: string): Promise<void>;
	invalidate(): Promise<void>;
	private resolveManualMock;
	protected init(): Promise<SetupWorker>;
}

declare class ModuleMockerServerInterceptor implements ModuleMockerInterceptor {
	register(module: MockedModule): Promise<void>;
	delete(id: string): Promise<void>;
	invalidate(): Promise<void>;
}

export { ModuleMockerInterceptor, ModuleMockerMSWInterceptor, ModuleMockerServerInterceptor };
export type { ModuleMockerMSWInterceptorOptions };


import { C as Colors } from './index-8b61d5bc.js';
export { F as Formatter, g as getDefaultColors } from './index-8b61d5bc.js';

declare function isSupported(): boolean;
declare function createColors(): Colors;
declare const _default: Colors;

export { Colors, createColors, _default as default, isSupported };


export * from './dist/browser.js'


import { S as SerializedCoverageConfig, a as SerializedConfig } from './chunks/config.d.D2ROskhv.js';
import { R as RuntimeCoverageModuleLoader } from './chunks/coverage.d.S9RMNXIe.js';
import { SerializedDiffOptions } from '@vitest/utils/diff';
import { VitestExecutor } from './execute.js';
export { collectTests, processError, startTests } from '@vitest/runner';
import * as spy from '@vitest/spy';
export { spy as SpyModule };
export { LoupeOptions, ParsedStack, StringifyOptions, format, getSafeTimers, inspect, stringify } from '@vitest/utils';
export { TraceMap, originalPositionFor } from '@vitest/utils/source-map';
import '@vitest/pretty-format';
import '@vitest/snapshot';
import '@vitest/snapshot/environment';
import 'vite-node/client';
import 'vite-node';
import './chunks/worker.d.1GmBbd7G.js';
import './chunks/environment.d.cL3nLXbE.js';
import 'vitest/optional-types.js';
import 'node:vm';
import '@vitest/mocker';
import './chunks/mocker.d.BE_2ls6u.js';

declare function startCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: RuntimeCoverageModuleLoader, runtimeOptions: {
	isolate: boolean
}): Promise<unknown>;
declare function takeCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: RuntimeCoverageModuleLoader): Promise<unknown>;
declare function stopCoverageInsideWorker(options: SerializedCoverageConfig | undefined, loader: RuntimeCoverageModuleLoader, runtimeOptions: {
	isolate: boolean
}): Promise<unknown>;

declare function setupCommonEnv(config: SerializedConfig): Promise<void>;
declare function loadDiffConfig(config: SerializedConfig, executor: VitestExecutor): Promise<SerializedDiffOptions | undefined>;
declare function loadSnapshotSerializers(config: SerializedConfig, executor: VitestExecutor): Promise<void>;

export { loadDiffConfig, loadSnapshotSerializers, setupCommonEnv, startCoverageInsideWorker, stopCoverageInsideWorker, takeCoverageInsideWorker };
