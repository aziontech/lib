import type {
  AzionBuild,
  AzionCache,
  AzionFunction,
  AzionFunctionInstance,
  AzionRule,
  AzionWorkloadMTLS,
  AzionWorkloadProtocols,
  WorkloadInfrastructure,
  WorkloadTLSCipher,
  WorkloadTLSVersion,
} from '../../types';
import type {
  CONNECTOR_DNS_RESOLUTION,
  CONNECTOR_HMAC_TYPE,
  CONNECTOR_HTTP_VERSION_POLICY,
  CONNECTOR_LIVE_INGEST_REGIONS,
  CONNECTOR_LOAD_BALANCE_METHOD,
  CONNECTOR_SERVER_ROLES,
  CONNECTOR_TRANSPORT_POLICY,
  CUSTOM_PAGE_ERROR_CODES,
  CUSTOM_PAGE_TYPES,
  DEPLOYMENT_BINDING_POLICIES,
  DEPLOYMENT_POLICIES,
  ENVIRONMENT_DEPLOYMENT_POLICIES,
  ENVIRONMENT_BRANCH_TRACKING_MODES,
  ENVIRONMENT_LOG_VERBOSITY,
  ENVIRONMENT_ROBOTS_POLICIES,
  FIREWALL_NO_ARGS_BEHAVIORS,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_RULE_CONDITIONAL,
  FIREWALL_RULE_OPERATORS,
  FIREWALL_WAF_MODES,
  FUNCTION_DEPENDENCY_TYPES,
  NETWORK_LIST_TYPES,
  WAF_ENGINE_TYPES,
  WAF_ENGINE_VERSIONS,
  WAF_RULESETS,
  WAF_SENSITIVITY,
  WAF_THREAT_TYPES,
  WORKLOADS_ACCESS_TYPES,
} from './constants';

/**
 * Resource a function uses at runtime, which a release includes with the function.
 */
export type AzionFunctionDependencyV6 = {
  type: (typeof FUNCTION_DEPENDENCY_TYPES)[number];
  /** Name of a connector or network list declared in the config, or its ID */
  ref: string | number;
};

/**
 * Function of the Azion API v6 (it has no `active`).
 */
export type AzionFunctionV6 = Omit<AzionFunction, 'active'> & {
  /** Connectors and network lists the function uses at runtime (at most 20) */
  dependencies?: AzionFunctionDependencyV6[];
};

/**
 * Function instance of the Azion API v6 (it has no `active`).
 */
export type AzionFunctionInstanceV6 = Omit<AzionFunctionInstance, 'active'>;

/**
 * Rule of the Azion API v6 (it has no `active`).
 */
export type AzionRuleV6 = Omit<AzionRule, 'active'>;

/**
 * Rules of an application of the Azion API v6.
 */
export type AzionRulesV6 = {
  /** Request rules */
  request?: AzionRuleV6[];
  /** Response rules */
  response?: AzionRuleV6[];
};

/**
 * Device group of an application of the Azion API v6.
 */
export type AzionDeviceGroupV6 = {
  /** Device group name */
  name: string;
  /** User agent regex pattern */
  userAgent: string;
};

/**
 * Application of the Azion API v6.
 */
export type AzionApplicationV6 = {
  /** Application name */
  name: string;
  /** Enable edge cache */
  /** The cache module cannot be disabled, so it can only be true */
  edgeCacheEnabled?: true;
  /** Enable functions */
  functionsEnabled?: boolean;
  /** Enable application accelerator */
  applicationAcceleratorEnabled?: boolean;
  /** Enable image processor */
  imageProcessorEnabled?: boolean;
  /** Enable debug mode */
  debug?: boolean;
  /** Cache settings */
  cache?: AzionCache[];
  /** Rules configuration */
  rules?: AzionRulesV6;
  /** Function instances */
  functionsInstances?: AzionFunctionInstanceV6[];
  /** Device groups */
  deviceGroups?: AzionDeviceGroupV6[];
};

/**
 * TLS of a workload of the Azion API v6. The certificate is set per domain, in the bindings.
 */
export type AzionWorkloadTLSV6 = {
  ciphers?: WorkloadTLSCipher;
  minimumVersion?: WorkloadTLSVersion | null;
};

/**
 * Domain served by a workload binding.
 */
export type AzionWorkloadBindingDomainV6 = {
  /** Domain name */
  domain: string;
  /** Digital certificate ID */
  certificate?: number | null;
};

/**
 * Binding of a workload to an environment and a deployment.
 */
export type AzionWorkloadBindingV6 = {
  /** Name of an environment declared in `environments` */
  environment: string;
  /** Name of a deployment declared in `deployments` */
  deployment: string;
  /** Domains served by the binding */
  domains?: AzionWorkloadBindingDomainV6[];
};

/**
 * Workload of the Azion API v6.
 */
export type AzionWorkloadV6 = {
  name: string;
  infrastructure?: WorkloadInfrastructure;
  tls?: AzionWorkloadTLSV6;
  protocols?: AzionWorkloadProtocols;
  mtls?: AzionWorkloadMTLS;
  workloadDomainAllowAccess?: boolean;
  /** Environments and deployments the workload is bound to, with the domains of each binding */
  bindings?: AzionWorkloadBindingV6[];
};

/**
 * Environment of the Azion API v6.
 */
export type AzionEnvironmentV6 = {
  /** Environment name */
  name: string;
  description?: string | null;
  logVerbosity?: (typeof ENVIRONMENT_LOG_VERBOSITY)[number];
  robotsPolicy?: (typeof ENVIRONMENT_ROBOTS_POLICIES)[number];
  protection?: {
    azionAuthentication?: { enabled: boolean };
    passwordProtection?: { enabled: boolean; secretId: string | null };
    ipAllowlist?: { enabled: boolean; cidrs: string[] };
    ssoEnforcement?: { enabled: boolean; idpId: string | null; allowedDomains: string[] };
  };
  branchTracking?: {
    enabled: boolean;
    mode: (typeof ENVIRONMENT_BRANCH_TRACKING_MODES)[number];
    branchMatch: string;
  } | null;
  /** How the releases of the environment are served. Required by the API, and it cannot be changed afterwards */
  deploymentPolicy: (typeof ENVIRONMENT_DEPLOYMENT_POLICIES)[number];
};

/**
 * Deployment of the Azion API v6.
 */
export type AzionDeploymentV6 = {
  /** Deployment name */
  name: string;
  description?: string | null;
  /** Whether a release can swap the resources of the deployment. Required by the API */
  bindingPolicy: (typeof DEPLOYMENT_BINDING_POLICIES)[number];
  deploymentPolicy?: (typeof DEPLOYMENT_POLICIES)[number];
  strategyDefaults?: {
    skewProtection?: { enabled: boolean; defaultTtlSeconds: number };
  };
};

/**
 * Storage (bucket) of the Azion API v6.
 */
export type AzionStorageV6 = {
  /** Storage name */
  name: string;
  /** Access of the workloads to the storage */
  workloadsAccess?: (typeof WORKLOADS_ACCESS_TYPES)[number];
  /** Local directory whose files are uploaded to the storage */
  dir: string;
  /** Prefix the files are uploaded under, which the storage connectors read from */
  prefix?: string;
};

/**
 * Address of an HTTP connector.
 */
export type AzionConnectorAddressV6 = {
  /** IPv4/IPv6 address or CNAME */
  address: string;
  httpPort?: number;
  httpsPort?: number;
  /** Address modules */
  modules?: {
    loadBalancer?: {
      serverRole?: (typeof CONNECTOR_SERVER_ROLES)[number];
      weight?: number;
    };
  };
};

/**
 * Attributes of an HTTP connector.
 */
export type AzionConnectorHttpAttributesV6 = {
  addresses: AzionConnectorAddressV6[];
  connectionOptions?: {
    dnsResolution?: (typeof CONNECTOR_DNS_RESOLUTION)[number];
    transportPolicy?: (typeof CONNECTOR_TRANSPORT_POLICY)[number];
    httpVersionPolicy?: (typeof CONNECTOR_HTTP_VERSION_POLICY)[number];
    host?: string;
    pathPrefix?: string;
    followingRedirect?: boolean;
    realIpHeader?: string;
    realPortHeader?: string;
  };
  modules?: {
    loadBalancer?: {
      enabled: boolean;
      config?: {
        method?: (typeof CONNECTOR_LOAD_BALANCE_METHOD)[number];
        maxRetries?: number;
        connectionTimeout?: number;
        readWriteTimeout?: number;
      };
    };
    originShield?: {
      enabled: boolean;
      config?: {
        originIpAcl?: { enabled?: boolean };
        hmac?: {
          enabled: boolean;
          config?: {
            type?: (typeof CONNECTOR_HMAC_TYPE)[number];
            attributes: {
              region: string;
              service?: string;
              accessKey: string;
              secretKey: string;
            };
          };
        };
      };
    };
  };
};

type AzionConnectorBaseV6 = {
  /** Connector name */
  name: string;
};

/**
 * Connector of the Azion API v6.
 */
export type AzionConnectorV6 =
  | (AzionConnectorBaseV6 & { type: 'http'; attributes: AzionConnectorHttpAttributesV6 })
  | (AzionConnectorBaseV6 & { type: 'storage'; attributes: { bucket: string; prefix?: string } })
  | (AzionConnectorBaseV6 & {
      type: 'live_ingest';
      attributes: { region: (typeof CONNECTOR_LIVE_INGEST_REGIONS)[number] };
    });

/**
 * Page of a custom page, served for an error code.
 */
export type AzionCustomPageEntryV6 = {
  /** Error code the page is served for (or `default`) */
  code: (typeof CUSTOM_PAGE_ERROR_CODES)[number];
  page: {
    type?: (typeof CUSTOM_PAGE_TYPES)[number];
    attributes: {
      /** Name of a connector declared in `connectors`, or its id */
      connector: string | number;
      /** Time to live in seconds */
      ttl?: number;
      /** Path the connector is requested with */
      uri?: string | null;
      customStatusCode?: number | null;
    };
  };
};

/**
 * Custom pages of the Azion API v6.
 */
export type AzionCustomPageV6 = {
  /** Custom page name */
  name: string;
  /** Pages, one for each error code */
  pages: AzionCustomPageEntryV6[];
};

/**
 * Network list of the Azion API v6.
 */
export type AzionNetworkListV6 = {
  /** Network list name */
  name: string;
  /** Type of the items: IP addresses (with or without CIDR), ASNs or country codes */
  type: (typeof NETWORK_LIST_TYPES)[number];
  /** Items of the list */
  items: string[];
};

/**
 * Criterion of a firewall rule. The argument is optional (the operators `exists` and `does_not_exist` do not take one).
 */
export type AzionFirewallCriterionV6 = {
  /** Variable, with or without `${}` */
  variable: string;
  conditional: (typeof FIREWALL_RULE_CONDITIONAL)[number];
  operator: (typeof FIREWALL_RULE_OPERATORS)[number];
  argument?: string | number | null;
};

/**
 * Behavior of a firewall rule. `run_function` and `set_waf` reference a function and a waf by name or by id.
 */
export type AzionFirewallBehaviorV6 =
  | { type: 'run_function'; attributes: { value: string | number } }
  | { type: 'set_waf'; attributes: { mode: (typeof FIREWALL_WAF_MODES)[number]; wafId: string | number } }
  | {
      type: 'set_rate_limit';
      attributes: {
        type?: (typeof FIREWALL_RATE_LIMIT_TYPES)[number];
        limitBy: (typeof FIREWALL_RATE_LIMIT_BY)[number];
        averageRateLimit: number;
        maximumBurstSize?: number | null;
      };
    }
  | { type: (typeof FIREWALL_NO_ARGS_BEHAVIORS)[number] }
  | {
      type: 'set_custom_response';
      attributes: { statusCode: number; contentType?: string; contentBody?: string };
    };

/**
 * Rule of a firewall: either `criteria`, or `match` and `variable` together (a `matches` criterion).
 */
export type AzionFirewallRuleV6 = {
  name: string;
  description?: string;
  /** Regex the variable must match */
  match?: string;
  variable?: string;
  criteria?: AzionFirewallCriterionV6[];
  behaviors: AzionFirewallBehaviorV6[];
};

/**
 * Firewall of the Azion API v6.
 */
export type AzionFirewallV6 = {
  name: string;
  debugRules?: boolean;
  /** Enable the functions module */
  functions?: boolean;
  /** Enable the network protection module */
  networkProtection?: boolean;
  /** Enable the waf module */
  waf?: boolean;
  rules?: AzionFirewallRuleV6[];
  functionsInstances?: AzionFunctionInstanceV6[];
};

/**
 * WAF of the Azion API v6.
 */
export type AzionWafV6 = {
  name: string;
  engineSettings?: {
    engineVersion?: (typeof WAF_ENGINE_VERSIONS)[number];
    type?: (typeof WAF_ENGINE_TYPES)[number];
    attributes?: {
      rulesets?: (typeof WAF_RULESETS)[number][];
      thresholds?: {
        threat: (typeof WAF_THREAT_TYPES)[number];
        sensitivity?: (typeof WAF_SENSITIVITY)[number];
      }[];
    };
  };
};

/**
 * Purge of the Azion API v6.
 */
export type AzionPurgeV6 = {
  /** Items to be purged */
  items: string[];
  /** Cache layer to be purged */
  layer?: 'cache';
  /** Purge type */
  type: 'url' | 'cachekey' | 'wildcard';
};

/**
 * Config of the Azion API v6.
 */
export type AzionConfigV6 = {
  /** Azion API version this config targets. */
  version: 6;
  /** Build configuration (shared by every API version). */
  build?: AzionBuild;
  /** Functions */
  functions?: AzionFunctionV6[];
  /** Storage buckets */
  storage?: AzionStorageV6[];
  /** Custom pages */
  customPages?: AzionCustomPageV6[];
  /** Network lists */
  networkList?: AzionNetworkListV6[];
  /** WAFs */
  waf?: AzionWafV6[];
  /** Firewalls */
  firewall?: AzionFirewallV6[];
  /** Connectors */
  connectors?: AzionConnectorV6[];
  /** Applications */
  applications?: AzionApplicationV6[];
  /** Workloads */
  workloads?: AzionWorkloadV6[];
  /** Environments */
  environments?: AzionEnvironmentV6[];
  /** Deployments */
  deployments?: AzionDeploymentV6[];
  /** Purge configurations */
  purge?: AzionPurgeV6[];
};
