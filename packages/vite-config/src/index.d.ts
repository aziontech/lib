import { UserConfig } from 'vite';

export interface ViteConfigOptions {
  /**
   * __dirname of the package
   */
  dirname: string;
  
  /**
   * Entry points (default: { index: 'src/index.ts' })
   */
  entry?: string | Record<string, string>;
  
  /**
   * Resolve aliases
   */
  alias?: Record<string, string>;
  
  /**
   * External dependencies (array or function)
   */
  external?: string[] | ((id: string) => boolean);
  
  /**
   * Enable SSR mode (default: false)
   */
  ssr?: boolean;
  
  /**
   * DTS plugin options override
   */
  dts?: {
    include?: string[];
    exclude?: string[];
    rollupTypes?: boolean;
    aliasesExclude?: RegExp[];
    [key: string]: any;
  };
  
  /**
   * Enable sourcemap (default: false)
   */
  sourcemap?: boolean;
  
  /**
   * Additional build options
   */
  buildOptions?: Record<string, any>;
}

/**
 * Creates a Vite config for library packages
 */
export function createViteConfig(options: ViteConfigOptions): UserConfig;
