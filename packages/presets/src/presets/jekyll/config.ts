import type { AzionConfig } from 'azion/config';
import { createMPARules } from 'azion/config/rules';
import metadata from './metadata';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    preset: metadata.name,
  },
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: {
        request: createMPARules({
          bucket: '$BUCKET_NAME',
        }),
      },
    },
  ],
  edgeConnectors: [
    {
      name: '$EDGE_CONNECTOR_NAME',
      modules: {
        loadBalancerEnabled: false,
        originShieldEnabled: false,
      },
      type: 'edge_storage',
    },
  ],
};

export default config;
