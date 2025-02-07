import { AzionConfig, AzionFirewall, AzionFirewallCriteriaWithValue, AzionFirewallRule } from '../../../../types';
import ProcessConfigStrategy from '../../processConfigStrategy';

/**
 * FirewallProcessConfigStrategy
 * @class FirewallProcessConfigStrategy
 * @description This class is implementation of the Firewall ProcessConfig Strategy.
 */
class FirewallProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const firewall = config?.firewall;
    if (!firewall || Object.keys(firewall).length === 0) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      main_settings: {
        name: firewall.name,
        domains: firewall.domains || [],
        is_active: firewall.active ?? true,
        edge_functions_enabled: firewall.edgeFunctions ?? false,
        network_protection_enabled: firewall.networkProtection ?? false,
        waf_enabled: firewall.waf ?? false,
        debug_rules: firewall.debugRules ?? false,
      },
    };

    if (firewall.rules && firewall.rules.length > 0) {
      payload.rules_engine = firewall.rules.map((rule) => ({
        name: rule.name,
        description: rule.description || '',
        is_active: rule.active ?? true,
        behaviors: this.transformBehaviorsToManifest(rule.behavior),
        criteria: rule.criteria
          ? [
              rule.criteria.map((criterion) => {
                const isWithValue = 'inputValue' in criterion;
                const { inputValue, ...rest } = criterion as AzionFirewallCriteriaWithValue;
                return {
                  ...rest,
                  variable: criterion.variable,
                  ...(isWithValue && { input_value: inputValue }),
                };
              }),
            ]
          : [
              [
                {
                  variable: rule.variable,
                  operator: 'matches',
                  conditional: 'if',
                  input_value: rule.match,
                },
              ],
            ],
      }));
    }

    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformBehaviorsToManifest(behavior: any) {
    const behaviors = [];

    if (behavior.runFunction) {
      behaviors.push({
        name: 'run_function',
        target: behavior.runFunction.path,
      });
    }

    if (behavior.setWafRuleset) {
      behaviors.push({
        name: 'set_waf_ruleset',
        target: {
          mode: behavior.setWafRuleset.wafMode,
          waf_id: behavior.setWafRuleset.wafId,
        },
      });
    }

    if (behavior.setRateLimit) {
      behaviors.push({
        name: 'set_rate_limit',
        target: {
          type: behavior.setRateLimit.type,
          value: behavior.setRateLimit.value,
          limit_by: behavior.setRateLimit.limitBy,
        },
      });
    }

    if (behavior.deny) {
      behaviors.push({
        name: 'deny',
        target: '',
      });
    }

    if (behavior.drop) {
      behaviors.push({
        name: 'drop',
        target: '',
      });
    }

    if (behavior.setCustomResponse) {
      behaviors.push({
        name: 'set_custom_response',
        target: {
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
    const firewall = payload.firewall;
    if (!firewall || Object.keys(firewall).length === 0) {
      return;
    }

    const firewallConfig: AzionFirewall = {
      name: firewall.main_settings?.name,
      domains: firewall?.main_settings?.domains || [],
      active: firewall?.main_settings?.is_active ?? true,
      edgeFunctions: firewall?.main_settings?.edge_functions_enabled ?? false,
      networkProtection: firewall?.main_settings?.network_protection_enabled ?? false,
      waf: firewall?.main_settings?.waf_enabled ?? false,
      debugRules: firewall?.main_settings?.debug_rules ?? false,
    };

    if (firewall.rules_engine && firewall.rules_engine.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      firewallConfig.rules = firewall.rules_engine.map((rule: any) => {
        const firewallRule: AzionFirewallRule = {
          name: rule.name,
          description: rule.description || '',
          active: rule.is_active ?? true,
          behavior: this.transformBehaviorsToConfig(rule.behaviors),
          criteria:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rule.criteria?.[0].map((criterion: any) => {
              const isWithValue = 'input_value' in criterion;
              const { input_value, ...rest } = criterion;
              return {
                ...rest,
                ...(isWithValue && { inputValue: input_value }),
              };
            }) || [],
        };
        return firewallRule;
      });
    }

    transformedPayload.firewall = firewallConfig;
    return transformedPayload.firewall;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformBehaviorsToConfig(behaviors: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const behavior: any = {};

    behaviors.forEach((b) => {
      switch (b.name) {
        case 'run_function':
          behavior.runFunction = {
            path: b.target,
          };
          break;
        case 'set_waf_ruleset':
          behavior.setWafRuleset = {
            wafMode: b.target.mode,
            wafId: b.target.waf_id,
          };
          break;
        case 'set_rate_limit':
          behavior.setRateLimit = {
            type: b.target.type,
            value: b.target.value,
            limitBy: b.target.limit_by,
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
            statusCode: b.target.status_code,
            contentType: b.target.content_type,
            contentBody: b.target.content_body,
          };
          break;
      }
    });

    return behavior;
  }
}

export default FirewallProcessConfigStrategy;
