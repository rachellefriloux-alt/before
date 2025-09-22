import { ErrorWithDiff, ParsedStack } from './types.js';

type GeneratedColumn = number;
type SourcesIndex = number;
type SourceLine = number;
type SourceColumn = number;
type NamesIndex = number;
type SourceMapSegment = [GeneratedColumn] | [GeneratedColumn, SourcesIndex, SourceLine, SourceColumn] | [GeneratedColumn, SourcesIndex, SourceLine, SourceColumn, NamesIndex];

interface SourceMapV3 {
    file?: string | null;
    names: string[];
    sourceRoot?: string;
    sources: (string | null)[];
    sourcesContent?: (string | null)[];
    version: 3;
    ignoreList?: number[];
}
interface EncodedSourceMap extends SourceMapV3 {
    mappings: string;
}
interface DecodedSourceMap extends SourceMapV3 {
    mappings: SourceMapSegment[][];
}
type OriginalMapping = {
    source: string | null;
    line: number;
    column: number;
    name: string | null;
};
type InvalidOriginalMapping = {
    source: null;
    line: null;
    column: null;
    name: null;
};
type GeneratedMapping = {
    line: number;
    column: number;
};
type InvalidGeneratedMapping = {
    line: null;
    column: null;
};
type Bias = typeof GREATEST_LOWER_BOUND | typeof LEAST_UPPER_BOUND;
type XInput = {
    x_google_ignoreList?: SourceMapV3['ignoreList'];
};
type EncodedSourceMapXInput = EncodedSourceMap & XInput;
type DecodedSourceMapXInput = DecodedSourceMap & XInput;
type SourceMapInput = string | EncodedSourceMapXInput | DecodedSourceMapXInput | TraceMap;
type Needle = {
    line: number;
    column: number;
    bias?: Bias;
};
type SourceNeedle = {
    source: string;
    line: number;
    column: number;
    bias?: Bias;
};
type EachMapping = {
    generatedLine: number;
    generatedColumn: number;
    source: null;
    originalLine: null;
    originalColumn: null;
    name: null;
} | {
    generatedLine: number;
    generatedColumn: number;
    source: string | null;
    originalLine: number;
    originalColumn: number;
    name: string | null;
};
declare abstract class SourceMap {
    version: SourceMapV3['version'];
    file: SourceMapV3['file'];
    names: SourceMapV3['names'];
    sourceRoot: SourceMapV3['sourceRoot'];
    sources: SourceMapV3['sources'];
    sourcesContent: SourceMapV3['sourcesContent'];
    resolvedSources: SourceMapV3['sources'];
    ignoreList: SourceMapV3['ignoreList'];
}

declare const LEAST_UPPER_BOUND = -1;
declare const GREATEST_LOWER_BOUND = 1;

declare class TraceMap implements SourceMap {
    version: SourceMapV3['version'];
    file: SourceMapV3['file'];
    names: SourceMapV3['names'];
    sourceRoot: SourceMapV3['sourceRoot'];
    sources: SourceMapV3['sources'];
    sourcesContent: SourceMapV3['sourcesContent'];
    ignoreList: SourceMapV3['ignoreList'];
    resolvedSources: string[];
    private _encoded;
    private _decoded;
    private _decodedMemo;
    private _bySources;
    private _bySourceMemos;
    constructor(map: SourceMapInput, mapUrl?: string | null);
}
/**
 * A higher-level API to find the source/line/column associated with a generated line/column
 * (think, from a stack trace). Line is 1-based, but column is 0-based, due to legacy behavior in
 * `source-map` library.
 */
declare function originalPositionFor(map: TraceMap, needle: Needle): OriginalMapping | InvalidOriginalMapping;
/**
 * Finds the generated line/column position of the provided source/line/column source position.
 */
declare function generatedPositionFor(map: TraceMap, needle: SourceNeedle): GeneratedMapping | InvalidGeneratedMapping;
/**
 * Iterates each mapping in generated position order.
 */
declare function eachMapping(map: TraceMap, cb: (mapping: EachMapping) => void): void;

interface StackTraceParserOptions {
	ignoreStackEntries?: (RegExp | string)[];
	getSourceMap?: (file: string) => unknown;
	getUrlId?: (id: string) => string;
	frameFilter?: (error: ErrorWithDiff, frame: ParsedStack) => boolean | void;
}
declare function parseSingleFFOrSafariStack(raw: string): ParsedStack | null;
declare function parseSingleStack(raw: string): ParsedStack | null;
// Based on https://github.com/stacktracejs/error-stack-parser
// Credit to stacktracejs
declare function parseSingleV8Stack(raw: string): ParsedStack | null;
declare function createStackString(stacks: ParsedStack[]): string;
declare function parseStacktrace(stack: string, options?: StackTraceParserOptions): ParsedStack[];
declare function parseErrorStacktrace(e: ErrorWithDiff, options?: StackTraceParserOptions): ParsedStack[];

export { TraceMap, createStackString, eachMapping, generatedPositionFor, originalPositionFor, parseErrorStacktrace, parseSingleFFOrSafariStack, parseSingleStack, parseSingleV8Stack, parseStacktrace };
export type { EachMapping, SourceMapInput, StackTraceParserOptions };


export interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
}

export interface RawSourceMap extends StartOfSourceMap {
    version: string;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}

export interface Position {
    line: number;
    column: number;
}

export interface LineRange extends Position {
    lastColumn: number;
}

export interface FindPosition extends Position {
    // SourceMapConsumer.GREATEST_LOWER_BOUND or SourceMapConsumer.LEAST_UPPER_BOUND
    bias?: number;
}

export interface SourceFindPosition extends FindPosition {
    source: string;
}

export interface MappedPosition extends Position {
    source: string;
    name?: string;
}

export interface MappingItem {
    source: string | null;
    generatedLine: number;
    generatedColumn: number;
    originalLine: number | null;
    originalColumn: number | null;
    name: string | null;
}

export class SourceMapConsumer {
    static GENERATED_ORDER: number;
    static ORIGINAL_ORDER: number;

    static GREATEST_LOWER_BOUND: number;
    static LEAST_UPPER_BOUND: number;

    constructor(rawSourceMap: RawSourceMap);
    readonly file: string | undefined | null;
    readonly sourceRoot: string | undefined | null;
    readonly sourcesContent: readonly string[] | null | undefined;
    readonly sources: readonly string[]

    computeColumnSpans(): void;
    originalPositionFor(generatedPosition: FindPosition): MappedPosition;
    generatedPositionFor(originalPosition: SourceFindPosition): LineRange;
    allGeneratedPositionsFor(originalPosition: MappedPosition): Position[];
    hasContentsOfAllSources(): boolean;
    sourceContentFor(source: string, returnNullOnMissing?: boolean): string | null;
    eachMapping(callback: (mapping: MappingItem) => void, context?: any, order?: number): void;
}

export interface Mapping {
    generated: Position;
    original?: Position | null;
    source?: string | null;
    name?: string | null;
}

export class SourceMapGenerator {
    constructor(startOfSourceMap?: StartOfSourceMap);
    static fromSourceMap(sourceMapConsumer: SourceMapConsumer, startOfSourceMap?: StartOfSourceMap): SourceMapGenerator;
    addMapping(mapping: Mapping): void;
    setSourceContent(sourceFile: string, sourceContent: string | null | undefined): void;
    applySourceMap(sourceMapConsumer: SourceMapConsumer, sourceFile?: string, sourceMapPath?: string): void;
    toString(): string;
    toJSON(): RawSourceMap;
}

export interface CodeWithSourceMap {
    code: string;
    map: SourceMapGenerator;
}

export class SourceNode {
    constructor();
    constructor(line: number, column: number, source: string);
    constructor(line: number, column: number, source: string, chunk?: string, name?: string);
    static fromStringWithSourceMap(code: string, sourceMapConsumer: SourceMapConsumer, relativePath?: string): SourceNode;
    add(chunk: string): void;
    prepend(chunk: string): void;
    setSourceContent(sourceFile: string, sourceContent: string): void;
    walk(fn: (chunk: string, mapping: MappedPosition) => void): void;
    walkSourceContents(fn: (file: string, content: string) => void): void;
    join(sep: string): SourceNode;
    replaceRight(pattern: string, replacement: string): SourceNode;
    toString(): string;
    toStringWithSourceMap(startOfSourceMap?: StartOfSourceMap): CodeWithSourceMap;
}


import { TransformResult } from 'vite';
import { E as EncodedSourceMap } from './trace-mapping.d-DLVdEqOp.js';

interface InstallSourceMapSupportOptions {
	getSourceMap: (source: string) => EncodedSourceMap | null | undefined;
}
declare function withInlineSourcemap(result: TransformResult, options: {
	root: string
	filepath: string
	noFirstLineMapping?: boolean
}): TransformResult;
declare function extractSourceMap(code: string): EncodedSourceMap | null;
declare function installSourcemapsSupport(options: InstallSourceMapSupportOptions): void;

export { extractSourceMap, installSourcemapsSupport, withInlineSourcemap };


import { ErrorWithDiff, ParsedStack } from './types.js';

type GeneratedColumn = number;
type SourcesIndex = number;
type SourceLine = number;
type SourceColumn = number;
type NamesIndex = number;
type SourceMapSegment = [GeneratedColumn] | [GeneratedColumn, SourcesIndex, SourceLine, SourceColumn] | [GeneratedColumn, SourcesIndex, SourceLine, SourceColumn, NamesIndex];

interface SourceMapV3 {
    file?: string | null;
    names: string[];
    sourceRoot?: string;
    sources: (string | null)[];
    sourcesContent?: (string | null)[];
    version: 3;
    ignoreList?: number[];
}
interface EncodedSourceMap extends SourceMapV3 {
    mappings: string;
}
interface DecodedSourceMap extends SourceMapV3 {
    mappings: SourceMapSegment[][];
}
type OriginalMapping = {
    source: string | null;
    line: number;
    column: number;
    name: string | null;
};
type InvalidOriginalMapping = {
    source: null;
    line: null;
    column: null;
    name: null;
};
type GeneratedMapping = {
    line: number;
    column: number;
};
type InvalidGeneratedMapping = {
    line: null;
    column: null;
};
type Bias = typeof GREATEST_LOWER_BOUND | typeof LEAST_UPPER_BOUND;
type XInput = {
    x_google_ignoreList?: SourceMapV3['ignoreList'];
};
type EncodedSourceMapXInput = EncodedSourceMap & XInput;
type DecodedSourceMapXInput = DecodedSourceMap & XInput;
type SourceMapInput = string | EncodedSourceMapXInput | DecodedSourceMapXInput | TraceMap;
type Needle = {
    line: number;
    column: number;
    bias?: Bias;
};
type SourceNeedle = {
    source: string;
    line: number;
    column: number;
    bias?: Bias;
};
type EachMapping = {
    generatedLine: number;
    generatedColumn: number;
    source: null;
    originalLine: null;
    originalColumn: null;
    name: null;
} | {
    generatedLine: number;
    generatedColumn: number;
    source: string | null;
    originalLine: number;
    originalColumn: number;
    name: string | null;
};
declare abstract class SourceMap {
    version: SourceMapV3['version'];
    file: SourceMapV3['file'];
    names: SourceMapV3['names'];
    sourceRoot: SourceMapV3['sourceRoot'];
    sources: SourceMapV3['sources'];
    sourcesContent: SourceMapV3['sourcesContent'];
    resolvedSources: SourceMapV3['sources'];
    ignoreList: SourceMapV3['ignoreList'];
}

declare const LEAST_UPPER_BOUND = -1;
declare const GREATEST_LOWER_BOUND = 1;

declare class TraceMap implements SourceMap {
    version: SourceMapV3['version'];
    file: SourceMapV3['file'];
    names: SourceMapV3['names'];
    sourceRoot: SourceMapV3['sourceRoot'];
    sources: SourceMapV3['sources'];
    sourcesContent: SourceMapV3['sourcesContent'];
    ignoreList: SourceMapV3['ignoreList'];
    resolvedSources: string[];
    private _encoded;
    private _decoded;
    private _decodedMemo;
    private _bySources;
    private _bySourceMemos;
    constructor(map: SourceMapInput, mapUrl?: string | null);
}
/**
 * A higher-level API to find the source/line/column associated with a generated line/column
 * (think, from a stack trace). Line is 1-based, but column is 0-based, due to legacy behavior in
 * `source-map` library.
 */
declare function originalPositionFor(map: TraceMap, needle: Needle): OriginalMapping | InvalidOriginalMapping;
/**
 * Finds the generated line/column position of the provided source/line/column source position.
 */
declare function generatedPositionFor(map: TraceMap, needle: SourceNeedle): GeneratedMapping | InvalidGeneratedMapping;
/**
 * Iterates each mapping in generated position order.
 */
declare function eachMapping(map: TraceMap, cb: (mapping: EachMapping) => void): void;

interface StackTraceParserOptions {
	ignoreStackEntries?: (RegExp | string)[];
	getSourceMap?: (file: string) => unknown;
	getUrlId?: (id: string) => string;
	frameFilter?: (error: ErrorWithDiff, frame: ParsedStack) => boolean | void;
}
declare function parseSingleFFOrSafariStack(raw: string): ParsedStack | null;
declare function parseSingleStack(raw: string): ParsedStack | null;
// Based on https://github.com/stacktracejs/error-stack-parser
// Credit to stacktracejs
declare function parseSingleV8Stack(raw: string): ParsedStack | null;
declare function createStackString(stacks: ParsedStack[]): string;
declare function parseStacktrace(stack: string, options?: StackTraceParserOptions): ParsedStack[];
declare function parseErrorStacktrace(e: ErrorWithDiff, options?: StackTraceParserOptions): ParsedStack[];

export { TraceMap, createStackString, eachMapping, generatedPositionFor, originalPositionFor, parseErrorStacktrace, parseSingleFFOrSafariStack, parseSingleStack, parseSingleV8Stack, parseStacktrace };
export type { EachMapping, SourceMapInput, StackTraceParserOptions };


export interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
}

export interface RawSourceMap extends StartOfSourceMap {
    version: string;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}

export interface Position {
    line: number;
    column: number;
}

export interface LineRange extends Position {
    lastColumn: number;
}

export interface FindPosition extends Position {
    // SourceMapConsumer.GREATEST_LOWER_BOUND or SourceMapConsumer.LEAST_UPPER_BOUND
    bias?: number;
}

export interface SourceFindPosition extends FindPosition {
    source: string;
}

export interface MappedPosition extends Position {
    source: string;
    name?: string;
}

export interface MappingItem {
    source: string | null;
    generatedLine: number;
    generatedColumn: number;
    originalLine: number | null;
    originalColumn: number | null;
    name: string | null;
}

export class SourceMapConsumer {
    static GENERATED_ORDER: number;
    static ORIGINAL_ORDER: number;

    static GREATEST_LOWER_BOUND: number;
    static LEAST_UPPER_BOUND: number;

    constructor(rawSourceMap: RawSourceMap);
    readonly file: string | undefined | null;
    readonly sourceRoot: string | undefined | null;
    readonly sourcesContent: readonly string[] | null | undefined;
    readonly sources: readonly string[]

    computeColumnSpans(): void;
    originalPositionFor(generatedPosition: FindPosition): MappedPosition;
    generatedPositionFor(originalPosition: SourceFindPosition): LineRange;
    allGeneratedPositionsFor(originalPosition: MappedPosition): Position[];
    hasContentsOfAllSources(): boolean;
    sourceContentFor(source: string, returnNullOnMissing?: boolean): string | null;
    eachMapping(callback: (mapping: MappingItem) => void, context?: any, order?: number): void;
}

export interface Mapping {
    generated: Position;
    original?: Position | null;
    source?: string | null;
    name?: string | null;
}

export class SourceMapGenerator {
    constructor(startOfSourceMap?: StartOfSourceMap);
    static fromSourceMap(sourceMapConsumer: SourceMapConsumer, startOfSourceMap?: StartOfSourceMap): SourceMapGenerator;
    addMapping(mapping: Mapping): void;
    setSourceContent(sourceFile: string, sourceContent: string | null | undefined): void;
    applySourceMap(sourceMapConsumer: SourceMapConsumer, sourceFile?: string, sourceMapPath?: string): void;
    toString(): string;
    toJSON(): RawSourceMap;
}

export interface CodeWithSourceMap {
    code: string;
    map: SourceMapGenerator;
}

export class SourceNode {
    constructor();
    constructor(line: number, column: number, source: string);
    constructor(line: number, column: number, source: string, chunk?: string, name?: string);
    static fromStringWithSourceMap(code: string, sourceMapConsumer: SourceMapConsumer, relativePath?: string): SourceNode;
    add(chunk: string): void;
    prepend(chunk: string): void;
    setSourceContent(sourceFile: string, sourceContent: string): void;
    walk(fn: (chunk: string, mapping: MappedPosition) => void): void;
    walkSourceContents(fn: (file: string, content: string) => void): void;
    join(sep: string): SourceNode;
    replaceRight(pattern: string, replacement: string): SourceNode;
    toString(): string;
    toStringWithSourceMap(startOfSourceMap?: StartOfSourceMap): CodeWithSourceMap;
}


import { TransformResult } from 'vite';
import { E as EncodedSourceMap } from './trace-mapping.d-DLVdEqOp.js';

interface InstallSourceMapSupportOptions {
	getSourceMap: (source: string) => EncodedSourceMap | null | undefined;
}
declare function withInlineSourcemap(result: TransformResult, options: {
	root: string
	filepath: string
	noFirstLineMapping?: boolean
}): TransformResult;
declare function extractSourceMap(code: string): EncodedSourceMap | null;
declare function installSourcemapsSupport(options: InstallSourceMapSupportOptions): void;

export { extractSourceMap, installSourcemapsSupport, withInlineSourcemap };
