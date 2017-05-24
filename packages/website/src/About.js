import React, { PureComponent, Component } from "react";
import { Link } from "react-router-dom";
import AnimatedVignette from "./AnimatedVignette";
import { transitions } from "./data";
import "./About.css";
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
      <footer>
        <Link to={`/transition/${transition.name}`}>
          <strong>{transition.name}</strong> by <em>{transition.author}</em>
        </Link>
      </footer>
    );
  }
}

export default class About extends Component {
  render() {
    return (
      <div className="About">

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
            transitions={transitions}
            images={images}
            width={512}
            height={384}
            duration={3000}
            delay={500}
            interaction={false}
            Footer={VignetteFooter}
          />
        </div>

        <div className="text">
          <p>
            GLSL is a
            {" "}
            <strong>powerful</strong>
            {" "}
            and easy to learn language, perfect for image effects. It is the
            {" "}
            <strong>ultimate language to implement Transitions</strong>
            {" "}
            in. The potential effects you can implement in GLSL is incredible.
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
            and can be run over many medias like images, videos, canvas,...
          </p>

          <p>
            The initiative is
            {" "}
            <strong>community driven</strong>
            . The transitions are
            {" "}
            <strong>Free License</strong>
            {" "}
            and available on
            {" "}
            <a href="https://github.com/gltransitions/gl-transitions">Github</a>
            .
          </p>
        </div>
      </div>
    );
  }
}
