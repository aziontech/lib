import { createViteConfig } from '@aziontech/vite-config';

export default createViteConfig({
  dirname: __dirname,
  ssr: true,
  entry: {
    index: 'src/index.ts',
    rules: 'src/rules/index.ts',
  },
  external: ['ajv', 'ajv-errors', 'ajv-keywords', 'mathjs'],
  dts: {
    aliasesExclude: [/^azion\//],
  },
});
