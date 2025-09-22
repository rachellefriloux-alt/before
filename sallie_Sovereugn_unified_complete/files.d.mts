import { APIResource } from "../../../core/resource.mjs";
import * as ContentAPI from "./content.mjs";
import { Content, ContentRetrieveParams } from "./content.mjs";
import { APIPromise } from "../../../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise } from "../../../core/pagination.mjs";
import { type Uploadable } from "../../../core/uploads.mjs";
import { RequestOptions } from "../../../internal/request-options.mjs";
export declare class Files extends APIResource {
    content: ContentAPI.Content;
    /**
     * Create a Container File
     *
     * You can send either a multipart/form-data request with the raw file content, or
     * a JSON request with a file ID.
     */
    create(containerID: string, body: FileCreateParams, options?: RequestOptions): APIPromise<FileCreateResponse>;
    /**
     * Retrieve Container File
     */
    retrieve(fileID: string, params: FileRetrieveParams, options?: RequestOptions): APIPromise<FileRetrieveResponse>;
    /**
     * List Container files
     */
    list(containerID: string, query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<FileListResponsesPage, FileListResponse>;
    /**
     * Delete Container File
     */
    delete(fileID: string, params: FileDeleteParams, options?: RequestOptions): APIPromise<void>;
}
export type FileListResponsesPage = CursorPage<FileListResponse>;
export interface FileCreateResponse {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * Size of the file in bytes.
     */
    bytes: number;
    /**
     * The container this file belongs to.
     */
    container_id: string;
    /**
     * Unix timestamp (in seconds) when the file was created.
     */
    created_at: number;
    /**
     * The type of this object (`container.file`).
     */
    object: 'container.file';
    /**
     * Path of the file in the container.
     */
    path: string;
    /**
     * Source of the file (e.g., `user`, `assistant`).
     */
    source: string;
}
export interface FileRetrieveResponse {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * Size of the file in bytes.
     */
    bytes: number;
    /**
     * The container this file belongs to.
     */
    container_id: string;
    /**
     * Unix timestamp (in seconds) when the file was created.
     */
    created_at: number;
    /**
     * The type of this object (`container.file`).
     */
    object: 'container.file';
    /**
     * Path of the file in the container.
     */
    path: string;
    /**
     * Source of the file (e.g., `user`, `assistant`).
     */
    source: string;
}
export interface FileListResponse {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * Size of the file in bytes.
     */
    bytes: number;
    /**
     * The container this file belongs to.
     */
    container_id: string;
    /**
     * Unix timestamp (in seconds) when the file was created.
     */
    created_at: number;
    /**
     * The type of this object (`container.file`).
     */
    object: 'container.file';
    /**
     * Path of the file in the container.
     */
    path: string;
    /**
     * Source of the file (e.g., `user`, `assistant`).
     */
    source: string;
}
export interface FileCreateParams {
    /**
     * The File object (not file name) to be uploaded.
     */
    file?: Uploadable;
    /**
     * Name of the file to create.
     */
    file_id?: string;
}
export interface FileRetrieveParams {
    container_id: string;
}
export interface FileListParams extends CursorPageParams {
    /**
     * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
     * order and `desc` for descending order.
     */
    order?: 'asc' | 'desc';
}
export interface FileDeleteParams {
    container_id: string;
}
export declare namespace Files {
    export { type FileCreateResponse as FileCreateResponse, type FileRetrieveResponse as FileRetrieveResponse, type FileListResponse as FileListResponse, type FileListResponsesPage as FileListResponsesPage, type FileCreateParams as FileCreateParams, type FileRetrieveParams as FileRetrieveParams, type FileListParams as FileListParams, type FileDeleteParams as FileDeleteParams, };
    export { Content as Content, type ContentRetrieveParams as ContentRetrieveParams };
}
//# sourceMappingURL=files.d.mts.map

export * from "./files/index.mjs";
//# sourceMappingURL=files.d.mts.map

import { APIResource } from "../core/resource.mjs";
import { APIPromise } from "../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise } from "../core/pagination.mjs";
import { type Uploadable } from "../core/uploads.mjs";
import { RequestOptions } from "../internal/request-options.mjs";
export declare class Files extends APIResource {
    /**
     * Upload a file that can be used across various endpoints. Individual files can be
     * up to 512 MB, and the size of all files uploaded by one organization can be up
     * to 1 TB.
     *
     * The Assistants API supports files up to 2 million tokens and of specific file
     * types. See the
     * [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools) for
     * details.
     *
     * The Fine-tuning API only supports `.jsonl` files. The input also has certain
     * required formats for fine-tuning
     * [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input) or
     * [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
     * models.
     *
     * The Batch API only supports `.jsonl` files up to 200 MB in size. The input also
     * has a specific required
     * [format](https://platform.openai.com/docs/api-reference/batch/request-input).
     *
     * Please [contact us](https://help.openai.com/) if you need to increase these
     * storage limits.
     */
    create(body: FileCreateParams, options?: RequestOptions): APIPromise<FileObject>;
    /**
     * Returns information about a specific file.
     */
    retrieve(fileID: string, options?: RequestOptions): APIPromise<FileObject>;
    /**
     * Returns a list of files.
     */
    list(query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<FileObjectsPage, FileObject>;
    /**
     * Delete a file.
     */
    delete(fileID: string, options?: RequestOptions): APIPromise<FileDeleted>;
    /**
     * Returns the contents of the specified file.
     */
    content(fileID: string, options?: RequestOptions): APIPromise<Response>;
    /**
     * Waits for the given file to be processed, default timeout is 30 mins.
     */
    waitForProcessing(id: string, { pollInterval, maxWait }?: {
        pollInterval?: number;
        maxWait?: number;
    }): Promise<FileObject>;
}
export type FileObjectsPage = CursorPage<FileObject>;
export type FileContent = string;
export interface FileDeleted {
    id: string;
    deleted: boolean;
    object: 'file';
}
/**
 * The `File` object represents a document that has been uploaded to OpenAI.
 */
export interface FileObject {
    /**
     * The file identifier, which can be referenced in the API endpoints.
     */
    id: string;
    /**
     * The size of the file, in bytes.
     */
    bytes: number;
    /**
     * The Unix timestamp (in seconds) for when the file was created.
     */
    created_at: number;
    /**
     * The name of the file.
     */
    filename: string;
    /**
     * The object type, which is always `file`.
     */
    object: 'file';
    /**
     * The intended purpose of the file. Supported values are `assistants`,
     * `assistants_output`, `batch`, `batch_output`, `fine-tune`, `fine-tune-results`,
     * `vision`, and `user_data`.
     */
    purpose: 'assistants' | 'assistants_output' | 'batch' | 'batch_output' | 'fine-tune' | 'fine-tune-results' | 'vision' | 'user_data';
    /**
     * @deprecated Deprecated. The current status of the file, which can be either
     * `uploaded`, `processed`, or `error`.
     */
    status: 'uploaded' | 'processed' | 'error';
    /**
     * The Unix timestamp (in seconds) for when the file will expire.
     */
    expires_at?: number;
    /**
     * @deprecated Deprecated. For details on why a fine-tuning training file failed
     * validation, see the `error` field on `fine_tuning.job`.
     */
    status_details?: string;
}
/**
 * The intended purpose of the uploaded file. One of: - `assistants`: Used in the
 * Assistants API - `batch`: Used in the Batch API - `fine-tune`: Used for
 * fine-tuning - `vision`: Images used for vision fine-tuning - `user_data`:
 * Flexible file type for any purpose - `evals`: Used for eval data sets
 */
export type FilePurpose = 'assistants' | 'batch' | 'fine-tune' | 'vision' | 'user_data' | 'evals';
export interface FileCreateParams {
    /**
     * The File object (not file name) to be uploaded.
     */
    file: Uploadable;
    /**
     * The intended purpose of the uploaded file. One of: - `assistants`: Used in the
     * Assistants API - `batch`: Used in the Batch API - `fine-tune`: Used for
     * fine-tuning - `vision`: Images used for vision fine-tuning - `user_data`:
     * Flexible file type for any purpose - `evals`: Used for eval data sets
     */
    purpose: FilePurpose;
    /**
     * The expiration policy for a file. By default, files with `purpose=batch` expire
     * after 30 days and all other files are persisted until they are manually deleted.
     */
    expires_after?: FileCreateParams.ExpiresAfter;
}
export declare namespace FileCreateParams {
    /**
     * The expiration policy for a file. By default, files with `purpose=batch` expire
     * after 30 days and all other files are persisted until they are manually deleted.
     */
    interface ExpiresAfter {
        /**
         * Anchor timestamp after which the expiration policy applies. Supported anchors:
         * `created_at`.
         */
        anchor: 'created_at';
        /**
         * The number of seconds after the anchor time that the file will expire. Must be
         * between 3600 (1 hour) and 2592000 (30 days).
         */
        seconds: number;
    }
}
export interface FileListParams extends CursorPageParams {
    /**
     * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
     * order and `desc` for descending order.
     */
    order?: 'asc' | 'desc';
    /**
     * Only return files with the given purpose.
     */
    purpose?: string;
}
export declare namespace Files {
    export { type FileContent as FileContent, type FileDeleted as FileDeleted, type FileObject as FileObject, type FilePurpose as FilePurpose, type FileObjectsPage as FileObjectsPage, type FileCreateParams as FileCreateParams, type FileListParams as FileListParams, };
}
//# sourceMappingURL=files.d.mts.map

import { APIResource } from "../../core/resource.mjs";
import * as VectorStoresAPI from "./vector-stores.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise, Page } from "../../core/pagination.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
import { Uploadable } from "../../uploads.mjs";
export declare class Files extends APIResource {
    /**
     * Create a vector store file by attaching a
     * [File](https://platform.openai.com/docs/api-reference/files) to a
     * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
     */
    create(vectorStoreID: string, body: FileCreateParams, options?: RequestOptions): APIPromise<VectorStoreFile>;
    /**
     * Retrieves a vector store file.
     */
    retrieve(fileID: string, params: FileRetrieveParams, options?: RequestOptions): APIPromise<VectorStoreFile>;
    /**
     * Update attributes on a vector store file.
     */
    update(fileID: string, params: FileUpdateParams, options?: RequestOptions): APIPromise<VectorStoreFile>;
    /**
     * Returns a list of vector store files.
     */
    list(vectorStoreID: string, query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<VectorStoreFilesPage, VectorStoreFile>;
    /**
     * Delete a vector store file. This will remove the file from the vector store but
     * the file itself will not be deleted. To delete the file, use the
     * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
     * endpoint.
     */
    delete(fileID: string, params: FileDeleteParams, options?: RequestOptions): APIPromise<VectorStoreFileDeleted>;
    /**
     * Attach a file to the given vector store and wait for it to be processed.
     */
    createAndPoll(vectorStoreId: string, body: FileCreateParams, options?: RequestOptions & {
        pollIntervalMs?: number;
    }): Promise<VectorStoreFile>;
    /**
     * Wait for the vector store file to finish processing.
     *
     * Note: this will return even if the file failed to process, you need to check
     * file.last_error and file.status to handle these cases
     */
    poll(vectorStoreID: string, fileID: string, options?: RequestOptions & {
        pollIntervalMs?: number;
    }): Promise<VectorStoreFile>;
    /**
     * Upload a file to the `files` API and then attach it to the given vector store.
     *
     * Note the file will be asynchronously processed (you can use the alternative
     * polling helper method to wait for processing to complete).
     */
    upload(vectorStoreId: string, file: Uploadable, options?: RequestOptions): Promise<VectorStoreFile>;
    /**
     * Add a file to a vector store and poll until processing is complete.
     */
    uploadAndPoll(vectorStoreId: string, file: Uploadable, options?: RequestOptions & {
        pollIntervalMs?: number;
    }): Promise<VectorStoreFile>;
    /**
     * Retrieve the parsed contents of a vector store file.
     */
    content(fileID: string, params: FileContentParams, options?: RequestOptions): PagePromise<FileContentResponsesPage, FileContentResponse>;
}
export type VectorStoreFilesPage = CursorPage<VectorStoreFile>;
export type FileContentResponsesPage = Page<FileContentResponse>;
/**
 * A list of files attached to a vector store.
 */
export interface VectorStoreFile {
    /**
     * The identifier, which can be referenced in API endpoints.
     */
    id: string;
    /**
     * The Unix timestamp (in seconds) for when the vector store file was created.
     */
    created_at: number;
    /**
     * The last error associated with this vector store file. Will be `null` if there
     * are no errors.
     */
    last_error: VectorStoreFile.LastError | null;
    /**
     * The object type, which is always `vector_store.file`.
     */
    object: 'vector_store.file';
    /**
     * The status of the vector store file, which can be either `in_progress`,
     * `completed`, `cancelled`, or `failed`. The status `completed` indicates that the
     * vector store file is ready for use.
     */
    status: 'in_progress' | 'completed' | 'cancelled' | 'failed';
    /**
     * The total vector store usage in bytes. Note that this may be different from the
     * original file size.
     */
    usage_bytes: number;
    /**
     * The ID of the
     * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object)
     * that the [File](https://platform.openai.com/docs/api-reference/files) is
     * attached to.
     */
    vector_store_id: string;
    /**
     * Set of 16 key-value pairs that can be attached to an object. This can be useful
     * for storing additional information about the object in a structured format, and
     * querying for objects via API or the dashboard. Keys are strings with a maximum
     * length of 64 characters. Values are strings with a maximum length of 512
     * characters, booleans, or numbers.
     */
    attributes?: {
        [key: string]: string | number | boolean;
    } | null;
    /**
     * The strategy used to chunk the file.
     */
    chunking_strategy?: VectorStoresAPI.FileChunkingStrategy;
}
export declare namespace VectorStoreFile {
    /**
     * The last error associated with this vector store file. Will be `null` if there
     * are no errors.
     */
    interface LastError {
        /**
         * One of `server_error` or `rate_limit_exceeded`.
         */
        code: 'server_error' | 'unsupported_file' | 'invalid_file';
        /**
         * A human-readable description of the error.
         */
        message: string;
    }
}
export interface VectorStoreFileDeleted {
    id: string;
    deleted: boolean;
    object: 'vector_store.file.deleted';
}
export interface FileContentResponse {
    /**
     * The text content
     */
    text?: string;
    /**
     * The content type (currently only `"text"`)
     */
    type?: string;
}
export interface FileCreateParams {
    /**
     * A [File](https://platform.openai.com/docs/api-reference/files) ID that the
     * vector store should use. Useful for tools like `file_search` that can access
     * files.
     */
    file_id: string;
    /**
     * Set of 16 key-value pairs that can be attached to an object. This can be useful
     * for storing additional information about the object in a structured format, and
     * querying for objects via API or the dashboard. Keys are strings with a maximum
     * length of 64 characters. Values are strings with a maximum length of 512
     * characters, booleans, or numbers.
     */
    attributes?: {
        [key: string]: string | number | boolean;
    } | null;
    /**
     * The chunking strategy used to chunk the file(s). If not set, will use the `auto`
     * strategy. Only applicable if `file_ids` is non-empty.
     */
    chunking_strategy?: VectorStoresAPI.FileChunkingStrategyParam;
}
export interface FileRetrieveParams {
    /**
     * The ID of the vector store that the file belongs to.
     */
    vector_store_id: string;
}
export interface FileUpdateParams {
    /**
     * Path param: The ID of the vector store the file belongs to.
     */
    vector_store_id: string;
    /**
     * Body param: Set of 16 key-value pairs that can be attached to an object. This
     * can be useful for storing additional information about the object in a
     * structured format, and querying for objects via API or the dashboard. Keys are
     * strings with a maximum length of 64 characters. Values are strings with a
     * maximum length of 512 characters, booleans, or numbers.
     */
    attributes: {
        [key: string]: string | number | boolean;
    } | null;
}
export interface FileListParams extends CursorPageParams {
    /**
     * A cursor for use in pagination. `before` is an object ID that defines your place
     * in the list. For instance, if you make a list request and receive 100 objects,
     * starting with obj_foo, your subsequent call can include before=obj_foo in order
     * to fetch the previous page of the list.
     */
    before?: string;
    /**
     * Filter by file status. One of `in_progress`, `completed`, `failed`, `cancelled`.
     */
    filter?: 'in_progress' | 'completed' | 'failed' | 'cancelled';
    /**
     * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
     * order and `desc` for descending order.
     */
    order?: 'asc' | 'desc';
}
export interface FileDeleteParams {
    /**
     * The ID of the vector store that the file belongs to.
     */
    vector_store_id: string;
}
export interface FileContentParams {
    /**
     * The ID of the vector store.
     */
    vector_store_id: string;
}
export declare namespace Files {
    export { type VectorStoreFile as VectorStoreFile, type VectorStoreFileDeleted as VectorStoreFileDeleted, type FileContentResponse as FileContentResponse, type VectorStoreFilesPage as VectorStoreFilesPage, type FileContentResponsesPage as FileContentResponsesPage, type FileCreateParams as FileCreateParams, type FileRetrieveParams as FileRetrieveParams, type FileUpdateParams as FileUpdateParams, type FileListParams as FileListParams, type FileDeleteParams as FileDeleteParams, type FileContentParams as FileContentParams, };
}
//# sourceMappingURL=files.d.mts.map

import { APIResource } from "../../../core/resource.mjs";
import * as ContentAPI from "./content.mjs";
import { Content, ContentRetrieveParams } from "./content.mjs";
import { APIPromise } from "../../../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise } from "../../../core/pagination.mjs";
import { type Uploadable } from "../../../core/uploads.mjs";
import { RequestOptions } from "../../../internal/request-options.mjs";
export declare class Files extends APIResource {
    content: ContentAPI.Content;
    /**
     * Create a Container File
     *
     * You can send either a multipart/form-data request with the raw file content, or
     * a JSON request with a file ID.
     */
    create(containerID: string, body: FileCreateParams, options?: RequestOptions): APIPromise<FileCreateResponse>;
    /**
     * Retrieve Container File
     */
    retrieve(fileID: string, params: FileRetrieveParams, options?: RequestOptions): APIPromise<FileRetrieveResponse>;
    /**
     * List Container files
     */
    list(containerID: string, query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<FileListResponsesPage, FileListResponse>;
    /**
     * Delete Container File
     */
    delete(fileID: string, params: FileDeleteParams, options?: RequestOptions): APIPromise<void>;
}
export type FileListResponsesPage = CursorPage<FileListResponse>;
export interface FileCreateResponse {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * Size of the file in bytes.
     */
    bytes: number;
    /**
     * The container this file belongs to.
     */
    container_id: string;
    /**
     * Unix timestamp (in seconds) when the file was created.
     */
    created_at: number;
    /**
     * The type of this object (`container.file`).
     */
    object: 'container.file';
    /**
     * Path of the file in the container.
     */
    path: string;
    /**
     * Source of the file (e.g., `user`, `assistant`).
     */
    source: string;
}
export interface FileRetrieveResponse {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * Size of the file in bytes.
     */
    bytes: number;
    /**
     * The container this file belongs to.
     */
    container_id: string;
    /**
     * Unix timestamp (in seconds) when the file was created.
     */
    created_at: number;
    /**
     * The type of this object (`container.file`).
     */
    object: 'container.file';
    /**
     * Path of the file in the container.
     */
    path: string;
    /**
     * Source of the file (e.g., `user`, `assistant`).
     */
    source: string;
}
export interface FileListResponse {
    /**
     * Unique identifier for the file.
     */
    id: string;
    /**
     * Size of the file in bytes.
     */
    bytes: number;
    /**
     * The container this file belongs to.
     */
    container_id: string;
    /**
     * Unix timestamp (in seconds) when the file was created.
     */
    created_at: number;
    /**
     * The type of this object (`container.file`).
     */
    object: 'container.file';
    /**
     * Path of the file in the container.
     */
    path: string;
    /**
     * Source of the file (e.g., `user`, `assistant`).
     */
    source: string;
}
export interface FileCreateParams {
    /**
     * The File object (not file name) to be uploaded.
     */
    file?: Uploadable;
    /**
     * Name of the file to create.
     */
    file_id?: string;
}
export interface FileRetrieveParams {
    container_id: string;
}
export interface FileListParams extends CursorPageParams {
    /**
     * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
     * order and `desc` for descending order.
     */
    order?: 'asc' | 'desc';
}
export interface FileDeleteParams {
    container_id: string;
}
export declare namespace Files {
    export { type FileCreateResponse as FileCreateResponse, type FileRetrieveResponse as FileRetrieveResponse, type FileListResponse as FileListResponse, type FileListResponsesPage as FileListResponsesPage, type FileCreateParams as FileCreateParams, type FileRetrieveParams as FileRetrieveParams, type FileListParams as FileListParams, type FileDeleteParams as FileDeleteParams, };
    export { Content as Content, type ContentRetrieveParams as ContentRetrieveParams };
}
//# sourceMappingURL=files.d.mts.map

export * from "./files/index.mjs";
//# sourceMappingURL=files.d.mts.map

import { APIResource } from "../core/resource.mjs";
import { APIPromise } from "../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise } from "../core/pagination.mjs";
import { type Uploadable } from "../core/uploads.mjs";
import { RequestOptions } from "../internal/request-options.mjs";
export declare class Files extends APIResource {
    /**
     * Upload a file that can be used across various endpoints. Individual files can be
     * up to 512 MB, and the size of all files uploaded by one organization can be up
     * to 1 TB.
     *
     * The Assistants API supports files up to 2 million tokens and of specific file
     * types. See the
     * [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools) for
     * details.
     *
     * The Fine-tuning API only supports `.jsonl` files. The input also has certain
     * required formats for fine-tuning
     * [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input) or
     * [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
     * models.
     *
     * The Batch API only supports `.jsonl` files up to 200 MB in size. The input also
     * has a specific required
     * [format](https://platform.openai.com/docs/api-reference/batch/request-input).
     *
     * Please [contact us](https://help.openai.com/) if you need to increase these
     * storage limits.
     */
    create(body: FileCreateParams, options?: RequestOptions): APIPromise<FileObject>;
    /**
     * Returns information about a specific file.
     */
    retrieve(fileID: string, options?: RequestOptions): APIPromise<FileObject>;
    /**
     * Returns a list of files.
     */
    list(query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<FileObjectsPage, FileObject>;
    /**
     * Delete a file.
     */
    delete(fileID: string, options?: RequestOptions): APIPromise<FileDeleted>;
    /**
     * Returns the contents of the specified file.
     */
    content(fileID: string, options?: RequestOptions): APIPromise<Response>;
    /**
     * Waits for the given file to be processed, default timeout is 30 mins.
     */
    waitForProcessing(id: string, { pollInterval, maxWait }?: {
        pollInterval?: number;
        maxWait?: number;
    }): Promise<FileObject>;
}
export type FileObjectsPage = CursorPage<FileObject>;
export type FileContent = string;
export interface FileDeleted {
    id: string;
    deleted: boolean;
    object: 'file';
}
/**
 * The `File` object represents a document that has been uploaded to OpenAI.
 */
export interface FileObject {
    /**
     * The file identifier, which can be referenced in the API endpoints.
     */
    id: string;
    /**
     * The size of the file, in bytes.
     */
    bytes: number;
    /**
     * The Unix timestamp (in seconds) for when the file was created.
     */
    created_at: number;
    /**
     * The name of the file.
     */
    filename: string;
    /**
     * The object type, which is always `file`.
     */
    object: 'file';
    /**
     * The intended purpose of the file. Supported values are `assistants`,
     * `assistants_output`, `batch`, `batch_output`, `fine-tune`, `fine-tune-results`,
     * `vision`, and `user_data`.
     */
    purpose: 'assistants' | 'assistants_output' | 'batch' | 'batch_output' | 'fine-tune' | 'fine-tune-results' | 'vision' | 'user_data';
    /**
     * @deprecated Deprecated. The current status of the file, which can be either
     * `uploaded`, `processed`, or `error`.
     */
    status: 'uploaded' | 'processed' | 'error';
    /**
     * The Unix timestamp (in seconds) for when the file will expire.
     */
    expires_at?: number;
    /**
     * @deprecated Deprecated. For details on why a fine-tuning training file failed
     * validation, see the `error` field on `fine_tuning.job`.
     */
    status_details?: string;
}
/**
 * The intended purpose of the uploaded file. One of: - `assistants`: Used in the
 * Assistants API - `batch`: Used in the Batch API - `fine-tune`: Used for
 * fine-tuning - `vision`: Images used for vision fine-tuning - `user_data`:
 * Flexible file type for any purpose - `evals`: Used for eval data sets
 */
export type FilePurpose = 'assistants' | 'batch' | 'fine-tune' | 'vision' | 'user_data' | 'evals';
export interface FileCreateParams {
    /**
     * The File object (not file name) to be uploaded.
     */
    file: Uploadable;
    /**
     * The intended purpose of the uploaded file. One of: - `assistants`: Used in the
     * Assistants API - `batch`: Used in the Batch API - `fine-tune`: Used for
     * fine-tuning - `vision`: Images used for vision fine-tuning - `user_data`:
     * Flexible file type for any purpose - `evals`: Used for eval data sets
     */
    purpose: FilePurpose;
    /**
     * The expiration policy for a file. By default, files with `purpose=batch` expire
     * after 30 days and all other files are persisted until they are manually deleted.
     */
    expires_after?: FileCreateParams.ExpiresAfter;
}
export declare namespace FileCreateParams {
    /**
     * The expiration policy for a file. By default, files with `purpose=batch` expire
     * after 30 days and all other files are persisted until they are manually deleted.
     */
    interface ExpiresAfter {
        /**
         * Anchor timestamp after which the expiration policy applies. Supported anchors:
         * `created_at`.
         */
        anchor: 'created_at';
        /**
         * The number of seconds after the anchor time that the file will expire. Must be
         * between 3600 (1 hour) and 2592000 (30 days).
         */
        seconds: number;
    }
}
export interface FileListParams extends CursorPageParams {
    /**
     * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
     * order and `desc` for descending order.
     */
    order?: 'asc' | 'desc';
    /**
     * Only return files with the given purpose.
     */
    purpose?: string;
}
export declare namespace Files {
    export { type FileContent as FileContent, type FileDeleted as FileDeleted, type FileObject as FileObject, type FilePurpose as FilePurpose, type FileObjectsPage as FileObjectsPage, type FileCreateParams as FileCreateParams, type FileListParams as FileListParams, };
}
//# sourceMappingURL=files.d.mts.map

import { APIResource } from "../../core/resource.mjs";
import * as VectorStoresAPI from "./vector-stores.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise, Page } from "../../core/pagination.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
import { Uploadable } from "../../uploads.mjs";
export declare class Files extends APIResource {
    /**
     * Create a vector store file by attaching a
     * [File](https://platform.openai.com/docs/api-reference/files) to a
     * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
     */
    create(vectorStoreID: string, body: FileCreateParams, options?: RequestOptions): APIPromise<VectorStoreFile>;
    /**
     * Retrieves a vector store file.
     */
    retrieve(fileID: string, params: FileRetrieveParams, options?: RequestOptions): APIPromise<VectorStoreFile>;
    /**
     * Update attributes on a vector store file.
     */
    update(fileID: string, params: FileUpdateParams, options?: RequestOptions): APIPromise<VectorStoreFile>;
    /**
     * Returns a list of vector store files.
     */
    list(vectorStoreID: string, query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<VectorStoreFilesPage, VectorStoreFile>;
    /**
     * Delete a vector store file. This will remove the file from the vector store but
     * the file itself will not be deleted. To delete the file, use the
     * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
     * endpoint.
     */
    delete(fileID: string, params: FileDeleteParams, options?: RequestOptions): APIPromise<VectorStoreFileDeleted>;
    /**
     * Attach a file to the given vector store and wait for it to be processed.
     */
    createAndPoll(vectorStoreId: string, body: FileCreateParams, options?: RequestOptions & {
        pollIntervalMs?: number;
    }): Promise<VectorStoreFile>;
    /**
     * Wait for the vector store file to finish processing.
     *
     * Note: this will return even if the file failed to process, you need to check
     * file.last_error and file.status to handle these cases
     */
    poll(vectorStoreID: string, fileID: string, options?: RequestOptions & {
        pollIntervalMs?: number;
    }): Promise<VectorStoreFile>;
    /**
     * Upload a file to the `files` API and then attach it to the given vector store.
     *
     * Note the file will be asynchronously processed (you can use the alternative
     * polling helper method to wait for processing to complete).
     */
    upload(vectorStoreId: string, file: Uploadable, options?: RequestOptions): Promise<VectorStoreFile>;
    /**
     * Add a file to a vector store and poll until processing is complete.
     */
    uploadAndPoll(vectorStoreId: string, file: Uploadable, options?: RequestOptions & {
        pollIntervalMs?: number;
    }): Promise<VectorStoreFile>;
    /**
     * Retrieve the parsed contents of a vector store file.
     */
    content(fileID: string, params: FileContentParams, options?: RequestOptions): PagePromise<FileContentResponsesPage, FileContentResponse>;
}
export type VectorStoreFilesPage = CursorPage<VectorStoreFile>;
export type FileContentResponsesPage = Page<FileContentResponse>;
/**
 * A list of files attached to a vector store.
 */
export interface VectorStoreFile {
    /**
     * The identifier, which can be referenced in API endpoints.
     */
    id: string;
    /**
     * The Unix timestamp (in seconds) for when the vector store file was created.
     */
    created_at: number;
    /**
     * The last error associated with this vector store file. Will be `null` if there
     * are no errors.
     */
    last_error: VectorStoreFile.LastError | null;
    /**
     * The object type, which is always `vector_store.file`.
     */
    object: 'vector_store.file';
    /**
     * The status of the vector store file, which can be either `in_progress`,
     * `completed`, `cancelled`, or `failed`. The status `completed` indicates that the
     * vector store file is ready for use.
     */
    status: 'in_progress' | 'completed' | 'cancelled' | 'failed';
    /**
     * The total vector store usage in bytes. Note that this may be different from the
     * original file size.
     */
    usage_bytes: number;
    /**
     * The ID of the
     * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object)
     * that the [File](https://platform.openai.com/docs/api-reference/files) is
     * attached to.
     */
    vector_store_id: string;
    /**
     * Set of 16 key-value pairs that can be attached to an object. This can be useful
     * for storing additional information about the object in a structured format, and
     * querying for objects via API or the dashboard. Keys are strings with a maximum
     * length of 64 characters. Values are strings with a maximum length of 512
     * characters, booleans, or numbers.
     */
    attributes?: {
        [key: string]: string | number | boolean;
    } | null;
    /**
     * The strategy used to chunk the file.
     */
    chunking_strategy?: VectorStoresAPI.FileChunkingStrategy;
}
export declare namespace VectorStoreFile {
    /**
     * The last error associated with this vector store file. Will be `null` if there
     * are no errors.
     */
    interface LastError {
        /**
         * One of `server_error` or `rate_limit_exceeded`.
         */
        code: 'server_error' | 'unsupported_file' | 'invalid_file';
        /**
         * A human-readable description of the error.
         */
        message: string;
    }
}
export interface VectorStoreFileDeleted {
    id: string;
    deleted: boolean;
    object: 'vector_store.file.deleted';
}
export interface FileContentResponse {
    /**
     * The text content
     */
    text?: string;
    /**
     * The content type (currently only `"text"`)
     */
    type?: string;
}
export interface FileCreateParams {
    /**
     * A [File](https://platform.openai.com/docs/api-reference/files) ID that the
     * vector store should use. Useful for tools like `file_search` that can access
     * files.
     */
    file_id: string;
    /**
     * Set of 16 key-value pairs that can be attached to an object. This can be useful
     * for storing additional information about the object in a structured format, and
     * querying for objects via API or the dashboard. Keys are strings with a maximum
     * length of 64 characters. Values are strings with a maximum length of 512
     * characters, booleans, or numbers.
     */
    attributes?: {
        [key: string]: string | number | boolean;
    } | null;
    /**
     * The chunking strategy used to chunk the file(s). If not set, will use the `auto`
     * strategy. Only applicable if `file_ids` is non-empty.
     */
    chunking_strategy?: VectorStoresAPI.FileChunkingStrategyParam;
}
export interface FileRetrieveParams {
    /**
     * The ID of the vector store that the file belongs to.
     */
    vector_store_id: string;
}
export interface FileUpdateParams {
    /**
     * Path param: The ID of the vector store the file belongs to.
     */
    vector_store_id: string;
    /**
     * Body param: Set of 16 key-value pairs that can be attached to an object. This
     * can be useful for storing additional information about the object in a
     * structured format, and querying for objects via API or the dashboard. Keys are
     * strings with a maximum length of 64 characters. Values are strings with a
     * maximum length of 512 characters, booleans, or numbers.
     */
    attributes: {
        [key: string]: string | number | boolean;
    } | null;
}
export interface FileListParams extends CursorPageParams {
    /**
     * A cursor for use in pagination. `before` is an object ID that defines your place
     * in the list. For instance, if you make a list request and receive 100 objects,
     * starting with obj_foo, your subsequent call can include before=obj_foo in order
     * to fetch the previous page of the list.
     */
    before?: string;
    /**
     * Filter by file status. One of `in_progress`, `completed`, `failed`, `cancelled`.
     */
    filter?: 'in_progress' | 'completed' | 'failed' | 'cancelled';
    /**
     * Sort order by the `created_at` timestamp of the objects. `asc` for ascending
     * order and `desc` for descending order.
     */
    order?: 'asc' | 'desc';
}
export interface FileDeleteParams {
    /**
     * The ID of the vector store that the file belongs to.
     */
    vector_store_id: string;
}
export interface FileContentParams {
    /**
     * The ID of the vector store.
     */
    vector_store_id: string;
}
export declare namespace Files {
    export { type VectorStoreFile as VectorStoreFile, type VectorStoreFileDeleted as VectorStoreFileDeleted, type FileContentResponse as FileContentResponse, type VectorStoreFilesPage as VectorStoreFilesPage, type FileContentResponsesPage as FileContentResponsesPage, type FileCreateParams as FileCreateParams, type FileRetrieveParams as FileRetrieveParams, type FileUpdateParams as FileUpdateParams, type FileListParams as FileListParams, type FileDeleteParams as FileDeleteParams, type FileContentParams as FileContentParams, };
}
//# sourceMappingURL=files.d.mts.map