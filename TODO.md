# general

- write short blog post.
- a bot that comment on new PR with feedback for the user: the compilation results (& potential errors/warns) + a preview of the transition in a GIF 😱
- review the old issues, see if we miss anything.

# editor features

- write a new transform util function that port an old gl transition to a new one and suggest user to use it in case someone drop old code. (we just detect if there is a main function ?)
- gallery pagination
- auto start the transition when not hovered & if shader compiles. (make it stop if window not focused xD)
- make a ratio preserving shader
- write the / screen that quickly explain the idea of gl transition & how the repository works.
- if there are edits. need to prevent redirection!
- expand a transition in bigger screen (like in the previous website)
- the transition params should be in URL params
- import in "UniformsEditor" and no longer use the lib
  - missing margin between vectorial inputs
  - improve the input to be more "number inputs" ?
  - better support of sampler2D params. today it works but it's not straightforward and don't help that you can set an Image url.
- show a link to the license.
- more responsive editor. check it works on mobile.
- experiment with video
- expandable EditorStatusBar

# glsl-transition -> gl-transition

glsl-transition was the "v1" format, it was a full fragment shader. the v2 is now called gl-transition and is more essential: just a transition(uv) color function to implement, decoupling solving issues like handling the from/to ratio.

all the old "glsl-transition*" libs will become DEPRECATED in favor of the new gl-transition* versions.
