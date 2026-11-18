---
'@aziontech/config': patch
---

Add `dir` to the `origin` of the v3 config. For an `object_storage` origin it is the local directory with the static files, which the build copies to `.edge/storage`. Before, the v3 config had no `storage` section, so the bundler had to read the directory from the v4 config of the preset, and a preset or an `azion.config` that only has the v3 config could not tell which directory to copy. The `dir` is only used by the build and is not written to the manifest.
