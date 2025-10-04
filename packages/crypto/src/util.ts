import { webcrypto } from 'crypto';
import type { CryptoKey } from './types';

const crypto = webcrypto;

/**
 * Generates random bytes.
 * @param len - Number of bytes
 * @returns Uint8Array
 */
export function randomBytes(len: number): Uint8Array {
  if (len < 1 || !Number.isInteger(len)) {
    throw new TypeError('Length must be positive integer');
  }
  return crypto.getRandomValues(new Uint8Array(len));
}

/**
 * Concatenates multiple Uint8Array or ArrayBuffer into one ArrayBuffer.
 * @param buffers - Buffers to concat
 * @returns ArrayBuffer
 */
export function concatBuffers(...buffers: (Uint8Array | ArrayBuffer)[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + (buf instanceof Uint8Array ? buf.length : buf.byteLength), 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    if (buffer instanceof Uint8Array) {
      result.set(buffer, offset);
      offset += buffer.length;
    } else {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
  }
  return result.buffer;
}

/**
 * Converts to Uint8Array.
 * @param input - Uint8Array or ArrayBuffer
 * @returns Uint8Array
 */
export function toUint8Array(input: Uint8Array | ArrayBuffer): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

/**
 * Asserts input is a valid CryptoKey for AES-GCM with required usages.
 * @param key - Key to check
 * @param requiredUsages - Required usages (string or array)
 * @throws TypeError - Invalid key
 */
export function assertIsCryptoKey(key: CryptoKey, requiredUsages: string | string[]): void {
  if (typeof key !== 'object' || key === null || key.constructor.name !== 'CryptoKey') {
    throw new TypeError('Key must be a CryptoKey');
  }
  if (key.algorithm.name !== 'AES-GCM') {
    throw new TypeError('Key must be AES-GCM');
  }
  if (key.type !== 'secret') {
    throw new TypeError('Key must be secret');
  }
  const usages: KeyUsage[] = Array.isArray(requiredUsages) ? requiredUsages as KeyUsage[] : [requiredUsages as KeyUsage];
  for (const usage of usages) {
    if (!key.usages.includes(usage)) {
      throw new TypeError(`Key missing usage: ${usage}`);
    }
  }
}