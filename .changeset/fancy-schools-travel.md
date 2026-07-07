---
'@aziontech/unenv-preset': patch
'@aziontech/builder': patch
'@aziontech/config': patch
'@aziontech/presets': patch
---

security(deps): remediate pnpm audit vulnerabilities

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
