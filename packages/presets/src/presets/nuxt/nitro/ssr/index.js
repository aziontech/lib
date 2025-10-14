import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'pathe';

export default {
  extends: 'base-worker',
  entry: fileURLToPath(new URL('./entry.js', import.meta.url)),
  minify: false,
  commands: {
    preview: 'azion dev',
    deploy: 'azion deploy --local',
  },
  rollupConfig: {
    output: {
      format: 'esm',
      exports: 'named',
      inlineDynamicImports: false,
    },
  },
  wasm: {
    lazy: false,
    esmImport: true,
  },
  hooks: {
    async compiled(nitro) {
      await writeFile(
        resolve(nitro.options.output.dir, 'package.json'),
        JSON.stringify({ private: true, main: './server/index.mjs' }, null, 2),
      );
      await writeFile(
        resolve(nitro.options.output.dir, 'package-lock.json'),
        JSON.stringify({ lockfileVersion: 1 }, null, 2),
      );
    },
  },
};
