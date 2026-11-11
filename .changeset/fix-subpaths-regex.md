---
'@aziontech/presets': patch
---

Fix the regex of the "Redirect to index.html for Subpaths" rule of the `nuxt`, `svelte` and `nitro` presets (v4 and v6 configs). It matched files such as `/logo.png` and skipped the paths without extension such as `/about`, because of `[sS]*` (instead of `[\s\S]*`) and an unescaped `.`. It now matches only the paths that do not end with `/` and have no file extension.
