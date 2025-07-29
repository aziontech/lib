import type { AzionRules } from 'azion/config';
import { ALL_EXTENSIONS } from '../constants';

/**
 * Creates rules for a Single Page Application (SPA) on Azion Edge Platform.
 * This configuration is optimized for SPA hosting with proper routing and asset delivery.
 *
 * Features:
 * - Static asset delivery with caching
 * - Client-side routing support
 * - Automatic fallback to index.html for all routes
 *
 * @param options Configuration options for the SPA rules
 * @param options.edgeConnector The name of the edge connector to use
 * @param options.staticExtensions List of file extensions to be treated as static assets
 * @returns Array of rules configured for SPA hosting on Azion Edge
 */
export function createSPARules(
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
        description: 'Deliver static assets directly from edge storage',
        active: true,
        criteria: [
          [
            {
              variable: 'uri',
              conditional: 'if',
              operator: 'matches',
              argument: `\\.(${staticExtensions.join('|')})$`,
            },
          ],
        ],
        behaviors: [
          {
            type: 'set_edge_connector',
            attributes: {
              value: edgeConnector,
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
              variable: 'uri',
              conditional: 'if',
              operator: 'matches',
              argument: '^\\/',
            },
          ],
        ],
        behaviors: [
          {
            type: 'set_edge_connector',
            attributes: {
              value: edgeConnector,
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
