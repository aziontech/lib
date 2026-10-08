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
