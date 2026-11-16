---
'@aziontech/builder': patch
---

Support building and running `azbundler dev` with Node.js 24. The esbuild node polyfills plugin now only handles the built-in modules that have an unenv alias, a polyfill or an external entry. Node.js 24 lists `node:test`, `node:test/reporters` and `node:sea` in `builtinModules`, they have nothing to resolve to and the build failed trying to read a file named after them. The `fs` polyfill used by `azbundler dev` now reads `F_OK`, `R_OK`, `W_OK` and `X_OK` from `fs.constants`, because Node.js 24 removed them from the top level of `fs`. The behavior on Node.js 22 does not change.
