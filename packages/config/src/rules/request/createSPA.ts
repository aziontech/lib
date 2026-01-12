import type { AzionRules } from 'azion/config';
import { ALL_EXTENSIONS } from '../constants';

/**
 * Creates rules for a Single Page Application (SPA) on Azion Platform.
 * This configuration is optimized for SPA hosting with proper routing and asset delivery.
 *
 * Features:
 * - Static asset delivery with caching
 * - Client-side routing support
 * - Automatic fallback to index.html for all routes
 *
 * @param options Configuration options for the SPA rules
 * @param options.connector The name of the edge connector to use
 * @param options.application The name of the application to use
 * @param options.staticExtensions List of file extensions to be treated as static assets
 * @returns Array of rules configured for SPA hosting on Azion Edge
 */
export function createSPARules(
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
        description: 'Handle all routes by rewriting to index.html for client-side routing',
        active: true,
        criteria: [
          [
            {
              variable: '${uri}',
              conditional: 'if',
              operator: 'matches',
              argument: '^\\/',
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
              value: '/index.html',
            },
          },
        ],
      },
    ],
    response: [],
  };
}
