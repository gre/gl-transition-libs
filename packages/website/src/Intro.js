import React, { PureComponent, Component } from "react";
import { Link } from "react-router-dom";
import BezierEasing from "bezier-easing";
import BezierEasingEditor from "bezier-easing-editor";
import AnimatedVignette from "./AnimatedVignette";
import { transitionsByCreatedAt, transitionsByName } from "./data";
import { githubRepoPath } from "./conf";
import GlslCode from "./GlslCode";
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
      <Link to={`/transition/${transition.name}`}>
        <footer>
          <strong>{transition.name}</strong> by <em>{transition.author}</em>
        </footer>
      </Link>
    );
  }
}

class ConfigurableExample extends PureComponent {
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
  render() {
    const {
      easing,
      easingFunction,
      duration,
      delay,
      transitionParams,
    } = this.state;
    return (
      <section>
        <div>
          <AnimatedVignette
            transitions={[transitionsByName.doorway]}
            transitionsParams={[transitionParams]}
            easings={[BezierEasing(...easing)]}
            images={images}
            width={512}
            height={384}
            duration={duration}
            delay={delay}
            Footer={VignetteFooter}
          />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <BezierEasingEditor
              value={easing}
              onChange={this.onEasingChange}
              width={300}
              height={300}
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
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
        </div>
      </section>
    );
  }
}

export default class Intro extends Component {
  render() {
    return (
      <div className="Intro">

        <header>
          The Open Collection of
          {" "}
          <Logo />
        </header>
        <section>
          <div className="preview">

            <AnimatedVignette
              transitions={transitionsByCreatedAt}
              images={images}
              width={512}
              height={384}
              duration={3000}
              delay={500}
              interaction={false}
              Footer={VignetteFooter}
            />
          </div>
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
          </div>
        </section>

        <header>
          <a href={"https://github.com/" + githubRepoPath}>
            <Logo />
            are on
            {" "}
            <i className="fa fa-github" /> Github
          </a>
        </header>
        <section>
          <div>
            <img className="full" src={require("./github.gif")} />
          </div>
          <div>
            <p>
              There is currently
              {" "}
              <strong>{transitionsByCreatedAt.length} transitions</strong>
              {" "}
              created by many contributors❤️ and
              released under a
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
            </p>
          </div>
        </section>

        <header>
          <Logo /> are configurable
        </header>

        <ConfigurableExample />

        <header>What are <Logo />?</header>

        <section>
          <div>
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
            </div>
          </div>
          <div>
            <p>
              A GL Transition is a partial GLSL shader code that implements a
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
          </div>
        </section>

      </div>
    );
  }
}
