import type { AzionConfig, AzionRule, AzionRuleBehavior, AzionRules } from '../../types';

/**
 * Converts legacy configuration to the new format by moving old properties into the `behavior` object.
 * This ensures backward compatibility for projects that do not use the `behavior` field.
 * @param {object} config - The configuration object to be converted.
 * @returns The converted configuration object with `behavior` properties.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertLegacyConfig(config: any) {
  const newConfig = { ...config };

  // Define the properties that should be moved to the behavior object for request and response
  const requestBehaviorProperties = [
    'httpToHttps',
    'bypassCache',
    'forwardCookies',
    'capture',
    'setOrigin',
    'rewrite',
    'setCookie',
    'setHeaders',
    'runFunction',
    'setCache',
    'redirectTo301',
    'redirectTo302',
    'deliver',
  ];

  const responseBehaviorProperties = [
    'enableGZIP',
    'capture',
    'setCookie',
    'setHeaders',
    'filterHeader',
    'filterCookie',
    'runFunction',
    'redirectTo301',
    'redirectTo302',
    'deliver',
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertRules = (rules: any, behaviorProperties: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rules.map((rule: any) => {
      const newRule = { ...rule, behavior: { ...rule.behavior } };

      // Preserve the order of properties
      Object.keys(rule).forEach((prop) => {
        if (behaviorProperties.includes(prop)) {
          newRule.behavior[prop] = rule[prop];
          delete newRule[prop];
        }
      });

      return newRule;
    });
  };

  if (newConfig.rules && newConfig.rules.request) {
    newConfig.rules.request = convertRules(newConfig.rules.request, requestBehaviorProperties);
  }

  if (newConfig.rules && newConfig.rules.response) {
    newConfig.rules.response = convertRules(newConfig.rules.response, responseBehaviorProperties);
  }
  return newConfig;
}

/**
 * Converts V3 legacy configuration to V4 format
 * Transforms rules structure from { variable, match, behavior } to { criteria, behaviors }
 * @param {any} legacyConfig - V3 configuration object
 * @returns {AzionConfig} V4 configuration object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertV3ToV4Config(legacyConfig: any): AzionConfig {
  const v4Config = { ...legacyConfig };

  // Convert rules if they exist
  if (v4Config.rules) {
    v4Config.rules = convertV3RulesToV4(v4Config.rules);
  }

  return v4Config as AzionConfig;
}

/**
 * Converts V3 rules to V4 format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertV3RulesToV4(rules: any): AzionRules {
  const v4Rules: AzionRules = {
    request: [],
    response: [],
  };

  // Convert request rules
  if (rules.request && Array.isArray(rules.request)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    v4Rules.request = rules.request.map((rule: any) => convertV3RuleToV4(rule, true)); // true = request phase
  }

  // Convert response rules
  if (rules.response && Array.isArray(rules.response)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    v4Rules.response = rules.response.map((rule: any) => convertV3RuleToV4(rule, false)); // false = response phase
  }

  return v4Rules;
}

/**
 * Converts a single V3 rule to V4 format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertV3RuleToV4(legacyRule: any, isRequestPhase: boolean = true): AzionRule {
  const v4Rule: AzionRule = {
    name: legacyRule.name,
    description: legacyRule.description,
    active: legacyRule.active !== undefined ? legacyRule.active : true,
    criteria: convertV3CriteriaToV4(legacyRule),
    behaviors: convertV3BehaviorsToV4(legacyRule.behavior || {}, isRequestPhase) as AzionRuleBehavior[],
  };

  return v4Rule;
}

/**
 * Converts V3 criteria (variable + match) to V4 format (array of arrays)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertV3CriteriaToV4(legacyRule: any) {
  // Default criteria if none specified
  const variable = legacyRule.variable || 'uri';
  const match = legacyRule.match || '.*';

  return [
    [
      {
        variable,
        conditional: 'if' as const,
        operator: 'matches' as const,
        argument: match,
      },
    ],
  ];
}

/**
 * Converts V3 behaviors object to V4 behaviors array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertV3BehaviorsToV4(legacyBehavior: any, isRequestPhase: boolean = true) {
  const v4Behaviors = [];

  // Return empty array if no behaviors
  if (!legacyBehavior || typeof legacyBehavior !== 'object') {
    return [];
  }

  // Map V3 behavior properties to V4 behavior objects
  const behaviorMap = {
    // No-args behaviors
    deliver: () => ({ type: 'deliver' }),
    bypassCache: () => ({ type: 'bypass_cache' }),
    forwardCookies: () => ({ type: 'forward_cookies' }),
    enableGZIP: () => ({ type: 'enable_gzip' }),
    optimizeImages: () => ({ type: 'optimize_images' }),
    httpToHttps: () => ({ type: 'redirect_http_to_https' }),
    deny: () => ({ type: 'deny' }),
    noContent: () => ({ type: 'no_content' }),
    finishRequestPhase: () => ({ type: 'finish_request_phase' }),

    // String behaviors
    rewrite: (value: string) => ({ type: 'rewrite_request', attributes: { value } }),
    redirectTo301: (value: string) => ({ type: 'redirect_to_301', attributes: { value } }),
    redirectTo302: (value: string) => ({ type: 'redirect_to_302', attributes: { value } }),

    // ID behaviors (flexible string | number)
    runFunction: (value: string | number) => ({ type: 'run_function', attributes: { value } }),
    setCache: (value: string | number) => ({ type: 'set_cache_policy', attributes: { value } }),
    setOrigin: (value: string | number) => ({ type: 'set_origin', attributes: { value } }),
    setEdgeConnector: (value: string | number) => ({ type: 'set_edge_connector', attributes: { value } }),

    // Header behaviors (context-aware: request vs response)
    setHeaders: (value: string | string[]) => {
      if (!value) return [];
      const headers = Array.isArray(value) ? value : [value];
      const headerType = isRequestPhase ? 'add_request_header' : 'add_response_header';
      return headers.map((header: string) => {
        const [header_name, ...rest] = header.split(':');
        const header_value = rest.length > 0 ? rest.join(':').trim() : '';
        return {
          type: headerType,
          attributes: { header_name: header_name.trim(), header_value },
        };
      });
    },

    // Cookie behaviors (context-aware)
    setCookie: (value: string) => {
      if (!value) return null;
      const [cookie_name, ...rest] = value.split('=');
      const cookie_value = rest.length > 0 ? rest.join('=') : '';
      return { type: 'set_cookie', attributes: { cookie_name: cookie_name.trim(), cookie_value } };
    },

    filterCookie: (value: string) => {
      if (!value) return null;
      const cookieType = isRequestPhase ? 'filter_request_cookie' : 'filter_response_cookie';
      return { type: cookieType, attributes: { cookie_name: value } };
    },

    filterHeader: (value: string) => {
      if (!value) return null;
      const headerType = isRequestPhase ? 'filter_request_header' : 'filter_response_header';
      return { type: headerType, attributes: { header_name: value } };
    },

    // Additional request-specific behaviors
    addRequestCookie: (value: string) => {
      if (!value) return null;
      const [cookie_name, ...rest] = value.split('=');
      const cookie_value = rest.length > 0 ? rest.join('=') : '';
      return { type: 'add_request_cookie', attributes: { cookie_name: cookie_name.trim(), cookie_value } };
    },

    addRequestHeader: (value: string) => {
      if (!value) return null;
      const [header_name, ...rest] = value.split(':');
      const header_value = rest.length > 0 ? rest.join(':').trim() : '';
      return { type: 'add_request_header', attributes: { header_name: header_name.trim(), header_value } };
    },

    // Legacy aliases (common V3 naming variations)
    setOriginCacheControl: (value: string) => ({ type: 'rewrite_request', attributes: { value } }),
    setResponseHeader: (value: string | string[]) => {
      if (!value) return [];
      const headers = Array.isArray(value) ? value : [value];
      return headers.map((header: string) => {
        const [header_name, ...rest] = header.split(':');
        const header_value = rest.length > 0 ? rest.join(':').trim() : '';
        return {
          type: 'add_response_header',
          attributes: { header_name: header_name.trim(), header_value },
        };
      });
    },
  };

  // Convert each behavior
  Object.entries(legacyBehavior).forEach(([key, value]) => {
    if (value !== null && value !== undefined && behaviorMap[key as keyof typeof behaviorMap]) {
      try {
        const converter = behaviorMap[key as keyof typeof behaviorMap];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = converter(value as any);

        if (Array.isArray(result)) {
          v4Behaviors.push(...result.filter(Boolean)); // Filter out null values
        } else if (result) {
          v4Behaviors.push(result);
        }
      } catch (error) {
        // Silent warning for failed conversions
      }
    } else if (value !== null && value !== undefined) {
      // Silent warning for unknown behaviors
    }
  });

  // Ensure at least one behavior exists (V4 requirement)
  if (v4Behaviors.length === 0) {
    v4Behaviors.push({ type: 'deliver' }); // Default safe behavior
  }

  return v4Behaviors;
}

/**
 * Validates if a config object appears to be V3 legacy format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isV3LegacyConfig(config: any): boolean {
  if (!config || typeof config !== 'object') return false;

  // Check for V3 rule patterns
  if (config.rules) {
    const hasV3Rules =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.rules.request?.some((rule: any) => rule.variable && rule.match) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.rules.response?.some((rule: any) => rule.variable && rule.match);

    const hasV4Rules =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.rules.request?.some((rule: any) => rule.criteria && rule.behaviors) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.rules.response?.some((rule: any) => rule.criteria && rule.behaviors);

    return hasV3Rules && !hasV4Rules;
  }

  return false;
}

/**
 * Smart converter that detects format and converts if needed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToV4Config(config: any): AzionConfig {
  if (isV3LegacyConfig(config)) {
    return convertV3ToV4Config(config);
  }

  return config as AzionConfig;
}

export default convertLegacyConfig;

/**
 * USAGE EXAMPLE - V3 → V4 CONVERSION
 *
 * // V3 Legacy Format
 * const legacyConfig = {
 *   rules: {
 *     request: [
 *       {
 *         name: 'cache-rule',
 *         variable: 'uri',
 *         match: '^/static/',
 *         behavior: {
 *           setCache: 'my-cache',
 *           rewrite: '/assets${uri}',
 *           setHeaders: ['Cache-Control: max-age=3600', 'X-Custom: header'],
 *           deliver: true,
 *         },
 *       }
 *     ],
 *     response: [
 *       {
 *         name: 'compression-rule',
 *         variable: 'uri',
 *         match: '\\.(js|css)$',
 *         behavior: {
 *           enableGZIP: true,
 *           setCookie: 'compressed=true; Path=/',
 *           filterHeader: 'Server',
 *         },
 *       }
 *     ]
 *   }
 * };
 *
 * // Convert to V4
 * import { convertV3ToV4Config } from 'azion/config';
 * const v4Config = convertV3ToV4Config(legacyConfig);
 *
 * // V4 Result:
 * // {
 * //   rules: {
 * //     request: [
 * //       {
 * //         name: 'cache-rule',
 * //         active: true,
 * //         criteria: [
 * //           [
 * //             {
 * //               variable: 'uri',
 * //               conditional: 'if',
 * //               operator: 'matches',
 * //               argument: '^/static/',
 * //             }
 * //           ]
 * //         ],
 * //         behaviors: [
 * //           { type: 'set_cache_policy', attributes: { value: 'my-cache' } },
 * //           { type: 'rewrite_request', attributes: { value: '/assets${uri}' } },
 * //           { type: 'add_response_header', attributes: { header_name: 'Cache-Control', header_value: 'max-age=3600' } },
 * //           { type: 'add_response_header', attributes: { header_name: 'X-Custom', header_value: 'header' } },
 * //           { type: 'deliver' },
 * //         ],
 * //       }
 * //     ],
 * //     response: [
 * //       {
 * //         name: 'compression-rule',
 * //         active: true,
 * //         criteria: [
 * //           [
 * //             {
 * //               variable: 'uri',
 * //               conditional: 'if',
 * //               operator: 'matches',
 * //               argument: '\\.(js|css)$',
 * //             }
 * //           ]
 * //         ],
 * //         behaviors: [
 * //           { type: 'enable_gzip' },
 * //           { type: 'set_cookie', attributes: { cookie_name: 'compressed', cookie_value: 'true; Path=/' } },
 * //           { type: 'filter_response_header', attributes: { header_name: 'Server' } },
 * //         ],
 * //       }
 * //     ]
 * //   }
 * // }
 *
 * // For CLI usage:
 * import { migrateConfigV3ToV4 } from 'azion/config';
 * const result = migrateConfigV3ToV4('./azion.config.js');
 * console.log(result.message);
 */
