import type {
  AzionBuild,
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
  DEPLOYMENT_BINDING_POLICIES,
  DEPLOYMENT_POLICIES,
  ENVIRONMENT_BRANCH_TRACKING_MODES,
  ENVIRONMENT_LOG_VERBOSITY,
  ENVIRONMENT_ROBOTS_POLICIES,
  WORKLOADS_ACCESS_TYPES,
} from './constants';

/**
 * Function of the Azion API v6.
 * TODO: add `bindings` (storage) once the v6 config has storage.
 */
export type AzionFunctionV6 = Omit<AzionFunction, 'bindings'>;

/**
 * Application of the Azion API v6.
 * TODO: add the remaining resources of an application (cache settings, device groups).
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
  /** Rules configuration */
  rules?: AzionRules;
  /** Function instances */
  functionsInstances?: AzionFunctionInstance[];
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
  active?: boolean;
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
  deploymentPolicy?: (typeof DEPLOYMENT_POLICIES)[number];
};

/**
 * Deployment of the Azion API v6.
 */
export type AzionDeploymentV6 = {
  /** Deployment name */
  name: string;
  description?: string | null;
  bindingPolicy?: (typeof DEPLOYMENT_BINDING_POLICIES)[number];
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
 * Config of the Azion API v6.
 * TODO: structure placeholder. Add the remaining v6 resources once their schemas are defined.
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
};
