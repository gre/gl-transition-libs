import React, { Component } from "react";
import transformOldGLSLTransition
  from "gl-transition-utils/lib/transformOldGLSLTransition";
import GlslCode from "./GlslCode";
import "./SuggestTransform.css";

export default class SuggestTransform extends Component {
  render() {
    const { glsl, onFragChange, onDiscard } = this.props;
    const res = transformOldGLSLTransition(glsl);
    return (
      <div className="SuggestTransform">
        <div className="container">

          <header>
            <h2>Porting an old transition</h2>
            <em>
              Hi there! You seem to have pasted an old transition, would you let us refactor it to match the new Transition specification?
              <br />
              You may still need to simplify some code at the end but it should work!
            </em>
          </header>
          <div className="body">
            <div>
              <h3>Your code:</h3>
              <GlslCode code={glsl} />
              <button className="button discard" onClick={onDiscard}>
                Keep my code
              </button>
            </div>
            <div>
              <h3>Ported to the a transition function:</h3>
              <GlslCode code={res.data.glsl} />
              <button
                className="button"
                onClick={() => onFragChange(res.data.glsl)}
              >
                Refactor code!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
