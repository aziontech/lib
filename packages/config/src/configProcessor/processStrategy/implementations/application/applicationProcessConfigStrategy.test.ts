import { AzionConfig } from '../../../../types';
import ApplicationProcessConfigStrategy from './applicationProcessConfigStrategy';

describe('ApplicationProcessConfigStrategy', () => {
  let strategy: ApplicationProcessConfigStrategy;

  beforeEach(() => {
    strategy = new ApplicationProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return empty array when no applications are provided', () => {
      const config: AzionConfig = {};
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should return empty array when applications array is empty', () => {
      const config: AzionConfig = { applications: [] };
      const result = strategy.transformToManifest(config);
      expect(result).toEqual([]);
    });

    it('should transform a minimal application using default module values', () => {
      const config: AzionConfig = {
        applications: [{ name: 'my-app' }],
      };

      const result = strategy.transformToManifest(config);

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

    it('should transform an application with explicit module flags', () => {
      const config: AzionConfig = {
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
      };

      const result = strategy.transformToManifest(config);

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

    it('should enable the functions module when functionsInstances is present even if functionsEnabled is not set', () => {
      const config: AzionConfig = {
        functions: [{ name: 'my-function', path: './functions/my-function.js' }],
        applications: [
          {
            name: 'my-app',
            functionsInstances: [{ name: 'my-instance', ref: 'my-function' }],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result[0].modules.functions.enabled).toBe(true);
    });

    it('should include cache_settings using the cache strategy when cache is provided', () => {
      const config: AzionConfig = {
        applications: [
          {
            name: 'my-app',
            cache: [{ name: 'my-cache' }],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result[0].cache_settings).toEqual([
        expect.objectContaining({
          name: 'my-cache',
        }),
      ]);
    });

    it('should include rules using the rules strategy when rules is provided', () => {
      const config: AzionConfig = {
        applications: [
          {
            name: 'my-app',
            rules: {
              request: [
                {
                  name: 'my-rule',
                  criteria: [[{ variable: 'request_uri', conditional: 'if', operator: 'exists' }]],
                  behaviors: [{ type: 'deliver' }],
                },
              ],
            },
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result[0].rules).toEqual([
        {
          phase: 'request',
          rule: expect.objectContaining({ name: 'my-rule' }),
        },
      ]);
    });

    it('should include device_groups using the device groups strategy when deviceGroups is provided', () => {
      const config: AzionConfig = {
        applications: [
          {
            name: 'my-app',
            deviceGroups: [{ name: 'mobile', userAgent: 'Mobile' }],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result[0].device_groups).toEqual([{ name: 'mobile', user_agent: 'Mobile' }]);
    });

    it('should include functions_instances using the function instances strategy when functionsInstances is provided', () => {
      const config: AzionConfig = {
        functions: [{ name: 'my-function', path: './functions/my-function.js' }],
        applications: [
          {
            name: 'my-app',
            functionsInstances: [{ name: 'my-instance', ref: 'my-function' }],
          },
        ],
      };

      const result = strategy.transformToManifest(config);

      expect(result[0].functions_instances).toEqual([
        { name: 'my-instance', function: 'my-function', args: {}, active: true },
      ]);
    });

    it('should include version_id in the manifest only when versionId is provided (optional field)', () => {
      const configWithVersionId: AzionConfig = {
        applications: [{ name: 'app-with-version', versionId: 'version-abc-123' }],
      };
      const configWithoutVersionId: AzionConfig = {
        applications: [{ name: 'app-without-version' }],
      };

      const resultWith = strategy.transformToManifest(configWithVersionId);
      const resultWithout = strategy.transformToManifest(configWithoutVersionId);

      expect(resultWith[0].version_id).toBe('version-abc-123');
      expect(resultWithout[0].version_id).toBeUndefined();
    });

    it('should transform multiple applications', () => {
      const config: AzionConfig = {
        applications: [{ name: 'app-1' }, { name: 'app-2' }],
      };

      const result = strategy.transformToManifest(config);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('app-1');
      expect(result[1].name).toBe('app-2');
    });
  });

  describe('transformToConfig', () => {
    it('should return empty array when no applications are provided', () => {
      const payload = {};
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual([]);
      expect(transformedPayload.applications).toEqual([]);
    });

    it('should return empty array when applications array is empty', () => {
      const payload = { applications: [] };
      const transformedPayload: AzionConfig = {};
      const result = strategy.transformToConfig(payload, transformedPayload);
      expect(result).toEqual([]);
    });

    it('should transform a single application from manifest to config format', () => {
      const payload = {
        applications: [
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
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toEqual([
        {
          name: 'my-app',
          active: true,
          debug: false,
          edgeCacheEnabled: true,
          functionsEnabled: false,
          applicationAcceleratorEnabled: true,
          imageProcessorEnabled: false,
          cache: undefined,
          rules: undefined,
          deviceGroups: undefined,
          functionsInstances: undefined,
          versionId: undefined,
        },
      ]);
      expect(transformedPayload.applications).toBe(result);
    });

    it('should transform cache_settings using the cache strategy when present', () => {
      const payload = {
        applications: [
          {
            name: 'my-app',
            modules: { cache: { enabled: true }, functions: { enabled: false } },
            cache_settings: [
              {
                name: 'my-cache',
                browser_cache: { behavior: 'honor', max_age: 0 },
                modules: { cache: {}, application_accelerator: {} },
              },
            ],
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result![0].cache).toEqual([expect.objectContaining({ name: 'my-cache' })]);
    });

    it('should transform rules using the rules strategy when present', () => {
      const payload = {
        applications: [
          {
            name: 'my-app',
            modules: { cache: { enabled: true }, functions: { enabled: false } },
            rules: [
              {
                phase: 'request',
                rule: {
                  name: 'my-rule',
                  active: true,
                  criteria: [[{ variable: '${request_uri}', conditional: 'if', operator: 'exists' }]],
                  behaviors: [{ type: 'deliver' }],
                },
              },
            ],
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result![0].rules!.request).toEqual([expect.objectContaining({ name: 'my-rule' })]);
    });

    it('should transform device_groups using the device groups strategy when present', () => {
      const payload = {
        applications: [
          {
            name: 'my-app',
            modules: { cache: { enabled: true }, functions: { enabled: false } },
            device_groups: [{ name: 'mobile', user_agent: 'Mobile' }],
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result![0].deviceGroups).toEqual([{ name: 'mobile', userAgent: 'Mobile' }]);
    });

    it('should transform functions_instances using the function instances strategy when present', () => {
      const payload = {
        applications: [
          {
            name: 'my-app',
            modules: { cache: { enabled: true }, functions: { enabled: true } },
            functions_instances: [{ name: 'my-instance', function: 'my-function', args: {}, active: true }],
          },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result![0].functionsInstances).toEqual([
        { name: 'my-instance', ref: 'my-function', args: {}, active: true },
      ]);
    });

    it('should include versionId in the config only when version_id is provided (optional field)', () => {
      const payloadWithVersionId = {
        applications: [
          {
            name: 'app-with-version',
            modules: { cache: { enabled: true }, functions: { enabled: false } },
            version_id: 'version-abc-123',
          },
        ],
      };
      const payloadWithoutVersionId = {
        applications: [
          {
            name: 'app-without-version',
            modules: { cache: { enabled: true }, functions: { enabled: false } },
          },
        ],
      };

      const transformedWithVersionId: AzionConfig = {};
      const transformedWithoutVersionId: AzionConfig = {};
      strategy.transformToConfig(payloadWithVersionId, transformedWithVersionId);
      strategy.transformToConfig(payloadWithoutVersionId, transformedWithoutVersionId);

      expect(transformedWithVersionId.applications![0].versionId).toBe('version-abc-123');
      expect(transformedWithoutVersionId.applications![0].versionId).toBeUndefined();
    });

    it('should transform multiple applications', () => {
      const payload = {
        applications: [
          { name: 'app-1', modules: { cache: { enabled: true }, functions: { enabled: false } } },
          { name: 'app-2', modules: { cache: { enabled: true }, functions: { enabled: false } } },
        ],
      };
      const transformedPayload: AzionConfig = {};

      const result = strategy.transformToConfig(payload, transformedPayload);

      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('app-1');
      expect(result![1].name).toBe('app-2');
    });
  });
});
