import { DOCS_MESSAGE } from '../../../constants';
import { AzionConfig, AzionFirewallCriteriaWithValue } from '../../../types';
import {
  requestBehaviors,
  responseBehaviors,
  revertRequestBehaviors,
  revertResponseBehaviors,
} from '../../helpers/behaviors';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * RulesProcessConfigStrategy
 * @class RulesProcessConfigStrategy
 * @description This class is implementation of the Rules ProcessConfig Strategy.
 */
class RulesProcessConfigStrategy extends ProcessConfigStrategy {
  /**
   * Adds behaviors to the CDN rule.
   * @param cdnRule - The CDN rule.
   * @param behaviors - The behaviors.
   * @param behaviorDefinitions - The behavior definitions.
   * @param payloadContext - The payload context.
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addBehaviors(cdnRule: any, behaviors: any, behaviorDefinitions: any, payloadContext: any) {
    if (behaviors && typeof behaviors === 'object') {
      Object.entries(behaviors).forEach(([key, value]) => {
        if (behaviorDefinitions[key]) {
          const transformedBehavior = behaviorDefinitions[key].transform(value, payloadContext);
          if (Array.isArray(transformedBehavior)) {
            cdnRule.behaviors.push(...transformedBehavior);
          } else if (transformedBehavior) {
            cdnRule.behaviors.push(transformedBehavior);
          }
        } else {
          console.warn(`Unknown behavior: ${key}`);
        }
      });
    }
  }

  private validateFunctionReferences(config: AzionConfig) {
    if (!config?.rules?.request || !config?.functions) {
      return;
    }

    const definedFunctions = new Set(config.functions.map((f) => f.name));

    for (const rule of config.rules.request) {
      if (rule.behavior?.runFunction) {
        if (!definedFunctions.has(rule.behavior.runFunction)) {
          throw new Error(
            `Function "${rule.behavior.runFunction}" referenced in rule "${rule.name}" is not defined in the functions array. ${DOCS_MESSAGE}`,
          );
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: any) {
    // Validar referências de funções antes de transformar
    this.validateFunctionReferences(config);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    if (config?.rules === undefined || Object.keys(config.rules).length === 0) {
      return;
    }
    // request
    if (Array.isArray(config?.rules?.request)) {
      config?.rules?.request?.forEach((rule, index) => {
        const cdnRule = {
          name: rule.name,
          phase: 'request',
          description: rule.description ?? '',
          is_active: rule.active !== undefined ? rule.active : true, // Default to true if not provided
          order: index + 2, // index starts at 2, because the default rule is index 1
          criteria: rule.criteria
            ? [
                rule.criteria.map((criterion) => {
                  const isWithValue = 'inputValue' in criterion;
                  const { inputValue, ...rest } = criterion as AzionFirewallCriteriaWithValue;
                  return {
                    ...rest,
                    variable: criterion.variable.startsWith('${') ? criterion.variable : `\${${criterion.variable}}`,
                    ...(isWithValue && { input_value: inputValue }),
                  };
                }),
              ]
            : [
                [
                  {
                    variable: rule.variable?.startsWith('${') ? rule.variable : `\${${rule.variable ?? 'uri'}}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: rule.match,
                  },
                ],
              ],
          behaviors: [],
        };
        this.addBehaviors(cdnRule, rule.behavior, requestBehaviors, context);
        payload.push(cdnRule);
      });
    }

    // response
    if (Array.isArray(config?.rules?.response)) {
      config?.rules?.response.forEach((rule, index) => {
        const cdnRule = {
          name: rule.name,
          phase: 'response',
          description: rule.description ?? '',
          is_active: rule.active !== undefined ? rule.active : true, // Default to true if not provided
          order: index + 2, // index starts at 2, because the default rule is index 1
          criteria: rule.criteria
            ? [
                rule.criteria.map((criterion) => {
                  const isWithValue = 'inputValue' in criterion;
                  const { inputValue, ...rest } = criterion as AzionFirewallCriteriaWithValue;
                  return {
                    ...rest,
                    variable: criterion.variable.startsWith('${') ? criterion.variable : `\${${criterion.variable}}`,
                    ...(isWithValue && { input_value: inputValue }),
                  };
                }),
              ]
            : [
                [
                  {
                    variable: rule.variable?.startsWith('${') ? rule.variable : `\${${rule.variable ?? 'uri'}}`,
                    operator: 'matches',
                    conditional: 'if',
                    input_value: rule.match,
                  },
                ],
              ],
          behaviors: [],
        };
        this.addBehaviors(cdnRule, rule.behavior, responseBehaviors, context);
        payload.push(cdnRule);
      });
    }

    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addBehaviorsObject = (behaviors: any, behaviorDefinitions: any, context: any) => {
      if (behaviors && Array.isArray(behaviors)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedBehaviors = behaviors.map((behavior: any) => {
          const behaviorName = behavior.name;
          if (behaviorDefinitions[behaviorName]) {
            const transformed = behaviorDefinitions[behaviorName].transform(behavior.target, context);
            return transformed;
          }
          console.warn(`Unknown behavior: ${behaviorName}`);
          return {};
        });

        const result = transformedBehaviors.reduce((acc, curr) => {
          if (curr.setHeaders) {
            return {
              ...acc,
              setHeaders: [...(acc.setHeaders || []), ...curr.setHeaders],
            };
          }
          return { ...acc, ...curr };
        }, {});

        return result;
      }
      return undefined;
    };

    const rulesConfig = payload.rules;
    if (!rulesConfig || Object.keys(rulesConfig).length === 0) {
      return;
    }

    transformedPayload.rules = {
      request: [],
      response: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rulesConfig.forEach((rule: any) => {
      if (rule.phase === 'request') {
        transformedPayload.rules!.request!.push({
          name: rule.name,
          description: rule.description,
          active: rule.is_active,
          criteria:
            // Verifica se criteria existe e é um array de arrays
            Array.isArray(rule.criteria) && Array.isArray(rule.criteria[0])
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rule.criteria[0].map((criterion: any) => {
                  const isWithValue = 'input_value' in criterion;
                  const { input_value, ...rest } = criterion;
                  return {
                    ...rest,
                    ...(isWithValue && { inputValue: input_value }),
                  };
                })
              : [],
          behavior: addBehaviorsObject(rule.behaviors, revertRequestBehaviors, transformedPayload),
        });
      } else if (rule.phase === 'response') {
        transformedPayload.rules!.response!.push({
          name: rule.name,
          description: rule.description,
          active: rule.is_active,
          criteria:
            Array.isArray(rule.criteria) && Array.isArray(rule.criteria[0])
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rule.criteria[0].map((criterion: any) => {
                  const isWithValue = 'input_value' in criterion;
                  const { input_value, ...rest } = criterion;
                  return {
                    ...rest,
                    ...(isWithValue && { inputValue: input_value }),
                  };
                })
              : [],
          behavior: addBehaviorsObject(rule.behaviors, revertResponseBehaviors, transformedPayload),
        });
      }
    });

    return transformedPayload.rules;
  }
}

export default RulesProcessConfigStrategy;
