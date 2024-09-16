import { AzionConfig, AzionOrigin } from '../../../types';
import ManifestStrategy from '../manifestStrategy';

/**
 * OriginManifestStrategy
 * @class OriginManifestStrategy
 * @description This class is implementation of the Origin Manifest Strategy.
 */
class OriginManifestStrategy extends ManifestStrategy {
  generate(config: AzionConfig) {
    const payload: AzionOrigin[] = [];
    if (!Array.isArray(config?.origin) || config?.origin.length === 0) {
      return payload;
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
        originSetting.is_origin_redirection_enabled = origin.redirection || false;
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
}

export default OriginManifestStrategy;
