export const RULE_VARIABLES = [
  'arg_param',
  'args',
  'cookie_name',
  'device_group',
  'geoip_city_continent_code',
  'geoip_city_country_code',
  'geoip_continent_code',
  'geoip_city_country_name',
  'geoip_city',
  'geoip_country_code',
  'geoip_country_name',
  'geoip_region_name',
  'geoip_region',
  'host',
  'http_header',
  'remote_addr',
  'remote_user',
  'request',
  'request_method',
  'request_uri',
  'scheme',
  'sent_http_header',
  'status',
  'upstream_addr',
  'upstream_cookie_name',
  'upstream_http_header',
  'upstream_status',
  'uri',
] as const;

export const RULE_OPERATORS_WITH_VALUE = [
  'is_equal',
  'is_not_equal',
  'starts_with',
  'does_not_start_with',
  'matches',
  'does_not_match',
] as const;

export const RULE_OPERATORS_WITHOUT_VALUE = ['exists', 'does_not_exist'] as const;

export const RULE_CONDITIONALS = ['if', 'and', 'or'] as const;

export const FIREWALL_BEHAVIOR_NAMES = [
  'deny',
  'drop',
  'setRateLimit',
  'setWafRuleset',
  'runFunction',
  'tagEvent',
  'setCustomResponse',
] as const;

export const FIREWALL_RATE_LIMIT_TYPES = ['second', 'minute'] as const;

export const FIREWALL_RATE_LIMIT_BY = ['clientIp', 'global'] as const;

export const FIREWALL_WAF_MODES = ['learning', 'blocking'] as const;

export const FIREWALL_VARIABLES = [
  'header_accept',
  'header_accept_encoding',
  'header_accept_language',
  'header_cookie',
  'header_origin',
  'header_referer',
  'header_user_agent',
  'host',
  'network',
  'request_args',
  'request_method',
  'request_uri',
  'scheme',
  'client_certificate_validation',
  'ssl_verification_status',
] as const;

export type RuleVariable = (typeof RULE_VARIABLES)[number];
export type RuleOperatorWithValue = (typeof RULE_OPERATORS_WITH_VALUE)[number];
export type RuleOperatorWithoutValue = (typeof RULE_OPERATORS_WITHOUT_VALUE)[number];
export type RuleConditional = (typeof RULE_CONDITIONALS)[number];
export type FirewallBehaviorName = (typeof FIREWALL_BEHAVIOR_NAMES)[number];
export type FirewallRateLimitType = (typeof FIREWALL_RATE_LIMIT_TYPES)[number];
export type FirewallRateLimitBy = (typeof FIREWALL_RATE_LIMIT_BY)[number];
export type FirewallWafMode = (typeof FIREWALL_WAF_MODES)[number];
export type FirewallVariable = (typeof FIREWALL_VARIABLES)[number];

export const NETWORK_LIST_TYPES = ['ip_cidr', 'asn', 'countries'] as const;
