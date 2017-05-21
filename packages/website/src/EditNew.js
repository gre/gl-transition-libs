//@flow
import React, { Component } from "react";
import URL from "url";
import Editor from "./Editor";
import transform from "./transform";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { transitionsByName } from "./data";

const transformWithoutNameCollision = (filename, glsl) =>
  transform(filename, glsl, ({ data: { name } }) => {
    const errors = [];
    if (name in transitionsByName) {
      errors.push({
        type: "warn",
        code: "GLT_invalid_filename",
        message: "Transition '" + name + "' already exists",
      });
    }
    return errors;
  });

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
      transitionResult: transformWithoutNameCollision(
        transitionResult.data.transition.name + ".glsl",
        glsl
      ),
    }));
  };

  onFileNameChange = ({ target: { value } }: *) => {
    this.setState(({ transitionResult }) => ({
      transitionResult: transformWithoutNameCollision(
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
    const { name } = transitionResult.data.transition;
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
              value={name}
              onChange={this.onFileNameChange}
              maxLength={40}
            />
            <span>.glsl</span>
          </label>
          <a
            className="primary-btn"
            target="_blank"
            rel="noopener noreferrer"
            href={URL.format({
              pathname: "https://github.com/" +
                githubRepoPath +
                "/new/master" +
                githubRepoFolder +
                "/" +
                name +
                ".glsl",
              query: {
                filename: name + ".glsl",
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
