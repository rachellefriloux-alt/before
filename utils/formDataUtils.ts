/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Configurable FormData utilities for handling nested data structures in uploads.
 * Got it, love.
 */

export interface NestedFormatConfig {
  /** Format for array items. Use {key} for the base key and {index} for array index */
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'repeat';
  /** Format for object properties. Use {key} for the base key and {prop} for property name */
  objectFormat: 'brackets' | 'dot' | 'underscore';
  /** Custom array formatter function */
  customArrayFormatter?: (key: string, index: number) => string;
  /** Custom object formatter function */
  customObjectFormatter?: (key: string, property: string) => string;
}

const DEFAULT_CONFIG: NestedFormatConfig = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets'
};

export class ConfigurableFormData {
  private config: NestedFormatConfig;

  constructor(config: Partial<NestedFormatConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Creates FormData with configurable nested format handling
   */
  async createForm<T = Record<string, unknown>>(
    body: T | undefined,
    options?: { validateUploadable?: boolean }
  ): Promise<FormData> {
    const form = new FormData();
    if (!body) return form;

    await Promise.all(
      Object.entries(body).map(([key, value]) => 
        this.addFormValue(form, key, value, options)
      )
    );

    return form;
  }

  /**
   * Add a value to FormData with configurable nested formatting
   */
  private async addFormValue(
    form: FormData,
    key: string,
    value: unknown,
    options?: { validateUploadable?: boolean }
  ): Promise<void> {
    if (value === undefined) return;
    
    if (value == null) {
      throw new TypeError(
        `Received null for "${key}"; to pass null in FormData, you must use the string 'null'`
      );
    }

    // Handle primitive types
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      form.append(key, String(value));
      return;
    }

    // Handle File/Blob types
    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      return;
    }

    // Handle Response objects
    if (value instanceof Response) {
      const blob = await value.blob();
      const fileName = this.extractFileName(value) || 'unknown_file';
      form.append(key, new File([blob], fileName));
      return;
    }

    // Handle async iterables (streams)
    if (this.isAsyncIterable(value)) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of value) {
        chunks.push(chunk);
      }
      const blob = new Blob(chunks);
      const fileName = this.extractFileName(value) || 'unknown_file';
      form.append(key, new File([blob], fileName));
      return;
    }

    // Handle arrays with configurable formatting
    if (Array.isArray(value)) {
      await Promise.all(
        value.map((entry, index) => 
          this.addFormValue(form, this.formatArrayKey(key, index), entry, options)
        )
      );
      return;
    }

    // Handle objects with configurable formatting
    if (typeof value === 'object') {
      await Promise.all(
        Object.entries(value).map(([prop, propValue]) =>
          this.addFormValue(form, this.formatObjectKey(key, prop), propValue, options)
        )
      );
      return;
    }

    throw new TypeError(
      `Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`
    );
  }

  /**
   * Format array keys based on configuration
   */
  private formatArrayKey(baseKey: string, index: number): string {
    if (this.config.customArrayFormatter) {
      return this.config.customArrayFormatter(baseKey, index);
    }

    switch (this.config.arrayFormat) {
      case 'brackets':
        return `${baseKey}[]`;
      case 'indexed':
        return `${baseKey}[${index}]`;
      case 'comma':
        return baseKey; // Will be handled differently for comma-separated values
      case 'repeat':
        return baseKey;
      default:
        return `${baseKey}[]`;
    }
  }

  /**
   * Format object keys based on configuration
   */
  private formatObjectKey(baseKey: string, property: string): string {
    if (this.config.customObjectFormatter) {
      return this.config.customObjectFormatter(baseKey, property);
    }

    switch (this.config.objectFormat) {
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

  /**
   * Check if value is async iterable
   */
  private isAsyncIterable(value: any): value is AsyncIterable<any> {
    return value != null && 
           typeof value === 'object' && 
           typeof value[Symbol.asyncIterator] === 'function';
  }

  /**
   * Extract filename from various sources
   */
  private extractFileName(value: any): string | undefined {
    if (typeof value === 'object' && value !== null) {
      // Try various filename properties
      if ('name' in value && value.name) return String(value.name);
      if ('filename' in value && value.filename) return String(value.filename);
      if ('url' in value && value.url) {
        const url = String(value.url);
        return url.split('/').pop()?.split('?')[0];
      }
      if ('path' in value && value.path) {
        const path = String(value.path);
        return path.split(/[\\/]/).pop();
      }
    }
    return undefined;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<NestedFormatConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): NestedFormatConfig {
    return { ...this.config };
  }
}

/**
 * Utility function to create FormData with default configuration
 */
export async function createConfigurableForm<T = Record<string, unknown>>(
  body: T | undefined,
  config?: Partial<NestedFormatConfig>
): Promise<FormData> {
  const formData = new ConfigurableFormData(config);
  return formData.createForm(body);
}

/**
 * Predefined configurations for common APIs
 */
export const PRESET_CONFIGS = {
  /** Standard bracket notation: key[], key[prop] */
  STANDARD: {
    arrayFormat: 'brackets' as const,
    objectFormat: 'brackets' as const
  },
  /** Indexed arrays: key[0], key.prop */
  INDEXED_DOT: {
    arrayFormat: 'indexed' as const,
    objectFormat: 'dot' as const
  },
  /** Underscore notation: key_0, key_prop */
  UNDERSCORE: {
    arrayFormat: 'repeat' as const,
    objectFormat: 'underscore' as const,
    customArrayFormatter: (key: string, index: number) => `${key}_${index}`
  },
  /** OpenAI API compatible format */
  OPENAI: {
    arrayFormat: 'brackets' as const,
    objectFormat: 'brackets' as const
  }
} as const;