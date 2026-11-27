# @aziontech/unenv-preset

## 1.2.0

### Minor Changes

- [#507](https://github.com/aziontech/lib/pull/507) [`2c206a1`](https://github.com/aziontech/lib/commit/2c206a1c22c85c0753dfadaebe5d539ebf469364) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Add the runtime polyfills that frameworks such as Next.js 16.2 and 16.4 need on the Azion runtime, so the adapters do not have to carry them. `Buffer.prototype.indexOf` and `lastIndexOf` (and so `includes`) accept a `Uint8Array`. `setImmediate` returns a Node-like `Immediate` (`ref()`, `unref()`, `hasRef()`) and `clearImmediate` cancels it, while the native `Immediate` is kept on a host that has one. `process.nextTick` runs the callback as a microtask (it uses `setTimeout` only when `queueMicrotask` is not available). `AsyncLocalStorage.snapshot()` and `AsyncLocalStorage.bind()` are implemented as static methods, replacing the pass-through `snapshot` of the `async-storage` polyfill. `reportError` is defined when the runtime does not have it. `queueMicrotask` is defined when the runtime does not have it (`ReferenceError: queueMicrotask is not defined`), so the callback runs as a microtask, errors thrown by it are reported and `process.nextTick` can use it. `performance.timeOrigin` follows `Date.now()` when the runtime value is not an epoch time, so `timeOrigin + now()` is a real time (it replaces the unused temporary `performance` proxy). The `setImmediate`, `reportError` and `queueMicrotask` polyfills are added to the `inject` of the preset and the `performance` entry now points to the new polyfill, which still loads `unenv/polyfill/performance` first. `@aziontech/builder` and `@aziontech/presets` are released as minor because they depend on the exact version of `@aziontech/unenv-preset`: a patch release would bring these polyfills to every project that already accepts `~1.0.x` of the builder or `~1.4.x` of the presets, without opting in.

## 1.1.0

### Minor Changes

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Do not fail the build when the code imports `node:test`, `node:test/reporters` or `node:sea`, the Node.js 24 development modules that have no polyfill. `@aziontech/unenv-preset` now has stubs for them, in the same way as the other APIs the runtime does not provide: they throw `[azion] <api> is not implemented yet!` when called, not when imported, and `sea.isSea()` returns `false`. In `@aziontech/builder`, the built-in modules that exist only with the `node:` prefix (`node:test`, `node:sea`, `node:sqlite`...) are matched only with the prefix, so an npm package named `test`, `sea` or `sqlite` is not taken as a built-in module, and the same modules are handled on Node.js 22 and 24. In the `fs` polyfill, `mkdtempDisposable`, `mkdtempDisposableSync` and `Utf8Stream` now use the ones of the runtime when it has them, and no longer fail when the runtime defines them as getters.

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Add stubs for the Node.js 24 APIs that unenv does not cover yet. In `@aziontech/unenv-preset`: `perf_hooks.timerify` (returns the function as it is) and `perf_hooks.eventLoopUtilization` (all idle), `url.URLPattern` (the runtime `URLPattern` global when it has one), `v8.startCpuProfile`, `worker_threads.locks` (`navigator.locks` when available) and, in the `fs` polyfill, `mkdtempDisposable`, `mkdtempDisposableSync` and `Utf8Stream`. The ones that cannot work throw `[azion] <api> is not implemented yet!` when called, not when imported. `process.versions.node` in the `process` polyfill changes from `18.3.1` to `22.23.4`, so libraries that check the Node.js version no longer take the Node.js 18 path. In `@aziontech/builder`, the `crypto` polyfill used by `azbundler dev` now also exports `argon2`, `argon2Sync`, `encapsulate` and `decapsulate`, which are `undefined` on a host without them.

### Patch Changes

- [#500](https://github.com/aziontech/lib/pull/500) [`02eb4af`](https://github.com/aziontech/lib/commit/02eb4aff9d356f9319825061f7ef5e90a8066047) Thanks [@jose-filho-azion](https://github.com/jose-filho-azion)! - Fix `[unenv] stream.promises.pipeline is not implemented yet!` when running a Next.js server action. Next.js reads the body of a server action with `pipeline` from `node:stream/promises`, and unenv only has stubs for it. In `@aziontech/unenv-preset`, `node:stream/promises` now uses the `promises` of the runtime `node:stream` when it has them, and otherwise builds `pipeline` and `finished` on the callback versions (the `end` option is not supported). In `@aziontech/builder`, the stream context used by `azbundler dev` now passes `pipeline`, `finished` and `promises` of the host `node:stream`, and the `node:stream` and `node:stream/promises` polyfills export them. `azbundler dev` needs a version of `@aziontech/bundler` that uses this `@aziontech/builder`.

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

- [#436](https://github.com/aziontech/lib/pull/436) [`2c00e76`](https://github.com/aziontech/lib/commit/2c00e76822078e5d5e4d7681c70e0c8f15be9eb6) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - feat: add nitro preset

## 1.0.0

### Major Changes

- [#427](https://github.com/aziontech/lib/pull/427) [`4ea507d`](https://github.com/aziontech/lib/commit/4ea507de946e0439e3554366155958040791129e) Thanks [@jcbsfilho](https://github.com/jcbsfilho)! - ci: first release
