---
'@aziontech/config': minor
'@aziontech/presets': minor
---

Support multiple Azion API config versions (3 and 4) in the same packages.

- `@aziontech/config`: configs can declare `version`. When omitted the default version (4) is used, so existing configs keep working. `processConfig`, `validateConfig`, `validateManifest` and `convertJsonConfigToObject` dispatch to the implementation of the declared version. New exports: `resolveApiVersion`, `resolvePresetConfig`, `getPresetApiVersions`, `getVersionModule`, the accessors `getApplicationName`, `getStorage` and `getFirewallReplacedKeys` (for data that each version keeps in a different place), `DEFAULT_API_VERSION`, `SUPPORTED_API_VERSIONS` and the `AzionConfigV3`, `AnyAzionConfig`, `ConfigByVersion`, `V3`, `ApiVersion` types. `defineConfig` is typed by the declared version.
- `@aziontech/presets`: every preset that existed on the v3 line now also provides its v3 config in `configs[3]`. `config` remains the default (v4) config.
