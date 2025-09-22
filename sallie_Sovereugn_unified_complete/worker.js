import { isMovable, kRequestCountField, kResponseCountField, kTransferable, kValue } from "../common-Qw-RoVFD.js";
import { stderr, stdout } from "../utils-De75vAgL.js";
import { getHandler, throwInNextTick } from "../utils-B--2TaWv.js";
import { parentPort, receiveMessageOnPort, workerData } from "node:worker_threads";

//#region src/entry/worker.ts
const [tinypoolPrivateData, workerData$1] = workerData;
process.__tinypool_state__ = {
	isWorkerThread: true,
	isTinypoolWorker: true,
	workerData: workerData$1,
	workerId: tinypoolPrivateData.workerId
};
const memoryUsage = process.memoryUsage.bind(process);
let useAtomics = process.env.PISCINA_DISABLE_ATOMICS !== "1";
parentPort.on("message", (message) => {
	useAtomics = process.env.PISCINA_DISABLE_ATOMICS === "1" ? false : message.useAtomics;
	const { port, sharedBuffer, filename, name } = message;
	(async function() {
		if (filename !== null) await getHandler(filename, name);
		const readyMessage = { ready: true };
		parentPort.postMessage(readyMessage);
		port.start();
		port.on("message", onMessage.bind(null, port, sharedBuffer));
		atomicsWaitLoop(port, sharedBuffer);
	})().catch(throwInNextTick);
});
let currentTasks = 0;
let lastSeenRequestCount = 0;
function atomicsWaitLoop(port, sharedBuffer) {
	if (!useAtomics) return;
	while (currentTasks === 0) {
		Atomics.wait(sharedBuffer, kRequestCountField, lastSeenRequestCount);
		lastSeenRequestCount = Atomics.load(sharedBuffer, kRequestCountField);
		let entry;
		while ((entry = receiveMessageOnPort(port)) !== void 0) onMessage(port, sharedBuffer, entry.message);
	}
}
function onMessage(port, sharedBuffer, message) {
	currentTasks++;
	const { taskId, task, filename, name } = message;
	(async function() {
		let response;
		let transferList = [];
		try {
			const handler = await getHandler(filename, name);
			if (handler === null) throw new Error(`No handler function "${name}" exported from "${filename}"`);
			let result = await handler(task);
			if (isMovable(result)) {
				transferList = transferList.concat(result[kTransferable]);
				result = result[kValue];
			}
			response = {
				taskId,
				result,
				error: null,
				usedMemory: memoryUsage().heapUsed
			};
			if (stdout()?.writableLength > 0) await new Promise((resolve) => process.stdout.write("", resolve));
			if (stderr()?.writableLength > 0) await new Promise((resolve) => process.stderr.write("", resolve));
		} catch (error) {
			response = {
				taskId,
				result: null,
				error,
				usedMemory: memoryUsage().heapUsed
			};
		}
		currentTasks--;
		port.postMessage(response, transferList);
		Atomics.add(sharedBuffer, kResponseCountField, 1);
		atomicsWaitLoop(port, sharedBuffer);
	})().catch(throwInNextTick);
}

//#endregion

import { pathToFileURL } from 'node:url';
import { createStackString, parseStacktrace } from '@vitest/utils/source-map';
import { workerId } from 'tinypool';
import { ViteNodeRunner, ModuleCacheMap } from 'vite-node/client';
import { readFileSync } from 'node:fs';
import { resolve, normalize } from 'pathe';
import { e as environments } from './chunks/index.CmSc2RE5.js';
import { s as setupInspect } from './chunks/inspector.C914Efll.js';
import { c as createRuntimeRpc, a as rpcDone } from './chunks/rpc.-pEldfrD.js';
import { i as isChildProcess, s as setProcessTitle } from './chunks/utils.XdZDrNZV.js';
import { d as disposeInternalListeners } from './chunks/utils.CAioKnHs.js';
import 'node:console';
import 'node:module';
import '@vitest/utils';
import './chunks/index.B521nVV-.js';

function isBuiltinEnvironment(env) {
	return env in environments;
}
const _loaders = /* @__PURE__ */ new Map();
async function createEnvironmentLoader(options) {
	if (!_loaders.has(options.root)) {
		const loader = new ViteNodeRunner(options);
		await loader.executeId("/@vite/env");
		_loaders.set(options.root, loader);
	}
	return _loaders.get(options.root);
}
async function loadEnvironment(ctx, rpc) {
	const name = ctx.environment.name;
	if (isBuiltinEnvironment(name)) return environments[name];
	const loader = await createEnvironmentLoader({
		root: ctx.config.root,
		fetchModule: async (id) => {
			const result = await rpc.fetch(id, "ssr");
			if (result.id) return { code: readFileSync(result.id, "utf-8") };
			return result;
		},
		resolveId: (id, importer) => rpc.resolveId(id, importer, "ssr")
	});
	const root = loader.root;
	const packageId = name[0] === "." || name[0] === "/" ? resolve(root, name) : (await rpc.resolveId(`vitest-environment-${name}`, void 0, "ssr"))?.id ?? resolve(root, name);
	const pkg = await loader.executeId(normalize(packageId));
	if (!pkg || !pkg.default || typeof pkg.default !== "object") throw new TypeError(`Environment "${name}" is not a valid environment. Path "${packageId}" should export default object with a "setup" or/and "setupVM" method.`);
	const environment = pkg.default;
	if (environment.transformMode !== "web" && environment.transformMode !== "ssr") throw new TypeError(`Environment "${name}" is not a valid environment. Path "${packageId}" should export default object with a "transformMode" method equal to "ssr" or "web".`);
	return environment;
}

const listeners = /* @__PURE__ */ new Set();
function addCleanupListener(listener) {
	listeners.add(listener);
}
async function cleanup() {
	const promises = [...listeners].map((l) => l());
	await Promise.all(promises);
}

if (isChildProcess()) {
	setProcessTitle(`vitest ${workerId}`);
	const isProfiling = process.execArgv.some((execArg) => execArg.startsWith("--prof") || execArg.startsWith("--cpu-prof") || execArg.startsWith("--heap-prof") || execArg.startsWith("--diagnostic-dir"));
	if (isProfiling)
 // Work-around for nodejs/node#55094
	process.on("SIGTERM", () => {
		process.exit();
	});
}
// this is what every pool executes when running tests
async function execute(method, ctx) {
	disposeInternalListeners();
	const prepareStart = performance.now();
	const inspectorCleanup = setupInspect(ctx);
	process.env.VITEST_WORKER_ID = String(ctx.workerId);
	process.env.VITEST_POOL_ID = String(workerId);
	try {
		// worker is a filepath or URL to a file that exposes a default export with "getRpcOptions" and "runTests" methods
		if (ctx.worker[0] === ".") throw new Error(`Path to the test runner cannot be relative, received "${ctx.worker}"`);
		const file = ctx.worker.startsWith("file:") ? ctx.worker : pathToFileURL(ctx.worker).toString();
		const testRunnerModule = await import(file);
		if (!testRunnerModule.default || typeof testRunnerModule.default !== "object") throw new TypeError(`Test worker object should be exposed as a default export. Received "${typeof testRunnerModule.default}"`);
		const worker = testRunnerModule.default;
		if (!worker.getRpcOptions || typeof worker.getRpcOptions !== "function") throw new TypeError(`Test worker should expose "getRpcOptions" method. Received "${typeof worker.getRpcOptions}".`);
		// RPC is used to communicate between worker (be it a thread worker or child process or a custom implementation) and the main thread
		const { rpc, onCancel } = createRuntimeRpc(worker.getRpcOptions(ctx));
		const beforeEnvironmentTime = performance.now();
		const environment = await loadEnvironment(ctx, rpc);
		if (ctx.environment.transformMode) environment.transformMode = ctx.environment.transformMode;
		const state = {
			ctx,
			moduleCache: new ModuleCacheMap(),
			moduleExecutionInfo: /* @__PURE__ */ new Map(),
			config: ctx.config,
			onCancel,
			environment,
			durations: {
				environment: beforeEnvironmentTime,
				prepare: prepareStart
			},
			rpc,
			onCleanup: (listener) => addCleanupListener(listener),
			providedContext: ctx.providedContext,
			onFilterStackTrace(stack) {
				return createStackString(parseStacktrace(stack));
			}
		};
		const methodName = method === "collect" ? "collectTests" : "runTests";
		if (!worker[methodName] || typeof worker[methodName] !== "function") throw new TypeError(`Test worker should expose "runTests" method. Received "${typeof worker.runTests}".`);
		await worker[methodName](state);
	} finally {
		await rpcDone().catch(() => {});
		inspectorCleanup();
	}
}
function run(ctx) {
	return execute("run", ctx);
}
function collect(ctx) {
	return execute("collect", ctx);
}
async function teardown() {
	return cleanup();
}

export { collect, run, teardown };


/**
 * @fileoverview Worker thread for multithread linting.
 * @author Francesco Trotta
 */

"use strict";

const hrtimeBigint = process.hrtime.bigint;

const startTime = hrtimeBigint();

// eslint-disable-next-line n/no-unsupported-features/node-builtins -- enable V8's code cache if supported
require("node:module").enableCompileCache?.();

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { parentPort, threadId, workerData } = require("node:worker_threads");
const createDebug = require("debug");
const {
	createConfigLoader,
	createDefaultConfigs,
	createLinter,
	createLintResultCache,
	getCacheFile,
	lintFile,
	loadOptionsFromModule,
	processOptions,
} = require("./eslint-helpers");
const { WarningService } = require("../services/warning-service");

const depsLoadedTime = hrtimeBigint();

//------------------------------------------------------------------------------
// Typedefs
//------------------------------------------------------------------------------

/** @typedef {import("../types").ESLint.LintResult} LintResult */
/** @typedef {import("../types").ESLint.Options} ESLintOptions */
/** @typedef {LintResult & { index?: number; }} IndexedLintResult */
/** @typedef {IndexedLintResult[] & { netLintingDuration: bigint; }} WorkerLintResults */
/**
 * @typedef {Object} WorkerData - Data passed to the worker thread.
 * @property {ESLintOptions | string} eslintOptionsOrURL - The unprocessed ESLint options or the URL of the options module.
 * @property {Uint32Array<SharedArrayBuffer>} filePathIndexArray - Shared counter used to track the next file to lint.
 * @property {string[]} filePaths - File paths to lint.
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const debug = createDebug(`eslint:worker:thread-${threadId}`);
createDebug.formatters.t = timeDiff =>
	`${(timeDiff + 500_000n) / 1_000_000n} ms`;

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

debug("Dependencies loaded in %t", depsLoadedTime - startTime);

(async () => {
	/** @type {WorkerData} */
	const { eslintOptionsOrURL, filePathIndexArray, filePaths } = workerData;
	const eslintOptions =
		typeof eslintOptionsOrURL === "object"
			? eslintOptionsOrURL
			: await loadOptionsFromModule(eslintOptionsOrURL);
	const processedESLintOptions = processOptions(eslintOptions);

	const warningService = new WarningService();

	// These warnings are always emitted by the controlling thread.
	warningService.emitEmptyConfigWarning =
		warningService.emitInactiveFlagWarning = () => {};

	const linter = createLinter(processedESLintOptions, warningService);

	const cacheFilePath = getCacheFile(
		processedESLintOptions.cacheLocation,
		processedESLintOptions.cwd,
	);

	const lintResultCache = createLintResultCache(
		processedESLintOptions,
		cacheFilePath,
	);
	const defaultConfigs = createDefaultConfigs(eslintOptions.plugins);

	const configLoader = createConfigLoader(
		processedESLintOptions,
		defaultConfigs,
		linter,
		warningService,
	);

	/** @type {WorkerLintResults} */
	const indexedResults = [];
	let loadConfigTotalDuration = 0n;
	const readFileCounter = { duration: 0n };

	const lintingStartTime = hrtimeBigint();
	debug(
		"Linting started %t after dependencies loaded",
		lintingStartTime - depsLoadedTime,
	);

	for (;;) {
		const fileLintingStartTime = hrtimeBigint();

		// It seems hard to produce an arithmetic overflow under realistic conditions here.
		const index = Atomics.add(filePathIndexArray, 0, 1);

		const filePath = filePaths[index];
		if (!filePath) {
			break;
		}

		const loadConfigEnterTime = hrtimeBigint();
		const configs = await configLoader.loadConfigArrayForFile(filePath);
		const loadConfigExitTime = hrtimeBigint();
		const loadConfigDuration = loadConfigExitTime - loadConfigEnterTime;
		debug(
			'Config array for file "%s" loaded in %t',
			filePath,
			loadConfigDuration,
		);
		loadConfigTotalDuration += loadConfigDuration;

		/** @type {IndexedLintResult} */
		const result = await lintFile(
			filePath,
			configs,
			processedESLintOptions,
			linter,
			lintResultCache,
			readFileCounter,
		);
		if (result) {
			result.index = index;
			indexedResults.push(result);
		}

		const fileLintingEndTime = hrtimeBigint();
		debug(
			'File "%s" processed in %t',
			filePath,
			fileLintingEndTime - fileLintingStartTime,
		);
	}

	const lintingDuration = hrtimeBigint() - lintingStartTime;

	/*
	 * The net linting duration is the total linting time minus the time spent loading configs and reading files.
	 * It captures the processing time dedicated to computation-intensive tasks that are highly parallelizable and not repeated across threads.
	 */
	indexedResults.netLintingDuration =
		lintingDuration - loadConfigTotalDuration - readFileCounter.duration;

	parentPort.postMessage(indexedResults);
})();


import { isMovable, kRequestCountField, kResponseCountField, kTransferable, kValue } from "../common-Qw-RoVFD.js";
import { stderr, stdout } from "../utils-De75vAgL.js";
import { getHandler, throwInNextTick } from "../utils-B--2TaWv.js";
import { parentPort, receiveMessageOnPort, workerData } from "node:worker_threads";

//#region src/entry/worker.ts
const [tinypoolPrivateData, workerData$1] = workerData;
process.__tinypool_state__ = {
	isWorkerThread: true,
	isTinypoolWorker: true,
	workerData: workerData$1,
	workerId: tinypoolPrivateData.workerId
};
const memoryUsage = process.memoryUsage.bind(process);
let useAtomics = process.env.PISCINA_DISABLE_ATOMICS !== "1";
parentPort.on("message", (message) => {
	useAtomics = process.env.PISCINA_DISABLE_ATOMICS === "1" ? false : message.useAtomics;
	const { port, sharedBuffer, filename, name } = message;
	(async function() {
		if (filename !== null) await getHandler(filename, name);
		const readyMessage = { ready: true };
		parentPort.postMessage(readyMessage);
		port.start();
		port.on("message", onMessage.bind(null, port, sharedBuffer));
		atomicsWaitLoop(port, sharedBuffer);
	})().catch(throwInNextTick);
});
let currentTasks = 0;
let lastSeenRequestCount = 0;
function atomicsWaitLoop(port, sharedBuffer) {
	if (!useAtomics) return;
	while (currentTasks === 0) {
		Atomics.wait(sharedBuffer, kRequestCountField, lastSeenRequestCount);
		lastSeenRequestCount = Atomics.load(sharedBuffer, kRequestCountField);
		let entry;
		while ((entry = receiveMessageOnPort(port)) !== void 0) onMessage(port, sharedBuffer, entry.message);
	}
}
function onMessage(port, sharedBuffer, message) {
	currentTasks++;
	const { taskId, task, filename, name } = message;
	(async function() {
		let response;
		let transferList = [];
		try {
			const handler = await getHandler(filename, name);
			if (handler === null) throw new Error(`No handler function "${name}" exported from "${filename}"`);
			let result = await handler(task);
			if (isMovable(result)) {
				transferList = transferList.concat(result[kTransferable]);
				result = result[kValue];
			}
			response = {
				taskId,
				result,
				error: null,
				usedMemory: memoryUsage().heapUsed
			};
			if (stdout()?.writableLength > 0) await new Promise((resolve) => process.stdout.write("", resolve));
			if (stderr()?.writableLength > 0) await new Promise((resolve) => process.stderr.write("", resolve));
		} catch (error) {
			response = {
				taskId,
				result: null,
				error,
				usedMemory: memoryUsage().heapUsed
			};
		}
		currentTasks--;
		port.postMessage(response, transferList);
		Atomics.add(sharedBuffer, kResponseCountField, 1);
		atomicsWaitLoop(port, sharedBuffer);
	})().catch(throwInNextTick);
}

//#endregion

import { pathToFileURL } from 'node:url';
import { createStackString, parseStacktrace } from '@vitest/utils/source-map';
import { workerId } from 'tinypool';
import { ViteNodeRunner, ModuleCacheMap } from 'vite-node/client';
import { readFileSync } from 'node:fs';
import { resolve, normalize } from 'pathe';
import { e as environments } from './chunks/index.CmSc2RE5.js';
import { s as setupInspect } from './chunks/inspector.C914Efll.js';
import { c as createRuntimeRpc, a as rpcDone } from './chunks/rpc.-pEldfrD.js';
import { i as isChildProcess, s as setProcessTitle } from './chunks/utils.XdZDrNZV.js';
import { d as disposeInternalListeners } from './chunks/utils.CAioKnHs.js';
import 'node:console';
import 'node:module';
import '@vitest/utils';
import './chunks/index.B521nVV-.js';

function isBuiltinEnvironment(env) {
	return env in environments;
}
const _loaders = /* @__PURE__ */ new Map();
async function createEnvironmentLoader(options) {
	if (!_loaders.has(options.root)) {
		const loader = new ViteNodeRunner(options);
		await loader.executeId("/@vite/env");
		_loaders.set(options.root, loader);
	}
	return _loaders.get(options.root);
}
async function loadEnvironment(ctx, rpc) {
	const name = ctx.environment.name;
	if (isBuiltinEnvironment(name)) return environments[name];
	const loader = await createEnvironmentLoader({
		root: ctx.config.root,
		fetchModule: async (id) => {
			const result = await rpc.fetch(id, "ssr");
			if (result.id) return { code: readFileSync(result.id, "utf-8") };
			return result;
		},
		resolveId: (id, importer) => rpc.resolveId(id, importer, "ssr")
	});
	const root = loader.root;
	const packageId = name[0] === "." || name[0] === "/" ? resolve(root, name) : (await rpc.resolveId(`vitest-environment-${name}`, void 0, "ssr"))?.id ?? resolve(root, name);
	const pkg = await loader.executeId(normalize(packageId));
	if (!pkg || !pkg.default || typeof pkg.default !== "object") throw new TypeError(`Environment "${name}" is not a valid environment. Path "${packageId}" should export default object with a "setup" or/and "setupVM" method.`);
	const environment = pkg.default;
	if (environment.transformMode !== "web" && environment.transformMode !== "ssr") throw new TypeError(`Environment "${name}" is not a valid environment. Path "${packageId}" should export default object with a "transformMode" method equal to "ssr" or "web".`);
	return environment;
}

const listeners = /* @__PURE__ */ new Set();
function addCleanupListener(listener) {
	listeners.add(listener);
}
async function cleanup() {
	const promises = [...listeners].map((l) => l());
	await Promise.all(promises);
}

if (isChildProcess()) {
	setProcessTitle(`vitest ${workerId}`);
	const isProfiling = process.execArgv.some((execArg) => execArg.startsWith("--prof") || execArg.startsWith("--cpu-prof") || execArg.startsWith("--heap-prof") || execArg.startsWith("--diagnostic-dir"));
	if (isProfiling)
 // Work-around for nodejs/node#55094
	process.on("SIGTERM", () => {
		process.exit();
	});
}
// this is what every pool executes when running tests
async function execute(method, ctx) {
	disposeInternalListeners();
	const prepareStart = performance.now();
	const inspectorCleanup = setupInspect(ctx);
	process.env.VITEST_WORKER_ID = String(ctx.workerId);
	process.env.VITEST_POOL_ID = String(workerId);
	try {
		// worker is a filepath or URL to a file that exposes a default export with "getRpcOptions" and "runTests" methods
		if (ctx.worker[0] === ".") throw new Error(`Path to the test runner cannot be relative, received "${ctx.worker}"`);
		const file = ctx.worker.startsWith("file:") ? ctx.worker : pathToFileURL(ctx.worker).toString();
		const testRunnerModule = await import(file);
		if (!testRunnerModule.default || typeof testRunnerModule.default !== "object") throw new TypeError(`Test worker object should be exposed as a default export. Received "${typeof testRunnerModule.default}"`);
		const worker = testRunnerModule.default;
		if (!worker.getRpcOptions || typeof worker.getRpcOptions !== "function") throw new TypeError(`Test worker should expose "getRpcOptions" method. Received "${typeof worker.getRpcOptions}".`);
		// RPC is used to communicate between worker (be it a thread worker or child process or a custom implementation) and the main thread
		const { rpc, onCancel } = createRuntimeRpc(worker.getRpcOptions(ctx));
		const beforeEnvironmentTime = performance.now();
		const environment = await loadEnvironment(ctx, rpc);
		if (ctx.environment.transformMode) environment.transformMode = ctx.environment.transformMode;
		const state = {
			ctx,
			moduleCache: new ModuleCacheMap(),
			moduleExecutionInfo: /* @__PURE__ */ new Map(),
			config: ctx.config,
			onCancel,
			environment,
			durations: {
				environment: beforeEnvironmentTime,
				prepare: prepareStart
			},
			rpc,
			onCleanup: (listener) => addCleanupListener(listener),
			providedContext: ctx.providedContext,
			onFilterStackTrace(stack) {
				return createStackString(parseStacktrace(stack));
			}
		};
		const methodName = method === "collect" ? "collectTests" : "runTests";
		if (!worker[methodName] || typeof worker[methodName] !== "function") throw new TypeError(`Test worker should expose "runTests" method. Received "${typeof worker.runTests}".`);
		await worker[methodName](state);
	} finally {
		await rpcDone().catch(() => {});
		inspectorCleanup();
	}
}
function run(ctx) {
	return execute("run", ctx);
}
function collect(ctx) {
	return execute("collect", ctx);
}
async function teardown() {
	return cleanup();
}

export { collect, run, teardown };
