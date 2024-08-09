export type AzionConfig = {
  domain?: {
    name: string;
    cnameAccessOnly?: boolean;
    cnames?: string[];
    edgeApplicationId?: number;
    edgeFirewallId?: number;
    digitalCertificateId?: string;
    mtls?: {
      verification: 'enforce' | 'permissive';
      trustedCaCertificateId: number;
      crlLis?: number[];
    };
  };

  origin?: {
    id?: number;
    key?: string;
    name: string;
    type: string;
    bucket?: string | null;
    prefix?: string | null;
    addresses?:
      | string[]
      | {
          address: string;
          weight?: number;
        }[];
    hostHeader?: string;
    protocolPolicy?: 'http' | 'https' | 'preserve';
    redirection?: boolean;
    method?: 'ip_hash' | 'least_connections' | 'round_robin';
    path?: string;
    connectionTimeout?: number;
    timeoutBetweenBytes?: number;
    hmac?: {
      region: string;
      accessKey: string;
      secretKey: string;
    };
  }[];

  cache?: {
    name: string;
    stale?: boolean;
    queryStringSort?: boolean;
    methods?: {
      post?: boolean;
      options?: boolean;
    };
    browser?: {
      maxAgeSeconds: number | string;
    };
    edge?: {
      maxAgeSeconds: number | string;
    };
    cacheByCookie?: {
      option: 'ignore' | 'varies' | 'whitelist' | 'blacklist';
      list?: string[];
    };
    cacheByQueryString?: {
      option: 'ignore' | 'varies' | 'whitelist' | 'blacklist';
      list?: string[];
    };
  }[];

  rules?: {
    request?: {
      name: string;
      description?: string;
      active?: boolean;
      match: string;
      variable?: string;
      behavior?: {
        setOrigin?: {
          name: string;
          type: string;
        };
        rewrite?: string;
        setHeaders?: string[];
        bypassCache?: boolean | null;
        httpToHttps?: boolean | null;
        redirectTo301?: string | null;
        redirectTo302?: string | null;
        forwardCookies?: boolean | null;
        setCookie?: string | null;
        deliver?: boolean | null;
        capture?: {
          match: string;
          captured: string;
          subject: string;
        };
        runFunction?: {
          path: string;
          name?: string | null;
        };
        setCache?:
          | string
          | {
              name: string;
              browser_cache_settings_maximum_ttl?: number | null;
              cdn_cache_settings_maximum_ttl?: number | null;
            };
      };
    }[];
    response?: {
      name: string;
      description?: string;
      active?: boolean;
      match: string;
      variable?: string;
      behavior?: {
        setCookie?: string | null;
        setHeaders?: string[];
        deliver?: boolean | null;
        capture?: {
          match: string;
          captured: string;
          subject: string;
        };
        enableGZIP?: boolean | null;
        filterCookie?: string | null;
        filterHeader?: string | null;
        runFunction?: {
          path: string;
          name?: string | null;
        };
        redirectTo301?: string | null;
        redirectTo302?: string | null;
      };
    }[];
  };

  networkList?: {
    id: number;
    listType: string;
    listContent: string[];
  }[];

  purge?: {
    type: 'url' | 'cachekey' | 'wildcard';
    urls: string[];
    method?: 'delete';
    layer?: 'edge_caching' | 'l2_caching';
  }[];
};
