# Custom Preset

A custom preset is an object you pass to `build.preset` in your `azion.config`, instead of a preset name. Use it to change what a built-in preset generates or to describe your own build.

```js
// azion.config.cjs
module.exports = {
  build: {
    preset: {/* custom preset */},
  },
};
```

## Preset shape

| Property    | Required | Description                                                                                                     |
| ----------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `metadata`  | yes      | `{ name, ext? }`. `name` identifies the preset and `ext` is the extension of the generated file (default `js`). |
| `config`    | yes      | The azion.config of the default API version (v4).                                                               |
| `configs`   | no       | One azion.config per API version: `{ 3: {...}, 4: {...}, 6: {...} }`.                                           |
| `handler`   | no       | Built-in handler of the preset. When set, it is used instead of your entry.                                     |
| `prebuild`  | no       | `(buildConfig, ctx) => Promise<void \| AzionPrebuildResult>`. Runs before the build.                            |
| `postbuild` | no       | `(buildConfig, ctx) => Promise<void>`. Runs after the build.                                                    |

Other properties are not allowed in the preset.

## Which config is used

The API version of the project (`version` in the `azion.config`, or `--config-version`) selects the config of the preset:

1. `configs[version]`, when it exists.
2. `config`, only when the version is the default one (v4).

A preset without a config for the version of the project fails with `Preset "<name>" does not support config version <version>`. So, for a project that uses `version: 3`, the preset needs `configs[3]`.

When the preset has `configs`, `config` is not checked against the schema of the version of your file, so it can be a v4 config in a v3 `azion.config`.

## Example: change a built-in preset

Spread the built-in preset and override only what you need. This example changes the function of the v3 config:

```js
// azion.config.cjs
const { javascript } = require('@aziontech/presets');

module.exports = {
  version: 3,
  build: {
    preset: {
      ...javascript,
      metadata: { name: 'my-preset', ext: 'js' },
      configs: {
        ...javascript.configs,
        3: {
          ...javascript.configs[3],
          functions: [
            {
              name: 'my-javascript-function',
              path: './functions/handler.js',
              args: { env: 'edge' },
            },
          ],
        },
      },
    },
  },
};
```

> Keep in mind that the rules of the preset refer to the functions by name. If you rename a function, change the rules that run it too, otherwise the build fails with `Function "<name>" referenced in rule "<rule>" is not defined in the functions array`.

## Example: preset with a prebuild

```js
// azion.config.cjs
const { javascript } = require('@aziontech/presets');

module.exports = {
  build: {
    entry: 'index.js',
    preset: {
      metadata: { name: 'my-preset' },
      config: javascript.config,
      prebuild: async (buildConfig, ctx) => {
        console.log('Running my prebuild');
      },
    },
  },
};
```

`prebuild` can return an `AzionPrebuildResult` (`filesToInject`, `injection` and `bundler` settings) to change what goes into the bundle.

## Entry and `functions[].path`

The name of the file generated for a function comes from the `entry`, and `functions[].path` is relative to the `.edge` folder. They have to match: `entry: 'index.js'` generates `./functions/index.js`.

When they do not match, the build fails and shows both:

```
functions[0].path  "./functions/handler.js"
build.entry        "index.js" (generates "./functions/index.js")
```

- With `--entry` and no `azion.config`, the generated `azion.config` already has the right `functions[].path`.
- An existing `azion.config` is never changed by the build. Adjust `build.entry` and `functions[].path` in it.

## Manifest

The `config` and `configs` of the preset are inputs of the build, and they are not written to the manifest. Only `build.preset.metadata` is.
