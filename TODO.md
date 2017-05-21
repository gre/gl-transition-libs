# general

- write short blog post.

- a bot that comment on new PR with feedback for the user: the compilation results (& potential errors/warns) + a preview of the transition in a GIF 😱

- review the old issues, see if we miss anything.

# editor features

- gallery pagination

- auto start the transition when not hovered & if shader compiles. (make it stop if window not focused xD)

- if there are edits. need to prevent redirection!

- write the / screen that quickly explain the idea of gl transition & how the repository works.

- import in "UniformsEditor" and no longer use the lib

- better support of sampler2D params. today it works but it's not straightforward and don't help that you can set an Image url.

- expandable EditorStatusBar

- experiment with video

- make a ratio preserving shader

# glsl-transition -> gl-transition

glsl-transition was the "v1" format, it was a full fragment shader. the v2 is now called gl-transition and is more essential: just a transition(uv) color function to implement, decoupling solving issues like handling the from/to ratio.

all the old "glsl-transition*" libs will become DEPRECATED in favor of the new gl-transition* versions.
