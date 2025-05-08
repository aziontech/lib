/* eslint-disable @typescript-eslint/no-explicit-any */
import { processConfig } from '..';
import { AzionConfig } from '../../types';

describe('processConfig', () => {
  describe('Cache and Rules', () => {
    it('should process config from the configuration object', () => {
      const config = {
        build: {
          preset: 'next',
          polyfills: true,
        },
      };
      expect(processConfig(config)).toEqual(
        expect.objectContaining({
          build: {
            preset: 'next',
            polyfills: true,
          },
        }),
      );
    });

    it('should throw an error for invalid mathematical expressions', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            browser: { maxAgeSeconds: '2 * 3' },
            edge: { maxAgeSeconds: 'invalidExpression' },
          },
        ],
        rules: {
          request: [],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
      );
    });

    it('should process a cache object directly in the rule', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/test',
              behavior: {
                setCache: {
                  name: 'directCache',
                  browser_cache_settings_maximum_ttl: 300,
                  cdn_cache_settings_maximum_ttl: 600,
                },
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result).toHaveProperty('cache');
      expect(result.cache).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'directCache' })]));
    });

    it('should handle rewrites directly as a string', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'simpleRewriteRule',
              match: '/simple',
              behavior: {
                rewrite: '/new-path',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'rewrite_request',
            target: '/new-path',
          }),
        ]),
      );
    });

    it('should correctly calculate numerical values', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'calcCache',
            browser: { maxAgeSeconds: '2 * 3' },
            edge: { maxAgeSeconds: '4 + 1' },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          browser_cache_settings_maximum_ttl: 6,
          cdn_cache_settings_maximum_ttl: 5,
        }),
      );
    });

    it('should correctly handle the absence of cache settings', () => {
      const azionConfig: any = {
        functions: [
          {
            name: 'handler',
            path: '.edge/worker.js',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/no-cache',
              behavior: {
                runFunction: 'handler',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache).toBeUndefined();
    });

    it('should correctly convert request rules', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            criteria: expect.arrayContaining([
              expect.arrayContaining([
                expect.objectContaining({
                  input_value: '/api',
                }),
              ]),
            ]),
            behaviors: expect.arrayContaining([
              expect.objectContaining({
                name: 'set_origin',
                target: 'my origin storage',
              }),
            ]),
          }),
        ]),
      );
    });

    it('should correctly calculate complex mathematical expressions', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'complexMathCache',
            browser: { maxAgeSeconds: '(2 * 3) + 5' },
            edge: { maxAgeSeconds: '10 / 2' },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          browser_cache_settings_maximum_ttl: 11,
          cdn_cache_settings_maximum_ttl: 5,
        }),
      );
    });

    it('should throw an error when data types do not match the expected', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'typeValidationCache',
            browser: { maxAgeSeconds: true }, // Invalid boolean type for maxAgeSeconds
            edge: { maxAgeSeconds: '10' },
          },
        ],
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "The 'maxAgeSeconds' field must be a number or a valid mathematical expression.",
      );
    });

    it('should correctly configure cookie forwarding when forwardCookies is true', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/',
              behavior: {
                forwardCookies: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      // Checks if the forward_cookies behavior is included and set to true when forwardCookies is true
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'forward_cookies',
            target: null, // Updated from 'params' to 'target'
          }),
        ]),
      );
    });

    it('should not include forward_cookies behavior when forwardCookies is false or not specified', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/no-forward',
              behavior: {
                forwardCookies: false,
              },
            },
            {
              name: 'testRule',
              match: '/default-forward',
              behavior: {
                rewrite: '/',
              },
              // forwardCookies not specified
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      // Checks if the forward_cookies behavior is not included when forwardCookies is false or not specified
      expect(result.rules[0].behaviors).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'forward_cookies',
          }),
        ]),
      );
      expect(result.rules[1].behaviors).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'forward_cookies',
          }),
        ]),
      );
    });

    it('should correctly process the setOrigin rule with all optional fields provided', () => {
      const azionConfigWithAllFields = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/_next',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };
      const resultWithAllFields = processConfig(azionConfigWithAllFields);
      expect(resultWithAllFields.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'set_origin',
            target: 'my origin storage',
          }),
        ]),
      );
    });

    it('should throw an error when "type" is missing in "setOrigin"', () => {
      const azionConfigWithTypeMissing: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/_next_no_type',
              behavior: {
                setOrigin: {
                  name: 'nameWithoutType',
                  // type is missing
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfigWithTypeMissing)).toThrow(
        "The 'name or type' field is required in the 'setOrigin' object.",
      );
    });

    it('should throw an error for an undefined property', () => {
      const azionConfigWithUndefinedProperty = {
        cache: [
          {
            name: 'testCache',
            undefinedProperty: 'This property does not exist',
          },
        ],
      };

      expect(() => processConfig(azionConfigWithUndefinedProperty)).toThrow(
        'No additional properties are allowed in cache item objects.',
      );
    });

    it('should correctly process the runFunction behavior with only the required path', () => {
      const azionConfigWithRunFunctionOnlyPath = {
        functions: [
          {
            name: 'handler',
            path: '.edge/worker.js',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/run-function-test-path-only',
              behavior: {
                runFunction: 'handler',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfigWithRunFunctionOnlyPath);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'run_function',
            target: 'handler',
          }),
        ]),
      );
    });

    it('should throw an error when runFunction references a non-existent function', () => {
      const azionConfig = {
        functions: [
          {
            name: 'existingFunction',
            path: '.edge/worker.js',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/test',
              behavior: {
                runFunction: 'nonExistentFunction',
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow();
    });

    it('should include the behavior deliver when deliver is true', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/path',
              behavior: {
                deliver: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'deliver',
          }),
        ]),
      );
    });

    it('should throw an error if deliver is not a boolean', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/path',
              behavior: {
                deliver: 'true', // Incorrectly defined as string
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow("The 'deliver' field must be a boolean or null.");
    });

    it('should throw an error if setCookie is not a string', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/',
              behavior: {
                setCookie: true, //  Incorrectly defined as boolean
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow("The 'setCookie' field must be a string or null.");
    });

    it('should throw an error if setHeaders is not an array of strings', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/',
              behavior: {
                setHeaders: { key: 'value' }, // Incorrectly defined as object
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow("The 'setHeaders' field must be an array of strings.");
    });

    it('should correctly add deliver behavior when deliver is true', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/path',
              behavior: {
                deliver: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'deliver',
          }),
        ]),
      );
    });

    it('should correctly add setCookie behavior with a valid string', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/',
              behavior: {
                setCookie: 'sessionId=abc123',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'add_request_cookie',
            target: 'sessionId=abc123',
          }),
        ]),
      );
    });

    it('should correctly add setHeaders behavior with a valid array', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/',
              behavior: {
                setHeaders: ['Authorization: Bearer abc123'], // Corretamente definido como uma array de strings
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'add_request_header',
            target: 'Authorization: Bearer abc123',
          }),
        ]),
      );
    });
  });
  describe('Origin', () => {
    it('should process the config config when the origin is single_origin and all fields', () => {
      const azionConfig: AzionConfig = {
        origin: [
          {
            name: 'my single origin',
            type: 'single_origin',
            path: '',
            addresses: [
              {
                address: 'http.bin.org',
              },
            ],
            protocolPolicy: 'preserve',
            hostHeader: '${host}',
            method: 'ip_hash',
            redirection: true,
            connectionTimeout: 60,
            timeoutBetweenBytes: 120,
            hmac: {
              region: 'us-east-1',
              accessKey: 'myaccesskey',
              secretKey: 'secretKey',
            },
          },
        ],
      };
      const result = processConfig(azionConfig);
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'my single origin',
            origin_type: 'single_origin',
            addresses: [
              {
                address: 'http.bin.org',
              },
            ],
            origin_path: '',
            method: 'ip_hash',
            origin_protocol_policy: 'preserve',
            host_header: '${host}',
            is_origin_redirection_enabled: true,
            connection_timeout: 60,
            timeout_between_bytes: 120,
            hmac_authentication: true,
            hmac_region_name: 'us-east-1',
            hmac_access_key: 'myaccesskey',
            hmac_secret_key: 'secretKey',
          }),
        ]),
      );
    });

    it('should process the config config when the origin is provided id and key', () => {
      const azionConfig: any = {
        origin: [
          {
            id: 123456,
            key: 'abcdef',
            name: 'my single',
            type: 'single_origin',
            addresses: [
              {
                address: 'http.bin.org',
              },
            ],
          },
        ],
      };
      const result = processConfig(azionConfig);
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 123456,
            key: 'abcdef',
            name: 'my single',
            origin_type: 'single_origin',
            addresses: [
              {
                address: 'http.bin.org',
              },
            ],
          }),
        ]),
      );
    });

    it('should throw an error when the origin type single_origin is missing the addresses field', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my single',
            type: 'single_origin',
          },
        ],
      };
      expect(() => processConfig(azionConfig)).toThrow('When origin type is single_origin, addresses is required');
    });

    // should process the config config when the origin is single_origin and addresses is array of strings
    it('should process the config config when the origin is single_origin and addresses is array of strings', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my single',
            type: 'single_origin',
            addresses: ['http.bin.org', 'http2.bin.org'],
          },
        ],
      };
      const result = processConfig(azionConfig);
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'my single',
            origin_type: 'single_origin',
            addresses: [
              {
                address: 'http.bin.org',
              },
              {
                address: 'http2.bin.org',
              },
            ],
          }),
        ]),
      );
    });

    it('should throw an error when the origin type single_origin the addresses weight is invalid', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my single',
            type: 'single_origin',
            addresses: [
              {
                address: 'http.bin.org',
                weight: 1,
              },
              {
                address: 'http2.bin.org',
                weight: 11,
              },
            ],
          },
        ],
      };
      expect(() => processConfig(azionConfig)).toThrow(
        'When origin type is single_origin, weight must be between 0 and 10',
      );
    });

    it('should process the config config when the origin is object_storage and all fields', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
      };
      const result = processConfig(azionConfig);
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'my origin storage',
            origin_type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          }),
        ]),
      );
    });

    it('should process the config config when the origin name and type are the same as the rules setOrigin name and type', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).not.toThrow();
      const result = processConfig(azionConfig);
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'my origin storage',
            origin_type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          }),
        ]),
      );
    });

    it('should throw an error when the origin name is different from the rules setOrigin name', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'another origin storage',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "Rule setOrigin name 'another origin storage' not found in the origin settings",
      );
    });

    it('should throw an error when the origin type is different from the rules setOrigin type', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'another_type',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "Rule setOrigin name 'my origin storage' not found in the origin settings",
      );
    });

    it('should throw an error when the origin settings are not defined', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "Rule setOrigin name 'my origin storage' not found in the origin settings",
      );
    });

    it('should throw an error when the origin type is incorrect', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'name_incorrect',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'another_type',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "The 'type' field must be a string and one of 'single_origin', 'object_storage', 'load_balancer' or 'live_ingest'.",
      );
    });

    it('should correctly process the config config when the origin is single_origin', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my single origin',
            type: 'single_origin',
            hostHeader: 'www.example.com',
            addresses: [
              {
                address: 'http.bin.org',
              },
            ],
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'my single origin',
                  type: 'single_origin',
                },
              },
            },
          ],
        },
      };
      expect(() => processConfig(azionConfig)).not.toThrow();
      const result = processConfig(azionConfig);
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'my single origin',
            origin_type: 'single_origin',
            addresses: [
              {
                address: 'http.bin.org',
              },
            ],
            host_header: 'www.example.com',
          }),
        ]),
      );
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'set_origin',
            target: 'my single origin',
          }),
        ]),
      );
    });

    it('should throw an error when the origin path is "/"', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my single',
            type: 'single_origin',
            addresses: ['http.bin.org', 'http2.bin.org'],
            path: '/',
          },
        ],
      };
      expect(() => processConfig(azionConfig)).toThrow('Origin path cannot be "/". Please use empty string or "/path"');
    });
  });
  describe('Rules', () => {
    it('should correctly handle bypassCache behavior', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testBypassCache',
              match: '/',
              behavior: {
                bypassCache: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'bypass_cache_phase',
            target: null,
          }),
        ]),
      );
    });

    it('should correctly handle redirect to 301', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRedirect301',
              match: '/',
              behavior: {
                redirectTo301: 'https://example.com',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'redirect_to_301',
            target: 'https://example.com',
          }),
        ]),
      );
    });

    it('should correctly handle redirect to 302', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testRedirect302',
              match: '/',
              behavior: {
                redirectTo302: 'https://example.com',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'redirect_to_302',
            target: 'https://example.com',
          }),
        ]),
      );
    });

    it('should correctly handle capture match groups', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testCapture',
              match: '/',
              behavior: {
                capture: {
                  match: '^/user/(.*)',
                  captured: 'userId',
                  subject: 'uri',
                },
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'capture_match_groups',
            target: {
              regex: '^/user/(.*)',
              captured_array: 'userId',
              // eslint-disable-next-line no-template-curly-in-string
              subject: '${uri}',
            },
          }),
        ]),
      );
    });

    it('should correctly handle filterCookie behavior', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'testFilterCookie',
              match: '/',
              behavior: {
                filterCookie: '_cookie',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'filter_response_cookie',
            target: '_cookie',
          }),
        ]),
      );
    });

    it('should correctly process rules in the response phase', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'testResponsePhase',
              match: '/',
              behavior: {
                setHeaders: ['X-Test-Header: value'],
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'add_response_header',
            target: 'X-Test-Header: value',
          }),
        ]),
      );
    });

    it('should correctly add multiple response headers', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'testMultipleHeaders',
              match: '/',
              behavior: {
                setHeaders: ['X-Frame-Options: DENY', "Content-Security-Policy: default-src 'self'"],
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'add_response_header',
            target: 'X-Frame-Options: DENY',
          }),
          expect.objectContaining({
            name: 'add_response_header',
            target: "Content-Security-Policy: default-src 'self'",
          }),
        ]),
      );
    });

    it('should correctly handle enableGZIP behavior', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'testEnableGZIP',
              match: '/',
              behavior: {
                enableGZIP: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'enable_gzip',
            target: '',
          }),
        ]),
      );
    });

    it('should handle rules with description and active properties correctly', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'Example Rule',
              match: '/',
              description: 'This rule redirects all traffic.',
              active: false,
              behavior: {
                forwardCookies: true,
              },
            },
            {
              name: 'Second Rule',
              match: '/api',
              behavior: {
                forwardCookies: true,
              },
              // description is not provided here
              active: true,
            },
            {
              name: 'Third Rule',
              match: '/home',
              description: 'This rule handles home traffic.',
              behavior: { forwardCookies: true },
              // active is not provided here
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules).toEqual([
        expect.objectContaining({
          name: 'Example Rule',
          description: 'This rule redirects all traffic.',
          is_active: false,
        }),
        expect.objectContaining({
          name: 'Second Rule',
          description: '', // Should default to an empty string
          is_active: true,
        }),
        expect.objectContaining({
          name: 'Third Rule',
          description: 'This rule handles home traffic.',
          is_active: true, // Should default to true
        }),
      ]);
    });

    it('should correctly assign order starting from 2 for request and response rules', () => {
      const azionConfig: any = {
        rules: {
          request: [
            { name: 'First Request Rule', match: '/', behavior: { forwardCookies: true } },
            { name: 'Second Request Rule', match: '/second', behavior: { forwardCookies: true } },
          ],
          response: [
            { name: 'First Response Rule', match: '/', behavior: { filterHeader: 'test' } },
            { name: 'Second Response Rule', match: '/second', behavior: { filterHeader: 'test' } },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0]).toEqual(
        expect.objectContaining({
          name: 'First Request Rule',
          order: 2,
        }),
      );
      expect(result.rules[1]).toEqual(
        expect.objectContaining({
          name: 'Second Request Rule',
          order: 3,
        }),
      );
      expect(result.rules[2]).toEqual(
        expect.objectContaining({
          name: 'First Response Rule',
          order: 2,
        }),
      );
      expect(result.rules[3]).toEqual(
        expect.objectContaining({
          name: 'Second Response Rule',
          order: 3,
        }),
      );
    });

    it('should maintain the order of behaviors as specified by the user', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/',
              behavior: {
                setHeaders: ['Authorization: Bearer abc123'],
                deliver: true,
                setOrigin: {
                  name: 'my origin storage',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual([
        expect.objectContaining({
          name: 'add_request_header',
          target: 'Authorization: Bearer abc123',
        }),
        expect.objectContaining({
          name: 'deliver',
        }),
        expect.objectContaining({
          name: 'set_origin',
          target: 'my origin storage',
        }),
      ]);
    });
    it('should throw an error when the origin settings are not defined', () => {
      const azionConfigWithoutOrigin = {
        rules: {
          request: [
            {
              name: 'testRule',
              match: '/api',
              behavior: {
                setOrigin: {
                  name: 'undefined origin',
                  type: 'object_storage',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfigWithoutOrigin)).toThrow(
        "Rule setOrigin name 'undefined origin' not found in the origin settings",
      );
    });
    it('should handle legacy config without behavior field for request rules', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'legacy origin',
            type: 'object_storage',
          },
        ],
        rules: {
          request: [
            {
              name: 'legacyRule',
              match: '/legacy',
              setOrigin: {
                name: 'legacy origin',
                type: 'object_storage',
              },
              setHeaders: ['Authorization: Bearer legacy'],
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'set_origin',
            target: 'legacy origin',
          }),
          expect.objectContaining({
            name: 'add_request_header',
            target: 'Authorization: Bearer legacy',
          }),
        ]),
      );
    });

    it('should handle legacy config without behavior field for response rules', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'legacyResponseRule',
              match: '/legacy-response',
              setHeaders: ['X-Legacy-Header: legacy'],
              enableGZIP: true,
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'add_response_header',
            target: 'X-Legacy-Header: legacy',
          }),
          expect.objectContaining({
            name: 'enable_gzip',
            target: '',
          }),
        ]),
      );
    });

    it('should handle mixed legacy and new config for request rules', () => {
      const azionConfig: any = {
        origin: [
          {
            name: 'mixed origin',
            type: 'object_storage',
          },
        ],
        rules: {
          request: [
            {
              name: 'mixedRule',
              match: '/mixed',
              setOrigin: {
                name: 'mixed origin',
                type: 'object_storage',
              },
              behavior: {
                setHeaders: ['Authorization: Bearer mixed'],
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'set_origin',
            target: 'mixed origin',
          }),
          expect.objectContaining({
            name: 'add_request_header',
            target: 'Authorization: Bearer mixed',
          }),
        ]),
      );
    });

    it('should handle mixed legacy and new config for response rules', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'mixedResponseRule',
              match: '/mixed-response',
              setHeaders: ['X-Mixed-Header: mixed'],
              behavior: {
                enableGZIP: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'add_response_header',
            target: 'X-Mixed-Header: mixed',
          }),
          expect.objectContaining({
            name: 'enable_gzip',
            target: '',
          }),
        ]),
      );
    });
    it('should correctly process cacheByQueryString with option "ignore"', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByQueryString: {
              option: 'ignore',
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_query_string: 'ignore',
          query_string_fields: [],
        }),
      );
    });

    it('should correctly process cacheByQueryString with option "whitelist" and list', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByQueryString: {
              option: 'whitelist',
              list: ['param1', 'param2'],
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_query_string: 'whitelist',
          query_string_fields: ['param1', 'param2'],
        }),
      );
    });

    it('should throw an error if cacheByQueryString option is "whitelist" or "blacklist" without list', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByQueryString: {
              option: 'whitelist',
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "The 'list' field is required when 'option' is 'whitelist' or 'blacklist'.",
      );
    });

    it('should correctly process cacheByQueryString with option "blacklist" and list', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByQueryString: {
              option: 'blacklist',
              list: ['param1', 'param2'],
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_query_string: 'blacklist',
          query_string_fields: ['param1', 'param2'],
        }),
      );
    });

    it('should correctly process cacheByQueryString with option "all"', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByQueryString: {
              option: 'varies',
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_query_string: 'all',
          query_string_fields: [],
        }),
      );
    });
    it('should correctly process cacheByCookie with option "ignore"', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByCookie: {
              option: 'ignore',
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_cookie: 'ignore',
          cookie_names: [],
        }),
      );
    });

    it('should correctly process cacheByCookie with option "whitelist" and list', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByCookie: {
              option: 'whitelist',
              list: ['cookie1', 'cookie2'],
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_cookie: 'whitelist',
          cookie_names: ['cookie1', 'cookie2'],
        }),
      );
    });

    it('should throw an error if cacheByCookie option is "whitelist" or "blacklist" without list', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByCookie: {
              option: 'whitelist',
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "The 'list' field is required when 'option' is 'whitelist' or 'blacklist'.",
      );
    });

    it('should correctly process cacheByCookie with option "blacklist" and list', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByCookie: {
              option: 'blacklist',
              list: ['cookie1', 'cookie2'],
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_cookie: 'blacklist',
          cookie_names: ['cookie1', 'cookie2'],
        }),
      );
    });

    it('should correctly process cacheByCookie with option "all"', () => {
      const azionConfig: any = {
        cache: [
          {
            name: 'testCache',
            cacheByCookie: {
              option: 'varies',
            },
          },
        ],
        rules: {
          request: [],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.cache[0]).toEqual(
        expect.objectContaining({
          cache_by_cookie: 'all',
          cookie_names: [],
        }),
      );
    });
    it('should correctly process rules with criteria', () => {
      const azionConfig: any = {
        functions: [
          {
            name: 'handler',
            path: '.edge/worker.js',
          },
        ],
        rules: {
          request: [
            {
              name: 'testCriteria',
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/',
                },
              ],
              behavior: {
                runFunction: 'handler',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].criteria).toEqual([
        [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            input_value: '^/',
          },
        ],
      ]);
    });

    it('should throw error when using both match and criteria', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testInvalidRule',
              match: '^\\/',
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  input_value: '^/',
                },
              ],
              behavior: {
                runFunction: {
                  path: '.edge/worker.js',
                },
              },
            },
          ],
        },
      };

      expect(() => processConfig(azionConfig)).toThrow("Cannot use 'match' or 'variable' together with 'criteria'.");
    });

    it('should correctly process multiple criteria conditions', () => {
      const azionConfig: any = {
        functions: [
          {
            name: 'handler',
            path: '.edge/worker.js',
          },
        ],
        rules: {
          request: [
            {
              name: 'testMultipleCriteria',
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/',
                },
                {
                  variable: '${device_group}',
                  operator: 'is_equal',
                  conditional: 'and',
                  inputValue: 'mobile',
                },
              ],
              behavior: {
                runFunction: 'handler',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].criteria).toEqual([
        [
          {
            variable: '${uri}',
            operator: 'matches',
            conditional: 'if',
            input_value: '^/',
          },
          {
            variable: '${device_group}',
            operator: 'is_equal',
            conditional: 'and',
            input_value: 'mobile',
          },
        ],
      ]);
    });

    it('should correctly process criteria with operator without value', () => {
      const azionConfig: any = {
        functions: [
          {
            name: 'handler',
            path: '.edge/worker.js',
          },
        ],
        rules: {
          request: [
            {
              name: 'testCriteriaWithoutValue',
              criteria: [
                {
                  variable: '${cookie_test}',
                  operator: 'exists',
                  conditional: 'if',
                },
              ],
              behavior: {
                runFunction: 'handler',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].criteria).toEqual([
        [
          {
            variable: '${cookie_test}',
            operator: 'exists',
            conditional: 'if',
          },
        ],
      ]);
    });

    it('should correctly process rules request with behaviors filterHeader and filterCookie', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testFilterHeaderAndCookie',
              description: 'Filters out a specific cookie from the request.',
              active: true,
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/',
                },
              ],
              behavior: {
                filterHeader: 'X-Test-Header',
                filterCookie: '_cookie',
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'filter_request_header',
            target: 'X-Test-Header',
          }),
          expect.objectContaining({
            name: 'filter_request_cookie',
            target: '_cookie',
          }),
        ]),
      );
    });

    it('should correctly process rules request with behavior noContent', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'testNoContent',
              description: 'Returns a 204 No Content response.',
              active: true,
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/',
                },
              ],
              behavior: {
                noContent: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'no_content',
            target: null,
          }),
        ]),
      );
    });

    it('should correctly process rules response with behavior deliver', () => {
      const azionConfig: any = {
        rules: {
          response: [
            {
              name: 'testDeliver',
              description: 'Delivers the response to the client.',
              active: true,
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/',
                },
              ],
              behavior: {
                deliver: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'deliver',
            target: null,
          }),
        ]),
      );
    });

    it('should correctly process rules request with behavior optimize images', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'test Optimize Images',
              description: 'Returns optimized images.',
              active: true,
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/images',
                },
              ],
              behavior: {
                optimizeImages: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'optimize_images',
            target: null,
          }),
        ]),
      );
    });

    it('should correctly process rules request with behavior deny', () => {
      const azionConfig: any = {
        rules: {
          request: [
            {
              name: 'Test Deny',
              description: 'Denies access to the resource.',
              active: true,
              criteria: [
                {
                  variable: '${uri}',
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '^/login',
                },
              ],
              behavior: {
                deny: true,
              },
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.rules[0].behaviors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'deny',
            target: null,
          }),
        ]),
      );
    });
  });
  describe('Workload', () => {
    it('should throw error when the workload name is not provided', () => {
      const azionConfig: any = {
        workload: {
          edgeApplication: 12345,
        },
      };

      expect(() => processConfig(azionConfig)).toThrow(
        "The 'name' and 'edgeApplication' fields are required in the workload object.",
      );
    });

    it('should correctly process the config when edgeApplication is provided', () => {
      const azionConfig: any = {
        workload: {
          name: 'myworkload',
          edgeApplication: 12345,
        },
      };

      const result = processConfig(azionConfig);
      expect(result.workload).toEqual(
        expect.objectContaining({
          name: 'myworkload',
          edge_application: 12345,
          active: true,
          network_map: '1',
          alternate_domains: [],
          edge_firewall: null,
        }),
      );
    });

    it('should correctly process the config with TLS settings', () => {
      const azionConfig: any = {
        workload: {
          name: 'myworkload',
          edgeApplication: 12345,
          tls: {
            certificate: 67890,
            ciphers: 'TLSv1.2_2021',
            minimumVersion: 'tls_1_2',
          },
        },
      };

      const result = processConfig(azionConfig);
      expect(result.workload).toEqual(
        expect.objectContaining({
          name: 'myworkload',
          edge_application: 12345,
          tls: {
            certificate: 67890,
            ciphers: 'TLSv1.2_2021',
            minimum_version: 'tls_1_2',
          },
        }),
      );
    });

    it('should correctly process the config with mTLS settings', () => {
      const azionConfig: any = {
        workload: {
          name: 'myworkload',
          edgeApplication: 12345,
          mtls: {
            verification: 'enforce',
            certificate: 67890,
            crl: [1234, 5678],
          },
        },
      };

      const result = processConfig(azionConfig);
      expect(result.workload).toEqual(
        expect.objectContaining({
          name: 'myworkload',
          mtls: {
            verification: 'enforce',
            certificate: 67890,
            crl: [1234, 5678],
          },
        }),
      );
    });

    it('should throw error when invalid cipher suite is provided', () => {
      const azionConfig: any = {
        workload: {
          name: 'myworkload',
          edgeApplication: 12345,
          tls: {
            ciphers: 'INVALID_CIPHER',
          },
        },
      };

      expect(() => processConfig(azionConfig)).toThrow("The 'ciphers' field must be a valid cipher suite or null.");
    });

    it('should correctly process the config with HTTP protocol settings', () => {
      const azionConfig: any = {
        workload: {
          name: 'myworkload',
          edgeApplication: 12345,
          protocols: {
            http: {
              versions: ['http1', 'http2'],
              httpPorts: [80],
              httpsPorts: [443],
              quicPorts: null,
            },
          },
        },
      };

      const result = processConfig(azionConfig);
      expect(result.workload).toEqual(
        expect.objectContaining({
          protocols: {
            http: {
              versions: ['http1', 'http2'],
              http_ports: [80],
              https_ports: [443],
              quic_ports: null,
            },
          },
        }),
      );
    });

    it('should correctly process domains configuration', () => {
      const azionConfig: any = {
        workload: {
          name: 'myworkload',
          edgeApplication: 12345,
          domains: [
            {
              domain: 'example.com',
              allowAccess: true,
            },
          ],
        },
      };

      const result = processConfig(azionConfig);
      expect(result.workload).toEqual(
        expect.objectContaining({
          domains: [
            {
              domain: 'example.com',
              allow_access: true,
            },
          ],
        }),
      );
    });
  });
});
