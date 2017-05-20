//@flow
import React, { Component } from "react";
import URL from "url";
import Editor from "./Editor";
import transform from "./transform";
import { githubRepoFolder, githubRepoPath } from "./conf";

export default class Edit extends Component {
  props: {
    transition: *,
  };

  state = {
    transitionResult: transform(
      this.props.transition.name + ".glsl",
      this.props.transition.glsl
    ),
  };

  onFragChange = (glsl: string) => {
    this.setState(({ transitionResult }) => ({
      transitionResult: transform(
        transitionResult.data.transition.name + ".glsl",
        glsl
      ),
    }));
  };

  render() {
    const { transition } = this.props;
    const { transitionResult } = this.state;
    const submitPatchHref = URL.format({
      pathname: "https://github.com/" +
        githubRepoPath +
        "/new/master" +
        githubRepoFolder,
      query: {
        filename: transitionResult.data.transition.name + ".glsl",
        value: transitionResult.data.transition.glsl,
      },
    });
    const fileHref = URL.format({
      pathname: "https://github.com/" +
        githubRepoPath +
        "/tree/master" +
        githubRepoFolder +
        "/" +
        transitionResult.data.name +
        ".glsl",
    });
    return (
      <Editor
        errors={transitionResult.errors}
        transition={transitionResult.data.transition}
        compilation={transitionResult.data.compilation}
        onFragChange={this.onFragChange}
      >
        <div className="toolbar">
          <h2 style={{ marginLeft: 366 }}>
            <a href={fileHref} target="_blank">
              <i className="fa fa-github" />
              {" "}
              <strong>{transition.name}</strong> by <em>{transition.author}</em>
            </a>
          </h2>
          <a className="primary-btn" target="_blank" href={submitPatchHref}>
            <i className="fa fa-github" />
            {" "}
            Submit Patch on Github
          </a>
        </div>
      </Editor>
    );
  }
}
