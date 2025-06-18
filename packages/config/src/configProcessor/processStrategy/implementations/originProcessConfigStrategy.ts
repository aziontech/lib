import { AzionConfig, AzionOrigin } from '../../../types';
import ProcessConfigStrategy from '../processConfigStrategy';

/**
 * OriginProcessConfigStrategy
 * @class OriginProcessConfigStrategy
 * @description This class is implementation of the Origin ProcessConfig Strategy.
 */
class OriginProcessConfigStrategy extends ProcessConfigStrategy {
  transformToManifest(config: AzionConfig) {
    const payload: AzionOrigin[] = [];
    if (!Array.isArray(config?.origin) || config?.origin.length === 0) {
      return;
    }
    const originsType = ['single_origin', 'object_storage', 'load_balancer', 'live_ingest'];
    config?.origin.forEach((origin) => {
      if (originsType.indexOf(origin.type) === -1) {
        throw new Error(`Rule setOrigin originType '${origin.type}' is not supported`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originSetting: any = {
        id: origin.id,
        key: origin.key,
        name: origin.name,
        origin_type: origin.type,
      };

      if (origin.type !== 'object_storage') {
        if (origin.path === '/') {
          throw new Error('Origin path cannot be "/". Please use empty string or "/path"');
        }
        originSetting.origin_path = origin.path || '';
        originSetting.origin_protocol_policy = origin.protocolPolicy || 'preserve';
        originSetting.method = origin.method || 'ip_hash';
        originSetting.is_origin_redirection_enabled = origin.redirection ?? false;
        originSetting.connection_timeout = origin.connectionTimeout || 60;
        originSetting.timeout_between_bytes = origin.timeoutBetweenBytes || 120;

        if (origin.addresses && origin.addresses.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const addresses: any[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          origin?.addresses.forEach((address: any) => {
            if (typeof address === 'string') {
              addresses.push({
                address,
              });
              return;
            }
            if (address?.weight < 0 || address?.weight > 10) {
              throw new Error(`When origin type is ${origin.type}, weight must be between 0 and 10`);
            }
            addresses.push(address);
          });
          originSetting.addresses = addresses;
        } else {
          throw new Error(`When origin type is ${origin.type}, addresses is required`);
        }

        originSetting.host_header = origin.hostHeader || '${host}';
        if (origin?.hmac) {
          originSetting.hmac_authentication = true;
          originSetting.hmac_region_name = origin.hmac?.region;
          originSetting.hmac_access_key = origin.hmac?.accessKey;
          originSetting.hmac_secret_key = origin.hmac?.secretKey;
        }
      } else if (origin.type === 'object_storage') {
        originSetting.bucket = origin.bucket;
        originSetting.prefix = origin.prefix || '';
      }

      payload.push(originSetting);
    });
    return payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToConfig(payload: any, transformedPayload: AzionConfig) {
    const config = payload.origin;
    if (!Array.isArray(config) || config.length === 0) {
      return;
    }
    transformedPayload.origin = [];
    const originsType = ['single_origin', 'object_storage', 'load_balancer', 'live_ingest'];
    config.forEach((origin) => {
      if (originsType.indexOf(origin.origin_type) === -1) {
        throw new Error(`originType '${origin.origin_type}' is not supported`);
      }
      const originSetting: AzionOrigin = {
        id: origin.id,
        key: origin.key,
        name: origin.name,
        type: origin.origin_type,
      };

      if (originSetting.type !== 'object_storage') {
        if (origin.path === '/') {
          throw new Error('Origin path cannot be "/". Please use empty string or "/path"');
        }
        originSetting.path = origin.origin_path;
        originSetting.protocolPolicy = origin.origin_protocol_policy;
        originSetting.method = origin.method;
        originSetting.redirection = origin.is_origin_redirection_enabled ?? false;
        originSetting.connectionTimeout = origin.connection_timeout;
        originSetting.timeoutBetweenBytes = origin.timeout_between_bytes;
        originSetting.addresses = origin.addresses;
        originSetting.hostHeader = origin.host_header;
        if (origin.hmac_authentication) {
          originSetting.hmac = {
            region: origin.hmac_region_name,
            accessKey: origin.hmac_access_key,
            secretKey: origin.hmac_secret_key,
          };
        }
      } else if (originSetting.type === 'object_storage') {
        originSetting.bucket = origin.bucket;
        originSetting.prefix = origin.prefix;
      }

      transformedPayload.origin!.push(originSetting);
    });
    return transformedPayload.origin;
  }
}

export default OriginProcessConfigStrategy;
