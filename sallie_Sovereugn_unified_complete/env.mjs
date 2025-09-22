// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * Read an environment variable.
 *
 * Trims beginning and trailing whitespace.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */
export const readEnv = (env) => {
    if (typeof globalThis.process !== 'undefined') {
        return globalThis.process.env?.[env]?.trim() ?? undefined;
    }
    if (typeof globalThis.Deno !== 'undefined') {
        return globalThis.Deno.env?.get?.(env)?.trim();
    }
    return undefined;
};
//# sourceMappingURL=env.mjs.map

//#region src/client/env.ts
const context = (() => {
	if (typeof globalThis !== "undefined") return globalThis;
	else if (typeof self !== "undefined") return self;
	else if (typeof window !== "undefined") return window;
	else return Function("return this")();
})();
const defines = __DEFINES__;
Object.keys(defines).forEach((key) => {
	const segments = key.split(".");
	let target = context;
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		if (i === segments.length - 1) target[segment] = defines[key];
		else target = target[segment] || (target[segment] = {});
	}
});

//#endregion

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
/**
 * Read an environment variable.
 *
 * Trims beginning and trailing whitespace.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */
export const readEnv = (env) => {
    if (typeof globalThis.process !== 'undefined') {
        return globalThis.process.env?.[env]?.trim() ?? undefined;
    }
    if (typeof globalThis.Deno !== 'undefined') {
        return globalThis.Deno.env?.get?.(env)?.trim();
    }
    return undefined;
};
//# sourceMappingURL=env.mjs.map

//#region src/client/env.ts
const context = (() => {
	if (typeof globalThis !== "undefined") return globalThis;
	else if (typeof self !== "undefined") return self;
	else if (typeof window !== "undefined") return window;
	else return Function("return this")();
})();
const defines = __DEFINES__;
Object.keys(defines).forEach((key) => {
	const segments = key.split(".");
	let target = context;
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		if (i === segments.length - 1) target[segment] = defines[key];
		else target = target[segment] || (target[segment] = {});
	}
});

//#endregion