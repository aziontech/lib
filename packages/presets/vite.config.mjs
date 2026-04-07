import { createViteConfig } from '@aziontech/vite-config';
import { resolve } from 'path';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  alias: {
    '@aziontech/unenv-preset': resolve(__dirname, '../unenv-preset/src/'),
    '@aziontech/utils/edge': resolve(__dirname, '../utils/src/edge/'),
    '@aziontech/utils/node': resolve(__dirname, '../utils/src/node/'),
    '@aziontech/utils': resolve(__dirname, '../utils/src/'),
    '@aziontech/config': resolve(__dirname, '../config/src/'),
    '@aziontech/config/rules': resolve(__dirname, '../config/src/rules/'),
    '@aziontech/presets': resolve(__dirname, '../presets/src/'),
    '@aziontech/builder': resolve(__dirname, '../builder/src/'),
    '@aziontech/types': resolve(__dirname, '../types/src/'),
  },
  external: (id) => {
    if (id.includes('node_modules')) return true;

    const deps = [
      './build/module',
      './.wasm-bindgen/azion_rust_edge_function.js',
      './.wasm-bindgen/azion_rust_edge_function_bg.wasm',
      'signale',
      'fast-glob',
      'mime-types',
      'fs',
      'fs/promises',
      'path',
      'cookie',
    ];

    return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
  },
  dts: {
    include: ['src/**/*', 'src/types.ts'],
    aliasesExclude: [/^azion\//],
  },
});
