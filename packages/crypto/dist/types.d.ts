/**
 * Type declarations for Web Crypto API types.
 * These are global in Node.js with @types/node and "dom" lib, but explicitly re-exported for clarity.
 *
 * IMPORTANT: Do NOT attempt to import `CryptoKey` from 'node:crypto' — that module does not export the type.
 * The correct type is available as the global `CryptoKey` when "dom" lib is enabled in tsconfig.
 */
export type CryptoKey = globalThis.CryptoKey;
//# sourceMappingURL=types.d.ts.map