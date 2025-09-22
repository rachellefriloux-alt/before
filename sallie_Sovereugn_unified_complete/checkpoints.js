"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkpoints = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const resource_1 = require("../../../core/resource.js");
const PermissionsAPI = tslib_1.__importStar(require("./permissions.js"));
const permissions_1 = require("./permissions.js");
class Checkpoints extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.permissions = new PermissionsAPI.Permissions(this._client);
    }
}
exports.Checkpoints = Checkpoints;
Checkpoints.Permissions = permissions_1.Permissions;
//# sourceMappingURL=checkpoints.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkpoints = void 0;
const resource_1 = require("../../../core/resource.js");
const pagination_1 = require("../../../core/pagination.js");
const path_1 = require("../../../internal/utils/path.js");
class Checkpoints extends resource_1.APIResource {
    /**
     * List checkpoints for a fine-tuning job.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
     *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(fineTuningJobID, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, (pagination_1.CursorPage), { query, ...options });
    }
}
exports.Checkpoints = Checkpoints;
//# sourceMappingURL=checkpoints.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkpoints = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const resource_1 = require("../../../core/resource.js");
const PermissionsAPI = tslib_1.__importStar(require("./permissions.js"));
const permissions_1 = require("./permissions.js");
class Checkpoints extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.permissions = new PermissionsAPI.Permissions(this._client);
    }
}
exports.Checkpoints = Checkpoints;
Checkpoints.Permissions = permissions_1.Permissions;
//# sourceMappingURL=checkpoints.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("../../internal/tslib.js");
tslib_1.__exportStar(require("./checkpoints/index.js"), exports);
//# sourceMappingURL=checkpoints.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkpoints = void 0;
const resource_1 = require("../../../core/resource.js");
const pagination_1 = require("../../../core/pagination.js");
const path_1 = require("../../../internal/utils/path.js");
class Checkpoints extends resource_1.APIResource {
    /**
     * List checkpoints for a fine-tuning job.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
     *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(fineTuningJobID, query = {}, options) {
        return this._client.getAPIList((0, path_1.path) `/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, (pagination_1.CursorPage), { query, ...options });
    }
}
exports.Checkpoints = Checkpoints;
//# sourceMappingURL=checkpoints.js.map