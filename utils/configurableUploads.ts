/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable uploads utility with nested format support.
 * Got it, love.
 */

export interface NestedFormatsConfig {
  arrayFormat: 'brackets' | 'indexed' | 'repeat';
  objectFormat: 'brackets' | 'dot' | 'underscore';
  customArrayFormatter?: (key: string, index: number) => string;
  customObjectFormatter?: (key: string, prop: string) => string;
}

const DEFAULT_FORMATS_CONFIG: NestedFormatsConfig = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets'
};

export function makeFile(fileBits: BlobPart[], fileName?: string, options?: FilePropertyBag): File {
  checkFileSupport();
  return new File(fileBits, fileName ?? 'unknown_file', options);
}

export function getName(value: any): string | undefined {
  return (((typeof value === 'object' &&
    value !== null &&
    (('name' in value && value.name && String(value.name)) ||
      ('url' in value && value.url && String(value.url)) ||
      ('filename' in value && value.filename && String(value.filename)) ||
      ('path' in value && value.path && String(value.path)))) ||
    '')
    .split(/[\\/]/)
    .pop() || undefined);
}

export const isAsyncIterable = (value: any): value is AsyncIterable<any> => 
  value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';

function checkFileSupport(): void {
  if (typeof File === 'undefined') {
    const { process } = globalThis;
    const isOldNode = typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')[0]) < 20;
    throw new Error('`File` is not defined as a global, which is required for file uploads.' +
      (isOldNode ?
        " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
        : ''));
  }
}

const isNamedBlob = (value: any): value is Blob & { name: string } => 
  value instanceof Blob && 'name' in value;

const isUploadable = (value: any): boolean =>
  typeof value === 'object' &&
  value !== null &&
  (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));

const hasUploadableValue = (value: any): boolean => {
  if (isUploadable(value)) return true;
  if (Array.isArray(value)) return value.some(hasUploadableValue);
  if (value && typeof value === 'object') {
    for (const k in value) {
      if (hasUploadableValue(value[k])) return true;
    }
  }
  return false;
};

function formatArrayKey(baseKey: string, index: number, config: NestedFormatsConfig): string {
  if (config.customArrayFormatter) {
    return config.customArrayFormatter(baseKey, index);
  }

  switch (config.arrayFormat) {
    case 'brackets':
      return `${baseKey}[]`;
    case 'indexed':
      return `${baseKey}[${index}]`;
    case 'repeat':
      return baseKey;
    default:
      return `${baseKey}[]`;
  }
}

function formatObjectKey(baseKey: string, property: string, config: NestedFormatsConfig): string {
  if (config.customObjectFormatter) {
    return config.customObjectFormatter(baseKey, property);
  }

  switch (config.objectFormat) {
    case 'brackets':
      return `${baseKey}[${property}]`;
    case 'dot':
      return `${baseKey}.${property}`;
    case 'underscore':
      return `${baseKey}_${property}`;
    default:
      return `${baseKey}[${property}]`;
  }
}

const addFormValue = async (
  form: FormData, 
  key: string, 
  value: unknown, 
  config: NestedFormatsConfig = DEFAULT_FORMATS_CONFIG
): Promise<void> => {
  if (value === undefined) return;
  
  if (value == null) {
    throw new TypeError(
      `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`
    );
  }

  // Handle primitive types with configurable nested formats
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    form.append(key, makeFile([await value.blob()], getName(value)));
  } else if (isAsyncIterable(value)) {
    const chunks: Uint8Array[] = [];
    for await (const chunk of value) {
      chunks.push(chunk);
    }
    form.append(key, makeFile(chunks, getName(value)));
  } else if (isNamedBlob(value)) {
    form.append(key, value, getName(value));
  } else if (Array.isArray(value)) {
    // Configurable array formatting
    await Promise.all(
      value.map((entry, index) => 
        addFormValue(form, formatArrayKey(key, index, config), entry, config)
      )
    );
  } else if (typeof value === 'object') {
    // Configurable object formatting
    await Promise.all(
      Object.entries(value).map(([name, prop]) => 
        addFormValue(form, formatObjectKey(key, name, config), prop, config)
      )
    );
  } else {
    throw new TypeError(
      `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`
    );
  }
};

export const createForm = async <T = Record<string, unknown>>(
  body: T | undefined,
  options?: { 
    formatsConfig?: Partial<NestedFormatsConfig>;
    [key: string]: any;
  }
): Promise<FormData> => {
  const form = new FormData();
  const config = { ...DEFAULT_FORMATS_CONFIG, ...options?.formatsConfig };
  
  await Promise.all(
    Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, config))
  );
  
  return form;
};

export const maybeMultipartFormRequestOptions = async (
  opts: { body: unknown; [key: string]: any },
  fetchOrConfig?: any
): Promise<any> => {
  if (!hasUploadableValue(opts.body)) return opts;
  
  const formatsConfig = opts.formatsConfig;
  return { ...opts, body: await createForm(opts.body, { formatsConfig }) };
};

export const multipartFormRequestOptions = async (
  opts: { body: unknown; formatsConfig?: Partial<NestedFormatsConfig>; [key: string]: any },
  fetchOrConfig?: any
): Promise<any> => {
  const formatsConfig = opts.formatsConfig;
  return { ...opts, body: await createForm(opts.body, { formatsConfig }) };
};

// Predefined configurations
export const NESTED_FORMATS_PRESETS = {
  STANDARD: {
    arrayFormat: 'brackets' as const,
    objectFormat: 'brackets' as const
  },
  INDEXED_DOT: {
    arrayFormat: 'indexed' as const,
    objectFormat: 'dot' as const
  },
  UNDERSCORE: {
    arrayFormat: 'repeat' as const,
    objectFormat: 'underscore' as const,
    customArrayFormatter: (key: string, index: number) => `${key}_${index}`
  }
} as const;