import { AzionConfig, AzionConnector, ConnectorType } from '../../../types';
import ConnectorProcessConfigStrategy from './connectorProcessConfigStrategy';

describe('ConnectorProcessConfigStrategy', () => {
    let strategy: ConnectorProcessConfigStrategy;

    beforeEach(() => {
        strategy = new ConnectorProcessConfigStrategy();
    });

    describe('transformToManifest', () => {
        it('should return undefined when no connectors are provided', () => {
            const config: AzionConfig = {};
            const result = strategy.transformToManifest(config);
            expect(result).toBeUndefined();
        });

        it('should return undefined when connectors array is empty', () => {
            const config: AzionConfig = { connectors: [] };
            const result = strategy.transformToManifest(config);
            expect(result).toBeUndefined();
        });

        it('should transform a storage connector to manifest format', () => {
            const config: AzionConfig = {
                connectors: [
                    {
                        name: 'my-storage-connector',
                        active: true,
                        type: 'storage',
                        attributes: {
                            bucket: 'my-bucket',
                            prefix: 'my-prefix',
                        },
                    } as AzionConnector,
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toEqual([
                {
                    name: 'my-storage-connector',
                    active: true,
                    type: 'storage',
                    attributes: {
                        bucket: 'my-bucket',
                        prefix: 'my-prefix',
                    },
                },
            ]);
        });

        it('should transform an HTTP connector to manifest format with default values', () => {
            const config: AzionConfig = {
                connectors: [
                    {
                        name: 'my-http-connector',
                        active: true,
                        type: 'http' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    address: 'example.com',
                                },
                            ],
                            connectionOptions: {},
                        },
                    } as AzionConnector,
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toEqual([
                {
                    name: 'my-http-connector',
                    active: true,
                    type: 'http' as ConnectorType,
                    attributes: {
                        addresses: [
                            {
                                active: true,
                                address: 'example.com',
                                http_port: 80,
                                https_port: 443,
                                modules: null,
                            },
                        ],
                        connection_options: {
                            dns_resolution: 'preserve',
                            transport_policy: 'preserve',
                            http_version_policy: 'http1_1',
                            host: '${host}',
                            path_prefix: '',
                            following_redirect: false,
                            real_ip_header: 'X-Real-IP',
                            real_port_header: 'X-Real-PORT',
                        },
                        modules: {
                            load_balancer: {
                                enabled: false,
                                config: null,
                            },
                            origin_shield: {
                                enabled: false,
                                config: null,
                            },
                        },
                    },
                },
            ]);
        });

        it('should transform an HTTP connector with complete configuration', () => {
            const config: AzionConfig = {
                connectors: [
                    {
                        name: 'complete-http-connector',
                        active: true,
                        type: 'http' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    active: true,
                                    address: 'api.example.com',
                                    httpPort: 8080,
                                    httpsPort: 8443,
                                    modules: {
                                        // Add any address-specific modules if needed
                                    },
                                },
                            ],
                            connectionOptions: {
                                dnsResolution: 'force_ipv4',
                                transportPolicy: 'force_https',
                                httpVersionPolicy: 'http1_1',
                                host: 'custom-host.com',
                                pathPrefix: '/api',
                                followingRedirect: true,
                                realIpHeader: 'X-Forwarded-For',
                                realPortHeader: 'X-Forwarded-Port',
                            },
                            modules: {
                                loadBalancer: {
                                    enabled: true,
                                    config: {
                                        method: 'ip_hash',
                                        maxRetries: 3,
                                        connectionTimeout: 30,
                                        readWriteTimeout: 60,
                                    },
                                },
                                originShield: {
                                    enabled: true,
                                    config: {
                                        originIpAcl: {
                                            enabled: true,
                                        },
                                        hmac: {
                                            enabled: true,
                                            config: {
                                                type: 'aws4_hmac_sha256',
                                                attributes: {
                                                    region: 'us-east-1',
                                                    service: 's3',
                                                    accessKey: 'ACCESS_KEY',
                                                    secretKey: 'SECRET_KEY',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    } as AzionConnector,
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toEqual([
                {
                    name: 'complete-http-connector',
                    active: true,
                    type: 'http' as ConnectorType,
                    attributes: {
                        addresses: [
                            {
                                active: true,
                                address: 'api.example.com',
                                http_port: 8080,
                                https_port: 8443,
                                modules: {},
                            },
                        ],
                        connection_options: {
                            dns_resolution: 'force_ipv4',
                            transport_policy: 'force_https',
                            http_version_policy: 'http1_1',
                            host: 'custom-host.com',
                            path_prefix: '/api',
                            following_redirect: true,
                            real_ip_header: 'X-Forwarded-For',
                            real_port_header: 'X-Forwarded-Port',
                        },
                        modules: {
                            load_balancer: {
                                enabled: true,
                                config: {
                                    method: 'ip_hash',
                                    max_retries: 3,
                                    connection_timeout: 30,
                                    read_write_timeout: 60,
                                },
                            },
                            origin_shield: {
                                enabled: true,
                                config: {
                                    origin_ip_acl: {
                                        enabled: true,
                                    },
                                    hmac: {
                                        enabled: true,
                                        config: {
                                            type: 'aws4_hmac_sha256',
                                            attributes: {
                                                region: 'us-east-1',
                                                service: 's3',
                                                access_key: 'ACCESS_KEY',
                                                secret_key: 'SECRET_KEY',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ]);
        });

        it('should transform a live_ingest connector to manifest format', () => {
            const config: AzionConfig = {
                connectors: [
                    {
                        name: 'my-live-ingest-connector',
                        active: true,
                        type: 'live_ingest' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    address: 'stream.example.com',
                                    httpPort: 1935,
                                    httpsPort: 443,
                                },
                            ],
                            connectionOptions: {
                                dnsResolution: 'preserve',
                                transportPolicy: 'preserve',
                            },
                        },
                    } as AzionConnector,
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toEqual([
                {
                    name: 'my-live-ingest-connector',
                    active: true,
                    type: 'live_ingest' as ConnectorType,
                    attributes: {
                        addresses: [
                            {
                                active: true,
                                address: 'stream.example.com',
                                http_port: 1935,
                                https_port: 443,
                                modules: null,
                            },
                        ],
                        connection_options: {
                            dns_resolution: 'preserve',
                            transport_policy: 'preserve',
                            http_version_policy: 'http1_1',
                            host: '${host}',
                            path_prefix: '',
                            following_redirect: false,
                            real_ip_header: 'X-Real-IP',
                            real_port_header: 'X-Real-PORT',
                        },
                        modules: {
                            load_balancer: {
                                enabled: false,
                                config: null,
                            },
                            origin_shield: {
                                enabled: false,
                                config: null,
                            },
                        },
                    },
                },
            ]);
        });

        it('should transform multiple connectors of different types', () => {
            const config: AzionConfig = {
                connectors: [
                    {
                        name: 'storage-connector',
                        type: 'storage' as ConnectorType,
                        attributes: {
                            bucket: 'my-bucket',
                            prefix: 'my-prefix',
                        },
                    } as AzionConnector,
                    {
                        name: 'http-connector',
                        type: 'http' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    address: 'api.example.com',
                                },
                            ],
                            connectionOptions: {},
                        },
                    } as AzionConnector,
                ],
            };

            const result = strategy.transformToManifest(config);

            expect(result).toHaveLength(2);
            expect(result![0].name).toBe('storage-connector');
            expect(result![0].type).toBe('storage' as ConnectorType);
            expect(result![1].name).toBe('http-connector');
            expect(result![1].type).toBe('http' as ConnectorType);
        });
    });

    describe('transformToConfig', () => {
        it('should return undefined when no connectors are provided', () => {
            const payload = {};
            const transformedPayload: AzionConfig = {};
            const result = strategy.transformToConfig(payload, transformedPayload);
            expect(result).toBeUndefined();
        });

        it('should return undefined when connectors array is empty', () => {
            const payload = { connectors: [] };
            const transformedPayload: AzionConfig = {};
            const result = strategy.transformToConfig(payload, transformedPayload);
            expect(result).toBeUndefined();
        });

        it('should transform a storage connector manifest to config format', () => {
            const payload = {
                connectors: [
                    {
                        name: 'my-storage-connector',
                        active: true,
                        type: 'storage' as ConnectorType,
                        attributes: {
                            bucket: 'my-bucket',
                            prefix: 'my-prefix',
                        },
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            expect(result).toEqual([
                {
                    name: 'my-storage-connector',
                    active: true,
                    type: 'storage' as ConnectorType,
                    attributes: {
                        bucket: 'my-bucket',
                        prefix: 'my-prefix',
                    },
                },
            ]);
            expect(transformedPayload.connectors).toEqual([
                {
                    name: 'my-storage-connector',
                    active: true,
                    type: 'storage' as ConnectorType,
                    attributes: {
                        bucket: 'my-bucket',
                        prefix: 'my-prefix',
                    },
                },
            ]);
        });

        it('should transform an HTTP connector manifest to config format', () => {
            const payload = {
                connectors: [
                    {
                        name: 'my-http-connector',
                        active: true,
                        type: 'http' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    active: true,
                                    address: 'example.com',
                                    http_port: 80,
                                    https_port: 443,
                                    modules: null,
                                },
                            ],
                            connection_options: {
                                dns_resolution: 'preserve',
                                transport_policy: 'preserve',
                                http_version_policy: 'http1_1',
                                host: '${host}',
                                path_prefix: '',
                                following_redirect: false,
                                real_ip_header: 'X-Real-IP',
                                real_port_header: 'X-Real-PORT',
                            },
                            modules: {
                                load_balancer: {
                                    enabled: false,
                                    config: null,
                                },
                                origin_shield: {
                                    enabled: false,
                                    config: null,
                                },
                            },
                        },
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            const httpConnector = result![0] as AzionConnector;
            expect(httpConnector.name).toBe('my-http-connector');
            expect(httpConnector.type).toBe('http');

            // Type assertion to access HTTP connector specific attributes
            const httpAttributes = httpConnector.attributes as import('../../../types').ConnectorHttpAttributes;
            expect(httpAttributes.addresses[0].address).toBe('example.com');
            expect(httpAttributes.addresses[0].httpPort).toBe(80);
            expect(httpAttributes.addresses[0].httpsPort).toBe(443);
            expect(httpAttributes.connectionOptions.dnsResolution).toBe('preserve');
            expect(transformedPayload.connectors).toEqual(result);
        });

        it('should transform an HTTP connector with complete configuration', () => {
            const payload = {
                connectors: [
                    {
                        name: 'complete-http-connector',
                        active: true,
                        type: 'http' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    active: true,
                                    address: 'api.example.com',
                                    http_port: 8080,
                                    https_port: 8443,
                                    modules: {},
                                },
                            ],
                            connection_options: {
                                dns_resolution: 'force_ipv4',
                                transport_policy: 'force_https',
                                http_version_policy: 'http1_1',
                                host: 'custom-host.com',
                                path_prefix: '/api',
                                following_redirect: true,
                                real_ip_header: 'X-Forwarded-For',
                                real_port_header: 'X-Forwarded-Port',
                            },
                            modules: {
                                load_balancer: {
                                    enabled: true,
                                    config: {
                                        method: 'ip_hash',
                                        max_retries: 3,
                                        connection_timeout: 30,
                                        read_write_timeout: 60,
                                    },
                                },
                                origin_shield: {
                                    enabled: true,
                                    config: {
                                        origin_ip_acl: {
                                            enabled: true,
                                        },
                                        hmac: {
                                            enabled: true,
                                            config: {
                                                type: 'aws4_hmac_sha256',
                                                attributes: {
                                                    region: 'us-east-1',
                                                    service: 's3',
                                                    access_key: 'ACCESS_KEY',
                                                    secret_key: 'SECRET_KEY',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            const httpConnector = result![0] as AzionConnector;
            expect(httpConnector.name).toBe('complete-http-connector');
            expect(httpConnector.type).toBe('http');

            // Type assertion to access HTTP connector specific attributes
            const httpAttributes = httpConnector.attributes as import('../../../types').ConnectorHttpAttributes;
            expect(httpAttributes.addresses[0].address).toBe('api.example.com');
            expect(httpAttributes.addresses[0].httpPort).toBe(8080);
            expect(httpAttributes.addresses[0].httpsPort).toBe(8443);
            expect(httpAttributes.connectionOptions.dnsResolution).toBe('force_ipv4');
            expect(httpAttributes.connectionOptions.transportPolicy).toBe('force_https');
            expect(httpAttributes.connectionOptions.host).toBe('custom-host.com');
            expect(httpAttributes.connectionOptions.pathPrefix).toBe('/api');
            expect(httpAttributes.connectionOptions.followingRedirect).toBe(true);
            expect(httpAttributes.modules?.loadBalancer.enabled).toBe(true);
            expect(httpAttributes.modules?.loadBalancer.config?.method).toBe('ip_hash');
            expect(httpAttributes.modules?.loadBalancer.config?.maxRetries).toBe(3);
            expect(httpAttributes.modules?.originShield.enabled).toBe(true);
            expect(httpAttributes.modules?.originShield.config?.hmac?.enabled).toBe(true);
            expect(httpAttributes.modules?.originShield.config?.hmac?.config?.attributes.accessKey).toBe('ACCESS_KEY');
        });

        it('should transform a live_ingest connector manifest to config format', () => {
            const payload = {
                connectors: [
                    {
                        name: 'my-live-ingest-connector',
                        active: true,
                        type: 'live_ingest' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    active: true,
                                    address: 'stream.example.com',
                                    http_port: 1935,
                                    https_port: 443,
                                    modules: null,
                                },
                            ],
                            connection_options: {
                                dns_resolution: 'preserve',
                                transport_policy: 'preserve',
                                http_version_policy: 'http1_1',
                                host: '${host}',
                                path_prefix: '',
                                following_redirect: false,
                                real_ip_header: 'X-Real-IP',
                                real_port_header: 'X-Real-PORT',
                            },
                            modules: {
                                load_balancer: {
                                    enabled: false,
                                    config: null,
                                },
                                origin_shield: {
                                    enabled: false,
                                    config: null,
                                },
                            },
                        },
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            const liveIngestConnector = result![0] as AzionConnector;
            expect(liveIngestConnector.name).toBe('my-live-ingest-connector');
            expect(liveIngestConnector.type).toBe('live_ingest');

            // Type assertion to access live_ingest connector specific attributes
            const liveIngestAttributes = liveIngestConnector.attributes as import('../../../types').ConnectorLiveIngestAttributes;
            expect(liveIngestAttributes.addresses[0].address).toBe('stream.example.com');
            expect(liveIngestAttributes.addresses[0].httpPort).toBe(1935);
            expect(liveIngestAttributes.addresses[0].httpsPort).toBe(443);
            expect(transformedPayload.connectors).toEqual(result);
        });

        it('should transform multiple connectors of different types', () => {
            const payload = {
                connectors: [
                    {
                        name: 'storage-connector',
                        type: 'storage' as ConnectorType,
                        attributes: {
                            bucket: 'my-bucket',
                            prefix: 'my-prefix',
                        },
                    },
                    {
                        name: 'http-connector',
                        type: 'http' as ConnectorType,
                        attributes: {
                            addresses: [
                                {
                                    address: 'api.example.com',
                                    http_port: 80,
                                    https_port: 443,
                                },
                            ],
                            connection_options: {
                                dns_resolution: 'preserve',
                                transport_policy: 'preserve',
                                http_version_policy: 'http1_1',
                            },
                            modules: {
                                load_balancer: {
                                    enabled: false,
                                    config: null,
                                },
                                origin_shield: {
                                    enabled: false,
                                    config: null,
                                },
                            },
                        },
                    },
                ],
            };
            const transformedPayload: AzionConfig = {};

            const result = strategy.transformToConfig(payload, transformedPayload);

            expect(result).toHaveLength(2);
            expect(result![0].name).toBe('storage-connector');
            expect(result![0].type).toBe('storage' as ConnectorType);
            expect(result![1].name).toBe('http-connector');
            expect(result![1].type).toBe('http' as ConnectorType);
            expect(transformedPayload.connectors).toEqual(result);
        });

        it('should handle existing connectors in transformedPayload', () => {
            const payload = {
                connectors: [
                    {
                        name: 'new-connector',
                        type: 'storage' as ConnectorType,
                        attributes: {
                            bucket: 'new-bucket',
                            prefix: 'new-prefix',
                        },
                    },
                ],
            };
            const transformedPayload: AzionConfig = {
                connectors: [
                    {
                        name: 'existing-connector',
                        type: 'storage' as ConnectorType,
                        attributes: {
                            bucket: 'existing-bucket',
                            prefix: 'existing-prefix',
                        },
                    } as AzionConnector,
                ],
            };

            strategy.transformToConfig(payload, transformedPayload);

            // The transformToConfig method replaces the existing connectors array
            expect(transformedPayload.connectors).toHaveLength(1);
            expect(transformedPayload.connectors![0].name).toBe('new-connector');
        });
    });
});
