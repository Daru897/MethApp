import type { CryptoKey } from './types';
/**
 * Derives a KDF key from the user PIN using Argon2id (preferred) or PBKDF2 fallback.
 * Outputs a 256-bit AES-GCM key.
 * @param pin - User PIN (non-empty string)
 * @returns Promise<CryptoKey> - AES-GCM key for encrypt/decrypt
 * @throws TypeError - Invalid pin
 */
export declare function deriveKdfKey(pin: string): Promise<CryptoKey>;
//# sourceMappingURL=kdf.d.ts.map