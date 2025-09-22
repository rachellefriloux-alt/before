"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
const inverted = Symbol('inverted');
/**
 * @internal
 */
const expectNull = Symbol('expectNull');
/**
 * @internal
 */
const expectUndefined = Symbol('expectUndefined');
/**
 * @internal
 */
const expectNumber = Symbol('expectNumber');
/**
 * @internal
 */
const expectString = Symbol('expectString');
/**
 * @internal
 */
const expectBoolean = Symbol('expectBoolean');
/**
 * @internal
 */
const expectVoid = Symbol('expectVoid');
/**
 * @internal
 */
const expectFunction = Symbol('expectFunction');
/**
 * @internal
 */
const expectObject = Symbol('expectObject');
/**
 * @internal
 */
const expectArray = Symbol('expectArray');
/**
 * @internal
 */
const expectSymbol = Symbol('expectSymbol');
/**
 * @internal
 */
const expectAny = Symbol('expectAny');
/**
 * @internal
 */
const expectUnknown = Symbol('expectUnknown');
/**
 * @internal
 */
const expectNever = Symbol('expectNever');
/**
 * @internal
 */
const expectNullable = Symbol('expectNullable');
/**
 * @internal
 */
const expectBigInt = Symbol('expectBigInt');


"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const resource_1 = require("../../../core/resource.js");
const pagination_1 = require("../../../core/pagination.js");
const headers_1 = require("../../../internal/headers.js");
const path_1 = require("../../../internal/utils/path.js");
/**
 * @deprecated The Assistants API is deprecated in favor of the Responses API
 */
class Messages extends resource_1.APIResource {
    /**
     * Create a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    create(threadID, body, options) {
        return this._client.post((0, path_1.path) `/threads/${threadID}/messages`, {
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Retrieve a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    retrieve(messageID, params, options) {
        const { thread_id } = params;
        return this._client.get((0, path_1.path) `/threads/${thread_id}/messages/${messageID}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Modifies a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    update(messageID, params, options) {
        const { thread_id, ...body } = params;
        return this._client.post((0, path_1.path) `/threads/${thread_id}/messages/${messageID}`, {
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Returns a list of messages for a given thread.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    list(threadID, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/threads/${threadID}/messages`, (pagination_1.CursorPage), {
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Deletes a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    delete(messageID, params, options) {
        const { thread_id } = params;
        return this._client.delete((0, path_1.path) `/threads/${thread_id}/messages/${messageID}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
}
exports.Messages = Messages;
//# sourceMappingURL=messages.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const resource_1 = require("../../../core/resource.js");
const pagination_1 = require("../../../core/pagination.js");
const path_1 = require("../../../internal/utils/path.js");
class Messages extends resource_1.APIResource {
    /**
     * Get the messages in a stored chat completion. Only Chat Completions that have
     * been created with the `store` parameter set to `true` will be returned.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
     *   'completion_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(completionID, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/chat/completions/${completionID}/messages`, (pagination_1.CursorPage), { query, ...options });
    }
}
exports.Messages = Messages;
//# sourceMappingURL=messages.js.map

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
const inverted = Symbol('inverted');
/**
 * @internal
 */
const expectNull = Symbol('expectNull');
/**
 * @internal
 */
const expectUndefined = Symbol('expectUndefined');
/**
 * @internal
 */
const expectNumber = Symbol('expectNumber');
/**
 * @internal
 */
const expectString = Symbol('expectString');
/**
 * @internal
 */
const expectBoolean = Symbol('expectBoolean');
/**
 * @internal
 */
const expectVoid = Symbol('expectVoid');
/**
 * @internal
 */
const expectFunction = Symbol('expectFunction');
/**
 * @internal
 */
const expectObject = Symbol('expectObject');
/**
 * @internal
 */
const expectArray = Symbol('expectArray');
/**
 * @internal
 */
const expectSymbol = Symbol('expectSymbol');
/**
 * @internal
 */
const expectAny = Symbol('expectAny');
/**
 * @internal
 */
const expectUnknown = Symbol('expectUnknown');
/**
 * @internal
 */
const expectNever = Symbol('expectNever');
/**
 * @internal
 */
const expectNullable = Symbol('expectNullable');
/**
 * @internal
 */
const expectBigInt = Symbol('expectBigInt');


"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const resource_1 = require("../../../core/resource.js");
const pagination_1 = require("../../../core/pagination.js");
const headers_1 = require("../../../internal/headers.js");
const path_1 = require("../../../internal/utils/path.js");
/**
 * @deprecated The Assistants API is deprecated in favor of the Responses API
 */
class Messages extends resource_1.APIResource {
    /**
     * Create a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    create(threadID, body, options) {
        return this._client.post((0, path_1.path) `/threads/${threadID}/messages`, {
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Retrieve a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    retrieve(messageID, params, options) {
        const { thread_id } = params;
        return this._client.get((0, path_1.path) `/threads/${thread_id}/messages/${messageID}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Modifies a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    update(messageID, params, options) {
        const { thread_id, ...body } = params;
        return this._client.post((0, path_1.path) `/threads/${thread_id}/messages/${messageID}`, {
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Returns a list of messages for a given thread.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    list(threadID, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/threads/${threadID}/messages`, (pagination_1.CursorPage), {
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
    /**
     * Deletes a message.
     *
     * @deprecated The Assistants API is deprecated in favor of the Responses API
     */
    delete(messageID, params, options) {
        const { thread_id } = params;
        return this._client.delete((0, path_1.path) `/threads/${thread_id}/messages/${messageID}`, {
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'assistants=v2' }, options?.headers]),
        });
    }
}
exports.Messages = Messages;
//# sourceMappingURL=messages.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const resource_1 = require("../../../core/resource.js");
const pagination_1 = require("../../../core/pagination.js");
const path_1 = require("../../../internal/utils/path.js");
class Messages extends resource_1.APIResource {
    /**
     * Get the messages in a stored chat completion. Only Chat Completions that have
     * been created with the `store` parameter set to `true` will be returned.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
     *   'completion_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(completionID, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/chat/completions/${completionID}/messages`, (pagination_1.CursorPage), { query, ...options });
    }
}
exports.Messages = Messages;
//# sourceMappingURL=messages.js.map