---
'@aziontech/presets': minor
---

Support SvelteKit 3 in the `svelte` preset. SvelteKit 3 removed `builder.generateManifest` in favour of `builder.generateServerInstance` and deprecated `config.kit` (the config is now flat). The preset now detects which one the adapter receives and generates a `manifest.js` with the same shape for both (`server`, `assets`, `server_assets`, `app_path`, `prerendered` and `base_path`), and the worker reads from it instead of building the `Server` itself. SvelteKit 2 keeps working.
