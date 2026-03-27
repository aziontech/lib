import type { AzionRuleCriteriaWithValue } from '../../types';
import { createMPARules } from './createMPA';

describe('createMPARules', () => {
  it('should create MPA rules with default options', () => {
    const rules = createMPARules();

    // Check the overall structure
    expect(rules).toHaveProperty('request');
    expect(rules).toHaveProperty('response');
    expect(rules.request).toBeDefined();
    expect(rules.request?.length).toBe(3);
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
            argument: `\\.[a-zA-Z0-9-._]+`,
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

    // Check directory index.html rule
    const directoryIndexRule = rules.request?.[1];
    expect(directoryIndexRule).toEqual({
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
            value: 'name-connector',
          },
        },
        {
          type: 'rewrite_request',
          attributes: {
            value: '${uri}index.html',
          },
        },
      ],
    });

    // Check subpath index.html rule
    const subpathIndexRule = rules.request?.[2];
    expect(subpathIndexRule).toEqual({
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
            value: 'name-connector',
          },
        },
        {
          type: 'rewrite_request',
          attributes: {
            value: '${uri}/index.html',
          },
        },
      ],
    });
  });

  it('should create MPA rules with custom connector', () => {
    const customConnector = 'custom-storage';
    const rules = createMPARules({ connector: customConnector });

    // Check that the custom connector is used in all rules
    const staticAssetsRule = rules.request?.[0];
    expect(staticAssetsRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });

    const directoryIndexRule = rules.request?.[1];
    expect(directoryIndexRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });

    const subpathIndexRule = rules.request?.[2];
    expect(subpathIndexRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });
  });

  it('should create MPA rules with custom static extensions', () => {
    const customExtensions = ['js', 'css', 'png'];
    const rules = createMPARules({ staticExtensions: customExtensions });

    // Check that the custom extensions are used in the static assets rule
    const staticAssetsRule = rules.request?.[0];
    const criterion = staticAssetsRule?.criteria?.[0]?.[0] as AzionRuleCriteriaWithValue;
    expect(criterion.argument).toBe(`\\.(${customExtensions.join('|')})$`);
  });

  it('should create MPA rules with both custom connector and static extensions', () => {
    const customConnector = 'my-storage';
    const customExtensions = ['js', 'css', 'png', 'jpg'];
    const rules = createMPARules({
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

    // Check directory index rule
    const directoryIndexRule = rules.request?.[1];
    expect(directoryIndexRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });

    // Check subpath index rule
    const subpathIndexRule = rules.request?.[2];
    expect(subpathIndexRule?.behaviors?.[0]).toEqual({
      type: 'set_connector',
      attributes: {
        value: customConnector,
      },
    });
  });
});
