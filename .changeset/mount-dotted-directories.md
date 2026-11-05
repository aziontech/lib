---
'@aziontech/utils': patch
---

fix(utils): mountSPA and mountMPA no longer treat routes with a dot in a parent segment, like `/docs/v1.2/intro`, as asset requests
