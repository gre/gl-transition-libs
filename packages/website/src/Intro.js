import React, { PureComponent, Component } from "react";
import { Link } from "react-router-dom";
import BezierEasing from "bezier-easing";
import BezierEasingEditor from "bezier-easing-editor";
import AnimatedVignette from "./AnimatedVignette";
import Waypoint from "react-waypoint";
import { transitionsByCreatedAt, transitionsByName } from "./data";
import { githubRepoPath } from "./conf";
import GlslCode from "./GlslCode";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import { defaultSampler2D } from "./transform";
import { fromImage, toImage } from "./Gallery";
import FaGithub from "react-icons/lib/fa/github";
import "./Intro.css";
const images = [
  require("./images/1024x768/a1mV1egnQwOqxZZZvhVo_street.jpg"),
  require("./images/1024x768/barley.jpg"),
  require("./images/1024x768/bigbuckbunny_snapshot1.jpg"),
  require("./images/1024x768/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg"),
  require("./images/1024x768/ic1dX3kBQjGNaPQb8Xel_1920x1280.jpg"),
  require("./images/1024x768/ikZyw45kT4m16vHkHe7u_9647713235_29ce0305d2_o.jpg"),
  require("./images/1024x768/lUUnN7VGSoWZ3noefeH7_Baker_Beach-12.jpg"),
  require("./images/1024x768/pHyYeNZMRFOIRpYeW7X3_manacloseup.jpg"),
  require("./images/1024x768/wdXqHcTwSTmLuKOGz92L_Landscape.jpg"),
];

const allImagesToPreload = images.concat([
  defaultSampler2D,
  fromImage,
  toImage,
]);

const Logo = () => (
  <span className="logo">
    <span>GL</span>
    <span>Transitions</span>
  </span>
);

class VignetteFooter extends PureComponent {
  props: {
    transition: *,
  };
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
    progress: 0,
  };
  setProgress(progress: number) {
    this.setState({ progress });
  }
  render() {
    return (
      <BezierEasingEditor {...this.props} progress={this.state.progress} />
    );
  }
}

class TrackVisibility extends Component {
  props: {
    children?: Function,
  };
  state = {
    visible: false,
  };
  onEnter = () => {
    this.setState({ visible: true });
  };
  onLeave = () => {
    this.setState({ visible: false });
  };
  render() {
    const { children } = this.props;
    const { visible } = this.state;
    return (
      <Waypoint onEnter={this.onEnter} onLeave={this.onLeave}>
        {children(visible)}
      </Waypoint>
    );
  }
}

class Preview extends PureComponent {
  render() {
    const { width, height } = this.props;
    return (
      <TrackVisibility>
        {visible => (
          <div className="preview">
            <AnimatedVignette
              paused={!visible}
              transitions={transitionsByCreatedAt}
              images={images}
              preload={allImagesToPreload}
              width={width}
              height={height}
              duration={3000}
              delay={500}
              interaction={false}
              Footer={VignetteFooter}
            />
          </div>
        )}
      </TrackVisibility>
    );
  }
}

class ConfigurableExample extends PureComponent {
  props: {
    width: number,
    height: number,
  };
  state = {
    easing: [0.5, 0, 0.8, 0.8],
    duration: 2000,
    delay: 100,
    transitionParams: {
      reflection: 0.4,
      perspective: 0.4,
      depth: 3,
    },
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
        [e.target.name]: parseFloat(e.target.value, 10),
      },
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
    const { width, height } = this.props;
    const { easing, duration, delay, transitionParams } = this.state;
    const bezierEasingSize = Math.round(0.6 * width);
    return (
      <TrackVisibility>
        {visible => (
          <section>
            <div>
              <AnimatedVignette
                paused={!visible}
                transitions={[transitionsByName.doorway]}
                transitionsParams={[transitionParams]}
                easings={[BezierEasing(...easing)]}
                images={images}
                width={width}
                height={height}
                duration={duration}
                delay={delay}
                Footer={VignetteFooter}
                onDrawWithProgress={this.onDrawWithProgress}
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                <label style={{ display: "flex", flexDirection: "row" }}>
                  reflection
                  <input
                    style={{ flex: 1 }}
                    type="range"
                    name="reflection"
                    value={transitionParams.reflection}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={this.onTransitionParamsChange}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "row" }}>
                  depth
                  <input
                    style={{ flex: 1 }}
                    type="range"
                    name="depth"
                    value={transitionParams.depth}
                    min={1}
                    max={20}
                    step={0.1}
                    onChange={this.onTransitionParamsChange}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "row" }}>
                  perspective
                  <input
                    style={{ flex: 1 }}
                    type="range"
                    name="perspective"
                    value={transitionParams.perspective}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={this.onTransitionParamsChange}
                  />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <BezierEasingEditorWithProgressSetter
                  ref={this.onBezierEditorRef}
                  value={easing}
                  onChange={this.onEasingChange}
                  width={bezierEasingSize}
                  height={bezierEasingSize}
                  padding={[60, 60, 60, 60]}
                  background="transparent"
                  gridColor="#444"
                  curveColor="#b82"
                  handleColor="#fc6"
                  progressColor="#fc6"
                  textStyle={{
                    fill: "#fc6",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 10,
                  }}
                >
                  <label>
                    duration:
                    {" "}
                    <input
                      type="number"
                      value={duration}
                      min={100}
                      max={6000}
                      step={100}
                      onChange={this.onDurationChange}
                    />
                    {" "}
                    ms.
                  </label>
                  <label>
                    delay:
                    {" "}
                    <input
                      type="number"
                      value={delay}
                      min={100}
                      max={2000}
                      step={100}
                      onChange={this.onDelayChange}
                    />
                    {" "}
                    ms.
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}
      </TrackVisibility>
    );
  }
}

export default class Intro extends Component {
  render() {
    let width = 512, height = 384;
    if (window.screen) {
      const ratio = width / height;
      width = Math.min(window.screen.width, width);
      height = Math.round(width / ratio);
    }
    return (
      <div className="Intro">

        <header>
          The Open Collection of
          {" "}
          <Logo />
        </header>
        <section>
          <Preview width={width} height={height} />
          <div>
            <p>
              GLSL is a
              {" "}
              <strong>powerful</strong>
              {" "}
              and easy to learn language, perfect for image effects. It really is the
              {" "}
              <strong>ultimate language to implement Transitions</strong>
              {" "}
              in.
            </p>
            <p>
              It's
              {" "}
              <strong>highly performant</strong>
              {" "}
              (GLSL runs on the GPU),
              {" "}
              <strong>universal</strong>
              {" "}
              (OpenGL is available everywhere),
              {" "}
              <strong>customizable</strong>
              {" "}
              (each transition can have many parameters)
              {" "}
              and can be run over any pixel source like images, videos, canvas,...
            </p>
            <p>
              This Open Source initiative aims to establish an universal collection of transitions that various softwares can use (including Movie Editors).
            </p>
          </div>
        </section>
        <header>What are <Logo />?</header>

        <section>
          <div>
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
            <footer>
              <Link className="btn" to="/editor">
                Experiment with this code
              </Link>
            </footer>
          </div>
          <div>
            <p>
              A GL Transition is a GLSL code that implements a
              {" "}
              <code>transition</code> coloring function:
              {" "}
              For a given
              {" "}
              <code>uv</code>
              {" "}
              pixel position, returns a
              {" "}
              color representing the mix of the
              {" "}
              <strong>source</strong>
              {" "}
              to the
              {" "}
              <strong>destination</strong>
              {" "}
              textures based on the variation of a contextual
              {" "}
              <code>progress</code>
              {" "}
              value from
              {" "}
              <code>0.0</code>
              {" "}
              to
              {" "}
              <code>1.0</code>.
            </p>
            <p>
              <a href={"https://github.com/" + githubRepoPath}>
                More specification can be found on
                {" "}
                <FaGithub />
                {" "}
                Github
              </a>.
            </p>
          </div>
        </section>

        <header>
          <a href={"https://github.com/" + githubRepoPath}>
            <Logo />
            are on
            {" "}
            <FaGithub /> Github
          </a>
        </header>
        <section>
          <div>
            <img alt="" className="full" src={require("./github.gif")} />
          </div>
          <div>
            <p>
              There is currently
              {" "}
              <strong>{transitionsByCreatedAt.length} transitions</strong>
              {" "}
              created by many contributors ❤️ and released under a
              {" "}
              <strong>Free License</strong>.
            </p>
            <p>
              The initiative is
              {" "}
              <strong>community driven</strong>, managed on
              {" "}
              <a href={"https://github.com/" + githubRepoPath}>
                Github
              </a>. PRs are reviewed and validated by a 🤖bot.
            </p>
            <p>
              <strong>You can directly send PRs from this website!</strong>
            </p>
          </div>
        </section>

        <header>
          <Logo /> are configurable
        </header>

        <ConfigurableExample width={width} height={height} />

        <header>
          <Logo /> ecosystem
        </header>

        <section>
          <div>
            <a href="https://www.npmjs.com/package/gl-transitions">
              <code>gl-transitions</code>
            </a>
            {" "} gets auto-published on NPM.
            <ul>
              <li>
                <code>npm install gl-transitions --save</code>
              </li>
              <li>
                or embed it:
                {" "}
                <a
                  className="small"
                  href="https://unpkg.com/gl-transitions@0/gl-transitions.js"
                >
                  https://unpkg.com/gl-transitions@0/gl-transitions.js
                </a>
              </li>
              <li>
                or a JSON:
                {" "}
                <a
                  className="small"
                  href="https://unpkg.com/gl-transitions@0/gl-transitions.json"
                >
                  https://unpkg.com/gl-transitions@0/gl-transitions.json
                </a>
              </li>
            </ul>
          </div>
          <div>
            It's possible to use Vanilla WebGL code to run the transitions and in various environments.
            There are also libraries to help you on that.

            <ul>
              <li>
                With
                {" "}
                <code>gl-react</code>
                {" "}
                you can painlessly use the library
                {" "}
                <code>react-gl-transition</code>.
                {" "}
                This is what this website uses heavily.
              </li>
              <li>
                In a node.js server you can use
                {" "}
                <code>headless-gl</code>
                {" "}
                to render a transition on server side.
                {" "}
                Our bot uses that to render a GIF and put it in the PRs!
                {" "}
                Travis also validates the transitions that gets committed.
              </li>
              <li>
                <strong>
                  More helpers will come and supporting more environments are welcome to contributions.
                </strong>
              </li>
            </ul>
          </div>
        </section>

        <header>
          That's it folks! Get to your shader code
          {" "}
          <span role="img" aria-label="">❤️</span>
        </header>

        <footer>
          <Link className="btn" to="/editor">
            Create a new Transition
          </Link>
        </footer>

      </div>
    );
  }
}
