# @aziontech/presets

## 1.4.0

### Minor Changes

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Support SvelteKit 3 in the `svelte` preset. SvelteKit 3 removed `builder.generateManifest` in favour of `builder.generateServerInstance` and deprecated `config.kit` (the config is now flat). The preset now detects which one the adapter receives and generates a `manifest.js` with the same shape for both (`server`, `assets`, `server_assets`, `app_path`, `prerendered` and `base_path`), and the worker reads from it instead of building the `Server` itself. SvelteKit 2 keeps working.

### Patch Changes

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - The svelte preset now finds the Azion adapter in `vite.config.*` as well as in `svelte.config.*`. SvelteKit 3 accepts the kit options, including `adapter`, directly in the Vite config, and the prebuild only looked at `svelte.config.*`. Without a `svelte.config.*` it concluded that no adapter was set and fell back to the static MPA handler, so `azbundler dev` failed with `ENOENT ... index.html` instead of running the SvelteKit worker. The first config file that declares an adapter is used.

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - The v3 config of the presets that serve static files now declares the `dir` of its `object_storage` origin (for example `./www` for html and `./.edge/assets` for react), the same directory the v4 config declares in `storage[].dir`. The bundler copies that directory to `.edge/storage` for a v3 project, instead of reading it from the v4 config.

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Fix the `vue`, `react` and `preact` presets ignoring `build.outDir` from `vite.config` when the file is formatted with double quotes, trailing commas or `build` as the last property. The config was read with a regex and `JSON.parse`, which failed silently and fell back to `dist`, so the prebuild tried to copy a folder that did not exist. The `outDir` is now read by a tolerant parser shared by the three presets, and the prebuild fails with a clear message when the build output folder is not found.
- Updated dependencies [[`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047), [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047), [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047), [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047), [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047), [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047)]:
  - @aziontech/config@1.2.1
  - @aziontech/unenv-preset@1.1.0

## 1.3.1

### Patch Changes

- [#501](https://github.com/aziontech/lib/pull/501) [`4fe1f01`](https://github.com/aziontech/lib/commit/4fe1f012fcaeaf76cf1c4b6ab36cc0da171ec534) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Fix the `vue`, `react`, `preact`, `qwik`, `vitepress`, `vuepress` and `angular` presets leaving the storage folder empty (or with the build nested in a subfolder, for `angular`) when building with `--skip-framework-build`. The prebuild now copies the output of the previous framework build (`outDir` from the Vite config, `dist`, `build` for CRA, or the VitePress/VuePress `dist`) into `.edge/assets` instead of only creating the folder. The `angular` preset moves a plain `ng build` output (`dist/<project>` or `dist/<project>/browser`) to the `dist` root, like the regular build does. The `vuepress` preset no longer deletes its previous build output in this mode.

## 1.3.0

### Minor Changes

- [#490](https://github.com/aziontech/lib/pull/490) [`40d1833`](https://github.com/aziontech/lib/commit/40d1833f00b49760cf2622fc8095e809784e1d4e) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Support the Azion API v6 config in the same packages.
  
  - `@aziontech/config`: a config with `version: 6` is now validated and processed into a v6 manifest. v3 and v4 are unchanged, and a config without `version` is still the v4 one. v6 changes the publishing model: Save creates a Draft version and publishing is a separate step, so the config declares `environments` and `deployments` (the environment and deployment policies are required) and workloads with `bindings` (a binding references an environment and a deployment by name). Adds the build, applications (rules, cache settings, function instances and device groups), functions (with bindings), purge, storage, connectors, firewall, WAF, network lists and custom pages. `validateConfig`, `processConfig`, `validateManifest` and `convertJsonConfigToObject` accept v6, and `defineConfig` types the config as `AzionConfigV6`. The v3 and v4 manifests now carry the API version. The v6 API has no `active` in its resources, so the v6 config and manifest do not have it, and the `createSPARules` and `createMPARules` helpers no longer write `active: true` (it is the default of the v4 and v3 rules).
  - `@aziontech/presets`: every preset now provides its v6 config in `configs[6]` (`nitro` has no v3 config, as it did not exist on v3). `config` remains the default (v4) config.

### Patch Changes

- [#490](https://github.com/aziontech/lib/pull/490) [`40d1833`](https://github.com/aziontech/lib/commit/40d1833f00b49760cf2622fc8095e809784e1d4e) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Fix the `nuxt` preset prebuild reading a stale or missing manifest. Nuxt >= 4.6 builds into `node_modules/.cache/nuxt/.nuxt` when `.nuxt` already exists, so `.nuxt/manifest/meta` is no longer reliable. The manifest is now read from `.output/public/_nuxt/builds/meta` first, then from the cache dir and `.nuxt`, picking the file that `latest.json` references.

- [#490](https://github.com/aziontech/lib/pull/490) [`40d1833`](https://github.com/aziontech/lib/commit/40d1833f00b49760cf2622fc8095e809784e1d4e) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Fix the regex of the "Redirect to index.html for Subpaths" rule of the `nuxt`, `svelte` and `nitro` presets (v4 and v6 configs). It matched files such as `/logo.png` and skipped the paths without extension such as `/about`, because of `[sS]*` (instead of `[\s\S]*`) and an unescaped `.`. It now matches only the paths that do not end with `/` and have no file extension.
- Updated dependencies [[`40d1833`](https://github.com/aziontech/lib/commit/40d1833f00b49760cf2622fc8095e809784e1d4e)]:
  - @aziontech/config@1.2.0

## 1.2.0

### Minor Changes

- [#476](https://github.com/aziontech/lib/pull/476) [`9b4e3cc`](https://github.com/aziontech/lib/commit/9b4e3cc6b7468e18338aceca466872770f59e92f) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Support multiple Azion API config versions (3 and 4) in the same packages.
  
  - `@aziontech/config`: configs can declare `version`. When omitted the default version (4) is used, so existing configs keep working. `processConfig`, `validateConfig`, `validateManifest` and `convertJsonConfigToObject` dispatch to the implementation of the declared version. New exports: `resolveApiVersion`, `resolvePresetConfig`, `getPresetApiVersions`, `getVersionModule`, the accessors `getApplicationName`, `getStorage` and `getFirewallReplacedKeys` (for data that each version keeps in a different place), `DEFAULT_API_VERSION`, `SUPPORTED_API_VERSIONS` and the `AzionConfigV3`, `AnyAzionConfig`, `ConfigByVersion`, `V3`, `ApiVersion` types. `defineConfig` is typed by the declared version.
  - `@aziontech/presets`: every preset that existed on the v3 line now also provides its v3 config in `configs[3]`. `config` remains the default (v4) config.

### Patch Changes

- Updated dependencies [[`9b4e3cc`](https://github.com/aziontech/lib/commit/9b4e3cc6b7468e18338aceca466872770f59e92f)]:
  - @aziontech/config@1.1.0

## 1.1.2

### Patch Changes

- [#457](https://github.com/aziontech/lib/pull/457) [`e238045`](https://github.com/aziontech/lib/commit/e238045f140735db285a3efd7b4ffcff28e62b0c) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - security(deps): remediate pnpm audit vulnerabilities
  - bump vite to ^7.3.6, fixing high-severity dev-server path traversal
    and arbitrary file read advisories (GHSA-v2wj-q39q-566r, GHSA-p9ff-h696-f583)
  - add pnpm.overrides forcing patched versions of transitive deps flagged
    by pnpm audit: undici, lodash, postcss, fast-uri, qs, esbuild,
    brace-expansion, js-yaml, @babel/core and
    @babel/plugin-transform-modules-systemjs
  - bump direct deps lodash-es and tmp to their patched releases in
    builder/config packages
  - drop unused crypto-browserify polyfill dependency from unenv-preset
  - replace ip-cidr with ipaddr.js for CIDR matching in the network-list
    polyfill
  - replace @fastly/http-compute-js with fetch-to-node (same API, zero
    dependencies) in the Next.js 12.3.x custom server preset, removing
    @fastly/js-compute and the unfixed decompress vulnerability pulled in
    transitively via @bytecodealliance/weval

- Updated dependencies [[`e238045`](https://github.com/aziontech/lib/commit/e238045f140735db285a3efd7b4ffcff28e62b0c)]:
  - @aziontech/unenv-preset@1.0.2
  - @aziontech/config@1.0.2

## 1.1.1

### Patch Changes

- Updated dependencies [[`02193f2`](https://github.com/aziontech/lib/commit/02193f22e7d19bd673de0f94bebd12a0ae8e0f93)]:
  - @aziontech/config@1.0.1

## 1.1.0

### Minor Changes

- [#436](https://github.com/aziontech/lib/pull/436) [`2c00e76`](https://github.com/aziontech/lib/commit/2c00e76822078e5d5e4d7681c70e0c8f15be9eb6) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - feat: add nitro preset

### Patch Changes

- Updated dependencies [[`2c00e76`](https://github.com/aziontech/lib/commit/2c00e76822078e5d5e4d7681c70e0c8f15be9eb6)]:
  - @aziontech/unenv-preset@1.0.1

## 1.0.0

### Major Changes

- [#427](https://github.com/aziontech/lib/pull/427) [`4ea507d`](https://github.com/aziontech/lib/commit/4ea507de946e0439e3554366155958040791129e) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - ci: first release

### Patch Changes

- Updated dependencies [[`4ea507d`](https://github.com/aziontech/lib/commit/4ea507de946e0439e3554366155958040791129e)]:
  - @aziontech/unenv-preset@1.0.0
  - @aziontech/config@1.0.0
  - @aziontech/types@1.0.0
  - @aziontech/utils@1.0.0
