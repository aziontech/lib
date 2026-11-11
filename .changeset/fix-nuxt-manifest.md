---
'@aziontech/presets': patch
---

Fix the `nuxt` preset prebuild reading a stale or missing manifest. Nuxt >= 4.6 builds into `node_modules/.cache/nuxt/.nuxt` when `.nuxt` already exists, so `.nuxt/manifest/meta` is no longer reliable. The manifest is now read from `.output/public/_nuxt/builds/meta` first, then from the cache dir and `.nuxt`, picking the file that `latest.json` references.
