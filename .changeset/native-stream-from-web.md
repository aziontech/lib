---
'@aziontech/builder': patch
---

Stop overriding `Readable.toWeb` and `Readable.fromWeb` of the host `node:stream` in the `stream` polyfill used by `azion dev`. The polyfill replaced the native implementations, and its `Readable.fromWeb` never pushed any data (it returned `{ done, value }` from `read()` instead of calling `push()`), so a stream created with it never emitted `data` or `end`. Next.js 16.4+ builds the HTML with `Readable.fromWeb` and `Readable.toWeb`, so the render never finished and ISR pages were never revalidated on the local server. The polyfill versions are now installed only when the host does not provide them, and the `fromWeb` fallback now pushes the data.
