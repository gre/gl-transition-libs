# general

- address the ratio problem in shaders. the hard part about it is getting the size as a uniform.
  - I'm considering having an utility in gl-react to get the size of a given texture "input".
  - for gl-transition-render CLI, it should be easy as we have the pixels size.
- write short blog post.

# bot

- it should mention people that contributed to a file when someone send a patch.

# website

- improve the input to be more "number inputs" ?
- more responsive editor. check it works on mobile.
- each error should be documented somewhere so we can link them in a FAQ kind of doc.
- experiment with video
- expandable EditorStatusBar
- should prevent nav everytime we "lose" content like when editing an existing shader (if !=). for the creation it's probably ok to leave because a "back" would restore the state.
- editor: a button to reset the defaults & also visually see if you have diverged from the default.
- nicely degrade screens when WebGL is not supported.
- customize gallery/editor imgs? old idea: https://github.com/gre/transitions.glsl.io/issues/58 

# glsl-transition -> gl-transition

glsl-transition was the "v1" format, it was a full fragment shader. the v2 is now called gl-transition and is more essential: just a transition(uv) color function to implement, decoupling solving issues like handling the from/to ratio.

all the old "glsl-transition*" libs will become DEPRECATED in favor of the new gl-transition* versions.
