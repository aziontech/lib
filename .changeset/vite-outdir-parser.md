---
'@aziontech/presets': patch
---

Fix the `vue`, `react` and `preact` presets ignoring `build.outDir` from `vite.config` when the file is formatted with double quotes, trailing commas or `build` as the last property. The config was read with a regex and `JSON.parse`, which failed silently and fell back to `dist`, so the prebuild tried to copy a folder that did not exist. The `outDir` is now read by a tolerant parser shared by the three presets, and the prebuild fails with a clear message when the build output folder is not found.
