import type {
  AzionManifestRule,
  AzionRule,
  AzionRuleBehavior,
  AzionRuleCriteriaArray,
  AzionRules,
  RuleVariable,
} from '../../../../../types';
import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type { AzionConfigV6, AzionFunctionV6 } from '../../../types';

/**
 * RulesProcessConfigStrategy
 * @class RulesProcessConfigStrategy
 * @description This class is implementation of the Rules ProcessConfig Strategy for V6.
 * TODO: validate the connectors referenced by `set_connector` once the v6 config has connectors.
 */
class RulesProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Validates function references in rules
   */
  private validateFunctionReferences(applicationRules: AzionRules, functions?: AzionFunctionV6[]) {
    if (!functions) return;

    const definedFunctions = new Set(functions.map((f) => f.name));

    // Check request rules
    if (applicationRules.request) {
      for (const rule of applicationRules.request) {
        for (const behavior of rule.behaviors) {
          if (behavior.type === 'run_function' && behavior.attributes) {
            // Only validate if it's a string (name), skip validation for numbers (IDs)
            if (typeof behavior.attributes.value === 'string' && !definedFunctions.has(behavior.attributes.value)) {
              throw new Error(
                `Function "${behavior.attributes.value}" referenced in rule "${rule.name}" is not defined in the functions array.`,
              );
            }
          }
        }
      }
    }

    // Check response rules
    if (applicationRules.response) {
      for (const rule of applicationRules.response) {
        for (const behavior of rule.behaviors) {
          if (behavior.type === 'run_function' && behavior.attributes) {
            // Only validate if it's a string (name), skip validation for numbers (IDs)
            if (typeof behavior.attributes.value === 'string' && !definedFunctions.has(behavior.attributes.value)) {
              throw new Error(
                `Function "${behavior.attributes.value}" referenced in rule "${rule.name}" is not defined in the functions array.`,
              );
            }
          }
        }
      }
    }
  }

  /**
   * Transforms azion.config rules to API manifest format
   */
  transformToManifest(applicationRules: AzionRules, functions?: AzionFunctionV6[]): AzionManifestRule[] {
    // Validate function references
    this.validateFunctionReferences(applicationRules, functions);

    const payload: AzionManifestRule[] = [];

    if (!applicationRules || Object.keys(applicationRules).length === 0) {
      return payload;
    }

    // Process request rules
    if (Array.isArray(applicationRules.request)) {
      applicationRules.request.forEach((rule) => {
        const manifestRule: AzionManifestRule = {
          phase: 'request',
          rule: {
            name: rule.name,
            description: rule.description,
            active: rule.active !== undefined ? rule.active : true,
            criteria: rule.criteria.map((criteriaGroup) =>
              criteriaGroup.map((criterion) => ({
                variable: criterion.variable.startsWith('${') ? criterion.variable : `\${${criterion.variable}}`,
                conditional: criterion.conditional,
                operator: criterion.operator,
                ...('argument' in criterion && { argument: criterion.argument }),
              })),
            ) as AzionRuleCriteriaArray,
            behaviors: rule.behaviors.map((behavior) => ({
              type: behavior.type,
              ...('attributes' in behavior && behavior.attributes && { attributes: behavior.attributes }),
            })) as AzionRuleBehavior[],
          },
        };
        payload.push(manifestRule);
      });
    }

    // Process response rules
    if (Array.isArray(applicationRules.response)) {
      applicationRules.response.forEach((rule) => {
        const manifestRule: AzionManifestRule = {
          phase: 'response',
          rule: {
            name: rule.name,
            description: rule.description,
            active: rule.active !== undefined ? rule.active : true,
            criteria: rule.criteria.map((criteriaGroup) =>
              criteriaGroup.map((criterion) => ({
                variable: criterion.variable.startsWith('${') ? criterion.variable : `\${${criterion.variable}}`,
                conditional: criterion.conditional,
                operator: criterion.operator,
                ...('argument' in criterion && { argument: criterion.argument }),
              })),
            ) as AzionRuleCriteriaArray,
            behaviors: rule.behaviors.map((behavior) => ({
              type: behavior.type,
              ...('attributes' in behavior && behavior.attributes && { attributes: behavior.attributes }),
            })) as AzionRuleBehavior[],
          },
        };
        payload.push(manifestRule);
      });
    }

    return payload;
  }

  /**
   * Transforms API manifest format back to azion.config rules
   */
  transformToConfig(rulesPayload: AzionManifestRule[]): AzionRules {
    if (!Array.isArray(rulesPayload)) {
      return { request: [], response: [] };
    }

    const rules: AzionRules = {
      request: [],
      response: [],
    };

    rulesPayload.forEach((manifestRule) => {
      const rule: AzionRule = {
        name: manifestRule.rule.name,
        description: manifestRule.rule.description,
        active: manifestRule.rule.active !== undefined ? manifestRule.rule.active : true,
        criteria: manifestRule.rule.criteria.map((criteriaGroup) =>
          criteriaGroup.map((criterion) => {
            const baseCriterion = {
              variable: criterion.variable as RuleVariable,
              conditional: criterion.conditional,
              operator: criterion.operator,
            };

            // Add argument if present
            if ('argument' in criterion && criterion.argument !== undefined) {
              return {
                ...baseCriterion,
                argument: criterion.argument,
              };
            }

            return baseCriterion;
          }),
        ) as AzionRuleCriteriaArray,
        behaviors: manifestRule.rule.behaviors.map((behavior) => ({
          type: behavior.type,
          ...('attributes' in behavior && behavior.attributes && { attributes: behavior.attributes }),
        })) as AzionRuleBehavior[],
      };

      if (manifestRule.phase === 'request') {
        rules.request!.push(rule);
      } else if (manifestRule.phase === 'response') {
        rules.response!.push(rule);
      }
    });

    return rules;
  }
}

export default RulesProcessConfigStrategy;
