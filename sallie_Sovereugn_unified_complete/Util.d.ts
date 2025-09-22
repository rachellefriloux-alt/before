import type { ZodSchema, ZodTypeDef } from 'zod';
export declare const zodDef: (zodSchema: ZodSchema | ZodTypeDef) => ZodTypeDef;
export declare function isEmptyObj(obj: Object | null | undefined): boolean;
//# sourceMappingURL=util.d.ts.map

import type { ZodSchema, ZodTypeDef } from 'zod';
export declare const zodDef: (zodSchema: ZodSchema | ZodTypeDef) => ZodTypeDef;
export declare function isEmptyObj(obj: Object | null | undefined): boolean;
//# sourceMappingURL=util.d.ts.map

export declare function merge(...sets: Array<string>): string;
export declare function subexp(str: string): string;
export declare function typeOf(o: any): string;
export declare function toUpperCase(str: string): string;
export declare function toArray(obj: any): Array<any>;
export declare function assign(target: object, source: any): any;
