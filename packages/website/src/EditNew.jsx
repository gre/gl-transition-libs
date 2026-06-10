import React, { Component } from "react";
import Editor from "./Editor";
import transform from "./transform";
import SuggestTransform from "./SuggestTransform";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { transitionsByName } from "./data";
import PrimaryBtn from "./PrimaryBtn";
import { FaGithub } from "react-icons/fa";
import "./EditNew.css";

function selectEventTarget(e) {
  e.target.select();
}

const reservedVariablesOfOldTransition = ["main", "from", "to", "progress"];
function probablyOldTransitionCode({ errors }) {
  return (
    errors.filter(
      e =>
        e.code === "GLT_reserved_variable_used" &&
        e.id &&
        reservedVariablesOfOldTransition.includes(e.id)
    ).length === reservedVariablesOfOldTransition.length
  );
}

const transformWithoutNameCollision = (filename, glsl) =>
  transform(filename, glsl, ({ data: { name } }) => {
    const errors = [];
    if (name in transitionsByName) {
      errors.push({
        type: "warn",
        code: "GLT_invalid_filename",
        message: "Transition '" + name + "' already exists"
      });
    }
    return errors;
  });

const defaultsQuery = {
  name: "",
  glsl: `\
// Author:
// License: MIT

vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}`
};

function getQuery({ location }) {
  return !location.search
    ? {}
    : Object.fromEntries(new URLSearchParams(location.search));
}
function setQuery(props, query) {
  const cur = getQuery(props);
  props.navigate(
    {
      pathname: props.location.pathname,
      search: new URLSearchParams({ ...cur, ...query }).toString(),
    },
    { replace: true }
  );
}

export default class EditNew extends Component {
  constructor(props) {
    super(props);
    const { name, glsl } = { ...defaultsQuery, ...getQuery(props) };
    const transitionResult = transformWithoutNameCollision(
      name + ".glsl",
      glsl
    );
    const transitionParams = {};
    this.state = {
      transitionResult,
      transitionParams,
      transformSuggestionDiscarded: false
    };
  }

  // recompute before render so children never see a glsl older than the URL
  static getDerivedStateFromProps(props, state) {
    const currentTransition = state.transitionResult.data.transition;
    const { glsl, name } = { ...currentTransition, ...getQuery(props) };
    if (glsl !== currentTransition.glsl || name !== currentTransition.name) {
      return {
        transitionResult: transformWithoutNameCollision(name + ".glsl", glsl),
      };
    }
    return null;
  }

  onTransitionParamsChange = (transitionParams) => {
    this.setState({ transitionParams });
  };

  onFragChange = (glsl) => {
    setQuery(this.props, { glsl });
  };

  onFileNameChange = ({ target: { value: name } }) => {
    setQuery(this.props, { name });
  };

  onDiscard = () => {
    this.setState({ transformSuggestionDiscarded: true });
  };

  render() {
    const {
      transitionResult,
      transitionParams,
      transformSuggestionDiscarded
    } = this.state;
    const filenameErrors = [];
    const glslErrors = [];
    transitionResult.errors.forEach(e => {
      if (e.code === "GLT_invalid_filename") {
        filenameErrors.push(e);
      } else {
        glslErrors.push(e);
      }
    });
    const { name, glsl } = transitionResult.data.transition;
    const publishSearch = new URLSearchParams({
      filename: name + ".glsl",
      value: transitionResult.data.transition.glsl
    }).toString();
    return (
      <Editor
        errors={glslErrors}
        transition={transitionResult.data.transition}
        compilation={transitionResult.data.compilation}
        onFragChange={this.onFragChange}
        transitionParams={transitionParams}
        onTransitionParamsChange={this.onTransitionParamsChange}
        asideHead={
          <div>
            <label className="tname">
              <input
                className={`transition-name ${
                  filenameErrors.length > 0 ? "error" : ""
                }`}
                type="text"
                placeholder="Transition Name"
                onFocus={selectEventTarget}
                value={name}
                onChange={this.onFileNameChange}
                maxLength={40}
              />
              <span className="transition-name-extension">.glsl</span>
            </label>
            {filenameErrors.map((e, i) => (
              <div key={i} className="filename-error">
                {e.message}
              </div>
            ))}
          </div>
        }
        actionBtn={
          <PrimaryBtn
            disabled={transitionResult.errors.length > 0}
            href={
              "https://github.com/" +
              githubRepoPath +
              "/new/master" +
              githubRepoFolder +
              "?" +
              publishSearch
            }
          >
            <FaGithub /> Publish on Github
          </PrimaryBtn>
        }
      >
        {!transformSuggestionDiscarded &&
        probablyOldTransitionCode(transitionResult) ? (
          <SuggestTransform
            glsl={glsl}
            onFragChange={this.onFragChange}
            onDiscard={this.onDiscard}
          />
        ) : null}
      </Editor>
    );
  }
}
