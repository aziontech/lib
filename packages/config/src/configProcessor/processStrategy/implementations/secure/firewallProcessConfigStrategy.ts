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
          behaviors: this.transformBehaviorsToManifest(rule.behaviors),
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
  private transformBehaviorsToManifest(behaviorArray: any[]) {
    const behaviors = [];

    for (const behaviorItem of behaviorArray) {
      if (behaviorItem.runFunction !== undefined) {
        behaviors.push({
          type: 'run_function',
          attributes: {
            value: behaviorItem.runFunction,
          },
        });
      }

      if (behaviorItem.setWafRuleset) {
        behaviors.push({
          type: 'set_waf_ruleset',
          attributes: {
            mode: behaviorItem.setWafRuleset.wafMode,
            waf_id: behaviorItem.setWafRuleset.wafId,
          },
        });
      }

      if (behaviorItem.setRateLimit) {
        behaviors.push({
          type: 'set_rate_limit',
          attributes: {
            type: behaviorItem.setRateLimit.type || 'second',
            limit_by: behaviorItem.setRateLimit.limitBy,
            average_rate_limit: behaviorItem.setRateLimit.averageRateLimit,
            maximum_burst_size: behaviorItem.setRateLimit.maximumBurstSize,
          },
        });
      }

      if (behaviorItem.deny) {
        behaviors.push({
          type: 'deny',
        });
      }

      if (behaviorItem.drop) {
        behaviors.push({
          type: 'drop',
        });
      }

      if (behaviorItem.setCustomResponse) {
        behaviors.push({
          type: 'set_custom_response',
          attributes: {
            status_code: behaviorItem.setCustomResponse.statusCode,
            content_type: behaviorItem.setCustomResponse.contentType,
            content_body: behaviorItem.setCustomResponse.contentBody,
          },
        });
      }
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
            behaviors: this.transformBehaviorsToConfig(rule.behaviors),
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
    const behaviorArray: any[] = [];

    behaviors.forEach((b) => {
      switch (b.type) {
        case 'run_function':
          behaviorArray.push({
            runFunction: b.attributes.value,
          });
          break;
        case 'set_waf_ruleset':
          behaviorArray.push({
            setWafRuleset: {
              wafMode: b.attributes.mode,
              wafId: b.attributes.waf_id,
            },
          });
          break;
        case 'set_rate_limit':
          behaviorArray.push({
            setRateLimit: {
              type: b.attributes.type,
              limitBy: b.attributes.limit_by,
              averageRateLimit: b.attributes.average_rate_limit,
              maximumBurstSize: b.attributes.maximum_burst_size,
            },
          });
          break;
        case 'deny':
          behaviorArray.push({ deny: true });
          break;
        case 'drop':
          behaviorArray.push({ drop: true });
          break;
        case 'set_custom_response':
          behaviorArray.push({
            setCustomResponse: {
              statusCode: b.attributes.status_code,
              contentType: b.attributes.content_type,
              contentBody: b.attributes.content_body,
            },
          });
          break;
      }
    });

    return behaviorArray;
  }
}

export default FirewallProcessConfigStrategy;
