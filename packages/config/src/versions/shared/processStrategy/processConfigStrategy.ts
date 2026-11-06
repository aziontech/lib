/**
 * ProcessConfigStrategy
 * @class ProcessConfigStrategy
 * @description Base class of the process config strategies. `TConfig` is the config shape of the API version.
 */
class ProcessConfigStrategy<TConfig> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformToManifest(config: any, context: any) {
    return context;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  transformToConfig(payload: any, transformedPayload: TConfig): TConfig | any {
    return payload;
  }
}

export default ProcessConfigStrategy;
