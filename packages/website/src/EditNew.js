//@flow
import React, { Component } from "react";
import querystring from "querystring";
import URL from "url";
import Editor from "./Editor";
import transform from "./transform";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { transitionsByName } from "./data";
import PrimaryBtn from "./PrimaryBtn";

function selectEventTarget(e: *) {
  e.target.select();
}

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
}`,
};

type Props = {
  location: *,
  history: *,
};

type Query = {
  glsl?: string,
  name?: string,
};

function getQuery({ location }: Props): Query {
  return !location.search ? {} : querystring.parse(location.search.slice(1));
}
function setQuery(props: Props, query: Query): void {
  const cur = getQuery(props);
  props.history.replace({
    pathname: props.location.pathname,
    search: querystring.stringify({ ...cur, ...query }),
  });
}

export default class EditNew extends Component {
  props: Props;
  state: {
    transitionResult: *,
    transitionParams: *,
  };

  constructor(props: Props) {
    super();
    const { name, glsl } = { ...defaultsQuery, ...getQuery(props) };
    const transitionResult = transformWithoutNameCollision(
      name + ".glsl",
      glsl
    );
    const transitionParams = {};
    this.state = { transitionResult, transitionParams };
  }

  componentWillReceiveProps(props: *) {
    const currentTransition = this.state.transitionResult.data.transition;
    const { glsl, name } = { ...currentTransition, ...getQuery(props) };
    if (glsl !== currentTransition.glsl || name !== currentTransition.name) {
      this.setState({
        transitionResult: transformWithoutNameCollision(name + ".glsl", glsl),
      });
    }
  }

  onTransitionParamsChange = (transitionParams: *) => {
    this.setState({ transitionParams });
  };

  onFragChange = (glsl: string) => {
    setQuery(this.props, { glsl });
  };

  onFileNameChange = ({ target: { value: name } }: *) => {
    setQuery(this.props, { name });
  };

  render() {
    const { transitionResult, transitionParams } = this.state;
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
        transitionParams={transitionParams}
        onTransitionParamsChange={this.onTransitionParamsChange}
        asideHead={
          <label className="tname">
            <input
              className={`transition-name ${invalidFilename ? "error" : ""}`}
              type="text"
              placeholder="Transition Name"
              autoFocus={!!invalidFilename}
              onFocus={selectEventTarget}
              value={name}
              onChange={this.onFileNameChange}
              maxLength={40}
            />
            <span className="transition-name-extension">.glsl</span>
          </label>
        }
        actionBtn={
          <PrimaryBtn
            disabled={transitionResult.errors.length > 0}
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
          </PrimaryBtn>
        }
      />
    );
  }
}
