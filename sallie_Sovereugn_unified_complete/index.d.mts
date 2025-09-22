/// <reference types="node" />
import * as nativeFs from "fs";
import picomatch from "picomatch";

//#region src/api/aborter.d.ts
/**
 * AbortController is not supported on Node 14 so we use this until we can drop
 * support for Node 14.
 */
declare class Aborter {
  aborted: boolean;
  abort(): void;
}
//#endregion
//#region src/api/queue.d.ts
type OnQueueEmptyCallback = (error: Error | null, output: WalkerState) => void;
/**
 * This is a custom stateless queue to track concurrent async fs calls.
 * It increments a counter whenever a call is queued and decrements it
 * as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
 */
declare class Queue {
  private onQueueEmpty?;
  count: number;
  constructor(onQueueEmpty?: OnQueueEmptyCallback | undefined);
  enqueue(): number;
  dequeue(error: Error | null, output: WalkerState): void;
}
//#endregion
//#region src/types.d.ts
type Counts = {
  files: number;
  directories: number;
  /**
   * @deprecated use `directories` instead. Will be removed in v7.0.
   */
  dirs: number;
};
type Group = {
  directory: string;
  files: string[];
  /**
   * @deprecated use `directory` instead. Will be removed in v7.0.
   */
  dir: string;
};
type GroupOutput = Group[];
type OnlyCountsOutput = Counts;
type PathsOutput = string[];
type Output = OnlyCountsOutput | PathsOutput | GroupOutput;
type FSLike = {
  readdir: typeof nativeFs.readdir;
  readdirSync: typeof nativeFs.readdirSync;
  realpath: typeof nativeFs.realpath;
  realpathSync: typeof nativeFs.realpathSync;
  stat: typeof nativeFs.stat;
  statSync: typeof nativeFs.statSync;
};
type WalkerState = {
  root: string;
  paths: string[];
  groups: Group[];
  counts: Counts;
  options: Options;
  queue: Queue;
  controller: Aborter;
  fs: FSLike;
  symlinks: Map<string, string>;
  visited: string[];
};
type ResultCallback<TOutput extends Output> = (error: Error | null, output: TOutput) => void;
type FilterPredicate = (path: string, isDirectory: boolean) => boolean;
type ExcludePredicate = (dirName: string, dirPath: string) => boolean;
type PathSeparator = "/" | "\\";
type Options<TGlobFunction = unknown> = {
  includeBasePath?: boolean;
  includeDirs?: boolean;
  normalizePath?: boolean;
  maxDepth: number;
  maxFiles?: number;
  resolvePaths?: boolean;
  suppressErrors: boolean;
  group?: boolean;
  onlyCounts?: boolean;
  filters: FilterPredicate[];
  resolveSymlinks?: boolean;
  useRealPaths?: boolean;
  excludeFiles?: boolean;
  excludeSymlinks?: boolean;
  exclude?: ExcludePredicate;
  relativePaths?: boolean;
  pathSeparator: PathSeparator;
  signal?: AbortSignal;
  globFunction?: TGlobFunction;
  fs?: FSLike;
};
type GlobMatcher = (test: string) => boolean;
type GlobFunction = (glob: string | string[], ...params: unknown[]) => GlobMatcher;
type GlobParams<T> = T extends ((globs: string | string[], ...params: infer TParams extends unknown[]) => GlobMatcher) ? TParams : [];
//#endregion
//#region src/builder/api-builder.d.ts
declare class APIBuilder<TReturnType extends Output> {
  private readonly root;
  private readonly options;
  constructor(root: string, options: Options);
  withPromise(): Promise<TReturnType>;
  withCallback(cb: ResultCallback<TReturnType>): void;
  sync(): TReturnType;
}
//#endregion
//#region src/builder/index.d.ts
declare class Builder<TReturnType extends Output = PathsOutput, TGlobFunction = typeof picomatch> {
  private readonly globCache;
  private options;
  private globFunction?;
  constructor(options?: Partial<Options<TGlobFunction>>);
  group(): Builder<GroupOutput, TGlobFunction>;
  withPathSeparator(separator: "/" | "\\"): this;
  withBasePath(): this;
  withRelativePaths(): this;
  withDirs(): this;
  withMaxDepth(depth: number): this;
  withMaxFiles(limit: number): this;
  withFullPaths(): this;
  withErrors(): this;
  withSymlinks({
    resolvePaths
  }?: {
    resolvePaths?: boolean | undefined;
  }): this;
  withAbortSignal(signal: AbortSignal): this;
  normalize(): this;
  filter(predicate: FilterPredicate): this;
  onlyDirs(): this;
  exclude(predicate: ExcludePredicate): this;
  onlyCounts(): Builder<OnlyCountsOutput, TGlobFunction>;
  crawl(root?: string): APIBuilder<TReturnType>;
  withGlobFunction<TFunc>(fn: TFunc): Builder<TReturnType, TFunc>;
  /**
   * @deprecated Pass options using the constructor instead:
   * ```ts
   * new fdir(options).crawl("/path/to/root");
   * ```
   * This method will be removed in v7.0
   */
  crawlWithOptions(root: string, options: Partial<Options<TGlobFunction>>): APIBuilder<TReturnType>;
  glob(...patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[], ...options: GlobParams<TGlobFunction>): Builder<TReturnType, TGlobFunction>;
}
//#endregion
//#region src/index.d.ts
type Fdir = typeof Builder;
//#endregion
export { Counts, ExcludePredicate, FSLike, Fdir, FilterPredicate, GlobFunction, GlobMatcher, GlobParams, Group, GroupOutput, OnlyCountsOutput, Options, Output, PathSeparator, PathsOutput, ResultCallback, WalkerState, Builder as fdir };

export { OpenAIRealtimeError } from "./internal-base.mjs";
//# sourceMappingURL=index.d.mts.map

export { OpenAI as default } from "./client.mjs";
export { type Uploadable, toFile } from "./core/uploads.mjs";
export { APIPromise } from "./core/api-promise.mjs";
export { OpenAI, type ClientOptions } from "./client.mjs";
export { PagePromise } from "./core/pagination.mjs";
export { OpenAIError, APIError, APIConnectionError, APIConnectionTimeoutError, APIUserAbortError, NotFoundError, ConflictError, RateLimitError, BadRequestError, AuthenticationError, InternalServerError, PermissionDeniedError, UnprocessableEntityError, InvalidWebhookSignatureError, } from "./core/error.mjs";
export { AzureOpenAI } from "./azure.mjs";
//# sourceMappingURL=index.d.mts.map

declare const formats: {
    formatters: Record<import("./types").Format, (str: PropertyKey) => string>;
    RFC1738: string;
    RFC3986: string;
    default: import("./types").Format;
};
export { stringify } from "./stringify.mjs";
export { formats };
export type { DefaultDecoder, DefaultEncoder, Format, ParseOptions, StringifyOptions } from "./types.mjs";
//# sourceMappingURL=index.d.mts.map

export { Audio, type AudioModel, type AudioResponseFormat } from "./audio.mjs";
export { Speech, type SpeechModel, type SpeechCreateParams } from "./speech.mjs";
export { Transcriptions, type Transcription, type TranscriptionInclude, type TranscriptionSegment, type TranscriptionStreamEvent, type TranscriptionTextDeltaEvent, type TranscriptionTextDoneEvent, type TranscriptionVerbose, type TranscriptionWord, type TranscriptionCreateResponse, type TranscriptionCreateParams, type TranscriptionCreateParamsNonStreaming, type TranscriptionCreateParamsStreaming, } from "./transcriptions.mjs";
export { Translations, type Translation, type TranslationVerbose, type TranslationCreateResponse, type TranslationCreateParams, } from "./translations.mjs";
//# sourceMappingURL=index.d.mts.map

export { Assistants, type Assistant, type AssistantDeleted, type AssistantStreamEvent, type AssistantTool, type CodeInterpreterTool, type FileSearchTool, type FunctionTool, type MessageStreamEvent, type RunStepStreamEvent, type RunStreamEvent, type ThreadStreamEvent, type AssistantCreateParams, type AssistantUpdateParams, type AssistantListParams, type AssistantsPage, } from "./assistants.mjs";
export { Beta } from "./beta.mjs";
export { Realtime } from "./realtime/index.mjs";
export { Threads, type AssistantResponseFormatOption, type AssistantToolChoice, type AssistantToolChoiceFunction, type AssistantToolChoiceOption, type Thread, type ThreadDeleted, type ThreadCreateParams, type ThreadUpdateParams, type ThreadCreateAndRunParams, type ThreadCreateAndRunParamsNonStreaming, type ThreadCreateAndRunParamsStreaming, type ThreadCreateAndRunPollParams, type ThreadCreateAndRunStreamParams, } from "./threads/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { Realtime } from "./realtime.mjs";
export { Sessions, type Session, type SessionCreateResponse, type SessionCreateParams } from "./sessions.mjs";
export { TranscriptionSessions, type TranscriptionSession, type TranscriptionSessionCreateParams, } from "./transcription-sessions.mjs";
//# sourceMappingURL=index.d.mts.map

export { Messages, type Annotation, type AnnotationDelta, type FileCitationAnnotation, type FileCitationDeltaAnnotation, type FilePathAnnotation, type FilePathDeltaAnnotation, type ImageFile, type ImageFileContentBlock, type ImageFileDelta, type ImageFileDeltaBlock, type ImageURL, type ImageURLContentBlock, type ImageURLDelta, type ImageURLDeltaBlock, type Message, type MessageContent, type MessageContentDelta, type MessageContentPartParam, type MessageDeleted, type MessageDelta, type MessageDeltaEvent, type RefusalContentBlock, type RefusalDeltaBlock, type Text, type TextContentBlock, type TextContentBlockParam, type TextDelta, type TextDeltaBlock, type MessageCreateParams, type MessageRetrieveParams, type MessageUpdateParams, type MessageListParams, type MessageDeleteParams, type MessagesPage, } from "./messages.mjs";
export { Runs, type RequiredActionFunctionToolCall, type Run, type RunStatus, type RunCreateParams, type RunCreateParamsNonStreaming, type RunCreateParamsStreaming, type RunRetrieveParams, type RunUpdateParams, type RunListParams, type RunCancelParams, type RunSubmitToolOutputsParams, type RunSubmitToolOutputsParamsNonStreaming, type RunSubmitToolOutputsParamsStreaming, type RunsPage, type RunCreateAndPollParams, type RunCreateAndStreamParams, type RunStreamParams, type RunSubmitToolOutputsAndPollParams, type RunSubmitToolOutputsStreamParams, } from "./runs/index.mjs";
export { Threads, type AssistantResponseFormatOption, type AssistantToolChoice, type AssistantToolChoiceFunction, type AssistantToolChoiceOption, type Thread, type ThreadDeleted, type ThreadCreateParams, type ThreadUpdateParams, type ThreadCreateAndRunParams, type ThreadCreateAndRunParamsNonStreaming, type ThreadCreateAndRunParamsStreaming, type ThreadCreateAndRunPollParams, type ThreadCreateAndRunStreamParams, } from "./threads.mjs";
//# sourceMappingURL=index.d.mts.map

export { Runs, type RequiredActionFunctionToolCall, type Run, type RunStatus, type RunCreateParams, type RunCreateParamsNonStreaming, type RunCreateParamsStreaming, type RunRetrieveParams, type RunUpdateParams, type RunListParams, type RunCancelParams, type RunSubmitToolOutputsParams, type RunSubmitToolOutputsParamsNonStreaming, type RunSubmitToolOutputsParamsStreaming, type RunsPage, type RunCreateAndPollParams, type RunCreateAndStreamParams, type RunStreamParams, type RunSubmitToolOutputsAndPollParams, type RunSubmitToolOutputsStreamParams, } from "./runs.mjs";
export { Steps, type CodeInterpreterLogs, type CodeInterpreterOutputImage, type CodeInterpreterToolCall, type CodeInterpreterToolCallDelta, type FileSearchToolCall, type FileSearchToolCallDelta, type FunctionToolCall, type FunctionToolCallDelta, type MessageCreationStepDetails, type RunStep, type RunStepInclude, type RunStepDelta, type RunStepDeltaEvent, type RunStepDeltaMessageDelta, type ToolCall, type ToolCallDelta, type ToolCallDeltaObject, type ToolCallsStepDetails, type StepRetrieveParams, type StepListParams, type RunStepsPage, } from "./steps.mjs";
//# sourceMappingURL=index.d.mts.map

export { Completions, type ChatCompletion, type ChatCompletionAllowedToolChoice, type ChatCompletionAssistantMessageParam, type ChatCompletionAudio, type ChatCompletionAudioParam, type ChatCompletionChunk, type ChatCompletionContentPart, type ChatCompletionContentPartImage, type ChatCompletionContentPartInputAudio, type ChatCompletionContentPartRefusal, type ChatCompletionContentPartText, type ChatCompletionCustomTool, type ChatCompletionDeleted, type ChatCompletionDeveloperMessageParam, type ChatCompletionFunctionCallOption, type ChatCompletionFunctionMessageParam, type ChatCompletionFunctionTool, type ChatCompletionMessage, type ChatCompletionMessageCustomToolCall, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageParam, type ChatCompletionMessageToolCall, type ChatCompletionModality, type ChatCompletionNamedToolChoice, type ChatCompletionNamedToolChoiceCustom, type ChatCompletionPredictionContent, type ChatCompletionRole, type ChatCompletionStoreMessage, type ChatCompletionStreamOptions, type ChatCompletionSystemMessageParam, type ChatCompletionTokenLogprob, type ChatCompletionTool, type ChatCompletionToolChoiceOption, type ChatCompletionToolMessageParam, type ChatCompletionUserMessageParam, type ChatCompletionAllowedTools, type ChatCompletionCreateParams, type ChatCompletionCreateParamsNonStreaming, type ChatCompletionCreateParamsStreaming, type ChatCompletionUpdateParams, type ChatCompletionListParams, type ChatCompletionStoreMessagesPage, type ChatCompletionsPage, } from "./completions.mjs";
export * from "./completions.mjs";
export { Messages, type MessageListParams } from "./messages.mjs";
//# sourceMappingURL=index.d.mts.map

export { Chat } from "./chat.mjs";
export { Completions, type ChatCompletion, type ChatCompletionAllowedToolChoice, type ChatCompletionAssistantMessageParam, type ChatCompletionAudio, type ChatCompletionAudioParam, type ChatCompletionChunk, type ChatCompletionContentPart, type ChatCompletionContentPartImage, type ChatCompletionContentPartInputAudio, type ChatCompletionContentPartRefusal, type ChatCompletionContentPartText, type ChatCompletionCustomTool, type ChatCompletionDeleted, type ChatCompletionDeveloperMessageParam, type ChatCompletionFunctionCallOption, type ChatCompletionFunctionMessageParam, type ChatCompletionFunctionTool, type ChatCompletionMessage, type ChatCompletionMessageCustomToolCall, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageParam, type ChatCompletionMessageToolCall, type ChatCompletionModality, type ChatCompletionNamedToolChoice, type ChatCompletionNamedToolChoiceCustom, type ChatCompletionPredictionContent, type ChatCompletionRole, type ChatCompletionStoreMessage, type ChatCompletionStreamOptions, type ChatCompletionSystemMessageParam, type ChatCompletionTokenLogprob, type ChatCompletionTool, type ChatCompletionToolChoiceOption, type ChatCompletionToolMessageParam, type ChatCompletionUserMessageParam, type ChatCompletionAllowedTools, type ChatCompletionCreateParams, type ChatCompletionCreateParamsNonStreaming, type ChatCompletionCreateParamsStreaming, type ChatCompletionUpdateParams, type ChatCompletionListParams, type ChatCompletionStoreMessagesPage, type ChatCompletionsPage, } from "./completions/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { Content, type ContentRetrieveParams } from "./content.mjs";
export { Files, type FileCreateResponse, type FileRetrieveResponse, type FileListResponse, type FileCreateParams, type FileRetrieveParams, type FileListParams, type FileDeleteParams, type FileListResponsesPage, } from "./files.mjs";
//# sourceMappingURL=index.d.mts.map

export { Containers, type ContainerCreateResponse, type ContainerRetrieveResponse, type ContainerListResponse, type ContainerCreateParams, type ContainerListParams, type ContainerListResponsesPage, } from "./containers.mjs";
export { Files, type FileCreateResponse, type FileRetrieveResponse, type FileListResponse, type FileCreateParams, type FileRetrieveParams, type FileListParams, type FileDeleteParams, type FileListResponsesPage, } from "./files/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { Conversations } from "./conversations.mjs";
export { Items, type ConversationItem, type ConversationItemList, type ItemCreateParams, type ItemRetrieveParams, type ItemListParams, type ItemDeleteParams, type ConversationItemsPage, } from "./items.mjs";
//# sourceMappingURL=index.d.mts.map

export { Evals, type EvalCustomDataSourceConfig, type EvalStoredCompletionsDataSourceConfig, type EvalCreateResponse, type EvalRetrieveResponse, type EvalUpdateResponse, type EvalListResponse, type EvalDeleteResponse, type EvalCreateParams, type EvalUpdateParams, type EvalListParams, type EvalListResponsesPage, } from "./evals.mjs";
export { Runs, type CreateEvalCompletionsRunDataSource, type CreateEvalJSONLRunDataSource, type EvalAPIError, type RunCreateResponse, type RunRetrieveResponse, type RunListResponse, type RunDeleteResponse, type RunCancelResponse, type RunCreateParams, type RunRetrieveParams, type RunListParams, type RunDeleteParams, type RunCancelParams, type RunListResponsesPage, } from "./runs/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { OutputItems, type OutputItemRetrieveResponse, type OutputItemListResponse, type OutputItemRetrieveParams, type OutputItemListParams, type OutputItemListResponsesPage, } from "./output-items.mjs";
export { Runs, type CreateEvalCompletionsRunDataSource, type CreateEvalJSONLRunDataSource, type EvalAPIError, type RunCreateResponse, type RunRetrieveResponse, type RunListResponse, type RunDeleteResponse, type RunCancelResponse, type RunCreateParams, type RunRetrieveParams, type RunListParams, type RunDeleteParams, type RunCancelParams, type RunListResponsesPage, } from "./runs.mjs";
//# sourceMappingURL=index.d.mts.map

export { Alpha } from "./alpha.mjs";
export { Graders, type GraderRunResponse, type GraderValidateResponse, type GraderRunParams, type GraderValidateParams, } from "./graders.mjs";
//# sourceMappingURL=index.d.mts.map

export { Checkpoints } from "./checkpoints.mjs";
export { Permissions, type PermissionCreateResponse, type PermissionRetrieveResponse, type PermissionDeleteResponse, type PermissionCreateParams, type PermissionRetrieveParams, type PermissionDeleteParams, type PermissionCreateResponsesPage, } from "./permissions.mjs";
//# sourceMappingURL=index.d.mts.map

export { Alpha } from "./alpha/index.mjs";
export { Checkpoints } from "./checkpoints/index.mjs";
export { FineTuning } from "./fine-tuning.mjs";
export { Jobs, type FineTuningJob, type FineTuningJobEvent, type FineTuningJobWandbIntegration, type FineTuningJobWandbIntegrationObject, type FineTuningJobIntegration, type JobCreateParams, type JobListParams, type JobListEventsParams, type FineTuningJobsPage, type FineTuningJobEventsPage, } from "./jobs/index.mjs";
export { Methods, type DpoHyperparameters, type DpoMethod, type ReinforcementHyperparameters, type ReinforcementMethod, type SupervisedHyperparameters, type SupervisedMethod, } from "./methods.mjs";
//# sourceMappingURL=index.d.mts.map

export { Checkpoints, type FineTuningJobCheckpoint, type CheckpointListParams, type FineTuningJobCheckpointsPage, } from "./checkpoints.mjs";
export { Jobs, type FineTuningJob, type FineTuningJobEvent, type FineTuningJobWandbIntegration, type FineTuningJobWandbIntegrationObject, type FineTuningJobIntegration, type JobCreateParams, type JobListParams, type JobListEventsParams, type FineTuningJobsPage, type FineTuningJobEventsPage, } from "./jobs.mjs";
//# sourceMappingURL=index.d.mts.map

export { GraderModels, type LabelModelGrader, type MultiGrader, type PythonGrader, type ScoreModelGrader, type StringCheckGrader, type TextSimilarityGrader, } from "./grader-models.mjs";
export { Graders } from "./graders.mjs";
//# sourceMappingURL=index.d.mts.map

export * from "./chat/index.mjs";
export * from "./shared.mjs";
export { Audio, type AudioModel, type AudioResponseFormat } from "./audio/audio.mjs";
export { Batches, type Batch, type BatchError, type BatchRequestCounts, type BatchCreateParams, type BatchListParams, type BatchesPage, } from "./batches.mjs";
export { Beta } from "./beta/beta.mjs";
export { Completions, type Completion, type CompletionChoice, type CompletionUsage, type CompletionCreateParams, type CompletionCreateParamsNonStreaming, type CompletionCreateParamsStreaming, } from "./completions.mjs";
export { Containers, type ContainerCreateResponse, type ContainerRetrieveResponse, type ContainerListResponse, type ContainerCreateParams, type ContainerListParams, type ContainerListResponsesPage, } from "./containers/containers.mjs";
export { Conversations } from "./conversations/conversations.mjs";
export { Embeddings, type CreateEmbeddingResponse, type Embedding, type EmbeddingModel, type EmbeddingCreateParams, } from "./embeddings.mjs";
export { Evals, type EvalCustomDataSourceConfig, type EvalStoredCompletionsDataSourceConfig, type EvalCreateResponse, type EvalRetrieveResponse, type EvalUpdateResponse, type EvalListResponse, type EvalDeleteResponse, type EvalCreateParams, type EvalUpdateParams, type EvalListParams, type EvalListResponsesPage, } from "./evals/evals.mjs";
export { Files, type FileContent, type FileDeleted, type FileObject, type FilePurpose, type FileCreateParams, type FileListParams, type FileObjectsPage, } from "./files.mjs";
export { FineTuning } from "./fine-tuning/fine-tuning.mjs";
export { Graders } from "./graders/graders.mjs";
export { Images, type Image, type ImageEditCompletedEvent, type ImageEditPartialImageEvent, type ImageEditStreamEvent, type ImageGenCompletedEvent, type ImageGenPartialImageEvent, type ImageGenStreamEvent, type ImageModel, type ImagesResponse, type ImageCreateVariationParams, type ImageEditParams, type ImageEditParamsNonStreaming, type ImageEditParamsStreaming, type ImageGenerateParams, type ImageGenerateParamsNonStreaming, type ImageGenerateParamsStreaming, } from "./images.mjs";
export { Models, type Model, type ModelDeleted, type ModelsPage } from "./models.mjs";
export { Moderations, type Moderation, type ModerationImageURLInput, type ModerationModel, type ModerationMultiModalInput, type ModerationTextInput, type ModerationCreateResponse, type ModerationCreateParams, } from "./moderations.mjs";
export { Responses } from "./responses/responses.mjs";
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from "./uploads/uploads.mjs";
export { VectorStores, type AutoFileChunkingStrategyParam, type FileChunkingStrategy, type FileChunkingStrategyParam, type OtherFileChunkingStrategyObject, type StaticFileChunkingStrategy, type StaticFileChunkingStrategyObject, type StaticFileChunkingStrategyObjectParam, type VectorStore, type VectorStoreDeleted, type VectorStoreSearchResponse, type VectorStoreCreateParams, type VectorStoreUpdateParams, type VectorStoreListParams, type VectorStoreSearchParams, type VectorStoresPage, type VectorStoreSearchResponsesPage, } from "./vector-stores/vector-stores.mjs";
export { Webhooks } from "./webhooks.mjs";
//# sourceMappingURL=index.d.mts.map

export { InputItems, type ResponseItemList, type InputItemListParams } from "./input-items.mjs";
export { Responses } from "./responses.mjs";
//# sourceMappingURL=index.d.mts.map

export { Parts, type UploadPart, type PartCreateParams } from "./parts.mjs";
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from "./uploads.mjs";
//# sourceMappingURL=index.d.mts.map

export { FileBatches, type VectorStoreFileBatch, type FileBatchCreateParams, type FileBatchRetrieveParams, type FileBatchCancelParams, type FileBatchListFilesParams, } from "./file-batches.mjs";
export { Files, type VectorStoreFile, type VectorStoreFileDeleted, type FileContentResponse, type FileCreateParams, type FileRetrieveParams, type FileUpdateParams, type FileListParams, type FileDeleteParams, type FileContentParams, type VectorStoreFilesPage, type FileContentResponsesPage, } from "./files.mjs";
export { VectorStores, type AutoFileChunkingStrategyParam, type FileChunkingStrategy, type FileChunkingStrategyParam, type OtherFileChunkingStrategyObject, type StaticFileChunkingStrategy, type StaticFileChunkingStrategyObject, type StaticFileChunkingStrategyObjectParam, type VectorStore, type VectorStoreDeleted, type VectorStoreSearchResponse, type VectorStoreCreateParams, type VectorStoreUpdateParams, type VectorStoreListParams, type VectorStoreSearchParams, type VectorStoresPage, type VectorStoreSearchResponsesPage, } from "./vector-stores.mjs";
//# sourceMappingURL=index.d.mts.map

export * from "./Options.mjs";
export * from "./Refs.mjs";
export * from "./errorMessages.mjs";
export * from "./parseDef.mjs";
export * from "./parsers/any.mjs";
export * from "./parsers/array.mjs";
export * from "./parsers/bigint.mjs";
export * from "./parsers/boolean.mjs";
export * from "./parsers/branded.mjs";
export * from "./parsers/catch.mjs";
export * from "./parsers/date.mjs";
export * from "./parsers/default.mjs";
export * from "./parsers/effects.mjs";
export * from "./parsers/enum.mjs";
export * from "./parsers/intersection.mjs";
export * from "./parsers/literal.mjs";
export * from "./parsers/map.mjs";
export * from "./parsers/nativeEnum.mjs";
export * from "./parsers/never.mjs";
export * from "./parsers/null.mjs";
export * from "./parsers/nullable.mjs";
export * from "./parsers/number.mjs";
export * from "./parsers/object.mjs";
export * from "./parsers/optional.mjs";
export * from "./parsers/pipeline.mjs";
export * from "./parsers/promise.mjs";
export * from "./parsers/readonly.mjs";
export * from "./parsers/record.mjs";
export * from "./parsers/set.mjs";
export * from "./parsers/string.mjs";
export * from "./parsers/tuple.mjs";
export * from "./parsers/undefined.mjs";
export * from "./parsers/union.mjs";
export * from "./parsers/unknown.mjs";
export * from "./zodToJsonSchema.mjs";
import { zodToJsonSchema } from "./zodToJsonSchema.mjs";
export default zodToJsonSchema;
//# sourceMappingURL=index.d.mts.map

import * as path from 'node:path';
import path__default from 'node:path';

/**
 * Constant for path separator.
 *
 * Always equals to `"/"`.
 */
declare const sep = "/";
declare const normalize: typeof path__default.normalize;
declare const join: typeof path__default.join;
declare const resolve: typeof path__default.resolve;
/**
 * Resolves a string path, resolving '.' and '.' segments and allowing paths above the root.
 *
 * @param path - The path to normalise.
 * @param allowAboveRoot - Whether to allow the resulting path to be above the root directory.
 * @returns the normalised path string.
 */
declare function normalizeString(path: string, allowAboveRoot: boolean): string;
declare const isAbsolute: typeof path__default.isAbsolute;
declare const toNamespacedPath: typeof path__default.toNamespacedPath;
declare const extname: typeof path__default.extname;
declare const relative: typeof path__default.relative;
declare const dirname: typeof path__default.dirname;
declare const format: typeof path__default.format;
declare const basename: typeof path__default.basename;
declare const parse: typeof path__default.parse;
/**
 * The `path.matchesGlob()` method determines if `path` matches the `pattern`.
 * @param path The path to glob-match against.
 * @param pattern The glob to check the path against.
 */
declare const matchesGlob: (path: string, pattern: string | string[]) => boolean;

type NodePath = typeof path;
/**
 * The platform-specific file delimiter.
 *
 * Equals to `";"` in windows and `":"` in all other platforms.
 */
declare const delimiter: ";" | ":";
declare const posix: NodePath["posix"];
declare const win32: NodePath["win32"];
declare const _default: NodePath;

export { basename, _default as default, delimiter, dirname, extname, format, isAbsolute, join, matchesGlob, normalize, normalizeString, parse, posix, relative, resolve, sep, toNamespacedPath, win32 };


type EnvObject = Record<string, string | undefined>;
declare const env: EnvObject;
declare const nodeENV: string;

/** Value of process.platform */
declare const platform: NodeJS.Platform;
/** Detect if `CI` environment variable is set or a provider CI detected */
declare const isCI: boolean;
/** Detect if stdout.TTY is available */
declare const hasTTY: boolean;
/** Detect if global `window` object is available */
declare const hasWindow: boolean;
/** Detect if `DEBUG` environment variable is set */
declare const isDebug: boolean;
/** Detect if `NODE_ENV` environment variable is `test` */
declare const isTest: boolean;
/** Detect if `NODE_ENV` environment variable is `production` */
declare const isProduction: boolean;
/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
declare const isDevelopment: boolean;
/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
declare const isMinimal: boolean;
/** Detect if process.platform is Windows */
declare const isWindows: boolean;
/** Detect if process.platform is Linux */
declare const isLinux: boolean;
/** Detect if process.platform is macOS (darwin kernel) */
declare const isMacOS: boolean;
/** Color Support */
declare const isColorSupported: boolean;
/** Node.js versions */
declare const nodeVersion: string | null;
declare const nodeMajorVersion: number | null;

interface Process extends Partial<Omit<typeof globalThis.process, "versions">> {
    env: EnvObject;
    versions: Record<string, string>;
}
declare const process: Process;

type ProviderName = "" | "appveyor" | "aws_amplify" | "azure_pipelines" | "azure_static" | "appcircle" | "bamboo" | "bitbucket" | "bitrise" | "buddy" | "buildkite" | "circle" | "cirrus" | "cloudflare_pages" | "cloudflare_workers" | "codebuild" | "codefresh" | "drone" | "drone" | "dsari" | "github_actions" | "gitlab" | "gocd" | "layerci" | "hudson" | "jenkins" | "magnum" | "netlify" | "nevercode" | "render" | "sail" | "semaphore" | "screwdriver" | "shippable" | "solano" | "strider" | "teamcity" | "travis" | "vercel" | "appcenter" | "codesandbox" | "stackblitz" | "stormkit" | "cleavr" | "zeabur" | "codesphere" | "railway" | "deno-deploy" | "firebase_app_hosting";
type ProviderInfo = {
    name: ProviderName;
    ci?: boolean;
    [meta: string]: any;
};
/** Current provider info */
declare const providerInfo: ProviderInfo;
declare const provider: ProviderName;

type RuntimeName = "workerd" | "deno" | "netlify" | "node" | "bun" | "edge-light" | "fastly" | "";
type RuntimeInfo = {
    name: RuntimeName;
};
/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * **Note:** When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
 *
 * Use `runtime === "node"` if you need strict check for Node.js runtime.
 */
declare const isNode: boolean;
/**
 * Indicates if running in Bun runtime.
 */
declare const isBun: boolean;
/**
 * Indicates if running in Deno runtime.
 */
declare const isDeno: boolean;
/**
 * Indicates if running in Fastly runtime.
 */
declare const isFastly: boolean;
/**
 * Indicates if running in Netlify runtime.
 */
declare const isNetlify: boolean;
/**
 *
 * Indicates if running in EdgeLight (Vercel Edge) runtime.
 */
declare const isEdgeLight: boolean;
/**
 * Indicates if running in Cloudflare Workers runtime.
 */
declare const isWorkerd: boolean;
declare const runtimeInfo: RuntimeInfo | undefined;
declare const runtime: RuntimeName;

export { env, hasTTY, hasWindow, isBun, isCI, isColorSupported, isDebug, isDeno, isDevelopment, isEdgeLight, isFastly, isLinux, isMacOS, isMinimal, isNetlify, isNode, isProduction, isTest, isWindows, isWorkerd, nodeENV, nodeMajorVersion, nodeVersion, platform, process, provider, providerInfo, runtime, runtimeInfo };
export type { EnvObject, Process, ProviderInfo, ProviderName, RuntimeInfo, RuntimeName };


import * as js_tokens from 'js-tokens';
import { Token } from 'js-tokens';

interface StripLiteralOptions {
    /**
     * Will be called for each string literal. Return false to skip stripping.
     */
    filter?: (s: string) => boolean;
    /**
     * Fill the stripped literal with this character.
     * It must be a single character.
     *
     * @default ' '
     */
    fillChar?: string;
}

declare function stripLiteralJsTokens(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: Token[];
};

/**
 * Strip literal from code.
 */
declare function stripLiteral(code: string, options?: StripLiteralOptions): string;
/**
 * Strip literal from code, return more detailed information.
 */
declare function stripLiteralDetailed(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: js_tokens.Token[];
};

export { type StripLiteralOptions, stripLiteral, stripLiteralDetailed, stripLiteralJsTokens };


//#region src/utils.d.ts

declare const convertPathToPattern: (path: string) => string;
declare const escapePath: (path: string) => string;
// #endregion
// #region isDynamicPattern
/*
Has a few minor differences with `fast-glob` for better accuracy:

Doesn't necessarily return false on patterns that include `\\`.

Returns true if the pattern includes parentheses,
regardless of them representing one single pattern or not.

Returns true for unfinished glob extensions i.e. `(h`, `+(h`.

Returns true for unfinished brace expansions as long as they include `,` or `..`.
*/
declare function isDynamicPattern(pattern: string, options?: {
  caseSensitiveMatch: boolean;
}): boolean; //#endregion
//#region src/index.d.ts

// #endregion
// #region log
interface GlobOptions {
  absolute?: boolean;
  cwd?: string;
  patterns?: string | string[];
  ignore?: string | string[];
  dot?: boolean;
  deep?: number;
  followSymbolicLinks?: boolean;
  caseSensitiveMatch?: boolean;
  expandDirectories?: boolean;
  onlyDirectories?: boolean;
  onlyFiles?: boolean;
  debug?: boolean;
}
declare function glob(patterns: string | string[], options?: Omit<GlobOptions, "patterns">): Promise<string[]>;
declare function glob(options: GlobOptions): Promise<string[]>;
declare function globSync(patterns: string | string[], options?: Omit<GlobOptions, "patterns">): string[];
declare function globSync(options: GlobOptions): string[];

//#endregion
export { GlobOptions, convertPathToPattern, escapePath, glob, globSync, isDynamicPattern };

export * from '@vue/compiler-sfc'


export * from '@vue/server-renderer'


import * as eslint from 'eslint';
import { Rule, AST } from 'eslint';
import * as estree from 'estree';

declare const READ: unique symbol;
declare const CALL: unique symbol;
declare const CONSTRUCT: unique symbol;
declare const ESM: unique symbol;
declare class ReferenceTracker {
    constructor(globalScope: Scope$2, options?: {
        mode?: "legacy" | "strict" | undefined;
        globalObjectNames?: string[] | undefined;
    } | undefined);
    private variableStack;
    private globalScope;
    private mode;
    private globalObjectNames;
    iterateGlobalReferences<T>(traceMap: TraceMap$2<T>): IterableIterator<TrackedReferences$2<T>>;
    iterateCjsReferences<T_1>(traceMap: TraceMap$2<T_1>): IterableIterator<TrackedReferences$2<T_1>>;
    iterateEsmReferences<T_2>(traceMap: TraceMap$2<T_2>): IterableIterator<TrackedReferences$2<T_2>>;
    iteratePropertyReferences<T_3>(node: Expression, traceMap: TraceMap$2<T_3>): IterableIterator<TrackedReferences$2<T_3>>;
    private _iterateVariableReferences;
    private _iteratePropertyReferences;
    private _iterateLhsReferences;
    private _iterateImportReferences;
}
declare namespace ReferenceTracker {
    export { READ };
    export { CALL };
    export { CONSTRUCT };
    export { ESM };
}
type Scope$2 = eslint.Scope.Scope;
type Expression = estree.Expression;
type TraceMap$2<T> = TraceMap$1<T>;
type TrackedReferences$2<T> = TrackedReferences$1<T>;

type StaticValue$2 = StaticValueProvided$1 | StaticValueOptional$1;
type StaticValueProvided$1 = {
    optional?: undefined;
    value: unknown;
};
type StaticValueOptional$1 = {
    optional?: true;
    value: undefined;
};
type ReferenceTrackerOptions$1 = {
    globalObjectNames?: string[];
    mode?: "legacy" | "strict";
};
type TraceMap$1<T = unknown> = {
    [i: string]: TraceMapObject<T>;
};
type TraceMapObject<T> = {
    [i: string]: TraceMapObject<T>;
    [CALL]?: T;
    [CONSTRUCT]?: T;
    [READ]?: T;
    [ESM]?: boolean;
};
type TrackedReferences$1<T> = {
    info: T;
    node: Rule.Node;
    path: string[];
    type: typeof CALL | typeof CONSTRUCT | typeof READ;
};
type HasSideEffectOptions$1 = {
    considerGetters?: boolean;
    considerImplicitTypeConversion?: boolean;
};
type PunctuatorToken<Value extends string> = AST.Token & {
    type: "Punctuator";
    value: Value;
};
type ArrowToken$1 = PunctuatorToken<"=>">;
type CommaToken$1 = PunctuatorToken<",">;
type SemicolonToken$1 = PunctuatorToken<";">;
type ColonToken$1 = PunctuatorToken<":">;
type OpeningParenToken$1 = PunctuatorToken<"(">;
type ClosingParenToken$1 = PunctuatorToken<")">;
type OpeningBracketToken$1 = PunctuatorToken<"[">;
type ClosingBracketToken$1 = PunctuatorToken<"]">;
type OpeningBraceToken$1 = PunctuatorToken<"{">;
type ClosingBraceToken$1 = PunctuatorToken<"}">;

declare function findVariable(initialScope: Scope$1, nameOrNode: string | Identifier): Variable | null;
type Scope$1 = eslint.Scope.Scope;
type Variable = eslint.Scope.Variable;
type Identifier = estree.Identifier;

declare function getFunctionHeadLocation(node: FunctionNode$1, sourceCode: SourceCode$2): SourceLocation | null;
type SourceCode$2 = eslint.SourceCode;
type FunctionNode$1 = estree.Function;
type SourceLocation = estree.SourceLocation;

declare function getFunctionNameWithKind(node: FunctionNode, sourceCode?: eslint.SourceCode | undefined): string;
type FunctionNode = estree.Function;

declare function getInnermostScope(initialScope: Scope, node: Node$4): Scope;
type Scope = eslint.Scope.Scope;
type Node$4 = estree.Node;

declare function getPropertyName(node: MemberExpression | MethodDefinition | Property | PropertyDefinition, initialScope?: eslint.Scope.Scope | undefined): string | null | undefined;
type MemberExpression = estree.MemberExpression;
type MethodDefinition = estree.MethodDefinition;
type Property = estree.Property;
type PropertyDefinition = estree.PropertyDefinition;

declare function getStaticValue(node: Node$3, initialScope?: eslint.Scope.Scope | null | undefined): StaticValue$1 | null;
type StaticValue$1 = StaticValue$2;
type Node$3 = estree.Node;

declare function getStringIfConstant(node: Node$2, initialScope?: eslint.Scope.Scope | null | undefined): string | null;
type Node$2 = estree.Node;

declare function hasSideEffect(node: Node$1, sourceCode: SourceCode$1, options?: HasSideEffectOptions$1 | undefined): boolean;
type Node$1 = estree.Node;
type SourceCode$1 = eslint.SourceCode;

declare function isArrowToken(token: CommentOrToken): token is ArrowToken$1;
declare function isCommaToken(token: CommentOrToken): token is CommaToken$1;
declare function isSemicolonToken(token: CommentOrToken): token is SemicolonToken$1;
declare function isColonToken(token: CommentOrToken): token is ColonToken$1;
declare function isOpeningParenToken(token: CommentOrToken): token is OpeningParenToken$1;
declare function isClosingParenToken(token: CommentOrToken): token is ClosingParenToken$1;
declare function isOpeningBracketToken(token: CommentOrToken): token is OpeningBracketToken$1;
declare function isClosingBracketToken(token: CommentOrToken): token is ClosingBracketToken$1;
declare function isOpeningBraceToken(token: CommentOrToken): token is OpeningBraceToken$1;
declare function isClosingBraceToken(token: CommentOrToken): token is ClosingBraceToken$1;
declare function isCommentToken(token: CommentOrToken): token is estree.Comment;
declare function isNotArrowToken(arg0: CommentOrToken): boolean;
declare function isNotCommaToken(arg0: CommentOrToken): boolean;
declare function isNotSemicolonToken(arg0: CommentOrToken): boolean;
declare function isNotColonToken(arg0: CommentOrToken): boolean;
declare function isNotOpeningParenToken(arg0: CommentOrToken): boolean;
declare function isNotClosingParenToken(arg0: CommentOrToken): boolean;
declare function isNotOpeningBracketToken(arg0: CommentOrToken): boolean;
declare function isNotClosingBracketToken(arg0: CommentOrToken): boolean;
declare function isNotOpeningBraceToken(arg0: CommentOrToken): boolean;
declare function isNotClosingBraceToken(arg0: CommentOrToken): boolean;
declare function isNotCommentToken(arg0: CommentOrToken): boolean;
type Token = eslint.AST.Token;
type Comment = estree.Comment;
type CommentOrToken = Comment | Token;

declare function isParenthesized(timesOrNode: Node | number, nodeOrSourceCode: Node | SourceCode, optionalSourceCode?: eslint.SourceCode | undefined): boolean;
type Node = estree.Node;
type SourceCode = eslint.SourceCode;

declare class PatternMatcher {
    constructor(pattern: RegExp, options?: {
        escaped?: boolean | undefined;
    } | undefined);
    execAll(str: string): IterableIterator<RegExpExecArray>;
    test(str: string): boolean;
    [Symbol.replace](str: string, replacer: string | ((...strs: string[]) => string)): string;
}

declare namespace _default {
    export { CALL };
    export { CONSTRUCT };
    export { ESM };
    export { findVariable };
    export { getFunctionHeadLocation };
    export { getFunctionNameWithKind };
    export { getInnermostScope };
    export { getPropertyName };
    export { getStaticValue };
    export { getStringIfConstant };
    export { hasSideEffect };
    export { isArrowToken };
    export { isClosingBraceToken };
    export { isClosingBracketToken };
    export { isClosingParenToken };
    export { isColonToken };
    export { isCommaToken };
    export { isCommentToken };
    export { isNotArrowToken };
    export { isNotClosingBraceToken };
    export { isNotClosingBracketToken };
    export { isNotClosingParenToken };
    export { isNotColonToken };
    export { isNotCommaToken };
    export { isNotCommentToken };
    export { isNotOpeningBraceToken };
    export { isNotOpeningBracketToken };
    export { isNotOpeningParenToken };
    export { isNotSemicolonToken };
    export { isOpeningBraceToken };
    export { isOpeningBracketToken };
    export { isOpeningParenToken };
    export { isParenthesized };
    export { isSemicolonToken };
    export { PatternMatcher };
    export { READ };
    export { ReferenceTracker };
}

type StaticValue = StaticValue$2;
type StaticValueOptional = StaticValueOptional$1;
type StaticValueProvided = StaticValueProvided$1;
type ReferenceTrackerOptions = ReferenceTrackerOptions$1;
type TraceMap<T> = TraceMap$1<T>;
type TrackedReferences<T> = TrackedReferences$1<T>;
type HasSideEffectOptions = HasSideEffectOptions$1;
type ArrowToken = ArrowToken$1;
type CommaToken = CommaToken$1;
type SemicolonToken = SemicolonToken$1;
type ColonToken = ColonToken$1;
type OpeningParenToken = OpeningParenToken$1;
type ClosingParenToken = ClosingParenToken$1;
type OpeningBracketToken = OpeningBracketToken$1;
type ClosingBracketToken = ClosingBracketToken$1;
type OpeningBraceToken = OpeningBraceToken$1;
type ClosingBraceToken = ClosingBraceToken$1;

export { ArrowToken, CALL, CONSTRUCT, ClosingBraceToken, ClosingBracketToken, ClosingParenToken, ColonToken, CommaToken, ESM, HasSideEffectOptions, OpeningBraceToken, OpeningBracketToken, OpeningParenToken, PatternMatcher, READ, ReferenceTracker, ReferenceTrackerOptions, SemicolonToken, StaticValue, StaticValueOptional, StaticValueProvided, TraceMap, TrackedReferences, _default as default, findVariable, getFunctionHeadLocation, getFunctionNameWithKind, getInnermostScope, getPropertyName, getStaticValue, getStringIfConstant, hasSideEffect, isArrowToken, isClosingBraceToken, isClosingBracketToken, isClosingParenToken, isColonToken, isCommaToken, isCommentToken, isNotArrowToken, isNotClosingBraceToken, isNotClosingBracketToken, isNotClosingParenToken, isNotColonToken, isNotCommaToken, isNotCommentToken, isNotOpeningBraceToken, isNotOpeningBracketToken, isNotOpeningParenToken, isNotSemicolonToken, isOpeningBraceToken, isOpeningBracketToken, isOpeningParenToken, isParenthesized, isSemicolonToken };


/// <reference types="node" />
import * as nativeFs from "fs";
import picomatch from "picomatch";

//#region src/api/aborter.d.ts
/**
 * AbortController is not supported on Node 14 so we use this until we can drop
 * support for Node 14.
 */
declare class Aborter {
  aborted: boolean;
  abort(): void;
}
//#endregion
//#region src/api/queue.d.ts
type OnQueueEmptyCallback = (error: Error | null, output: WalkerState) => void;
/**
 * This is a custom stateless queue to track concurrent async fs calls.
 * It increments a counter whenever a call is queued and decrements it
 * as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
 */
declare class Queue {
  private onQueueEmpty?;
  count: number;
  constructor(onQueueEmpty?: OnQueueEmptyCallback | undefined);
  enqueue(): number;
  dequeue(error: Error | null, output: WalkerState): void;
}
//#endregion
//#region src/types.d.ts
type Counts = {
  files: number;
  directories: number;
  /**
   * @deprecated use `directories` instead. Will be removed in v7.0.
   */
  dirs: number;
};
type Group = {
  directory: string;
  files: string[];
  /**
   * @deprecated use `directory` instead. Will be removed in v7.0.
   */
  dir: string;
};
type GroupOutput = Group[];
type OnlyCountsOutput = Counts;
type PathsOutput = string[];
type Output = OnlyCountsOutput | PathsOutput | GroupOutput;
type FSLike = {
  readdir: typeof nativeFs.readdir;
  readdirSync: typeof nativeFs.readdirSync;
  realpath: typeof nativeFs.realpath;
  realpathSync: typeof nativeFs.realpathSync;
  stat: typeof nativeFs.stat;
  statSync: typeof nativeFs.statSync;
};
type WalkerState = {
  root: string;
  paths: string[];
  groups: Group[];
  counts: Counts;
  options: Options;
  queue: Queue;
  controller: Aborter;
  fs: FSLike;
  symlinks: Map<string, string>;
  visited: string[];
};
type ResultCallback<TOutput extends Output> = (error: Error | null, output: TOutput) => void;
type FilterPredicate = (path: string, isDirectory: boolean) => boolean;
type ExcludePredicate = (dirName: string, dirPath: string) => boolean;
type PathSeparator = "/" | "\\";
type Options<TGlobFunction = unknown> = {
  includeBasePath?: boolean;
  includeDirs?: boolean;
  normalizePath?: boolean;
  maxDepth: number;
  maxFiles?: number;
  resolvePaths?: boolean;
  suppressErrors: boolean;
  group?: boolean;
  onlyCounts?: boolean;
  filters: FilterPredicate[];
  resolveSymlinks?: boolean;
  useRealPaths?: boolean;
  excludeFiles?: boolean;
  excludeSymlinks?: boolean;
  exclude?: ExcludePredicate;
  relativePaths?: boolean;
  pathSeparator: PathSeparator;
  signal?: AbortSignal;
  globFunction?: TGlobFunction;
  fs?: FSLike;
};
type GlobMatcher = (test: string) => boolean;
type GlobFunction = (glob: string | string[], ...params: unknown[]) => GlobMatcher;
type GlobParams<T> = T extends ((globs: string | string[], ...params: infer TParams extends unknown[]) => GlobMatcher) ? TParams : [];
//#endregion
//#region src/builder/api-builder.d.ts
declare class APIBuilder<TReturnType extends Output> {
  private readonly root;
  private readonly options;
  constructor(root: string, options: Options);
  withPromise(): Promise<TReturnType>;
  withCallback(cb: ResultCallback<TReturnType>): void;
  sync(): TReturnType;
}
//#endregion
//#region src/builder/index.d.ts
declare class Builder<TReturnType extends Output = PathsOutput, TGlobFunction = typeof picomatch> {
  private readonly globCache;
  private options;
  private globFunction?;
  constructor(options?: Partial<Options<TGlobFunction>>);
  group(): Builder<GroupOutput, TGlobFunction>;
  withPathSeparator(separator: "/" | "\\"): this;
  withBasePath(): this;
  withRelativePaths(): this;
  withDirs(): this;
  withMaxDepth(depth: number): this;
  withMaxFiles(limit: number): this;
  withFullPaths(): this;
  withErrors(): this;
  withSymlinks({
    resolvePaths
  }?: {
    resolvePaths?: boolean | undefined;
  }): this;
  withAbortSignal(signal: AbortSignal): this;
  normalize(): this;
  filter(predicate: FilterPredicate): this;
  onlyDirs(): this;
  exclude(predicate: ExcludePredicate): this;
  onlyCounts(): Builder<OnlyCountsOutput, TGlobFunction>;
  crawl(root?: string): APIBuilder<TReturnType>;
  withGlobFunction<TFunc>(fn: TFunc): Builder<TReturnType, TFunc>;
  /**
   * @deprecated Pass options using the constructor instead:
   * ```ts
   * new fdir(options).crawl("/path/to/root");
   * ```
   * This method will be removed in v7.0
   */
  crawlWithOptions(root: string, options: Partial<Options<TGlobFunction>>): APIBuilder<TReturnType>;
  glob(...patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[]): Builder<TReturnType, TGlobFunction>;
  globWithOptions(patterns: string[], ...options: GlobParams<TGlobFunction>): Builder<TReturnType, TGlobFunction>;
}
//#endregion
//#region src/index.d.ts
type Fdir = typeof Builder;
//#endregion
export { Counts, ExcludePredicate, FSLike, Fdir, FilterPredicate, GlobFunction, GlobMatcher, GlobParams, Group, GroupOutput, OnlyCountsOutput, Options, Output, PathSeparator, PathsOutput, ResultCallback, WalkerState, Builder as fdir };

export { OpenAIRealtimeError } from "./internal-base.mjs";
//# sourceMappingURL=index.d.mts.map

export { OpenAI as default } from "./client.mjs";
export { type Uploadable, toFile } from "./core/uploads.mjs";
export { APIPromise } from "./core/api-promise.mjs";
export { OpenAI, type ClientOptions } from "./client.mjs";
export { PagePromise } from "./core/pagination.mjs";
export { OpenAIError, APIError, APIConnectionError, APIConnectionTimeoutError, APIUserAbortError, NotFoundError, ConflictError, RateLimitError, BadRequestError, AuthenticationError, InternalServerError, PermissionDeniedError, UnprocessableEntityError, InvalidWebhookSignatureError, } from "./core/error.mjs";
export { AzureOpenAI } from "./azure.mjs";
//# sourceMappingURL=index.d.mts.map

declare const formats: {
    formatters: Record<import("./types").Format, (str: PropertyKey) => string>;
    RFC1738: string;
    RFC3986: string;
    default: import("./types").Format;
};
export { stringify } from "./stringify.mjs";
export { formats };
export type { DefaultDecoder, DefaultEncoder, Format, ParseOptions, StringifyOptions } from "./types.mjs";
//# sourceMappingURL=index.d.mts.map

export { Audio, type AudioModel, type AudioResponseFormat } from "./audio.mjs";
export { Speech, type SpeechModel, type SpeechCreateParams } from "./speech.mjs";
export { Transcriptions, type Transcription, type TranscriptionInclude, type TranscriptionSegment, type TranscriptionStreamEvent, type TranscriptionTextDeltaEvent, type TranscriptionTextDoneEvent, type TranscriptionVerbose, type TranscriptionWord, type TranscriptionCreateResponse, type TranscriptionCreateParams, type TranscriptionCreateParamsNonStreaming, type TranscriptionCreateParamsStreaming, } from "./transcriptions.mjs";
export { Translations, type Translation, type TranslationVerbose, type TranslationCreateResponse, type TranslationCreateParams, } from "./translations.mjs";
//# sourceMappingURL=index.d.mts.map

export { Assistants, type Assistant, type AssistantDeleted, type AssistantStreamEvent, type AssistantTool, type CodeInterpreterTool, type FileSearchTool, type FunctionTool, type MessageStreamEvent, type RunStepStreamEvent, type RunStreamEvent, type ThreadStreamEvent, type AssistantCreateParams, type AssistantUpdateParams, type AssistantListParams, type AssistantsPage, } from "./assistants.mjs";
export { Beta } from "./beta.mjs";
export { Realtime } from "./realtime/index.mjs";
export { Threads, type AssistantResponseFormatOption, type AssistantToolChoice, type AssistantToolChoiceFunction, type AssistantToolChoiceOption, type Thread, type ThreadDeleted, type ThreadCreateParams, type ThreadUpdateParams, type ThreadCreateAndRunParams, type ThreadCreateAndRunParamsNonStreaming, type ThreadCreateAndRunParamsStreaming, type ThreadCreateAndRunPollParams, type ThreadCreateAndRunStreamParams, } from "./threads/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { Realtime } from "./realtime.mjs";
export { Sessions, type Session, type SessionCreateResponse, type SessionCreateParams } from "./sessions.mjs";
export { TranscriptionSessions, type TranscriptionSession, type TranscriptionSessionCreateParams, } from "./transcription-sessions.mjs";
//# sourceMappingURL=index.d.mts.map

export { Messages, type Annotation, type AnnotationDelta, type FileCitationAnnotation, type FileCitationDeltaAnnotation, type FilePathAnnotation, type FilePathDeltaAnnotation, type ImageFile, type ImageFileContentBlock, type ImageFileDelta, type ImageFileDeltaBlock, type ImageURL, type ImageURLContentBlock, type ImageURLDelta, type ImageURLDeltaBlock, type Message, type MessageContent, type MessageContentDelta, type MessageContentPartParam, type MessageDeleted, type MessageDelta, type MessageDeltaEvent, type RefusalContentBlock, type RefusalDeltaBlock, type Text, type TextContentBlock, type TextContentBlockParam, type TextDelta, type TextDeltaBlock, type MessageCreateParams, type MessageRetrieveParams, type MessageUpdateParams, type MessageListParams, type MessageDeleteParams, type MessagesPage, } from "./messages.mjs";
export { Runs, type RequiredActionFunctionToolCall, type Run, type RunStatus, type RunCreateParams, type RunCreateParamsNonStreaming, type RunCreateParamsStreaming, type RunRetrieveParams, type RunUpdateParams, type RunListParams, type RunCancelParams, type RunSubmitToolOutputsParams, type RunSubmitToolOutputsParamsNonStreaming, type RunSubmitToolOutputsParamsStreaming, type RunsPage, type RunCreateAndPollParams, type RunCreateAndStreamParams, type RunStreamParams, type RunSubmitToolOutputsAndPollParams, type RunSubmitToolOutputsStreamParams, } from "./runs/index.mjs";
export { Threads, type AssistantResponseFormatOption, type AssistantToolChoice, type AssistantToolChoiceFunction, type AssistantToolChoiceOption, type Thread, type ThreadDeleted, type ThreadCreateParams, type ThreadUpdateParams, type ThreadCreateAndRunParams, type ThreadCreateAndRunParamsNonStreaming, type ThreadCreateAndRunParamsStreaming, type ThreadCreateAndRunPollParams, type ThreadCreateAndRunStreamParams, } from "./threads.mjs";
//# sourceMappingURL=index.d.mts.map

export { Runs, type RequiredActionFunctionToolCall, type Run, type RunStatus, type RunCreateParams, type RunCreateParamsNonStreaming, type RunCreateParamsStreaming, type RunRetrieveParams, type RunUpdateParams, type RunListParams, type RunCancelParams, type RunSubmitToolOutputsParams, type RunSubmitToolOutputsParamsNonStreaming, type RunSubmitToolOutputsParamsStreaming, type RunsPage, type RunCreateAndPollParams, type RunCreateAndStreamParams, type RunStreamParams, type RunSubmitToolOutputsAndPollParams, type RunSubmitToolOutputsStreamParams, } from "./runs.mjs";
export { Steps, type CodeInterpreterLogs, type CodeInterpreterOutputImage, type CodeInterpreterToolCall, type CodeInterpreterToolCallDelta, type FileSearchToolCall, type FileSearchToolCallDelta, type FunctionToolCall, type FunctionToolCallDelta, type MessageCreationStepDetails, type RunStep, type RunStepInclude, type RunStepDelta, type RunStepDeltaEvent, type RunStepDeltaMessageDelta, type ToolCall, type ToolCallDelta, type ToolCallDeltaObject, type ToolCallsStepDetails, type StepRetrieveParams, type StepListParams, type RunStepsPage, } from "./steps.mjs";
//# sourceMappingURL=index.d.mts.map

export { Completions, type ChatCompletion, type ChatCompletionAllowedToolChoice, type ChatCompletionAssistantMessageParam, type ChatCompletionAudio, type ChatCompletionAudioParam, type ChatCompletionChunk, type ChatCompletionContentPart, type ChatCompletionContentPartImage, type ChatCompletionContentPartInputAudio, type ChatCompletionContentPartRefusal, type ChatCompletionContentPartText, type ChatCompletionCustomTool, type ChatCompletionDeleted, type ChatCompletionDeveloperMessageParam, type ChatCompletionFunctionCallOption, type ChatCompletionFunctionMessageParam, type ChatCompletionFunctionTool, type ChatCompletionMessage, type ChatCompletionMessageCustomToolCall, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageParam, type ChatCompletionMessageToolCall, type ChatCompletionModality, type ChatCompletionNamedToolChoice, type ChatCompletionNamedToolChoiceCustom, type ChatCompletionPredictionContent, type ChatCompletionRole, type ChatCompletionStoreMessage, type ChatCompletionStreamOptions, type ChatCompletionSystemMessageParam, type ChatCompletionTokenLogprob, type ChatCompletionTool, type ChatCompletionToolChoiceOption, type ChatCompletionToolMessageParam, type ChatCompletionUserMessageParam, type ChatCompletionAllowedTools, type ChatCompletionCreateParams, type ChatCompletionCreateParamsNonStreaming, type ChatCompletionCreateParamsStreaming, type ChatCompletionUpdateParams, type ChatCompletionListParams, type ChatCompletionStoreMessagesPage, type ChatCompletionsPage, } from "./completions.mjs";
export * from "./completions.mjs";
export { Messages, type MessageListParams } from "./messages.mjs";
//# sourceMappingURL=index.d.mts.map

export { Chat } from "./chat.mjs";
export { Completions, type ChatCompletion, type ChatCompletionAllowedToolChoice, type ChatCompletionAssistantMessageParam, type ChatCompletionAudio, type ChatCompletionAudioParam, type ChatCompletionChunk, type ChatCompletionContentPart, type ChatCompletionContentPartImage, type ChatCompletionContentPartInputAudio, type ChatCompletionContentPartRefusal, type ChatCompletionContentPartText, type ChatCompletionCustomTool, type ChatCompletionDeleted, type ChatCompletionDeveloperMessageParam, type ChatCompletionFunctionCallOption, type ChatCompletionFunctionMessageParam, type ChatCompletionFunctionTool, type ChatCompletionMessage, type ChatCompletionMessageCustomToolCall, type ChatCompletionMessageFunctionToolCall, type ChatCompletionMessageParam, type ChatCompletionMessageToolCall, type ChatCompletionModality, type ChatCompletionNamedToolChoice, type ChatCompletionNamedToolChoiceCustom, type ChatCompletionPredictionContent, type ChatCompletionRole, type ChatCompletionStoreMessage, type ChatCompletionStreamOptions, type ChatCompletionSystemMessageParam, type ChatCompletionTokenLogprob, type ChatCompletionTool, type ChatCompletionToolChoiceOption, type ChatCompletionToolMessageParam, type ChatCompletionUserMessageParam, type ChatCompletionAllowedTools, type ChatCompletionCreateParams, type ChatCompletionCreateParamsNonStreaming, type ChatCompletionCreateParamsStreaming, type ChatCompletionUpdateParams, type ChatCompletionListParams, type ChatCompletionStoreMessagesPage, type ChatCompletionsPage, } from "./completions/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { Content, type ContentRetrieveParams } from "./content.mjs";
export { Files, type FileCreateResponse, type FileRetrieveResponse, type FileListResponse, type FileCreateParams, type FileRetrieveParams, type FileListParams, type FileDeleteParams, type FileListResponsesPage, } from "./files.mjs";
//# sourceMappingURL=index.d.mts.map

export { Containers, type ContainerCreateResponse, type ContainerRetrieveResponse, type ContainerListResponse, type ContainerCreateParams, type ContainerListParams, type ContainerListResponsesPage, } from "./containers.mjs";
export { Files, type FileCreateResponse, type FileRetrieveResponse, type FileListResponse, type FileCreateParams, type FileRetrieveParams, type FileListParams, type FileDeleteParams, type FileListResponsesPage, } from "./files/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { Conversations } from "./conversations.mjs";
export { Items, type ConversationItem, type ConversationItemList, type ItemCreateParams, type ItemRetrieveParams, type ItemListParams, type ItemDeleteParams, type ConversationItemsPage, } from "./items.mjs";
//# sourceMappingURL=index.d.mts.map

export { Evals, type EvalCustomDataSourceConfig, type EvalStoredCompletionsDataSourceConfig, type EvalCreateResponse, type EvalRetrieveResponse, type EvalUpdateResponse, type EvalListResponse, type EvalDeleteResponse, type EvalCreateParams, type EvalUpdateParams, type EvalListParams, type EvalListResponsesPage, } from "./evals.mjs";
export { Runs, type CreateEvalCompletionsRunDataSource, type CreateEvalJSONLRunDataSource, type EvalAPIError, type RunCreateResponse, type RunRetrieveResponse, type RunListResponse, type RunDeleteResponse, type RunCancelResponse, type RunCreateParams, type RunRetrieveParams, type RunListParams, type RunDeleteParams, type RunCancelParams, type RunListResponsesPage, } from "./runs/index.mjs";
//# sourceMappingURL=index.d.mts.map

export { OutputItems, type OutputItemRetrieveResponse, type OutputItemListResponse, type OutputItemRetrieveParams, type OutputItemListParams, type OutputItemListResponsesPage, } from "./output-items.mjs";
export { Runs, type CreateEvalCompletionsRunDataSource, type CreateEvalJSONLRunDataSource, type EvalAPIError, type RunCreateResponse, type RunRetrieveResponse, type RunListResponse, type RunDeleteResponse, type RunCancelResponse, type RunCreateParams, type RunRetrieveParams, type RunListParams, type RunDeleteParams, type RunCancelParams, type RunListResponsesPage, } from "./runs.mjs";
//# sourceMappingURL=index.d.mts.map

export { Alpha } from "./alpha.mjs";
export { Graders, type GraderRunResponse, type GraderValidateResponse, type GraderRunParams, type GraderValidateParams, } from "./graders.mjs";
//# sourceMappingURL=index.d.mts.map

export { Checkpoints } from "./checkpoints.mjs";
export { Permissions, type PermissionCreateResponse, type PermissionRetrieveResponse, type PermissionDeleteResponse, type PermissionCreateParams, type PermissionRetrieveParams, type PermissionDeleteParams, type PermissionCreateResponsesPage, } from "./permissions.mjs";
//# sourceMappingURL=index.d.mts.map

export { Alpha } from "./alpha/index.mjs";
export { Checkpoints } from "./checkpoints/index.mjs";
export { FineTuning } from "./fine-tuning.mjs";
export { Jobs, type FineTuningJob, type FineTuningJobEvent, type FineTuningJobWandbIntegration, type FineTuningJobWandbIntegrationObject, type FineTuningJobIntegration, type JobCreateParams, type JobListParams, type JobListEventsParams, type FineTuningJobsPage, type FineTuningJobEventsPage, } from "./jobs/index.mjs";
export { Methods, type DpoHyperparameters, type DpoMethod, type ReinforcementHyperparameters, type ReinforcementMethod, type SupervisedHyperparameters, type SupervisedMethod, } from "./methods.mjs";
//# sourceMappingURL=index.d.mts.map

export { Checkpoints, type FineTuningJobCheckpoint, type CheckpointListParams, type FineTuningJobCheckpointsPage, } from "./checkpoints.mjs";
export { Jobs, type FineTuningJob, type FineTuningJobEvent, type FineTuningJobWandbIntegration, type FineTuningJobWandbIntegrationObject, type FineTuningJobIntegration, type JobCreateParams, type JobListParams, type JobListEventsParams, type FineTuningJobsPage, type FineTuningJobEventsPage, } from "./jobs.mjs";
//# sourceMappingURL=index.d.mts.map

export { GraderModels, type LabelModelGrader, type MultiGrader, type PythonGrader, type ScoreModelGrader, type StringCheckGrader, type TextSimilarityGrader, } from "./grader-models.mjs";
export { Graders } from "./graders.mjs";
//# sourceMappingURL=index.d.mts.map

export * from "./chat/index.mjs";
export * from "./shared.mjs";
export { Audio, type AudioModel, type AudioResponseFormat } from "./audio/audio.mjs";
export { Batches, type Batch, type BatchError, type BatchRequestCounts, type BatchCreateParams, type BatchListParams, type BatchesPage, } from "./batches.mjs";
export { Beta } from "./beta/beta.mjs";
export { Completions, type Completion, type CompletionChoice, type CompletionUsage, type CompletionCreateParams, type CompletionCreateParamsNonStreaming, type CompletionCreateParamsStreaming, } from "./completions.mjs";
export { Containers, type ContainerCreateResponse, type ContainerRetrieveResponse, type ContainerListResponse, type ContainerCreateParams, type ContainerListParams, type ContainerListResponsesPage, } from "./containers/containers.mjs";
export { Conversations } from "./conversations/conversations.mjs";
export { Embeddings, type CreateEmbeddingResponse, type Embedding, type EmbeddingModel, type EmbeddingCreateParams, } from "./embeddings.mjs";
export { Evals, type EvalCustomDataSourceConfig, type EvalStoredCompletionsDataSourceConfig, type EvalCreateResponse, type EvalRetrieveResponse, type EvalUpdateResponse, type EvalListResponse, type EvalDeleteResponse, type EvalCreateParams, type EvalUpdateParams, type EvalListParams, type EvalListResponsesPage, } from "./evals/evals.mjs";
export { Files, type FileContent, type FileDeleted, type FileObject, type FilePurpose, type FileCreateParams, type FileListParams, type FileObjectsPage, } from "./files.mjs";
export { FineTuning } from "./fine-tuning/fine-tuning.mjs";
export { Graders } from "./graders/graders.mjs";
export { Images, type Image, type ImageEditCompletedEvent, type ImageEditPartialImageEvent, type ImageEditStreamEvent, type ImageGenCompletedEvent, type ImageGenPartialImageEvent, type ImageGenStreamEvent, type ImageModel, type ImagesResponse, type ImageCreateVariationParams, type ImageEditParams, type ImageEditParamsNonStreaming, type ImageEditParamsStreaming, type ImageGenerateParams, type ImageGenerateParamsNonStreaming, type ImageGenerateParamsStreaming, } from "./images.mjs";
export { Models, type Model, type ModelDeleted, type ModelsPage } from "./models.mjs";
export { Moderations, type Moderation, type ModerationImageURLInput, type ModerationModel, type ModerationMultiModalInput, type ModerationTextInput, type ModerationCreateResponse, type ModerationCreateParams, } from "./moderations.mjs";
export { Responses } from "./responses/responses.mjs";
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from "./uploads/uploads.mjs";
export { VectorStores, type AutoFileChunkingStrategyParam, type FileChunkingStrategy, type FileChunkingStrategyParam, type OtherFileChunkingStrategyObject, type StaticFileChunkingStrategy, type StaticFileChunkingStrategyObject, type StaticFileChunkingStrategyObjectParam, type VectorStore, type VectorStoreDeleted, type VectorStoreSearchResponse, type VectorStoreCreateParams, type VectorStoreUpdateParams, type VectorStoreListParams, type VectorStoreSearchParams, type VectorStoresPage, type VectorStoreSearchResponsesPage, } from "./vector-stores/vector-stores.mjs";
export { Webhooks } from "./webhooks.mjs";
//# sourceMappingURL=index.d.mts.map

export { InputItems, type ResponseItemList, type InputItemListParams } from "./input-items.mjs";
export { Responses } from "./responses.mjs";
//# sourceMappingURL=index.d.mts.map

export { Parts, type UploadPart, type PartCreateParams } from "./parts.mjs";
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from "./uploads.mjs";
//# sourceMappingURL=index.d.mts.map

export { FileBatches, type VectorStoreFileBatch, type FileBatchCreateParams, type FileBatchRetrieveParams, type FileBatchCancelParams, type FileBatchListFilesParams, } from "./file-batches.mjs";
export { Files, type VectorStoreFile, type VectorStoreFileDeleted, type FileContentResponse, type FileCreateParams, type FileRetrieveParams, type FileUpdateParams, type FileListParams, type FileDeleteParams, type FileContentParams, type VectorStoreFilesPage, type FileContentResponsesPage, } from "./files.mjs";
export { VectorStores, type AutoFileChunkingStrategyParam, type FileChunkingStrategy, type FileChunkingStrategyParam, type OtherFileChunkingStrategyObject, type StaticFileChunkingStrategy, type StaticFileChunkingStrategyObject, type StaticFileChunkingStrategyObjectParam, type VectorStore, type VectorStoreDeleted, type VectorStoreSearchResponse, type VectorStoreCreateParams, type VectorStoreUpdateParams, type VectorStoreListParams, type VectorStoreSearchParams, type VectorStoresPage, type VectorStoreSearchResponsesPage, } from "./vector-stores.mjs";
//# sourceMappingURL=index.d.mts.map

export * from "./Options.mjs";
export * from "./Refs.mjs";
export * from "./errorMessages.mjs";
export * from "./parseDef.mjs";
export * from "./parsers/any.mjs";
export * from "./parsers/array.mjs";
export * from "./parsers/bigint.mjs";
export * from "./parsers/boolean.mjs";
export * from "./parsers/branded.mjs";
export * from "./parsers/catch.mjs";
export * from "./parsers/date.mjs";
export * from "./parsers/default.mjs";
export * from "./parsers/effects.mjs";
export * from "./parsers/enum.mjs";
export * from "./parsers/intersection.mjs";
export * from "./parsers/literal.mjs";
export * from "./parsers/map.mjs";
export * from "./parsers/nativeEnum.mjs";
export * from "./parsers/never.mjs";
export * from "./parsers/null.mjs";
export * from "./parsers/nullable.mjs";
export * from "./parsers/number.mjs";
export * from "./parsers/object.mjs";
export * from "./parsers/optional.mjs";
export * from "./parsers/pipeline.mjs";
export * from "./parsers/promise.mjs";
export * from "./parsers/readonly.mjs";
export * from "./parsers/record.mjs";
export * from "./parsers/set.mjs";
export * from "./parsers/string.mjs";
export * from "./parsers/tuple.mjs";
export * from "./parsers/undefined.mjs";
export * from "./parsers/union.mjs";
export * from "./parsers/unknown.mjs";
export * from "./zodToJsonSchema.mjs";
import { zodToJsonSchema } from "./zodToJsonSchema.mjs";
export default zodToJsonSchema;
//# sourceMappingURL=index.d.mts.map

import * as path from 'node:path';
import path__default from 'node:path';

/**
 * Constant for path separator.
 *
 * Always equals to `"/"`.
 */
declare const sep = "/";
declare const normalize: typeof path__default.normalize;
declare const join: typeof path__default.join;
declare const resolve: typeof path__default.resolve;
/**
 * Resolves a string path, resolving '.' and '.' segments and allowing paths above the root.
 *
 * @param path - The path to normalise.
 * @param allowAboveRoot - Whether to allow the resulting path to be above the root directory.
 * @returns the normalised path string.
 */
declare function normalizeString(path: string, allowAboveRoot: boolean): string;
declare const isAbsolute: typeof path__default.isAbsolute;
declare const toNamespacedPath: typeof path__default.toNamespacedPath;
declare const extname: typeof path__default.extname;
declare const relative: typeof path__default.relative;
declare const dirname: typeof path__default.dirname;
declare const format: typeof path__default.format;
declare const basename: typeof path__default.basename;
declare const parse: typeof path__default.parse;
/**
 * The `path.matchesGlob()` method determines if `path` matches the `pattern`.
 * @param path The path to glob-match against.
 * @param pattern The glob to check the path against.
 */
declare const matchesGlob: (path: string, pattern: string | string[]) => boolean;

type NodePath = typeof path;
/**
 * The platform-specific file delimiter.
 *
 * Equals to `";"` in windows and `":"` in all other platforms.
 */
declare const delimiter: ";" | ":";
declare const posix: NodePath["posix"];
declare const win32: NodePath["win32"];
declare const _default: NodePath;

export { basename, _default as default, delimiter, dirname, extname, format, isAbsolute, join, matchesGlob, normalize, normalizeString, parse, posix, relative, resolve, sep, toNamespacedPath, win32 };


type EnvObject = Record<string, string | undefined>;
declare const env: EnvObject;
declare const nodeENV: string;

/** Value of process.platform */
declare const platform: NodeJS.Platform;
/** Detect if `CI` environment variable is set or a provider CI detected */
declare const isCI: boolean;
/** Detect if stdout.TTY is available */
declare const hasTTY: boolean;
/** Detect if global `window` object is available */
declare const hasWindow: boolean;
/** Detect if `DEBUG` environment variable is set */
declare const isDebug: boolean;
/** Detect if `NODE_ENV` environment variable is `test` */
declare const isTest: boolean;
/** Detect if `NODE_ENV` environment variable is `production` */
declare const isProduction: boolean;
/** Detect if `NODE_ENV` environment variable is `dev` or `development` */
declare const isDevelopment: boolean;
/** Detect if MINIMAL environment variable is set, running in CI or test or TTY is unavailable */
declare const isMinimal: boolean;
/** Detect if process.platform is Windows */
declare const isWindows: boolean;
/** Detect if process.platform is Linux */
declare const isLinux: boolean;
/** Detect if process.platform is macOS (darwin kernel) */
declare const isMacOS: boolean;
/** Color Support */
declare const isColorSupported: boolean;
/** Node.js versions */
declare const nodeVersion: string | null;
declare const nodeMajorVersion: number | null;

interface Process extends Partial<Omit<typeof globalThis.process, "versions">> {
    env: EnvObject;
    versions: Record<string, string>;
}
declare const process: Process;

type ProviderName = "" | "appveyor" | "aws_amplify" | "azure_pipelines" | "azure_static" | "appcircle" | "bamboo" | "bitbucket" | "bitrise" | "buddy" | "buildkite" | "circle" | "cirrus" | "cloudflare_pages" | "cloudflare_workers" | "codebuild" | "codefresh" | "drone" | "drone" | "dsari" | "github_actions" | "gitlab" | "gocd" | "layerci" | "hudson" | "jenkins" | "magnum" | "netlify" | "nevercode" | "render" | "sail" | "semaphore" | "screwdriver" | "shippable" | "solano" | "strider" | "teamcity" | "travis" | "vercel" | "appcenter" | "codesandbox" | "stackblitz" | "stormkit" | "cleavr" | "zeabur" | "codesphere" | "railway" | "deno-deploy" | "firebase_app_hosting";
type ProviderInfo = {
    name: ProviderName;
    ci?: boolean;
    [meta: string]: any;
};
/** Current provider info */
declare const providerInfo: ProviderInfo;
declare const provider: ProviderName;

type RuntimeName = "workerd" | "deno" | "netlify" | "node" | "bun" | "edge-light" | "fastly" | "";
type RuntimeInfo = {
    name: RuntimeName;
};
/**
 * Indicates if running in Node.js or a Node.js compatible runtime.
 *
 * **Note:** When running code in Bun and Deno with Node.js compatibility mode, `isNode` flag will be also `true`, indicating running in a Node.js compatible runtime.
 *
 * Use `runtime === "node"` if you need strict check for Node.js runtime.
 */
declare const isNode: boolean;
/**
 * Indicates if running in Bun runtime.
 */
declare const isBun: boolean;
/**
 * Indicates if running in Deno runtime.
 */
declare const isDeno: boolean;
/**
 * Indicates if running in Fastly runtime.
 */
declare const isFastly: boolean;
/**
 * Indicates if running in Netlify runtime.
 */
declare const isNetlify: boolean;
/**
 *
 * Indicates if running in EdgeLight (Vercel Edge) runtime.
 */
declare const isEdgeLight: boolean;
/**
 * Indicates if running in Cloudflare Workers runtime.
 */
declare const isWorkerd: boolean;
declare const runtimeInfo: RuntimeInfo | undefined;
declare const runtime: RuntimeName;

export { env, hasTTY, hasWindow, isBun, isCI, isColorSupported, isDebug, isDeno, isDevelopment, isEdgeLight, isFastly, isLinux, isMacOS, isMinimal, isNetlify, isNode, isProduction, isTest, isWindows, isWorkerd, nodeENV, nodeMajorVersion, nodeVersion, platform, process, provider, providerInfo, runtime, runtimeInfo };
export type { EnvObject, Process, ProviderInfo, ProviderName, RuntimeInfo, RuntimeName };


import * as js_tokens from 'js-tokens';
import { Token } from 'js-tokens';

interface StripLiteralOptions {
    /**
     * Will be called for each string literal. Return false to skip stripping.
     */
    filter?: (s: string) => boolean;
    /**
     * Fill the stripped literal with this character.
     * It must be a single character.
     *
     * @default ' '
     */
    fillChar?: string;
}

declare function stripLiteralJsTokens(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: Token[];
};

/**
 * Strip literal from code.
 */
declare function stripLiteral(code: string, options?: StripLiteralOptions): string;
/**
 * Strip literal from code, return more detailed information.
 */
declare function stripLiteralDetailed(code: string, options?: StripLiteralOptions): {
    result: string;
    tokens: js_tokens.Token[];
};

export { type StripLiteralOptions, stripLiteral, stripLiteralDetailed, stripLiteralJsTokens };


//#region src/utils.d.ts

declare const convertPathToPattern: (path: string) => string;
declare const escapePath: (path: string) => string;
// #endregion
// #region isDynamicPattern
/*
Has a few minor differences with `fast-glob` for better accuracy:

Doesn't necessarily return false on patterns that include `\\`.

Returns true if the pattern includes parentheses,
regardless of them representing one single pattern or not.

Returns true for unfinished glob extensions i.e. `(h`, `+(h`.

Returns true for unfinished brace expansions as long as they include `,` or `..`.
*/
declare function isDynamicPattern(pattern: string, options?: {
  caseSensitiveMatch: boolean;
}): boolean; //#endregion
//#region src/index.d.ts

// #endregion
// #region log
interface GlobOptions {
  absolute?: boolean;
  cwd?: string;
  patterns?: string | string[];
  ignore?: string | string[];
  dot?: boolean;
  deep?: number;
  followSymbolicLinks?: boolean;
  caseSensitiveMatch?: boolean;
  expandDirectories?: boolean;
  onlyDirectories?: boolean;
  onlyFiles?: boolean;
  debug?: boolean;
}
declare function glob(patterns: string | string[], options?: Omit<GlobOptions, "patterns">): Promise<string[]>;
declare function glob(options: GlobOptions): Promise<string[]>;
declare function globSync(patterns: string | string[], options?: Omit<GlobOptions, "patterns">): string[];
declare function globSync(options: GlobOptions): string[];

//#endregion
export { GlobOptions, convertPathToPattern, escapePath, glob, globSync, isDynamicPattern };

export * from '@vue/compiler-sfc'


export * from '@vue/server-renderer'
