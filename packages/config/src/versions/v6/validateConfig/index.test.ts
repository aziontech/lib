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
    expect(() => validateConfig({ version: 6, workloads: [] })).toThrow(
      'Config can only contain the following properties: version, build, functions, applications',
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

  it('does not accept bindings yet (v6 has no storage)', () => {
    expect(() =>
      validateConfig({
        version: 6,
        functions: [{ name: 'a', path: './a.js', bindings: { storage: { bucket: 'b', prefix: 'p' } } }],
      }),
    ).toThrow();
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
