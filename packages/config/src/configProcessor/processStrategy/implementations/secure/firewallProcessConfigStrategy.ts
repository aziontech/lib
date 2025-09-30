import { AzionConfig, AzionFirewall, AzionFirewallCriteriaWithValue, AzionFirewallRule } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * FirewallProcessConfigStrategy
 * @class FirewallProcessConfigStrategy
 * @description This class is implementation of the Firewall ProcessConfig Strategy.
 */
class FirewallProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    if (!config.firewall || !Array.isArray(config.firewall)) {
      return [];
    }

    return config.firewall.map((fw) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        name: fw.name,
        modules: {
          functions: {
            enabled: fw.functions ?? true,
          },
          network_protection: {
            enabled: fw.networkProtection ?? true,
          },
          waf: {
            enabled: fw.waf ?? false,
          },
        },
        debug: false,
        active: true,
      };

      if (fw.rules && fw.rules.length > 0) {
        payload.rules_engine = fw.rules.map((rule) => ({
          name: rule.name,
          description: rule.description || '',
          active: rule.active ?? true,
          behaviors: this.transformBehaviorsToManifest(rule.behavior),
          criteria: rule.criteria
            ? [
                rule.criteria.map((criterion) => {
                  const isWithArgument = 'argument' in criterion;
                  const { argument, ...rest } = criterion as AzionFirewallCriteriaWithValue;
                  return {
                    ...rest,
                    variable: criterion.variable,
                    ...(isWithArgument && { argument }),
                  };
                }),
              ]
            : [
                [
                  {
                    variable: rule.variable,
                    operator: 'matches',
                    conditional: 'if',
                    argument: rule.match,
                  },
                ],
              ],
        }));
      }

      return payload;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformBehaviorsToManifest(behavior: any) {
    const behaviors = [];

    if (behavior.runFunction) {
      behaviors.push({
        type: 'run_function',
        attributes: {
          value: behavior.runFunction,
        },
      });
    }

    if (behavior.setWafRuleset) {
      behaviors.push({
        type: 'set_waf_ruleset',
        attributes: {
          mode: behavior.setWafRuleset.wafMode,
          waf_id: behavior.setWafRuleset.wafId,
        },
      });
    }

    if (behavior.setRateLimit) {
      behaviors.push({
        type: 'set_rate_limit',
        attributes: {
          type: behavior.setRateLimit.type || 'second',
          value: behavior.setRateLimit.value,
          limit_by: behavior.setRateLimit.limitBy,
          average_rate_limit: behavior.setRateLimit.averageRateLimit,
          maximum_burst_size: behavior.setRateLimit.maximumBurstSize,
        },
      });
    }

    if (behavior.deny) {
      behaviors.push({
        type: 'deny',
      });
    }

    if (behavior.drop) {
      behaviors.push({
        type: 'drop',
      });
    }

    if (behavior.setCustomResponse) {
      behaviors.push({
        type: 'set_custom_response',
        attributes: {
          status_code: behavior.setCustomResponse.statusCode,
          content_type: behavior.setCustomResponse.contentType,
          content_body: behavior.setCustomResponse.contentBody,
        },
      });
    }

    return behaviors;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    if (!payload.firewall || !Array.isArray(payload.firewall)) {
      transformedPayload.firewall = [];
      return transformedPayload.firewall;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.firewall = payload.firewall.map((fw: any) => {
      const firewallConfig: AzionFirewall = {
        name: fw?.name,
        active: fw?.active ?? true,
        functions: fw?.modules?.functions?.enabled ?? false,
        networkProtection: fw?.modules?.network_protection?.enabled ?? false,
        waf: fw?.modules?.waf?.enabled ?? false,
        debugRules: fw?.debug_rules ?? false,
      };

      if (fw.rules_engine && fw.rules_engine.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firewallConfig.rules = fw.rules_engine.map((rule: any) => {
          const firewallRule: AzionFirewallRule = {
            name: rule.type,
            active: rule.active ?? true,
            behavior: this.transformBehaviorsToConfig(rule.behaviors),
            criteria:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rule.criteria?.[0].map((criterion: any) => {
                const isWithArgument = 'argument' in criterion;
                const { argument, ...rest } = criterion;
                return {
                  ...rest,
                  ...(isWithArgument && { argument }),
                };
              }) || [],
          };
          return firewallRule;
        });
      }

      return firewallConfig;
    });
    return transformedPayload.firewall;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformBehaviorsToConfig(behaviors: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const behavior: any = {};

    behaviors.forEach((b) => {
      switch (b.type) {
        case 'run_function':
          behavior.runFunction = {
            path: b.attributes.value,
          };
          break;
        case 'set_waf_ruleset':
          behavior.setWafRuleset = {
            wafMode: b.attributes.mode,
            wafId: b.attributes.waf_id,
          };
          break;
        case 'set_rate_limit':
          behavior.setRateLimit = {
            type: b.attributes.type,
            value: b.attributes.value,
            limitBy: b.attributes.limit_by,
            averageRateLimit: b.attributes.average_rate_limit,
            maximumBurstSize: b.attributes.maximum_burst_size,
          };
          break;
        case 'deny':
          behavior.deny = true;
          break;
        case 'drop':
          behavior.drop = true;
          break;
        case 'set_custom_response':
          behavior.setCustomResponse = {
            statusCode: b.attributes.status_code,
            contentType: b.attributes.content_type,
            contentBody: b.attributes.content_body,
          };
          break;
      }
    });

    return behavior;
  }
}

export default FirewallProcessConfigStrategy;
