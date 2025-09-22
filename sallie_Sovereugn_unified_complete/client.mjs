// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _OpenAI_instances, _a, _OpenAI_encoder, _OpenAI_baseURLOverridden;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "./internal/tslib.mjs";
import { uuid4 } from "./internal/utils/uuid.mjs";
import { validatePositiveInteger, isAbsoluteURL, safeJSON } from "./internal/utils/values.mjs";
import { sleep } from "./internal/utils/sleep.mjs";
import { castToError, isAbortError } from "./internal/errors.mjs";
import { getPlatformHeaders } from "./internal/detect-platform.mjs";
import * as Shims from "./internal/shims.mjs";
import * as Opts from "./internal/request-options.mjs";
import * as qs from "./internal/qs/index.mjs";
import { VERSION } from "./version.mjs";
import * as Errors from "./core/error.mjs";
import * as Pagination from "./core/pagination.mjs";
import * as Uploads from "./core/uploads.mjs";
import * as API from "./resources/index.mjs";
import { APIPromise } from "./core/api-promise.mjs";
import { Batches, } from "./resources/batches.mjs";
import { Completions, } from "./resources/completions.mjs";
import { Embeddings, } from "./resources/embeddings.mjs";
import { Files, } from "./resources/files.mjs";
import { Images, } from "./resources/images.mjs";
import { Models } from "./resources/models.mjs";
import { Moderations, } from "./resources/moderations.mjs";
import { Webhooks } from "./resources/webhooks.mjs";
import { Audio } from "./resources/audio/audio.mjs";
import { Beta } from "./resources/beta/beta.mjs";
import { Chat } from "./resources/chat/chat.mjs";
import { Containers, } from "./resources/containers/containers.mjs";
import { Conversations } from "./resources/conversations/conversations.mjs";
import { Evals, } from "./resources/evals/evals.mjs";
import { FineTuning } from "./resources/fine-tuning/fine-tuning.mjs";
import { Graders } from "./resources/graders/graders.mjs";
import { Responses } from "./resources/responses/responses.mjs";
import { Uploads as UploadsAPIUploads, } from "./resources/uploads/uploads.mjs";
import { VectorStores, } from "./resources/vector-stores/vector-stores.mjs";
import { isRunningInBrowser } from "./internal/detect-platform.mjs";
import { buildHeaders } from "./internal/headers.mjs";
import { readEnv } from "./internal/utils/env.mjs";
import { formatRequestDetails, loggerFor, parseLogLevel, } from "./internal/utils/log.mjs";
import { isEmptyObj } from "./internal/utils/values.mjs";
/**
 * API Client for interfacing with the OpenAI API.
 */
export class OpenAI {
    /**
     * API Client for interfacing with the OpenAI API.
     *
     * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
     * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
     * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
     * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
     * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
     * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ baseURL = readEnv('OPENAI_BASE_URL'), apiKey = readEnv('OPENAI_API_KEY'), organization = readEnv('OPENAI_ORG_ID') ?? null, project = readEnv('OPENAI_PROJECT_ID') ?? null, webhookSecret = readEnv('OPENAI_WEBHOOK_SECRET') ?? null, ...opts } = {}) {
        _OpenAI_instances.add(this);
        _OpenAI_encoder.set(this, void 0);
        this.completions = new API.Completions(this);
        this.chat = new API.Chat(this);
        this.embeddings = new API.Embeddings(this);
        this.files = new API.Files(this);
        this.images = new API.Images(this);
        this.audio = new API.Audio(this);
        this.moderations = new API.Moderations(this);
        this.models = new API.Models(this);
        this.fineTuning = new API.FineTuning(this);
        this.graders = new API.Graders(this);
        this.vectorStores = new API.VectorStores(this);
        this.webhooks = new API.Webhooks(this);
        this.beta = new API.Beta(this);
        this.batches = new API.Batches(this);
        this.uploads = new API.Uploads(this);
        this.responses = new API.Responses(this);
        this.conversations = new API.Conversations(this);
        this.evals = new API.Evals(this);
        this.containers = new API.Containers(this);
        if (apiKey === undefined) {
            throw new Errors.OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
        }
        const options = {
            apiKey,
            organization,
            project,
            webhookSecret,
            ...opts,
            baseURL: baseURL || `https://api.openai.com/v1`,
        };
        if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
            throw new Errors.OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
        }
        this.baseURL = options.baseURL;
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT /* 10 minutes */;
        this.logger = options.logger ?? console;
        const defaultLogLevel = 'warn';
        // Set default logLevel early so that we can log a warning in parseLogLevel.
        this.logLevel = defaultLogLevel;
        this.logLevel =
            parseLogLevel(options.logLevel, 'ClientOptions.logLevel', this) ??
                parseLogLevel(readEnv('OPENAI_LOG'), "process.env['OPENAI_LOG']", this) ??
                defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? Shims.getDefaultFetch();
        __classPrivateFieldSet(this, _OpenAI_encoder, Opts.FallbackEncoder, "f");
        this._options = options;
        this.apiKey = apiKey;
        this.organization = organization;
        this.project = project;
        this.webhookSecret = webhookSecret;
    }
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */
    withOptions(options) {
        const client = new this.constructor({
            ...this._options,
            baseURL: this.baseURL,
            maxRetries: this.maxRetries,
            timeout: this.timeout,
            logger: this.logger,
            logLevel: this.logLevel,
            fetch: this.fetch,
            fetchOptions: this.fetchOptions,
            apiKey: this.apiKey,
            organization: this.organization,
            project: this.project,
            webhookSecret: this.webhookSecret,
            ...options,
        });
        return client;
    }
    defaultQuery() {
        return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
        return;
    }
    async authHeaders(opts) {
        return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
    }
    stringifyQuery(query) {
        return qs.stringify(query, { arrayFormat: 'brackets' });
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${uuid4()}`;
    }
    makeStatusError(status, error, message, headers) {
        return Errors.APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = (!__classPrivateFieldGet(this, _OpenAI_instances, "m", _OpenAI_baseURLOverridden).call(this) && defaultBaseURL) || this.baseURL;
        const url = isAbsoluteURL(path) ?
            new URL(path)
            : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        if (!isEmptyObj(defaultQuery)) {
            query = { ...defaultQuery, ...query };
        }
        if (typeof query === 'object' && query && !Array.isArray(query)) {
            url.search = this.stringifyQuery(query);
        }
        return url.toString();
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) { }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    async prepareRequest(request, { url, options }) { }
    get(path, opts) {
        return this.methodRequest('get', path, opts);
    }
    post(path, opts) {
        return this.methodRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.methodRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.methodRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.methodRequest('delete', path, opts);
    }
    methodRequest(method, path, opts) {
        return this.request(Promise.resolve(opts).then((opts) => {
            return { method, path, ...opts };
        }));
    }
    request(options, remainingRetries = null) {
        return new APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
            retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
            retryCount: maxRetries - retriesRemaining,
        });
        await this.prepareRequest(req, { url, options });
        /** Not an API request ID, just for correlating local log entries. */
        const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
        const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
            retryOfRequestLogID,
            method: options.method,
            url,
            options,
            headers: req.headers,
        }));
        if (options.signal?.aborted) {
            throw new Errors.APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
        const headersTime = Date.now();
        if (response instanceof Error) {
            const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
            if (options.signal?.aborted) {
                throw new Errors.APIUserAbortError();
            }
            // detect native connection timeout errors
            // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
            // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
            // others do not provide enough information to distinguish timeouts from other connection errors
            const isTimeout = isAbortError(response) ||
                /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, formatRequestDetails({
                retryOfRequestLogID,
                url,
                durationMs: headersTime - startTime,
                message: response.message,
            }));
            if (isTimeout) {
                throw new Errors.APIConnectionTimeoutError();
            }
            throw new Errors.APIConnectionError({ cause: response });
        }
        const specialHeaders = [...response.headers.entries()]
            .filter(([name]) => name === 'x-request-id')
            .map(([name, value]) => ', ' + name + ': ' + JSON.stringify(value))
            .join('');
        const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? 'succeeded' : 'failed'} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
            const shouldRetry = await this.shouldRetry(response);
            if (retriesRemaining && shouldRetry) {
                const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
                // We don't need the body of this response.
                await Shims.CancelReadableStream(response.body);
                loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err) => castToError(err).message);
            const errJSON = safeJSON(errText);
            const errMessage = errJSON ? undefined : errText;
            loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                retryOfRequestLogID,
                url: response.url,
                status: response.status,
                headers: response.headers,
                message: errMessage,
                durationMs: Date.now() - startTime,
            }));
            const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
            throw err;
        }
        loggerFor(this).info(responseInfo);
        loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
    }
    getAPIList(path, Page, opts) {
        return this.requestAPIList(Page, { method: 'get', path, ...opts });
    }
    requestAPIList(Page, options) {
        const request = this.makeRequest(options, null, undefined);
        return new Pagination.PagePromise(this, request, Page);
    }
    async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        if (signal)
            signal.addEventListener('abort', () => controller.abort());
        const timeout = setTimeout(() => controller.abort(), ms);
        const isReadableBody = (globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream) ||
            (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);
        const fetchOptions = {
            signal: controller.signal,
            ...(isReadableBody ? { duplex: 'half' } : {}),
            method: 'GET',
            ...options,
        };
        if (method) {
            // Custom methods like 'patch' need to be uppercased
            // See https://github.com/nodejs/undici/issues/2294
            fetchOptions.method = method.toUpperCase();
        }
        try {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return await this.fetch.call(undefined, url, fetchOptions);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async shouldRetry(response) {
        // Note this is not a standard header.
        const shouldRetryHeader = response.headers.get('x-should-retry');
        // If the server explicitly says whether or not to retry, obey.
        if (shouldRetryHeader === 'true')
            return true;
        if (shouldRetryHeader === 'false')
            return false;
        // Retry on request timeouts.
        if (response.status === 408)
            return true;
        // Retry on lock timeouts.
        if (response.status === 409)
            return true;
        // Retry on rate limits.
        if (response.status === 429)
            return true;
        // Retry internal errors.
        if (response.status >= 500)
            return true;
        return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
        const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
        if (retryAfterMillisHeader) {
            const timeoutMs = parseFloat(retryAfterMillisHeader);
            if (!Number.isNaN(timeoutMs)) {
                timeoutMillis = timeoutMs;
            }
        }
        // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
        const retryAfterHeader = responseHeaders?.get('retry-after');
        if (retryAfterHeader && !timeoutMillis) {
            const timeoutSeconds = parseFloat(retryAfterHeader);
            if (!Number.isNaN(timeoutSeconds)) {
                timeoutMillis = timeoutSeconds * 1000;
            }
            else {
                timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
            }
        }
        // If the API asks us to wait a certain amount of time (and it's a reasonable amount),
        // just do what it says, but otherwise calculate a default
        if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
            const maxRetries = options.maxRetries ?? this.maxRetries;
            timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await sleep(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8.0;
        const numRetries = maxRetries - retriesRemaining;
        // Apply exponential backoff, but not more than the max.
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        // Apply some jitter, take up to at most 25 percent of the retry time.
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1000;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path, query, defaultBaseURL } = options;
        const url = this.buildURL(path, query, defaultBaseURL);
        if ('timeout' in options)
            validatePositiveInteger('timeout', options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
            method,
            headers: reqHeaders,
            ...(options.signal && { signal: options.signal }),
            ...(globalThis.ReadableStream &&
                body instanceof globalThis.ReadableStream && { duplex: 'half' }),
            ...(body && { body }),
            ...(this.fetchOptions ?? {}),
            ...(options.fetchOptions ?? {}),
        };
        return { req, url, timeout: options.timeout };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount, }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== 'get') {
            if (!options.idempotencyKey)
                options.idempotencyKey = this.defaultIdempotencyKey();
            idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = buildHeaders([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
                ...getPlatformHeaders(),
                'OpenAI-Organization': this.organization,
                'OpenAI-Project': this.project,
            },
            await this.authHeaders(options),
            this._options.defaultHeaders,
            bodyHeaders,
            options.headers,
        ]);
        this.validateHeaders(headers);
        return headers.values;
    }
    buildBody({ options: { body, headers: rawHeaders } }) {
        if (!body) {
            return { bodyHeaders: undefined, body: undefined };
        }
        const headers = buildHeaders([rawHeaders]);
        if (
        // Pass raw type verbatim
        ArrayBuffer.isView(body) ||
            body instanceof ArrayBuffer ||
            body instanceof DataView ||
            (typeof body === 'string' &&
                // Preserve legacy string encoding behavior for now
                headers.values.has('content-type')) ||
            // `Blob` is superset of `File`
            body instanceof Blob ||
            // `FormData` -> `multipart/form-data`
            body instanceof FormData ||
            // `URLSearchParams` -> `application/x-www-form-urlencoded`
            body instanceof URLSearchParams ||
            // Send chunked stream (each chunk has own `length`)
            (globalThis.ReadableStream && body instanceof globalThis.ReadableStream)) {
            return { bodyHeaders: undefined, body: body };
        }
        else if (typeof body === 'object' &&
            (Symbol.asyncIterator in body ||
                (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))) {
            return { bodyHeaders: undefined, body: Shims.ReadableStreamFrom(body) };
        }
        else {
            return __classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers });
        }
    }
}
_a = OpenAI, _OpenAI_encoder = new WeakMap(), _OpenAI_instances = new WeakSet(), _OpenAI_baseURLOverridden = function _OpenAI_baseURLOverridden() {
    return this.baseURL !== 'https://api.openai.com/v1';
};
OpenAI.OpenAI = _a;
OpenAI.DEFAULT_TIMEOUT = 600000; // 10 minutes
OpenAI.OpenAIError = Errors.OpenAIError;
OpenAI.APIError = Errors.APIError;
OpenAI.APIConnectionError = Errors.APIConnectionError;
OpenAI.APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
OpenAI.APIUserAbortError = Errors.APIUserAbortError;
OpenAI.NotFoundError = Errors.NotFoundError;
OpenAI.ConflictError = Errors.ConflictError;
OpenAI.RateLimitError = Errors.RateLimitError;
OpenAI.BadRequestError = Errors.BadRequestError;
OpenAI.AuthenticationError = Errors.AuthenticationError;
OpenAI.InternalServerError = Errors.InternalServerError;
OpenAI.PermissionDeniedError = Errors.PermissionDeniedError;
OpenAI.UnprocessableEntityError = Errors.UnprocessableEntityError;
OpenAI.InvalidWebhookSignatureError = Errors.InvalidWebhookSignatureError;
OpenAI.toFile = Uploads.toFile;
OpenAI.Completions = Completions;
OpenAI.Chat = Chat;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders;
OpenAI.VectorStores = VectorStores;
OpenAI.Webhooks = Webhooks;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.Uploads = UploadsAPIUploads;
OpenAI.Responses = Responses;
OpenAI.Conversations = Conversations;
OpenAI.Evals = Evals;
OpenAI.Containers = Containers;
//# sourceMappingURL=client.mjs.map

import "@vite/env";

//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
		return typeof o$1;
	} : function(o$1) {
		return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
	}, _typeof(o);
}

//#endregion
//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}

//#endregion
//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}

//#endregion
//#region src/shared/hmr.ts
var HMRContext = class {
	constructor(hmrClient$1, ownerPath) {
		this.hmrClient = hmrClient$1;
		this.ownerPath = ownerPath;
		_defineProperty(this, "newListeners", void 0);
		if (!hmrClient$1.dataMap.has(ownerPath)) hmrClient$1.dataMap.set(ownerPath, {});
		const mod = hmrClient$1.hotModulesMap.get(ownerPath);
		if (mod) mod.callbacks = [];
		const staleListeners = hmrClient$1.ctxToListenersMap.get(ownerPath);
		if (staleListeners) for (const [event, staleFns] of staleListeners) {
			const listeners = hmrClient$1.customListenersMap.get(event);
			if (listeners) hmrClient$1.customListenersMap.set(event, listeners.filter((l) => !staleFns.includes(l)));
		}
		this.newListeners = /* @__PURE__ */ new Map();
		hmrClient$1.ctxToListenersMap.set(ownerPath, this.newListeners);
	}
	get data() {
		return this.hmrClient.dataMap.get(this.ownerPath);
	}
	accept(deps, callback) {
		if (typeof deps === "function" || !deps) this.acceptDeps([this.ownerPath], ([mod]) => deps?.(mod));
		else if (typeof deps === "string") this.acceptDeps([deps], ([mod]) => callback?.(mod));
		else if (Array.isArray(deps)) this.acceptDeps(deps, callback);
		else throw new Error(`invalid hot.accept() usage.`);
	}
	acceptExports(_, callback) {
		this.acceptDeps([this.ownerPath], ([mod]) => callback?.(mod));
	}
	dispose(cb) {
		this.hmrClient.disposeMap.set(this.ownerPath, cb);
	}
	prune(cb) {
		this.hmrClient.pruneMap.set(this.ownerPath, cb);
	}
	decline() {}
	invalidate(message) {
		const firstInvalidatedBy = this.hmrClient.currentFirstInvalidatedBy ?? this.ownerPath;
		this.hmrClient.notifyListeners("vite:invalidate", {
			path: this.ownerPath,
			message,
			firstInvalidatedBy
		});
		this.send("vite:invalidate", {
			path: this.ownerPath,
			message,
			firstInvalidatedBy
		});
		this.hmrClient.logger.debug(`invalidate ${this.ownerPath}${message ? `: ${message}` : ""}`);
	}
	on(event, cb) {
		const addToMap = (map) => {
			const existing = map.get(event) || [];
			existing.push(cb);
			map.set(event, existing);
		};
		addToMap(this.hmrClient.customListenersMap);
		addToMap(this.newListeners);
	}
	off(event, cb) {
		const removeFromMap = (map) => {
			const existing = map.get(event);
			if (existing === void 0) return;
			const pruned = existing.filter((l) => l !== cb);
			if (pruned.length === 0) {
				map.delete(event);
				return;
			}
			map.set(event, pruned);
		};
		removeFromMap(this.hmrClient.customListenersMap);
		removeFromMap(this.newListeners);
	}
	send(event, data) {
		this.hmrClient.send({
			type: "custom",
			event,
			data
		});
	}
	acceptDeps(deps, callback = () => {}) {
		const mod = this.hmrClient.hotModulesMap.get(this.ownerPath) || {
			id: this.ownerPath,
			callbacks: []
		};
		mod.callbacks.push({
			deps,
			fn: callback
		});
		this.hmrClient.hotModulesMap.set(this.ownerPath, mod);
	}
};
var HMRClient = class {
	constructor(logger, transport$1, importUpdatedModule) {
		this.logger = logger;
		this.transport = transport$1;
		this.importUpdatedModule = importUpdatedModule;
		_defineProperty(this, "hotModulesMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "disposeMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "pruneMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "dataMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "customListenersMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "ctxToListenersMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "currentFirstInvalidatedBy", void 0);
		_defineProperty(this, "updateQueue", []);
		_defineProperty(this, "pendingUpdateQueue", false);
	}
	async notifyListeners(event, data) {
		const cbs = this.customListenersMap.get(event);
		if (cbs) await Promise.allSettled(cbs.map((cb) => cb(data)));
	}
	send(payload) {
		this.transport.send(payload).catch((err) => {
			this.logger.error(err);
		});
	}
	clear() {
		this.hotModulesMap.clear();
		this.disposeMap.clear();
		this.pruneMap.clear();
		this.dataMap.clear();
		this.customListenersMap.clear();
		this.ctxToListenersMap.clear();
	}
	async prunePaths(paths) {
		await Promise.all(paths.map((path) => {
			const disposer = this.disposeMap.get(path);
			if (disposer) return disposer(this.dataMap.get(path));
		}));
		paths.forEach((path) => {
			const fn = this.pruneMap.get(path);
			if (fn) fn(this.dataMap.get(path));
		});
	}
	warnFailedUpdate(err, path) {
		if (!(err instanceof Error) || !err.message.includes("fetch")) this.logger.error(err);
		this.logger.error(`Failed to reload ${path}. This could be due to syntax errors or importing non-existent modules. (see errors above)`);
	}
	/**
	* buffer multiple hot updates triggered by the same src change
	* so that they are invoked in the same order they were sent.
	* (otherwise the order may be inconsistent because of the http request round trip)
	*/
	async queueUpdate(payload) {
		this.updateQueue.push(this.fetchUpdate(payload));
		if (!this.pendingUpdateQueue) {
			this.pendingUpdateQueue = true;
			await Promise.resolve();
			this.pendingUpdateQueue = false;
			const loading = [...this.updateQueue];
			this.updateQueue = [];
			(await Promise.all(loading)).forEach((fn) => fn && fn());
		}
	}
	async fetchUpdate(update) {
		const { path, acceptedPath, firstInvalidatedBy } = update;
		const mod = this.hotModulesMap.get(path);
		if (!mod) return;
		let fetchedModule;
		const isSelfUpdate = path === acceptedPath;
		const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => deps.includes(acceptedPath));
		if (isSelfUpdate || qualifiedCallbacks.length > 0) {
			const disposer = this.disposeMap.get(acceptedPath);
			if (disposer) await disposer(this.dataMap.get(acceptedPath));
			try {
				fetchedModule = await this.importUpdatedModule(update);
			} catch (e) {
				this.warnFailedUpdate(e, acceptedPath);
			}
		}
		return () => {
			try {
				this.currentFirstInvalidatedBy = firstInvalidatedBy;
				for (const { deps, fn } of qualifiedCallbacks) fn(deps.map((dep) => dep === acceptedPath ? fetchedModule : void 0));
				const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
				this.logger.debug(`hot updated: ${loggedPath}`);
			} finally {
				this.currentFirstInvalidatedBy = void 0;
			}
		};
	}
};

//#endregion
//#region ../../node_modules/.pnpm/nanoid@5.1.5/node_modules/nanoid/non-secure/index.js
let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let nanoid = (size = 21) => {
	let id = "";
	let i = size | 0;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
};

//#endregion
//#region src/shared/constants.ts
let SOURCEMAPPING_URL = "sourceMa";
SOURCEMAPPING_URL += "ppingURL";

//#endregion
//#region src/shared/utils.ts
const isWindows = typeof process !== "undefined" && process.platform === "win32";
const AsyncFunction = async function() {}.constructor;
function promiseWithResolvers() {
	let resolve;
	let reject;
	const promise = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	return {
		promise,
		resolve,
		reject
	};
}

//#endregion
//#region src/shared/moduleRunnerTransport.ts
function reviveInvokeError(e) {
	const error = new Error(e.message || "Unknown invoke error");
	Object.assign(error, e, { runnerError: /* @__PURE__ */ new Error("RunnerError") });
	return error;
}
const createInvokeableTransport = (transport$1) => {
	if (transport$1.invoke) return {
		...transport$1,
		async invoke(name, data) {
			const result = await transport$1.invoke({
				type: "custom",
				event: "vite:invoke",
				data: {
					id: "send",
					name,
					data
				}
			});
			if ("error" in result) throw reviveInvokeError(result.error);
			return result.result;
		}
	};
	if (!transport$1.send || !transport$1.connect) throw new Error("transport must implement send and connect when invoke is not implemented");
	const rpcPromises = /* @__PURE__ */ new Map();
	return {
		...transport$1,
		connect({ onMessage, onDisconnection }) {
			return transport$1.connect({
				onMessage(payload) {
					if (payload.type === "custom" && payload.event === "vite:invoke") {
						const data = payload.data;
						if (data.id.startsWith("response:")) {
							const invokeId = data.id.slice(9);
							const promise = rpcPromises.get(invokeId);
							if (!promise) return;
							if (promise.timeoutId) clearTimeout(promise.timeoutId);
							rpcPromises.delete(invokeId);
							const { error, result } = data.data;
							if (error) promise.reject(error);
							else promise.resolve(result);
							return;
						}
					}
					onMessage(payload);
				},
				onDisconnection
			});
		},
		disconnect() {
			rpcPromises.forEach((promise) => {
				promise.reject(/* @__PURE__ */ new Error(`transport was disconnected, cannot call ${JSON.stringify(promise.name)}`));
			});
			rpcPromises.clear();
			return transport$1.disconnect?.();
		},
		send(data) {
			return transport$1.send(data);
		},
		async invoke(name, data) {
			const promiseId = nanoid();
			const wrappedData = {
				type: "custom",
				event: "vite:invoke",
				data: {
					name,
					id: `send:${promiseId}`,
					data
				}
			};
			const sendPromise = transport$1.send(wrappedData);
			const { promise, resolve, reject } = promiseWithResolvers();
			const timeout = transport$1.timeout ?? 6e4;
			let timeoutId;
			if (timeout > 0) {
				timeoutId = setTimeout(() => {
					rpcPromises.delete(promiseId);
					reject(/* @__PURE__ */ new Error(`transport invoke timed out after ${timeout}ms (data: ${JSON.stringify(wrappedData)})`));
				}, timeout);
				timeoutId?.unref?.();
			}
			rpcPromises.set(promiseId, {
				resolve,
				reject,
				name,
				timeoutId
			});
			if (sendPromise) sendPromise.catch((err) => {
				clearTimeout(timeoutId);
				rpcPromises.delete(promiseId);
				reject(err);
			});
			try {
				return await promise;
			} catch (err) {
				throw reviveInvokeError(err);
			}
		}
	};
};
const normalizeModuleRunnerTransport = (transport$1) => {
	const invokeableTransport = createInvokeableTransport(transport$1);
	let isConnected = !invokeableTransport.connect;
	let connectingPromise;
	return {
		...transport$1,
		...invokeableTransport.connect ? { async connect(onMessage) {
			if (isConnected) return;
			if (connectingPromise) {
				await connectingPromise;
				return;
			}
			const maybePromise = invokeableTransport.connect({
				onMessage: onMessage ?? (() => {}),
				onDisconnection() {
					isConnected = false;
				}
			});
			if (maybePromise) {
				connectingPromise = maybePromise;
				await connectingPromise;
				connectingPromise = void 0;
			}
			isConnected = true;
		} } : {},
		...invokeableTransport.disconnect ? { async disconnect() {
			if (!isConnected) return;
			if (connectingPromise) await connectingPromise;
			isConnected = false;
			await invokeableTransport.disconnect();
		} } : {},
		async send(data) {
			if (!invokeableTransport.send) return;
			if (!isConnected) if (connectingPromise) await connectingPromise;
			else throw new Error("send was called before connect");
			await invokeableTransport.send(data);
		},
		async invoke(name, data) {
			if (!isConnected) if (connectingPromise) await connectingPromise;
			else throw new Error("invoke was called before connect");
			return invokeableTransport.invoke(name, data);
		}
	};
};
const createWebSocketModuleRunnerTransport = (options) => {
	const pingInterval = options.pingInterval ?? 3e4;
	let ws;
	let pingIntervalId;
	return {
		async connect({ onMessage, onDisconnection }) {
			const socket = options.createConnection();
			socket.addEventListener("message", async ({ data }) => {
				onMessage(JSON.parse(data));
			});
			let isOpened = socket.readyState === socket.OPEN;
			if (!isOpened) await new Promise((resolve, reject) => {
				socket.addEventListener("open", () => {
					isOpened = true;
					resolve();
				}, { once: true });
				socket.addEventListener("close", async () => {
					if (!isOpened) {
						reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));
						return;
					}
					onMessage({
						type: "custom",
						event: "vite:ws:disconnect",
						data: { webSocket: socket }
					});
					onDisconnection();
				});
			});
			onMessage({
				type: "custom",
				event: "vite:ws:connect",
				data: { webSocket: socket }
			});
			ws = socket;
			pingIntervalId = setInterval(() => {
				if (socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: "ping" }));
			}, pingInterval);
		},
		disconnect() {
			clearInterval(pingIntervalId);
			ws?.close();
		},
		send(data) {
			ws.send(JSON.stringify(data));
		}
	};
};

//#endregion
//#region src/shared/hmrHandler.ts
function createHMRHandler(handler) {
	const queue = new Queue();
	return (payload) => queue.enqueue(() => handler(payload));
}
var Queue = class {
	constructor() {
		_defineProperty(this, "queue", []);
		_defineProperty(this, "pending", false);
	}
	enqueue(promise) {
		return new Promise((resolve, reject) => {
			this.queue.push({
				promise,
				resolve,
				reject
			});
			this.dequeue();
		});
	}
	dequeue() {
		if (this.pending) return false;
		const item = this.queue.shift();
		if (!item) return false;
		this.pending = true;
		item.promise().then(item.resolve).catch(item.reject).finally(() => {
			this.pending = false;
			this.dequeue();
		});
		return true;
	}
};

//#endregion
//#region src/client/overlay.ts
const hmrConfigName = __HMR_CONFIG_NAME__;
const base$1 = __BASE__ || "/";
function h(e, attrs = {}, ...children) {
	const elem = document.createElement(e);
	for (const [k, v] of Object.entries(attrs)) elem.setAttribute(k, v);
	elem.append(...children);
	return elem;
}
const templateStyle = `
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  --monospace: 'SFMono-Regular', Consolas,
  'Liberation Mono', Menlo, Courier, monospace;
  --red: #ff5555;
  --yellow: #e2aa53;
  --purple: #cfa4ff;
  --cyan: #2dd9da;
  --dim: #c9c9c9;

  --window-background: #181818;
  --window-color: #d8d8d8;
}

.backdrop {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  margin: 0;
  background: rgba(0, 0, 0, 0.66);
}

.window {
  font-family: var(--monospace);
  line-height: 1.5;
  max-width: 80vw;
  color: var(--window-color);
  box-sizing: border-box;
  margin: 30px auto;
  padding: 2.5vh 4vw;
  position: relative;
  background: var(--window-background);
  border-radius: 6px 6px 8px 8px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  overflow: hidden;
  border-top: 8px solid var(--red);
  direction: ltr;
  text-align: left;
}

pre {
  font-family: var(--monospace);
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow-x: scroll;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

pre.frame::-webkit-scrollbar {
  display: block;
  height: 5px;
}

pre.frame::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 5px;
}

pre.frame {
  scrollbar-width: thin;
}

.message {
  line-height: 1.3;
  font-weight: 600;
  white-space: pre-wrap;
}

.message-body {
  color: var(--red);
}

.plugin {
  color: var(--purple);
}

.file {
  color: var(--cyan);
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.frame {
  color: var(--yellow);
}

.stack {
  font-size: 13px;
  color: var(--dim);
}

.tip {
  font-size: 13px;
  color: #999;
  border-top: 1px dotted #999;
  padding-top: 13px;
  line-height: 1.8;
}

code {
  font-size: 13px;
  font-family: var(--monospace);
  color: var(--yellow);
}

.file-link {
  text-decoration: underline;
  cursor: pointer;
}

kbd {
  line-height: 1.5;
  font-family: ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: rgb(38, 40, 44);
  color: rgb(166, 167, 171);
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  border-width: 0.0625rem 0.0625rem 0.1875rem;
  border-style: solid;
  border-color: rgb(54, 57, 64);
  border-image: initial;
}
`;
const createTemplate = () => h("div", {
	class: "backdrop",
	part: "backdrop"
}, h("div", {
	class: "window",
	part: "window"
}, h("pre", {
	class: "message",
	part: "message"
}, h("span", {
	class: "plugin",
	part: "plugin"
}), h("span", {
	class: "message-body",
	part: "message-body"
})), h("pre", {
	class: "file",
	part: "file"
}), h("pre", {
	class: "frame",
	part: "frame"
}), h("pre", {
	class: "stack",
	part: "stack"
}), h("div", {
	class: "tip",
	part: "tip"
}, "Click outside, press ", h("kbd", {}, "Esc"), " key, or fix the code to dismiss.", h("br"), "You can also disable this overlay by setting ", h("code", { part: "config-option-name" }, "server.hmr.overlay"), " to ", h("code", { part: "config-option-value" }, "false"), " in ", h("code", { part: "config-file-name" }, hmrConfigName), ".")), h("style", {}, templateStyle));
const fileRE = /(?:file:\/\/)?(?:[a-zA-Z]:\\|\/).*?:\d+:\d+/g;
const codeframeRE = /^(?:>?\s*\d+\s+\|.*|\s+\|\s*\^.*)\r?\n/gm;
const { HTMLElement = class {} } = globalThis;
var ErrorOverlay = class extends HTMLElement {
	constructor(err, links = true) {
		super();
		_defineProperty(this, "root", void 0);
		_defineProperty(this, "closeOnEsc", void 0);
		this.root = this.attachShadow({ mode: "open" });
		this.root.appendChild(createTemplate());
		codeframeRE.lastIndex = 0;
		const hasFrame = err.frame && codeframeRE.test(err.frame);
		const message = hasFrame ? err.message.replace(codeframeRE, "") : err.message;
		if (err.plugin) this.text(".plugin", `[plugin:${err.plugin}] `);
		this.text(".message-body", message.trim());
		const [file] = (err.loc?.file || err.id || "unknown file").split(`?`);
		if (err.loc) this.text(".file", `${file}:${err.loc.line}:${err.loc.column}`, links);
		else if (err.id) this.text(".file", file);
		if (hasFrame) this.text(".frame", err.frame.trim());
		this.text(".stack", err.stack, links);
		this.root.querySelector(".window").addEventListener("click", (e) => {
			e.stopPropagation();
		});
		this.addEventListener("click", () => {
			this.close();
		});
		this.closeOnEsc = (e) => {
			if (e.key === "Escape" || e.code === "Escape") this.close();
		};
		document.addEventListener("keydown", this.closeOnEsc);
	}
	text(selector, text, linkFiles = false) {
		const el = this.root.querySelector(selector);
		if (!linkFiles) el.textContent = text;
		else {
			let curIndex = 0;
			let match;
			fileRE.lastIndex = 0;
			while (match = fileRE.exec(text)) {
				const { 0: file, index } = match;
				const frag = text.slice(curIndex, index);
				el.appendChild(document.createTextNode(frag));
				const link = document.createElement("a");
				link.textContent = file;
				link.className = "file-link";
				link.onclick = () => {
					fetch(new URL(`${base$1}__open-in-editor?file=${encodeURIComponent(file)}`, import.meta.url));
				};
				el.appendChild(link);
				curIndex += frag.length + file.length;
			}
			if (curIndex < text.length) el.appendChild(document.createTextNode(text.slice(curIndex)));
		}
	}
	close() {
		this.parentNode?.removeChild(this);
		document.removeEventListener("keydown", this.closeOnEsc);
	}
};
const overlayId = "vite-error-overlay";
const { customElements } = globalThis;
if (customElements && !customElements.get(overlayId)) customElements.define(overlayId, ErrorOverlay);

//#endregion
//#region src/client/client.ts
console.debug("[vite] connecting...");
const importMetaUrl = new URL(import.meta.url);
const serverHost = __SERVER_HOST__;
const socketProtocol = __HMR_PROTOCOL__ || (importMetaUrl.protocol === "https:" ? "wss" : "ws");
const hmrPort = __HMR_PORT__;
const socketHost = `${__HMR_HOSTNAME__ || importMetaUrl.hostname}:${hmrPort || importMetaUrl.port}${__HMR_BASE__}`;
const directSocketHost = __HMR_DIRECT_TARGET__;
const base = __BASE__ || "/";
const hmrTimeout = __HMR_TIMEOUT__;
const wsToken = __WS_TOKEN__;
const transport = normalizeModuleRunnerTransport((() => {
	let wsTransport = createWebSocketModuleRunnerTransport({
		createConnection: () => new WebSocket(`${socketProtocol}://${socketHost}?token=${wsToken}`, "vite-hmr"),
		pingInterval: hmrTimeout
	});
	return {
		async connect(handlers) {
			try {
				await wsTransport.connect(handlers);
			} catch (e) {
				if (!hmrPort) {
					wsTransport = createWebSocketModuleRunnerTransport({
						createConnection: () => new WebSocket(`${socketProtocol}://${directSocketHost}?token=${wsToken}`, "vite-hmr"),
						pingInterval: hmrTimeout
					});
					try {
						await wsTransport.connect(handlers);
						console.info("[vite] Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.");
					} catch (e$1) {
						if (e$1 instanceof Error && e$1.message.includes("WebSocket closed without opened.")) {
							const currentScriptHostURL = new URL(import.meta.url);
							const currentScriptHost = currentScriptHostURL.host + currentScriptHostURL.pathname.replace(/@vite\/client$/, "");
							console.error(`[vite] failed to connect to websocket.
your current setup:
  (browser) ${currentScriptHost} <--[HTTP]--> ${serverHost} (server)\n  (browser) ${socketHost} <--[WebSocket (failing)]--> ${directSocketHost} (server)\nCheck out your Vite / network configuration and https://vite.dev/config/server-options.html#server-hmr .`);
						}
					}
					return;
				}
				console.error(`[vite] failed to connect to websocket (${e}). `);
				throw e;
			}
		},
		async disconnect() {
			await wsTransport.disconnect();
		},
		send(data) {
			wsTransport.send(data);
		}
	};
})());
let willUnload = false;
if (typeof window !== "undefined") window.addEventListener?.("beforeunload", () => {
	willUnload = true;
});
function cleanUrl(pathname) {
	const url = new URL(pathname, "http://vite.dev");
	url.searchParams.delete("direct");
	return url.pathname + url.search;
}
let isFirstUpdate = true;
const outdatedLinkTags = /* @__PURE__ */ new WeakSet();
const debounceReload = (time) => {
	let timer;
	return () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(() => {
			location.reload();
		}, time);
	};
};
const pageReload = debounceReload(20);
const hmrClient = new HMRClient({
	error: (err) => console.error("[vite]", err),
	debug: (...msg) => console.debug("[vite]", ...msg)
}, transport, async function importUpdatedModule({ acceptedPath, timestamp, explicitImportRequired, isWithinCircularImport }) {
	const [acceptedPathWithoutQuery, query] = acceptedPath.split(`?`);
	const importPromise = import(
		/* @vite-ignore */
		base + acceptedPathWithoutQuery.slice(1) + `?${explicitImportRequired ? "import&" : ""}t=${timestamp}${query ? `&${query}` : ""}`
);
	if (isWithinCircularImport) importPromise.catch(() => {
		console.info(`[hmr] ${acceptedPath} failed to apply HMR as it's within a circular import. Reloading page to reset the execution order. To debug and break the circular import, you can run \`vite --debug hmr\` to log the circular dependency path if a file change triggered it.`);
		pageReload();
	});
	return await importPromise;
});
transport.connect(createHMRHandler(handleMessage));
async function handleMessage(payload) {
	switch (payload.type) {
		case "connected":
			console.debug(`[vite] connected.`);
			break;
		case "update":
			await hmrClient.notifyListeners("vite:beforeUpdate", payload);
			if (hasDocument) if (isFirstUpdate && hasErrorOverlay()) {
				location.reload();
				return;
			} else {
				if (enableOverlay) clearErrorOverlay();
				isFirstUpdate = false;
			}
			await Promise.all(payload.updates.map(async (update) => {
				if (update.type === "js-update") return hmrClient.queueUpdate(update);
				const { path, timestamp } = update;
				const searchUrl = cleanUrl(path);
				const el = Array.from(document.querySelectorAll("link")).find((e) => !outdatedLinkTags.has(e) && cleanUrl(e.href).includes(searchUrl));
				if (!el) return;
				const newPath = `${base}${searchUrl.slice(1)}${searchUrl.includes("?") ? "&" : "?"}t=${timestamp}`;
				return new Promise((resolve) => {
					const newLinkTag = el.cloneNode();
					newLinkTag.href = new URL(newPath, el.href).href;
					const removeOldEl = () => {
						el.remove();
						console.debug(`[vite] css hot updated: ${searchUrl}`);
						resolve();
					};
					newLinkTag.addEventListener("load", removeOldEl);
					newLinkTag.addEventListener("error", removeOldEl);
					outdatedLinkTags.add(el);
					el.after(newLinkTag);
				});
			}));
			await hmrClient.notifyListeners("vite:afterUpdate", payload);
			break;
		case "custom":
			await hmrClient.notifyListeners(payload.event, payload.data);
			if (payload.event === "vite:ws:disconnect") {
				if (hasDocument && !willUnload) {
					console.log(`[vite] server connection lost. Polling for restart...`);
					const socket = payload.data.webSocket;
					const url = new URL(socket.url);
					url.search = "";
					await waitForSuccessfulPing(url.href);
					location.reload();
				}
			}
			break;
		case "full-reload":
			await hmrClient.notifyListeners("vite:beforeFullReload", payload);
			if (hasDocument) if (payload.path && payload.path.endsWith(".html")) {
				const pagePath = decodeURI(location.pathname);
				const payloadPath = base + payload.path.slice(1);
				if (pagePath === payloadPath || payload.path === "/index.html" || pagePath.endsWith("/") && pagePath + "index.html" === payloadPath) pageReload();
				return;
			} else pageReload();
			break;
		case "prune":
			await hmrClient.notifyListeners("vite:beforePrune", payload);
			await hmrClient.prunePaths(payload.paths);
			break;
		case "error":
			await hmrClient.notifyListeners("vite:error", payload);
			if (hasDocument) {
				const err = payload.err;
				if (enableOverlay) createErrorOverlay(err);
				else console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
			}
			break;
		case "ping": break;
		default: {
			const check = payload;
			return check;
		}
	}
}
const enableOverlay = __HMR_ENABLE_OVERLAY__;
const hasDocument = "document" in globalThis;
function createErrorOverlay(err) {
	clearErrorOverlay();
	const { customElements: customElements$1 } = globalThis;
	if (customElements$1) {
		const ErrorOverlayConstructor = customElements$1.get(overlayId);
		document.body.appendChild(new ErrorOverlayConstructor(err));
	}
}
function clearErrorOverlay() {
	document.querySelectorAll(overlayId).forEach((n) => n.close());
}
function hasErrorOverlay() {
	return document.querySelectorAll(overlayId).length;
}
function waitForSuccessfulPing(socketUrl) {
	if (typeof SharedWorker === "undefined") {
		const visibilityManager = {
			currentState: document.visibilityState,
			listeners: /* @__PURE__ */ new Set()
		};
		const onVisibilityChange = () => {
			visibilityManager.currentState = document.visibilityState;
			for (const listener of visibilityManager.listeners) listener(visibilityManager.currentState);
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return waitForSuccessfulPingInternal(socketUrl, visibilityManager);
	}
	const blob = new Blob([
		"\"use strict\";",
		`const waitForSuccessfulPingInternal = ${waitForSuccessfulPingInternal.toString()};`,
		`const fn = ${pingWorkerContentMain.toString()};`,
		`fn(${JSON.stringify(socketUrl)})`
	], { type: "application/javascript" });
	const objURL = URL.createObjectURL(blob);
	const sharedWorker = new SharedWorker(objURL);
	return new Promise((resolve, reject) => {
		const onVisibilityChange = () => {
			sharedWorker.port.postMessage({ visibility: document.visibilityState });
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		sharedWorker.port.addEventListener("message", (event) => {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			sharedWorker.port.close();
			const data = event.data;
			if (data.type === "error") {
				reject(data.error);
				return;
			}
			resolve();
		});
		onVisibilityChange();
		sharedWorker.port.start();
	});
}
function pingWorkerContentMain(socketUrl) {
	self.addEventListener("connect", (_event) => {
		const event = _event;
		const port = event.ports[0];
		if (!socketUrl) {
			port.postMessage({
				type: "error",
				error: /* @__PURE__ */ new Error("socketUrl not found")
			});
			return;
		}
		const visibilityManager = {
			currentState: "visible",
			listeners: /* @__PURE__ */ new Set()
		};
		port.addEventListener("message", (event$1) => {
			const { visibility } = event$1.data;
			visibilityManager.currentState = visibility;
			console.debug("[vite] new window visibility", visibility);
			for (const listener of visibilityManager.listeners) listener(visibility);
		});
		port.start();
		console.debug("[vite] connected from window");
		waitForSuccessfulPingInternal(socketUrl, visibilityManager).then(() => {
			console.debug("[vite] ping successful");
			try {
				port.postMessage({ type: "success" });
			} catch (error) {
				port.postMessage({
					type: "error",
					error
				});
			}
		}, (error) => {
			console.debug("[vite] error happened", error);
			try {
				port.postMessage({
					type: "error",
					error
				});
			} catch (error$1) {
				port.postMessage({
					type: "error",
					error: error$1
				});
			}
		});
	});
}
async function waitForSuccessfulPingInternal(socketUrl, visibilityManager, ms = 1e3) {
	function wait(ms$1) {
		return new Promise((resolve) => setTimeout(resolve, ms$1));
	}
	async function ping() {
		try {
			const socket = new WebSocket(socketUrl, "vite-ping");
			return new Promise((resolve) => {
				function onOpen() {
					resolve(true);
					close();
				}
				function onError() {
					resolve(false);
					close();
				}
				function close() {
					socket.removeEventListener("open", onOpen);
					socket.removeEventListener("error", onError);
					socket.close();
				}
				socket.addEventListener("open", onOpen);
				socket.addEventListener("error", onError);
			});
		} catch {
			return false;
		}
	}
	function waitForWindowShow(visibilityManager$1) {
		return new Promise((resolve) => {
			const onChange = (newVisibility) => {
				if (newVisibility === "visible") {
					resolve();
					visibilityManager$1.listeners.delete(onChange);
				}
			};
			visibilityManager$1.listeners.add(onChange);
		});
	}
	if (await ping()) return;
	await wait(ms);
	while (true) if (visibilityManager.currentState === "visible") {
		if (await ping()) break;
		await wait(ms);
	} else await waitForWindowShow(visibilityManager);
}
const sheetsMap = /* @__PURE__ */ new Map();
if ("document" in globalThis) document.querySelectorAll("style[data-vite-dev-id]").forEach((el) => {
	sheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
});
const cspNonce = "document" in globalThis ? document.querySelector("meta[property=csp-nonce]")?.nonce : void 0;
let lastInsertedStyle;
function updateStyle(id, content) {
	let style = sheetsMap.get(id);
	if (!style) {
		style = document.createElement("style");
		style.setAttribute("type", "text/css");
		style.setAttribute("data-vite-dev-id", id);
		style.textContent = content;
		if (cspNonce) style.setAttribute("nonce", cspNonce);
		if (!lastInsertedStyle) {
			document.head.appendChild(style);
			setTimeout(() => {
				lastInsertedStyle = void 0;
			}, 0);
		} else lastInsertedStyle.insertAdjacentElement("afterend", style);
		lastInsertedStyle = style;
	} else style.textContent = content;
	sheetsMap.set(id, style);
}
function removeStyle(id) {
	const style = sheetsMap.get(id);
	if (style) {
		document.head.removeChild(style);
		sheetsMap.delete(id);
	}
}
function createHotContext(ownerPath) {
	return new HMRContext(hmrClient, ownerPath);
}
/**
* urls here are dynamic import() urls that couldn't be statically analyzed
*/
function injectQuery(url, queryToInject) {
	if (url[0] !== "." && url[0] !== "/") return url;
	const pathname = url.replace(/[?#].*$/, "");
	const { search, hash } = new URL(url, "http://vite.dev");
	return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ""}${hash || ""}`;
}

//#endregion
export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };

import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import vm from 'node:vm';
import createDebug from 'debug';
import { extractSourceMap } from './source-map.mjs';
import { createImportMetaEnvProxy, slash, isInternalRequest, isNodeBuiltin, normalizeRequestId, toFilePath, normalizeModuleId, cleanUrl, isPrimitive, isBareImport } from './utils.mjs';
import 'pathe';
import 'node:fs';

const { setTimeout, clearTimeout } = globalThis;
const debugExecute = createDebug("vite-node:client:execute");
const debugNative = createDebug("vite-node:client:native");
const clientStub = {
	injectQuery: (id) => id,
	createHotContext: () => {
		return {
			accept: () => {},
			prune: () => {},
			dispose: () => {},
			decline: () => {},
			invalidate: () => {},
			on: () => {},
			send: () => {}
		};
	},
	updateStyle: () => {},
	removeStyle: () => {}
};
const env = createImportMetaEnvProxy();
const DEFAULT_REQUEST_STUBS = {
	"/@vite/client": clientStub,
	"@vite/client": clientStub
};
class ModuleCacheMap extends Map {
	normalizePath(fsPath) {
		return normalizeModuleId(fsPath);
	}
	/**
	* Assign partial data to the map
	*/
	update(fsPath, mod) {
		fsPath = this.normalizePath(fsPath);
		if (!super.has(fsPath)) this.setByModuleId(fsPath, mod);
		else Object.assign(super.get(fsPath), mod);
		return this;
	}
	setByModuleId(modulePath, mod) {
		return super.set(modulePath, mod);
	}
	set(fsPath, mod) {
		return this.setByModuleId(this.normalizePath(fsPath), mod);
	}
	getByModuleId(modulePath) {
		if (!super.has(modulePath)) this.setByModuleId(modulePath, {});
		const mod = super.get(modulePath);
		if (!mod.imports) Object.assign(mod, {
			imports: /* @__PURE__ */ new Set(),
			importers: /* @__PURE__ */ new Set()
		});
		return mod;
	}
	get(fsPath) {
		return this.getByModuleId(this.normalizePath(fsPath));
	}
	deleteByModuleId(modulePath) {
		return super.delete(modulePath);
	}
	delete(fsPath) {
		return this.deleteByModuleId(this.normalizePath(fsPath));
	}
	invalidateModule(mod) {
		var _mod$importers, _mod$imports;
		delete mod.evaluated;
		delete mod.resolving;
		delete mod.promise;
		delete mod.exports;
		(_mod$importers = mod.importers) === null || _mod$importers === void 0 || _mod$importers.clear();
		(_mod$imports = mod.imports) === null || _mod$imports === void 0 || _mod$imports.clear();
		return true;
	}
	/**
	* Invalidate modules that dependent on the given modules, up to the main entry
	*/
	invalidateDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
		for (const _id of ids) {
			const id = this.normalizePath(_id);
			if (invalidated.has(id)) continue;
			invalidated.add(id);
			const mod = super.get(id);
			if (mod === null || mod === void 0 ? void 0 : mod.importers) this.invalidateDepTree(mod.importers, invalidated);
			super.delete(id);
		}
		return invalidated;
	}
	/**
	* Invalidate dependency modules of the given modules, down to the bottom-level dependencies
	*/
	invalidateSubDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
		for (const _id of ids) {
			const id = this.normalizePath(_id);
			if (invalidated.has(id)) continue;
			invalidated.add(id);
			const subIds = Array.from(super.entries()).filter(([, mod]) => {
				var _mod$importers2;
				return (_mod$importers2 = mod.importers) === null || _mod$importers2 === void 0 ? void 0 : _mod$importers2.has(id);
			}).map(([key]) => key);
			if (subIds.length) this.invalidateSubDepTree(subIds, invalidated);
			super.delete(id);
		}
		return invalidated;
	}
	/**
	* Return parsed source map based on inlined source map of the module
	*/
	getSourceMap(id) {
		const cache = this.get(id);
		if (cache.map) return cache.map;
		const map = cache.code && extractSourceMap(cache.code);
		if (map) {
			cache.map = map;
			return map;
		}
		return null;
	}
}
class ViteNodeRunner {
	root;
	debug;
	/**
	* Holds the cache of modules
	* Keys of the map are filepaths, or plain package names
	*/
	moduleCache;
	/**
	* Tracks the stack of modules being executed for the purpose of calculating import self-time.
	*
	* Note that while in most cases, imports are a linear stack of modules,
	* this is occasionally not the case, for example when you have parallel top-level dynamic imports like so:
	*
	* ```ts
	* await Promise.all([
	*  import('./module1'),
	*  import('./module2'),
	* ]);
	* ```
	*
	* In this case, the self time will be reported incorrectly for one of the modules (could go negative).
	* As top-level awaits with dynamic imports like this are uncommon, we don't handle this case specifically.
	*/
	executionStack = [];
	// `performance` can be mocked, so make sure we're using the original function
	performanceNow = performance.now.bind(performance);
	constructor(options) {
		this.options = options;
		this.root = options.root ?? process.cwd();
		this.moduleCache = options.moduleCache ?? new ModuleCacheMap();
		this.debug = options.debug ?? (typeof process !== "undefined" ? !!process.env.VITE_NODE_DEBUG_RUNNER : false);
	}
	async executeFile(file) {
		const url = `/@fs/${slash(resolve(file))}`;
		return await this.cachedRequest(url, url, []);
	}
	async executeId(rawId) {
		const [id, url] = await this.resolveUrl(rawId);
		return await this.cachedRequest(id, url, []);
	}
	/** @internal */
	async cachedRequest(id, fsPath, callstack) {
		const importee = callstack[callstack.length - 1];
		const mod = this.moduleCache.get(fsPath);
		const { imports, importers } = mod;
		if (importee) importers.add(importee);
		const getStack = () => `stack:\n${[...callstack, fsPath].reverse().map((p) => `  - ${p}`).join("\n")}`;
		// check circular dependency
		if (callstack.includes(fsPath) || Array.from(imports.values()).some((i) => importers.has(i))) {
			if (mod.exports) return mod.exports;
		}
		let debugTimer;
		if (this.debug) debugTimer = setTimeout(() => console.warn(`[vite-node] module ${fsPath} takes over 2s to load.\n${getStack()}`), 2e3);
		try {
			// cached module
			if (mod.promise) return await mod.promise;
			const promise = this.directRequest(id, fsPath, callstack);
			Object.assign(mod, {
				promise,
				evaluated: false
			});
			return await promise;
		} finally {
			mod.evaluated = true;
			if (debugTimer) clearTimeout(debugTimer);
		}
	}
	shouldResolveId(id, _importee) {
		return !isInternalRequest(id) && !isNodeBuiltin(id) && !id.startsWith("data:");
	}
	async _resolveUrl(id, importer) {
		var _resolved$meta;
		const dep = normalizeRequestId(id, this.options.base);
		if (!this.shouldResolveId(dep)) return [dep, dep];
		const { path, exists } = toFilePath(dep, this.root);
		if (!this.options.resolveId || exists) return [dep, path];
		const resolved = await this.options.resolveId(dep, importer);
		// supported since Vite 5-beta.19
		if (resolved === null || resolved === void 0 || (_resolved$meta = resolved.meta) === null || _resolved$meta === void 0 || (_resolved$meta = _resolved$meta["vite:alias"]) === null || _resolved$meta === void 0 ? void 0 : _resolved$meta.noResolved) {
			const error = new Error(`Cannot find module '${id}'${importer ? ` imported from '${importer}'` : ""}.

- If you rely on tsconfig.json's "paths" to resolve modules, please install "vite-tsconfig-paths" plugin to handle module resolution.
- Make sure you don't have relative aliases in your Vitest config. Use absolute paths instead. Read more: https://vitest.dev/guide/common-errors`);
			Object.defineProperty(error, "code", {
				value: "ERR_MODULE_NOT_FOUND",
				enumerable: true
			});
			Object.defineProperty(error, Symbol.for("vitest.error.not_found.data"), {
				value: {
					id: dep,
					importer
				},
				enumerable: false
			});
			throw error;
		}
		const resolvedId = resolved ? normalizeRequestId(resolved.id, this.options.base) : dep;
		return [resolvedId, resolvedId];
	}
	async resolveUrl(id, importee) {
		const resolveKey = `resolve:${id}`;
		// put info about new import as soon as possible, so we can start tracking it
		this.moduleCache.setByModuleId(resolveKey, { resolving: true });
		try {
			return await this._resolveUrl(id, importee);
		} finally {
			this.moduleCache.deleteByModuleId(resolveKey);
		}
	}
	/** @internal */
	async dependencyRequest(id, fsPath, callstack) {
		return await this.cachedRequest(id, fsPath, callstack);
	}
	async _fetchModule(id, importer) {
		try {
			return await this.options.fetchModule(id);
		} catch (cause) {
			// rethrow vite error if it cannot load the module because it's not resolved
			if (typeof cause === "object" && cause.code === "ERR_LOAD_URL" || typeof (cause === null || cause === void 0 ? void 0 : cause.message) === "string" && cause.message.includes("Failed to load url")) {
				const error = new Error(`Cannot find ${isBareImport(id) ? "package" : "module"} '${id}'${importer ? ` imported from '${importer}'` : ""}`, { cause });
				error.code = "ERR_MODULE_NOT_FOUND";
				throw error;
			}
			throw cause;
		}
	}
	/** @internal */
	async directRequest(id, fsPath, _callstack) {
		const moduleId = normalizeModuleId(fsPath);
		const callstack = [..._callstack, moduleId];
		const mod = this.moduleCache.getByModuleId(moduleId);
		const request = async (dep) => {
			const [id, depFsPath] = await this.resolveUrl(String(dep), fsPath);
			const depMod = this.moduleCache.getByModuleId(depFsPath);
			depMod.importers.add(moduleId);
			mod.imports.add(depFsPath);
			return this.dependencyRequest(id, depFsPath, callstack);
		};
		const requestStubs = this.options.requestStubs || DEFAULT_REQUEST_STUBS;
		if (id in requestStubs) return requestStubs[id];
		let { code: transformed, externalize } = await this._fetchModule(id, callstack[callstack.length - 2]);
		if (externalize) {
			debugNative(externalize);
			const exports = await this.interopedImport(externalize);
			mod.exports = exports;
			return exports;
		}
		if (transformed == null) throw new Error(`[vite-node] Failed to load "${id}" imported from ${callstack[callstack.length - 2]}`);
		const { Object, Reflect, Symbol } = this.getContextPrimitives();
		const modulePath = cleanUrl(moduleId);
		// disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
		const href = pathToFileURL(modulePath).href;
		const __filename = fileURLToPath(href);
		const __dirname = dirname(__filename);
		const meta = {
			url: href,
			env,
			filename: __filename,
			dirname: __dirname
		};
		const exports = Object.create(null);
		Object.defineProperty(exports, Symbol.toStringTag, {
			value: "Module",
			enumerable: false,
			configurable: false
		});
		const SYMBOL_NOT_DEFINED = Symbol("not defined");
		let moduleExports = SYMBOL_NOT_DEFINED;
		// this proxy is triggered only on exports.{name} and module.exports access
		// inside the module itself. imported module is always "exports"
		const cjsExports = new Proxy(exports, {
			get: (target, p, receiver) => {
				if (Reflect.has(target, p)) return Reflect.get(target, p, receiver);
				return Reflect.get(Object.prototype, p, receiver);
			},
			getPrototypeOf: () => Object.prototype,
			set: (_, p, value) => {
				// treat "module.exports =" the same as "exports.default =" to not have nested "default.default",
				// so "exports.default" becomes the actual module
				if (p === "default" && this.shouldInterop(modulePath, { default: value }) && cjsExports !== value) {
					exportAll(cjsExports, value);
					exports.default = value;
					return true;
				}
				if (!Reflect.has(exports, "default")) exports.default = {};
				// returns undefined, when accessing named exports, if default is not an object
				// but is still present inside hasOwnKeys, this is Node behaviour for CJS
				if (moduleExports !== SYMBOL_NOT_DEFINED && isPrimitive(moduleExports)) {
					defineExport(exports, p, () => void 0);
					return true;
				}
				if (!isPrimitive(exports.default)) exports.default[p] = value;
				if (p !== "default") defineExport(exports, p, () => value);
				return true;
			}
		});
		Object.assign(mod, {
			code: transformed,
			exports
		});
		const moduleProxy = {
			set exports(value) {
				exportAll(cjsExports, value);
				exports.default = value;
				moduleExports = value;
			},
			get exports() {
				return cjsExports;
			}
		};
		// Vite hot context
		let hotContext;
		if (this.options.createHotContext) Object.defineProperty(meta, "hot", {
			enumerable: true,
			get: () => {
				var _this$options$createH, _this$options;
				hotContext || (hotContext = (_this$options$createH = (_this$options = this.options).createHotContext) === null || _this$options$createH === void 0 ? void 0 : _this$options$createH.call(_this$options, this, moduleId));
				return hotContext;
			},
			set: (value) => {
				hotContext = value;
			}
		});
		// Be careful when changing this
		// changing context will change amount of code added on line :114 (vm.runInThisContext)
		// this messes up sourcemaps for coverage
		// adjust `WRAPPER_LENGTH` variable in packages/coverage-v8/src/provider.ts if you do change this
		const context = this.prepareContext({
			__vite_ssr_import__: request,
			__vite_ssr_dynamic_import__: request,
			__vite_ssr_exports__: exports,
			__vite_ssr_exportAll__: (obj) => exportAll(exports, obj),
			__vite_ssr_exportName__: (name, getter) => Object.defineProperty(exports, name, {
				enumerable: true,
				configurable: true,
				get: getter
			}),
			__vite_ssr_import_meta__: meta,
			require: createRequire(href),
			exports: cjsExports,
			module: moduleProxy,
			__filename,
			__dirname
		});
		debugExecute(__filename);
		// remove shebang
		if (transformed[0] === "#") transformed = transformed.replace(/^#!.*/, (s) => " ".repeat(s.length));
		await this.runModule(context, transformed);
		return exports;
	}
	getContextPrimitives() {
		return {
			Object,
			Reflect,
			Symbol
		};
	}
	async runModule(context, transformed) {
		// add 'use strict' since ESM enables it by default
		const codeDefinition = `'use strict';async (${Object.keys(context).join(",")})=>{{`;
		const code = `${codeDefinition}${transformed}\n}}`;
		const options = {
			filename: context.__filename,
			lineOffset: 0,
			columnOffset: -codeDefinition.length
		};
		const finishModuleExecutionInfo = this.startCalculateModuleExecutionInfo(options.filename, codeDefinition.length);
		try {
			const fn = vm.runInThisContext(code, options);
			await fn(...Object.values(context));
		} finally {
			var _this$options$moduleE;
			(_this$options$moduleE = this.options.moduleExecutionInfo) === null || _this$options$moduleE === void 0 || _this$options$moduleE.set(options.filename, finishModuleExecutionInfo());
		}
	}
	/**
	* Starts calculating the module execution info such as the total duration and self time spent on executing the module.
	* Returns a function to call once the module has finished executing.
	*/
	startCalculateModuleExecutionInfo(filename, startOffset) {
		const startTime = this.performanceNow();
		this.executionStack.push({
			filename,
			startTime,
			subImportTime: 0
		});
		return () => {
			const duration = this.performanceNow() - startTime;
			const currentExecution = this.executionStack.pop();
			if (currentExecution == null) throw new Error("Execution stack is empty, this should never happen");
			const selfTime = duration - currentExecution.subImportTime;
			if (this.executionStack.length > 0) this.executionStack.at(-1).subImportTime += duration;
			return {
				startOffset,
				duration,
				selfTime
			};
		};
	}
	prepareContext(context) {
		return context;
	}
	/**
	* Define if a module should be interop-ed
	* This function mostly for the ability to override by subclass
	*/
	shouldInterop(path, mod) {
		if (this.options.interopDefault === false) return false;
		// never interop ESM modules
		// TODO: should also skip for `.js` with `type="module"`
		return !path.endsWith(".mjs") && "default" in mod;
	}
	importExternalModule(path) {
		return import(
			/* @vite-ignore */
			path
);
	}
	/**
	* Import a module and interop it
	*/
	async interopedImport(path) {
		const importedModule = await this.importExternalModule(path);
		if (!this.shouldInterop(path, importedModule)) return importedModule;
		const { mod, defaultExport } = interopModule(importedModule);
		return new Proxy(mod, {
			get(mod, prop) {
				if (prop === "default") return defaultExport;
				return mod[prop] ?? (defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport[prop]);
			},
			has(mod, prop) {
				if (prop === "default") return defaultExport !== void 0;
				return prop in mod || defaultExport && prop in defaultExport;
			},
			getOwnPropertyDescriptor(mod, prop) {
				const descriptor = Reflect.getOwnPropertyDescriptor(mod, prop);
				if (descriptor) return descriptor;
				if (prop === "default" && defaultExport !== void 0) return {
					value: defaultExport,
					enumerable: true,
					configurable: true
				};
			}
		});
	}
}
function interopModule(mod) {
	if (isPrimitive(mod)) return {
		mod: { default: mod },
		defaultExport: mod
	};
	let defaultExport = "default" in mod ? mod.default : mod;
	if (!isPrimitive(defaultExport) && "__esModule" in defaultExport) {
		mod = defaultExport;
		if ("default" in defaultExport) defaultExport = defaultExport.default;
	}
	return {
		mod,
		defaultExport
	};
}
// keep consistency with Vite on how exports are defined
function defineExport(exports, key, value) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		configurable: true,
		get: value
	});
}
function exportAll(exports, sourceModule) {
	// #1120 when a module exports itself it causes
	// call stack error
	if (exports === sourceModule) return;
	if (isPrimitive(sourceModule) || Array.isArray(sourceModule) || sourceModule instanceof Promise) return;
	for (const key in sourceModule) if (key !== "default" && !(key in exports)) try {
		defineExport(exports, key, () => sourceModule[key]);
	} catch {}
}

export { DEFAULT_REQUEST_STUBS, ModuleCacheMap, ViteNodeRunner };


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
var _OpenAI_instances, _a, _OpenAI_encoder, _OpenAI_baseURLOverridden;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "./internal/tslib.mjs";
import { uuid4 } from "./internal/utils/uuid.mjs";
import { validatePositiveInteger, isAbsoluteURL, safeJSON } from "./internal/utils/values.mjs";
import { sleep } from "./internal/utils/sleep.mjs";
import { castToError, isAbortError } from "./internal/errors.mjs";
import { getPlatformHeaders } from "./internal/detect-platform.mjs";
import * as Shims from "./internal/shims.mjs";
import * as Opts from "./internal/request-options.mjs";
import * as qs from "./internal/qs/index.mjs";
import { VERSION } from "./version.mjs";
import * as Errors from "./core/error.mjs";
import * as Pagination from "./core/pagination.mjs";
import * as Uploads from "./core/uploads.mjs";
import * as API from "./resources/index.mjs";
import { APIPromise } from "./core/api-promise.mjs";
import { Batches, } from "./resources/batches.mjs";
import { Completions, } from "./resources/completions.mjs";
import { Embeddings, } from "./resources/embeddings.mjs";
import { Files, } from "./resources/files.mjs";
import { Images, } from "./resources/images.mjs";
import { Models } from "./resources/models.mjs";
import { Moderations, } from "./resources/moderations.mjs";
import { Webhooks } from "./resources/webhooks.mjs";
import { Audio } from "./resources/audio/audio.mjs";
import { Beta } from "./resources/beta/beta.mjs";
import { Chat } from "./resources/chat/chat.mjs";
import { Containers, } from "./resources/containers/containers.mjs";
import { Conversations } from "./resources/conversations/conversations.mjs";
import { Evals, } from "./resources/evals/evals.mjs";
import { FineTuning } from "./resources/fine-tuning/fine-tuning.mjs";
import { Graders } from "./resources/graders/graders.mjs";
import { Responses } from "./resources/responses/responses.mjs";
import { Uploads as UploadsAPIUploads, } from "./resources/uploads/uploads.mjs";
import { VectorStores, } from "./resources/vector-stores/vector-stores.mjs";
import { isRunningInBrowser } from "./internal/detect-platform.mjs";
import { buildHeaders } from "./internal/headers.mjs";
import { readEnv } from "./internal/utils/env.mjs";
import { formatRequestDetails, loggerFor, parseLogLevel, } from "./internal/utils/log.mjs";
import { isEmptyObj } from "./internal/utils/values.mjs";
/**
 * API Client for interfacing with the OpenAI API.
 */
export class OpenAI {
    /**
     * API Client for interfacing with the OpenAI API.
     *
     * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
     * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
     * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
     * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
     * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
     * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ baseURL = readEnv('OPENAI_BASE_URL'), apiKey = readEnv('OPENAI_API_KEY'), organization = readEnv('OPENAI_ORG_ID') ?? null, project = readEnv('OPENAI_PROJECT_ID') ?? null, webhookSecret = readEnv('OPENAI_WEBHOOK_SECRET') ?? null, ...opts } = {}) {
        _OpenAI_instances.add(this);
        _OpenAI_encoder.set(this, void 0);
        this.completions = new API.Completions(this);
        this.chat = new API.Chat(this);
        this.embeddings = new API.Embeddings(this);
        this.files = new API.Files(this);
        this.images = new API.Images(this);
        this.audio = new API.Audio(this);
        this.moderations = new API.Moderations(this);
        this.models = new API.Models(this);
        this.fineTuning = new API.FineTuning(this);
        this.graders = new API.Graders(this);
        this.vectorStores = new API.VectorStores(this);
        this.webhooks = new API.Webhooks(this);
        this.beta = new API.Beta(this);
        this.batches = new API.Batches(this);
        this.uploads = new API.Uploads(this);
        this.responses = new API.Responses(this);
        this.conversations = new API.Conversations(this);
        this.evals = new API.Evals(this);
        this.containers = new API.Containers(this);
        if (apiKey === undefined) {
            throw new Errors.OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
        }
        const options = {
            apiKey,
            organization,
            project,
            webhookSecret,
            ...opts,
            baseURL: baseURL || `https://api.openai.com/v1`,
        };
        if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
            throw new Errors.OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
        }
        this.baseURL = options.baseURL;
        this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT /* 10 minutes */;
        this.logger = options.logger ?? console;
        const defaultLogLevel = 'warn';
        // Set default logLevel early so that we can log a warning in parseLogLevel.
        this.logLevel = defaultLogLevel;
        this.logLevel =
            parseLogLevel(options.logLevel, 'ClientOptions.logLevel', this) ??
                parseLogLevel(readEnv('OPENAI_LOG'), "process.env['OPENAI_LOG']", this) ??
                defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? Shims.getDefaultFetch();
        __classPrivateFieldSet(this, _OpenAI_encoder, Opts.FallbackEncoder, "f");
        this._options = options;
        this.apiKey = apiKey;
        this.organization = organization;
        this.project = project;
        this.webhookSecret = webhookSecret;
    }
    /**
     * Create a new client instance re-using the same options given to the current client with optional overriding.
     */
    withOptions(options) {
        const client = new this.constructor({
            ...this._options,
            baseURL: this.baseURL,
            maxRetries: this.maxRetries,
            timeout: this.timeout,
            logger: this.logger,
            logLevel: this.logLevel,
            fetch: this.fetch,
            fetchOptions: this.fetchOptions,
            apiKey: this.apiKey,
            organization: this.organization,
            project: this.project,
            webhookSecret: this.webhookSecret,
            ...options,
        });
        return client;
    }
    defaultQuery() {
        return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
        return;
    }
    async authHeaders(opts) {
        return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
    }
    stringifyQuery(query) {
        return qs.stringify(query, { arrayFormat: 'brackets' });
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
    }
    defaultIdempotencyKey() {
        return `stainless-node-retry-${uuid4()}`;
    }
    makeStatusError(status, error, message, headers) {
        return Errors.APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
        const baseURL = (!__classPrivateFieldGet(this, _OpenAI_instances, "m", _OpenAI_baseURLOverridden).call(this) && defaultBaseURL) || this.baseURL;
        const url = isAbsoluteURL(path) ?
            new URL(path)
            : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));
        const defaultQuery = this.defaultQuery();
        if (!isEmptyObj(defaultQuery)) {
            query = { ...defaultQuery, ...query };
        }
        if (typeof query === 'object' && query && !Array.isArray(query)) {
            url.search = this.stringifyQuery(query);
        }
        return url.toString();
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) { }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    async prepareRequest(request, { url, options }) { }
    get(path, opts) {
        return this.methodRequest('get', path, opts);
    }
    post(path, opts) {
        return this.methodRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.methodRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.methodRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.methodRequest('delete', path, opts);
    }
    methodRequest(method, path, opts) {
        return this.request(Promise.resolve(opts).then((opts) => {
            return { method, path, ...opts };
        }));
    }
    request(options, remainingRetries = null) {
        return new APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
            retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
            retryCount: maxRetries - retriesRemaining,
        });
        await this.prepareRequest(req, { url, options });
        /** Not an API request ID, just for correlating local log entries. */
        const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
        const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
            retryOfRequestLogID,
            method: options.method,
            url,
            options,
            headers: req.headers,
        }));
        if (options.signal?.aborted) {
            throw new Errors.APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
        const headersTime = Date.now();
        if (response instanceof Error) {
            const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
            if (options.signal?.aborted) {
                throw new Errors.APIUserAbortError();
            }
            // detect native connection timeout errors
            // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
            // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
            // others do not provide enough information to distinguish timeouts from other connection errors
            const isTimeout = isAbortError(response) ||
                /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
            if (retriesRemaining) {
                loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url,
                    durationMs: headersTime - startTime,
                    message: response.message,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
            }
            loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`);
            loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`, formatRequestDetails({
                retryOfRequestLogID,
                url,
                durationMs: headersTime - startTime,
                message: response.message,
            }));
            if (isTimeout) {
                throw new Errors.APIConnectionTimeoutError();
            }
            throw new Errors.APIConnectionError({ cause: response });
        }
        const specialHeaders = [...response.headers.entries()]
            .filter(([name]) => name === 'x-request-id')
            .map(([name, value]) => ', ' + name + ': ' + JSON.stringify(value))
            .join('');
        const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? 'succeeded' : 'failed'} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
            const shouldRetry = await this.shouldRetry(response);
            if (retriesRemaining && shouldRetry) {
                const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
                // We don't need the body of this response.
                await Shims.CancelReadableStream(response.body);
                loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
                loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                    retryOfRequestLogID,
                    url: response.url,
                    status: response.status,
                    headers: response.headers,
                    durationMs: headersTime - startTime,
                }));
                return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
            }
            const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
            loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
            const errText = await response.text().catch((err) => castToError(err).message);
            const errJSON = safeJSON(errText);
            const errMessage = errJSON ? undefined : errText;
            loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
                retryOfRequestLogID,
                url: response.url,
                status: response.status,
                headers: response.headers,
                message: errMessage,
                durationMs: Date.now() - startTime,
            }));
            const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
            throw err;
        }
        loggerFor(this).info(responseInfo);
        loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
    }
    getAPIList(path, Page, opts) {
        return this.requestAPIList(Page, { method: 'get', path, ...opts });
    }
    requestAPIList(Page, options) {
        const request = this.makeRequest(options, null, undefined);
        return new Pagination.PagePromise(this, request, Page);
    }
    async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        if (signal)
            signal.addEventListener('abort', () => controller.abort());
        const timeout = setTimeout(() => controller.abort(), ms);
        const isReadableBody = (globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream) ||
            (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);
        const fetchOptions = {
            signal: controller.signal,
            ...(isReadableBody ? { duplex: 'half' } : {}),
            method: 'GET',
            ...options,
        };
        if (method) {
            // Custom methods like 'patch' need to be uppercased
            // See https://github.com/nodejs/undici/issues/2294
            fetchOptions.method = method.toUpperCase();
        }
        try {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return await this.fetch.call(undefined, url, fetchOptions);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async shouldRetry(response) {
        // Note this is not a standard header.
        const shouldRetryHeader = response.headers.get('x-should-retry');
        // If the server explicitly says whether or not to retry, obey.
        if (shouldRetryHeader === 'true')
            return true;
        if (shouldRetryHeader === 'false')
            return false;
        // Retry on request timeouts.
        if (response.status === 408)
            return true;
        // Retry on lock timeouts.
        if (response.status === 409)
            return true;
        // Retry on rate limits.
        if (response.status === 429)
            return true;
        // Retry internal errors.
        if (response.status >= 500)
            return true;
        return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
        const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
        if (retryAfterMillisHeader) {
            const timeoutMs = parseFloat(retryAfterMillisHeader);
            if (!Number.isNaN(timeoutMs)) {
                timeoutMillis = timeoutMs;
            }
        }
        // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
        const retryAfterHeader = responseHeaders?.get('retry-after');
        if (retryAfterHeader && !timeoutMillis) {
            const timeoutSeconds = parseFloat(retryAfterHeader);
            if (!Number.isNaN(timeoutSeconds)) {
                timeoutMillis = timeoutSeconds * 1000;
            }
            else {
                timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
            }
        }
        // If the API asks us to wait a certain amount of time (and it's a reasonable amount),
        // just do what it says, but otherwise calculate a default
        if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
            const maxRetries = options.maxRetries ?? this.maxRetries;
            timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await sleep(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8.0;
        const numRetries = maxRetries - retriesRemaining;
        // Apply exponential backoff, but not more than the max.
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        // Apply some jitter, take up to at most 25 percent of the retry time.
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1000;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path, query, defaultBaseURL } = options;
        const url = this.buildURL(path, query, defaultBaseURL);
        if ('timeout' in options)
            validatePositiveInteger('timeout', options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
            method,
            headers: reqHeaders,
            ...(options.signal && { signal: options.signal }),
            ...(globalThis.ReadableStream &&
                body instanceof globalThis.ReadableStream && { duplex: 'half' }),
            ...(body && { body }),
            ...(this.fetchOptions ?? {}),
            ...(options.fetchOptions ?? {}),
        };
        return { req, url, timeout: options.timeout };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount, }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== 'get') {
            if (!options.idempotencyKey)
                options.idempotencyKey = this.defaultIdempotencyKey();
            idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = buildHeaders([
            idempotencyHeaders,
            {
                Accept: 'application/json',
                'User-Agent': this.getUserAgent(),
                'X-Stainless-Retry-Count': String(retryCount),
                ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
                ...getPlatformHeaders(),
                'OpenAI-Organization': this.organization,
                'OpenAI-Project': this.project,
            },
            await this.authHeaders(options),
            this._options.defaultHeaders,
            bodyHeaders,
            options.headers,
        ]);
        this.validateHeaders(headers);
        return headers.values;
    }
    buildBody({ options: { body, headers: rawHeaders } }) {
        if (!body) {
            return { bodyHeaders: undefined, body: undefined };
        }
        const headers = buildHeaders([rawHeaders]);
        if (
        // Pass raw type verbatim
        ArrayBuffer.isView(body) ||
            body instanceof ArrayBuffer ||
            body instanceof DataView ||
            (typeof body === 'string' &&
                // Preserve legacy string encoding behavior for now
                headers.values.has('content-type')) ||
            // `Blob` is superset of `File`
            body instanceof Blob ||
            // `FormData` -> `multipart/form-data`
            body instanceof FormData ||
            // `URLSearchParams` -> `application/x-www-form-urlencoded`
            body instanceof URLSearchParams ||
            // Send chunked stream (each chunk has own `length`)
            (globalThis.ReadableStream && body instanceof globalThis.ReadableStream)) {
            return { bodyHeaders: undefined, body: body };
        }
        else if (typeof body === 'object' &&
            (Symbol.asyncIterator in body ||
                (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))) {
            return { bodyHeaders: undefined, body: Shims.ReadableStreamFrom(body) };
        }
        else {
            return __classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers });
        }
    }
}
_a = OpenAI, _OpenAI_encoder = new WeakMap(), _OpenAI_instances = new WeakSet(), _OpenAI_baseURLOverridden = function _OpenAI_baseURLOverridden() {
    return this.baseURL !== 'https://api.openai.com/v1';
};
OpenAI.OpenAI = _a;
OpenAI.DEFAULT_TIMEOUT = 600000; // 10 minutes
OpenAI.OpenAIError = Errors.OpenAIError;
OpenAI.APIError = Errors.APIError;
OpenAI.APIConnectionError = Errors.APIConnectionError;
OpenAI.APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
OpenAI.APIUserAbortError = Errors.APIUserAbortError;
OpenAI.NotFoundError = Errors.NotFoundError;
OpenAI.ConflictError = Errors.ConflictError;
OpenAI.RateLimitError = Errors.RateLimitError;
OpenAI.BadRequestError = Errors.BadRequestError;
OpenAI.AuthenticationError = Errors.AuthenticationError;
OpenAI.InternalServerError = Errors.InternalServerError;
OpenAI.PermissionDeniedError = Errors.PermissionDeniedError;
OpenAI.UnprocessableEntityError = Errors.UnprocessableEntityError;
OpenAI.InvalidWebhookSignatureError = Errors.InvalidWebhookSignatureError;
OpenAI.toFile = Uploads.toFile;
OpenAI.Completions = Completions;
OpenAI.Chat = Chat;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders;
OpenAI.VectorStores = VectorStores;
OpenAI.Webhooks = Webhooks;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.Uploads = UploadsAPIUploads;
OpenAI.Responses = Responses;
OpenAI.Conversations = Conversations;
OpenAI.Evals = Evals;
OpenAI.Containers = Containers;
//# sourceMappingURL=client.mjs.map

import "@vite/env";

//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
		return typeof o$1;
	} : function(o$1) {
		return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
	}, _typeof(o);
}

//#endregion
//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}

//#endregion
//#region ../../node_modules/.pnpm/@oxc-project+runtime@0.81.0/node_modules/@oxc-project/runtime/src/helpers/esm/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}

//#endregion
//#region src/shared/hmr.ts
var HMRContext = class {
	constructor(hmrClient$1, ownerPath) {
		this.hmrClient = hmrClient$1;
		this.ownerPath = ownerPath;
		_defineProperty(this, "newListeners", void 0);
		if (!hmrClient$1.dataMap.has(ownerPath)) hmrClient$1.dataMap.set(ownerPath, {});
		const mod = hmrClient$1.hotModulesMap.get(ownerPath);
		if (mod) mod.callbacks = [];
		const staleListeners = hmrClient$1.ctxToListenersMap.get(ownerPath);
		if (staleListeners) for (const [event, staleFns] of staleListeners) {
			const listeners = hmrClient$1.customListenersMap.get(event);
			if (listeners) hmrClient$1.customListenersMap.set(event, listeners.filter((l) => !staleFns.includes(l)));
		}
		this.newListeners = /* @__PURE__ */ new Map();
		hmrClient$1.ctxToListenersMap.set(ownerPath, this.newListeners);
	}
	get data() {
		return this.hmrClient.dataMap.get(this.ownerPath);
	}
	accept(deps, callback) {
		if (typeof deps === "function" || !deps) this.acceptDeps([this.ownerPath], ([mod]) => deps?.(mod));
		else if (typeof deps === "string") this.acceptDeps([deps], ([mod]) => callback?.(mod));
		else if (Array.isArray(deps)) this.acceptDeps(deps, callback);
		else throw new Error(`invalid hot.accept() usage.`);
	}
	acceptExports(_, callback) {
		this.acceptDeps([this.ownerPath], ([mod]) => callback?.(mod));
	}
	dispose(cb) {
		this.hmrClient.disposeMap.set(this.ownerPath, cb);
	}
	prune(cb) {
		this.hmrClient.pruneMap.set(this.ownerPath, cb);
	}
	decline() {}
	invalidate(message) {
		const firstInvalidatedBy = this.hmrClient.currentFirstInvalidatedBy ?? this.ownerPath;
		this.hmrClient.notifyListeners("vite:invalidate", {
			path: this.ownerPath,
			message,
			firstInvalidatedBy
		});
		this.send("vite:invalidate", {
			path: this.ownerPath,
			message,
			firstInvalidatedBy
		});
		this.hmrClient.logger.debug(`invalidate ${this.ownerPath}${message ? `: ${message}` : ""}`);
	}
	on(event, cb) {
		const addToMap = (map) => {
			const existing = map.get(event) || [];
			existing.push(cb);
			map.set(event, existing);
		};
		addToMap(this.hmrClient.customListenersMap);
		addToMap(this.newListeners);
	}
	off(event, cb) {
		const removeFromMap = (map) => {
			const existing = map.get(event);
			if (existing === void 0) return;
			const pruned = existing.filter((l) => l !== cb);
			if (pruned.length === 0) {
				map.delete(event);
				return;
			}
			map.set(event, pruned);
		};
		removeFromMap(this.hmrClient.customListenersMap);
		removeFromMap(this.newListeners);
	}
	send(event, data) {
		this.hmrClient.send({
			type: "custom",
			event,
			data
		});
	}
	acceptDeps(deps, callback = () => {}) {
		const mod = this.hmrClient.hotModulesMap.get(this.ownerPath) || {
			id: this.ownerPath,
			callbacks: []
		};
		mod.callbacks.push({
			deps,
			fn: callback
		});
		this.hmrClient.hotModulesMap.set(this.ownerPath, mod);
	}
};
var HMRClient = class {
	constructor(logger, transport$1, importUpdatedModule) {
		this.logger = logger;
		this.transport = transport$1;
		this.importUpdatedModule = importUpdatedModule;
		_defineProperty(this, "hotModulesMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "disposeMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "pruneMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "dataMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "customListenersMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "ctxToListenersMap", /* @__PURE__ */ new Map());
		_defineProperty(this, "currentFirstInvalidatedBy", void 0);
		_defineProperty(this, "updateQueue", []);
		_defineProperty(this, "pendingUpdateQueue", false);
	}
	async notifyListeners(event, data) {
		const cbs = this.customListenersMap.get(event);
		if (cbs) await Promise.allSettled(cbs.map((cb) => cb(data)));
	}
	send(payload) {
		this.transport.send(payload).catch((err) => {
			this.logger.error(err);
		});
	}
	clear() {
		this.hotModulesMap.clear();
		this.disposeMap.clear();
		this.pruneMap.clear();
		this.dataMap.clear();
		this.customListenersMap.clear();
		this.ctxToListenersMap.clear();
	}
	async prunePaths(paths) {
		await Promise.all(paths.map((path) => {
			const disposer = this.disposeMap.get(path);
			if (disposer) return disposer(this.dataMap.get(path));
		}));
		paths.forEach((path) => {
			const fn = this.pruneMap.get(path);
			if (fn) fn(this.dataMap.get(path));
		});
	}
	warnFailedUpdate(err, path) {
		if (!(err instanceof Error) || !err.message.includes("fetch")) this.logger.error(err);
		this.logger.error(`Failed to reload ${path}. This could be due to syntax errors or importing non-existent modules. (see errors above)`);
	}
	/**
	* buffer multiple hot updates triggered by the same src change
	* so that they are invoked in the same order they were sent.
	* (otherwise the order may be inconsistent because of the http request round trip)
	*/
	async queueUpdate(payload) {
		this.updateQueue.push(this.fetchUpdate(payload));
		if (!this.pendingUpdateQueue) {
			this.pendingUpdateQueue = true;
			await Promise.resolve();
			this.pendingUpdateQueue = false;
			const loading = [...this.updateQueue];
			this.updateQueue = [];
			(await Promise.all(loading)).forEach((fn) => fn && fn());
		}
	}
	async fetchUpdate(update) {
		const { path, acceptedPath, firstInvalidatedBy } = update;
		const mod = this.hotModulesMap.get(path);
		if (!mod) return;
		let fetchedModule;
		const isSelfUpdate = path === acceptedPath;
		const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => deps.includes(acceptedPath));
		if (isSelfUpdate || qualifiedCallbacks.length > 0) {
			const disposer = this.disposeMap.get(acceptedPath);
			if (disposer) await disposer(this.dataMap.get(acceptedPath));
			try {
				fetchedModule = await this.importUpdatedModule(update);
			} catch (e) {
				this.warnFailedUpdate(e, acceptedPath);
			}
		}
		return () => {
			try {
				this.currentFirstInvalidatedBy = firstInvalidatedBy;
				for (const { deps, fn } of qualifiedCallbacks) fn(deps.map((dep) => dep === acceptedPath ? fetchedModule : void 0));
				const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
				this.logger.debug(`hot updated: ${loggedPath}`);
			} finally {
				this.currentFirstInvalidatedBy = void 0;
			}
		};
	}
};

//#endregion
//#region ../../node_modules/.pnpm/nanoid@5.1.5/node_modules/nanoid/non-secure/index.js
let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let nanoid = (size = 21) => {
	let id = "";
	let i = size | 0;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
};

//#endregion
//#region src/shared/constants.ts
let SOURCEMAPPING_URL = "sourceMa";
SOURCEMAPPING_URL += "ppingURL";

//#endregion
//#region src/shared/utils.ts
const isWindows = typeof process !== "undefined" && process.platform === "win32";
const AsyncFunction = async function() {}.constructor;
function promiseWithResolvers() {
	let resolve;
	let reject;
	const promise = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	return {
		promise,
		resolve,
		reject
	};
}

//#endregion
//#region src/shared/moduleRunnerTransport.ts
function reviveInvokeError(e) {
	const error = new Error(e.message || "Unknown invoke error");
	Object.assign(error, e, { runnerError: /* @__PURE__ */ new Error("RunnerError") });
	return error;
}
const createInvokeableTransport = (transport$1) => {
	if (transport$1.invoke) return {
		...transport$1,
		async invoke(name, data) {
			const result = await transport$1.invoke({
				type: "custom",
				event: "vite:invoke",
				data: {
					id: "send",
					name,
					data
				}
			});
			if ("error" in result) throw reviveInvokeError(result.error);
			return result.result;
		}
	};
	if (!transport$1.send || !transport$1.connect) throw new Error("transport must implement send and connect when invoke is not implemented");
	const rpcPromises = /* @__PURE__ */ new Map();
	return {
		...transport$1,
		connect({ onMessage, onDisconnection }) {
			return transport$1.connect({
				onMessage(payload) {
					if (payload.type === "custom" && payload.event === "vite:invoke") {
						const data = payload.data;
						if (data.id.startsWith("response:")) {
							const invokeId = data.id.slice(9);
							const promise = rpcPromises.get(invokeId);
							if (!promise) return;
							if (promise.timeoutId) clearTimeout(promise.timeoutId);
							rpcPromises.delete(invokeId);
							const { error, result } = data.data;
							if (error) promise.reject(error);
							else promise.resolve(result);
							return;
						}
					}
					onMessage(payload);
				},
				onDisconnection
			});
		},
		disconnect() {
			rpcPromises.forEach((promise) => {
				promise.reject(/* @__PURE__ */ new Error(`transport was disconnected, cannot call ${JSON.stringify(promise.name)}`));
			});
			rpcPromises.clear();
			return transport$1.disconnect?.();
		},
		send(data) {
			return transport$1.send(data);
		},
		async invoke(name, data) {
			const promiseId = nanoid();
			const wrappedData = {
				type: "custom",
				event: "vite:invoke",
				data: {
					name,
					id: `send:${promiseId}`,
					data
				}
			};
			const sendPromise = transport$1.send(wrappedData);
			const { promise, resolve, reject } = promiseWithResolvers();
			const timeout = transport$1.timeout ?? 6e4;
			let timeoutId;
			if (timeout > 0) {
				timeoutId = setTimeout(() => {
					rpcPromises.delete(promiseId);
					reject(/* @__PURE__ */ new Error(`transport invoke timed out after ${timeout}ms (data: ${JSON.stringify(wrappedData)})`));
				}, timeout);
				timeoutId?.unref?.();
			}
			rpcPromises.set(promiseId, {
				resolve,
				reject,
				name,
				timeoutId
			});
			if (sendPromise) sendPromise.catch((err) => {
				clearTimeout(timeoutId);
				rpcPromises.delete(promiseId);
				reject(err);
			});
			try {
				return await promise;
			} catch (err) {
				throw reviveInvokeError(err);
			}
		}
	};
};
const normalizeModuleRunnerTransport = (transport$1) => {
	const invokeableTransport = createInvokeableTransport(transport$1);
	let isConnected = !invokeableTransport.connect;
	let connectingPromise;
	return {
		...transport$1,
		...invokeableTransport.connect ? { async connect(onMessage) {
			if (isConnected) return;
			if (connectingPromise) {
				await connectingPromise;
				return;
			}
			const maybePromise = invokeableTransport.connect({
				onMessage: onMessage ?? (() => {}),
				onDisconnection() {
					isConnected = false;
				}
			});
			if (maybePromise) {
				connectingPromise = maybePromise;
				await connectingPromise;
				connectingPromise = void 0;
			}
			isConnected = true;
		} } : {},
		...invokeableTransport.disconnect ? { async disconnect() {
			if (!isConnected) return;
			if (connectingPromise) await connectingPromise;
			isConnected = false;
			await invokeableTransport.disconnect();
		} } : {},
		async send(data) {
			if (!invokeableTransport.send) return;
			if (!isConnected) if (connectingPromise) await connectingPromise;
			else throw new Error("send was called before connect");
			await invokeableTransport.send(data);
		},
		async invoke(name, data) {
			if (!isConnected) if (connectingPromise) await connectingPromise;
			else throw new Error("invoke was called before connect");
			return invokeableTransport.invoke(name, data);
		}
	};
};
const createWebSocketModuleRunnerTransport = (options) => {
	const pingInterval = options.pingInterval ?? 3e4;
	let ws;
	let pingIntervalId;
	return {
		async connect({ onMessage, onDisconnection }) {
			const socket = options.createConnection();
			socket.addEventListener("message", async ({ data }) => {
				onMessage(JSON.parse(data));
			});
			let isOpened = socket.readyState === socket.OPEN;
			if (!isOpened) await new Promise((resolve, reject) => {
				socket.addEventListener("open", () => {
					isOpened = true;
					resolve();
				}, { once: true });
				socket.addEventListener("close", async () => {
					if (!isOpened) {
						reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));
						return;
					}
					onMessage({
						type: "custom",
						event: "vite:ws:disconnect",
						data: { webSocket: socket }
					});
					onDisconnection();
				});
			});
			onMessage({
				type: "custom",
				event: "vite:ws:connect",
				data: { webSocket: socket }
			});
			ws = socket;
			pingIntervalId = setInterval(() => {
				if (socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: "ping" }));
			}, pingInterval);
		},
		disconnect() {
			clearInterval(pingIntervalId);
			ws?.close();
		},
		send(data) {
			ws.send(JSON.stringify(data));
		}
	};
};

//#endregion
//#region src/shared/hmrHandler.ts
function createHMRHandler(handler) {
	const queue = new Queue();
	return (payload) => queue.enqueue(() => handler(payload));
}
var Queue = class {
	constructor() {
		_defineProperty(this, "queue", []);
		_defineProperty(this, "pending", false);
	}
	enqueue(promise) {
		return new Promise((resolve, reject) => {
			this.queue.push({
				promise,
				resolve,
				reject
			});
			this.dequeue();
		});
	}
	dequeue() {
		if (this.pending) return false;
		const item = this.queue.shift();
		if (!item) return false;
		this.pending = true;
		item.promise().then(item.resolve).catch(item.reject).finally(() => {
			this.pending = false;
			this.dequeue();
		});
		return true;
	}
};

//#endregion
//#region src/client/overlay.ts
const hmrConfigName = __HMR_CONFIG_NAME__;
const base$1 = __BASE__ || "/";
function h(e, attrs = {}, ...children) {
	const elem = document.createElement(e);
	for (const [k, v] of Object.entries(attrs)) elem.setAttribute(k, v);
	elem.append(...children);
	return elem;
}
const templateStyle = `
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  --monospace: 'SFMono-Regular', Consolas,
  'Liberation Mono', Menlo, Courier, monospace;
  --red: #ff5555;
  --yellow: #e2aa53;
  --purple: #cfa4ff;
  --cyan: #2dd9da;
  --dim: #c9c9c9;

  --window-background: #181818;
  --window-color: #d8d8d8;
}

.backdrop {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  margin: 0;
  background: rgba(0, 0, 0, 0.66);
}

.window {
  font-family: var(--monospace);
  line-height: 1.5;
  max-width: 80vw;
  color: var(--window-color);
  box-sizing: border-box;
  margin: 30px auto;
  padding: 2.5vh 4vw;
  position: relative;
  background: var(--window-background);
  border-radius: 6px 6px 8px 8px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  overflow: hidden;
  border-top: 8px solid var(--red);
  direction: ltr;
  text-align: left;
}

pre {
  font-family: var(--monospace);
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow-x: scroll;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

pre.frame::-webkit-scrollbar {
  display: block;
  height: 5px;
}

pre.frame::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 5px;
}

pre.frame {
  scrollbar-width: thin;
}

.message {
  line-height: 1.3;
  font-weight: 600;
  white-space: pre-wrap;
}

.message-body {
  color: var(--red);
}

.plugin {
  color: var(--purple);
}

.file {
  color: var(--cyan);
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.frame {
  color: var(--yellow);
}

.stack {
  font-size: 13px;
  color: var(--dim);
}

.tip {
  font-size: 13px;
  color: #999;
  border-top: 1px dotted #999;
  padding-top: 13px;
  line-height: 1.8;
}

code {
  font-size: 13px;
  font-family: var(--monospace);
  color: var(--yellow);
}

.file-link {
  text-decoration: underline;
  cursor: pointer;
}

kbd {
  line-height: 1.5;
  font-family: ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: rgb(38, 40, 44);
  color: rgb(166, 167, 171);
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  border-width: 0.0625rem 0.0625rem 0.1875rem;
  border-style: solid;
  border-color: rgb(54, 57, 64);
  border-image: initial;
}
`;
const createTemplate = () => h("div", {
	class: "backdrop",
	part: "backdrop"
}, h("div", {
	class: "window",
	part: "window"
}, h("pre", {
	class: "message",
	part: "message"
}, h("span", {
	class: "plugin",
	part: "plugin"
}), h("span", {
	class: "message-body",
	part: "message-body"
})), h("pre", {
	class: "file",
	part: "file"
}), h("pre", {
	class: "frame",
	part: "frame"
}), h("pre", {
	class: "stack",
	part: "stack"
}), h("div", {
	class: "tip",
	part: "tip"
}, "Click outside, press ", h("kbd", {}, "Esc"), " key, or fix the code to dismiss.", h("br"), "You can also disable this overlay by setting ", h("code", { part: "config-option-name" }, "server.hmr.overlay"), " to ", h("code", { part: "config-option-value" }, "false"), " in ", h("code", { part: "config-file-name" }, hmrConfigName), ".")), h("style", {}, templateStyle));
const fileRE = /(?:file:\/\/)?(?:[a-zA-Z]:\\|\/).*?:\d+:\d+/g;
const codeframeRE = /^(?:>?\s*\d+\s+\|.*|\s+\|\s*\^.*)\r?\n/gm;
const { HTMLElement = class {} } = globalThis;
var ErrorOverlay = class extends HTMLElement {
	constructor(err, links = true) {
		super();
		_defineProperty(this, "root", void 0);
		_defineProperty(this, "closeOnEsc", void 0);
		this.root = this.attachShadow({ mode: "open" });
		this.root.appendChild(createTemplate());
		codeframeRE.lastIndex = 0;
		const hasFrame = err.frame && codeframeRE.test(err.frame);
		const message = hasFrame ? err.message.replace(codeframeRE, "") : err.message;
		if (err.plugin) this.text(".plugin", `[plugin:${err.plugin}] `);
		this.text(".message-body", message.trim());
		const [file] = (err.loc?.file || err.id || "unknown file").split(`?`);
		if (err.loc) this.text(".file", `${file}:${err.loc.line}:${err.loc.column}`, links);
		else if (err.id) this.text(".file", file);
		if (hasFrame) this.text(".frame", err.frame.trim());
		this.text(".stack", err.stack, links);
		this.root.querySelector(".window").addEventListener("click", (e) => {
			e.stopPropagation();
		});
		this.addEventListener("click", () => {
			this.close();
		});
		this.closeOnEsc = (e) => {
			if (e.key === "Escape" || e.code === "Escape") this.close();
		};
		document.addEventListener("keydown", this.closeOnEsc);
	}
	text(selector, text, linkFiles = false) {
		const el = this.root.querySelector(selector);
		if (!linkFiles) el.textContent = text;
		else {
			let curIndex = 0;
			let match;
			fileRE.lastIndex = 0;
			while (match = fileRE.exec(text)) {
				const { 0: file, index } = match;
				const frag = text.slice(curIndex, index);
				el.appendChild(document.createTextNode(frag));
				const link = document.createElement("a");
				link.textContent = file;
				link.className = "file-link";
				link.onclick = () => {
					fetch(new URL(`${base$1}__open-in-editor?file=${encodeURIComponent(file)}`, import.meta.url));
				};
				el.appendChild(link);
				curIndex += frag.length + file.length;
			}
			if (curIndex < text.length) el.appendChild(document.createTextNode(text.slice(curIndex)));
		}
	}
	close() {
		this.parentNode?.removeChild(this);
		document.removeEventListener("keydown", this.closeOnEsc);
	}
};
const overlayId = "vite-error-overlay";
const { customElements } = globalThis;
if (customElements && !customElements.get(overlayId)) customElements.define(overlayId, ErrorOverlay);

//#endregion
//#region src/client/client.ts
console.debug("[vite] connecting...");
const importMetaUrl = new URL(import.meta.url);
const serverHost = __SERVER_HOST__;
const socketProtocol = __HMR_PROTOCOL__ || (importMetaUrl.protocol === "https:" ? "wss" : "ws");
const hmrPort = __HMR_PORT__;
const socketHost = `${__HMR_HOSTNAME__ || importMetaUrl.hostname}:${hmrPort || importMetaUrl.port}${__HMR_BASE__}`;
const directSocketHost = __HMR_DIRECT_TARGET__;
const base = __BASE__ || "/";
const hmrTimeout = __HMR_TIMEOUT__;
const wsToken = __WS_TOKEN__;
const transport = normalizeModuleRunnerTransport((() => {
	let wsTransport = createWebSocketModuleRunnerTransport({
		createConnection: () => new WebSocket(`${socketProtocol}://${socketHost}?token=${wsToken}`, "vite-hmr"),
		pingInterval: hmrTimeout
	});
	return {
		async connect(handlers) {
			try {
				await wsTransport.connect(handlers);
			} catch (e) {
				if (!hmrPort) {
					wsTransport = createWebSocketModuleRunnerTransport({
						createConnection: () => new WebSocket(`${socketProtocol}://${directSocketHost}?token=${wsToken}`, "vite-hmr"),
						pingInterval: hmrTimeout
					});
					try {
						await wsTransport.connect(handlers);
						console.info("[vite] Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.");
					} catch (e$1) {
						if (e$1 instanceof Error && e$1.message.includes("WebSocket closed without opened.")) {
							const currentScriptHostURL = new URL(import.meta.url);
							const currentScriptHost = currentScriptHostURL.host + currentScriptHostURL.pathname.replace(/@vite\/client$/, "");
							console.error(`[vite] failed to connect to websocket.
your current setup:
  (browser) ${currentScriptHost} <--[HTTP]--> ${serverHost} (server)\n  (browser) ${socketHost} <--[WebSocket (failing)]--> ${directSocketHost} (server)\nCheck out your Vite / network configuration and https://vite.dev/config/server-options.html#server-hmr .`);
						}
					}
					return;
				}
				console.error(`[vite] failed to connect to websocket (${e}). `);
				throw e;
			}
		},
		async disconnect() {
			await wsTransport.disconnect();
		},
		send(data) {
			wsTransport.send(data);
		}
	};
})());
let willUnload = false;
if (typeof window !== "undefined") window.addEventListener?.("beforeunload", () => {
	willUnload = true;
});
function cleanUrl(pathname) {
	const url = new URL(pathname, "http://vite.dev");
	url.searchParams.delete("direct");
	return url.pathname + url.search;
}
let isFirstUpdate = true;
const outdatedLinkTags = /* @__PURE__ */ new WeakSet();
const debounceReload = (time) => {
	let timer;
	return () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(() => {
			location.reload();
		}, time);
	};
};
const pageReload = debounceReload(20);
const hmrClient = new HMRClient({
	error: (err) => console.error("[vite]", err),
	debug: (...msg) => console.debug("[vite]", ...msg)
}, transport, async function importUpdatedModule({ acceptedPath, timestamp, explicitImportRequired, isWithinCircularImport }) {
	const [acceptedPathWithoutQuery, query] = acceptedPath.split(`?`);
	const importPromise = import(
		/* @vite-ignore */
		base + acceptedPathWithoutQuery.slice(1) + `?${explicitImportRequired ? "import&" : ""}t=${timestamp}${query ? `&${query}` : ""}`
);
	if (isWithinCircularImport) importPromise.catch(() => {
		console.info(`[hmr] ${acceptedPath} failed to apply HMR as it's within a circular import. Reloading page to reset the execution order. To debug and break the circular import, you can run \`vite --debug hmr\` to log the circular dependency path if a file change triggered it.`);
		pageReload();
	});
	return await importPromise;
});
transport.connect(createHMRHandler(handleMessage));
async function handleMessage(payload) {
	switch (payload.type) {
		case "connected":
			console.debug(`[vite] connected.`);
			break;
		case "update":
			await hmrClient.notifyListeners("vite:beforeUpdate", payload);
			if (hasDocument) if (isFirstUpdate && hasErrorOverlay()) {
				location.reload();
				return;
			} else {
				if (enableOverlay) clearErrorOverlay();
				isFirstUpdate = false;
			}
			await Promise.all(payload.updates.map(async (update) => {
				if (update.type === "js-update") return hmrClient.queueUpdate(update);
				const { path, timestamp } = update;
				const searchUrl = cleanUrl(path);
				const el = Array.from(document.querySelectorAll("link")).find((e) => !outdatedLinkTags.has(e) && cleanUrl(e.href).includes(searchUrl));
				if (!el) return;
				const newPath = `${base}${searchUrl.slice(1)}${searchUrl.includes("?") ? "&" : "?"}t=${timestamp}`;
				return new Promise((resolve) => {
					const newLinkTag = el.cloneNode();
					newLinkTag.href = new URL(newPath, el.href).href;
					const removeOldEl = () => {
						el.remove();
						console.debug(`[vite] css hot updated: ${searchUrl}`);
						resolve();
					};
					newLinkTag.addEventListener("load", removeOldEl);
					newLinkTag.addEventListener("error", removeOldEl);
					outdatedLinkTags.add(el);
					el.after(newLinkTag);
				});
			}));
			await hmrClient.notifyListeners("vite:afterUpdate", payload);
			break;
		case "custom":
			await hmrClient.notifyListeners(payload.event, payload.data);
			if (payload.event === "vite:ws:disconnect") {
				if (hasDocument && !willUnload) {
					console.log(`[vite] server connection lost. Polling for restart...`);
					const socket = payload.data.webSocket;
					const url = new URL(socket.url);
					url.search = "";
					await waitForSuccessfulPing(url.href);
					location.reload();
				}
			}
			break;
		case "full-reload":
			await hmrClient.notifyListeners("vite:beforeFullReload", payload);
			if (hasDocument) if (payload.path && payload.path.endsWith(".html")) {
				const pagePath = decodeURI(location.pathname);
				const payloadPath = base + payload.path.slice(1);
				if (pagePath === payloadPath || payload.path === "/index.html" || pagePath.endsWith("/") && pagePath + "index.html" === payloadPath) pageReload();
				return;
			} else pageReload();
			break;
		case "prune":
			await hmrClient.notifyListeners("vite:beforePrune", payload);
			await hmrClient.prunePaths(payload.paths);
			break;
		case "error":
			await hmrClient.notifyListeners("vite:error", payload);
			if (hasDocument) {
				const err = payload.err;
				if (enableOverlay) createErrorOverlay(err);
				else console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
			}
			break;
		case "ping": break;
		default: {
			const check = payload;
			return check;
		}
	}
}
const enableOverlay = __HMR_ENABLE_OVERLAY__;
const hasDocument = "document" in globalThis;
function createErrorOverlay(err) {
	clearErrorOverlay();
	const { customElements: customElements$1 } = globalThis;
	if (customElements$1) {
		const ErrorOverlayConstructor = customElements$1.get(overlayId);
		document.body.appendChild(new ErrorOverlayConstructor(err));
	}
}
function clearErrorOverlay() {
	document.querySelectorAll(overlayId).forEach((n) => n.close());
}
function hasErrorOverlay() {
	return document.querySelectorAll(overlayId).length;
}
function waitForSuccessfulPing(socketUrl) {
	if (typeof SharedWorker === "undefined") {
		const visibilityManager = {
			currentState: document.visibilityState,
			listeners: /* @__PURE__ */ new Set()
		};
		const onVisibilityChange = () => {
			visibilityManager.currentState = document.visibilityState;
			for (const listener of visibilityManager.listeners) listener(visibilityManager.currentState);
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return waitForSuccessfulPingInternal(socketUrl, visibilityManager);
	}
	const blob = new Blob([
		"\"use strict\";",
		`const waitForSuccessfulPingInternal = ${waitForSuccessfulPingInternal.toString()};`,
		`const fn = ${pingWorkerContentMain.toString()};`,
		`fn(${JSON.stringify(socketUrl)})`
	], { type: "application/javascript" });
	const objURL = URL.createObjectURL(blob);
	const sharedWorker = new SharedWorker(objURL);
	return new Promise((resolve, reject) => {
		const onVisibilityChange = () => {
			sharedWorker.port.postMessage({ visibility: document.visibilityState });
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		sharedWorker.port.addEventListener("message", (event) => {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			sharedWorker.port.close();
			const data = event.data;
			if (data.type === "error") {
				reject(data.error);
				return;
			}
			resolve();
		});
		onVisibilityChange();
		sharedWorker.port.start();
	});
}
function pingWorkerContentMain(socketUrl) {
	self.addEventListener("connect", (_event) => {
		const event = _event;
		const port = event.ports[0];
		if (!socketUrl) {
			port.postMessage({
				type: "error",
				error: /* @__PURE__ */ new Error("socketUrl not found")
			});
			return;
		}
		const visibilityManager = {
			currentState: "visible",
			listeners: /* @__PURE__ */ new Set()
		};
		port.addEventListener("message", (event$1) => {
			const { visibility } = event$1.data;
			visibilityManager.currentState = visibility;
			console.debug("[vite] new window visibility", visibility);
			for (const listener of visibilityManager.listeners) listener(visibility);
		});
		port.start();
		console.debug("[vite] connected from window");
		waitForSuccessfulPingInternal(socketUrl, visibilityManager).then(() => {
			console.debug("[vite] ping successful");
			try {
				port.postMessage({ type: "success" });
			} catch (error) {
				port.postMessage({
					type: "error",
					error
				});
			}
		}, (error) => {
			console.debug("[vite] error happened", error);
			try {
				port.postMessage({
					type: "error",
					error
				});
			} catch (error$1) {
				port.postMessage({
					type: "error",
					error: error$1
				});
			}
		});
	});
}
async function waitForSuccessfulPingInternal(socketUrl, visibilityManager, ms = 1e3) {
	function wait(ms$1) {
		return new Promise((resolve) => setTimeout(resolve, ms$1));
	}
	async function ping() {
		try {
			const socket = new WebSocket(socketUrl, "vite-ping");
			return new Promise((resolve) => {
				function onOpen() {
					resolve(true);
					close();
				}
				function onError() {
					resolve(false);
					close();
				}
				function close() {
					socket.removeEventListener("open", onOpen);
					socket.removeEventListener("error", onError);
					socket.close();
				}
				socket.addEventListener("open", onOpen);
				socket.addEventListener("error", onError);
			});
		} catch {
			return false;
		}
	}
	function waitForWindowShow(visibilityManager$1) {
		return new Promise((resolve) => {
			const onChange = (newVisibility) => {
				if (newVisibility === "visible") {
					resolve();
					visibilityManager$1.listeners.delete(onChange);
				}
			};
			visibilityManager$1.listeners.add(onChange);
		});
	}
	if (await ping()) return;
	await wait(ms);
	while (true) if (visibilityManager.currentState === "visible") {
		if (await ping()) break;
		await wait(ms);
	} else await waitForWindowShow(visibilityManager);
}
const sheetsMap = /* @__PURE__ */ new Map();
if ("document" in globalThis) document.querySelectorAll("style[data-vite-dev-id]").forEach((el) => {
	sheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
});
const cspNonce = "document" in globalThis ? document.querySelector("meta[property=csp-nonce]")?.nonce : void 0;
let lastInsertedStyle;
function updateStyle(id, content) {
	let style = sheetsMap.get(id);
	if (!style) {
		style = document.createElement("style");
		style.setAttribute("type", "text/css");
		style.setAttribute("data-vite-dev-id", id);
		style.textContent = content;
		if (cspNonce) style.setAttribute("nonce", cspNonce);
		if (!lastInsertedStyle) {
			document.head.appendChild(style);
			setTimeout(() => {
				lastInsertedStyle = void 0;
			}, 0);
		} else lastInsertedStyle.insertAdjacentElement("afterend", style);
		lastInsertedStyle = style;
	} else style.textContent = content;
	sheetsMap.set(id, style);
}
function removeStyle(id) {
	const style = sheetsMap.get(id);
	if (style) {
		document.head.removeChild(style);
		sheetsMap.delete(id);
	}
}
function createHotContext(ownerPath) {
	return new HMRContext(hmrClient, ownerPath);
}
/**
* urls here are dynamic import() urls that couldn't be statically analyzed
*/
function injectQuery(url, queryToInject) {
	if (url[0] !== "." && url[0] !== "/") return url;
	const pathname = url.replace(/[?#].*$/, "");
	const { search, hash } = new URL(url, "http://vite.dev");
	return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ""}${hash || ""}`;
}

//#endregion
export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };

import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import vm from 'node:vm';
import createDebug from 'debug';
import { extractSourceMap } from './source-map.mjs';
import { createImportMetaEnvProxy, slash, isInternalRequest, isNodeBuiltin, normalizeRequestId, toFilePath, normalizeModuleId, cleanUrl, isPrimitive, isBareImport } from './utils.mjs';
import 'pathe';
import 'node:fs';

const { setTimeout, clearTimeout } = globalThis;
const debugExecute = createDebug("vite-node:client:execute");
const debugNative = createDebug("vite-node:client:native");
const clientStub = {
	injectQuery: (id) => id,
	createHotContext: () => {
		return {
			accept: () => {},
			prune: () => {},
			dispose: () => {},
			decline: () => {},
			invalidate: () => {},
			on: () => {},
			send: () => {}
		};
	},
	updateStyle: () => {},
	removeStyle: () => {}
};
const env = createImportMetaEnvProxy();
const DEFAULT_REQUEST_STUBS = {
	"/@vite/client": clientStub,
	"@vite/client": clientStub
};
class ModuleCacheMap extends Map {
	normalizePath(fsPath) {
		return normalizeModuleId(fsPath);
	}
	/**
	* Assign partial data to the map
	*/
	update(fsPath, mod) {
		fsPath = this.normalizePath(fsPath);
		if (!super.has(fsPath)) this.setByModuleId(fsPath, mod);
		else Object.assign(super.get(fsPath), mod);
		return this;
	}
	setByModuleId(modulePath, mod) {
		return super.set(modulePath, mod);
	}
	set(fsPath, mod) {
		return this.setByModuleId(this.normalizePath(fsPath), mod);
	}
	getByModuleId(modulePath) {
		if (!super.has(modulePath)) this.setByModuleId(modulePath, {});
		const mod = super.get(modulePath);
		if (!mod.imports) Object.assign(mod, {
			imports: /* @__PURE__ */ new Set(),
			importers: /* @__PURE__ */ new Set()
		});
		return mod;
	}
	get(fsPath) {
		return this.getByModuleId(this.normalizePath(fsPath));
	}
	deleteByModuleId(modulePath) {
		return super.delete(modulePath);
	}
	delete(fsPath) {
		return this.deleteByModuleId(this.normalizePath(fsPath));
	}
	invalidateModule(mod) {
		var _mod$importers, _mod$imports;
		delete mod.evaluated;
		delete mod.resolving;
		delete mod.promise;
		delete mod.exports;
		(_mod$importers = mod.importers) === null || _mod$importers === void 0 || _mod$importers.clear();
		(_mod$imports = mod.imports) === null || _mod$imports === void 0 || _mod$imports.clear();
		return true;
	}
	/**
	* Invalidate modules that dependent on the given modules, up to the main entry
	*/
	invalidateDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
		for (const _id of ids) {
			const id = this.normalizePath(_id);
			if (invalidated.has(id)) continue;
			invalidated.add(id);
			const mod = super.get(id);
			if (mod === null || mod === void 0 ? void 0 : mod.importers) this.invalidateDepTree(mod.importers, invalidated);
			super.delete(id);
		}
		return invalidated;
	}
	/**
	* Invalidate dependency modules of the given modules, down to the bottom-level dependencies
	*/
	invalidateSubDepTree(ids, invalidated = /* @__PURE__ */ new Set()) {
		for (const _id of ids) {
			const id = this.normalizePath(_id);
			if (invalidated.has(id)) continue;
			invalidated.add(id);
			const subIds = Array.from(super.entries()).filter(([, mod]) => {
				var _mod$importers2;
				return (_mod$importers2 = mod.importers) === null || _mod$importers2 === void 0 ? void 0 : _mod$importers2.has(id);
			}).map(([key]) => key);
			if (subIds.length) this.invalidateSubDepTree(subIds, invalidated);
			super.delete(id);
		}
		return invalidated;
	}
	/**
	* Return parsed source map based on inlined source map of the module
	*/
	getSourceMap(id) {
		const cache = this.get(id);
		if (cache.map) return cache.map;
		const map = cache.code && extractSourceMap(cache.code);
		if (map) {
			cache.map = map;
			return map;
		}
		return null;
	}
}
class ViteNodeRunner {
	root;
	debug;
	/**
	* Holds the cache of modules
	* Keys of the map are filepaths, or plain package names
	*/
	moduleCache;
	/**
	* Tracks the stack of modules being executed for the purpose of calculating import self-time.
	*
	* Note that while in most cases, imports are a linear stack of modules,
	* this is occasionally not the case, for example when you have parallel top-level dynamic imports like so:
	*
	* ```ts
	* await Promise.all([
	*  import('./module1'),
	*  import('./module2'),
	* ]);
	* ```
	*
	* In this case, the self time will be reported incorrectly for one of the modules (could go negative).
	* As top-level awaits with dynamic imports like this are uncommon, we don't handle this case specifically.
	*/
	executionStack = [];
	// `performance` can be mocked, so make sure we're using the original function
	performanceNow = performance.now.bind(performance);
	constructor(options) {
		this.options = options;
		this.root = options.root ?? process.cwd();
		this.moduleCache = options.moduleCache ?? new ModuleCacheMap();
		this.debug = options.debug ?? (typeof process !== "undefined" ? !!process.env.VITE_NODE_DEBUG_RUNNER : false);
	}
	async executeFile(file) {
		const url = `/@fs/${slash(resolve(file))}`;
		return await this.cachedRequest(url, url, []);
	}
	async executeId(rawId) {
		const [id, url] = await this.resolveUrl(rawId);
		return await this.cachedRequest(id, url, []);
	}
	/** @internal */
	async cachedRequest(id, fsPath, callstack) {
		const importee = callstack[callstack.length - 1];
		const mod = this.moduleCache.get(fsPath);
		const { imports, importers } = mod;
		if (importee) importers.add(importee);
		const getStack = () => `stack:\n${[...callstack, fsPath].reverse().map((p) => `  - ${p}`).join("\n")}`;
		// check circular dependency
		if (callstack.includes(fsPath) || Array.from(imports.values()).some((i) => importers.has(i))) {
			if (mod.exports) return mod.exports;
		}
		let debugTimer;
		if (this.debug) debugTimer = setTimeout(() => console.warn(`[vite-node] module ${fsPath} takes over 2s to load.\n${getStack()}`), 2e3);
		try {
			// cached module
			if (mod.promise) return await mod.promise;
			const promise = this.directRequest(id, fsPath, callstack);
			Object.assign(mod, {
				promise,
				evaluated: false
			});
			return await promise;
		} finally {
			mod.evaluated = true;
			if (debugTimer) clearTimeout(debugTimer);
		}
	}
	shouldResolveId(id, _importee) {
		return !isInternalRequest(id) && !isNodeBuiltin(id) && !id.startsWith("data:");
	}
	async _resolveUrl(id, importer) {
		var _resolved$meta;
		const dep = normalizeRequestId(id, this.options.base);
		if (!this.shouldResolveId(dep)) return [dep, dep];
		const { path, exists } = toFilePath(dep, this.root);
		if (!this.options.resolveId || exists) return [dep, path];
		const resolved = await this.options.resolveId(dep, importer);
		// supported since Vite 5-beta.19
		if (resolved === null || resolved === void 0 || (_resolved$meta = resolved.meta) === null || _resolved$meta === void 0 || (_resolved$meta = _resolved$meta["vite:alias"]) === null || _resolved$meta === void 0 ? void 0 : _resolved$meta.noResolved) {
			const error = new Error(`Cannot find module '${id}'${importer ? ` imported from '${importer}'` : ""}.

- If you rely on tsconfig.json's "paths" to resolve modules, please install "vite-tsconfig-paths" plugin to handle module resolution.
- Make sure you don't have relative aliases in your Vitest config. Use absolute paths instead. Read more: https://vitest.dev/guide/common-errors`);
			Object.defineProperty(error, "code", {
				value: "ERR_MODULE_NOT_FOUND",
				enumerable: true
			});
			Object.defineProperty(error, Symbol.for("vitest.error.not_found.data"), {
				value: {
					id: dep,
					importer
				},
				enumerable: false
			});
			throw error;
		}
		const resolvedId = resolved ? normalizeRequestId(resolved.id, this.options.base) : dep;
		return [resolvedId, resolvedId];
	}
	async resolveUrl(id, importee) {
		const resolveKey = `resolve:${id}`;
		// put info about new import as soon as possible, so we can start tracking it
		this.moduleCache.setByModuleId(resolveKey, { resolving: true });
		try {
			return await this._resolveUrl(id, importee);
		} finally {
			this.moduleCache.deleteByModuleId(resolveKey);
		}
	}
	/** @internal */
	async dependencyRequest(id, fsPath, callstack) {
		return await this.cachedRequest(id, fsPath, callstack);
	}
	async _fetchModule(id, importer) {
		try {
			return await this.options.fetchModule(id);
		} catch (cause) {
			// rethrow vite error if it cannot load the module because it's not resolved
			if (typeof cause === "object" && cause.code === "ERR_LOAD_URL" || typeof (cause === null || cause === void 0 ? void 0 : cause.message) === "string" && cause.message.includes("Failed to load url")) {
				const error = new Error(`Cannot find ${isBareImport(id) ? "package" : "module"} '${id}'${importer ? ` imported from '${importer}'` : ""}`, { cause });
				error.code = "ERR_MODULE_NOT_FOUND";
				throw error;
			}
			throw cause;
		}
	}
	/** @internal */
	async directRequest(id, fsPath, _callstack) {
		const moduleId = normalizeModuleId(fsPath);
		const callstack = [..._callstack, moduleId];
		const mod = this.moduleCache.getByModuleId(moduleId);
		const request = async (dep) => {
			const [id, depFsPath] = await this.resolveUrl(String(dep), fsPath);
			const depMod = this.moduleCache.getByModuleId(depFsPath);
			depMod.importers.add(moduleId);
			mod.imports.add(depFsPath);
			return this.dependencyRequest(id, depFsPath, callstack);
		};
		const requestStubs = this.options.requestStubs || DEFAULT_REQUEST_STUBS;
		if (id in requestStubs) return requestStubs[id];
		let { code: transformed, externalize } = await this._fetchModule(id, callstack[callstack.length - 2]);
		if (externalize) {
			debugNative(externalize);
			const exports = await this.interopedImport(externalize);
			mod.exports = exports;
			return exports;
		}
		if (transformed == null) throw new Error(`[vite-node] Failed to load "${id}" imported from ${callstack[callstack.length - 2]}`);
		const { Object, Reflect, Symbol } = this.getContextPrimitives();
		const modulePath = cleanUrl(moduleId);
		// disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
		const href = pathToFileURL(modulePath).href;
		const __filename = fileURLToPath(href);
		const __dirname = dirname(__filename);
		const meta = {
			url: href,
			env,
			filename: __filename,
			dirname: __dirname
		};
		const exports = Object.create(null);
		Object.defineProperty(exports, Symbol.toStringTag, {
			value: "Module",
			enumerable: false,
			configurable: false
		});
		const SYMBOL_NOT_DEFINED = Symbol("not defined");
		let moduleExports = SYMBOL_NOT_DEFINED;
		// this proxy is triggered only on exports.{name} and module.exports access
		// inside the module itself. imported module is always "exports"
		const cjsExports = new Proxy(exports, {
			get: (target, p, receiver) => {
				if (Reflect.has(target, p)) return Reflect.get(target, p, receiver);
				return Reflect.get(Object.prototype, p, receiver);
			},
			getPrototypeOf: () => Object.prototype,
			set: (_, p, value) => {
				// treat "module.exports =" the same as "exports.default =" to not have nested "default.default",
				// so "exports.default" becomes the actual module
				if (p === "default" && this.shouldInterop(modulePath, { default: value }) && cjsExports !== value) {
					exportAll(cjsExports, value);
					exports.default = value;
					return true;
				}
				if (!Reflect.has(exports, "default")) exports.default = {};
				// returns undefined, when accessing named exports, if default is not an object
				// but is still present inside hasOwnKeys, this is Node behaviour for CJS
				if (moduleExports !== SYMBOL_NOT_DEFINED && isPrimitive(moduleExports)) {
					defineExport(exports, p, () => void 0);
					return true;
				}
				if (!isPrimitive(exports.default)) exports.default[p] = value;
				if (p !== "default") defineExport(exports, p, () => value);
				return true;
			}
		});
		Object.assign(mod, {
			code: transformed,
			exports
		});
		const moduleProxy = {
			set exports(value) {
				exportAll(cjsExports, value);
				exports.default = value;
				moduleExports = value;
			},
			get exports() {
				return cjsExports;
			}
		};
		// Vite hot context
		let hotContext;
		if (this.options.createHotContext) Object.defineProperty(meta, "hot", {
			enumerable: true,
			get: () => {
				var _this$options$createH, _this$options;
				hotContext || (hotContext = (_this$options$createH = (_this$options = this.options).createHotContext) === null || _this$options$createH === void 0 ? void 0 : _this$options$createH.call(_this$options, this, moduleId));
				return hotContext;
			},
			set: (value) => {
				hotContext = value;
			}
		});
		// Be careful when changing this
		// changing context will change amount of code added on line :114 (vm.runInThisContext)
		// this messes up sourcemaps for coverage
		// adjust `WRAPPER_LENGTH` variable in packages/coverage-v8/src/provider.ts if you do change this
		const context = this.prepareContext({
			__vite_ssr_import__: request,
			__vite_ssr_dynamic_import__: request,
			__vite_ssr_exports__: exports,
			__vite_ssr_exportAll__: (obj) => exportAll(exports, obj),
			__vite_ssr_exportName__: (name, getter) => Object.defineProperty(exports, name, {
				enumerable: true,
				configurable: true,
				get: getter
			}),
			__vite_ssr_import_meta__: meta,
			require: createRequire(href),
			exports: cjsExports,
			module: moduleProxy,
			__filename,
			__dirname
		});
		debugExecute(__filename);
		// remove shebang
		if (transformed[0] === "#") transformed = transformed.replace(/^#!.*/, (s) => " ".repeat(s.length));
		await this.runModule(context, transformed);
		return exports;
	}
	getContextPrimitives() {
		return {
			Object,
			Reflect,
			Symbol
		};
	}
	async runModule(context, transformed) {
		// add 'use strict' since ESM enables it by default
		const codeDefinition = `'use strict';async (${Object.keys(context).join(",")})=>{{`;
		const code = `${codeDefinition}${transformed}\n}}`;
		const options = {
			filename: context.__filename,
			lineOffset: 0,
			columnOffset: -codeDefinition.length
		};
		const finishModuleExecutionInfo = this.startCalculateModuleExecutionInfo(options.filename, codeDefinition.length);
		try {
			const fn = vm.runInThisContext(code, options);
			await fn(...Object.values(context));
		} finally {
			var _this$options$moduleE;
			(_this$options$moduleE = this.options.moduleExecutionInfo) === null || _this$options$moduleE === void 0 || _this$options$moduleE.set(options.filename, finishModuleExecutionInfo());
		}
	}
	/**
	* Starts calculating the module execution info such as the total duration and self time spent on executing the module.
	* Returns a function to call once the module has finished executing.
	*/
	startCalculateModuleExecutionInfo(filename, startOffset) {
		const startTime = this.performanceNow();
		this.executionStack.push({
			filename,
			startTime,
			subImportTime: 0
		});
		return () => {
			const duration = this.performanceNow() - startTime;
			const currentExecution = this.executionStack.pop();
			if (currentExecution == null) throw new Error("Execution stack is empty, this should never happen");
			const selfTime = duration - currentExecution.subImportTime;
			if (this.executionStack.length > 0) this.executionStack.at(-1).subImportTime += duration;
			return {
				startOffset,
				duration,
				selfTime
			};
		};
	}
	prepareContext(context) {
		return context;
	}
	/**
	* Define if a module should be interop-ed
	* This function mostly for the ability to override by subclass
	*/
	shouldInterop(path, mod) {
		if (this.options.interopDefault === false) return false;
		// never interop ESM modules
		// TODO: should also skip for `.js` with `type="module"`
		return !path.endsWith(".mjs") && "default" in mod;
	}
	importExternalModule(path) {
		return import(
			/* @vite-ignore */
			path
);
	}
	/**
	* Import a module and interop it
	*/
	async interopedImport(path) {
		const importedModule = await this.importExternalModule(path);
		if (!this.shouldInterop(path, importedModule)) return importedModule;
		const { mod, defaultExport } = interopModule(importedModule);
		return new Proxy(mod, {
			get(mod, prop) {
				if (prop === "default") return defaultExport;
				return mod[prop] ?? (defaultExport === null || defaultExport === void 0 ? void 0 : defaultExport[prop]);
			},
			has(mod, prop) {
				if (prop === "default") return defaultExport !== void 0;
				return prop in mod || defaultExport && prop in defaultExport;
			},
			getOwnPropertyDescriptor(mod, prop) {
				const descriptor = Reflect.getOwnPropertyDescriptor(mod, prop);
				if (descriptor) return descriptor;
				if (prop === "default" && defaultExport !== void 0) return {
					value: defaultExport,
					enumerable: true,
					configurable: true
				};
			}
		});
	}
}
function interopModule(mod) {
	if (isPrimitive(mod)) return {
		mod: { default: mod },
		defaultExport: mod
	};
	let defaultExport = "default" in mod ? mod.default : mod;
	if (!isPrimitive(defaultExport) && "__esModule" in defaultExport) {
		mod = defaultExport;
		if ("default" in defaultExport) defaultExport = defaultExport.default;
	}
	return {
		mod,
		defaultExport
	};
}
// keep consistency with Vite on how exports are defined
function defineExport(exports, key, value) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		configurable: true,
		get: value
	});
}
function exportAll(exports, sourceModule) {
	// #1120 when a module exports itself it causes
	// call stack error
	if (exports === sourceModule) return;
	if (isPrimitive(sourceModule) || Array.isArray(sourceModule) || sourceModule instanceof Promise) return;
	for (const key in sourceModule) if (key !== "default" && !(key in exports)) try {
		defineExport(exports, key, () => sourceModule[key]);
	} catch {}
}

export { DEFAULT_REQUEST_STUBS, ModuleCacheMap, ViteNodeRunner };
