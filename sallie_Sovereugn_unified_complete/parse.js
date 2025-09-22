"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultParseResponse = defaultParseResponse;
exports.addRequestID = addRequestID;
const streaming_1 = require("../core/streaming.js");
const log_1 = require("./utils/log.js");
async function defaultParseResponse(client, props) {
    const { response, requestLogID, retryOfRequestLogID, startTime } = props;
    const body = await (async () => {
        if (props.options.stream) {
            (0, log_1.loggerFor)(client).debug('response', response.status, response.url, response.headers, response.body);
            // Note: there is an invariant here that isn't represented in the type system
            // that if you set `stream: true` the response type must also be `Stream<T>`
            if (props.options.__streamClass) {
                return props.options.__streamClass.fromSSEResponse(response, props.controller, client);
            }
            return streaming_1.Stream.fromSSEResponse(response, props.controller, client);
        }
        // fetch refuses to read the body when the status code is 204.
        if (response.status === 204) {
            return null;
        }
        if (props.options.__binaryResponse) {
            return response;
        }
        const contentType = response.headers.get('content-type');
        const mediaType = contentType?.split(';')[0]?.trim();
        const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
        if (isJSON) {
            const json = await response.json();
            return addRequestID(json, response);
        }
        const text = await response.text();
        return text;
    })();
    (0, log_1.loggerFor)(client).debug(`[${requestLogID}] response parsed`, (0, log_1.formatRequestDetails)({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        body,
        durationMs: Date.now() - startTime,
    }));
    return body;
}
function addRequestID(value, response) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    return Object.defineProperty(value, '_request_id', {
        value: response.headers.get('x-request-id'),
        enumerable: false,
    });
}
//# sourceMappingURL=parse.js.map

'use strict';

const constants = require('./constants');
const utils = require('./utils');

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants.globChars(opts.windows);
  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || '';
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.output = (prev.output || prev.value) + tok.value;
      prev.value += tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse(rest, { ...options, fastpaths: false }).output;

        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants.globChars(opts.windows);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

module.exports = parse;


'use strict'

let Container = require('./container')
let Input = require('./input')
let Parser = require('./parser')

function parse(css, opts) {
  let input = new Input(css, opts)
  let parser = new Parser(input)
  try {
    parser.parse()
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      if (e.name === 'CssSyntaxError' && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse SCSS with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-scss parser'
        } else if (/\.sass/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Sass with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-sass parser'
        } else if (/\.less$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Less with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-less parser'
        }
      }
    }
    throw e
  }

  return parser.root
}

module.exports = parse
parse.default = parse

Container.registerParse(parse)


'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowEmptyArrays: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decodeDotInKeys: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    duplicates: 'combine',
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictDepth: false,
    strictNullHandling: false,
    throwOnLimitExceeded: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options, currentArrayLength) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = { __proto__: null };

    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    cleanStr = cleanStr.replace(/%5B/gi, '[').replace(/%5D/gi, ']');

    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(
        options.delimiter,
        options.throwOnLimitExceeded ? limit + 1 : limit
    );

    if (options.throwOnLimitExceeded && parts.length > limit) {
        throw new RangeError('Parameter limit exceeded. Only ' + limit + ' parameter' + (limit === 1 ? '' : 's') + ' allowed.');
    }

    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key;
        var val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');

            val = utils.maybeMap(
                parseArrayValue(
                    part.slice(pos + 1),
                    options,
                    isArray(obj[key]) ? obj[key].length : 0
                ),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(String(val));
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        var existing = has.call(obj, key);
        if (existing && options.duplicates === 'combine') {
            obj[key] = utils.combine(obj[key], val);
        } else if (!existing || options.duplicates === 'last') {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var currentArrayLength = 0;
    if (chain.length > 0 && chain[chain.length - 1] === '[]') {
        var parentKey = chain.slice(0, -1).join('');
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
    }

    var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
                ? []
                : utils.combine([], leaf);
        } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== decodedRoot
                && String(index) === decodedRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else if (decodedRoot !== '__proto__') {
                obj[decodedRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, check strictDepth option for throw, else just add whatever is left

    if (segment) {
        if (options.strictDepth === true) {
            throw new RangeError('Input depth exceeded depth option of ' + options.depth + ' and strictDepth is true');
        }
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
        throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.decoder !== null && typeof opts.decoder !== 'undefined' && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    if (typeof opts.throwOnLimitExceeded !== 'undefined' && typeof opts.throwOnLimitExceeded !== 'boolean') {
        throw new TypeError('`throwOnLimitExceeded` option must be a boolean');
    }

    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    var duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;

    if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
        throw new TypeError('The duplicates option must be either combine, first, or last');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

    return {
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        duplicates: duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === 'boolean' ? !!opts.strictDepth : defaults.strictDepth,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === 'boolean' ? opts.throwOnLimitExceeded : false
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? { __proto__: null } : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? { __proto__: null } : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};


'use strict';

var test = require('tape');
var hasPropertyDescriptors = require('has-property-descriptors')();
var iconv = require('iconv-lite');
var mockProperty = require('mock-property');
var hasOverrideMistake = require('has-override-mistake')();
var SaferBuffer = require('safer-buffer').Buffer;
var v = require('es-value-fixtures');
var inspect = require('object-inspect');
var emptyTestCases = require('./empty-keys-cases').emptyTestCases;
var hasProto = require('has-proto')();

var qs = require('../');
var utils = require('../lib/utils');

test('parse()', function (t) {
    t.test('parses a simple string', function (st) {
        st.deepEqual(qs.parse('0=foo'), { 0: 'foo' });
        st.deepEqual(qs.parse('foo=c++'), { foo: 'c  ' });
        st.deepEqual(qs.parse('a[>=]=23'), { a: { '>=': '23' } });
        st.deepEqual(qs.parse('a[<=>]==23'), { a: { '<=>': '=23' } });
        st.deepEqual(qs.parse('a[==]=23'), { a: { '==': '23' } });
        st.deepEqual(qs.parse('foo', { strictNullHandling: true }), { foo: null });
        st.deepEqual(qs.parse('foo'), { foo: '' });
        st.deepEqual(qs.parse('foo='), { foo: '' });
        st.deepEqual(qs.parse('foo=bar'), { foo: 'bar' });
        st.deepEqual(qs.parse(' foo = bar = baz '), { ' foo ': ' bar = baz ' });
        st.deepEqual(qs.parse('foo=bar=baz'), { foo: 'bar=baz' });
        st.deepEqual(qs.parse('foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' });
        st.deepEqual(qs.parse('foo2=bar2&baz2='), { foo2: 'bar2', baz2: '' });
        st.deepEqual(qs.parse('foo=bar&baz', { strictNullHandling: true }), { foo: 'bar', baz: null });
        st.deepEqual(qs.parse('foo=bar&baz'), { foo: 'bar', baz: '' });
        st.deepEqual(qs.parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World'), {
            cht: 'p3',
            chd: 't:60,40',
            chs: '250x100',
            chl: 'Hello|World'
        });
        st.end();
    });

    t.test('comma: false', function (st) {
        st.deepEqual(qs.parse('a[]=b&a[]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[0]=b&a[1]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b,c'), { a: 'b,c' });
        st.deepEqual(qs.parse('a=b&a=c'), { a: ['b', 'c'] });
        st.end();
    });

    t.test('comma: true', function (st) {
        st.deepEqual(qs.parse('a[]=b&a[]=c', { comma: true }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { comma: true }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b,c', { comma: true }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a=c', { comma: true }), { a: ['b', 'c'] });
        st.end();
    });

    t.test('allows enabling dot notation', function (st) {
        st.deepEqual(qs.parse('a.b=c'), { 'a.b': 'c' });
        st.deepEqual(qs.parse('a.b=c', { allowDots: true }), { a: { b: 'c' } });

        st.end();
    });

    t.test('decode dot keys correctly', function (st) {
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe', { allowDots: false, decodeDotInKeys: false }),
            { 'name%2Eobj.first': 'John', 'name%2Eobj.last': 'Doe' },
            'with allowDots false and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse('name.obj.first=John&name.obj.last=Doe', { allowDots: true, decodeDotInKeys: false }),
            { name: { obj: { first: 'John', last: 'Doe' } } },
            'with allowDots false and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe', { allowDots: true, decodeDotInKeys: false }),
            { 'name%2Eobj': { first: 'John', last: 'Doe' } },
            'with allowDots true and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe', { allowDots: true, decodeDotInKeys: true }),
            { 'name.obj': { first: 'John', last: 'Doe' } },
            'with allowDots true and decodeDotInKeys true'
        );

        st.deepEqual(
            qs.parse(
                'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
                { allowDots: false, decodeDotInKeys: false }
            ),
            { 'name%2Eobj%2Esubobject.first%2Egodly%2Ename': 'John', 'name%2Eobj%2Esubobject.last': 'Doe' },
            'with allowDots false and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse(
                'name.obj.subobject.first.godly.name=John&name.obj.subobject.last=Doe',
                { allowDots: true, decodeDotInKeys: false }
            ),
            { name: { obj: { subobject: { first: { godly: { name: 'John' } }, last: 'Doe' } } } },
            'with allowDots true and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse(
                'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
                { allowDots: true, decodeDotInKeys: true }
            ),
            { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
            'with allowDots true and decodeDotInKeys true'
        );
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe'),
            { 'name%2Eobj.first': 'John', 'name%2Eobj.last': 'Doe' },
            'with allowDots and decodeDotInKeys undefined'
        );

        st.end();
    });

    t.test('decodes dot in key of object, and allow enabling dot notation when decodeDotInKeys is set to true and allowDots is undefined', function (st) {
        st.deepEqual(
            qs.parse(
                'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
                { decodeDotInKeys: true }
            ),
            { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
            'with allowDots undefined and decodeDotInKeys true'
        );

        st.end();
    });

    t.test('throws when decodeDotInKeys is not of type boolean', function (st) {
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: 0 }); },
            TypeError
        );
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: null }); },
            TypeError
        );

        st.end();
    });

    t.test('allows empty arrays in obj values', function (st) {
        st.deepEqual(qs.parse('foo[]&bar=baz', { allowEmptyArrays: true }), { foo: [], bar: 'baz' });
        st.deepEqual(qs.parse('foo[]&bar=baz', { allowEmptyArrays: false }), { foo: [''], bar: 'baz' });

        st.end();
    });

    t.test('throws when allowEmptyArrays is not of type boolean', function (st) {
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: 0 }); },
            TypeError
        );
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: null }); },
            TypeError
        );

        st.end();
    });

    t.test('allowEmptyArrays + strictNullHandling', function (st) {
        st.deepEqual(
            qs.parse('testEmptyArray[]', { strictNullHandling: true, allowEmptyArrays: true }),
            { testEmptyArray: [] }
        );

        st.end();
    });

    t.deepEqual(qs.parse('a[b]=c'), { a: { b: 'c' } }, 'parses a single nested string');
    t.deepEqual(qs.parse('a[b][c]=d'), { a: { b: { c: 'd' } } }, 'parses a double nested string');
    t.deepEqual(
        qs.parse('a[b][c][d][e][f][g][h]=i'),
        { a: { b: { c: { d: { e: { f: { '[g][h]': 'i' } } } } } } },
        'defaults to a depth of 5'
    );

    t.test('only parses one level when depth = 1', function (st) {
        st.deepEqual(qs.parse('a[b][c]=d', { depth: 1 }), { a: { b: { '[c]': 'd' } } });
        st.deepEqual(qs.parse('a[b][c][d]=e', { depth: 1 }), { a: { b: { '[c][d]': 'e' } } });
        st.end();
    });

    t.test('uses original key when depth = 0', function (st) {
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { depth: 0 }), { 'a[0]': 'b', 'a[1]': 'c' });
        st.deepEqual(qs.parse('a[0][0]=b&a[0][1]=c&a[1]=d&e=2', { depth: 0 }), { 'a[0][0]': 'b', 'a[0][1]': 'c', 'a[1]': 'd', e: '2' });
        st.end();
    });

    t.test('uses original key when depth = false', function (st) {
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { depth: false }), { 'a[0]': 'b', 'a[1]': 'c' });
        st.deepEqual(qs.parse('a[0][0]=b&a[0][1]=c&a[1]=d&e=2', { depth: false }), { 'a[0][0]': 'b', 'a[0][1]': 'c', 'a[1]': 'd', e: '2' });
        st.end();
    });

    t.deepEqual(qs.parse('a=b&a=c'), { a: ['b', 'c'] }, 'parses a simple array');

    t.test('parses an explicit array', function (st) {
        st.deepEqual(qs.parse('a[]=b'), { a: ['b'] });
        st.deepEqual(qs.parse('a[]=b&a[]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a[]=c&a[]=d'), { a: ['b', 'c', 'd'] });
        st.end();
    });

    t.test('parses a mix of simple and explicit arrays', function (st) {
        st.deepEqual(qs.parse('a=b&a[]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[0]=b&a=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a[0]=c'), { a: ['b', 'c'] });

        st.deepEqual(qs.parse('a[1]=b&a=c', { arrayLimit: 20 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a=c', { arrayLimit: 0 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a=c'), { a: ['b', 'c'] });

        st.deepEqual(qs.parse('a=b&a[1]=c', { arrayLimit: 20 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a[]=c', { arrayLimit: 0 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a[]=c'), { a: ['b', 'c'] });

        st.end();
    });

    t.test('parses a nested array', function (st) {
        st.deepEqual(qs.parse('a[b][]=c&a[b][]=d'), { a: { b: ['c', 'd'] } });
        st.deepEqual(qs.parse('a[>=]=25'), { a: { '>=': '25' } });
        st.end();
    });

    t.test('allows to specify array indices', function (st) {
        st.deepEqual(qs.parse('a[1]=c&a[0]=b&a[2]=d'), { a: ['b', 'c', 'd'] });
        st.deepEqual(qs.parse('a[1]=c&a[0]=b'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[1]=c', { arrayLimit: 20 }), { a: ['c'] });
        st.deepEqual(qs.parse('a[1]=c', { arrayLimit: 0 }), { a: { 1: 'c' } });
        st.deepEqual(qs.parse('a[1]=c'), { a: ['c'] });
        st.end();
    });

    t.test('limits specific array indices to arrayLimit', function (st) {
        st.deepEqual(qs.parse('a[20]=a', { arrayLimit: 20 }), { a: ['a'] });
        st.deepEqual(qs.parse('a[21]=a', { arrayLimit: 20 }), { a: { 21: 'a' } });

        st.deepEqual(qs.parse('a[20]=a'), { a: ['a'] });
        st.deepEqual(qs.parse('a[21]=a'), { a: { 21: 'a' } });
        st.end();
    });

    t.deepEqual(qs.parse('a[12b]=c'), { a: { '12b': 'c' } }, 'supports keys that begin with a number');

    t.test('supports encoded = signs', function (st) {
        st.deepEqual(qs.parse('he%3Dllo=th%3Dere'), { 'he=llo': 'th=ere' });
        st.end();
    });

    t.test('is ok with url encoded strings', function (st) {
        st.deepEqual(qs.parse('a[b%20c]=d'), { a: { 'b c': 'd' } });
        st.deepEqual(qs.parse('a[b]=c%20d'), { a: { b: 'c d' } });
        st.end();
    });

    t.test('allows brackets in the value', function (st) {
        st.deepEqual(qs.parse('pets=["tobi"]'), { pets: '["tobi"]' });
        st.deepEqual(qs.parse('operators=[">=", "<="]'), { operators: '[">=", "<="]' });
        st.end();
    });

    t.test('allows empty values', function (st) {
        st.deepEqual(qs.parse(''), {});
        st.deepEqual(qs.parse(null), {});
        st.deepEqual(qs.parse(undefined), {});
        st.end();
    });

    t.test('transforms arrays to objects', function (st) {
        st.deepEqual(qs.parse('foo[0]=bar&foo[bad]=baz'), { foo: { 0: 'bar', bad: 'baz' } });
        st.deepEqual(qs.parse('foo[bad]=baz&foo[0]=bar'), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo[bad]=baz&foo[]=bar'), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo[]=bar&foo[bad]=baz'), { foo: { 0: 'bar', bad: 'baz' } });
        st.deepEqual(qs.parse('foo[bad]=baz&foo[]=bar&foo[]=foo'), { foo: { bad: 'baz', 0: 'bar', 1: 'foo' } });
        st.deepEqual(qs.parse('foo[0][a]=a&foo[0][b]=b&foo[1][a]=aa&foo[1][b]=bb'), { foo: [{ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }] });

        st.deepEqual(qs.parse('a[]=b&a[t]=u&a[hasOwnProperty]=c', { allowPrototypes: false }), { a: { 0: 'b', t: 'u' } });
        st.deepEqual(qs.parse('a[]=b&a[t]=u&a[hasOwnProperty]=c', { allowPrototypes: true }), { a: { 0: 'b', t: 'u', hasOwnProperty: 'c' } });
        st.deepEqual(qs.parse('a[]=b&a[hasOwnProperty]=c&a[x]=y', { allowPrototypes: false }), { a: { 0: 'b', x: 'y' } });
        st.deepEqual(qs.parse('a[]=b&a[hasOwnProperty]=c&a[x]=y', { allowPrototypes: true }), { a: { 0: 'b', hasOwnProperty: 'c', x: 'y' } });
        st.end();
    });

    t.test('transforms arrays to objects (dot notation)', function (st) {
        st.deepEqual(qs.parse('foo[0].baz=bar&fool.bad=baz', { allowDots: true }), { foo: [{ baz: 'bar' }], fool: { bad: 'baz' } });
        st.deepEqual(qs.parse('foo[0].baz=bar&fool.bad.boo=baz', { allowDots: true }), { foo: [{ baz: 'bar' }], fool: { bad: { boo: 'baz' } } });
        st.deepEqual(qs.parse('foo[0][0].baz=bar&fool.bad=baz', { allowDots: true }), { foo: [[{ baz: 'bar' }]], fool: { bad: 'baz' } });
        st.deepEqual(qs.parse('foo[0].baz[0]=15&foo[0].bar=2', { allowDots: true }), { foo: [{ baz: ['15'], bar: '2' }] });
        st.deepEqual(qs.parse('foo[0].baz[0]=15&foo[0].baz[1]=16&foo[0].bar=2', { allowDots: true }), { foo: [{ baz: ['15', '16'], bar: '2' }] });
        st.deepEqual(qs.parse('foo.bad=baz&foo[0]=bar', { allowDots: true }), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo.bad=baz&foo[]=bar', { allowDots: true }), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo[]=bar&foo.bad=baz', { allowDots: true }), { foo: { 0: 'bar', bad: 'baz' } });
        st.deepEqual(qs.parse('foo.bad=baz&foo[]=bar&foo[]=foo', { allowDots: true }), { foo: { bad: 'baz', 0: 'bar', 1: 'foo' } });
        st.deepEqual(qs.parse('foo[0].a=a&foo[0].b=b&foo[1].a=aa&foo[1].b=bb', { allowDots: true }), { foo: [{ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }] });
        st.end();
    });

    t.test('correctly prunes undefined values when converting an array to an object', function (st) {
        st.deepEqual(qs.parse('a[2]=b&a[99999999]=c'), { a: { 2: 'b', 99999999: 'c' } });
        st.end();
    });

    t.test('supports malformed uri characters', function (st) {
        st.deepEqual(qs.parse('{%:%}', { strictNullHandling: true }), { '{%:%}': null });
        st.deepEqual(qs.parse('{%:%}='), { '{%:%}': '' });
        st.deepEqual(qs.parse('foo=%:%}'), { foo: '%:%}' });
        st.end();
    });

    t.test('doesn\'t produce empty keys', function (st) {
        st.deepEqual(qs.parse('_r=1&'), { _r: '1' });
        st.end();
    });

    t.test('cannot access Object prototype', function (st) {
        qs.parse('constructor[prototype][bad]=bad');
        qs.parse('bad[constructor][prototype][bad]=bad');
        st.equal(typeof Object.prototype.bad, 'undefined');
        st.end();
    });

    t.test('parses arrays of objects', function (st) {
        st.deepEqual(qs.parse('a[][b]=c'), { a: [{ b: 'c' }] });
        st.deepEqual(qs.parse('a[0][b]=c'), { a: [{ b: 'c' }] });
        st.end();
    });

    t.test('allows for empty strings in arrays', function (st) {
        st.deepEqual(qs.parse('a[]=b&a[]=&a[]=c'), { a: ['b', '', 'c'] });

        st.deepEqual(
            qs.parse('a[0]=b&a[1]&a[2]=c&a[19]=', { strictNullHandling: true, arrayLimit: 20 }),
            { a: ['b', null, 'c', ''] },
            'with arrayLimit 20 + array indices: null then empty string works'
        );
        st.deepEqual(
            qs.parse('a[]=b&a[]&a[]=c&a[]=', { strictNullHandling: true, arrayLimit: 0 }),
            { a: ['b', null, 'c', ''] },
            'with arrayLimit 0 + array brackets: null then empty string works'
        );

        st.deepEqual(
            qs.parse('a[0]=b&a[1]=&a[2]=c&a[19]', { strictNullHandling: true, arrayLimit: 20 }),
            { a: ['b', '', 'c', null] },
            'with arrayLimit 20 + array indices: empty string then null works'
        );
        st.deepEqual(
            qs.parse('a[]=b&a[]=&a[]=c&a[]', { strictNullHandling: true, arrayLimit: 0 }),
            { a: ['b', '', 'c', null] },
            'with arrayLimit 0 + array brackets: empty string then null works'
        );

        st.deepEqual(
            qs.parse('a[]=&a[]=b&a[]=c'),
            { a: ['', 'b', 'c'] },
            'array brackets: empty strings work'
        );
        st.end();
    });

    t.test('compacts sparse arrays', function (st) {
        st.deepEqual(qs.parse('a[10]=1&a[2]=2', { arrayLimit: 20 }), { a: ['2', '1'] });
        st.deepEqual(qs.parse('a[1][b][2][c]=1', { arrayLimit: 20 }), { a: [{ b: [{ c: '1' }] }] });
        st.deepEqual(qs.parse('a[1][2][3][c]=1', { arrayLimit: 20 }), { a: [[[{ c: '1' }]]] });
        st.deepEqual(qs.parse('a[1][2][3][c][1]=1', { arrayLimit: 20 }), { a: [[[{ c: ['1'] }]]] });
        st.end();
    });

    t.test('parses sparse arrays', function (st) {
        /* eslint no-sparse-arrays: 0 */
        st.deepEqual(qs.parse('a[4]=1&a[1]=2', { allowSparse: true }), { a: [, '2', , , '1'] });
        st.deepEqual(qs.parse('a[1][b][2][c]=1', { allowSparse: true }), { a: [, { b: [, , { c: '1' }] }] });
        st.deepEqual(qs.parse('a[1][2][3][c]=1', { allowSparse: true }), { a: [, [, , [, , , { c: '1' }]]] });
        st.deepEqual(qs.parse('a[1][2][3][c][1]=1', { allowSparse: true }), { a: [, [, , [, , , { c: [, '1'] }]]] });
        st.end();
    });

    t.test('parses semi-parsed strings', function (st) {
        st.deepEqual(qs.parse({ 'a[b]': 'c' }), { a: { b: 'c' } });
        st.deepEqual(qs.parse({ 'a[b]': 'c', 'a[d]': 'e' }), { a: { b: 'c', d: 'e' } });
        st.end();
    });

    t.test('parses buffers correctly', function (st) {
        var b = SaferBuffer.from('test');
        st.deepEqual(qs.parse({ a: b }), { a: b });
        st.end();
    });

    t.test('parses jquery-param strings', function (st) {
        // readable = 'filter[0][]=int1&filter[0][]==&filter[0][]=77&filter[]=and&filter[2][]=int2&filter[2][]==&filter[2][]=8'
        var encoded = 'filter%5B0%5D%5B%5D=int1&filter%5B0%5D%5B%5D=%3D&filter%5B0%5D%5B%5D=77&filter%5B%5D=and&filter%5B2%5D%5B%5D=int2&filter%5B2%5D%5B%5D=%3D&filter%5B2%5D%5B%5D=8';
        var expected = { filter: [['int1', '=', '77'], 'and', ['int2', '=', '8']] };
        st.deepEqual(qs.parse(encoded), expected);
        st.end();
    });

    t.test('continues parsing when no parent is found', function (st) {
        st.deepEqual(qs.parse('[]=&a=b'), { 0: '', a: 'b' });
        st.deepEqual(qs.parse('[]&a=b', { strictNullHandling: true }), { 0: null, a: 'b' });
        st.deepEqual(qs.parse('[foo]=bar'), { foo: 'bar' });
        st.end();
    });

    t.test('does not error when parsing a very long array', function (st) {
        var str = 'a[]=a';
        while (Buffer.byteLength(str) < 128 * 1024) {
            str = str + '&' + str;
        }

        st.doesNotThrow(function () {
            qs.parse(str);
        });

        st.end();
    });

    t.test('does not throw when a native prototype has an enumerable property', function (st) {
        st.intercept(Object.prototype, 'crash', { value: '' });
        st.intercept(Array.prototype, 'crash', { value: '' });

        st.doesNotThrow(qs.parse.bind(null, 'a=b'));
        st.deepEqual(qs.parse('a=b'), { a: 'b' });
        st.doesNotThrow(qs.parse.bind(null, 'a[][b]=c'));
        st.deepEqual(qs.parse('a[][b]=c'), { a: [{ b: 'c' }] });

        st.end();
    });

    t.test('parses a string with an alternative string delimiter', function (st) {
        st.deepEqual(qs.parse('a=b;c=d', { delimiter: ';' }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('parses a string with an alternative RegExp delimiter', function (st) {
        st.deepEqual(qs.parse('a=b; c=d', { delimiter: /[;,] */ }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('does not use non-splittable objects as delimiters', function (st) {
        st.deepEqual(qs.parse('a=b&c=d', { delimiter: true }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('allows overriding parameter limit', function (st) {
        st.deepEqual(qs.parse('a=b&c=d', { parameterLimit: 1 }), { a: 'b' });
        st.end();
    });

    t.test('allows setting the parameter limit to Infinity', function (st) {
        st.deepEqual(qs.parse('a=b&c=d', { parameterLimit: Infinity }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('allows overriding array limit', function (st) {
        st.deepEqual(qs.parse('a[0]=b', { arrayLimit: -1 }), { a: { 0: 'b' } });
        st.deepEqual(qs.parse('a[0]=b', { arrayLimit: 0 }), { a: ['b'] });

        st.deepEqual(qs.parse('a[-1]=b', { arrayLimit: -1 }), { a: { '-1': 'b' } });
        st.deepEqual(qs.parse('a[-1]=b', { arrayLimit: 0 }), { a: { '-1': 'b' } });

        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { arrayLimit: -1 }), { a: { 0: 'b', 1: 'c' } });
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { arrayLimit: 0 }), { a: { 0: 'b', 1: 'c' } });

        st.end();
    });

    t.test('allows disabling array parsing', function (st) {
        var indices = qs.parse('a[0]=b&a[1]=c', { parseArrays: false });
        st.deepEqual(indices, { a: { 0: 'b', 1: 'c' } });
        st.equal(Array.isArray(indices.a), false, 'parseArrays:false, indices case is not an array');

        var emptyBrackets = qs.parse('a[]=b', { parseArrays: false });
        st.deepEqual(emptyBrackets, { a: { 0: 'b' } });
        st.equal(Array.isArray(emptyBrackets.a), false, 'parseArrays:false, empty brackets case is not an array');

        st.end();
    });

    t.test('allows for query string prefix', function (st) {
        st.deepEqual(qs.parse('?foo=bar', { ignoreQueryPrefix: true }), { foo: 'bar' });
        st.deepEqual(qs.parse('foo=bar', { ignoreQueryPrefix: true }), { foo: 'bar' });
        st.deepEqual(qs.parse('?foo=bar', { ignoreQueryPrefix: false }), { '?foo': 'bar' });

        st.end();
    });

    t.test('parses an object', function (st) {
        var input = {
            'user[name]': { 'pop[bob]': 3 },
            'user[email]': null
        };

        var expected = {
            user: {
                name: { 'pop[bob]': 3 },
                email: null
            }
        };

        var result = qs.parse(input);

        st.deepEqual(result, expected);
        st.end();
    });

    t.test('parses string with comma as array divider', function (st) {
        st.deepEqual(qs.parse('foo=bar,tee', { comma: true }), { foo: ['bar', 'tee'] });
        st.deepEqual(qs.parse('foo[bar]=coffee,tee', { comma: true }), { foo: { bar: ['coffee', 'tee'] } });
        st.deepEqual(qs.parse('foo=', { comma: true }), { foo: '' });
        st.deepEqual(qs.parse('foo', { comma: true }), { foo: '' });
        st.deepEqual(qs.parse('foo', { comma: true, strictNullHandling: true }), { foo: null });

        // test cases inversed from from stringify tests
        st.deepEqual(qs.parse('a[0]=c'), { a: ['c'] });
        st.deepEqual(qs.parse('a[]=c'), { a: ['c'] });
        st.deepEqual(qs.parse('a[]=c', { comma: true }), { a: ['c'] });

        st.deepEqual(qs.parse('a[0]=c&a[1]=d'), { a: ['c', 'd'] });
        st.deepEqual(qs.parse('a[]=c&a[]=d'), { a: ['c', 'd'] });
        st.deepEqual(qs.parse('a=c,d', { comma: true }), { a: ['c', 'd'] });

        st.end();
    });

    t.test('parses values with comma as array divider', function (st) {
        st.deepEqual(qs.parse({ foo: 'bar,tee' }, { comma: false }), { foo: 'bar,tee' });
        st.deepEqual(qs.parse({ foo: 'bar,tee' }, { comma: true }), { foo: ['bar', 'tee'] });
        st.end();
    });

    t.test('use number decoder, parses string that has one number with comma option enabled', function (st) {
        var decoder = function (str, defaultDecoder, charset, type) {
            if (!isNaN(Number(str))) {
                return parseFloat(str);
            }
            return defaultDecoder(str, defaultDecoder, charset, type);
        };

        st.deepEqual(qs.parse('foo=1', { comma: true, decoder: decoder }), { foo: 1 });
        st.deepEqual(qs.parse('foo=0', { comma: true, decoder: decoder }), { foo: 0 });

        st.end();
    });

    t.test('parses brackets holds array of arrays when having two parts of strings with comma as array divider', function (st) {
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=4,5,6', { comma: true }), { foo: [['1', '2', '3'], ['4', '5', '6']] });
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=', { comma: true }), { foo: [['1', '2', '3'], ''] });
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=,', { comma: true }), { foo: [['1', '2', '3'], ['', '']] });
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=a', { comma: true }), { foo: [['1', '2', '3'], 'a'] });

        st.end();
    });

    t.test('parses url-encoded brackets holds array of arrays when having two parts of strings with comma as array divider', function (st) {
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=4,5,6', { comma: true }), { foo: [['1', '2', '3'], ['4', '5', '6']] });
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=', { comma: true }), { foo: [['1', '2', '3'], ''] });
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=,', { comma: true }), { foo: [['1', '2', '3'], ['', '']] });
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=a', { comma: true }), { foo: [['1', '2', '3'], 'a'] });

        st.end();
    });

    t.test('parses comma delimited array while having percent-encoded comma treated as normal text', function (st) {
        st.deepEqual(qs.parse('foo=a%2Cb', { comma: true }), { foo: 'a,b' });
        st.deepEqual(qs.parse('foo=a%2C%20b,d', { comma: true }), { foo: ['a, b', 'd'] });
        st.deepEqual(qs.parse('foo=a%2C%20b,c%2C%20d', { comma: true }), { foo: ['a, b', 'c, d'] });

        st.end();
    });

    t.test('parses an object in dot notation', function (st) {
        var input = {
            'user.name': { 'pop[bob]': 3 },
            'user.email.': null
        };

        var expected = {
            user: {
                name: { 'pop[bob]': 3 },
                email: null
            }
        };

        var result = qs.parse(input, { allowDots: true });

        st.deepEqual(result, expected);
        st.end();
    });

    t.test('parses an object and not child values', function (st) {
        var input = {
            'user[name]': { 'pop[bob]': { test: 3 } },
            'user[email]': null
        };

        var expected = {
            user: {
                name: { 'pop[bob]': { test: 3 } },
                email: null
            }
        };

        var result = qs.parse(input);

        st.deepEqual(result, expected);
        st.end();
    });

    t.test('does not blow up when Buffer global is missing', function (st) {
        var restore = mockProperty(global, 'Buffer', { 'delete': true });

        var result = qs.parse('a=b&c=d');

        restore();

        st.deepEqual(result, { a: 'b', c: 'd' });
        st.end();
    });

    t.test('does not crash when parsing circular references', function (st) {
        var a = {};
        a.b = a;

        var parsed;

        st.doesNotThrow(function () {
            parsed = qs.parse({ 'foo[bar]': 'baz', 'foo[baz]': a });
        });

        st.equal('foo' in parsed, true, 'parsed has "foo" property');
        st.equal('bar' in parsed.foo, true);
        st.equal('baz' in parsed.foo, true);
        st.equal(parsed.foo.bar, 'baz');
        st.deepEqual(parsed.foo.baz, a);
        st.end();
    });

    t.test('does not crash when parsing deep objects', function (st) {
        var parsed;
        var str = 'foo';

        for (var i = 0; i < 5000; i++) {
            str += '[p]';
        }

        str += '=bar';

        st.doesNotThrow(function () {
            parsed = qs.parse(str, { depth: 5000 });
        });

        st.equal('foo' in parsed, true, 'parsed has "foo" property');

        var depth = 0;
        var ref = parsed.foo;
        while ((ref = ref.p)) {
            depth += 1;
        }

        st.equal(depth, 5000, 'parsed is 5000 properties deep');

        st.end();
    });

    t.test('parses null objects correctly', { skip: !hasProto }, function (st) {
        var a = { __proto__: null, b: 'c' };

        st.deepEqual(qs.parse(a), { b: 'c' });
        var result = qs.parse({ a: a });
        st.equal('a' in result, true, 'result has "a" property');
        st.deepEqual(result.a, a);
        st.end();
    });

    t.test('parses dates correctly', function (st) {
        var now = new Date();
        st.deepEqual(qs.parse({ a: now }), { a: now });
        st.end();
    });

    t.test('parses regular expressions correctly', function (st) {
        var re = /^test$/;
        st.deepEqual(qs.parse({ a: re }), { a: re });
        st.end();
    });

    t.test('does not allow overwriting prototype properties', function (st) {
        st.deepEqual(qs.parse('a[hasOwnProperty]=b', { allowPrototypes: false }), {});
        st.deepEqual(qs.parse('hasOwnProperty=b', { allowPrototypes: false }), {});

        st.deepEqual(
            qs.parse('toString', { allowPrototypes: false }),
            {},
            'bare "toString" results in {}'
        );

        st.end();
    });

    t.test('can allow overwriting prototype properties', function (st) {
        st.deepEqual(qs.parse('a[hasOwnProperty]=b', { allowPrototypes: true }), { a: { hasOwnProperty: 'b' } });
        st.deepEqual(qs.parse('hasOwnProperty=b', { allowPrototypes: true }), { hasOwnProperty: 'b' });

        st.deepEqual(
            qs.parse('toString', { allowPrototypes: true }),
            { toString: '' },
            'bare "toString" results in { toString: "" }'
        );

        st.end();
    });

    t.test('does not crash when the global Object prototype is frozen', { skip: !hasPropertyDescriptors || !hasOverrideMistake }, function (st) {
        // We can't actually freeze the global Object prototype as that will interfere with other tests, and once an object is frozen, it
        // can't be unfrozen. Instead, we add a new non-writable property to simulate this.
        st.teardown(mockProperty(Object.prototype, 'frozenProp', { value: 'foo', nonWritable: true, nonEnumerable: true }));

        st['throws'](
            function () {
                var obj = {};
                obj.frozenProp = 'bar';
            },
            // node < 6 has a different error message
            /^TypeError: Cannot assign to read only property 'frozenProp' of (?:object '#<Object>'|#<Object>)/,
            'regular assignment of an inherited non-writable property throws'
        );

        var parsed;
        st.doesNotThrow(
            function () {
                parsed = qs.parse('frozenProp', { allowPrototypes: false });
            },
            'parsing a nonwritable Object.prototype property does not throw'
        );

        st.deepEqual(parsed, {}, 'bare "frozenProp" results in {}');

        st.end();
    });

    t.test('params starting with a closing bracket', function (st) {
        st.deepEqual(qs.parse(']=toString'), { ']': 'toString' });
        st.deepEqual(qs.parse(']]=toString'), { ']]': 'toString' });
        st.deepEqual(qs.parse(']hello]=toString'), { ']hello]': 'toString' });
        st.end();
    });

    t.test('params starting with a starting bracket', function (st) {
        st.deepEqual(qs.parse('[=toString'), { '[': 'toString' });
        st.deepEqual(qs.parse('[[=toString'), { '[[': 'toString' });
        st.deepEqual(qs.parse('[hello[=toString'), { '[hello[': 'toString' });
        st.end();
    });

    t.test('add keys to objects', function (st) {
        st.deepEqual(
            qs.parse('a[b]=c&a=d'),
            { a: { b: 'c', d: true } },
            'can add keys to objects'
        );

        st.deepEqual(
            qs.parse('a[b]=c&a=toString'),
            { a: { b: 'c' } },
            'can not overwrite prototype'
        );

        st.deepEqual(
            qs.parse('a[b]=c&a=toString', { allowPrototypes: true }),
            { a: { b: 'c', toString: true } },
            'can overwrite prototype with allowPrototypes true'
        );

        st.deepEqual(
            qs.parse('a[b]=c&a=toString', { plainObjects: true }),
            { __proto__: null, a: { __proto__: null, b: 'c', toString: true } },
            'can overwrite prototype with plainObjects true'
        );

        st.end();
    });

    t.test('dunder proto is ignored', function (st) {
        var payload = 'categories[__proto__]=login&categories[__proto__]&categories[length]=42';
        var result = qs.parse(payload, { allowPrototypes: true });

        st.deepEqual(
            result,
            {
                categories: {
                    length: '42'
                }
            },
            'silent [[Prototype]] payload'
        );

        var plainResult = qs.parse(payload, { allowPrototypes: true, plainObjects: true });

        st.deepEqual(
            plainResult,
            {
                __proto__: null,
                categories: {
                    __proto__: null,
                    length: '42'
                }
            },
            'silent [[Prototype]] payload: plain objects'
        );

        var query = qs.parse('categories[__proto__]=cats&categories[__proto__]=dogs&categories[some][json]=toInject', { allowPrototypes: true });

        st.notOk(Array.isArray(query.categories), 'is not an array');
        st.notOk(query.categories instanceof Array, 'is not instanceof an array');
        st.deepEqual(query.categories, { some: { json: 'toInject' } });
        st.equal(JSON.stringify(query.categories), '{"some":{"json":"toInject"}}', 'stringifies as a non-array');

        st.deepEqual(
            qs.parse('foo[__proto__][hidden]=value&foo[bar]=stuffs', { allowPrototypes: true }),
            {
                foo: {
                    bar: 'stuffs'
                }
            },
            'hidden values'
        );

        st.deepEqual(
            qs.parse('foo[__proto__][hidden]=value&foo[bar]=stuffs', { allowPrototypes: true, plainObjects: true }),
            {
                __proto__: null,
                foo: {
                    __proto__: null,
                    bar: 'stuffs'
                }
            },
            'hidden values: plain objects'
        );

        st.end();
    });

    t.test('can return null objects', { skip: !hasProto }, function (st) {
        var expected = {
            __proto__: null,
            a: {
                __proto__: null,
                b: 'c',
                hasOwnProperty: 'd'
            }
        };
        st.deepEqual(qs.parse('a[b]=c&a[hasOwnProperty]=d', { plainObjects: true }), expected);
        st.deepEqual(qs.parse(null, { plainObjects: true }), { __proto__: null });
        var expectedArray = {
            __proto__: null,
            a: {
                __proto__: null,
                0: 'b',
                c: 'd'
            }
        };
        st.deepEqual(qs.parse('a[]=b&a[c]=d', { plainObjects: true }), expectedArray);
        st.end();
    });

    t.test('can parse with custom encoding', function (st) {
        st.deepEqual(qs.parse('%8c%a7=%91%e5%8d%e3%95%7b', {
            decoder: function (str) {
                var reg = /%([0-9A-F]{2})/ig;
                var result = [];
                var parts = reg.exec(str);
                while (parts) {
                    result.push(parseInt(parts[1], 16));
                    parts = reg.exec(str);
                }
                return String(iconv.decode(SaferBuffer.from(result), 'shift_jis'));
            }
        }), { 県: '大阪府' });
        st.end();
    });

    t.test('receives the default decoder as a second argument', function (st) {
        st.plan(1);
        qs.parse('a', {
            decoder: function (str, defaultDecoder) {
                st.equal(defaultDecoder, utils.decode);
            }
        });
        st.end();
    });

    t.test('throws error with wrong decoder', function (st) {
        st['throws'](function () {
            qs.parse({}, { decoder: 'string' });
        }, new TypeError('Decoder has to be a function.'));
        st.end();
    });

    t.test('does not mutate the options argument', function (st) {
        var options = {};
        qs.parse('a[b]=true', options);
        st.deepEqual(options, {});
        st.end();
    });

    t.test('throws if an invalid charset is specified', function (st) {
        st['throws'](function () {
            qs.parse('a=b', { charset: 'foobar' });
        }, new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined'));
        st.end();
    });

    t.test('parses an iso-8859-1 string if asked to', function (st) {
        st.deepEqual(qs.parse('%A2=%BD', { charset: 'iso-8859-1' }), { '¢': '½' });
        st.end();
    });

    var urlEncodedCheckmarkInUtf8 = '%E2%9C%93';
    var urlEncodedOSlashInUtf8 = '%C3%B8';
    var urlEncodedNumCheckmark = '%26%2310003%3B';
    var urlEncodedNumSmiley = '%26%239786%3B';

    t.test('prefers an utf-8 charset specified by the utf8 sentinel to a default charset of iso-8859-1', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedCheckmarkInUtf8 + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true, charset: 'iso-8859-1' }), { ø: 'ø' });
        st.end();
    });

    t.test('prefers an iso-8859-1 charset specified by the utf8 sentinel to a default charset of utf-8', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedNumCheckmark + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true, charset: 'utf-8' }), { 'Ã¸': 'Ã¸' });
        st.end();
    });

    t.test('does not require the utf8 sentinel to be defined before the parameters whose decoding it affects', function (st) {
        st.deepEqual(qs.parse('a=' + urlEncodedOSlashInUtf8 + '&utf8=' + urlEncodedNumCheckmark, { charsetSentinel: true, charset: 'utf-8' }), { a: 'Ã¸' });
        st.end();
    });

    t.test('ignores an utf8 sentinel with an unknown value', function (st) {
        st.deepEqual(qs.parse('utf8=foo&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true, charset: 'utf-8' }), { ø: 'ø' });
        st.end();
    });

    t.test('uses the utf8 sentinel to switch to utf-8 when no default charset is given', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedCheckmarkInUtf8 + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true }), { ø: 'ø' });
        st.end();
    });

    t.test('uses the utf8 sentinel to switch to iso-8859-1 when no default charset is given', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedNumCheckmark + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true }), { 'Ã¸': 'Ã¸' });
        st.end();
    });

    t.test('interprets numeric entities in iso-8859-1 when `interpretNumericEntities`', function (st) {
        st.deepEqual(qs.parse('foo=' + urlEncodedNumSmiley, { charset: 'iso-8859-1', interpretNumericEntities: true }), { foo: '☺' });
        st.end();
    });

    t.test('handles a custom decoder returning `null`, in the `iso-8859-1` charset, when `interpretNumericEntities`', function (st) {
        st.deepEqual(qs.parse('foo=&bar=' + urlEncodedNumSmiley, {
            charset: 'iso-8859-1',
            decoder: function (str, defaultDecoder, charset) {
                return str ? defaultDecoder(str, defaultDecoder, charset) : null;
            },
            interpretNumericEntities: true
        }), { foo: null, bar: '☺' });
        st.end();
    });

    t.test('does not interpret numeric entities in iso-8859-1 when `interpretNumericEntities` is absent', function (st) {
        st.deepEqual(qs.parse('foo=' + urlEncodedNumSmiley, { charset: 'iso-8859-1' }), { foo: '&#9786;' });
        st.end();
    });

    t.test('does not interpret numeric entities when the charset is utf-8, even when `interpretNumericEntities`', function (st) {
        st.deepEqual(qs.parse('foo=' + urlEncodedNumSmiley, { charset: 'utf-8', interpretNumericEntities: true }), { foo: '&#9786;' });
        st.end();
    });

    t.test('interpretNumericEntities with comma:true and iso charset does not crash', function (st) {
        st.deepEqual(
            qs.parse('b&a[]=1,' + urlEncodedNumSmiley, { comma: true, charset: 'iso-8859-1', interpretNumericEntities: true }),
            { b: '', a: ['1,☺'] }
        );

        st.end();
    });

    t.test('does not interpret %uXXXX syntax in iso-8859-1 mode', function (st) {
        st.deepEqual(qs.parse('%u263A=%u263A', { charset: 'iso-8859-1' }), { '%u263A': '%u263A' });
        st.end();
    });

    t.test('allows for decoding keys and values differently', function (st) {
        var decoder = function (str, defaultDecoder, charset, type) {
            if (type === 'key') {
                return defaultDecoder(str, defaultDecoder, charset, type).toLowerCase();
            }
            if (type === 'value') {
                return defaultDecoder(str, defaultDecoder, charset, type).toUpperCase();
            }
            throw 'this should never happen! type: ' + type;
        };

        st.deepEqual(qs.parse('KeY=vAlUe', { decoder: decoder }), { key: 'VALUE' });
        st.end();
    });

    t.test('parameter limit tests', function (st) {
        st.test('does not throw error when within parameter limit', function (sst) {
            var result = qs.parse('a=1&b=2&c=3', { parameterLimit: 5, throwOnLimitExceeded: true });
            sst.deepEqual(result, { a: '1', b: '2', c: '3' }, 'parses without errors');
            sst.end();
        });

        st.test('throws error when throwOnLimitExceeded is present but not boolean', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a=1&b=2&c=3&d=4&e=5&f=6', { parameterLimit: 3, throwOnLimitExceeded: 'true' });
                },
                new TypeError('`throwOnLimitExceeded` option must be a boolean'),
                'throws error when throwOnLimitExceeded is present and not boolean'
            );
            sst.end();
        });

        st.test('throws error when parameter limit exceeded', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a=1&b=2&c=3&d=4&e=5&f=6', { parameterLimit: 3, throwOnLimitExceeded: true });
                },
                new RangeError('Parameter limit exceeded. Only 3 parameters allowed.'),
                'throws error when parameter limit is exceeded'
            );
            sst.end();
        });

        st.test('silently truncates when throwOnLimitExceeded is not given', function (sst) {
            var result = qs.parse('a=1&b=2&c=3&d=4&e=5', { parameterLimit: 3 });
            sst.deepEqual(result, { a: '1', b: '2', c: '3' }, 'parses and truncates silently');
            sst.end();
        });

        st.test('silently truncates when parameter limit exceeded without error', function (sst) {
            var result = qs.parse('a=1&b=2&c=3&d=4&e=5', { parameterLimit: 3, throwOnLimitExceeded: false });
            sst.deepEqual(result, { a: '1', b: '2', c: '3' }, 'parses and truncates silently');
            sst.end();
        });

        st.test('allows unlimited parameters when parameterLimit set to Infinity', function (sst) {
            var result = qs.parse('a=1&b=2&c=3&d=4&e=5&f=6', { parameterLimit: Infinity });
            sst.deepEqual(result, { a: '1', b: '2', c: '3', d: '4', e: '5', f: '6' }, 'parses all parameters without truncation');
            sst.end();
        });

        st.end();
    });

    t.test('array limit tests', function (st) {
        st.test('does not throw error when array is within limit', function (sst) {
            var result = qs.parse('a[]=1&a[]=2&a[]=3', { arrayLimit: 5, throwOnLimitExceeded: true });
            sst.deepEqual(result, { a: ['1', '2', '3'] }, 'parses array without errors');
            sst.end();
        });

        st.test('throws error when throwOnLimitExceeded is present but not boolean for array limit', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a[]=1&a[]=2&a[]=3&a[]=4', { arrayLimit: 3, throwOnLimitExceeded: 'true' });
                },
                new TypeError('`throwOnLimitExceeded` option must be a boolean'),
                'throws error when throwOnLimitExceeded is present and not boolean for array limit'
            );
            sst.end();
        });

        st.test('throws error when array limit exceeded', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a[]=1&a[]=2&a[]=3&a[]=4', { arrayLimit: 3, throwOnLimitExceeded: true });
                },
                new RangeError('Array limit exceeded. Only 3 elements allowed in an array.'),
                'throws error when array limit is exceeded'
            );
            sst.end();
        });

        st.test('converts array to object if length is greater than limit', function (sst) {
            var result = qs.parse('a[1]=1&a[2]=2&a[3]=3&a[4]=4&a[5]=5&a[6]=6', { arrayLimit: 5 });

            sst.deepEqual(result, { a: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' } }, 'parses into object if array length is greater than limit');
            sst.end();
        });

        st.end();
    });

    t.end();
});

test('parses empty keys', function (t) {
    emptyTestCases.forEach(function (testCase) {
        t.test('skips empty string key with ' + testCase.input, function (st) {
            st.deepEqual(qs.parse(testCase.input), testCase.noEmptyKeys);

            st.end();
        });
    });
});

test('`duplicates` option', function (t) {
    v.nonStrings.concat('not a valid option').forEach(function (invalidOption) {
        if (typeof invalidOption !== 'undefined') {
            t['throws'](
                function () { qs.parse('', { duplicates: invalidOption }); },
                TypeError,
                'throws on invalid option: ' + inspect(invalidOption)
            );
        }
    });

    t.deepEqual(
        qs.parse('foo=bar&foo=baz'),
        { foo: ['bar', 'baz'] },
        'duplicates: default, combine'
    );

    t.deepEqual(
        qs.parse('foo=bar&foo=baz', { duplicates: 'combine' }),
        { foo: ['bar', 'baz'] },
        'duplicates: combine'
    );

    t.deepEqual(
        qs.parse('foo=bar&foo=baz', { duplicates: 'first' }),
        { foo: 'bar' },
        'duplicates: first'
    );

    t.deepEqual(
        qs.parse('foo=bar&foo=baz', { duplicates: 'last' }),
        { foo: 'baz' },
        'duplicates: last'
    );

    t.end();
});

test('qs strictDepth option - throw cases', function (t) {
    t.test('throws an exception when depth exceeds the limit with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[b][c][d][e][f][g][h][i]=j', { depth: 1, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

    t.test('throws an exception for multiple nested arrays with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[0][1][2][3][4]=b', { depth: 3, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

    t.test('throws an exception for nested objects and arrays with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[b][c][0][d][e]=f', { depth: 3, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

    t.test('throws an exception for different types of values with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[b][c][d][e]=true&a[b][c][d][f]=42', { depth: 3, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

});

test('qs strictDepth option - non-throw cases', function (t) {
    t.test('when depth is 0 and strictDepth true, do not throw', function (st) {
        st.doesNotThrow(
            function () {
                qs.parse('a[b][c][d][e]=true&a[b][c][d][f]=42', { depth: 0, strictDepth: true });
            },
            RangeError,
            'does not throw RangeError'
        );
        st.end();
    });

    t.test('parses successfully when depth is within the limit with strictDepth: true', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b]=c', { depth: 1, strictDepth: true });
                st.deepEqual(result, { a: { b: 'c' } }, 'parses correctly');
            }
        );
        st.end();
    });

    t.test('does not throw an exception when depth exceeds the limit with strictDepth: false', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b][c][d][e][f][g][h][i]=j', { depth: 1 });
                st.deepEqual(result, { a: { b: { '[c][d][e][f][g][h][i]': 'j' } } }, 'parses with depth limit');
            }
        );
        st.end();
    });

    t.test('parses successfully when depth is within the limit with strictDepth: false', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b]=c', { depth: 1 });
                st.deepEqual(result, { a: { b: 'c' } }, 'parses correctly');
            }
        );
        st.end();
    });

    t.test('does not throw when depth is exactly at the limit with strictDepth: true', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b][c]=d', { depth: 2, strictDepth: true });
                st.deepEqual(result, { a: { b: { c: 'd' } } }, 'parses correctly');
            }
        );
        st.end();
    });
});


'use strict';

const path = require('path');
const resolveCommand = require('./util/resolveCommand');
const escape = require('./util/escape');
const readShebang = require('./util/readShebang');

const isWin = process.platform === 'win32';
const isExecutableRegExp = /\.(?:com|exe)$/i;
const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);

    const shebang = parsed.file && readShebang(parsed.file);

    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;

        return resolveCommand(parsed);
    }

    return parsed.file;
}

function parseNonShell(parsed) {
    if (!isWin) {
        return parsed;
    }

    // Detect & add support for shebangs
    const commandFile = detectShebang(parsed);

    // We don't need a shell if the command filename is an executable
    const needsShell = !isExecutableRegExp.test(commandFile);

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path.normalize(parsed.command);

        // Escape command & arguments
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));

        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parse(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original

    // Build our parsed object
    const parsed = {
        command,
        args,
        options,
        file: undefined,
        original: {
            command,
            args,
        },
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parsed : parseNonShell(parsed);
}

module.exports = parse;


// Following http://www.w3.org/TR/css3-selectors/#nth-child-pseudo
// Whitespace as per https://www.w3.org/TR/selectors-3/#lex is " \t\r\n\f"
const whitespace = new Set([9, 10, 12, 13, 32]);
const ZERO = "0".charCodeAt(0);
const NINE = "9".charCodeAt(0);
/**
 * Parses an expression.
 *
 * @throws An `Error` if parsing fails.
 * @returns An array containing the integer step size and the integer offset of the nth rule.
 * @example nthCheck.parse("2n+3"); // returns [2, 3]
 */
export function parse(formula) {
    formula = formula.trim().toLowerCase();
    if (formula === "even") {
        return [2, 0];
    }
    else if (formula === "odd") {
        return [2, 1];
    }
    // Parse [ ['-'|'+']? INTEGER? {N} [ S* ['-'|'+'] S* INTEGER ]?
    let idx = 0;
    let a = 0;
    let sign = readSign();
    let number = readNumber();
    if (idx < formula.length && formula.charAt(idx) === "n") {
        idx++;
        a = sign * (number !== null && number !== void 0 ? number : 1);
        skipWhitespace();
        if (idx < formula.length) {
            sign = readSign();
            skipWhitespace();
            number = readNumber();
        }
        else {
            sign = number = 0;
        }
    }
    // Throw if there is anything else
    if (number === null || idx < formula.length) {
        throw new Error(`n-th rule couldn't be parsed ('${formula}')`);
    }
    return [a, sign * number];
    function readSign() {
        if (formula.charAt(idx) === "-") {
            idx++;
            return -1;
        }
        if (formula.charAt(idx) === "+") {
            idx++;
        }
        return 1;
    }
    function readNumber() {
        const start = idx;
        let value = 0;
        while (idx < formula.length &&
            formula.charCodeAt(idx) >= ZERO &&
            formula.charCodeAt(idx) <= NINE) {
            value = value * 10 + (formula.charCodeAt(idx) - ZERO);
            idx++;
        }
        // Return `null` if we didn't read anything.
        return idx === start ? null : value;
    }
    function skipWhitespace() {
        while (idx < formula.length &&
            whitespace.has(formula.charCodeAt(idx))) {
            idx++;
        }
    }
}
//# sourceMappingURL=parse.js.map

"use strict";
// Following http://www.w3.org/TR/css3-selectors/#nth-child-pseudo
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
// Whitespace as per https://www.w3.org/TR/selectors-3/#lex is " \t\r\n\f"
var whitespace = new Set([9, 10, 12, 13, 32]);
var ZERO = "0".charCodeAt(0);
var NINE = "9".charCodeAt(0);
/**
 * Parses an expression.
 *
 * @throws An `Error` if parsing fails.
 * @returns An array containing the integer step size and the integer offset of the nth rule.
 * @example nthCheck.parse("2n+3"); // returns [2, 3]
 */
function parse(formula) {
    formula = formula.trim().toLowerCase();
    if (formula === "even") {
        return [2, 0];
    }
    else if (formula === "odd") {
        return [2, 1];
    }
    // Parse [ ['-'|'+']? INTEGER? {N} [ S* ['-'|'+'] S* INTEGER ]?
    var idx = 0;
    var a = 0;
    var sign = readSign();
    var number = readNumber();
    if (idx < formula.length && formula.charAt(idx) === "n") {
        idx++;
        a = sign * (number !== null && number !== void 0 ? number : 1);
        skipWhitespace();
        if (idx < formula.length) {
            sign = readSign();
            skipWhitespace();
            number = readNumber();
        }
        else {
            sign = number = 0;
        }
    }
    // Throw if there is anything else
    if (number === null || idx < formula.length) {
        throw new Error("n-th rule couldn't be parsed ('".concat(formula, "')"));
    }
    return [a, sign * number];
    function readSign() {
        if (formula.charAt(idx) === "-") {
            idx++;
            return -1;
        }
        if (formula.charAt(idx) === "+") {
            idx++;
        }
        return 1;
    }
    function readNumber() {
        var start = idx;
        var value = 0;
        while (idx < formula.length &&
            formula.charCodeAt(idx) >= ZERO &&
            formula.charCodeAt(idx) <= NINE) {
            value = value * 10 + (formula.charCodeAt(idx) - ZERO);
            idx++;
        }
        // Return `null` if we didn't read anything.
        return idx === start ? null : value;
    }
    function skipWhitespace() {
        while (idx < formula.length &&
            whitespace.has(formula.charCodeAt(idx))) {
            idx++;
        }
    }
}
exports.parse = parse;
//# sourceMappingURL=parse.js.map

"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultParseResponse = defaultParseResponse;
exports.addRequestID = addRequestID;
const streaming_1 = require("../core/streaming.js");
const log_1 = require("./utils/log.js");
async function defaultParseResponse(client, props) {
    const { response, requestLogID, retryOfRequestLogID, startTime } = props;
    const body = await (async () => {
        if (props.options.stream) {
            (0, log_1.loggerFor)(client).debug('response', response.status, response.url, response.headers, response.body);
            // Note: there is an invariant here that isn't represented in the type system
            // that if you set `stream: true` the response type must also be `Stream<T>`
            if (props.options.__streamClass) {
                return props.options.__streamClass.fromSSEResponse(response, props.controller, client);
            }
            return streaming_1.Stream.fromSSEResponse(response, props.controller, client);
        }
        // fetch refuses to read the body when the status code is 204.
        if (response.status === 204) {
            return null;
        }
        if (props.options.__binaryResponse) {
            return response;
        }
        const contentType = response.headers.get('content-type');
        const mediaType = contentType?.split(';')[0]?.trim();
        const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
        if (isJSON) {
            const json = await response.json();
            return addRequestID(json, response);
        }
        const text = await response.text();
        return text;
    })();
    (0, log_1.loggerFor)(client).debug(`[${requestLogID}] response parsed`, (0, log_1.formatRequestDetails)({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        body,
        durationMs: Date.now() - startTime,
    }));
    return body;
}
function addRequestID(value, response) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    return Object.defineProperty(value, '_request_id', {
        value: response.headers.get('x-request-id'),
        enumerable: false,
    });
}
//# sourceMappingURL=parse.js.map

'use strict';

const constants = require('./constants');
const utils = require('./utils');

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants.globChars(opts.windows);
  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || '';
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.output = (prev.output || prev.value) + tok.value;
      prev.value += tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse(rest, { ...options, fastpaths: false }).output;

        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants.globChars(opts.windows);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

module.exports = parse;


'use strict'

let Container = require('./container')
let Input = require('./input')
let Parser = require('./parser')

function parse(css, opts) {
  let input = new Input(css, opts)
  let parser = new Parser(input)
  try {
    parser.parse()
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      if (e.name === 'CssSyntaxError' && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse SCSS with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-scss parser'
        } else if (/\.sass/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Sass with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-sass parser'
        } else if (/\.less$/i.test(opts.from)) {
          e.message +=
            '\nYou tried to parse Less with ' +
            'the standard CSS parser; ' +
            'try again with the postcss-less parser'
        }
      }
    }
    throw e
  }

  return parser.root
}

module.exports = parse
parse.default = parse

Container.registerParse(parse)


'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowEmptyArrays: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decodeDotInKeys: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    duplicates: 'combine',
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictDepth: false,
    strictNullHandling: false,
    throwOnLimitExceeded: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options, currentArrayLength) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = { __proto__: null };

    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    cleanStr = cleanStr.replace(/%5B/gi, '[').replace(/%5D/gi, ']');

    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(
        options.delimiter,
        options.throwOnLimitExceeded ? limit + 1 : limit
    );

    if (options.throwOnLimitExceeded && parts.length > limit) {
        throw new RangeError('Parameter limit exceeded. Only ' + limit + ' parameter' + (limit === 1 ? '' : 's') + ' allowed.');
    }

    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key;
        var val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');

            val = utils.maybeMap(
                parseArrayValue(
                    part.slice(pos + 1),
                    options,
                    isArray(obj[key]) ? obj[key].length : 0
                ),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(String(val));
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        var existing = has.call(obj, key);
        if (existing && options.duplicates === 'combine') {
            obj[key] = utils.combine(obj[key], val);
        } else if (!existing || options.duplicates === 'last') {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var currentArrayLength = 0;
    if (chain.length > 0 && chain[chain.length - 1] === '[]') {
        var parentKey = chain.slice(0, -1).join('');
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
    }

    var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
                ? []
                : utils.combine([], leaf);
        } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            if (!options.parseArrays && decodedRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== decodedRoot
                && String(index) === decodedRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else if (decodedRoot !== '__proto__') {
                obj[decodedRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, check strictDepth option for throw, else just add whatever is left

    if (segment) {
        if (options.strictDepth === true) {
            throw new RangeError('Input depth exceeded depth option of ' + options.depth + ' and strictDepth is true');
        }
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
        throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.decoder !== null && typeof opts.decoder !== 'undefined' && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    if (typeof opts.throwOnLimitExceeded !== 'undefined' && typeof opts.throwOnLimitExceeded !== 'boolean') {
        throw new TypeError('`throwOnLimitExceeded` option must be a boolean');
    }

    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    var duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;

    if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
        throw new TypeError('The duplicates option must be either combine, first, or last');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

    return {
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        duplicates: duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === 'boolean' ? !!opts.strictDepth : defaults.strictDepth,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === 'boolean' ? opts.throwOnLimitExceeded : false
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? { __proto__: null } : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? { __proto__: null } : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};


'use strict';

var test = require('tape');
var hasPropertyDescriptors = require('has-property-descriptors')();
var iconv = require('iconv-lite');
var mockProperty = require('mock-property');
var hasOverrideMistake = require('has-override-mistake')();
var SaferBuffer = require('safer-buffer').Buffer;
var v = require('es-value-fixtures');
var inspect = require('object-inspect');
var emptyTestCases = require('./empty-keys-cases').emptyTestCases;
var hasProto = require('has-proto')();

var qs = require('../');
var utils = require('../lib/utils');

test('parse()', function (t) {
    t.test('parses a simple string', function (st) {
        st.deepEqual(qs.parse('0=foo'), { 0: 'foo' });
        st.deepEqual(qs.parse('foo=c++'), { foo: 'c  ' });
        st.deepEqual(qs.parse('a[>=]=23'), { a: { '>=': '23' } });
        st.deepEqual(qs.parse('a[<=>]==23'), { a: { '<=>': '=23' } });
        st.deepEqual(qs.parse('a[==]=23'), { a: { '==': '23' } });
        st.deepEqual(qs.parse('foo', { strictNullHandling: true }), { foo: null });
        st.deepEqual(qs.parse('foo'), { foo: '' });
        st.deepEqual(qs.parse('foo='), { foo: '' });
        st.deepEqual(qs.parse('foo=bar'), { foo: 'bar' });
        st.deepEqual(qs.parse(' foo = bar = baz '), { ' foo ': ' bar = baz ' });
        st.deepEqual(qs.parse('foo=bar=baz'), { foo: 'bar=baz' });
        st.deepEqual(qs.parse('foo=bar&bar=baz'), { foo: 'bar', bar: 'baz' });
        st.deepEqual(qs.parse('foo2=bar2&baz2='), { foo2: 'bar2', baz2: '' });
        st.deepEqual(qs.parse('foo=bar&baz', { strictNullHandling: true }), { foo: 'bar', baz: null });
        st.deepEqual(qs.parse('foo=bar&baz'), { foo: 'bar', baz: '' });
        st.deepEqual(qs.parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World'), {
            cht: 'p3',
            chd: 't:60,40',
            chs: '250x100',
            chl: 'Hello|World'
        });
        st.end();
    });

    t.test('comma: false', function (st) {
        st.deepEqual(qs.parse('a[]=b&a[]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[0]=b&a[1]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b,c'), { a: 'b,c' });
        st.deepEqual(qs.parse('a=b&a=c'), { a: ['b', 'c'] });
        st.end();
    });

    t.test('comma: true', function (st) {
        st.deepEqual(qs.parse('a[]=b&a[]=c', { comma: true }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { comma: true }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b,c', { comma: true }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a=c', { comma: true }), { a: ['b', 'c'] });
        st.end();
    });

    t.test('allows enabling dot notation', function (st) {
        st.deepEqual(qs.parse('a.b=c'), { 'a.b': 'c' });
        st.deepEqual(qs.parse('a.b=c', { allowDots: true }), { a: { b: 'c' } });

        st.end();
    });

    t.test('decode dot keys correctly', function (st) {
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe', { allowDots: false, decodeDotInKeys: false }),
            { 'name%2Eobj.first': 'John', 'name%2Eobj.last': 'Doe' },
            'with allowDots false and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse('name.obj.first=John&name.obj.last=Doe', { allowDots: true, decodeDotInKeys: false }),
            { name: { obj: { first: 'John', last: 'Doe' } } },
            'with allowDots false and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe', { allowDots: true, decodeDotInKeys: false }),
            { 'name%2Eobj': { first: 'John', last: 'Doe' } },
            'with allowDots true and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe', { allowDots: true, decodeDotInKeys: true }),
            { 'name.obj': { first: 'John', last: 'Doe' } },
            'with allowDots true and decodeDotInKeys true'
        );

        st.deepEqual(
            qs.parse(
                'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
                { allowDots: false, decodeDotInKeys: false }
            ),
            { 'name%2Eobj%2Esubobject.first%2Egodly%2Ename': 'John', 'name%2Eobj%2Esubobject.last': 'Doe' },
            'with allowDots false and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse(
                'name.obj.subobject.first.godly.name=John&name.obj.subobject.last=Doe',
                { allowDots: true, decodeDotInKeys: false }
            ),
            { name: { obj: { subobject: { first: { godly: { name: 'John' } }, last: 'Doe' } } } },
            'with allowDots true and decodeDotInKeys false'
        );
        st.deepEqual(
            qs.parse(
                'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
                { allowDots: true, decodeDotInKeys: true }
            ),
            { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
            'with allowDots true and decodeDotInKeys true'
        );
        st.deepEqual(
            qs.parse('name%252Eobj.first=John&name%252Eobj.last=Doe'),
            { 'name%2Eobj.first': 'John', 'name%2Eobj.last': 'Doe' },
            'with allowDots and decodeDotInKeys undefined'
        );

        st.end();
    });

    t.test('decodes dot in key of object, and allow enabling dot notation when decodeDotInKeys is set to true and allowDots is undefined', function (st) {
        st.deepEqual(
            qs.parse(
                'name%252Eobj%252Esubobject.first%252Egodly%252Ename=John&name%252Eobj%252Esubobject.last=Doe',
                { decodeDotInKeys: true }
            ),
            { 'name.obj.subobject': { 'first.godly.name': 'John', last: 'Doe' } },
            'with allowDots undefined and decodeDotInKeys true'
        );

        st.end();
    });

    t.test('throws when decodeDotInKeys is not of type boolean', function (st) {
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: 0 }); },
            TypeError
        );
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { decodeDotInKeys: null }); },
            TypeError
        );

        st.end();
    });

    t.test('allows empty arrays in obj values', function (st) {
        st.deepEqual(qs.parse('foo[]&bar=baz', { allowEmptyArrays: true }), { foo: [], bar: 'baz' });
        st.deepEqual(qs.parse('foo[]&bar=baz', { allowEmptyArrays: false }), { foo: [''], bar: 'baz' });

        st.end();
    });

    t.test('throws when allowEmptyArrays is not of type boolean', function (st) {
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: 'foobar' }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: 0 }); },
            TypeError
        );
        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: NaN }); },
            TypeError
        );

        st['throws'](
            function () { qs.parse('foo[]&bar=baz', { allowEmptyArrays: null }); },
            TypeError
        );

        st.end();
    });

    t.test('allowEmptyArrays + strictNullHandling', function (st) {
        st.deepEqual(
            qs.parse('testEmptyArray[]', { strictNullHandling: true, allowEmptyArrays: true }),
            { testEmptyArray: [] }
        );

        st.end();
    });

    t.deepEqual(qs.parse('a[b]=c'), { a: { b: 'c' } }, 'parses a single nested string');
    t.deepEqual(qs.parse('a[b][c]=d'), { a: { b: { c: 'd' } } }, 'parses a double nested string');
    t.deepEqual(
        qs.parse('a[b][c][d][e][f][g][h]=i'),
        { a: { b: { c: { d: { e: { f: { '[g][h]': 'i' } } } } } } },
        'defaults to a depth of 5'
    );

    t.test('only parses one level when depth = 1', function (st) {
        st.deepEqual(qs.parse('a[b][c]=d', { depth: 1 }), { a: { b: { '[c]': 'd' } } });
        st.deepEqual(qs.parse('a[b][c][d]=e', { depth: 1 }), { a: { b: { '[c][d]': 'e' } } });
        st.end();
    });

    t.test('uses original key when depth = 0', function (st) {
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { depth: 0 }), { 'a[0]': 'b', 'a[1]': 'c' });
        st.deepEqual(qs.parse('a[0][0]=b&a[0][1]=c&a[1]=d&e=2', { depth: 0 }), { 'a[0][0]': 'b', 'a[0][1]': 'c', 'a[1]': 'd', e: '2' });
        st.end();
    });

    t.test('uses original key when depth = false', function (st) {
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { depth: false }), { 'a[0]': 'b', 'a[1]': 'c' });
        st.deepEqual(qs.parse('a[0][0]=b&a[0][1]=c&a[1]=d&e=2', { depth: false }), { 'a[0][0]': 'b', 'a[0][1]': 'c', 'a[1]': 'd', e: '2' });
        st.end();
    });

    t.deepEqual(qs.parse('a=b&a=c'), { a: ['b', 'c'] }, 'parses a simple array');

    t.test('parses an explicit array', function (st) {
        st.deepEqual(qs.parse('a[]=b'), { a: ['b'] });
        st.deepEqual(qs.parse('a[]=b&a[]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a[]=c&a[]=d'), { a: ['b', 'c', 'd'] });
        st.end();
    });

    t.test('parses a mix of simple and explicit arrays', function (st) {
        st.deepEqual(qs.parse('a=b&a[]=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[0]=b&a=c'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a[0]=c'), { a: ['b', 'c'] });

        st.deepEqual(qs.parse('a[1]=b&a=c', { arrayLimit: 20 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a=c', { arrayLimit: 0 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[]=b&a=c'), { a: ['b', 'c'] });

        st.deepEqual(qs.parse('a=b&a[1]=c', { arrayLimit: 20 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a[]=c', { arrayLimit: 0 }), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a=b&a[]=c'), { a: ['b', 'c'] });

        st.end();
    });

    t.test('parses a nested array', function (st) {
        st.deepEqual(qs.parse('a[b][]=c&a[b][]=d'), { a: { b: ['c', 'd'] } });
        st.deepEqual(qs.parse('a[>=]=25'), { a: { '>=': '25' } });
        st.end();
    });

    t.test('allows to specify array indices', function (st) {
        st.deepEqual(qs.parse('a[1]=c&a[0]=b&a[2]=d'), { a: ['b', 'c', 'd'] });
        st.deepEqual(qs.parse('a[1]=c&a[0]=b'), { a: ['b', 'c'] });
        st.deepEqual(qs.parse('a[1]=c', { arrayLimit: 20 }), { a: ['c'] });
        st.deepEqual(qs.parse('a[1]=c', { arrayLimit: 0 }), { a: { 1: 'c' } });
        st.deepEqual(qs.parse('a[1]=c'), { a: ['c'] });
        st.end();
    });

    t.test('limits specific array indices to arrayLimit', function (st) {
        st.deepEqual(qs.parse('a[20]=a', { arrayLimit: 20 }), { a: ['a'] });
        st.deepEqual(qs.parse('a[21]=a', { arrayLimit: 20 }), { a: { 21: 'a' } });

        st.deepEqual(qs.parse('a[20]=a'), { a: ['a'] });
        st.deepEqual(qs.parse('a[21]=a'), { a: { 21: 'a' } });
        st.end();
    });

    t.deepEqual(qs.parse('a[12b]=c'), { a: { '12b': 'c' } }, 'supports keys that begin with a number');

    t.test('supports encoded = signs', function (st) {
        st.deepEqual(qs.parse('he%3Dllo=th%3Dere'), { 'he=llo': 'th=ere' });
        st.end();
    });

    t.test('is ok with url encoded strings', function (st) {
        st.deepEqual(qs.parse('a[b%20c]=d'), { a: { 'b c': 'd' } });
        st.deepEqual(qs.parse('a[b]=c%20d'), { a: { b: 'c d' } });
        st.end();
    });

    t.test('allows brackets in the value', function (st) {
        st.deepEqual(qs.parse('pets=["tobi"]'), { pets: '["tobi"]' });
        st.deepEqual(qs.parse('operators=[">=", "<="]'), { operators: '[">=", "<="]' });
        st.end();
    });

    t.test('allows empty values', function (st) {
        st.deepEqual(qs.parse(''), {});
        st.deepEqual(qs.parse(null), {});
        st.deepEqual(qs.parse(undefined), {});
        st.end();
    });

    t.test('transforms arrays to objects', function (st) {
        st.deepEqual(qs.parse('foo[0]=bar&foo[bad]=baz'), { foo: { 0: 'bar', bad: 'baz' } });
        st.deepEqual(qs.parse('foo[bad]=baz&foo[0]=bar'), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo[bad]=baz&foo[]=bar'), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo[]=bar&foo[bad]=baz'), { foo: { 0: 'bar', bad: 'baz' } });
        st.deepEqual(qs.parse('foo[bad]=baz&foo[]=bar&foo[]=foo'), { foo: { bad: 'baz', 0: 'bar', 1: 'foo' } });
        st.deepEqual(qs.parse('foo[0][a]=a&foo[0][b]=b&foo[1][a]=aa&foo[1][b]=bb'), { foo: [{ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }] });

        st.deepEqual(qs.parse('a[]=b&a[t]=u&a[hasOwnProperty]=c', { allowPrototypes: false }), { a: { 0: 'b', t: 'u' } });
        st.deepEqual(qs.parse('a[]=b&a[t]=u&a[hasOwnProperty]=c', { allowPrototypes: true }), { a: { 0: 'b', t: 'u', hasOwnProperty: 'c' } });
        st.deepEqual(qs.parse('a[]=b&a[hasOwnProperty]=c&a[x]=y', { allowPrototypes: false }), { a: { 0: 'b', x: 'y' } });
        st.deepEqual(qs.parse('a[]=b&a[hasOwnProperty]=c&a[x]=y', { allowPrototypes: true }), { a: { 0: 'b', hasOwnProperty: 'c', x: 'y' } });
        st.end();
    });

    t.test('transforms arrays to objects (dot notation)', function (st) {
        st.deepEqual(qs.parse('foo[0].baz=bar&fool.bad=baz', { allowDots: true }), { foo: [{ baz: 'bar' }], fool: { bad: 'baz' } });
        st.deepEqual(qs.parse('foo[0].baz=bar&fool.bad.boo=baz', { allowDots: true }), { foo: [{ baz: 'bar' }], fool: { bad: { boo: 'baz' } } });
        st.deepEqual(qs.parse('foo[0][0].baz=bar&fool.bad=baz', { allowDots: true }), { foo: [[{ baz: 'bar' }]], fool: { bad: 'baz' } });
        st.deepEqual(qs.parse('foo[0].baz[0]=15&foo[0].bar=2', { allowDots: true }), { foo: [{ baz: ['15'], bar: '2' }] });
        st.deepEqual(qs.parse('foo[0].baz[0]=15&foo[0].baz[1]=16&foo[0].bar=2', { allowDots: true }), { foo: [{ baz: ['15', '16'], bar: '2' }] });
        st.deepEqual(qs.parse('foo.bad=baz&foo[0]=bar', { allowDots: true }), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo.bad=baz&foo[]=bar', { allowDots: true }), { foo: { bad: 'baz', 0: 'bar' } });
        st.deepEqual(qs.parse('foo[]=bar&foo.bad=baz', { allowDots: true }), { foo: { 0: 'bar', bad: 'baz' } });
        st.deepEqual(qs.parse('foo.bad=baz&foo[]=bar&foo[]=foo', { allowDots: true }), { foo: { bad: 'baz', 0: 'bar', 1: 'foo' } });
        st.deepEqual(qs.parse('foo[0].a=a&foo[0].b=b&foo[1].a=aa&foo[1].b=bb', { allowDots: true }), { foo: [{ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }] });
        st.end();
    });

    t.test('correctly prunes undefined values when converting an array to an object', function (st) {
        st.deepEqual(qs.parse('a[2]=b&a[99999999]=c'), { a: { 2: 'b', 99999999: 'c' } });
        st.end();
    });

    t.test('supports malformed uri characters', function (st) {
        st.deepEqual(qs.parse('{%:%}', { strictNullHandling: true }), { '{%:%}': null });
        st.deepEqual(qs.parse('{%:%}='), { '{%:%}': '' });
        st.deepEqual(qs.parse('foo=%:%}'), { foo: '%:%}' });
        st.end();
    });

    t.test('doesn\'t produce empty keys', function (st) {
        st.deepEqual(qs.parse('_r=1&'), { _r: '1' });
        st.end();
    });

    t.test('cannot access Object prototype', function (st) {
        qs.parse('constructor[prototype][bad]=bad');
        qs.parse('bad[constructor][prototype][bad]=bad');
        st.equal(typeof Object.prototype.bad, 'undefined');
        st.end();
    });

    t.test('parses arrays of objects', function (st) {
        st.deepEqual(qs.parse('a[][b]=c'), { a: [{ b: 'c' }] });
        st.deepEqual(qs.parse('a[0][b]=c'), { a: [{ b: 'c' }] });
        st.end();
    });

    t.test('allows for empty strings in arrays', function (st) {
        st.deepEqual(qs.parse('a[]=b&a[]=&a[]=c'), { a: ['b', '', 'c'] });

        st.deepEqual(
            qs.parse('a[0]=b&a[1]&a[2]=c&a[19]=', { strictNullHandling: true, arrayLimit: 20 }),
            { a: ['b', null, 'c', ''] },
            'with arrayLimit 20 + array indices: null then empty string works'
        );
        st.deepEqual(
            qs.parse('a[]=b&a[]&a[]=c&a[]=', { strictNullHandling: true, arrayLimit: 0 }),
            { a: ['b', null, 'c', ''] },
            'with arrayLimit 0 + array brackets: null then empty string works'
        );

        st.deepEqual(
            qs.parse('a[0]=b&a[1]=&a[2]=c&a[19]', { strictNullHandling: true, arrayLimit: 20 }),
            { a: ['b', '', 'c', null] },
            'with arrayLimit 20 + array indices: empty string then null works'
        );
        st.deepEqual(
            qs.parse('a[]=b&a[]=&a[]=c&a[]', { strictNullHandling: true, arrayLimit: 0 }),
            { a: ['b', '', 'c', null] },
            'with arrayLimit 0 + array brackets: empty string then null works'
        );

        st.deepEqual(
            qs.parse('a[]=&a[]=b&a[]=c'),
            { a: ['', 'b', 'c'] },
            'array brackets: empty strings work'
        );
        st.end();
    });

    t.test('compacts sparse arrays', function (st) {
        st.deepEqual(qs.parse('a[10]=1&a[2]=2', { arrayLimit: 20 }), { a: ['2', '1'] });
        st.deepEqual(qs.parse('a[1][b][2][c]=1', { arrayLimit: 20 }), { a: [{ b: [{ c: '1' }] }] });
        st.deepEqual(qs.parse('a[1][2][3][c]=1', { arrayLimit: 20 }), { a: [[[{ c: '1' }]]] });
        st.deepEqual(qs.parse('a[1][2][3][c][1]=1', { arrayLimit: 20 }), { a: [[[{ c: ['1'] }]]] });
        st.end();
    });

    t.test('parses sparse arrays', function (st) {
        /* eslint no-sparse-arrays: 0 */
        st.deepEqual(qs.parse('a[4]=1&a[1]=2', { allowSparse: true }), { a: [, '2', , , '1'] });
        st.deepEqual(qs.parse('a[1][b][2][c]=1', { allowSparse: true }), { a: [, { b: [, , { c: '1' }] }] });
        st.deepEqual(qs.parse('a[1][2][3][c]=1', { allowSparse: true }), { a: [, [, , [, , , { c: '1' }]]] });
        st.deepEqual(qs.parse('a[1][2][3][c][1]=1', { allowSparse: true }), { a: [, [, , [, , , { c: [, '1'] }]]] });
        st.end();
    });

    t.test('parses semi-parsed strings', function (st) {
        st.deepEqual(qs.parse({ 'a[b]': 'c' }), { a: { b: 'c' } });
        st.deepEqual(qs.parse({ 'a[b]': 'c', 'a[d]': 'e' }), { a: { b: 'c', d: 'e' } });
        st.end();
    });

    t.test('parses buffers correctly', function (st) {
        var b = SaferBuffer.from('test');
        st.deepEqual(qs.parse({ a: b }), { a: b });
        st.end();
    });

    t.test('parses jquery-param strings', function (st) {
        // readable = 'filter[0][]=int1&filter[0][]==&filter[0][]=77&filter[]=and&filter[2][]=int2&filter[2][]==&filter[2][]=8'
        var encoded = 'filter%5B0%5D%5B%5D=int1&filter%5B0%5D%5B%5D=%3D&filter%5B0%5D%5B%5D=77&filter%5B%5D=and&filter%5B2%5D%5B%5D=int2&filter%5B2%5D%5B%5D=%3D&filter%5B2%5D%5B%5D=8';
        var expected = { filter: [['int1', '=', '77'], 'and', ['int2', '=', '8']] };
        st.deepEqual(qs.parse(encoded), expected);
        st.end();
    });

    t.test('continues parsing when no parent is found', function (st) {
        st.deepEqual(qs.parse('[]=&a=b'), { 0: '', a: 'b' });
        st.deepEqual(qs.parse('[]&a=b', { strictNullHandling: true }), { 0: null, a: 'b' });
        st.deepEqual(qs.parse('[foo]=bar'), { foo: 'bar' });
        st.end();
    });

    t.test('does not error when parsing a very long array', function (st) {
        var str = 'a[]=a';
        while (Buffer.byteLength(str) < 128 * 1024) {
            str = str + '&' + str;
        }

        st.doesNotThrow(function () {
            qs.parse(str);
        });

        st.end();
    });

    t.test('does not throw when a native prototype has an enumerable property', function (st) {
        st.intercept(Object.prototype, 'crash', { value: '' });
        st.intercept(Array.prototype, 'crash', { value: '' });

        st.doesNotThrow(qs.parse.bind(null, 'a=b'));
        st.deepEqual(qs.parse('a=b'), { a: 'b' });
        st.doesNotThrow(qs.parse.bind(null, 'a[][b]=c'));
        st.deepEqual(qs.parse('a[][b]=c'), { a: [{ b: 'c' }] });

        st.end();
    });

    t.test('parses a string with an alternative string delimiter', function (st) {
        st.deepEqual(qs.parse('a=b;c=d', { delimiter: ';' }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('parses a string with an alternative RegExp delimiter', function (st) {
        st.deepEqual(qs.parse('a=b; c=d', { delimiter: /[;,] */ }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('does not use non-splittable objects as delimiters', function (st) {
        st.deepEqual(qs.parse('a=b&c=d', { delimiter: true }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('allows overriding parameter limit', function (st) {
        st.deepEqual(qs.parse('a=b&c=d', { parameterLimit: 1 }), { a: 'b' });
        st.end();
    });

    t.test('allows setting the parameter limit to Infinity', function (st) {
        st.deepEqual(qs.parse('a=b&c=d', { parameterLimit: Infinity }), { a: 'b', c: 'd' });
        st.end();
    });

    t.test('allows overriding array limit', function (st) {
        st.deepEqual(qs.parse('a[0]=b', { arrayLimit: -1 }), { a: { 0: 'b' } });
        st.deepEqual(qs.parse('a[0]=b', { arrayLimit: 0 }), { a: ['b'] });

        st.deepEqual(qs.parse('a[-1]=b', { arrayLimit: -1 }), { a: { '-1': 'b' } });
        st.deepEqual(qs.parse('a[-1]=b', { arrayLimit: 0 }), { a: { '-1': 'b' } });

        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { arrayLimit: -1 }), { a: { 0: 'b', 1: 'c' } });
        st.deepEqual(qs.parse('a[0]=b&a[1]=c', { arrayLimit: 0 }), { a: { 0: 'b', 1: 'c' } });

        st.end();
    });

    t.test('allows disabling array parsing', function (st) {
        var indices = qs.parse('a[0]=b&a[1]=c', { parseArrays: false });
        st.deepEqual(indices, { a: { 0: 'b', 1: 'c' } });
        st.equal(Array.isArray(indices.a), false, 'parseArrays:false, indices case is not an array');

        var emptyBrackets = qs.parse('a[]=b', { parseArrays: false });
        st.deepEqual(emptyBrackets, { a: { 0: 'b' } });
        st.equal(Array.isArray(emptyBrackets.a), false, 'parseArrays:false, empty brackets case is not an array');

        st.end();
    });

    t.test('allows for query string prefix', function (st) {
        st.deepEqual(qs.parse('?foo=bar', { ignoreQueryPrefix: true }), { foo: 'bar' });
        st.deepEqual(qs.parse('foo=bar', { ignoreQueryPrefix: true }), { foo: 'bar' });
        st.deepEqual(qs.parse('?foo=bar', { ignoreQueryPrefix: false }), { '?foo': 'bar' });

        st.end();
    });

    t.test('parses an object', function (st) {
        var input = {
            'user[name]': { 'pop[bob]': 3 },
            'user[email]': null
        };

        var expected = {
            user: {
                name: { 'pop[bob]': 3 },
                email: null
            }
        };

        var result = qs.parse(input);

        st.deepEqual(result, expected);
        st.end();
    });

    t.test('parses string with comma as array divider', function (st) {
        st.deepEqual(qs.parse('foo=bar,tee', { comma: true }), { foo: ['bar', 'tee'] });
        st.deepEqual(qs.parse('foo[bar]=coffee,tee', { comma: true }), { foo: { bar: ['coffee', 'tee'] } });
        st.deepEqual(qs.parse('foo=', { comma: true }), { foo: '' });
        st.deepEqual(qs.parse('foo', { comma: true }), { foo: '' });
        st.deepEqual(qs.parse('foo', { comma: true, strictNullHandling: true }), { foo: null });

        // test cases inversed from from stringify tests
        st.deepEqual(qs.parse('a[0]=c'), { a: ['c'] });
        st.deepEqual(qs.parse('a[]=c'), { a: ['c'] });
        st.deepEqual(qs.parse('a[]=c', { comma: true }), { a: ['c'] });

        st.deepEqual(qs.parse('a[0]=c&a[1]=d'), { a: ['c', 'd'] });
        st.deepEqual(qs.parse('a[]=c&a[]=d'), { a: ['c', 'd'] });
        st.deepEqual(qs.parse('a=c,d', { comma: true }), { a: ['c', 'd'] });

        st.end();
    });

    t.test('parses values with comma as array divider', function (st) {
        st.deepEqual(qs.parse({ foo: 'bar,tee' }, { comma: false }), { foo: 'bar,tee' });
        st.deepEqual(qs.parse({ foo: 'bar,tee' }, { comma: true }), { foo: ['bar', 'tee'] });
        st.end();
    });

    t.test('use number decoder, parses string that has one number with comma option enabled', function (st) {
        var decoder = function (str, defaultDecoder, charset, type) {
            if (!isNaN(Number(str))) {
                return parseFloat(str);
            }
            return defaultDecoder(str, defaultDecoder, charset, type);
        };

        st.deepEqual(qs.parse('foo=1', { comma: true, decoder: decoder }), { foo: 1 });
        st.deepEqual(qs.parse('foo=0', { comma: true, decoder: decoder }), { foo: 0 });

        st.end();
    });

    t.test('parses brackets holds array of arrays when having two parts of strings with comma as array divider', function (st) {
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=4,5,6', { comma: true }), { foo: [['1', '2', '3'], ['4', '5', '6']] });
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=', { comma: true }), { foo: [['1', '2', '3'], ''] });
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=,', { comma: true }), { foo: [['1', '2', '3'], ['', '']] });
        st.deepEqual(qs.parse('foo[]=1,2,3&foo[]=a', { comma: true }), { foo: [['1', '2', '3'], 'a'] });

        st.end();
    });

    t.test('parses url-encoded brackets holds array of arrays when having two parts of strings with comma as array divider', function (st) {
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=4,5,6', { comma: true }), { foo: [['1', '2', '3'], ['4', '5', '6']] });
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=', { comma: true }), { foo: [['1', '2', '3'], ''] });
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=,', { comma: true }), { foo: [['1', '2', '3'], ['', '']] });
        st.deepEqual(qs.parse('foo%5B%5D=1,2,3&foo%5B%5D=a', { comma: true }), { foo: [['1', '2', '3'], 'a'] });

        st.end();
    });

    t.test('parses comma delimited array while having percent-encoded comma treated as normal text', function (st) {
        st.deepEqual(qs.parse('foo=a%2Cb', { comma: true }), { foo: 'a,b' });
        st.deepEqual(qs.parse('foo=a%2C%20b,d', { comma: true }), { foo: ['a, b', 'd'] });
        st.deepEqual(qs.parse('foo=a%2C%20b,c%2C%20d', { comma: true }), { foo: ['a, b', 'c, d'] });

        st.end();
    });

    t.test('parses an object in dot notation', function (st) {
        var input = {
            'user.name': { 'pop[bob]': 3 },
            'user.email.': null
        };

        var expected = {
            user: {
                name: { 'pop[bob]': 3 },
                email: null
            }
        };

        var result = qs.parse(input, { allowDots: true });

        st.deepEqual(result, expected);
        st.end();
    });

    t.test('parses an object and not child values', function (st) {
        var input = {
            'user[name]': { 'pop[bob]': { test: 3 } },
            'user[email]': null
        };

        var expected = {
            user: {
                name: { 'pop[bob]': { test: 3 } },
                email: null
            }
        };

        var result = qs.parse(input);

        st.deepEqual(result, expected);
        st.end();
    });

    t.test('does not blow up when Buffer global is missing', function (st) {
        var restore = mockProperty(global, 'Buffer', { 'delete': true });

        var result = qs.parse('a=b&c=d');

        restore();

        st.deepEqual(result, { a: 'b', c: 'd' });
        st.end();
    });

    t.test('does not crash when parsing circular references', function (st) {
        var a = {};
        a.b = a;

        var parsed;

        st.doesNotThrow(function () {
            parsed = qs.parse({ 'foo[bar]': 'baz', 'foo[baz]': a });
        });

        st.equal('foo' in parsed, true, 'parsed has "foo" property');
        st.equal('bar' in parsed.foo, true);
        st.equal('baz' in parsed.foo, true);
        st.equal(parsed.foo.bar, 'baz');
        st.deepEqual(parsed.foo.baz, a);
        st.end();
    });

    t.test('does not crash when parsing deep objects', function (st) {
        var parsed;
        var str = 'foo';

        for (var i = 0; i < 5000; i++) {
            str += '[p]';
        }

        str += '=bar';

        st.doesNotThrow(function () {
            parsed = qs.parse(str, { depth: 5000 });
        });

        st.equal('foo' in parsed, true, 'parsed has "foo" property');

        var depth = 0;
        var ref = parsed.foo;
        while ((ref = ref.p)) {
            depth += 1;
        }

        st.equal(depth, 5000, 'parsed is 5000 properties deep');

        st.end();
    });

    t.test('parses null objects correctly', { skip: !hasProto }, function (st) {
        var a = { __proto__: null, b: 'c' };

        st.deepEqual(qs.parse(a), { b: 'c' });
        var result = qs.parse({ a: a });
        st.equal('a' in result, true, 'result has "a" property');
        st.deepEqual(result.a, a);
        st.end();
    });

    t.test('parses dates correctly', function (st) {
        var now = new Date();
        st.deepEqual(qs.parse({ a: now }), { a: now });
        st.end();
    });

    t.test('parses regular expressions correctly', function (st) {
        var re = /^test$/;
        st.deepEqual(qs.parse({ a: re }), { a: re });
        st.end();
    });

    t.test('does not allow overwriting prototype properties', function (st) {
        st.deepEqual(qs.parse('a[hasOwnProperty]=b', { allowPrototypes: false }), {});
        st.deepEqual(qs.parse('hasOwnProperty=b', { allowPrototypes: false }), {});

        st.deepEqual(
            qs.parse('toString', { allowPrototypes: false }),
            {},
            'bare "toString" results in {}'
        );

        st.end();
    });

    t.test('can allow overwriting prototype properties', function (st) {
        st.deepEqual(qs.parse('a[hasOwnProperty]=b', { allowPrototypes: true }), { a: { hasOwnProperty: 'b' } });
        st.deepEqual(qs.parse('hasOwnProperty=b', { allowPrototypes: true }), { hasOwnProperty: 'b' });

        st.deepEqual(
            qs.parse('toString', { allowPrototypes: true }),
            { toString: '' },
            'bare "toString" results in { toString: "" }'
        );

        st.end();
    });

    t.test('does not crash when the global Object prototype is frozen', { skip: !hasPropertyDescriptors || !hasOverrideMistake }, function (st) {
        // We can't actually freeze the global Object prototype as that will interfere with other tests, and once an object is frozen, it
        // can't be unfrozen. Instead, we add a new non-writable property to simulate this.
        st.teardown(mockProperty(Object.prototype, 'frozenProp', { value: 'foo', nonWritable: true, nonEnumerable: true }));

        st['throws'](
            function () {
                var obj = {};
                obj.frozenProp = 'bar';
            },
            // node < 6 has a different error message
            /^TypeError: Cannot assign to read only property 'frozenProp' of (?:object '#<Object>'|#<Object>)/,
            'regular assignment of an inherited non-writable property throws'
        );

        var parsed;
        st.doesNotThrow(
            function () {
                parsed = qs.parse('frozenProp', { allowPrototypes: false });
            },
            'parsing a nonwritable Object.prototype property does not throw'
        );

        st.deepEqual(parsed, {}, 'bare "frozenProp" results in {}');

        st.end();
    });

    t.test('params starting with a closing bracket', function (st) {
        st.deepEqual(qs.parse(']=toString'), { ']': 'toString' });
        st.deepEqual(qs.parse(']]=toString'), { ']]': 'toString' });
        st.deepEqual(qs.parse(']hello]=toString'), { ']hello]': 'toString' });
        st.end();
    });

    t.test('params starting with a starting bracket', function (st) {
        st.deepEqual(qs.parse('[=toString'), { '[': 'toString' });
        st.deepEqual(qs.parse('[[=toString'), { '[[': 'toString' });
        st.deepEqual(qs.parse('[hello[=toString'), { '[hello[': 'toString' });
        st.end();
    });

    t.test('add keys to objects', function (st) {
        st.deepEqual(
            qs.parse('a[b]=c&a=d'),
            { a: { b: 'c', d: true } },
            'can add keys to objects'
        );

        st.deepEqual(
            qs.parse('a[b]=c&a=toString'),
            { a: { b: 'c' } },
            'can not overwrite prototype'
        );

        st.deepEqual(
            qs.parse('a[b]=c&a=toString', { allowPrototypes: true }),
            { a: { b: 'c', toString: true } },
            'can overwrite prototype with allowPrototypes true'
        );

        st.deepEqual(
            qs.parse('a[b]=c&a=toString', { plainObjects: true }),
            { __proto__: null, a: { __proto__: null, b: 'c', toString: true } },
            'can overwrite prototype with plainObjects true'
        );

        st.end();
    });

    t.test('dunder proto is ignored', function (st) {
        var payload = 'categories[__proto__]=login&categories[__proto__]&categories[length]=42';
        var result = qs.parse(payload, { allowPrototypes: true });

        st.deepEqual(
            result,
            {
                categories: {
                    length: '42'
                }
            },
            'silent [[Prototype]] payload'
        );

        var plainResult = qs.parse(payload, { allowPrototypes: true, plainObjects: true });

        st.deepEqual(
            plainResult,
            {
                __proto__: null,
                categories: {
                    __proto__: null,
                    length: '42'
                }
            },
            'silent [[Prototype]] payload: plain objects'
        );

        var query = qs.parse('categories[__proto__]=cats&categories[__proto__]=dogs&categories[some][json]=toInject', { allowPrototypes: true });

        st.notOk(Array.isArray(query.categories), 'is not an array');
        st.notOk(query.categories instanceof Array, 'is not instanceof an array');
        st.deepEqual(query.categories, { some: { json: 'toInject' } });
        st.equal(JSON.stringify(query.categories), '{"some":{"json":"toInject"}}', 'stringifies as a non-array');

        st.deepEqual(
            qs.parse('foo[__proto__][hidden]=value&foo[bar]=stuffs', { allowPrototypes: true }),
            {
                foo: {
                    bar: 'stuffs'
                }
            },
            'hidden values'
        );

        st.deepEqual(
            qs.parse('foo[__proto__][hidden]=value&foo[bar]=stuffs', { allowPrototypes: true, plainObjects: true }),
            {
                __proto__: null,
                foo: {
                    __proto__: null,
                    bar: 'stuffs'
                }
            },
            'hidden values: plain objects'
        );

        st.end();
    });

    t.test('can return null objects', { skip: !hasProto }, function (st) {
        var expected = {
            __proto__: null,
            a: {
                __proto__: null,
                b: 'c',
                hasOwnProperty: 'd'
            }
        };
        st.deepEqual(qs.parse('a[b]=c&a[hasOwnProperty]=d', { plainObjects: true }), expected);
        st.deepEqual(qs.parse(null, { plainObjects: true }), { __proto__: null });
        var expectedArray = {
            __proto__: null,
            a: {
                __proto__: null,
                0: 'b',
                c: 'd'
            }
        };
        st.deepEqual(qs.parse('a[]=b&a[c]=d', { plainObjects: true }), expectedArray);
        st.end();
    });

    t.test('can parse with custom encoding', function (st) {
        st.deepEqual(qs.parse('%8c%a7=%91%e5%8d%e3%95%7b', {
            decoder: function (str) {
                var reg = /%([0-9A-F]{2})/ig;
                var result = [];
                var parts = reg.exec(str);
                while (parts) {
                    result.push(parseInt(parts[1], 16));
                    parts = reg.exec(str);
                }
                return String(iconv.decode(SaferBuffer.from(result), 'shift_jis'));
            }
        }), { 県: '大阪府' });
        st.end();
    });

    t.test('receives the default decoder as a second argument', function (st) {
        st.plan(1);
        qs.parse('a', {
            decoder: function (str, defaultDecoder) {
                st.equal(defaultDecoder, utils.decode);
            }
        });
        st.end();
    });

    t.test('throws error with wrong decoder', function (st) {
        st['throws'](function () {
            qs.parse({}, { decoder: 'string' });
        }, new TypeError('Decoder has to be a function.'));
        st.end();
    });

    t.test('does not mutate the options argument', function (st) {
        var options = {};
        qs.parse('a[b]=true', options);
        st.deepEqual(options, {});
        st.end();
    });

    t.test('throws if an invalid charset is specified', function (st) {
        st['throws'](function () {
            qs.parse('a=b', { charset: 'foobar' });
        }, new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined'));
        st.end();
    });

    t.test('parses an iso-8859-1 string if asked to', function (st) {
        st.deepEqual(qs.parse('%A2=%BD', { charset: 'iso-8859-1' }), { '¢': '½' });
        st.end();
    });

    var urlEncodedCheckmarkInUtf8 = '%E2%9C%93';
    var urlEncodedOSlashInUtf8 = '%C3%B8';
    var urlEncodedNumCheckmark = '%26%2310003%3B';
    var urlEncodedNumSmiley = '%26%239786%3B';

    t.test('prefers an utf-8 charset specified by the utf8 sentinel to a default charset of iso-8859-1', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedCheckmarkInUtf8 + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true, charset: 'iso-8859-1' }), { ø: 'ø' });
        st.end();
    });

    t.test('prefers an iso-8859-1 charset specified by the utf8 sentinel to a default charset of utf-8', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedNumCheckmark + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true, charset: 'utf-8' }), { 'Ã¸': 'Ã¸' });
        st.end();
    });

    t.test('does not require the utf8 sentinel to be defined before the parameters whose decoding it affects', function (st) {
        st.deepEqual(qs.parse('a=' + urlEncodedOSlashInUtf8 + '&utf8=' + urlEncodedNumCheckmark, { charsetSentinel: true, charset: 'utf-8' }), { a: 'Ã¸' });
        st.end();
    });

    t.test('ignores an utf8 sentinel with an unknown value', function (st) {
        st.deepEqual(qs.parse('utf8=foo&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true, charset: 'utf-8' }), { ø: 'ø' });
        st.end();
    });

    t.test('uses the utf8 sentinel to switch to utf-8 when no default charset is given', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedCheckmarkInUtf8 + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true }), { ø: 'ø' });
        st.end();
    });

    t.test('uses the utf8 sentinel to switch to iso-8859-1 when no default charset is given', function (st) {
        st.deepEqual(qs.parse('utf8=' + urlEncodedNumCheckmark + '&' + urlEncodedOSlashInUtf8 + '=' + urlEncodedOSlashInUtf8, { charsetSentinel: true }), { 'Ã¸': 'Ã¸' });
        st.end();
    });

    t.test('interprets numeric entities in iso-8859-1 when `interpretNumericEntities`', function (st) {
        st.deepEqual(qs.parse('foo=' + urlEncodedNumSmiley, { charset: 'iso-8859-1', interpretNumericEntities: true }), { foo: '☺' });
        st.end();
    });

    t.test('handles a custom decoder returning `null`, in the `iso-8859-1` charset, when `interpretNumericEntities`', function (st) {
        st.deepEqual(qs.parse('foo=&bar=' + urlEncodedNumSmiley, {
            charset: 'iso-8859-1',
            decoder: function (str, defaultDecoder, charset) {
                return str ? defaultDecoder(str, defaultDecoder, charset) : null;
            },
            interpretNumericEntities: true
        }), { foo: null, bar: '☺' });
        st.end();
    });

    t.test('does not interpret numeric entities in iso-8859-1 when `interpretNumericEntities` is absent', function (st) {
        st.deepEqual(qs.parse('foo=' + urlEncodedNumSmiley, { charset: 'iso-8859-1' }), { foo: '&#9786;' });
        st.end();
    });

    t.test('does not interpret numeric entities when the charset is utf-8, even when `interpretNumericEntities`', function (st) {
        st.deepEqual(qs.parse('foo=' + urlEncodedNumSmiley, { charset: 'utf-8', interpretNumericEntities: true }), { foo: '&#9786;' });
        st.end();
    });

    t.test('interpretNumericEntities with comma:true and iso charset does not crash', function (st) {
        st.deepEqual(
            qs.parse('b&a[]=1,' + urlEncodedNumSmiley, { comma: true, charset: 'iso-8859-1', interpretNumericEntities: true }),
            { b: '', a: ['1,☺'] }
        );

        st.end();
    });

    t.test('does not interpret %uXXXX syntax in iso-8859-1 mode', function (st) {
        st.deepEqual(qs.parse('%u263A=%u263A', { charset: 'iso-8859-1' }), { '%u263A': '%u263A' });
        st.end();
    });

    t.test('allows for decoding keys and values differently', function (st) {
        var decoder = function (str, defaultDecoder, charset, type) {
            if (type === 'key') {
                return defaultDecoder(str, defaultDecoder, charset, type).toLowerCase();
            }
            if (type === 'value') {
                return defaultDecoder(str, defaultDecoder, charset, type).toUpperCase();
            }
            throw 'this should never happen! type: ' + type;
        };

        st.deepEqual(qs.parse('KeY=vAlUe', { decoder: decoder }), { key: 'VALUE' });
        st.end();
    });

    t.test('parameter limit tests', function (st) {
        st.test('does not throw error when within parameter limit', function (sst) {
            var result = qs.parse('a=1&b=2&c=3', { parameterLimit: 5, throwOnLimitExceeded: true });
            sst.deepEqual(result, { a: '1', b: '2', c: '3' }, 'parses without errors');
            sst.end();
        });

        st.test('throws error when throwOnLimitExceeded is present but not boolean', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a=1&b=2&c=3&d=4&e=5&f=6', { parameterLimit: 3, throwOnLimitExceeded: 'true' });
                },
                new TypeError('`throwOnLimitExceeded` option must be a boolean'),
                'throws error when throwOnLimitExceeded is present and not boolean'
            );
            sst.end();
        });

        st.test('throws error when parameter limit exceeded', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a=1&b=2&c=3&d=4&e=5&f=6', { parameterLimit: 3, throwOnLimitExceeded: true });
                },
                new RangeError('Parameter limit exceeded. Only 3 parameters allowed.'),
                'throws error when parameter limit is exceeded'
            );
            sst.end();
        });

        st.test('silently truncates when throwOnLimitExceeded is not given', function (sst) {
            var result = qs.parse('a=1&b=2&c=3&d=4&e=5', { parameterLimit: 3 });
            sst.deepEqual(result, { a: '1', b: '2', c: '3' }, 'parses and truncates silently');
            sst.end();
        });

        st.test('silently truncates when parameter limit exceeded without error', function (sst) {
            var result = qs.parse('a=1&b=2&c=3&d=4&e=5', { parameterLimit: 3, throwOnLimitExceeded: false });
            sst.deepEqual(result, { a: '1', b: '2', c: '3' }, 'parses and truncates silently');
            sst.end();
        });

        st.test('allows unlimited parameters when parameterLimit set to Infinity', function (sst) {
            var result = qs.parse('a=1&b=2&c=3&d=4&e=5&f=6', { parameterLimit: Infinity });
            sst.deepEqual(result, { a: '1', b: '2', c: '3', d: '4', e: '5', f: '6' }, 'parses all parameters without truncation');
            sst.end();
        });

        st.end();
    });

    t.test('array limit tests', function (st) {
        st.test('does not throw error when array is within limit', function (sst) {
            var result = qs.parse('a[]=1&a[]=2&a[]=3', { arrayLimit: 5, throwOnLimitExceeded: true });
            sst.deepEqual(result, { a: ['1', '2', '3'] }, 'parses array without errors');
            sst.end();
        });

        st.test('throws error when throwOnLimitExceeded is present but not boolean for array limit', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a[]=1&a[]=2&a[]=3&a[]=4', { arrayLimit: 3, throwOnLimitExceeded: 'true' });
                },
                new TypeError('`throwOnLimitExceeded` option must be a boolean'),
                'throws error when throwOnLimitExceeded is present and not boolean for array limit'
            );
            sst.end();
        });

        st.test('throws error when array limit exceeded', function (sst) {
            sst['throws'](
                function () {
                    qs.parse('a[]=1&a[]=2&a[]=3&a[]=4', { arrayLimit: 3, throwOnLimitExceeded: true });
                },
                new RangeError('Array limit exceeded. Only 3 elements allowed in an array.'),
                'throws error when array limit is exceeded'
            );
            sst.end();
        });

        st.test('converts array to object if length is greater than limit', function (sst) {
            var result = qs.parse('a[1]=1&a[2]=2&a[3]=3&a[4]=4&a[5]=5&a[6]=6', { arrayLimit: 5 });

            sst.deepEqual(result, { a: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' } }, 'parses into object if array length is greater than limit');
            sst.end();
        });

        st.end();
    });

    t.end();
});

test('parses empty keys', function (t) {
    emptyTestCases.forEach(function (testCase) {
        t.test('skips empty string key with ' + testCase.input, function (st) {
            st.deepEqual(qs.parse(testCase.input), testCase.noEmptyKeys);

            st.end();
        });
    });
});

test('`duplicates` option', function (t) {
    v.nonStrings.concat('not a valid option').forEach(function (invalidOption) {
        if (typeof invalidOption !== 'undefined') {
            t['throws'](
                function () { qs.parse('', { duplicates: invalidOption }); },
                TypeError,
                'throws on invalid option: ' + inspect(invalidOption)
            );
        }
    });

    t.deepEqual(
        qs.parse('foo=bar&foo=baz'),
        { foo: ['bar', 'baz'] },
        'duplicates: default, combine'
    );

    t.deepEqual(
        qs.parse('foo=bar&foo=baz', { duplicates: 'combine' }),
        { foo: ['bar', 'baz'] },
        'duplicates: combine'
    );

    t.deepEqual(
        qs.parse('foo=bar&foo=baz', { duplicates: 'first' }),
        { foo: 'bar' },
        'duplicates: first'
    );

    t.deepEqual(
        qs.parse('foo=bar&foo=baz', { duplicates: 'last' }),
        { foo: 'baz' },
        'duplicates: last'
    );

    t.end();
});

test('qs strictDepth option - throw cases', function (t) {
    t.test('throws an exception when depth exceeds the limit with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[b][c][d][e][f][g][h][i]=j', { depth: 1, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

    t.test('throws an exception for multiple nested arrays with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[0][1][2][3][4]=b', { depth: 3, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

    t.test('throws an exception for nested objects and arrays with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[b][c][0][d][e]=f', { depth: 3, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

    t.test('throws an exception for different types of values with strictDepth: true', function (st) {
        st['throws'](
            function () {
                qs.parse('a[b][c][d][e]=true&a[b][c][d][f]=42', { depth: 3, strictDepth: true });
            },
            RangeError,
            'throws RangeError'
        );
        st.end();
    });

});

test('qs strictDepth option - non-throw cases', function (t) {
    t.test('when depth is 0 and strictDepth true, do not throw', function (st) {
        st.doesNotThrow(
            function () {
                qs.parse('a[b][c][d][e]=true&a[b][c][d][f]=42', { depth: 0, strictDepth: true });
            },
            RangeError,
            'does not throw RangeError'
        );
        st.end();
    });

    t.test('parses successfully when depth is within the limit with strictDepth: true', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b]=c', { depth: 1, strictDepth: true });
                st.deepEqual(result, { a: { b: 'c' } }, 'parses correctly');
            }
        );
        st.end();
    });

    t.test('does not throw an exception when depth exceeds the limit with strictDepth: false', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b][c][d][e][f][g][h][i]=j', { depth: 1 });
                st.deepEqual(result, { a: { b: { '[c][d][e][f][g][h][i]': 'j' } } }, 'parses with depth limit');
            }
        );
        st.end();
    });

    t.test('parses successfully when depth is within the limit with strictDepth: false', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b]=c', { depth: 1 });
                st.deepEqual(result, { a: { b: 'c' } }, 'parses correctly');
            }
        );
        st.end();
    });

    t.test('does not throw when depth is exactly at the limit with strictDepth: true', function (st) {
        st.doesNotThrow(
            function () {
                var result = qs.parse('a[b][c]=d', { depth: 2, strictDepth: true });
                st.deepEqual(result, { a: { b: { c: 'd' } } }, 'parses correctly');
            }
        );
        st.end();
    });
});


'use strict'

const SemVer = require('../classes/semver')
const parse = (version, options, throwErrors = false) => {
  if (version instanceof SemVer) {
    return version
  }
  try {
    return new SemVer(version, options)
  } catch (er) {
    if (!throwErrors) {
      return null
    }
    throw er
  }
}

module.exports = parse
