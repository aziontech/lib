import { AzionConfig } from '../../../types';
import { requestBehaviors, responseBehaviors } from '../../helpers/behaviors';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(config: AzionConfig, context: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any[] = [];
    // request
    if (Array.isArray(config?.rules?.request)) {
      config?.rules?.request?.forEach((rule, index) => {
        const cdnRule = {
          name: rule.name,
          phase: 'request',
          description: rule.description ?? '',
          is_active: rule.active !== undefined ? rule.active : true, // Default to true if not provided
          order: index + 2, // index starts at 2, because the default rule is index 1
          criteria: [
            [
              {
                variable: `\${${rule.variable ?? 'uri'}}`,
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
          criteria: [
            [
              {
                variable: `\${${rule.variable ?? 'uri'}}`,
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
}

export default RulesProcessConfigStrategy;
