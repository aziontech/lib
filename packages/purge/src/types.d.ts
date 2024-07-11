/* eslint-disable no-unused-vars */
export interface ApiPurgeResponse {
  state: 'executed' | 'pending';
  data: {
    items: string[];
  };
}

export interface Purge {
  state: 'executed' | 'pending';
  items: string[];
}

export interface ClientConfig {
  token?: string;
  debug?: boolean;
}

export interface PurgeClient {
  purgeURL: (urls: string[]) => Promise<Purge | null>;
  purgeCacheKey: (cacheKeys: string[]) => Promise<Purge | null>;
  purgeWildCard: (wildcards: string[]) => Promise<Purge | null>;
}

export type CreatePurgeClient = (config?: ClientConfig) => PurgeClient;
