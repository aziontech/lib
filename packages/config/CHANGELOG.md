# @aziontech/config

## 1.1.0

### Minor Changes

- [#476](https://github.com/aziontech/lib/pull/476) [`9b4e3cc`](https://github.com/aziontech/lib/commit/9b4e3cc6b7468e18338aceca466872770f59e92f) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Support multiple Azion API config versions (3 and 4) in the same packages.
  
  - `@aziontech/config`: configs can declare `version`. When omitted the default version (4) is used, so existing configs keep working. `processConfig`, `validateConfig`, `validateManifest` and `convertJsonConfigToObject` dispatch to the implementation of the declared version. New exports: `resolveApiVersion`, `resolvePresetConfig`, `getPresetApiVersions`, `getVersionModule`, the accessors `getApplicationName`, `getStorage` and `getFirewallReplacedKeys` (for data that each version keeps in a different place), `DEFAULT_API_VERSION`, `SUPPORTED_API_VERSIONS` and the `AzionConfigV3`, `AnyAzionConfig`, `ConfigByVersion`, `V3`, `ApiVersion` types. `defineConfig` is typed by the declared version.
  - `@aziontech/presets`: every preset that existed on the v3 line now also provides its v3 config in `configs[3]`. `config` remains the default (v4) config.

## 1.0.2

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

## 1.0.1

### Patch Changes

- [#439](https://github.com/aziontech/lib/pull/439) [`02193f2`](https://github.com/aziontech/lib/commit/02193f22e7d19bd673de0f94bebd12a0ae8e0f93) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - refactor(config): reorganize schemas and normalize firewall behavior shape
  - move schema files from helpers/ to a dedicated schemas/ directory
  - split monolithic schema into per-feature modules
  - rename set_waf_ruleset behavior to set_waf and update docs

## 1.0.0

### Major Changes

- [#427](https://github.com/aziontech/lib/pull/427) [`4ea507d`](https://github.com/aziontech/lib/commit/4ea507de946e0439e3554366155958040791129e) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - ci: first release

### Patch Changes

- Updated dependencies [[`4ea507d`](https://github.com/aziontech/lib/commit/4ea507de946e0439e3554366155958040791129e)]:
  - @aziontech/types@1.0.0
