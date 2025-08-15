import type { AzionConfig } from 'azion/config';
import { createMPARules } from 'azion/config/rules';

const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
  },
  edgeStorage: [
    {
      name: '$BUCKET_NAME',
      prefix: '$BUCKET_PREFIX',
      dir: './build',
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
        prefix: '$BUCKET_PREFIX',
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
  workloads: [
    {
      name: '$WORKLOAD_NAME',
      active: true,
      infrastructure: 1,
      protocols: {
        http: {
          versions: ['http1', 'http2'],
          httpPorts: [80],
          httpsPorts: [443],
          quicPorts: null,
        },
      },
      deployments: [
        {
          name: '$DEPLOYMENT_NAME',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              edgeApplication: '$EDGE_APPLICATION_NAME',
            },
          },
        },
      ],
    },
  ],
};

export default config;
