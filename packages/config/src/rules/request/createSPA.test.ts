import type { AzionRuleCriteriaWithValue } from '../../types';
import { ALL_EXTENSIONS } from '../constants';
import { createSPARules } from './createSPA';

describe('createSPARules', () => {
  it('should create SPA rules with default options', () => {
    const rules = createSPARules();

    // Check the overall structure
    expect(rules).toHaveProperty('request');
    expect(rules).toHaveProperty('response');
    expect(rules.request).toBeDefined();
    expect(rules.request?.length).toBe(2);
    expect(rules.response).toBeDefined();
    expect(rules.response?.length).toBe(0);

    // Check static assets rule
    const staticAssetsRule = rules.request?.[0];
    expect(staticAssetsRule).toEqual({
      name: 'Deliver Static Assets and Set Cache Policy',
      description: 'Deliver static assets directly from storage and set cache policy',
      active: true,
      criteria: [
        [
          {
            variable: '${uri}',
            conditional: 'if',
            operator: 'matches',
            argument: `\\.(${ALL_EXTENSIONS.join('|')})$`,
          },
        ],
      ],
      behaviors: [
        {
          type: 'set_connector',
          attributes: {
            value: 'name-connector',
          },
        },
        {
          type: 'set_cache_policy',
          attributes: {
            value: 'name-application',
          },
        },
        {
          type: 'deliver',
        },
      ],
    });

    // Check index.html redirect rule
    const indexRedirectRule = rules.request?.[1];
    expect(indexRedirectRule).toEqual({
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
            value: 'name-connector',
          },
        },
        {
          type: 'rewrite_request',
          attributes: {
            value: '/index.html',
          },
        },
      ],
    });
  });

  it('should create SPA rules with custom connector', () => {
    const customConnector = 'custom-storage';
    const rules = createSPARules({ connector: customConnector });

    // Check that the custom connector is used in both rules
    const staticAssetsRule = rules.request?.[0];
    expect(staticAssetsRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });

    const indexRedirectRule = rules.request?.[1];
    expect(indexRedirectRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });
  });

  it('should create SPA rules with custom static extensions', () => {
    const customExtensions = ['js', 'css', 'png'];
    const rules = createSPARules({ staticExtensions: customExtensions });

    // Check that the custom extensions are used in the static assets rule
    const staticAssetsRule = rules.request?.[0];
    const criterion = staticAssetsRule?.criteria?.[0]?.[0] as AzionRuleCriteriaWithValue;
    expect(criterion.argument).toBe(`\\.(${customExtensions.join('|')})$`);
  });

  it('should create SPA rules with both custom connector and static extensions', () => {
    const customConnector = 'my-storage';
    const customExtensions = ['js', 'css', 'png', 'jpg'];
    const rules = createSPARules({
      connector: customConnector,
      staticExtensions: customExtensions,
    });

    // Check static assets rule
    const staticAssetsRule = rules.request?.[0];
    const criterion = staticAssetsRule?.criteria?.[0]?.[0] as AzionRuleCriteriaWithValue;
    expect(criterion.argument).toBe(`\\.(${customExtensions.join('|')})$`);
    expect(staticAssetsRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });

    // Check index redirect rule
    const indexRedirectRule = rules.request?.[1];
    expect(indexRedirectRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });
  });
});
