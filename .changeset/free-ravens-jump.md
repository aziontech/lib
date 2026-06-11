---
'@aziontech/config': patch
---

refactor(config): reorganize schemas and normalize firewall behavior shape

- move schema files from helpers/ to a dedicated schemas/ directory
- split monolithic schema into per-feature modules
- rename set_waf_ruleset behavior to set_waf and update docs
