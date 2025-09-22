import type { Options } from './types.js';
export default function inspectNumber(number: number, options: Options): string;
//# sourceMappingURL=number.d.ts.map

import { ZodNumberDef } from 'zod';
import { ErrorMessages } from "../errorMessages.js";
import { Refs } from "../Refs.js";
export type JsonSchema7NumberType = {
    type: 'number' | 'integer';
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
    errorMessage?: ErrorMessages<JsonSchema7NumberType>;
};
export declare function parseNumberDef(def: ZodNumberDef, refs: Refs): JsonSchema7NumberType;
//# sourceMappingURL=number.d.ts.map

import type { Options } from './types.js';
export default function inspectNumber(number: number, options: Options): string;
//# sourceMappingURL=number.d.ts.map

import { ZodNumberDef } from 'zod';
import { ErrorMessages } from "../errorMessages.js";
import { Refs } from "../Refs.js";
export type JsonSchema7NumberType = {
    type: 'number' | 'integer';
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
    errorMessage?: ErrorMessages<JsonSchema7NumberType>;
};
export declare function parseNumberDef(def: ZodNumberDef, refs: Refs): JsonSchema7NumberType;
//# sourceMappingURL=number.d.ts.map