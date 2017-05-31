# react-gl-transition

a [React](https://facebook.github.io/react/) component to render a [GL Transition](https://gl-transitions.com) in [gl-react](https://github.com/gre/gl-react) **v3**.

## Usage example

**https://gl-react-cookbook.surge.sh/transitions**

## API

This exposes a simple `GLTransition` react component you have to use inside gl-react `Surface`.
It renders one frame of the transition (up to you to run the animation loop the way you want).

```html
<GLTransition progress={progress} from={from} to={to} transition={transition} />
```

### props

- **from**: the source texture to transition from. an image URL or any texture format accepted by gl-react! (e.g. a `<video>` React Element! – see https://gl-react-cookbook.surge.sh/ for examples)
- **to**: the destination texture to transition to. (same format as from)
- **progress** *(number)*: a value from 0 to 1
- **transition** *(object)*: a transition object coming from gl-transitions library. see format in https://www.npmjs.com/package/gl-transitions README.
- optional **transitionParams** *(object)*: a key-value object that gives parameters to the transition (and overrides the transition default params). *key is the name of the params, value is its value with one of the [accepted format of gl-react](https://gl-react-cookbook.surge.sh/api#uniforms).*

### escape hatch

There is a `setProgress(progress)` method available via `glTransitionRef.getComponent().setProgress(progress)`. It's an escape hatch, only use it if you identified a bottleneck in the "normal way". If you do, make sure the progress value you sent in props always comes from the same variable you gave to `setProgress` or you will see jumps if you have a React re-render.

> NB disclaimer: use this escape hatch wisely! There should be ways to go before using it. What you can also do is a `<AnimateGLTransition/>` component that directly render GLTransition and where the setState occurs (to have local setState updates, not in all the React tree – gl-react is optimized for that).
