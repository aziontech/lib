# v3 golden fixtures

`golden/<preset>.input.json` is the evaluated `config.ts` of each preset on the `1.20.x` branch
(the original v3 line of this repository). `golden/<preset>.manifest.json` is the manifest produced
by the **original** `1.20.x` `validateConfig` + `processConfig` for that input.

`golden.test.ts` asserts that the v3 implementation ported into `versions/v3` produces the same
manifests, which guards the port against behaviour drift.

The fixtures are frozen on purpose: do not regenerate them from this code base.

## Intentional differences from 1.20.x

The fixtures are the 1.20.x output with a few deliberate changes, so that the preset configs match what the bundler
generates:

- `functions[].path` is relative to `.edge` and is the file the bundler generates, which is named after the entry:
  `./functions/handler.js` for the presets with a built-in handler and no entry (next, nuxt, svelte) and for javascript
  and typescript, whose v3 entry is `handler.js` / `handler.ts`; `./functions/worker.js` for opennextjs (entry
  `.open-next/worker.js`); `./functions/index.js` for the others. It was `.edge/functions/handler.js` for all.
- `emscripten` and `rustwasm` default to the entry `index.js`, as in v4.
- `nuxt` does not declare `build.polyfills`, as its v4 config.
- `emscripten` uses `bundler: 'webpack'`, as its v4 config (its `extend` is a webpack configuration).

Everything else is exactly what the original implementation produced.
