---
"gl-transition-utils": major
"gl-transition-scripts": major
---

Transition names follow the naming rules of gl-transitions 2.0: `transformSource` reports a `GLT_invalid_filename` error when a name is not PascalCase (a capital letter, then letters and digits: `CrossZoom`, `WipeLeft`), has three capitals in a row (`HsvFade`, not `HSVFade`) or contains `Transition`. Names with `-` or `_`, or starting with a lowercase letter, were accepted before and are now errors, so `gl-transition-transform` fails on a 1.x collection. `gl-transition-render` ignores the name rules: it only needs valid GLSL.
