import { __toESM } from "./chunks/dep-lCKrEJQm.js";
import { createLogger, require_picocolors } from "./chunks/dep-D5MCzjWT.js";
import { VERSION } from "./chunks/dep-CcFMbzqu.js";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { EventEmitter } from "events";

//#region ../../node_modules/.pnpm/cac@6.7.14/node_modules/cac/dist/index.mjs
function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}
function toVal(out, key, val, opts) {
	var x, old = out[key], nxt = !!~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : !!~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
	out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}
function mri2(args, opts) {
	args = args || [];
	opts = opts || {};
	var k, arr, arg, name, val, out = { _: [] };
	var i = 0, j = 0, idx = 0, len = args.length;
	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;
	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);
	if (alibi) for (k in opts.alias) {
		arr = opts.alias[k] = toArr(opts.alias[k]);
		for (i = 0; i < arr.length; i++) (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
	}
	for (i = opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j = arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}
	for (i = opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j = arr.length; j-- > 0;) opts.string.push(arr[j]);
	}
	if (defaults) for (k in opts.default) {
		name = typeof opts.default[k];
		arr = opts.alias[k] = opts.alias[k] || [];
		if (opts[name] !== void 0) {
			opts[name].push(k);
			for (i = 0; i < arr.length; i++) opts[name].push(arr[i]);
		}
	}
	const keys = strict ? Object.keys(opts.alias) : [];
	for (i = 0; i < len; i++) {
		arg = args[i];
		if (arg === "--") {
			out._ = out._.concat(args.slice(++i));
			break;
		}
		for (j = 0; j < arg.length; j++) if (arg.charCodeAt(j) !== 45) break;
		if (j === 0) out._.push(arg);
		else if (arg.substring(j, j + 3) === "no-") {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) return opts.unknown(arg);
			out[name] = false;
		} else {
			for (idx = j + 1; idx < arg.length; idx++) if (arg.charCodeAt(idx) === 61) break;
			name = arg.substring(j, idx);
			val = arg.substring(++idx) || i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i];
			arr = j === 2 ? [name] : name;
			for (idx = 0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown("-".repeat(j) + name);
				toVal(out, name, idx + 1 < arr.length || val, opts);
			}
		}
	}
	if (defaults) {
		for (k in opts.default) if (out[k] === void 0) out[k] = opts.default[k];
	}
	if (alibi) for (k in out) {
		arr = opts.alias[k] || [];
		while (arr.length > 0) out[arr.shift()] = out[k];
	}
	return out;
}
const removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
const findAllBrackets = (v) => {
	const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
	const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
	const res = [];
	const parse = (match) => {
		let variadic = false;
		let value = match[1];
		if (value.startsWith("...")) {
			value = value.slice(3);
			variadic = true;
		}
		return {
			required: match[0].startsWith("<"),
			value,
			variadic
		};
	};
	let angledMatch;
	while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) res.push(parse(angledMatch));
	let squareMatch;
	while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) res.push(parse(squareMatch));
	return res;
};
const getMriOptions = (options) => {
	const result = {
		alias: {},
		boolean: []
	};
	for (const [index, option] of options.entries()) {
		if (option.names.length > 1) result.alias[option.names[0]] = option.names.slice(1);
		if (option.isBoolean) if (option.negated) {
			const hasStringTypeOption = options.some((o, i) => {
				return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
			});
			if (!hasStringTypeOption) result.boolean.push(option.names[0]);
		} else result.boolean.push(option.names[0]);
	}
	return result;
};
const findLongest = (arr) => {
	return arr.sort((a, b) => {
		return a.length > b.length ? -1 : 1;
	})[0];
};
const padRight = (str, length) => {
	return str.length >= length ? str : `${str}${" ".repeat(length - str.length)}`;
};
const camelcase = (input) => {
	return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
		return p1 + p2.toUpperCase();
	});
};
const setDotProp = (obj, keys, val) => {
	let i = 0;
	let length = keys.length;
	let t = obj;
	let x;
	for (; i < length; ++i) {
		x = t[keys[i]];
		t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
	}
};
const setByType = (obj, transforms) => {
	for (const key of Object.keys(transforms)) {
		const transform = transforms[key];
		if (transform.shouldTransform) {
			obj[key] = Array.prototype.concat.call([], obj[key]);
			if (typeof transform.transformFunction === "function") obj[key] = obj[key].map(transform.transformFunction);
		}
	}
};
const getFileName = (input) => {
	const m = /([^\\\/]+)$/.exec(input);
	return m ? m[1] : "";
};
const camelcaseOptionName = (name) => {
	return name.split(".").map((v, i) => {
		return i === 0 ? camelcase(v) : v;
	}).join(".");
};
var CACError = class extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
		if (typeof Error.captureStackTrace === "function") Error.captureStackTrace(this, this.constructor);
		else this.stack = new Error(message).stack;
	}
};
var Option = class {
	constructor(rawName, description, config) {
		this.rawName = rawName;
		this.description = description;
		this.config = Object.assign({}, config);
		rawName = rawName.replace(/\.\*/g, "");
		this.negated = false;
		this.names = removeBrackets(rawName).split(",").map((v) => {
			let name = v.trim().replace(/^-{1,2}/, "");
			if (name.startsWith("no-")) {
				this.negated = true;
				name = name.replace(/^no-/, "");
			}
			return camelcaseOptionName(name);
		}).sort((a, b) => a.length > b.length ? 1 : -1);
		this.name = this.names[this.names.length - 1];
		if (this.negated && this.config.default == null) this.config.default = true;
		if (rawName.includes("<")) this.required = true;
		else if (rawName.includes("[")) this.required = false;
		else this.isBoolean = true;
	}
};
const processArgs = process.argv;
const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;
var Command = class {
	constructor(rawName, description, config = {}, cli$1) {
		this.rawName = rawName;
		this.description = description;
		this.config = config;
		this.cli = cli$1;
		this.options = [];
		this.aliasNames = [];
		this.name = removeBrackets(rawName);
		this.args = findAllBrackets(rawName);
		this.examples = [];
	}
	usage(text) {
		this.usageText = text;
		return this;
	}
	allowUnknownOptions() {
		this.config.allowUnknownOptions = true;
		return this;
	}
	ignoreOptionDefaultValue() {
		this.config.ignoreOptionDefaultValue = true;
		return this;
	}
	version(version, customFlags = "-v, --version") {
		this.versionNumber = version;
		this.option(customFlags, "Display version number");
		return this;
	}
	example(example) {
		this.examples.push(example);
		return this;
	}
	option(rawName, description, config) {
		const option = new Option(rawName, description, config);
		this.options.push(option);
		return this;
	}
	alias(name) {
		this.aliasNames.push(name);
		return this;
	}
	action(callback) {
		this.commandAction = callback;
		return this;
	}
	isMatched(name) {
		return this.name === name || this.aliasNames.includes(name);
	}
	get isDefaultCommand() {
		return this.name === "" || this.aliasNames.includes("!");
	}
	get isGlobalCommand() {
		return this instanceof GlobalCommand;
	}
	hasOption(name) {
		name = name.split(".")[0];
		return this.options.find((option) => {
			return option.names.includes(name);
		});
	}
	outputHelp() {
		const { name, commands } = this.cli;
		const { versionNumber, options: globalOptions, helpCallback } = this.cli.globalCommand;
		let sections = [{ body: `${name}${versionNumber ? `/${versionNumber}` : ""}` }];
		sections.push({
			title: "Usage",
			body: `  $ ${name} ${this.usageText || this.rawName}`
		});
		const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
		if (showCommands) {
			const longestCommandName = findLongest(commands.map((command) => command.rawName));
			sections.push({
				title: "Commands",
				body: commands.map((command) => {
					return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
				}).join("\n")
			});
			sections.push({
				title: `For more info, run any command with the \`--help\` flag`,
				body: commands.map((command) => `  $ ${name}${command.name === "" ? "" : ` ${command.name}`} --help`).join("\n")
			});
		}
		let options = this.isGlobalCommand ? globalOptions : [...this.options, ...globalOptions || []];
		if (!this.isGlobalCommand && !this.isDefaultCommand) options = options.filter((option) => option.name !== "version");
		if (options.length > 0) {
			const longestOptionName = findLongest(options.map((option) => option.rawName));
			sections.push({
				title: "Options",
				body: options.map((option) => {
					return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
				}).join("\n")
			});
		}
		if (this.examples.length > 0) sections.push({
			title: "Examples",
			body: this.examples.map((example) => {
				if (typeof example === "function") return example(name);
				return example;
			}).join("\n")
		});
		if (helpCallback) sections = helpCallback(sections) || sections;
		console.log(sections.map((section) => {
			return section.title ? `${section.title}:
${section.body}` : section.body;
		}).join("\n\n"));
	}
	outputVersion() {
		const { name } = this.cli;
		const { versionNumber } = this.cli.globalCommand;
		if (versionNumber) console.log(`${name}/${versionNumber} ${platformInfo}`);
	}
	checkRequiredArgs() {
		const minimalArgsCount = this.args.filter((arg) => arg.required).length;
		if (this.cli.args.length < minimalArgsCount) throw new CACError(`missing required args for command \`${this.rawName}\``);
	}
	checkUnknownOptions() {
		const { options, globalCommand } = this.cli;
		if (!this.config.allowUnknownOptions) {
			for (const name of Object.keys(options)) if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
		}
	}
	checkOptionValue() {
		const { options: parsedOptions, globalCommand } = this.cli;
		const options = [...globalCommand.options, ...this.options];
		for (const option of options) {
			const value = parsedOptions[option.name.split(".")[0]];
			if (option.required) {
				const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
				if (value === true || value === false && !hasNegated) throw new CACError(`option \`${option.rawName}\` value is missing`);
			}
		}
	}
};
var GlobalCommand = class extends Command {
	constructor(cli$1) {
		super("@@global@@", "", {}, cli$1);
	}
};
var __assign = Object.assign;
var CAC = class extends EventEmitter {
	constructor(name = "") {
		super();
		this.name = name;
		this.commands = [];
		this.rawArgs = [];
		this.args = [];
		this.options = {};
		this.globalCommand = new GlobalCommand(this);
		this.globalCommand.usage("<command> [options]");
	}
	usage(text) {
		this.globalCommand.usage(text);
		return this;
	}
	command(rawName, description, config) {
		const command = new Command(rawName, description || "", config, this);
		command.globalCommand = this.globalCommand;
		this.commands.push(command);
		return command;
	}
	option(rawName, description, config) {
		this.globalCommand.option(rawName, description, config);
		return this;
	}
	help(callback) {
		this.globalCommand.option("-h, --help", "Display this message");
		this.globalCommand.helpCallback = callback;
		this.showHelpOnExit = true;
		return this;
	}
	version(version, customFlags = "-v, --version") {
		this.globalCommand.version(version, customFlags);
		this.showVersionOnExit = true;
		return this;
	}
	example(example) {
		this.globalCommand.example(example);
		return this;
	}
	outputHelp() {
		if (this.matchedCommand) this.matchedCommand.outputHelp();
		else this.globalCommand.outputHelp();
	}
	outputVersion() {
		this.globalCommand.outputVersion();
	}
	setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
		this.args = args;
		this.options = options;
		if (matchedCommand) this.matchedCommand = matchedCommand;
		if (matchedCommandName) this.matchedCommandName = matchedCommandName;
		return this;
	}
	unsetMatchedCommand() {
		this.matchedCommand = void 0;
		this.matchedCommandName = void 0;
	}
	parse(argv = processArgs, { run = true } = {}) {
		this.rawArgs = argv;
		if (!this.name) this.name = argv[1] ? getFileName(argv[1]) : "cli";
		let shouldParse = true;
		for (const command of this.commands) {
			const parsed = this.mri(argv.slice(2), command);
			const commandName = parsed.args[0];
			if (command.isMatched(commandName)) {
				shouldParse = false;
				const parsedInfo = __assign(__assign({}, parsed), { args: parsed.args.slice(1) });
				this.setParsedInfo(parsedInfo, command, commandName);
				this.emit(`command:${commandName}`, command);
			}
		}
		if (shouldParse) {
			for (const command of this.commands) if (command.name === "") {
				shouldParse = false;
				const parsed = this.mri(argv.slice(2), command);
				this.setParsedInfo(parsed, command);
				this.emit(`command:!`, command);
			}
		}
		if (shouldParse) {
			const parsed = this.mri(argv.slice(2));
			this.setParsedInfo(parsed);
		}
		if (this.options.help && this.showHelpOnExit) {
			this.outputHelp();
			run = false;
			this.unsetMatchedCommand();
		}
		if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
			this.outputVersion();
			run = false;
			this.unsetMatchedCommand();
		}
		const parsedArgv = {
			args: this.args,
			options: this.options
		};
		if (run) this.runMatchedCommand();
		if (!this.matchedCommand && this.args[0]) this.emit("command:*");
		return parsedArgv;
	}
	mri(argv, command) {
		const cliOptions = [...this.globalCommand.options, ...command ? command.options : []];
		const mriOptions = getMriOptions(cliOptions);
		let argsAfterDoubleDashes = [];
		const doubleDashesIndex = argv.indexOf("--");
		if (doubleDashesIndex > -1) {
			argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
			argv = argv.slice(0, doubleDashesIndex);
		}
		let parsed = mri2(argv, mriOptions);
		parsed = Object.keys(parsed).reduce((res, name) => {
			return __assign(__assign({}, res), { [camelcaseOptionName(name)]: parsed[name] });
		}, { _: [] });
		const args = parsed._;
		const options = { "--": argsAfterDoubleDashes };
		const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
		let transforms = Object.create(null);
		for (const cliOption of cliOptions) {
			if (!ignoreDefault && cliOption.config.default !== void 0) for (const name of cliOption.names) options[name] = cliOption.config.default;
			if (Array.isArray(cliOption.config.type)) {
				if (transforms[cliOption.name] === void 0) {
					transforms[cliOption.name] = Object.create(null);
					transforms[cliOption.name]["shouldTransform"] = true;
					transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
				}
			}
		}
		for (const key of Object.keys(parsed)) if (key !== "_") {
			const keys = key.split(".");
			setDotProp(options, keys, parsed[key]);
			setByType(options, transforms);
		}
		return {
			args,
			options
		};
	}
	runMatchedCommand() {
		const { args, options, matchedCommand: command } = this;
		if (!command || !command.commandAction) return;
		command.checkUnknownOptions();
		command.checkOptionValue();
		command.checkRequiredArgs();
		const actionArgs = [];
		command.args.forEach((arg, index) => {
			if (arg.variadic) actionArgs.push(args.slice(index));
			else actionArgs.push(args[index]);
		});
		actionArgs.push(options);
		return command.commandAction.apply(this, actionArgs);
	}
};
const cac = (name = "") => new CAC(name);

//#endregion
//#region src/node/cli.ts
var import_picocolors = /* @__PURE__ */ __toESM(require_picocolors(), 1);
function checkNodeVersion(nodeVersion) {
	const currentVersion = nodeVersion.split(".");
	const major = parseInt(currentVersion[0], 10);
	const minor = parseInt(currentVersion[1], 10);
	const isSupported = major === 20 && minor >= 19 || major === 22 && minor >= 12 || major > 22;
	return isSupported;
}
if (!checkNodeVersion(process.versions.node)) console.warn(import_picocolors.default.yellow(`You are using Node.js ${process.versions.node}. Vite requires Node.js version 20.19+ or 22.12+. Please upgrade your Node.js version.`));
const cli = cac("vite");
let profileSession = global.__vite_profile_session;
let profileCount = 0;
const stopProfiler = (log) => {
	if (!profileSession) return;
	return new Promise((res, rej) => {
		profileSession.post("Profiler.stop", (err, { profile }) => {
			if (!err) {
				const outPath = path.resolve(`./vite-profile-${profileCount++}.cpuprofile`);
				fs.writeFileSync(outPath, JSON.stringify(profile));
				log(import_picocolors.default.yellow(`CPU profile written to ${import_picocolors.default.white(import_picocolors.default.dim(outPath))}`));
				profileSession = void 0;
				res();
			} else rej(err);
		});
	});
};
const filterDuplicateOptions = (options) => {
	for (const [key, value] of Object.entries(options)) if (Array.isArray(value)) options[key] = value[value.length - 1];
};
/**
* removing global flags before passing as command specific sub-configs
*/
function cleanGlobalCLIOptions(options) {
	const ret = { ...options };
	delete ret["--"];
	delete ret.c;
	delete ret.config;
	delete ret.base;
	delete ret.l;
	delete ret.logLevel;
	delete ret.clearScreen;
	delete ret.configLoader;
	delete ret.d;
	delete ret.debug;
	delete ret.f;
	delete ret.filter;
	delete ret.m;
	delete ret.mode;
	delete ret.force;
	delete ret.w;
	if ("sourcemap" in ret) {
		const sourcemap = ret.sourcemap;
		ret.sourcemap = sourcemap === "true" ? true : sourcemap === "false" ? false : ret.sourcemap;
	}
	if ("watch" in ret) {
		const watch = ret.watch;
		ret.watch = watch ? {} : void 0;
	}
	return ret;
}
/**
* removing builder flags before passing as command specific sub-configs
*/
function cleanBuilderCLIOptions(options) {
	const ret = { ...options };
	delete ret.app;
	return ret;
}
/**
* host may be a number (like 0), should convert to string
*/
const convertHost = (v) => {
	if (typeof v === "number") return String(v);
	return v;
};
/**
* base may be a number (like 0), should convert to empty string
*/
const convertBase = (v) => {
	if (v === 0) return "";
	return v;
};
cli.option("-c, --config <file>", `[string] use specified config file`).option("--base <path>", `[string] public base path (default: /)`, { type: [convertBase] }).option("-l, --logLevel <level>", `[string] info | warn | error | silent`).option("--clearScreen", `[boolean] allow/disable clear screen when logging`).option("--configLoader <loader>", `[string] use 'bundle' to bundle the config with esbuild, or 'runner' (experimental) to process it on the fly, or 'native' (experimental) to load using the native runtime (default: bundle)`).option("-d, --debug [feat]", `[string | boolean] show debug logs`).option("-f, --filter <filter>", `[string] filter debug logs`).option("-m, --mode <mode>", `[string] set env mode`);
cli.command("[root]", "start dev server").alias("serve").alias("dev").option("--host [host]", `[string] specify hostname`, { type: [convertHost] }).option("--port <port>", `[number] specify port`).option("--open [path]", `[boolean | string] open browser on startup`).option("--cors", `[boolean] enable CORS`).option("--strictPort", `[boolean] exit if specified port is already in use`).option("--force", `[boolean] force the optimizer to ignore the cache and re-bundle`).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { createServer } = await import("./chunks/dep-CPnzVSwg.js");
	try {
		const server = await createServer({
			root,
			base: options.base,
			mode: options.mode,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			clearScreen: options.clearScreen,
			server: cleanGlobalCLIOptions(options),
			forceOptimizeDeps: options.force
		});
		if (!server.httpServer) throw new Error("HTTP server not available");
		await server.listen();
		const info = server.config.logger.info;
		const modeString = options.mode && options.mode !== "development" ? `  ${import_picocolors.default.bgGreen(` ${import_picocolors.default.bold(options.mode)} `)}` : "";
		const viteStartTime = global.__vite_start_time ?? false;
		const startupDurationString = viteStartTime ? import_picocolors.default.dim(`ready in ${import_picocolors.default.reset(import_picocolors.default.bold(Math.ceil(performance.now() - viteStartTime)))} ms`) : "";
		const hasExistingLogs = process.stdout.bytesWritten > 0 || process.stderr.bytesWritten > 0;
		info(`\n  ${import_picocolors.default.green(`${import_picocolors.default.bold("VITE")} v${VERSION}`)}${modeString}  ${startupDurationString}\n`, { clear: !hasExistingLogs });
		server.printUrls();
		const customShortcuts = [];
		if (profileSession) customShortcuts.push({
			key: "p",
			description: "start/stop the profiler",
			async action(server$1) {
				if (profileSession) await stopProfiler(server$1.config.logger.info);
				else {
					const inspector = await import("node:inspector").then((r) => r.default);
					await new Promise((res) => {
						profileSession = new inspector.Session();
						profileSession.connect();
						profileSession.post("Profiler.enable", () => {
							profileSession.post("Profiler.start", () => {
								server$1.config.logger.info("Profiler started");
								res();
							});
						});
					});
				}
			}
		});
		server.bindCLIShortcuts({
			print: true,
			customShortcuts
		});
	} catch (e) {
		const logger = createLogger(options.logLevel);
		logger.error(import_picocolors.default.red(`error when starting dev server:\n${e.stack}`), { error: e });
		stopProfiler(logger.info);
		process.exit(1);
	}
});
cli.command("build [root]", "build for production").option("--target <target>", `[string] transpile target (default: 'baseline-widely-available')`).option("--outDir <dir>", `[string] output directory (default: dist)`).option("--assetsDir <dir>", `[string] directory under outDir to place assets in (default: assets)`).option("--assetsInlineLimit <number>", `[number] static asset base64 inline threshold in bytes (default: 4096)`).option("--ssr [entry]", `[string] build specified entry for server-side rendering`).option("--sourcemap [output]", `[boolean | "inline" | "hidden"] output source maps for build (default: false)`).option("--minify [minifier]", "[boolean | \"terser\" | \"esbuild\"] enable/disable minification, or specify minifier to use (default: esbuild)").option("--manifest [name]", `[boolean | string] emit build manifest json`).option("--ssrManifest [name]", `[boolean | string] emit ssr manifest json`).option("--emptyOutDir", `[boolean] force empty outDir when it's outside of root`).option("-w, --watch", `[boolean] rebuilds when modules have changed on disk`).option("--app", `[boolean] same as \`builder: {}\``).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { createBuilder } = await import("./chunks/dep-TDFDwW_9.js");
	const buildOptions = cleanGlobalCLIOptions(cleanBuilderCLIOptions(options));
	try {
		const inlineConfig = {
			root,
			base: options.base,
			mode: options.mode,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			clearScreen: options.clearScreen,
			build: buildOptions,
			...options.app ? { builder: {} } : {}
		};
		const builder = await createBuilder(inlineConfig, null);
		await builder.buildApp();
	} catch (e) {
		createLogger(options.logLevel).error(import_picocolors.default.red(`error during build:\n${e.stack}`), { error: e });
		process.exit(1);
	} finally {
		stopProfiler((message) => createLogger(options.logLevel).info(message));
	}
});
cli.command("optimize [root]", "pre-bundle dependencies (deprecated, the pre-bundle process runs automatically and does not need to be called)").option("--force", `[boolean] force the optimizer to ignore the cache and re-bundle`).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { resolveConfig } = await import("./chunks/dep-6-jTB_1O.js");
	const { optimizeDeps } = await import("./chunks/dep-03SfmTdk.js");
	try {
		const config = await resolveConfig({
			root,
			base: options.base,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			mode: options.mode
		}, "serve");
		await optimizeDeps(config, options.force, true);
	} catch (e) {
		createLogger(options.logLevel).error(import_picocolors.default.red(`error when optimizing deps:\n${e.stack}`), { error: e });
		process.exit(1);
	}
});
cli.command("preview [root]", "locally preview production build").option("--host [host]", `[string] specify hostname`, { type: [convertHost] }).option("--port <port>", `[number] specify port`).option("--strictPort", `[boolean] exit if specified port is already in use`).option("--open [path]", `[boolean | string] open browser on startup`).option("--outDir <dir>", `[string] output directory (default: dist)`).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { preview } = await import("./chunks/dep-SeJl6gzM.js");
	try {
		const server = await preview({
			root,
			base: options.base,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			mode: options.mode,
			build: { outDir: options.outDir },
			preview: {
				port: options.port,
				strictPort: options.strictPort,
				host: options.host,
				open: options.open
			}
		});
		server.printUrls();
		server.bindCLIShortcuts({ print: true });
	} catch (e) {
		createLogger(options.logLevel).error(import_picocolors.default.red(`error when starting preview server:\n${e.stack}`), { error: e });
		process.exit(1);
	} finally {
		stopProfiler((message) => createLogger(options.logLevel).info(message));
	}
});
cli.help();
cli.version(VERSION);
cli.parse();

//#endregion
export { stopProfiler };

import { c as createCLI } from './chunks/cac.Cb-PYCCB.js';
import '@vitest/utils';
import 'events';
import 'pathe';
import 'tinyrainbow';
import './chunks/constants.DnKduX2e.js';
import './chunks/index.VByaPkjc.js';
import 'node:perf_hooks';
import '@vitest/runner/utils';
import '@vitest/utils/source-map';
import './chunks/env.D4Lgay0q.js';
import 'std-env';
import './chunks/typechecker.DRKU1-1g.js';
import 'node:os';
import 'tinyexec';
import './path.js';
import 'node:path';
import 'node:url';
import 'vite';
import 'node:util';
import 'node:fs';
import 'node:fs/promises';
import 'node:console';
import 'node:stream';
import 'node:module';

createCLI().parse();


#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path')

var prog = path.resolve(process.argv[2])
var progArgs = process.argv.slice(3)

console.log('probing program', prog)

var nodeArgs = [
  '-r',
  path.join(__dirname, 'include.js')
]
var nodeOpts = { stdio: 'inherit' }
var child = spawn('node', nodeArgs.concat(prog).concat(progArgs), nodeOpts)

console.log('kill -SIGUSR1', child.pid, 'for logging')


/**
 * @fileoverview Main CLI object.
 * @author Nicholas C. Zakas
 */

"use strict";

/*
 * NOTE: The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("node:fs"),
	{ mkdir, stat, writeFile } = require("node:fs/promises"),
	path = require("node:path"),
	{ pathToFileURL } = require("node:url"),
	{ LegacyESLint } = require("./eslint"),
	{
		ESLint,
		shouldUseFlatConfig,
		locateConfigFileToUse,
	} = require("./eslint/eslint"),
	createCLIOptions = require("./options"),
	log = require("./shared/logging"),
	RuntimeInfo = require("./shared/runtime-info"),
	translateOptions = require("./shared/translate-cli-options");
const { getCacheFile } = require("./eslint/eslint-helpers");
const { SuppressionsService } = require("./services/suppressions-service");
const debug = require("debug")("eslint:cli");

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/** @typedef {import("./options").ParsedCLIOptions} ParsedCLIOptions */
/** @typedef {import("./types").ESLint.LintResult} LintResult */
/** @typedef {import("./types").ESLint.ResultsMeta} ResultsMeta */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Count error messages.
 * @param {LintResult[]} results The lint results.
 * @returns {{errorCount:number;fatalErrorCount:number,warningCount:number}} The number of error messages.
 */
function countErrors(results) {
	let errorCount = 0;
	let fatalErrorCount = 0;
	let warningCount = 0;

	for (const result of results) {
		errorCount += result.errorCount;
		fatalErrorCount += result.fatalErrorCount;
		warningCount += result.warningCount;
	}

	return { errorCount, fatalErrorCount, warningCount };
}

/**
 * Creates an options module from the provided CLI options and encodes it as a data URL.
 * @param {ParsedCLIOptions} options The CLI options.
 * @returns {URL} The URL of the options module.
 */
function createOptionsModule(options) {
	const translateOptionsFileURL = new URL(
		"./shared/translate-cli-options.js",
		pathToFileURL(__filename),
	).href;
	const optionsSrc =
		`import translateOptions from ${JSON.stringify(translateOptionsFileURL)};\n` +
		`export default await translateOptions(${JSON.stringify(options)}, "flat");\n`;

	// Base64 encoding is typically shorter than URL encoding
	return new URL(
		`data:text/javascript;base64,${Buffer.from(optionsSrc).toString("base64")}`,
	);
}

/**
 * Check if a given file path is a directory or not.
 * @param {string} filePath The path to a file to check.
 * @returns {Promise<boolean>} `true` if the given path is a directory.
 */
async function isDirectory(filePath) {
	try {
		return (await stat(filePath)).isDirectory();
	} catch (error) {
		if (error.code === "ENOENT" || error.code === "ENOTDIR") {
			return false;
		}
		throw error;
	}
}

/**
 * Outputs the results of the linting.
 * @param {ESLint} engine The ESLint instance to use.
 * @param {LintResult[]} results The results to print.
 * @param {string} format The name of the formatter to use or the path to the formatter.
 * @param {string} outputFile The path for the output file.
 * @param {ResultsMeta} resultsMeta Warning count and max threshold.
 * @returns {Promise<boolean>} True if the printing succeeds, false if not.
 * @private
 */
async function printResults(engine, results, format, outputFile, resultsMeta) {
	let formatter;

	try {
		formatter = await engine.loadFormatter(format);
	} catch (e) {
		log.error(e.message);
		return false;
	}

	const output = await formatter.format(results, resultsMeta);

	if (outputFile) {
		const filePath = path.resolve(process.cwd(), outputFile);

		if (await isDirectory(filePath)) {
			log.error(
				"Cannot write to output file path, it is a directory: %s",
				outputFile,
			);
			return false;
		}

		try {
			await mkdir(path.dirname(filePath), { recursive: true });
			await writeFile(filePath, output);
		} catch (ex) {
			log.error("There was a problem writing the output file:\n%s", ex);
			return false;
		}
	} else if (output) {
		log.info(output);
	}

	return true;
}

/**
 * Validates the `--concurrency` flag value.
 * @param {string} concurrency The `--concurrency` flag value to validate.
 * @returns {void}
 * @throws {Error} If the `--concurrency` flag value is invalid.
 */
function validateConcurrency(concurrency) {
	if (
		concurrency === void 0 ||
		concurrency === "auto" ||
		concurrency === "off"
	) {
		return;
	}

	const concurrencyValue = Number(concurrency);

	if (!Number.isInteger(concurrencyValue) || concurrencyValue < 1) {
		throw new Error(
			`Option concurrency: '${concurrency}' is not a positive integer, 'auto' or 'off'.`,
		);
	}
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
const cli = {
	/**
	 * Calculates the command string for the --inspect-config operation.
	 * @param {string} configFile The path to the config file to inspect.
	 * @returns {Promise<string>} The command string to execute.
	 */
	async calculateInspectConfigFlags(configFile) {
		// find the config file
		const { configFilePath, basePath } = await locateConfigFileToUse({
			cwd: process.cwd(),
			configFile,
		});

		return ["--config", configFilePath, "--basePath", basePath];
	},

	/**
	 * Executes the CLI based on an array of arguments that is passed in.
	 * @param {string|Array|Object} args The arguments to process.
	 * @param {string} [text] The text to lint (used for TTY).
	 * @param {boolean} [allowFlatConfig=true] Whether or not to allow flat config.
	 * @returns {Promise<number>} The exit code for the operation.
	 */
	async execute(args, text, allowFlatConfig = true) {
		if (Array.isArray(args)) {
			debug("CLI args: %o", args.slice(2));
		}

		/*
		 * Before doing anything, we need to see if we are using a
		 * flat config file. If so, then we need to change the way command
		 * line args are parsed. This is temporary, and when we fully
		 * switch to flat config we can remove this logic.
		 */

		const usingFlatConfig =
			allowFlatConfig && (await shouldUseFlatConfig());

		debug("Using flat config?", usingFlatConfig);

		if (allowFlatConfig && !usingFlatConfig) {
			const { WarningService } = require("./services/warning-service");
			new WarningService().emitESLintRCWarning();
		}

		const CLIOptions = createCLIOptions(usingFlatConfig);

		/** @type {ParsedCLIOptions} */
		let options;

		try {
			options = CLIOptions.parse(args);
			validateConcurrency(options.concurrency);
		} catch (error) {
			debug("Error parsing CLI options:", error.message);

			let errorMessage = error.message;

			if (usingFlatConfig) {
				errorMessage +=
					"\nYou're using eslint.config.js, some command line flags are no longer available. Please see https://eslint.org/docs/latest/use/command-line-interface for details.";
			}

			log.error(errorMessage);
			return 2;
		}

		const files = options._;
		const useStdin = typeof text === "string";

		if (options.help) {
			log.info(CLIOptions.generateHelp());
			return 0;
		}
		if (options.version) {
			log.info(RuntimeInfo.version());
			return 0;
		}
		if (options.envInfo) {
			try {
				log.info(RuntimeInfo.environment());
				return 0;
			} catch (err) {
				debug("Error retrieving environment info");
				log.error(err.message);
				return 2;
			}
		}

		if (options.printConfig) {
			if (files.length) {
				log.error(
					"The --print-config option must be used with exactly one file name.",
				);
				return 2;
			}
			if (useStdin) {
				log.error(
					"The --print-config option is not available for piped-in code.",
				);
				return 2;
			}

			const engine = usingFlatConfig
				? new ESLint(await translateOptions(options, "flat"))
				: new LegacyESLint(await translateOptions(options));
			const fileConfig = await engine.calculateConfigForFile(
				options.printConfig,
			);

			log.info(JSON.stringify(fileConfig, null, "  "));
			return 0;
		}

		if (options.inspectConfig) {
			log.info(
				"You can also run this command directly using 'npx @eslint/config-inspector@latest' in the same directory as your configuration file.",
			);

			try {
				const flatOptions = await translateOptions(options, "flat");
				const spawn = require("cross-spawn");
				const flags = await cli.calculateInspectConfigFlags(
					flatOptions.overrideConfigFile,
				);

				spawn.sync(
					"npx",
					["@eslint/config-inspector@latest", ...flags],
					{ encoding: "utf8", stdio: "inherit" },
				);
			} catch (error) {
				log.error(error);
				return 2;
			}

			return 0;
		}

		debug(`Running on ${useStdin ? "text" : "files"}`);

		if (options.fix && options.fixDryRun) {
			log.error(
				"The --fix option and the --fix-dry-run option cannot be used together.",
			);
			return 2;
		}
		if (useStdin && options.fix) {
			log.error(
				"The --fix option is not available for piped-in code; use --fix-dry-run instead.",
			);
			return 2;
		}
		if (options.fixType && !options.fix && !options.fixDryRun) {
			log.error(
				"The --fix-type option requires either --fix or --fix-dry-run.",
			);
			return 2;
		}

		if (
			options.reportUnusedDisableDirectives &&
			options.reportUnusedDisableDirectivesSeverity !== void 0
		) {
			log.error(
				"The --report-unused-disable-directives option and the --report-unused-disable-directives-severity option cannot be used together.",
			);
			return 2;
		}

		if (usingFlatConfig && options.ext) {
			// Passing `--ext ""` results in `options.ext` being an empty array.
			if (options.ext.length === 0) {
				log.error("The --ext option value cannot be empty.");
				return 2;
			}

			// Passing `--ext ,ts` results in an empty string at index 0. Passing `--ext ts,,tsx` results in an empty string at index 1.
			const emptyStringIndex = options.ext.indexOf("");

			if (emptyStringIndex >= 0) {
				log.error(
					`The --ext option arguments cannot be empty strings. Found an empty string at index ${emptyStringIndex}.`,
				);
				return 2;
			}
		}

		if (options.suppressAll && options.suppressRule) {
			log.error(
				"The --suppress-all option and the --suppress-rule option cannot be used together.",
			);
			return 2;
		}

		if (options.suppressAll && options.pruneSuppressions) {
			log.error(
				"The --suppress-all option and the --prune-suppressions option cannot be used together.",
			);
			return 2;
		}

		if (options.suppressRule && options.pruneSuppressions) {
			log.error(
				"The --suppress-rule option and the --prune-suppressions option cannot be used together.",
			);
			return 2;
		}

		if (
			useStdin &&
			(options.suppressAll ||
				options.suppressRule ||
				options.pruneSuppressions)
		) {
			log.error(
				"The --suppress-all, --suppress-rule, and --prune-suppressions options cannot be used with piped-in code.",
			);
			return 2;
		}

		const ActiveESLint = usingFlatConfig ? ESLint : LegacyESLint;

		/** @type {ESLint|LegacyESLint} */
		let engine;

		if (options.concurrency && options.concurrency !== "off") {
			const optionsURL = createOptionsModule(options);
			engine = await ESLint.fromOptionsModule(optionsURL);
		} else {
			const eslintOptions = await translateOptions(
				options,
				usingFlatConfig ? "flat" : "eslintrc",
			);
			engine = new ActiveESLint(eslintOptions);
		}
		let results;

		if (useStdin) {
			results = await engine.lintText(text, {
				filePath: options.stdinFilename,

				// flatConfig respects CLI flag and constructor warnIgnored, eslintrc forces true for backwards compatibility
				warnIgnored: usingFlatConfig ? void 0 : true,
			});
		} else {
			results = await engine.lintFiles(files);
		}

		if (options.fix) {
			debug("Fix mode enabled - applying fixes");
			await ActiveESLint.outputFixes(results);
		}

		let unusedSuppressions = {};

		if (!useStdin) {
			const suppressionsFileLocation = getCacheFile(
				options.suppressionsLocation || "eslint-suppressions.json",
				process.cwd(),
				{
					prefix: "suppressions_",
				},
			);

			if (
				options.suppressionsLocation &&
				!fs.existsSync(suppressionsFileLocation) &&
				!options.suppressAll &&
				!options.suppressRule
			) {
				log.error(
					"The suppressions file does not exist. Please run the command with `--suppress-all` or `--suppress-rule` to create it.",
				);
				return 2;
			}

			if (
				options.suppressAll ||
				options.suppressRule ||
				options.pruneSuppressions ||
				fs.existsSync(suppressionsFileLocation)
			) {
				const suppressions = new SuppressionsService({
					filePath: suppressionsFileLocation,
					cwd: process.cwd(),
				});

				if (options.suppressAll || options.suppressRule) {
					await suppressions.suppress(results, options.suppressRule);
				}

				if (options.pruneSuppressions) {
					await suppressions.prune(results);
				}

				const suppressionResults = suppressions.applySuppressions(
					results,
					await suppressions.load(),
				);

				results = suppressionResults.results;
				unusedSuppressions = suppressionResults.unused;
			}
		}

		let resultsToPrint = results;

		if (options.quiet) {
			debug("Quiet mode enabled - filtering out warnings");
			resultsToPrint = ActiveESLint.getErrorResults(resultsToPrint);
		}

		const resultCounts = countErrors(results);
		const tooManyWarnings =
			options.maxWarnings >= 0 &&
			resultCounts.warningCount > options.maxWarnings;
		const resultsMeta = tooManyWarnings
			? {
					maxWarningsExceeded: {
						maxWarnings: options.maxWarnings,
						foundWarnings: resultCounts.warningCount,
					},
				}
			: {};

		if (
			await printResults(
				engine,
				resultsToPrint,
				options.format,
				options.outputFile,
				resultsMeta,
			)
		) {
			// Errors and warnings from the original unfiltered results should determine the exit code
			const shouldExitForFatalErrors =
				options.exitOnFatalError && resultCounts.fatalErrorCount > 0;

			if (!resultCounts.errorCount && tooManyWarnings) {
				log.error(
					"ESLint found too many warnings (maximum: %s).",
					options.maxWarnings,
				);
			}

			if (!options.passOnUnprunedSuppressions) {
				const unusedSuppressionsCount =
					Object.keys(unusedSuppressions).length;

				if (unusedSuppressionsCount > 0) {
					log.error(
						"There are suppressions left that do not occur anymore. Consider re-running the command with `--prune-suppressions`.",
					);
					debug(JSON.stringify(unusedSuppressions, null, 2));

					return 2;
				}
			}

			if (shouldExitForFatalErrors) {
				return 2;
			}

			return resultCounts.errorCount || tooManyWarnings ? 1 : 0;
		}

		return 2;
	},
};

module.exports = cli;


import { __toESM } from "./chunks/dep-lCKrEJQm.js";
import { createLogger, require_picocolors } from "./chunks/dep-D5MCzjWT.js";
import { VERSION } from "./chunks/dep-CcFMbzqu.js";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { EventEmitter } from "events";

//#region ../../node_modules/.pnpm/cac@6.7.14/node_modules/cac/dist/index.mjs
function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}
function toVal(out, key, val, opts) {
	var x, old = out[key], nxt = !!~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : !!~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push((x = +val, x * 0 === 0) ? x : val), !!val) : (x = +val, x * 0 === 0) ? x : val;
	out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}
function mri2(args, opts) {
	args = args || [];
	opts = opts || {};
	var k, arr, arg, name, val, out = { _: [] };
	var i = 0, j = 0, idx = 0, len = args.length;
	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;
	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);
	if (alibi) for (k in opts.alias) {
		arr = opts.alias[k] = toArr(opts.alias[k]);
		for (i = 0; i < arr.length; i++) (opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
	}
	for (i = opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j = arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}
	for (i = opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j = arr.length; j-- > 0;) opts.string.push(arr[j]);
	}
	if (defaults) for (k in opts.default) {
		name = typeof opts.default[k];
		arr = opts.alias[k] = opts.alias[k] || [];
		if (opts[name] !== void 0) {
			opts[name].push(k);
			for (i = 0; i < arr.length; i++) opts[name].push(arr[i]);
		}
	}
	const keys = strict ? Object.keys(opts.alias) : [];
	for (i = 0; i < len; i++) {
		arg = args[i];
		if (arg === "--") {
			out._ = out._.concat(args.slice(++i));
			break;
		}
		for (j = 0; j < arg.length; j++) if (arg.charCodeAt(j) !== 45) break;
		if (j === 0) out._.push(arg);
		else if (arg.substring(j, j + 3) === "no-") {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) return opts.unknown(arg);
			out[name] = false;
		} else {
			for (idx = j + 1; idx < arg.length; idx++) if (arg.charCodeAt(idx) === 61) break;
			name = arg.substring(j, idx);
			val = arg.substring(++idx) || i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i];
			arr = j === 2 ? [name] : name;
			for (idx = 0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown("-".repeat(j) + name);
				toVal(out, name, idx + 1 < arr.length || val, opts);
			}
		}
	}
	if (defaults) {
		for (k in opts.default) if (out[k] === void 0) out[k] = opts.default[k];
	}
	if (alibi) for (k in out) {
		arr = opts.alias[k] || [];
		while (arr.length > 0) out[arr.shift()] = out[k];
	}
	return out;
}
const removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
const findAllBrackets = (v) => {
	const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
	const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
	const res = [];
	const parse = (match) => {
		let variadic = false;
		let value = match[1];
		if (value.startsWith("...")) {
			value = value.slice(3);
			variadic = true;
		}
		return {
			required: match[0].startsWith("<"),
			value,
			variadic
		};
	};
	let angledMatch;
	while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) res.push(parse(angledMatch));
	let squareMatch;
	while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) res.push(parse(squareMatch));
	return res;
};
const getMriOptions = (options) => {
	const result = {
		alias: {},
		boolean: []
	};
	for (const [index, option] of options.entries()) {
		if (option.names.length > 1) result.alias[option.names[0]] = option.names.slice(1);
		if (option.isBoolean) if (option.negated) {
			const hasStringTypeOption = options.some((o, i) => {
				return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
			});
			if (!hasStringTypeOption) result.boolean.push(option.names[0]);
		} else result.boolean.push(option.names[0]);
	}
	return result;
};
const findLongest = (arr) => {
	return arr.sort((a, b) => {
		return a.length > b.length ? -1 : 1;
	})[0];
};
const padRight = (str, length) => {
	return str.length >= length ? str : `${str}${" ".repeat(length - str.length)}`;
};
const camelcase = (input) => {
	return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
		return p1 + p2.toUpperCase();
	});
};
const setDotProp = (obj, keys, val) => {
	let i = 0;
	let length = keys.length;
	let t = obj;
	let x;
	for (; i < length; ++i) {
		x = t[keys[i]];
		t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
	}
};
const setByType = (obj, transforms) => {
	for (const key of Object.keys(transforms)) {
		const transform = transforms[key];
		if (transform.shouldTransform) {
			obj[key] = Array.prototype.concat.call([], obj[key]);
			if (typeof transform.transformFunction === "function") obj[key] = obj[key].map(transform.transformFunction);
		}
	}
};
const getFileName = (input) => {
	const m = /([^\\\/]+)$/.exec(input);
	return m ? m[1] : "";
};
const camelcaseOptionName = (name) => {
	return name.split(".").map((v, i) => {
		return i === 0 ? camelcase(v) : v;
	}).join(".");
};
var CACError = class extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
		if (typeof Error.captureStackTrace === "function") Error.captureStackTrace(this, this.constructor);
		else this.stack = new Error(message).stack;
	}
};
var Option = class {
	constructor(rawName, description, config) {
		this.rawName = rawName;
		this.description = description;
		this.config = Object.assign({}, config);
		rawName = rawName.replace(/\.\*/g, "");
		this.negated = false;
		this.names = removeBrackets(rawName).split(",").map((v) => {
			let name = v.trim().replace(/^-{1,2}/, "");
			if (name.startsWith("no-")) {
				this.negated = true;
				name = name.replace(/^no-/, "");
			}
			return camelcaseOptionName(name);
		}).sort((a, b) => a.length > b.length ? 1 : -1);
		this.name = this.names[this.names.length - 1];
		if (this.negated && this.config.default == null) this.config.default = true;
		if (rawName.includes("<")) this.required = true;
		else if (rawName.includes("[")) this.required = false;
		else this.isBoolean = true;
	}
};
const processArgs = process.argv;
const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;
var Command = class {
	constructor(rawName, description, config = {}, cli$1) {
		this.rawName = rawName;
		this.description = description;
		this.config = config;
		this.cli = cli$1;
		this.options = [];
		this.aliasNames = [];
		this.name = removeBrackets(rawName);
		this.args = findAllBrackets(rawName);
		this.examples = [];
	}
	usage(text) {
		this.usageText = text;
		return this;
	}
	allowUnknownOptions() {
		this.config.allowUnknownOptions = true;
		return this;
	}
	ignoreOptionDefaultValue() {
		this.config.ignoreOptionDefaultValue = true;
		return this;
	}
	version(version, customFlags = "-v, --version") {
		this.versionNumber = version;
		this.option(customFlags, "Display version number");
		return this;
	}
	example(example) {
		this.examples.push(example);
		return this;
	}
	option(rawName, description, config) {
		const option = new Option(rawName, description, config);
		this.options.push(option);
		return this;
	}
	alias(name) {
		this.aliasNames.push(name);
		return this;
	}
	action(callback) {
		this.commandAction = callback;
		return this;
	}
	isMatched(name) {
		return this.name === name || this.aliasNames.includes(name);
	}
	get isDefaultCommand() {
		return this.name === "" || this.aliasNames.includes("!");
	}
	get isGlobalCommand() {
		return this instanceof GlobalCommand;
	}
	hasOption(name) {
		name = name.split(".")[0];
		return this.options.find((option) => {
			return option.names.includes(name);
		});
	}
	outputHelp() {
		const { name, commands } = this.cli;
		const { versionNumber, options: globalOptions, helpCallback } = this.cli.globalCommand;
		let sections = [{ body: `${name}${versionNumber ? `/${versionNumber}` : ""}` }];
		sections.push({
			title: "Usage",
			body: `  $ ${name} ${this.usageText || this.rawName}`
		});
		const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
		if (showCommands) {
			const longestCommandName = findLongest(commands.map((command) => command.rawName));
			sections.push({
				title: "Commands",
				body: commands.map((command) => {
					return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
				}).join("\n")
			});
			sections.push({
				title: `For more info, run any command with the \`--help\` flag`,
				body: commands.map((command) => `  $ ${name}${command.name === "" ? "" : ` ${command.name}`} --help`).join("\n")
			});
		}
		let options = this.isGlobalCommand ? globalOptions : [...this.options, ...globalOptions || []];
		if (!this.isGlobalCommand && !this.isDefaultCommand) options = options.filter((option) => option.name !== "version");
		if (options.length > 0) {
			const longestOptionName = findLongest(options.map((option) => option.rawName));
			sections.push({
				title: "Options",
				body: options.map((option) => {
					return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
				}).join("\n")
			});
		}
		if (this.examples.length > 0) sections.push({
			title: "Examples",
			body: this.examples.map((example) => {
				if (typeof example === "function") return example(name);
				return example;
			}).join("\n")
		});
		if (helpCallback) sections = helpCallback(sections) || sections;
		console.log(sections.map((section) => {
			return section.title ? `${section.title}:
${section.body}` : section.body;
		}).join("\n\n"));
	}
	outputVersion() {
		const { name } = this.cli;
		const { versionNumber } = this.cli.globalCommand;
		if (versionNumber) console.log(`${name}/${versionNumber} ${platformInfo}`);
	}
	checkRequiredArgs() {
		const minimalArgsCount = this.args.filter((arg) => arg.required).length;
		if (this.cli.args.length < minimalArgsCount) throw new CACError(`missing required args for command \`${this.rawName}\``);
	}
	checkUnknownOptions() {
		const { options, globalCommand } = this.cli;
		if (!this.config.allowUnknownOptions) {
			for (const name of Object.keys(options)) if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
		}
	}
	checkOptionValue() {
		const { options: parsedOptions, globalCommand } = this.cli;
		const options = [...globalCommand.options, ...this.options];
		for (const option of options) {
			const value = parsedOptions[option.name.split(".")[0]];
			if (option.required) {
				const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
				if (value === true || value === false && !hasNegated) throw new CACError(`option \`${option.rawName}\` value is missing`);
			}
		}
	}
};
var GlobalCommand = class extends Command {
	constructor(cli$1) {
		super("@@global@@", "", {}, cli$1);
	}
};
var __assign = Object.assign;
var CAC = class extends EventEmitter {
	constructor(name = "") {
		super();
		this.name = name;
		this.commands = [];
		this.rawArgs = [];
		this.args = [];
		this.options = {};
		this.globalCommand = new GlobalCommand(this);
		this.globalCommand.usage("<command> [options]");
	}
	usage(text) {
		this.globalCommand.usage(text);
		return this;
	}
	command(rawName, description, config) {
		const command = new Command(rawName, description || "", config, this);
		command.globalCommand = this.globalCommand;
		this.commands.push(command);
		return command;
	}
	option(rawName, description, config) {
		this.globalCommand.option(rawName, description, config);
		return this;
	}
	help(callback) {
		this.globalCommand.option("-h, --help", "Display this message");
		this.globalCommand.helpCallback = callback;
		this.showHelpOnExit = true;
		return this;
	}
	version(version, customFlags = "-v, --version") {
		this.globalCommand.version(version, customFlags);
		this.showVersionOnExit = true;
		return this;
	}
	example(example) {
		this.globalCommand.example(example);
		return this;
	}
	outputHelp() {
		if (this.matchedCommand) this.matchedCommand.outputHelp();
		else this.globalCommand.outputHelp();
	}
	outputVersion() {
		this.globalCommand.outputVersion();
	}
	setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
		this.args = args;
		this.options = options;
		if (matchedCommand) this.matchedCommand = matchedCommand;
		if (matchedCommandName) this.matchedCommandName = matchedCommandName;
		return this;
	}
	unsetMatchedCommand() {
		this.matchedCommand = void 0;
		this.matchedCommandName = void 0;
	}
	parse(argv = processArgs, { run = true } = {}) {
		this.rawArgs = argv;
		if (!this.name) this.name = argv[1] ? getFileName(argv[1]) : "cli";
		let shouldParse = true;
		for (const command of this.commands) {
			const parsed = this.mri(argv.slice(2), command);
			const commandName = parsed.args[0];
			if (command.isMatched(commandName)) {
				shouldParse = false;
				const parsedInfo = __assign(__assign({}, parsed), { args: parsed.args.slice(1) });
				this.setParsedInfo(parsedInfo, command, commandName);
				this.emit(`command:${commandName}`, command);
			}
		}
		if (shouldParse) {
			for (const command of this.commands) if (command.name === "") {
				shouldParse = false;
				const parsed = this.mri(argv.slice(2), command);
				this.setParsedInfo(parsed, command);
				this.emit(`command:!`, command);
			}
		}
		if (shouldParse) {
			const parsed = this.mri(argv.slice(2));
			this.setParsedInfo(parsed);
		}
		if (this.options.help && this.showHelpOnExit) {
			this.outputHelp();
			run = false;
			this.unsetMatchedCommand();
		}
		if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
			this.outputVersion();
			run = false;
			this.unsetMatchedCommand();
		}
		const parsedArgv = {
			args: this.args,
			options: this.options
		};
		if (run) this.runMatchedCommand();
		if (!this.matchedCommand && this.args[0]) this.emit("command:*");
		return parsedArgv;
	}
	mri(argv, command) {
		const cliOptions = [...this.globalCommand.options, ...command ? command.options : []];
		const mriOptions = getMriOptions(cliOptions);
		let argsAfterDoubleDashes = [];
		const doubleDashesIndex = argv.indexOf("--");
		if (doubleDashesIndex > -1) {
			argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
			argv = argv.slice(0, doubleDashesIndex);
		}
		let parsed = mri2(argv, mriOptions);
		parsed = Object.keys(parsed).reduce((res, name) => {
			return __assign(__assign({}, res), { [camelcaseOptionName(name)]: parsed[name] });
		}, { _: [] });
		const args = parsed._;
		const options = { "--": argsAfterDoubleDashes };
		const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
		let transforms = Object.create(null);
		for (const cliOption of cliOptions) {
			if (!ignoreDefault && cliOption.config.default !== void 0) for (const name of cliOption.names) options[name] = cliOption.config.default;
			if (Array.isArray(cliOption.config.type)) {
				if (transforms[cliOption.name] === void 0) {
					transforms[cliOption.name] = Object.create(null);
					transforms[cliOption.name]["shouldTransform"] = true;
					transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
				}
			}
		}
		for (const key of Object.keys(parsed)) if (key !== "_") {
			const keys = key.split(".");
			setDotProp(options, keys, parsed[key]);
			setByType(options, transforms);
		}
		return {
			args,
			options
		};
	}
	runMatchedCommand() {
		const { args, options, matchedCommand: command } = this;
		if (!command || !command.commandAction) return;
		command.checkUnknownOptions();
		command.checkOptionValue();
		command.checkRequiredArgs();
		const actionArgs = [];
		command.args.forEach((arg, index) => {
			if (arg.variadic) actionArgs.push(args.slice(index));
			else actionArgs.push(args[index]);
		});
		actionArgs.push(options);
		return command.commandAction.apply(this, actionArgs);
	}
};
const cac = (name = "") => new CAC(name);

//#endregion
//#region src/node/cli.ts
var import_picocolors = /* @__PURE__ */ __toESM(require_picocolors(), 1);
function checkNodeVersion(nodeVersion) {
	const currentVersion = nodeVersion.split(".");
	const major = parseInt(currentVersion[0], 10);
	const minor = parseInt(currentVersion[1], 10);
	const isSupported = major === 20 && minor >= 19 || major === 22 && minor >= 12 || major > 22;
	return isSupported;
}
if (!checkNodeVersion(process.versions.node)) console.warn(import_picocolors.default.yellow(`You are using Node.js ${process.versions.node}. Vite requires Node.js version 20.19+ or 22.12+. Please upgrade your Node.js version.`));
const cli = cac("vite");
let profileSession = global.__vite_profile_session;
let profileCount = 0;
const stopProfiler = (log) => {
	if (!profileSession) return;
	return new Promise((res, rej) => {
		profileSession.post("Profiler.stop", (err, { profile }) => {
			if (!err) {
				const outPath = path.resolve(`./vite-profile-${profileCount++}.cpuprofile`);
				fs.writeFileSync(outPath, JSON.stringify(profile));
				log(import_picocolors.default.yellow(`CPU profile written to ${import_picocolors.default.white(import_picocolors.default.dim(outPath))}`));
				profileSession = void 0;
				res();
			} else rej(err);
		});
	});
};
const filterDuplicateOptions = (options) => {
	for (const [key, value] of Object.entries(options)) if (Array.isArray(value)) options[key] = value[value.length - 1];
};
/**
* removing global flags before passing as command specific sub-configs
*/
function cleanGlobalCLIOptions(options) {
	const ret = { ...options };
	delete ret["--"];
	delete ret.c;
	delete ret.config;
	delete ret.base;
	delete ret.l;
	delete ret.logLevel;
	delete ret.clearScreen;
	delete ret.configLoader;
	delete ret.d;
	delete ret.debug;
	delete ret.f;
	delete ret.filter;
	delete ret.m;
	delete ret.mode;
	delete ret.force;
	delete ret.w;
	if ("sourcemap" in ret) {
		const sourcemap = ret.sourcemap;
		ret.sourcemap = sourcemap === "true" ? true : sourcemap === "false" ? false : ret.sourcemap;
	}
	if ("watch" in ret) {
		const watch = ret.watch;
		ret.watch = watch ? {} : void 0;
	}
	return ret;
}
/**
* removing builder flags before passing as command specific sub-configs
*/
function cleanBuilderCLIOptions(options) {
	const ret = { ...options };
	delete ret.app;
	return ret;
}
/**
* host may be a number (like 0), should convert to string
*/
const convertHost = (v) => {
	if (typeof v === "number") return String(v);
	return v;
};
/**
* base may be a number (like 0), should convert to empty string
*/
const convertBase = (v) => {
	if (v === 0) return "";
	return v;
};
cli.option("-c, --config <file>", `[string] use specified config file`).option("--base <path>", `[string] public base path (default: /)`, { type: [convertBase] }).option("-l, --logLevel <level>", `[string] info | warn | error | silent`).option("--clearScreen", `[boolean] allow/disable clear screen when logging`).option("--configLoader <loader>", `[string] use 'bundle' to bundle the config with esbuild, or 'runner' (experimental) to process it on the fly, or 'native' (experimental) to load using the native runtime (default: bundle)`).option("-d, --debug [feat]", `[string | boolean] show debug logs`).option("-f, --filter <filter>", `[string] filter debug logs`).option("-m, --mode <mode>", `[string] set env mode`);
cli.command("[root]", "start dev server").alias("serve").alias("dev").option("--host [host]", `[string] specify hostname`, { type: [convertHost] }).option("--port <port>", `[number] specify port`).option("--open [path]", `[boolean | string] open browser on startup`).option("--cors", `[boolean] enable CORS`).option("--strictPort", `[boolean] exit if specified port is already in use`).option("--force", `[boolean] force the optimizer to ignore the cache and re-bundle`).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { createServer } = await import("./chunks/dep-CPnzVSwg.js");
	try {
		const server = await createServer({
			root,
			base: options.base,
			mode: options.mode,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			clearScreen: options.clearScreen,
			server: cleanGlobalCLIOptions(options),
			forceOptimizeDeps: options.force
		});
		if (!server.httpServer) throw new Error("HTTP server not available");
		await server.listen();
		const info = server.config.logger.info;
		const modeString = options.mode && options.mode !== "development" ? `  ${import_picocolors.default.bgGreen(` ${import_picocolors.default.bold(options.mode)} `)}` : "";
		const viteStartTime = global.__vite_start_time ?? false;
		const startupDurationString = viteStartTime ? import_picocolors.default.dim(`ready in ${import_picocolors.default.reset(import_picocolors.default.bold(Math.ceil(performance.now() - viteStartTime)))} ms`) : "";
		const hasExistingLogs = process.stdout.bytesWritten > 0 || process.stderr.bytesWritten > 0;
		info(`\n  ${import_picocolors.default.green(`${import_picocolors.default.bold("VITE")} v${VERSION}`)}${modeString}  ${startupDurationString}\n`, { clear: !hasExistingLogs });
		server.printUrls();
		const customShortcuts = [];
		if (profileSession) customShortcuts.push({
			key: "p",
			description: "start/stop the profiler",
			async action(server$1) {
				if (profileSession) await stopProfiler(server$1.config.logger.info);
				else {
					const inspector = await import("node:inspector").then((r) => r.default);
					await new Promise((res) => {
						profileSession = new inspector.Session();
						profileSession.connect();
						profileSession.post("Profiler.enable", () => {
							profileSession.post("Profiler.start", () => {
								server$1.config.logger.info("Profiler started");
								res();
							});
						});
					});
				}
			}
		});
		server.bindCLIShortcuts({
			print: true,
			customShortcuts
		});
	} catch (e) {
		const logger = createLogger(options.logLevel);
		logger.error(import_picocolors.default.red(`error when starting dev server:\n${e.stack}`), { error: e });
		stopProfiler(logger.info);
		process.exit(1);
	}
});
cli.command("build [root]", "build for production").option("--target <target>", `[string] transpile target (default: 'baseline-widely-available')`).option("--outDir <dir>", `[string] output directory (default: dist)`).option("--assetsDir <dir>", `[string] directory under outDir to place assets in (default: assets)`).option("--assetsInlineLimit <number>", `[number] static asset base64 inline threshold in bytes (default: 4096)`).option("--ssr [entry]", `[string] build specified entry for server-side rendering`).option("--sourcemap [output]", `[boolean | "inline" | "hidden"] output source maps for build (default: false)`).option("--minify [minifier]", "[boolean | \"terser\" | \"esbuild\"] enable/disable minification, or specify minifier to use (default: esbuild)").option("--manifest [name]", `[boolean | string] emit build manifest json`).option("--ssrManifest [name]", `[boolean | string] emit ssr manifest json`).option("--emptyOutDir", `[boolean] force empty outDir when it's outside of root`).option("-w, --watch", `[boolean] rebuilds when modules have changed on disk`).option("--app", `[boolean] same as \`builder: {}\``).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { createBuilder } = await import("./chunks/dep-TDFDwW_9.js");
	const buildOptions = cleanGlobalCLIOptions(cleanBuilderCLIOptions(options));
	try {
		const inlineConfig = {
			root,
			base: options.base,
			mode: options.mode,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			clearScreen: options.clearScreen,
			build: buildOptions,
			...options.app ? { builder: {} } : {}
		};
		const builder = await createBuilder(inlineConfig, null);
		await builder.buildApp();
	} catch (e) {
		createLogger(options.logLevel).error(import_picocolors.default.red(`error during build:\n${e.stack}`), { error: e });
		process.exit(1);
	} finally {
		stopProfiler((message) => createLogger(options.logLevel).info(message));
	}
});
cli.command("optimize [root]", "pre-bundle dependencies (deprecated, the pre-bundle process runs automatically and does not need to be called)").option("--force", `[boolean] force the optimizer to ignore the cache and re-bundle`).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { resolveConfig } = await import("./chunks/dep-6-jTB_1O.js");
	const { optimizeDeps } = await import("./chunks/dep-03SfmTdk.js");
	try {
		const config = await resolveConfig({
			root,
			base: options.base,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			mode: options.mode
		}, "serve");
		await optimizeDeps(config, options.force, true);
	} catch (e) {
		createLogger(options.logLevel).error(import_picocolors.default.red(`error when optimizing deps:\n${e.stack}`), { error: e });
		process.exit(1);
	}
});
cli.command("preview [root]", "locally preview production build").option("--host [host]", `[string] specify hostname`, { type: [convertHost] }).option("--port <port>", `[number] specify port`).option("--strictPort", `[boolean] exit if specified port is already in use`).option("--open [path]", `[boolean | string] open browser on startup`).option("--outDir <dir>", `[string] output directory (default: dist)`).action(async (root, options) => {
	filterDuplicateOptions(options);
	const { preview } = await import("./chunks/dep-SeJl6gzM.js");
	try {
		const server = await preview({
			root,
			base: options.base,
			configFile: options.config,
			configLoader: options.configLoader,
			logLevel: options.logLevel,
			mode: options.mode,
			build: { outDir: options.outDir },
			preview: {
				port: options.port,
				strictPort: options.strictPort,
				host: options.host,
				open: options.open
			}
		});
		server.printUrls();
		server.bindCLIShortcuts({ print: true });
	} catch (e) {
		createLogger(options.logLevel).error(import_picocolors.default.red(`error when starting preview server:\n${e.stack}`), { error: e });
		process.exit(1);
	} finally {
		stopProfiler((message) => createLogger(options.logLevel).info(message));
	}
});
cli.help();
cli.version(VERSION);
cli.parse();

//#endregion
export { stopProfiler };

import { c as createCLI } from './chunks/cac.Cb-PYCCB.js';
import '@vitest/utils';
import 'events';
import 'pathe';
import 'tinyrainbow';
import './chunks/constants.DnKduX2e.js';
import './chunks/index.VByaPkjc.js';
import 'node:perf_hooks';
import '@vitest/runner/utils';
import '@vitest/utils/source-map';
import './chunks/env.D4Lgay0q.js';
import 'std-env';
import './chunks/typechecker.DRKU1-1g.js';
import 'node:os';
import 'tinyexec';
import './path.js';
import 'node:path';
import 'node:url';
import 'vite';
import 'node:util';
import 'node:fs';
import 'node:fs/promises';
import 'node:console';
import 'node:stream';
import 'node:module';

createCLI().parse();



#!/usr/bin/env node

var spawn = require('child_process').spawn
var path = require('path')

var prog = path.resolve(process.argv[2])
var progArgs = process.argv.slice(3)

console.log('probing program', prog)

var nodeArgs = [
  '-r',
  path.join(__dirname, 'include.js')
]
var nodeOpts = { stdio: 'inherit' }
var child = spawn('node', nodeArgs.concat(prog).concat(progArgs), nodeOpts)

console.log('kill -SIGUSR1', child.pid, 'for logging')
