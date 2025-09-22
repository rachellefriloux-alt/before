import Option from "./Option.ts";
export const removeBrackets = (v: string) => v.replace(/[<[].+/, '').trim();
export const findAllBrackets = (v: string) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];

  const parse = (match: string[]) => {
    let variadic = false;
    let value = match[1];

    if (value.startsWith('...')) {
      value = value.slice(3);
      variadic = true;
    }

    return {
      required: match[0].startsWith('<'),
      value,
      variadic
    };
  };

  let angledMatch;

  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }

  let squareMatch;

  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }

  return res;
};
interface MriOptions {
  alias: {
    [k: string]: string[];
  };
  boolean: string[];
}
export const getMriOptions = (options: Option[]) => {
  const result: MriOptions = {
    alias: {},
    boolean: []
  };

  for (const [index, option] of options.entries()) {
    // We do not set default values in mri options
    // Since its type (typeof) will be used to cast parsed arguments.
    // Which mean `--foo foo` will be parsed as `{foo: true}` if we have `{default:{foo: true}}`
    // Set alias
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    } // Set boolean


    if (option.isBoolean) {
      if (option.negated) {
        // For negated option
        // We only set it to `boolean` type when there's no string-type option with the same name
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some(name => option.names.includes(name)) && typeof o.required === 'boolean';
        });

        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
  }

  return result;
};
export const findLongest = (arr: string[]) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};
export const padRight = (str: string, length: number) => {
  return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`;
};
export const camelcase = (input: string) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
export const setDotProp = (obj: {
  [k: string]: any;
}, keys: string[], val: any) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;

  for (; i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf('.') || !(+keys[i + 1] > -1) ? {} : [];
  }
};
export const setByType = (obj: {
  [k: string]: any;
}, transforms: {
  [k: string]: any;
}) => {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key];

    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key]);

      if (typeof transform.transformFunction === 'function') {
        obj[key] = obj[key].map(transform.transformFunction);
      }
    }
  }
};
export const getFileName = (input: string) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : '';
};
export const camelcaseOptionName = (name: string) => {
  // Camelcase the option name
  // Don't camelcase anything after the dot `.`
  return name.split('.').map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join('.');
};
export class CACError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }

}

import { RFC1738 } from './formats';
import type { DefaultEncoder, Format } from './types';
import { isArray } from '../utils/values';

export let has = (obj: object, key: PropertyKey): boolean => (
  (has = (Object as any).hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
  has(obj, key)
);

const hex_table = /* @__PURE__ */ (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
  }

  return array;
})();

function compact_queue<T extends Record<string, any>>(queue: Array<{ obj: T; prop: string }>) {
  while (queue.length > 1) {
    const item = queue.pop();
    if (!item) continue;

    const obj = item.obj[item.prop];

    if (isArray(obj)) {
      const compacted: unknown[] = [];

      for (let j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== 'undefined') {
          compacted.push(obj[j]);
        }
      }

      // @ts-ignore
      item.obj[item.prop] = compacted;
    }
  }
}

function array_to_object(source: any[], options: { plainObjects: boolean }) {
  const obj = options && options.plainObjects ? Object.create(null) : {};
  for (let i = 0; i < source.length; ++i) {
    if (typeof source[i] !== 'undefined') {
      obj[i] = source[i];
    }
  }

  return obj;
}

export function merge(
  target: any,
  source: any,
  options: { plainObjects?: boolean; allowPrototypes?: boolean } = {},
) {
  if (!source) {
    return target;
  }

  if (typeof source !== 'object') {
    if (isArray(target)) {
      target.push(source);
    } else if (target && typeof target === 'object') {
      if ((options && (options.plainObjects || options.allowPrototypes)) || !has(Object.prototype, source)) {
        target[source] = true;
      }
    } else {
      return [target, source];
    }

    return target;
  }

  if (!target || typeof target !== 'object') {
    return [target].concat(source);
  }

  let mergeTarget = target;
  if (isArray(target) && !isArray(source)) {
    // @ts-ignore
    mergeTarget = array_to_object(target, options);
  }

  if (isArray(target) && isArray(source)) {
    source.forEach(function (item, i) {
      if (has(target, i)) {
        const targetItem = target[i];
        if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
          target[i] = merge(targetItem, item, options);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }

  return Object.keys(source).reduce(function (acc, key) {
    const value = source[key];

    if (has(acc, key)) {
      acc[key] = merge(acc[key], value, options);
    } else {
      acc[key] = value;
    }
    return acc;
  }, mergeTarget);
}

export function assign_single_source(target: any, source: any) {
  return Object.keys(source).reduce(function (acc, key) {
    acc[key] = source[key];
    return acc;
  }, target);
}

export function decode(str: string, _: any, charset: string) {
  const strWithoutPlus = str.replace(/\+/g, ' ');
  if (charset === 'iso-8859-1') {
    // unescape never throws, no try...catch needed:
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  }
  // utf-8
  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e) {
    return strWithoutPlus;
  }
}

const limit = 1024;

export const encode: (
  str: any,
  defaultEncoder: DefaultEncoder,
  charset: string,
  type: 'key' | 'value',
  format: Format,
) => string = (str, _defaultEncoder, charset, _kind, format: Format) => {
  // This code was originally written by Brian White for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) {
    return str;
  }

  let string = str;
  if (typeof str === 'symbol') {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== 'string') {
    string = String(str);
  }

  if (charset === 'iso-8859-1') {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
      return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
    });
  }

  let out = '';
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];

    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (
        c === 0x2d || // -
        c === 0x2e || // .
        c === 0x5f || // _
        c === 0x7e || // ~
        (c >= 0x30 && c <= 0x39) || // 0-9
        (c >= 0x41 && c <= 0x5a) || // a-z
        (c >= 0x61 && c <= 0x7a) || // A-Z
        (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
      ) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }

      if (c < 0x80) {
        arr[arr.length] = hex_table[c];
        continue;
      }

      if (c < 0x800) {
        arr[arr.length] = hex_table[0xc0 | (c >> 6)]! + hex_table[0x80 | (c & 0x3f)];
        continue;
      }

      if (c < 0xd800 || c >= 0xe000) {
        arr[arr.length] =
          hex_table[0xe0 | (c >> 12)]! + hex_table[0x80 | ((c >> 6) & 0x3f)] + hex_table[0x80 | (c & 0x3f)];
        continue;
      }

      i += 1;
      c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));

      arr[arr.length] =
        hex_table[0xf0 | (c >> 18)]! +
        hex_table[0x80 | ((c >> 12) & 0x3f)] +
        hex_table[0x80 | ((c >> 6) & 0x3f)] +
        hex_table[0x80 | (c & 0x3f)];
    }

    out += arr.join('');
  }

  return out;
};

export function compact(value: any) {
  const queue = [{ obj: { o: value }, prop: 'o' }];
  const refs = [];

  for (let i = 0; i < queue.length; ++i) {
    const item = queue[i];
    // @ts-ignore
    const obj = item.obj[item.prop];

    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; ++j) {
      const key = keys[j]!;
      const val = obj[key];
      if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
        queue.push({ obj: obj, prop: key });
        refs.push(val);
      }
    }
  }

  compact_queue(queue);

  return value;
}

export function is_regexp(obj: any) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}

export function is_buffer(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}

export function combine(a: any, b: any) {
  return [].concat(a, b);
}

export function maybe_map<T>(val: T[], fn: (v: T) => T) {
  if (isArray(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]!));
    }
    return mapped;
  }
  return fn(val);
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './utils/values';
export * from './utils/base64';
export * from './utils/env';
export * from './utils/log';
export * from './utils/uuid';
export * from './utils/sleep';


import Option from "./Option.ts";
export const removeBrackets = (v: string) => v.replace(/[<[].+/, '').trim();
export const findAllBrackets = (v: string) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];

  const parse = (match: string[]) => {
    let variadic = false;
    let value = match[1];

    if (value.startsWith('...')) {
      value = value.slice(3);
      variadic = true;
    }

    return {
      required: match[0].startsWith('<'),
      value,
      variadic
    };
  };

  let angledMatch;

  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }

  let squareMatch;

  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }

  return res;
};
interface MriOptions {
  alias: {
    [k: string]: string[];
  };
  boolean: string[];
}
export const getMriOptions = (options: Option[]) => {
  const result: MriOptions = {
    alias: {},
    boolean: []
  };

  for (const [index, option] of options.entries()) {
    // We do not set default values in mri options
    // Since its type (typeof) will be used to cast parsed arguments.
    // Which mean `--foo foo` will be parsed as `{foo: true}` if we have `{default:{foo: true}}`
    // Set alias
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    } // Set boolean


    if (option.isBoolean) {
      if (option.negated) {
        // For negated option
        // We only set it to `boolean` type when there's no string-type option with the same name
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some(name => option.names.includes(name)) && typeof o.required === 'boolean';
        });

        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
  }

  return result;
};
export const findLongest = (arr: string[]) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};
export const padRight = (str: string, length: number) => {
  return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`;
};
export const camelcase = (input: string) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
export const setDotProp = (obj: {
  [k: string]: any;
}, keys: string[], val: any) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;

  for (; i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf('.') || !(+keys[i + 1] > -1) ? {} : [];
  }
};
export const setByType = (obj: {
  [k: string]: any;
}, transforms: {
  [k: string]: any;
}) => {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key];

    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key]);

      if (typeof transform.transformFunction === 'function') {
        obj[key] = obj[key].map(transform.transformFunction);
      }
    }
  }
};
export const getFileName = (input: string) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : '';
};
export const camelcaseOptionName = (name: string) => {
  // Camelcase the option name
  // Don't camelcase anything after the dot `.`
  return name.split('.').map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join('.');
};
export class CACError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }

}

import { RFC1738 } from './formats';
import type { DefaultEncoder, Format } from './types';
import { isArray } from '../utils/values';

export let has = (obj: object, key: PropertyKey): boolean => (
  (has = (Object as any).hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
  has(obj, key)
);

const hex_table = /* @__PURE__ */ (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
  }

  return array;
})();

function compact_queue<T extends Record<string, any>>(queue: Array<{ obj: T; prop: string }>) {
  while (queue.length > 1) {
    const item = queue.pop();
    if (!item) continue;

    const obj = item.obj[item.prop];

    if (isArray(obj)) {
      const compacted: unknown[] = [];

      for (let j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== 'undefined') {
          compacted.push(obj[j]);
        }
      }

      // @ts-ignore
      item.obj[item.prop] = compacted;
    }
  }
}

function array_to_object(source: any[], options: { plainObjects: boolean }) {
  const obj = options && options.plainObjects ? Object.create(null) : {};
  for (let i = 0; i < source.length; ++i) {
    if (typeof source[i] !== 'undefined') {
      obj[i] = source[i];
    }
  }

  return obj;
}

export function merge(
  target: any,
  source: any,
  options: { plainObjects?: boolean; allowPrototypes?: boolean } = {},
) {
  if (!source) {
    return target;
  }

  if (typeof source !== 'object') {
    if (isArray(target)) {
      target.push(source);
    } else if (target && typeof target === 'object') {
      if ((options && (options.plainObjects || options.allowPrototypes)) || !has(Object.prototype, source)) {
        target[source] = true;
      }
    } else {
      return [target, source];
    }

    return target;
  }

  if (!target || typeof target !== 'object') {
    return [target].concat(source);
  }

  let mergeTarget = target;
  if (isArray(target) && !isArray(source)) {
    // @ts-ignore
    mergeTarget = array_to_object(target, options);
  }

  if (isArray(target) && isArray(source)) {
    source.forEach(function (item, i) {
      if (has(target, i)) {
        const targetItem = target[i];
        if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
          target[i] = merge(targetItem, item, options);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }

  return Object.keys(source).reduce(function (acc, key) {
    const value = source[key];

    if (has(acc, key)) {
      acc[key] = merge(acc[key], value, options);
    } else {
      acc[key] = value;
    }
    return acc;
  }, mergeTarget);
}

export function assign_single_source(target: any, source: any) {
  return Object.keys(source).reduce(function (acc, key) {
    acc[key] = source[key];
    return acc;
  }, target);
}

export function decode(str: string, _: any, charset: string) {
  const strWithoutPlus = str.replace(/\+/g, ' ');
  if (charset === 'iso-8859-1') {
    // unescape never throws, no try...catch needed:
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  }
  // utf-8
  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e) {
    return strWithoutPlus;
  }
}

const limit = 1024;

export const encode: (
  str: any,
  defaultEncoder: DefaultEncoder,
  charset: string,
  type: 'key' | 'value',
  format: Format,
) => string = (str, _defaultEncoder, charset, _kind, format: Format) => {
  // This code was originally written by Brian White for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) {
    return str;
  }

  let string = str;
  if (typeof str === 'symbol') {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== 'string') {
    string = String(str);
  }

  if (charset === 'iso-8859-1') {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
      return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
    });
  }

  let out = '';
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];

    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (
        c === 0x2d || // -
        c === 0x2e || // .
        c === 0x5f || // _
        c === 0x7e || // ~
        (c >= 0x30 && c <= 0x39) || // 0-9
        (c >= 0x41 && c <= 0x5a) || // a-z
        (c >= 0x61 && c <= 0x7a) || // A-Z
        (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
      ) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }

      if (c < 0x80) {
        arr[arr.length] = hex_table[c];
        continue;
      }

      if (c < 0x800) {
        arr[arr.length] = hex_table[0xc0 | (c >> 6)]! + hex_table[0x80 | (c & 0x3f)];
        continue;
      }

      if (c < 0xd800 || c >= 0xe000) {
        arr[arr.length] =
          hex_table[0xe0 | (c >> 12)]! + hex_table[0x80 | ((c >> 6) & 0x3f)] + hex_table[0x80 | (c & 0x3f)];
        continue;
      }

      i += 1;
      c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));

      arr[arr.length] =
        hex_table[0xf0 | (c >> 18)]! +
        hex_table[0x80 | ((c >> 12) & 0x3f)] +
        hex_table[0x80 | ((c >> 6) & 0x3f)] +
        hex_table[0x80 | (c & 0x3f)];
    }

    out += arr.join('');
  }

  return out;
};

export function compact(value: any) {
  const queue = [{ obj: { o: value }, prop: 'o' }];
  const refs = [];

  for (let i = 0; i < queue.length; ++i) {
    const item = queue[i];
    // @ts-ignore
    const obj = item.obj[item.prop];

    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; ++j) {
      const key = keys[j]!;
      const val = obj[key];
      if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
        queue.push({ obj: obj, prop: key });
        refs.push(val);
      }
    }
  }

  compact_queue(queue);

  return value;
}

export function is_regexp(obj: any) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
}

export function is_buffer(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}

export function combine(a: any, b: any) {
  return [].concat(a, b);
}

export function maybe_map<T>(val: T[], fn: (v: T) => T) {
  if (isArray(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]!));
    }
    return mapped;
  }
  return fn(val);
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './utils/values';
export * from './utils/base64';
export * from './utils/env';
export * from './utils/log';
export * from './utils/uuid';
export * from './utils/sleep';
