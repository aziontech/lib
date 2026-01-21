import { KVError } from '../errors';
import type { KVGetOptions, KVGetResult, KVGetValue, KVSetOptions, KVValue } from '../types';
import type { AzionKVNamespace, KVProvider } from './types';

export class NativeKVProvider implements KVProvider {
  private kv: Omit<AzionKVNamespace, 'open'>;

  private constructor(kv: Omit<AzionKVNamespace, 'open'>) {
    this.kv = kv;
  }

  static async create(namespace: string): Promise<NativeKVProvider> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(globalThis as any).Azion?.KV) {
      throw new KVError('Azion.KV is not available in globalThis');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = await (globalThis as any).Azion.KV.open(namespace);
    return new NativeKVProvider(kv);
  }

  async get(key: string, options?: KVGetOptions): Promise<KVGetValue | null> {
    const type = options?.type || 'text';
    const result = await this.kv.get(key, type, { cacheTtl: options?.cacheTtl });
    return result as KVGetValue | null;
  }

  async getWithMetadata(key: string, options?: KVGetOptions): Promise<KVGetResult> {
    const type = options?.type || 'text';
    const result = await this.kv.getWithMetadata(key, type, { cacheTtl: options?.cacheTtl });

    return {
      value: result.value as KVGetValue | null,
      metadata: result.metadata || undefined,
    };
  }

  async set(key: string, value: KVValue, options?: KVSetOptions): Promise<void> {
    let expiration: number | undefined;
    let expirationTtl: number | undefined;

    if (options?.expiration) {
      const { type, value } = options.expiration;

      switch (type) {
        case 'EX':
          // EX: seconds from now -> use expirationTtl
          expirationTtl = value;
          break;
        case 'PX':
          // PX: milliseconds from now -> convert to seconds for expirationTtl
          expirationTtl = value ? Math.ceil(value / 1000) : undefined;
          break;
        case 'EXAT':
          // EXAT: Unix timestamp in seconds -> use expiration directly
          expiration = value;
          break;
        case 'PXAT':
          // PXAT: Unix timestamp in milliseconds -> convert to seconds for expiration
          expiration = value ? Math.floor(value / 1000) : undefined;
          break;
        case 'KEEPTTL':
          // KEEPTTL: don't set any expiration (keep existing TTL)
          break;
      }
    }

    // If expirationTtl was provided directly in options, use it (backwards compatibility)
    if (options?.expirationTtl !== undefined) {
      expirationTtl = options.expirationTtl;
    }

    await this.kv.put(key, value, {
      expiration,
      expirationTtl,
      metadata: options?.metadata,
    });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  static isAvailable(): boolean {
    return (
      typeof globalThis !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).Azion !== undefined &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).Azion.KV !== undefined
    );
  }
}
