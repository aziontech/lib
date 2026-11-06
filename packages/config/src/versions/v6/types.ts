import type {
  AzionBuild,
  AzionCache,
  AzionFunction,
  AzionFunctionInstance,
  AzionRules,
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
  DEPLOYMENT_POLICIES,
  ENVIRONMENT_BRANCH_TRACKING_MODES,
  ENVIRONMENT_LOG_VERBOSITY,
  ENVIRONMENT_ROBOTS_POLICIES,
  FIREWALL_NO_ARGS_BEHAVIORS,
  FIREWALL_RATE_LIMIT_BY,
  FIREWALL_RATE_LIMIT_TYPES,
  FIREWALL_RULE_CONDITIONAL,
  FIREWALL_RULE_OPERATORS,
  FIREWALL_WAF_MODES,
  NETWORK_LIST_TYPES,
  WAF_ENGINE_TYPES,
  WAF_ENGINE_VERSIONS,
  WAF_RULESETS,
  WAF_SENSITIVITY,
  WAF_THREAT_TYPES,
  WORKLOAD_DEPLOYMENT_STRATEGY_TYPES,
  WORKLOADS_ACCESS_TYPES,
} from './constants';

/**
 * Function of the Azion API v6.
 */
export type AzionFunctionV6 = AzionFunction;

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
  /** Rules configuration */
  rules?: AzionRules;
  /** Function instances */
  functionsInstances?: AzionFunctionInstance[];
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
 * Binding of a workload to an environment and one of its deployments.
 */
export type AzionWorkloadBindingV6 = {
  /** Name of an environment declared in `environments` */
  environment: string;
  /** Name of a deployment declared in the `deployments` of the same workload */
  deployment: string;
  /** Domains served by the binding */
  domains?: AzionWorkloadBindingDomainV6[];
};

/**
 * Deployment of a workload of the Azion API v6.
 */
export type AzionWorkloadDeploymentV6 = {
  /** Deployment name */
  name: string;
  /** Whether it is the current deployment of the workload */
  current?: boolean;
  /** Whether the deployment is active */
  active?: boolean;
  /** What the deployment serves */
  strategy: {
    type: (typeof WORKLOAD_DEPLOYMENT_STRATEGY_TYPES)[number];
    attributes: {
      /** Name or ID of the application */
      application: string | number;
      /** Name or ID of the firewall */
      firewall?: string | number | null;
      /** Name or ID of the custom page */
      customPage?: string | number | null;
    };
  };
};

/**
 * Workload of the Azion API v6.
 */
export type AzionWorkloadV6 = {
  name: string;
  active?: boolean;
  infrastructure?: WorkloadInfrastructure;
  tls?: AzionWorkloadTLSV6;
  protocols?: AzionWorkloadProtocols;
  mtls?: AzionWorkloadMTLS;
  workloadDomainAllowAccess?: boolean;
  /** Deployments of the workload: the application, firewall and custom page each one serves */
  deployments?: AzionWorkloadDeploymentV6[];
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
  deploymentPolicy: (typeof DEPLOYMENT_POLICIES)[number];
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
  active?: boolean;
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
  /** Indicates if the connector is active */
  active?: boolean;
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
  /** Active status */
  active?: boolean;
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
  /** Active status */
  active?: boolean;
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
  active?: boolean;
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
  active?: boolean;
  debugRules?: boolean;
  /** Enable the functions module */
  functions?: boolean;
  /** Enable the network protection module */
  networkProtection?: boolean;
  /** Enable the waf module */
  waf?: boolean;
  rules?: AzionFirewallRuleV6[];
  functionsInstances?: AzionFunctionInstance[];
};

/**
 * WAF of the Azion API v6.
 */
export type AzionWafV6 = {
  name: string;
  active?: boolean;
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
  layer?: 'cache' | 'tiered_cache';
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
  /** Purge configurations */
  purge?: AzionPurgeV6[];
};
