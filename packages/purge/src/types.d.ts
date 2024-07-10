/* eslint-disable no-unused-vars */
export interface ApiPurgeResponse {
  state: 'executed' | 'pending';
  data: {
    items: string[];
  };
}

export interface CreatedPurge {
  state: 'executed' | 'pending';
  items: string[];
}

export interface ClientConfig {
  token?: string;
  debug?: boolean;
}

export interface PurgeInternalClient {
  purgeURL: (urls: string[]) => Promise<CreatedPurge | null>;
  purgeCacheKey: (cacheKeys: string[]) => Promise<CreatedPurge | null>;
  purgeWildCard: (wildcards: string[]) => Promise<CreatedPurge | null>;
}

export type CreatePurgeInternalClient = (config?: ClientConfig) => PurgeInternalClient;
