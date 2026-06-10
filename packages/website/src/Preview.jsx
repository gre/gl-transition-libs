import React, { Component } from "react";
import { Link } from "react-router-dom";
import { transitionsByName } from "./data";
import { acceptedLicenses } from "gl-transition-utils";
import AnimatedVignette from "./AnimatedVignette";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import { FaEdit, FaRandom } from "react-icons/fa";
import "./Preview.css";
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

const tnames = Object.keys(transitionsByName);

export default class Preview extends Component {
  render() {
    const transition = transitionsByName[this.props.name];
    const randomTransitionName =
      tnames[Math.floor(Math.random() * tnames.length)];
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
            <FaEdit />
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
            <FaRandom /> random
          </Link>
        </footer>
      </div>
    );
  }
}
