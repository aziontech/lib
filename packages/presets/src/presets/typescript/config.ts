import type { AzionConfig } from 'azion/config';

const config: AzionConfig = {
  build: {
    entry: 'index.ts',
  },
  functions: [
    {
      name: '$FUNCTION_NAME',
      path: './functions/index.js', // path to the edge function. This path is relative to the .edge folder.
    },
  ],
  applications: [
    {
      name: '$APPLICATION_NAME',
      rules: {
        request: [
          {
            name: 'Execute Function',
            description: 'Execute function for all requests',
            active: true,
            criteria: [
              [
                {
                  variable: '${uri}',
                  conditional: 'if',
                  operator: 'matches',
                  argument: '^/',
                },
              ],
            ],
            behaviors: [
              {
                type: 'run_function',
                attributes: {
                  value: '$FUNCTION_NAME',
                },
              },
            ],
          },
        ],
      },
      functionsInstances: [
        {
          name: '$FUNCTION_INSTANCE_NAME',
          ref: '$FUNCTION_NAME',
        },
      ],
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
    },
  ],
};

export default config;
