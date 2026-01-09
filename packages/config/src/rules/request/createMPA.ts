import type { AzionRules } from 'azion/config';
import { ALL_EXTENSIONS } from '../constants';

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
 * @param options.application The name of the application to use
 * @param options.staticExtensions List of file extensions to be treated as static assets
 * @returns Array of rules configured for MPA hosting on Azion Edge
 */
export function createMPARules(
  options: {
    connector?: string;
    application?: string;
    staticExtensions?: string[];
  } = {},
): AzionRules {
  const { connector = 'name-connector', application = 'name-application', staticExtensions = ALL_EXTENSIONS } = options;

  return {
    request: [
      {
        name: 'Deliver Static Assets and Set Cache Policy',
        description: 'Deliver static assets directly from storage and set cache policy',
        active: true,
        criteria: [
          [
            {
              variable: '${uri}',
              conditional: 'if',
              operator: 'matches',
              argument: `\\.(${staticExtensions.join('|')})$`,
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
            type: 'set_cache_policy',
            attributes: {
              value: application,
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
