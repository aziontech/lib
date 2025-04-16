/* eslint-disable @typescript-eslint/no-explicit-any */
import ProcessConfigStrategy from '../processConfigStrategy';

export type LocalConfig = {
  version?: string;
  environment?: string;
  timestamp?: string;
  // outras configurações que quisermos adicionar
};

class LocalProcessConfigStrategy extends ProcessConfigStrategy {
  private localConfig: LocalConfig;

  constructor(localConfig?: LocalConfig) {
    super();
    this.localConfig = {
      version: localConfig?.version || '1.0.0',
      environment: localConfig?.environment || process.env.NODE_ENV || 'development',
      timestamp: localConfig?.timestamp || new Date().toISOString(),
    };
  }

  transformToManifest(_config: unknown, transformedPayload: any) {
    transformedPayload.local = this.localConfig;
    return transformedPayload.local;
  }

  transformToConfig() {
    return;
  }
}

export default LocalProcessConfigStrategy;
