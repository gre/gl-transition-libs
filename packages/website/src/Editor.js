//@flow
import React, { Component, PropTypes } from "react";
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
  errors: Array<*>,
  transition: Transition,
  compilation: *,
  transitionParams: *,
  onFragChange: (glsl: string) => void,
  onTransitionParamsChange: (params: *) => void,
  children?: *,
  actionBtn: *,
  asideHead: *,
};

type State = {
  token: *,
};

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

  onCursorTokenChange = (token: *) => {
    this.setState({ token });
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
      transitionParams,
      onTransitionParamsChange,
      asideHead,
      actionBtn,
    } = this.props;
    const { token } = this.state;

    const shaderCompiles = !errors.some(e => e.code === "WebGL_error");

    if (!shaderCompiles) console.log(errors);

    return (
      <div className="Editor">
        <div className="Editor-body">
          <div className="leftpanel">
            <div className="head">
              {asideHead}
            </div>
            <div className="section">
              <div className="stats">
                <CompilationStats compilation={compilation} />
              </div>
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
                    values={{
                      ...transition.defaultParams,
                      ...transitionParams,
                    }}
                    onChange={onTransitionParamsChange}
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
            <div className="editor-action">
              {actionBtn}
            </div>
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
