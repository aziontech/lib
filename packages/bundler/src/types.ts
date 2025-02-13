import type { AzionBuild } from 'azion/config';
import { BuildOptions, Plugin as ESBuildPlugin } from 'esbuild';
import { Configuration as WebpackConfig, WebpackPluginInstance } from 'webpack';

export type BuildConfiguration = {
  config: AzionBuild & {
    extend?: <T extends WebpackConfig | BuildOptions | unknown = WebpackConfig | BuildOptions | unknown>(
      context: T,
    ) => T;
  };
  extras?: BundlerConfig;
};

export interface BundlerConfig {
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
  define?: Record<string, string>;
}

export type ESBuildConfiguration = {
  plugins?: ESBuildPlugin[];
  define?: Record<string, string>;
} & BuildOptions & {
    banner?: {
      js?: string;
    };
  };

export type BundlerProviderConfig = WebpackConfiguration | ESBuildConfiguration;

export interface BundlerPluginFunctions<C extends BundlerProviderConfig> {
  applyPolyfills: (ctx: BuildEnv) => (config: C) => (buildConfiguration: BuildConfiguration) => C;
  applyAzionModule: (ctx: BuildEnv) => (config: C) => C;
}

export interface Plugin {
  (config: Record<string, unknown>): Record<string, unknown>;
}
