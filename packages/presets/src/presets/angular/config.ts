import type { AzionConfig } from 'azion/config';
import { createSPARules } from 'azion/config/rules';

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
      active: true,
      type: 'edge_storage',
      attributes: {
        bucket: '$BUCKET_NAME',
        prefix: '/',
      },
    },
  ],
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: createSPARules({
        edgeConnector: '$EDGE_CONNECTOR_NAME',
      }),
    },
  ],
};

export default config;
