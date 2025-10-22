import { AzionRuntimeModule } from 'azion/types';

import { BuildOptions as ESBuildConfig, type Plugin as EsbuildPlugin } from 'esbuild';
import { Configuration as WebpackConfig, type WebpackPluginInstance as WebpackPlugin } from 'webpack';

// Custom Pages types
export type CustomPageErrorCode =
  | 'default'
  | '400'
  | '401'
  | '403'
  | '404'
  | '405'
  | '406'
  | '408'
  | '409'
  | '410'
  | '411'
  | '414'
  | '415'
  | '416'
  | '426'
  | '429'
  | '431'
  | '500'
  | '501'
  | '502'
  | '503'
  | '504'
  | '505';
export type CustomPageType = 'page_connector';

// Rule Engine types
export type CommonVariable =
  | 'args'
  | 'device_group'
  | 'domain'
  | 'geoip_city'
  | 'geoip_city_continent_code'
  | 'geoip_city_country_code'
  | 'geoip_city_country_name'
  | 'geoip_continent_code'
  | 'geoip_country_code'
  | 'geoip_country_name'
  | 'geoip_region'
  | 'geoip_region_name'
  | 'host'
  | 'remote_addr'
  | 'remote_port'
  | 'remote_user'
  | 'request'
  | 'request_body'
  | 'request_method'
  | 'request_uri'
  | 'scheme'
  | 'uri';
export type RequestVariable =
  | CommonVariable
  | 'server_addr'
  | 'server_port'
  | 'ssl_client_fingerprint'
  | 'ssl_client_escaped_cert'
  | 'ssl_client_s_dn'
  | 'ssl_client_s_dn_parsed'
  | 'ssl_client_cert'
  | 'ssl_client_i_dn'
  | 'ssl_client_serial'
  | 'ssl_client_v_end'
  | 'ssl_client_v_remain'
  | 'ssl_client_v_start'
  | 'ssl_client_verify';
export type ResponseVariable =
  | CommonVariable
  | 'sent_http_name'
  | 'status'
  | 'tcpinfo_rtt'
  | 'upstream_addr'
  | 'upstream_status';
export type RuleOperatorWithValue =
  | 'is_equal'
  | 'is_not_equal'
  | 'starts_with'
  | 'does_not_start_with'
  | 'matches'
  | 'does_not_match';
export type RuleOperatorWithoutValue = 'exists' | 'does_not_exist';
export type RuleConditional = 'if' | 'and' | 'or';

// Criar um tipo utilitário para gerar as versões com ${}
type WithDollarBraces<T extends string> = `\${${T}}` | T;

// Criar um tipo para variáveis dinâmicas
type DynamicVariable =
  | `arg_${string}`
  | `cookie_${string}`
  | `http_${string}`
  | `sent_http_${string}`
  | `upstream_cookie_${string}`
  | `upstream_http_${string}`;

// Modificar a definição do tipo RuleVariable para incluir variáveis dinâmicas
export type RuleVariable =
  | WithDollarBraces<CommonVariable | RequestVariable | ResponseVariable>
  | DynamicVariable
  | WithDollarBraces<DynamicVariable>;

// Firewall types
export type FirewallBehaviorName =
  | 'deny'
  | 'drop'
  | 'set_rate_limit'
  | 'set_waf_ruleset'
  | 'run_function'
  | 'tag_event'
  | 'set_custom_response';
export type FirewallRateLimitType = 'second' | 'minute';
export type FirewallRateLimitBy = 'clientIp' | 'global';
export type FirewallWafMode = 'learning' | 'blocking';
export type FirewallVariable =
  | 'header_accept'
  | 'header_accept_encoding'
  | 'header_accept_language'
  | 'header_cookie'
  | 'header_origin'
  | 'header_referer'
  | 'header_user_agent'
  | 'host'
  | 'network'
  | 'request_args'
  | 'request_method'
  | 'request_uri'
  | 'scheme'
  | 'client_certificate_validation'
  | 'ssl_verification_status';

// Network List types
export type NetworkListType = 'ip_cidr' | 'asn' | 'countries';

// WAF types
export type WafMode = 'learning' | 'blocking' | 'counting';
export type WafSensitivity = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type WafEngineVersion = '2021-Q3';
export type WafEngineType = 'score';
export type WafRuleset = 1;
export type WafThreatType =
  | 'cross_site_scripting'
  | 'directory_traversal'
  | 'evading_tricks'
  | 'file_upload'
  | 'identified_attack'
  | 'remote_file_inclusion'
  | 'sql_injection'
  | 'unwanted_access';

// Cache types
export type CacheBrowserSetting = 'honor' | 'override' | 'no-cache';
export type CacheCdnSetting = 'honor' | 'override';
export type CacheByQueryString = 'ignore' | 'all' | 'allowlist' | 'denylist';
export type CacheByCookie = 'ignore' | 'all' | 'allowlist' | 'denylist';
export type CacheAdaptiveDelivery = 'ignore' | 'allowlist';
export type CacheVaryByMethod = 'options' | 'post';
export type TieredCacheTopology = 'nearest-region' | 'br-east-1' | 'us-east-1';

// Build types
export type BuildBundler = 'webpack' | 'esbuild';
export type EdgeAccessType = 'read_only' | 'read_write' | 'restricted';

// Functions types
export type FunctionRuntime = 'azion_js';
export type FunctionExecutionEnvironment = 'application' | 'firewall';

// Workload types
export type WorkloadInfrastructure = 1 | 2;
export type WorkloadTLSCipher = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type WorkloadTLSVersion = '' | 'tls_1_0' | 'tls_1_1' | 'tls_1_2' | 'tls_1_3';
export type WorkloadMTLSVerification = 'enforce' | 'permissive';
export type WorkloadHTTPVersion = 'http1' | 'http2';

// Connector types
export type ConnectorType = 'http' | 'storage' | 'live_ingest';
export type ConnectorDnsResolution = 'both' | 'force_ipv4';
export type ConnectorTransportPolicy = 'preserve' | 'force_https' | 'force_http';
export type ConnectorHttpVersionPolicy = 'http1_1';
export type ConnectorLoadBalanceMethod = 'round_robin' | 'least_conn' | 'ip_hash';
export type ConnectorHmacType = 'aws4_hmac_sha256';

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
  /** Associated  application ID */
  id?: number;
  /** Associated  appliaction ID */
  edgeApplicationId?: number;
  /** Associated  firewall ID */
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
  /** Tiered cache configuration */
  tieredCache?: {
    /** Indicates if tiered cache should be enabled */
    enabled: boolean;
    /** Tiered cache topology */
    topology: TieredCacheTopology;
  };
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
  /** cache settings */
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
    /** Set connector */
    setConnector?: string | number;
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
 * Purge configuration for Azion.
 */
export type AzionPurge = {
  /** Items to be purged */
  items: string[];
  /** Cache layer to be purged */
  layer?: 'cache' | 'tiered_cache';
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
  bucket: string;
  /** Storage prefix */
  prefix?: string;
};

/**
 * Bindings configuration for Azion Functions.
 */
export type AzionFunctionBindings = {
  /** Storage bindings */
  storage?: AzionStorageBinding;
};

/**
 * Function Instance configuration for Azion V4 (within Application).
 */
export type AzionFunctionInstance = {
  /** Function instance name */
  name: string;
  /** Reference to Function name or ID */
  ref: string | number;
  /** Instance-specific arguments */
  args?: Record<string, unknown>;
  /** Active status */
  active?: boolean;
};

/**
 * Function configuration for Azion (DX-friendly).
 */
export type AzionFunction = {
  /** Function name */
  name: string;
  /** Function file path */
  path: string;
  /** Runtime environment */
  runtime?: FunctionRuntime;
  /** Default arguments to be passed to the function */
  defaultArgs?: Record<string, unknown>;
  /** Execution environment */
  executionEnvironment?: FunctionExecutionEnvironment;
  /** Active status */
  active?: boolean;
  /** Function bindings */
  bindings?: AzionFunctionBindings;
};

/**
 * Storage configuration for Azion.
 */
export type AzionBucket = {
  /** Storage name */
  name: string;
  /** access type */
  edgeAccess?: 'read_only' | 'read_write' | 'restricted';
  /** Storage path */
  dir: string;
  /** Storage prefix */
  prefix: string;
};

/**
 * Application configuration for Azion.
 */
export type AzionApplication = {
  /** Application name */
  name: string;
  /** Enable edge cache */
  edgeCacheEnabled?: boolean;
  /** Enable functions */
  functionsEnabled?: boolean;
  /** Enable application accelerator */
  applicationAcceleratorEnabled?: boolean;
  /** Enable image processor */
  imageProcessorEnabled?: boolean;
  /** Indicates if the application is active */
  active?: boolean;
  /** Enable debug mode */
  debug?: boolean;
  /** Cache settings */
  cache?: AzionCache[];
  /** Rules configuration V4 */
  rules?: AzionRules;
  /** Device groups */
  deviceGroups?: AzionDeviceGroup[];
  /** Function instances */
  functionsInstances?: AzionFunctionInstance[];
};

/**
 * Firewall behavior configuration for Azion.
 */
export type AzionFirewallBehavior = {
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

export type AzionFirewallCriteriaBase = {
  /** Variable to be evaluated */
  variable: RuleVariable;
  /** Conditional type */
  conditional: RuleConditional;
};

export type AzionFirewallCriteriaWithValue = AzionFirewallCriteriaBase & {
  /** Operator for comparison that requires input value */
  operator: RuleOperatorWithValue;
  /** Argument for comparison */
  argument: string;
};

export type AzionFirewallCriteriaWithoutValue = AzionFirewallCriteriaBase & {
  /** Operator for comparison that doesn't require input value */
  operator: RuleOperatorWithoutValue;
};

export type AzionFirewallCriteria = AzionFirewallCriteriaWithValue | AzionFirewallCriteriaWithoutValue;

/**
 * Firewall rule configuration for Azion.
 */
export type AzionFirewallRule = {
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
  criteria?: AzionFirewallCriteria[];
  /** Behavior to be applied when the rule matches */
  behavior: AzionFirewallBehavior;
};

/**
 * Firewall configuration for Azion.
 */
export type AzionFirewall = {
  /** Firewall name */
  name: string;
  /** Indicates if the firewall is active */
  active?: boolean;
  /** Indicates if Functions are enabled */
  functions?: boolean;
  /** Indicates if Network Protection is enabled */
  networkProtection?: boolean;
  /** Indicates if WAF is enabled */
  waf?: boolean;
  /** Variable to be used in the match */
  variable?: RuleVariable;
  /** List of firewall rules */
  rules?: AzionFirewallRule[];
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
  skipFrameworkBuild?: boolean;
}

export type PresetMetadata = {
  name: string;
  registry?: string;
  ext?: string;
};

export interface AzionBuildPreset {
  config: AzionConfig;
  handler?: AzionRuntimeModule;
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
    /** Application name or ID reference */
    application: string | number;
    /** Firewall name or ID reference (optional) */
    firewall?: string | number | null;
    /** Custom page name or ID reference (optional) */
    customPage?: string | number | null;
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
  domains?: string[];
  workloadDomainAllowAccess?: boolean;
  /** Workload deployments */
  deployments?: AzionWorkloadDeployment[];
};

// Connector V4 Types

export interface ConnectorAddress {
  /** Address active status */
  active?: boolean;
  /** IPv4/IPv6 address or CNAME */
  address: string;
  /** HTTP port */
  httpPort?: number;
  /** HTTPS port */
  httpsPort?: number;
  /** Address modules */
  modules?: ConnectorAddressModules | null;
}

// eslint-disable-next-line
export interface ConnectorAddressModules {
  // Address-specific modules (to be defined based on future API spec)
}

export interface ConnectorConnectionOptions {
  /** DNS resolution policy */
  dnsResolution?: ConnectorDnsResolution;
  /** Transport protocol policy */
  transportPolicy?: ConnectorTransportPolicy;
  /** HTTP version preference */
  httpVersionPolicy?: ConnectorHttpVersionPolicy;
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
  method?: ConnectorLoadBalanceMethod;
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
  type: ConnectorHmacType;
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

export interface ConnectorModules {
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

export interface ConnectorStorageAttributes {
  /** Storage bucket name */
  bucket: string;
  /** Storage prefix */
  prefix?: string;
}

export interface ConnectorHttpAttributes {
  /** Array of addresses */
  addresses: ConnectorAddress[];
  /** Connection options */
  connectionOptions: ConnectorConnectionOptions;
  /** Modules configuration */
  modules?: ConnectorModules;
}

export interface ConnectorLiveIngestAttributes {
  /** Array of addresses */
  addresses: ConnectorAddress[];
  /** Connection options */
  connectionOptions: ConnectorConnectionOptions;
  /** Modules configuration */
  modules?: ConnectorModules;
}

export type ConnectorAttributes = ConnectorStorageAttributes | ConnectorHttpAttributes | ConnectorLiveIngestAttributes;

export interface AzionConnectorStorage {
  /** connector name */
  name: string;
  /** Active status */
  active?: boolean;
  /** Connector type */
  type: 'storage';
  /** Connector attributes */
  attributes: ConnectorStorageAttributes;
}

export interface AzionConnectorHttp {
  /** connector name */
  name: string;
  /** Active status */
  active?: boolean;
  /** Connector type */
  type: 'http';
  /** Connector attributes */
  attributes: ConnectorHttpAttributes;
}

export interface AzionConnectorLiveIngest {
  /** connector name */
  name: string;
  /** Active status */
  active?: boolean;
  /** Connector type */
  type: 'live_ingest';
  /** Connector attributes */
  attributes: ConnectorLiveIngestAttributes;
}

export type AzionConnector = AzionConnectorStorage | AzionConnectorHttp | AzionConnectorLiveIngest;

// Custom Pages V4 Types

export interface AzionCustomPageConnectorAttributes {
  /** Connector name or ID reference */
  connector: string | number;
  /** Time to live in seconds */
  ttl?: number;
  /** URI path */
  uri?: string | null;
  /** Custom status code */
  customStatusCode?: number | null;
}

export interface AzionCustomPageConnector {
  /** Page connector type */
  type?: CustomPageType;
  /** Page connector attributes */
  attributes: AzionCustomPageConnectorAttributes;
}

export interface AzionCustomPageEntry {
  /** Error code */
  code: CustomPageErrorCode;
  /** Page configuration */
  page: AzionCustomPageConnector;
}

export interface AzionCustomPage {
  /** Custom page name */
  name: string;
  /** Active status */
  active?: boolean;
  /** Array of error page configurations */
  pages: AzionCustomPageEntry[];
}

/**
 * Main configuration type for Azion.
 */
export type AzionConfig = {
  /** Build configuration */
  build?: AzionBuild;
  /** Application configuration */
  applications?: AzionApplication[];
  /** Functions configurations */
  functions?: AzionFunction[];
  /** Connectors configuration */
  connectors?: AzionConnector[];
  /** Storage configurations */
  storage?: AzionBucket[];
  /** Firewall configuration */
  firewall?: AzionFirewall[];
  /** Network list configurations */
  networkList?: AzionNetworkList[];
  /** Purge configurations */
  purge?: AzionPurge[];
  /** WAF configuration */
  waf?: AzionWaf[];
  /** Workload configuration */
  workloads?: AzionWorkload[];
  /** Custom pages configuration */
  customPages?: AzionCustomPage[];
};

// Rule Types - Separados corretamente baseado no behaviors.yml

// Behaviors comuns (podem ser usados em request E response)
export type AzionCommonRuleBehaviorType =
  | 'deliver'
  | 'redirect_to_301'
  | 'redirect_to_302'
  | 'enable_gzip'
  | 'run_function'
  | 'capture_match_groups';

// Behaviors apenas para request phase
export type AzionRequestOnlyBehaviorType =
  | 'deny'
  | 'no_content'
  | 'finish_request_phase'
  | 'forward_cookies'
  | 'optimize_images'
  | 'bypass_cache'
  | 'filter_request_cookie'
  | 'set_origin'
  | 'redirect_http_to_https'
  | 'set_connector'
  | 'set_cache_policy'
  | 'rewrite_request'
  | 'add_request_header'
  | 'filter_request_header'
  | 'add_request_cookie';

// Behaviors apenas para response phase
export type AzionResponseOnlyBehaviorType =
  | 'filter_response_cookie'
  | 'set_cookie'
  | 'add_response_header'
  | 'filter_response_header';

// Union types para cada phase
export type AzionRequestRuleBehaviorType = AzionCommonRuleBehaviorType | AzionRequestOnlyBehaviorType;
export type AzionResponseRuleBehaviorType = AzionCommonRuleBehaviorType | AzionResponseOnlyBehaviorType;
export type AzionRuleBehaviorType = AzionRequestRuleBehaviorType | AzionResponseRuleBehaviorType;

// Rule phase type
export type AzionRulePhase = 'request' | 'response';

// Rule Criteria (array de arrays como especificado na API)
export type AzionRuleCriteriaArray = AzionRuleCriteria[][];

// Base behavior interface
export interface AzionRuleBehaviorBase {
  type: AzionRuleBehaviorType;
}

// Rule Behaviors - No Args (sem argumentos)
export interface AzionRuleNoArgsBehavior extends AzionRuleBehaviorBase {
  type:
    | 'deny'
    | 'no_content'
    | 'deliver'
    | 'finish_request_phase'
    | 'forward_cookies'
    | 'optimize_images'
    | 'bypass_cache'
    | 'enable_gzip'
    | 'redirect_http_to_https';
}

// Rule Behaviors - String (com valor string)
export interface AzionRuleStringBehavior extends AzionRuleBehaviorBase {
  type: 'redirect_to_301' | 'redirect_to_302' | 'rewrite_request' | 'filter_response_cookie';
  attributes: {
    value: string;
  };
}

// Rule Behaviors - Run Function
export interface AzionRuleRunFunctionBehavior extends AzionRuleBehaviorBase {
  type: 'run_function';
  attributes: {
    value: string | number; // Nome da função (validado) ou ID (direto)
  };
}

// Rule Behaviors - Set Cache Policy
export interface AzionRuleSetCachePolicyBehavior extends AzionRuleBehaviorBase {
  type: 'set_cache_policy';
  attributes: {
    value: string | number; // Nome da cache policy (validado) ou ID (direto)
  };
}

// Rule Behaviors - Set Connector
export interface AzionRuleSetConnectorBehavior extends AzionRuleBehaviorBase {
  type: 'set_connector';
  attributes: {
    value: string | number; // Nome do connector (validado) ou ID (direto)
  };
}

// Rule Behaviors - Set Origin
export interface AzionRuleSetOriginBehavior extends AzionRuleBehaviorBase {
  type: 'set_origin';
  attributes: {
    value: string | number; // Nome do origin (validado) ou ID (direto)
  };
}

// Rule Behaviors - Header (para add/filter headers)
export interface AzionRuleHeaderBehavior extends AzionRuleBehaviorBase {
  type: 'add_request_header' | 'add_response_header' | 'filter_request_header' | 'filter_response_header';
  attributes: {
    value: string;
  };
}

// Rule Behaviors - Cookie (para add/filter cookies)
export interface AzionRuleCookieBehavior extends AzionRuleBehaviorBase {
  type: 'add_request_cookie' | 'filter_request_cookie' | 'set_cookie' | 'filter_response_cookie';
  attributes: {
    value: string;
  };
}

// Rule Behaviors - Capture Match Groups
export interface AzionRuleCaptureGroupsBehavior extends AzionRuleBehaviorBase {
  type: 'capture_match_groups';
  attributes: {
    regex: string;
    subject: string;
    captured_array: string;
  };
}

// Union type para todos os behaviors
export type AzionRuleBehavior =
  | AzionRuleNoArgsBehavior
  | AzionRuleStringBehavior
  | AzionRuleRunFunctionBehavior
  | AzionRuleSetCachePolicyBehavior
  | AzionRuleSetConnectorBehavior
  | AzionRuleSetOriginBehavior
  | AzionRuleHeaderBehavior
  | AzionRuleCookieBehavior
  | AzionRuleCaptureGroupsBehavior;

/**
 * Rule configuration for Azion.
 */
export type AzionRule = {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Indicates if the rule is active */
  active?: boolean;
  /** Array of criteria arrays */
  criteria: AzionRuleCriteriaArray;
  /** Array of behaviors */
  behaviors: AzionRuleBehavior[];
};

/**
 * Rules configuration for Azion.
 */
export type AzionRules = {
  /** Request rules */
  request?: AzionRule[];
  /** Response rules */
  response?: AzionRule[];
};

/**
 * Manifest Rule for API (with phase).
 */
export type AzionManifestRule = {
  /** Rule phase */
  phase: AzionRulePhase;
  /** Rule data */
  rule: AzionRule;
};
