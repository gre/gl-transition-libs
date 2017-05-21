//@flow
import React, { Component, PropTypes } from "react";
import querystring from "querystring";
import GlslUniformsEditor from "glsl-uniforms-editor";
import Vignette from "./Vignette";
import GlslContextualHelp from "./GlslContextualHelp";
import GlslEditor from "./GlslEditor";
import EditorStatusBar from "./EditorStatusBar";
import CompilationStats from "./CompilationStats";
import GlslCode from "./GlslCode";
import fromImage from "./images/512x400/barley.jpg";
import toImage from "./images/512x400/pHyYeNZMRFOIRpYeW7X3_manacloseup.jpg";
import "./Editor.css";

type Transition = {
  glsl: string,
  defaultParams: *,
  paramsTypes: *,
};

type Props = {
  history: *,
  location: *,
  errors: Array<*>,
  transition: Transition,
  compilation: *,
  onFragChange: (glsl: string) => void,
  children?: *,
};

type State = {
  token: *,
};

function getQuery({ location }) {
  if (!location.search) return {};
  const obj = querystring.parse(location.search.slice(1));
  const query = {};
  Object.keys(obj).forEach(key => {
    try {
      query[key] = JSON.parse(obj[key]);
    } catch (e) {}
  });
  return query;
}
function setQuery({ location, history }, query) {
  const obj = {};
  Object.keys(query).forEach(key => {
    obj[key] = JSON.stringify(query[key]);
  });
  history.replace({
    pathname: location.pathname,
    search: querystring.stringify(obj),
  });
}

export default class Editor extends Component {
  props: Props;
  state: State = {
    token: null,
  };

  renderNoUniforms = () => {
    return (
      <blockquote className="no-uniforms">
        <strong>Want more customizable transition?</strong>
        <p>
          <em>
            define transition parameters by declaring uniforms in the shader. Example:
          </em>
        </p>
        <p>
          <GlslCode code="uniform float value;" />
        </p>
      </blockquote>
    );
  };

  onTransitionParamsChange = (transitionParams: *) => {
    this.setTransitionParams(transitionParams);
  };

  onCursorTokenChange = (token: *) => {
    this.setState({ token });
  };

  setTransitionParams = (transitionParams: *) => {
    setQuery(this.props, transitionParams);
  };

  labelStyle = (highlight: boolean, hover: boolean) => ({
    color: highlight ? "#fc6" : hover ? "#ccc" : "#fff",
    fontSize: "12px",
    lineHeight: "20px",
    fontFamily: "Monaco, monospace",
  });

  inputStyle = (focus: boolean, hover: boolean, { primitiveType }: *) =>
    primitiveType === "bool"
      ? {}
      : {
          fontSize: "12px",
          fontFamily: "Monaco, monospace",
          color: "#333",
          lineHeight: "16px",
          padding: "0 5px",
          margin: "0",
          outline: "none",
          boxShadow: "none",
        };

  render() {
    const {
      children,
      errors,
      transition,
      compilation,
      onFragChange,
    } = this.props;
    const { token } = this.state;
    const transitionParams = {
      ...transition.defaultParams,
      ...getQuery(this.props),
    };

    const shaderCompiles = !errors.some(e => e.code === "WebGL_error");

    if (!shaderCompiles) console.log(errors);

    return (
      <div className="Editor">
        {children}
        <div className="Editor-body">
          <div className="stats">
            <CompilationStats compilation={compilation} />
          </div>
          <div className="leftpanel">
            <div className="section">
              <Vignette
                transition={transition}
                from={fromImage}
                to={toImage}
                transitionParams={transitionParams}
                width={256}
                height={200}
              />
              {shaderCompiles
                ? <GlslUniformsEditor
                    className="uniforms-editor"
                    style={{ margin: "20px 0 20px -100px" }}
                    types={transition.paramsTypes}
                    values={transitionParams}
                    onChange={this.onTransitionParamsChange}
                    width={356}
                    renderNoUniforms={this.renderNoUniforms}
                    labelStyle={this.labelStyle}
                    inputStyle={this.inputStyle}
                  />
                : null}
            </div>
            <div className="section">
              <GlslContextualHelp token={token} />
              <div className="links">
                <a
                  href="https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-book" />
                  GLSL Spec.
                </a>
                <a
                  href="https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-file-code-o" />
                  Quick Ref.
                </a>
              </div>
            </div>
          </div>
          <div className="main">
            <GlslEditor
              value={transition.glsl}
              errors={errors}
              onChange={onFragChange}
              onCursorTokenChange={this.onCursorTokenChange}
            />
            <EditorStatusBar errors={errors} />
          </div>
        </div>
      </div>
    );
  }
}
