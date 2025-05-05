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
  'tag_event',
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

export type CommonVariable = (typeof COMMON_VARIABLES)[number];
export type RequestVariable = (typeof ALL_REQUEST_VARIABLES)[number];
export type ResponseVariable = (typeof ALL_RESPONSE_VARIABLES)[number];
export type RuleOperatorWithValue = (typeof RULE_OPERATORS_WITH_VALUE)[number];
export type RuleOperatorWithoutValue = (typeof RULE_OPERATORS_WITHOUT_VALUE)[number];
export type RuleConditional = (typeof RULE_CONDITIONALS)[number];

// Criar um tipo utilitário para gerar as versões com ${}
type WithDollarBraces<T extends string> = `\${${T}}` | T;

// Criar um tipo para variáveis dinâmicas
type DynamicVariable =
  | `arg_${string}`
  | `cookie_${string}`
  | `http_${string}`
  | `sent_http_${string}`
  | `upstream_cookie_${string}`
  | `upstream_http_${string}`;

// Modificar a definição do tipo RuleVariable para incluir variáveis dinâmicas
export type RuleVariable =
  | WithDollarBraces<(typeof RULE_VARIABLES)[number]>
  | DynamicVariable
  | WithDollarBraces<DynamicVariable>;

export type FirewallBehaviorName = (typeof FIREWALL_BEHAVIOR_NAMES)[number];
export type FirewallRateLimitType = (typeof FIREWALL_RATE_LIMIT_TYPES)[number];
export type FirewallRateLimitBy = (typeof FIREWALL_RATE_LIMIT_BY)[number];
export type FirewallWafMode = (typeof FIREWALL_WAF_MODES)[number];
export type FirewallVariable = (typeof FIREWALL_VARIABLES)[number];

export const NETWORK_LIST_TYPES = ['ip_cidr', 'asn', 'countries'] as const;
export type NetworkListType = (typeof NETWORK_LIST_TYPES)[number];

export const WAF_MODE = ['learning', 'blocking', 'counting'] as const;
export type WafMode = (typeof WAF_MODE)[number];
export const WAF_SENSITIVITY = ['low', 'medium', 'high'] as const;
export type WafSensitivity = (typeof WAF_SENSITIVITY)[number];

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

export type FirewallRuleOperator = (typeof FIREWALL_RULE_OPERATORS)[number];
export type FirewallRuleConditional = (typeof FIREWALL_RULE_CONDITIONALS)[number];

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

// Tipos para as novas constantes
export type ApplicationDeliveryProtocol = (typeof APPLICATION_DELIVERY_PROTOCOLS)[number];
export type ApplicationTlsVersion = (typeof APPLICATION_TLS_VERSIONS)[number];
export type ApplicationSupportedCipher = (typeof APPLICATION_SUPPORTED_CIPHERS)[number];
export type ApplicationHttpPort = (typeof APPLICATION_HTTP_PORTS)[number];
export type ApplicationHttpsPort = (typeof APPLICATION_HTTPS_PORTS)[number];

// Novas constantes para Cache Settings
export const CACHE_BROWSER_SETTINGS = ['honor', 'override'] as const;
export const CACHE_CDN_SETTINGS = ['honor', 'override'] as const;
export const CACHE_BY_QUERY_STRING = ['ignore', 'whitelist', 'blacklist', 'all'] as const;
export const CACHE_BY_COOKIE = ['ignore', 'whitelist', 'blacklist', 'all'] as const;
export const CACHE_ADAPTIVE_DELIVERY = ['ignore', 'whitelist'] as const;
export const CACHE_L2_REGION = [null, 'sa-brazil', 'na-united-states'] as const;

// Tipos para as novas constantes
export type CacheBrowserSetting = (typeof CACHE_BROWSER_SETTINGS)[number];
export type CacheCdnSetting = (typeof CACHE_CDN_SETTINGS)[number];
export type CacheByQueryString = (typeof CACHE_BY_QUERY_STRING)[number];
export type CacheByCookie = (typeof CACHE_BY_COOKIE)[number];
export type CacheAdaptiveDelivery = (typeof CACHE_ADAPTIVE_DELIVERY)[number];
export type CacheL2Region = (typeof CACHE_L2_REGION)[number];

// Constantes para Origins
export const ORIGIN_TYPES = ['single_origin', 'load_balancer', 'live_ingest', 'object_storage'] as const;
export const ORIGIN_PROTOCOL_POLICIES = ['preserve', 'http', 'https'] as const;
export const LOAD_BALANCER_METHODS = ['ip_hash', 'least_connections', 'round_robin'] as const;

// Tipos para Origins
export type OriginType = (typeof ORIGIN_TYPES)[number];
export type OriginProtocolPolicy = (typeof ORIGIN_PROTOCOL_POLICIES)[number];
export type LoadBalancerMethod = (typeof LOAD_BALANCER_METHODS)[number];

// Constantes para Rules
export const RULE_PHASES = ['request', 'response'] as const;

export const RULE_BEHAVIOR_NAMES = [
  'add_request_cookie',
  'add_request_header',
  'add_response_header',
  'bypass_cache_phase',
  'capture_match_groups',
  'deliver',
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
  'rewrite_request',
  'run_function',
  'set_cache_policy',
  'set_cookie',
  'set_origin',
] as const;

// Tipos para Rules
export type RulePhase = (typeof RULE_PHASES)[number];
export type RuleBehaviorName = (typeof RULE_BEHAVIOR_NAMES)[number];

// =============================== API V4 =============================== //
// =============================== Workloads =============================== //
// Constantes para Workloads
export const WORKLOAD_NETWORK_MAPS = ['1', '2'] as const; // 1 - Edge Global Network, 2 - Staging Network
export const WORKLOAD_TLS_MINIMUM_VERSIONS = ['', 'tls_1_0', 'tls_1_1', 'tls_1_2', 'tls_1_3'] as const;
export const WORKLOAD_HTTP_VERSIONS = ['http1', 'http2'] as const;

// Tipos para Workloads
export type WorkloadNetworkMap = (typeof WORKLOAD_NETWORK_MAPS)[number];
export type WorkloadTlsMinimumVersion = (typeof WORKLOAD_TLS_MINIMUM_VERSIONS)[number];
export type WorkloadHttpVersion = (typeof WORKLOAD_HTTP_VERSIONS)[number];
