import type { AzionConfigV6, AzionFirewallBehaviorV6, AzionFirewallV6 } from '../../../types';
import FirewallProcessConfigStrategy from './firewallProcessConfigStrategy';

describe('FirewallProcessConfigStrategy (v6)', () => {
  let strategy: FirewallProcessConfigStrategy;

  const withFirewall = (firewall: AzionFirewallV6, extra: Partial<AzionConfigV6> = {}): AzionConfigV6 => ({
    version: 6,
    firewall: [firewall],
    ...extra,
  });
  const withBehaviors = (behaviors: AzionFirewallBehaviorV6[]) =>
    withFirewall({
      name: 'my-firewall',
      rules: [
        {
          name: 'rule',
          criteria: [{ variable: 'request_uri', conditional: 'if', operator: 'starts_with', argument: '/admin' }],
          behaviors,
        },
      ],
    });

  beforeEach(() => {
    strategy = new FirewallProcessConfigStrategy();
  });

  describe('transformToManifest', () => {
    it('should return an empty array when there are no firewalls', () => {
      expect(strategy.transformToManifest({ version: 6 })).toEqual([]);
    });

    it('should apply the defaults to a firewall with only the name', () => {
      expect(strategy.transformToManifest(withFirewall({ name: 'my-firewall' }))).toEqual([
        {
          name: 'my-firewall',
          modules: {
            functions: { enabled: true },
            network_protection: { enabled: true },
            waf: { enabled: false },
          },
          debug: false,
          active: true,
        },
      ]);
    });

    it('should write active and debugRules to the manifest (v4 ignored them)', () => {
      const [firewall] = strategy.transformToManifest(
        withFirewall({ name: 'my-firewall', active: false, debugRules: true, functions: false, waf: true }),
      );

      expect(firewall).toEqual(
        expect.objectContaining({
          active: false,
          debug: true,
          modules: {
            functions: { enabled: false },
            network_protection: { enabled: true },
            waf: { enabled: true },
          },
        }),
      );
    });

    it('should wrap the variables of the criteria in ${} and keep them in one group', () => {
      const [firewall] = strategy.transformToManifest(
        withFirewall({
          name: 'my-firewall',
          rules: [
            {
              name: 'rule',
              description: 'Block admin',
              criteria: [
                { variable: 'request_uri', conditional: 'if', operator: 'starts_with', argument: '/admin' },
                { variable: '${host}', conditional: 'and', operator: 'exists' },
              ],
              behaviors: [{ type: 'deny' }],
            },
          ],
        }),
      );

      expect(firewall.rules_engine).toEqual([
        {
          name: 'rule',
          description: 'Block admin',
          active: true,
          behaviors: [{ type: 'deny' }],
          criteria: [
            [
              { variable: '${request_uri}', conditional: 'if', operator: 'starts_with', argument: '/admin' },
              { variable: '${host}', conditional: 'and', operator: 'exists' },
            ],
          ],
        },
      ]);
    });

    it('should build a matches criterion from match and variable', () => {
      const [firewall] = strategy.transformToManifest(
        withFirewall({
          name: 'my-firewall',
          rules: [{ name: 'rule', match: '^/api', variable: 'request_uri', behaviors: [{ type: 'drop' }] }],
        }),
      );

      expect(firewall.rules_engine[0].criteria).toEqual([
        [{ variable: '${request_uri}', operator: 'matches', conditional: 'if', argument: '^/api' }],
      ]);
    });

    it('should accept a bypass behavior (new in v6) and keep run_function as it is', () => {
      const [firewall] = strategy.transformToManifest(
        withFirewall(
          {
            name: 'my-firewall',
            rules: [
              {
                name: 'rule',
                criteria: [{ variable: 'host', conditional: 'if', operator: 'exists' }],
                behaviors: [{ type: 'run_function', attributes: { value: 'fn' } }, { type: 'bypass' }],
              },
            ],
          },
          { functions: [{ name: 'fn', path: './fn.js' }] },
        ),
      );

      expect(firewall.rules_engine[0].behaviors).toEqual([
        { type: 'run_function', attributes: { value: 'fn' } },
        { type: 'bypass' },
      ]);
    });

    it('should map set_waf, set_rate_limit and set_custom_response to the manifest', () => {
      const [firewall] = strategy.transformToManifest(
        withBehaviors([{ type: 'set_waf', attributes: { mode: 'logging', wafId: 'my-waf' } }]),
      );
      expect(firewall.rules_engine[0].behaviors).toEqual([
        { type: 'set_waf', attributes: { mode: 'logging', waf_id: 'my-waf' } },
      ]);

      const [rateLimit] = strategy.transformToManifest(
        withBehaviors([
          {
            type: 'set_rate_limit',
            attributes: { type: 'minute', limitBy: 'client_ip', averageRateLimit: 100, maximumBurstSize: 20 },
          },
        ]),
      );
      expect(rateLimit.rules_engine[0].behaviors).toEqual([
        {
          type: 'set_rate_limit',
          attributes: { type: 'minute', limit_by: 'client_ip', average_rate_limit: 100, maximum_burst_size: 20 },
        },
      ]);

      const [custom] = strategy.transformToManifest(
        withBehaviors([
          {
            type: 'set_custom_response',
            attributes: { statusCode: 403, contentType: 'text/plain', contentBody: 'Forbidden' },
          },
        ]),
      );
      expect(custom.rules_engine[0].behaviors).toEqual([
        {
          type: 'set_custom_response',
          attributes: { status_code: 403, content_type: 'text/plain', content_body: 'Forbidden' },
        },
      ]);
    });

    it('should leave out the optional attributes of the rate limit and of the custom response', () => {
      const [rateLimit] = strategy.transformToManifest(
        withBehaviors([{ type: 'set_rate_limit', attributes: { limitBy: 'global', averageRateLimit: 5 } }]),
      );
      expect(rateLimit.rules_engine[0].behaviors[0].attributes).toEqual({ limit_by: 'global', average_rate_limit: 5 });

      const [custom] = strategy.transformToManifest(
        withBehaviors([{ type: 'set_custom_response', attributes: { statusCode: 404 } }]),
      );
      expect(custom.rules_engine[0].behaviors[0].attributes).toEqual({ status_code: 404 });
    });

    it('should throw when a terminal behavior is combined with another one', () => {
      const terminal = (type: 'deny' | 'drop') =>
        strategy.transformToManifest(
          withBehaviors([{ type }, { type: 'set_rate_limit', attributes: { limitBy: 'global', averageRateLimit: 5 } }]),
        );

      expect(() => terminal('deny')).toThrow("The behavior 'deny' is a terminal behavior and must be used alone.");
      expect(() => terminal('drop')).toThrow("The behavior 'drop' is a terminal behavior and must be used alone.");
      expect(() =>
        strategy.transformToManifest(
          withBehaviors([{ type: 'set_custom_response', attributes: { statusCode: 403 } }, { type: 'bypass' }]),
        ),
      ).toThrow("The behavior 'set_custom_response' is a terminal behavior");
    });

    describe('network list references', () => {
      const withList = (
        operator: 'is_in_list' | 'is_not_in_list',
        argument: string | number,
        extra: Partial<AzionConfigV6> = {},
      ) =>
        withFirewall(
          {
            name: 'my-firewall',
            rules: [
              {
                name: 'Block list',
                criteria: [{ variable: 'network', conditional: 'if', operator, argument }],
                behaviors: [{ type: 'deny' }],
              },
            ],
          },
          extra,
        );

      it('should accept a rule that references a declared network list', () => {
        const networkList = [{ name: 'blocked-ips', type: 'ip_cidr' as const, items: ['10.0.0.0/8'] }];

        expect(() =>
          strategy.transformToManifest(withList('is_in_list', 'blocked-ips', { networkList })),
        ).not.toThrow();
        expect(() =>
          strategy.transformToManifest(withList('is_not_in_list', 'blocked-ips', { networkList })),
        ).not.toThrow();
      });

      it('should throw when the network list is not declared', () => {
        const message = 'Firewall rule "Block list" references non-existent Network List "blocked-ips".';

        expect(() => strategy.transformToManifest(withList('is_in_list', 'blocked-ips'))).toThrow(message);
        expect(() =>
          strategy.transformToManifest(
            withList('is_not_in_list', 'blocked-ips', {
              networkList: [{ name: 'other', type: 'asn', items: ['1'] }],
            }),
          ),
        ).toThrow(message);
      });

      it('should not validate a network list referenced by id', () => {
        expect(() => strategy.transformToManifest(withList('is_in_list', 10))).not.toThrow();
      });

      it('should not validate the argument of the other operators', () => {
        expect(() =>
          strategy.transformToManifest(
            withFirewall({
              name: 'my-firewall',
              rules: [
                {
                  name: 'rule',
                  criteria: [{ variable: 'host', conditional: 'if', operator: 'is_equal', argument: 'blocked-ips' }],
                  behaviors: [{ type: 'deny' }],
                },
              ],
            }),
          ),
        ).not.toThrow();
      });
    });

    it('should write the function instances, with active, and validate the function', () => {
      const firewall: AzionFirewallV6 = {
        name: 'my-firewall',
        functionsInstances: [
          { name: 'instance', ref: 'fn', args: { a: 1 } },
          { name: 'off', ref: 10, active: false },
        ],
      };

      expect(
        strategy.transformToManifest(withFirewall(firewall, { functions: [{ name: 'fn', path: './fn.js' }] }))[0]
          .functions_instances,
      ).toEqual([
        { name: 'instance', args: { a: 1 }, active: true, function: 'fn' },
        { name: 'off', args: {}, active: false, function: 10 },
      ]);
      expect(() => strategy.transformToManifest(withFirewall(firewall))).toThrow(
        'Function instance "instance" references non-existent Function "fn".',
      );
    });
  });

  describe('transformToConfig', () => {
    it('should set an empty array when the manifest has no firewall', () => {
      const transformedPayload: AzionConfigV6 = { version: 6 };

      expect(strategy.transformToConfig({}, transformedPayload)).toEqual([]);
      expect(transformedPayload.firewall).toEqual([]);
    });

    it('should round trip a firewall through the manifest', () => {
      const firewall: AzionFirewallV6 = {
        name: 'my-firewall',
        active: true,
        debugRules: true,
        functions: true,
        networkProtection: true,
        waf: true,
        rules: [
          {
            name: 'rule',
            description: 'Block admin',
            active: true,
            criteria: [{ variable: '${request_uri}', conditional: 'if', operator: 'starts_with', argument: '/admin' }],
            behaviors: [
              { type: 'set_waf', attributes: { mode: 'blocking', wafId: 'my-waf' } },
              {
                type: 'set_rate_limit',
                attributes: { type: 'second', limitBy: 'global', averageRateLimit: 10, maximumBurstSize: 2 },
              },
            ],
          },
          {
            name: 'deny',
            active: true,
            criteria: [{ variable: '${host}', conditional: 'if', operator: 'exists' }],
            behaviors: [{ type: 'deny' }],
          },
        ],
        functionsInstances: [{ name: 'instance', ref: 'fn', args: { a: 1 }, active: true }],
      };
      const config = withFirewall(firewall, { functions: [{ name: 'fn', path: './fn.js' }] });
      const transformedPayload: AzionConfigV6 = { version: 6 };

      strategy.transformToConfig({ firewall: strategy.transformToManifest(config) }, transformedPayload);

      expect(transformedPayload.firewall).toEqual([firewall]);
    });
  });
});
