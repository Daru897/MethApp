import type { CryptoKey } from './types';
/**
 * Encrypts plaintext using AES-GCM.
 * @param dataKey - AES-GCM key
 * @param plaintext - Data to encrypt (Uint8Array or ArrayBuffer)
 * @param associatedData - Optional AAD (Uint8Array)
 * @returns Promise<{ iv: Uint8Array; ct: ArrayBuffer }> - IV and ciphertext
 * @throws TypeError - Invalid arguments
 */
export declare function encrypt(dataKey: CryptoKey, plaintext: Uint8Array | ArrayBuffer, associatedData?: Uint8Array): Promise<{
    iv: Uint8Array;
    ct: ArrayBuffer;
}>;
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
export declare function decrypt(dataKey: CryptoKey, payload: {
    iv: Uint8Array;
    ct: ArrayBuffer;
}, associatedData?: Uint8Array): Promise<Uint8Array>;
//# sourceMappingURL=aes.d.ts.map