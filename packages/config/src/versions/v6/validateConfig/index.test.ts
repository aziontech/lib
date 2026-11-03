import { validateConfig } from '.';

describe('validateConfig (v6)', () => {
  describe('build', () => {
    it('accepts a complete build config', () => {
      expect(() =>
        validateConfig({
          version: 6,
          build: {
            bundler: 'esbuild',
            entry: { main: './src/index.js' },
            preset: 'next',
            polyfills: true,
            worker: false,
            memoryFS: { injectionDirs: ['./src/injected'], removePathPrefix: './src' },
          },
        }),
      ).not.toThrow();
    });

    it('accepts a preset declared as an object', () => {
      expect(() =>
        validateConfig({
          version: 6,
          build: {
            preset: { metadata: { name: 'custom' }, config: { version: 6, build: { bundler: 'esbuild' } } },
          },
        }),
      ).not.toThrow();
    });

    it('rejects an invalid bundler', () => {
      expect(() => validateConfig({ version: 6, build: { bundler: 'rollup' } })).toThrow(
        "The 'build.bundler' must be either 'webpack' or 'esbuild'",
      );
    });

    it('rejects unknown properties in build', () => {
      expect(() => validateConfig({ version: 6, build: { unknown: true } })).toThrow(
        "No additional properties are allowed in the 'build' object",
      );
    });

    it('rejects an invalid entry', () => {
      expect(() => validateConfig({ version: 6, build: { entry: 1 } })).toThrow(
        "The 'build.entry' must be a string, array of strings, or object with string values",
      );
    });
  });

  describe('applications', () => {
    it('accepts a complete application', () => {
      expect(() =>
        validateConfig({
          version: 6,
          applications: [
            {
              name: 'my-app',
              active: true,
              debug: false,
              edgeCacheEnabled: true,
              functionsEnabled: true,
              applicationAcceleratorEnabled: false,
              imageProcessorEnabled: false,
            },
          ],
        }),
      ).not.toThrow();
    });

    it('requires the name', () => {
      expect(() => validateConfig({ version: 6, applications: [{ active: true }] })).toThrow(
        "The 'name' field is required in an application",
      );
    });

    it('accepts a name of 100 characters and rejects a longer one (v6 API limit)', () => {
      expect(() => validateConfig({ version: 6, applications: [{ name: 'a'.repeat(100) }] })).not.toThrow();
      expect(() => validateConfig({ version: 6, applications: [{ name: 'a'.repeat(101) }] })).toThrow(
        "The 'name' field must be a string with 1 to 100 characters",
      );
    });

    it('rejects an empty name', () => {
      expect(() => validateConfig({ version: 6, applications: [{ name: '' }] })).toThrow(
        "The 'name' field must be a string with 1 to 100 characters",
      );
    });

    it('rejects a flag that is not a boolean', () => {
      expect(() => validateConfig({ version: 6, applications: [{ name: 'a', functionsEnabled: 'yes' }] })).toThrow(
        "The 'functionsEnabled' field must be a boolean",
      );
    });

    it('rejects unknown properties in an application', () => {
      expect(() => validateConfig({ version: 6, applications: [{ name: 'a', unknown: true }] })).toThrow(
        'No additional properties are allowed in an application',
      );
    });

    it('rejects applications that are not an array', () => {
      expect(() => validateConfig({ version: 6, applications: {} })).toThrow(
        "The 'applications' field must be an array of application items.",
      );
    });
  });

  it('rejects properties the v6 schema does not know yet', () => {
    expect(() => validateConfig({ version: 6, firewall: [] })).toThrow(
      'Config can only contain the following properties: version, build, functions, storage, connectors, applications, workloads, environments, deployments',
    );
  });

  it('rejects another version', () => {
    expect(() => validateConfig({ version: 4, build: {} })).toThrow();
  });
});

describe('validateConfig (v6) functions', () => {
  it('accepts a complete function', () => {
    expect(() =>
      validateConfig({
        version: 6,
        functions: [
          {
            name: 'my-function',
            path: './functions/index.js',
            runtime: 'azion_js',
            defaultArgs: { key: 'value' },
            executionEnvironment: 'firewall',
            active: false,
          },
        ],
      }),
    ).not.toThrow();
  });

  it('requires name and path', () => {
    expect(() => validateConfig({ version: 6, functions: [{ path: './a.js' }] })).toThrow();
    expect(() => validateConfig({ version: 6, functions: [{ name: 'a' }] })).toThrow();
  });

  it('rejects an unknown runtime and execution environment', () => {
    expect(() => validateConfig({ version: 6, functions: [{ name: 'a', path: './a.js', runtime: 'node' }] })).toThrow(
      "The 'runtime' field must be 'azion_js'",
    );
    expect(() =>
      validateConfig({ version: 6, functions: [{ name: 'a', path: './a.js', executionEnvironment: 'edge' }] }),
    ).toThrow("The 'executionEnvironment' field must be 'application' or 'firewall'");
  });

  describe('bindings', () => {
    const binding = (bindings: unknown) => ({
      version: 6,
      functions: [{ name: 'my-function', path: './functions/index.js', bindings }],
    });

    it('accepts a storage binding with the bucket as a name or an id', () => {
      expect(() => validateConfig(binding({ storage: { bucket: 'my-bucket', prefix: 'assets' } }))).not.toThrow();
      expect(() => validateConfig(binding({ storage: { bucket: 10, prefix: '' } }))).not.toThrow();
      expect(() => validateConfig(binding({}))).not.toThrow();
    });

    it('requires the bucket and the prefix of a storage binding', () => {
      expect(() => validateConfig(binding({ storage: { bucket: 'my-bucket' } }))).toThrow(
        "The 'bucket' and 'prefix' fields are required in the storage object binding.",
      );
      expect(() => validateConfig(binding({ storage: { prefix: 'assets' } }))).toThrow();
    });

    it('rejects unknown properties in the bindings and in the storage binding', () => {
      expect(() => validateConfig(binding({ kv: {} }))).toThrow(
        'No additional properties are allowed in the bindings object',
      );
      expect(() =>
        validateConfig(binding({ storage: { bucket: 'my-bucket', prefix: 'assets', unknown: true } })),
      ).toThrow('No additional properties are allowed in the storage object binding.');
    });
  });
});

describe('validateConfig (v6) application functionsInstances and rules', () => {
  const app = (extra: Record<string, unknown>) => ({ version: 6, applications: [{ name: 'my-app', ...extra }] });
  const requestRule = (extra: Record<string, unknown> = {}) => ({
    name: 'rule',
    criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/' }]],
    behaviors: [{ type: 'deliver' }],
    ...extra,
  });

  describe('functionsInstances', () => {
    it('accepts an instance and requires name and ref', () => {
      expect(() =>
        validateConfig(app({ functionsInstances: [{ name: 'i', ref: 'fn', args: { a: 1 }, active: true }] })),
      ).not.toThrow();
      expect(() => validateConfig(app({ functionsInstances: [{ name: 'i', ref: 10 }] }))).not.toThrow();
      expect(() => validateConfig(app({ functionsInstances: [{ name: 'i' }] }))).toThrow(
        "The 'name' and 'ref' fields are required in each function instance",
      );
    });

    it('limits the name to 100 characters', () => {
      expect(() => validateConfig(app({ functionsInstances: [{ name: 'a'.repeat(100), ref: 'fn' }] }))).not.toThrow();
      expect(() => validateConfig(app({ functionsInstances: [{ name: 'a'.repeat(101), ref: 'fn' }] }))).toThrow(
        "The 'name' field must be a string between 1 and 100 characters",
      );
    });
  });

  describe('rules', () => {
    it('accepts request and response rules', () => {
      expect(() =>
        validateConfig(
          app({
            rules: {
              request: [requestRule({ description: 'd', active: true })],
              response: [requestRule({ behaviors: [{ type: 'add_response_header', attributes: { value: 'x: y' } }] })],
            },
          }),
        ),
      ).not.toThrow();
    });

    it('limits the rule name to 100 characters (v6 API limit, 250 in v4)', () => {
      const rules = (name: string) => ({ rules: { request: [requestRule({ name })] } });
      expect(() => validateConfig(app(rules('a'.repeat(100))))).not.toThrow();
      expect(() => validateConfig(app(rules('a'.repeat(101))))).toThrow(
        "The 'name' field must be a string between 1 and 100 characters.",
      );
    });

    it('validates the variables of each phase as the v6 API documents them', () => {
      const criteria = (variable: string) => [[{ variable, conditional: 'if', operator: 'exists' }]];
      const request = (variable: string) =>
        app({ rules: { request: [requestRule({ criteria: criteria(variable) })] } });
      const response = (variable: string) =>
        app({ rules: { response: [requestRule({ criteria: criteria(variable) })] } });

      // available in both phases in v6 (a single phase in v4)
      expect(() => validateConfig(request('${tcpinfo_rtt}'))).not.toThrow();
      expect(() => validateConfig(response('${server_addr}'))).not.toThrow();
      expect(() => validateConfig(response('${ssl_client_verify}'))).not.toThrow();
      // response only
      expect(() => validateConfig(response('${status}'))).not.toThrow();
      expect(() => validateConfig(request('${status}'))).toThrow();
      expect(() => validateConfig(request('${sent_http_x_header}'))).toThrow();
      expect(() => validateConfig(response('${sent_http_x_header}'))).not.toThrow();
      // v4 only
      expect(() => validateConfig(response('${sent_http_name}'))).not.toThrow(); // matches sent_http_<header_name>
    });

    it('requires the argument only for the operators with value', () => {
      const rule = (criterion: Record<string, unknown>) =>
        app({ rules: { request: [requestRule({ criteria: [[criterion]] })] } });
      expect(() => validateConfig(rule({ variable: '${uri}', conditional: 'if', operator: 'matches' }))).toThrow();
      expect(() =>
        validateConfig(rule({ variable: '${uri}', conditional: 'if', operator: 'exists', argument: 'x' })),
      ).toThrow();
    });

    it('does not accept the firewall operators in an application rule', () => {
      expect(() =>
        validateConfig(
          app({
            rules: {
              request: [
                requestRule({
                  criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'is_in_list', argument: '1' }]],
                }),
              ],
            },
          }),
        ),
      ).toThrow();
    });

    it('rejects a behavior that is not valid', () => {
      expect(() =>
        validateConfig(app({ rules: { request: [requestRule({ behaviors: [{ type: 'unknown' }] })] } })),
      ).toThrow();
    });
  });
});

describe('validateConfig (v6) workloads, environments and deployments', () => {
  const workload = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    workloads: [{ name: 'my-workload', ...extra }],
  });
  const environment = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    environments: [{ name: 'production', ...extra }],
  });
  const deployment = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    deployments: [{ name: 'default-deployment', ...extra }],
  });

  describe('workloads', () => {
    it('accepts a complete workload', () => {
      expect(() =>
        validateConfig(
          workload({
            active: true,
            infrastructure: 2,
            workloadDomainAllowAccess: false,
            tls: { ciphers: 3, minimumVersion: 'tls_1_2' },
            protocols: {
              http: { versions: ['http1', 'http2'], httpPorts: [80, 8080], httpsPorts: [443], quicPorts: null },
            },
            mtls: { enabled: true, config: { verification: 'permissive', certificate: 10, crl: [1, 2] } },
            bindings: [
              {
                environment: 'production',
                deployment: 'default-deployment',
                domains: [{ domain: 'example.com', certificate: 7 }, { domain: 'www.example.com' }],
              },
            ],
          }),
        ),
      ).not.toThrow();
    });

    it('requires only the name', () => {
      expect(() => validateConfig({ version: 6, workloads: [{ active: true }] })).toThrow(
        "The 'name' field is required in workloads",
      );
      expect(() => validateConfig(workload())).not.toThrow();
    });

    it('limits the name to 100 characters', () => {
      expect(() => validateConfig({ version: 6, workloads: [{ name: 'a'.repeat(100) }] })).not.toThrow();
      expect(() => validateConfig({ version: 6, workloads: [{ name: 'a'.repeat(101) }] })).toThrow(
        "The 'name' field must be a string between 1 and 100 characters",
      );
    });

    it('moved the domains and the certificate to the bindings', () => {
      expect(() => validateConfig(workload({ domains: ['example.com'] }))).toThrow(
        'No additional properties are allowed in workload items',
      );
      expect(() => validateConfig(workload({ tls: { certificate: 1 } }))).toThrow(
        'The certificate is set per domain in the bindings',
      );
    });

    it('does not accept a null tls.ciphers nor one out of range', () => {
      expect(() => validateConfig(workload({ tls: { ciphers: null } }))).toThrow(
        "The 'ciphers' must be an integer between 1-8",
      );
      expect(() => validateConfig(workload({ tls: { ciphers: 9 } }))).toThrow();
    });

    it('applies the limits of the http protocol of the v6 API', () => {
      const http = (extra: Record<string, unknown>) =>
        workload({ protocols: { http: { versions: ['http1'], httpPorts: [80], httpsPorts: [443], ...extra } } });

      expect(() => validateConfig(http({}))).not.toThrow();
      expect(() => validateConfig(http({ httpPorts: [] }))).toThrow();
      expect(() => validateConfig(http({ httpPorts: [80, 81, 82, 83, 84] }))).toThrow();
      expect(() => validateConfig(http({ httpsPorts: Array.from({ length: 13 }, (_, i) => 443 + i) }))).toThrow();
      expect(() => validateConfig(http({ quicPorts: Array.from({ length: 13 }, (_, i) => 443 + i) }))).toThrow();
      expect(() => validateConfig(http({ versions: ['http1', 'http2', 'http3', 'http1'] }))).toThrow();
    });

    it('requires environment and deployment in a binding', () => {
      expect(() => validateConfig(workload({ bindings: [{ environment: 'production' }] }))).toThrow(
        "The 'environment' and 'deployment' fields are required in each binding",
      );
      expect(() => validateConfig(workload({ bindings: [{ deployment: 'default-deployment' }] }))).toThrow();
    });

    it('requires the domain in a binding domain and rejects unknown properties', () => {
      const binding = (domains: unknown[]) =>
        workload({ bindings: [{ environment: 'production', deployment: 'default-deployment', domains }] });

      expect(() => validateConfig(binding([{ certificate: 1 }]))).toThrow(
        "The 'domain' field is required in each binding domain",
      );
      expect(() => validateConfig(binding([{ domain: 'a.com', unknown: true }]))).toThrow(
        'No additional properties are allowed in binding domains',
      );
    });
  });

  describe('environments', () => {
    it('accepts a complete environment', () => {
      expect(() =>
        validateConfig(
          environment({
            description: 'Production',
            logVerbosity: 'verbose',
            robotsPolicy: 'noindex',
            protection: {
              azionAuthentication: { enabled: true },
              passwordProtection: { enabled: true, secretId: 'secret' },
              ipAllowlist: { enabled: true, cidrs: ['10.0.0.0/8'] },
              ssoEnforcement: { enabled: false, idpId: null, allowedDomains: [] },
            },
            branchTracking: { enabled: true, mode: 'branch_starts_with', branchMatch: 'release/' },
            deploymentPolicy: 'versioned_urls',
          }),
        ),
      ).not.toThrow();
      expect(() => validateConfig(environment({ description: null, branchTracking: null }))).not.toThrow();
    });

    it('limits the name to 3-255 characters and requires it', () => {
      expect(() => validateConfig({ version: 6, environments: [{ description: 'x' }] })).toThrow(
        "The 'name' field is required in each environment",
      );
      expect(() => validateConfig({ version: 6, environments: [{ name: 'ab' }] })).toThrow(
        "The 'name' field must be a string between 3 and 255 characters",
      );
      expect(() => validateConfig({ version: 6, environments: [{ name: 'a'.repeat(256) }] })).toThrow();
    });

    it('rejects values out of the enums', () => {
      expect(() => validateConfig(environment({ logVerbosity: 'debug' }))).toThrow(
        "The 'logVerbosity' field must be one of: normal, verbose",
      );
      expect(() => validateConfig(environment({ robotsPolicy: 'all' }))).toThrow(
        "The 'robotsPolicy' field must be one of: index, noindex, respect_origin",
      );
      expect(() => validateConfig(environment({ deploymentPolicy: 'multiple' }))).toThrow(
        "The 'deploymentPolicy' field must be one of: single_version, versioned_urls",
      );
      expect(() =>
        validateConfig(environment({ branchTracking: { enabled: true, mode: 'branch_matches', branchMatch: 'a' } })),
      ).toThrow("The 'mode' field must be one of: branch_is, branch_starts_with, branch_ends_with");
    });

    it('requires the fields of branchTracking and of the protections', () => {
      expect(() => validateConfig(environment({ branchTracking: { enabled: true } }))).toThrow(
        "The 'enabled', 'mode' and 'branchMatch' fields are required in branchTracking",
      );
      expect(() => validateConfig(environment({ protection: { ipAllowlist: { enabled: true } } }))).toThrow();
      expect(() => validateConfig(environment({ protection: { unknown: {} } }))).toThrow(
        'No additional properties are allowed in the environment protection',
      );
    });
  });

  describe('deployments', () => {
    it('accepts a complete deployment', () => {
      expect(() =>
        validateConfig(
          deployment({
            description: 'Default',
            bindingPolicy: 'STRICT',
            deploymentPolicy: 'single_version',
            strategyDefaults: { skewProtection: { enabled: true, defaultTtlSeconds: 3600 } },
          }),
        ),
      ).not.toThrow();
    });

    it('limits the name to 3-255 characters and requires it', () => {
      expect(() => validateConfig({ version: 6, deployments: [{ bindingPolicy: 'STRICT' }] })).toThrow(
        "The 'name' field is required in each deployment",
      );
      expect(() => validateConfig({ version: 6, deployments: [{ name: 'ab' }] })).toThrow(
        "The 'name' field must be a string between 3 and 255 characters",
      );
    });

    it('rejects values out of the enums and invalid skew protection', () => {
      expect(() => validateConfig(deployment({ bindingPolicy: 'strict' }))).toThrow(
        "The 'bindingPolicy' field must be one of: STRICT, FLEXIBLE",
      );
      expect(() => validateConfig(deployment({ deploymentPolicy: 'rolling' }))).toThrow(
        "The 'deploymentPolicy' field must be one of: single_version, versioned_urls",
      );
      expect(() => validateConfig(deployment({ strategyDefaults: { skewProtection: { enabled: true } } }))).toThrow(
        "The 'enabled' and 'defaultTtlSeconds' fields are required in skewProtection",
      );
      expect(() =>
        validateConfig(deployment({ strategyDefaults: { skewProtection: { enabled: true, defaultTtlSeconds: 0 } } })),
      ).toThrow();
    });
  });
});

describe('validateConfig (v6) storage and connectors', () => {
  const storage = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    storage: [{ name: 'my-bucket', dir: './dist', ...extra }],
  });
  const connector = (extra: Record<string, unknown>) => ({
    version: 6,
    connectors: [{ name: 'my-connector', ...extra }],
  });
  const http = (attributes: Record<string, unknown> = {}) =>
    connector({ type: 'http', attributes: { addresses: [{ address: 'origin.example.com' }], ...attributes } });

  describe('storage', () => {
    it('accepts a complete storage', () => {
      expect(() => validateConfig(storage({ workloadsAccess: 'read_write', prefix: 'assets' }))).not.toThrow();
    });

    it('requires only name and dir (the prefix is optional in v6)', () => {
      expect(() => validateConfig(storage())).not.toThrow();
      expect(() => validateConfig({ version: 6, storage: [{ dir: './dist' }] })).toThrow(
        "The 'name' and 'dir' fields are required.",
      );
      expect(() => validateConfig({ version: 6, storage: [{ name: 'my-bucket' }] })).toThrow();
    });

    it('applies the name rules of the v6 API (lowercase letters, digits, hyphens, 6 to 63 characters)', () => {
      const name = (value: string) => validateConfig({ version: 6, storage: [{ name: value, dir: './dist' }] });

      expect(() => name('my-bucket-01')).not.toThrow();
      expect(() => name('a'.repeat(63))).not.toThrow();
      expect(() => name('short')).toThrow();
      expect(() => name('a'.repeat(64))).toThrow();
      expect(() => name('My-Bucket')).toThrow();
      expect(() => name('my_bucket')).toThrow();
      expect(() => name('-my-bucket')).toThrow();
      expect(() => name('my-bucket-')).toThrow();
    });

    it('accepts a $PLACEHOLDER as the name, as the presets use them', () => {
      expect(() => validateConfig({ version: 6, storage: [{ name: '$BUCKET_NAME', dir: './dist' }] })).not.toThrow();
    });

    it('rejects an unknown workloadsAccess and unknown properties', () => {
      expect(() => validateConfig(storage({ workloadsAccess: 'write_only' }))).toThrow(
        "The 'workloadsAccess' field must be one of: read_only, read_write, restricted.",
      );
      expect(() => validateConfig(storage({ unknown: true }))).toThrow(
        'No additional properties are allowed in storage items.',
      );
    });
  });

  describe('connectors', () => {
    it('accepts a storage connector with and without prefix', () => {
      expect(() =>
        validateConfig(connector({ type: 'storage', attributes: { bucket: 'my-bucket', prefix: 'p' } })),
      ).not.toThrow();
      expect(() => validateConfig(connector({ type: 'storage', attributes: { bucket: 'my-bucket' } }))).not.toThrow();
    });

    it('requires the bucket and does not accept an empty prefix in a storage connector', () => {
      expect(() => validateConfig(connector({ type: 'storage', attributes: {} }))).toThrow(
        "The 'bucket' field is required in storage attributes",
      );
      expect(() => validateConfig(connector({ type: 'storage', attributes: { bucket: 'b', prefix: '' } }))).toThrow(
        "The 'prefix' field must be a string between 1 and 255 characters",
      );
    });

    it('accepts a live ingest connector and validates its region', () => {
      expect(() =>
        validateConfig(connector({ type: 'live_ingest', attributes: { region: 'br-east-1' } })),
      ).not.toThrow();
      expect(() => validateConfig(connector({ type: 'live_ingest', attributes: { region: 'eu-west-1' } }))).toThrow(
        "The 'region' field must be one of: us-east-1, us-east-2, br-east-1, br-east-2, br-east-3",
      );
      expect(() => validateConfig(connector({ type: 'live_ingest', attributes: {} }))).toThrow(
        "The 'region' field is required in live ingest attributes",
      );
    });

    it('accepts an http connector with only the addresses', () => {
      expect(() => validateConfig(http())).not.toThrow();
    });

    it('accepts a complete http connector', () => {
      expect(() =>
        validateConfig(
          http({
            addresses: [
              {
                active: true,
                address: 'origin.example.com',
                httpPort: 8080,
                httpsPort: 8443,
                modules: { loadBalancer: { serverRole: 'backup', weight: 50 } },
              },
            ],
            connectionOptions: {
              dnsResolution: 'force_ipv6',
              transportPolicy: 'force_https',
              httpVersionPolicy: 'http1_1',
              host: '${host}',
              pathPrefix: '/api',
              followingRedirect: true,
              realIpHeader: 'X-Real-IP',
              realPortHeader: 'X-Real-PORT',
            },
            modules: {
              loadBalancer: {
                enabled: true,
                config: { method: 'least_conn', maxRetries: 3, connectionTimeout: 30, readWriteTimeout: 60 },
              },
              originShield: {
                enabled: true,
                config: {
                  originIpAcl: { enabled: true },
                  hmac: {
                    enabled: true,
                    config: {
                      type: 'aws4_hmac_sha256',
                      attributes: { region: 'us-east-1', service: 's3', accessKey: 'key', secretKey: 'secret' },
                    },
                  },
                },
              },
            },
          }),
        ),
      ).not.toThrow();
    });

    it('requires at least one address with an address', () => {
      expect(() => validateConfig(connector({ type: 'http', attributes: {} }))).toThrow(
        "The 'addresses' field is required in HTTP attributes",
      );
      expect(() => validateConfig(http({ addresses: [] }))).toThrow(
        "The 'addresses' field must be an array of at least one address object",
      );
      expect(() => validateConfig(http({ addresses: [{ httpPort: 80 }] }))).toThrow();
    });

    it('accepts force_ipv6 (new in v6) and rejects the other values of dnsResolution', () => {
      expect(() => validateConfig(http({ connectionOptions: { dnsResolution: 'force_ipv6' } }))).not.toThrow();
      expect(() => validateConfig(http({ connectionOptions: { dnsResolution: 'ipv6' } }))).toThrow(
        "The 'dnsResolution' must be one of: both, force_ipv4, force_ipv6",
      );
    });

    it('validates the load balancer of an address (serverRole and weight)', () => {
      const address = (loadBalancer: Record<string, unknown>) =>
        http({ addresses: [{ address: 'o.example.com', modules: { loadBalancer } }] });

      expect(() => validateConfig(address({ serverRole: 'primary', weight: 1 }))).not.toThrow();
      expect(() => validateConfig(address({ serverRole: 'secondary' }))).toThrow(
        "The 'serverRole' must be one of: primary, backup",
      );
      expect(() => validateConfig(address({ weight: 101 }))).toThrow("The 'weight' must be between 1 and 100");
      expect(() => validateConfig(address({ weight: 0 }))).toThrow();
    });

    it('does not accept null in the module configs and requires enabled and the hmac attributes', () => {
      expect(() => validateConfig(http({ modules: { loadBalancer: { enabled: true, config: null } } }))).toThrow();
      expect(() => validateConfig(http({ modules: { loadBalancer: {} } }))).toThrow();
      expect(() =>
        validateConfig(
          http({ modules: { originShield: { enabled: true, config: { hmac: { enabled: true, config: {} } } } } }),
        ),
      ).toThrow();
      expect(() =>
        validateConfig(http({ modules: { originShield: { enabled: true, config: { hmac: { config: {} } } } } })),
      ).toThrow();
    });

    it('validates the limits of the load balancer config', () => {
      const config = (value: Record<string, unknown>) =>
        http({ modules: { loadBalancer: { enabled: true, config: value } } });

      expect(() => validateConfig(config({ maxRetries: 21 }))).toThrow("The 'maxRetries' must be between 0 and 20");
      expect(() => validateConfig(config({ connectionTimeout: 301 }))).toThrow();
      expect(() => validateConfig(config({ readWriteTimeout: 601 }))).toThrow();
      expect(() => validateConfig(config({ method: 'random' }))).toThrow();
    });

    it('ties the attributes to the type of the connector', () => {
      expect(() =>
        validateConfig(connector({ type: 'storage', attributes: { addresses: [{ address: 'a.com' }] } })),
      ).toThrow();
      expect(() => validateConfig(connector({ type: 'http', attributes: { bucket: 'my-bucket' } }))).toThrow();
      expect(() => validateConfig(connector({ type: 'live_ingest', attributes: { bucket: 'my-bucket' } }))).toThrow();
    });

    it('requires name, type and attributes and rejects an unknown type and unknown properties', () => {
      expect(() =>
        validateConfig({ version: 6, connectors: [{ type: 'storage', attributes: { bucket: 'b' } }] }),
      ).toThrow("The 'name', 'type' and 'attributes' fields are required in each connector");
      expect(() => validateConfig(connector({ type: 'ftp', attributes: {} }))).toThrow(
        "The 'type' field must be one of: http, storage, live_ingest",
      );
      expect(() => validateConfig(connector({ type: 'storage', attributes: { bucket: 'b' }, unknown: true }))).toThrow(
        'No additional properties are allowed in connector objects',
      );
    });
  });
});
