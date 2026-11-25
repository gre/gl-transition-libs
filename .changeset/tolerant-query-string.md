---
"gl-transition-utils": patch
---

`TransitionQueryString.parse` keeps malformed percent escapes as is instead of throwing a `URIError`.
