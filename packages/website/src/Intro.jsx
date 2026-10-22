import React, { PureComponent, Component, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BezierEasing from "bezier-easing";
import BezierEasingEditor from "bezier-easing-editor";
import AnimatedVignette from "./AnimatedVignette";
import { transitions, transitionsOrderByRandom, transitionsByName } from "./data";
import { githubRepoPath } from "./conf";
import GlslCode from "./GlslCode";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import rust from "highlight.js/lib/languages/rust";
import TransitionAuthorAndName, {
  authorDisplayName
} from "./TransitionAuthorAndName";
import { defaultSampler2D } from "./defaultSampler2D";
import { fromImage, toImage } from "./galleryImages";
import "./Intro.css";
import cut1mp4 from "./videos/sintel/cut1.mp4";
import cut2mp4 from "./videos/sintel/cut2.mp4";
import cut3mp4 from "./videos/sintel/cut3.mp4";
import cut1webm from "./videos/sintel/cut1.webm";
import cut2webm from "./videos/sintel/cut2.webm";
import cut3webm from "./videos/sintel/cut3.webm";
import img1 from "./images/1024x768/a1mV1egnQwOqxZZZvhVo_street.jpg";
import img2 from "./images/1024x768/barley.jpg";
import img3 from "./images/1024x768/bigbuckbunny_snapshot1.jpg";
import img4 from "./images/1024x768/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg";
import img5 from "./images/1024x768/ic1dX3kBQjGNaPQb8Xel_1920x1280.jpg";
import img6 from "./images/1024x768/ikZyw45kT4m16vHkHe7u_9647713235_29ce0305d2_o.jpg";
import img7 from "./images/1024x768/lUUnN7VGSoWZ3noefeH7_Baker_Beach-12.jpg";
import img8 from "./images/1024x768/pHyYeNZMRFOIRpYeW7X3_manacloseup.jpg";
import img9 from "./images/1024x768/wdXqHcTwSTmLuKOGz92L_Landscape.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

const allImagesToPreload = images.concat([
  defaultSampler2D,
  fromImage,
  toImage
]);

const ExternalLink = props => (
  <a target="_blank" rel="noopener noreferrer" {...props} />
);

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("rust", rust);

const Code = ({ code, language }) => (
  <pre
    dangerouslySetInnerHTML={{
      __html: hljs.highlight(code, { language }).value
    }}
  />
);

const repoUrl = "https://github.com/" + githubRepoPath;
const repoTree = repoUrl + "/tree/master/";
const specUrl = repoUrl + "#gl-transition-specification-v1";

const authorsByCount = (() => {
  const counts = {};
  transitions.forEach(t => {
    const name = authorDisplayName(t.author);
    if (name) counts[name] = (counts[name] || 0) + 1;
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
})();

class VignetteFooter extends PureComponent {
  render() {
    const { transition } = this.props;
    return (
      <Link to={`/editor/${transition.name}`}>
        <footer>
          <TransitionAuthorAndName transition={transition} />
        </footer>
      </Link>
    );
  }
}

class BezierEasingEditorWithProgressSetter extends Component {
  state = {
    progress: 0
  };
  setProgress(progress) {
    this.setState({ progress });
  }
  render() {
    return (
      <BezierEasingEditor {...this.props} progress={this.state.progress} />
    );
  }
}

function TrackVisibility({ children, className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      setVisible(entries.some(e => e.isIntersecting));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children(visible)}
    </div>
  );
}

// vignettes draw at a fixed pixel size, so their container is measured
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      setWidth(Math.floor(entries[0].contentRect.width));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

function Measure({ className, children }) {
  const [ref, width] = useWidth();
  return (
    <div ref={ref} className={className}>
      {children(width)}
    </div>
  );
}

const heroGap = 16;

function HeroVignettes() {
  const [ref, width] = useWidth();
  const cols = width >= 900 ? 3 : width >= 560 ? 2 : 1;
  const w = Math.floor((width - heroGap * (cols - 1)) / cols);
  const h = Math.round((w * 2) / 3);
  const count = cols;
  return (
    <TrackVisibility className="hero-vignettes">
      {visible => (
        <div
          ref={ref}
          className="grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {width > 0 &&
            Array.from({ length: count }, (_, i) => (
              <AnimatedVignette
                key={i}
                paused={!visible}
                transitions={transitionsOrderByRandom.filter(
                  (_, j) => j % count === i
                )}
                images={images.slice(i).concat(images.slice(0, i))}
                width={w}
                height={h}
                duration={2500}
                delay={600 + 250 * i}
                Footer={VignetteFooter}
              />
            ))}
        </div>
      )}
    </TrackVisibility>
  );
}

const pillars = [
  {
    title: "Powerful",
    text: "GLSL is easy to learn and made for image effects: arguably the best language to write transitions in."
  },
  {
    title: "Fast",
    text: "Every pixel is computed on the GPU, in real time."
  },
  {
    title: "Universal",
    text: "Web, React Native, Remotion, iOS, macOS, Android and Rust."
  },
  {
    title: "Configurable",
    text: "Parameters with defaults, ready to become controls in your UI."
  }
];

const paramSliders = [
  { name: "perspective", min: 0, max: 1, step: 0.01 },
  { name: "depth", min: 1, max: 20, step: 0.1 },
  { name: "reflection", min: 0, max: 1, step: 0.01 }
];

class ConfigurableExample extends PureComponent {
  state = {
    easing: [0.5, 0, 0.8, 0.8],
    duration: 2000,
    delay: 100,
    transitionParams: {
      reflection: 0.4,
      perspective: 0.4,
      depth: 3
    }
  };
  onEasingChange = easing => {
    this.setState({ easing });
  };
  onDurationChange = e => {
    this.setState({ duration: parseInt(e.target.value, 10) });
  };
  onDelayChange = e => {
    this.setState({ delay: parseInt(e.target.value, 10) });
  };
  onTransitionParamsChange = e => {
    this.setState({
      transitionParams: {
        ...this.state.transitionParams,
        [e.target.name]: parseFloat(e.target.value)
      }
    });
  };
  onBezierEditorRef = ref => {
    this.bezierEditor = ref;
  };
  onDrawWithProgress = progress => {
    const { bezierEditor } = this;
    if (!bezierEditor) return;
    bezierEditor.setProgress(progress);
  };
  render() {
    const { easing, duration, delay, transitionParams } = this.state;
    return (
      <TrackVisibility className="configurable">
        {visible => (
          <>
            <div className="controls">
              <fieldset>
                <legend>transition parameters</legend>
                {paramSliders.map(({ name, min, max, step }) => (
                  <label key={name}>
                    <span>{name}</span>
                    <input
                      type="range"
                      name={name}
                      value={transitionParams[name]}
                      min={min}
                      max={max}
                      step={step}
                      onChange={this.onTransitionParamsChange}
                    />
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>timing</legend>
                <div className="timing">
                  <BezierEasingEditorWithProgressSetter
                    ref={this.onBezierEditorRef}
                    value={easing}
                    onChange={this.onEasingChange}
                    width={180}
                    height={180}
                    padding={[30, 30, 30, 30]}
                    background="transparent"
                    gridColor="#333"
                    curveColor="#b82"
                    handleColor="#fc6"
                    progressColor="#fc6"
                    textStyle={{ fill: "#fc6" }}
                  />
                  <div>
                    <label>
                      <span>duration</span>
                      <input
                        type="range"
                        value={duration}
                        min={100}
                        max={6000}
                        step={100}
                        onChange={this.onDurationChange}
                      />
                    </label>
                    <label>
                      <span>delay</span>
                      <input
                        type="range"
                        value={delay}
                        min={100}
                        max={2000}
                        step={100}
                        onChange={this.onDelayChange}
                      />
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <Measure className="media">
              {width =>
                width > 0 && (
                  <AnimatedVignette
                    paused={!visible}
                    transitions={[transitionsByName.doorway]}
                    transitionsParams={[transitionParams]}
                    easings={[BezierEasing(...easing)]}
                    images={images}
                    preload={allImagesToPreload}
                    width={width}
                    height={Math.round((width * 3) / 4)}
                    duration={duration}
                    delay={delay}
                    Footer={VignetteFooter}
                    onDrawWithProgress={this.onDrawWithProgress}
                  />
                )
              }
            </Measure>
          </>
        )}
      </TrackVisibility>
    );
  }
}

// gl-react hides the <video>s, and Chrome doesn't autoplay hidden ones
const playVideo = video => {
  if (video) video.play().catch(() => {});
};

function VideoExample() {
  const [ref, width] = useWidth();
  return (
    <TrackVisibility className="video">
      {visible => (
        <div ref={ref}>
          {width > 0 && (
            <AnimatedVignette
              interaction
              paused={!visible}
              transitions={transitionsOrderByRandom}
              images={
                !visible
                  ? [null]
                  : [
                      // this works precisely working because of gl-react ;)
                      <video key={1} ref={playVideo} loop muted playsInline>
                        <source type="video/webm" src={cut1webm} />
                        <source type="video/mp4" src={cut1mp4} />
                      </video>,
                      <video key={2} ref={playVideo} loop muted playsInline>
                        <source type="video/webm" src={cut2webm} />
                        <source type="video/mp4" src={cut2mp4} />
                      </video>,
                      <video key={3} ref={playVideo} loop muted playsInline>
                        <source type="video/webm" src={cut3webm} />
                        <source type="video/mp4" src={cut3mp4} />
                      </video>
                    ]
              }
              width={width}
              height={Math.round((width * 544) / 1280)}
              duration={3000}
              delay={500}
              keepRenderingDuringDelay
              Footer={VignetteFooter}
            />
          )}
        </div>
      )}
    </TrackVisibility>
  );
}

const targets = [
  {
    lang: "GLSL ES 1.00",
    via: "as written",
    uses: "Web · WebGL (gl-transition, regl, gl-react) · Remotion (WebGL 2)"
  },
  {
    lang: "GLSL ES 3.00",
    via: "validated by glslang",
    uses: "WebGL 2 · OpenGL ES 3 · Rust"
  },
  {
    lang: "SkSL",
    via: "our translator, Skia",
    uses: "React Native Skia · Rust (skia-safe, fframes)"
  },
  {
    lang: "AGSL",
    via: "the SkSL sources",
    uses: "Android · RuntimeShader"
  },
  {
    lang: "WGSL",
    via: "SPIR-V → naga",
    uses: "WebGPU · Rust (wgpu, Bevy)"
  },
  {
    lang: "Metal",
    via: "SPIR-V → naga",
    uses: "iOS · macOS · AVFoundation"
  }
];

const platforms = [
  {
    id: "web",
    name: "Web",
    pkg: "gl-transitions",
    docs: repoTree + "packages/gl-transitions",
    links: [
      {
        label: "gl-transition, regl-transition, react-gl-transition",
        href: "https://github.com/gre/gl-transition-libs"
      }
    ],
    install: "npm install gl-transitions",
    language: "javascript",
    code: `import transitions from "gl-transitions";

const cube = transitions.find((t) => t.name === "cube");
cube.glsl;      // the GLSL source
cube.params;    // types, defaults, ranges
// SkSL, WGSL, Metal and GLSL ES 3.00 files ship alongside`,
    blurb:
      "The catalog and the sources in every language, with typed parameters. Render with WebGL through gl-transition, regl or gl-react, or WebGPU with the WGSL files."
  },
  {
    id: "rn",
    name: "React Native",
    pkg: "@gl-transitions/react-native-skia",
    docs: repoTree + "packages/react-native-skia",
    links: [
      { label: "Example app", href: repoTree + "examples/react-native-skia" }
    ],
    install: "npm install gl-transitions @gl-transitions/react-native-skia",
    language: "javascript",
    code: `<Canvas style={{ width: 360, height: 240 }}>
  <Transition
    name="crosswarp"
    from={from}
    to={to}
    progress={progress}
    width={360}
    height={240}
  />
</Canvas>`,
    blurb:
      "A Transition component for React Native Skia, drawing the SkSL versions. Animate progress with a Reanimated shared value, between images or video frames."
  },
  {
    id: "remotion",
    name: "Remotion",
    pkg: "@gl-transitions/remotion",
    docs: repoTree + "packages/remotion",
    links: [{ label: "Example project", href: repoTree + "examples/remotion" }],
    install:
      "npm install gl-transitions @gl-transitions/remotion @remotion/transitions",
    language: "javascript",
    code: `<TransitionSeries.Transition
  presentation={glTransition({ name: "crosswarp" })}
  timing={linearTiming({ durationInFrames: 30 })}
/>`,
    blurb:
      "A presentation for TransitionSeries: any two scenes, images, videos or text, rendered with WebGL 2."
  },
  {
    id: "swift",
    name: "iOS · macOS",
    pkg: "GLTransitions",
    docs: repoTree + "swift",
    links: [{ label: "SwiftUI example app", href: repoTree + "examples/swiftui" }],
    install:
      '.package(url: "https://github.com/gl-transitions/gl-transitions-swift", from: "1.76.1")',
    installLanguage: "swift",
    language: "swift",
    code: `let composition = try await TransitionComposition.make(
  clips: [AVURLAsset(url: first), AVURLAsset(url: second)],
  transitions: [TransitionStep(GLTransitions.named("crosswarp")!)]
)
let player = AVPlayer(playerItem: composition.makePlayerItem())`,
    blurb:
      "Metal shaders, a Metal renderer and an AVFoundation compositor for transitions between video clips. iOS 16, macOS 13, tvOS, visionOS."
  },
  {
    id: "android",
    name: "Android",
    pkg: "com.gl-transitions:gl-transitions",
    docs: repoTree + "android",
    links: [{ label: "Example app", href: repoTree + "examples/android" }],
    install: 'implementation("com.gl-transitions:gl-transitions:1.76.1")',
    installLanguage: "kotlin",
    language: "kotlin",
    code: `val shader = TransitionShader(GLTransitions.named("directionalwarp")!!)

// in onDraw, or a Compose drawBehind
shader.draw(canvas, fromBitmap, toBitmap, progress)`,
    blurb:
      "AGSL RuntimeShaders with typed parameters, for Views and Jetpack Compose, from Kotlin or Java. Android 13 and later."
  },
  {
    id: "rust",
    name: "Rust",
    pkg: "gl-transitions crate",
    docs: "https://crates.io/crates/gl-transitions",
    links: [{ label: "fframes example", href: repoTree + "examples/fframes" }],
    install: "cargo add gl-transitions",
    language: "rust",
    code: `let t = gl_transitions::get("directionalwarp").expect("in the collection");
let mut params = t.default_params();
params.set("direction", [1.0, 0.0])?;
let sksl = t.sksl();   // Option<&str>; wgsl() too`,
    blurb:
      "Every source with typed parameters and uniform layouts, for skia-safe, wgpu, Bevy or fframes."
  }
];

function Platforms() {
  const [tab, setTab] = useState(platforms[0].id);
  const current = platforms.find(p => p.id === tab);
  const tabsRef = useRef(null);
  const onTabsKeyDown = e => {
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const i = platforms.indexOf(current);
    const next = platforms[(i + delta + platforms.length) % platforms.length];
    setTab(next.id);
    tabsRef.current.querySelector("#tab-" + next.id).focus();
  };
  return (
    <>
      <figure className="targets">
        <div className="targets-grid">
          <div className="source">
            <code>transition.glsl</code>
            <strong>One GLSL function</strong>
            <span>
              The reference: rendered headless, it is the ground truth for
              every other target.
            </span>
          </div>
          {targets.map(({ lang, via, uses }, i) => (
            <React.Fragment key={lang}>
              <span
                className="arrow"
                style={{ "--row": i + 1, gridColumn: 2 }}
                aria-hidden="true"
              >
                →
              </span>
              <div className="lang" style={{ "--row": i + 1 }}>
                <code>{lang}</code>
                <span>{via}</span>
              </div>
              <span
                className="arrow"
                style={{ "--row": i + 1, gridColumn: 4 }}
                aria-hidden="true"
              >
                →
              </span>
              <div className="uses" style={{ "--row": i + 1 }}>
                {uses}
              </div>
            </React.Fragment>
          ))}
        </div>
        <figcaption>
          <strong>Transpiled and checked in CI</strong>
          <span>
            Every translation is compiled; the SkSL, AGSL, WGSL and Metal ones
            are rendered with the same images and compared with the GLSL
            reference.
          </span>
        </figcaption>
      </figure>
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Platforms"
        className="tabs"
        onKeyDown={onTabsKeyDown}
      >
        {platforms.map(p => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={"tab-" + p.id}
            aria-selected={p.id === tab}
            tabIndex={p.id === tab ? 0 : -1}
            aria-controls="platform-panel"
            onClick={() => setTab(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div
        className="platform"
        role="tabpanel"
        id="platform-panel"
        aria-labelledby={"tab-" + current.id}
      >
        <div className="snippets">
          <Code
            code={current.install}
            language={current.installLanguage || "bash"}
          />
          <Code code={current.code} language={current.language} />
        </div>
        <div className="about">
          <h3>{current.name}</h3>
          <p>{current.blurb}</p>
          <ExternalLink href={current.docs}>
            {current.pkg} documentation →
          </ExternalLink>
          {current.links.map(l => (
            <ExternalLink key={l.href} href={l.href}>
              {l.label} →
            </ExternalLink>
          ))}
        </div>
      </div>
    </>
  );
}

export default class Intro extends Component {
  render() {
    return (
      <div className="Intro">
        <section className="hero">
          <div className="wrap">
            <div className="lead">
              <h1>
                The open collection of <em>GL Transitions</em>
              </h1>
              <p>
                {transitions.length} shader transitions written by a community,{" "}
                <strong>free to use</strong> in your web page, your app or{" "}
                <strong>your video editor</strong>.
              </p>
              <div className="ctas">
                <Link className="btn" to="/gallery">
                  Browse the gallery
                </Link>
                <a className="btn secondary" href="#platforms">
                  Use them in your project
                </a>
              </div>
            </div>
            <HeroVignettes />
            <div className="pillars">
              {pillars.map(p => (
                <div key={p.title}>
                  <strong>{p.title}</strong>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="configurable">
          <div className="wrap">
            <ConfigurableExample />
          </div>
        </section>

        <section className="band" id="spec">
          <div className="wrap split">
            <div className="code">
              <GlslCode
                code={`\
// transition of a simple fade.
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}`}
              />
              <Link to="/editor">Experiment with this code →</Link>
            </div>
            <div className="text">
              <h2>What is a GL Transition?</h2>
              <p>
                A GLSL function that, for each pixel <code>uv</code>, returns a
                mix of the <strong>from</strong> and <strong>to</strong> images,
                driven by a <code>progress</code> going from <code>0.0</code> to{" "}
                <code>1.0</code>.
              </p>
              <p>
                That's the whole contract. It is why the same transition runs{" "}
                <strong>on any GPU</strong>, over{" "}
                <strong>any pixel source</strong>: images, videos, canvases,
                camera frames.
              </p>
              <ExternalLink href={specUrl}>
                Read the specification →
              </ExternalLink>
            </div>
          </div>
        </section>


        <section id="platforms">
          <div className="wrap">
            <h2>Pick your platform</h2>
            <p className="intro-text">
              Write it once in GLSL, use it everywhere. Each transition is{" "}
              <strong>translated automatically</strong> to the shader language
              of your platform:
            </p>
            <Platforms />
          </div>
        </section>

        <section className="band" id="github">
          <div className="wrap">
            <h2>Community driven, on GitHub</h2>
            <p className="intro-text">
              Every transition is credited to its author and released under a{" "}
              <strong>free license</strong>: {transitions.length} transitions by{" "}
              {authorsByCount.length} authors so far. Pull requests are{" "}
              <strong>validated by CI</strong>, which renders preview GIFs, and
              you can <strong>send one straight from the editor</strong>.
            </p>
            <p className="authors">
              With {authorsByCount.slice(0, 15).join(", ")},{" "}
              <ExternalLink href={repoUrl}>and many more ♥</ExternalLink>
            </p>
          </div>
        </section>

        <section id="video">
          <div className="wrap">
            <VideoExample />
            <p className="caption">
              Works on videos too: the transitions play live between clips of
              Sintel.
            </p>
          </div>
        </section>

        <section className="outro">
          <div className="wrap">
            <h2>
              That's it, folks! Get to your shader code <em>♥</em>
            </h2>
            <Link className="btn" to="/editor">
              Create a new transition
            </Link>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <span>
              Open source since 2017 · each transition under its author's
              license
            </span>
            <span>
              For coding agents:{" "}
              <ExternalLink href="https://cdn.jsdelivr.net/npm/gl-transitions@1/llms.txt">
                llms.txt
              </ExternalLink>
            </span>
          </div>
        </footer>
      </div>
    );
  }
}
