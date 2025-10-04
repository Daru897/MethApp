import type { CryptoKey } from './types';
/**
 * Wraps a device key using the KDF key with AES-GCM.
 * Produces a binary wrapped payload including version, salt, IV, and ciphertext.
 * @param kdfKey - AES-GCM key derived from PIN
 * @param deviceKey - AES-GCM device key to wrap (must be extractable)
 * @returns Promise<ArrayBuffer> - Wrapped device key binary
 * @throws TypeError - Invalid arguments
 * @throws Error - Crypto operation failure
 */
export declare function wrapKey(kdfKey: CryptoKey, deviceKey: CryptoKey): Promise<ArrayBuffer>;
/**
 * Unwraps the device key from the wrapped binary payload using the KDF key.
 * @param kdfKey - AES-GCM key derived from PIN (must match wrap)
 * @param wrappedDeviceKey - Binary wrapped payload
 * @returns Promise<CryptoKey> - Unwrapped AES-GCM device key
 * @throws TypeError - Invalid arguments or format
 * @throws OperationError - Decryption failure (tamper/auth)
 */
export declare function unwrapKey(kdfKey: CryptoKey, wrappedDeviceKey: ArrayBuffer): Promise<CryptoKey>;
//# sourceMappingURL=keywrap.d.ts.map