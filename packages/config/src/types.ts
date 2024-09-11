/**
 * Domain configuration for Azion.
 */
export type AzionDomain = {
  /** Domain name */
  name: string;
  /** Indicates if access is restricted to CNAME only */
  cnameAccessOnly?: boolean;
  /** List of CNAMEs associated with the domain */
  cnames?: string[];
  /** Associated edge application ID */
  id?: number;
  /** Associated edge firewall ID */
  edgeFirewallId?: number;
  /** Digital certificate ID */
  digitalCertificateId?: string | number | null;
  /** Mutual TLS configuration */
  mtls?: {
    /** Verification mode for MTLS */
    verification: 'enforce' | 'permissive';
    /** ID of the trusted CA certificate */
    trustedCaCertificateId: number;
    /** List of CRL (Certificate Revocation List) IDs */
    crlList?: number[];
  };
};

/**
 * Origin configuration for Azion.
 */
export type AzionOrigin = {
  /** Origin ID */
  id?: number;
  /** Origin key */
  key?: string;
  /** Origin name */
  name: string;
  /** Origin type */
  type: string;
  /** Bucket name for S3-like origins */
  bucket?: string | null;
  /** Prefix for S3-like origins */
  prefix?: string | null;
  /** Addresses for the origin */
  addresses?:
    | string[]
    | {
        /** Address of the origin */
        address: string;
        /** Weight for load balancing */
        weight?: number;
      }[];
  /** Host header to be sent to the origin */
  hostHeader?: string;
  /** Protocol policy for communicating with the origin */
  protocolPolicy?: 'http' | 'https' | 'preserve';
  /** Indicates if redirection should be used */
  redirection?: boolean;
  /** Load balancing method */
  method?: 'ip_hash' | 'least_connections' | 'round_robin';
  /** Path to be appended to the origin address */
  path?: string;
  /** Connection timeout in seconds */
  connectionTimeout?: number;
  /** Timeout between bytes in seconds */
  timeoutBetweenBytes?: number;
  /** HMAC authentication configuration */
  hmac?: {
    /** AWS region */
    region: string;
    /** AWS access key */
    accessKey: string;
    /** AWS secret key */
    secretKey: string;
  };
};

/**
 * Cache configuration for Azion.
 */
export type AzionCache = {
  /** Cache name */
  name: string;
  /** Indicates if stale content should be served */
  stale?: boolean;
  /** Indicates if query string parameters should be sorted */
  queryStringSort?: boolean;
  /** HTTP methods to be cached */
  methods?: {
    /** Cache POST requests */
    post?: boolean;
    /** Cache OPTIONS requests */
    options?: boolean;
  };
  /** Browser cache settings */
  browser?: {
    /** Maximum age for browser cache in seconds */
    maxAgeSeconds: number | string;
  };
  /** Edge cache settings */
  edge?: {
    /** Maximum age for edge cache in seconds */
    maxAgeSeconds: number | string;
  };
  /** Cache by cookie configuration */
  cacheByCookie?: {
    /** Cookie caching option */
    option: 'ignore' | 'varies' | 'whitelist' | 'blacklist';
    /** List of cookies to be considered */
    list?: string[];
  };
  /** Cache by query string configuration */
  cacheByQueryString?: {
    /** Query string caching option */
    option: 'ignore' | 'varies' | 'whitelist' | 'blacklist';
    /** List of query string parameters to be considered */
    list?: string[];
  };
};
/**
 * Request rule configuration for Azion.
 */
export type AzionRequestRule = {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Indicates if the rule is active */
  active?: boolean;
  /** Match criteria for the rule */
  match: string;
  /** Variable to be used in the match */
  variable?: string;
  /** Behavior to be applied when the rule matches */
  behavior?: {
    /** Set a new origin */
    setOrigin?: {
      /** Origin name */
      name: string;
      /** Origin type */
      type: string;
    };
    /** Rewrite the request */
    rewrite?: string;
    /** Set headers */
    setHeaders?: string[];
    /** Bypass cache */
    bypassCache?: boolean | null;
    /** Force HTTPS */
    httpToHttps?: boolean | null;
    /** Redirect with 301 status */
    redirectTo301?: string | null;
    /** Redirect with 302 status */
    redirectTo302?: string | null;
    /** Forward cookies */
    forwardCookies?: boolean | null;
    /** Set a cookie */
    setCookie?: string | null;
    /** Deliver the content */
    deliver?: boolean | null;
    /** Capture configuration */
    capture?: {
      /** Match pattern */
      match: string;
      /** Captured value */
      captured: string;
      /** Subject to capture from */
      subject: string;
    };
    /** Run a serverless function */
    runFunction?: {
      /** Function path */
      path: string;
      /** Function name */
      name?: string | null;
    };
    /** Set cache configuration */
    setCache?:
      | string
      | {
          /** Cache name */
          name: string;
          /** Browser cache TTL */
          browser_cache_settings_maximum_ttl?: number | null;
          /** CDN cache TTL */
          cdn_cache_settings_maximum_ttl?: number | null;
        };
  };
};

/**
 * Response rule configuration for Azion.
 */
export type AzionResponseRule = {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Indicates if the rule is active */
  active?: boolean;
  /** Match criteria for the rule */
  match: string;
  /** Variable to be used in the match */
  variable?: string;
  /** Behavior to be applied when the rule matches */
  behavior?: {
    /** Set a cookie */
    setCookie?: string | null;
    /** Set headers */
    setHeaders?: string[];
    /** Deliver the content */
    deliver?: boolean | null;
    /** Capture configuration */
    capture?: {
      /** Match pattern */
      match: string;
      /** Captured value */
      captured: string;
      /** Subject to capture from */
      subject: string;
    };
    /** Enable GZIP compression */
    enableGZIP?: boolean | null;
    /** Filter a cookie */
    filterCookie?: string | null;
    /** Filter a header */
    filterHeader?: string | null;
    /** Run a serverless function */
    runFunction?: {
      /** Function path */
      path: string;
      /** Function name */
      name?: string | null;
    };
    /** Redirect with 301 status */
    redirectTo301?: string | null;
    /** Redirect with 302 status */
    redirectTo302?: string | null;
  };
};

/**
 * Rules configuration for Azion.
 */
export type AzionRules = {
  /** Request rules */
  request?: AzionRequestRule[];
  /** Response rules */
  response?: AzionResponseRule[];
};
/**
 * Purge configuration for Azion.
 */
export type AzionPurge = {
  /** Purge type */
  type: 'url' | 'cachekey' | 'wildcard';
  /** URLs to be purged */
  urls: string[];
  /** HTTP method for purge request */
  method?: 'delete';
  /** Cache layer to be purged */
  layer?: 'edge_caching' | 'l2_caching';
};

export type AzionBuild = {
  /** Bunlder to be used */
  builder?: 'webpack' | 'esbuild';
  /** Entry file for the build */
  entry?: string;
  /** Preset configuration e.g next */
  preset: {
    name: string;
  };
  /** MemoryFS configuration */
  memoryFS?: {
    /** List of directories to be injected */
    injectionDirs: string[];
    /** Remove path prefix */
    removePathPrefix: string;
  };
  /** Polyfills enabled */
  polyfills?: boolean;
  /** if true will use the owner worker with addEventListener */
  worker?: boolean;
  /** Custom configuration to bundlers e.g minify: true */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: Record<string, any>;
};

/**
 * Main configuration type for Azion.
 */
export type AzionConfig = {
  /** Build configuration */
  build?: AzionBuild;
  /** Domain configuration */
  domain?: AzionDomain;
  /** Origin configurations */
  origin?: AzionOrigin[];
  /** Cache configurations */
  cache?: AzionCache[];
  /** Rules configuration */
  rules?: AzionRules;
  /** Purge configurations */
  purge?: AzionPurge[];
};
