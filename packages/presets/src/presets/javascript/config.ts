import type { AzionConfig } from 'azion/config';
import metadata from './metadata';
const config: AzionConfig = {
  build: {
    entry: '$ENTRY_FILE',
    preset: metadata.name,
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
