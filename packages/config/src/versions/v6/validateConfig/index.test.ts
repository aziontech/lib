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
    expect(() => validateConfig({ version: 6, kv: [] })).toThrow(
      'Config can only contain the following properties: version, build, functions, storage, connectors, customPages, networkList, waf, firewall, applications, workloads, environments, deployments, purge',
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

  describe('deviceGroups', () => {
    it('accepts a device group and requires name and userAgent', () => {
      expect(() =>
        validateConfig(app({ deviceGroups: [{ name: 'mobile', userAgent: 'Android|iPhone' }] })),
      ).not.toThrow();
      expect(() => validateConfig(app({ deviceGroups: [{ name: 'mobile' }] }))).toThrow(
        "The 'name' and 'userAgent' fields are required in each device group",
      );
    });

    it('limits the name to 250 characters and the user agent to 512 (DeviceGroupRequest)', () => {
      expect(() =>
        validateConfig(app({ deviceGroups: [{ name: 'a'.repeat(250), userAgent: 'u'.repeat(512) }] })),
      ).not.toThrow();
      expect(() => validateConfig(app({ deviceGroups: [{ name: 'a'.repeat(251), userAgent: 'u' }] }))).toThrow();
      expect(() => validateConfig(app({ deviceGroups: [{ name: 'a', userAgent: 'u'.repeat(513) }] }))).toThrow();
      expect(() => validateConfig(app({ deviceGroups: [{ name: '', userAgent: 'u' }] }))).toThrow();
    });

    it('rejects unknown properties in a device group', () => {
      expect(() => validateConfig(app({ deviceGroups: [{ name: 'a', userAgent: 'u', id: 1 }] }))).toThrow(
        'No additional properties are allowed in device group objects',
      );
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
    environments: [{ name: 'production', deploymentPolicy: 'single_version', ...extra }],
  });
  const deployment = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    deployments: [{ name: 'default-deployment', bindingPolicy: 'FLEXIBLE', ...extra }],
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
      expect(() =>
        validateConfig({ version: 6, environments: [{ description: 'x', deploymentPolicy: 'single_version' }] }),
      ).toThrow("The 'name' field is required in each environment");
      expect(() =>
        validateConfig({ version: 6, environments: [{ name: 'ab', deploymentPolicy: 'single_version' }] }),
      ).toThrow("The 'name' field must be a string between 3 and 255 characters");
      expect(() =>
        validateConfig({ version: 6, environments: [{ name: 'a'.repeat(256), deploymentPolicy: 'single_version' }] }),
      ).toThrow();
    });

    it('requires the deploymentPolicy (the API requires it and does not accept changing it later)', () => {
      expect(() => validateConfig({ version: 6, environments: [{ name: 'production' }] })).toThrow(
        "The 'deploymentPolicy' field is required in each environment",
      );
      expect(() => validateConfig(environment({ deploymentPolicy: 'single_version' }))).not.toThrow();
      expect(() => validateConfig(environment({ deploymentPolicy: 'versioned_urls' }))).not.toThrow();
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
      expect(() => validateConfig({ version: 6, deployments: [{ name: 'ab', bindingPolicy: 'FLEXIBLE' }] })).toThrow(
        "The 'name' field must be a string between 3 and 255 characters",
      );
    });

    it('requires the bindingPolicy (the creation of a deployment requires it)', () => {
      expect(() => validateConfig({ version: 6, deployments: [{ name: 'default-deployment' }] })).toThrow(
        "The 'bindingPolicy' field is required in each deployment",
      );
      expect(() => validateConfig(deployment({ bindingPolicy: 'STRICT' }))).not.toThrow();
      expect(() => validateConfig(deployment({ bindingPolicy: 'FLEXIBLE' }))).not.toThrow();
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

describe('validateConfig (v6) application cache', () => {
  const cache = (value: Record<string, unknown>) => ({
    version: 6,
    applications: [{ name: 'my-app', cache: [{ name: 'my-cache', ...value }] }],
  });

  it('accepts a complete cache setting', () => {
    expect(() =>
      validateConfig(
        cache({
          stale: true,
          queryStringSort: true,
          tieredCache: { enabled: true, topology: 'us-east-1' },
          methods: { post: true, options: false },
          browser: { maxAgeSeconds: 7200 },
          edge: { maxAgeSeconds: '60 * 60 * 24' },
          cacheByCookie: { option: 'allowlist', list: ['session'] },
          cacheByQueryString: { option: 'denylist', list: ['utm'] },
        }),
      ),
    ).not.toThrow();
    expect(() => validateConfig(cache({}))).not.toThrow();
  });

  it('requires the name and limits it to 250 characters', () => {
    expect(() => validateConfig({ version: 6, applications: [{ name: 'a', cache: [{ stale: true }] }] })).toThrow(
      "The 'name' field is required in each cache item.",
    );
    expect(() => validateConfig(cache({ name: 'a'.repeat(250) }))).not.toThrow();
    expect(() => validateConfig(cache({ name: 'a'.repeat(251) }))).toThrow(
      "The 'name' field must be a string with 1 to 250 characters",
    );
  });

  it('limits a numeric max age to 0..31536000 (the v6 API limit) and accepts an expression', () => {
    expect(() =>
      validateConfig(cache({ browser: { maxAgeSeconds: 0 }, edge: { maxAgeSeconds: 31536000 } })),
    ).not.toThrow();
    expect(() => validateConfig(cache({ browser: { maxAgeSeconds: 31536001 } }))).toThrow();
    expect(() => validateConfig(cache({ edge: { maxAgeSeconds: -1 } }))).toThrow();
    expect(() => validateConfig(cache({ edge: { maxAgeSeconds: '60 * 60' } }))).not.toThrow();
    expect(() => validateConfig(cache({ edge: { maxAgeSeconds: 'abc' } }))).toThrow(
      "The 'maxAgeSeconds' field must be a valid mathematical expression.",
    );
  });

  it('requires the topology when the tiered cache is enabled and does not accept null', () => {
    expect(() => validateConfig(cache({ tieredCache: { enabled: true } }))).toThrow(
      "When 'enabled' is true, 'topology' is required in the 'tiered_cache' object.",
    );
    expect(() => validateConfig(cache({ tieredCache: { enabled: false } }))).not.toThrow();
    expect(() => validateConfig(cache({ tieredCache: { enabled: false, topology: null } }))).toThrow(
      "The 'topology' field must be one of 'nearest-region', 'br-east-1' or 'us-east-1'.",
    );
    expect(() => validateConfig(cache({ tieredCache: { enabled: true, topology: 'eu-west-1' } }))).toThrow();
  });

  it('validates the cache by cookie and by query string', () => {
    expect(() => validateConfig(cache({ cacheByCookie: { option: 'sometimes' } }))).toThrow(
      "The 'option' field must be one of 'ignore', 'all', 'allowlist' or 'denylist'.",
    );
    expect(() => validateConfig(cache({ cacheByQueryString: { list: ['q'] } }))).toThrow(
      "The 'option' field is required in the 'cacheByQueryString' object.",
    );
    expect(() => validateConfig(cache({ cacheByQueryString: { option: 'allowlist' } }))).toThrow(
      "The 'list' field is required when 'option' is 'allowlist' or 'denylist'.",
    );
  });

  it('rejects unknown properties in a cache setting', () => {
    expect(() => validateConfig(cache({ unknown: true }))).toThrow(
      'No additional properties are allowed in cache item objects.',
    );
    expect(() => validateConfig(cache({ methods: { get: true } }))).toThrow(
      "No additional properties are allowed in the 'methods' object.",
    );
  });
});

describe('validateConfig (v6) waf and firewall', () => {
  const waf = (extra: Record<string, unknown> = {}) => ({ version: 6, waf: [{ name: 'my-waf', ...extra }] });
  const firewall = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    firewall: [{ name: 'my-firewall', ...extra }],
  });
  const rule = (extra: Record<string, unknown> = {}) =>
    firewall({
      rules: [
        {
          name: 'rule',
          criteria: [{ variable: 'request_uri', conditional: 'if', operator: 'starts_with', argument: '/admin' }],
          behaviors: [{ type: 'deny' }],
          ...extra,
        },
      ],
    });
  const behavior = (value: Record<string, unknown>) => rule({ behaviors: [value] });

  describe('waf', () => {
    it('accepts a waf with only the name, and a complete one', () => {
      expect(() => validateConfig(waf())).not.toThrow();
      expect(() =>
        validateConfig(
          waf({
            active: false,
            engineSettings: {
              engineVersion: '2021-Q3',
              type: 'score',
              attributes: {
                rulesets: [1],
                thresholds: [{ threat: 'sql_injection', sensitivity: 'highest' }, { threat: 'file_upload' }],
              },
            },
          }),
        ),
      ).not.toThrow();
    });

    it('requires the name and limits it to 250 characters', () => {
      expect(() => validateConfig({ version: 6, waf: [{ active: true }] })).toThrow(
        "The 'name' field is required in the WAF object",
      );
      expect(() => validateConfig({ version: 6, waf: [{ name: 'a'.repeat(251) }] })).toThrow();
    });

    it('does not accept id nor productVersion (they are not in the v6 request)', () => {
      expect(() => validateConfig(waf({ id: 1 }))).toThrow('No additional properties are allowed in the WAF object');
      expect(() => validateConfig(waf({ productVersion: '1.0' }))).toThrow(
        'No additional properties are allowed in the WAF object',
      );
    });

    it('validates the engine settings and the thresholds', () => {
      const engine = (attributes: Record<string, unknown>) => waf({ engineSettings: { attributes } });

      expect(() => validateConfig(waf({ engineSettings: { engineVersion: '2022-Q1' } }))).toThrow(
        "The 'engineVersion' field must be '2021-Q3'",
      );
      expect(() => validateConfig(waf({ engineSettings: { type: 'rules' } }))).toThrow(
        "The 'type' field must be 'score'",
      );
      expect(() => validateConfig(engine({ rulesets: [2] }))).toThrow(
        "The 'rulesets' field must be an array containing [1]",
      );
      expect(() => validateConfig(engine({ thresholds: [{ sensitivity: 'low' }] }))).toThrow(
        "The 'threat' field is required in each threshold",
      );
      expect(() => validateConfig(engine({ thresholds: [{ threat: 'xss' }] }))).toThrow(
        "The 'threat' field must be one of:",
      );
      expect(() => validateConfig(engine({ thresholds: [{ threat: 'file_upload', sensitivity: 'max' }] }))).toThrow(
        "The 'sensitivity' field must be one of: highest, high, medium, low, lowest",
      );
      expect(() =>
        validateConfig(engine({ thresholds: Array.from({ length: 9 }, () => ({ threat: 'file_upload' })) })),
      ).toThrow("The 'thresholds' field must be an array of threat configurations (max 8 items)");
    });
  });

  describe('firewall', () => {
    it('accepts a firewall with only the name, and a complete one', () => {
      expect(() => validateConfig(firewall())).not.toThrow();
      expect(() =>
        validateConfig(
          firewall({
            active: true,
            debugRules: false,
            functions: true,
            networkProtection: true,
            waf: true,
            rules: [
              {
                name: 'rule',
                description: 'Block admin',
                active: true,
                criteria: [{ variable: '${host}', conditional: 'if', operator: 'exists' }],
                behaviors: [{ type: 'bypass' }],
              },
            ],
            functionsInstances: [{ name: 'instance', ref: 'fn', args: {}, active: false }],
          }),
        ),
      ).not.toThrow();
    });

    it('limits the firewall name to 250 characters and the rule name to 100 (v6 API limits)', () => {
      expect(() => validateConfig({ version: 6, firewall: [{ name: 'a'.repeat(250) }] })).not.toThrow();
      expect(() => validateConfig({ version: 6, firewall: [{ name: 'a'.repeat(251) }] })).toThrow(
        "The firewall configuration must have a 'name' field of type string (1-250 characters)",
      );
      expect(() => validateConfig(rule({ name: 'a'.repeat(100) }))).not.toThrow();
      expect(() => validateConfig(rule({ name: 'a'.repeat(101) }))).toThrow(
        "Each firewall rule must have a 'name' field of type string (1-100 characters)",
      );
      expect(() => validateConfig(rule({ description: 'a'.repeat(1001) }))).toThrow(
        "The rule's 'description' field must be a string of at most 1000 characters",
      );
    });

    it('requires the argument unless the operator is exists or does_not_exist', () => {
      const criterion = (value: Record<string, unknown>) =>
        rule({ criteria: [{ variable: 'host', conditional: 'if', ...value }] });
      const message = "The 'argument' field is required unless the operator is 'exists' or 'does_not_exist'";

      expect(() => validateConfig(criterion({ operator: 'is_equal', argument: 'example.com' }))).not.toThrow();
      expect(() => validateConfig(criterion({ operator: 'exists' }))).not.toThrow();
      expect(() => validateConfig(criterion({ operator: 'does_not_exist' }))).not.toThrow();
      expect(() => validateConfig(criterion({ operator: 'is_equal' }))).toThrow(message);
      expect(() => validateConfig(criterion({ operator: 'is_in_list' }))).toThrow(message);
      expect(() => validateConfig(criterion({ operator: 'matches', argument: null }))).toThrow();
    });

    it('does not require the argument of a criterion and accepts null', () => {
      const criterion = (value: Record<string, unknown>) =>
        rule({ criteria: [{ variable: 'host', conditional: 'if', operator: 'exists', ...value }] });

      expect(() => validateConfig(criterion({}))).not.toThrow();
      expect(() => validateConfig(criterion({ argument: null }))).not.toThrow();
      expect(() => validateConfig(criterion({ operator: 'is_in_list', argument: 12 }))).not.toThrow();
      expect(() => validateConfig(criterion({ argument: true }))).toThrow(
        'The argument must be a string, a number or null',
      );
    });

    it('allows up to 10 criteria in a rule (the group limit of the v6 API)', () => {
      const criteria = (n: number) =>
        rule({
          criteria: Array.from({ length: n }, () => ({ variable: 'host', conditional: 'and', operator: 'exists' })),
        });

      expect(() => validateConfig(criteria(10))).not.toThrow();
      expect(() => validateConfig(criteria(11))).toThrow();
    });

    it('requires either criteria or match and variable together', () => {
      expect(() =>
        validateConfig(
          firewall({ rules: [{ name: 'rule', match: '^/', variable: 'request_uri', behaviors: [{ type: 'drop' }] }] }),
        ),
      ).not.toThrow();
      expect(() =>
        validateConfig(firewall({ rules: [{ name: 'rule', match: '^/', behaviors: [{ type: 'drop' }] }] })),
      ).toThrow();
      expect(() => validateConfig(rule({ match: '^/', variable: 'request_uri' }))).toThrow();
    });

    it('accepts only the variables, operators and conditionals of the firewall', () => {
      const criterion = (value: Record<string, unknown>) =>
        rule({ criteria: [{ variable: 'host', conditional: 'if', operator: 'exists', ...value }] });

      expect(() => validateConfig(criterion({ variable: '${uri}' }))).toThrow();
      expect(() => validateConfig(criterion({ operator: 'contains' }))).toThrow("The 'operator' field must be one of:");
      expect(() => validateConfig(criterion({ conditional: 'not' }))).toThrow(
        "The 'conditional' field must be one of: if, and, or",
      );
    });

    describe('behaviors', () => {
      it('accepts deny, drop and bypass (new in v6)', () => {
        ['deny', 'drop', 'bypass'].forEach((type) => expect(() => validateConfig(behavior({ type }))).not.toThrow());
        expect(() => validateConfig(behavior({ type: 'allow' }))).toThrow();
      });

      it('validates set_waf: the mode is logging or blocking in v6 (learning in v4)', () => {
        expect(() =>
          validateConfig(behavior({ type: 'set_waf', attributes: { mode: 'logging', wafId: 'my-waf' } })),
        ).not.toThrow();
        expect(() =>
          validateConfig(behavior({ type: 'set_waf', attributes: { mode: 'blocking', wafId: 1 } })),
        ).not.toThrow();
        expect(() =>
          validateConfig(behavior({ type: 'set_waf', attributes: { mode: 'learning', wafId: 'my-waf' } })),
        ).toThrow('The mode must be one of: logging, blocking');
        expect(() => validateConfig(behavior({ type: 'set_waf', attributes: { mode: 'logging' } }))).toThrow(
          "Both 'mode' and 'wafId' fields are required in set_waf attributes",
        );
      });

      it('validates set_rate_limit: integers, and only limitBy and averageRateLimit are required', () => {
        const rateLimit = (attributes: Record<string, unknown>) => behavior({ type: 'set_rate_limit', attributes });

        expect(() => validateConfig(rateLimit({ limitBy: 'global', averageRateLimit: 10 }))).not.toThrow();
        expect(() =>
          validateConfig(
            rateLimit({ type: 'minute', limitBy: 'client_ip', averageRateLimit: 10, maximumBurstSize: null }),
          ),
        ).not.toThrow();
        expect(() => validateConfig(rateLimit({ limitBy: 'global', averageRateLimit: '10' }))).toThrow(
          'The averageRateLimit must be an integer between 1 and 2147483647',
        );
        expect(() => validateConfig(rateLimit({ limitBy: 'global', averageRateLimit: 0 }))).toThrow();
        expect(() =>
          validateConfig(rateLimit({ limitBy: 'global', averageRateLimit: 5, maximumBurstSize: '1' })),
        ).toThrow('The maximumBurstSize must be an integer between 1 and 2147483647 or null');
        expect(() => validateConfig(rateLimit({ limitBy: 'global' }))).toThrow(
          "The 'limitBy' and 'averageRateLimit' fields are required in set_rate_limit behavior attributes.",
        );
        expect(() => validateConfig(rateLimit({ type: 'hour', limitBy: 'global', averageRateLimit: 5 }))).toThrow(
          'The rate limit type must be one of: second, minute',
        );
      });

      it('validates set_custom_response: an integer status code and the limits of the content', () => {
        const custom = (attributes: Record<string, unknown>) => behavior({ type: 'set_custom_response', attributes });

        expect(() => validateConfig(custom({ statusCode: 403 }))).not.toThrow();
        expect(() =>
          validateConfig(custom({ statusCode: 200, contentType: 'text/plain', contentBody: 'a'.repeat(500) })),
        ).not.toThrow();
        expect(() => validateConfig(custom({ statusCode: '403' }))).toThrow(
          'The statusCode must be an integer between 200 and 499',
        );
        expect(() => validateConfig(custom({ statusCode: 500 }))).toThrow();
        expect(() => validateConfig(custom({ statusCode: 403, contentBody: 'a'.repeat(501) }))).toThrow(
          'The contentBody must be a string of at most 500 characters',
        );
        expect(() => validateConfig(custom({ statusCode: 403, contentType: 'a'.repeat(256) }))).toThrow(
          'The contentType must be a string of at most 255 characters',
        );
        expect(() => validateConfig(custom({}))).toThrow("The 'statusCode' field is required in setCustomResponse");
      });

      it('validates run_function', () => {
        expect(() => validateConfig(behavior({ type: 'run_function', attributes: { value: 'fn' } }))).not.toThrow();
        expect(() => validateConfig(behavior({ type: 'run_function', attributes: { value: 7 } }))).not.toThrow();
        expect(() => validateConfig(behavior({ type: 'run_function', attributes: { value: 0 } }))).toThrow();
        expect(() => validateConfig(behavior({ type: 'run_function', attributes: {} }))).toThrow(
          "The 'value' field is required in run_function behavior attributes.",
        );
      });

      it('requires between 1 and 10 behaviors', () => {
        expect(() => validateConfig(rule({ behaviors: [] }))).toThrow(
          'The behaviors must be an array with 1-10 items.',
        );
        expect(() =>
          validateConfig(rule({ behaviors: Array.from({ length: 11 }, () => ({ type: 'bypass' })) })),
        ).toThrow('The behaviors must be an array with 1-10 items.');
      });
    });

    describe('functionsInstances', () => {
      const instance = (value: Record<string, unknown>) => firewall({ functionsInstances: [value] });

      it('accepts active (the v6 request has it) and limits the name to 100 characters', () => {
        expect(() => validateConfig(instance({ name: 'i', ref: 'fn', active: false }))).not.toThrow();
        expect(() => validateConfig(instance({ name: 'a'.repeat(100), ref: 10 }))).not.toThrow();
        expect(() => validateConfig(instance({ name: 'a'.repeat(101), ref: 'fn' }))).toThrow(
          'The name must be a string between 1 and 100 characters long',
        );
      });

      it('requires name and ref and rejects unknown properties', () => {
        expect(() => validateConfig(instance({ name: 'i' }))).toThrow();
        expect(() => validateConfig(instance({ name: 'i', ref: 'fn', unknown: true }))).toThrow(
          'No additional properties are allowed in the firewallFunctionsInstance object',
        );
      });
    });
  });
});

describe('validateConfig (v6) networkList', () => {
  const list = (extra: Record<string, unknown> = {}) => ({
    version: 6,
    networkList: [{ name: 'my-list', type: 'ip_cidr', items: ['10.0.0.0/8'], ...extra }],
  });

  it('accepts every type of list, with and without active', () => {
    expect(() => validateConfig(list())).not.toThrow();
    expect(() => validateConfig(list({ type: 'asn', items: ['13335'], active: false }))).not.toThrow();
    expect(() => validateConfig(list({ type: 'countries', items: ['BR', 'US'] }))).not.toThrow();
  });

  it('requires name, type and items', () => {
    const message = "The 'name', 'type' and 'items' fields are required in each network list item.";

    expect(() => validateConfig({ version: 6, networkList: [{ type: 'asn', items: ['1'] }] })).toThrow(message);
    expect(() => validateConfig({ version: 6, networkList: [{ name: 'my-list', items: ['1'] }] })).toThrow(message);
    expect(() => validateConfig({ version: 6, networkList: [{ name: 'my-list', type: 'asn' }] })).toThrow(message);
  });

  it('rejects an unknown type and limits the name to 250 characters', () => {
    expect(() => validateConfig(list({ type: 'domain' }))).toThrow(
      "The 'type' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
    );
    expect(() => validateConfig(list({ name: 'a'.repeat(250) }))).not.toThrow();
    expect(() => validateConfig(list({ name: 'a'.repeat(251) }))).toThrow(
      "The 'name' field must be a string between 1 and 250 characters.",
    );
  });

  it('requires 1 to 20000 items of 1 to 250 characters each (v6 API)', () => {
    expect(() => validateConfig(list({ items: [] }))).toThrow(
      "The 'items' field must be an array of strings with 1-20000 items.",
    );
    expect(() => validateConfig(list({ items: Array.from({ length: 20000 }, (_, i) => `10.0.${i}.1`) }))).not.toThrow();
    expect(() => validateConfig(list({ items: Array.from({ length: 20001 }, (_, i) => `10.0.${i}.1`) }))).toThrow();
    expect(() => validateConfig(list({ items: [''] }))).toThrow(
      "Each item in 'items' must be a string between 1 and 250 characters.",
    );
    expect(() => validateConfig(list({ items: ['a'.repeat(251)] }))).toThrow();
    expect(() => validateConfig(list({ items: [13335] }))).toThrow();
  });

  it('requires the ASN items to be digits only', () => {
    expect(() => validateConfig(list({ type: 'asn', items: ['13335', '1'] }))).not.toThrow();
    expect(() => validateConfig(list({ type: 'asn', items: ['AS13335'] }))).toThrow(
      'Each ASN item must be a number composed of digits only.',
    );
    expect(() => validateConfig(list({ type: 'asn', items: ['13335', '12.5'] }))).toThrow();
  });

  it('requires the country items to be two uppercase alphanumeric characters', () => {
    expect(() => validateConfig(list({ type: 'countries', items: ['BR', 'US', 'D3'] }))).not.toThrow();
    expect(() => validateConfig(list({ type: 'countries', items: ['br'] }))).toThrow(
      'Each country item must be a two-character uppercase alphanumeric code (ISO 3166-1 alpha-2).',
    );
    expect(() => validateConfig(list({ type: 'countries', items: ['BRA'] }))).toThrow();
    expect(() => validateConfig(list({ type: 'countries', items: ['B'] }))).toThrow();
  });

  it('does not check the format of the ip_cidr items (IPs, CIDRs and expiration dates)', () => {
    expect(() =>
      validateConfig(
        list({
          items: ['192.168.0.1', '192.168.0.1/24', '2001:db8::/32', '192.168.0.1 --LT2025-05-29T12:25:23Z'],
        }),
      ),
    ).not.toThrow();
  });

  it('rejects unknown properties', () => {
    expect(() => validateConfig(list({ unknown: true }))).toThrow(
      'No additional properties are allowed in network list items.',
    );
  });
});

describe('validateConfig (v6) customPages', () => {
  const entry = (extra: Record<string, unknown> = {}, attributes: Record<string, unknown> = {}) => ({
    code: '404',
    page: { attributes: { connector: 'my-connector', ...attributes }, ...extra },
  });
  const customPages = (pages: unknown[], extra: Record<string, unknown> = {}) => ({
    version: 6,
    customPages: [{ name: 'errors', pages, ...extra }],
  });

  it('accepts a minimal and a complete custom page', () => {
    expect(() => validateConfig(customPages([entry()]))).not.toThrow();
    expect(() =>
      validateConfig(
        customPages(
          [
            entry({ type: 'page_connector' }, { connector: 10, ttl: 300, uri: '/error.html', customStatusCode: 200 }),
            { code: 'default', page: { attributes: { connector: 'my-connector', uri: null, customStatusCode: null } } },
          ],
          { active: false },
        ),
      ),
    ).not.toThrow();
  });

  it('requires name and pages, and at least one page', () => {
    const message = "The 'name' and 'pages' fields are required in each custom page";

    expect(() => validateConfig({ version: 6, customPages: [{ pages: [entry()] }] })).toThrow(message);
    expect(() => validateConfig({ version: 6, customPages: [{ name: 'errors' }] })).toThrow(message);
    expect(() => validateConfig(customPages([]))).toThrow(
      "The 'pages' field must be an array of 1 to 23 page configurations",
    );
  });

  it('allows up to 23 pages, one for each error code (v6 API limit)', () => {
    const codes = [
      'default',
      '400',
      '401',
      '403',
      '404',
      '405',
      '406',
      '408',
      '409',
      '410',
      '411',
      '414',
      '415',
      '416',
      '426',
      '429',
      '431',
      '500',
      '501',
      '502',
      '503',
      '504',
      '505',
    ];
    const pages = codes.map((code) => ({ ...entry(), code }));

    expect(() => validateConfig(customPages(pages))).not.toThrow();
    expect(() => validateConfig(customPages([...pages, entry()]))).toThrow(
      "The 'pages' field must be an array of 1 to 23 page configurations",
    );
  });

  it('accepts only the error codes of the API', () => {
    expect(() => validateConfig(customPages([{ ...entry(), code: '418' }]))).toThrow(
      "The 'code' field must be a valid error code",
    );
    expect(() => validateConfig(customPages([{ ...entry(), code: 404 }]))).toThrow();
  });

  it('requires the connector, as a name or an id between 1 and 2147483647', () => {
    expect(() => validateConfig(customPages([entry({}, { connector: 1 })]))).not.toThrow();
    expect(() => validateConfig(customPages([entry({}, { connector: 2147483647 })]))).not.toThrow();
    expect(() => validateConfig(customPages([entry({}, { connector: 0 })]))).toThrow();
    expect(() => validateConfig(customPages([entry({}, { connector: 2147483648 })]))).toThrow();
    expect(() => validateConfig(customPages([{ code: '404', page: { attributes: { ttl: 1 } } }]))).toThrow(
      "The 'connector' field is required in page attributes",
    );
  });

  it('validates the ttl and the custom status code', () => {
    expect(() => validateConfig(customPages([entry({}, { ttl: 31536000 })]))).not.toThrow();
    expect(() => validateConfig(customPages([entry({}, { ttl: 31536001 })]))).toThrow(
      "The 'ttl' field must be an integer between 0 and 31536000",
    );
    expect(() => validateConfig(customPages([entry({}, { ttl: -1 })]))).toThrow();
    expect(() => validateConfig(customPages([entry({}, { customStatusCode: 600 })]))).toThrow(
      "The 'customStatusCode' field must be an integer between 100 and 599 or null",
    );
    expect(() => validateConfig(customPages([entry({}, { customStatusCode: 99 })]))).toThrow();
  });

  it('validates the uri: 1 to 250 characters or null, with no pattern (v6 API)', () => {
    expect(() => validateConfig(customPages([entry({}, { uri: '/errors/404.html' })]))).not.toThrow();
    expect(() => validateConfig(customPages([entry({}, { uri: 'errors/404 page.html' })]))).not.toThrow();
    expect(() => validateConfig(customPages([entry({}, { uri: 'a'.repeat(250) })]))).not.toThrow();
    expect(() => validateConfig(customPages([entry({}, { uri: 'a'.repeat(251) })]))).toThrow(
      "The 'uri' field must be a string between 1 and 250 characters or null",
    );
    expect(() => validateConfig(customPages([entry({}, { uri: '' })]))).toThrow();
  });

  it('accepts only the page_connector type', () => {
    expect(() => validateConfig(customPages([entry({ type: 'page_static' })]))).toThrow(
      "The 'type' field must be a valid page type",
    );
  });

  it('limits the name to 255 characters and rejects unknown properties', () => {
    expect(() =>
      validateConfig({ version: 6, customPages: [{ name: 'a'.repeat(255), pages: [entry()] }] }),
    ).not.toThrow();
    expect(() => validateConfig({ version: 6, customPages: [{ name: 'a'.repeat(256), pages: [entry()] }] })).toThrow(
      "The 'name' field must be a string between 1 and 255 characters",
    );
    expect(() => validateConfig(customPages([entry()], { unknown: true }))).toThrow(
      'No additional properties are allowed in custom page objects',
    );
    expect(() => validateConfig(customPages([{ ...entry(), unknown: true }]))).toThrow(
      'No additional properties are allowed in page entry',
    );
  });
});

describe('validateConfig (v6) purge', () => {
  describe('purge', () => {
    it('accepts the three purge types and both layers', () => {
      expect(() =>
        validateConfig({
          version: 6,
          purge: [
            { type: 'url', items: ['https://example.com/a'], layer: 'cache' },
            { type: 'cachekey', items: ['example.com/a'], layer: 'tiered_cache' },
            { type: 'wildcard', items: ['https://example.com/*'] },
          ],
        }),
      ).not.toThrow();
    });

    it('requires type and items', () => {
      expect(() => validateConfig({ version: 6, purge: [{ type: 'url' }] })).toThrow(
        "The 'type and items' fields are required in each purge item.",
      );
      expect(() => validateConfig({ version: 6, purge: [{ items: ['a'] }] })).toThrow(
        "The 'type and items' fields are required in each purge item.",
      );
    });

    it('rejects an unknown type or layer', () => {
      expect(() => validateConfig({ version: 6, purge: [{ type: 'tag', items: ['a'] }] })).toThrow(
        "The 'type' field must be either 'url', 'cachekey' or 'wildcard'.",
      );
      expect(() => validateConfig({ version: 6, purge: [{ type: 'url', items: ['a'], layer: 'edge' }] })).toThrow(
        "The 'layer' field must be either 'cache' or 'tiered_cache'.",
      );
    });

    it('requires at least one item and rejects empty items (PurgeRequest)', () => {
      expect(() => validateConfig({ version: 6, purge: [{ type: 'url', items: [] }] })).toThrow(
        'The purge items array cannot be empty. At least one item must be specified.',
      );
      expect(() => validateConfig({ version: 6, purge: [{ type: 'url', items: [''] }] })).toThrow(
        "Each item in 'items' must have at least 1 character.",
      );
    });

    it('rejects unknown properties in a purge item', () => {
      expect(() => validateConfig({ version: 6, purge: [{ type: 'url', items: ['a'], name: 'x' }] })).toThrow(
        'No additional properties are allowed in purge items.',
      );
    });

    it('rejects a purge that is not an array', () => {
      expect(() => validateConfig({ version: 6, purge: {} })).toThrow(
        "The 'purge' field must be an array of purge items.",
      );
    });
  });
});
