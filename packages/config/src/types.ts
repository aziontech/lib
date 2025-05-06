import {
  ApplicationHttpPort,
  ApplicationHttpsPort,
  ApplicationSupportedCipher,
  FirewallRateLimitBy,
  FirewallRateLimitType,
  FirewallWafMode,
  FunctionInitiatorType,
  NetworkListType,
  RuleConditional,
  RuleOperatorWithValue,
  RuleOperatorWithoutValue,
  RuleVariable,
  WafMode,
  WafSensitivity,
  WorkloadHttpVersion,
  WorkloadNetworkMap,
  WorkloadTlsMinimumVersion,
} from './constants';

import { FetchEvent } from 'azion/types';

import { BuildOptions as ESBuildConfig, type Plugin as EsbuildPlugin } from 'esbuild';
import { Configuration as WebpackConfig, type WebpackPluginInstance as WebpackPlugin } from 'webpack';

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
 * Cache configuration for Azion v4.
 */
export type AzionCache = {
  /** Cache name */
  name: string;
  /** Browser cache settings */
  browser: {
    /** Behavior: 'honor', 'override', or 'no-cache' */
    behavior: 'honor' | 'override' | 'no-cache';
    /** Maximum age in seconds */
    maxAge: number;
  };
  /** Edge cache settings */
  edge: {
    /** Behavior: 'honor' or 'override' */
    behavior: 'honor' | 'override';
    /** Maximum age in seconds */
    maxAge: number;
  };
  /** Enable caching for POST requests */
  enablePost?: boolean;
  /** Enable caching for OPTIONS requests */
  enableOptions?: boolean;
  /** Enable stale cache */
  stale?: boolean;
  /** Enable tiered cache */
  tieredCache?: boolean;
  /** Tiered cache region */
  tieredRegion?: string;
  /** Application controls */
  controls: {
    /** Cache by query string */
    queryString: 'ignore' | 'whitelist' | 'blacklist' | 'all';
    /** Query string fields */
    queryStringFields: string[];
    /** Enable query string sort */
    queryStringSort: boolean;
    /** Cache by cookies */
    cookies: 'ignore' | 'whitelist' | 'blacklist' | 'all';
    /** Cookie names */
    cookieNames: string[];
    /** Adaptive delivery action */
    adaptiveDelivery: 'ignore' | 'whitelist';
    /** Device group */
    deviceGroup: number[];
  };
  /** Slice controls */
  slice?: {
    /** Enable slice configuration */
    enabled: boolean;
    /** Enable slice edge caching */
    edgeCaching: boolean;
    /** Enable slice tiered caching */
    tieredCaching: boolean;
    /** Slice configuration range */
    range?: number;
  };
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
  inputValue: string;
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
    runFunction?: string;
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
    /** Set a new connector */
    setEdgeConnector?: {
      /** Connector name */
      name: string;
    };
    /** Finish request phase */
    finishRequestPhase?: boolean | null;
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
    runFunction?: string;
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
  items?: string[];
  /** Cache layer to be purged */
  layer?: 'edge_cache' | 'tiered_cache';
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
 * Network list configuration for Azion.
 */
export type AzionNetworkList = {
  /** Network list identifier */
  id: number;
  /** Network list type */
  listType: NetworkListType;
  /** List of networks */
  listContent: string[] | number[];
};

/**
 * Function configuration for Azion.
 */
export type AzionFunction = {
  /** Function name */
  name: string;
  /** Function path */
  path: string;
  /** Optional arguments to be passed to the function */
  args?: Record<string, unknown>;
  /** Initiator type (edge_application or edge_firewall) */
  initiatorType?: FunctionInitiatorType;
};

/**
 * TLS configuration for Workloads.
 *
 * Replaces and expands the digitalCertificateId from the old domain configuration
 * with more comprehensive TLS options like cipher selection and minimum version.
 */
export type AzionWorkloadTls = {
  /** Certificate ID */
  certificate?: number | null;
  /** Cipher suites */
  ciphers?: ApplicationSupportedCipher | null;
  /** Minimum TLS version */
  minimumVersion?: WorkloadTlsMinimumVersion;
};

/**
 * HTTP Protocol configuration for Workloads.
 */
export type AzionWorkloadHttpProtocol = {
  /** HTTP versions */
  versions?: WorkloadHttpVersion[];
  /** HTTP ports */
  httpPorts?: ApplicationHttpPort[];
  /** HTTPS ports */
  httpsPorts?: ApplicationHttpsPort[];
  /** QUIC ports */
  quicPorts?: number[] | null;
};

/**
 * Protocol configuration for Workloads.
 */
export type AzionWorkloadProtocols = {
  /** HTTP protocol configuration */
  http?: AzionWorkloadHttpProtocol;
};

/**
 * Mutual TLS configuration for Workloads.
 *
 * Enhanced version of the mtls configuration from the old domain type,
 * with improved organization and more clearly defined parameters.
 */
export type AzionWorkloadMtls = {
  /** Verification mode */
  verification?: 'enforce' | 'permissive';
  /** Certificate ID */
  certificate?: number | null;
  /** Certificate Revocation List */
  crl?: number[] | null;
};

/**
 * Domain information for Workloads.
 *
 * This replaces the standalone AzionDomain configuration in the API v4.
 * While more streamlined, it provides the essential domain configuration within the workload context.
 * Multiple domains can be specified in the workload's domains array.
 */
export type AzionWorkloadDomainInfo = {
  /** Domain name */
  domain?: string | null;
  /** Allow access to this domain */
  allowAccess?: boolean;
};

/**
 * Workload configuration for Azion.
 *
 * This is part of the API v4 and represents a more complete and powerful approach
 * compared to the old domain configuration. It includes domain capabilities plus
 * additional features like protocol settings, alternate domains, and improved TLS configuration.
 *
 * Workload should be preferred over domain for new applications.
 */
export type AzionWorkload = {
  /** Workload name */
  name: string;
  /** Alternate domains */
  alternateDomains?: string[];
  /** Edge application ID */
  edgeApplication: number;
  /** Active status */
  active?: boolean;
  /** Network map (1 - Edge Global Network, 2 - Staging Network) */
  networkMap?: WorkloadNetworkMap;
  /** Edge firewall ID */
  edgeFirewall?: number | null;
  /** TLS configuration */
  tls?: AzionWorkloadTls;
  /** Protocol configuration */
  protocols?: AzionWorkloadProtocols;
  /** Mutual TLS configuration */
  mtls?: AzionWorkloadMtls;
  /** Domain information (replaces the old domain configuration) */
  domains?: AzionWorkloadDomainInfo[];
};

/**
 * Application configuration for Azion.
 */
export type AzionApplication = {
  /** Application name */
  name: string;
  /** Enable edge cache */
  edgeCache?: boolean;
  /** Enable edge functions */
  edgeFunctions?: boolean;
  /** Enable application accelerator */
  applicationAccelerator?: boolean;
  /** Enable image processor */
  imageProcessor?: boolean;
  /** Enable tiered cache */
  tieredCache?: boolean;
  /** Active status */
  active?: boolean;
  /** Debug mode */
  debug?: boolean;
  /** Rules configuration */
  rules?: AzionRules;
  /** Cache configurations */
  cache?: AzionCache[];
  /** Functions configurations */
  functions?: AzionFunction[];
};

/**
 * Connector configuration for Azion API v4.
 */
export type AzionConnector = {
  /** Connector ID */
  id?: number;
  /** Connector name */
  name: string;
  /** Connector type (atualmente apenas 'http') */
  type: 'http';
  /** Status do connector */
  active?: boolean;
  /** Endereços para o connector */
  addresses?: {
    /** Endereço */
    address: string;
    /** Peso para balanceamento de carga */
    weight?: number;
    /** Indica se está ativo */
    serverRole?: string;
    /** Estado do endereço */
    status?: string;
  }[];
  /** Módulos do connector */
  modules?: {
    /** Habilita balanceamento de carga */
    loadBalancerEnabled?: boolean;
    /** Habilita Origin Shield */
    originShieldEnabled?: boolean;
  };
  /** Configuração TLS */
  tls?: {
    /** Política TLS */
    policy?: 'off' | 'enforce' | 'custom';
    /** Certificado para custom TLS */
    certificate?: number;
    /** Certificados para custom TLS */
    certificates?: number[];
    /** Secret para custom TLS */
    secret?: string;
    /** SNI para custom TLS */
    sni?: string;
  };
  /** Método de balanceamento de carga */
  loadBalanceMethod?: 'off' | 'round_robin' | 'ip_hash' | 'least_connections';
  /** Preferência de conexão */
  connectionPreference?: ('IPv4' | 'IPv6')[];
  /** Timeout de conexão em segundos */
  connectionTimeout?: number;
  /** Timeout de leitura/escrita em segundos */
  readWriteTimeout?: number;
  /** Máximo de tentativas */
  maxRetries?: number;
  /** Propriedades específicas do tipo */
  typeProperties?: {
    /** Versões HTTP suportadas */
    versions?: ('http1' | 'http2')[];
    /** Host header */
    host?: string;
    /** Caminho */
    path?: string;
    /** Seguir redirecionamentos */
    followingRedirect?: boolean;
    /** Header de IP real */
    realIpHeader?: string;
    /** Header de porta real */
    realPortHeader?: string;
  };
};

/**
 * Main configuration type for Azion.
 */
export type AzionConfig = {
  /** Build configuration */
  build?: AzionBuild;
  /** Origin configurations */
  origin?: AzionOrigin[];
  /** Cache configurations */
  cache?: AzionCache[];
  /** Functions configurations */
  functions?: AzionFunction[];
  /** Rules configuration */
  rules?: AzionRules;
  /** Purge configurations */
  purge?: AzionPurge[];
  /** Firewall configuration */
  firewall?: AzionFirewall;
  /** Network list configurations */
  networkList?: AzionNetworkList[];
  /** WAF configuration */
  waf?: AzionWaf[];
  /**
   * Workload configuration
   * API v4 feature that provides comprehensive domain and application configuration
   * capabilities including TLS, protocols, and enhanced domain settings.
   */
  workload?: AzionWorkload;
  /**
   * Application configurations
   * API v4 feature that provides comprehensive edge application configuration
   */
  application?: AzionApplication[];
  /** Connector configurations for API v4 */
  connectors?: AzionConnector[];
};

/**
 * Firewall behavior configuration for Azion.
 */
export type AzionFirewallBehavior = {
  /** Run a serverless function */
  runFunction?: string;
  /** Set WAF ruleset */
  setWafRuleset?: {
    /** WAF mode */
    wafMode: FirewallWafMode;
    /** WAF ID */
    wafId: string;
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
  /** Input value for comparison */
  inputValue: string;
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
  rules?: AzionFirewallRule[];
  /** Debug mode */
  debugRules?: boolean;
};

export type AzionWaf = {
  /** WAF ID */
  id?: number;
  /** WAF name */
  name: string;
  /** WAF mode */
  mode: WafMode;
  /** WAF active */
  active: boolean;
  /** WAF sqlInjection */
  sqlInjection?: {
    sensitivity: WafSensitivity;
  };
  /** WAF remoteFileInclusion */
  remoteFileInclusion?: {
    sensitivity: WafSensitivity;
  };
  /** WAF directoryTraversal */
  directoryTraversal?: {
    sensitivity: WafSensitivity;
  };
  /** WAF crossSiteScripting */
  crossSiteScripting?: {
    sensitivity: WafSensitivity;
  };
  /** WAF evadingTricks */
  evadingTricks?: {
    sensitivity: WafSensitivity;
  };
  /** WAF fileUpload */
  fileUpload?: {
    sensitivity: WafSensitivity;
  };
  /** WAF unwantedAccess */
  unwantedAccess?: {
    sensitivity: WafSensitivity;
  };
  /** WAF identifiedAttack */
  identifiedAttack?: {
    sensitivity: WafSensitivity;
  };
  /** WAF bypassAddress */
  bypassAddresses?: string[];
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
  handler?: (event: FetchEvent) => Promise<Response>;
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
