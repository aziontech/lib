/* eslint-disable no-unused-vars */
export interface ApiPurgeResponse {
  state: 'executed' | 'pending';
  data: {
    items: string[];
  };
}

export interface AzionPurge {
  state: 'executed' | 'pending';
  items: string[];
}

export interface AzionPurgeClient {
  purgeURL: (urls: string[]) => Promise<AzionPurge | null>;
  purgeCacheKey: (cacheKeys: string[]) => Promise<AzionPurge | null>;
  purgeWildCard: (wildcards: string[]) => Promise<AzionPurge | null>;
}

export type CreateAzionPurgeClient = (
  config?: Partial<{ token: string; options?: AzionClientOptions }>,
) => AzionPurgeClient;

export type AzionClientOptions = {
  debug?: boolean;
  force?: boolean;
};
