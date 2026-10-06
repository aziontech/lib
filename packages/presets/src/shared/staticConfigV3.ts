import type { AzionConfigV3 } from '@aziontech/config';

const STATIC_ASSETS_MATCH = '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$';

// a new object per call: configs must not share references, consumers are free to mutate what they receive
const origin = () => ({ name: 'origin-storage-default', type: 'object_storage' as const });

const baseConfig = (preset: string) => ({
  version: 3 as const,
  build: {
    bundler: 'esbuild' as const,
    preset,
    polyfills: false,
  },
  origin: [origin()],
});

/**
 * v3 config for a Single Page Application served from Object Storage:
 * static assets are delivered as is, any other route falls back to /index.html.
 */
export function createSPAConfigV3(preset: string): AzionConfigV3 {
  return {
    ...baseConfig(preset),
    rules: {
      request: [
        {
          name: 'Set Storage Origin for All Requests',
          match: '^\\/',
          behavior: { setOrigin: origin() },
        },
        {
          name: 'Deliver Static Assets',
          match: STATIC_ASSETS_MATCH,
          behavior: { setOrigin: origin(), deliver: true },
        },
        {
          name: 'Redirect to index.html',
          match: '^\\/',
          behavior: { rewrite: `/index.html` },
        },
      ],
    },
  };
}

/**
 * v3 config for a Multi Page Application (static site) served from Object Storage:
 * static assets are delivered as is, directories and extensionless paths resolve to their index.html.
 */
export function createMPAConfigV3(preset: string): AzionConfigV3 {
  return {
    ...baseConfig(preset),
    rules: {
      request: [
        {
          name: 'Set Storage Origin for All Requests',
          match: '^\\/',
          behavior: { setOrigin: origin() },
        },
        {
          name: 'Deliver Static Assets',
          match: STATIC_ASSETS_MATCH,
          behavior: { setOrigin: origin(), deliver: true },
        },
        {
          name: 'Redirect to index.html',
          match: '.*/$',
          behavior: { rewrite: '${uri}index.html' },
        },
        {
          name: 'Redirect to index.html for Subpaths',
          match: '^(?!.*\\/$)(?![\\s\\S]*\\.[a-zA-Z0-9]+$).*',
          behavior: { rewrite: '${uri}/index.html' },
        },
      ],
    },
  };
}
