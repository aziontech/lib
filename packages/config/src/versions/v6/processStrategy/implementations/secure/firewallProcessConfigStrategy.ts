import type { AzionFunction } from '../../../../../types';
import ProcessConfigStrategy from '../../../../shared/processStrategy/processConfigStrategy';
import type {
  AzionConfigV6,
  AzionFirewallBehaviorV6,
  AzionFirewallRuleV6,
  AzionFirewallV6,
  AzionNetworkListV6,
} from '../../../types';

/**
 * FirewallProcessConfigStrategy V6
 * @class FirewallProcessConfigStrategy
 * @description Converts the v6 firewalls between the config and the manifest.
 * Unlike v4, the `active` and `debugRules` of the firewall are written to the manifest.
 */
class FirewallProcessConfigStrategy extends ProcessConfigStrategy<AzionConfigV6> {
  /**
   * Validate that referenced Function exists
   */
  private validateFunctionReference(
    functions: AzionFunction[] | undefined,
    functionNameOrId: string | number,
    instanceName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof functionNameOrId === 'string') {
      if (!Array.isArray(functions) || !functions.find((func) => func.name === functionNameOrId)) {
        throw new Error(`Function instance "${instanceName}" references non-existent Function "${functionNameOrId}".`);
      }
    }
  }

  /**
   * Validate that the network list referenced by is_in_list and is_not_in_list exists
   */
  private validateNetworkListReference(
    networkLists: AzionNetworkListV6[] | undefined,
    networkListNameOrId: string | number,
    ruleName: string,
  ) {
    // Only validate if it's a string (name), skip validation for numbers (IDs)
    if (typeof networkListNameOrId === 'string') {
      if (!Array.isArray(networkLists) || !networkLists.find((list) => list.name === networkListNameOrId)) {
        throw new Error(`Firewall rule "${ruleName}" references non-existent Network List "${networkListNameOrId}".`);
      }
    }
  }

  transformToManifest(config: AzionConfigV6) {
    if (!config.firewall || !Array.isArray(config.firewall)) {
      return [];
    }

    return config.firewall.map((fw: AzionFirewallV6) => {
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
        debug: fw.debugRules ?? false,
        active: fw.active ?? true,
      };

      if (fw.rules && fw.rules.length > 0) {
        fw.rules.forEach((rule: AzionFirewallRuleV6) =>
          rule.criteria?.forEach((criterion) => {
            if (
              (criterion.operator === 'is_in_list' || criterion.operator === 'is_not_in_list') &&
              criterion.argument !== undefined &&
              criterion.argument !== null
            ) {
              this.validateNetworkListReference(config.networkList, criterion.argument, rule.name);
            }
          }),
        );

        payload.rules_engine = fw.rules.map((rule: AzionFirewallRuleV6) => ({
          name: rule.name,
          description: rule.description || '',
          active: rule.active ?? true,
          behaviors: this.transformBehaviorsToManifest(rule.behaviors),
          criteria: rule.criteria
            ? [
                rule.criteria.map((criterion) => ({
                  variable: criterion.variable.startsWith('${') ? criterion.variable : `\${${criterion.variable}}`,
                  conditional: criterion.conditional,
                  operator: criterion.operator,
                  ...('argument' in criterion && { argument: criterion.argument }),
                })),
              ]
            : [
                [
                  {
                    variable: rule.variable?.startsWith('${') ? rule.variable : `\${${rule.variable}}`,
                    operator: 'matches',
                    conditional: 'if',
                    argument: rule.match,
                  },
                ],
              ],
        }));
      }

      if (fw.functionsInstances && fw.functionsInstances.length > 0) {
        payload.functions_instances = fw.functionsInstances.map((instance) => {
          this.validateFunctionReference(config.functions, instance.ref, instance.name);
          return {
            name: instance.name,
            args: instance.args || {},
            active: instance.active ?? true,
            function: instance.ref,
          };
        });
      }

      return payload;
    });
  }

  private transformBehaviorsToManifest(behaviorArray: AzionFirewallBehaviorV6[]) {
    // Runtime validation: deny, drop, and set_custom_response are terminal behaviors
    // and cannot be combined with other behaviors
    if (behaviorArray.length > 1) {
      const firstBehavior = behaviorArray[0];
      const hasTerminalBehavior =
        firstBehavior.type === 'deny' || firstBehavior.type === 'drop' || firstBehavior.type === 'set_custom_response';

      if (hasTerminalBehavior) {
        throw new Error(
          `The behavior '${firstBehavior.type}' is a terminal behavior and must be used alone. ` +
            `It cannot be combined with other behaviors in the same rule.`,
        );
      }
    }

    return behaviorArray.map((behavior) => {
      switch (behavior.type) {
        case 'set_waf':
          return {
            type: 'set_waf',
            attributes: {
              mode: behavior.attributes.mode,
              waf_id: behavior.attributes.wafId,
            },
          };
        case 'set_rate_limit':
          return {
            type: 'set_rate_limit',
            attributes: {
              ...(behavior.attributes.type && { type: behavior.attributes.type }),
              limit_by: behavior.attributes.limitBy,
              average_rate_limit: behavior.attributes.averageRateLimit,
              ...(behavior.attributes.maximumBurstSize !== undefined && {
                maximum_burst_size: behavior.attributes.maximumBurstSize,
              }),
            },
          };
        case 'set_custom_response':
          return {
            type: 'set_custom_response',
            attributes: {
              status_code: behavior.attributes.statusCode,
              ...(behavior.attributes.contentType !== undefined && { content_type: behavior.attributes.contentType }),
              ...(behavior.attributes.contentBody !== undefined && { content_body: behavior.attributes.contentBody }),
            },
          };
        default:
          // run_function, deny, drop and bypass keep their shape
          return behavior;
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfigV6) {
    if (!payload.firewall || !Array.isArray(payload.firewall)) {
      transformedPayload.firewall = [];
      return transformedPayload.firewall;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformedPayload.firewall = payload.firewall.map((fw: any) => {
      const firewallConfig: AzionFirewallV6 = {
        name: fw?.name,
        active: fw?.active ?? true,
        functions: fw?.modules?.functions?.enabled ?? false,
        networkProtection: fw?.modules?.network_protection?.enabled ?? false,
        waf: fw?.modules?.waf?.enabled ?? false,
        debugRules: fw?.debug ?? false,
      };

      if (fw.rules_engine && fw.rules_engine.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firewallConfig.rules = fw.rules_engine.map((rule: any) => ({
          name: rule.name,
          description: rule.description || undefined,
          active: rule.active ?? true,
          behaviors: this.transformBehaviorsToConfig(rule.behaviors),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          criteria: rule.criteria?.[0]?.map((criterion: any) => ({ ...criterion })) || [],
        }));
      }

      if (fw.functions_instances && fw.functions_instances.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firewallConfig.functionsInstances = fw.functions_instances.map((instance: any) => ({
          name: instance.name,
          args: instance.args || {},
          active: instance.active ?? true,
          ref: instance.function,
        }));
      }

      return firewallConfig;
    });
    return transformedPayload.firewall;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformBehaviorsToConfig(behaviors: any[]): AzionFirewallBehaviorV6[] {
    return behaviors.map((b) => {
      switch (b.type) {
        case 'set_waf':
          return { type: 'set_waf', attributes: { mode: b.attributes.mode, wafId: b.attributes.waf_id } };
        case 'set_rate_limit':
          return {
            type: 'set_rate_limit',
            attributes: {
              type: b.attributes.type,
              limitBy: b.attributes.limit_by,
              averageRateLimit: b.attributes.average_rate_limit,
              maximumBurstSize: b.attributes.maximum_burst_size,
            },
          };
        case 'set_custom_response':
          return {
            type: 'set_custom_response',
            attributes: {
              statusCode: b.attributes.status_code,
              contentType: b.attributes.content_type,
              contentBody: b.attributes.content_body,
            },
          };
        case 'run_function':
          return { type: 'run_function', attributes: b.attributes };
        default:
          // deny, drop and bypass
          return { type: b.type };
      }
    });
  }
}

export default FirewallProcessConfigStrategy;
