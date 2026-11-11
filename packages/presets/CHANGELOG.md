# @aziontech/presets

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
