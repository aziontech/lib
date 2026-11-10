import { readFileSync } from 'fs';
import { join } from 'path';
import { processConfig, validateConfig } from '../../configProcessor';
import config from './azion.config.example';

describe('complete azion.config example of the API v6', () => {
  it('is a valid v6 config', () => {
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('is processed into a v6 manifest with every resource', () => {
    const manifest = processConfig(config);

    expect(manifest.version).toBe(6);
    expect(Object.keys(manifest)).toEqual(
      expect.arrayContaining([
        'build',
        'functions',
        'storage',
        'connectors',
        'applications',
        'custom_pages',
        'network_list',
        'waf',
        'firewall',
        'environments',
        'workloads',
        'deployments',
        'purge',
      ]),
    );
    expect(manifest.deployments).toHaveLength(1);
    expect(manifest).not.toHaveProperty('workload_deployments');
    expect(manifest.workloads[0].bindings).toEqual([
      {
        environment_name: 'production',
        deployment_name: 'my-deployment',
        domains: [{ domain: 'example.com', certificate: null }],
      },
    ]);
    expect(manifest.applications[0].device_groups).toEqual([{ name: 'mobile', user_agent: 'Android|iPhone' }]);
  });

  it('is the example of the v6 documentation', () => {
    const source = readFileSync(join(__dirname, 'azion.config.example.ts'), 'utf8');
    const body = source.slice(
      source.indexOf('const config: AzionConfigV6 = {'),
      source.indexOf('export default config;'),
    );
    const documentation = readFileSync(join(__dirname, '..', '..', '..', 'docs', 'config-v6.md'), 'utf8');

    expect(documentation).toContain(body.trim());
  });
});
