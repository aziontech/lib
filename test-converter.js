// Script para testar a função convertJsonConfigToObject
// Importando a função real da biblioteca compilada

import { convertJsonConfigToObject } from './packages/config/dist/index.js';

// JSON de teste fornecido pelo usuário
const testConfig = {
  build: {
    entry: 'handler.js',
    preset: 'javascript',
    bundler: 'webpack',
  },
  purge: [
    {
      type: 'url',
      items: ['http://www.example.com/image.jpg'],
    },
    {
      type: 'cachekey',
      items: ['https://example.com/test1', 'https://example.com/test2'],
    },
    {
      type: 'wildcard',
      items: ['http://www.example.com/*'],
    },
  ],
  network_list: [
    {
      name: 'my-ip-allowlist',
      type: 'ip_cidr',
      items: ['10.0.0.1/32', '192.168.1.0/24'],
      active: true,
    },
    {
      name: 'trusted-asn-list',
      type: 'asn',
      items: ['123', '456', '789'],
      active: true,
    },
    {
      name: 'allowed-countries',
      type: 'countries',
      items: ['US', 'BR', 'UK'],
      active: true,
    },
  ],
  waf: [
    {
      name: 'my-waf-v4',
      product_version: '1.0',
      engine_settings: {
        engine_version: '2021-Q3',
        type: 'score',
        attributes: {
          rulesets: [1],
          thresholds: [
            {
              threat: 'sql_injection',
              sensitivity: 'high',
            },
            {
              threat: 'cross_site_scripting',
              sensitivity: 'high',
            },
            {
              threat: 'remote_file_inclusion',
              sensitivity: 'medium',
            },
            {
              threat: 'directory_traversal',
              sensitivity: 'low',
            },
            {
              threat: 'evading_tricks',
              sensitivity: 'medium',
            },
            {
              threat: 'file_upload',
              sensitivity: 'low',
            },
            {
              threat: 'unwanted_access',
              sensitivity: 'high',
            },
            {
              threat: 'identified_attack',
              sensitivity: 'medium',
            },
          ],
        },
      },
    },
  ],
  edge_storage: [
    {
      name: 'my-storage',
      edge_access: 'read_write',
      dir: './meu-storage',
    },
    {
      name: 'my-storage-2',
      edge_access: 'read_write',
      dir: './meu-storage',
    },
  ],
  edge_functions: [
    {
      name: 'my-edge-function',
      runtime: 'azion_js',
      default_args: {
        defaultEnv: 'development',
      },
      execution_environment: 'application',
      active: true,
      path: './functions/index.js',
      bindings: {
        storage: {
          bucket: 'my-storage',
          prefix: 'auth-data/',
        },
      },
    },
  ],
  edge_applications: [
    {
      name: 'my-edge-app',
      active: true,
      debug: false,
      modules: {
        edge_cache: {
          enabled: true,
        },
        edge_functions: {
          enabled: false,
        },
        application_accelerator: {
          enabled: false,
        },
        image_processor: {
          enabled: false,
        },
        tiered_cache: {
          enabled: false,
        },
      },
      cache_settings: [
        {
          name: 'mycache',
          browser_cache: {
            behavior: 'override',
            max_age: 5000,
          },
          modules: {
            edge_cache: {
              behavior: 'override',
              max_age: 1000,
              stale_cache: {
                enabled: false,
              },
              large_file_cache: {
                enabled: false,
                offset: 1024,
              },
            },
            tiered_cache: {
              topology: 'near-edge',
            },
            application_accelerator: {
              cache_vary_by_method: [],
              cache_vary_by_querystring: {
                behavior: 'denylist',
                fields: ['order', 'user'],
                sort_enabled: false,
              },
              cache_vary_by_cookies: {
                behavior: 'allowlist',
                cookie_names: ['session', 'user'],
              },
              cache_vary_by_devices: {
                behavior: 'ignore',
                device_group: [],
              },
            },
          },
        },
      ],
      rules: [
        {
          phase: 'request',
          rule: {
            name: 'rewriteRuleExample',
            description: 'Rewrite URLs, set cookies and headers, forward cookies.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/rewrite$',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_cache_policy',
                attributes: {
                  value: 'mycache',
                },
              },
              {
                type: 'rewrite_request',
                attributes: {
                  value: '/new/%{captured[1]}',
                },
              },
              {
                type: 'set_cookie',
                attributes: {
                  value: 'user=12345; Path=/; Secure',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  value: 'Cache-Control: no-cache',
                },
              },
              {
                type: 'forward_cookies',
              },
            ],
          },
        },
        {
          phase: 'request',
          rule: {
            name: 'staticContentRuleExample',
            description: 'Handle static content by setting a specific origin and delivering directly.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/_statics/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_origin',
                attributes: {
                  value: 123,
                },
              },
              {
                type: 'deliver',
              },
            ],
          },
        },
        {
          phase: 'request',
          rule: {
            name: 'computeFunctionRuleExample',
            description: 'Executes a serverless function for compute paths.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/compute/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'run_function',
                attributes: {
                  value: 'my-edge-function',
                },
              },
            ],
          },
        },
        {
          phase: 'request',
          rule: {
            name: 'setEdgeConnectorExample',
            description: 'Routes traffic through edge connector.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/api/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'set_edge_connector',
                attributes: {
                  value: 'my-http-connector',
                },
              },
            ],
          },
        },
        {
          phase: 'request',
          rule: {
            name: 'complexCriteriaExample',
            description: 'Example with multiple criteria groups (AND/OR logic).',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'starts_with',
                  argument: '/mobile/',
                },
                {
                  variable: '${device_group}',
                  conditional: 'and',
                  operator: 'is_equal',
                  argument: 'mobile-devices',
                },
              ],
              [
                {
                  variable: '${host}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: 'm.example.com',
                },
              ],
            ],
            behaviors: [
              {
                type: 'redirect_to_302',
                attributes: {
                  value: 'https://mobile.example.com${uri}',
                },
              },
            ],
          },
        },
        {
          phase: 'response',
          rule: {
            name: 'apiDataResponseRuleExample',
            description: 'Manage headers, cookies, and GZIP compression for API data responses.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/api/data',
                },
              ],
            ],
            behaviors: [
              {
                type: 'add_response_header',
                attributes: {
                  value: 'Content-Type: application/json',
                },
              },
              {
                type: 'enable_gzip',
              },
            ],
          },
        },
        {
          phase: 'response',
          rule: {
            name: 'securityHeadersExample',
            description: 'Add security headers to responses.',
            active: true,
            criteria: [
              [
                {
                  variable: '${status}',
                  conditional: 'if',
                  operator: 'is_equal',
                  argument: '200',
                },
              ],
            ],
            behaviors: [
              {
                type: 'add_response_header',
                attributes: {
                  value: 'X-Frame-Options: DENY',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  value: 'X-Content-Type-Options: nosniff',
                },
              },
              {
                type: 'filter_response_cookie',
                attributes: {
                  value: 'internal_session',
                },
              },
            ],
          },
        },
        {
          phase: 'response',
          rule: {
            name: 'captureGroupsExample',
            description: 'Example using capture groups behavior.',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/capture/(.+)',
                },
              ],
            ],
            behaviors: [
              {
                type: 'capture_match_groups',
                attributes: {
                  regex: '^/capture/(.+)',
                  subject: '${uri}',
                  captured_array: 'captured',
                },
              },
              {
                type: 'add_response_header',
                attributes: {
                  value: 'X-Captured-Path: ${captured[1]}',
                },
              },
            ],
          },
        },
      ],
      device_groups: [
        {
          name: 'mobile-devices',
          user_agent: '(Mobile|Android|iPhone|iPad)',
        },
        {
          name: 'desktop-browsers',
          user_agent: '(Chrome|Firefox|Safari).*(?!Mobile)',
        },
      ],
      functions_instances: [
        {
          name: 'auth-function-instance',
          edge_function: 'my-edge-function',
          args: {
            environment: 'production',
            apiUrl: 'https://api.example.com',
          },
        },
        {
          name: 'analytics-function-instance',
          edge_function: '12345',
          args: {
            environment: 'production',
            trackingId: 'UA-12345',
          },
        },
      ],
    },
  ],
  workloads: [
    {
      name: 'my-production-workload',
      active: true,
      infrastructure: 1,
      workload_domain_allow_access: true,
      domains: ['example.com', 'www.example.com'],
      tls: {
        certificate: 12345,
        ciphers: 1,
        minimum_version: 'tls_1_3',
      },
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          http_ports: [80],
          https_ports: [443],
          quic_ports: null,
        },
      },
      mtls: {
        verification: 'enforce',
        certificate: 67890,
        crl: [1, 2, 3],
      },
    },
  ],
  edge_connectors: [
    {
      name: 'my-http-connector',
      active: true,
      type: 'http',
      attributes: {
        addresses: [
          {
            active: true,
            address: 'api.example.com',
            http_port: 80,
            https_port: 443,
            modules: null,
          },
        ],
        connection_options: {
          dns_resolution: 'preserve',
          transport_policy: 'preserve',
          http_version_policy: 'http1_1',
          host: '${host}',
          path_prefix: '',
          following_redirect: false,
          real_ip_header: 'X-Real-IP',
          real_port_header: 'X-Real-PORT',
        },
        modules: {
          load_balancer: {
            enabled: false,
            config: null,
          },
          origin_shield: {
            enabled: false,
            config: null,
          },
        },
      },
    },
    {
      name: 'my-s3-connector',
      active: true,
      type: 'edge_storage',
      attributes: {
        bucket: 'my-bucket',
        prefix: '/uploads',
      },
    },
  ],
};

async function testConverter() {
  try {
    console.log('🧪 Testando convertJsonConfigToObject...\n');

    // Converter o objeto para string JSON
    const configString = JSON.stringify(testConfig, null, 2);
    console.log('📝 Configuração de entrada:');
    console.log(configString);
    console.log('\n' + '='.repeat(80) + '\n');

    // Testar a conversão
    const result = convertJsonConfigToObject(configString);

    console.log('✅ Conversão bem-sucedida!');
    console.log('📊 Resultado da conversão:');
    console.log(JSON.stringify(result, null, 2));

    // Validar se a estrutura está correta
    console.log('\n🔍 Validação da estrutura:');
    console.log('- build:', !!result.build);
    console.log('- edge_storage:', Array.isArray(result.edge_storage));
    console.log('- edge_functions:', Array.isArray(result.edge_functions));
    console.log('- edge_applications:', Array.isArray(result.edge_applications));
    console.log('- edge_connectors:', Array.isArray(result.edge_connectors));

    // Debug: mostrar todas as chaves do resultado
    console.log('\n🔍 Debug - Todas as chaves do resultado:');
    console.log(Object.keys(result));

    // Debug: mostrar valores específicos
    console.log('\n🔍 Debug - Valores específicos:');
    console.log('edge_storage:', result.edge_storage);
    console.log('edge_functions:', result.edge_functions);
    console.log('edge_connectors:', result.edge_connectors);
    console.log('edge_applications:', result.edge_applications);
    console.log('edgeApplications:', result.edgeApplications);

    if (result.edge_storage) {
      console.log(`  - Quantidade de storages: ${result.edge_storage.length}`);
    }
    if (result.edge_functions) {
      console.log(`  - Quantidade de edge functions: ${result.edge_functions.length}`);
    }
    if (result.edge_applications) {
      console.log(`  - Quantidade de edge applications: ${result.edge_applications.length}`);
    }
    if (result.edge_connectors) {
      console.log(`  - Quantidade de edge connectors: ${result.edge_connectors.length}`);
    }

    console.log('\n🎉 Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o teste:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Executar o teste
testConverter();
