# @app/crypto

Crypto Core module for the MethAwarenessApp. Implements key derivation (Argon2id with PBKDF2 fallback), device key wrapping, and AES-GCM encryption/decryption using Node's Web Crypto API.

## Public API

```typescript
export async function deriveKdfKey(pin: string): Promise<CryptoKey>

export async function wrapKey(
  kdfKey: CryptoKey,
  deviceKey: CryptoKey
): Promise<ArrayBuffer> // wrappedDeviceKey (binary)

export async function unwrapKey(
  kdfKey: CryptoKey,
  wrappedDeviceKey: ArrayBuffer
): Promise<CryptoKey> // deviceKey

export async function encrypt(
  dataKey: CryptoKey,
  plaintext: Uint8Array | ArrayBuffer,
  associatedData?: Uint8Array
): Promise<{ iv: Uint8Array; ct: ArrayBuffer }>

export async function decrypt(
  dataKey: CryptoKey,
  payload: { iv: Uint8Array; ct: ArrayBuffer },
  associatedData?: Uint8Array
): Promise<Uint8Array> // throws on failure