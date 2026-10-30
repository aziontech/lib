// Constants of the Azion API v6 config. Variables are the ones of `ApplicationCriterionField` of the v6 API.

/** Variables available in the request and in the response phase. */
export const COMMON_VARIABLES = [
  'args',
  'device_group',
  'geoip_city_continent_code',
  'geoip_city_country_code',
  'geoip_city_country_name',
  'geoip_city',
  'geoip_continent_code',
  'geoip_country_code',
  'geoip_country_name',
  'geoip_region_name',
  'geoip_region',
  'host',
  'domain',
  'remote_addr',
  'remote_user',
  'request_method',
  'request_uri',
  'request',
  'scheme',
  'uri',
  'server_addr',
  'server_port',
  'ssl_client_cert',
  'ssl_client_escaped_cert',
  'ssl_client_fingerprint',
  'ssl_client_i_dn',
  'ssl_client_s_dn_parsed',
  'ssl_client_s_dn',
  'ssl_client_serial',
  'ssl_client_v_end',
  'ssl_client_v_remain',
  'ssl_client_v_start',
  'ssl_client_verify',
  'tcpinfo_rtt',
  'remote_port',
  'request_body',
] as const;

/** Variables available only in the response phase. */
export const RESPONSE_ONLY_VARIABLES = ['status', 'upstream_addr', 'upstream_status'] as const;

export const SPECIAL_VARIABLES = ['cookie_time_offset', 'encode_base64'] as const;

export const ALL_REQUEST_VARIABLES = [...COMMON_VARIABLES] as const;

export const ALL_RESPONSE_VARIABLES = [...COMMON_VARIABLES, ...RESPONSE_ONLY_VARIABLES] as const;

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

export const NO_ARGS_BEHAVIORS = [
  'deny',
  'no_content',
  'deliver',
  'finish_request_phase',
  'forward_cookies',
  'optimize_images',
  'bypass_cache',
  'enable_gzip',
  'redirect_http_to_https',
] as const;

export const STRING_BEHAVIORS = ['redirect_to_301', 'redirect_to_302', 'rewrite_request'] as const;

export const ID_BEHAVIORS = ['run_function', 'set_cache_policy', 'set_connector', 'set_origin'] as const;

export const HEADER_BEHAVIORS = [
  'add_request_header',
  'add_response_header',
  'filter_request_header',
  'filter_response_header',
] as const;

export const COOKIE_BEHAVIORS = [
  'add_request_cookie',
  'filter_request_cookie',
  'set_cookie',
  'filter_response_cookie',
] as const;
