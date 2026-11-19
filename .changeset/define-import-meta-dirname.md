---
'@aziontech/builder': patch
---

The esbuild node polyfills plugin now also defines `import.meta.dirname` and `import.meta.filename` at build time, next to `import.meta.url`. SvelteKit 3 reads `import.meta.dirname` in its server code, the value stayed in the bundle and `azbundler dev` failed with `Cannot use 'import.meta' outside a module`.
