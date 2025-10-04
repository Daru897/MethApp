import { describe, it, expect, vi } from 'vitest';
import { webcrypto } from 'crypto';

const TEST_PIN = '1234';

describe('deriveKdfKey', () => {
  it('derives a key from valid PIN (PBKDF2 fallback)', async () => {
    // Force fallback BEFORE module import so the module uses PBKDF2 path.
    const origEnv = process.env.FORCE_PBKDF2;
    process.env.FORCE_PBKDF2 = 'true';
    vi.resetModules();

    const { deriveKdfKey } = await import('../src/kdf');

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deriveKdfKey(TEST_PIN);
    expect(consoleLogSpy).toHaveBeenCalledWith('using pbkdf2 fallback');
    consoleLogSpy.mockRestore();

    process.env.FORCE_PBKDF2 = origEnv;
    vi.resetModules();
  });

  it('uses PBKDF2 when argon2 import fails', async () => {
    const origEnv = process.env.FORCE_PBKDF2;
    process.env.FORCE_PBKDF2 = 'false';

    vi.resetModules();
    // Make the argon2 import throw so deriveKdfKey falls back to PBKDF2.
    vi.doMock('argon2', () => {
      throw new Error('simulated argon2 load failure');
    });

    const { deriveKdfKey } = await import('../src/kdf');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deriveKdfKey(TEST_PIN);
    expect(consoleLogSpy).toHaveBeenCalledWith('using pbkdf2 fallback');
    consoleLogSpy.mockRestore();

    vi.doUnmock('argon2');
    process.env.FORCE_PBKDF2 = origEnv;
    vi.resetModules();
  });

  it('uses PBKDF2 when FORCE_PBKDF2=true', async () => {
    const origEnv = process.env.FORCE_PBKDF2;
    process.env.FORCE_PBKDF2 = 'true';

    vi.resetModules();
    const { deriveKdfKey } = await import('../src/kdf');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await deriveKdfKey(TEST_PIN);
    expect(consoleLogSpy).toHaveBeenCalledWith('using pbkdf2 fallback');
    consoleLogSpy.mockRestore();

    process.env.FORCE_PBKDF2 = origEnv;
    vi.resetModules();
  });
});
