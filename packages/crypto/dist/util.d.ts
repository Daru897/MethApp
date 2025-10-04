import type { CryptoKey } from './types';
/**
 * Generates random bytes.
 * @param len - Number of bytes
 * @returns Uint8Array
 */
export declare function randomBytes(len: number): Uint8Array;
/**
 * Concatenates multiple Uint8Array or ArrayBuffer into one ArrayBuffer.
 * @param buffers - Buffers to concat
 * @returns ArrayBuffer
 */
export declare function concatBuffers(...buffers: (Uint8Array | ArrayBuffer)[]): ArrayBuffer;
/**
 * Converts to Uint8Array.
 * @param input - Uint8Array or ArrayBuffer
 * @returns Uint8Array
 */
export declare function toUint8Array(input: Uint8Array | ArrayBuffer): Uint8Array;
/**
 * Asserts input is a valid CryptoKey for AES-GCM with required usages.
 * @param key - Key to check
 * @param requiredUsages - Required usages (string or array)
 * @throws TypeError - Invalid key
 */
export declare function assertIsCryptoKey(key: CryptoKey, requiredUsages: string | string[]): void;
//# sourceMappingURL=util.d.ts.map