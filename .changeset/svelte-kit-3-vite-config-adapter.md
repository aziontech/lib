---
'@aziontech/presets': patch
---

The svelte preset now finds the Azion adapter in `vite.config.*` as well as in `svelte.config.*`. SvelteKit 3 accepts the kit options, including `adapter`, directly in the Vite config, and the prebuild only looked at `svelte.config.*`. Without a `svelte.config.*` it concluded that no adapter was set and fell back to the static MPA handler, so `azbundler dev` failed with `ENOENT ... index.html` instead of running the SvelteKit worker. The first config file that declares an adapter is used.
