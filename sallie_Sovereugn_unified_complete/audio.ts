import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { platform, versions } from 'node:process';
import { checkFileSupport } from '../internal/uploads';

const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_CHANNELS = 1;

const isNode = Boolean(versions?.node);

const recordingProviders: Record<NodeJS.Platform, string> = {
  win32: 'dshow',
  darwin: 'avfoundation',
  linux: 'alsa',
  aix: 'alsa',
  android: 'alsa',
  freebsd: 'alsa',
  haiku: 'alsa',
  sunos: 'alsa',
  netbsd: 'alsa',
  openbsd: 'alsa',
  cygwin: 'dshow',
};

function isResponse(stream: NodeJS.ReadableStream | Response | File): stream is Response {
  return typeof (stream as any).body !== 'undefined';
}

function isFile(stream: NodeJS.ReadableStream | Response | File): stream is File {
  checkFileSupport();
  return stream instanceof File;
}

async function nodejsPlayAudio(stream: NodeJS.ReadableStream | Response | File): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const ffplay = spawn('ffplay', ['-autoexit', '-nodisp', '-i', 'pipe:0']);

      if (isResponse(stream)) {
        (stream.body! as any).pipe(ffplay.stdin);
      } else if (isFile(stream)) {
        Readable.from(stream.stream()).pipe(ffplay.stdin);
      } else {
        stream.pipe(ffplay.stdin);
      }

      ffplay.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`ffplay process exited with code ${code}`));
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function playAudio(input: NodeJS.ReadableStream | Response | File): Promise<void> {
  if (isNode) {
    return nodejsPlayAudio(input);
  }

  throw new Error(
    'Play audio is not supported in the browser yet. Check out https://npm.im/wavtools as an alternative.',
  );
}

type RecordAudioOptions = {
  signal?: AbortSignal;
  device?: number;
  timeout?: number;
};

function nodejsRecordAudio({ signal, device, timeout }: RecordAudioOptions = {}): Promise<File> {
  checkFileSupport();
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    const provider = recordingProviders[platform];
    try {
      const ffmpeg = spawn(
        'ffmpeg',
        [
          '-f',
          provider,
          '-i',
          `:${device ?? 0}`, // default audio input device; adjust as needed
          '-ar',
          DEFAULT_SAMPLE_RATE.toString(),
          '-ac',
          DEFAULT_CHANNELS.toString(),
          '-f',
          'wav',
          'pipe:1',
        ],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      ffmpeg.stdout.on('data', (chunk) => {
        data.push(chunk);
      });

      ffmpeg.on('error', (error) => {
        console.error(error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        returnData();
      });

      function returnData() {
        const audioBuffer = Buffer.concat(data);
        const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
        resolve(audioFile);
      }

      if (typeof timeout === 'number' && timeout > 0) {
        const internalSignal = AbortSignal.timeout(timeout);
        internalSignal.addEventListener('abort', () => {
          ffmpeg.kill('SIGTERM');
        });
      }

      if (signal) {
        signal.addEventListener('abort', () => {
          ffmpeg.kill('SIGTERM');
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

export async function recordAudio(options: RecordAudioOptions = {}) {
  if (isNode) {
    return nodejsRecordAudio(options);
  }

  throw new Error(
    'Record audio is not supported in the browser. Check out https://npm.im/wavtools as an alternative.',
  );
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SpeechAPI from './speech';
import { Speech, SpeechCreateParams, SpeechModel } from './speech';
import * as TranscriptionsAPI from './transcriptions';
import {
  Transcription,
  TranscriptionCreateParams,
  TranscriptionCreateParamsNonStreaming,
  TranscriptionCreateParamsStreaming,
  TranscriptionCreateResponse,
  TranscriptionInclude,
  TranscriptionSegment,
  TranscriptionStreamEvent,
  TranscriptionTextDeltaEvent,
  TranscriptionTextDoneEvent,
  TranscriptionVerbose,
  TranscriptionWord,
  Transcriptions,
} from './transcriptions';
import * as TranslationsAPI from './translations';
import {
  Translation,
  TranslationCreateParams,
  TranslationCreateResponse,
  TranslationVerbose,
  Translations,
} from './translations';

export class Audio extends APIResource {
  transcriptions: TranscriptionsAPI.Transcriptions = new TranscriptionsAPI.Transcriptions(this._client);
  translations: TranslationsAPI.Translations = new TranslationsAPI.Translations(this._client);
  speech: SpeechAPI.Speech = new SpeechAPI.Speech(this._client);
}

export type AudioModel = 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';

/**
 * The format of the output, in one of these options: `json`, `text`, `srt`,
 * `verbose_json`, or `vtt`. For `gpt-4o-transcribe` and `gpt-4o-mini-transcribe`,
 * the only supported format is `json`.
 */
export type AudioResponseFormat = 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;

export declare namespace Audio {
  export { type AudioModel as AudioModel, type AudioResponseFormat as AudioResponseFormat };

  export {
    Transcriptions as Transcriptions,
    type Transcription as Transcription,
    type TranscriptionInclude as TranscriptionInclude,
    type TranscriptionSegment as TranscriptionSegment,
    type TranscriptionStreamEvent as TranscriptionStreamEvent,
    type TranscriptionTextDeltaEvent as TranscriptionTextDeltaEvent,
    type TranscriptionTextDoneEvent as TranscriptionTextDoneEvent,
    type TranscriptionVerbose as TranscriptionVerbose,
    type TranscriptionWord as TranscriptionWord,
    type TranscriptionCreateResponse as TranscriptionCreateResponse,
    type TranscriptionCreateParams as TranscriptionCreateParams,
    type TranscriptionCreateParamsNonStreaming as TranscriptionCreateParamsNonStreaming,
    type TranscriptionCreateParamsStreaming as TranscriptionCreateParamsStreaming,
  };

  export {
    Translations as Translations,
    type Translation as Translation,
    type TranslationVerbose as TranslationVerbose,
    type TranslationCreateResponse as TranslationCreateResponse,
    type TranslationCreateParams as TranslationCreateParams,
  };

  export { Speech as Speech, type SpeechModel as SpeechModel, type SpeechCreateParams as SpeechCreateParams };
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './audio/index';


import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { platform, versions } from 'node:process';
import { checkFileSupport } from '../internal/uploads';

const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_CHANNELS = 1;

const isNode = Boolean(versions?.node);

const recordingProviders: Record<NodeJS.Platform, string> = {
  win32: 'dshow',
  darwin: 'avfoundation',
  linux: 'alsa',
  aix: 'alsa',
  android: 'alsa',
  freebsd: 'alsa',
  haiku: 'alsa',
  sunos: 'alsa',
  netbsd: 'alsa',
  openbsd: 'alsa',
  cygwin: 'dshow',
};

function isResponse(stream: NodeJS.ReadableStream | Response | File): stream is Response {
  return typeof (stream as any).body !== 'undefined';
}

function isFile(stream: NodeJS.ReadableStream | Response | File): stream is File {
  checkFileSupport();
  return stream instanceof File;
}

async function nodejsPlayAudio(stream: NodeJS.ReadableStream | Response | File): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const ffplay = spawn('ffplay', ['-autoexit', '-nodisp', '-i', 'pipe:0']);

      if (isResponse(stream)) {
        (stream.body! as any).pipe(ffplay.stdin);
      } else if (isFile(stream)) {
        Readable.from(stream.stream()).pipe(ffplay.stdin);
      } else {
        stream.pipe(ffplay.stdin);
      }

      ffplay.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`ffplay process exited with code ${code}`));
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function playAudio(input: NodeJS.ReadableStream | Response | File): Promise<void> {
  if (isNode) {
    return nodejsPlayAudio(input);
  }

  throw new Error(
    'Play audio is not supported in the browser yet. Check out https://npm.im/wavtools as an alternative.',
  );
}

type RecordAudioOptions = {
  signal?: AbortSignal;
  device?: number;
  timeout?: number;
};

function nodejsRecordAudio({ signal, device, timeout }: RecordAudioOptions = {}): Promise<File> {
  checkFileSupport();
  return new Promise((resolve, reject) => {
    const data: any[] = [];
    const provider = recordingProviders[platform];
    try {
      const ffmpeg = spawn(
        'ffmpeg',
        [
          '-f',
          provider,
          '-i',
          `:${device ?? 0}`, // default audio input device; adjust as needed
          '-ar',
          DEFAULT_SAMPLE_RATE.toString(),
          '-ac',
          DEFAULT_CHANNELS.toString(),
          '-f',
          'wav',
          'pipe:1',
        ],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      ffmpeg.stdout.on('data', (chunk) => {
        data.push(chunk);
      });

      ffmpeg.on('error', (error) => {
        console.error(error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        returnData();
      });

      function returnData() {
        const audioBuffer = Buffer.concat(data);
        const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
        resolve(audioFile);
      }

      if (typeof timeout === 'number' && timeout > 0) {
        const internalSignal = AbortSignal.timeout(timeout);
        internalSignal.addEventListener('abort', () => {
          ffmpeg.kill('SIGTERM');
        });
      }

      if (signal) {
        signal.addEventListener('abort', () => {
          ffmpeg.kill('SIGTERM');
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

export async function recordAudio(options: RecordAudioOptions = {}) {
  if (isNode) {
    return nodejsRecordAudio(options);
  }

  throw new Error(
    'Record audio is not supported in the browser. Check out https://npm.im/wavtools as an alternative.',
  );
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SpeechAPI from './speech';
import { Speech, SpeechCreateParams, SpeechModel } from './speech';
import * as TranscriptionsAPI from './transcriptions';
import {
  Transcription,
  TranscriptionCreateParams,
  TranscriptionCreateParamsNonStreaming,
  TranscriptionCreateParamsStreaming,
  TranscriptionCreateResponse,
  TranscriptionInclude,
  TranscriptionSegment,
  TranscriptionStreamEvent,
  TranscriptionTextDeltaEvent,
  TranscriptionTextDoneEvent,
  TranscriptionVerbose,
  TranscriptionWord,
  Transcriptions,
} from './transcriptions';
import * as TranslationsAPI from './translations';
import {
  Translation,
  TranslationCreateParams,
  TranslationCreateResponse,
  TranslationVerbose,
  Translations,
} from './translations';

export class Audio extends APIResource {
  transcriptions: TranscriptionsAPI.Transcriptions = new TranscriptionsAPI.Transcriptions(this._client);
  translations: TranslationsAPI.Translations = new TranslationsAPI.Translations(this._client);
  speech: SpeechAPI.Speech = new SpeechAPI.Speech(this._client);
}

export type AudioModel = 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';

/**
 * The format of the output, in one of these options: `json`, `text`, `srt`,
 * `verbose_json`, or `vtt`. For `gpt-4o-transcribe` and `gpt-4o-mini-transcribe`,
 * the only supported format is `json`.
 */
export type AudioResponseFormat = 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;

export declare namespace Audio {
  export { type AudioModel as AudioModel, type AudioResponseFormat as AudioResponseFormat };

  export {
    Transcriptions as Transcriptions,
    type Transcription as Transcription,
    type TranscriptionInclude as TranscriptionInclude,
    type TranscriptionSegment as TranscriptionSegment,
    type TranscriptionStreamEvent as TranscriptionStreamEvent,
    type TranscriptionTextDeltaEvent as TranscriptionTextDeltaEvent,
    type TranscriptionTextDoneEvent as TranscriptionTextDoneEvent,
    type TranscriptionVerbose as TranscriptionVerbose,
    type TranscriptionWord as TranscriptionWord,
    type TranscriptionCreateResponse as TranscriptionCreateResponse,
    type TranscriptionCreateParams as TranscriptionCreateParams,
    type TranscriptionCreateParamsNonStreaming as TranscriptionCreateParamsNonStreaming,
    type TranscriptionCreateParamsStreaming as TranscriptionCreateParamsStreaming,
  };

  export {
    Translations as Translations,
    type Translation as Translation,
    type TranslationVerbose as TranslationVerbose,
    type TranslationCreateResponse as TranslationCreateResponse,
    type TranslationCreateParams as TranslationCreateParams,
  };

  export { Speech as Speech, type SpeechModel as SpeechModel, type SpeechCreateParams as SpeechCreateParams };
}


// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export * from './audio/index';
