---
'@aziontech/unenv-preset': minor
'@aziontech/builder': patch
---

Do not fail the build when the code imports `node:test`, `node:test/reporters` or `node:sea`, the Node.js 24 development modules that have no polyfill. `@aziontech/unenv-preset` now has stubs for them, in the same way as the other APIs the runtime does not provide: they throw `[azion] <api> is not implemented yet!` when called, not when imported, and `sea.isSea()` returns `false`. In `@aziontech/builder`, the built-in modules that exist only with the `node:` prefix (`node:test`, `node:sea`, `node:sqlite`...) are matched only with the prefix, so an npm package named `test`, `sea` or `sqlite` is not taken as a built-in module, and the same modules are handled on Node.js 22 and 24. In the `fs` polyfill, `mkdtempDisposable`, `mkdtempDisposableSync` and `Utf8Stream` now use the ones of the runtime when it has them, and no longer fail when the runtime defines them as getters.
