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

export const WORKLOAD_INFRASTRUCTURE = [1, 2] as const;

export const WORKLOAD_TLS_CIPHERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const WORKLOAD_TLS_VERSIONS = ['', 'tls_1_0', 'tls_1_1', 'tls_1_2', 'tls_1_3'] as const;

export const WORKLOAD_MTLS_VERIFICATION = ['enforce', 'permissive'] as const;

export const WORKLOAD_HTTP_VERSIONS = ['http1', 'http2', 'http3'] as const;

export const ENVIRONMENT_LOG_VERBOSITY = ['normal', 'verbose'] as const;

export const ENVIRONMENT_ROBOTS_POLICIES = ['index', 'noindex', 'respect_origin'] as const;

export const ENVIRONMENT_BRANCH_TRACKING_MODES = ['branch_is', 'branch_starts_with', 'branch_ends_with'] as const;

export const DEPLOYMENT_POLICIES = ['single_version', 'versioned_urls'] as const;

export const DEPLOYMENT_BINDING_POLICIES = ['STRICT', 'FLEXIBLE'] as const;

export const WORKLOADS_ACCESS_TYPES = ['read_only', 'read_write', 'restricted'] as const;

export const CONNECTOR_TYPES = ['http', 'storage', 'live_ingest'] as const;

export const CONNECTOR_DNS_RESOLUTION = ['both', 'force_ipv4', 'force_ipv6'] as const;

export const CONNECTOR_TRANSPORT_POLICY = ['preserve', 'force_https', 'force_http'] as const;

export const CONNECTOR_HTTP_VERSION_POLICY = ['http1_1'] as const;

export const CONNECTOR_LOAD_BALANCE_METHOD = ['round_robin', 'least_conn', 'ip_hash'] as const;

export const CONNECTOR_SERVER_ROLES = ['primary', 'backup'] as const;

export const CONNECTOR_HMAC_TYPE = ['aws4_hmac_sha256'] as const;

export const CONNECTOR_LIVE_INGEST_REGIONS = ['us-east-1', 'us-east-2', 'br-east-1', 'br-east-2', 'br-east-3'] as const;
