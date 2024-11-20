import { AzionConfig } from '../../../types';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: AzionConfig, context: any) {
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
          criteria: rule.criteria
            ? [rule.criteria] // Wrap user's criteria array in another array
            : [
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
          criteria: rule.criteria
            ? [rule.criteria] // Wrap user's criteria array in another array
            : [
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addBehaviorsObject = (behaviors: any, behaviorDefinitions: any, context: any) => {
      if (behaviors && Array.isArray(behaviors)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return behaviors.map((behavior: any) => {
          const behaviorName = behavior.name;
          if (behaviorDefinitions[behaviorName as keyof typeof behaviorDefinitions]) {
            return behaviorDefinitions[behaviorName as keyof typeof behaviorDefinitions].transform(
              behavior.target,
              context,
            );
          }
          console.warn(`Unknown behavior: ${behaviorName}`);
          return {};
        })[0];
      }
      return undefined;
    };

    const rulesConfig = payload.rules;
    if (!rulesConfig) {
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
          criteria: rule.criteria,
          behavior: addBehaviorsObject(rule.behaviors, revertRequestBehaviors, transformedPayload),
        });
      } else if (rule.phase === 'response') {
        transformedPayload.rules!.response!.push({
          name: rule.name,
          description: rule.description,
          active: rule.is_active,
          criteria: rule.criteria,
          behavior: addBehaviorsObject(rule.behaviors, revertResponseBehaviors, transformedPayload),
        });
      }
    });

    return transformedPayload.rules;
  }
}

export default RulesProcessConfigStrategy;
