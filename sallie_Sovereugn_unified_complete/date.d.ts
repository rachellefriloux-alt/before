import type { Options } from './types.js';
export default function inspectDate(dateObject: Date, options: Options): string;
//# sourceMappingURL=date.d.ts.map

import { ZodDateDef } from 'zod';
import { Refs } from "../Refs.js";
import { ErrorMessages } from "../errorMessages.js";
import { JsonSchema7NumberType } from "./number.js";
import { DateStrategy } from "../Options.js";
export type JsonSchema7DateType = {
    type: 'integer' | 'string';
    format: 'unix-time' | 'date-time' | 'date';
    minimum?: number;
    maximum?: number;
    errorMessage?: ErrorMessages<JsonSchema7NumberType>;
} | {
    anyOf: JsonSchema7DateType[];
};
export declare function parseDateDef(def: ZodDateDef, refs: Refs, overrideDateStrategy?: DateStrategy): JsonSchema7DateType;
//# sourceMappingURL=date.d.ts.map

import type { Options } from './types.js';
export default function inspectDate(dateObject: Date, options: Options): string;
//# sourceMappingURL=date.d.ts.map

import { ZodDateDef } from 'zod';
import { Refs } from "../Refs.js";
import { ErrorMessages } from "../errorMessages.js";
import { JsonSchema7NumberType } from "./number.js";
import { DateStrategy } from "../Options.js";
export type JsonSchema7DateType = {
    type: 'integer' | 'string';
    format: 'unix-time' | 'date-time' | 'date';
    minimum?: number;
    maximum?: number;
    errorMessage?: ErrorMessages<JsonSchema7NumberType>;
} | {
    anyOf: JsonSchema7DateType[];
};
export declare function parseDateDef(def: ZodDateDef, refs: Refs, overrideDateStrategy?: DateStrategy): JsonSchema7DateType;
//# sourceMappingURL=date.d.ts.map