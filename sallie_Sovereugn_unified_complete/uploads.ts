export { type Uploadable } from '../internal/uploads';
export { toFile, type ToFileInput } from '../internal/to-file';


import { type RequestOptions } from './request-options';
import type { FilePropertyBag, Fetch } from './builtin-types';
import type { OpenAI } from '../client';
import { ReadableStreamFrom } from './shims';

export type BlobPart = string | ArrayBuffer | ArrayBufferView | Blob | DataView;
type FsReadStream = AsyncIterable<Uint8Array> & { path: string | { toString(): string } };

// https://github.com/oven-sh/bun/issues/5980
interface BunFile extends Blob {
  readonly name?: string | undefined;
}

export const checkFileSupport = () => {
  if (typeof File === 'undefined') {
    const { process } = globalThis as any;
    const isOldNode =
      typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')) < 20;
    throw new Error(
      '`File` is not defined as a global, which is required for file uploads.' +
        (isOldNode ?
          " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
        : ''),
    );
  }
};

/**
 * Typically, this is a native "File" class.
 *
 * We provide the {@link toFile} utility to convert a variety of objects
 * into the File class.
 *
 * For convenience, you can also pass a fetch Response, or in Node,
 * the result of fs.createReadStream().
 */
export type Uploadable = File | Response | FsReadStream | BunFile;

/**
 * Construct a `File` instance. This is used to ensure a helpful error is thrown
 * for environments that don't define a global `File` yet.
 */
export function makeFile(
  fileBits: BlobPart[],
  fileName: string | undefined,
  options?: FilePropertyBag,
): File {
  checkFileSupport();
  return new File(fileBits as any, fileName ?? 'unknown_file', options);
}

export function getName(value: any): string | undefined {
  return (
    (
      (typeof value === 'object' &&
        value !== null &&
        (('name' in value && value.name && String(value.name)) ||
          ('url' in value && value.url && String(value.url)) ||
          ('filename' in value && value.filename && String(value.filename)) ||
          ('path' in value && value.path && String(value.path)))) ||
      ''
    )
      .split(/[\\/]/)
      .pop() || undefined
  );
}

export const isAsyncIterable = (value: any): value is AsyncIterable<any> =>
  value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';

/**
 * Returns a multipart/form-data request if any part of the given request body contains a File / Blob value.
 * Otherwise returns the request as is.
 */
export const maybeMultipartFormRequestOptions = async (
  opts: RequestOptions,
  fetch: OpenAI | Fetch,
): Promise<RequestOptions> => {
  if (!hasUploadableValue(opts.body)) return opts;

  return { ...opts, body: await createForm(opts.body, fetch) };
};

type MultipartFormRequestOptions = Omit<RequestOptions, 'body'> & { body: unknown };

export const multipartFormRequestOptions = async (
  opts: MultipartFormRequestOptions,
  fetch: OpenAI | Fetch,
): Promise<RequestOptions> => {
  return { ...opts, body: await createForm(opts.body, fetch) };
};

const supportsFormDataMap = /* @__PURE__ */ new WeakMap<Fetch, Promise<boolean>>();

/**
 * node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
 * properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
 * This function detects if the fetch function provided supports the global FormData object to avoid
 * confusing error messages later on.
 */
function supportsFormData(fetchObject: OpenAI | Fetch): Promise<boolean> {
  const fetch: Fetch = typeof fetchObject === 'function' ? fetchObject : (fetchObject as any).fetch;
  const cached = supportsFormDataMap.get(fetch);
  if (cached) return cached;
  const promise = (async () => {
    try {
      const FetchResponse = (
        'Response' in fetch ?
          fetch.Response
        : (await fetch('data:,')).constructor) as typeof Response;
      const data = new FormData();
      if (data.toString() === (await new FetchResponse(data).text())) {
        return false;
      }
      return true;
    } catch {
      // avoid false negatives
      return true;
    }
  })();
  supportsFormDataMap.set(fetch, promise);
  return promise;
}

export const createForm = async <T = Record<string, unknown>>(
  body: T | undefined,
  fetch: OpenAI | Fetch,
): Promise<FormData> => {
  if (!(await supportsFormData(fetch))) {
    throw new TypeError(
      'The provided fetch function does not support file uploads with the current global FormData class.',
    );
  }
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};

// We check for Blob not File because Bun.File doesn't inherit from File,
// but they both inherit from Blob and have a `name` property at runtime.
const isNamedBlob = (value: unknown) => value instanceof Blob && 'name' in value;

const isUploadable = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));

const hasUploadableValue = (value: unknown): boolean => {
  if (isUploadable(value)) return true;
  if (Array.isArray(value)) return value.some(hasUploadableValue);
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue((value as any)[k])) return true;
    }
  }
  return false;
};

const addFormValue = async (form: FormData, key: string, value: unknown): Promise<void> => {
  if (value === undefined) return;
  if (value == null) {
    throw new TypeError(
      `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`,
    );
  }

  // TODO: make nested formats configurable
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    form.append(key, makeFile([await value.blob()], getName(value)));
  } else if (isAsyncIterable(value)) {
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value)));
  } else if (isNamedBlob(value)) {
    form.append(key, value, getName(value));
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry)));
  } else if (typeof value === 'object') {
    await Promise.all(
      Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)),
    );
  } else {
    throw new TypeError(
      `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`,
    );
  }
};


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as FilesAPI from '../files';
import * as PartsAPI from './parts';
import { PartCreateParams, Parts, UploadPart } from './parts';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Uploads extends APIResource {
  parts: PartsAPI.Parts = new PartsAPI.Parts(this._client);

  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(body: UploadCreateParams, options?: RequestOptions): APIPromise<Upload> {
    return this._client.post('/uploads', { body, ...options });
  }

  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadID: string, options?: RequestOptions): APIPromise<Upload> {
    return this._client.post(path`/uploads/${uploadID}/cancel`, options);
  }

  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(uploadID: string, body: UploadCompleteParams, options?: RequestOptions): APIPromise<Upload> {
    return this._client.post(path`/uploads/${uploadID}/complete`, { body, ...options });
  }
}

/**
 * The Upload object can accept byte chunks in the form of Parts.
 */
export interface Upload {
  /**
   * The Upload unique identifier, which can be referenced in API endpoints.
   */
  id: string;

  /**
   * The intended number of bytes to be uploaded.
   */
  bytes: number;

  /**
   * The Unix timestamp (in seconds) for when the Upload was created.
   */
  created_at: number;

  /**
   * The Unix timestamp (in seconds) for when the Upload will expire.
   */
  expires_at: number;

  /**
   * The name of the file to be uploaded.
   */
  filename: string;

  /**
   * The object type, which is always "upload".
   */
  object: 'upload';

  /**
   * The intended purpose of the file.
   * [Please refer here](https://platform.openai.com/docs/api-reference/files/object#files/object-purpose)
   * for acceptable values.
   */
  purpose: string;

  /**
   * The status of the Upload.
   */
  status: 'pending' | 'completed' | 'cancelled' | 'expired';

  /**
   * The `File` object represents a document that has been uploaded to OpenAI.
   */
  file?: FilesAPI.FileObject | null;
}

export interface UploadCreateParams {
  /**
   * The number of bytes in the file you are uploading.
   */
  bytes: number;

  /**
   * The name of the file to upload.
   */
  filename: string;

  /**
   * The MIME type of the file.
   *
   * This must fall within the supported MIME types for your file purpose. See the
   * supported MIME types for assistants and vision.
   */
  mime_type: string;

  /**
   * The intended purpose of the uploaded file.
   *
   * See the
   * [documentation on File purposes](https://platform.openai.com/docs/api-reference/files/create#files-create-purpose).
   */
  purpose: FilesAPI.FilePurpose;

  /**
   * The expiration policy for a file. By default, files with `purpose=batch` expire
   * after 30 days and all other files are persisted until they are manually deleted.
   */
  expires_after?: UploadCreateParams.ExpiresAfter;
}

export namespace UploadCreateParams {
  /**
   * The expiration policy for a file. By default, files with `purpose=batch` expire
   * after 30 days and all other files are persisted until they are manually deleted.
   */
  export interface ExpiresAfter {
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

export interface UploadCompleteParams {
  /**
   * The ordered list of Part IDs.
   */
  part_ids: Array<string>;

  /**
   * The optional md5 checksum for the file contents to verify if the bytes uploaded
   * matches what you expect.
   */
  md5?: string;
}

Uploads.Parts = Parts;

export declare namespace Uploads {
  export {
    type Upload as Upload,
    type UploadCreateParams as UploadCreateParams,
    type UploadCompleteParams as UploadCompleteParams,
  };

  export { Parts as Parts, type UploadPart as UploadPart, type PartCreateParams as PartCreateParams };
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './uploads/index';


/** @deprecated Import from ./core/uploads instead */
export * from './core/uploads';


export { type Uploadable } from '../internal/uploads';
export { toFile, type ToFileInput } from '../internal/to-file';


import { type RequestOptions } from './request-options';
import type { FilePropertyBag, Fetch } from './builtin-types';
import type { OpenAI } from '../client';
import { ReadableStreamFrom } from './shims';

export type BlobPart = string | ArrayBuffer | ArrayBufferView | Blob | DataView;
type FsReadStream = AsyncIterable<Uint8Array> & { path: string | { toString(): string } };

// https://github.com/oven-sh/bun/issues/5980
interface BunFile extends Blob {
  readonly name?: string | undefined;
}

export const checkFileSupport = () => {
  if (typeof File === 'undefined') {
    const { process } = globalThis as any;
    const isOldNode =
      typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')) < 20;
    throw new Error(
      '`File` is not defined as a global, which is required for file uploads.' +
        (isOldNode ?
          " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
        : ''),
    );
  }
};

/**
 * Typically, this is a native "File" class.
 *
 * We provide the {@link toFile} utility to convert a variety of objects
 * into the File class.
 *
 * For convenience, you can also pass a fetch Response, or in Node,
 * the result of fs.createReadStream().
 */
export type Uploadable = File | Response | FsReadStream | BunFile;

/**
 * Construct a `File` instance. This is used to ensure a helpful error is thrown
 * for environments that don't define a global `File` yet.
 */
export function makeFile(
  fileBits: BlobPart[],
  fileName: string | undefined,
  options?: FilePropertyBag,
): File {
  checkFileSupport();
  return new File(fileBits as any, fileName ?? 'unknown_file', options);
}

export function getName(value: any): string | undefined {
  return (
    (
      (typeof value === 'object' &&
        value !== null &&
        (('name' in value && value.name && String(value.name)) ||
          ('url' in value && value.url && String(value.url)) ||
          ('filename' in value && value.filename && String(value.filename)) ||
          ('path' in value && value.path && String(value.path)))) ||
      ''
    )
      .split(/[\\/]/)
      .pop() || undefined
  );
}

export const isAsyncIterable = (value: any): value is AsyncIterable<any> =>
  value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';

/**
 * Returns a multipart/form-data request if any part of the given request body contains a File / Blob value.
 * Otherwise returns the request as is.
 */
export const maybeMultipartFormRequestOptions = async (
  opts: RequestOptions,
  fetch: OpenAI | Fetch,
): Promise<RequestOptions> => {
  if (!hasUploadableValue(opts.body)) return opts;

  return { ...opts, body: await createForm(opts.body, fetch) };
};

type MultipartFormRequestOptions = Omit<RequestOptions, 'body'> & { body: unknown };

export const multipartFormRequestOptions = async (
  opts: MultipartFormRequestOptions,
  fetch: OpenAI | Fetch,
): Promise<RequestOptions> => {
  return { ...opts, body: await createForm(opts.body, fetch) };
};

const supportsFormDataMap = /* @__PURE__ */ new WeakMap<Fetch, Promise<boolean>>();

/**
 * node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
 * properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
 * This function detects if the fetch function provided supports the global FormData object to avoid
 * confusing error messages later on.
 */
function supportsFormData(fetchObject: OpenAI | Fetch): Promise<boolean> {
  const fetch: Fetch = typeof fetchObject === 'function' ? fetchObject : (fetchObject as any).fetch;
  const cached = supportsFormDataMap.get(fetch);
  if (cached) return cached;
  const promise = (async () => {
    try {
      const FetchResponse = (
        'Response' in fetch ?
          fetch.Response
        : (await fetch('data:,')).constructor) as typeof Response;
      const data = new FormData();
      if (data.toString() === (await new FetchResponse(data).text())) {
        return false;
      }
      return true;
    } catch {
      // avoid false negatives
      return true;
    }
  })();
  supportsFormDataMap.set(fetch, promise);
  return promise;
}

export const createForm = async <T = Record<string, unknown>>(
  body: T | undefined,
  fetch: OpenAI | Fetch,
): Promise<FormData> => {
  if (!(await supportsFormData(fetch))) {
    throw new TypeError(
      'The provided fetch function does not support file uploads with the current global FormData class.',
    );
  }
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};

// We check for Blob not File because Bun.File doesn't inherit from File,
// but they both inherit from Blob and have a `name` property at runtime.
const isNamedBlob = (value: unknown) => value instanceof Blob && 'name' in value;

const isUploadable = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));

const hasUploadableValue = (value: unknown): boolean => {
  if (isUploadable(value)) return true;
  if (Array.isArray(value)) return value.some(hasUploadableValue);
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue((value as any)[k])) return true;
    }
  }
  return false;
};

const addFormValue = async (form: FormData, key: string, value: unknown): Promise<void> => {
  if (value === undefined) return;
  if (value == null) {
    throw new TypeError(
      `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`,
    );
  }

  // TODO: make nested formats configurable
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    form.append(key, makeFile([await value.blob()], getName(value)));
  } else if (isAsyncIterable(value)) {
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value)));
  } else if (isNamedBlob(value)) {
    form.append(key, value, getName(value));
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry)));
  } else if (typeof value === 'object') {
    await Promise.all(
      Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)),
    );
  } else {
    throw new TypeError(
      `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`,
    );
  }
};


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as FilesAPI from '../files';
import * as PartsAPI from './parts';
import { PartCreateParams, Parts, UploadPart } from './parts';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Uploads extends APIResource {
  parts: PartsAPI.Parts = new PartsAPI.Parts(this._client);

  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(body: UploadCreateParams, options?: RequestOptions): APIPromise<Upload> {
    return this._client.post('/uploads', { body, ...options });
  }

  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadID: string, options?: RequestOptions): APIPromise<Upload> {
    return this._client.post(path`/uploads/${uploadID}/cancel`, options);
  }

  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(uploadID: string, body: UploadCompleteParams, options?: RequestOptions): APIPromise<Upload> {
    return this._client.post(path`/uploads/${uploadID}/complete`, { body, ...options });
  }
}

/**
 * The Upload object can accept byte chunks in the form of Parts.
 */
export interface Upload {
  /**
   * The Upload unique identifier, which can be referenced in API endpoints.
   */
  id: string;

  /**
   * The intended number of bytes to be uploaded.
   */
  bytes: number;

  /**
   * The Unix timestamp (in seconds) for when the Upload was created.
   */
  created_at: number;

  /**
   * The Unix timestamp (in seconds) for when the Upload will expire.
   */
  expires_at: number;

  /**
   * The name of the file to be uploaded.
   */
  filename: string;

  /**
   * The object type, which is always "upload".
   */
  object: 'upload';

  /**
   * The intended purpose of the file.
   * [Please refer here](https://platform.openai.com/docs/api-reference/files/object#files/object-purpose)
   * for acceptable values.
   */
  purpose: string;

  /**
   * The status of the Upload.
   */
  status: 'pending' | 'completed' | 'cancelled' | 'expired';

  /**
   * The `File` object represents a document that has been uploaded to OpenAI.
   */
  file?: FilesAPI.FileObject | null;
}

export interface UploadCreateParams {
  /**
   * The number of bytes in the file you are uploading.
   */
  bytes: number;

  /**
   * The name of the file to upload.
   */
  filename: string;

  /**
   * The MIME type of the file.
   *
   * This must fall within the supported MIME types for your file purpose. See the
   * supported MIME types for assistants and vision.
   */
  mime_type: string;

  /**
   * The intended purpose of the uploaded file.
   *
   * See the
   * [documentation on File purposes](https://platform.openai.com/docs/api-reference/files/create#files-create-purpose).
   */
  purpose: FilesAPI.FilePurpose;

  /**
   * The expiration policy for a file. By default, files with `purpose=batch` expire
   * after 30 days and all other files are persisted until they are manually deleted.
   */
  expires_after?: UploadCreateParams.ExpiresAfter;
}

export namespace UploadCreateParams {
  /**
   * The expiration policy for a file. By default, files with `purpose=batch` expire
   * after 30 days and all other files are persisted until they are manually deleted.
   */
  export interface ExpiresAfter {
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

export interface UploadCompleteParams {
  /**
   * The ordered list of Part IDs.
   */
  part_ids: Array<string>;

  /**
   * The optional md5 checksum for the file contents to verify if the bytes uploaded
   * matches what you expect.
   */
  md5?: string;
}

Uploads.Parts = Parts;

export declare namespace Uploads {
  export {
    type Upload as Upload,
    type UploadCreateParams as UploadCreateParams,
    type UploadCompleteParams as UploadCompleteParams,
  };

  export { Parts as Parts, type UploadPart as UploadPart, type PartCreateParams as PartCreateParams };
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './uploads/index';


/** @deprecated Import from ./core/uploads instead */
export * from './core/uploads';
