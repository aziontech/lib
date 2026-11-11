---
'@aziontech/config': minor
'@aziontech/presets': minor
---

Support the Azion API v6 config in the same packages.

- `@aziontech/config`: a config with `version: 6` is now validated and processed into a v6 manifest. v3 and v4 are unchanged, and a config without `version` is still the v4 one. v6 changes the publishing model: Save creates a Draft version and publishing is a separate step, so the config declares `environments` and `deployments` (the environment and deployment policies are required) and workloads with `bindings` (a binding references an environment and a deployment by name). Adds the build, applications (rules, cache settings, function instances and device groups), functions (with bindings), purge, storage, connectors, firewall, WAF, network lists and custom pages. `validateConfig`, `processConfig`, `validateManifest` and `convertJsonConfigToObject` accept v6, and `defineConfig` types the config as `AzionConfigV6`. The v3 and v4 manifests now carry the API version. The v6 API has no `active` in its resources, so the v6 config and manifest do not have it, and the `createSPARules` and `createMPARules` helpers no longer write `active: true` (it is the default of the v4 and v3 rules).
- `@aziontech/presets`: every preset now provides its v6 config in `configs[6]` (`nitro` has no v3 config, as it did not exist on v3). `config` remains the default (v4) config.
