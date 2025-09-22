"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRealtimeWS = void 0;
const tslib_1 = require("../../internal/tslib.js");
const WS = tslib_1.__importStar(require("ws"));
const index_1 = require("../../index.js");
const internal_base_1 = require("./internal-base.js");
class OpenAIRealtimeWS extends internal_base_1.OpenAIRealtimeEmitter {
    constructor(props, client) {
        super();
        client ?? (client = new index_1.OpenAI());
        this.url = (0, internal_base_1.buildRealtimeURL)(client, props.model);
        this.socket = new WS.WebSocket(this.url, {
            ...props.options,
            headers: {
                ...props.options?.headers,
                ...((0, internal_base_1.isAzure)(client) ? {} : { Authorization: `Bearer ${client.apiKey}` }),
                'OpenAI-Beta': 'realtime=v1',
            },
        });
        this.socket.on('message', (wsEvent) => {
            const event = (() => {
                try {
                    return JSON.parse(wsEvent.toString());
                }
                catch (err) {
                    this._onError(null, 'could not parse websocket event', err);
                    return null;
                }
            })();
            if (event) {
                this._emit('event', event);
                if (event.type === 'error') {
                    this._onError(event);
                }
                else {
                    // @ts-expect-error TS isn't smart enough to get the relationship right here
                    this._emit(event.type, event);
                }
            }
        });
        this.socket.on('error', (err) => {
            this._onError(null, err.message, err);
        });
    }
    static async azure(client, options = {}) {
        const deploymentName = options.deploymentName ?? client.deploymentName;
        if (!deploymentName) {
            throw new Error('No deployment name provided');
        }
        return new OpenAIRealtimeWS({ model: deploymentName, options: { headers: await getAzureHeaders(client) } }, client);
    }
    send(event) {
        try {
            this.socket.send(JSON.stringify(event));
        }
        catch (err) {
            this._onError(null, 'could not send data', err);
        }
    }
    close(props) {
        try {
            this.socket.close(props?.code ?? 1000, props?.reason ?? 'OK');
        }
        catch (err) {
            this._onError(null, 'could not close the connection', err);
        }
    }
}
exports.OpenAIRealtimeWS = OpenAIRealtimeWS;
async function getAzureHeaders(client) {
    if (client.apiKey !== '<Missing Key>') {
        return { 'api-key': client.apiKey };
    }
    else {
        const token = await client._getAzureADToken();
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        else {
            throw new Error('AzureOpenAI is not instantiated correctly. No API key or token provided.');
        }
    }
}
//# sourceMappingURL=ws.js.map

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRealtimeWS = void 0;
const tslib_1 = require("../../internal/tslib.js");
const WS = tslib_1.__importStar(require("ws"));
const index_1 = require("../../index.js");
const internal_base_1 = require("./internal-base.js");
class OpenAIRealtimeWS extends internal_base_1.OpenAIRealtimeEmitter {
    constructor(props, client) {
        super();
        client ?? (client = new index_1.OpenAI());
        this.url = (0, internal_base_1.buildRealtimeURL)(client, props.model);
        this.socket = new WS.WebSocket(this.url, {
            ...props.options,
            headers: {
                ...props.options?.headers,
                ...((0, internal_base_1.isAzure)(client) ? {} : { Authorization: `Bearer ${client.apiKey}` }),
                'OpenAI-Beta': 'realtime=v1',
            },
        });
        this.socket.on('message', (wsEvent) => {
            const event = (() => {
                try {
                    return JSON.parse(wsEvent.toString());
                }
                catch (err) {
                    this._onError(null, 'could not parse websocket event', err);
                    return null;
                }
            })();
            if (event) {
                this._emit('event', event);
                if (event.type === 'error') {
                    this._onError(event);
                }
                else {
                    // @ts-expect-error TS isn't smart enough to get the relationship right here
                    this._emit(event.type, event);
                }
            }
        });
        this.socket.on('error', (err) => {
            this._onError(null, err.message, err);
        });
    }
    static async azure(client, options = {}) {
        const deploymentName = options.deploymentName ?? client.deploymentName;
        if (!deploymentName) {
            throw new Error('No deployment name provided');
        }
        return new OpenAIRealtimeWS({ model: deploymentName, options: { headers: await getAzureHeaders(client) } }, client);
    }
    send(event) {
        try {
            this.socket.send(JSON.stringify(event));
        }
        catch (err) {
            this._onError(null, 'could not send data', err);
        }
    }
    close(props) {
        try {
            this.socket.close(props?.code ?? 1000, props?.reason ?? 'OK');
        }
        catch (err) {
            this._onError(null, 'could not close the connection', err);
        }
    }
}
exports.OpenAIRealtimeWS = OpenAIRealtimeWS;
async function getAzureHeaders(client) {
    if (client.apiKey !== '<Missing Key>') {
        return { 'api-key': client.apiKey };
    }
    else {
        const token = await client._getAzureADToken();
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        else {
            throw new Error('AzureOpenAI is not instantiated correctly. No API key or token provided.');
        }
    }
}
//# sourceMappingURL=ws.js.map

function isSecure(wsComponents) {
    return typeof wsComponents.secure === 'boolean' ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
}
//RFC 6455
const handler = {
    scheme: "ws",
    domainHost: true,
    parse: function (components, options) {
        const wsComponents = components;
        //indicate if the secure flag is set
        wsComponents.secure = isSecure(wsComponents);
        //construct resouce name
        wsComponents.resourceName = (wsComponents.path || '/') + (wsComponents.query ? '?' + wsComponents.query : '');
        wsComponents.path = undefined;
        wsComponents.query = undefined;
        return wsComponents;
    },
    serialize: function (wsComponents, options) {
        //normalize the default port
        if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
            wsComponents.port = undefined;
        }
        //ensure scheme matches secure flag
        if (typeof wsComponents.secure === 'boolean') {
            wsComponents.scheme = (wsComponents.secure ? 'wss' : 'ws');
            wsComponents.secure = undefined;
        }
        //reconstruct path from resource name
        if (wsComponents.resourceName) {
            const [path, query] = wsComponents.resourceName.split('?');
            wsComponents.path = (path && path !== '/' ? path : undefined);
            wsComponents.query = query;
            wsComponents.resourceName = undefined;
        }
        //forbid fragment component
        wsComponents.fragment = undefined;
        return wsComponents;
    }
};
export default handler;
//# sourceMappingURL=ws.js.map