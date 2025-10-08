import type { AzionRules } from 'azion/config';

/**
 * Creates rules for a Multi Page Application (MPA) on Azion Platform.
 * This configuration is optimized for static site hosting with proper routing and asset delivery.
 *
 * Features:
 * - Static asset delivery with caching
 * - Proper handling of directory and subpath routing
 * - Automatic index.html handling for clean URLs
 *
 * @param options Configuration options for the MPA rules
 * @param options.connector The name of the edge connector to use
 * @param options.staticExtensions List of file extensions to be treated as static assets
 * @returns Array of rules configured for MPA hosting on Azion Edge
 */
export function createMPARules(
  options: {
    connector?: string;
    staticExtensions?: string[];
  } = {},
): AzionRules {
  const { connector = 'name-connector', staticExtensions } = options;
  const staticAssetsArgument = staticExtensions ? `\\.(${staticExtensions.join('|')})$` : `\\.[a-zA-Z0-9-._]+`;

  return {
    request: [
      {
        name: 'Deliver Static Assets',
        description: 'Deliver static assets directly from storage',
        active: true,
        criteria: [
          [
            {
              variable: '${uri}',
              conditional: 'if',
              operator: 'matches',
              argument: staticAssetsArgument,
            },
          ],
        ],
        behaviors: [
          {
            type: 'set_connector',
            attributes: {
              value: connector,
            },
          },
          {
            type: 'deliver',
          },
        ],
      },
      {
        name: 'Redirect to index.html',
        description: 'Handle directory requests by rewriting to index.html',
        active: true,
        criteria: [
          [
            {
              variable: '${uri}',
              conditional: 'if',
              operator: 'matches',
              argument: '.*/$',
            },
          ],
        ],
        behaviors: [
          {
            type: 'set_connector',
            attributes: {
              value: connector,
            },
          },
          {
            type: 'rewrite_request',
            attributes: {
              value: '${uri}index.html',
            },
          },
        ],
      },
      {
        name: 'Redirect to index.html for Subpaths',
        description: 'Handle subpath requests by rewriting to index.html',
        active: true,
        criteria: [
          [
            {
              variable: '${uri}',
              conditional: 'if',
              operator: 'matches',
              argument: '^(?!.*\\/$)(?![\\s\\S]*\\.[a-zA-Z0-9]+$).*',
            },
          ],
        ],
        behaviors: [
          {
            type: 'set_connector',
            attributes: {
              value: connector,
            },
          },
          {
            type: 'rewrite_request',
            attributes: {
              value: '${uri}/index.html',
            },
          },
        ],
      },
    ],
    response: [],
  };
}
