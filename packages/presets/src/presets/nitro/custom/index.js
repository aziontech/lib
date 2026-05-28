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
      // Fix: seroval's switch(a) { case Object: } uses strict === which fails across V8 realms.
      // EdgeVM creates its own realm, so objects from the outer Node.js context have a
      // different Object constructor identity. Normalise it to the local Object before the switch.
      // const ssrBundlePath = resolve(
      //   nitro.options.output.serverDir,
      //   '_ssr',
      //   'ssr.mjs',
      // )
      // try {
      //   let ssrContent = await readFile(ssrBundlePath, 'utf-8')
      //   const pattern = /switch \((\w+)\) \{\n(\s+)case Object:/g
      //   let count = 0
      //   ssrContent = ssrContent.replace(pattern, (full, switchVar, indent) => {
      //     count++
      //     const normalizer =
      //       `if (${switchVar} != null && ${switchVar} !== Object && ${switchVar}.name === "Object") ${switchVar} = Object;\n` +
      //       `${indent}`
      //     return normalizer + full
      //   })
      //   if (count > 0) {
      //     await writeFile(ssrBundlePath, ssrContent)
      //     console.log(
      //       `[azion preset] Applied seroval cross-realm Object fix to _ssr/ssr.mjs (${count} patch(es))`,
      //     )
      //   } else {
      //     console.warn(
      //       '[azion preset] seroval switch (...) { case Object: pattern not found in _ssr/ssr.mjs',
      //     )
      //   }
      // } catch (e) {
      //   console.warn('[azion preset] Could not patch _ssr/ssr.mjs:', e.message)
      // }

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
