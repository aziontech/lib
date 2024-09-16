import { AzionConfig } from '../../types';
import ProcessConfigStrategy from './processConfigStrategy';

/**
 * ProcessConfigContext
 * @class
 * @description This class is responsible for generating the context of the process config.
 */
class ProcessConfigContext {
  strategies: { [key: string]: ProcessConfigStrategy };
  constructor() {
    this.strategies = {};
  }

  setStrategy(type: string, strategy: ProcessConfigStrategy): void {
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

export default ProcessConfigContext;
