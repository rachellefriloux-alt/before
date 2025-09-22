declare function setDunderProto<P extends null | object>(target: {}, proto: P): P;

declare const x: false | typeof setDunderProto;

export = x;

import type { Options } from './types.js';
export default function inspectSet(set: Set<unknown>, options: Options): string;
//# sourceMappingURL=set.d.ts.map

import { ZodSetDef } from 'zod';
import { ErrorMessages } from "../errorMessages.js";
import { JsonSchema7Type } from "../parseDef.js";
import { Refs } from "../Refs.js";
export type JsonSchema7SetType = {
    type: 'array';
    uniqueItems: true;
    items?: JsonSchema7Type | undefined;
    minItems?: number;
    maxItems?: number;
    errorMessage?: ErrorMessages<JsonSchema7SetType>;
};
export declare function parseSetDef(def: ZodSetDef, refs: Refs): JsonSchema7SetType;
//# sourceMappingURL=set.d.ts.map

declare function setDunderProto<P extends null | object>(target: {}, proto: P): P;

declare const x: false | typeof setDunderProto;

export = x;

import type { Options } from './types.js';
export default function inspectSet(set: Set<unknown>, options: Options): string;
//# sourceMappingURL=set.d.ts.map

import { ZodSetDef } from 'zod';
import { ErrorMessages } from "../errorMessages.js";
import { JsonSchema7Type } from "../parseDef.js";
import { Refs } from "../Refs.js";
export type JsonSchema7SetType = {
    type: 'array';
    uniqueItems: true;
    items?: JsonSchema7Type | undefined;
    minItems?: number;
    maxItems?: number;
    errorMessage?: ErrorMessages<JsonSchema7SetType>;
};
export declare function parseSetDef(def: ZodSetDef, refs: Refs): JsonSchema7SetType;
//# sourceMappingURL=set.d.ts.map