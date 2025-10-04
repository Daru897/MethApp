import { webcrypto } from 'crypto';
import type { CryptoKey } from './types';

const subtle = webcrypto.subtle;

const DEFAULT_SALT = new Uint8Array([
  0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44
]); // 12 bytes; for production use per-user random salts and store them with wrapped payload

const DEFAULT_ARGON_TIME_COST = parseInt(process.env.ARGON_TIME_COST || '3', 10);
const DEFAULT_ARGON_MEMORY_COST = parseInt(process.env.ARGON_MEMORY_COST || '65536', 10); // 64 MiB
const DEFAULT_ARGON_PARALLELISM = parseInt(process.env.ARGON_PARALLELISM || '1', 10);
const DEFAULT_PBKDF2_ITERATIONS = parseInt(process.env.PBKDF2_ITERATIONS || '200000', 10);

/**
 * Safe runtime normalization: take any value (Buffer, ArrayBuffer, SharedArrayBuffer,
 * TypedArray, DataView, etc.) and return a plain ArrayBuffer copy.
 *
 * We accept `unknown` to avoid widening/type-generic union issues during compilation.
 */
function toArrayBuffer(src: unknown): ArrayBuffer {
  // If it's already ArrayBuffer
  if (src instanceof ArrayBuffer) return src;

  // If it's a SharedArrayBuffer, copy into ArrayBuffer
  if (typeof SharedArrayBuffer !== 'undefined' && src instanceof SharedArrayBuffer) {
    const tmp = new Uint8Array(src.byteLength);
    tmp.set(new Uint8Array(src as SharedArrayBuffer));
    return tmp.buffer;
  }

  // If it's an ArrayBufferView (TypedArray / DataView / Buffer), copy the view bytes
  if (ArrayBuffer.isView(src)) {
    const view = src as ArrayBufferView;
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return copy.buffer;
  }

  // If it's a Node Buffer-like object (may appear as `object`), try to coerce:
  // Buffer has .buffer/.byteOffset/.byteLength but is also a Uint8Array subclass in Node.
  // Fallback: try JSON/string conversion is unsafe — instead throw.
  throw new TypeError('Unsupported buffer type for conversion to ArrayBuffer');
}

/**
 * Derives a KDF key from the user PIN using Argon2id (preferred) or PBKDF2 fallback.
 * Outputs a 256-bit AES-GCM key.
 * @param pin - User PIN (non-empty string)
 * @returns Promise<CryptoKey> - AES-GCM key for encrypt/decrypt
 * @throws TypeError - Invalid pin
 */
export async function deriveKdfKey(pin: string): Promise<CryptoKey> {
  if (typeof pin !== 'string' || pin.length === 0) {
    throw new TypeError('Pin must be a non-empty string');
  }

  // derivedBits may come from different sources (SharedArrayBuffer | ArrayBuffer | Buffer-backed view)
  let derivedBitsRaw: unknown;

  // allow forcing PBKDF2 in environments where argon2 native build fails
  if (String(process.env.FORCE_PBKDF2).toLowerCase() === 'true') {
    // announce fallback (non-secret message)
    console.log('using pbkdf2 fallback');
    derivedBitsRaw = await derivePbkdf2(pin);
  } else {
    try {
      derivedBitsRaw = await deriveArgon2(pin);
    } catch (err) {
      // Argon2 import/build failed — fallback to PBKDF2.
      // announce fallback (non-secret message)
      console.log('using pbkdf2 fallback');
      derivedBitsRaw = await derivePbkdf2(pin);
    }
  }

  // Normalize to a plain ArrayBuffer (copy if needed)
  const derivedBits = toArrayBuffer(derivedBitsRaw);

  // Import as AES-GCM raw key (256-bit)
  const key = await subtle.importKey(
    'raw',
    derivedBits,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return key as CryptoKey;
}

async function deriveArgon2(pin: string): Promise<ArrayBuffer> {
  // Dynamic import so the package can still function without argon2 installed.
  const argon2 = await import('argon2');

  // argon2.hash(..., { raw: true }) returns Buffer/Uint8Array in Node
  const rawAny = await (argon2 as any).hash(pin, {
    type: (argon2 as any).argon2id,
    raw: true,
    salt: DEFAULT_SALT,
    timeCost: DEFAULT_ARGON_TIME_COST,
    memoryCost: DEFAULT_ARGON_MEMORY_COST,
    parallelism: DEFAULT_ARGON_PARALLELISM,
    hashLength: 32
  });

  // Convert to plain ArrayBuffer via helper
  return toArrayBuffer(rawAny);
}

async function derivePbkdf2(pin: string): Promise<ArrayBuffer> {
  // Announce fallback — non-secret message required by unit tests.
  console.log('using pbkdf2 fallback');

  const encoder = new TextEncoder();
  const pwKey = await subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // deriveBits returns ArrayBuffer | SharedArrayBuffer in different lib setups
  const derived = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: DEFAULT_SALT,
      iterations: DEFAULT_PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    pwKey,
    256
  );

  return toArrayBuffer(derived);
}
