---
'@aziontech/builder': patch
---

The `fs` polyfill used by `azbundler dev` now exports `mkdtempDisposableSync` and `Utf8Stream`, the Node.js 24 APIs it does not provide. They throw `[azion] <api> is not implemented yet!` when called, the same error as the production polyfill, instead of `(void 0) is not a function`.
