/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertJsonConfigToObject } from '.';

describe('convertJsonConfigToObject', () => {
  describe('Domain', () => {
    it('should correctly process the config domain', () => {
      const jsonConfig = {
        domain: {
          name: 'mydomain',
          cname_access_only: true,
          cnames: ['www.example.com'],
          digital_certificate_id: 'lets_encrypt',
          is_mtls_enabled: true,
          mtls_verification: 'enforce',
          mtls_trusted_ca_certificate_id: 12345,
          edge_application_id: 12345,
          edge_firewall_id: 12345,
        },
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.domain).toEqual(
        expect.objectContaining({
          name: 'mydomain',
          cnameAccessOnly: true,
          cnames: ['www.example.com'],
          digitalCertificateId: 'lets_encrypt',
          mtls: {
            verification: 'enforce',
            trustedCaCertificateId: 12345,
            crlList: undefined,
          },
          edgeApplicationId: 12345,
          edgeFirewallId: 12345,
        }),
      );
    });
  });
  describe('Build', () => {
    it('should correctly process the config build', () => {
      const jsonConfig = {
        build: {
          builder: 'esbuild',
          preset: {
            name: 'react',
          },
        },
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.build).toEqual(
        expect.objectContaining({
          builder: 'esbuild',
          preset: {
            name: 'react',
          },
        }),
      );
    });
  });
  describe('Origin', () => {
    it('should correctly process the config origin', () => {
      const jsonConfig = {
        origin: [
          {
            name: 'my origin storage',
            origin_type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          },
        ],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'my origin storage',
            type: 'object_storage',
            bucket: 'mybucket',
            prefix: 'myfolder',
          }),
        ]),
      );
    });
    it('should correctly process the config origin with origin_type single_origin', () => {
      const jsonConfig = {
        origin: [
          {
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
          },
        ],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.origin).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
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
          }),
        ]),
      );
    });
  });
  describe('Cache', () => {
    it('should correctly process the config cache', () => {
      const jsonConfig = {
        cache: [
          {
            name: 'testCache',
            cache_by_query_string: 'ignore',
          },
        ],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.cache).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'testCache',
            cacheByQueryString: {
              option: 'ignore',
              list: [],
            },
          }),
        ]),
      );
    });
  });
  describe('Purge', () => {
    it('should correctly process the config purge', () => {
      const jsonConfig = {
        purge: [
          {
            type: 'url',
            urls: ['https://example.com'],
          },
        ],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.purge).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'url',
            urls: ['https://example.com'],
            method: 'delete',
          }),
        ]),
      );
    });
  });
  describe('Rules', () => {
    describe('Request', () => {
      it('should correctly process the config rules', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              is_active: true,
              description: 'This rule redirects all traffic.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'redirect_to_301',
                  target: 'https://example.com',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              description: 'This rule redirects all traffic.',
              active: true,
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              behavior: {
                redirectTo301: 'https://example.com',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with origin object_storage', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule responds with a file from the origin storage.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'set_origin',
                  target: 'my origin storage',
                },
              ],
            },
          ],
          origin: [
            {
              name: 'my origin storage',
              origin_type: 'object_storage',
              bucket: 'mybucket',
              prefix: 'myfolder',
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule responds with a file from the origin storage.',
              behavior: {
                setOrigin: {
                  name: 'my origin storage',
                  type: 'object_storage',
                },
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with rewrite behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule rewrites the request path.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'rewrite_request',
                  target: '/new',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule rewrites the request path.',
              behavior: {
                rewrite: '/new',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with deliver behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule delivers the request.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'deliver',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule delivers the request.',
              behavior: {
                deliver: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with set_cookie behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule sets a cookie.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'add_request_cookie',
                  target: 'cookieName=cookieValue',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule sets a cookie.',
              behavior: {
                setCookie: 'cookieName=cookieValue',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with set_headers behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule sets multiple headers.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'add_request_header',
                  target: 'X-Header: value1',
                },
                {
                  name: 'add_request_header',
                  target: 'X-Another-Header: value2',
                },
                {
                  name: 'add_request_header',
                  target: 'X-Third-Header: value3, value4',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule sets multiple headers.',
              behavior: {
                setHeaders: ['X-Header: value1', 'X-Another-Header: value2', 'X-Third-Header: value3, value4'],
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with setCache string behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule sets the cache.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'set_cache_policy',
                  target: 'testCache',
                },
              ],
            },
          ],
          cache: [
            {
              name: 'testCache',
              cache_by_query_string: 'ignore',
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule sets the cache.',
              behavior: {
                setCache: 'testCache',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with setCache object behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule sets the cache.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'set_cache_policy',
                  target: {
                    name: 'directCache',
                    browser_cache_settings_maximum_ttl: 300,
                    cdn_cache_settings_maximum_ttl: 600,
                  },
                },
              ],
            },
          ],
          cache: [
            {
              name: 'testCache',
              cache_by_query_string: 'ignore',
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule sets the cache.',
              behavior: {
                setCache: {
                  name: 'directCache',
                  browser_cache_settings_maximum_ttl: 300,
                  cdn_cache_settings_maximum_ttl: 600,
                },
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with forwarCookie behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule forwards the cookie.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'forward_cookies',
                  target: null,
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule forwards the cookie.',
              behavior: {
                forwardCookies: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with runFunction behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule runs a function.',
              is_active: true,
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'run_function',
                  target: 'myFunction',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              active: true,
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule runs a function.',
              behavior: {
                runFunction: {
                  path: 'myFunction',
                },
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with enableGZIP behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule enables GZIP compression.',
              is_active: true,
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'enable_gzip',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule enables GZIP compression.',
              active: true,
              behavior: {
                enableGZIP: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with bypassCache behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              is_active: true,
              description: 'This rule bypasses the cache.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'bypass_cache_phase',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule bypasses the cache.',
              active: true,
              behavior: {
                bypassCache: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with httpToHttps behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              is_active: false,
              description: 'This rule redirects HTTP to HTTPS.',
              criteria: [
                [
                  {
                    variable: `\${scheme}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: 'http',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'redirect_http_to_https',
                  target: null,
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              active: false,
              criteria: [
                {
                  variable: `\${scheme}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: 'http',
                },
              ],
              description: 'This rule redirects HTTP to HTTPS.',
              behavior: {
                httpToHttps: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with capture behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              is_active: false,
              description: 'This rule captures the request.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'capture_match_groups',
                  target: {
                    regex: '^/user/(.*)',
                    captured_array: 'userId',
                    subject: '${uri}',
                  },
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule captures the request.',
              active: false,
              behavior: {
                capture: {
                  match: '^/user/(.*)',
                  captured: 'userId',
                  subject: '${uri}',
                },
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules request with behaviors filterCookie and filterHeader', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'test Filter Cookie and Filter Header',
              phase: 'request',
              is_active: true,
              description: 'This rule captures the request.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'filter_request_cookie',
                  target: 'cookieName',
                },
                {
                  name: 'filter_request_header',
                  target: 'X-Header',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test Filter Cookie and Filter Header',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule captures the request.',
              active: true,
              behavior: {
                filterCookie: 'cookieName',
                filterHeader: 'X-Header',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules request with behavior noContent', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'test No Content',
              phase: 'request',
              is_active: true,
              description: 'This rule the request.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'no_content',
                  target: null,
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test No Content',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule the request.',
              active: true,
              behavior: {
                noContent: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules request with behavior optimizeImages', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'test Optimize Images',
              phase: 'request',
              is_active: true,
              description: 'This rule the request.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/images',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'optimize_images',
                  target: null,
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'test Optimize Images',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/images',
                },
              ],
              description: 'This rule the request.',
              active: true,
              behavior: {
                optimizeImages: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with set_headers behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'request',
              description: 'This rule sets multiple headers.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'add_request_header',
                  target: 'X-Header: value1',
                },
                {
                  name: 'add_request_header',
                  target: 'X-Another-Header: value2',
                },
                {
                  name: 'add_request_header',
                  target: 'X-Third-Header: value3, value4',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule sets multiple headers.',
              behavior: {
                setHeaders: ['X-Header: value1', 'X-Another-Header: value2', 'X-Third-Header: value3, value4'],
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules request with behavior deny', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'Test Deny',
              phase: 'request',
              is_active: true,
              description: 'This rule the request.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/login',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'deny',
                  target: null,
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.request).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Deny',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/login',
                },
              ],
              description: 'This rule the request.',
              active: true,
              behavior: {
                deny: true,
              },
            }),
          ]),
        );
      });
    });
    describe('Response', () => {
      it('should correctly process the config rules with redirect_to_301', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'response',
              is_active: false,
              description: 'This rule redirects all traffic.',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'redirect_to_301',
                  target: 'https://example.com',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              description: 'This rule redirects all traffic.',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              active: false,
              behavior: {
                redirectTo301: 'https://example.com',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with redirect_to_302', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'response',
              description: 'This rule redirects all traffic.',
              is_active: false,
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'redirect_to_302',
                  target: 'https://example.com',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              description: 'This rule redirects all traffic.',
              active: false,
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              behavior: {
                redirectTo302: 'https://example.com',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with setCookie behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              is_active: false,
              phase: 'response',
              description: 'This rule sets a cookie.',
              criteria: [
                [
                  {
                    variable: `\${status}`,
                    operator: 'equals',
                    conditional: 'if',
                    input_value: '200',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'add_response_cookie',
                  target: 'cookieName=cookieValue',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${status}`,
                  operator: 'equals',
                  conditional: 'if',
                  inputValue: '200',
                },
              ],
              active: false,
              description: 'This rule sets a cookie.',
              behavior: {
                setCookie: 'cookieName=cookieValue',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with set_headers behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'response',
              description: 'This rule sets a header.',
              criteria: [
                [
                  {
                    variable: `\${status}`,
                    operator: 'equals',
                    conditional: 'if',
                    input_value: '200',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'add_response_header',
                  target: 'X-Header: value',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${status}`,
                  operator: 'equals',
                  conditional: 'if',
                  inputValue: '200',
                },
              ],
              description: 'This rule sets a header.',
              behavior: {
                setHeaders: ['X-Header: value'],
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with enableGZIP behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'response',
              description: 'This rule enables GZIP compression.',
              criteria: [
                [
                  {
                    variable: `\${status}`,
                    operator: 'equals',
                    conditional: 'if',
                    input_value: '200',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'enable_gzip',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${status}`,
                  operator: 'equals',
                  conditional: 'if',
                  inputValue: '200',
                },
              ],
              description: 'This rule enables GZIP compression.',
              behavior: {
                enableGZIP: true,
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with filterCookie behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              description: 'This rule filters the cookie.',
              is_active: false,
              phase: 'response',
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'filter_response_cookie',
                  target: 'cookieName',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              active: false,
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule filters the cookie.',
              behavior: {
                filterCookie: 'cookieName',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with filterHeaders behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'response',
              description: 'This rule filters the header.',
              is_active: false,
              criteria: [
                [
                  {
                    variable: `\${status}`,
                    operator: 'equals',
                    conditional: 'if',
                    input_value: '200',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'filter_response_header',
                  target: 'X-Header',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              active: false,
              criteria: [
                {
                  variable: `\${status}`,
                  operator: 'equals',
                  conditional: 'if',
                  inputValue: '200',
                },
              ],
              description: 'This rule filters the header.',
              behavior: {
                filterHeader: 'X-Header',
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with runFunction behavior', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule',
              phase: 'response',
              description: 'This rule runs a function.',
              is_active: true,
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: '/test',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'run_function',
                  target: 'myFunction',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule',
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'matches',
                  conditional: 'if',
                  inputValue: '/test',
                },
              ],
              description: 'This rule runs a function.',
              active: true,
              behavior: {
                runFunction: {
                  path: 'myFunction',
                },
              },
            }),
          ]),
        );
      });
      it('should correctly process the config rules with behavior deliver', () => {
        const jsonConfig = {
          rules: [
            {
              name: 'testRule Deliver',
              phase: 'response',
              description: 'This rule delivers the response.',
              is_active: true,
              criteria: [
                [
                  {
                    variable: `\${uri}`,
                    operator: 'equals',
                    conditional: 'if',
                    input_value: '/',
                  },
                ],
              ],
              behaviors: [
                {
                  name: 'deliver',
                  target: 'null',
                },
              ],
            },
          ],
        };

        const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
        expect(result.rules?.response).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'testRule Deliver',
              active: true,
              criteria: [
                {
                  variable: `\${uri}`,
                  operator: 'equals',
                  conditional: 'if',
                  inputValue: '/',
                },
              ],
              description: 'This rule delivers the response.',
              behavior: {
                deliver: true,
              },
            }),
          ]),
        );
      });
    });
  });
  describe('Network List', () => {
    it('should correctly process the config network list', () => {
      const jsonConfig = {
        networkList: [
          {
            id: 1,
            list_type: 'ip_cidr',
            items_values: ['10.0.0.1'],
          },
          {
            id: 2,
            list_type: 'asn',
            items_values: ['AS123'],
          },
          {
            id: 3,
            list_type: 'countries',
            items_values: ['US'],
          },
        ],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.networkList).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            listType: 'ip_cidr',
            listContent: ['10.0.0.1'],
          }),
        ]),
      );
    });
    it('should throw an error when the network list id is not a number', () => {
      const jsonConfig = {
        networkList: [
          {
            id: '1',
            list_type: 'ip_cidr',
            items_values: ['10.0.0.1'],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow("The 'id' field must be a number.");
    });
    it('should throw an error when the network list list_type is not valid', () => {
      const jsonConfig = {
        networkList: [
          {
            id: 1,
            list_type: 'invalid',
            items_values: ['10.0.0.1'],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
        "The 'list_type' field must be a string. Accepted values are 'ip_cidr', 'asn' or 'countries'.",
      );
    });
    it('should throw an error when the network list required fields are not provided', () => {
      const jsonConfig = {
        networkList: [
          {
            id: 1,
            list_type: 'ip_cidr',
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
        "The 'id, list_type and items_values' fields are required in each network list item.",
      );
    });
  });
  describe('WAF', () => {
    let defaultConfig: any;

    beforeEach(() => {
      defaultConfig = {
        id: 123,
        name: 'mywaf',
        mode: 'counting',
        active: true,
        bypass_addresses: [],
        sql_injection: true,
        sql_injection_sensitivity: 'medium',
        remote_file_inclusion: true,
        remote_file_inclusion_sensitivity: 'medium',
        directory_traversal: true,
        directory_traversal_sensitivity: 'medium',
        cross_site_scripting: true,
        cross_site_scripting_sensitivity: 'medium',
        evading_tricks: true,
        evading_tricks_sensitivity: 'medium',
        file_upload: true,
        file_upload_sensitivity: 'medium',
        unwanted_access: true,
        unwanted_access_sensitivity: 'medium',
        identified_attack: true,
        identified_attack_sensitivity: 'medium',
      };
    });

    it('should correctly process the config waf', () => {
      const jsonConfig = {
        waf: [defaultConfig],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.waf).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'mywaf',
            mode: 'counting',
            active: true,
            bypassAddresses: [],
            crossSiteScripting: {
              sensitivity: 'medium',
            },
            sqlInjection: {
              sensitivity: 'medium',
            },
            remoteFileInclusion: {
              sensitivity: 'medium',
            },
            directoryTraversal: {
              sensitivity: 'medium',
            },
            evadingTricks: {
              sensitivity: 'medium',
            },
            fileUpload: {
              sensitivity: 'medium',
            },
            unwantedAccess: {
              sensitivity: 'medium',
            },
            identifiedAttack: {
              sensitivity: 'medium',
            },
          }),
        ]),
      );
    });
    it('should throw an error when the waf mode is not valid', () => {
      const jsonConfig = {
        waf: [
          {
            ...defaultConfig,
            mode: 'invalid',
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
        "The 'mode' field must be one of: learning, blocking, counting",
      );
    });
    it('should throw an error when the waf bypassAddresses is not an array', () => {
      const jsonConfig = {
        waf: [
          {
            ...defaultConfig,
            bypass_addresses: 'invalid',
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
        "The 'bypass_addresses' field must be an array of strings.",
      );
    });
    it('should correctly process the config waf with cross_site_scripting sensitivity low', () => {
      const jsonConfig = {
        waf: [
          {
            ...defaultConfig,
            cross_site_scripting_sensitivity: 'low',
          },
        ],
      };

      const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
      expect(result.waf).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'mywaf',
            mode: 'counting',
            active: true,
            bypassAddresses: [],
            crossSiteScripting: {
              sensitivity: 'low',
            },
          }),
        ]),
      );
    });
  });
  describe('Domains', () => {
    it('should throw error when required fields are missing', () => {
      const jsonConfig = {
        domains: [
          {
            name: 'mydomain.com',
            // missing required fields
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });

    it('should throw error for invalid digital_certificate_id value', () => {
      const jsonConfig = {
        domains: [
          {
            name: 'mydomain.com',
            edge_application_id: 123,
            cnames: ['www.mydomain.com'],
            cname_access_only: false,
            digital_certificate_id: 'invalid_value',
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });

    it('should throw error for invalid crl_list values', () => {
      const jsonConfig = {
        domains: [
          {
            name: 'mydomain.com',
            edge_application_id: 123,
            cnames: ['www.mydomain.com'],
            cname_access_only: false,
            digital_certificate_id: 'lets_encrypt',
            crl_list: ['invalid', 'values'],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });
  });
  describe('Firewall', () => {
    it('should throw error when required fields are missing', () => {
      const jsonConfig = {
        firewall: [
          {
            main_settings: {
              // missing name field
              is_active: true,
            },
            rules: [],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });

    it('should throw error when rule criteria is invalid', () => {
      const jsonConfig = {
        firewall: [
          {
            main_settings: {
              name: 'my-firewall',
              is_active: true,
            },
            rules: [
              {
                name: 'invalid-rule',
                criteria: {
                  variable: 'invalid_variable',
                  operator: 'is_equal',
                  conditional: 'if',
                  input_value: 'test',
                },
              },
            ],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });

    it('should throw error when behavior name is invalid', () => {
      const jsonConfig = {
        firewall: [
          {
            main_settings: {
              name: 'my-firewall',
              is_active: true,
            },
            rules: [
              {
                name: 'invalid-behavior',
                criteria: {
                  variable: 'request_uri',
                  operator: 'is_equal',
                  conditional: 'if',
                  input_value: '/test',
                },
                behavior: {
                  name: 'invalid_behavior',
                  target: 'test',
                },
              },
            ],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });

    it('should throw error when rate limit arguments are invalid', () => {
      const jsonConfig = {
        firewall: [
          {
            main_settings: {
              name: 'my-firewall',
              is_active: true,
            },
            rules: [
              {
                name: 'invalid-rate-limit',
                criteria: {
                  variable: 'request_uri',
                  operator: 'is_equal',
                  conditional: 'if',
                  input_value: '/test',
                },
                behavior: {
                  name: 'set_rate_limit',
                  target: {
                    type: 'invalid',
                    limit_by: 'invalid',
                    average_rate_limit: 'not_a_number',
                  },
                },
              },
            ],
          },
        ],
      };

      expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow();
    });
  });
  describe('Application', () => {
    describe('Main Settings', () => {
      it('should throw an error when delivery_protocol is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
                delivery_protocol: 'invalid',
              },
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'delivery_protocol' field must be either 'http,https' or 'http'.",
        );
      });

      it('should throw an error when http_port is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
                http_port: 'invalid',
              },
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'http_port' field must be an array",
        );
      });
    });

    describe('Cache Settings', () => {
      it('should throw an error when browser_cache_settings is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              cache_settings: [
                {
                  name: 'test',
                  browser_cache_settings: 'invalid',
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'browser_cache_settings' must be either 'honor' or 'override'.",
        );
      });

      it('should throw an error when cache_by_query_string is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              cache_settings: [
                {
                  name: 'test',
                  cache_by_query_string: 'invalid',
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'cache_by_query_string' must be one of: ignore, whitelist, blacklist, all.",
        );
      });
    });

    describe('Origins', () => {
      it('should throw an error when origin_type is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              origins: [
                {
                  name: 'test',
                  origin_type: 'invalid',
                  addresses: [{ address: 'example.com' }],
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'origin_type' field must be one of: single_origin, load_balancer, live_ingest, object_storage.",
        );
      });

      it('should throw an error when bucket is missing for object_storage type', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              origins: [
                {
                  name: 'test',
                  origin_type: 'object_storage',
                  addresses: [{ address: 'example.com' }],
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "When origin_type is 'object_storage', the 'bucket' field is required.",
        );
      });
    });

    describe('Rules', () => {
      it('should throw an error when criteria variable is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              rules: [
                {
                  name: 'test',
                  criteria: [
                    [
                      {
                        variable: 'invalid_variable',
                        operator: 'matches',
                        conditional: 'if',
                        input_value: '/test',
                      },
                    ],
                  ],
                  behaviors: [
                    {
                      name: 'deliver',
                      target: null,
                    },
                  ],
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'variable' field must be a valid variable name.",
        );
      });

      it('should throw an error when behavior name is invalid', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              rules: [
                {
                  name: 'test',
                  criteria: [
                    [
                      {
                        variable: 'request_uri',
                        operator: 'matches',
                        conditional: 'if',
                        input_value: '/test',
                      },
                    ],
                  ],
                  behaviors: [
                    {
                      name: 'invalid_behavior',
                      target: null,
                    },
                  ],
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The 'name' field must be a valid behavior name.",
        );
      });

      it('should throw an error when input_value is missing for operator that requires it', () => {
        const jsonConfig = {
          application: [
            {
              main_settings: {
                name: 'test',
              },
              rules: [
                {
                  name: 'test',
                  criteria: [
                    [
                      {
                        variable: 'request_uri',
                        operator: 'matches',
                        conditional: 'if',
                      },
                    ],
                  ],
                  behaviors: [
                    {
                      name: 'deliver',
                      target: null,
                    },
                  ],
                },
              ],
            },
          ],
        };

        expect(() => convertJsonConfigToObject(JSON.stringify(jsonConfig))).toThrow(
          "The operator 'matches' requires an input_value.",
        );
      });
    });
  });
});
