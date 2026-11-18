---
'@aziontech/config': patch
---

Stop writing `build.preset.config` and `build.preset.configs` to the manifest when `build.preset` is an object. They are inputs of the build, not part of the manifest, and the manifest ended up with the whole preset config for every API version. `build.preset.metadata` is still written, and a preset set by name is not changed.
