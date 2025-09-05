// TypeScript shim for JS implementation.
// The original implementation exists in index.js alongside this file.
// We re-export with loose typing to keep TS builds green until full typing is added.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export * from './index.js';

// Provide a default export if the JS module has one, to avoid interop issues.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import def from './index.js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultExport: any = def;
// eslint-disable-next-line import/no-default-export
export default defaultExport;




