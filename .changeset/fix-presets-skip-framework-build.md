---
'@aziontech/presets': patch
---

Fix the `vue`, `react`, `preact`, `qwik`, `vitepress` and `vuepress` presets leaving `.edge/assets` empty when building with `--skip-framework-build`. The prebuild now copies the output of the previous framework build (`outDir` from the Vite config, `dist`, `build` for CRA, or the VitePress/VuePress `dist`) into `.edge/assets` instead of only creating the folder. The `vuepress` preset no longer deletes its previous build output in this mode.
