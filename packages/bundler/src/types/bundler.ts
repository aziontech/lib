import { BuildOptions, Plugin as ESBuildPlugin } from 'esbuild';
import { Configuration, Configuration as WebpackConfig, WebpackPluginInstance } from 'webpack';

export type ConfigObject = WebpackConfig & {
  [key: string]: unknown;
  plugins?: unknown[];
  entry?: string | string[];
};

export interface bundlerConfig {
  entry: string;
  polyfills?: boolean;
  worker?: boolean;
  custom?: ConfigObject;
  localCustom?: ConfigObject;
  preset: {
    name: string;
  };
  contentToInject?: string;
  defineVars?: Record<string, string>;
}

export interface BundlerConfig {
  bundlerConfig: bundlerConfig;
  customConfigPreset: ConfigObject;
  customConfigLocal: ConfigObject;
}

export interface BuildEnv {
  production: boolean;
  output: string;
}

export interface WebpackPluginClasses {
  NodePolyfillsPlugin: new (isProduction: boolean) => WebpackPluginInstance;
  AzionPolyfillsPlugin: new (isProduction: boolean) => WebpackPluginInstance;
}

export interface ESBuildPluginClasses {
  NodePolyfillsPlugin: (isProduction: boolean) => ESBuildPlugin;
  AzionPolyfillsPlugin: (isProduction: boolean) => ESBuildPlugin;
}

export interface WebpackConfiguration extends WebpackConfig {
  plugins?: WebpackPluginInstance[];
  banner?: {
    js?: string;
  };
}

export type ESBuildConfiguration = {
  plugins?: ESBuildPlugin[];
} & BuildOptions & {
    banner?: {
      js?: string;
    };
  };

export type BundlerConfiguration = WebpackConfiguration | ESBuildConfiguration;

export interface BundlerPluginFunctions<C extends BundlerConfiguration> {
  applyPolyfills: (ctx: BuildEnv) => (config: C) => (bundlerConfig: bundlerConfig) => C;
  applyAzionModule: (ctx: BuildEnv) => (config: C) => C;
}

export interface Plugin {
  (config: Record<string, unknown>): Record<string, unknown>;
}

export interface Bundler extends BundlerConfig {
  applyConfig: (baseConfig: ConfigObject) => ConfigObject;
  mergeConfig: (baseConfig?: ConfigObject) => ConfigObject;
  baseConfig: ConfigObject;
}

export interface WebpackBundler extends Configuration {
  baseConfig: Configuration;
  mergeConfig: (config: Configuration) => Configuration;
  applyConfig: (config: Configuration) => Configuration;
}
