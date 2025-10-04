import { describe, it, expect, beforeEach } from 'vitest';
import { webcrypto } from 'crypto';
import { encrypt, decrypt } from '../src/aes';
import { generateKey as subtleGenerateKey } from '../src/util'; // Wait, no, use subtle

const subtle = webcrypto.subtle;
const TEST_PLAINTEXT = new TextEncoder().encode('test plaintext');
const TEST_AD = new TextEncoder().encode('associated data');

describe('aes', () => {
  let testKey: CryptoKey;

  beforeEach(async () => {
    testKey = await subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  });

  it('encrypts and decrypts without AAD', async () => {
    const { iv, ct } = await encrypt(testKey, TEST_PLAINTEXT);
    expect(iv).toBeInstanceOf(Uint8Array);
    expect(iv.length).toBe(12);
    expect(ct).toBeInstanceOf(ArrayBuffer);
    expect(ct.byteLength).toBeGreaterThan(16); // ct + tag

    const decrypted = await decrypt(testKey, { iv, ct });
    expect(decrypted).toEqual(TEST_PLAINTEXT);
  });

  it('encrypts and decrypts with AAD', async () => {
    const { iv, ct } = await encrypt(testKey, TEST_PLAINTEXT, TEST_AD);
    const decrypted = await decrypt(testKey, { iv, ct }, TEST_AD);
    expect(decrypted).toEqual(TEST_PLAINTEXT);
  });

  it('mismatching AAD causes decrypt failure', async () => {
    const { iv, ct } = await encrypt(testKey, TEST_PLAINTEXT, TEST_AD);
    await expect(decrypt(testKey, { iv, ct })).rejects.toThrow(); // No AAD
  });

  it('detects tamper in ciphertext', async () => {
    const { iv, ct } = await encrypt(testKey, TEST_PLAINTEXT);
    const tamperedCt = new Uint8Array(ct);
    tamperedCt[tamperedCt.length - 1] ^= 0x01; // Tamper tag
    await expect(decrypt(testKey, { iv, ct: tamperedCt.buffer })).rejects.toThrow();
  });

  it('detects tamper in IV', async () => {
    const { iv, ct } = await encrypt(testKey, TEST_PLAINTEXT);
    const tamperedIv = new Uint8Array(iv);
    tamperedIv[0] ^= 0x01;
    await expect(decrypt(testKey, { iv: tamperedIv, ct })).rejects.toThrow();
  });

  it('throws TypeError for invalid dataKey', async () => {
    await expect(encrypt({} as any, TEST_PLAINTEXT)).rejects.toThrow(TypeError);
    await expect(decrypt({} as any, { iv: new Uint8Array(12), ct: new ArrayBuffer(32) })).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid plaintext', async () => {
    await expect(encrypt(testKey, new Uint8Array(0))).rejects.toThrow(TypeError);
    await expect(encrypt(testKey, {} as any)).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid payload', async () => {
    await expect(decrypt(testKey, { iv: new Uint8Array(11), ct: new ArrayBuffer(32) })).rejects.toThrow(TypeError); // Wrong IV len
    await expect(decrypt(testKey, { iv: new Uint8Array(12), ct: new ArrayBuffer(0) })).rejects.toThrow(TypeError);
    await expect(decrypt(testKey, { iv: {} as any, ct: new ArrayBuffer(32) })).rejects.toThrow(TypeError);
  });
});