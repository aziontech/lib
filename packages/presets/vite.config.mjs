import { createViteConfig } from '@aziontech/vite-config';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
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
      '@aziontech/unenv-preset',
      '@aziontech/utils',
      '@aziontech/config',
    ];

    return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
  },
  dts: {
    include: ['src/**/*', 'src/types.ts'],
    aliasesExclude: [/^azion\//],
  },
});
