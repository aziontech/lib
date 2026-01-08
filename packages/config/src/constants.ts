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

export const RULE_VARIABLES = [...new Set([...ALL_REQUEST_VARIABLES, ...ALL_RESPONSE_VARIABLES])] as const;

// Adicionando as novas constantes do firewall
export const FIREWALL_BEHAVIOR_NAMES = [
  'deny',
  'drop',
  'set_rate_limit',
  'set_waf_ruleset',
  'run_function',
  'set_custom_response',
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

export const NETWORK_LIST_TYPES = ['ip_cidr', 'asn', 'countries'] as const;

export const WAF_MODE = ['learning', 'blocking', 'counting'] as const;
export const WAF_SENSITIVITY = ['lowest', 'low', 'medium', 'high', 'highest'] as const;

// WAF V4 Constants
export const WAF_ENGINE_VERSIONS = ['2021-Q3'] as const;

export const WAF_ENGINE_TYPES = ['score'] as const;

export const WAF_RULESETS = [1] as const;

export const WAF_THREAT_TYPES = [
  'cross_site_scripting',
  'directory_traversal',
  'evading_tricks',
  'file_upload',
  'identified_attack',
  'remote_file_inclusion',
  'sql_injection',
  'unwanted_access',
] as const;

export const FIREWALL_RULE_OPERATORS = [
  'is_equal',
  'is_not_equal',
  'starts_with',
  'does_not_start_with',
  'matches',
  'does_not_match',
  'exists',
  'does_not_exist',
  'is_in_list',
  'is_not_in_list',
] as const;

export const FIREWALL_RULE_CONDITIONALS = ['if', 'and', 'or'] as const;

export const FIREWALL_RATE_LIMIT_ARGUMENTS = {
  type: ['second', 'minute'],
  limit_by: ['client_ip', 'global'],
} as const;

// Novas constantes para Application
export const APPLICATION_DELIVERY_PROTOCOLS = ['http,https', 'http'] as const;
export const APPLICATION_TLS_VERSIONS = ['', 'tls_1_0', 'tls_1_1', 'tls_1_2', 'tls_1_3'] as const;
export const APPLICATION_SUPPORTED_CIPHERS = [
  'all',
  'TLSv1.2_2018',
  'TLSv1.2_2019',
  'TLSv1.2_2021',
  'TLSv1.3_2022',
] as const;
export const APPLICATION_HTTP_PORTS = [80, 8008, 8080] as const;
export const APPLICATION_HTTPS_PORTS = [443, 8443, 9440, 9441, 9442, 9443] as const;

// Constantes para Cache Settings V4
export const CACHE_BROWSER_SETTINGS = ['honor', 'override', 'no-cache'] as const;
export const CACHE_CDN_SETTINGS = ['honor', 'override'] as const;
export const CACHE_BY_QUERY_STRING = ['ignore', 'all', 'allowlist', 'denylist'] as const;
export const CACHE_BY_COOKIE = ['ignore', 'all', 'allowlist', 'denylist'] as const;
export const CACHE_ADAPTIVE_DELIVERY = ['ignore', 'allowlist'] as const;
export const CACHE_VARY_BY_METHOD = ['options', 'post'] as const;
export const TIERED_CACHE_TOPOLOGY = ['nearest-region', 'us-east-1', 'br-east-1'] as const;
export const CACHE_L2_REGION = [null, 'sa-brazil', 'na-united-states'] as const;

// Constantes para Build
export const BUILD_BUNDLERS = ['webpack', 'esbuild'] as const;

// Constantes para Storage
export const WORKLOADS_ACCESS_TYPES = ['read_only', 'read_write', 'restricted'] as const;

// Constantes para Origins
export const ORIGIN_TYPES = ['single_origin', 'load_balancer', 'live_ingest', 'object_storage'] as const;
export const ORIGIN_PROTOCOL_POLICIES = ['preserve', 'http', 'https'] as const;
export const LOAD_BALANCER_METHODS = ['ip_hash', 'least_connections', 'round_robin'] as const;

// Constantes para Rules V4
export const RULE_PHASES = ['request', 'response'] as const;

// Behaviors comuns (podem ser usados em request E response)
export const COMMON_RULE_BEHAVIORS = [
  'deliver',
  'redirect_to_301',
  'redirect_to_302',
  'enable_gzip',
  'run_function',
  'capture_match_groups',
] as const;

// Behaviors apenas para request phase
export const REQUEST_ONLY_BEHAVIORS = [
  'deny',
  'no_content',
  'finish_request_phase',
  'forward_cookies',
  'optimize_images',
  'bypass_cache',
  'filter_request_cookie',
  'set_origin',
  'redirect_http_to_https',
  'set_connector',
  'set_cache_policy',
  'rewrite_request',
  'add_request_header',
  'filter_request_header',
  'add_request_cookie',
] as const;

// Behaviors apenas para response phase
export const RESPONSE_ONLY_BEHAVIORS = [
  'filter_response_cookie',
  'set_cookie',
  'add_response_header',
  'filter_response_header',
] as const;

// Union types para facilitar o uso
export const REQUEST_RULE_BEHAVIORS = [...COMMON_RULE_BEHAVIORS, ...REQUEST_ONLY_BEHAVIORS] as const;
export const RESPONSE_RULE_BEHAVIORS = [...COMMON_RULE_BEHAVIORS, ...RESPONSE_ONLY_BEHAVIORS] as const;
export const ALL_RULE_BEHAVIORS = [
  ...COMMON_RULE_BEHAVIORS,
  ...REQUEST_ONLY_BEHAVIORS,
  ...RESPONSE_ONLY_BEHAVIORS,
] as const;

// Behaviors sem argumentos
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

// Behaviors com string value
export const STRING_BEHAVIORS = ['redirect_to_301', 'redirect_to_302', 'rewrite_request'] as const;

// Behaviors com ID value
export const ID_BEHAVIORS = ['run_function', 'set_cache_policy', 'set_connector', 'set_origin'] as const;

// Behaviors de header
export const HEADER_BEHAVIORS = [
  'add_request_header',
  'add_response_header',
  'filter_request_header',
  'filter_response_header',
] as const;

// Behaviors de cookie
export const COOKIE_BEHAVIORS = [
  'add_request_cookie',
  'filter_request_cookie',
  'set_cookie',
  'filter_response_cookie',
] as const;

// Workload Constants V4
export const WORKLOAD_INFRASTRUCTURE = [1, 2] as const;

export const WORKLOAD_TLS_CIPHERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const WORKLOAD_TLS_VERSIONS = ['', 'tls_1_0', 'tls_1_1', 'tls_1_2', 'tls_1_3'] as const;

export const WORKLOAD_MTLS_VERIFICATION = ['enforce', 'permissive'] as const;

export const WORKLOAD_HTTP_VERSIONS = ['http1', 'http2'] as const;

// Constantes para Connector V4
export const EDGE_CONNECTOR_TYPES = ['http', 'storage', 'live_ingest'] as const;
export const EDGE_CONNECTOR_DNS_RESOLUTION = ['both', 'force_ipv4'] as const;
export const EDGE_CONNECTOR_TRANSPORT_POLICY = ['preserve', 'force_https', 'force_http'] as const;
export const EDGE_CONNECTOR_HTTP_VERSION_POLICY = ['http1_1'] as const;
export const EDGE_CONNECTOR_LOAD_BALANCE_METHOD = ['round_robin', 'least_conn', 'ip_hash'] as const;
export const EDGE_CONNECTOR_HMAC_TYPE = ['aws4_hmac_sha256'] as const;

// Functions V4 Constants
export const EDGE_FUNCTION_RUNTIMES = ['azion_js'] as const;

export const EDGE_FUNCTION_EXECUTION_ENVIRONMENTS = ['application', 'firewall'] as const;

// Custom Pages V4 Constants
export const CUSTOM_PAGE_ERROR_CODES = [
  'default',
  '400',
  '401',
  '403',
  '404',
  '405',
  '406',
  '408',
  '409',
  '410',
  '411',
  '414',
  '415',
  '416',
  '426',
  '429',
  '431',
  '500',
  '501',
  '502',
  '503',
  '504',
  '505',
] as const;

export const CUSTOM_PAGE_TYPES = ['page_connector'] as const;
