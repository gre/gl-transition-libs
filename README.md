# glsl-transition

> Makes complex transitions with GLSL (e.g. from one image to another).

# How to use

## The API

```javascript
GlslTransition(canvas)(glslSource)(uniforms, duration, easing)
```

The choice of making 3 level of functions call is for optimization purpose.
Compiling a GLSL program can takes time and it would be terrible to create it each time you do a transition.

Here is an example:

```javascript
var canvasTransition = GlslTransition(canvas);
var awesomeTransition1 = canvasTransition(glslSourceCode);
var awesomeTransition2 = canvasTransition(anotherGlslSourceCode);
var linear = function (x) { return x; };
var square = function (x) { return x*x; };

awesomeTransition1({ from: img1, to: img2 }, 500, linear)
  .then(function(){
    return awesomeTransition2({ from: img2, to: img3 }, 1000);
  })
  .then(function(){
    return awesomeTransition1({ from: img3, to: img1 }, 2000, square);
  })
  ...;
```

- `var Transition = GlslTransition(canvas)` creates a GlslTransition context on a canvas.
- `var transition = Transition(glslSourceCode)` creates a new GLSL transition on a GlslTransition context `T`.
- `transition(uniforms, duration, easing)` starts a new transition with GLSL `uniforms` during `duration` and with an (optional) easing function `easing`.

### The Params object and GLSL conventions

the `uniforms` first argument of the transition call is an object statically given to the GLSL fragment.

The library will map JavaScript types to your GLSL fragment.
However, there is some conventions for the GLSL to be compatible with this library.

The only requirement is that you need a "progress" float uniform which will be changed over the duration time from 0.0 to 1.0.
You can customize the name of that parameter by giving a `{ progress: "customname" }` option object in second argument of the Transition definition.

Most of the library you will define is about moving from an image to another. For that need, the convention we are taking is to name your `uniform sample2D` variables: `from` and `to`.

## Error handling

There is two kind of errors detected by the library: "static" errors and "runtime" errors (generally browser-related error).

What I mean by "static" errors are bad usage of the library we can detect when creating a GlslTransition. Here is some example:
 - **Missing or bad arguments**.
 - **The glsl source code has compilation errors**.

"runtime" errors are errors we can detect until running the application, and are generally browser-related.
For instance, if **the WebGL is not supported**.

In this library, "static" errors will be thrown by the library whereas "runtime" errors will be wrapped in failure promises so there are safe to use and recover on need.

That library doesn't solve for you any fallback, the idea is that the end user choose how to fallback it.
You can test with `GlslTransition.isSupported` if a transition is likely to be supported.
Another more functional way to do it is also to recover the promise resulting of a transition with the code you want (e.g. you could recover with a [Zanimo](http://npmjs.org/package/zanimo) transition).


