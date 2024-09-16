import { AzionConfig } from '../../types';
import ManifestStrategy from './manifestStrategy';

/**
 * ManifestContext
 * @class
 * @description This class is responsible for generating the context of the manifest.
 */
class ManifestContext {
  strategies: { [key: string]: ManifestStrategy };
  constructor() {
    this.strategies = {};
  }

  setStrategy(type: string, strategy: ManifestStrategy): void {
    this.strategies[type] = strategy;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(config: AzionConfig, context: any) {
    Object.keys(this.strategies).forEach((key) => {
      context[key] = this.strategies[key].generate(config, context);
    });
    return context;
  }
}

export default ManifestContext;
