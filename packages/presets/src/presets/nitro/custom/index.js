import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default {
  extends: 'base-worker',
  entry: fileURLToPath(new URL('./runtime/azion-module.js', import.meta.url)),
  output: {
    publicDir: '{{ output.dir }}/public/{{ baseURL }}',
  },
  exportConditions: ['workerd', 'worker'],
  minify: false,
  commands: {
    preview: 'azion dev -p 3000',
    deploy: 'azion deploy --local',
  },
  rollupConfig: {
    output: {
      format: 'esm',
      exports: 'named',
      inlineDynamicImports: false,
    },
    plugins: [
      {
        name: 'azion-resolve-from-project',
        resolveId(id) {
          if (id.startsWith('nitro/')) {
            try {
              return createRequire(resolve(process.cwd(), 'package.json')).resolve(id);
              // eslint-disable-next-line no-empty
            } catch {}
          }
        },
      },
    ],
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
