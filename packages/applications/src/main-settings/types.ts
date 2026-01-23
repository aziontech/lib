import type {
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

export type {
  ApiBaseApplicationPayload,
  ApiListApplicationsParams,
  ApiUpdateApplicationPayload,
  DeliveryProtocol,
  HttpPort,
  HttpsPort,
  SupportedCiphers,
  TlsVersion,
};
