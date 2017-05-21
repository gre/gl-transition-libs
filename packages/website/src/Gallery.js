//@flow
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { transitions } from "./data";
import Vignette from "./Vignette";
import "./Gallery.css";

const fromImage = require("./images/600x400/barley.jpg");
const toImage = require("./images/600x400/pHyYeNZMRFOIRpYeW7X3_manacloseup.jpg");

class EditorVignette extends Component {
  props: {
    transition: *,
  };
  render() {
    const { transition } = this.props;
    return (
      <Link to={"/transition/" + transition.name}>
        <Vignette
          transition={transition}
          from={fromImage}
          to={toImage}
          width={300}
          height={200}
        >
          <footer>
            <strong>{transition.name}</strong> by <em>{transition.author}</em>
          </footer>
        </Vignette>
      </Link>
    );
  }
}

export default class Editor extends Component {
  render() {
    const page = transitions.slice(0, 12);
    return (
      <div>
        <div className="toolbar" />
        <div className="transitions">
          {page.map(transition => (
            <EditorVignette key={transition.name} transition={transition} />
          ))}
        </div>
      </div>
    );
  }
}
