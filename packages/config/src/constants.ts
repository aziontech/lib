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

export const RULES_ENGINE_BEHAVIORS = [
  'set_origin',
  'rewrite_request',
  'deliver',
  'add_request_cookie',
  'add_request_header',
  'add_response_header',
  'bypass_cache_phase',
  'capture_match_groups',
  'deny',
  'enable_gzip',
  'filter_request_cookie',
  'filter_response_cookie',
  'filter_request_header',
  'filter_response_header',
  'forward_cookies',
  'no_content',
  'optimize_images',
  'redirect_http_to_https',
  'redirect_to_301',
  'redirect_to_302',
  'run_function',
  'set_cache_policy',
  'set_cookie',
] as const;

export const FIREWALL_BEHAVIOR_NAMES = [
  'deny',
  'drop',
  'setRateLimit',
  'setWafRuleset',
  'runFunction',
  'tagEvent',
  'setCustomResponse',
] as const;

export const FIREWALL_RATE_LIMIT_BY = ['ip', 'global', 'cookie', 'header', 'query_string'] as const;

export const FIREWALL_RATE_LIMIT_TYPES = ['rpm', 'rps'] as const;

export const FIREWALL_WAF_MODES = ['learning', 'blocking', 'counting'] as const;

export const RULES_ENGINE_REQUEST_BEHAVIORS = [
  'add_request_cookie',
  'add_request_header',
  'add_response_header',
  'bypass_cache_phase',
  'capture_match_groups',
  'deliver',
  'deny',
  'enable_gzip',
  'filter_request_cookie',
  'filter_request_header',
  'forward_cookies',
  'no_content',
  'optimize_images',
  'redirect_http_to_https',
  'redirect_to_301',
  'redirect_to_302',
  'rewrite_request',
  'run_function',
  'set_cache_policy',
  'set_origin',
] as const;

export const RULES_ENGINE_RESPONSE_BEHAVIORS = [
  'deliver',
  'enable_gzip',
  'filter_response_cookie',
  'filter_response_header',
  'redirect_to_301',
  'redirect_to_302',
  'run_function',
  'set_cookie',
] as const;

export const RULES_ENGINE_BEHAVIORS_REQUIRING_TARGET = [
  'add_request_cookie',
  'add_request_header',
  'add_response_header',
  'capture_match_groups',
  'filter_request_cookie',
  'filter_response_cookie',
  'filter_request_header',
  'filter_response_header',
  'redirect_to_301',
  'redirect_to_302',
  'rewrite_request',
  'run_function',
  'set_cache_policy',
  'set_cookie',
  'set_origin',
] as const;

export const FIREWALL_BEHAVIORS_REQUIRING_ARGUMENT = ['setRateLimit', 'setWafRuleset'] as const;

export type RulesEngineBehavior = (typeof RULES_ENGINE_BEHAVIORS)[number];
export type FirewallBehavior = (typeof FIREWALL_BEHAVIOR_NAMES)[number];
export type RulesEngineRequestBehavior = (typeof RULES_ENGINE_REQUEST_BEHAVIORS)[number];
export type RulesEngineResponseBehavior = (typeof RULES_ENGINE_RESPONSE_BEHAVIORS)[number];
export type RulesEngineBehaviorRequiringTarget = (typeof RULES_ENGINE_BEHAVIORS_REQUIRING_TARGET)[number];
export type FirewallBehaviorRequiringArgument = (typeof FIREWALL_BEHAVIORS_REQUIRING_ARGUMENT)[number];

export const NETWORK_LIST_TYPES = ['ip_cidr', 'asn', 'countries'] as const;
export type NetworkListType = (typeof NETWORK_LIST_TYPES)[number];

export const WAF_MODE = ['learning', 'blocking', 'counting'] as const;
export type WafMode = (typeof WAF_MODE)[number];
export const WAF_SENSITIVITY = ['low', 'medium', 'high'] as const;
export type WafSensitivity = (typeof WAF_SENSITIVITY)[number];

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

export type FirewallVariable = (typeof FIREWALL_VARIABLES)[number];
