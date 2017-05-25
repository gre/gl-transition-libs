import React, { PureComponent, Component } from "react";
import { Link } from "react-router-dom";
import AnimatedVignette from "./AnimatedVignette";
import { transitionsByCreatedAt } from "./data";
import { githubRepoPath } from "./conf";
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

export default class Intro extends Component {
  render() {
    return (
      <div className="Intro">

        <section>
          <div className="preview">
            <header>
              The Open Collection of
              {" "}
              <span className="logo">
                <span>GL</span>
                <span>Transitions</span>
              </span>
            </header>

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

        <section>
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
          <div>
            <a href={"https://github.com/" + githubRepoPath}>
              <header>
                <span className="logo">
                  <span>GL</span>
                  <span>Transitions</span>
                </span>
                {" "}
                <i className="fa fa-github" /> Github
              </header>
            </a>
            <img className="full" src={require("./github.gif")} />
          </div>
        </section>
      </div>
    );
  }
}
