---
'@aziontech/config': minor
---

feat: add optional versionId support across config

- add `versionId` (config) <-> `version_id` (manifest) round-trip
  handling to the application, connector, functions, firewall, network
  list, waf and workload process-config strategies
- fix missing/broken `versionId` mapping in the connector and network
  list strategies, where the manifest -> config direction silently
  dropped or misnamed the field
- add `versionId` to the corresponding JSON schemas
- add test coverage for the new field, plus full test suites for the
  previously untested application, cache, device groups, function
  instances and rules strategies
