//@flow
import React, { Component } from "react";
import URL from "url";
import Editor from "./Editor";
import transform from "./transform";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { transitionsByName } from "./data";

export default class Edit extends Component {
  props: {
    name: string,
    location: *,
    history: *,
  };

  state = {
    transitionResult: transform(
      this.props.name + ".glsl",
      transitionsByName[this.props.name].glsl
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
    const { name, location, history } = this.props;
    const { transitionResult } = this.state;
    const transition = transitionsByName[name];
    const submitPatchHref = URL.format({
      pathname: "https://github.com/" +
        githubRepoPath +
        "/edit/master" +
        githubRepoFolder +
        "/" +
        name +
        ".glsl",
    });
    const fileHref = URL.format({
      pathname: "https://github.com/" +
        githubRepoPath +
        "/tree/master" +
        githubRepoFolder +
        "/" +
        name +
        ".glsl",
    });
    return (
      <Editor
        location={location}
        history={history}
        errors={transitionResult.errors}
        transition={transitionResult.data.transition}
        compilation={transitionResult.data.compilation}
        onFragChange={this.onFragChange}
      >
        <div className="toolbar">
          <h2 style={{ marginLeft: 366 }}>
            <a href={fileHref} target="_blank" rel="noopener noreferrer">
              <i className="fa fa-github" />
              {" "}
              <strong>{transition.name}</strong> by <em>{transition.author}</em>
            </a>
          </h2>
          <a
            className="primary-btn"
            target="_blank"
            rel="noopener noreferrer"
            href={submitPatchHref}
          >
            <i className="fa fa-github" />
            {" "}
            Submit Patch on Github
          </a>
        </div>
      </Editor>
    );
  }
}
