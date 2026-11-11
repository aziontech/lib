import type { AzionConfigV6 } from '../../../types';
import ApplicationProcessConfigStrategy from './applicationProcessConfigStrategy';

describe('ApplicationProcessConfigStrategy (v6)', () => {
  let strategy: ApplicationProcessConfigStrategy;

  beforeEach(() => {
    strategy = new ApplicationProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no applications', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
    });

    it('should apply the defaults to a minimal application', () => {
      const result = strategy.transformToManifest({ version: 6, applications: [{ name: 'my-app' }] });

      expect(result).toEqual([
        {
          name: 'my-app',
          debug: false,
          modules: {
            cache: { enabled: true },
            functions: { enabled: false },
            application_accelerator: { enabled: true },
            image_processor: { enabled: false },
          },
        },
      ]);
    });

    it('should map every field of the application to the manifest', () => {
      const result = strategy.transformToManifest({
        version: 6,
        applications: [
          {
            name: 'my-app',
            debug: true,
            edgeCacheEnabled: true,
            functionsEnabled: true,
            applicationAcceleratorEnabled: false,
            imageProcessorEnabled: true,
          },
        ],
      });

      expect(result).toEqual([
        {
          name: 'my-app',
          debug: true,
          modules: {
            cache: { enabled: true },
            functions: { enabled: true },
            application_accelerator: { enabled: false },
            image_processor: { enabled: true },
          },
        },
      ]);
    });
  });

  describe('rules and function instances', () => {
    const config: AzionConfigV6 = {
      version: 6,
      functions: [{ name: 'fn', path: './fn.js' }],
      applications: [
        {
          name: 'my-app',
          rules: {
            request: [
              {
                name: 'Execute Function',
                criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/' }]],
                behaviors: [{ type: 'run_function', attributes: { value: 'fn' } }],
              },
            ],
          },
          functionsInstances: [{ name: 'instance', ref: 'fn' }],
        },
      ],
    };

    it('should write rules and function instances to the manifest', () => {
      const [application] = strategy.transformToManifest(config);

      expect(application.rules).toHaveLength(1);
      expect(application.rules[0]).toEqual(expect.objectContaining({ phase: 'request' }));
      expect(application.functions_instances).toEqual([{ name: 'instance', function: 'fn', args: {} }]);
    });

    it('should write the cache settings to the manifest as cache_settings and read them back', () => {
      const withCache: AzionConfigV6 = {
        version: 6,
        applications: [{ name: 'my-app', cache: [{ name: 'my-cache', browser: { maxAgeSeconds: 7200 } }] }],
      };
      const [application] = strategy.transformToManifest(withCache);

      expect(application.cache_settings).toHaveLength(1);
      expect(application.cache_settings[0]).toEqual(
        expect.objectContaining({ name: 'my-cache', browser_cache: { behavior: 'override', max_age: 7200 } }),
      );

      const transformedPayload: AzionConfigV6 = { version: 6 };
      strategy.transformToConfig({ applications: [application] }, transformedPayload);

      expect(transformedPayload.applications?.[0].cache?.[0]).toEqual(
        expect.objectContaining({ name: 'my-cache', browser: { maxAgeSeconds: 7200 } }),
      );
    });

    it('should not write cache_settings when the application has no cache', () => {
      const [application] = strategy.transformToManifest({ version: 6, applications: [{ name: 'my-app' }] });

      expect(application).not.toHaveProperty('cache_settings');
    });

    it('should enable the functions module when the application has function instances', () => {
      const [application] = strategy.transformToManifest(config);
      expect(application.modules.functions.enabled).toBe(true);
    });

    it('should round trip the device groups through the manifest', () => {
      const deviceGroups = [{ name: 'mobile', userAgent: 'Android|iPhone' }];
      const [application] = strategy.transformToManifest({
        version: 6,
        applications: [{ name: 'my-app', deviceGroups }],
      });

      expect(application.device_groups).toEqual([{ name: 'mobile', user_agent: 'Android|iPhone' }]);

      const transformedPayload: AzionConfigV6 = { version: 6 };
      strategy.transformToConfig({ applications: [application] }, transformedPayload);

      expect(transformedPayload.applications?.[0].deviceGroups).toEqual(deviceGroups);
    });

    it('should not write device_groups when the application has none', () => {
      const [application] = strategy.transformToManifest({ version: 6, applications: [{ name: 'my-app' }] });

      expect(application).not.toHaveProperty('device_groups');
    });

    it('should not write rules and function instances when the application has none', () => {
      const [application] = strategy.transformToManifest({ version: 6, applications: [{ name: 'my-app' }] });

      expect(application).not.toHaveProperty('rules');
      expect(application).not.toHaveProperty('functions_instances');
    });

    it('should round trip rules and function instances through the manifest', () => {
      const manifest = { applications: strategy.transformToManifest(config) };
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(manifest, transformedPayload);
      const [application] = transformedPayload.applications!;

      expect(application.rules?.request?.[0].name).toBe('Execute Function');
      expect(application.functionsInstances).toEqual([{ name: 'instance', ref: 'fn', args: {} }]);
      expect(application.functionsEnabled).toBe(true);
    });
  });

  describe('transformToConfig', () => {
    it('should set an empty array when the manifest has no applications', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      const result = strategy.transformToConfig({}, transformedPayload);

      expect(result).toEqual([]);
      expect(transformedPayload.applications).toEqual([]);
    });

    it('should map the manifest application back to the config', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };
      const payload = {
        applications: [
          {
            name: 'my-app',
            debug: true,
            modules: {
              cache: { enabled: false },
              functions: { enabled: true },
              application_accelerator: { enabled: false },
              image_processor: { enabled: true },
            },
          },
        ],
      };

      strategy.transformToConfig(payload, transformedPayload);

      expect(transformedPayload.applications).toEqual([
        {
          name: 'my-app',
          debug: true,
          edgeCacheEnabled: false,
          functionsEnabled: true,
          applicationAcceleratorEnabled: false,
          imageProcessorEnabled: true,
        },
      ]);
    });

    it('should round trip a config through the manifest', () => {
      const config: AzionConfigV6 = {
        version: 6,
        applications: [
          {
            name: 'my-app',
            debug: false,
            edgeCacheEnabled: true,
            functionsEnabled: false,
            applicationAcceleratorEnabled: true,
            imageProcessorEnabled: false,
          },
        ],
      };
      const manifest = { applications: strategy.transformToManifest(config) };
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig(manifest, transformedPayload);

      expect(transformedPayload).toEqual(config);
    });
  });

  describe('modules the rules need', () => {
    const request = (behaviors: object[], variable = '${uri}') => ({
      request: [
        {
          name: 'rule',
          criteria: [[{ variable, conditional: 'if', operator: 'matches', argument: '^/' }]],
          behaviors,
        },
      ],
    });
    const manifest = (application: object) =>
      strategy.transformToManifest({ version: 6, applications: [{ name: 'my-app', ...application }] } as AzionConfigV6);

    it('should write the cache module as enabled', () => {
      expect(manifest({})[0].modules.cache).toEqual({ enabled: true });
    });

    it('should accept the behaviors of the modules that are enabled', () => {
      expect(() =>
        manifest({
          imageProcessorEnabled: true,
          functionsEnabled: true,
          rules: request([{ type: 'optimize_images' }, { type: 'run_function', attributes: { value: 10 } }]),
        }),
      ).not.toThrow();
    });

    it('should throw when a behavior needs a module that is disabled', () => {
      expect(() => manifest({ rules: request([{ type: 'optimize_images' }]) })).toThrow(
        'Application "my-app" rule "rule" uses the behavior "optimize_images", which needs the image_processor module: enable it with imageProcessorEnabled.',
      );
      expect(() =>
        manifest({
          applicationAcceleratorEnabled: false,
          rules: request([{ type: 'rewrite_request', attributes: { value: '/x' } }]),
        }),
      ).toThrow('which needs the application_accelerator module');
      expect(() => manifest({ rules: request([{ type: 'run_function', attributes: { value: 10 } }]) })).toThrow(
        'which needs the functions module',
      );
    });

    it('should not need the functions module flag when the application has function instances', () => {
      expect(() =>
        manifest({
          functionsInstances: [{ name: 'instance', ref: 10 }],
          rules: request([{ type: 'run_function', attributes: { value: 10 } }]),
        }),
      ).not.toThrow();
    });

    it('should throw for a variable other than uri when the application accelerator is disabled', () => {
      expect(() =>
        manifest({ applicationAcceleratorEnabled: false, rules: request([{ type: 'deliver' }], '${host}') }),
      ).toThrow('uses the variable "host", which needs the application_accelerator module');
      expect(() =>
        manifest({ applicationAcceleratorEnabled: false, rules: request([{ type: 'deliver' }]) }),
      ).not.toThrow();
    });

    it('should check the response rules too', () => {
      expect(() =>
        manifest({
          applicationAcceleratorEnabled: false,
          rules: {
            response: [
              {
                name: 'r',
                criteria: [[{ variable: '${uri}', conditional: 'if', operator: 'matches', argument: '^/' }]],
                behaviors: [{ type: 'set_cookie', attributes: { value: 'a=b' } }],
              },
            ],
          },
        }),
      ).toThrow('uses the behavior "set_cookie", which needs the application_accelerator module');
    });
  });
});
