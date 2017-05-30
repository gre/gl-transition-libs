# website

- showcase Video in the intro page.
- editor: a button to reset the defaults & also visually see if you have diverged from the default.
- should prevent nav everytime we "lose" content like when editing an existing shader (if !=). for the creation it's probably ok to leave because a "back" would restore the state.
- FAQ each error should be documented somewhere so we can link them in a FAQ kind of doc.
- expandable EditorStatusBar
- customize gallery/editor imgs? old idea: https://github.com/gre/transitions.glsl.io/issues/585
- webgl error resilience
  - better handling of losing context. it shouldn't error like currently but just have a gray placeholder
  - nicely degrade screens when WebGL is not supported.
- loading perf
  - all css / async loads need to be killed.. they create kinda ugly glitch. they also wouldn't be good for server side rendering.
  - add a global loader because the site is weird if images aren't loaded. actually => https://github.com/gre/gl-react/issues/115
- profile performance.

# glsl-transition -> gl-transition

glsl-transition was the "v1" format, it was a full fragment shader. the v2 is now called gl-transition and is more essential: just a transition(uv) color function to implement, decoupling solving issues like handling the from/to ratio.

all the old "glsl-transition*" libs will become DEPRECATED in favor of the new gl-transition* versions.
