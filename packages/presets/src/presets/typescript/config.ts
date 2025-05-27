import type { AzionConfig } from 'azion/config';
const config: AzionConfig = {
  build: {
    entry: 'handler.ts',
  },
  edgeFunctions: [
    {
      name: '$EDGE_FUNCTION_NAME',
      path: '$LOCAL_FUNCTION_PATH',
    },
  ],
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: {
        request: [
          {
            name: 'Execute Edge Function',
            match: '^\\/',
            behavior: {
              runFunction: '$EDGE_FUNCTION_NAME',
            },
          },
        ],
      },
    },
  ],
};

export default config;
