# TODO

- finish editor. push on github.
- move some code out to be used from outside: the GLTransitionUtils. gl-transitions-utils
- setup gl-transitions repo with all requires scripts & config & travis auto-publishing to gl-transitions lib.
- release a new gl-transition lib.
- release a react-gl-transition lib. (or gl-react-transition :-O) it just renders the <Node> of gl-react.
- write short blog post.

# editor features

- auto start the transition when not hovered & if shader compiles. (make it stop if window not focused xD)

- if there are edits. need to prevent redirection!

- write the home screen that will quickly explain the idea of gl transition, how it's hosted, how to use it.

- the transitions need be pulled from a glsl-transitions lib. We should not recompile them as we assume it's correct.

- should just import in the "UniformsEditor" and no longer use the lib

- improve design. font size, paddings, fonts

- open the old issues, see if things to pick from.

- expandable EditorStatusBar

- experiment with video

- make a ratio preserving shader


# glsl-transition -> gl-transition

glsl-transition is the v1 format, that was a full shader. the v2 is now gl-transition that is a simpler part, more focused on the essential and that solve issues like handling the ratio.

github: rename all repo that are "glsl-transition*" to "gl-transition*"
npm: release a new lib for each "gl-transition*"
npm: all the "glsl-transition*" will become DEPRECATED in favor of the new gl-transition*


# release workflow

people see the website, do a transition, submit it on Github via PR.
the PR is tested on Travis.
when merged, Travis runs to effectively compile & deploy it on NPM.

## scripts

- test: for all files, run the transformer AND the webgl compiler
- compile: for all files, run the transformer, generate individual `transitions/*.js` entry but also a single index.js and a browser build transitions.js – this browser build can be used by the editor itself through npmcdn.
- deploy: compile && deploy on NPM

- a way for travis to autocomment on github? :o
