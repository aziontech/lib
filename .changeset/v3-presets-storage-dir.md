---
'@aziontech/presets': patch
---

The v3 config of the presets that serve static files now declares the `dir` of its `object_storage` origin (for example `./www` for html and `./.edge/assets` for react), the same directory the v4 config declares in `storage[].dir`. The bundler copies that directory to `.edge/storage` for a v3 project, instead of reading it from the v4 config.
