export const COMMON_VARIABLES = [
  'args',
  'device_group',
  'domain',
  'geoip_city',
  'geoip_city_continent_code',
  'geoip_city_country_code',
  'geoip_city_country_name',
  'geoip_continent_code',
  'geoip_country_code',
  'geoip_country_name',
  'geoip_region',
  'geoip_region_name',
  'host',
  'remote_addr',
  'remote_port',
  'remote_user',
  'request',
  'request_body',
  'request_method',
  'request_uri',
  'scheme',
  'uri',
] as const;

export const REQUEST_ONLY_VARIABLES = ['server_addr', 'server_port'] as const;

export const MTLS_VARIABLES = [
  'ssl_client_fingerprint',
  'ssl_client_escaped_cert',
  'ssl_client_s_dn',
  'ssl_client_s_dn_parsed',
  'ssl_client_cert',
  'ssl_client_i_dn',
  'ssl_client_serial',
  'ssl_client_v_end',
  'ssl_client_v_remain',
  'ssl_client_v_start',
  'ssl_client_verify',
] as const;

export const RESPONSE_ONLY_VARIABLES = [
  'sent_http_name',
  'status',
  'tcpinfo_rtt',
  'upstream_addr',
  'upstream_status',
] as const;

export const SPECIAL_VARIABLES = ['cookie_time_offset', 'encode_base64'] as const;

export const ALL_REQUEST_VARIABLES = [...COMMON_VARIABLES, ...REQUEST_ONLY_VARIABLES, ...MTLS_VARIABLES] as const;

export const ALL_RESPONSE_VARIABLES = [...COMMON_VARIABLES, ...RESPONSE_ONLY_VARIABLES] as const;

export const REQUEST_DYNAMIC_PATTERNS = ['arg_[a-zA-Z0-9_]+', 'cookie_[a-zA-Z0-9_]+', 'http_[a-zA-Z0-9_]+'] as const;

export const RESPONSE_DYNAMIC_PATTERNS = [
  'arg_[a-zA-Z0-9_]+',
  'cookie_[a-zA-Z0-9_]+',
  'http_[a-zA-Z0-9_]+',
  'sent_http_[a-zA-Z0-9_]+',
  'upstream_cookie_[a-zA-Z0-9_]+',
  'upstream_http_[a-zA-Z0-9_]+',
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

export const DYNAMIC_VARIABLE_PATTERNS = [
  'arg_[a-zA-Z0-9_]+',
  'cookie_[a-zA-Z0-9_]+',
  'http_[a-zA-Z0-9_]+',
  'sent_http_[a-zA-Z0-9_]+',
  'upstream_cookie_[a-zA-Z0-9_]+',
  'upstream_http_[a-zA-Z0-9_]+',
] as const;

export const RULE_VARIABLES = [...ALL_REQUEST_VARIABLES, ...ALL_RESPONSE_VARIABLES] as const;

export type CommonVariable = (typeof COMMON_VARIABLES)[number];
export type RequestVariable = (typeof ALL_REQUEST_VARIABLES)[number];
export type ResponseVariable = (typeof ALL_RESPONSE_VARIABLES)[number];
export type RuleOperatorWithValue = (typeof RULE_OPERATORS_WITH_VALUE)[number];
export type RuleOperatorWithoutValue = (typeof RULE_OPERATORS_WITHOUT_VALUE)[number];
export type RuleConditional = (typeof RULE_CONDITIONALS)[number];
export type RuleVariable = (typeof RULE_VARIABLES)[number];
