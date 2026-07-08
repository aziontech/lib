# @aziontech/presets

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
