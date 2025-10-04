import { webcrypto } from 'crypto';
import type { CryptoKey } from './types';

import { randomBytes, assertIsCryptoKey, toUint8Array } from './util';

const subtle = webcrypto.subtle;
const IV_LEN = 12;

/**
 * Encrypts plaintext using AES-GCM.
 * @param dataKey - AES-GCM key
 * @param plaintext - Data to encrypt (Uint8Array or ArrayBuffer)
 * @param associatedData - Optional AAD (Uint8Array)
 * @returns Promise<{ iv: Uint8Array; ct: ArrayBuffer }> - IV and ciphertext
 * @throws TypeError - Invalid arguments
 */
export async function encrypt(
  dataKey: CryptoKey,
  plaintext: Uint8Array | ArrayBuffer,
  associatedData?: Uint8Array
): Promise<{ iv: Uint8Array; ct: ArrayBuffer }> {
  assertIsCryptoKey(dataKey, 'encrypt');
  const pt = toUint8Array(plaintext);
  if (pt.length === 0) {
    throw new TypeError('Plaintext must not be empty');
  }

  const iv = randomBytes(IV_LEN);
  const ad = associatedData && associatedData.length > 0 ? associatedData : undefined;
  const ct = await subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: ad },
    dataKey,
    pt
  );

  return { iv, ct };
}

/**
 * Decrypts ciphertext using AES-GCM.
 * Throws on authentication failure (tamper detection).
 * @param dataKey - AES-GCM key
 * @param payload - { iv: Uint8Array; ct: ArrayBuffer }
 * @param associatedData - Optional AAD (must match encrypt)
 * @returns Promise<Uint8Array> - Decrypted plaintext
 * @throws TypeError - Invalid arguments
 * @throws OperationError - Decryption/auth failure
 */
export async function decrypt(
  dataKey: CryptoKey,
  payload: { iv: Uint8Array; ct: ArrayBuffer },
  associatedData?: Uint8Array
): Promise<Uint8Array> {
  assertIsCryptoKey(dataKey, 'decrypt');
  if (!payload.iv || !(payload.iv instanceof Uint8Array) || payload.iv.length !== IV_LEN) {
    throw new TypeError('Invalid IV');
  }
  if (!(payload.ct instanceof ArrayBuffer) || payload.ct.byteLength === 0) {
    throw new TypeError('Invalid ciphertext');
  }

  const ad = associatedData && associatedData.length > 0 ? associatedData : undefined;
  const decrypted = await subtle.decrypt(
    { name: 'AES-GCM', iv: payload.iv, additionalData: ad },
    dataKey,
    payload.ct
  );

  return new Uint8Array(decrypted);
}