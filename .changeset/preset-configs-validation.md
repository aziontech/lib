---
'@aziontech/config': patch
---

Fix the validation of a `build.preset` object that carries `configs`, such as `preset: { ...javascript }` in an `azion.config` with `version: 3`. The schema did not know the `configs` property of the preset, so it failed with "No additional properties are allowed in preset". `preset.config` is the config of the default API version, which can differ from the version of the file (a v4 `config` in a v3 file was rejected), so it is now only checked against the schema of the file version when the preset has no `configs`. The `build` schema of the v3 config now comes from the shared schema, as it already did for v4 and v6, which also makes it accept `build.worker`.
