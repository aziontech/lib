# v3 golden fixtures

`golden/<preset>.input.json` is the evaluated `config.ts` of each preset on the `1.20.x` branch
(the original v3 line of this repository). `golden/<preset>.manifest.json` is the manifest produced
by the **original** `1.20.x` `validateConfig` + `processConfig` for that input.

`golden.test.ts` asserts that the v3 implementation ported into `versions/v3` produces the same
manifests, which guards the port against behaviour drift.

The fixtures are frozen on purpose: do not regenerate them from this code base.

## Intentional differences from 1.20.x

The fixtures are the 1.20.x output with two deliberate, uniform changes, so that the preset configs follow the
`index.js` convention of the bundler (the generated function is always `.edge/functions/index.js`):

- `functions[].path` is `./functions/index.js` (it was `.edge/functions/handler.js`);
- presets whose source entry is not `index.*` declare it as `entry: { index: '<source file>' }`, which keeps the source
  file and names the output `index.js` (opennextjs). javascript, typescript, emscripten and rustwasm default to `index.js` / `index.ts`, like v4.

- `nuxt` does not declare `build.polyfills`, as its v4 config.
- `emscripten` uses `bundler: 'webpack'`, as its v4 config (its `extend` is a webpack configuration).

Everything else is exactly what the original implementation produced.
