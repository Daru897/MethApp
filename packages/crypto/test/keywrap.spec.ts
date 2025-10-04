import { describe, it, expect, vi } from 'vitest';
import { webcrypto } from 'crypto';
import { deriveKdfKey } from '../src/kdf';
import { wrapKey, unwrapKey } from '../src/keywrap';

const subtle = webcrypto.subtle;
const TEST_PIN = '123456';

describe('keywrap', () => {
  it('wraps and unwraps a device key successfully', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    const deviceKey = await subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const originalRaw = await subtle.exportKey('raw', deviceKey);
    const wrapped = await wrapKey(kdfKey, deviceKey);
    expect(wrapped).toBeInstanceOf(ArrayBuffer);
    expect(wrapped.byteLength).toBeGreaterThan(40); // version + lens + salt + iv + min ct

    const unwrapped = await unwrapKey(kdfKey, wrapped);
    const unwrappedRaw = await subtle.exportKey('raw', unwrapped);

    expect(unwrappedRaw).toEqual(originalRaw);
    expect(unwrapped.algorithm.name).toBe('AES-GCM');
    expect(unwrapped.usages).toEqual(['encrypt', 'decrypt']);
  });

  it('detects tamper in wrapped payload (ciphertext)', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    const deviceKey = await subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const wrapped = await wrapKey(kdfKey, deviceKey);
    const tampered = new Uint8Array(wrapped);
    // Tamper in ct (last byte)
    tampered[tampered.length - 1] ^= 0x01;

    await expect(unwrapKey(kdfKey, tampered.buffer)).rejects.toThrow();
  });

  it('detects tamper in wrapped payload (IV)', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    const deviceKey = await subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const wrapped = await wrapKey(kdfKey, deviceKey);
    const tampered = new Uint8Array(wrapped);
    // Tamper in iv (position after salt + lens)
    const ivPos = 1 + 1 + 12 + 1; // version + saltLen + salt + ivLen
    tampered[ivPos] ^= 0x01;

    await expect(unwrapKey(kdfKey, tampered.buffer)).rejects.toThrow();
  });

  it('throws TypeError for invalid kdfKey', async () => {
    const deviceKey = await subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    await expect(wrapKey({} as any, deviceKey)).rejects.toThrow(TypeError);
    await expect(unwrapKey({} as any, new ArrayBuffer(50))).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid deviceKey', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    await expect(wrapKey(kdfKey, {} as any)).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid wrapped payload (too short)', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    await expect(unwrapKey(kdfKey, new ArrayBuffer(10))).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid wrapped payload (wrong version)', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    const invalidWrapped = new ArrayBuffer(50); // Minimal size
    const view = new DataView(invalidWrapped);
    view.setUint8(0, 0x02); // Wrong version
    await expect(unwrapKey(kdfKey, invalidWrapped)).rejects.toThrow(TypeError);
  });

  it('throws TypeError for invalid wrapped payload (wrong salt len)', async () => {
    const kdfKey = await deriveKdfKey(TEST_PIN);
    // Simulate payload with wrong saltLen
    const payload = new Uint8Array(1 + 1 + 13 + 1 + 12 + 32); // Wrong salt len 13 but skip 13
    const view = new DataView(payload.buffer);
    view.setUint8(0, 0x01);
    view.setUint8(1, 13); // saltLen=13
    view.setUint8(1 + 1 + 13 + 1, 12); // ivLen=12
    await expect(unwrapKey(kdfKey, payload.buffer)).rejects.toThrow(TypeError);
  });
});