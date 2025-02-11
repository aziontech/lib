import { BuildOptions, Plugin as ESBuildPlugin } from 'esbuild';
import { Configuration as WebpackConfig, WebpackPluginInstance } from 'webpack';

export type BundlerProviderCtx = WebpackConfig | BuildOptions;

export interface BundlerConfig {
  entry: string;
  polyfills?: boolean;
  worker?: boolean;
  extend?: <T extends BundlerProviderCtx>(context: T) => T;
  preset: {
    name: string;
  };
  contentToInject?: string;
  defineVars?: Record<string, string>;
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
  applyPolyfills: (ctx: BuildEnv) => (config: C) => (bundlerConfig: BundlerConfig) => C;
  applyAzionModule: (ctx: BuildEnv) => (config: C) => C;
}

export interface Plugin {
  (config: Record<string, unknown>): Record<string, unknown>;
}

export interface Bundler extends BundlerConfig {
  applyConfig: (baseConfig: BundlerProviderCtx) => BundlerProviderCtx;
  mergeConfig: (baseConfig?: BundlerProviderCtx) => BundlerProviderCtx;
  baseConfig: BundlerProviderCtx;
}

export interface WebpackBundler extends WebpackConfiguration {
  baseConfig: WebpackConfiguration;
  mergeConfig: (config: WebpackConfiguration) => WebpackConfiguration;
  applyConfig: (config: WebpackConfiguration) => WebpackConfiguration;
}
