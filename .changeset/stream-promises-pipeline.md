---
'@aziontech/unenv-preset': patch
'@aziontech/builder': patch
---

Fix `[unenv] stream.promises.pipeline is not implemented yet!` when running a Next.js server action. Next.js reads the body of a server action with `pipeline` from `node:stream/promises`, and unenv only has stubs for it. In `@aziontech/unenv-preset`, `node:stream/promises` now uses the `promises` of the runtime `node:stream` when it has them, and otherwise builds `pipeline` and `finished` on the callback versions (the `end` option is not supported). In `@aziontech/builder`, the stream context used by `azbundler dev` now passes `pipeline`, `finished` and `promises` of the host `node:stream`, and the `node:stream` and `node:stream/promises` polyfills export them. `azbundler dev` needs a version of `@aziontech/bundler` that uses this `@aziontech/builder`.
