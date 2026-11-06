import type { AzionConfigV6 } from '@aziontech/config';
import { createMPARules } from '@aziontech/config/rules';

const config: AzionConfigV6 = {
  version: 6,
  build: {
    bundler: 'esbuild',
  },
  storage: [
    {
      name: '$BUCKET_NAME',
      prefix: '$BUCKET_PREFIX',
      dir: './www',
      workloadsAccess: 'read_only',
    },
  ],
  connectors: [
    {
      name: '$CONNECTOR_NAME',
      active: true,
      type: 'storage',
      attributes: {
        bucket: '$BUCKET_NAME',
        prefix: '$BUCKET_PREFIX',
      },
    },
  ],
  applications: [
    {
      name: '$APPLICATION_NAME',
      cache: [
        {
          name: '$APPLICATION_NAME',
          browser: {
            maxAgeSeconds: 7200,
          },
          edge: {
            maxAgeSeconds: 7200,
          },
        },
      ],
      rules: createMPARules({
        connector: '$CONNECTOR_NAME',
        application: '$APPLICATION_NAME',
      }),
    },
  ],
  environments: [
    {
      name: '$ENVIRONMENT_NAME',
      deploymentPolicy: 'single_version',
    },
  ],
  workloads: [
    {
      name: '$WORKLOAD_NAME',
      active: true,
      infrastructure: 1,
      deployments: [
        {
          name: '$DEPLOYMENT_NAME',
          current: true,
          active: true,
          strategy: {
            type: 'default',
            attributes: {
              application: '$APPLICATION_NAME',
            },
          },
        },
      ],
      bindings: [
        {
          environment: '$ENVIRONMENT_NAME',
          deployment: '$DEPLOYMENT_NAME',
        },
      ],
    },
  ],
};

export default config;
