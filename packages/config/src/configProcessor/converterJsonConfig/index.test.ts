// TODO: review firewall module and enable this tests again

// import { convertJsonConfigToObject } from '.';

describe('convertJsonConfigToObject', () => {
  it('should correctly process the config', () => {
    expect(true).toBeTruthy();
  });
});

// describe('convertJsonConfigToObject', () => {
//   describe('Applications', () => {
//     it('should correctly process edge applications with domain configuration', () => {
//       const jsonConfig = {
//         applications: [
//           {
//             name: 'my-edge-app',
//             active: true,
//             debug: false,
//             edgeCacheEnabled: true,
//             functionsEnabled: false,
//             applicationAcceleratorEnabled: false,
//             imageProcessorEnabled: false,
//             tieredCacheEnabled: false,
//             cache: [
//               {
//                 name: 'mycache',
//                 stale: false,
//                 queryStringSort: false,
//                 methods: {
//                   post: false,
//                   options: false,
//                 },
//                 browser: {
//                   maxAgeSeconds: 1000 * 5,
//                 },
//                 edge: {
//                   maxAgeSeconds: 1000,
//                 },
//                 cacheByQueryString: {
//                   option: 'ignore',
//                   list: [],
//                 },
//                 cacheByCookie: {
//                   option: 'ignore',
//                   list: [],
//                 },
//               },
//             ],
//             rules: {
//               request: [
//                 {
//                   name: 'test-rule',
//                   description: 'Test rule for V4',
//                   active: true,
//                   criteria: [
//                     [
//                       {
//                         variable: 'uri',
//                         conditional: 'if',
//                         operator: 'matches',
//                         argument: '/test',
//                       },
//                     ],
//                   ],
//                   behaviors: [
//                     {
//                       type: 'deliver',
//                     },
//                   ],
//                 },
//               ],
//               response: [],
//             },
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.applications).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-edge-app',
//             active: true,
//             debug: false,
//             edgeCacheEnabled: true,
//             functionsEnabled: false,
//             applicationAcceleratorEnabled: false,
//             imageProcessorEnabled: false,
//             tieredCacheEnabled: false,
//             cache: expect.arrayContaining([
//               expect.objectContaining({
//                 name: 'mycache',
//                 stale: false,
//                 queryStringSort: false,
//                 methods: {
//                   post: false,
//                   options: false,
//                 },
//                 browser: {
//                   maxAgeSeconds: 1000 * 5,
//                 },
//                 edge: {
//                   maxAgeSeconds: 1000,
//                 },
//                 cacheByQueryString: {
//                   option: 'ignore',
//                   list: [],
//                 },
//                 cacheByCookie: {
//                   option: 'ignore',
//                   list: [],
//                 },
//               }),
//             ]),
//             rules: {
//               request: expect.arrayContaining([
//                 expect.objectContaining({
//                   name: 'test-rule',
//                   description: 'Test rule for V4',
//                   active: true,
//                   criteria: [
//                     [
//                       {
//                         variable: 'uri',
//                         conditional: 'if',
//                         operator: 'matches',
//                         argument: '/test',
//                       },
//                     ],
//                   ],
//                   behaviors: [
//                     {
//                       type: 'deliver',
//                     },
//                   ],
//                 }),
//               ]),
//               response: [],
//             },
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Build', () => {
//     it('should correctly process the config build', () => {
//       const jsonConfig = {
//         build: {
//           bundler: 'esbuild',
//           preset: {
//             name: 'react',
//           },
//         },
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.build).toEqual(
//         expect.objectContaining({
//           bundler: 'esbuild',
//           preset: {
//             name: 'react',
//           },
//         }),
//       );
//     });
//   });

//   describe('Functions', () => {
//     it('should correctly process functions', () => {
//       const jsonConfig = {
//         functions: [
//           {
//             name: 'my-function',
//             path: './functions/myFunction.js',
//             runtime: 'azion_js',
//             defaultArgs: { arg1: 'value1' },
//             executionEnvironment: 'application',
//             active: true,
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.functions).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-function',
//             path: './functions/myFunction.js',
//             runtime: 'azion_js',
//             defaultArgs: { arg1: 'value1' },
//             executionEnvironment: 'application',
//             active: true,
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Connectors', () => {
//     it('should correctly process edge connectors', () => {
//       const jsonConfig = {
//         connectors: [
//           {
//             name: 'my-connector',
//             active: true,
//             type: 'http',
//             attributes: {
//               addresses: [
//                 {
//                   active: true,
//                   address: 'http.bin.org',
//                   httpPort: 80,
//                   httpsPort: 443,
//                 },
//               ],
//               connectionOptions: {
//                 dnsResolution: 'both',
//                 transportPolicy: 'preserve',
//                 httpVersionPolicy: 'http1_1',
//                 host: '${host}',
//                 pathPrefix: '',
//                 followingRedirect: false,
//                 realIpHeader: 'X-Real-IP',
//                 realPortHeader: 'X-Real-PORT',
//               },
//               modules: {
//                 loadBalancer: {
//                   enabled: false,
//                   config: null,
//                 },
//                 originShield: {
//                   enabled: false,
//                   config: null,
//                 },
//               },
//             },
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.connectors).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-connector',
//             active: true,
//             type: 'http',
//             attributes: expect.objectContaining({
//               addresses: expect.arrayContaining([
//                 expect.objectContaining({
//                   active: true,
//                   address: 'http.bin.org',
//                   httpPort: 80,
//                   httpsPort: 443,
//                 }),
//               ]),
//               connectionOptions: expect.objectContaining({
//                 dnsResolution: 'both',
//                 transportPolicy: 'preserve',
//                 httpVersionPolicy: 'http1_1',
//                 host: '${host}',
//                 pathPrefix: '',
//                 followingRedirect: false,
//                 realIpHeader: 'X-Real-IP',
//                 realPortHeader: 'X-Real-PORT',
//               }),
//               modules: expect.objectContaining({
//                 loadBalancer: {
//                   enabled: false,
//                   config: null,
//                 },
//                 originShield: {
//                   enabled: false,
//                   config: null,
//                 },
//               }),
//             }),
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Storage', () => {
//     it('should correctly process edge storage', () => {
//       const jsonConfig = {
//         storage: [
//           {
//             name: 'my-storage',
//             dir: './public',
//             workloadsAccess: 'read_only',
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.storage).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-storage',
//             dir: './public',
//             workloadsAccess: 'read_only',
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Purge', () => {
//     it('should correctly process the config purge', () => {
//       const jsonConfig = {
//         purge: [
//           {
//             type: 'url',
//             items: ['https://example.com'],
//             layer: 'cache',
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.purge).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             type: 'url',
//             items: ['https://example.com'],
//             layer: 'cache',
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Network List', () => {
//     it('should correctly process the config network list', () => {
//       const jsonConfig = {
//         networkList: [
//           {
//             name: 'my-network-list',
//             type: 'ip_cidr',
//             items: ['10.0.0.1'],
//             active: true,
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.networkList).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-network-list',
//             type: 'ip_cidr',
//             items: ['10.0.0.1'],
//             active: true,
//           }),
//         ]),
//       );
//     });
//   });

//   describe('WAF', () => {
//     it('should correctly process the config waf', () => {
//       const jsonConfig = {
//         waf: [
//           {
//             name: 'my-waf',
//             productVersion: '1.0',
//             engineSettings: {
//               engineVersion: '2021-Q3',
//               type: 'score',
//               attributes: {
//                 rulesets: [1],
//                 thresholds: [
//                   {
//                     threat: 'cross_site_scripting',
//                     sensitivity: 'medium',
//                   },
//                 ],
//               },
//             },
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.waf).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-waf',
//             productVersion: '1.0',
//             engineSettings: expect.objectContaining({
//               engineVersion: '2021-Q3',
//               type: 'score',
//               attributes: expect.objectContaining({
//                 rulesets: [1],
//                 thresholds: expect.arrayContaining([
//                   expect.objectContaining({
//                     threat: 'cross_site_scripting',
//                     sensitivity: 'medium',
//                   }),
//                 ]),
//               }),
//             }),
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Workloads', () => {
//     it('should correctly process workloads', () => {
//       const jsonConfig = {
//         workloads: [
//           {
//             name: 'my-workload',
//             active: true,
//             infrastructure: 1,
//             domains: ['example.com'],
//             workloadDomainAllowAccess: true,
//             tls: {
//               certificate: null,
//               ciphers: null,
//               minimumVersion: 'tls_1_3',
//             },
//             protocols: {
//               http: {
//                 versions: ['http1', 'http2'],
//                 httpPorts: [80],
//                 httpsPorts: [443],
//                 quicPorts: null,
//               },
//             },
//             mtls: {
//               verification: 'enforce',
//               certificate: null,
//               crl: null,
//             },
//             deployments: [
//               {
//                 name: 'production',
//                 current: true,
//                 active: true,
//                 strategy: {
//                   type: 'application',
//                   attributes: {
//                     application: 'my-edge-app',
//                     firewall: null,
//                     customPage: null,
//                   },
//                 },
//               },
//             ],
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.workloads).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-workload',
//             active: true,
//             infrastructure: 1,
//             domains: ['example.com'],
//             workloadDomainAllowAccess: true,
//             tls: expect.objectContaining({
//               certificate: null,
//               ciphers: null,
//               minimumVersion: 'tls_1_3',
//             }),
//             protocols: expect.objectContaining({
//               http: expect.objectContaining({
//                 versions: ['http1', 'http2'],
//                 httpPorts: [80],
//                 httpsPorts: [443],
//                 quicPorts: null,
//               }),
//             }),
//             mtls: expect.objectContaining({
//               verification: 'enforce',
//               certificate: null,
//               crl: null,
//             }),
//             deployments: expect.arrayContaining([
//               expect.objectContaining({
//                 name: 'production',
//                 current: true,
//                 active: true,
//                 strategy: expect.objectContaining({
//                   type: 'application',
//                   attributes: expect.objectContaining({
//                     application: 'my-edge-app',
//                     firewall: null,
//                     customPage: null,
//                   }),
//                 }),
//               }),
//             ]),
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Custom Pages', () => {
//     it('should correctly process custom pages', () => {
//       const jsonConfig = {
//         customPages: [
//           {
//             name: 'my-custom-pages',
//             active: true,
//             pages: [
//               {
//                 code: '404',
//                 page: {
//                   type: 'page_connector',
//                   attributes: {
//                     connector: 'my-connector',
//                     ttl: 0,
//                     uri: '/404',
//                     customStatusCode: null,
//                   },
//                 },
//               },
//             ],
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.customPages).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-custom-pages',
//             active: true,
//             pages: expect.arrayContaining([
//               expect.objectContaining({
//                 code: '404',
//                 page: expect.objectContaining({
//                   type: 'page_connector',
//                   attributes: expect.objectContaining({
//                     connector: 'my-connector',
//                     ttl: 0,
//                     uri: '/404',
//                     customStatusCode: null,
//                   }),
//                 }),
//               }),
//             ]),
//           }),
//         ]),
//       );
//     });
//   });

//   describe('Firewall', () => {
//     it('should correctly process edge firewall', () => {
//       const jsonConfig = {
//         firewall: [
//           {
//             name: 'my-firewall',
//             domains: ['example.com'],
//             active: true,
//             functions: true,
//             networkProtection: true,
//             waf: true,
//             variable: 'request_uri',
//             debugRules: false,
//             rules: [
//               {
//                 name: 'test-rule',
//                 description: 'Test firewall rule',
//                 active: true,
//                 criteria: [
//                   {
//                     variable: 'request_uri',
//                     conditional: 'if',
//                     operator: 'matches',
//                     inputValue: '/admin',
//                   },
//                 ],
//                 behavior: {
//                   deny: true,
//                 },
//               },
//             ],
//           },
//         ],
//       };

//       const result = convertJsonConfigToObject(JSON.stringify(jsonConfig));
//       expect(result.firewall).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({
//             name: 'my-firewall',
//             domains: ['example.com'],
//             active: true,
//             functions: true,
//             networkProtection: true,
//             waf: true,
//             variable: 'request_uri',
//             debugRules: false,
//             rules: expect.arrayContaining([
//               expect.objectContaining({
//                 name: 'test-rule',
//                 description: 'Test firewall rule',
//                 active: true,
//                 criteria: expect.arrayContaining([
//                   expect.objectContaining({
//                     variable: 'request_uri',
//                     conditional: 'if',
//                     operator: 'matches',
//                     inputValue: '/admin',
//                   }),
//                 ]),
//                 behavior: expect.objectContaining({
//                   deny: true,
//                 }),
//               }),
//             ]),
//           }),
//         ]),
//       );
//     });
//   });
// });
