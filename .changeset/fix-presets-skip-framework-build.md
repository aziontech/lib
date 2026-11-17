---
'@aziontech/presets': patch
---

Fix the `vue`, `react`, `preact`, `qwik`, `vitepress`, `vuepress` and `angular` presets leaving the storage folder empty (or with the build nested in a subfolder, for `angular`) when building with `--skip-framework-build`. The prebuild now copies the output of the previous framework build (`outDir` from the Vite config, `dist`, `build` for CRA, or the VitePress/VuePress `dist`) into `.edge/assets` instead of only creating the folder. The `angular` preset moves a plain `ng build` output (`dist/<project>` or `dist/<project>/browser`) to the `dist` root, like the regular build does. The `vuepress` preset no longer deletes its previous build output in this mode.
