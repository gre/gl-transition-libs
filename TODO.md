# general

- address the ratio problem in shaders. the hard part about it is getting the size as a uniform.
  - for web, need to address https://github.com/gre/gl-react/issues/116
- write short blog post.
- add a description, tags and a README for react-gl-transition
- implement gl-transition for https://github.com/gre/gl-transition-libs/issues/20

# bot

- it should mention people that contributed to a file when someone send a patch.

# website on mobile

- bezier-easing-editor to implement touch events support
- Vignette touch events !!!!

# website

- all css / async loads need to be killed.. they create kinda ugly glitch. they also wouldn't be good for server side rendering.
- add a global loader because the site is weird if images aren't loaded. actually => https://github.com/gre/gl-react/issues/115
- improve the input to be more "number inputs" ?
- FAQ each error should be documented somewhere so we can link them in a FAQ kind of doc.
- experiment with video
- expandable EditorStatusBar
- should prevent nav everytime we "lose" content like when editing an existing shader (if !=). for the creation it's probably ok to leave because a "back" would restore the state.
- editor: a button to reset the defaults & also visually see if you have diverged from the default.
- nicely degrade screens when WebGL is not supported.
- customize gallery/editor imgs? old idea: https://github.com/gre/transitions.glsl.io/issues/585
- profile performance.
- better handling of losing context. it shouldn't error like currently but just have a gray placeholder

# glsl-transition -> gl-transition

glsl-transition was the "v1" format, it was a full fragment shader. the v2 is now called gl-transition and is more essential: just a transition(uv) color function to implement, decoupling solving issues like handling the from/to ratio.

all the old "glsl-transition*" libs will become DEPRECATED in favor of the new gl-transition* versions.
