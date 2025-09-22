// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import * as PermissionsAPI from "./permissions.mjs";
import { Permissions, } from "./permissions.mjs";
export class Checkpoints extends APIResource {
    constructor() {
        super(...arguments);
        this.permissions = new PermissionsAPI.Permissions(this._client);
    }
}
Checkpoints.Permissions = Permissions;
//# sourceMappingURL=checkpoints.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import { CursorPage } from "../../../core/pagination.mjs";
import { path } from "../../../internal/utils/path.mjs";
export class Checkpoints extends APIResource {
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
        return this._client.getAPIList(path `/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, (CursorPage), { query, ...options });
    }
}
//# sourceMappingURL=checkpoints.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import * as PermissionsAPI from "./permissions.mjs";
import { Permissions, } from "./permissions.mjs";
export class Checkpoints extends APIResource {
    constructor() {
        super(...arguments);
        this.permissions = new PermissionsAPI.Permissions(this._client);
    }
}
Checkpoints.Permissions = Permissions;
//# sourceMappingURL=checkpoints.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
export * from "./checkpoints/index.mjs";
//# sourceMappingURL=checkpoints.mjs.map

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import { CursorPage } from "../../../core/pagination.mjs";
import { path } from "../../../internal/utils/path.mjs";
export class Checkpoints extends APIResource {
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
        return this._client.getAPIList(path `/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, (CursorPage), { query, ...options });
    }
}
//# sourceMappingURL=checkpoints.mjs.map