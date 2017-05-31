# gl-transition-scripts

Utilities to render/validate [GL Transitions](https://gl-transitions.com) on the CLI.

```
npm i -g gl-transition-scripts
```

## `gl-transition-render`

Render one or many GL Transitions with one or many images.

```
Usage: gl-transition-render [options]

Options:

  -h, --help                         output usage information
  -V, --version                      output the version number
  -t, --transition <file.glsl>       add a transition to use (can be used multiple times)
  -i, --images <images>              add an image to use for the transition (use multiple times)
  -w, --width <width>                width in pixels
  -h, --height <height>              height in pixels
  -f, --frames [nb]                  number of frames to render for each transition
  -d, --delay [nb]                   number of frames to pause after each transition
  -p, --progress [p]                 only render one frame
  -g, --generic-texture [image.png]  provide a generic sampler2D image to use as default uniform sampler2D
  -o, --out <directory|out.png>      a folder to create with the images OR the path of the image to save (if using progress). use '-' for stdout
```


## `gl-transition-transform`

Parse and transform a `*.glsl` transition shader file into a JSON.

```
Usage: gl-transition-transform [options]

Options:

  -h, --help                       output usage information
  -V, --version                    output the version number
  -d, --glsl-dir <dir>             a folder containing *.glsl files
  -o, --json-out <jsonOutputFile>  a JSON file to save with all transitions
```
