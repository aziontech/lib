import type { BuildConfiguration, BuildContext } from 'azion/config';
import { BuildOptions as ESBuildConfig, Plugin as ESBuildPlugin } from 'esbuild';
import { Configuration as WebpackConfig, WebpackPluginInstance } from 'webpack';

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
} & ESBuildConfig & {
    banner?: {
      js?: string;
    };
  };

export type BundlerProviderConfig = WebpackConfiguration | ESBuildConfiguration;

export interface BundlerPluginFunctions<C extends BundlerProviderConfig> {
  applyPolyfills: (ctx: BuildContext) => (config: C) => (buildConfiguration: BuildConfiguration) => C;
  applyAzionModule: (ctx: BuildContext) => (config: C) => C;
}

export interface Plugin {
  (config: Record<string, unknown>): Record<string, unknown>;
}
