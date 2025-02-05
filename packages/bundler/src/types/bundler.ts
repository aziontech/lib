export type ConfigObject = {
  [key: string]: unknown;
  plugins?: unknown[];
  entry?: string | string[];
};

export interface BuilderConfig {
  entry: string;
  polyfills?: boolean;
  worker?: boolean;
  custom?: ConfigObject;
  localCustom?: ConfigObject;
  preset?: unknown;
  contentToInject?: string;
  defineVars?: Record<string, string>;
}

export interface BundlerConfig {
  builderConfig: BuilderConfig;
  customConfigPreset: ConfigObject;
  customConfigLocal: ConfigObject;
}

export interface Plugin {
  (config: Record<string, unknown>): Record<string, unknown>;
}

export interface Bundler extends BundlerConfig {
  applyConfig: (baseConfig: ConfigObject) => ConfigObject;
  mergeConfig: (baseConfig?: ConfigObject) => ConfigObject;
  baseConfig: ConfigObject;
}
