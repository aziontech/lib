import { KVError } from '../errors';
import type { KVGetOptions, KVGetResult, KVSetOptions, KVValue } from '../types';
import type { KVProvider } from './types';

export interface APIKVProviderOptions {
  apiToken?: string;
  namespace?: string;
  environment?: 'production' | 'stage';
}

export class APIKVProvider implements KVProvider {
  private apiUrl: string;
  private apiToken?: string;
  private namespace?: string;

  constructor(options?: APIKVProviderOptions) {
    if (options?.environment === 'production') {
      this.apiUrl = 'https://api.azion.com/v4/workspace/kv';
    } else {
      this.apiUrl = 'https://stage-api.azion.com/v4/workspace/kv';
    }
    this.apiToken = options?.apiToken || process.env.AZION_API_TOKEN;
    this.namespace = options?.namespace;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get<T = string>(key: string, options?: KVGetOptions): Promise<T | null> {
    // const url = this.buildUrl(`/keys/${encodeURIComponent(key)}`);

    try {
      throw new KVError('Not implemented');
    } catch (error) {
      if (error instanceof KVError) throw error;
      throw new KVError(`Failed to get key: ${error}`);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getWithMetadata(key: string, options?: KVGetOptions): Promise<KVGetResult> {
    // const url = this.buildUrl(`/keys/${encodeURIComponent(key)}`);

    try {
      throw new KVError('Not implemented');
    } catch (error) {
      if (error instanceof KVError) throw error;
      throw new KVError(`Failed to get key with metadata: ${error}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set(key: string, value: KVValue, options?: KVSetOptions): Promise<void> {
    // const url = this.buildUrl(`/keys/${encodeURIComponent(key)}`);

    // let body: string;
    // if (value instanceof ArrayBuffer) {
    //   body = JSON.stringify({ value: this.arrayBufferToBase64(value) });
    // } else if (value instanceof ReadableStream) {
    //   throw new KVError('ReadableStream not supported in API provider yet');
    // } else {
    //   body = JSON.stringify({
    //     value,
    //     expirationTtl: options?.expirationTtl,
    //     metadata: options?.metadata,
    //   });
    // }

    try {
      // const response = await fetch(url, {
      //   method: 'PUT',
      //   headers: this.buildHeaders(),
      //   body,
      // });

      // if (!response.ok) {
      //   throw new KVError(`Failed to set key: ${response.statusText}`);
      // }
      throw new KVError('Not implemented');
    } catch (error) {
      if (error instanceof KVError) throw error;
      throw new KVError(`Failed to set key: ${error}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(key: string): Promise<void> {
    // const url = this.buildUrl(`/keys/${encodeURIComponent(key)}`);

    try {
      throw new KVError('Not implemented');
    } catch (error) {
      if (error instanceof KVError) throw error;
      throw new KVError(`Failed to delete key: ${error}`);
    }
  }

  private buildUrl(path: string): string {
    const base = this.apiUrl.endsWith('/') ? this.apiUrl.slice(0, -1) : this.apiUrl;
    const namespace = this.namespace ? `/namespaces/${this.namespace}` : '';
    return `${base}${namespace}${path}`;
  }

  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    return headers;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
