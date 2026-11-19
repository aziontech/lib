/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateConfig } from '.';

describe('generate', () => {
  describe('validateConfig', () => {
    it('should validate the configuration object', () => {
      const config = {
        build: {
          preset: 'next',
          polyfills: true,
          bundler: 'esbuild',
        },
      };
      expect(() => validateConfig(config)).not.toThrow();
    });
    it('should accept a preset object that carries a config per API version', () => {
      const presetConfig = { build: { bundler: 'esbuild' } };
      const config: any = {
        version: 3,
        build: {
          preset: {
            metadata: { name: 'custom' },
            config: presetConfig,
            configs: { 3: { version: 3, ...presetConfig } },
          },
        },
      };
      expect(() => validateConfig(config)).not.toThrow();
    });
    it('should not check preset.config against this version when the preset has configs', () => {
      const config: any = {
        version: 3,
        build: {
          preset: {
            metadata: { name: 'custom' },
            // config of another API version (v4 shape)
            config: { build: { entry: 'index.js' }, applications: [], workloads: [] },
            configs: { 3: { version: 3, build: { entry: 'handler.js' } } },
          },
        },
      };
      expect(() => validateConfig(config)).not.toThrow();
    });
    it('should check preset.config against this version when the preset has no configs', () => {
      const config: any = {
        version: 3,
        build: { preset: { metadata: { name: 'custom' }, config: { applications: [] } } },
      };
      expect(() => validateConfig(config)).toThrow();
    });
    it('should reject a preset object without config', () => {
      const config: any = { build: { preset: { metadata: { name: 'custom' }, configs: { 3: { version: 3 } } } } };
      expect(() => validateConfig(config)).toThrow("Preset must contain both 'metadata' and 'config' properties");
    });
    it('should accept the dir of an object_storage origin', () => {
      const config: any = {
        version: 3,
        origin: [{ name: 'origin-storage-default', type: 'object_storage', dir: './www' }],
      };
      expect(() => validateConfig(config)).not.toThrow();
    });
    it('should reject a dir that is not a string', () => {
      const config: any = {
        version: 3,
        origin: [{ name: 'origin-storage-default', type: 'object_storage', dir: 1 }],
      };
      expect(() => validateConfig(config)).toThrow("The 'dir' field must be a string.");
    });
    it('should still reject unknown properties in a preset object', () => {
      const config: any = {
        build: { preset: { metadata: { name: 'custom' }, config: {}, unknown: {} } },
      };
      expect(() => validateConfig(config)).toThrow('No additional properties are allowed in preset');
    });
    it('should throw an error if the configuration object is invalid', () => {
      const config: any = {
        build: {
          preset: {
            name: true,
          },
          polyfills: true,
        },
      };
      expect(() => validateConfig(config)).toThrow();
    });
  });
});

describe('validateConfig dynamic rule variables', () => {
  const withVariable = (variable: string) => ({
    rules: {
      request: [
        {
          name: 'rule',
          criteria: [{ variable, operator: 'is_equal', conditional: 'if', inputValue: 'x' }],
          behavior: { deliver: true },
        },
      ],
    },
  });

  it.each([
    '${arg_user}',
    '${cookie_session_id}',
    '${http_x_forwarded_for}',
    '${sent_http_etag}',
    '${upstream_http_age}',
  ])('accepts the dynamic variable %s', (variable) => {
    expect(() => validateConfig(withVariable(variable) as any)).not.toThrow();
  });

  it.each(['${arg_}', '${argx}', '${arg-user}', 'arg_user', '${arg_user', '${unknown_var}'])(
    'rejects %s',
    (variable) => {
      expect(() => validateConfig(withVariable(variable) as any)).toThrow();
    },
  );
});
