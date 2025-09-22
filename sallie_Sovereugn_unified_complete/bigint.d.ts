import type { Options } from './types.js';
export default function inspectBigInt(number: bigint, options: Options): string;
//# sourceMappingURL=bigint.d.ts.map

import { ZodBigIntDef } from 'zod';
import { Refs } from "../Refs.js";
import { ErrorMessages } from "../errorMessages.js";
export type JsonSchema7BigintType = {
    type: 'integer';
    format: 'int64';
    minimum?: BigInt;
    exclusiveMinimum?: BigInt;
    maximum?: BigInt;
    exclusiveMaximum?: BigInt;
    multipleOf?: BigInt;
    errorMessage?: ErrorMessages<JsonSchema7BigintType>;
};
export declare function parseBigintDef(def: ZodBigIntDef, refs: Refs): JsonSchema7BigintType;
//# sourceMappingURL=bigint.d.ts.map

import type { Options } from './types.js';
export default function inspectBigInt(number: bigint, options: Options): string;
//# sourceMappingURL=bigint.d.ts.map

import { ZodBigIntDef } from 'zod';
import { Refs } from "../Refs.js";
import { ErrorMessages } from "../errorMessages.js";
export type JsonSchema7BigintType = {
    type: 'integer';
    format: 'int64';
    minimum?: BigInt;
    exclusiveMinimum?: BigInt;
    maximum?: BigInt;
    exclusiveMaximum?: BigInt;
    multipleOf?: BigInt;
    errorMessage?: ErrorMessages<JsonSchema7BigintType>;
};
export declare function parseBigintDef(def: ZodBigIntDef, refs: Refs): JsonSchema7BigintType;
//# sourceMappingURL=bigint.d.ts.map