import type { AzionConfigV6 } from '@aziontech/config';
import { createSPARules } from '@aziontech/config/rules';

const config: AzionConfigV6 = {
  version: 6,
  build: {
    bundler: 'esbuild',
  },
  storage: [
    {
      name: '$BUCKET_NAME',
      prefix: '$BUCKET_PREFIX',
      dir: './.edge/assets',
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
      rules: createSPARules({
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
  // the application a deployment serves is set by the Azion CLI when it creates the release
  deployments: [
    {
      name: '$DEPLOYMENT_NAME',
      bindingPolicy: 'FLEXIBLE',
    },
  ],
  workloads: [
    {
      name: '$WORKLOAD_NAME',
      active: true,
      infrastructure: 1,
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
