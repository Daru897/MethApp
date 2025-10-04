import { webcrypto } from 'crypto';
import { randomBytes, concatBuffers, assertIsCryptoKey } from './util';
const subtle = webcrypto.subtle;
const VERSION = 0x01;
const SALT_LEN = 12;
const IV_LEN = 12;
const DEFAULT_SALT = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44]);
/**
 * Wraps a device key using the KDF key with AES-GCM.
 * Produces a binary wrapped payload including version, salt, IV, and ciphertext.
 * @param kdfKey - AES-GCM key derived from PIN
 * @param deviceKey - AES-GCM device key to wrap (must be extractable)
 * @returns Promise<ArrayBuffer> - Wrapped device key binary
 * @throws TypeError - Invalid arguments
 * @throws Error - Crypto operation failure
 */
export async function wrapKey(kdfKey, deviceKey) {
    assertIsCryptoKey(kdfKey, 'encrypt');
    assertIsCryptoKey(deviceKey, []); // No specific usage, but must be exportable
    const rawBytes = await subtle.exportKey('raw', deviceKey);
    const iv = randomBytes(IV_LEN);
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array() }, kdfKey, rawBytes);
    const payload = concatBuffers(new Uint8Array([VERSION]), new Uint8Array([SALT_LEN]), DEFAULT_SALT, new Uint8Array([IV_LEN]), iv, new Uint8Array(ct));
    return payload;
}
/**
 * Unwraps the device key from the wrapped binary payload using the KDF key.
 * @param kdfKey - AES-GCM key derived from PIN (must match wrap)
 * @param wrappedDeviceKey - Binary wrapped payload
 * @returns Promise<CryptoKey> - Unwrapped AES-GCM device key
 * @throws TypeError - Invalid arguments or format
 * @throws OperationError - Decryption failure (tamper/auth)
 */
export async function unwrapKey(kdfKey, wrappedDeviceKey) {
    assertIsCryptoKey(kdfKey, 'decrypt');
    if (!(wrappedDeviceKey instanceof ArrayBuffer) || wrappedDeviceKey.byteLength < 1 + 1 + SALT_LEN + 1 + IV_LEN) {
        throw new TypeError('Invalid wrapped payload');
    }
    const view = new DataView(wrappedDeviceKey);
    let pos = 0;
    const version = view.getUint8(pos++);
    if (version !== VERSION) {
        throw new TypeError(`Unsupported version: ${version}`);
    }
    const saltLen = view.getUint8(pos++);
    if (saltLen !== SALT_LEN) {
        throw new TypeError(`Unexpected salt length: ${saltLen}`);
    }
    // Skip salt (not used here, but validated)
    pos += saltLen;
    const ivLen = view.getUint8(pos++);
    if (ivLen !== IV_LEN) {
        throw new TypeError(`Unexpected IV length: ${ivLen}`);
    }
    const iv = new Uint8Array(wrappedDeviceKey, pos, ivLen);
    pos += ivLen;
    const ct = wrappedDeviceKey.slice(pos);
    const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array() }, kdfKey, ct);
    const deviceKey = await subtle.importKey('raw', decrypted, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
    return deviceKey;
}
//# sourceMappingURL=keywrap.js.map