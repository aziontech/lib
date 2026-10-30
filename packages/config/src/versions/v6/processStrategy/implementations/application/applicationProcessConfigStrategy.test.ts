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
          active: true,
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
            active: false,
            debug: true,
            edgeCacheEnabled: false,
            functionsEnabled: true,
            applicationAcceleratorEnabled: false,
            imageProcessorEnabled: true,
          },
        ],
      });

      expect(result).toEqual([
        {
          name: 'my-app',
          active: false,
          debug: true,
          modules: {
            cache: { enabled: false },
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
      expect(application.functions_instances).toEqual([{ name: 'instance', function: 'fn', args: {}, active: true }]);
    });

    it('should enable the functions module when the application has function instances', () => {
      const [application] = strategy.transformToManifest(config);
      expect(application.modules.functions.enabled).toBe(true);
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
      expect(application.functionsInstances).toEqual([{ name: 'instance', ref: 'fn', args: {}, active: true }]);
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
            active: false,
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
          active: false,
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
            active: true,
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
});
