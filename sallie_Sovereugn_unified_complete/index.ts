import CAC from "./CAC.ts";
import Command from "./Command.ts";
/**
 * @param name The program name to display in help and version message
 */

const cac = (name = '') => new CAC(name);

export default cac;
export { cac, CAC, Command };

// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { OpenAI as default } from './client';

export { type Uploadable, toFile } from './core/uploads';
export { APIPromise } from './core/api-promise';
export { OpenAI, type ClientOptions } from './client';
export { PagePromise } from './core/pagination';
export {
  OpenAIError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
  InvalidWebhookSignatureError,
} from './core/error';

export { AzureOpenAI } from './azure';


import { default_format, formatters, RFC1738, RFC3986 } from './formats';

const formats = {
  formatters,
  RFC1738,
  RFC3986,
  default: default_format,
};

export { stringify } from './stringify';
export { formats };

export type { DefaultDecoder, DefaultEncoder, Format, ParseOptions, StringifyOptions } from './types';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Audio, type AudioModel, type AudioResponseFormat } from './audio';
export { Speech, type SpeechModel, type SpeechCreateParams } from './speech';
export {
  Transcriptions,
  type Transcription,
  type TranscriptionInclude,
  type TranscriptionSegment,
  type TranscriptionStreamEvent,
  type TranscriptionTextDeltaEvent,
  type TranscriptionTextDoneEvent,
  type TranscriptionVerbose,
  type TranscriptionWord,
  type TranscriptionCreateResponse,
  type TranscriptionCreateParams,
  type TranscriptionCreateParamsNonStreaming,
  type TranscriptionCreateParamsStreaming,
} from './transcriptions';
export {
  Translations,
  type Translation,
  type TranslationVerbose,
  type TranslationCreateResponse,
  type TranslationCreateParams,
} from './translations';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Assistants,
  type Assistant,
  type AssistantDeleted,
  type AssistantStreamEvent,
  type AssistantTool,
  type CodeInterpreterTool,
  type FileSearchTool,
  type FunctionTool,
  type MessageStreamEvent,
  type RunStepStreamEvent,
  type RunStreamEvent,
  type ThreadStreamEvent,
  type AssistantCreateParams,
  type AssistantUpdateParams,
  type AssistantListParams,
  type AssistantsPage,
} from './assistants';
export { Beta } from './beta';
export { Realtime } from './realtime/index';
export {
  Threads,
  type AssistantResponseFormatOption,
  type AssistantToolChoice,
  type AssistantToolChoiceFunction,
  type AssistantToolChoiceOption,
  type Thread,
  type ThreadDeleted,
  type ThreadCreateParams,
  type ThreadUpdateParams,
  type ThreadCreateAndRunParams,
  type ThreadCreateAndRunParamsNonStreaming,
  type ThreadCreateAndRunParamsStreaming,
  type ThreadCreateAndRunPollParams,
  type ThreadCreateAndRunStreamParams,
} from './threads/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Realtime } from './realtime';
export { Sessions, type Session, type SessionCreateResponse, type SessionCreateParams } from './sessions';
export {
  TranscriptionSessions,
  type TranscriptionSession,
  type TranscriptionSessionCreateParams,
} from './transcription-sessions';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Messages,
  type Annotation,
  type AnnotationDelta,
  type FileCitationAnnotation,
  type FileCitationDeltaAnnotation,
  type FilePathAnnotation,
  type FilePathDeltaAnnotation,
  type ImageFile,
  type ImageFileContentBlock,
  type ImageFileDelta,
  type ImageFileDeltaBlock,
  type ImageURL,
  type ImageURLContentBlock,
  type ImageURLDelta,
  type ImageURLDeltaBlock,
  type Message,
  type MessageContent,
  type MessageContentDelta,
  type MessageContentPartParam,
  type MessageDeleted,
  type MessageDelta,
  type MessageDeltaEvent,
  type RefusalContentBlock,
  type RefusalDeltaBlock,
  type Text,
  type TextContentBlock,
  type TextContentBlockParam,
  type TextDelta,
  type TextDeltaBlock,
  type MessageCreateParams,
  type MessageRetrieveParams,
  type MessageUpdateParams,
  type MessageListParams,
  type MessageDeleteParams,
  type MessagesPage,
} from './messages';
export {
  Runs,
  type RequiredActionFunctionToolCall,
  type Run,
  type RunStatus,
  type RunCreateParams,
  type RunCreateParamsNonStreaming,
  type RunCreateParamsStreaming,
  type RunRetrieveParams,
  type RunUpdateParams,
  type RunListParams,
  type RunCancelParams,
  type RunSubmitToolOutputsParams,
  type RunSubmitToolOutputsParamsNonStreaming,
  type RunSubmitToolOutputsParamsStreaming,
  type RunsPage,
  type RunCreateAndPollParams,
  type RunCreateAndStreamParams,
  type RunStreamParams,
  type RunSubmitToolOutputsAndPollParams,
  type RunSubmitToolOutputsStreamParams,
} from './runs/index';
export {
  Threads,
  type AssistantResponseFormatOption,
  type AssistantToolChoice,
  type AssistantToolChoiceFunction,
  type AssistantToolChoiceOption,
  type Thread,
  type ThreadDeleted,
  type ThreadCreateParams,
  type ThreadUpdateParams,
  type ThreadCreateAndRunParams,
  type ThreadCreateAndRunParamsNonStreaming,
  type ThreadCreateAndRunParamsStreaming,
  type ThreadCreateAndRunPollParams,
  type ThreadCreateAndRunStreamParams,
} from './threads';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Runs,
  type RequiredActionFunctionToolCall,
  type Run,
  type RunStatus,
  type RunCreateParams,
  type RunCreateParamsNonStreaming,
  type RunCreateParamsStreaming,
  type RunRetrieveParams,
  type RunUpdateParams,
  type RunListParams,
  type RunCancelParams,
  type RunSubmitToolOutputsParams,
  type RunSubmitToolOutputsParamsNonStreaming,
  type RunSubmitToolOutputsParamsStreaming,
  type RunsPage,
  type RunCreateAndPollParams,
  type RunCreateAndStreamParams,
  type RunStreamParams,
  type RunSubmitToolOutputsAndPollParams,
  type RunSubmitToolOutputsStreamParams,
} from './runs';
export {
  Steps,
  type CodeInterpreterLogs,
  type CodeInterpreterOutputImage,
  type CodeInterpreterToolCall,
  type CodeInterpreterToolCallDelta,
  type FileSearchToolCall,
  type FileSearchToolCallDelta,
  type FunctionToolCall,
  type FunctionToolCallDelta,
  type MessageCreationStepDetails,
  type RunStep,
  type RunStepInclude,
  type RunStepDelta,
  type RunStepDeltaEvent,
  type RunStepDeltaMessageDelta,
  type ToolCall,
  type ToolCallDelta,
  type ToolCallDeltaObject,
  type ToolCallsStepDetails,
  type StepRetrieveParams,
  type StepListParams,
  type RunStepsPage,
} from './steps';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Completions,
  type ChatCompletion,
  type ChatCompletionAllowedToolChoice,
  type ChatCompletionAssistantMessageParam,
  type ChatCompletionAudio,
  type ChatCompletionAudioParam,
  type ChatCompletionChunk,
  type ChatCompletionContentPart,
  type ChatCompletionContentPartImage,
  type ChatCompletionContentPartInputAudio,
  type ChatCompletionContentPartRefusal,
  type ChatCompletionContentPartText,
  type ChatCompletionCustomTool,
  type ChatCompletionDeleted,
  type ChatCompletionDeveloperMessageParam,
  type ChatCompletionFunctionCallOption,
  type ChatCompletionFunctionMessageParam,
  type ChatCompletionFunctionTool,
  type ChatCompletionMessage,
  type ChatCompletionMessageCustomToolCall,
  type ChatCompletionMessageFunctionToolCall,
  type ChatCompletionMessageParam,
  type ChatCompletionMessageToolCall,
  type ChatCompletionModality,
  type ChatCompletionNamedToolChoice,
  type ChatCompletionNamedToolChoiceCustom,
  type ChatCompletionPredictionContent,
  type ChatCompletionRole,
  type ChatCompletionStoreMessage,
  type ChatCompletionStreamOptions,
  type ChatCompletionSystemMessageParam,
  type ChatCompletionTokenLogprob,
  type ChatCompletionTool,
  type ChatCompletionToolChoiceOption,
  type ChatCompletionToolMessageParam,
  type ChatCompletionUserMessageParam,
  type ChatCompletionAllowedTools,
  type ChatCompletionCreateParams,
  type ChatCompletionCreateParamsNonStreaming,
  type ChatCompletionCreateParamsStreaming,
  type ChatCompletionUpdateParams,
  type ChatCompletionListParams,
  type ChatCompletionStoreMessagesPage,
  type ChatCompletionsPage,
} from './completions';
export * from './completions';
export { Messages, type MessageListParams } from './messages';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Chat } from './chat';
export {
  Completions,
  type ChatCompletion,
  type ChatCompletionAllowedToolChoice,
  type ChatCompletionAssistantMessageParam,
  type ChatCompletionAudio,
  type ChatCompletionAudioParam,
  type ChatCompletionChunk,
  type ChatCompletionContentPart,
  type ChatCompletionContentPartImage,
  type ChatCompletionContentPartInputAudio,
  type ChatCompletionContentPartRefusal,
  type ChatCompletionContentPartText,
  type ChatCompletionCustomTool,
  type ChatCompletionDeleted,
  type ChatCompletionDeveloperMessageParam,
  type ChatCompletionFunctionCallOption,
  type ChatCompletionFunctionMessageParam,
  type ChatCompletionFunctionTool,
  type ChatCompletionMessage,
  type ChatCompletionMessageCustomToolCall,
  type ChatCompletionMessageFunctionToolCall,
  type ChatCompletionMessageParam,
  type ChatCompletionMessageToolCall,
  type ChatCompletionModality,
  type ChatCompletionNamedToolChoice,
  type ChatCompletionNamedToolChoiceCustom,
  type ChatCompletionPredictionContent,
  type ChatCompletionRole,
  type ChatCompletionStoreMessage,
  type ChatCompletionStreamOptions,
  type ChatCompletionSystemMessageParam,
  type ChatCompletionTokenLogprob,
  type ChatCompletionTool,
  type ChatCompletionToolChoiceOption,
  type ChatCompletionToolMessageParam,
  type ChatCompletionUserMessageParam,
  type ChatCompletionAllowedTools,
  type ChatCompletionCreateParams,
  type ChatCompletionCreateParamsNonStreaming,
  type ChatCompletionCreateParamsStreaming,
  type ChatCompletionUpdateParams,
  type ChatCompletionListParams,
  type ChatCompletionStoreMessagesPage,
  type ChatCompletionsPage,
} from './completions/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Content, type ContentRetrieveParams } from './content';
export {
  Files,
  type FileCreateResponse,
  type FileRetrieveResponse,
  type FileListResponse,
  type FileCreateParams,
  type FileRetrieveParams,
  type FileListParams,
  type FileDeleteParams,
  type FileListResponsesPage,
} from './files';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Containers,
  type ContainerCreateResponse,
  type ContainerRetrieveResponse,
  type ContainerListResponse,
  type ContainerCreateParams,
  type ContainerListParams,
  type ContainerListResponsesPage,
} from './containers';
export {
  Files,
  type FileCreateResponse,
  type FileRetrieveResponse,
  type FileListResponse,
  type FileCreateParams,
  type FileRetrieveParams,
  type FileListParams,
  type FileDeleteParams,
  type FileListResponsesPage,
} from './files/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Conversations } from './conversations';
export {
  Items,
  type ConversationItem,
  type ConversationItemList,
  type ItemCreateParams,
  type ItemRetrieveParams,
  type ItemListParams,
  type ItemDeleteParams,
  type ConversationItemsPage,
} from './items';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Evals,
  type EvalCustomDataSourceConfig,
  type EvalStoredCompletionsDataSourceConfig,
  type EvalCreateResponse,
  type EvalRetrieveResponse,
  type EvalUpdateResponse,
  type EvalListResponse,
  type EvalDeleteResponse,
  type EvalCreateParams,
  type EvalUpdateParams,
  type EvalListParams,
  type EvalListResponsesPage,
} from './evals';
export {
  Runs,
  type CreateEvalCompletionsRunDataSource,
  type CreateEvalJSONLRunDataSource,
  type EvalAPIError,
  type RunCreateResponse,
  type RunRetrieveResponse,
  type RunListResponse,
  type RunDeleteResponse,
  type RunCancelResponse,
  type RunCreateParams,
  type RunRetrieveParams,
  type RunListParams,
  type RunDeleteParams,
  type RunCancelParams,
  type RunListResponsesPage,
} from './runs/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  OutputItems,
  type OutputItemRetrieveResponse,
  type OutputItemListResponse,
  type OutputItemRetrieveParams,
  type OutputItemListParams,
  type OutputItemListResponsesPage,
} from './output-items';
export {
  Runs,
  type CreateEvalCompletionsRunDataSource,
  type CreateEvalJSONLRunDataSource,
  type EvalAPIError,
  type RunCreateResponse,
  type RunRetrieveResponse,
  type RunListResponse,
  type RunDeleteResponse,
  type RunCancelResponse,
  type RunCreateParams,
  type RunRetrieveParams,
  type RunListParams,
  type RunDeleteParams,
  type RunCancelParams,
  type RunListResponsesPage,
} from './runs';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Alpha } from './alpha';
export {
  Graders,
  type GraderRunResponse,
  type GraderValidateResponse,
  type GraderRunParams,
  type GraderValidateParams,
} from './graders';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Checkpoints } from './checkpoints';
export {
  Permissions,
  type PermissionCreateResponse,
  type PermissionRetrieveResponse,
  type PermissionDeleteResponse,
  type PermissionCreateParams,
  type PermissionRetrieveParams,
  type PermissionDeleteParams,
  type PermissionCreateResponsesPage,
} from './permissions';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Alpha } from './alpha/index';
export { Checkpoints } from './checkpoints/index';
export { FineTuning } from './fine-tuning';
export {
  Jobs,
  type FineTuningJob,
  type FineTuningJobEvent,
  type FineTuningJobWandbIntegration,
  type FineTuningJobWandbIntegrationObject,
  type FineTuningJobIntegration,
  type JobCreateParams,
  type JobListParams,
  type JobListEventsParams,
  type FineTuningJobsPage,
  type FineTuningJobEventsPage,
} from './jobs/index';
export {
  Methods,
  type DpoHyperparameters,
  type DpoMethod,
  type ReinforcementHyperparameters,
  type ReinforcementMethod,
  type SupervisedHyperparameters,
  type SupervisedMethod,
} from './methods';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Checkpoints,
  type FineTuningJobCheckpoint,
  type CheckpointListParams,
  type FineTuningJobCheckpointsPage,
} from './checkpoints';
export {
  Jobs,
  type FineTuningJob,
  type FineTuningJobEvent,
  type FineTuningJobWandbIntegration,
  type FineTuningJobWandbIntegrationObject,
  type FineTuningJobIntegration,
  type JobCreateParams,
  type JobListParams,
  type JobListEventsParams,
  type FineTuningJobsPage,
  type FineTuningJobEventsPage,
} from './jobs';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  GraderModels,
  type LabelModelGrader,
  type MultiGrader,
  type PythonGrader,
  type ScoreModelGrader,
  type StringCheckGrader,
  type TextSimilarityGrader,
} from './grader-models';
export { Graders } from './graders';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './chat/index';
export * from './shared';
export { Audio, type AudioModel, type AudioResponseFormat } from './audio/audio';
export {
  Batches,
  type Batch,
  type BatchError,
  type BatchRequestCounts,
  type BatchCreateParams,
  type BatchListParams,
  type BatchesPage,
} from './batches';
export { Beta } from './beta/beta';
export {
  Completions,
  type Completion,
  type CompletionChoice,
  type CompletionUsage,
  type CompletionCreateParams,
  type CompletionCreateParamsNonStreaming,
  type CompletionCreateParamsStreaming,
} from './completions';
export {
  Containers,
  type ContainerCreateResponse,
  type ContainerRetrieveResponse,
  type ContainerListResponse,
  type ContainerCreateParams,
  type ContainerListParams,
  type ContainerListResponsesPage,
} from './containers/containers';
export { Conversations } from './conversations/conversations';
export {
  Embeddings,
  type CreateEmbeddingResponse,
  type Embedding,
  type EmbeddingModel,
  type EmbeddingCreateParams,
} from './embeddings';
export {
  Evals,
  type EvalCustomDataSourceConfig,
  type EvalStoredCompletionsDataSourceConfig,
  type EvalCreateResponse,
  type EvalRetrieveResponse,
  type EvalUpdateResponse,
  type EvalListResponse,
  type EvalDeleteResponse,
  type EvalCreateParams,
  type EvalUpdateParams,
  type EvalListParams,
  type EvalListResponsesPage,
} from './evals/evals';
export {
  Files,
  type FileContent,
  type FileDeleted,
  type FileObject,
  type FilePurpose,
  type FileCreateParams,
  type FileListParams,
  type FileObjectsPage,
} from './files';
export { FineTuning } from './fine-tuning/fine-tuning';
export { Graders } from './graders/graders';
export {
  Images,
  type Image,
  type ImageEditCompletedEvent,
  type ImageEditPartialImageEvent,
  type ImageEditStreamEvent,
  type ImageGenCompletedEvent,
  type ImageGenPartialImageEvent,
  type ImageGenStreamEvent,
  type ImageModel,
  type ImagesResponse,
  type ImageCreateVariationParams,
  type ImageEditParams,
  type ImageEditParamsNonStreaming,
  type ImageEditParamsStreaming,
  type ImageGenerateParams,
  type ImageGenerateParamsNonStreaming,
  type ImageGenerateParamsStreaming,
} from './images';
export { Models, type Model, type ModelDeleted, type ModelsPage } from './models';
export {
  Moderations,
  type Moderation,
  type ModerationImageURLInput,
  type ModerationModel,
  type ModerationMultiModalInput,
  type ModerationTextInput,
  type ModerationCreateResponse,
  type ModerationCreateParams,
} from './moderations';
export { Responses } from './responses/responses';
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from './uploads/uploads';
export {
  VectorStores,
  type AutoFileChunkingStrategyParam,
  type FileChunkingStrategy,
  type FileChunkingStrategyParam,
  type OtherFileChunkingStrategyObject,
  type StaticFileChunkingStrategy,
  type StaticFileChunkingStrategyObject,
  type StaticFileChunkingStrategyObjectParam,
  type VectorStore,
  type VectorStoreDeleted,
  type VectorStoreSearchResponse,
  type VectorStoreCreateParams,
  type VectorStoreUpdateParams,
  type VectorStoreListParams,
  type VectorStoreSearchParams,
  type VectorStoresPage,
  type VectorStoreSearchResponsesPage,
} from './vector-stores/vector-stores';
export { Webhooks } from './webhooks';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { InputItems, type ResponseItemList, type InputItemListParams } from './input-items';
export { Responses } from './responses';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Parts, type UploadPart, type PartCreateParams } from './parts';
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from './uploads';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  FileBatches,
  type VectorStoreFileBatch,
  type FileBatchCreateParams,
  type FileBatchRetrieveParams,
  type FileBatchCancelParams,
  type FileBatchListFilesParams,
} from './file-batches';
export {
  Files,
  type VectorStoreFile,
  type VectorStoreFileDeleted,
  type FileContentResponse,
  type FileCreateParams,
  type FileRetrieveParams,
  type FileUpdateParams,
  type FileListParams,
  type FileDeleteParams,
  type FileContentParams,
  type VectorStoreFilesPage,
  type FileContentResponsesPage,
} from './files';
export {
  VectorStores,
  type AutoFileChunkingStrategyParam,
  type FileChunkingStrategy,
  type FileChunkingStrategyParam,
  type OtherFileChunkingStrategyObject,
  type StaticFileChunkingStrategy,
  type StaticFileChunkingStrategyObject,
  type StaticFileChunkingStrategyObjectParam,
  type VectorStore,
  type VectorStoreDeleted,
  type VectorStoreSearchResponse,
  type VectorStoreCreateParams,
  type VectorStoreUpdateParams,
  type VectorStoreListParams,
  type VectorStoreSearchParams,
  type VectorStoresPage,
  type VectorStoreSearchResponsesPage,
} from './vector-stores';


export * from './Options';
export * from './Refs';
export * from './errorMessages';
export * from './parseDef';
export * from './parsers/any';
export * from './parsers/array';
export * from './parsers/bigint';
export * from './parsers/boolean';
export * from './parsers/branded';
export * from './parsers/catch';
export * from './parsers/date';
export * from './parsers/default';
export * from './parsers/effects';
export * from './parsers/enum';
export * from './parsers/intersection';
export * from './parsers/literal';
export * from './parsers/map';
export * from './parsers/nativeEnum';
export * from './parsers/never';
export * from './parsers/null';
export * from './parsers/nullable';
export * from './parsers/number';
export * from './parsers/object';
export * from './parsers/optional';
export * from './parsers/pipeline';
export * from './parsers/promise';
export * from './parsers/readonly';
export * from './parsers/record';
export * from './parsers/set';
export * from './parsers/string';
export * from './parsers/tuple';
export * from './parsers/undefined';
export * from './parsers/union';
export * from './parsers/unknown';
export * from './zodToJsonSchema';
import { zodToJsonSchema } from './zodToJsonSchema';
export default zodToJsonSchema;








import CAC from "./CAC.ts";
import Command from "./Command.ts";
/**
 * @param name The program name to display in help and version message
 */

const cac = (name = '') => new CAC(name);

export default cac;
export { cac, CAC, Command };

export { OpenAIRealtimeError } from './internal-base';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { OpenAI as default } from './client';

export { type Uploadable, toFile } from './core/uploads';
export { APIPromise } from './core/api-promise';
export { OpenAI, type ClientOptions } from './client';
export { PagePromise } from './core/pagination';
export {
  OpenAIError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
  InvalidWebhookSignatureError,
} from './core/error';

export { AzureOpenAI } from './azure';


import { default_format, formatters, RFC1738, RFC3986 } from './formats';

const formats = {
  formatters,
  RFC1738,
  RFC3986,
  default: default_format,
};

export { stringify } from './stringify';
export { formats };

export type { DefaultDecoder, DefaultEncoder, Format, ParseOptions, StringifyOptions } from './types';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Audio, type AudioModel, type AudioResponseFormat } from './audio';
export { Speech, type SpeechModel, type SpeechCreateParams } from './speech';
export {
  Transcriptions,
  type Transcription,
  type TranscriptionInclude,
  type TranscriptionSegment,
  type TranscriptionStreamEvent,
  type TranscriptionTextDeltaEvent,
  type TranscriptionTextDoneEvent,
  type TranscriptionVerbose,
  type TranscriptionWord,
  type TranscriptionCreateResponse,
  type TranscriptionCreateParams,
  type TranscriptionCreateParamsNonStreaming,
  type TranscriptionCreateParamsStreaming,
} from './transcriptions';
export {
  Translations,
  type Translation,
  type TranslationVerbose,
  type TranslationCreateResponse,
  type TranslationCreateParams,
} from './translations';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Assistants,
  type Assistant,
  type AssistantDeleted,
  type AssistantStreamEvent,
  type AssistantTool,
  type CodeInterpreterTool,
  type FileSearchTool,
  type FunctionTool,
  type MessageStreamEvent,
  type RunStepStreamEvent,
  type RunStreamEvent,
  type ThreadStreamEvent,
  type AssistantCreateParams,
  type AssistantUpdateParams,
  type AssistantListParams,
  type AssistantsPage,
} from './assistants';
export { Beta } from './beta';
export { Realtime } from './realtime/index';
export {
  Threads,
  type AssistantResponseFormatOption,
  type AssistantToolChoice,
  type AssistantToolChoiceFunction,
  type AssistantToolChoiceOption,
  type Thread,
  type ThreadDeleted,
  type ThreadCreateParams,
  type ThreadUpdateParams,
  type ThreadCreateAndRunParams,
  type ThreadCreateAndRunParamsNonStreaming,
  type ThreadCreateAndRunParamsStreaming,
  type ThreadCreateAndRunPollParams,
  type ThreadCreateAndRunStreamParams,
} from './threads/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Realtime } from './realtime';
export { Sessions, type Session, type SessionCreateResponse, type SessionCreateParams } from './sessions';
export {
  TranscriptionSessions,
  type TranscriptionSession,
  type TranscriptionSessionCreateParams,
} from './transcription-sessions';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Messages,
  type Annotation,
  type AnnotationDelta,
  type FileCitationAnnotation,
  type FileCitationDeltaAnnotation,
  type FilePathAnnotation,
  type FilePathDeltaAnnotation,
  type ImageFile,
  type ImageFileContentBlock,
  type ImageFileDelta,
  type ImageFileDeltaBlock,
  type ImageURL,
  type ImageURLContentBlock,
  type ImageURLDelta,
  type ImageURLDeltaBlock,
  type Message,
  type MessageContent,
  type MessageContentDelta,
  type MessageContentPartParam,
  type MessageDeleted,
  type MessageDelta,
  type MessageDeltaEvent,
  type RefusalContentBlock,
  type RefusalDeltaBlock,
  type Text,
  type TextContentBlock,
  type TextContentBlockParam,
  type TextDelta,
  type TextDeltaBlock,
  type MessageCreateParams,
  type MessageRetrieveParams,
  type MessageUpdateParams,
  type MessageListParams,
  type MessageDeleteParams,
  type MessagesPage,
} from './messages';
export {
  Runs,
  type RequiredActionFunctionToolCall,
  type Run,
  type RunStatus,
  type RunCreateParams,
  type RunCreateParamsNonStreaming,
  type RunCreateParamsStreaming,
  type RunRetrieveParams,
  type RunUpdateParams,
  type RunListParams,
  type RunCancelParams,
  type RunSubmitToolOutputsParams,
  type RunSubmitToolOutputsParamsNonStreaming,
  type RunSubmitToolOutputsParamsStreaming,
  type RunsPage,
  type RunCreateAndPollParams,
  type RunCreateAndStreamParams,
  type RunStreamParams,
  type RunSubmitToolOutputsAndPollParams,
  type RunSubmitToolOutputsStreamParams,
} from './runs/index';
export {
  Threads,
  type AssistantResponseFormatOption,
  type AssistantToolChoice,
  type AssistantToolChoiceFunction,
  type AssistantToolChoiceOption,
  type Thread,
  type ThreadDeleted,
  type ThreadCreateParams,
  type ThreadUpdateParams,
  type ThreadCreateAndRunParams,
  type ThreadCreateAndRunParamsNonStreaming,
  type ThreadCreateAndRunParamsStreaming,
  type ThreadCreateAndRunPollParams,
  type ThreadCreateAndRunStreamParams,
} from './threads';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Runs,
  type RequiredActionFunctionToolCall,
  type Run,
  type RunStatus,
  type RunCreateParams,
  type RunCreateParamsNonStreaming,
  type RunCreateParamsStreaming,
  type RunRetrieveParams,
  type RunUpdateParams,
  type RunListParams,
  type RunCancelParams,
  type RunSubmitToolOutputsParams,
  type RunSubmitToolOutputsParamsNonStreaming,
  type RunSubmitToolOutputsParamsStreaming,
  type RunsPage,
  type RunCreateAndPollParams,
  type RunCreateAndStreamParams,
  type RunStreamParams,
  type RunSubmitToolOutputsAndPollParams,
  type RunSubmitToolOutputsStreamParams,
} from './runs';
export {
  Steps,
  type CodeInterpreterLogs,
  type CodeInterpreterOutputImage,
  type CodeInterpreterToolCall,
  type CodeInterpreterToolCallDelta,
  type FileSearchToolCall,
  type FileSearchToolCallDelta,
  type FunctionToolCall,
  type FunctionToolCallDelta,
  type MessageCreationStepDetails,
  type RunStep,
  type RunStepInclude,
  type RunStepDelta,
  type RunStepDeltaEvent,
  type RunStepDeltaMessageDelta,
  type ToolCall,
  type ToolCallDelta,
  type ToolCallDeltaObject,
  type ToolCallsStepDetails,
  type StepRetrieveParams,
  type StepListParams,
  type RunStepsPage,
} from './steps';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Completions,
  type ChatCompletion,
  type ChatCompletionAllowedToolChoice,
  type ChatCompletionAssistantMessageParam,
  type ChatCompletionAudio,
  type ChatCompletionAudioParam,
  type ChatCompletionChunk,
  type ChatCompletionContentPart,
  type ChatCompletionContentPartImage,
  type ChatCompletionContentPartInputAudio,
  type ChatCompletionContentPartRefusal,
  type ChatCompletionContentPartText,
  type ChatCompletionCustomTool,
  type ChatCompletionDeleted,
  type ChatCompletionDeveloperMessageParam,
  type ChatCompletionFunctionCallOption,
  type ChatCompletionFunctionMessageParam,
  type ChatCompletionFunctionTool,
  type ChatCompletionMessage,
  type ChatCompletionMessageCustomToolCall,
  type ChatCompletionMessageFunctionToolCall,
  type ChatCompletionMessageParam,
  type ChatCompletionMessageToolCall,
  type ChatCompletionModality,
  type ChatCompletionNamedToolChoice,
  type ChatCompletionNamedToolChoiceCustom,
  type ChatCompletionPredictionContent,
  type ChatCompletionRole,
  type ChatCompletionStoreMessage,
  type ChatCompletionStreamOptions,
  type ChatCompletionSystemMessageParam,
  type ChatCompletionTokenLogprob,
  type ChatCompletionTool,
  type ChatCompletionToolChoiceOption,
  type ChatCompletionToolMessageParam,
  type ChatCompletionUserMessageParam,
  type ChatCompletionAllowedTools,
  type ChatCompletionCreateParams,
  type ChatCompletionCreateParamsNonStreaming,
  type ChatCompletionCreateParamsStreaming,
  type ChatCompletionUpdateParams,
  type ChatCompletionListParams,
  type ChatCompletionStoreMessagesPage,
  type ChatCompletionsPage,
} from './completions';
export * from './completions';
export { Messages, type MessageListParams } from './messages';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Chat } from './chat';
export {
  Completions,
  type ChatCompletion,
  type ChatCompletionAllowedToolChoice,
  type ChatCompletionAssistantMessageParam,
  type ChatCompletionAudio,
  type ChatCompletionAudioParam,
  type ChatCompletionChunk,
  type ChatCompletionContentPart,
  type ChatCompletionContentPartImage,
  type ChatCompletionContentPartInputAudio,
  type ChatCompletionContentPartRefusal,
  type ChatCompletionContentPartText,
  type ChatCompletionCustomTool,
  type ChatCompletionDeleted,
  type ChatCompletionDeveloperMessageParam,
  type ChatCompletionFunctionCallOption,
  type ChatCompletionFunctionMessageParam,
  type ChatCompletionFunctionTool,
  type ChatCompletionMessage,
  type ChatCompletionMessageCustomToolCall,
  type ChatCompletionMessageFunctionToolCall,
  type ChatCompletionMessageParam,
  type ChatCompletionMessageToolCall,
  type ChatCompletionModality,
  type ChatCompletionNamedToolChoice,
  type ChatCompletionNamedToolChoiceCustom,
  type ChatCompletionPredictionContent,
  type ChatCompletionRole,
  type ChatCompletionStoreMessage,
  type ChatCompletionStreamOptions,
  type ChatCompletionSystemMessageParam,
  type ChatCompletionTokenLogprob,
  type ChatCompletionTool,
  type ChatCompletionToolChoiceOption,
  type ChatCompletionToolMessageParam,
  type ChatCompletionUserMessageParam,
  type ChatCompletionAllowedTools,
  type ChatCompletionCreateParams,
  type ChatCompletionCreateParamsNonStreaming,
  type ChatCompletionCreateParamsStreaming,
  type ChatCompletionUpdateParams,
  type ChatCompletionListParams,
  type ChatCompletionStoreMessagesPage,
  type ChatCompletionsPage,
} from './completions/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Content, type ContentRetrieveParams } from './content';
export {
  Files,
  type FileCreateResponse,
  type FileRetrieveResponse,
  type FileListResponse,
  type FileCreateParams,
  type FileRetrieveParams,
  type FileListParams,
  type FileDeleteParams,
  type FileListResponsesPage,
} from './files';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Containers,
  type ContainerCreateResponse,
  type ContainerRetrieveResponse,
  type ContainerListResponse,
  type ContainerCreateParams,
  type ContainerListParams,
  type ContainerListResponsesPage,
} from './containers';
export {
  Files,
  type FileCreateResponse,
  type FileRetrieveResponse,
  type FileListResponse,
  type FileCreateParams,
  type FileRetrieveParams,
  type FileListParams,
  type FileDeleteParams,
  type FileListResponsesPage,
} from './files/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Conversations } from './conversations';
export {
  Items,
  type ConversationItem,
  type ConversationItemList,
  type ItemCreateParams,
  type ItemRetrieveParams,
  type ItemListParams,
  type ItemDeleteParams,
  type ConversationItemsPage,
} from './items';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Evals,
  type EvalCustomDataSourceConfig,
  type EvalStoredCompletionsDataSourceConfig,
  type EvalCreateResponse,
  type EvalRetrieveResponse,
  type EvalUpdateResponse,
  type EvalListResponse,
  type EvalDeleteResponse,
  type EvalCreateParams,
  type EvalUpdateParams,
  type EvalListParams,
  type EvalListResponsesPage,
} from './evals';
export {
  Runs,
  type CreateEvalCompletionsRunDataSource,
  type CreateEvalJSONLRunDataSource,
  type EvalAPIError,
  type RunCreateResponse,
  type RunRetrieveResponse,
  type RunListResponse,
  type RunDeleteResponse,
  type RunCancelResponse,
  type RunCreateParams,
  type RunRetrieveParams,
  type RunListParams,
  type RunDeleteParams,
  type RunCancelParams,
  type RunListResponsesPage,
} from './runs/index';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  OutputItems,
  type OutputItemRetrieveResponse,
  type OutputItemListResponse,
  type OutputItemRetrieveParams,
  type OutputItemListParams,
  type OutputItemListResponsesPage,
} from './output-items';
export {
  Runs,
  type CreateEvalCompletionsRunDataSource,
  type CreateEvalJSONLRunDataSource,
  type EvalAPIError,
  type RunCreateResponse,
  type RunRetrieveResponse,
  type RunListResponse,
  type RunDeleteResponse,
  type RunCancelResponse,
  type RunCreateParams,
  type RunRetrieveParams,
  type RunListParams,
  type RunDeleteParams,
  type RunCancelParams,
  type RunListResponsesPage,
} from './runs';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Alpha } from './alpha';
export {
  Graders,
  type GraderRunResponse,
  type GraderValidateResponse,
  type GraderRunParams,
  type GraderValidateParams,
} from './graders';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Checkpoints } from './checkpoints';
export {
  Permissions,
  type PermissionCreateResponse,
  type PermissionRetrieveResponse,
  type PermissionDeleteResponse,
  type PermissionCreateParams,
  type PermissionRetrieveParams,
  type PermissionDeleteParams,
  type PermissionCreateResponsesPage,
} from './permissions';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Alpha } from './alpha/index';
export { Checkpoints } from './checkpoints/index';
export { FineTuning } from './fine-tuning';
export {
  Jobs,
  type FineTuningJob,
  type FineTuningJobEvent,
  type FineTuningJobWandbIntegration,
  type FineTuningJobWandbIntegrationObject,
  type FineTuningJobIntegration,
  type JobCreateParams,
  type JobListParams,
  type JobListEventsParams,
  type FineTuningJobsPage,
  type FineTuningJobEventsPage,
} from './jobs/index';
export {
  Methods,
  type DpoHyperparameters,
  type DpoMethod,
  type ReinforcementHyperparameters,
  type ReinforcementMethod,
  type SupervisedHyperparameters,
  type SupervisedMethod,
} from './methods';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  Checkpoints,
  type FineTuningJobCheckpoint,
  type CheckpointListParams,
  type FineTuningJobCheckpointsPage,
} from './checkpoints';
export {
  Jobs,
  type FineTuningJob,
  type FineTuningJobEvent,
  type FineTuningJobWandbIntegration,
  type FineTuningJobWandbIntegrationObject,
  type FineTuningJobIntegration,
  type JobCreateParams,
  type JobListParams,
  type JobListEventsParams,
  type FineTuningJobsPage,
  type FineTuningJobEventsPage,
} from './jobs';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  GraderModels,
  type LabelModelGrader,
  type MultiGrader,
  type PythonGrader,
  type ScoreModelGrader,
  type StringCheckGrader,
  type TextSimilarityGrader,
} from './grader-models';
export { Graders } from './graders';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './chat/index';
export * from './shared';
export { Audio, type AudioModel, type AudioResponseFormat } from './audio/audio';
export {
  Batches,
  type Batch,
  type BatchError,
  type BatchRequestCounts,
  type BatchCreateParams,
  type BatchListParams,
  type BatchesPage,
} from './batches';
export { Beta } from './beta/beta';
export {
  Completions,
  type Completion,
  type CompletionChoice,
  type CompletionUsage,
  type CompletionCreateParams,
  type CompletionCreateParamsNonStreaming,
  type CompletionCreateParamsStreaming,
} from './completions';
export {
  Containers,
  type ContainerCreateResponse,
  type ContainerRetrieveResponse,
  type ContainerListResponse,
  type ContainerCreateParams,
  type ContainerListParams,
  type ContainerListResponsesPage,
} from './containers/containers';
export { Conversations } from './conversations/conversations';
export {
  Embeddings,
  type CreateEmbeddingResponse,
  type Embedding,
  type EmbeddingModel,
  type EmbeddingCreateParams,
} from './embeddings';
export {
  Evals,
  type EvalCustomDataSourceConfig,
  type EvalStoredCompletionsDataSourceConfig,
  type EvalCreateResponse,
  type EvalRetrieveResponse,
  type EvalUpdateResponse,
  type EvalListResponse,
  type EvalDeleteResponse,
  type EvalCreateParams,
  type EvalUpdateParams,
  type EvalListParams,
  type EvalListResponsesPage,
} from './evals/evals';
export {
  Files,
  type FileContent,
  type FileDeleted,
  type FileObject,
  type FilePurpose,
  type FileCreateParams,
  type FileListParams,
  type FileObjectsPage,
} from './files';
export { FineTuning } from './fine-tuning/fine-tuning';
export { Graders } from './graders/graders';
export {
  Images,
  type Image,
  type ImageEditCompletedEvent,
  type ImageEditPartialImageEvent,
  type ImageEditStreamEvent,
  type ImageGenCompletedEvent,
  type ImageGenPartialImageEvent,
  type ImageGenStreamEvent,
  type ImageModel,
  type ImagesResponse,
  type ImageCreateVariationParams,
  type ImageEditParams,
  type ImageEditParamsNonStreaming,
  type ImageEditParamsStreaming,
  type ImageGenerateParams,
  type ImageGenerateParamsNonStreaming,
  type ImageGenerateParamsStreaming,
} from './images';
export { Models, type Model, type ModelDeleted, type ModelsPage } from './models';
export {
  Moderations,
  type Moderation,
  type ModerationImageURLInput,
  type ModerationModel,
  type ModerationMultiModalInput,
  type ModerationTextInput,
  type ModerationCreateResponse,
  type ModerationCreateParams,
} from './moderations';
export { Responses } from './responses/responses';
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from './uploads/uploads';
export {
  VectorStores,
  type AutoFileChunkingStrategyParam,
  type FileChunkingStrategy,
  type FileChunkingStrategyParam,
  type OtherFileChunkingStrategyObject,
  type StaticFileChunkingStrategy,
  type StaticFileChunkingStrategyObject,
  type StaticFileChunkingStrategyObjectParam,
  type VectorStore,
  type VectorStoreDeleted,
  type VectorStoreSearchResponse,
  type VectorStoreCreateParams,
  type VectorStoreUpdateParams,
  type VectorStoreListParams,
  type VectorStoreSearchParams,
  type VectorStoresPage,
  type VectorStoreSearchResponsesPage,
} from './vector-stores/vector-stores';
export { Webhooks } from './webhooks';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { InputItems, type ResponseItemList, type InputItemListParams } from './input-items';
export { Responses } from './responses';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export { Parts, type UploadPart, type PartCreateParams } from './parts';
export { Uploads, type Upload, type UploadCreateParams, type UploadCompleteParams } from './uploads';


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export {
  FileBatches,
  type VectorStoreFileBatch,
  type FileBatchCreateParams,
  type FileBatchRetrieveParams,
  type FileBatchCancelParams,
  type FileBatchListFilesParams,
} from './file-batches';
export {
  Files,
  type VectorStoreFile,
  type VectorStoreFileDeleted,
  type FileContentResponse,
  type FileCreateParams,
  type FileRetrieveParams,
  type FileUpdateParams,
  type FileListParams,
  type FileDeleteParams,
  type FileContentParams,
  type VectorStoreFilesPage,
  type FileContentResponsesPage,
} from './files';
export {
  VectorStores,
  type AutoFileChunkingStrategyParam,
  type FileChunkingStrategy,
  type FileChunkingStrategyParam,
  type OtherFileChunkingStrategyObject,
  type StaticFileChunkingStrategy,
  type StaticFileChunkingStrategyObject,
  type StaticFileChunkingStrategyObjectParam,
  type VectorStore,
  type VectorStoreDeleted,
  type VectorStoreSearchResponse,
  type VectorStoreCreateParams,
  type VectorStoreUpdateParams,
  type VectorStoreListParams,
  type VectorStoreSearchParams,
  type VectorStoresPage,
  type VectorStoreSearchResponsesPage,
} from './vector-stores';


export * from './Options';
export * from './Refs';
export * from './errorMessages';
export * from './parseDef';
export * from './parsers/any';
export * from './parsers/array';
export * from './parsers/bigint';
export * from './parsers/boolean';
export * from './parsers/branded';
export * from './parsers/catch';
export * from './parsers/date';
export * from './parsers/default';
export * from './parsers/effects';
export * from './parsers/enum';
export * from './parsers/intersection';
export * from './parsers/literal';
export * from './parsers/map';
export * from './parsers/nativeEnum';
export * from './parsers/never';
export * from './parsers/null';
export * from './parsers/nullable';
export * from './parsers/number';
export * from './parsers/object';
export * from './parsers/optional';
export * from './parsers/pipeline';
export * from './parsers/promise';
export * from './parsers/readonly';
export * from './parsers/record';
export * from './parsers/set';
export * from './parsers/string';
export * from './parsers/tuple';
export * from './parsers/undefined';
export * from './parsers/union';
export * from './parsers/unknown';
export * from './zodToJsonSchema';
import { zodToJsonSchema } from './zodToJsonSchema';
export default zodToJsonSchema;




/*
 * Persona: Tough love meets soul care.
 * Module: Conversational Coding
 * Intent: Enable code generation and explanation through natural conversation.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440006
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import AdaptivePersonaEngine from '../../core/AdaptivePersonaEngine.js';
import { OpenAIIntegration } from '../../ai/OpenAIIntegration.js';
import { ProvenanceLogger } from '../../core/ProvenanceLogger.js';

export class ConversationalCoding {
    brain;
    adaptiveEngine;
    ai;
    provenanceLogger;
    conversationHistory;

    constructor(sallieBrain) {
        this.brain = sallieBrain;
        this.adaptiveEngine = new AdaptivePersonaEngine();
        this.ai = new OpenAIIntegration();
        this.provenanceLogger = new ProvenanceLogger();
        this.conversationHistory = new Map();
    }

    async generateCode(description, language = 'javascript', context = {}) {
        const provenanceId = this.provenanceLogger.logEvent('code_generation_start', { description, language, context });

        const prompt = `Generate ${language} code for: ${description}. 
        Consider the context: ${JSON.stringify(context)}
        Provide clean, well-documented code with best practices.`;

        const response = await this.ai.generateResponse(prompt);
        
        const codeAnalysis = await this.analyzeGeneratedCode(response, language);
        
        this.provenanceLogger.logEvent('code_generation_complete', { 
            description, 
            language, 
            codeLength: response.length,
            analysis: codeAnalysis 
        }, provenanceId);

        return {
            code: response,
            language,
            analysis: codeAnalysis,
            provenanceId
        };
    }

    async explainCode(code, language, userLevel = 'intermediate') {
        const provenanceId = this.provenanceLogger.logEvent('code_explanation_start', { 
            codeLength: code.length, 
            language, 
            userLevel 
        });

        const prompt = `Explain this ${language} code in simple terms for a ${userLevel} developer:
        ${code}
        
        Break down:
        1. What it does
        2. Key concepts
        3. How it works step by step`;

        const explanation = await this.ai.generateResponse(prompt);
        
        this.provenanceLogger.logEvent('code_explanation_complete', { 
            language, 
            userLevel,
            explanationLength: explanation.length 
        }, provenanceId);

        return {
            explanation,
            language,
            userLevel,
            provenanceId
        };
    }

    async refactorCode(code, language, improvement = 'readability') {
        const provenanceId = this.provenanceLogger.logEvent('code_refactor_start', { 
            codeLength: code.length, 
            language, 
            improvement 
        });

        const prompt = `Refactor this ${language} code to improve ${improvement}:
        ${code}
        
        Focus on:
        - Better variable names
        - Improved structure
        - Best practices
        - Maintain functionality`;

        const refactoredCode = await this.ai.generateResponse(prompt);
        
        this.provenanceLogger.logEvent('code_refactor_complete', { 
            language, 
            improvement,
            originalLength: code.length,
            refactoredLength: refactoredCode.length 
        }, provenanceId);

        return {
            originalCode: code,
            refactoredCode,
            language,
            improvement,
            provenanceId
        };
    }

    async analyzeGeneratedCode(code, language) {
        // Basic analysis - could be enhanced with actual linting
        const lines = code.split('\n').length;
        const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|class\s+\w+/g) || []).length;
        const comments = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
        
        return {
            lines,
            functions,
            comments,
            language,
            hasErrorHandling: code.includes('try') || code.includes('catch'),
            hasDocumentation: comments > 0
        };
    }

    async conversationalCodeSession(userId, initialQuery) {
        const sessionId = this.provenanceLogger.startSession(userId);
        
        const response = await this.processCodingQuery(initialQuery);
        
        this.conversationHistory.set(sessionId, {
            userId,
            startTime: Date.now(),
            queries: [initialQuery],
            responses: [response]
        });
        
        this.provenanceLogger.endSession(userId);
        
        return {
            response,
            sessionId,
            canContinue: true
        };
    }

    async processCodingQuery(query) {
        // Determine intent from query
        if (query.includes('generate') || query.includes('create') || query.includes('write')) {
            return await this.generateCode(query);
        } else if (query.includes('explain') || query.includes('what does') || query.includes('how does')) {
            // For explanation, we need code - this is a simplified version
            return await this.explainCode(query, 'javascript', 'intermediate');
        } else if (query.includes('refactor') || query.includes('improve') || query.includes('optimize')) {
            // For refactoring, we need code - this is a simplified version
            return await this.refactorCode(query, 'javascript', 'readability');
        } else {
            return await this.ai.generateResponse(`Help with this coding question: ${query}`);
        }
    }
}


/* Merged master for logical file: features\omni-domain-research\index
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\features\omni-domain-research\index.ts (hash:77FF746BDD1448A71D1760AA3472BD0617D69BDFCD3C7EA783F6B1926791AF65)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\features\omni-domain-research\index.js (hash:4120B9DB6AD2C97EDD12AE49BE521D91625281072882644EA03F833623234AD1)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\features\omni-domain-research\index.ts | ext: .ts | sha: 77FF746BDD1448A71D1760AA3472BD0617D69BDFCD3C7EA783F6B1926791AF65 ---- */

[BINARY FILE - original copied to merged_sources: features\omni-domain-research\index.ts]

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\features\omni-domain-research\index.js | ext: .js | sha: 4120B9DB6AD2C97EDD12AE49BE521D91625281072882644EA03F833623234AD1 ---- */

[BINARY FILE - original copied to merged_sources: features\omni-domain-research\index.js]








/*
 * Persona: Tough love meets soul care.
 * Module: index
 * Intent: Handle functionality for index
 * Provenance-ID: 382bb72a-9d7b-4a61-91e3-c4e4005f2c18
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Source: SalleCompanion-1/server/index.ts (migrated 2025-08-27)

import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "026";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
})();
