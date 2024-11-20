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

export type RuleVariable = (typeof RULE_VARIABLES)[number];
export type RuleOperatorWithValue = (typeof RULE_OPERATORS_WITH_VALUE)[number];
export type RuleOperatorWithoutValue = (typeof RULE_OPERATORS_WITHOUT_VALUE)[number];
export type RuleConditional = (typeof RULE_CONDITIONALS)[number];
