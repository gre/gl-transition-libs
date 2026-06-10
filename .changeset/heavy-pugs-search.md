---
"gl-transition-scripts": patch
---

Replace `get-pixels` with a minimal internal PNG/JPEG loader (pngjs + jpeg-js + native fetch). This removes the deprecated `request` dependency chain and its security advisories (form-data, qs, uuid, tough-cookie). PNG, JPEG, http(s) URLs and data URIs are still supported; GIF input is no longer accepted (it previously decoded to a 4D array that the texture pipeline rejected anyway).
