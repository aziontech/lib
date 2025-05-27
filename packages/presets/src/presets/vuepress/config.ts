import type { AzionConfig } from 'azion/config';
import { createMPARules } from 'azion/config/rules';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
  },
  edgeStorage: [
    {
      name: '$BUCKET_NAME',
      dir: '$LOCAL_BUCKET_DIR',
      edgeAccess: 'read_only',
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
      typeProperties: {
        bucket: '$BUCKET_NAME',
      },
    },
  ],
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: createMPARules({
        edgeConnector: '$EDGE_CONNECTOR_NAME',
      }),
    },
  ],
};

export default config;
