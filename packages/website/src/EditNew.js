//@flow
import React, { Component } from "react";
import URL from "url";
import Editor from "./Editor";
import transform from "./transform";
import { githubRepoFolder, githubRepoPath } from "./conf";

const initialTransitionResult = transform(
  ".glsl",
  `\
// Author:
// License: MIT

vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}`
);

export default class EditNew extends Component {
  state = {
    transitionResult: initialTransitionResult,
  };

  onFragChange = (glsl: string) => {
    this.setState(({ transitionResult }) => ({
      transitionResult: transform(
        transitionResult.data.transition.name + ".glsl",
        glsl
      ),
    }));
  };

  onFileNameChange = ({ target: { value } }: *) => {
    this.setState(({ transitionResult }) => ({
      transitionResult: transform(
        value + ".glsl",
        transitionResult.data.transition.glsl
      ),
    }));
  };

  render() {
    const { transitionResult } = this.state;
    const invalidFilename = transitionResult.errors.some(
      e => e.code === "GLT_invalid_filename"
    );
    return (
      <Editor
        errors={transitionResult.errors}
        transition={transitionResult.data.transition}
        compilation={transitionResult.data.compilation}
        onFragChange={this.onFragChange}
      >
        <div className="toolbar">
          <label>
            <span
              style={{
                display: "inline-block",
                width: 366,
                padding: "0 10px",
                textAlign: "right",
              }}
            >
              Transition Name:
            </span>
            <input
              className={`transition-name ${invalidFilename ? "error" : ""}`}
              type="text"
              placeholder="Transition Name"
              autoFocus
              value={transitionResult.data.transition.name}
              onChange={this.onFileNameChange}
              maxLength={40}
            />
            <span>.glsl</span>
          </label>
          <a
            className="primary-btn"
            target="_blank"
            href={URL.format({
              pathname: "https://github.com/" +
                githubRepoPath +
                "/new/master" +
                githubRepoFolder,
              query: {
                filename: transitionResult.data.transition.name + ".glsl",
                value: transitionResult.data.transition.glsl,
              },
            })}
          >
            <i className="fa fa-github" />
            {" "}
            Publish on Github
          </a>
        </div>
      </Editor>
    );
  }
}
