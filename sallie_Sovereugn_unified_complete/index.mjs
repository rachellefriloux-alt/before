import { EventEmitter } from 'events';

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

function mri2 (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	for (i=opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j=arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}

	for (i=opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j=arr.length; j-- > 0;) opts.string.push(arr[j]);
	}

	if (defaults) {
		for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i=0; i < arr.length; i++) {
					opts[name].push(arr[i]);
				}
			}
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
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
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }
  return res;
};
const getMriOptions = (options) => {
  const result = {alias: {}, boolean: []};
  for (const [index, option] of options.entries()) {
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      if (option.negated) {
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
        });
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
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
      if (typeof transform.transformFunction === "function") {
        obj[key] = obj[key].map(transform.transformFunction);
      }
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
class CACError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class Option {
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
    if (this.negated && this.config.default == null) {
      this.config.default = true;
    }
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
}

const processArgs = process.argv;
const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;

class Command {
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
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
    const {name, commands} = this.cli;
    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand;
    let sections = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
      }
    ];
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
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(options.map((option) => option.rawName));
      sections.push({
        title: "Options",
        body: options.map((option) => {
          return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
        }).join("\n")
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join("\n")
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    console.log(sections.map((section) => {
      return section.title ? `${section.title}:
${section.body}` : section.body;
    }).join("\n\n"));
  }
  outputVersion() {
    const {name} = this.cli;
    const {versionNumber} = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const {options, globalCommand} = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const {options: parsedOptions, globalCommand} = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      if (option.required) {
        const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
        if (value === true || value === false && !hasNegated) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}
class GlobalCommand extends Command {
  constructor(cli) {
    super("@@global@@", "", {}, cli);
  }
}

var __assign = Object.assign;
class CAC extends EventEmitter {
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
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({args, options}, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = void 0;
    this.matchedCommandName = void 0;
  }
  parse(argv = processArgs, {
    run = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        const parsedInfo = __assign(__assign({}, parsed), {
          args: parsed.args.slice(1)
        });
        this.setParsedInfo(parsedInfo, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
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
    const parsedArgv = {args: this.args, options: this.options};
    if (run) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0]) {
      this.emit("command:*");
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri2(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return __assign(__assign({}, res), {
        [camelcaseOptionName(name)]: parsed[name]
      });
    }, {_: []});
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    let transforms = Object.create(null);
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === void 0) {
          transforms[cliOption.name] = Object.create(null);
          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const {args, options, matchedCommand: command} = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
}

const cac = (name = "") => new CAC(name);

export default cac;
export { CAC, Command, cac };


import { createRequire } from "module";
import { basename, dirname, normalize, relative, resolve, sep } from "path";
import * as nativeFs from "fs";

//#region rolldown:runtime
var __require = /* @__PURE__ */ createRequire(import.meta.url);

//#endregion
//#region src/utils.ts
function cleanPath(path) {
	let normalized = normalize(path);
	if (normalized.length > 1 && normalized[normalized.length - 1] === sep) normalized = normalized.substring(0, normalized.length - 1);
	return normalized;
}
const SLASHES_REGEX = /[\\/]/g;
function convertSlashes(path, separator) {
	return path.replace(SLASHES_REGEX, separator);
}
const WINDOWS_ROOT_DIR_REGEX = /^[a-z]:[\\/]$/i;
function isRootDirectory(path) {
	return path === "/" || WINDOWS_ROOT_DIR_REGEX.test(path);
}
function normalizePath(path, options) {
	const { resolvePaths, normalizePath: normalizePath$1, pathSeparator } = options;
	const pathNeedsCleaning = process.platform === "win32" && path.includes("/") || path.startsWith(".");
	if (resolvePaths) path = resolve(path);
	if (normalizePath$1 || pathNeedsCleaning) path = cleanPath(path);
	if (path === ".") return "";
	const needsSeperator = path[path.length - 1] !== pathSeparator;
	return convertSlashes(needsSeperator ? path + pathSeparator : path, pathSeparator);
}

//#endregion
//#region src/api/functions/join-path.ts
function joinPathWithBasePath(filename, directoryPath) {
	return directoryPath + filename;
}
function joinPathWithRelativePath(root, options) {
	return function(filename, directoryPath) {
		const sameRoot = directoryPath.startsWith(root);
		if (sameRoot) return directoryPath.slice(root.length) + filename;
		else return convertSlashes(relative(root, directoryPath), options.pathSeparator) + options.pathSeparator + filename;
	};
}
function joinPath(filename) {
	return filename;
}
function joinDirectoryPath(filename, directoryPath, separator) {
	return directoryPath + filename + separator;
}
function build$7(root, options) {
	const { relativePaths, includeBasePath } = options;
	return relativePaths && root ? joinPathWithRelativePath(root, options) : includeBasePath ? joinPathWithBasePath : joinPath;
}

//#endregion
//#region src/api/functions/push-directory.ts
function pushDirectoryWithRelativePath(root) {
	return function(directoryPath, paths) {
		paths.push(directoryPath.substring(root.length) || ".");
	};
}
function pushDirectoryFilterWithRelativePath(root) {
	return function(directoryPath, paths, filters) {
		const relativePath = directoryPath.substring(root.length) || ".";
		if (filters.every((filter) => filter(relativePath, true))) paths.push(relativePath);
	};
}
const pushDirectory = (directoryPath, paths) => {
	paths.push(directoryPath || ".");
};
const pushDirectoryFilter = (directoryPath, paths, filters) => {
	const path = directoryPath || ".";
	if (filters.every((filter) => filter(path, true))) paths.push(path);
};
const empty$2 = () => {};
function build$6(root, options) {
	const { includeDirs, filters, relativePaths } = options;
	if (!includeDirs) return empty$2;
	if (relativePaths) return filters && filters.length ? pushDirectoryFilterWithRelativePath(root) : pushDirectoryWithRelativePath(root);
	return filters && filters.length ? pushDirectoryFilter : pushDirectory;
}

//#endregion
//#region src/api/functions/push-file.ts
const pushFileFilterAndCount = (filename, _paths, counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) counts.files++;
};
const pushFileFilter = (filename, paths, _counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) paths.push(filename);
};
const pushFileCount = (_filename, _paths, counts, _filters) => {
	counts.files++;
};
const pushFile = (filename, paths) => {
	paths.push(filename);
};
const empty$1 = () => {};
function build$5(options) {
	const { excludeFiles, filters, onlyCounts } = options;
	if (excludeFiles) return empty$1;
	if (filters && filters.length) return onlyCounts ? pushFileFilterAndCount : pushFileFilter;
	else if (onlyCounts) return pushFileCount;
	else return pushFile;
}

//#endregion
//#region src/api/functions/get-array.ts
const getArray = (paths) => {
	return paths;
};
const getArrayGroup = () => {
	return [""].slice(0, 0);
};
function build$4(options) {
	return options.group ? getArrayGroup : getArray;
}

//#endregion
//#region src/api/functions/group-files.ts
const groupFiles = (groups, directory, files) => {
	groups.push({
		directory,
		files,
		dir: directory
	});
};
const empty = () => {};
function build$3(options) {
	return options.group ? groupFiles : empty;
}

//#endregion
//#region src/api/functions/resolve-symlink.ts
const resolveSymlinksAsync = function(path, state, callback$1) {
	const { queue, fs, options: { suppressErrors } } = state;
	queue.enqueue();
	fs.realpath(path, (error, resolvedPath) => {
		if (error) return queue.dequeue(suppressErrors ? null : error, state);
		fs.stat(resolvedPath, (error$1, stat) => {
			if (error$1) return queue.dequeue(suppressErrors ? null : error$1, state);
			if (stat.isDirectory() && isRecursive(path, resolvedPath, state)) return queue.dequeue(null, state);
			callback$1(stat, resolvedPath);
			queue.dequeue(null, state);
		});
	});
};
const resolveSymlinks = function(path, state, callback$1) {
	const { queue, fs, options: { suppressErrors } } = state;
	queue.enqueue();
	try {
		const resolvedPath = fs.realpathSync(path);
		const stat = fs.statSync(resolvedPath);
		if (stat.isDirectory() && isRecursive(path, resolvedPath, state)) return;
		callback$1(stat, resolvedPath);
	} catch (e) {
		if (!suppressErrors) throw e;
	}
};
function build$2(options, isSynchronous) {
	if (!options.resolveSymlinks || options.excludeSymlinks) return null;
	return isSynchronous ? resolveSymlinks : resolveSymlinksAsync;
}
function isRecursive(path, resolved, state) {
	if (state.options.useRealPaths) return isRecursiveUsingRealPaths(resolved, state);
	let parent = dirname(path);
	let depth = 1;
	while (parent !== state.root && depth < 2) {
		const resolvedPath = state.symlinks.get(parent);
		const isSameRoot = !!resolvedPath && (resolvedPath === resolved || resolvedPath.startsWith(resolved) || resolved.startsWith(resolvedPath));
		if (isSameRoot) depth++;
		else parent = dirname(parent);
	}
	state.symlinks.set(path, resolved);
	return depth > 1;
}
function isRecursiveUsingRealPaths(resolved, state) {
	return state.visited.includes(resolved + state.options.pathSeparator);
}

//#endregion
//#region src/api/functions/invoke-callback.ts
const onlyCountsSync = (state) => {
	return state.counts;
};
const groupsSync = (state) => {
	return state.groups;
};
const defaultSync = (state) => {
	return state.paths;
};
const limitFilesSync = (state) => {
	return state.paths.slice(0, state.options.maxFiles);
};
const onlyCountsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.counts, state.options.suppressErrors);
	return null;
};
const defaultAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths, state.options.suppressErrors);
	return null;
};
const limitFilesAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths.slice(0, state.options.maxFiles), state.options.suppressErrors);
	return null;
};
const groupsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.groups, state.options.suppressErrors);
	return null;
};
function report(error, callback$1, output, suppressErrors) {
	if (error && !suppressErrors) callback$1(error, output);
	else callback$1(null, output);
}
function build$1(options, isSynchronous) {
	const { onlyCounts, group, maxFiles } = options;
	if (onlyCounts) return isSynchronous ? onlyCountsSync : onlyCountsAsync;
	else if (group) return isSynchronous ? groupsSync : groupsAsync;
	else if (maxFiles) return isSynchronous ? limitFilesSync : limitFilesAsync;
	else return isSynchronous ? defaultSync : defaultAsync;
}

//#endregion
//#region src/api/functions/walk-directory.ts
const readdirOpts = { withFileTypes: true };
const walkAsync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	state.queue.enqueue();
	if (currentDepth < 0) return state.queue.dequeue(null, state);
	const { fs } = state;
	state.visited.push(crawlPath);
	state.counts.directories++;
	fs.readdir(crawlPath || ".", readdirOpts, (error, entries = []) => {
		callback$1(entries, directoryPath, currentDepth);
		state.queue.dequeue(state.options.suppressErrors ? null : error, state);
	});
};
const walkSync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	const { fs } = state;
	if (currentDepth < 0) return;
	state.visited.push(crawlPath);
	state.counts.directories++;
	let entries = [];
	try {
		entries = fs.readdirSync(crawlPath || ".", readdirOpts);
	} catch (e) {
		if (!state.options.suppressErrors) throw e;
	}
	callback$1(entries, directoryPath, currentDepth);
};
function build(isSynchronous) {
	return isSynchronous ? walkSync : walkAsync;
}

//#endregion
//#region src/api/queue.ts
/**
* This is a custom stateless queue to track concurrent async fs calls.
* It increments a counter whenever a call is queued and decrements it
* as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
*/
var Queue = class {
	count = 0;
	constructor(onQueueEmpty) {
		this.onQueueEmpty = onQueueEmpty;
	}
	enqueue() {
		this.count++;
		return this.count;
	}
	dequeue(error, output) {
		if (this.onQueueEmpty && (--this.count <= 0 || error)) {
			this.onQueueEmpty(error, output);
			if (error) {
				output.controller.abort();
				this.onQueueEmpty = void 0;
			}
		}
	}
};

//#endregion
//#region src/api/counter.ts
var Counter = class {
	_files = 0;
	_directories = 0;
	set files(num) {
		this._files = num;
	}
	get files() {
		return this._files;
	}
	set directories(num) {
		this._directories = num;
	}
	get directories() {
		return this._directories;
	}
	/**
	* @deprecated use `directories` instead
	*/
	/* c8 ignore next 3 */
	get dirs() {
		return this._directories;
	}
};

//#endregion
//#region src/api/aborter.ts
/**
* AbortController is not supported on Node 14 so we use this until we can drop
* support for Node 14.
*/
var Aborter = class {
	aborted = false;
	abort() {
		this.aborted = true;
	}
};

//#endregion
//#region src/api/walker.ts
var Walker = class {
	root;
	isSynchronous;
	state;
	joinPath;
	pushDirectory;
	pushFile;
	getArray;
	groupFiles;
	resolveSymlink;
	walkDirectory;
	callbackInvoker;
	constructor(root, options, callback$1) {
		this.isSynchronous = !callback$1;
		this.callbackInvoker = build$1(options, this.isSynchronous);
		this.root = normalizePath(root, options);
		this.state = {
			root: isRootDirectory(this.root) ? this.root : this.root.slice(0, -1),
			paths: [""].slice(0, 0),
			groups: [],
			counts: new Counter(),
			options,
			queue: new Queue((error, state) => this.callbackInvoker(state, error, callback$1)),
			symlinks: /* @__PURE__ */ new Map(),
			visited: [""].slice(0, 0),
			controller: new Aborter(),
			fs: options.fs || nativeFs
		};
		this.joinPath = build$7(this.root, options);
		this.pushDirectory = build$6(this.root, options);
		this.pushFile = build$5(options);
		this.getArray = build$4(options);
		this.groupFiles = build$3(options);
		this.resolveSymlink = build$2(options, this.isSynchronous);
		this.walkDirectory = build(this.isSynchronous);
	}
	start() {
		this.pushDirectory(this.root, this.state.paths, this.state.options.filters);
		this.walkDirectory(this.state, this.root, this.root, this.state.options.maxDepth, this.walk);
		return this.isSynchronous ? this.callbackInvoker(this.state, null) : null;
	}
	walk = (entries, directoryPath, depth) => {
		const { paths, options: { filters, resolveSymlinks: resolveSymlinks$1, excludeSymlinks, exclude, maxFiles, signal, useRealPaths, pathSeparator }, controller } = this.state;
		if (controller.aborted || signal && signal.aborted || maxFiles && paths.length > maxFiles) return;
		const files = this.getArray(this.state.paths);
		for (let i = 0; i < entries.length; ++i) {
			const entry = entries[i];
			if (entry.isFile() || entry.isSymbolicLink() && !resolveSymlinks$1 && !excludeSymlinks) {
				const filename = this.joinPath(entry.name, directoryPath);
				this.pushFile(filename, files, this.state.counts, filters);
			} else if (entry.isDirectory()) {
				let path = joinDirectoryPath(entry.name, directoryPath, this.state.options.pathSeparator);
				if (exclude && exclude(entry.name, path)) continue;
				this.pushDirectory(path, paths, filters);
				this.walkDirectory(this.state, path, path, depth - 1, this.walk);
			} else if (this.resolveSymlink && entry.isSymbolicLink()) {
				let path = joinPathWithBasePath(entry.name, directoryPath);
				this.resolveSymlink(path, this.state, (stat, resolvedPath) => {
					if (stat.isDirectory()) {
						resolvedPath = normalizePath(resolvedPath, this.state.options);
						if (exclude && exclude(entry.name, useRealPaths ? resolvedPath : path + pathSeparator)) return;
						this.walkDirectory(this.state, resolvedPath, useRealPaths ? resolvedPath : path + pathSeparator, depth - 1, this.walk);
					} else {
						resolvedPath = useRealPaths ? resolvedPath : path;
						const filename = basename(resolvedPath);
						const directoryPath$1 = normalizePath(dirname(resolvedPath), this.state.options);
						resolvedPath = this.joinPath(filename, directoryPath$1);
						this.pushFile(resolvedPath, files, this.state.counts, filters);
					}
				});
			}
		}
		this.groupFiles(this.state.groups, directoryPath, files);
	};
};

//#endregion
//#region src/api/async.ts
function promise(root, options) {
	return new Promise((resolve$1, reject) => {
		callback(root, options, (err, output) => {
			if (err) return reject(err);
			resolve$1(output);
		});
	});
}
function callback(root, options, callback$1) {
	let walker = new Walker(root, options, callback$1);
	walker.start();
}

//#endregion
//#region src/api/sync.ts
function sync(root, options) {
	const walker = new Walker(root, options);
	return walker.start();
}

//#endregion
//#region src/builder/api-builder.ts
var APIBuilder = class {
	constructor(root, options) {
		this.root = root;
		this.options = options;
	}
	withPromise() {
		return promise(this.root, this.options);
	}
	withCallback(cb) {
		callback(this.root, this.options, cb);
	}
	sync() {
		return sync(this.root, this.options);
	}
};

//#endregion
//#region src/builder/index.ts
let pm = null;
/* c8 ignore next 6 */
try {
	__require.resolve("picomatch");
	pm = __require("picomatch");
} catch {}
var Builder = class {
	globCache = {};
	options = {
		maxDepth: Infinity,
		suppressErrors: true,
		pathSeparator: sep,
		filters: []
	};
	globFunction;
	constructor(options) {
		this.options = {
			...this.options,
			...options
		};
		this.globFunction = this.options.globFunction;
	}
	group() {
		this.options.group = true;
		return this;
	}
	withPathSeparator(separator) {
		this.options.pathSeparator = separator;
		return this;
	}
	withBasePath() {
		this.options.includeBasePath = true;
		return this;
	}
	withRelativePaths() {
		this.options.relativePaths = true;
		return this;
	}
	withDirs() {
		this.options.includeDirs = true;
		return this;
	}
	withMaxDepth(depth) {
		this.options.maxDepth = depth;
		return this;
	}
	withMaxFiles(limit) {
		this.options.maxFiles = limit;
		return this;
	}
	withFullPaths() {
		this.options.resolvePaths = true;
		this.options.includeBasePath = true;
		return this;
	}
	withErrors() {
		this.options.suppressErrors = false;
		return this;
	}
	withSymlinks({ resolvePaths = true } = {}) {
		this.options.resolveSymlinks = true;
		this.options.useRealPaths = resolvePaths;
		return this.withFullPaths();
	}
	withAbortSignal(signal) {
		this.options.signal = signal;
		return this;
	}
	normalize() {
		this.options.normalizePath = true;
		return this;
	}
	filter(predicate) {
		this.options.filters.push(predicate);
		return this;
	}
	onlyDirs() {
		this.options.excludeFiles = true;
		this.options.includeDirs = true;
		return this;
	}
	exclude(predicate) {
		this.options.exclude = predicate;
		return this;
	}
	onlyCounts() {
		this.options.onlyCounts = true;
		return this;
	}
	crawl(root) {
		return new APIBuilder(root || ".", this.options);
	}
	withGlobFunction(fn) {
		this.globFunction = fn;
		return this;
	}
	/**
	* @deprecated Pass options using the constructor instead:
	* ```ts
	* new fdir(options).crawl("/path/to/root");
	* ```
	* This method will be removed in v7.0
	*/
	/* c8 ignore next 4 */
	crawlWithOptions(root, options) {
		this.options = {
			...this.options,
			...options
		};
		return new APIBuilder(root || ".", this.options);
	}
	glob(...patterns) {
		if (this.globFunction) return this.globWithOptions(patterns);
		return this.globWithOptions(patterns, ...[{ dot: true }]);
	}
	globWithOptions(patterns, ...options) {
		const globFn = this.globFunction || pm;
		/* c8 ignore next 5 */
		if (!globFn) throw new Error("Please specify a glob function to use glob matching.");
		var isMatch = this.globCache[patterns.join("\0")];
		if (!isMatch) {
			isMatch = globFn(patterns, ...options);
			this.globCache[patterns.join("\0")] = isMatch;
		}
		this.options.filters.push((path) => isMatch(path));
		return this;
	}
};

//#endregion
export { Builder as fdir };

export default function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}


export { OpenAIRealtimeError } from "./internal-base.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { OpenAI as default } from "./client.mjs";
export { toFile } from "./core/uploads.mjs";
export { APIPromise } from "./core/api-promise.mjs";
export { OpenAI } from "./client.mjs";
export { PagePromise } from "./core/pagination.mjs";
export { OpenAIError, APIError, APIConnectionError, APIConnectionTimeoutError, APIUserAbortError, NotFoundError, ConflictError, RateLimitError, BadRequestError, AuthenticationError, InternalServerError, PermissionDeniedError, UnprocessableEntityError, InvalidWebhookSignatureError, } from "./core/error.mjs";
export { AzureOpenAI } from "./azure.mjs";
//# sourceMappingURL=index.mjs.map

import { default_format, formatters, RFC1738, RFC3986 } from "./formats.mjs";
const formats = {
    formatters,
    RFC1738,
    RFC3986,
    default: default_format,
};
export { stringify } from "./stringify.mjs";
export { formats };
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Audio } from "./audio.mjs";
export { Speech } from "./speech.mjs";
export { Transcriptions, } from "./transcriptions.mjs";
export { Translations, } from "./translations.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Assistants, } from "./assistants.mjs";
export { Beta } from "./beta.mjs";
export { Realtime } from "./realtime/index.mjs";
export { Threads, } from "./threads/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Realtime } from "./realtime.mjs";
export { Sessions } from "./sessions.mjs";
export { TranscriptionSessions, } from "./transcription-sessions.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Messages, } from "./messages.mjs";
export { Runs, } from "./runs/index.mjs";
export { Threads, } from "./threads.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Runs, } from "./runs.mjs";
export { Steps, } from "./steps.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Completions, } from "./completions.mjs";
export * from "./completions.mjs";
export { Messages } from "./messages.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Chat } from "./chat.mjs";
export { Completions, } from "./completions/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Content } from "./content.mjs";
export { Files, } from "./files.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Containers, } from "./containers.mjs";
export { Files, } from "./files/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Conversations } from "./conversations.mjs";
export { Items, } from "./items.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Evals, } from "./evals.mjs";
export { Runs, } from "./runs/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { OutputItems, } from "./output-items.mjs";
export { Runs, } from "./runs.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Alpha } from "./alpha.mjs";
export { Graders, } from "./graders.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Checkpoints } from "./checkpoints.mjs";
export { Permissions, } from "./permissions.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Alpha } from "./alpha/index.mjs";
export { Checkpoints } from "./checkpoints/index.mjs";
export { FineTuning } from "./fine-tuning.mjs";
export { Jobs, } from "./jobs/index.mjs";
export { Methods, } from "./methods.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Checkpoints, } from "./checkpoints.mjs";
export { Jobs, } from "./jobs.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { GraderModels, } from "./grader-models.mjs";
export { Graders } from "./graders.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export * from "./chat/index.mjs";
export * from "./shared.mjs";
export { Audio } from "./audio/audio.mjs";
export { Batches, } from "./batches.mjs";
export { Beta } from "./beta/beta.mjs";
export { Completions, } from "./completions.mjs";
export { Containers, } from "./containers/containers.mjs";
export { Conversations } from "./conversations/conversations.mjs";
export { Embeddings, } from "./embeddings.mjs";
export { Evals, } from "./evals/evals.mjs";
export { Files, } from "./files.mjs";
export { FineTuning } from "./fine-tuning/fine-tuning.mjs";
export { Graders } from "./graders/graders.mjs";
export { Images, } from "./images.mjs";
export { Models } from "./models.mjs";
export { Moderations, } from "./moderations.mjs";
export { Responses } from "./responses/responses.mjs";
export { Uploads } from "./uploads/uploads.mjs";
export { VectorStores, } from "./vector-stores/vector-stores.mjs";
export { Webhooks } from "./webhooks.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { InputItems } from "./input-items.mjs";
export { Responses } from "./responses.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Parts } from "./parts.mjs";
export { Uploads } from "./uploads.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { FileBatches, } from "./file-batches.mjs";
export { Files, } from "./files.mjs";
export { VectorStores, } from "./vector-stores.mjs";
//# sourceMappingURL=index.mjs.map

export * from "./Options.mjs";
export * from "./Refs.mjs";
export * from "./errorMessages.mjs";
export * from "./parseDef.mjs";
export * from "./parsers/any.mjs";
export * from "./parsers/array.mjs";
export * from "./parsers/bigint.mjs";
export * from "./parsers/boolean.mjs";
export * from "./parsers/branded.mjs";
export * from "./parsers/catch.mjs";
export * from "./parsers/date.mjs";
export * from "./parsers/default.mjs";
export * from "./parsers/effects.mjs";
export * from "./parsers/enum.mjs";
export * from "./parsers/intersection.mjs";
export * from "./parsers/literal.mjs";
export * from "./parsers/map.mjs";
export * from "./parsers/nativeEnum.mjs";
export * from "./parsers/never.mjs";
export * from "./parsers/null.mjs";
export * from "./parsers/nullable.mjs";
export * from "./parsers/number.mjs";
export * from "./parsers/object.mjs";
export * from "./parsers/optional.mjs";
export * from "./parsers/pipeline.mjs";
export * from "./parsers/promise.mjs";
export * from "./parsers/readonly.mjs";
export * from "./parsers/record.mjs";
export * from "./parsers/set.mjs";
export * from "./parsers/string.mjs";
export * from "./parsers/tuple.mjs";
export * from "./parsers/undefined.mjs";
export * from "./parsers/union.mjs";
export * from "./parsers/unknown.mjs";
export * from "./zodToJsonSchema.mjs";
import { zodToJsonSchema } from "./zodToJsonSchema.mjs";
export default zodToJsonSchema;
//# sourceMappingURL=index.mjs.map

import { _ as _path } from './shared/pathe.M-eThtNZ.mjs';
export { c as basename, d as dirname, e as extname, f as format, i as isAbsolute, j as join, m as matchesGlob, n as normalize, a as normalizeString, p as parse, b as relative, r as resolve, s as sep, t as toNamespacedPath } from './shared/pathe.M-eThtNZ.mjs';

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: void 0, win32: void 0 };
const mix = (del = delimiter) => {
  return new Proxy(_path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

export { posix as default, delimiter, posix, win32 };


const r=Object.create(null),i=e=>globalThis.process?.env||import.meta.env||globalThis.Deno?.env.toObject()||globalThis.__env__||(e?r:globalThis),o=new Proxy(r,{get(e,s){return i()[s]??r[s]},has(e,s){const E=i();return s in E||s in r},set(e,s,E){const B=i(!0);return B[s]=E,!0},deleteProperty(e,s){if(!s)return!1;const E=i(!0);return delete E[s],!0},ownKeys(){const e=i(!0);return Object.keys(e)}}),t=typeof process<"u"&&process.env&&process.env.NODE_ENV||"",f=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:!0}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:!0}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:!0}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:!1}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:!1}],["VERCEL","VERCEL_ENV",{ci:!1}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:!1}],["CODESANDBOX","CODESANDBOX_HOST",{ci:!1}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:!0}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:!0}]];function b(){if(globalThis.process?.env)for(const e of f){const s=e[1]||e[0];if(globalThis.process?.env[s])return{name:e[0].toLowerCase(),...e[2]}}return globalThis.process?.env?.SHELL==="/bin/jsh"&&globalThis.process?.versions?.webcontainer?{name:"stackblitz",ci:!1}:{name:"",ci:!1}}const l=b(),p=l.name;function n(e){return e?e!=="false":!1}const I=globalThis.process?.platform||"",T=n(o.CI)||l.ci!==!1,R=n(globalThis.process?.stdout&&globalThis.process?.stdout.isTTY),U=typeof window<"u",d=n(o.DEBUG),a=t==="test"||n(o.TEST),g=t==="production",h=t==="dev"||t==="development",v=n(o.MINIMAL)||T||a||!R,A=/^win/i.test(I),M=/^linux/i.test(I),m=/^darwin/i.test(I),Y=!n(o.NO_COLOR)&&(n(o.FORCE_COLOR)||(R||A)&&o.TERM!=="dumb"||T),C=(globalThis.process?.versions?.node||"").replace(/^v/,"")||null,V=Number(C?.split(".")[0])||null,W=globalThis.process||Object.create(null),_={versions:{}},y=new Proxy(W,{get(e,s){if(s==="env")return o;if(s in e)return e[s];if(s in _)return _[s]}}),O=globalThis.process?.release?.name==="node",c=!!globalThis.Bun||!!globalThis.process?.versions?.bun,D=!!globalThis.Deno,L=!!globalThis.fastly,S=!!globalThis.Netlify,u=!!globalThis.EdgeRuntime,N=globalThis.navigator?.userAgent==="Cloudflare-Workers",F=[[S,"netlify"],[u,"edge-light"],[N,"workerd"],[L,"fastly"],[D,"deno"],[c,"bun"],[O,"node"]];function G(){const e=F.find(s=>s[0]);if(e)return{name:e[1]}}const P=G(),K=P?.name||"";export{o as env,R as hasTTY,U as hasWindow,c as isBun,T as isCI,Y as isColorSupported,d as isDebug,D as isDeno,h as isDevelopment,u as isEdgeLight,L as isFastly,M as isLinux,m as isMacOS,v as isMinimal,S as isNetlify,O as isNode,g as isProduction,a as isTest,A as isWindows,N as isWorkerd,t as nodeENV,V as nodeMajorVersion,C as nodeVersion,I as platform,y as process,p as provider,l as providerInfo,K as runtime,P as runtimeInfo};


import jsTokens from 'js-tokens';

function stripLiteralJsTokens(code, options) {
  const FILL = options?.fillChar ?? " ";
  const FILL_COMMENT = " ";
  let result = "";
  const filter = options?.filter ?? (() => true);
  const tokens = [];
  for (const token of jsTokens(code, { jsx: false })) {
    tokens.push(token);
    if (token.type === "SingleLineComment") {
      result += FILL_COMMENT.repeat(token.value.length);
      continue;
    }
    if (token.type === "MultiLineComment") {
      result += token.value.replace(/[^\n]/g, FILL_COMMENT);
      continue;
    }
    if (token.type === "StringLiteral") {
      if (!token.closed) {
        result += token.value;
        continue;
      }
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += token.value[0] + FILL.repeat(body.length) + token.value[token.value.length - 1];
        continue;
      }
    }
    if (token.type === "NoSubstitutionTemplate") {
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "RegularExpressionLiteral") {
      const body = token.value;
      if (filter(body)) {
        result += body.replace(/\/(.*)\/(\w?)$/g, (_, $1, $2) => `/${FILL.repeat($1.length)}/${$2}`);
        continue;
      }
    }
    if (token.type === "TemplateHead") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    if (token.type === "TemplateTail") {
      const body = token.value.slice(0, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "TemplateMiddle") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    result += token.value;
  }
  return {
    result,
    tokens
  };
}

function stripLiteral(code, options) {
  return stripLiteralDetailed(code, options).result;
}
function stripLiteralDetailed(code, options) {
  return stripLiteralJsTokens(code, options);
}

export { stripLiteral, stripLiteralDetailed, stripLiteralJsTokens };


import path, { posix } from "path";
import { fdir } from "fdir";
import picomatch from "picomatch";

//#region src/utils.ts
const ONLY_PARENT_DIRECTORIES = /^(\/?\.\.)+$/;
function getPartialMatcher(patterns, options) {
	const patternsCount = patterns.length;
	const patternsParts = Array(patternsCount);
	const regexes = Array(patternsCount);
	for (let i = 0; i < patternsCount; i++) {
		const parts = splitPattern(patterns[i]);
		patternsParts[i] = parts;
		const partsCount = parts.length;
		const partRegexes = Array(partsCount);
		for (let j = 0; j < partsCount; j++) partRegexes[j] = picomatch.makeRe(parts[j], options);
		regexes[i] = partRegexes;
	}
	return (input) => {
		const inputParts = input.split("/");
		if (inputParts[0] === ".." && ONLY_PARENT_DIRECTORIES.test(input)) return true;
		for (let i = 0; i < patterns.length; i++) {
			const patternParts = patternsParts[i];
			const regex = regexes[i];
			const inputPatternCount = inputParts.length;
			const minParts = Math.min(inputPatternCount, patternParts.length);
			let j = 0;
			while (j < minParts) {
				const part = patternParts[j];
				if (part.includes("/")) return true;
				const match = regex[j].test(inputParts[j]);
				if (!match) break;
				if (part === "**") return true;
				j++;
			}
			if (j === inputPatternCount) return true;
		}
		return false;
	};
}
const splitPatternOptions = { parts: true };
function splitPattern(path$1) {
	var _result$parts;
	const result = picomatch.scan(path$1, splitPatternOptions);
	return ((_result$parts = result.parts) === null || _result$parts === void 0 ? void 0 : _result$parts.length) ? result.parts : [path$1];
}
const isWin = process.platform === "win32";
const ESCAPED_WIN32_BACKSLASHES = /\\(?![()[\]{}!+@])/g;
function convertPosixPathToPattern(path$1) {
	return escapePosixPath(path$1);
}
function convertWin32PathToPattern(path$1) {
	return escapeWin32Path(path$1).replace(ESCAPED_WIN32_BACKSLASHES, "/");
}
const convertPathToPattern = isWin ? convertWin32PathToPattern : convertPosixPathToPattern;
const POSIX_UNESCAPED_GLOB_SYMBOLS = /(?<!\\)([()[\]{}*?|]|^!|[!+@](?=\()|\\(?![()[\]{}!*+?@|]))/g;
const WIN32_UNESCAPED_GLOB_SYMBOLS = /(?<!\\)([()[\]{}]|^!|[!+@](?=\())/g;
const escapePosixPath = (path$1) => path$1.replace(POSIX_UNESCAPED_GLOB_SYMBOLS, "\\$&");
const escapeWin32Path = (path$1) => path$1.replace(WIN32_UNESCAPED_GLOB_SYMBOLS, "\\$&");
const escapePath = isWin ? escapeWin32Path : escapePosixPath;
function isDynamicPattern(pattern, options) {
	if ((options === null || options === void 0 ? void 0 : options.caseSensitiveMatch) === false) return true;
	const scan = picomatch.scan(pattern);
	return scan.isGlob || scan.negated;
}
function log(...tasks) {
	console.log(`[tinyglobby ${new Date().toLocaleTimeString("es")}]`, ...tasks);
}

//#endregion
//#region src/index.ts
const PARENT_DIRECTORY = /^(\/?\.\.)+/;
const ESCAPING_BACKSLASHES = /\\(?=[()[\]{}!*+?@|])/g;
const BACKSLASHES = /\\/g;
function normalizePattern(pattern, expandDirectories, cwd, props, isIgnore) {
	let result = pattern;
	if (pattern.endsWith("/")) result = pattern.slice(0, -1);
	if (!result.endsWith("*") && expandDirectories) result += "/**";
	const escapedCwd = escapePath(cwd);
	if (path.isAbsolute(result.replace(ESCAPING_BACKSLASHES, ""))) result = posix.relative(escapedCwd, result);
	else result = posix.normalize(result);
	const parentDirectoryMatch = PARENT_DIRECTORY.exec(result);
	const parts = splitPattern(result);
	if (parentDirectoryMatch === null || parentDirectoryMatch === void 0 ? void 0 : parentDirectoryMatch[0]) {
		const n = (parentDirectoryMatch[0].length + 1) / 3;
		let i = 0;
		const cwdParts = escapedCwd.split("/");
		while (i < n && parts[i + n] === cwdParts[cwdParts.length + i - n]) {
			result = result.slice(0, (n - i - 1) * 3) + result.slice((n - i) * 3 + parts[i + n].length + 1) || ".";
			i++;
		}
		const potentialRoot = posix.join(cwd, parentDirectoryMatch[0].slice(i * 3));
		if (!potentialRoot.startsWith(".") && props.root.length > potentialRoot.length) {
			props.root = potentialRoot;
			props.depthOffset = -n + i;
		}
	}
	if (!isIgnore && props.depthOffset >= 0) {
		var _props$commonPath;
		(_props$commonPath = props.commonPath) !== null && _props$commonPath !== void 0 || (props.commonPath = parts);
		const newCommonPath = [];
		const length = Math.min(props.commonPath.length, parts.length);
		for (let i = 0; i < length; i++) {
			const part = parts[i];
			if (part === "**" && !parts[i + 1]) {
				newCommonPath.pop();
				break;
			}
			if (part !== props.commonPath[i] || isDynamicPattern(part) || i === parts.length - 1) break;
			newCommonPath.push(part);
		}
		props.depthOffset = newCommonPath.length;
		props.commonPath = newCommonPath;
		props.root = newCommonPath.length > 0 ? path.posix.join(cwd, ...newCommonPath) : cwd;
	}
	return result;
}
function processPatterns({ patterns, ignore = [], expandDirectories = true }, cwd, props) {
	if (typeof patterns === "string") patterns = [patterns];
	else if (!patterns) patterns = ["**/*"];
	if (typeof ignore === "string") ignore = [ignore];
	const matchPatterns = [];
	const ignorePatterns = [];
	for (const pattern of ignore) {
		if (!pattern) continue;
		if (pattern[0] !== "!" || pattern[1] === "(") ignorePatterns.push(normalizePattern(pattern, expandDirectories, cwd, props, true));
	}
	for (const pattern of patterns) {
		if (!pattern) continue;
		if (pattern[0] !== "!" || pattern[1] === "(") matchPatterns.push(normalizePattern(pattern, expandDirectories, cwd, props, false));
		else if (pattern[1] !== "!" || pattern[2] === "(") ignorePatterns.push(normalizePattern(pattern.slice(1), expandDirectories, cwd, props, true));
	}
	return {
		match: matchPatterns,
		ignore: ignorePatterns
	};
}
function getRelativePath(path$1, cwd, root) {
	return posix.relative(cwd, `${root}/${path$1}`) || ".";
}
function processPath(path$1, cwd, root, isDirectory, absolute) {
	const relativePath = absolute ? path$1.slice(root === "/" ? 1 : root.length + 1) || "." : path$1;
	if (root === cwd) return isDirectory && relativePath !== "." ? relativePath.slice(0, -1) : relativePath;
	return getRelativePath(relativePath, cwd, root);
}
function formatPaths(paths, cwd, root) {
	for (let i = paths.length - 1; i >= 0; i--) {
		const path$1 = paths[i];
		paths[i] = getRelativePath(path$1, cwd, root) + (!path$1 || path$1.endsWith("/") ? "/" : "");
	}
	return paths;
}
function crawl(options, cwd, sync) {
	if (process.env.TINYGLOBBY_DEBUG) options.debug = true;
	if (options.debug) log("globbing with options:", options, "cwd:", cwd);
	if (Array.isArray(options.patterns) && options.patterns.length === 0) return sync ? [] : Promise.resolve([]);
	const props = {
		root: cwd,
		commonPath: null,
		depthOffset: 0
	};
	const processed = processPatterns(options, cwd, props);
	const nocase = options.caseSensitiveMatch === false;
	if (options.debug) log("internal processing patterns:", processed);
	const matcher = picomatch(processed.match, {
		dot: options.dot,
		nocase,
		ignore: processed.ignore
	});
	const ignore = picomatch(processed.ignore, {
		dot: options.dot,
		nocase
	});
	const partialMatcher = getPartialMatcher(processed.match, {
		dot: options.dot,
		nocase
	});
	const fdirOptions = {
		filters: [options.debug ? (p, isDirectory) => {
			const path$1 = processPath(p, cwd, props.root, isDirectory, options.absolute);
			const matches = matcher(path$1);
			if (matches) log(`matched ${path$1}`);
			return matches;
		} : (p, isDirectory) => matcher(processPath(p, cwd, props.root, isDirectory, options.absolute))],
		exclude: options.debug ? (_, p) => {
			const relativePath = processPath(p, cwd, props.root, true, true);
			const skipped = relativePath !== "." && !partialMatcher(relativePath) || ignore(relativePath);
			if (skipped) log(`skipped ${p}`);
			else log(`crawling ${p}`);
			return skipped;
		} : (_, p) => {
			const relativePath = processPath(p, cwd, props.root, true, true);
			return relativePath !== "." && !partialMatcher(relativePath) || ignore(relativePath);
		},
		pathSeparator: "/",
		relativePaths: true,
		resolveSymlinks: true
	};
	if (options.deep !== void 0) fdirOptions.maxDepth = Math.round(options.deep - props.depthOffset);
	if (options.absolute) {
		fdirOptions.relativePaths = false;
		fdirOptions.resolvePaths = true;
		fdirOptions.includeBasePath = true;
	}
	if (options.followSymbolicLinks === false) {
		fdirOptions.resolveSymlinks = false;
		fdirOptions.excludeSymlinks = true;
	}
	if (options.onlyDirectories) {
		fdirOptions.excludeFiles = true;
		fdirOptions.includeDirs = true;
	} else if (options.onlyFiles === false) fdirOptions.includeDirs = true;
	props.root = props.root.replace(BACKSLASHES, "");
	const root = props.root;
	if (options.debug) log("internal properties:", props);
	const api = new fdir(fdirOptions).crawl(root);
	if (cwd === root || options.absolute) return sync ? api.sync() : api.withPromise();
	return sync ? formatPaths(api.sync(), cwd, root) : api.withPromise().then((paths) => formatPaths(paths, cwd, root));
}
async function glob(patternsOrOptions, options) {
	if (patternsOrOptions && (options === null || options === void 0 ? void 0 : options.patterns)) throw new Error("Cannot pass patterns as both an argument and an option");
	const opts = Array.isArray(patternsOrOptions) || typeof patternsOrOptions === "string" ? {
		...options,
		patterns: patternsOrOptions
	} : patternsOrOptions;
	const cwd = opts.cwd ? path.resolve(opts.cwd).replace(BACKSLASHES, "/") : process.cwd().replace(BACKSLASHES, "/");
	return crawl(opts, cwd, false);
}
function globSync(patternsOrOptions, options) {
	if (patternsOrOptions && (options === null || options === void 0 ? void 0 : options.patterns)) throw new Error("Cannot pass patterns as both an argument and an option");
	const opts = Array.isArray(patternsOrOptions) || typeof patternsOrOptions === "string" ? {
		...options,
		patterns: patternsOrOptions
	} : patternsOrOptions;
	const cwd = opts.cwd ? path.resolve(opts.cwd).replace(BACKSLASHES, "/") : process.cwd().replace(BACKSLASHES, "/");
	return crawl(opts, cwd, true);
}

//#endregion
export { convertPathToPattern, escapePath, glob, globSync, isDynamicPattern };




export * from '@vue/compiler-sfc'

import './register-ts.js'


export * from './index.js'


import { h, Fragment } from 'vue'

function jsx(type, props, key) {
  const { children } = props
  delete props.children
  if (arguments.length > 2) {
    props.key = key
  }
  return h(type, props, children)
}

export { Fragment, jsx, jsx as jsxs, jsx as jsxDEV }


export * from '@vue/server-renderer'


import { getKeys, KEYS } from 'eslint-visitor-keys';

/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("estree").Node} Node */

/**
 * Get the innermost scope which contains a given location.
 * @param {Scope} initialScope The initial scope to search.
 * @param {Node} node The location to search.
 * @returns {Scope} The innermost scope.
 */
function getInnermostScope(initialScope, node) {
    const location = /** @type {[number, number]} */ (node.range)[0];

    let scope = initialScope;
    let found = false;
    do {
        found = false;
        for (const childScope of scope.childScopes) {
            const range = /** @type {[number, number]} */ (
                childScope.block.range
            );

            if (range[0] <= location && location < range[1]) {
                scope = childScope;
                found = true;
                break
            }
        }
    } while (found)

    return scope
}

/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("eslint").Scope.Variable} Variable */
/** @typedef {import("estree").Identifier} Identifier */

/**
 * Find the variable of a given name.
 * @param {Scope} initialScope The scope to start finding.
 * @param {string|Identifier} nameOrNode The variable name to find. If this is a Node object then it should be an Identifier node.
 * @returns {Variable|null} The found variable or null.
 */
function findVariable(initialScope, nameOrNode) {
    let name = "";
    /** @type {Scope|null} */
    let scope = initialScope;

    if (typeof nameOrNode === "string") {
        name = nameOrNode;
    } else {
        name = nameOrNode.name;
        scope = getInnermostScope(scope, nameOrNode);
    }

    while (scope != null) {
        const variable = scope.set.get(name);
        if (variable != null) {
            return variable
        }
        scope = scope.upper;
    }

    return null
}

/** @typedef {import("eslint").AST.Token} Token */
/** @typedef {import("estree").Comment} Comment */
/** @typedef {import("./types.mjs").ArrowToken} ArrowToken */
/** @typedef {import("./types.mjs").CommaToken} CommaToken */
/** @typedef {import("./types.mjs").SemicolonToken} SemicolonToken */
/** @typedef {import("./types.mjs").ColonToken} ColonToken */
/** @typedef {import("./types.mjs").OpeningParenToken} OpeningParenToken */
/** @typedef {import("./types.mjs").ClosingParenToken} ClosingParenToken */
/** @typedef {import("./types.mjs").OpeningBracketToken} OpeningBracketToken */
/** @typedef {import("./types.mjs").ClosingBracketToken} ClosingBracketToken */
/** @typedef {import("./types.mjs").OpeningBraceToken} OpeningBraceToken */
/** @typedef {import("./types.mjs").ClosingBraceToken} ClosingBraceToken */
/**
 * @template {string} Value
 * @typedef {import("./types.mjs").PunctuatorToken<Value>} PunctuatorToken
 */

/** @typedef {Comment | Token} CommentOrToken */

/**
 * Creates the negate function of the given function.
 * @param {function(CommentOrToken):boolean} f - The function to negate.
 * @returns {function(CommentOrToken):boolean} Negated function.
 */
function negate(f) {
    return (token) => !f(token)
}

/**
 * Checks if the given token is a PunctuatorToken with the given value
 * @template {string} Value
 * @param {CommentOrToken} token - The token to check.
 * @param {Value} value - The value to check.
 * @returns {token is PunctuatorToken<Value>} `true` if the token is a PunctuatorToken with the given value.
 */
function isPunctuatorTokenWithValue(token, value) {
    return token.type === "Punctuator" && token.value === value
}

/**
 * Checks if the given token is an arrow token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is ArrowToken} `true` if the token is an arrow token.
 */
function isArrowToken(token) {
    return isPunctuatorTokenWithValue(token, "=>")
}

/**
 * Checks if the given token is a comma token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is CommaToken} `true` if the token is a comma token.
 */
function isCommaToken(token) {
    return isPunctuatorTokenWithValue(token, ",")
}

/**
 * Checks if the given token is a semicolon token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is SemicolonToken} `true` if the token is a semicolon token.
 */
function isSemicolonToken(token) {
    return isPunctuatorTokenWithValue(token, ";")
}

/**
 * Checks if the given token is a colon token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is ColonToken} `true` if the token is a colon token.
 */
function isColonToken(token) {
    return isPunctuatorTokenWithValue(token, ":")
}

/**
 * Checks if the given token is an opening parenthesis token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is OpeningParenToken} `true` if the token is an opening parenthesis token.
 */
function isOpeningParenToken(token) {
    return isPunctuatorTokenWithValue(token, "(")
}

/**
 * Checks if the given token is a closing parenthesis token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is ClosingParenToken} `true` if the token is a closing parenthesis token.
 */
function isClosingParenToken(token) {
    return isPunctuatorTokenWithValue(token, ")")
}

/**
 * Checks if the given token is an opening square bracket token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is OpeningBracketToken} `true` if the token is an opening square bracket token.
 */
function isOpeningBracketToken(token) {
    return isPunctuatorTokenWithValue(token, "[")
}

/**
 * Checks if the given token is a closing square bracket token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is ClosingBracketToken} `true` if the token is a closing square bracket token.
 */
function isClosingBracketToken(token) {
    return isPunctuatorTokenWithValue(token, "]")
}

/**
 * Checks if the given token is an opening brace token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is OpeningBraceToken} `true` if the token is an opening brace token.
 */
function isOpeningBraceToken(token) {
    return isPunctuatorTokenWithValue(token, "{")
}

/**
 * Checks if the given token is a closing brace token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is ClosingBraceToken} `true` if the token is a closing brace token.
 */
function isClosingBraceToken(token) {
    return isPunctuatorTokenWithValue(token, "}")
}

/**
 * Checks if the given token is a comment token or not.
 * @param {CommentOrToken} token - The token to check.
 * @returns {token is Comment} `true` if the token is a comment token.
 */
function isCommentToken(token) {
    return ["Block", "Line", "Shebang"].includes(token.type)
}

const isNotArrowToken = negate(isArrowToken);
const isNotCommaToken = negate(isCommaToken);
const isNotSemicolonToken = negate(isSemicolonToken);
const isNotColonToken = negate(isColonToken);
const isNotOpeningParenToken = negate(isOpeningParenToken);
const isNotClosingParenToken = negate(isClosingParenToken);
const isNotOpeningBracketToken = negate(isOpeningBracketToken);
const isNotClosingBracketToken = negate(isClosingBracketToken);
const isNotOpeningBraceToken = negate(isOpeningBraceToken);
const isNotClosingBraceToken = negate(isClosingBraceToken);
const isNotCommentToken = negate(isCommentToken);

/** @typedef {import("eslint").Rule.Node} RuleNode */
/** @typedef {import("eslint").SourceCode} SourceCode */
/** @typedef {import("eslint").AST.Token} Token */
/** @typedef {import("estree").Function} FunctionNode */
/** @typedef {import("estree").FunctionDeclaration} FunctionDeclaration */
/** @typedef {import("estree").FunctionExpression} FunctionExpression */
/** @typedef {import("estree").SourceLocation} SourceLocation */
/** @typedef {import("estree").Position} Position */

/**
 * Get the `(` token of the given function node.
 * @param {FunctionExpression | FunctionDeclaration} node - The function node to get.
 * @param {SourceCode} sourceCode - The source code object to get tokens.
 * @returns {Token} `(` token.
 */
function getOpeningParenOfParams(node, sourceCode) {
    return node.id
        ? /** @type {Token} */ (
              sourceCode.getTokenAfter(node.id, isOpeningParenToken)
          )
        : /** @type {Token} */ (
              sourceCode.getFirstToken(node, isOpeningParenToken)
          )
}

/**
 * Get the location of the given function node for reporting.
 * @param {FunctionNode} node - The function node to get.
 * @param {SourceCode} sourceCode - The source code object to get tokens.
 * @returns {SourceLocation|null} The location of the function node for reporting.
 */
function getFunctionHeadLocation(node, sourceCode) {
    const parent = /** @type {RuleNode} */ (node).parent;

    /** @type {Position|null} */
    let start = null;
    /** @type {Position|null} */
    let end = null;

    if (node.type === "ArrowFunctionExpression") {
        const arrowToken = /** @type {Token} */ (
            sourceCode.getTokenBefore(node.body, isArrowToken)
        );

        start = arrowToken.loc.start;
        end = arrowToken.loc.end;
    } else if (
        parent.type === "Property" ||
        parent.type === "MethodDefinition" ||
        parent.type === "PropertyDefinition"
    ) {
        start = /** @type {SourceLocation} */ (parent.loc).start;
        end = getOpeningParenOfParams(node, sourceCode).loc.start;
    } else {
        start = /** @type {SourceLocation} */ (node.loc).start;
        end = getOpeningParenOfParams(node, sourceCode).loc.start;
    }

    return {
        start: { ...start },
        end: { ...end },
    }
}

/* globals globalThis, global, self, window */
/** @typedef {import("./types.mjs").StaticValue} StaticValue */
/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("estree").Node} Node */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} TSESTreeNode */
/** @typedef {import("@typescript-eslint/types").TSESTree.AST_NODE_TYPES} TSESTreeNodeTypes */
/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Property} Property */
/** @typedef {import("@typescript-eslint/types").TSESTree.RegExpLiteral} RegExpLiteral */
/** @typedef {import("@typescript-eslint/types").TSESTree.BigIntLiteral} BigIntLiteral */
/** @typedef {import("@typescript-eslint/types").TSESTree.Literal} Literal */

const globalObject =
    typeof globalThis !== "undefined"
        ? globalThis
        : // @ts-ignore
        typeof self !== "undefined"
        ? // @ts-ignore
          self
        : // @ts-ignore
        typeof window !== "undefined"
        ? // @ts-ignore
          window
        : typeof global !== "undefined"
        ? global
        : {};

const builtinNames = Object.freeze(
    new Set([
        "Array",
        "ArrayBuffer",
        "BigInt",
        "BigInt64Array",
        "BigUint64Array",
        "Boolean",
        "DataView",
        "Date",
        "decodeURI",
        "decodeURIComponent",
        "encodeURI",
        "encodeURIComponent",
        "escape",
        "Float32Array",
        "Float64Array",
        "Function",
        "Infinity",
        "Int16Array",
        "Int32Array",
        "Int8Array",
        "isFinite",
        "isNaN",
        "isPrototypeOf",
        "JSON",
        "Map",
        "Math",
        "NaN",
        "Number",
        "Object",
        "parseFloat",
        "parseInt",
        "Promise",
        "Proxy",
        "Reflect",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "Uint16Array",
        "Uint32Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "undefined",
        "unescape",
        "WeakMap",
        "WeakSet",
    ]),
);
const callAllowed = new Set(
    [
        Array.isArray,
        Array.of,
        Array.prototype.at,
        Array.prototype.concat,
        Array.prototype.entries,
        Array.prototype.every,
        Array.prototype.filter,
        Array.prototype.find,
        Array.prototype.findIndex,
        Array.prototype.flat,
        Array.prototype.includes,
        Array.prototype.indexOf,
        Array.prototype.join,
        Array.prototype.keys,
        Array.prototype.lastIndexOf,
        Array.prototype.slice,
        Array.prototype.some,
        Array.prototype.toString,
        Array.prototype.values,
        typeof BigInt === "function" ? BigInt : undefined,
        Boolean,
        Date,
        Date.parse,
        decodeURI,
        decodeURIComponent,
        encodeURI,
        encodeURIComponent,
        escape,
        isFinite,
        isNaN,
        // @ts-ignore
        isPrototypeOf,
        Map,
        Map.prototype.entries,
        Map.prototype.get,
        Map.prototype.has,
        Map.prototype.keys,
        Map.prototype.values,
        .../** @type {(keyof typeof Math)[]} */ (
            Object.getOwnPropertyNames(Math)
        )
            .filter((k) => k !== "random")
            .map((k) => Math[k])
            .filter((f) => typeof f === "function"),
        Number,
        Number.isFinite,
        Number.isNaN,
        Number.parseFloat,
        Number.parseInt,
        Number.prototype.toExponential,
        Number.prototype.toFixed,
        Number.prototype.toPrecision,
        Number.prototype.toString,
        Object,
        Object.entries,
        Object.is,
        Object.isExtensible,
        Object.isFrozen,
        Object.isSealed,
        Object.keys,
        Object.values,
        parseFloat,
        parseInt,
        RegExp,
        Set,
        Set.prototype.entries,
        Set.prototype.has,
        Set.prototype.keys,
        Set.prototype.values,
        String,
        String.fromCharCode,
        String.fromCodePoint,
        String.raw,
        String.prototype.at,
        String.prototype.charAt,
        String.prototype.charCodeAt,
        String.prototype.codePointAt,
        String.prototype.concat,
        String.prototype.endsWith,
        String.prototype.includes,
        String.prototype.indexOf,
        String.prototype.lastIndexOf,
        String.prototype.normalize,
        String.prototype.padEnd,
        String.prototype.padStart,
        String.prototype.slice,
        String.prototype.startsWith,
        String.prototype.substr,
        String.prototype.substring,
        String.prototype.toLowerCase,
        String.prototype.toString,
        String.prototype.toUpperCase,
        String.prototype.trim,
        String.prototype.trimEnd,
        String.prototype.trimLeft,
        String.prototype.trimRight,
        String.prototype.trimStart,
        Symbol.for,
        Symbol.keyFor,
        unescape,
    ].filter((f) => typeof f === "function"),
);
const callPassThrough = new Set([
    Object.freeze,
    Object.preventExtensions,
    Object.seal,
]);

/** @type {ReadonlyArray<readonly [Function, ReadonlySet<string>]>} */
const getterAllowed = [
    [Map, new Set(["size"])],
    [
        RegExp,
        new Set([
            "dotAll",
            "flags",
            "global",
            "hasIndices",
            "ignoreCase",
            "multiline",
            "source",
            "sticky",
            "unicode",
        ]),
    ],
    [Set, new Set(["size"])],
];

/**
 * Get the property descriptor.
 * @param {object} object The object to get.
 * @param {string|number|symbol} name The property name to get.
 */
function getPropertyDescriptor(object, name) {
    let x = object;
    while ((typeof x === "object" || typeof x === "function") && x !== null) {
        const d = Object.getOwnPropertyDescriptor(x, name);
        if (d) {
            return d
        }
        x = Object.getPrototypeOf(x);
    }
    return null
}

/**
 * Check if a property is getter or not.
 * @param {object} object The object to check.
 * @param {string|number|symbol} name The property name to check.
 */
function isGetter(object, name) {
    const d = getPropertyDescriptor(object, name);
    return d != null && d.get != null
}

/**
 * Get the element values of a given node list.
 * @param {(Node|TSESTreeNode|null)[]} nodeList The node list to get values.
 * @param {Scope|undefined|null} initialScope The initial scope to find variables.
 * @returns {any[]|null} The value list if all nodes are constant. Otherwise, null.
 */
function getElementValues(nodeList, initialScope) {
    const valueList = [];

    for (let i = 0; i < nodeList.length; ++i) {
        const elementNode = nodeList[i];

        if (elementNode == null) {
            valueList.length = i + 1;
        } else if (elementNode.type === "SpreadElement") {
            const argument = getStaticValueR(elementNode.argument, initialScope);
            if (argument == null) {
                return null
            }
            valueList.push(.../** @type {Iterable<any>} */ (argument.value));
        } else {
            const element = getStaticValueR(elementNode, initialScope);
            if (element == null) {
                return null
            }
            valueList.push(element.value);
        }
    }

    return valueList
}

/**
 * Returns whether the given variable is never written to after initialization.
 * @param {import("eslint").Scope.Variable} variable
 * @returns {boolean}
 */
function isEffectivelyConst(variable) {
    const refs = variable.references;

    const inits = refs.filter((r) => r.init).length;
    const reads = refs.filter((r) => r.isReadOnly()).length;
    if (inits === 1 && reads + inits === refs.length) {
        // there is only one init and all other references only read
        return true
    }
    return false
}

/**
 * @template {TSESTreeNodeTypes} T
 * @callback VisitorCallback
 * @param {TSESTreeNode & { type: T }} node
 * @param {Scope|undefined|null} initialScope
 * @returns {StaticValue | null}
 */
/**
 * @typedef { { [K in TSESTreeNodeTypes]?: VisitorCallback<K> } } Operations
 */
/**
 * @type {Operations}
 */
const operations = Object.freeze({
    ArrayExpression(node, initialScope) {
        const elements = getElementValues(node.elements, initialScope);
        return elements != null ? { value: elements } : null
    },

    AssignmentExpression(node, initialScope) {
        if (node.operator === "=") {
            return getStaticValueR(node.right, initialScope)
        }
        return null
    },

    //eslint-disable-next-line complexity
    BinaryExpression(node, initialScope) {
        if (node.operator === "in" || node.operator === "instanceof") {
            // Not supported.
            return null
        }

        const left = getStaticValueR(node.left, initialScope);
        const right = getStaticValueR(node.right, initialScope);
        if (left != null && right != null) {
            switch (node.operator) {
                case "==":
                    return { value: left.value == right.value } //eslint-disable-line eqeqeq
                case "!=":
                    return { value: left.value != right.value } //eslint-disable-line eqeqeq
                case "===":
                    return { value: left.value === right.value }
                case "!==":
                    return { value: left.value !== right.value }
                case "<":
                    return {
                        value:
                            /** @type {any} */ (left.value) <
                            /** @type {any} */ (right.value),
                    }
                case "<=":
                    return {
                        value:
                            /** @type {any} */ (left.value) <=
                            /** @type {any} */ (right.value),
                    }
                case ">":
                    return {
                        value:
                            /** @type {any} */ (left.value) >
                            /** @type {any} */ (right.value),
                    }
                case ">=":
                    return {
                        value:
                            /** @type {any} */ (left.value) >=
                            /** @type {any} */ (right.value),
                    }
                case "<<":
                    return {
                        value:
                            /** @type {any} */ (left.value) <<
                            /** @type {any} */ (right.value),
                    }
                case ">>":
                    return {
                        value:
                            /** @type {any} */ (left.value) >>
                            /** @type {any} */ (right.value),
                    }
                case ">>>":
                    return {
                        value:
                            /** @type {any} */ (left.value) >>>
                            /** @type {any} */ (right.value),
                    }
                case "+":
                    return {
                        value:
                            /** @type {any} */ (left.value) +
                            /** @type {any} */ (right.value),
                    }
                case "-":
                    return {
                        value:
                            /** @type {any} */ (left.value) -
                            /** @type {any} */ (right.value),
                    }
                case "*":
                    return {
                        value:
                            /** @type {any} */ (left.value) *
                            /** @type {any} */ (right.value),
                    }
                case "/":
                    return {
                        value:
                            /** @type {any} */ (left.value) /
                            /** @type {any} */ (right.value),
                    }
                case "%":
                    return {
                        value:
                            /** @type {any} */ (left.value) %
                            /** @type {any} */ (right.value),
                    }
                case "**":
                    return {
                        value:
                            /** @type {any} */ (left.value) **
                            /** @type {any} */ (right.value),
                    }
                case "|":
                    return {
                        value:
                            /** @type {any} */ (left.value) |
                            /** @type {any} */ (right.value),
                    }
                case "^":
                    return {
                        value:
                            /** @type {any} */ (left.value) ^
                            /** @type {any} */ (right.value),
                    }
                case "&":
                    return {
                        value:
                            /** @type {any} */ (left.value) &
                            /** @type {any} */ (right.value),
                    }

                // no default
            }
        }

        return null
    },

    CallExpression(node, initialScope) {
        const calleeNode = node.callee;
        const args = getElementValues(node.arguments, initialScope);

        if (args != null) {
            if (calleeNode.type === "MemberExpression") {
                if (calleeNode.property.type === "PrivateIdentifier") {
                    return null
                }
                const object = getStaticValueR(calleeNode.object, initialScope);
                if (object != null) {
                    if (
                        object.value == null &&
                        (object.optional || node.optional)
                    ) {
                        return { value: undefined, optional: true }
                    }
                    const property = getStaticPropertyNameValue(
                        calleeNode,
                        initialScope,
                    );

                    if (property != null) {
                        const receiver =
                            /** @type {Record<PropertyKey, (...args: any[]) => any>} */ (
                                object.value
                            );
                        const methodName = /** @type {PropertyKey} */ (
                            property.value
                        );
                        if (callAllowed.has(receiver[methodName])) {
                            return {
                                value: receiver[methodName](...args),
                            }
                        }
                        if (callPassThrough.has(receiver[methodName])) {
                            return { value: args[0] }
                        }
                    }
                }
            } else {
                const callee = getStaticValueR(calleeNode, initialScope);
                if (callee != null) {
                    if (callee.value == null && node.optional) {
                        return { value: undefined, optional: true }
                    }
                    const func = /** @type {(...args: any[]) => any} */ (
                        callee.value
                    );
                    if (callAllowed.has(func)) {
                        return { value: func(...args) }
                    }
                    if (callPassThrough.has(func)) {
                        return { value: args[0] }
                    }
                }
            }
        }

        return null
    },

    ConditionalExpression(node, initialScope) {
        const test = getStaticValueR(node.test, initialScope);
        if (test != null) {
            return test.value
                ? getStaticValueR(node.consequent, initialScope)
                : getStaticValueR(node.alternate, initialScope)
        }
        return null
    },

    ExpressionStatement(node, initialScope) {
        return getStaticValueR(node.expression, initialScope)
    },

    Identifier(node, initialScope) {
        if (initialScope != null) {
            const variable = findVariable(initialScope, node);

            // Built-in globals.
            if (
                variable != null &&
                variable.defs.length === 0 &&
                builtinNames.has(variable.name) &&
                variable.name in globalObject
            ) {
                return { value: globalObject[variable.name] }
            }

            // Constants.
            if (variable != null && variable.defs.length === 1) {
                const def = variable.defs[0];
                if (
                    def.parent &&
                    def.type === "Variable" &&
                    (def.parent.kind === "const" ||
                        isEffectivelyConst(variable)) &&
                    // TODO(mysticatea): don't support destructuring here.
                    def.node.id.type === "Identifier"
                ) {
                    return getStaticValueR(def.node.init, initialScope)
                }
            }
        }
        return null
    },

    Literal(node) {
        const literal =
            /** @type {Partial<Literal> & Partial<RegExpLiteral> & Partial<BigIntLiteral>} */ (
                node
            );
        //istanbul ignore if : this is implementation-specific behavior.
        if (
            (literal.regex != null || literal.bigint != null) &&
            literal.value == null
        ) {
            // It was a RegExp/BigInt literal, but Node.js didn't support it.
            return null
        }
        return { value: literal.value }
    },

    LogicalExpression(node, initialScope) {
        const left = getStaticValueR(node.left, initialScope);
        if (left != null) {
            if (
                (node.operator === "||" && Boolean(left.value) === true) ||
                (node.operator === "&&" && Boolean(left.value) === false) ||
                (node.operator === "??" && left.value != null)
            ) {
                return left
            }

            const right = getStaticValueR(node.right, initialScope);
            if (right != null) {
                return right
            }
        }

        return null
    },

    MemberExpression(node, initialScope) {
        if (node.property.type === "PrivateIdentifier") {
            return null
        }
        const object = getStaticValueR(node.object, initialScope);
        if (object != null) {
            if (object.value == null && (object.optional || node.optional)) {
                return { value: undefined, optional: true }
            }
            const property = getStaticPropertyNameValue(node, initialScope);

            if (property != null) {
                if (
                    !isGetter(
                        /** @type {object} */ (object.value),
                        /** @type {PropertyKey} */ (property.value),
                    )
                ) {
                    return {
                        value: /** @type {Record<PropertyKey, unknown>} */ (
                            object.value
                        )[/** @type {PropertyKey} */ (property.value)],
                    }
                }

                for (const [classFn, allowed] of getterAllowed) {
                    if (
                        object.value instanceof classFn &&
                        allowed.has(/** @type {string} */ (property.value))
                    ) {
                        return {
                            value: /** @type {Record<PropertyKey, unknown>} */ (
                                object.value
                            )[/** @type {PropertyKey} */ (property.value)],
                        }
                    }
                }
            }
        }
        return null
    },

    ChainExpression(node, initialScope) {
        const expression = getStaticValueR(node.expression, initialScope);
        if (expression != null) {
            return { value: expression.value }
        }
        return null
    },

    NewExpression(node, initialScope) {
        const callee = getStaticValueR(node.callee, initialScope);
        const args = getElementValues(node.arguments, initialScope);

        if (callee != null && args != null) {
            const Func = /** @type {new (...args: any[]) => any} */ (
                callee.value
            );
            if (callAllowed.has(Func)) {
                return { value: new Func(...args) }
            }
        }

        return null
    },

    ObjectExpression(node, initialScope) {
        /** @type {Record<PropertyKey, unknown>} */
        const object = {};

        for (const propertyNode of node.properties) {
            if (propertyNode.type === "Property") {
                if (propertyNode.kind !== "init") {
                    return null
                }
                const key = getStaticPropertyNameValue(
                    propertyNode,
                    initialScope,
                );
                const value = getStaticValueR(propertyNode.value, initialScope);
                if (key == null || value == null) {
                    return null
                }
                object[/** @type {PropertyKey} */ (key.value)] = value.value;
            } else if (
                propertyNode.type === "SpreadElement" ||
                // @ts-expect-error -- Backward compatibility
                propertyNode.type === "ExperimentalSpreadProperty"
            ) {
                const argument = getStaticValueR(
                    propertyNode.argument,
                    initialScope,
                );
                if (argument == null) {
                    return null
                }
                Object.assign(object, argument.value);
            } else {
                return null
            }
        }

        return { value: object }
    },

    SequenceExpression(node, initialScope) {
        const last = node.expressions[node.expressions.length - 1];
        return getStaticValueR(last, initialScope)
    },

    TaggedTemplateExpression(node, initialScope) {
        const tag = getStaticValueR(node.tag, initialScope);
        const expressions = getElementValues(
            node.quasi.expressions,
            initialScope,
        );

        if (tag != null && expressions != null) {
            const func = /** @type {(...args: any[]) => any} */ (tag.value);
            /** @type {any[] & { raw?: string[] }} */
            const strings = node.quasi.quasis.map((q) => q.value.cooked);
            strings.raw = node.quasi.quasis.map((q) => q.value.raw);

            if (func === String.raw) {
                return { value: func(strings, ...expressions) }
            }
        }

        return null
    },

    TemplateLiteral(node, initialScope) {
        const expressions = getElementValues(node.expressions, initialScope);
        if (expressions != null) {
            let value = node.quasis[0].value.cooked;
            for (let i = 0; i < expressions.length; ++i) {
                value += expressions[i];
                value += /** @type {string} */ (node.quasis[i + 1].value.cooked);
            }
            return { value }
        }
        return null
    },

    UnaryExpression(node, initialScope) {
        if (node.operator === "delete") {
            // Not supported.
            return null
        }
        if (node.operator === "void") {
            return { value: undefined }
        }

        const arg = getStaticValueR(node.argument, initialScope);
        if (arg != null) {
            switch (node.operator) {
                case "-":
                    return { value: -(/** @type {any} */ (arg.value)) }
                case "+":
                    return { value: +(/** @type {any} */ (arg.value)) } //eslint-disable-line no-implicit-coercion
                case "!":
                    return { value: !arg.value }
                case "~":
                    return { value: ~(/** @type {any} */ (arg.value)) }
                case "typeof":
                    return { value: typeof arg.value }

                // no default
            }
        }

        return null
    },
    TSAsExpression(node, initialScope) {
        return getStaticValueR(node.expression, initialScope)
    },
    TSSatisfiesExpression(node, initialScope) {
        return getStaticValueR(node.expression, initialScope)
    },
    TSTypeAssertion(node, initialScope) {
        return getStaticValueR(node.expression, initialScope)
    },
    TSNonNullExpression(node, initialScope) {
        return getStaticValueR(node.expression, initialScope)
    },
    TSInstantiationExpression(node, initialScope) {
        return getStaticValueR(node.expression, initialScope)
    },
});

/**
 * Get the value of a given node if it's a static value.
 * @param {Node|TSESTreeNode|null|undefined} node The node to get.
 * @param {Scope|undefined|null} initialScope The scope to start finding variable.
 * @returns {StaticValue|null} The static value of the node, or `null`.
 */
function getStaticValueR(node, initialScope) {
    if (node != null && Object.hasOwnProperty.call(operations, node.type)) {
        return /** @type {VisitorCallback<any>} */ (operations[node.type])(
            /** @type {TSESTreeNode} */ (node),
            initialScope,
        )
    }
    return null
}

/**
 * Get the static value of property name from a MemberExpression node or a Property node.
 * @param {MemberExpression|Property} node The node to get.
 * @param {Scope|null} [initialScope] The scope to start finding variable. Optional. If the node is a computed property node and this scope was given, this checks the computed property name by the `getStringIfConstant` function with the scope, and returns the value of it.
 * @returns {StaticValue|null} The static value of the property name of the node, or `null`.
 */
function getStaticPropertyNameValue(node, initialScope) {
    const nameNode = node.type === "Property" ? node.key : node.property;

    if (node.computed) {
        return getStaticValueR(nameNode, initialScope)
    }

    if (nameNode.type === "Identifier") {
        return { value: nameNode.name }
    }

    if (nameNode.type === "Literal") {
        if (/** @type {Partial<BigIntLiteral>} */ (nameNode).bigint) {
            return { value: /** @type {BigIntLiteral} */ (nameNode).bigint }
        }
        return { value: String(nameNode.value) }
    }

    return null
}

/**
 * Get the value of a given node if it's a static value.
 * @param {Node} node The node to get.
 * @param {Scope|null} [initialScope] The scope to start finding variable. Optional. If this scope was given, this tries to resolve identifier references which are in the given node as much as possible.
 * @returns {StaticValue | null} The static value of the node, or `null`.
 */
function getStaticValue(node, initialScope = null) {
    try {
        return getStaticValueR(node, initialScope)
    } catch (_error) {
        return null
    }
}

/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("estree").Node} Node */
/** @typedef {import("estree").RegExpLiteral} RegExpLiteral */
/** @typedef {import("estree").BigIntLiteral} BigIntLiteral */
/** @typedef {import("estree").SimpleLiteral} SimpleLiteral */

/**
 * Get the value of a given node if it's a literal or a template literal.
 * @param {Node} node The node to get.
 * @param {Scope|null} [initialScope] The scope to start finding variable. Optional. If the node is an Identifier node and this scope was given, this checks the variable of the identifier, and returns the value of it if the variable is a constant.
 * @returns {string|null} The value of the node, or `null`.
 */
function getStringIfConstant(node, initialScope = null) {
    // Handle the literals that the platform doesn't support natively.
    if (node && node.type === "Literal" && node.value === null) {
        const literal =
            /** @type {Partial<SimpleLiteral> & Partial<RegExpLiteral> & Partial<BigIntLiteral>} */ (
                node
            );
        if (literal.regex) {
            return `/${literal.regex.pattern}/${literal.regex.flags}`
        }
        if (literal.bigint) {
            return literal.bigint
        }
    }

    const evaluated = getStaticValue(node, initialScope);

    if (evaluated) {
        // `String(Symbol.prototype)` throws error
        try {
            return String(evaluated.value)
        } catch {
            // No op
        }
    }

    return null
}

/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("estree").MemberExpression} MemberExpression */
/** @typedef {import("estree").MethodDefinition} MethodDefinition */
/** @typedef {import("estree").Property} Property */
/** @typedef {import("estree").PropertyDefinition} PropertyDefinition */
/** @typedef {import("estree").Identifier} Identifier */

/**
 * Get the property name from a MemberExpression node or a Property node.
 * @param {MemberExpression | MethodDefinition | Property | PropertyDefinition} node The node to get.
 * @param {Scope} [initialScope] The scope to start finding variable. Optional. If the node is a computed property node and this scope was given, this checks the computed property name by the `getStringIfConstant` function with the scope, and returns the value of it.
 * @returns {string|null|undefined} The property name of the node.
 */
function getPropertyName(node, initialScope) {
    switch (node.type) {
        case "MemberExpression":
            if (node.computed) {
                return getStringIfConstant(node.property, initialScope)
            }
            if (node.property.type === "PrivateIdentifier") {
                return null
            }
            return /** @type {Partial<Identifier>} */ (node.property).name

        case "Property":
        case "MethodDefinition":
        case "PropertyDefinition":
            if (node.computed) {
                return getStringIfConstant(node.key, initialScope)
            }
            if (node.key.type === "Literal") {
                return String(node.key.value)
            }
            if (node.key.type === "PrivateIdentifier") {
                return null
            }
            return /** @type {Partial<Identifier>} */ (node.key).name
    }

    return null
}

/** @typedef {import("eslint").Rule.Node} RuleNode */
/** @typedef {import("eslint").SourceCode} SourceCode */
/** @typedef {import("estree").Function} FunctionNode */
/** @typedef {import("estree").FunctionDeclaration} FunctionDeclaration */
/** @typedef {import("estree").FunctionExpression} FunctionExpression */
/** @typedef {import("estree").Identifier} Identifier */

/**
 * Get the name and kind of the given function node.
 * @param {FunctionNode} node - The function node to get.
 * @param {SourceCode} [sourceCode] The source code object to get the code of computed property keys.
 * @returns {string} The name and kind of the function node.
 */
// eslint-disable-next-line complexity
function getFunctionNameWithKind(node, sourceCode) {
    const parent = /** @type {RuleNode} */ (node).parent;
    const tokens = [];
    const isObjectMethod = parent.type === "Property" && parent.value === node;
    const isClassMethod =
        parent.type === "MethodDefinition" && parent.value === node;
    const isClassFieldMethod =
        parent.type === "PropertyDefinition" && parent.value === node;

    // Modifiers.
    if (isClassMethod || isClassFieldMethod) {
        if (parent.static) {
            tokens.push("static");
        }
        if (parent.key.type === "PrivateIdentifier") {
            tokens.push("private");
        }
    }
    if (node.async) {
        tokens.push("async");
    }
    if (node.generator) {
        tokens.push("generator");
    }

    // Kinds.
    if (isObjectMethod || isClassMethod) {
        if (parent.kind === "constructor") {
            return "constructor"
        }
        if (parent.kind === "get") {
            tokens.push("getter");
        } else if (parent.kind === "set") {
            tokens.push("setter");
        } else {
            tokens.push("method");
        }
    } else if (isClassFieldMethod) {
        tokens.push("method");
    } else {
        if (node.type === "ArrowFunctionExpression") {
            tokens.push("arrow");
        }
        tokens.push("function");
    }

    // Names.
    if (isObjectMethod || isClassMethod || isClassFieldMethod) {
        if (parent.key.type === "PrivateIdentifier") {
            tokens.push(`#${parent.key.name}`);
        } else {
            const name = getPropertyName(parent);
            if (name) {
                tokens.push(`'${name}'`);
            } else if (sourceCode) {
                const keyText = sourceCode.getText(parent.key);
                if (!keyText.includes("\n")) {
                    tokens.push(`[${keyText}]`);
                }
            }
        }
    } else if (hasId(node)) {
        tokens.push(`'${node.id.name}'`);
    } else if (
        parent.type === "VariableDeclarator" &&
        parent.id &&
        parent.id.type === "Identifier"
    ) {
        tokens.push(`'${parent.id.name}'`);
    } else if (
        (parent.type === "AssignmentExpression" ||
            parent.type === "AssignmentPattern") &&
        parent.left &&
        parent.left.type === "Identifier"
    ) {
        tokens.push(`'${parent.left.name}'`);
    } else if (
        parent.type === "ExportDefaultDeclaration" &&
        parent.declaration === node
    ) {
        tokens.push("'default'");
    }

    return tokens.join(" ")
}

/**
 * @param {FunctionNode} node
 * @returns {node is FunctionDeclaration | FunctionExpression & { id: Identifier }}
 */
function hasId(node) {
    return Boolean(
        /** @type {Partial<FunctionDeclaration | FunctionExpression>} */ (node)
            .id,
    )
}

/** @typedef {import("estree").Node} Node */
/** @typedef {import("eslint").SourceCode} SourceCode */
/** @typedef {import("./types.mjs").HasSideEffectOptions} HasSideEffectOptions */
/** @typedef {import("estree").BinaryExpression} BinaryExpression */
/** @typedef {import("estree").MemberExpression} MemberExpression */
/** @typedef {import("estree").MethodDefinition} MethodDefinition */
/** @typedef {import("estree").Property} Property */
/** @typedef {import("estree").PropertyDefinition} PropertyDefinition */
/** @typedef {import("estree").UnaryExpression} UnaryExpression */

const typeConversionBinaryOps = Object.freeze(
    new Set([
        "==",
        "!=",
        "<",
        "<=",
        ">",
        ">=",
        "<<",
        ">>",
        ">>>",
        "+",
        "-",
        "*",
        "/",
        "%",
        "|",
        "^",
        "&",
        "in",
    ]),
);
const typeConversionUnaryOps = Object.freeze(new Set(["-", "+", "!", "~"]));

/**
 * Check whether the given value is an ASTNode or not.
 * @param {any} x The value to check.
 * @returns {x is Node} `true` if the value is an ASTNode.
 */
function isNode(x) {
    return x !== null && typeof x === "object" && typeof x.type === "string"
}

const visitor = Object.freeze(
    Object.assign(Object.create(null), {
        /**
         * @param {Node} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        $visit(node, options, visitorKeys) {
            const { type } = node;

            if (typeof (/** @type {any} */ (this)[type]) === "function") {
                return /** @type {any} */ (this)[type](
                    node,
                    options,
                    visitorKeys,
                )
            }

            return this.$visitChildren(node, options, visitorKeys)
        },

        /**
         * @param {Node} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        $visitChildren(node, options, visitorKeys) {
            const { type } = node;

            for (const key of /** @type {(keyof Node)[]} */ (
                visitorKeys[type] || getKeys(node)
            )) {
                const value = node[key];

                if (Array.isArray(value)) {
                    for (const element of value) {
                        if (
                            isNode(element) &&
                            this.$visit(element, options, visitorKeys)
                        ) {
                            return true
                        }
                    }
                } else if (
                    isNode(value) &&
                    this.$visit(value, options, visitorKeys)
                ) {
                    return true
                }
            }

            return false
        },

        ArrowFunctionExpression() {
            return false
        },
        AssignmentExpression() {
            return true
        },
        AwaitExpression() {
            return true
        },
        /**
         * @param {BinaryExpression} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        BinaryExpression(node, options, visitorKeys) {
            if (
                options.considerImplicitTypeConversion &&
                typeConversionBinaryOps.has(node.operator) &&
                (node.left.type !== "Literal" || node.right.type !== "Literal")
            ) {
                return true
            }
            return this.$visitChildren(node, options, visitorKeys)
        },
        CallExpression() {
            return true
        },
        FunctionExpression() {
            return false
        },
        ImportExpression() {
            return true
        },
        /**
         * @param {MemberExpression} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        MemberExpression(node, options, visitorKeys) {
            if (options.considerGetters) {
                return true
            }
            if (
                options.considerImplicitTypeConversion &&
                node.computed &&
                node.property.type !== "Literal"
            ) {
                return true
            }
            return this.$visitChildren(node, options, visitorKeys)
        },
        /**
         * @param {MethodDefinition} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        MethodDefinition(node, options, visitorKeys) {
            if (
                options.considerImplicitTypeConversion &&
                node.computed &&
                node.key.type !== "Literal"
            ) {
                return true
            }
            return this.$visitChildren(node, options, visitorKeys)
        },
        NewExpression() {
            return true
        },
        /**
         * @param {Property} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        Property(node, options, visitorKeys) {
            if (
                options.considerImplicitTypeConversion &&
                node.computed &&
                node.key.type !== "Literal"
            ) {
                return true
            }
            return this.$visitChildren(node, options, visitorKeys)
        },
        /**
         * @param {PropertyDefinition} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        PropertyDefinition(node, options, visitorKeys) {
            if (
                options.considerImplicitTypeConversion &&
                node.computed &&
                node.key.type !== "Literal"
            ) {
                return true
            }
            return this.$visitChildren(node, options, visitorKeys)
        },
        /**
         * @param {UnaryExpression} node
         * @param {HasSideEffectOptions} options
         * @param {Record<string, string[]>} visitorKeys
         */
        UnaryExpression(node, options, visitorKeys) {
            if (node.operator === "delete") {
                return true
            }
            if (
                options.considerImplicitTypeConversion &&
                typeConversionUnaryOps.has(node.operator) &&
                node.argument.type !== "Literal"
            ) {
                return true
            }
            return this.$visitChildren(node, options, visitorKeys)
        },
        UpdateExpression() {
            return true
        },
        YieldExpression() {
            return true
        },
    }),
);

/**
 * Check whether a given node has any side effect or not.
 * @param {Node} node The node to get.
 * @param {SourceCode} sourceCode The source code object.
 * @param {HasSideEffectOptions} [options] The option object.
 * @returns {boolean} `true` if the node has a certain side effect.
 */
function hasSideEffect(node, sourceCode, options = {}) {
    const { considerGetters = false, considerImplicitTypeConversion = false } =
        options;
    return visitor.$visit(
        node,
        { considerGetters, considerImplicitTypeConversion },
        sourceCode.visitorKeys || KEYS,
    )
}

/** @typedef {import("estree").Node} Node */
/** @typedef {import("eslint").SourceCode} SourceCode */
/** @typedef {import("eslint").AST.Token} Token */
/** @typedef {import("eslint").Rule.Node} RuleNode */

/**
 * Get the left parenthesis of the parent node syntax if it exists.
 * E.g., `if (a) {}` then the `(`.
 * @param {Node} node The AST node to check.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {Token|null} The left parenthesis of the parent node syntax
 */
function getParentSyntaxParen(node, sourceCode) {
    const parent = /** @type {RuleNode} */ (node).parent;

    switch (parent.type) {
        case "CallExpression":
        case "NewExpression":
            if (parent.arguments.length === 1 && parent.arguments[0] === node) {
                return sourceCode.getTokenAfter(
                    parent.callee,
                    isOpeningParenToken,
                )
            }
            return null

        case "DoWhileStatement":
            if (parent.test === node) {
                return sourceCode.getTokenAfter(
                    parent.body,
                    isOpeningParenToken,
                )
            }
            return null

        case "IfStatement":
        case "WhileStatement":
            if (parent.test === node) {
                return sourceCode.getFirstToken(parent, 1)
            }
            return null

        case "ImportExpression":
            if (parent.source === node) {
                return sourceCode.getFirstToken(parent, 1)
            }
            return null

        case "SwitchStatement":
            if (parent.discriminant === node) {
                return sourceCode.getFirstToken(parent, 1)
            }
            return null

        case "WithStatement":
            if (parent.object === node) {
                return sourceCode.getFirstToken(parent, 1)
            }
            return null

        default:
            return null
    }
}

/**
 * Check whether a given node is parenthesized or not.
 * @param {number} times The number of parantheses.
 * @param {Node} node The AST node to check.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is parenthesized the given times.
 */
/**
 * Check whether a given node is parenthesized or not.
 * @param {Node} node The AST node to check.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is parenthesized.
 */
/**
 * Check whether a given node is parenthesized or not.
 * @param {Node|number} timesOrNode The first parameter.
 * @param {Node|SourceCode} nodeOrSourceCode The second parameter.
 * @param {SourceCode} [optionalSourceCode] The third parameter.
 * @returns {boolean} `true` if the node is parenthesized.
 */
function isParenthesized(
    timesOrNode,
    nodeOrSourceCode,
    optionalSourceCode,
) {
    /** @type {number} */
    let times,
        /** @type {RuleNode} */
        node,
        /** @type {SourceCode} */
        sourceCode,
        maybeLeftParen,
        maybeRightParen;
    if (typeof timesOrNode === "number") {
        times = timesOrNode | 0;
        node = /** @type {RuleNode} */ (nodeOrSourceCode);
        sourceCode = /** @type {SourceCode} */ (optionalSourceCode);
        if (!(times >= 1)) {
            throw new TypeError("'times' should be a positive integer.")
        }
    } else {
        times = 1;
        node = /** @type {RuleNode} */ (timesOrNode);
        sourceCode = /** @type {SourceCode} */ (nodeOrSourceCode);
    }

    if (
        node == null ||
        // `Program` can't be parenthesized
        node.parent == null ||
        // `CatchClause.param` can't be parenthesized, example `try {} catch (error) {}`
        (node.parent.type === "CatchClause" && node.parent.param === node)
    ) {
        return false
    }

    maybeLeftParen = maybeRightParen = node;
    do {
        maybeLeftParen = sourceCode.getTokenBefore(maybeLeftParen);
        maybeRightParen = sourceCode.getTokenAfter(maybeRightParen);
    } while (
        maybeLeftParen != null &&
        maybeRightParen != null &&
        isOpeningParenToken(maybeLeftParen) &&
        isClosingParenToken(maybeRightParen) &&
        // Avoid false positive such as `if (a) {}`
        maybeLeftParen !== getParentSyntaxParen(node, sourceCode) &&
        --times > 0
    )

    return times === 0
}

/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */

const placeholder = /\$(?:[$&`']|[1-9][0-9]?)/gu;

/** @type {WeakMap<PatternMatcher, {pattern:RegExp,escaped:boolean}>} */
const internal = new WeakMap();

/**
 * Check whether a given character is escaped or not.
 * @param {string} str The string to check.
 * @param {number} index The location of the character to check.
 * @returns {boolean} `true` if the character is escaped.
 */
function isEscaped(str, index) {
    let escaped = false;
    for (let i = index - 1; i >= 0 && str.charCodeAt(i) === 0x5c; --i) {
        escaped = !escaped;
    }
    return escaped
}

/**
 * Replace a given string by a given matcher.
 * @param {PatternMatcher} matcher The pattern matcher.
 * @param {string} str The string to be replaced.
 * @param {string} replacement The new substring to replace each matched part.
 * @returns {string} The replaced string.
 */
function replaceS(matcher, str, replacement) {
    const chunks = [];
    let index = 0;

    /**
     * @param {string} key The placeholder.
     * @param {RegExpExecArray} match The matched information.
     * @returns {string} The replaced string.
     */
    function replacer(key, match) {
        switch (key) {
            case "$$":
                return "$"
            case "$&":
                return match[0]
            case "$`":
                return str.slice(0, match.index)
            case "$'":
                return str.slice(match.index + match[0].length)
            default: {
                const i = key.slice(1);
                if (i in match) {
                    return match[/** @type {any} */ (i)]
                }
                return key
            }
        }
    }

    for (const match of matcher.execAll(str)) {
        chunks.push(str.slice(index, match.index));
        chunks.push(
            replacement.replace(placeholder, (key) => replacer(key, match)),
        );
        index = match.index + match[0].length;
    }
    chunks.push(str.slice(index));

    return chunks.join("")
}

/**
 * Replace a given string by a given matcher.
 * @param {PatternMatcher} matcher The pattern matcher.
 * @param {string} str The string to be replaced.
 * @param {(substring: string, ...args: any[]) => string} replace The function to replace each matched part.
 * @returns {string} The replaced string.
 */
function replaceF(matcher, str, replace) {
    const chunks = [];
    let index = 0;

    for (const match of matcher.execAll(str)) {
        chunks.push(str.slice(index, match.index));
        chunks.push(
            String(
                replace(
                    .../** @type {[string, ...string[]]} */ (
                        /** @type {string[]} */ (match)
                    ),
                    match.index,
                    match.input,
                ),
            ),
        );
        index = match.index + match[0].length;
    }
    chunks.push(str.slice(index));

    return chunks.join("")
}

/**
 * The class to find patterns as considering escape sequences.
 */
class PatternMatcher {
    /**
     * Initialize this matcher.
     * @param {RegExp} pattern The pattern to match.
     * @param {{escaped?:boolean}} [options] The options.
     */
    constructor(pattern, options = {}) {
        const { escaped = false } = options;
        if (!(pattern instanceof RegExp)) {
            throw new TypeError("'pattern' should be a RegExp instance.")
        }
        if (!pattern.flags.includes("g")) {
            throw new Error("'pattern' should contains 'g' flag.")
        }

        internal.set(this, {
            pattern: new RegExp(pattern.source, pattern.flags),
            escaped: Boolean(escaped),
        });
    }

    /**
     * Find the pattern in a given string.
     * @param {string} str The string to find.
     * @returns {IterableIterator<RegExpExecArray>} The iterator which iterate the matched information.
     */
    *execAll(str) {
        const { pattern, escaped } =
            /** @type {{pattern:RegExp,escaped:boolean}} */ (internal.get(this));
        let match = null;
        let lastIndex = 0;

        pattern.lastIndex = 0;
        while ((match = pattern.exec(str)) != null) {
            if (escaped || !isEscaped(str, match.index)) {
                lastIndex = pattern.lastIndex;
                yield match;
                pattern.lastIndex = lastIndex;
            }
        }
    }

    /**
     * Check whether the pattern is found in a given string.
     * @param {string} str The string to check.
     * @returns {boolean} `true` if the pattern was found in the string.
     */
    test(str) {
        const it = this.execAll(str);
        const ret = it.next();
        return !ret.done
    }

    /**
     * Replace a given string.
     * @param {string} str The string to be replaced.
     * @param {(string|((...strs:string[])=>string))} replacer The string or function to replace. This is the same as the 2nd argument of `String.prototype.replace`.
     * @returns {string} The replaced string.
     */
    [Symbol.replace](str, replacer) {
        return typeof replacer === "function"
            ? replaceF(this, String(str), replacer)
            : replaceS(this, String(str), String(replacer))
    }
}

/** @typedef {import("eslint").Scope.Scope} Scope */
/** @typedef {import("eslint").Scope.Variable} Variable */
/** @typedef {import("eslint").Rule.Node} RuleNode */
/** @typedef {import("estree").Node} Node */
/** @typedef {import("estree").Expression} Expression */
/** @typedef {import("estree").Pattern} Pattern */
/** @typedef {import("estree").Identifier} Identifier */
/** @typedef {import("estree").SimpleCallExpression} CallExpression */
/** @typedef {import("estree").Program} Program */
/** @typedef {import("estree").ImportDeclaration} ImportDeclaration */
/** @typedef {import("estree").ExportAllDeclaration} ExportAllDeclaration */
/** @typedef {import("estree").ExportDefaultDeclaration} ExportDefaultDeclaration */
/** @typedef {import("estree").ExportNamedDeclaration} ExportNamedDeclaration */
/** @typedef {import("estree").ImportSpecifier} ImportSpecifier */
/** @typedef {import("estree").ImportDefaultSpecifier} ImportDefaultSpecifier */
/** @typedef {import("estree").ImportNamespaceSpecifier} ImportNamespaceSpecifier */
/** @typedef {import("estree").ExportSpecifier} ExportSpecifier */
/** @typedef {import("estree").Property} Property */
/** @typedef {import("estree").AssignmentProperty} AssignmentProperty */
/** @typedef {import("estree").Literal} Literal */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} TSESTreeNode */
/** @typedef {import("./types.mjs").ReferenceTrackerOptions} ReferenceTrackerOptions */
/**
 * @template T
 * @typedef {import("./types.mjs").TraceMap<T>} TraceMap
 */
/**
 * @template T
 * @typedef {import("./types.mjs").TraceMapObject<T>} TraceMapObject
 */
/**
 * @template T
 * @typedef {import("./types.mjs").TrackedReferences<T>} TrackedReferences
 */

const IMPORT_TYPE = /^(?:Import|Export(?:All|Default|Named))Declaration$/u;

/**
 * Check whether a given node is an import node or not.
 * @param {Node} node
 * @returns {node is ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration&{source: Literal}} `true` if the node is an import node.
 */
function isHasSource(node) {
    return (
        IMPORT_TYPE.test(node.type) &&
        /** @type {ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration} */ (
            node
        ).source != null
    )
}
const has =
    /** @type {<T>(traceMap: TraceMap<unknown>, v: T) => v is (string extends T ? string : T)} */ (
        Function.call.bind(Object.hasOwnProperty)
    );

const READ = Symbol("read");
const CALL = Symbol("call");
const CONSTRUCT = Symbol("construct");
const ESM = Symbol("esm");

const requireCall = { require: { [CALL]: true } };

/**
 * Check whether a given variable is modified or not.
 * @param {Variable|undefined} variable The variable to check.
 * @returns {boolean} `true` if the variable is modified.
 */
function isModifiedGlobal(variable) {
    return (
        variable == null ||
        variable.defs.length !== 0 ||
        variable.references.some((r) => r.isWrite())
    )
}

/**
 * Check if the value of a given node is passed through to the parent syntax as-is.
 * For example, `a` and `b` in (`a || b` and `c ? a : b`) are passed through.
 * @param {Node} node A node to check.
 * @returns {node is RuleNode & {parent: Expression}} `true` if the node is passed through.
 */
function isPassThrough(node) {
    const parent = /** @type {TSESTreeNode} */ (node).parent;

    if (parent) {
        switch (parent.type) {
            case "ConditionalExpression":
                return parent.consequent === node || parent.alternate === node
            case "LogicalExpression":
                return true
            case "SequenceExpression":
                return (
                    parent.expressions[parent.expressions.length - 1] === node
                )
            case "ChainExpression":
                return true
            case "TSAsExpression":
            case "TSSatisfiesExpression":
            case "TSTypeAssertion":
            case "TSNonNullExpression":
            case "TSInstantiationExpression":
                return true

            default:
                return false
        }
    }
    return false
}

/**
 * The reference tracker.
 */
class ReferenceTracker {
    /**
     * Initialize this tracker.
     * @param {Scope} globalScope The global scope.
     * @param {object} [options] The options.
     * @param {"legacy"|"strict"} [options.mode="strict"] The mode to determine the ImportDeclaration's behavior for CJS modules.
     * @param {string[]} [options.globalObjectNames=["global","globalThis","self","window"]] The variable names for Global Object.
     */
    constructor(globalScope, options = {}) {
        const {
            mode = "strict",
            globalObjectNames = ["global", "globalThis", "self", "window"],
        } = options;
        /** @private @type {Variable[]} */
        this.variableStack = [];
        /** @private */
        this.globalScope = globalScope;
        /** @private */
        this.mode = mode;
        /** @private */
        this.globalObjectNames = globalObjectNames.slice(0);
    }

    /**
     * Iterate the references of global variables.
     * @template T
     * @param {TraceMap<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    *iterateGlobalReferences(traceMap) {
        for (const key of Object.keys(traceMap)) {
            const nextTraceMap = traceMap[key];
            const path = [key];
            const variable = this.globalScope.set.get(key);

            if (isModifiedGlobal(variable)) {
                continue
            }

            yield* this._iterateVariableReferences(
                /** @type {Variable} */ (variable),
                path,
                nextTraceMap,
                true,
            );
        }

        for (const key of this.globalObjectNames) {
            /** @type {string[]} */
            const path = [];
            const variable = this.globalScope.set.get(key);

            if (isModifiedGlobal(variable)) {
                continue
            }

            yield* this._iterateVariableReferences(
                /** @type {Variable} */ (variable),
                path,
                traceMap,
                false,
            );
        }
    }

    /**
     * Iterate the references of CommonJS modules.
     * @template T
     * @param {TraceMap<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    *iterateCjsReferences(traceMap) {
        for (const { node } of this.iterateGlobalReferences(requireCall)) {
            const key = getStringIfConstant(
                /** @type {CallExpression} */ (node).arguments[0],
            );
            if (key == null || !has(traceMap, key)) {
                continue
            }

            const nextTraceMap = traceMap[key];
            const path = [key];

            if (nextTraceMap[READ]) {
                yield {
                    node,
                    path,
                    type: READ,
                    info: nextTraceMap[READ],
                };
            }
            yield* this._iteratePropertyReferences(
                /** @type {CallExpression} */ (node),
                path,
                nextTraceMap,
            );
        }
    }

    /**
     * Iterate the references of ES modules.
     * @template T
     * @param {TraceMap<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    *iterateEsmReferences(traceMap) {
        const programNode = /** @type {Program} */ (this.globalScope.block);

        for (const node of programNode.body) {
            if (!isHasSource(node)) {
                continue
            }
            const moduleId = /** @type {string} */ (node.source.value);

            if (!has(traceMap, moduleId)) {
                continue
            }
            const nextTraceMap = traceMap[moduleId];
            const path = [moduleId];

            if (nextTraceMap[READ]) {
                yield {
                    // eslint-disable-next-line object-shorthand -- apply type
                    node: /** @type {RuleNode} */ (node),
                    path,
                    type: READ,
                    info: nextTraceMap[READ],
                };
            }

            if (node.type === "ExportAllDeclaration") {
                for (const key of Object.keys(nextTraceMap)) {
                    const exportTraceMap = nextTraceMap[key];
                    if (exportTraceMap[READ]) {
                        yield {
                            // eslint-disable-next-line object-shorthand -- apply type
                            node: /** @type {RuleNode} */ (node),
                            path: path.concat(key),
                            type: READ,
                            info: exportTraceMap[READ],
                        };
                    }
                }
            } else {
                for (const specifier of node.specifiers) {
                    const esm = has(nextTraceMap, ESM);
                    const it = this._iterateImportReferences(
                        specifier,
                        path,
                        esm
                            ? nextTraceMap
                            : this.mode === "legacy"
                            ? { default: nextTraceMap, ...nextTraceMap }
                            : { default: nextTraceMap },
                    );

                    if (esm) {
                        yield* it;
                    } else {
                        for (const report of it) {
                            report.path = report.path.filter(exceptDefault);
                            if (
                                report.path.length >= 2 ||
                                report.type !== READ
                            ) {
                                yield report;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Iterate the property references for a given expression AST node.
     * @template T
     * @param {Expression} node The expression AST node to iterate property references.
     * @param {TraceMap<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate property references.
     */
    *iteratePropertyReferences(node, traceMap) {
        yield* this._iteratePropertyReferences(node, [], traceMap);
    }

    /**
     * Iterate the references for a given variable.
     * @private
     * @template T
     * @param {Variable} variable The variable to iterate that references.
     * @param {string[]} path The current path.
     * @param {TraceMapObject<T>} traceMap The trace map.
     * @param {boolean} shouldReport = The flag to report those references.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    *_iterateVariableReferences(variable, path, traceMap, shouldReport) {
        if (this.variableStack.includes(variable)) {
            return
        }
        this.variableStack.push(variable);
        try {
            for (const reference of variable.references) {
                if (!reference.isRead()) {
                    continue
                }
                const node = /** @type {RuleNode & Identifier} */ (
                    reference.identifier
                );

                if (shouldReport && traceMap[READ]) {
                    yield { node, path, type: READ, info: traceMap[READ] };
                }
                yield* this._iteratePropertyReferences(node, path, traceMap);
            }
        } finally {
            this.variableStack.pop();
        }
    }

    /**
     * Iterate the references for a given AST node.
     * @private
     * @template T
     * @param {Expression} rootNode The AST node to iterate references.
     * @param {string[]} path The current path.
     * @param {TraceMapObject<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    //eslint-disable-next-line complexity
    *_iteratePropertyReferences(rootNode, path, traceMap) {
        let node = rootNode;
        while (isPassThrough(node)) {
            node = node.parent;
        }

        const parent = /** @type {RuleNode} */ (node).parent;
        if (parent.type === "MemberExpression") {
            if (parent.object === node) {
                const key = getPropertyName(parent);
                if (key == null || !has(traceMap, key)) {
                    return
                }

                path = path.concat(key); //eslint-disable-line no-param-reassign
                const nextTraceMap = traceMap[key];
                if (nextTraceMap[READ]) {
                    yield {
                        node: parent,
                        path,
                        type: READ,
                        info: nextTraceMap[READ],
                    };
                }
                yield* this._iteratePropertyReferences(
                    parent,
                    path,
                    nextTraceMap,
                );
            }
            return
        }
        if (parent.type === "CallExpression") {
            if (parent.callee === node && traceMap[CALL]) {
                yield { node: parent, path, type: CALL, info: traceMap[CALL] };
            }
            return
        }
        if (parent.type === "NewExpression") {
            if (parent.callee === node && traceMap[CONSTRUCT]) {
                yield {
                    node: parent,
                    path,
                    type: CONSTRUCT,
                    info: traceMap[CONSTRUCT],
                };
            }
            return
        }
        if (parent.type === "AssignmentExpression") {
            if (parent.right === node) {
                yield* this._iterateLhsReferences(parent.left, path, traceMap);
                yield* this._iteratePropertyReferences(parent, path, traceMap);
            }
            return
        }
        if (parent.type === "AssignmentPattern") {
            if (parent.right === node) {
                yield* this._iterateLhsReferences(parent.left, path, traceMap);
            }
            return
        }
        if (parent.type === "VariableDeclarator") {
            if (parent.init === node) {
                yield* this._iterateLhsReferences(parent.id, path, traceMap);
            }
        }
    }

    /**
     * Iterate the references for a given Pattern node.
     * @private
     * @template T
     * @param {Pattern} patternNode The Pattern node to iterate references.
     * @param {string[]} path The current path.
     * @param {TraceMapObject<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    *_iterateLhsReferences(patternNode, path, traceMap) {
        if (patternNode.type === "Identifier") {
            const variable = findVariable(this.globalScope, patternNode);
            if (variable != null) {
                yield* this._iterateVariableReferences(
                    variable,
                    path,
                    traceMap,
                    false,
                );
            }
            return
        }
        if (patternNode.type === "ObjectPattern") {
            for (const property of patternNode.properties) {
                const key = getPropertyName(
                    /** @type {AssignmentProperty} */ (property),
                );

                if (key == null || !has(traceMap, key)) {
                    continue
                }

                const nextPath = path.concat(key);
                const nextTraceMap = traceMap[key];
                if (nextTraceMap[READ]) {
                    yield {
                        node: /** @type {RuleNode} */ (property),
                        path: nextPath,
                        type: READ,
                        info: nextTraceMap[READ],
                    };
                }
                yield* this._iterateLhsReferences(
                    /** @type {AssignmentProperty} */ (property).value,
                    nextPath,
                    nextTraceMap,
                );
            }
            return
        }
        if (patternNode.type === "AssignmentPattern") {
            yield* this._iterateLhsReferences(patternNode.left, path, traceMap);
        }
    }

    /**
     * Iterate the references for a given ModuleSpecifier node.
     * @private
     * @template T
     * @param {ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier} specifierNode The ModuleSpecifier node to iterate references.
     * @param {string[]} path The current path.
     * @param {TraceMapObject<T>} traceMap The trace map.
     * @returns {IterableIterator<TrackedReferences<T>>} The iterator to iterate references.
     */
    *_iterateImportReferences(specifierNode, path, traceMap) {
        const type = specifierNode.type;

        if (type === "ImportSpecifier" || type === "ImportDefaultSpecifier") {
            const key =
                type === "ImportDefaultSpecifier"
                    ? "default"
                    : specifierNode.imported.type === "Identifier"
                    ? specifierNode.imported.name
                    : specifierNode.imported.value;
            if (!has(traceMap, key)) {
                return
            }

            path = path.concat(key); //eslint-disable-line no-param-reassign
            const nextTraceMap = traceMap[key];
            if (nextTraceMap[READ]) {
                yield {
                    node: /** @type {RuleNode} */ (specifierNode),
                    path,
                    type: READ,
                    info: nextTraceMap[READ],
                };
            }
            yield* this._iterateVariableReferences(
                /** @type {Variable} */ (
                    findVariable(this.globalScope, specifierNode.local)
                ),
                path,
                nextTraceMap,
                false,
            );

            return
        }

        if (type === "ImportNamespaceSpecifier") {
            yield* this._iterateVariableReferences(
                /** @type {Variable} */ (
                    findVariable(this.globalScope, specifierNode.local)
                ),
                path,
                traceMap,
                false,
            );
            return
        }

        if (type === "ExportSpecifier") {
            const key =
                specifierNode.local.type === "Identifier"
                    ? specifierNode.local.name
                    : specifierNode.local.value;
            if (!has(traceMap, key)) {
                return
            }

            path = path.concat(key); //eslint-disable-line no-param-reassign
            const nextTraceMap = traceMap[key];
            if (nextTraceMap[READ]) {
                yield {
                    node: /** @type {RuleNode} */ (specifierNode),
                    path,
                    type: READ,
                    info: nextTraceMap[READ],
                };
            }
        }
    }
}

ReferenceTracker.READ = READ;
ReferenceTracker.CALL = CALL;
ReferenceTracker.CONSTRUCT = CONSTRUCT;
ReferenceTracker.ESM = ESM;

/**
 * This is a predicate function for Array#filter.
 * @param {string} name A name part.
 * @param {number} index The index of the name.
 * @returns {boolean} `false` if it's default.
 */
function exceptDefault(name, index) {
    return !(index === 1 && name === "default")
}

/** @typedef {import("./types.mjs").StaticValue} StaticValue */

var index = {
    CALL,
    CONSTRUCT,
    ESM,
    findVariable,
    getFunctionHeadLocation,
    getFunctionNameWithKind,
    getInnermostScope,
    getPropertyName,
    getStaticValue,
    getStringIfConstant,
    hasSideEffect,
    isArrowToken,
    isClosingBraceToken,
    isClosingBracketToken,
    isClosingParenToken,
    isColonToken,
    isCommaToken,
    isCommentToken,
    isNotArrowToken,
    isNotClosingBraceToken,
    isNotClosingBracketToken,
    isNotClosingParenToken,
    isNotColonToken,
    isNotCommaToken,
    isNotCommentToken,
    isNotOpeningBraceToken,
    isNotOpeningBracketToken,
    isNotOpeningParenToken,
    isNotSemicolonToken,
    isOpeningBraceToken,
    isOpeningBracketToken,
    isOpeningParenToken,
    isParenthesized,
    isSemicolonToken,
    PatternMatcher,
    READ,
    ReferenceTracker,
};

export { CALL, CONSTRUCT, ESM, PatternMatcher, READ, ReferenceTracker, index as default, findVariable, getFunctionHeadLocation, getFunctionNameWithKind, getInnermostScope, getPropertyName, getStaticValue, getStringIfConstant, hasSideEffect, isArrowToken, isClosingBraceToken, isClosingBracketToken, isClosingParenToken, isColonToken, isCommaToken, isCommentToken, isNotArrowToken, isNotClosingBraceToken, isNotClosingBracketToken, isNotClosingParenToken, isNotColonToken, isNotCommaToken, isNotCommentToken, isNotOpeningBraceToken, isNotOpeningBracketToken, isNotOpeningParenToken, isNotSemicolonToken, isOpeningBraceToken, isOpeningBracketToken, isOpeningParenToken, isParenthesized, isSemicolonToken };
//# sourceMappingURL=index.mjs.map


var ast = /*#__PURE__*/Object.freeze({
    __proto__: null
});

const latestEcmaVersion = 2025;

let largeIdStartRanges = undefined;
let largeIdContinueRanges = undefined;
function isIdStart(cp) {
    if (cp < 0x41)
        return false;
    if (cp < 0x5b)
        return true;
    if (cp < 0x61)
        return false;
    if (cp < 0x7b)
        return true;
    return isLargeIdStart(cp);
}
function isIdContinue(cp) {
    if (cp < 0x30)
        return false;
    if (cp < 0x3a)
        return true;
    if (cp < 0x41)
        return false;
    if (cp < 0x5b)
        return true;
    if (cp === 0x5f)
        return true;
    if (cp < 0x61)
        return false;
    if (cp < 0x7b)
        return true;
    return isLargeIdStart(cp) || isLargeIdContinue(cp);
}
function isLargeIdStart(cp) {
    return isInRange(cp, largeIdStartRanges !== null && largeIdStartRanges !== void 0 ? largeIdStartRanges : (largeIdStartRanges = initLargeIdStartRanges()));
}
function isLargeIdContinue(cp) {
    return isInRange(cp, largeIdContinueRanges !== null && largeIdContinueRanges !== void 0 ? largeIdContinueRanges : (largeIdContinueRanges = initLargeIdContinueRanges()));
}
function initLargeIdStartRanges() {
    return restoreRanges("4q 0 b 0 5 0 6 m 2 u 2 cp 5 b f 4 8 0 2 0 3m 4 2 1 3 3 2 0 7 0 2 2 2 0 2 j 2 2a 2 3u 9 4l 2 11 3 0 7 14 20 q 5 3 1a 16 10 1 2 2q 2 0 g 1 8 1 b 2 3 0 h 0 2 t u 2g c 0 p w a 1 5 0 6 l 5 0 a 0 4 0 o o 8 a 6 n 2 5 i 15 1n 1h 4 0 j 0 8 9 g f 5 7 3 1 3 l 2 6 2 0 4 3 4 0 h 0 e 1 2 2 f 1 b 0 9 5 5 1 3 l 2 6 2 1 2 1 2 1 w 3 2 0 k 2 h 8 2 2 2 l 2 6 2 1 2 4 4 0 j 0 g 1 o 0 c 7 3 1 3 l 2 6 2 1 2 4 4 0 v 1 2 2 g 0 i 0 2 5 4 2 2 3 4 1 2 0 2 1 4 1 4 2 4 b n 0 1h 7 2 2 2 m 2 f 4 0 r 2 3 0 3 1 v 0 5 7 2 2 2 m 2 9 2 4 4 0 w 1 2 1 g 1 i 8 2 2 2 14 3 0 h 0 6 2 9 2 p 5 6 h 4 n 2 8 2 0 3 6 1n 1b 2 1 d 6 1n 1 2 0 2 4 2 n 2 0 2 9 2 1 a 0 3 4 2 0 m 3 x 0 1s 7 2 z s 4 38 16 l 0 h 5 5 3 4 0 4 1 8 2 5 c d 0 i 11 2 0 6 0 3 16 2 98 2 3 3 6 2 0 2 3 3 14 2 3 3 w 2 3 3 6 2 0 2 3 3 e 2 1k 2 3 3 1u 12 f h 2d 3 5 4 h7 3 g 2 p 6 22 4 a 8 h e i f h f c 2 2 g 1f 10 0 5 0 1w 2g 8 14 2 0 6 1x b u 1e t 3 4 c 17 5 p 1j m a 1g 2b 0 2m 1a i 7 1j t e 1 b 17 r z 16 2 b z 3 a 6 16 3 2 16 3 2 5 2 1 4 0 6 5b 1t 7p 3 5 3 11 3 5 3 7 2 0 2 0 2 0 2 u 3 1g 2 6 2 0 4 2 2 6 4 3 3 5 5 c 6 2 2 6 39 0 e 0 h c 2u 0 5 0 3 9 2 0 3 5 7 0 2 0 2 0 2 f 3 3 6 4 5 0 i 14 22g 6c 7 3 4 1 d 11 2 0 6 0 3 1j 8 0 h m a 6 2 6 2 6 2 6 2 6 2 6 2 6 2 6 fb 2 q 8 8 4 3 4 5 2d 5 4 2 2h 2 3 6 16 2 2l i v 1d f e9 533 1t h3g 1w 19 3 7g 4 f b 1 l 1a h u 3 27 14 8 3 2u 3 1u 3 1 2 0 2 7 m f 2 2 2 3 2 m u 1f f 1d 1r 5 4 0 2 1 c r b m q s 8 1a t 0 h 4 2 9 b 4 2 14 o 2 2 7 l m 4 0 4 1d 2 0 4 1 3 4 3 0 2 0 p 2 3 a 8 2 d 5 3 5 3 5 a 6 2 6 2 16 2 d 7 36 u 8mb d m 5 1c 6it a5 3 2x 13 6 d 4 6 0 2 9 2 c 2 4 2 0 2 1 2 1 2 2z y a2 j 1r 3 1h 15 b 39 4 2 3q 11 p 7 p c 2g 4 5 3 5 3 5 3 2 10 b 2 p 2 i 2 1 2 e 3 d z 3e 1y 1g 7g s 4 1c 1c v e t 6 11 b t 3 z 5 7 2 4 17 4d j z 5 z 5 13 9 1f d a 2 e 2 6 2 1 2 a 2 e 2 6 2 1 4 1f d 8m a l b 7 p 5 2 15 2 8 1y 5 3 0 2 17 2 1 4 0 3 m b m a u 1u i 2 1 b l b p 1z 1j 7 1 1t 0 g 3 2 2 2 s 17 s 4 s 10 7 2 r s 1h b l b i e h 33 20 1k 1e e 1e e z 13 r a m 6z 15 7 1 h 2 1o s b 0 9 l 17 h 1b k s m d 1g 1m 1 3 0 e 18 x o r z u 0 3 0 9 y 4 0 d 1b f 3 m 0 2 0 10 h 2 o k 1 1s 6 2 0 2 3 2 e 2 9 8 1a 13 7 3 1 3 l 2 6 2 1 2 4 4 0 j 0 d 4 v 9 2 0 3 0 2 11 2 0 q 0 2 0 19 1g j 3 l 2 v 1b l 1 2 0 55 1a 16 3 11 1b l 0 1o 16 e 0 20 q 12 6 56 17 39 1r w 7 3 0 3 7 2 1 2 n g 0 2 0 2n 7 3 12 h 0 2 0 t 0 b 13 8 0 m 0 c 19 k 0 j 20 5k w w 8 2 10 i 0 1e t 35 6 2 1 2 11 m 0 q 5 2 1 2 v f 0 94 i g 0 2 c 2 x 3h 0 28 pl 2v 32 i 5f 219 2o g tr i 5 q 32y 6 g6 5a2 t 1cz fs 8 u i 26 i t j 1b h 3 w k 6 i c1 18 5w 1r 3l 22 6 0 1v c 1t 1 2 0 t 4qf 9 yd 16 9 6w8 3 2 6 2 1 2 82 g 0 u 2 3 0 f 3 9 az 1s5 2y 6 c 4 8 8 9 4mf 2c 2 1y 2 1 3 0 3 1 3 3 2 b 2 0 2 6 2 1s 2 3 3 7 2 6 2 r 2 3 2 4 2 0 4 6 2 9f 3 o 2 o 2 u 2 o 2 u 2 o 2 u 2 o 2 u 2 o 2 7 1f9 u 7 5 7a 1p 43 18 b 6 h 0 8y t j 17 dh r 6d t 3 0 ds 6 2 3 2 1 2 e 2 5g 1o 1v 8 0 xh 3 2 q 2 1 2 0 3 0 2 9 2 3 2 0 2 0 7 0 5 0 2 0 2 0 2 2 2 1 2 0 3 0 2 0 2 0 2 0 2 0 2 1 2 0 3 3 2 6 2 3 2 3 2 0 2 9 2 g 6 2 2 4 2 g 3et wyn x 37d 7 65 3 4g1 f 5rk g h9 1wj f1 15v 3t6 6 38f");
}
function initLargeIdContinueRanges() {
    return restoreRanges("53 0 g9 33 o 0 70 4 7e 18 2 0 2 1 2 1 2 0 21 a 1d u 7 0 2u 6 3 5 3 1 2 3 3 9 o 0 v q 2k a g 9 y 8 a 0 p 3 2 8 2 2 2 4 18 2 1o 8 17 n 2 w 1j 2 2 h 2 6 b 1 3 9 i 2 1l 0 2 6 3 1 3 2 a 0 b 1 3 9 f 0 3 2 1l 0 2 4 5 1 3 2 4 0 l b 4 0 c 2 1l 0 2 7 2 2 2 2 l 1 3 9 b 5 2 2 1l 0 2 6 3 1 3 2 8 2 b 1 3 9 j 0 1o 4 4 2 2 3 a 0 f 9 h 4 1k 0 2 6 2 2 2 3 8 1 c 1 3 9 i 2 1l 0 2 6 2 2 2 3 8 1 c 1 3 9 4 0 d 3 1k 1 2 6 2 2 2 3 a 0 b 1 3 9 i 2 1z 0 5 5 2 0 2 7 7 9 3 1 1q 0 3 6 d 7 2 9 2g 0 3 8 c 6 2 9 1r 1 7 9 c 0 2 0 2 0 5 1 1e j 2 1 6 a 2 z a 0 2t j 2 9 d 3 5 2 2 2 3 6 4 3 e b 2 e jk 2 a 8 pt 3 t 2 u 1 v 1 1t v a 0 3 9 y 2 2 a 40 0 3b b 5 b b 9 3l a 1p 4 1m 9 2 s 3 a 7 9 n d 2 f 1e 4 1c g c 9 i 8 d 2 v c 3 9 19 d 1d j 9 9 7 9 3b 2 2 k 5 0 7 0 3 2 5j 1r el 1 1e 1 k 0 3g c 5 0 4 b 2db 2 3y 0 2p v ff 5 2y 1 2p 0 n51 9 1y 0 5 9 x 1 29 1 7l 0 4 0 5 0 o 4 5 0 2c 1 1f h b 9 7 h e a t 7 q c 19 3 1c d g 9 c 0 b 9 1c d d 0 9 1 3 9 y 2 1f 0 2 2 3 1 6 1 2 0 16 4 6 1 6l 7 2 1 3 9 fmt 0 ki f h f 4 1 p 2 5d 9 12 0 12 0 ig 0 6b 0 46 4 86 9 120 2 2 1 6 3 15 2 5 0 4m 1 fy 3 9 9 7 9 w 4 8u 1 28 3 1z a 1e 3 3f 2 1i e w a 3 1 b 3 1a a 8 0 1a 9 7 2 11 d 2 9 6 1 19 0 d 2 1d d 9 3 2 b 2b b 7 0 3 0 4e b 6 9 7 3 1k 1 2 6 3 1 3 2 a 0 b 1 3 6 4 4 1w 8 2 0 3 0 2 3 2 4 2 0 f 1 2b h a 9 5 0 2a j d 9 5y 6 3 8 s 1 2b g g 9 2a c 9 9 7 j 1m e 5 9 6r e 4m 9 1z 5 2 1 3 3 2 0 2 1 d 9 3c 6 3 6 4 0 t 9 15 6 2 3 9 0 a a 1b f 9j 9 1i 7 2 7 h 9 1l l 2 d 3f 5 4 0 2 1 2 6 2 0 9 9 1d 4 2 1 2 4 9 9 96 3 a 1 2 0 1d 6 4 4 e a 44m 0 7 e 8uh r 1t3 9 2f 9 13 4 1o 6 q 9 ev 9 d2 0 2 1i 8 3 2a 0 c 1 f58 1 382 9 ef 19 3 m f3 4 4 5 9 7 3 6 v 3 45 2 13e 1d e9 1i 5 1d 9 0 f 0 n 4 2 e 11t 6 2 g 3 6 2 1 2 4 2t 0 4h 6 a 9 9x 0 1q d dv d 6t 1 2 9 k6 6 32 6 6 9 3o7 9 gvt3 6n");
}
function isInRange(cp, ranges) {
    let l = 0, r = (ranges.length / 2) | 0, i = 0, min = 0, max = 0;
    while (l < r) {
        i = ((l + r) / 2) | 0;
        min = ranges[2 * i];
        max = ranges[2 * i + 1];
        if (cp < min) {
            r = i;
        }
        else if (cp > max) {
            l = i + 1;
        }
        else {
            return true;
        }
    }
    return false;
}
function restoreRanges(data) {
    let last = 0;
    return data.split(" ").map((s) => (last += parseInt(s, 36) | 0));
}

class DataSet {
    constructor(raw2018, raw2019, raw2020, raw2021, raw2022, raw2023, raw2024, raw2025) {
        this._raw2018 = raw2018;
        this._raw2019 = raw2019;
        this._raw2020 = raw2020;
        this._raw2021 = raw2021;
        this._raw2022 = raw2022;
        this._raw2023 = raw2023;
        this._raw2024 = raw2024;
        this._raw2025 = raw2025;
    }
    get es2018() {
        var _a;
        return ((_a = this._set2018) !== null && _a !== void 0 ? _a : (this._set2018 = new Set(this._raw2018.split(" "))));
    }
    get es2019() {
        var _a;
        return ((_a = this._set2019) !== null && _a !== void 0 ? _a : (this._set2019 = new Set(this._raw2019.split(" "))));
    }
    get es2020() {
        var _a;
        return ((_a = this._set2020) !== null && _a !== void 0 ? _a : (this._set2020 = new Set(this._raw2020.split(" "))));
    }
    get es2021() {
        var _a;
        return ((_a = this._set2021) !== null && _a !== void 0 ? _a : (this._set2021 = new Set(this._raw2021.split(" "))));
    }
    get es2022() {
        var _a;
        return ((_a = this._set2022) !== null && _a !== void 0 ? _a : (this._set2022 = new Set(this._raw2022.split(" "))));
    }
    get es2023() {
        var _a;
        return ((_a = this._set2023) !== null && _a !== void 0 ? _a : (this._set2023 = new Set(this._raw2023.split(" "))));
    }
    get es2024() {
        var _a;
        return ((_a = this._set2024) !== null && _a !== void 0 ? _a : (this._set2024 = new Set(this._raw2024.split(" "))));
    }
    get es2025() {
        var _a;
        return ((_a = this._set2025) !== null && _a !== void 0 ? _a : (this._set2025 = new Set(this._raw2025.split(" "))));
    }
}
const gcNameSet = new Set(["General_Category", "gc"]);
const scNameSet = new Set(["Script", "Script_Extensions", "sc", "scx"]);
const gcValueSets = new DataSet("C Cased_Letter Cc Cf Close_Punctuation Cn Co Combining_Mark Connector_Punctuation Control Cs Currency_Symbol Dash_Punctuation Decimal_Number Enclosing_Mark Final_Punctuation Format Initial_Punctuation L LC Letter Letter_Number Line_Separator Ll Lm Lo Lowercase_Letter Lt Lu M Mark Math_Symbol Mc Me Mn Modifier_Letter Modifier_Symbol N Nd Nl No Nonspacing_Mark Number Open_Punctuation Other Other_Letter Other_Number Other_Punctuation Other_Symbol P Paragraph_Separator Pc Pd Pe Pf Pi Po Private_Use Ps Punctuation S Sc Separator Sk Sm So Space_Separator Spacing_Mark Surrogate Symbol Titlecase_Letter Unassigned Uppercase_Letter Z Zl Zp Zs cntrl digit punct", "", "", "", "", "", "", "");
const scValueSets = new DataSet("Adlam Adlm Aghb Ahom Anatolian_Hieroglyphs Arab Arabic Armenian Armi Armn Avestan Avst Bali Balinese Bamu Bamum Bass Bassa_Vah Batak Batk Beng Bengali Bhaiksuki Bhks Bopo Bopomofo Brah Brahmi Brai Braille Bugi Buginese Buhd Buhid Cakm Canadian_Aboriginal Cans Cari Carian Caucasian_Albanian Chakma Cham Cher Cherokee Common Copt Coptic Cprt Cuneiform Cypriot Cyrillic Cyrl Deseret Deva Devanagari Dsrt Dupl Duployan Egyp Egyptian_Hieroglyphs Elba Elbasan Ethi Ethiopic Geor Georgian Glag Glagolitic Gonm Goth Gothic Gran Grantha Greek Grek Gujarati Gujr Gurmukhi Guru Han Hang Hangul Hani Hano Hanunoo Hatr Hatran Hebr Hebrew Hira Hiragana Hluw Hmng Hung Imperial_Aramaic Inherited Inscriptional_Pahlavi Inscriptional_Parthian Ital Java Javanese Kaithi Kali Kana Kannada Katakana Kayah_Li Khar Kharoshthi Khmer Khmr Khoj Khojki Khudawadi Knda Kthi Lana Lao Laoo Latin Latn Lepc Lepcha Limb Limbu Lina Linb Linear_A Linear_B Lisu Lyci Lycian Lydi Lydian Mahajani Mahj Malayalam Mand Mandaic Mani Manichaean Marc Marchen Masaram_Gondi Meetei_Mayek Mend Mende_Kikakui Merc Mero Meroitic_Cursive Meroitic_Hieroglyphs Miao Mlym Modi Mong Mongolian Mro Mroo Mtei Mult Multani Myanmar Mymr Nabataean Narb Nbat New_Tai_Lue Newa Nko Nkoo Nshu Nushu Ogam Ogham Ol_Chiki Olck Old_Hungarian Old_Italic Old_North_Arabian Old_Permic Old_Persian Old_South_Arabian Old_Turkic Oriya Orkh Orya Osage Osge Osma Osmanya Pahawh_Hmong Palm Palmyrene Pau_Cin_Hau Pauc Perm Phag Phags_Pa Phli Phlp Phnx Phoenician Plrd Prti Psalter_Pahlavi Qaac Qaai Rejang Rjng Runic Runr Samaritan Samr Sarb Saur Saurashtra Sgnw Sharada Shavian Shaw Shrd Sidd Siddham SignWriting Sind Sinh Sinhala Sora Sora_Sompeng Soyo Soyombo Sund Sundanese Sylo Syloti_Nagri Syrc Syriac Tagalog Tagb Tagbanwa Tai_Le Tai_Tham Tai_Viet Takr Takri Tale Talu Tamil Taml Tang Tangut Tavt Telu Telugu Tfng Tglg Thaa Thaana Thai Tibetan Tibt Tifinagh Tirh Tirhuta Ugar Ugaritic Vai Vaii Wara Warang_Citi Xpeo Xsux Yi Yiii Zanabazar_Square Zanb Zinh Zyyy", "Dogr Dogra Gong Gunjala_Gondi Hanifi_Rohingya Maka Makasar Medefaidrin Medf Old_Sogdian Rohg Sogd Sogdian Sogo", "Elym Elymaic Hmnp Nand Nandinagari Nyiakeng_Puachue_Hmong Wancho Wcho", "Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi", "Cpmn Cypro_Minoan Old_Uyghur Ougr Tangsa Tnsa Toto Vith Vithkuqi", "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz", "", "");
const binPropertySets = new DataSet("AHex ASCII ASCII_Hex_Digit Alpha Alphabetic Any Assigned Bidi_C Bidi_Control Bidi_M Bidi_Mirrored CI CWCF CWCM CWKCF CWL CWT CWU Case_Ignorable Cased Changes_When_Casefolded Changes_When_Casemapped Changes_When_Lowercased Changes_When_NFKC_Casefolded Changes_When_Titlecased Changes_When_Uppercased DI Dash Default_Ignorable_Code_Point Dep Deprecated Dia Diacritic Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Ext Extender Gr_Base Gr_Ext Grapheme_Base Grapheme_Extend Hex Hex_Digit IDC IDS IDSB IDST IDS_Binary_Operator IDS_Trinary_Operator ID_Continue ID_Start Ideo Ideographic Join_C Join_Control LOE Logical_Order_Exception Lower Lowercase Math NChar Noncharacter_Code_Point Pat_Syn Pat_WS Pattern_Syntax Pattern_White_Space QMark Quotation_Mark RI Radical Regional_Indicator SD STerm Sentence_Terminal Soft_Dotted Term Terminal_Punctuation UIdeo Unified_Ideograph Upper Uppercase VS Variation_Selector White_Space XIDC XIDS XID_Continue XID_Start space", "Extended_Pictographic", "", "EBase EComp EMod EPres ExtPict", "", "", "", "");
const binPropertyOfStringsSets = new DataSet("", "", "", "", "", "", "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji RGI_Emoji_Flag_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence", "");
function isValidUnicodeProperty(version, name, value) {
    if (gcNameSet.has(name)) {
        return version >= 2018 && gcValueSets.es2018.has(value);
    }
    if (scNameSet.has(name)) {
        return ((version >= 2018 && scValueSets.es2018.has(value)) ||
            (version >= 2019 && scValueSets.es2019.has(value)) ||
            (version >= 2020 && scValueSets.es2020.has(value)) ||
            (version >= 2021 && scValueSets.es2021.has(value)) ||
            (version >= 2022 && scValueSets.es2022.has(value)) ||
            (version >= 2023 && scValueSets.es2023.has(value)));
    }
    return false;
}
function isValidLoneUnicodeProperty(version, value) {
    return ((version >= 2018 && binPropertySets.es2018.has(value)) ||
        (version >= 2019 && binPropertySets.es2019.has(value)) ||
        (version >= 2021 && binPropertySets.es2021.has(value)));
}
function isValidLoneUnicodePropertyOfString(version, value) {
    return version >= 2024 && binPropertyOfStringsSets.es2024.has(value);
}

const BACKSPACE = 0x08;
const CHARACTER_TABULATION = 0x09;
const LINE_FEED = 0x0a;
const LINE_TABULATION = 0x0b;
const FORM_FEED = 0x0c;
const CARRIAGE_RETURN = 0x0d;
const EXCLAMATION_MARK = 0x21;
const NUMBER_SIGN = 0x23;
const DOLLAR_SIGN = 0x24;
const PERCENT_SIGN = 0x25;
const AMPERSAND = 0x26;
const LEFT_PARENTHESIS = 0x28;
const RIGHT_PARENTHESIS = 0x29;
const ASTERISK = 0x2a;
const PLUS_SIGN = 0x2b;
const COMMA = 0x2c;
const HYPHEN_MINUS = 0x2d;
const FULL_STOP = 0x2e;
const SOLIDUS = 0x2f;
const DIGIT_ZERO = 0x30;
const DIGIT_ONE = 0x31;
const DIGIT_SEVEN = 0x37;
const DIGIT_NINE = 0x39;
const COLON = 0x3a;
const SEMICOLON = 0x3b;
const LESS_THAN_SIGN = 0x3c;
const EQUALS_SIGN = 0x3d;
const GREATER_THAN_SIGN = 0x3e;
const QUESTION_MARK = 0x3f;
const COMMERCIAL_AT = 0x40;
const LATIN_CAPITAL_LETTER_A = 0x41;
const LATIN_CAPITAL_LETTER_B = 0x42;
const LATIN_CAPITAL_LETTER_D = 0x44;
const LATIN_CAPITAL_LETTER_F = 0x46;
const LATIN_CAPITAL_LETTER_P = 0x50;
const LATIN_CAPITAL_LETTER_S = 0x53;
const LATIN_CAPITAL_LETTER_W = 0x57;
const LATIN_CAPITAL_LETTER_Z = 0x5a;
const LOW_LINE = 0x5f;
const LATIN_SMALL_LETTER_A = 0x61;
const LATIN_SMALL_LETTER_B = 0x62;
const LATIN_SMALL_LETTER_C = 0x63;
const LATIN_SMALL_LETTER_D = 0x64;
const LATIN_SMALL_LETTER_F = 0x66;
const LATIN_SMALL_LETTER_G = 0x67;
const LATIN_SMALL_LETTER_I = 0x69;
const LATIN_SMALL_LETTER_K = 0x6b;
const LATIN_SMALL_LETTER_M = 0x6d;
const LATIN_SMALL_LETTER_N = 0x6e;
const LATIN_SMALL_LETTER_P = 0x70;
const LATIN_SMALL_LETTER_Q = 0x71;
const LATIN_SMALL_LETTER_R = 0x72;
const LATIN_SMALL_LETTER_S = 0x73;
const LATIN_SMALL_LETTER_T = 0x74;
const LATIN_SMALL_LETTER_U = 0x75;
const LATIN_SMALL_LETTER_V = 0x76;
const LATIN_SMALL_LETTER_W = 0x77;
const LATIN_SMALL_LETTER_X = 0x78;
const LATIN_SMALL_LETTER_Y = 0x79;
const LATIN_SMALL_LETTER_Z = 0x7a;
const LEFT_SQUARE_BRACKET = 0x5b;
const REVERSE_SOLIDUS = 0x5c;
const RIGHT_SQUARE_BRACKET = 0x5d;
const CIRCUMFLEX_ACCENT = 0x5e;
const GRAVE_ACCENT = 0x60;
const LEFT_CURLY_BRACKET = 0x7b;
const VERTICAL_LINE = 0x7c;
const RIGHT_CURLY_BRACKET = 0x7d;
const TILDE = 0x7e;
const ZERO_WIDTH_NON_JOINER = 0x200c;
const ZERO_WIDTH_JOINER = 0x200d;
const LINE_SEPARATOR = 0x2028;
const PARAGRAPH_SEPARATOR = 0x2029;
const MIN_CODE_POINT = 0x00;
const MAX_CODE_POINT = 0x10ffff;
function isLatinLetter(code) {
    return ((code >= LATIN_CAPITAL_LETTER_A && code <= LATIN_CAPITAL_LETTER_Z) ||
        (code >= LATIN_SMALL_LETTER_A && code <= LATIN_SMALL_LETTER_Z));
}
function isDecimalDigit(code) {
    return code >= DIGIT_ZERO && code <= DIGIT_NINE;
}
function isOctalDigit(code) {
    return code >= DIGIT_ZERO && code <= DIGIT_SEVEN;
}
function isHexDigit(code) {
    return ((code >= DIGIT_ZERO && code <= DIGIT_NINE) ||
        (code >= LATIN_CAPITAL_LETTER_A && code <= LATIN_CAPITAL_LETTER_F) ||
        (code >= LATIN_SMALL_LETTER_A && code <= LATIN_SMALL_LETTER_F));
}
function isLineTerminator(code) {
    return (code === LINE_FEED ||
        code === CARRIAGE_RETURN ||
        code === LINE_SEPARATOR ||
        code === PARAGRAPH_SEPARATOR);
}
function isValidUnicode(code) {
    return code >= MIN_CODE_POINT && code <= MAX_CODE_POINT;
}
function digitToInt(code) {
    if (code >= LATIN_SMALL_LETTER_A && code <= LATIN_SMALL_LETTER_F) {
        return code - LATIN_SMALL_LETTER_A + 10;
    }
    if (code >= LATIN_CAPITAL_LETTER_A && code <= LATIN_CAPITAL_LETTER_F) {
        return code - LATIN_CAPITAL_LETTER_A + 10;
    }
    return code - DIGIT_ZERO;
}
function isLeadSurrogate(code) {
    return code >= 0xd800 && code <= 0xdbff;
}
function isTrailSurrogate(code) {
    return code >= 0xdc00 && code <= 0xdfff;
}
function combineSurrogatePair(lead, trail) {
    return (lead - 0xd800) * 0x400 + (trail - 0xdc00) + 0x10000;
}

class GroupSpecifiersAsES2018 {
    constructor() {
        this.groupName = new Set();
    }
    clear() {
        this.groupName.clear();
    }
    isEmpty() {
        return !this.groupName.size;
    }
    hasInPattern(name) {
        return this.groupName.has(name);
    }
    hasInScope(name) {
        return this.hasInPattern(name);
    }
    addToScope(name) {
        this.groupName.add(name);
    }
    enterDisjunction() {
    }
    enterAlternative() {
    }
    leaveDisjunction() {
    }
}
class BranchID {
    constructor(parent, base) {
        this.parent = parent;
        this.base = base !== null && base !== void 0 ? base : this;
    }
    separatedFrom(other) {
        var _a, _b;
        if (this.base === other.base && this !== other) {
            return true;
        }
        if (other.parent && this.separatedFrom(other.parent)) {
            return true;
        }
        return (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.separatedFrom(other)) !== null && _b !== void 0 ? _b : false;
    }
    child() {
        return new BranchID(this, null);
    }
    sibling() {
        return new BranchID(this.parent, this.base);
    }
}
class GroupSpecifiersAsES2025 {
    constructor() {
        this.branchID = new BranchID(null, null);
        this.groupNames = new Map();
    }
    clear() {
        this.branchID = new BranchID(null, null);
        this.groupNames.clear();
    }
    isEmpty() {
        return !this.groupNames.size;
    }
    enterDisjunction() {
        this.branchID = this.branchID.child();
    }
    enterAlternative(index) {
        if (index === 0) {
            return;
        }
        this.branchID = this.branchID.sibling();
    }
    leaveDisjunction() {
        this.branchID = this.branchID.parent;
    }
    hasInPattern(name) {
        return this.groupNames.has(name);
    }
    hasInScope(name) {
        const branches = this.groupNames.get(name);
        if (!branches) {
            return false;
        }
        for (const branch of branches) {
            if (!branch.separatedFrom(this.branchID)) {
                return true;
            }
        }
        return false;
    }
    addToScope(name) {
        const branches = this.groupNames.get(name);
        if (branches) {
            branches.push(this.branchID);
            return;
        }
        this.groupNames.set(name, [this.branchID]);
    }
}

const legacyImpl = {
    at(s, end, i) {
        return i < end ? s.charCodeAt(i) : -1;
    },
    width(c) {
        return 1;
    },
};
const unicodeImpl = {
    at(s, end, i) {
        return i < end ? s.codePointAt(i) : -1;
    },
    width(c) {
        return c > 0xffff ? 2 : 1;
    },
};
class Reader {
    constructor() {
        this._impl = legacyImpl;
        this._s = "";
        this._i = 0;
        this._end = 0;
        this._cp1 = -1;
        this._w1 = 1;
        this._cp2 = -1;
        this._w2 = 1;
        this._cp3 = -1;
        this._w3 = 1;
        this._cp4 = -1;
    }
    get source() {
        return this._s;
    }
    get index() {
        return this._i;
    }
    get currentCodePoint() {
        return this._cp1;
    }
    get nextCodePoint() {
        return this._cp2;
    }
    get nextCodePoint2() {
        return this._cp3;
    }
    get nextCodePoint3() {
        return this._cp4;
    }
    reset(source, start, end, uFlag) {
        this._impl = uFlag ? unicodeImpl : legacyImpl;
        this._s = source;
        this._end = end;
        this.rewind(start);
    }
    rewind(index) {
        const impl = this._impl;
        this._i = index;
        this._cp1 = impl.at(this._s, this._end, index);
        this._w1 = impl.width(this._cp1);
        this._cp2 = impl.at(this._s, this._end, index + this._w1);
        this._w2 = impl.width(this._cp2);
        this._cp3 = impl.at(this._s, this._end, index + this._w1 + this._w2);
        this._w3 = impl.width(this._cp3);
        this._cp4 = impl.at(this._s, this._end, index + this._w1 + this._w2 + this._w3);
    }
    advance() {
        if (this._cp1 !== -1) {
            const impl = this._impl;
            this._i += this._w1;
            this._cp1 = this._cp2;
            this._w1 = this._w2;
            this._cp2 = this._cp3;
            this._w2 = impl.width(this._cp2);
            this._cp3 = this._cp4;
            this._w3 = impl.width(this._cp3);
            this._cp4 = impl.at(this._s, this._end, this._i + this._w1 + this._w2 + this._w3);
        }
    }
    eat(cp) {
        if (this._cp1 === cp) {
            this.advance();
            return true;
        }
        return false;
    }
    eat2(cp1, cp2) {
        if (this._cp1 === cp1 && this._cp2 === cp2) {
            this.advance();
            this.advance();
            return true;
        }
        return false;
    }
    eat3(cp1, cp2, cp3) {
        if (this._cp1 === cp1 && this._cp2 === cp2 && this._cp3 === cp3) {
            this.advance();
            this.advance();
            this.advance();
            return true;
        }
        return false;
    }
}

class RegExpSyntaxError extends SyntaxError {
    constructor(message, index) {
        super(message);
        this.index = index;
    }
}
function newRegExpSyntaxError(srcCtx, flags, index, message) {
    let source = "";
    if (srcCtx.kind === "literal") {
        const literal = srcCtx.source.slice(srcCtx.start, srcCtx.end);
        if (literal) {
            source = `: ${literal}`;
        }
    }
    else if (srcCtx.kind === "pattern") {
        const pattern = srcCtx.source.slice(srcCtx.start, srcCtx.end);
        const flagsText = `${flags.unicode ? "u" : ""}${flags.unicodeSets ? "v" : ""}`;
        source = `: /${pattern}/${flagsText}`;
    }
    return new RegExpSyntaxError(`Invalid regular expression${source}: ${message}`, index);
}

const SYNTAX_CHARACTER = new Set([
    CIRCUMFLEX_ACCENT,
    DOLLAR_SIGN,
    REVERSE_SOLIDUS,
    FULL_STOP,
    ASTERISK,
    PLUS_SIGN,
    QUESTION_MARK,
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
    LEFT_SQUARE_BRACKET,
    RIGHT_SQUARE_BRACKET,
    LEFT_CURLY_BRACKET,
    RIGHT_CURLY_BRACKET,
    VERTICAL_LINE,
]);
const CLASS_SET_RESERVED_DOUBLE_PUNCTUATOR_CHARACTER = new Set([
    AMPERSAND,
    EXCLAMATION_MARK,
    NUMBER_SIGN,
    DOLLAR_SIGN,
    PERCENT_SIGN,
    ASTERISK,
    PLUS_SIGN,
    COMMA,
    FULL_STOP,
    COLON,
    SEMICOLON,
    LESS_THAN_SIGN,
    EQUALS_SIGN,
    GREATER_THAN_SIGN,
    QUESTION_MARK,
    COMMERCIAL_AT,
    CIRCUMFLEX_ACCENT,
    GRAVE_ACCENT,
    TILDE,
]);
const CLASS_SET_SYNTAX_CHARACTER = new Set([
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
    LEFT_SQUARE_BRACKET,
    RIGHT_SQUARE_BRACKET,
    LEFT_CURLY_BRACKET,
    RIGHT_CURLY_BRACKET,
    SOLIDUS,
    HYPHEN_MINUS,
    REVERSE_SOLIDUS,
    VERTICAL_LINE,
]);
const CLASS_SET_RESERVED_PUNCTUATOR = new Set([
    AMPERSAND,
    HYPHEN_MINUS,
    EXCLAMATION_MARK,
    NUMBER_SIGN,
    PERCENT_SIGN,
    COMMA,
    COLON,
    SEMICOLON,
    LESS_THAN_SIGN,
    EQUALS_SIGN,
    GREATER_THAN_SIGN,
    COMMERCIAL_AT,
    GRAVE_ACCENT,
    TILDE,
]);
const FLAG_PROP_TO_CODEPOINT = {
    global: LATIN_SMALL_LETTER_G,
    ignoreCase: LATIN_SMALL_LETTER_I,
    multiline: LATIN_SMALL_LETTER_M,
    unicode: LATIN_SMALL_LETTER_U,
    sticky: LATIN_SMALL_LETTER_Y,
    dotAll: LATIN_SMALL_LETTER_S,
    hasIndices: LATIN_SMALL_LETTER_D,
    unicodeSets: LATIN_SMALL_LETTER_V,
};
const FLAG_CODEPOINT_TO_PROP = Object.fromEntries(Object.entries(FLAG_PROP_TO_CODEPOINT).map(([k, v]) => [v, k]));
function isSyntaxCharacter(cp) {
    return SYNTAX_CHARACTER.has(cp);
}
function isClassSetReservedDoublePunctuatorCharacter(cp) {
    return CLASS_SET_RESERVED_DOUBLE_PUNCTUATOR_CHARACTER.has(cp);
}
function isClassSetSyntaxCharacter(cp) {
    return CLASS_SET_SYNTAX_CHARACTER.has(cp);
}
function isClassSetReservedPunctuator(cp) {
    return CLASS_SET_RESERVED_PUNCTUATOR.has(cp);
}
function isIdentifierStartChar(cp) {
    return isIdStart(cp) || cp === DOLLAR_SIGN || cp === LOW_LINE;
}
function isIdentifierPartChar(cp) {
    return (isIdContinue(cp) ||
        cp === DOLLAR_SIGN ||
        cp === ZERO_WIDTH_NON_JOINER ||
        cp === ZERO_WIDTH_JOINER);
}
function isUnicodePropertyNameCharacter(cp) {
    return isLatinLetter(cp) || cp === LOW_LINE;
}
function isUnicodePropertyValueCharacter(cp) {
    return isUnicodePropertyNameCharacter(cp) || isDecimalDigit(cp);
}
function isRegularExpressionModifier(ch) {
    return (ch === LATIN_SMALL_LETTER_I ||
        ch === LATIN_SMALL_LETTER_M ||
        ch === LATIN_SMALL_LETTER_S);
}
class RegExpValidator {
    constructor(options) {
        this._reader = new Reader();
        this._unicodeMode = false;
        this._unicodeSetsMode = false;
        this._nFlag = false;
        this._lastIntValue = 0;
        this._lastRange = {
            min: 0,
            max: Number.POSITIVE_INFINITY,
        };
        this._lastStrValue = "";
        this._lastAssertionIsQuantifiable = false;
        this._numCapturingParens = 0;
        this._backreferenceNames = new Set();
        this._srcCtx = null;
        this._options = options !== null && options !== void 0 ? options : {};
        this._groupSpecifiers =
            this.ecmaVersion >= 2025
                ? new GroupSpecifiersAsES2025()
                : new GroupSpecifiersAsES2018();
    }
    validateLiteral(source, start = 0, end = source.length) {
        this._srcCtx = { source, start, end, kind: "literal" };
        this._unicodeSetsMode = this._unicodeMode = this._nFlag = false;
        this.reset(source, start, end);
        this.onLiteralEnter(start);
        if (this.eat(SOLIDUS) && this.eatRegExpBody() && this.eat(SOLIDUS)) {
            const flagStart = this.index;
            const unicode = source.includes("u", flagStart);
            const unicodeSets = source.includes("v", flagStart);
            this.validateFlagsInternal(source, flagStart, end);
            this.validatePatternInternal(source, start + 1, flagStart - 1, {
                unicode,
                unicodeSets,
            });
        }
        else if (start >= end) {
            this.raise("Empty");
        }
        else {
            const c = String.fromCodePoint(this.currentCodePoint);
            this.raise(`Unexpected character '${c}'`);
        }
        this.onLiteralLeave(start, end);
    }
    validateFlags(source, start = 0, end = source.length) {
        this._srcCtx = { source, start, end, kind: "flags" };
        this.validateFlagsInternal(source, start, end);
    }
    validatePattern(source, start = 0, end = source.length, uFlagOrFlags = undefined) {
        this._srcCtx = { source, start, end, kind: "pattern" };
        this.validatePatternInternal(source, start, end, uFlagOrFlags);
    }
    validatePatternInternal(source, start = 0, end = source.length, uFlagOrFlags = undefined) {
        const mode = this._parseFlagsOptionToMode(uFlagOrFlags, end);
        this._unicodeMode = mode.unicodeMode;
        this._nFlag = mode.nFlag;
        this._unicodeSetsMode = mode.unicodeSetsMode;
        this.reset(source, start, end);
        this.consumePattern();
        if (!this._nFlag &&
            this.ecmaVersion >= 2018 &&
            !this._groupSpecifiers.isEmpty()) {
            this._nFlag = true;
            this.rewind(start);
            this.consumePattern();
        }
    }
    validateFlagsInternal(source, start, end) {
        const flags = this.parseFlags(source, start, end);
        this.onRegExpFlags(start, end, flags);
    }
    _parseFlagsOptionToMode(uFlagOrFlags, sourceEnd) {
        let unicode = false;
        let unicodeSets = false;
        if (uFlagOrFlags && this.ecmaVersion >= 2015) {
            if (typeof uFlagOrFlags === "object") {
                unicode = Boolean(uFlagOrFlags.unicode);
                if (this.ecmaVersion >= 2024) {
                    unicodeSets = Boolean(uFlagOrFlags.unicodeSets);
                }
            }
            else {
                unicode = uFlagOrFlags;
            }
        }
        if (unicode && unicodeSets) {
            this.raise("Invalid regular expression flags", {
                index: sourceEnd + 1,
                unicode,
                unicodeSets,
            });
        }
        const unicodeMode = unicode || unicodeSets;
        const nFlag = (unicode && this.ecmaVersion >= 2018) ||
            unicodeSets ||
            Boolean(this._options.strict && this.ecmaVersion >= 2023);
        const unicodeSetsMode = unicodeSets;
        return { unicodeMode, nFlag, unicodeSetsMode };
    }
    get strict() {
        return Boolean(this._options.strict) || this._unicodeMode;
    }
    get ecmaVersion() {
        var _a;
        return (_a = this._options.ecmaVersion) !== null && _a !== void 0 ? _a : latestEcmaVersion;
    }
    onLiteralEnter(start) {
        if (this._options.onLiteralEnter) {
            this._options.onLiteralEnter(start);
        }
    }
    onLiteralLeave(start, end) {
        if (this._options.onLiteralLeave) {
            this._options.onLiteralLeave(start, end);
        }
    }
    onRegExpFlags(start, end, flags) {
        if (this._options.onRegExpFlags) {
            this._options.onRegExpFlags(start, end, flags);
        }
        if (this._options.onFlags) {
            this._options.onFlags(start, end, flags.global, flags.ignoreCase, flags.multiline, flags.unicode, flags.sticky, flags.dotAll, flags.hasIndices);
        }
    }
    onPatternEnter(start) {
        if (this._options.onPatternEnter) {
            this._options.onPatternEnter(start);
        }
    }
    onPatternLeave(start, end) {
        if (this._options.onPatternLeave) {
            this._options.onPatternLeave(start, end);
        }
    }
    onDisjunctionEnter(start) {
        if (this._options.onDisjunctionEnter) {
            this._options.onDisjunctionEnter(start);
        }
    }
    onDisjunctionLeave(start, end) {
        if (this._options.onDisjunctionLeave) {
            this._options.onDisjunctionLeave(start, end);
        }
    }
    onAlternativeEnter(start, index) {
        if (this._options.onAlternativeEnter) {
            this._options.onAlternativeEnter(start, index);
        }
    }
    onAlternativeLeave(start, end, index) {
        if (this._options.onAlternativeLeave) {
            this._options.onAlternativeLeave(start, end, index);
        }
    }
    onGroupEnter(start) {
        if (this._options.onGroupEnter) {
            this._options.onGroupEnter(start);
        }
    }
    onGroupLeave(start, end) {
        if (this._options.onGroupLeave) {
            this._options.onGroupLeave(start, end);
        }
    }
    onModifiersEnter(start) {
        if (this._options.onModifiersEnter) {
            this._options.onModifiersEnter(start);
        }
    }
    onModifiersLeave(start, end) {
        if (this._options.onModifiersLeave) {
            this._options.onModifiersLeave(start, end);
        }
    }
    onAddModifiers(start, end, flags) {
        if (this._options.onAddModifiers) {
            this._options.onAddModifiers(start, end, flags);
        }
    }
    onRemoveModifiers(start, end, flags) {
        if (this._options.onRemoveModifiers) {
            this._options.onRemoveModifiers(start, end, flags);
        }
    }
    onCapturingGroupEnter(start, name) {
        if (this._options.onCapturingGroupEnter) {
            this._options.onCapturingGroupEnter(start, name);
        }
    }
    onCapturingGroupLeave(start, end, name) {
        if (this._options.onCapturingGroupLeave) {
            this._options.onCapturingGroupLeave(start, end, name);
        }
    }
    onQuantifier(start, end, min, max, greedy) {
        if (this._options.onQuantifier) {
            this._options.onQuantifier(start, end, min, max, greedy);
        }
    }
    onLookaroundAssertionEnter(start, kind, negate) {
        if (this._options.onLookaroundAssertionEnter) {
            this._options.onLookaroundAssertionEnter(start, kind, negate);
        }
    }
    onLookaroundAssertionLeave(start, end, kind, negate) {
        if (this._options.onLookaroundAssertionLeave) {
            this._options.onLookaroundAssertionLeave(start, end, kind, negate);
        }
    }
    onEdgeAssertion(start, end, kind) {
        if (this._options.onEdgeAssertion) {
            this._options.onEdgeAssertion(start, end, kind);
        }
    }
    onWordBoundaryAssertion(start, end, kind, negate) {
        if (this._options.onWordBoundaryAssertion) {
            this._options.onWordBoundaryAssertion(start, end, kind, negate);
        }
    }
    onAnyCharacterSet(start, end, kind) {
        if (this._options.onAnyCharacterSet) {
            this._options.onAnyCharacterSet(start, end, kind);
        }
    }
    onEscapeCharacterSet(start, end, kind, negate) {
        if (this._options.onEscapeCharacterSet) {
            this._options.onEscapeCharacterSet(start, end, kind, negate);
        }
    }
    onUnicodePropertyCharacterSet(start, end, kind, key, value, negate, strings) {
        if (this._options.onUnicodePropertyCharacterSet) {
            this._options.onUnicodePropertyCharacterSet(start, end, kind, key, value, negate, strings);
        }
    }
    onCharacter(start, end, value) {
        if (this._options.onCharacter) {
            this._options.onCharacter(start, end, value);
        }
    }
    onBackreference(start, end, ref) {
        if (this._options.onBackreference) {
            this._options.onBackreference(start, end, ref);
        }
    }
    onCharacterClassEnter(start, negate, unicodeSets) {
        if (this._options.onCharacterClassEnter) {
            this._options.onCharacterClassEnter(start, negate, unicodeSets);
        }
    }
    onCharacterClassLeave(start, end, negate) {
        if (this._options.onCharacterClassLeave) {
            this._options.onCharacterClassLeave(start, end, negate);
        }
    }
    onCharacterClassRange(start, end, min, max) {
        if (this._options.onCharacterClassRange) {
            this._options.onCharacterClassRange(start, end, min, max);
        }
    }
    onClassIntersection(start, end) {
        if (this._options.onClassIntersection) {
            this._options.onClassIntersection(start, end);
        }
    }
    onClassSubtraction(start, end) {
        if (this._options.onClassSubtraction) {
            this._options.onClassSubtraction(start, end);
        }
    }
    onClassStringDisjunctionEnter(start) {
        if (this._options.onClassStringDisjunctionEnter) {
            this._options.onClassStringDisjunctionEnter(start);
        }
    }
    onClassStringDisjunctionLeave(start, end) {
        if (this._options.onClassStringDisjunctionLeave) {
            this._options.onClassStringDisjunctionLeave(start, end);
        }
    }
    onStringAlternativeEnter(start, index) {
        if (this._options.onStringAlternativeEnter) {
            this._options.onStringAlternativeEnter(start, index);
        }
    }
    onStringAlternativeLeave(start, end, index) {
        if (this._options.onStringAlternativeLeave) {
            this._options.onStringAlternativeLeave(start, end, index);
        }
    }
    get index() {
        return this._reader.index;
    }
    get currentCodePoint() {
        return this._reader.currentCodePoint;
    }
    get nextCodePoint() {
        return this._reader.nextCodePoint;
    }
    get nextCodePoint2() {
        return this._reader.nextCodePoint2;
    }
    get nextCodePoint3() {
        return this._reader.nextCodePoint3;
    }
    reset(source, start, end) {
        this._reader.reset(source, start, end, this._unicodeMode);
    }
    rewind(index) {
        this._reader.rewind(index);
    }
    advance() {
        this._reader.advance();
    }
    eat(cp) {
        return this._reader.eat(cp);
    }
    eat2(cp1, cp2) {
        return this._reader.eat2(cp1, cp2);
    }
    eat3(cp1, cp2, cp3) {
        return this._reader.eat3(cp1, cp2, cp3);
    }
    raise(message, context) {
        var _a, _b, _c;
        throw newRegExpSyntaxError(this._srcCtx, {
            unicode: (_a = context === null || context === void 0 ? void 0 : context.unicode) !== null && _a !== void 0 ? _a : (this._unicodeMode && !this._unicodeSetsMode),
            unicodeSets: (_b = context === null || context === void 0 ? void 0 : context.unicodeSets) !== null && _b !== void 0 ? _b : this._unicodeSetsMode,
        }, (_c = context === null || context === void 0 ? void 0 : context.index) !== null && _c !== void 0 ? _c : this.index, message);
    }
    eatRegExpBody() {
        const start = this.index;
        let inClass = false;
        let escaped = false;
        for (;;) {
            const cp = this.currentCodePoint;
            if (cp === -1 || isLineTerminator(cp)) {
                const kind = inClass ? "character class" : "regular expression";
                this.raise(`Unterminated ${kind}`);
            }
            if (escaped) {
                escaped = false;
            }
            else if (cp === REVERSE_SOLIDUS) {
                escaped = true;
            }
            else if (cp === LEFT_SQUARE_BRACKET) {
                inClass = true;
            }
            else if (cp === RIGHT_SQUARE_BRACKET) {
                inClass = false;
            }
            else if ((cp === SOLIDUS && !inClass) ||
                (cp === ASTERISK && this.index === start)) {
                break;
            }
            this.advance();
        }
        return this.index !== start;
    }
    consumePattern() {
        const start = this.index;
        this._numCapturingParens = this.countCapturingParens();
        this._groupSpecifiers.clear();
        this._backreferenceNames.clear();
        this.onPatternEnter(start);
        this.consumeDisjunction();
        const cp = this.currentCodePoint;
        if (this.currentCodePoint !== -1) {
            if (cp === RIGHT_PARENTHESIS) {
                this.raise("Unmatched ')'");
            }
            if (cp === REVERSE_SOLIDUS) {
                this.raise("\\ at end of pattern");
            }
            if (cp === RIGHT_SQUARE_BRACKET || cp === RIGHT_CURLY_BRACKET) {
                this.raise("Lone quantifier brackets");
            }
            const c = String.fromCodePoint(cp);
            this.raise(`Unexpected character '${c}'`);
        }
        for (const name of this._backreferenceNames) {
            if (!this._groupSpecifiers.hasInPattern(name)) {
                this.raise("Invalid named capture referenced");
            }
        }
        this.onPatternLeave(start, this.index);
    }
    countCapturingParens() {
        const start = this.index;
        let inClass = false;
        let escaped = false;
        let count = 0;
        let cp = 0;
        while ((cp = this.currentCodePoint) !== -1) {
            if (escaped) {
                escaped = false;
            }
            else if (cp === REVERSE_SOLIDUS) {
                escaped = true;
            }
            else if (cp === LEFT_SQUARE_BRACKET) {
                inClass = true;
            }
            else if (cp === RIGHT_SQUARE_BRACKET) {
                inClass = false;
            }
            else if (cp === LEFT_PARENTHESIS &&
                !inClass &&
                (this.nextCodePoint !== QUESTION_MARK ||
                    (this.nextCodePoint2 === LESS_THAN_SIGN &&
                        this.nextCodePoint3 !== EQUALS_SIGN &&
                        this.nextCodePoint3 !== EXCLAMATION_MARK))) {
                count += 1;
            }
            this.advance();
        }
        this.rewind(start);
        return count;
    }
    consumeDisjunction() {
        const start = this.index;
        let i = 0;
        this._groupSpecifiers.enterDisjunction();
        this.onDisjunctionEnter(start);
        do {
            this.consumeAlternative(i++);
        } while (this.eat(VERTICAL_LINE));
        if (this.consumeQuantifier(true)) {
            this.raise("Nothing to repeat");
        }
        if (this.eat(LEFT_CURLY_BRACKET)) {
            this.raise("Lone quantifier brackets");
        }
        this.onDisjunctionLeave(start, this.index);
        this._groupSpecifiers.leaveDisjunction();
    }
    consumeAlternative(i) {
        const start = this.index;
        this._groupSpecifiers.enterAlternative(i);
        this.onAlternativeEnter(start, i);
        while (this.currentCodePoint !== -1 && this.consumeTerm()) {
        }
        this.onAlternativeLeave(start, this.index, i);
    }
    consumeTerm() {
        if (this._unicodeMode || this.strict) {
            return (this.consumeAssertion() ||
                (this.consumeAtom() && this.consumeOptionalQuantifier()));
        }
        return ((this.consumeAssertion() &&
            (!this._lastAssertionIsQuantifiable ||
                this.consumeOptionalQuantifier())) ||
            (this.consumeExtendedAtom() && this.consumeOptionalQuantifier()));
    }
    consumeOptionalQuantifier() {
        this.consumeQuantifier();
        return true;
    }
    consumeAssertion() {
        const start = this.index;
        this._lastAssertionIsQuantifiable = false;
        if (this.eat(CIRCUMFLEX_ACCENT)) {
            this.onEdgeAssertion(start, this.index, "start");
            return true;
        }
        if (this.eat(DOLLAR_SIGN)) {
            this.onEdgeAssertion(start, this.index, "end");
            return true;
        }
        if (this.eat2(REVERSE_SOLIDUS, LATIN_CAPITAL_LETTER_B)) {
            this.onWordBoundaryAssertion(start, this.index, "word", true);
            return true;
        }
        if (this.eat2(REVERSE_SOLIDUS, LATIN_SMALL_LETTER_B)) {
            this.onWordBoundaryAssertion(start, this.index, "word", false);
            return true;
        }
        if (this.eat2(LEFT_PARENTHESIS, QUESTION_MARK)) {
            const lookbehind = this.ecmaVersion >= 2018 && this.eat(LESS_THAN_SIGN);
            let negate = false;
            if (this.eat(EQUALS_SIGN) ||
                (negate = this.eat(EXCLAMATION_MARK))) {
                const kind = lookbehind ? "lookbehind" : "lookahead";
                this.onLookaroundAssertionEnter(start, kind, negate);
                this.consumeDisjunction();
                if (!this.eat(RIGHT_PARENTHESIS)) {
                    this.raise("Unterminated group");
                }
                this._lastAssertionIsQuantifiable = !lookbehind && !this.strict;
                this.onLookaroundAssertionLeave(start, this.index, kind, negate);
                return true;
            }
            this.rewind(start);
        }
        return false;
    }
    consumeQuantifier(noConsume = false) {
        const start = this.index;
        let min = 0;
        let max = 0;
        let greedy = false;
        if (this.eat(ASTERISK)) {
            min = 0;
            max = Number.POSITIVE_INFINITY;
        }
        else if (this.eat(PLUS_SIGN)) {
            min = 1;
            max = Number.POSITIVE_INFINITY;
        }
        else if (this.eat(QUESTION_MARK)) {
            min = 0;
            max = 1;
        }
        else if (this.eatBracedQuantifier(noConsume)) {
            ({ min, max } = this._lastRange);
        }
        else {
            return false;
        }
        greedy = !this.eat(QUESTION_MARK);
        if (!noConsume) {
            this.onQuantifier(start, this.index, min, max, greedy);
        }
        return true;
    }
    eatBracedQuantifier(noError) {
        const start = this.index;
        if (this.eat(LEFT_CURLY_BRACKET)) {
            if (this.eatDecimalDigits()) {
                const min = this._lastIntValue;
                let max = min;
                if (this.eat(COMMA)) {
                    max = this.eatDecimalDigits()
                        ? this._lastIntValue
                        : Number.POSITIVE_INFINITY;
                }
                if (this.eat(RIGHT_CURLY_BRACKET)) {
                    if (!noError && max < min) {
                        this.raise("numbers out of order in {} quantifier");
                    }
                    this._lastRange = { min, max };
                    return true;
                }
            }
            if (!noError && (this._unicodeMode || this.strict)) {
                this.raise("Incomplete quantifier");
            }
            this.rewind(start);
        }
        return false;
    }
    consumeAtom() {
        return (this.consumePatternCharacter() ||
            this.consumeDot() ||
            this.consumeReverseSolidusAtomEscape() ||
            Boolean(this.consumeCharacterClass()) ||
            this.consumeCapturingGroup() ||
            this.consumeUncapturingGroup());
    }
    consumeDot() {
        if (this.eat(FULL_STOP)) {
            this.onAnyCharacterSet(this.index - 1, this.index, "any");
            return true;
        }
        return false;
    }
    consumeReverseSolidusAtomEscape() {
        const start = this.index;
        if (this.eat(REVERSE_SOLIDUS)) {
            if (this.consumeAtomEscape()) {
                return true;
            }
            this.rewind(start);
        }
        return false;
    }
    consumeUncapturingGroup() {
        const start = this.index;
        if (this.eat2(LEFT_PARENTHESIS, QUESTION_MARK)) {
            this.onGroupEnter(start);
            if (this.ecmaVersion >= 2025) {
                this.consumeModifiers();
            }
            if (!this.eat(COLON)) {
                this.rewind(start + 1);
                this.raise("Invalid group");
            }
            this.consumeDisjunction();
            if (!this.eat(RIGHT_PARENTHESIS)) {
                this.raise("Unterminated group");
            }
            this.onGroupLeave(start, this.index);
            return true;
        }
        return false;
    }
    consumeModifiers() {
        const start = this.index;
        const hasAddModifiers = this.eatModifiers();
        const addModifiersEnd = this.index;
        const hasHyphen = this.eat(HYPHEN_MINUS);
        if (!hasAddModifiers && !hasHyphen) {
            return false;
        }
        this.onModifiersEnter(start);
        const addModifiers = this.parseModifiers(start, addModifiersEnd);
        this.onAddModifiers(start, addModifiersEnd, addModifiers);
        if (hasHyphen) {
            const modifiersStart = this.index;
            if (!this.eatModifiers() &&
                !hasAddModifiers &&
                this.currentCodePoint === COLON) {
                this.raise("Invalid empty flags");
            }
            const modifiers = this.parseModifiers(modifiersStart, this.index);
            for (const [flagName] of Object.entries(modifiers).filter(([, enable]) => enable)) {
                if (addModifiers[flagName]) {
                    this.raise(`Duplicated flag '${String.fromCodePoint(FLAG_PROP_TO_CODEPOINT[flagName])}'`);
                }
            }
            this.onRemoveModifiers(modifiersStart, this.index, modifiers);
        }
        this.onModifiersLeave(start, this.index);
        return true;
    }
    consumeCapturingGroup() {
        const start = this.index;
        if (this.eat(LEFT_PARENTHESIS)) {
            let name = null;
            if (this.ecmaVersion >= 2018) {
                if (this.consumeGroupSpecifier()) {
                    name = this._lastStrValue;
                }
                else if (this.currentCodePoint === QUESTION_MARK) {
                    this.rewind(start);
                    return false;
                }
            }
            else if (this.currentCodePoint === QUESTION_MARK) {
                this.rewind(start);
                return false;
            }
            this.onCapturingGroupEnter(start, name);
            this.consumeDisjunction();
            if (!this.eat(RIGHT_PARENTHESIS)) {
                this.raise("Unterminated group");
            }
            this.onCapturingGroupLeave(start, this.index, name);
            return true;
        }
        return false;
    }
    consumeExtendedAtom() {
        return (this.consumeDot() ||
            this.consumeReverseSolidusAtomEscape() ||
            this.consumeReverseSolidusFollowedByC() ||
            Boolean(this.consumeCharacterClass()) ||
            this.consumeCapturingGroup() ||
            this.consumeUncapturingGroup() ||
            this.consumeInvalidBracedQuantifier() ||
            this.consumeExtendedPatternCharacter());
    }
    consumeReverseSolidusFollowedByC() {
        const start = this.index;
        if (this.currentCodePoint === REVERSE_SOLIDUS &&
            this.nextCodePoint === LATIN_SMALL_LETTER_C) {
            this._lastIntValue = this.currentCodePoint;
            this.advance();
            this.onCharacter(start, this.index, REVERSE_SOLIDUS);
            return true;
        }
        return false;
    }
    consumeInvalidBracedQuantifier() {
        if (this.eatBracedQuantifier(true)) {
            this.raise("Nothing to repeat");
        }
        return false;
    }
    consumePatternCharacter() {
        const start = this.index;
        const cp = this.currentCodePoint;
        if (cp !== -1 && !isSyntaxCharacter(cp)) {
            this.advance();
            this.onCharacter(start, this.index, cp);
            return true;
        }
        return false;
    }
    consumeExtendedPatternCharacter() {
        const start = this.index;
        const cp = this.currentCodePoint;
        if (cp !== -1 &&
            cp !== CIRCUMFLEX_ACCENT &&
            cp !== DOLLAR_SIGN &&
            cp !== REVERSE_SOLIDUS &&
            cp !== FULL_STOP &&
            cp !== ASTERISK &&
            cp !== PLUS_SIGN &&
            cp !== QUESTION_MARK &&
            cp !== LEFT_PARENTHESIS &&
            cp !== RIGHT_PARENTHESIS &&
            cp !== LEFT_SQUARE_BRACKET &&
            cp !== VERTICAL_LINE) {
            this.advance();
            this.onCharacter(start, this.index, cp);
            return true;
        }
        return false;
    }
    consumeGroupSpecifier() {
        const start = this.index;
        if (this.eat(QUESTION_MARK)) {
            if (this.eatGroupName()) {
                if (!this._groupSpecifiers.hasInScope(this._lastStrValue)) {
                    this._groupSpecifiers.addToScope(this._lastStrValue);
                    return true;
                }
                this.raise("Duplicate capture group name");
            }
            this.rewind(start);
        }
        return false;
    }
    consumeAtomEscape() {
        if (this.consumeBackreference() ||
            this.consumeCharacterClassEscape() ||
            this.consumeCharacterEscape() ||
            (this._nFlag && this.consumeKGroupName())) {
            return true;
        }
        if (this.strict || this._unicodeMode) {
            this.raise("Invalid escape");
        }
        return false;
    }
    consumeBackreference() {
        const start = this.index;
        if (this.eatDecimalEscape()) {
            const n = this._lastIntValue;
            if (n <= this._numCapturingParens) {
                this.onBackreference(start - 1, this.index, n);
                return true;
            }
            if (this.strict || this._unicodeMode) {
                this.raise("Invalid escape");
            }
            this.rewind(start);
        }
        return false;
    }
    consumeCharacterClassEscape() {
        var _a;
        const start = this.index;
        if (this.eat(LATIN_SMALL_LETTER_D)) {
            this._lastIntValue = -1;
            this.onEscapeCharacterSet(start - 1, this.index, "digit", false);
            return {};
        }
        if (this.eat(LATIN_CAPITAL_LETTER_D)) {
            this._lastIntValue = -1;
            this.onEscapeCharacterSet(start - 1, this.index, "digit", true);
            return {};
        }
        if (this.eat(LATIN_SMALL_LETTER_S)) {
            this._lastIntValue = -1;
            this.onEscapeCharacterSet(start - 1, this.index, "space", false);
            return {};
        }
        if (this.eat(LATIN_CAPITAL_LETTER_S)) {
            this._lastIntValue = -1;
            this.onEscapeCharacterSet(start - 1, this.index, "space", true);
            return {};
        }
        if (this.eat(LATIN_SMALL_LETTER_W)) {
            this._lastIntValue = -1;
            this.onEscapeCharacterSet(start - 1, this.index, "word", false);
            return {};
        }
        if (this.eat(LATIN_CAPITAL_LETTER_W)) {
            this._lastIntValue = -1;
            this.onEscapeCharacterSet(start - 1, this.index, "word", true);
            return {};
        }
        let negate = false;
        if (this._unicodeMode &&
            this.ecmaVersion >= 2018 &&
            (this.eat(LATIN_SMALL_LETTER_P) ||
                (negate = this.eat(LATIN_CAPITAL_LETTER_P)))) {
            this._lastIntValue = -1;
            let result = null;
            if (this.eat(LEFT_CURLY_BRACKET) &&
                (result = this.eatUnicodePropertyValueExpression()) &&
                this.eat(RIGHT_CURLY_BRACKET)) {
                if (negate && result.strings) {
                    this.raise("Invalid property name");
                }
                this.onUnicodePropertyCharacterSet(start - 1, this.index, "property", result.key, result.value, negate, (_a = result.strings) !== null && _a !== void 0 ? _a : false);
                return { mayContainStrings: result.strings };
            }
            this.raise("Invalid property name");
        }
        return null;
    }
    consumeCharacterEscape() {
        const start = this.index;
        if (this.eatControlEscape() ||
            this.eatCControlLetter() ||
            this.eatZero() ||
            this.eatHexEscapeSequence() ||
            this.eatRegExpUnicodeEscapeSequence() ||
            (!this.strict &&
                !this._unicodeMode &&
                this.eatLegacyOctalEscapeSequence()) ||
            this.eatIdentityEscape()) {
            this.onCharacter(start - 1, this.index, this._lastIntValue);
            return true;
        }
        return false;
    }
    consumeKGroupName() {
        const start = this.index;
        if (this.eat(LATIN_SMALL_LETTER_K)) {
            if (this.eatGroupName()) {
                const groupName = this._lastStrValue;
                this._backreferenceNames.add(groupName);
                this.onBackreference(start - 1, this.index, groupName);
                return true;
            }
            this.raise("Invalid named reference");
        }
        return false;
    }
    consumeCharacterClass() {
        const start = this.index;
        if (this.eat(LEFT_SQUARE_BRACKET)) {
            const negate = this.eat(CIRCUMFLEX_ACCENT);
            this.onCharacterClassEnter(start, negate, this._unicodeSetsMode);
            const result = this.consumeClassContents();
            if (!this.eat(RIGHT_SQUARE_BRACKET)) {
                if (this.currentCodePoint === -1) {
                    this.raise("Unterminated character class");
                }
                this.raise("Invalid character in character class");
            }
            if (negate && result.mayContainStrings) {
                this.raise("Negated character class may contain strings");
            }
            this.onCharacterClassLeave(start, this.index, negate);
            return result;
        }
        return null;
    }
    consumeClassContents() {
        if (this._unicodeSetsMode) {
            if (this.currentCodePoint === RIGHT_SQUARE_BRACKET) {
                return {};
            }
            const result = this.consumeClassSetExpression();
            return result;
        }
        const strict = this.strict || this._unicodeMode;
        for (;;) {
            const rangeStart = this.index;
            if (!this.consumeClassAtom()) {
                break;
            }
            const min = this._lastIntValue;
            if (!this.eat(HYPHEN_MINUS)) {
                continue;
            }
            this.onCharacter(this.index - 1, this.index, HYPHEN_MINUS);
            if (!this.consumeClassAtom()) {
                break;
            }
            const max = this._lastIntValue;
            if (min === -1 || max === -1) {
                if (strict) {
                    this.raise("Invalid character class");
                }
                continue;
            }
            if (min > max) {
                this.raise("Range out of order in character class");
            }
            this.onCharacterClassRange(rangeStart, this.index, min, max);
        }
        return {};
    }
    consumeClassAtom() {
        const start = this.index;
        const cp = this.currentCodePoint;
        if (cp !== -1 &&
            cp !== REVERSE_SOLIDUS &&
            cp !== RIGHT_SQUARE_BRACKET) {
            this.advance();
            this._lastIntValue = cp;
            this.onCharacter(start, this.index, this._lastIntValue);
            return true;
        }
        if (this.eat(REVERSE_SOLIDUS)) {
            if (this.consumeClassEscape()) {
                return true;
            }
            if (!this.strict &&
                this.currentCodePoint === LATIN_SMALL_LETTER_C) {
                this._lastIntValue = REVERSE_SOLIDUS;
                this.onCharacter(start, this.index, this._lastIntValue);
                return true;
            }
            if (this.strict || this._unicodeMode) {
                this.raise("Invalid escape");
            }
            this.rewind(start);
        }
        return false;
    }
    consumeClassEscape() {
        const start = this.index;
        if (this.eat(LATIN_SMALL_LETTER_B)) {
            this._lastIntValue = BACKSPACE;
            this.onCharacter(start - 1, this.index, this._lastIntValue);
            return true;
        }
        if (this._unicodeMode && this.eat(HYPHEN_MINUS)) {
            this._lastIntValue = HYPHEN_MINUS;
            this.onCharacter(start - 1, this.index, this._lastIntValue);
            return true;
        }
        let cp = 0;
        if (!this.strict &&
            !this._unicodeMode &&
            this.currentCodePoint === LATIN_SMALL_LETTER_C &&
            (isDecimalDigit((cp = this.nextCodePoint)) || cp === LOW_LINE)) {
            this.advance();
            this.advance();
            this._lastIntValue = cp % 0x20;
            this.onCharacter(start - 1, this.index, this._lastIntValue);
            return true;
        }
        return (Boolean(this.consumeCharacterClassEscape()) ||
            this.consumeCharacterEscape());
    }
    consumeClassSetExpression() {
        const start = this.index;
        let mayContainStrings = false;
        let result = null;
        if (this.consumeClassSetCharacter()) {
            if (this.consumeClassSetRangeFromOperator(start)) {
                this.consumeClassUnionRight({});
                return {};
            }
            mayContainStrings = false;
        }
        else if ((result = this.consumeClassSetOperand())) {
            mayContainStrings = result.mayContainStrings;
        }
        else {
            const cp = this.currentCodePoint;
            if (cp === REVERSE_SOLIDUS) {
                this.advance();
                this.raise("Invalid escape");
            }
            if (cp === this.nextCodePoint &&
                isClassSetReservedDoublePunctuatorCharacter(cp)) {
                this.raise("Invalid set operation in character class");
            }
            this.raise("Invalid character in character class");
        }
        if (this.eat2(AMPERSAND, AMPERSAND)) {
            while (this.currentCodePoint !== AMPERSAND &&
                (result = this.consumeClassSetOperand())) {
                this.onClassIntersection(start, this.index);
                if (!result.mayContainStrings) {
                    mayContainStrings = false;
                }
                if (this.eat2(AMPERSAND, AMPERSAND)) {
                    continue;
                }
                return { mayContainStrings };
            }
            this.raise("Invalid character in character class");
        }
        if (this.eat2(HYPHEN_MINUS, HYPHEN_MINUS)) {
            while (this.consumeClassSetOperand()) {
                this.onClassSubtraction(start, this.index);
                if (this.eat2(HYPHEN_MINUS, HYPHEN_MINUS)) {
                    continue;
                }
                return { mayContainStrings };
            }
            this.raise("Invalid character in character class");
        }
        return this.consumeClassUnionRight({ mayContainStrings });
    }
    consumeClassUnionRight(leftResult) {
        let mayContainStrings = leftResult.mayContainStrings;
        for (;;) {
            const start = this.index;
            if (this.consumeClassSetCharacter()) {
                this.consumeClassSetRangeFromOperator(start);
                continue;
            }
            const result = this.consumeClassSetOperand();
            if (result) {
                if (result.mayContainStrings) {
                    mayContainStrings = true;
                }
                continue;
            }
            break;
        }
        return { mayContainStrings };
    }
    consumeClassSetRangeFromOperator(start) {
        const currentStart = this.index;
        const min = this._lastIntValue;
        if (this.eat(HYPHEN_MINUS)) {
            if (this.consumeClassSetCharacter()) {
                const max = this._lastIntValue;
                if (min === -1 || max === -1) {
                    this.raise("Invalid character class");
                }
                if (min > max) {
                    this.raise("Range out of order in character class");
                }
                this.onCharacterClassRange(start, this.index, min, max);
                return true;
            }
            this.rewind(currentStart);
        }
        return false;
    }
    consumeClassSetOperand() {
        let result = null;
        if ((result = this.consumeNestedClass())) {
            return result;
        }
        if ((result = this.consumeClassStringDisjunction())) {
            return result;
        }
        if (this.consumeClassSetCharacter()) {
            return {};
        }
        return null;
    }
    consumeNestedClass() {
        const start = this.index;
        if (this.eat(LEFT_SQUARE_BRACKET)) {
            const negate = this.eat(CIRCUMFLEX_ACCENT);
            this.onCharacterClassEnter(start, negate, true);
            const result = this.consumeClassContents();
            if (!this.eat(RIGHT_SQUARE_BRACKET)) {
                this.raise("Unterminated character class");
            }
            if (negate && result.mayContainStrings) {
                this.raise("Negated character class may contain strings");
            }
            this.onCharacterClassLeave(start, this.index, negate);
            return result;
        }
        if (this.eat(REVERSE_SOLIDUS)) {
            const result = this.consumeCharacterClassEscape();
            if (result) {
                return result;
            }
            this.rewind(start);
        }
        return null;
    }
    consumeClassStringDisjunction() {
        const start = this.index;
        if (this.eat3(REVERSE_SOLIDUS, LATIN_SMALL_LETTER_Q, LEFT_CURLY_BRACKET)) {
            this.onClassStringDisjunctionEnter(start);
            let i = 0;
            let mayContainStrings = false;
            do {
                if (this.consumeClassString(i++).mayContainStrings) {
                    mayContainStrings = true;
                }
            } while (this.eat(VERTICAL_LINE));
            if (this.eat(RIGHT_CURLY_BRACKET)) {
                this.onClassStringDisjunctionLeave(start, this.index);
                return { mayContainStrings };
            }
            this.raise("Unterminated class string disjunction");
        }
        return null;
    }
    consumeClassString(i) {
        const start = this.index;
        let count = 0;
        this.onStringAlternativeEnter(start, i);
        while (this.currentCodePoint !== -1 &&
            this.consumeClassSetCharacter()) {
            count++;
        }
        this.onStringAlternativeLeave(start, this.index, i);
        return { mayContainStrings: count !== 1 };
    }
    consumeClassSetCharacter() {
        const start = this.index;
        const cp = this.currentCodePoint;
        if (cp !== this.nextCodePoint ||
            !isClassSetReservedDoublePunctuatorCharacter(cp)) {
            if (cp !== -1 && !isClassSetSyntaxCharacter(cp)) {
                this._lastIntValue = cp;
                this.advance();
                this.onCharacter(start, this.index, this._lastIntValue);
                return true;
            }
        }
        if (this.eat(REVERSE_SOLIDUS)) {
            if (this.consumeCharacterEscape()) {
                return true;
            }
            if (isClassSetReservedPunctuator(this.currentCodePoint)) {
                this._lastIntValue = this.currentCodePoint;
                this.advance();
                this.onCharacter(start, this.index, this._lastIntValue);
                return true;
            }
            if (this.eat(LATIN_SMALL_LETTER_B)) {
                this._lastIntValue = BACKSPACE;
                this.onCharacter(start, this.index, this._lastIntValue);
                return true;
            }
            this.rewind(start);
        }
        return false;
    }
    eatGroupName() {
        if (this.eat(LESS_THAN_SIGN)) {
            if (this.eatRegExpIdentifierName() && this.eat(GREATER_THAN_SIGN)) {
                return true;
            }
            this.raise("Invalid capture group name");
        }
        return false;
    }
    eatRegExpIdentifierName() {
        if (this.eatRegExpIdentifierStart()) {
            this._lastStrValue = String.fromCodePoint(this._lastIntValue);
            while (this.eatRegExpIdentifierPart()) {
                this._lastStrValue += String.fromCodePoint(this._lastIntValue);
            }
            return true;
        }
        return false;
    }
    eatRegExpIdentifierStart() {
        const start = this.index;
        const forceUFlag = !this._unicodeMode && this.ecmaVersion >= 2020;
        let cp = this.currentCodePoint;
        this.advance();
        if (cp === REVERSE_SOLIDUS &&
            this.eatRegExpUnicodeEscapeSequence(forceUFlag)) {
            cp = this._lastIntValue;
        }
        else if (forceUFlag &&
            isLeadSurrogate(cp) &&
            isTrailSurrogate(this.currentCodePoint)) {
            cp = combineSurrogatePair(cp, this.currentCodePoint);
            this.advance();
        }
        if (isIdentifierStartChar(cp)) {
            this._lastIntValue = cp;
            return true;
        }
        if (this.index !== start) {
            this.rewind(start);
        }
        return false;
    }
    eatRegExpIdentifierPart() {
        const start = this.index;
        const forceUFlag = !this._unicodeMode && this.ecmaVersion >= 2020;
        let cp = this.currentCodePoint;
        this.advance();
        if (cp === REVERSE_SOLIDUS &&
            this.eatRegExpUnicodeEscapeSequence(forceUFlag)) {
            cp = this._lastIntValue;
        }
        else if (forceUFlag &&
            isLeadSurrogate(cp) &&
            isTrailSurrogate(this.currentCodePoint)) {
            cp = combineSurrogatePair(cp, this.currentCodePoint);
            this.advance();
        }
        if (isIdentifierPartChar(cp)) {
            this._lastIntValue = cp;
            return true;
        }
        if (this.index !== start) {
            this.rewind(start);
        }
        return false;
    }
    eatCControlLetter() {
        const start = this.index;
        if (this.eat(LATIN_SMALL_LETTER_C)) {
            if (this.eatControlLetter()) {
                return true;
            }
            this.rewind(start);
        }
        return false;
    }
    eatZero() {
        if (this.currentCodePoint === DIGIT_ZERO &&
            !isDecimalDigit(this.nextCodePoint)) {
            this._lastIntValue = 0;
            this.advance();
            return true;
        }
        return false;
    }
    eatControlEscape() {
        if (this.eat(LATIN_SMALL_LETTER_F)) {
            this._lastIntValue = FORM_FEED;
            return true;
        }
        if (this.eat(LATIN_SMALL_LETTER_N)) {
            this._lastIntValue = LINE_FEED;
            return true;
        }
        if (this.eat(LATIN_SMALL_LETTER_R)) {
            this._lastIntValue = CARRIAGE_RETURN;
            return true;
        }
        if (this.eat(LATIN_SMALL_LETTER_T)) {
            this._lastIntValue = CHARACTER_TABULATION;
            return true;
        }
        if (this.eat(LATIN_SMALL_LETTER_V)) {
            this._lastIntValue = LINE_TABULATION;
            return true;
        }
        return false;
    }
    eatControlLetter() {
        const cp = this.currentCodePoint;
        if (isLatinLetter(cp)) {
            this.advance();
            this._lastIntValue = cp % 0x20;
            return true;
        }
        return false;
    }
    eatRegExpUnicodeEscapeSequence(forceUFlag = false) {
        const start = this.index;
        const uFlag = forceUFlag || this._unicodeMode;
        if (this.eat(LATIN_SMALL_LETTER_U)) {
            if ((uFlag && this.eatRegExpUnicodeSurrogatePairEscape()) ||
                this.eatFixedHexDigits(4) ||
                (uFlag && this.eatRegExpUnicodeCodePointEscape())) {
                return true;
            }
            if (this.strict || uFlag) {
                this.raise("Invalid unicode escape");
            }
            this.rewind(start);
        }
        return false;
    }
    eatRegExpUnicodeSurrogatePairEscape() {
        const start = this.index;
        if (this.eatFixedHexDigits(4)) {
            const lead = this._lastIntValue;
            if (isLeadSurrogate(lead) &&
                this.eat(REVERSE_SOLIDUS) &&
                this.eat(LATIN_SMALL_LETTER_U) &&
                this.eatFixedHexDigits(4)) {
                const trail = this._lastIntValue;
                if (isTrailSurrogate(trail)) {
                    this._lastIntValue = combineSurrogatePair(lead, trail);
                    return true;
                }
            }
            this.rewind(start);
        }
        return false;
    }
    eatRegExpUnicodeCodePointEscape() {
        const start = this.index;
        if (this.eat(LEFT_CURLY_BRACKET) &&
            this.eatHexDigits() &&
            this.eat(RIGHT_CURLY_BRACKET) &&
            isValidUnicode(this._lastIntValue)) {
            return true;
        }
        this.rewind(start);
        return false;
    }
    eatIdentityEscape() {
        const cp = this.currentCodePoint;
        if (this.isValidIdentityEscape(cp)) {
            this._lastIntValue = cp;
            this.advance();
            return true;
        }
        return false;
    }
    isValidIdentityEscape(cp) {
        if (cp === -1) {
            return false;
        }
        if (this._unicodeMode) {
            return isSyntaxCharacter(cp) || cp === SOLIDUS;
        }
        if (this.strict) {
            return !isIdContinue(cp);
        }
        if (this._nFlag) {
            return !(cp === LATIN_SMALL_LETTER_C || cp === LATIN_SMALL_LETTER_K);
        }
        return cp !== LATIN_SMALL_LETTER_C;
    }
    eatDecimalEscape() {
        this._lastIntValue = 0;
        let cp = this.currentCodePoint;
        if (cp >= DIGIT_ONE && cp <= DIGIT_NINE) {
            do {
                this._lastIntValue = 10 * this._lastIntValue + (cp - DIGIT_ZERO);
                this.advance();
            } while ((cp = this.currentCodePoint) >= DIGIT_ZERO &&
                cp <= DIGIT_NINE);
            return true;
        }
        return false;
    }
    eatUnicodePropertyValueExpression() {
        const start = this.index;
        if (this.eatUnicodePropertyName() && this.eat(EQUALS_SIGN)) {
            const key = this._lastStrValue;
            if (this.eatUnicodePropertyValue()) {
                const value = this._lastStrValue;
                if (isValidUnicodeProperty(this.ecmaVersion, key, value)) {
                    return {
                        key,
                        value: value || null,
                    };
                }
                this.raise("Invalid property name");
            }
        }
        this.rewind(start);
        if (this.eatLoneUnicodePropertyNameOrValue()) {
            const nameOrValue = this._lastStrValue;
            if (isValidUnicodeProperty(this.ecmaVersion, "General_Category", nameOrValue)) {
                return {
                    key: "General_Category",
                    value: nameOrValue || null,
                };
            }
            if (isValidLoneUnicodeProperty(this.ecmaVersion, nameOrValue)) {
                return {
                    key: nameOrValue,
                    value: null,
                };
            }
            if (this._unicodeSetsMode &&
                isValidLoneUnicodePropertyOfString(this.ecmaVersion, nameOrValue)) {
                return {
                    key: nameOrValue,
                    value: null,
                    strings: true,
                };
            }
            this.raise("Invalid property name");
        }
        return null;
    }
    eatUnicodePropertyName() {
        this._lastStrValue = "";
        while (isUnicodePropertyNameCharacter(this.currentCodePoint)) {
            this._lastStrValue += String.fromCodePoint(this.currentCodePoint);
            this.advance();
        }
        return this._lastStrValue !== "";
    }
    eatUnicodePropertyValue() {
        this._lastStrValue = "";
        while (isUnicodePropertyValueCharacter(this.currentCodePoint)) {
            this._lastStrValue += String.fromCodePoint(this.currentCodePoint);
            this.advance();
        }
        return this._lastStrValue !== "";
    }
    eatLoneUnicodePropertyNameOrValue() {
        return this.eatUnicodePropertyValue();
    }
    eatHexEscapeSequence() {
        const start = this.index;
        if (this.eat(LATIN_SMALL_LETTER_X)) {
            if (this.eatFixedHexDigits(2)) {
                return true;
            }
            if (this._unicodeMode || this.strict) {
                this.raise("Invalid escape");
            }
            this.rewind(start);
        }
        return false;
    }
    eatDecimalDigits() {
        const start = this.index;
        this._lastIntValue = 0;
        while (isDecimalDigit(this.currentCodePoint)) {
            this._lastIntValue =
                10 * this._lastIntValue + digitToInt(this.currentCodePoint);
            this.advance();
        }
        return this.index !== start;
    }
    eatHexDigits() {
        const start = this.index;
        this._lastIntValue = 0;
        while (isHexDigit(this.currentCodePoint)) {
            this._lastIntValue =
                16 * this._lastIntValue + digitToInt(this.currentCodePoint);
            this.advance();
        }
        return this.index !== start;
    }
    eatLegacyOctalEscapeSequence() {
        if (this.eatOctalDigit()) {
            const n1 = this._lastIntValue;
            if (this.eatOctalDigit()) {
                const n2 = this._lastIntValue;
                if (n1 <= 3 && this.eatOctalDigit()) {
                    this._lastIntValue = n1 * 64 + n2 * 8 + this._lastIntValue;
                }
                else {
                    this._lastIntValue = n1 * 8 + n2;
                }
            }
            else {
                this._lastIntValue = n1;
            }
            return true;
        }
        return false;
    }
    eatOctalDigit() {
        const cp = this.currentCodePoint;
        if (isOctalDigit(cp)) {
            this.advance();
            this._lastIntValue = cp - DIGIT_ZERO;
            return true;
        }
        this._lastIntValue = 0;
        return false;
    }
    eatFixedHexDigits(length) {
        const start = this.index;
        this._lastIntValue = 0;
        for (let i = 0; i < length; ++i) {
            const cp = this.currentCodePoint;
            if (!isHexDigit(cp)) {
                this.rewind(start);
                return false;
            }
            this._lastIntValue = 16 * this._lastIntValue + digitToInt(cp);
            this.advance();
        }
        return true;
    }
    eatModifiers() {
        let ate = false;
        while (isRegularExpressionModifier(this.currentCodePoint)) {
            this.advance();
            ate = true;
        }
        return ate;
    }
    parseModifiers(start, end) {
        const { ignoreCase, multiline, dotAll } = this.parseFlags(this._reader.source, start, end);
        return { ignoreCase, multiline, dotAll };
    }
    parseFlags(source, start, end) {
        const flags = {
            global: false,
            ignoreCase: false,
            multiline: false,
            unicode: false,
            sticky: false,
            dotAll: false,
            hasIndices: false,
            unicodeSets: false,
        };
        const validFlags = new Set();
        validFlags.add(LATIN_SMALL_LETTER_G);
        validFlags.add(LATIN_SMALL_LETTER_I);
        validFlags.add(LATIN_SMALL_LETTER_M);
        if (this.ecmaVersion >= 2015) {
            validFlags.add(LATIN_SMALL_LETTER_U);
            validFlags.add(LATIN_SMALL_LETTER_Y);
            if (this.ecmaVersion >= 2018) {
                validFlags.add(LATIN_SMALL_LETTER_S);
                if (this.ecmaVersion >= 2022) {
                    validFlags.add(LATIN_SMALL_LETTER_D);
                    if (this.ecmaVersion >= 2024) {
                        validFlags.add(LATIN_SMALL_LETTER_V);
                    }
                }
            }
        }
        for (let i = start; i < end; ++i) {
            const flag = source.charCodeAt(i);
            if (validFlags.has(flag)) {
                const prop = FLAG_CODEPOINT_TO_PROP[flag];
                if (flags[prop]) {
                    this.raise(`Duplicated flag '${source[i]}'`, {
                        index: start,
                    });
                }
                flags[prop] = true;
            }
            else {
                this.raise(`Invalid flag '${source[i]}'`, { index: start });
            }
        }
        return flags;
    }
}

const DUMMY_PATTERN = {};
const DUMMY_FLAGS = {};
const DUMMY_CAPTURING_GROUP = {};
function isClassSetOperand(node) {
    return (node.type === "Character" ||
        node.type === "CharacterSet" ||
        node.type === "CharacterClass" ||
        node.type === "ExpressionCharacterClass" ||
        node.type === "ClassStringDisjunction");
}
class RegExpParserState {
    constructor(options) {
        var _a;
        this._node = DUMMY_PATTERN;
        this._expressionBufferMap = new Map();
        this._flags = DUMMY_FLAGS;
        this._backreferences = [];
        this._capturingGroups = [];
        this.source = "";
        this.strict = Boolean(options === null || options === void 0 ? void 0 : options.strict);
        this.ecmaVersion = (_a = options === null || options === void 0 ? void 0 : options.ecmaVersion) !== null && _a !== void 0 ? _a : latestEcmaVersion;
    }
    get pattern() {
        if (this._node.type !== "Pattern") {
            throw new Error("UnknownError");
        }
        return this._node;
    }
    get flags() {
        if (this._flags.type !== "Flags") {
            throw new Error("UnknownError");
        }
        return this._flags;
    }
    onRegExpFlags(start, end, { global, ignoreCase, multiline, unicode, sticky, dotAll, hasIndices, unicodeSets, }) {
        this._flags = {
            type: "Flags",
            parent: null,
            start,
            end,
            raw: this.source.slice(start, end),
            global,
            ignoreCase,
            multiline,
            unicode,
            sticky,
            dotAll,
            hasIndices,
            unicodeSets,
        };
    }
    onPatternEnter(start) {
        this._node = {
            type: "Pattern",
            parent: null,
            start,
            end: start,
            raw: "",
            alternatives: [],
        };
        this._backreferences.length = 0;
        this._capturingGroups.length = 0;
    }
    onPatternLeave(start, end) {
        this._node.end = end;
        this._node.raw = this.source.slice(start, end);
        for (const reference of this._backreferences) {
            const ref = reference.ref;
            const groups = typeof ref === "number"
                ? [this._capturingGroups[ref - 1]]
                : this._capturingGroups.filter((g) => g.name === ref);
            if (groups.length === 1) {
                const group = groups[0];
                reference.ambiguous = false;
                reference.resolved = group;
            }
            else {
                reference.ambiguous = true;
                reference.resolved = groups;
            }
            for (const group of groups) {
                group.references.push(reference);
            }
        }
    }
    onAlternativeEnter(start) {
        const parent = this._node;
        if (parent.type !== "Assertion" &&
            parent.type !== "CapturingGroup" &&
            parent.type !== "Group" &&
            parent.type !== "Pattern") {
            throw new Error("UnknownError");
        }
        this._node = {
            type: "Alternative",
            parent,
            start,
            end: start,
            raw: "",
            elements: [],
        };
        parent.alternatives.push(this._node);
    }
    onAlternativeLeave(start, end) {
        const node = this._node;
        if (node.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
    onGroupEnter(start) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        const group = {
            type: "Group",
            parent,
            start,
            end: start,
            raw: "",
            modifiers: null,
            alternatives: [],
        };
        this._node = group;
        parent.elements.push(this._node);
    }
    onGroupLeave(start, end) {
        const node = this._node;
        if (node.type !== "Group" || node.parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
    onModifiersEnter(start) {
        const parent = this._node;
        if (parent.type !== "Group") {
            throw new Error("UnknownError");
        }
        this._node = {
            type: "Modifiers",
            parent,
            start,
            end: start,
            raw: "",
            add: null,
            remove: null,
        };
        parent.modifiers = this._node;
    }
    onModifiersLeave(start, end) {
        const node = this._node;
        if (node.type !== "Modifiers" || node.parent.type !== "Group") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
    onAddModifiers(start, end, { ignoreCase, multiline, dotAll, }) {
        const parent = this._node;
        if (parent.type !== "Modifiers") {
            throw new Error("UnknownError");
        }
        parent.add = {
            type: "ModifierFlags",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            ignoreCase,
            multiline,
            dotAll,
        };
    }
    onRemoveModifiers(start, end, { ignoreCase, multiline, dotAll, }) {
        const parent = this._node;
        if (parent.type !== "Modifiers") {
            throw new Error("UnknownError");
        }
        parent.remove = {
            type: "ModifierFlags",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            ignoreCase,
            multiline,
            dotAll,
        };
    }
    onCapturingGroupEnter(start, name) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        this._node = {
            type: "CapturingGroup",
            parent,
            start,
            end: start,
            raw: "",
            name,
            alternatives: [],
            references: [],
        };
        parent.elements.push(this._node);
        this._capturingGroups.push(this._node);
    }
    onCapturingGroupLeave(start, end) {
        const node = this._node;
        if (node.type !== "CapturingGroup" ||
            node.parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
    onQuantifier(start, end, min, max, greedy) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        const element = parent.elements.pop();
        if (element == null ||
            element.type === "Quantifier" ||
            (element.type === "Assertion" && element.kind !== "lookahead")) {
            throw new Error("UnknownError");
        }
        const node = {
            type: "Quantifier",
            parent,
            start: element.start,
            end,
            raw: this.source.slice(element.start, end),
            min,
            max,
            greedy,
            element,
        };
        parent.elements.push(node);
        element.parent = node;
    }
    onLookaroundAssertionEnter(start, kind, negate) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        const node = (this._node = {
            type: "Assertion",
            parent,
            start,
            end: start,
            raw: "",
            kind,
            negate,
            alternatives: [],
        });
        parent.elements.push(node);
    }
    onLookaroundAssertionLeave(start, end) {
        const node = this._node;
        if (node.type !== "Assertion" || node.parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
    onEdgeAssertion(start, end, kind) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        parent.elements.push({
            type: "Assertion",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            kind,
        });
    }
    onWordBoundaryAssertion(start, end, kind, negate) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        parent.elements.push({
            type: "Assertion",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            kind,
            negate,
        });
    }
    onAnyCharacterSet(start, end, kind) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        parent.elements.push({
            type: "CharacterSet",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            kind,
        });
    }
    onEscapeCharacterSet(start, end, kind, negate) {
        const parent = this._node;
        if (parent.type !== "Alternative" && parent.type !== "CharacterClass") {
            throw new Error("UnknownError");
        }
        parent.elements.push({
            type: "CharacterSet",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            kind,
            negate,
        });
    }
    onUnicodePropertyCharacterSet(start, end, kind, key, value, negate, strings) {
        const parent = this._node;
        if (parent.type !== "Alternative" && parent.type !== "CharacterClass") {
            throw new Error("UnknownError");
        }
        const base = {
            type: "CharacterSet",
            parent: null,
            start,
            end,
            raw: this.source.slice(start, end),
            kind,
            strings: null,
            key,
        };
        if (strings) {
            if ((parent.type === "CharacterClass" && !parent.unicodeSets) ||
                negate ||
                value !== null) {
                throw new Error("UnknownError");
            }
            parent.elements.push(Object.assign(Object.assign({}, base), { parent, strings, value, negate }));
        }
        else {
            parent.elements.push(Object.assign(Object.assign({}, base), { parent, strings, value, negate }));
        }
    }
    onCharacter(start, end, value) {
        const parent = this._node;
        if (parent.type !== "Alternative" &&
            parent.type !== "CharacterClass" &&
            parent.type !== "StringAlternative") {
            throw new Error("UnknownError");
        }
        parent.elements.push({
            type: "Character",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            value,
        });
    }
    onBackreference(start, end, ref) {
        const parent = this._node;
        if (parent.type !== "Alternative") {
            throw new Error("UnknownError");
        }
        const node = {
            type: "Backreference",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            ref,
            ambiguous: false,
            resolved: DUMMY_CAPTURING_GROUP,
        };
        parent.elements.push(node);
        this._backreferences.push(node);
    }
    onCharacterClassEnter(start, negate, unicodeSets) {
        const parent = this._node;
        const base = {
            type: "CharacterClass",
            parent,
            start,
            end: start,
            raw: "",
            unicodeSets,
            negate,
            elements: [],
        };
        if (parent.type === "Alternative") {
            const node = Object.assign(Object.assign({}, base), { parent });
            this._node = node;
            parent.elements.push(node);
        }
        else if (parent.type === "CharacterClass" &&
            parent.unicodeSets &&
            unicodeSets) {
            const node = Object.assign(Object.assign({}, base), { parent,
                unicodeSets });
            this._node = node;
            parent.elements.push(node);
        }
        else {
            throw new Error("UnknownError");
        }
    }
    onCharacterClassLeave(start, end) {
        const node = this._node;
        if (node.type !== "CharacterClass" ||
            (node.parent.type !== "Alternative" &&
                node.parent.type !== "CharacterClass")) {
            throw new Error("UnknownError");
        }
        const parent = node.parent;
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = parent;
        const expression = this._expressionBufferMap.get(node);
        if (!expression) {
            return;
        }
        if (node.elements.length > 0) {
            throw new Error("UnknownError");
        }
        this._expressionBufferMap.delete(node);
        const newNode = {
            type: "ExpressionCharacterClass",
            parent,
            start: node.start,
            end: node.end,
            raw: node.raw,
            negate: node.negate,
            expression,
        };
        expression.parent = newNode;
        if (node !== parent.elements.pop()) {
            throw new Error("UnknownError");
        }
        parent.elements.push(newNode);
    }
    onCharacterClassRange(start, end) {
        const parent = this._node;
        if (parent.type !== "CharacterClass") {
            throw new Error("UnknownError");
        }
        const elements = parent.elements;
        const max = elements.pop();
        if (!max || max.type !== "Character") {
            throw new Error("UnknownError");
        }
        if (!parent.unicodeSets) {
            const hyphen = elements.pop();
            if (!hyphen ||
                hyphen.type !== "Character" ||
                hyphen.value !== HYPHEN_MINUS) {
                throw new Error("UnknownError");
            }
        }
        const min = elements.pop();
        if (!min || min.type !== "Character") {
            throw new Error("UnknownError");
        }
        const node = {
            type: "CharacterClassRange",
            parent,
            start,
            end,
            raw: this.source.slice(start, end),
            min,
            max,
        };
        min.parent = node;
        max.parent = node;
        elements.push(node);
    }
    onClassIntersection(start, end) {
        var _a;
        const parent = this._node;
        if (parent.type !== "CharacterClass" || !parent.unicodeSets) {
            throw new Error("UnknownError");
        }
        const right = parent.elements.pop();
        const left = (_a = this._expressionBufferMap.get(parent)) !== null && _a !== void 0 ? _a : parent.elements.pop();
        if (!left ||
            !right ||
            left.type === "ClassSubtraction" ||
            (left.type !== "ClassIntersection" && !isClassSetOperand(left)) ||
            !isClassSetOperand(right)) {
            throw new Error("UnknownError");
        }
        const node = {
            type: "ClassIntersection",
            parent: parent,
            start,
            end,
            raw: this.source.slice(start, end),
            left,
            right,
        };
        left.parent = node;
        right.parent = node;
        this._expressionBufferMap.set(parent, node);
    }
    onClassSubtraction(start, end) {
        var _a;
        const parent = this._node;
        if (parent.type !== "CharacterClass" || !parent.unicodeSets) {
            throw new Error("UnknownError");
        }
        const right = parent.elements.pop();
        const left = (_a = this._expressionBufferMap.get(parent)) !== null && _a !== void 0 ? _a : parent.elements.pop();
        if (!left ||
            !right ||
            left.type === "ClassIntersection" ||
            (left.type !== "ClassSubtraction" && !isClassSetOperand(left)) ||
            !isClassSetOperand(right)) {
            throw new Error("UnknownError");
        }
        const node = {
            type: "ClassSubtraction",
            parent: parent,
            start,
            end,
            raw: this.source.slice(start, end),
            left,
            right,
        };
        left.parent = node;
        right.parent = node;
        this._expressionBufferMap.set(parent, node);
    }
    onClassStringDisjunctionEnter(start) {
        const parent = this._node;
        if (parent.type !== "CharacterClass" || !parent.unicodeSets) {
            throw new Error("UnknownError");
        }
        this._node = {
            type: "ClassStringDisjunction",
            parent,
            start,
            end: start,
            raw: "",
            alternatives: [],
        };
        parent.elements.push(this._node);
    }
    onClassStringDisjunctionLeave(start, end) {
        const node = this._node;
        if (node.type !== "ClassStringDisjunction" ||
            node.parent.type !== "CharacterClass") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
    onStringAlternativeEnter(start) {
        const parent = this._node;
        if (parent.type !== "ClassStringDisjunction") {
            throw new Error("UnknownError");
        }
        this._node = {
            type: "StringAlternative",
            parent,
            start,
            end: start,
            raw: "",
            elements: [],
        };
        parent.alternatives.push(this._node);
    }
    onStringAlternativeLeave(start, end) {
        const node = this._node;
        if (node.type !== "StringAlternative") {
            throw new Error("UnknownError");
        }
        node.end = end;
        node.raw = this.source.slice(start, end);
        this._node = node.parent;
    }
}
class RegExpParser {
    constructor(options) {
        this._state = new RegExpParserState(options);
        this._validator = new RegExpValidator(this._state);
    }
    parseLiteral(source, start = 0, end = source.length) {
        this._state.source = source;
        this._validator.validateLiteral(source, start, end);
        const pattern = this._state.pattern;
        const flags = this._state.flags;
        const literal = {
            type: "RegExpLiteral",
            parent: null,
            start,
            end,
            raw: source,
            pattern,
            flags,
        };
        pattern.parent = literal;
        flags.parent = literal;
        return literal;
    }
    parseFlags(source, start = 0, end = source.length) {
        this._state.source = source;
        this._validator.validateFlags(source, start, end);
        return this._state.flags;
    }
    parsePattern(source, start = 0, end = source.length, uFlagOrFlags = undefined) {
        this._state.source = source;
        this._validator.validatePattern(source, start, end, uFlagOrFlags);
        return this._state.pattern;
    }
}

class RegExpVisitor {
    constructor(handlers) {
        this._handlers = handlers;
    }
    visit(node) {
        switch (node.type) {
            case "Alternative":
                this.visitAlternative(node);
                break;
            case "Assertion":
                this.visitAssertion(node);
                break;
            case "Backreference":
                this.visitBackreference(node);
                break;
            case "CapturingGroup":
                this.visitCapturingGroup(node);
                break;
            case "Character":
                this.visitCharacter(node);
                break;
            case "CharacterClass":
                this.visitCharacterClass(node);
                break;
            case "CharacterClassRange":
                this.visitCharacterClassRange(node);
                break;
            case "CharacterSet":
                this.visitCharacterSet(node);
                break;
            case "ClassIntersection":
                this.visitClassIntersection(node);
                break;
            case "ClassStringDisjunction":
                this.visitClassStringDisjunction(node);
                break;
            case "ClassSubtraction":
                this.visitClassSubtraction(node);
                break;
            case "ExpressionCharacterClass":
                this.visitExpressionCharacterClass(node);
                break;
            case "Flags":
                this.visitFlags(node);
                break;
            case "Group":
                this.visitGroup(node);
                break;
            case "Modifiers":
                this.visitModifiers(node);
                break;
            case "ModifierFlags":
                this.visitModifierFlags(node);
                break;
            case "Pattern":
                this.visitPattern(node);
                break;
            case "Quantifier":
                this.visitQuantifier(node);
                break;
            case "RegExpLiteral":
                this.visitRegExpLiteral(node);
                break;
            case "StringAlternative":
                this.visitStringAlternative(node);
                break;
            default:
                throw new Error(`Unknown type: ${node.type}`);
        }
    }
    visitAlternative(node) {
        if (this._handlers.onAlternativeEnter) {
            this._handlers.onAlternativeEnter(node);
        }
        node.elements.forEach(this.visit, this);
        if (this._handlers.onAlternativeLeave) {
            this._handlers.onAlternativeLeave(node);
        }
    }
    visitAssertion(node) {
        if (this._handlers.onAssertionEnter) {
            this._handlers.onAssertionEnter(node);
        }
        if (node.kind === "lookahead" || node.kind === "lookbehind") {
            node.alternatives.forEach(this.visit, this);
        }
        if (this._handlers.onAssertionLeave) {
            this._handlers.onAssertionLeave(node);
        }
    }
    visitBackreference(node) {
        if (this._handlers.onBackreferenceEnter) {
            this._handlers.onBackreferenceEnter(node);
        }
        if (this._handlers.onBackreferenceLeave) {
            this._handlers.onBackreferenceLeave(node);
        }
    }
    visitCapturingGroup(node) {
        if (this._handlers.onCapturingGroupEnter) {
            this._handlers.onCapturingGroupEnter(node);
        }
        node.alternatives.forEach(this.visit, this);
        if (this._handlers.onCapturingGroupLeave) {
            this._handlers.onCapturingGroupLeave(node);
        }
    }
    visitCharacter(node) {
        if (this._handlers.onCharacterEnter) {
            this._handlers.onCharacterEnter(node);
        }
        if (this._handlers.onCharacterLeave) {
            this._handlers.onCharacterLeave(node);
        }
    }
    visitCharacterClass(node) {
        if (this._handlers.onCharacterClassEnter) {
            this._handlers.onCharacterClassEnter(node);
        }
        node.elements.forEach(this.visit, this);
        if (this._handlers.onCharacterClassLeave) {
            this._handlers.onCharacterClassLeave(node);
        }
    }
    visitCharacterClassRange(node) {
        if (this._handlers.onCharacterClassRangeEnter) {
            this._handlers.onCharacterClassRangeEnter(node);
        }
        this.visitCharacter(node.min);
        this.visitCharacter(node.max);
        if (this._handlers.onCharacterClassRangeLeave) {
            this._handlers.onCharacterClassRangeLeave(node);
        }
    }
    visitCharacterSet(node) {
        if (this._handlers.onCharacterSetEnter) {
            this._handlers.onCharacterSetEnter(node);
        }
        if (this._handlers.onCharacterSetLeave) {
            this._handlers.onCharacterSetLeave(node);
        }
    }
    visitClassIntersection(node) {
        if (this._handlers.onClassIntersectionEnter) {
            this._handlers.onClassIntersectionEnter(node);
        }
        this.visit(node.left);
        this.visit(node.right);
        if (this._handlers.onClassIntersectionLeave) {
            this._handlers.onClassIntersectionLeave(node);
        }
    }
    visitClassStringDisjunction(node) {
        if (this._handlers.onClassStringDisjunctionEnter) {
            this._handlers.onClassStringDisjunctionEnter(node);
        }
        node.alternatives.forEach(this.visit, this);
        if (this._handlers.onClassStringDisjunctionLeave) {
            this._handlers.onClassStringDisjunctionLeave(node);
        }
    }
    visitClassSubtraction(node) {
        if (this._handlers.onClassSubtractionEnter) {
            this._handlers.onClassSubtractionEnter(node);
        }
        this.visit(node.left);
        this.visit(node.right);
        if (this._handlers.onClassSubtractionLeave) {
            this._handlers.onClassSubtractionLeave(node);
        }
    }
    visitExpressionCharacterClass(node) {
        if (this._handlers.onExpressionCharacterClassEnter) {
            this._handlers.onExpressionCharacterClassEnter(node);
        }
        this.visit(node.expression);
        if (this._handlers.onExpressionCharacterClassLeave) {
            this._handlers.onExpressionCharacterClassLeave(node);
        }
    }
    visitFlags(node) {
        if (this._handlers.onFlagsEnter) {
            this._handlers.onFlagsEnter(node);
        }
        if (this._handlers.onFlagsLeave) {
            this._handlers.onFlagsLeave(node);
        }
    }
    visitGroup(node) {
        if (this._handlers.onGroupEnter) {
            this._handlers.onGroupEnter(node);
        }
        if (node.modifiers) {
            this.visit(node.modifiers);
        }
        node.alternatives.forEach(this.visit, this);
        if (this._handlers.onGroupLeave) {
            this._handlers.onGroupLeave(node);
        }
    }
    visitModifiers(node) {
        if (this._handlers.onModifiersEnter) {
            this._handlers.onModifiersEnter(node);
        }
        if (node.add) {
            this.visit(node.add);
        }
        if (node.remove) {
            this.visit(node.remove);
        }
        if (this._handlers.onModifiersLeave) {
            this._handlers.onModifiersLeave(node);
        }
    }
    visitModifierFlags(node) {
        if (this._handlers.onModifierFlagsEnter) {
            this._handlers.onModifierFlagsEnter(node);
        }
        if (this._handlers.onModifierFlagsLeave) {
            this._handlers.onModifierFlagsLeave(node);
        }
    }
    visitPattern(node) {
        if (this._handlers.onPatternEnter) {
            this._handlers.onPatternEnter(node);
        }
        node.alternatives.forEach(this.visit, this);
        if (this._handlers.onPatternLeave) {
            this._handlers.onPatternLeave(node);
        }
    }
    visitQuantifier(node) {
        if (this._handlers.onQuantifierEnter) {
            this._handlers.onQuantifierEnter(node);
        }
        this.visit(node.element);
        if (this._handlers.onQuantifierLeave) {
            this._handlers.onQuantifierLeave(node);
        }
    }
    visitRegExpLiteral(node) {
        if (this._handlers.onRegExpLiteralEnter) {
            this._handlers.onRegExpLiteralEnter(node);
        }
        this.visitPattern(node.pattern);
        this.visitFlags(node.flags);
        if (this._handlers.onRegExpLiteralLeave) {
            this._handlers.onRegExpLiteralLeave(node);
        }
    }
    visitStringAlternative(node) {
        if (this._handlers.onStringAlternativeEnter) {
            this._handlers.onStringAlternativeEnter(node);
        }
        node.elements.forEach(this.visit, this);
        if (this._handlers.onStringAlternativeLeave) {
            this._handlers.onStringAlternativeLeave(node);
        }
    }
}

function parseRegExpLiteral(source, options) {
    return new RegExpParser(options).parseLiteral(String(source));
}
function validateRegExpLiteral(source, options) {
    new RegExpValidator(options).validateLiteral(source);
}
function visitRegExpAST(node, handlers) {
    new RegExpVisitor(handlers).visit(node);
}

export { ast as AST, RegExpParser, RegExpSyntaxError, RegExpValidator, parseRegExpLiteral, validateRegExpLiteral, visitRegExpAST };
//# sourceMappingURL=index.mjs.map


import { EventEmitter } from 'events';

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

function mri2 (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	for (i=opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j=arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}

	for (i=opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j=arr.length; j-- > 0;) opts.string.push(arr[j]);
	}

	if (defaults) {
		for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i=0; i < arr.length; i++) {
					opts[name].push(arr[i]);
				}
			}
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
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
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }
  return res;
};
const getMriOptions = (options) => {
  const result = {alias: {}, boolean: []};
  for (const [index, option] of options.entries()) {
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      if (option.negated) {
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
        });
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
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
      if (typeof transform.transformFunction === "function") {
        obj[key] = obj[key].map(transform.transformFunction);
      }
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
class CACError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class Option {
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
    if (this.negated && this.config.default == null) {
      this.config.default = true;
    }
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
}

const processArgs = process.argv;
const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;

class Command {
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
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
    const {name, commands} = this.cli;
    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand;
    let sections = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
      }
    ];
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
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(options.map((option) => option.rawName));
      sections.push({
        title: "Options",
        body: options.map((option) => {
          return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
        }).join("\n")
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join("\n")
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    console.log(sections.map((section) => {
      return section.title ? `${section.title}:
${section.body}` : section.body;
    }).join("\n\n"));
  }
  outputVersion() {
    const {name} = this.cli;
    const {versionNumber} = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const {options, globalCommand} = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const {options: parsedOptions, globalCommand} = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      if (option.required) {
        const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
        if (value === true || value === false && !hasNegated) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}
class GlobalCommand extends Command {
  constructor(cli) {
    super("@@global@@", "", {}, cli);
  }
}

var __assign = Object.assign;
class CAC extends EventEmitter {
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
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({args, options}, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = void 0;
    this.matchedCommandName = void 0;
  }
  parse(argv = processArgs, {
    run = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        const parsedInfo = __assign(__assign({}, parsed), {
          args: parsed.args.slice(1)
        });
        this.setParsedInfo(parsedInfo, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
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
    const parsedArgv = {args: this.args, options: this.options};
    if (run) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0]) {
      this.emit("command:*");
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri2(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return __assign(__assign({}, res), {
        [camelcaseOptionName(name)]: parsed[name]
      });
    }, {_: []});
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    let transforms = Object.create(null);
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === void 0) {
          transforms[cliOption.name] = Object.create(null);
          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const {args, options, matchedCommand: command} = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
}

const cac = (name = "") => new CAC(name);

export default cac;
export { CAC, Command, cac };


import { createRequire } from "module";
import { basename, dirname, normalize, relative, resolve, sep } from "path";
import * as nativeFs from "fs";

//#region rolldown:runtime
var __require = /* @__PURE__ */ createRequire(import.meta.url);

//#endregion
//#region src/utils.ts
function cleanPath(path) {
	let normalized = normalize(path);
	if (normalized.length > 1 && normalized[normalized.length - 1] === sep) normalized = normalized.substring(0, normalized.length - 1);
	return normalized;
}
const SLASHES_REGEX = /[\\/]/g;
function convertSlashes(path, separator) {
	return path.replace(SLASHES_REGEX, separator);
}
const WINDOWS_ROOT_DIR_REGEX = /^[a-z]:[\\/]$/i;
function isRootDirectory(path) {
	return path === "/" || WINDOWS_ROOT_DIR_REGEX.test(path);
}
function normalizePath(path, options) {
	const { resolvePaths, normalizePath: normalizePath$1, pathSeparator } = options;
	const pathNeedsCleaning = process.platform === "win32" && path.includes("/") || path.startsWith(".");
	if (resolvePaths) path = resolve(path);
	if (normalizePath$1 || pathNeedsCleaning) path = cleanPath(path);
	if (path === ".") return "";
	const needsSeperator = path[path.length - 1] !== pathSeparator;
	return convertSlashes(needsSeperator ? path + pathSeparator : path, pathSeparator);
}

//#endregion
//#region src/api/functions/join-path.ts
function joinPathWithBasePath(filename, directoryPath) {
	return directoryPath + filename;
}
function joinPathWithRelativePath(root, options) {
	return function(filename, directoryPath) {
		const sameRoot = directoryPath.startsWith(root);
		if (sameRoot) return directoryPath.slice(root.length) + filename;
		else return convertSlashes(relative(root, directoryPath), options.pathSeparator) + options.pathSeparator + filename;
	};
}
function joinPath(filename) {
	return filename;
}
function joinDirectoryPath(filename, directoryPath, separator) {
	return directoryPath + filename + separator;
}
function build$7(root, options) {
	const { relativePaths, includeBasePath } = options;
	return relativePaths && root ? joinPathWithRelativePath(root, options) : includeBasePath ? joinPathWithBasePath : joinPath;
}

//#endregion
//#region src/api/functions/push-directory.ts
function pushDirectoryWithRelativePath(root) {
	return function(directoryPath, paths) {
		paths.push(directoryPath.substring(root.length) || ".");
	};
}
function pushDirectoryFilterWithRelativePath(root) {
	return function(directoryPath, paths, filters) {
		const relativePath = directoryPath.substring(root.length) || ".";
		if (filters.every((filter) => filter(relativePath, true))) paths.push(relativePath);
	};
}
const pushDirectory = (directoryPath, paths) => {
	paths.push(directoryPath || ".");
};
const pushDirectoryFilter = (directoryPath, paths, filters) => {
	const path = directoryPath || ".";
	if (filters.every((filter) => filter(path, true))) paths.push(path);
};
const empty$2 = () => {};
function build$6(root, options) {
	const { includeDirs, filters, relativePaths } = options;
	if (!includeDirs) return empty$2;
	if (relativePaths) return filters && filters.length ? pushDirectoryFilterWithRelativePath(root) : pushDirectoryWithRelativePath(root);
	return filters && filters.length ? pushDirectoryFilter : pushDirectory;
}

//#endregion
//#region src/api/functions/push-file.ts
const pushFileFilterAndCount = (filename, _paths, counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) counts.files++;
};
const pushFileFilter = (filename, paths, _counts, filters) => {
	if (filters.every((filter) => filter(filename, false))) paths.push(filename);
};
const pushFileCount = (_filename, _paths, counts, _filters) => {
	counts.files++;
};
const pushFile = (filename, paths) => {
	paths.push(filename);
};
const empty$1 = () => {};
function build$5(options) {
	const { excludeFiles, filters, onlyCounts } = options;
	if (excludeFiles) return empty$1;
	if (filters && filters.length) return onlyCounts ? pushFileFilterAndCount : pushFileFilter;
	else if (onlyCounts) return pushFileCount;
	else return pushFile;
}

//#endregion
//#region src/api/functions/get-array.ts
const getArray = (paths) => {
	return paths;
};
const getArrayGroup = () => {
	return [""].slice(0, 0);
};
function build$4(options) {
	return options.group ? getArrayGroup : getArray;
}

//#endregion
//#region src/api/functions/group-files.ts
const groupFiles = (groups, directory, files) => {
	groups.push({
		directory,
		files,
		dir: directory
	});
};
const empty = () => {};
function build$3(options) {
	return options.group ? groupFiles : empty;
}

//#endregion
//#region src/api/functions/resolve-symlink.ts
const resolveSymlinksAsync = function(path, state, callback$1) {
	const { queue, fs, options: { suppressErrors } } = state;
	queue.enqueue();
	fs.realpath(path, (error, resolvedPath) => {
		if (error) return queue.dequeue(suppressErrors ? null : error, state);
		fs.stat(resolvedPath, (error$1, stat) => {
			if (error$1) return queue.dequeue(suppressErrors ? null : error$1, state);
			if (stat.isDirectory() && isRecursive(path, resolvedPath, state)) return queue.dequeue(null, state);
			callback$1(stat, resolvedPath);
			queue.dequeue(null, state);
		});
	});
};
const resolveSymlinks = function(path, state, callback$1) {
	const { queue, fs, options: { suppressErrors } } = state;
	queue.enqueue();
	try {
		const resolvedPath = fs.realpathSync(path);
		const stat = fs.statSync(resolvedPath);
		if (stat.isDirectory() && isRecursive(path, resolvedPath, state)) return;
		callback$1(stat, resolvedPath);
	} catch (e) {
		if (!suppressErrors) throw e;
	}
};
function build$2(options, isSynchronous) {
	if (!options.resolveSymlinks || options.excludeSymlinks) return null;
	return isSynchronous ? resolveSymlinks : resolveSymlinksAsync;
}
function isRecursive(path, resolved, state) {
	if (state.options.useRealPaths) return isRecursiveUsingRealPaths(resolved, state);
	let parent = dirname(path);
	let depth = 1;
	while (parent !== state.root && depth < 2) {
		const resolvedPath = state.symlinks.get(parent);
		const isSameRoot = !!resolvedPath && (resolvedPath === resolved || resolvedPath.startsWith(resolved) || resolved.startsWith(resolvedPath));
		if (isSameRoot) depth++;
		else parent = dirname(parent);
	}
	state.symlinks.set(path, resolved);
	return depth > 1;
}
function isRecursiveUsingRealPaths(resolved, state) {
	return state.visited.includes(resolved + state.options.pathSeparator);
}

//#endregion
//#region src/api/functions/invoke-callback.ts
const onlyCountsSync = (state) => {
	return state.counts;
};
const groupsSync = (state) => {
	return state.groups;
};
const defaultSync = (state) => {
	return state.paths;
};
const limitFilesSync = (state) => {
	return state.paths.slice(0, state.options.maxFiles);
};
const onlyCountsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.counts, state.options.suppressErrors);
	return null;
};
const defaultAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths, state.options.suppressErrors);
	return null;
};
const limitFilesAsync = (state, error, callback$1) => {
	report(error, callback$1, state.paths.slice(0, state.options.maxFiles), state.options.suppressErrors);
	return null;
};
const groupsAsync = (state, error, callback$1) => {
	report(error, callback$1, state.groups, state.options.suppressErrors);
	return null;
};
function report(error, callback$1, output, suppressErrors) {
	if (error && !suppressErrors) callback$1(error, output);
	else callback$1(null, output);
}
function build$1(options, isSynchronous) {
	const { onlyCounts, group, maxFiles } = options;
	if (onlyCounts) return isSynchronous ? onlyCountsSync : onlyCountsAsync;
	else if (group) return isSynchronous ? groupsSync : groupsAsync;
	else if (maxFiles) return isSynchronous ? limitFilesSync : limitFilesAsync;
	else return isSynchronous ? defaultSync : defaultAsync;
}

//#endregion
//#region src/api/functions/walk-directory.ts
const readdirOpts = { withFileTypes: true };
const walkAsync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	state.queue.enqueue();
	if (currentDepth < 0) return state.queue.dequeue(null, state);
	const { fs } = state;
	state.visited.push(crawlPath);
	state.counts.directories++;
	fs.readdir(crawlPath || ".", readdirOpts, (error, entries = []) => {
		callback$1(entries, directoryPath, currentDepth);
		state.queue.dequeue(state.options.suppressErrors ? null : error, state);
	});
};
const walkSync = (state, crawlPath, directoryPath, currentDepth, callback$1) => {
	const { fs } = state;
	if (currentDepth < 0) return;
	state.visited.push(crawlPath);
	state.counts.directories++;
	let entries = [];
	try {
		entries = fs.readdirSync(crawlPath || ".", readdirOpts);
	} catch (e) {
		if (!state.options.suppressErrors) throw e;
	}
	callback$1(entries, directoryPath, currentDepth);
};
function build(isSynchronous) {
	return isSynchronous ? walkSync : walkAsync;
}

//#endregion
//#region src/api/queue.ts
/**
* This is a custom stateless queue to track concurrent async fs calls.
* It increments a counter whenever a call is queued and decrements it
* as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
*/
var Queue = class {
	count = 0;
	constructor(onQueueEmpty) {
		this.onQueueEmpty = onQueueEmpty;
	}
	enqueue() {
		this.count++;
		return this.count;
	}
	dequeue(error, output) {
		if (this.onQueueEmpty && (--this.count <= 0 || error)) {
			this.onQueueEmpty(error, output);
			if (error) {
				output.controller.abort();
				this.onQueueEmpty = void 0;
			}
		}
	}
};

//#endregion
//#region src/api/counter.ts
var Counter = class {
	_files = 0;
	_directories = 0;
	set files(num) {
		this._files = num;
	}
	get files() {
		return this._files;
	}
	set directories(num) {
		this._directories = num;
	}
	get directories() {
		return this._directories;
	}
	/**
	* @deprecated use `directories` instead
	*/
	/* c8 ignore next 3 */
	get dirs() {
		return this._directories;
	}
};

//#endregion
//#region src/api/aborter.ts
/**
* AbortController is not supported on Node 14 so we use this until we can drop
* support for Node 14.
*/
var Aborter = class {
	aborted = false;
	abort() {
		this.aborted = true;
	}
};

//#endregion
//#region src/api/walker.ts
var Walker = class {
	root;
	isSynchronous;
	state;
	joinPath;
	pushDirectory;
	pushFile;
	getArray;
	groupFiles;
	resolveSymlink;
	walkDirectory;
	callbackInvoker;
	constructor(root, options, callback$1) {
		this.isSynchronous = !callback$1;
		this.callbackInvoker = build$1(options, this.isSynchronous);
		this.root = normalizePath(root, options);
		this.state = {
			root: isRootDirectory(this.root) ? this.root : this.root.slice(0, -1),
			paths: [""].slice(0, 0),
			groups: [],
			counts: new Counter(),
			options,
			queue: new Queue((error, state) => this.callbackInvoker(state, error, callback$1)),
			symlinks: /* @__PURE__ */ new Map(),
			visited: [""].slice(0, 0),
			controller: new Aborter(),
			fs: options.fs || nativeFs
		};
		this.joinPath = build$7(this.root, options);
		this.pushDirectory = build$6(this.root, options);
		this.pushFile = build$5(options);
		this.getArray = build$4(options);
		this.groupFiles = build$3(options);
		this.resolveSymlink = build$2(options, this.isSynchronous);
		this.walkDirectory = build(this.isSynchronous);
	}
	start() {
		this.pushDirectory(this.root, this.state.paths, this.state.options.filters);
		this.walkDirectory(this.state, this.root, this.root, this.state.options.maxDepth, this.walk);
		return this.isSynchronous ? this.callbackInvoker(this.state, null) : null;
	}
	walk = (entries, directoryPath, depth) => {
		const { paths, options: { filters, resolveSymlinks: resolveSymlinks$1, excludeSymlinks, exclude, maxFiles, signal, useRealPaths, pathSeparator }, controller } = this.state;
		if (controller.aborted || signal && signal.aborted || maxFiles && paths.length > maxFiles) return;
		const files = this.getArray(this.state.paths);
		for (let i = 0; i < entries.length; ++i) {
			const entry = entries[i];
			if (entry.isFile() || entry.isSymbolicLink() && !resolveSymlinks$1 && !excludeSymlinks) {
				const filename = this.joinPath(entry.name, directoryPath);
				this.pushFile(filename, files, this.state.counts, filters);
			} else if (entry.isDirectory()) {
				let path = joinDirectoryPath(entry.name, directoryPath, this.state.options.pathSeparator);
				if (exclude && exclude(entry.name, path)) continue;
				this.pushDirectory(path, paths, filters);
				this.walkDirectory(this.state, path, path, depth - 1, this.walk);
			} else if (this.resolveSymlink && entry.isSymbolicLink()) {
				let path = joinPathWithBasePath(entry.name, directoryPath);
				this.resolveSymlink(path, this.state, (stat, resolvedPath) => {
					if (stat.isDirectory()) {
						resolvedPath = normalizePath(resolvedPath, this.state.options);
						if (exclude && exclude(entry.name, useRealPaths ? resolvedPath : path + pathSeparator)) return;
						this.walkDirectory(this.state, resolvedPath, useRealPaths ? resolvedPath : path + pathSeparator, depth - 1, this.walk);
					} else {
						resolvedPath = useRealPaths ? resolvedPath : path;
						const filename = basename(resolvedPath);
						const directoryPath$1 = normalizePath(dirname(resolvedPath), this.state.options);
						resolvedPath = this.joinPath(filename, directoryPath$1);
						this.pushFile(resolvedPath, files, this.state.counts, filters);
					}
				});
			}
		}
		this.groupFiles(this.state.groups, directoryPath, files);
	};
};

//#endregion
//#region src/api/async.ts
function promise(root, options) {
	return new Promise((resolve$1, reject) => {
		callback(root, options, (err, output) => {
			if (err) return reject(err);
			resolve$1(output);
		});
	});
}
function callback(root, options, callback$1) {
	let walker = new Walker(root, options, callback$1);
	walker.start();
}

//#endregion
//#region src/api/sync.ts
function sync(root, options) {
	const walker = new Walker(root, options);
	return walker.start();
}

//#endregion
//#region src/builder/api-builder.ts
var APIBuilder = class {
	constructor(root, options) {
		this.root = root;
		this.options = options;
	}
	withPromise() {
		return promise(this.root, this.options);
	}
	withCallback(cb) {
		callback(this.root, this.options, cb);
	}
	sync() {
		return sync(this.root, this.options);
	}
};

//#endregion
//#region src/builder/index.ts
let pm = null;
/* c8 ignore next 6 */
try {
	__require.resolve("picomatch");
	pm = __require("picomatch");
} catch {}
var Builder = class {
	globCache = {};
	options = {
		maxDepth: Infinity,
		suppressErrors: true,
		pathSeparator: sep,
		filters: []
	};
	globFunction;
	constructor(options) {
		this.options = {
			...this.options,
			...options
		};
		this.globFunction = this.options.globFunction;
	}
	group() {
		this.options.group = true;
		return this;
	}
	withPathSeparator(separator) {
		this.options.pathSeparator = separator;
		return this;
	}
	withBasePath() {
		this.options.includeBasePath = true;
		return this;
	}
	withRelativePaths() {
		this.options.relativePaths = true;
		return this;
	}
	withDirs() {
		this.options.includeDirs = true;
		return this;
	}
	withMaxDepth(depth) {
		this.options.maxDepth = depth;
		return this;
	}
	withMaxFiles(limit) {
		this.options.maxFiles = limit;
		return this;
	}
	withFullPaths() {
		this.options.resolvePaths = true;
		this.options.includeBasePath = true;
		return this;
	}
	withErrors() {
		this.options.suppressErrors = false;
		return this;
	}
	withSymlinks({ resolvePaths = true } = {}) {
		this.options.resolveSymlinks = true;
		this.options.useRealPaths = resolvePaths;
		return this.withFullPaths();
	}
	withAbortSignal(signal) {
		this.options.signal = signal;
		return this;
	}
	normalize() {
		this.options.normalizePath = true;
		return this;
	}
	filter(predicate) {
		this.options.filters.push(predicate);
		return this;
	}
	onlyDirs() {
		this.options.excludeFiles = true;
		this.options.includeDirs = true;
		return this;
	}
	exclude(predicate) {
		this.options.exclude = predicate;
		return this;
	}
	onlyCounts() {
		this.options.onlyCounts = true;
		return this;
	}
	crawl(root) {
		return new APIBuilder(root || ".", this.options);
	}
	withGlobFunction(fn) {
		this.globFunction = fn;
		return this;
	}
	/**
	* @deprecated Pass options using the constructor instead:
	* ```ts
	* new fdir(options).crawl("/path/to/root");
	* ```
	* This method will be removed in v7.0
	*/
	/* c8 ignore next 4 */
	crawlWithOptions(root, options) {
		this.options = {
			...this.options,
			...options
		};
		return new APIBuilder(root || ".", this.options);
	}
	glob(...patterns) {
		if (this.globFunction) return this.globWithOptions(patterns);
		return this.globWithOptions(patterns, ...[{ dot: true }]);
	}
	globWithOptions(patterns, ...options) {
		const globFn = this.globFunction || pm;
		/* c8 ignore next 5 */
		if (!globFn) throw new Error("Please specify a glob function to use glob matching.");
		var isMatch = this.globCache[patterns.join("\0")];
		if (!isMatch) {
			isMatch = globFn(patterns, ...options);
			this.globCache[patterns.join("\0")] = isMatch;
		}
		this.options.filters.push((path) => isMatch(path));
		return this;
	}
};

//#endregion
export { Builder as fdir };

export default function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}


export { OpenAIRealtimeError } from "./internal-base.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { OpenAI as default } from "./client.mjs";
export { toFile } from "./core/uploads.mjs";
export { APIPromise } from "./core/api-promise.mjs";
export { OpenAI } from "./client.mjs";
export { PagePromise } from "./core/pagination.mjs";
export { OpenAIError, APIError, APIConnectionError, APIConnectionTimeoutError, APIUserAbortError, NotFoundError, ConflictError, RateLimitError, BadRequestError, AuthenticationError, InternalServerError, PermissionDeniedError, UnprocessableEntityError, InvalidWebhookSignatureError, } from "./core/error.mjs";
export { AzureOpenAI } from "./azure.mjs";
//# sourceMappingURL=index.mjs.map

import { default_format, formatters, RFC1738, RFC3986 } from "./formats.mjs";
const formats = {
    formatters,
    RFC1738,
    RFC3986,
    default: default_format,
};
export { stringify } from "./stringify.mjs";
export { formats };
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Audio } from "./audio.mjs";
export { Speech } from "./speech.mjs";
export { Transcriptions, } from "./transcriptions.mjs";
export { Translations, } from "./translations.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Assistants, } from "./assistants.mjs";
export { Beta } from "./beta.mjs";
export { Realtime } from "./realtime/index.mjs";
export { Threads, } from "./threads/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Realtime } from "./realtime.mjs";
export { Sessions } from "./sessions.mjs";
export { TranscriptionSessions, } from "./transcription-sessions.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Messages, } from "./messages.mjs";
export { Runs, } from "./runs/index.mjs";
export { Threads, } from "./threads.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Runs, } from "./runs.mjs";
export { Steps, } from "./steps.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Completions, } from "./completions.mjs";
export * from "./completions.mjs";
export { Messages } from "./messages.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Chat } from "./chat.mjs";
export { Completions, } from "./completions/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Content } from "./content.mjs";
export { Files, } from "./files.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Containers, } from "./containers.mjs";
export { Files, } from "./files/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Conversations } from "./conversations.mjs";
export { Items, } from "./items.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Evals, } from "./evals.mjs";
export { Runs, } from "./runs/index.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { OutputItems, } from "./output-items.mjs";
export { Runs, } from "./runs.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Alpha } from "./alpha.mjs";
export { Graders, } from "./graders.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Checkpoints } from "./checkpoints.mjs";
export { Permissions, } from "./permissions.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Alpha } from "./alpha/index.mjs";
export { Checkpoints } from "./checkpoints/index.mjs";
export { FineTuning } from "./fine-tuning.mjs";
export { Jobs, } from "./jobs/index.mjs";
export { Methods, } from "./methods.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Checkpoints, } from "./checkpoints.mjs";
export { Jobs, } from "./jobs.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { GraderModels, } from "./grader-models.mjs";
export { Graders } from "./graders.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export * from "./chat/index.mjs";
export * from "./shared.mjs";
export { Audio } from "./audio/audio.mjs";
export { Batches, } from "./batches.mjs";
export { Beta } from "./beta/beta.mjs";
export { Completions, } from "./completions.mjs";
export { Containers, } from "./containers/containers.mjs";
export { Conversations } from "./conversations/conversations.mjs";
export { Embeddings, } from "./embeddings.mjs";
export { Evals, } from "./evals/evals.mjs";
export { Files, } from "./files.mjs";
export { FineTuning } from "./fine-tuning/fine-tuning.mjs";
export { Graders } from "./graders/graders.mjs";
export { Images, } from "./images.mjs";
export { Models } from "./models.mjs";
export { Moderations, } from "./moderations.mjs";
export { Responses } from "./responses/responses.mjs";
export { Uploads } from "./uploads/uploads.mjs";
export { VectorStores, } from "./vector-stores/vector-stores.mjs";
export { Webhooks } from "./webhooks.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { InputItems } from "./input-items.mjs";
export { Responses } from "./responses.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { Parts } from "./parts.mjs";
export { Uploads } from "./uploads.mjs";
//# sourceMappingURL=index.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export { FileBatches, } from "./file-batches.mjs";
export { Files, } from "./files.mjs";
export { VectorStores, } from "./vector-stores.mjs";
//# sourceMappingURL=index.mjs.map

export * from "./Options.mjs";
export * from "./Refs.mjs";
export * from "./errorMessages.mjs";
export * from "./parseDef.mjs";
export * from "./parsers/any.mjs";
export * from "./parsers/array.mjs";
export * from "./parsers/bigint.mjs";
export * from "./parsers/boolean.mjs";
export * from "./parsers/branded.mjs";
export * from "./parsers/catch.mjs";
export * from "./parsers/date.mjs";
export * from "./parsers/default.mjs";
export * from "./parsers/effects.mjs";
export * from "./parsers/enum.mjs";
export * from "./parsers/intersection.mjs";
export * from "./parsers/literal.mjs";
export * from "./parsers/map.mjs";
export * from "./parsers/nativeEnum.mjs";
export * from "./parsers/never.mjs";
export * from "./parsers/null.mjs";
export * from "./parsers/nullable.mjs";
export * from "./parsers/number.mjs";
export * from "./parsers/object.mjs";
export * from "./parsers/optional.mjs";
export * from "./parsers/pipeline.mjs";
export * from "./parsers/promise.mjs";
export * from "./parsers/readonly.mjs";
export * from "./parsers/record.mjs";
export * from "./parsers/set.mjs";
export * from "./parsers/string.mjs";
export * from "./parsers/tuple.mjs";
export * from "./parsers/undefined.mjs";
export * from "./parsers/union.mjs";
export * from "./parsers/unknown.mjs";
export * from "./zodToJsonSchema.mjs";
import { zodToJsonSchema } from "./zodToJsonSchema.mjs";
export default zodToJsonSchema;
//# sourceMappingURL=index.mjs.map

import { _ as _path } from './shared/pathe.M-eThtNZ.mjs';
export { c as basename, d as dirname, e as extname, f as format, i as isAbsolute, j as join, m as matchesGlob, n as normalize, a as normalizeString, p as parse, b as relative, r as resolve, s as sep, t as toNamespacedPath } from './shared/pathe.M-eThtNZ.mjs';

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: void 0, win32: void 0 };
const mix = (del = delimiter) => {
  return new Proxy(_path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

export { posix as default, delimiter, posix, win32 };


const r=Object.create(null),i=e=>globalThis.process?.env||import.meta.env||globalThis.Deno?.env.toObject()||globalThis.__env__||(e?r:globalThis),o=new Proxy(r,{get(e,s){return i()[s]??r[s]},has(e,s){const E=i();return s in E||s in r},set(e,s,E){const B=i(!0);return B[s]=E,!0},deleteProperty(e,s){if(!s)return!1;const E=i(!0);return delete E[s],!0},ownKeys(){const e=i(!0);return Object.keys(e)}}),t=typeof process<"u"&&process.env&&process.env.NODE_ENV||"",f=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:!0}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:!0}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:!0}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:!1}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:!1}],["VERCEL","VERCEL_ENV",{ci:!1}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:!1}],["CODESANDBOX","CODESANDBOX_HOST",{ci:!1}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:!0}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:!0}]];function b(){if(globalThis.process?.env)for(const e of f){const s=e[1]||e[0];if(globalThis.process?.env[s])return{name:e[0].toLowerCase(),...e[2]}}return globalThis.process?.env?.SHELL==="/bin/jsh"&&globalThis.process?.versions?.webcontainer?{name:"stackblitz",ci:!1}:{name:"",ci:!1}}const l=b(),p=l.name;function n(e){return e?e!=="false":!1}const I=globalThis.process?.platform||"",T=n(o.CI)||l.ci!==!1,R=n(globalThis.process?.stdout&&globalThis.process?.stdout.isTTY),U=typeof window<"u",d=n(o.DEBUG),a=t==="test"||n(o.TEST),g=t==="production",h=t==="dev"||t==="development",v=n(o.MINIMAL)||T||a||!R,A=/^win/i.test(I),M=/^linux/i.test(I),m=/^darwin/i.test(I),Y=!n(o.NO_COLOR)&&(n(o.FORCE_COLOR)||(R||A)&&o.TERM!=="dumb"||T),C=(globalThis.process?.versions?.node||"").replace(/^v/,"")||null,V=Number(C?.split(".")[0])||null,W=globalThis.process||Object.create(null),_={versions:{}},y=new Proxy(W,{get(e,s){if(s==="env")return o;if(s in e)return e[s];if(s in _)return _[s]}}),O=globalThis.process?.release?.name==="node",c=!!globalThis.Bun||!!globalThis.process?.versions?.bun,D=!!globalThis.Deno,L=!!globalThis.fastly,S=!!globalThis.Netlify,u=!!globalThis.EdgeRuntime,N=globalThis.navigator?.userAgent==="Cloudflare-Workers",F=[[S,"netlify"],[u,"edge-light"],[N,"workerd"],[L,"fastly"],[D,"deno"],[c,"bun"],[O,"node"]];function G(){const e=F.find(s=>s[0]);if(e)return{name:e[1]}}const P=G(),K=P?.name||"";export{o as env,R as hasTTY,U as hasWindow,c as isBun,T as isCI,Y as isColorSupported,d as isDebug,D as isDeno,h as isDevelopment,u as isEdgeLight,L as isFastly,M as isLinux,m as isMacOS,v as isMinimal,S as isNetlify,O as isNode,g as isProduction,a as isTest,A as isWindows,N as isWorkerd,t as nodeENV,V as nodeMajorVersion,C as nodeVersion,I as platform,y as process,p as provider,l as providerInfo,K as runtime,P as runtimeInfo};


import jsTokens from 'js-tokens';

function stripLiteralJsTokens(code, options) {
  const FILL = options?.fillChar ?? " ";
  const FILL_COMMENT = " ";
  let result = "";
  const filter = options?.filter ?? (() => true);
  const tokens = [];
  for (const token of jsTokens(code, { jsx: false })) {
    tokens.push(token);
    if (token.type === "SingleLineComment") {
      result += FILL_COMMENT.repeat(token.value.length);
      continue;
    }
    if (token.type === "MultiLineComment") {
      result += token.value.replace(/[^\n]/g, FILL_COMMENT);
      continue;
    }
    if (token.type === "StringLiteral") {
      if (!token.closed) {
        result += token.value;
        continue;
      }
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += token.value[0] + FILL.repeat(body.length) + token.value[token.value.length - 1];
        continue;
      }
    }
    if (token.type === "NoSubstitutionTemplate") {
      const body = token.value.slice(1, -1);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "RegularExpressionLiteral") {
      const body = token.value;
      if (filter(body)) {
        result += body.replace(/\/(.*)\/(\w?)$/g, (_, $1, $2) => `/${FILL.repeat($1.length)}/${$2}`);
        continue;
      }
    }
    if (token.type === "TemplateHead") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `\`${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    if (token.type === "TemplateTail") {
      const body = token.value.slice(0, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\``;
        continue;
      }
    }
    if (token.type === "TemplateMiddle") {
      const body = token.value.slice(1, -2);
      if (filter(body)) {
        result += `}${body.replace(/[^\n]/g, FILL)}\${`;
        continue;
      }
    }
    result += token.value;
  }
  return {
    result,
    tokens
  };
}

function stripLiteral(code, options) {
  return stripLiteralDetailed(code, options).result;
}
function stripLiteralDetailed(code, options) {
  return stripLiteralJsTokens(code, options);
}

export { stripLiteral, stripLiteralDetailed, stripLiteralJsTokens };


import path, { posix } from "path";
import { fdir } from "fdir";
import picomatch from "picomatch";

//#region src/utils.ts
const ONLY_PARENT_DIRECTORIES = /^(\/?\.\.)+$/;
function getPartialMatcher(patterns, options) {
	const patternsCount = patterns.length;
	const patternsParts = Array(patternsCount);
	const regexes = Array(patternsCount);
	for (let i = 0; i < patternsCount; i++) {
		const parts = splitPattern(patterns[i]);
		patternsParts[i] = parts;
		const partsCount = parts.length;
		const partRegexes = Array(partsCount);
		for (let j = 0; j < partsCount; j++) partRegexes[j] = picomatch.makeRe(parts[j], options);
		regexes[i] = partRegexes;
	}
	return (input) => {
		const inputParts = input.split("/");
		if (inputParts[0] === ".." && ONLY_PARENT_DIRECTORIES.test(input)) return true;
		for (let i = 0; i < patterns.length; i++) {
			const patternParts = patternsParts[i];
			const regex = regexes[i];
			const inputPatternCount = inputParts.length;
			const minParts = Math.min(inputPatternCount, patternParts.length);
			let j = 0;
			while (j < minParts) {
				const part = patternParts[j];
				if (part.includes("/")) return true;
				const match = regex[j].test(inputParts[j]);
				if (!match) break;
				if (part === "**") return true;
				j++;
			}
			if (j === inputPatternCount) return true;
		}
		return false;
	};
}
const splitPatternOptions = { parts: true };
function splitPattern(path$1) {
	var _result$parts;
	const result = picomatch.scan(path$1, splitPatternOptions);
	return ((_result$parts = result.parts) === null || _result$parts === void 0 ? void 0 : _result$parts.length) ? result.parts : [path$1];
}
const isWin = process.platform === "win32";
const ESCAPED_WIN32_BACKSLASHES = /\\(?![()[\]{}!+@])/g;
function convertPosixPathToPattern(path$1) {
	return escapePosixPath(path$1);
}
function convertWin32PathToPattern(path$1) {
	return escapeWin32Path(path$1).replace(ESCAPED_WIN32_BACKSLASHES, "/");
}
const convertPathToPattern = isWin ? convertWin32PathToPattern : convertPosixPathToPattern;
const POSIX_UNESCAPED_GLOB_SYMBOLS = /(?<!\\)([()[\]{}*?|]|^!|[!+@](?=\()|\\(?![()[\]{}!*+?@|]))/g;
const WIN32_UNESCAPED_GLOB_SYMBOLS = /(?<!\\)([()[\]{}]|^!|[!+@](?=\())/g;
const escapePosixPath = (path$1) => path$1.replace(POSIX_UNESCAPED_GLOB_SYMBOLS, "\\$&");
const escapeWin32Path = (path$1) => path$1.replace(WIN32_UNESCAPED_GLOB_SYMBOLS, "\\$&");
const escapePath = isWin ? escapeWin32Path : escapePosixPath;
function isDynamicPattern(pattern, options) {
	if ((options === null || options === void 0 ? void 0 : options.caseSensitiveMatch) === false) return true;
	const scan = picomatch.scan(pattern);
	return scan.isGlob || scan.negated;
}
function log(...tasks) {
	console.log(`[tinyglobby ${new Date().toLocaleTimeString("es")}]`, ...tasks);
}

//#endregion
//#region src/index.ts
const PARENT_DIRECTORY = /^(\/?\.\.)+/;
const ESCAPING_BACKSLASHES = /\\(?=[()[\]{}!*+?@|])/g;
const BACKSLASHES = /\\/g;
function normalizePattern(pattern, expandDirectories, cwd, props, isIgnore) {
	let result = pattern;
	if (pattern.endsWith("/")) result = pattern.slice(0, -1);
	if (!result.endsWith("*") && expandDirectories) result += "/**";
	const escapedCwd = escapePath(cwd);
	if (path.isAbsolute(result.replace(ESCAPING_BACKSLASHES, ""))) result = posix.relative(escapedCwd, result);
	else result = posix.normalize(result);
	const parentDirectoryMatch = PARENT_DIRECTORY.exec(result);
	const parts = splitPattern(result);
	if (parentDirectoryMatch === null || parentDirectoryMatch === void 0 ? void 0 : parentDirectoryMatch[0]) {
		const n = (parentDirectoryMatch[0].length + 1) / 3;
		let i = 0;
		const cwdParts = escapedCwd.split("/");
		while (i < n && parts[i + n] === cwdParts[cwdParts.length + i - n]) {
			result = result.slice(0, (n - i - 1) * 3) + result.slice((n - i) * 3 + parts[i + n].length + 1) || ".";
			i++;
		}
		const potentialRoot = posix.join(cwd, parentDirectoryMatch[0].slice(i * 3));
		if (!potentialRoot.startsWith(".") && props.root.length > potentialRoot.length) {
			props.root = potentialRoot;
			props.depthOffset = -n + i;
		}
	}
	if (!isIgnore && props.depthOffset >= 0) {
		var _props$commonPath;
		(_props$commonPath = props.commonPath) !== null && _props$commonPath !== void 0 || (props.commonPath = parts);
		const newCommonPath = [];
		const length = Math.min(props.commonPath.length, parts.length);
		for (let i = 0; i < length; i++) {
			const part = parts[i];
			if (part === "**" && !parts[i + 1]) {
				newCommonPath.pop();
				break;
			}
			if (part !== props.commonPath[i] || isDynamicPattern(part) || i === parts.length - 1) break;
			newCommonPath.push(part);
		}
		props.depthOffset = newCommonPath.length;
		props.commonPath = newCommonPath;
		props.root = newCommonPath.length > 0 ? path.posix.join(cwd, ...newCommonPath) : cwd;
	}
	return result;
}
function processPatterns({ patterns, ignore = [], expandDirectories = true }, cwd, props) {
	if (typeof patterns === "string") patterns = [patterns];
	else if (!patterns) patterns = ["**/*"];
	if (typeof ignore === "string") ignore = [ignore];
	const matchPatterns = [];
	const ignorePatterns = [];
	for (const pattern of ignore) {
		if (!pattern) continue;
		if (pattern[0] !== "!" || pattern[1] === "(") ignorePatterns.push(normalizePattern(pattern, expandDirectories, cwd, props, true));
	}
	for (const pattern of patterns) {
		if (!pattern) continue;
		if (pattern[0] !== "!" || pattern[1] === "(") matchPatterns.push(normalizePattern(pattern, expandDirectories, cwd, props, false));
		else if (pattern[1] !== "!" || pattern[2] === "(") ignorePatterns.push(normalizePattern(pattern.slice(1), expandDirectories, cwd, props, true));
	}
	return {
		match: matchPatterns,
		ignore: ignorePatterns
	};
}
function getRelativePath(path$1, cwd, root) {
	return posix.relative(cwd, `${root}/${path$1}`) || ".";
}
function processPath(path$1, cwd, root, isDirectory, absolute) {
	const relativePath = absolute ? path$1.slice(root === "/" ? 1 : root.length + 1) || "." : path$1;
	if (root === cwd) return isDirectory && relativePath !== "." ? relativePath.slice(0, -1) : relativePath;
	return getRelativePath(relativePath, cwd, root);
}
function formatPaths(paths, cwd, root) {
	for (let i = paths.length - 1; i >= 0; i--) {
		const path$1 = paths[i];
		paths[i] = getRelativePath(path$1, cwd, root) + (!path$1 || path$1.endsWith("/") ? "/" : "");
	}
	return paths;
}
function crawl(options, cwd, sync) {
	if (process.env.TINYGLOBBY_DEBUG) options.debug = true;
	if (options.debug) log("globbing with options:", options, "cwd:", cwd);
	if (Array.isArray(options.patterns) && options.patterns.length === 0) return sync ? [] : Promise.resolve([]);
	const props = {
		root: cwd,
		commonPath: null,
		depthOffset: 0
	};
	const processed = processPatterns(options, cwd, props);
	const nocase = options.caseSensitiveMatch === false;
	if (options.debug) log("internal processing patterns:", processed);
	const matcher = picomatch(processed.match, {
		dot: options.dot,
		nocase,
		ignore: processed.ignore
	});
	const ignore = picomatch(processed.ignore, {
		dot: options.dot,
		nocase
	});
	const partialMatcher = getPartialMatcher(processed.match, {
		dot: options.dot,
		nocase
	});
	const fdirOptions = {
		filters: [options.debug ? (p, isDirectory) => {
			const path$1 = processPath(p, cwd, props.root, isDirectory, options.absolute);
			const matches = matcher(path$1);
			if (matches) log(`matched ${path$1}`);
			return matches;
		} : (p, isDirectory) => matcher(processPath(p, cwd, props.root, isDirectory, options.absolute))],
		exclude: options.debug ? (_, p) => {
			const relativePath = processPath(p, cwd, props.root, true, true);
			const skipped = relativePath !== "." && !partialMatcher(relativePath) || ignore(relativePath);
			if (skipped) log(`skipped ${p}`);
			else log(`crawling ${p}`);
			return skipped;
		} : (_, p) => {
			const relativePath = processPath(p, cwd, props.root, true, true);
			return relativePath !== "." && !partialMatcher(relativePath) || ignore(relativePath);
		},
		pathSeparator: "/",
		relativePaths: true,
		resolveSymlinks: true
	};
	if (options.deep !== void 0) fdirOptions.maxDepth = Math.round(options.deep - props.depthOffset);
	if (options.absolute) {
		fdirOptions.relativePaths = false;
		fdirOptions.resolvePaths = true;
		fdirOptions.includeBasePath = true;
	}
	if (options.followSymbolicLinks === false) {
		fdirOptions.resolveSymlinks = false;
		fdirOptions.excludeSymlinks = true;
	}
	if (options.onlyDirectories) {
		fdirOptions.excludeFiles = true;
		fdirOptions.includeDirs = true;
	} else if (options.onlyFiles === false) fdirOptions.includeDirs = true;
	props.root = props.root.replace(BACKSLASHES, "");
	const root = props.root;
	if (options.debug) log("internal properties:", props);
	const api = new fdir(fdirOptions).crawl(root);
	if (cwd === root || options.absolute) return sync ? api.sync() : api.withPromise();
	return sync ? formatPaths(api.sync(), cwd, root) : api.withPromise().then((paths) => formatPaths(paths, cwd, root));
}
async function glob(patternsOrOptions, options) {
	if (patternsOrOptions && (options === null || options === void 0 ? void 0 : options.patterns)) throw new Error("Cannot pass patterns as both an argument and an option");
	const opts = Array.isArray(patternsOrOptions) || typeof patternsOrOptions === "string" ? {
		...options,
		patterns: patternsOrOptions
	} : patternsOrOptions;
	const cwd = opts.cwd ? path.resolve(opts.cwd).replace(BACKSLASHES, "/") : process.cwd().replace(BACKSLASHES, "/");
	return crawl(opts, cwd, false);
}
function globSync(patternsOrOptions, options) {
	if (patternsOrOptions && (options === null || options === void 0 ? void 0 : options.patterns)) throw new Error("Cannot pass patterns as both an argument and an option");
	const opts = Array.isArray(patternsOrOptions) || typeof patternsOrOptions === "string" ? {
		...options,
		patterns: patternsOrOptions
	} : patternsOrOptions;
	const cwd = opts.cwd ? path.resolve(opts.cwd).replace(BACKSLASHES, "/") : process.cwd().replace(BACKSLASHES, "/");
	return crawl(opts, cwd, true);
}

//#endregion
export { convertPathToPattern, escapePath, glob, globSync, isDynamicPattern };




export * from '@vue/compiler-sfc'

import './register-ts.js'


export * from './index.js'


import { h, Fragment } from 'vue'

function jsx(type, props, key) {
  const { children } = props
  delete props.children
  if (arguments.length > 2) {
    props.key = key
  }
  return h(type, props, children)
}

export { Fragment, jsx, jsx as jsxs, jsx as jsxDEV }


export * from '@vue/server-renderer'
