import { ContentFilterFinishReasonError, LengthFinishReasonError, OpenAIError } from '../error';
import {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsBase,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionStreamingToolRunnerParams,
  ChatCompletionStreamParams,
  ChatCompletionToolRunnerParams,
  ParsedChatCompletion,
  ParsedChoice,
  ParsedFunctionToolCall,
} from '../resources/chat/completions';
import { type ResponseFormatTextJSONSchemaConfig } from '../resources/responses/responses';
import { ResponseFormatJSONSchema } from '../resources/shared';

type AnyChatCompletionCreateParams =
  | ChatCompletionCreateParams
  | ChatCompletionToolRunnerParams<any>
  | ChatCompletionStreamingToolRunnerParams<any>
  | ChatCompletionStreamParams;

type Unpacked<T> = T extends (infer U)[] ? U : T;

type ToolCall = Unpacked<ChatCompletionCreateParamsBase['tools']>;

export function isChatCompletionFunctionTool(tool: ToolCall): tool is ChatCompletionFunctionTool {
  return tool !== undefined && 'function' in tool && tool.function !== undefined;
}

export type ExtractParsedContentFromParams<Params extends AnyChatCompletionCreateParams> =
  Params['response_format'] extends AutoParseableResponseFormat<infer P> ? P : null;

export type AutoParseableResponseFormat<ParsedT> = ResponseFormatJSONSchema & {
  __output: ParsedT; // type-level only

  $brand: 'auto-parseable-response-format';
  $parseRaw(content: string): ParsedT;
};

export function makeParseableResponseFormat<ParsedT>(
  response_format: ResponseFormatJSONSchema,
  parser: (content: string) => ParsedT,
): AutoParseableResponseFormat<ParsedT> {
  const obj = { ...response_format };

  Object.defineProperties(obj, {
    $brand: {
      value: 'auto-parseable-response-format',
      enumerable: false,
    },
    $parseRaw: {
      value: parser,
      enumerable: false,
    },
  });

  return obj as AutoParseableResponseFormat<ParsedT>;
}

export type AutoParseableTextFormat<ParsedT> = ResponseFormatTextJSONSchemaConfig & {
  __output: ParsedT; // type-level only

  $brand: 'auto-parseable-response-format';
  $parseRaw(content: string): ParsedT;
};

export function makeParseableTextFormat<ParsedT>(
  response_format: ResponseFormatTextJSONSchemaConfig,
  parser: (content: string) => ParsedT,
): AutoParseableTextFormat<ParsedT> {
  const obj = { ...response_format };

  Object.defineProperties(obj, {
    $brand: {
      value: 'auto-parseable-response-format',
      enumerable: false,
    },
    $parseRaw: {
      value: parser,
      enumerable: false,
    },
  });

  return obj as AutoParseableTextFormat<ParsedT>;
}

export function isAutoParsableResponseFormat<ParsedT>(
  response_format: any,
): response_format is AutoParseableResponseFormat<ParsedT> {
  return response_format?.['$brand'] === 'auto-parseable-response-format';
}

type ToolOptions = {
  name: string;
  arguments: any;
  function?: ((args: any) => any) | undefined;
};

export type AutoParseableTool<
  OptionsT extends ToolOptions,
  HasFunction = OptionsT['function'] extends Function ? true : false,
> = ChatCompletionFunctionTool & {
  __arguments: OptionsT['arguments']; // type-level only
  __name: OptionsT['name']; // type-level only
  __hasFunction: HasFunction; // type-level only

  $brand: 'auto-parseable-tool';
  $callback: ((args: OptionsT['arguments']) => any) | undefined;
  $parseRaw(args: string): OptionsT['arguments'];
};

export function makeParseableTool<OptionsT extends ToolOptions>(
  tool: ChatCompletionFunctionTool,
  {
    parser,
    callback,
  }: {
    parser: (content: string) => OptionsT['arguments'];
    callback: ((args: any) => any) | undefined;
  },
): AutoParseableTool<OptionsT['arguments']> {
  const obj = { ...tool };

  Object.defineProperties(obj, {
    $brand: {
      value: 'auto-parseable-tool',
      enumerable: false,
    },
    $parseRaw: {
      value: parser,
      enumerable: false,
    },
    $callback: {
      value: callback,
      enumerable: false,
    },
  });

  return obj as AutoParseableTool<OptionsT['arguments']>;
}

export function isAutoParsableTool(tool: any): tool is AutoParseableTool<any> {
  return tool?.['$brand'] === 'auto-parseable-tool';
}

export function maybeParseChatCompletion<
  Params extends ChatCompletionCreateParams | null,
  ParsedT = Params extends null ? null : ExtractParsedContentFromParams<NonNullable<Params>>,
>(completion: ChatCompletion, params: Params): ParsedChatCompletion<ParsedT> {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => {
        assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);

        return {
          ...choice,
          message: {
            ...choice.message,
            parsed: null,
            ...(choice.message.tool_calls ?
              {
                tool_calls: choice.message.tool_calls,
              }
            : undefined),
          },
        };
      }),
    } as ParsedChatCompletion<ParsedT>;
  }

  return parseChatCompletion(completion, params);
}

export function parseChatCompletion<
  Params extends ChatCompletionCreateParams,
  ParsedT = ExtractParsedContentFromParams<Params>,
>(completion: ChatCompletion, params: Params): ParsedChatCompletion<ParsedT> {
  const choices: Array<ParsedChoice<ParsedT>> = completion.choices.map((choice): ParsedChoice<ParsedT> => {
    if (choice.finish_reason === 'length') {
      throw new LengthFinishReasonError();
    }

    if (choice.finish_reason === 'content_filter') {
      throw new ContentFilterFinishReasonError();
    }

    assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);

    return {
      ...choice,
      message: {
        ...choice.message,
        ...(choice.message.tool_calls ?
          {
            tool_calls:
              choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? undefined,
          }
        : undefined),
        parsed:
          choice.message.content && !choice.message.refusal ?
            parseResponseFormat(params, choice.message.content)
          : null,
      },
    } as ParsedChoice<ParsedT>;
  });

  return { ...completion, choices };
}

function parseResponseFormat<
  Params extends ChatCompletionCreateParams,
  ParsedT = ExtractParsedContentFromParams<Params>,
>(params: Params, content: string): ParsedT | null {
  if (params.response_format?.type !== 'json_schema') {
    return null;
  }

  if (params.response_format?.type === 'json_schema') {
    if ('$parseRaw' in params.response_format) {
      const response_format = params.response_format as AutoParseableResponseFormat<ParsedT>;

      return response_format.$parseRaw(content);
    }

    return JSON.parse(content);
  }

  return null;
}

function parseToolCall<Params extends ChatCompletionCreateParams>(
  params: Params,
  toolCall: ChatCompletionMessageFunctionToolCall,
): ParsedFunctionToolCall {
  const inputTool = params.tools?.find(
    (inputTool) =>
      isChatCompletionFunctionTool(inputTool) && inputTool.function?.name === toolCall.function.name,
  ) as ChatCompletionFunctionTool | undefined; // TS doesn't narrow based on isChatCompletionTool
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments:
        isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments)
        : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments)
        : null,
    },
  };
}

export function shouldParseToolCall(
  params: ChatCompletionCreateParams | null | undefined,
  toolCall: ChatCompletionMessageFunctionToolCall,
): boolean {
  if (!params || !('tools' in params) || !params.tools) {
    return false;
  }

  const inputTool = params.tools?.find(
    (inputTool) =>
      isChatCompletionFunctionTool(inputTool) && inputTool.function?.name === toolCall.function.name,
  );
  return (
    isChatCompletionFunctionTool(inputTool) &&
    (isAutoParsableTool(inputTool) || inputTool?.function.strict || false)
  );
}

export function hasAutoParseableInput(params: AnyChatCompletionCreateParams): boolean {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }

  return (
    params.tools?.some(
      (t) => isAutoParsableTool(t) || (t.type === 'function' && t.function.strict === true),
    ) ?? false
  );
}

export function assertToolCallsAreChatCompletionFunctionToolCalls(
  toolCalls: ChatCompletionMessage['tool_calls'],
): asserts toolCalls is ChatCompletionMessageFunctionToolCall[] {
  for (const toolCall of toolCalls || []) {
    if (toolCall.type !== 'function') {
      throw new OpenAIError(
        `Currently only \`function\` tool calls are supported; Received \`${toolCall.type}\``,
      );
    }
  }
}

export function validateInputTools(tools: ChatCompletionCreateParamsBase['tools']) {
  for (const tool of tools ?? []) {
    if (tool.type !== 'function') {
      throw new OpenAIError(
        `Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``,
      );
    }

    if (tool.function.strict !== true) {
      throw new OpenAIError(
        `The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`,
      );
    }
  }
}


const STR = 0b000000001;
const NUM = 0b000000010;
const ARR = 0b000000100;
const OBJ = 0b000001000;
const NULL = 0b000010000;
const BOOL = 0b000100000;
const NAN = 0b001000000;
const INFINITY = 0b010000000;
const MINUS_INFINITY = 0b100000000;

const INF = INFINITY | MINUS_INFINITY;
const SPECIAL = NULL | BOOL | INF | NAN;
const ATOM = STR | NUM | SPECIAL;
const COLLECTION = ARR | OBJ;
const ALL = ATOM | COLLECTION;

const Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL,
};

// The JSON string segment was unable to be parsed completely
class PartialJSON extends Error {}

class MalformedJSON extends Error {}

/**
 * Parse incomplete JSON
 * @param {string} jsonString Partial JSON to be parsed
 * @param {number} allowPartial Specify what types are allowed to be partial, see {@link Allow} for details
 * @returns The parsed JSON
 * @throws {PartialJSON} If the JSON is incomplete (related to the `allow` parameter)
 * @throws {MalformedJSON} If the JSON is malformed
 */
function parseJSON(jsonString: string, allowPartial: number = Allow.ALL): any {
  if (typeof jsonString !== 'string') {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}

const _parseJSON = (jsonString: string, allow: number) => {
  const length = jsonString.length;
  let index = 0;

  const markPartialJSON = (msg: string) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };

  const throwMalformedError = (msg: string) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };

  const parseAny: () => any = () => {
    skipBlank();
    if (index >= length) markPartialJSON('Unexpected end of input');
    if (jsonString[index] === '"') return parseStr();
    if (jsonString[index] === '{') return parseObj();
    if (jsonString[index] === '[') return parseArr();
    if (
      jsonString.substring(index, index + 4) === 'null' ||
      (Allow.NULL & allow && length - index < 4 && 'null'.startsWith(jsonString.substring(index)))
    ) {
      index += 4;
      return null;
    }
    if (
      jsonString.substring(index, index + 4) === 'true' ||
      (Allow.BOOL & allow && length - index < 4 && 'true'.startsWith(jsonString.substring(index)))
    ) {
      index += 4;
      return true;
    }
    if (
      jsonString.substring(index, index + 5) === 'false' ||
      (Allow.BOOL & allow && length - index < 5 && 'false'.startsWith(jsonString.substring(index)))
    ) {
      index += 5;
      return false;
    }
    if (
      jsonString.substring(index, index + 8) === 'Infinity' ||
      (Allow.INFINITY & allow && length - index < 8 && 'Infinity'.startsWith(jsonString.substring(index)))
    ) {
      index += 8;
      return Infinity;
    }
    if (
      jsonString.substring(index, index + 9) === '-Infinity' ||
      (Allow.MINUS_INFINITY & allow &&
        1 < length - index &&
        length - index < 9 &&
        '-Infinity'.startsWith(jsonString.substring(index)))
    ) {
      index += 9;
      return -Infinity;
    }
    if (
      jsonString.substring(index, index + 3) === 'NaN' ||
      (Allow.NAN & allow && length - index < 3 && 'NaN'.startsWith(jsonString.substring(index)))
    ) {
      index += 3;
      return NaN;
    }
    return parseNum();
  };

  const parseStr: () => string = () => {
    const start = index;
    let escape = false;
    index++; // skip initial quote
    while (index < length && (jsonString[index] !== '"' || (escape && jsonString[index - 1] === '\\'))) {
      escape = jsonString[index] === '\\' ? !escape : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape)) + '"');
      } catch (e) {
        // SyntaxError: Invalid escape sequence
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf('\\')) + '"');
      }
    }
    markPartialJSON('Unterminated string literal');
  };

  const parseObj = () => {
    index++; // skip initial brace
    skipBlank();
    const obj: Record<string, any> = {};
    try {
      while (jsonString[index] !== '}') {
        skipBlank();
        if (index >= length && Allow.OBJ & allow) return obj;
        const key = parseStr();
        skipBlank();
        index++; // skip colon
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow) return obj;
          else throw e;
        }
        skipBlank();
        if (jsonString[index] === ',') index++; // skip comma
      }
    } catch (e) {
      if (Allow.OBJ & allow) return obj;
      else markPartialJSON("Expected '}' at end of object");
    }
    index++; // skip final brace
    return obj;
  };

  const parseArr = () => {
    index++; // skip initial bracket
    const arr = [];
    try {
      while (jsonString[index] !== ']') {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ',') {
          index++; // skip comma
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++; // skip final bracket
    return arr;
  };

  const parseNum = () => {
    if (index === 0) {
      if (jsonString === '-' && Allow.NUM & allow) markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if ('.' === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf('.')));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf('e')));
          } catch (e) {}
        }
        throwMalformedError(String(e));
      }
    }

    const start = index;

    if (jsonString[index] === '-') index++;
    while (jsonString[index] && !',]}'.includes(jsonString[index]!)) index++;

    if (index == length && !(Allow.NUM & allow)) markPartialJSON('Unterminated number literal');

    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e) {
      if (jsonString.substring(start, index) === '-' && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf('e')));
      } catch (e) {
        throwMalformedError(String(e));
      }
    }
  };

  const skipBlank = () => {
    while (index < length && ' \n\r\t'.includes(jsonString[index]!)) {
      index++;
    }
  };

  return parseAny();
};

// using this function with malformed JSON is undefined behavior
const partialParse = (input: string) => parseJSON(input, Allow.ALL ^ Allow.NUM);

export { partialParse, PartialJSON, MalformedJSON };


import { ContentFilterFinishReasonError, LengthFinishReasonError, OpenAIError } from '../error';
import {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsBase,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionStreamingToolRunnerParams,
  ChatCompletionStreamParams,
  ChatCompletionToolRunnerParams,
  ParsedChatCompletion,
  ParsedChoice,
  ParsedFunctionToolCall,
} from '../resources/chat/completions';
import { type ResponseFormatTextJSONSchemaConfig } from '../resources/responses/responses';
import { ResponseFormatJSONSchema } from '../resources/shared';

type AnyChatCompletionCreateParams =
  | ChatCompletionCreateParams
  | ChatCompletionToolRunnerParams<any>
  | ChatCompletionStreamingToolRunnerParams<any>
  | ChatCompletionStreamParams;

type Unpacked<T> = T extends (infer U)[] ? U : T;

type ToolCall = Unpacked<ChatCompletionCreateParamsBase['tools']>;

export function isChatCompletionFunctionTool(tool: ToolCall): tool is ChatCompletionFunctionTool {
  return tool !== undefined && 'function' in tool && tool.function !== undefined;
}

export type ExtractParsedContentFromParams<Params extends AnyChatCompletionCreateParams> =
  Params['response_format'] extends AutoParseableResponseFormat<infer P> ? P : null;

export type AutoParseableResponseFormat<ParsedT> = ResponseFormatJSONSchema & {
  __output: ParsedT; // type-level only

  $brand: 'auto-parseable-response-format';
  $parseRaw(content: string): ParsedT;
};

export function makeParseableResponseFormat<ParsedT>(
  response_format: ResponseFormatJSONSchema,
  parser: (content: string) => ParsedT,
): AutoParseableResponseFormat<ParsedT> {
  const obj = { ...response_format };

  Object.defineProperties(obj, {
    $brand: {
      value: 'auto-parseable-response-format',
      enumerable: false,
    },
    $parseRaw: {
      value: parser,
      enumerable: false,
    },
  });

  return obj as AutoParseableResponseFormat<ParsedT>;
}

export type AutoParseableTextFormat<ParsedT> = ResponseFormatTextJSONSchemaConfig & {
  __output: ParsedT; // type-level only

  $brand: 'auto-parseable-response-format';
  $parseRaw(content: string): ParsedT;
};

export function makeParseableTextFormat<ParsedT>(
  response_format: ResponseFormatTextJSONSchemaConfig,
  parser: (content: string) => ParsedT,
): AutoParseableTextFormat<ParsedT> {
  const obj = { ...response_format };

  Object.defineProperties(obj, {
    $brand: {
      value: 'auto-parseable-response-format',
      enumerable: false,
    },
    $parseRaw: {
      value: parser,
      enumerable: false,
    },
  });

  return obj as AutoParseableTextFormat<ParsedT>;
}

export function isAutoParsableResponseFormat<ParsedT>(
  response_format: any,
): response_format is AutoParseableResponseFormat<ParsedT> {
  return response_format?.['$brand'] === 'auto-parseable-response-format';
}

type ToolOptions = {
  name: string;
  arguments: any;
  function?: ((args: any) => any) | undefined;
};

export type AutoParseableTool<
  OptionsT extends ToolOptions,
  HasFunction = OptionsT['function'] extends Function ? true : false,
> = ChatCompletionFunctionTool & {
  __arguments: OptionsT['arguments']; // type-level only
  __name: OptionsT['name']; // type-level only
  __hasFunction: HasFunction; // type-level only

  $brand: 'auto-parseable-tool';
  $callback: ((args: OptionsT['arguments']) => any) | undefined;
  $parseRaw(args: string): OptionsT['arguments'];
};

export function makeParseableTool<OptionsT extends ToolOptions>(
  tool: ChatCompletionFunctionTool,
  {
    parser,
    callback,
  }: {
    parser: (content: string) => OptionsT['arguments'];
    callback: ((args: any) => any) | undefined;
  },
): AutoParseableTool<OptionsT['arguments']> {
  const obj = { ...tool };

  Object.defineProperties(obj, {
    $brand: {
      value: 'auto-parseable-tool',
      enumerable: false,
    },
    $parseRaw: {
      value: parser,
      enumerable: false,
    },
    $callback: {
      value: callback,
      enumerable: false,
    },
  });

  return obj as AutoParseableTool<OptionsT['arguments']>;
}

export function isAutoParsableTool(tool: any): tool is AutoParseableTool<any> {
  return tool?.['$brand'] === 'auto-parseable-tool';
}

export function maybeParseChatCompletion<
  Params extends ChatCompletionCreateParams | null,
  ParsedT = Params extends null ? null : ExtractParsedContentFromParams<NonNullable<Params>>,
>(completion: ChatCompletion, params: Params): ParsedChatCompletion<ParsedT> {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => {
        assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);

        return {
          ...choice,
          message: {
            ...choice.message,
            parsed: null,
            ...(choice.message.tool_calls ?
              {
                tool_calls: choice.message.tool_calls,
              }
            : undefined),
          },
        };
      }),
    } as ParsedChatCompletion<ParsedT>;
  }

  return parseChatCompletion(completion, params);
}

export function parseChatCompletion<
  Params extends ChatCompletionCreateParams,
  ParsedT = ExtractParsedContentFromParams<Params>,
>(completion: ChatCompletion, params: Params): ParsedChatCompletion<ParsedT> {
  const choices: Array<ParsedChoice<ParsedT>> = completion.choices.map((choice): ParsedChoice<ParsedT> => {
    if (choice.finish_reason === 'length') {
      throw new LengthFinishReasonError();
    }

    if (choice.finish_reason === 'content_filter') {
      throw new ContentFilterFinishReasonError();
    }

    assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);

    return {
      ...choice,
      message: {
        ...choice.message,
        ...(choice.message.tool_calls ?
          {
            tool_calls:
              choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? undefined,
          }
        : undefined),
        parsed:
          choice.message.content && !choice.message.refusal ?
            parseResponseFormat(params, choice.message.content)
          : null,
      },
    } as ParsedChoice<ParsedT>;
  });

  return { ...completion, choices };
}

function parseResponseFormat<
  Params extends ChatCompletionCreateParams,
  ParsedT = ExtractParsedContentFromParams<Params>,
>(params: Params, content: string): ParsedT | null {
  if (params.response_format?.type !== 'json_schema') {
    return null;
  }

  if (params.response_format?.type === 'json_schema') {
    if ('$parseRaw' in params.response_format) {
      const response_format = params.response_format as AutoParseableResponseFormat<ParsedT>;

      return response_format.$parseRaw(content);
    }

    return JSON.parse(content);
  }

  return null;
}

function parseToolCall<Params extends ChatCompletionCreateParams>(
  params: Params,
  toolCall: ChatCompletionMessageFunctionToolCall,
): ParsedFunctionToolCall {
  const inputTool = params.tools?.find(
    (inputTool) =>
      isChatCompletionFunctionTool(inputTool) && inputTool.function?.name === toolCall.function.name,
  ) as ChatCompletionFunctionTool | undefined; // TS doesn't narrow based on isChatCompletionTool
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments:
        isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments)
        : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments)
        : null,
    },
  };
}

export function shouldParseToolCall(
  params: ChatCompletionCreateParams | null | undefined,
  toolCall: ChatCompletionMessageFunctionToolCall,
): boolean {
  if (!params || !('tools' in params) || !params.tools) {
    return false;
  }

  const inputTool = params.tools?.find(
    (inputTool) =>
      isChatCompletionFunctionTool(inputTool) && inputTool.function?.name === toolCall.function.name,
  );
  return (
    isChatCompletionFunctionTool(inputTool) &&
    (isAutoParsableTool(inputTool) || inputTool?.function.strict || false)
  );
}

export function hasAutoParseableInput(params: AnyChatCompletionCreateParams): boolean {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }

  return (
    params.tools?.some(
      (t) => isAutoParsableTool(t) || (t.type === 'function' && t.function.strict === true),
    ) ?? false
  );
}

export function assertToolCallsAreChatCompletionFunctionToolCalls(
  toolCalls: ChatCompletionMessage['tool_calls'],
): asserts toolCalls is ChatCompletionMessageFunctionToolCall[] {
  for (const toolCall of toolCalls || []) {
    if (toolCall.type !== 'function') {
      throw new OpenAIError(
        `Currently only \`function\` tool calls are supported; Received \`${toolCall.type}\``,
      );
    }
  }
}

export function validateInputTools(tools: ChatCompletionCreateParamsBase['tools']) {
  for (const tool of tools ?? []) {
    if (tool.type !== 'function') {
      throw new OpenAIError(
        `Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``,
      );
    }

    if (tool.function.strict !== true) {
      throw new OpenAIError(
        `The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`,
      );
    }
  }
}


const STR = 0b000000001;
const NUM = 0b000000010;
const ARR = 0b000000100;
const OBJ = 0b000001000;
const NULL = 0b000010000;
const BOOL = 0b000100000;
const NAN = 0b001000000;
const INFINITY = 0b010000000;
const MINUS_INFINITY = 0b100000000;

const INF = INFINITY | MINUS_INFINITY;
const SPECIAL = NULL | BOOL | INF | NAN;
const ATOM = STR | NUM | SPECIAL;
const COLLECTION = ARR | OBJ;
const ALL = ATOM | COLLECTION;

const Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL,
};

// The JSON string segment was unable to be parsed completely
class PartialJSON extends Error {}

class MalformedJSON extends Error {}

/**
 * Parse incomplete JSON
 * @param {string} jsonString Partial JSON to be parsed
 * @param {number} allowPartial Specify what types are allowed to be partial, see {@link Allow} for details
 * @returns The parsed JSON
 * @throws {PartialJSON} If the JSON is incomplete (related to the `allow` parameter)
 * @throws {MalformedJSON} If the JSON is malformed
 */
function parseJSON(jsonString: string, allowPartial: number = Allow.ALL): any {
  if (typeof jsonString !== 'string') {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}

const _parseJSON = (jsonString: string, allow: number) => {
  const length = jsonString.length;
  let index = 0;

  const markPartialJSON = (msg: string) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };

  const throwMalformedError = (msg: string) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };

  const parseAny: () => any = () => {
    skipBlank();
    if (index >= length) markPartialJSON('Unexpected end of input');
    if (jsonString[index] === '"') return parseStr();
    if (jsonString[index] === '{') return parseObj();
    if (jsonString[index] === '[') return parseArr();
    if (
      jsonString.substring(index, index + 4) === 'null' ||
      (Allow.NULL & allow && length - index < 4 && 'null'.startsWith(jsonString.substring(index)))
    ) {
      index += 4;
      return null;
    }
    if (
      jsonString.substring(index, index + 4) === 'true' ||
      (Allow.BOOL & allow && length - index < 4 && 'true'.startsWith(jsonString.substring(index)))
    ) {
      index += 4;
      return true;
    }
    if (
      jsonString.substring(index, index + 5) === 'false' ||
      (Allow.BOOL & allow && length - index < 5 && 'false'.startsWith(jsonString.substring(index)))
    ) {
      index += 5;
      return false;
    }
    if (
      jsonString.substring(index, index + 8) === 'Infinity' ||
      (Allow.INFINITY & allow && length - index < 8 && 'Infinity'.startsWith(jsonString.substring(index)))
    ) {
      index += 8;
      return Infinity;
    }
    if (
      jsonString.substring(index, index + 9) === '-Infinity' ||
      (Allow.MINUS_INFINITY & allow &&
        1 < length - index &&
        length - index < 9 &&
        '-Infinity'.startsWith(jsonString.substring(index)))
    ) {
      index += 9;
      return -Infinity;
    }
    if (
      jsonString.substring(index, index + 3) === 'NaN' ||
      (Allow.NAN & allow && length - index < 3 && 'NaN'.startsWith(jsonString.substring(index)))
    ) {
      index += 3;
      return NaN;
    }
    return parseNum();
  };

  const parseStr: () => string = () => {
    const start = index;
    let escape = false;
    index++; // skip initial quote
    while (index < length && (jsonString[index] !== '"' || (escape && jsonString[index - 1] === '\\'))) {
      escape = jsonString[index] === '\\' ? !escape : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape)) + '"');
      } catch (e) {
        // SyntaxError: Invalid escape sequence
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf('\\')) + '"');
      }
    }
    markPartialJSON('Unterminated string literal');
  };

  const parseObj = () => {
    index++; // skip initial brace
    skipBlank();
    const obj: Record<string, any> = {};
    try {
      while (jsonString[index] !== '}') {
        skipBlank();
        if (index >= length && Allow.OBJ & allow) return obj;
        const key = parseStr();
        skipBlank();
        index++; // skip colon
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow) return obj;
          else throw e;
        }
        skipBlank();
        if (jsonString[index] === ',') index++; // skip comma
      }
    } catch (e) {
      if (Allow.OBJ & allow) return obj;
      else markPartialJSON("Expected '}' at end of object");
    }
    index++; // skip final brace
    return obj;
  };

  const parseArr = () => {
    index++; // skip initial bracket
    const arr = [];
    try {
      while (jsonString[index] !== ']') {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ',') {
          index++; // skip comma
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++; // skip final bracket
    return arr;
  };

  const parseNum = () => {
    if (index === 0) {
      if (jsonString === '-' && Allow.NUM & allow) markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if ('.' === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf('.')));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf('e')));
          } catch (e) {}
        }
        throwMalformedError(String(e));
      }
    }

    const start = index;

    if (jsonString[index] === '-') index++;
    while (jsonString[index] && !',]}'.includes(jsonString[index]!)) index++;

    if (index == length && !(Allow.NUM & allow)) markPartialJSON('Unterminated number literal');

    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e) {
      if (jsonString.substring(start, index) === '-' && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf('e')));
      } catch (e) {
        throwMalformedError(String(e));
      }
    }
  };

  const skipBlank = () => {
    while (index < length && ' \n\r\t'.includes(jsonString[index]!)) {
      index++;
    }
  };

  return parseAny();
};

// using this function with malformed JSON is undefined behavior
const partialParse = (input: string) => parseJSON(input, Allow.ALL ^ Allow.NUM);

export { partialParse, PartialJSON, MalformedJSON };
