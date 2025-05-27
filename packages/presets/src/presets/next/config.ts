import type { AzionConfig } from 'azion/config';
const config: AzionConfig = {
  build: {
    bundler: 'esbuild',
    polyfills: true,
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
  edgeFunctions: [
    {
      name: 'next-function',
      path: '.edge/functions/next-function.js',
    },
  ],
  edgeApplications: [
    {
      name: '$EDGE_APPLICATION_NAME',
      rules: {
        request: [
          {
            name: 'Next.js Static Assets',
            match: '^\\/_next\\/static\\/',
            behavior: {
              setEdgeConnector: '$EDGE_CONNECTOR_NAME',
              deliver: true,
            },
          },
          {
            name: 'Deliver Static Assets',
            match: '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
            behavior: {
              setEdgeConnector: '$EDGE_CONNECTOR_NAME',
              deliver: true,
            },
          },
          {
            name: 'Execute Next.js Function',
            match: '^\\/',
            behavior: {
              runFunction: '$EDGE_FUNCTION_NAME',
              forwardCookies: true,
            },
          },
        ],
      },
    },
  ],
};

export default config;
