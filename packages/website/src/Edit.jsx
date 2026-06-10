import React, { Component } from "react";
import { TransitionQueryString, acceptedLicenses } from "gl-transition-utils";
import Editor from "./Editor";
import transform from "./transform";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { transitionsByName } from "./data";
import PrimaryBtn from "./PrimaryBtn";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import { FaGithub } from "react-icons/fa";

function getTransitionParams({ location }) {
  if (!location.search) return {};
  return TransitionQueryString.parse(location.search.slice(1));
}
function setTransitionParams({ location, navigate }, params) {
  navigate(
    {
      pathname: location.pathname,
      search: TransitionQueryString.stringify(params),
    },
    { replace: true }
  );
}

export default class Edit extends Component {
  state = {
    transitionResult: transform(
      this.props.name + ".glsl",
      transitionsByName[this.props.name].glsl
    )
  };

  onFragChange = (glsl) => {
    this.setState(({ transitionResult }) => ({
      transitionResult: transform(
        transitionResult.data.transition.name + ".glsl",
        glsl
      )
    }));
  };

  onTransitionParamsChange = (params) => {
    setTransitionParams(this.props, params);
  };

  render() {
    const { name } = this.props;
    const { transitionResult } = this.state;
    const transition = transitionsByName[name];
    const transitionParams = getTransitionParams(this.props);
    const submitPatchHref =
      "https://github.com/" +
      githubRepoPath +
      "/edit/master" +
      githubRepoFolder +
      "/" +
      name +
      ".glsl";
    const hasChanged =
      transition.glsl !== transitionResult.data.transition.glsl;

    return (
      <Editor
        errors={transitionResult.errors}
        transition={transitionResult.data.transition}
        compilation={transitionResult.data.compilation}
        onFragChange={this.onFragChange}
        transitionParams={transitionParams}
        onTransitionParamsChange={this.onTransitionParamsChange}
        asideHead={
          <h2 className="tname">
            <a
              className="license"
              href={acceptedLicenses[transition.license]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transition.license}
            </a>
            <div style={{ flex: 1 }} />
            <TransitionAuthorAndName withGithubLink transition={transition} />
          </h2>
        }
        actionBtn={
          <PrimaryBtn
            disabled={transitionResult.errors.length > 0 || !hasChanged}
            href={submitPatchHref}
          >
            <FaGithub /> Patch {transition.name}.glsl on Github
          </PrimaryBtn>
        }
      />
    );
  }
}
