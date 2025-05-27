import type { AzionRules } from 'azion/config';
import { ALL_EXTENSIONS } from '../constants';

/**
 * Creates rules for a Multi Page Application (MPA) on Azion Edge Platform.
 * This configuration is optimized for static site hosting with proper routing and asset delivery.
 *
 * Features:
 * - Static asset delivery with caching
 * - Proper handling of directory and subpath routing
 * - Automatic index.html handling for clean URLs
 *
 * @param options Configuration options for the MPA rules
 * @param options.bucket The name of the edge storage bucket to use
 * @param options.staticExtensions List of file extensions to be treated as static assets
 * @returns Array of rules configured for MPA hosting on Azion Edge
 */
export function createMPARules(
  options: {
    edgeConnector?: string;
    staticExtensions?: string[];
  } = {},
): AzionRules {
  const { edgeConnector = 'edge-connector', staticExtensions = ALL_EXTENSIONS } = options;

  return {
    request: [
      {
        name: 'Deliver Static Assets',
        match: `\\.(${staticExtensions.join('|')})$`,
        behavior: {
          setEdgeConnector: edgeConnector,
          deliver: true,
        },
      },
      {
        name: 'Redirect to index.html',
        match: '.*/$',
        behavior: {
          setEdgeConnector: edgeConnector,
          rewrite: '${uri}index.html',
        },
      },
      {
        name: 'Redirect to index.html for Subpaths',
        match: '^(?!.*\\/$)(?![\\s\\S]*\\.[a-zA-Z0-9]+$).*',
        behavior: {
          setEdgeConnector: edgeConnector,
          rewrite: '${uri}/index.html',
        },
      },
    ],
    response: [],
  };
}
