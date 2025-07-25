import { AzionFetchEvent } from 'azion/types';

import { BuildOptions as ESBuildConfig, type Plugin as EsbuildPlugin } from 'esbuild';
import { Configuration as WebpackConfig, type WebpackPluginInstance as WebpackPlugin } from 'webpack';

import type {
  EdgeConnectorDnsResolution,
  EdgeConnectorHmacType,
  EdgeConnectorHttpVersionPolicy,
  EdgeConnectorLoadBalanceMethod,
  EdgeConnectorTransportPolicy,
  EdgeConnectorType,
  WafEngineType,
  WafEngineVersion,
  WafRuleset,
  WafThreatType,
} from './constants';

// Rule Engine types
export type CommonVariable = (typeof import('./constants').COMMON_VARIABLES)[number];
export type RequestVariable = (typeof import('./constants').ALL_REQUEST_VARIABLES)[number];
export type ResponseVariable = (typeof import('./constants').ALL_RESPONSE_VARIABLES)[number];
export type RuleOperatorWithValue = (typeof import('./constants').RULE_OPERATORS_WITH_VALUE)[number];
export type RuleOperatorWithoutValue = (typeof import('./constants').RULE_OPERATORS_WITHOUT_VALUE)[number];
export type RuleConditional = (typeof import('./constants').RULE_CONDITIONALS)[number];
export type RuleVariable = CommonVariable | RequestVariable | ResponseVariable;

// Firewall types
export type FirewallBehaviorName = (typeof import('./constants').FIREWALL_BEHAVIOR_NAMES)[number];
export type FirewallRateLimitType = (typeof import('./constants').FIREWALL_RATE_LIMIT_TYPES)[number];
export type FirewallRateLimitBy = (typeof import('./constants').FIREWALL_RATE_LIMIT_BY)[number];
export type FirewallWafMode = (typeof import('./constants').FIREWALL_WAF_MODES)[number];
export type FirewallVariable = (typeof import('./constants').FIREWALL_VARIABLES)[number];

// Network List types
export type NetworkListType = (typeof import('./constants').NETWORK_LIST_TYPES)[number];

// WAF types
export type WafMode = (typeof import('./constants').WAF_MODE)[number];
export type WafSensitivity = (typeof import('./constants').WAF_SENSITIVITY)[number];

// Cache types
export type CacheBrowserSetting = (typeof import('./constants').CACHE_BROWSER_SETTINGS)[number];
export type CacheCdnSetting = (typeof import('./constants').CACHE_CDN_SETTINGS)[number];
export type CacheByQueryString = (typeof import('./constants').CACHE_BY_QUERY_STRING)[number];
export type CacheByCookie = (typeof import('./constants').CACHE_BY_COOKIE)[number];
export type CacheAdaptiveDelivery = (typeof import('./constants').CACHE_ADAPTIVE_DELIVERY)[number];
export type CacheVaryByMethod = (typeof import('./constants').CACHE_VARY_BY_METHOD)[number];
export type TieredCacheTopology = (typeof import('./constants').TIERED_CACHE_TOPOLOGY)[number];

// Build types
export type BuildBundler = (typeof import('./constants').BUILD_BUNDLERS)[number];
export type EdgeAccessType = (typeof import('./constants').EDGE_ACCESS_TYPES)[number];

// Edge Functions types
export type EdgeFunctionRuntime = (typeof import('./constants').EDGE_FUNCTION_RUNTIMES)[number];
export type EdgeFunctionExecutionEnvironment =
  (typeof import('./constants').EDGE_FUNCTION_EXECUTION_ENVIRONMENTS)[number];

// Workload types
export type WorkloadInfrastructure = (typeof import('./constants').WORKLOAD_INFRASTRUCTURE)[number];
export type WorkloadTLSCipher = (typeof import('./constants').WORKLOAD_TLS_CIPHERS)[number];
export type WorkloadTLSVersion = (typeof import('./constants').WORKLOAD_TLS_VERSIONS)[number];
export type WorkloadMTLSVerification = (typeof import('./constants').WORKLOAD_MTLS_VERIFICATION)[number];
export type WorkloadHTTPVersion = (typeof import('./constants').WORKLOAD_HTTP_VERSIONS)[number];

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
  /** Associated edge appliaction ID */
  edgeApplicationId?: number;
  /** Associated edge firewall ID */
  edgeFirewallId?: number;
  /** Digital certificate ID */
  digitalCertificateId?: string | number | null;
  /** Indicates if the domain is active */
  active?: boolean;
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
    option: 'ignore' | 'all' | 'allowlist' | 'denylist';
    /** List of cookies to be considered */
    list?: string[];
  };
  /** Cache by query string configuration */
  cacheByQueryString?: {
    /** Query string caching option */
    option: 'ignore' | 'all' | 'allowlist' | 'denylist';
    /** List of query string parameters to be considered */
    list?: string[];
  };
};

/**
 * Device Group configuration for Azion V4.
 */
export type AzionDeviceGroup = {
  /** Device group name */
  name: string;
  /** User agent regex pattern */
  userAgent: string;
};

export type AzionRuleCriteriaBase = {
  /** Variable to be evaluated */
  variable: RuleVariable;
  /** Conditional type */
  conditional: RuleConditional;
};

export type AzionRuleCriteriaWithValue = AzionRuleCriteriaBase & {
  /** Operator for comparison that requires input value */
  operator: RuleOperatorWithValue;
  /** Input value for comparison */
  argument: string;
};

export type AzionRuleCriteriaWithoutValue = AzionRuleCriteriaBase & {
  /** Operator for comparison that doesn't require input value */
  operator: RuleOperatorWithoutValue;
};

export type AzionRuleCriteria = AzionRuleCriteriaWithValue | AzionRuleCriteriaWithoutValue;

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
  match?: string;
  /** Variable to be used in the match */
  variable?: RuleVariable;
  /** Array of criteria for complex conditions */
  criteria?: AzionRuleCriteria[];
  /** Behavior to be applied when the rule matches */
  behavior?: {
    /** Rewrite the request */
    rewrite?: string;
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
    /** Deny */
    deny?: boolean | null;
    /** No content */
    noContent?: boolean | null;
    /** enable GZIP compression */
    enableGZIP?: boolean | null;
    /** Filter cookie */
    filterCookie?: string | null;
    /** Filter header */
    filterHeader?: string | null;
    /** Optimize images */
    optimizeImages?: boolean | null;
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
    runFunction?: string | number;
    /** Set cache configuration */
    setCache?:
      | string
      | number
      | {
          /** Cache name */
          name: string | number;
          /** Browser cache TTL */
          browser_cache_settings_maximum_ttl?: number | null;
          /** CDN cache TTL */
          cdn_cache_settings_maximum_ttl?: number | null;
        };
    /** Finish request phase */
    finishRequestPhase?: boolean;
    /** Set Edge connector */
    setEdgeConnector?: string | number;
    /** Add request header */
    addRequestHeader?: string[];
    /** Add request cookie */
    addRequestCookie?: string;
    /** Filter request cookie */
    filterRequestCookie?: string;
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
  match?: string;
  /** Variable to be used in the match */
  variable?: RuleVariable;
  /** Array of criteria for complex conditions */
  criteria?: AzionRuleCriteria[];
  /** Behavior to be applied when the rule matches */
  behavior?: {
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
    /** Filter a header */
    filterHeader?: string | null;
    /** Run a serverless function */
    runFunction?: string | number;
    /** Redirect with 301 status */
    redirectTo301?: string | null;
    /** Redirect with 302 status */
    redirectTo302?: string | null;
    /** Add response header */
    addResponseHeader?: string[];
    /** Filter response cookie */
    filterResponseCookie?: string;
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
  /** Items to be purged */
  items: string[];
  /** Cache layer to be purged */
  layer?: 'edge_cache' | 'tiered_cache';
  /** Purge type */
  type: 'url' | 'cachekey' | 'wildcard';
};

export type PresetInput = string | AzionBuildPreset;

export type BuildEntryPoint = string | string[] | Record<string, string>;

export interface AzionBuild<T extends WebpackConfig | ESBuildConfig | unknown = WebpackConfig | ESBuildConfig> {
  entry?: BuildEntryPoint;
  bundler?: 'webpack' | 'esbuild';
  preset?: PresetInput;
  polyfills?: boolean;
  worker?: boolean;
  extend?: (context: T) => T;
  memoryFS?: {
    injectionDirs: string[];
    removePathPrefix: string;
  };
}

/**
 * Network list configuration for Azion V4.
 */
export type AzionNetworkList = {
  /** Network list name */
  name: string;
  /** Network list type */
  type: NetworkListType;
  /** List of network items */
  items: string[];
  /** Active status */
  active?: boolean;
};

/**
 * Storage binding configuration for Azion.
 */
export type AzionStorageBinding = {
  /** Storage bucket name or ID */
  bucket: string | number;
  /** Storage prefix */
  prefix: string;
};

/**
 * Bindings configuration for Azion.
 */
export type AzionBindings = {
  /** Storage bindings */
  storage?: AzionStorageBinding;
};

/**
 * Function Instance configuration for Azion V4 (within Edge Application).
 */
export type AzionFunctionInstance = {
  /** Function instance name */
  name: string;
  /** Reference to Edge Function name or ID */
  ref: string | number;
  /** Instance-specific arguments */
  args?: Record<string, unknown>;
  /** Function bindings (moved from Edge Function to instance) */
  bindings?: AzionBindings;
};

/**
 * Function configuration for Azion (DX-friendly).
 */
export type AzionEdgeFunction = {
  /** Function name */
  name: string;
  /** Function file path */
  path: string;
  /** Runtime environment */
  runtime?: EdgeFunctionRuntime;
  /** Default arguments to be passed to the function */
  defaultArgs?: Record<string, unknown>;
  /** Execution environment */
  executionEnvironment?: EdgeFunctionExecutionEnvironment;
  /** Active status */
  active?: boolean;
};

/**
 * Storage configuration for Azion.
 */
export type AzionBucket = {
  /** Storage name */
  name: string;
  /** Edge access type */
  edgeAccess?: 'read_only' | 'read_write' | 'restricted';
  /** Storage path */
  dir: string;
};

/**
 * Edge Application configuration for Azion.
 */
export type AzionEdgeApplication = {
  /** Application name */
  name: string;
  /** Enable edge cache */
  edgeCacheEnabled?: boolean;
  /** Enable edge functions */
  edgeFunctionsEnabled?: boolean;
  /** Enable application accelerator */
  applicationAcceleratorEnabled?: boolean;
  /** Enable image processor */
  imageProcessorEnabled?: boolean;
  /** Enable tiered cache */
  tieredCacheEnabled?: boolean;
  /** Indicates if the application is active */
  active?: boolean;
  /** Enable debug mode */
  debug?: boolean;
  /** Cache settings */
  cache?: AzionCache[];
  /** Rules configuration */
  rules?: AzionRules;
  /** Device groups */
  deviceGroups?: AzionDeviceGroup[];
  /** Function instances */
  functions?: AzionFunctionInstance[];
};

/**
 * Firewall behavior configuration for Azion.
 */
export type AzionEdgeFirewallBehavior = {
  /** Run a serverless function */
  runFunction?: string | number;
  /** Set WAF ruleset */
  setWafRuleset?: {
    /** WAF mode */
    wafMode: FirewallWafMode;
    /** WAF ID */
    wafId: string | number;
  };
  /** Set rate limit */
  setRateLimit?: {
    /** Rate limit type */
    type: FirewallRateLimitType;
    /** Rate limit by */
    limitBy: FirewallRateLimitBy;
    /** Average rate limit */
    averageRateLimit: string;
    /** Maximum burst size */
    maximumBurstSize: string;
  };
  /** Deny the request */
  deny?: boolean;
  /** Drop the request */
  drop?: boolean;
  /** Set custom response */
  setCustomResponse?: {
    /** HTTP status code (200-499) */
    statusCode: number | string;
    /** Response content type */
    contentType: string;
    /** Response content body */
    contentBody: string;
  };
};

export type AzionEdgeFirewallCriteriaBase = {
  /** Variable to be evaluated */
  variable: RuleVariable;
  /** Conditional type */
  conditional: RuleConditional;
};

export type AzionEdgeFirewallCriteriaWithValue = AzionEdgeFirewallCriteriaBase & {
  /** Operator for comparison that requires input value */
  operator: RuleOperatorWithValue;
  /** Input value for comparison */
  inputValue: string;
};

export type AzionEdgeFirewallCriteriaWithoutValue = AzionEdgeFirewallCriteriaBase & {
  /** Operator for comparison that doesn't require input value */
  operator: RuleOperatorWithoutValue;
};

export type AzionEdgeFirewallCriteria = AzionEdgeFirewallCriteriaWithValue | AzionEdgeFirewallCriteriaWithoutValue;

/**
 * Firewall rule configuration for Azion.
 */
export type AzionEdgeFirewallRule = {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Indicates if the rule is active */
  active?: boolean;
  /** Match criteria for the rule */
  match?: string;
  /** Variable to be used in the match */
  variable?: RuleVariable;
  /** Array of criteria for complex conditions */
  criteria?: AzionEdgeFirewallCriteria[];
  /** Behavior to be applied when the rule matches */
  behavior: AzionEdgeFirewallBehavior;
};

/**
 * Firewall configuration for Azion.
 */
export type AzionEdgeFirewall = {
  /** Firewall name */
  name: string;
  /** List of domains */
  domains?: string[];
  /** Indicates if the firewall is active */
  active?: boolean;
  /** Indicates if Edge Functions are enabled */
  edgeFunctions?: boolean;
  /** Indicates if Network Protection is enabled */
  networkProtection?: boolean;
  /** Indicates if WAF is enabled */
  waf?: boolean;
  /** Variable to be used in the match */
  variable?: RuleVariable;
  /** List of firewall rules */
  rules?: AzionEdgeFirewallRule[];
  /** Debug mode */
  debugRules?: boolean;
};

// WAF V4 Types
export interface WafThreshold {
  /** Threat type */
  threat: WafThreatType;
  /** Sensitivity level */
  sensitivity: WafSensitivity;
}

export interface WafEngineAttributes {
  /** WAF rulesets */
  rulesets: WafRuleset[];
  /** Threat thresholds */
  thresholds: WafThreshold[];
}

export interface WafEngineSettings {
  /** Engine version */
  engineVersion: WafEngineVersion;
  /** Engine type */
  type: WafEngineType;
  /** Engine attributes */
  attributes: WafEngineAttributes;
}

export type AzionWaf = {
  /** WAF name */
  name: string;
  /** Product version */
  productVersion?: string;
  /** Engine settings */
  engineSettings: WafEngineSettings;
};

export type BuildConfiguration = Omit<AzionBuild<WebpackConfig | ESBuildConfig>, 'preset' | 'entry'> & {
  entry: Record<string, string>;
  baseOutputDir?: string;
  preset: AzionBuildPreset;
  setup: BundlerSetup;
};

export interface BundlerSetup {
  contentToInject?: string;
  defineVars?: Record<string, string>;
}

export interface BuildContext {
  production: boolean;
  handler: BuildEntryPoint;
}

export type PresetMetadata = {
  name: string;
  registry?: string;
  ext?: string;
};

export interface AzionBuildPreset {
  config: AzionConfig;
  handler?: (event: AzionFetchEvent) => Promise<Response>;
  prebuild?: (config: BuildConfiguration, ctx: BuildContext) => Promise<void | AzionPrebuildResult>;
  postbuild?: (config: BuildConfiguration, ctx: BuildContext) => Promise<void>;
  metadata: PresetMetadata;
}

export interface AzionPrebuildResult {
  /** Files to be injected into memory during build process */
  filesToInject: string[];

  // Code injection settings
  injection: {
    globals: {
      _ENTRIES?: string;
      AsyncLocalStorage?: string;
      [key: string]: string | undefined;
    };
    entry?: string; // code at the beginning of worker
    banner?: string; // code at the top of worker
  };

  // Bundler settings
  bundler: {
    defineVars: {
      __CONFIG__?: string;
      __BUILD_METADATA__?: string;
      [key: string]: string | undefined;
    };
    plugins: (EsbuildPlugin | WebpackPlugin)[];
  };
}

export interface AzionConfigs {
  configs: AzionConfig[];
}

export type AzionWorkloadTLS = {
  certificate?: number | null;
  ciphers?: WorkloadTLSCipher | null;
  minimumVersion?: WorkloadTLSVersion | null;
};

export type AzionWorkloadProtocols = {
  http: {
    versions: WorkloadHTTPVersion[];
    httpPorts: number[];
    httpsPorts: number[];
    quicPorts?: number[] | null;
  };
};

export type AzionWorkloadMTLS = {
  verification: WorkloadMTLSVerification;
  certificate?: number | null;
  crl?: number[] | null;
};

/**
 * Workload Deployment Strategy configuration for Azion V4.
 */
export interface AzionWorkloadDeploymentStrategy {
  /** Strategy type */
  type: string;
  /** Strategy attributes */
  attributes: {
    /** Edge Application name or ID reference */
    edgeApplication: string | number;
    /** Edge Firewall name or ID reference (optional) */
    edgeFirewall?: string | number | null;
    /** Custom page reference (optional, to be implemented later) */
    customPage?: number | null;
  };
}

/**
 * Workload Deployment configuration for Azion V4.
 */
export interface AzionWorkloadDeployment {
  /** Deployment name */
  name: string;
  /** Whether this is the current deployment */
  current?: boolean;
  /** Active status */
  active?: boolean;
  /** Deployment strategy */
  strategy: AzionWorkloadDeploymentStrategy;
}

export type AzionWorkload = {
  name: string;
  active?: boolean;
  infrastructure?: WorkloadInfrastructure;
  tls?: AzionWorkloadTLS;
  protocols?: AzionWorkloadProtocols;
  mtls?: AzionWorkloadMTLS;
  domains: string[];
  workloadDomainAllowAccess?: boolean;
  /** Workload deployments */
  deployments?: AzionWorkloadDeployment[];
};

// Edge Connector V4 Types

export interface EdgeConnectorAddress {
  /** Address active status */
  active?: boolean;
  /** IPv4/IPv6 address or CNAME */
  address: string;
  /** HTTP port */
  httpPort?: number;
  /** HTTPS port */
  httpsPort?: number;
  /** Address modules */
  modules?: EdgeConnectorAddressModules | null;
}

export interface EdgeConnectorAddressModules {
  // Address-specific modules (to be defined based on future API spec)
}

export interface EdgeConnectorConnectionOptions {
  /** DNS resolution policy */
  dnsResolution?: EdgeConnectorDnsResolution;
  /** Transport protocol policy */
  transportPolicy?: EdgeConnectorTransportPolicy;
  /** HTTP version preference */
  httpVersionPolicy?: EdgeConnectorHttpVersionPolicy;
  /** Custom host override */
  host?: string;
  /** Path prefix for requests */
  pathPrefix?: string;
  /** Follow HTTP redirects */
  followingRedirect?: boolean;
  /** Real IP header name */
  realIpHeader?: string;
  /** Real port header name */
  realPortHeader?: string;
}

export interface LoadBalancerConfig {
  /** Load balancing method */
  method?: EdgeConnectorLoadBalanceMethod;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Connection timeout in seconds */
  connectionTimeout?: number;
  /** Read/write timeout in seconds */
  readWriteTimeout?: number;
}

export interface AWS4HMACAttributes {
  /** AWS region */
  region: string;
  /** AWS service */
  service?: string;
  /** Access key */
  accessKey: string;
  /** Secret key */
  secretKey: string;
}

export interface HMACConfig {
  /** HMAC type */
  type: EdgeConnectorHmacType;
  /** HMAC attributes */
  attributes: AWS4HMACAttributes;
}

export interface OriginShieldConfig {
  /** Origin IP ACL */
  originIpAcl?: {
    enabled?: boolean;
  };
  /** HMAC configuration */
  hmac?: {
    enabled?: boolean;
    config?: HMACConfig | null;
  };
}

export interface EdgeConnectorModules {
  /** Load balancer module */
  loadBalancer: {
    enabled: boolean;
    config: LoadBalancerConfig | null;
  };
  /** Origin shield module */
  originShield: {
    enabled: boolean;
    config: OriginShieldConfig | null;
  };
}

export interface EdgeConnectorAttributes {
  /** Array of addresses */
  addresses: EdgeConnectorAddress[];
  /** Connection options */
  connectionOptions: EdgeConnectorConnectionOptions;
  /** Modules configuration */
  modules: EdgeConnectorModules;
}

export interface AzionEdgeConnector {
  /** Edge connector name */
  name: string;
  /** Active status */
  active?: boolean;
  /** Connector type */
  type: EdgeConnectorType;
  /** Connector attributes */
  attributes: EdgeConnectorAttributes;
}

/**
 * Main configuration type for Azion.
 */
export type AzionConfig = {
  /** Build configuration */
  build?: AzionBuild;
  /** Edge Application configuration */
  edgeApplications?: AzionEdgeApplication[];
  /** Functions configurations */
  edgeFunctions?: AzionEdgeFunction[];
  /** Edge Connectors configuration */
  edgeConnectors?: AzionEdgeConnector[];
  /** Storage configurations */
  edgeStorage?: AzionBucket[];
  /** Firewall configuration */
  edgeFirewall?: AzionEdgeFirewall[];
  /** Network list configurations */
  networkList?: AzionNetworkList[];
  /** Purge configurations */
  purge?: AzionPurge[];
  /** WAF configuration */
  waf?: AzionWaf[];
  /** Workload configuration */
  workloads?: AzionWorkload[];
};
