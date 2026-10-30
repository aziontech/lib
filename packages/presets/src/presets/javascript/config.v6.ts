import type { AzionConfigV6 } from '@aziontech/config';

// TODO: add the remaining v6 resources (workloads, connectors, storage...) once their schemas are defined
const config: AzionConfigV6 = {
  version: 6,
  build: {
    entry: 'index.js',
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
};

export default config;
