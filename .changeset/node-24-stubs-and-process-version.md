---
'@aziontech/unenv-preset': minor
'@aziontech/builder': patch
---

Add stubs for the Node.js 24 APIs that unenv does not cover yet. In `@aziontech/unenv-preset`: `perf_hooks.timerify` (returns the function as it is) and `perf_hooks.eventLoopUtilization` (all idle), `url.URLPattern` (the runtime `URLPattern` global when it has one), `v8.startCpuProfile`, `worker_threads.locks` (`navigator.locks` when available) and, in the `fs` polyfill, `mkdtempDisposable`, `mkdtempDisposableSync` and `Utf8Stream`. The ones that cannot work throw `[azion] <api> is not implemented yet!` when called, not when imported. `process.versions.node` in the `process` polyfill changes from `18.3.1` to `22.23.4`, so libraries that check the Node.js version no longer take the Node.js 18 path. In `@aziontech/builder`, the `crypto` polyfill used by `azbundler dev` now also exports `argon2`, `argon2Sync`, `encapsulate` and `decapsulate`, which are `undefined` on a host without them.
