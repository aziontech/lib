import {
  ApiApplication,
  ApiBaseApplicationPayload,
  ApiListApplicationsParams,
  ApiUpdateApplicationPayload,
  DeliveryProtocol,
  HttpPort,
  HttpsPort,
  SupportedCiphers,
  TlsVersion,
} from './services/types';

export type AzionApplicationSettings = ApiApplication;

export {
  ApiBaseApplicationPayload,
  ApiListApplicationsParams,
  ApiUpdateApplicationPayload,
  DeliveryProtocol,
  HttpPort,
  HttpsPort,
  SupportedCiphers,
  TlsVersion,
};
