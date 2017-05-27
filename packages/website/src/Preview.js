//@flow
import React, { Component } from "react";
import URL from "url";
import { Link } from "react-router-dom";
import { transitionsByName } from "./data";
import acceptedLicenses from "gl-transition-utils/lib/acceptedLicenses";
import { githubRepoFolder, githubRepoPath } from "./conf";
import AnimatedVignette from "./AnimatedVignette";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import "./Preview.css";
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

type Props = {
  name: string,
};

const tnames = Object.keys(transitionsByName);

export default class Preview extends Component {
  props: Props;
  render() {
    const transition = transitionsByName[this.props.name];
    const randomTransitionName =
      tnames[Math.floor(Math.random() * tnames.length)];

    const fileHref = URL.format({
      pathname: "https://github.com/" +
        githubRepoPath +
        "/tree/master" +
        githubRepoFolder +
        "/" +
        transition.name +
        ".glsl",
    });
    return (
      <div className="Preview">
        <header>
          <a
            className="license"
            href={acceptedLicenses[transition.license]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {transition.license}
          </a>
          <h2 className="tname">
            <TransitionAuthorAndName withGithubLink transition={transition} />
          </h2>
          <Link to={"/editor/" + transition.name}>
            <i className="fa fa-edit" />
          </Link>
        </header>
        <AnimatedVignette
          transitions={[transition]}
          images={images}
          width={512}
          height={384}
          duration={3000}
          delay={500}
        />
        <footer>
          <Link to={"/transition/" + randomTransitionName}>
            <i className="fa fa-random" /> random
          </Link>
        </footer>
      </div>
    );
  }
}
