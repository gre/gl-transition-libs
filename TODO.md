# general

- review the old issues, see if we miss anything.
- address the ratio problem in shaders.
- write short blog post.
- pinging people that have some old gl transitions and ask them if they could port them and give feedback

# editor features

- expand a transition in bigger screen (like in the previous website)
- improve the input to be more "number inputs" ?
- better support of sampler2D params. today it works but it's not straightforward and don't help that you can set an Image url.
- more responsive editor. check it works on mobile.
- each error should be documented somewhere so we can link them in a FAQ kind of doc.
- experiment with video
- expandable EditorStatusBar
- write a new transform util function that port an old gl transition to a new one and suggest user to use it in case someone drop old code. (we just detect if there is a main function ?)

# glsl-transition -> gl-transition

glsl-transition was the "v1" format, it was a full fragment shader. the v2 is now called gl-transition and is more essential: just a transition(uv) color function to implement, decoupling solving issues like handling the from/to ratio.

all the old "glsl-transition*" libs will become DEPRECATED in favor of the new gl-transition* versions.
