import { APIKVProvider } from './providers/api';
import { NativeKVProvider } from './providers/native';
import type { KVProvider } from './providers/types';
import type { KVClientOptions, KVGetOptions, KVGetResult, KVGetValue, KVSetOptions, KVValue } from './types';

type EventHandler = (error: Error) => void;

export class KVClient {
  private provider?: KVProvider;
  private options: KVClientOptions;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private isConnected = false;

  private constructor(options: KVClientOptions) {
    this.options = options;
  }

  static create(options?: KVClientOptions): KVClient {
    return new KVClient(options || {});
  }

  on(event: 'error', handler: EventHandler): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
    return this;
  }

  private emit(event: string, error: Error): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(error));
    }
  }

  async connect(): Promise<this> {
    if (this.isConnected) {
      return this;
    }

    try {
      const providerType = this.options.provider || 'auto';
      const namespace = this.options.namespace || process.env.AZION_KV_NAMESPACE;

      if (!namespace) {
        throw new Error('namespace is required');
      }

      if (providerType === 'native' || (providerType === 'auto' && NativeKVProvider.isAvailable())) {
        this.provider = await NativeKVProvider.create(namespace);
      } else {
        this.provider = new APIKVProvider({
          apiToken: this.options.apiToken,
          namespace,
          environment: this.options.environment,
        });
      }

      this.isConnected = true;
      return this;
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected || !this.provider) {
      throw new Error('Client is not connected. Call .connect() first.');
    }
  }

  async get(key: string, options?: KVGetOptions): Promise<KVGetValue | null> {
    this.ensureConnected();
    return this.provider!.get(key, options);
  }

  async getWithMetadata(key: string, options?: KVGetOptions): Promise<KVGetResult> {
    this.ensureConnected();
    return this.provider!.getWithMetadata(key, options);
  }

  async set(key: string, value: KVValue, options?: KVSetOptions): Promise<void> {
    this.ensureConnected();
    return this.provider!.set(key, value, options);
  }

  async delete(key: string): Promise<void> {
    this.ensureConnected();
    return this.provider!.delete(key);
  }

  getProviderType(): 'native' | 'api' {
    this.ensureConnected();
    return this.provider! instanceof NativeKVProvider ? 'native' : 'api';
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.provider = undefined;
    return Promise.resolve();
  }

  async quit(): Promise<void> {
    return this.disconnect();
  }

  async hSet(key: string, field: string, value: KVValue): Promise<void> {
    this.ensureConnected();
    const existing = await this.provider!.get(key);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hash: Record<string, any> = {};

    if (existing) {
      try {
        hash = JSON.parse(existing as string);
      } catch {
        hash = {};
      }
    }

    hash[field] = value;
    return this.provider!.set(key, JSON.stringify(hash));
  }

  async HSET(key: string, field: string, value: KVValue): Promise<void> {
    return this.hSet(key, field, value);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async hGetAll(key: string): Promise<Record<string, any> | null> {
    this.ensureConnected();
    const existing = await this.provider!.get(key);

    if (!existing) {
      return null;
    }

    try {
      return JSON.parse(existing as string);
    } catch {
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async HGETALL(key: string): Promise<Record<string, any> | null> {
    return this.hGetAll(key);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async hVals(key: string): Promise<any[] | null> {
    const hash = await this.hGetAll(key);

    if (!hash) {
      return null;
    }

    return Object.values(hash);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async HVALS(key: string): Promise<any[] | null> {
    return this.hVals(key);
  }
}

export function createClient(options?: KVClientOptions): KVClient {
  return KVClient.create(options);
}
