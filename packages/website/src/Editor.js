//@flow
import React, { Component } from "react";
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
  onFragChange: (glsl: string) => void,
  children?: *,
};

type State = {
  transitionParams: Object,
  lastCompilingTransition: Transition,
  token: *,
};

export default class Editor extends Component {
  props: Props;
  state: State = {
    transitionParams: this.props.transition.defaultParams,
    lastCompilingTransition: this.props.transition,
    token: null,
  };

  componentWillReceiveProps(props: Props) {
    this.setState((state: State) => {
      let { transitionParams, lastCompilingTransition } = state;
      let mutation;

      const compilationErrors = props.errors.filter(
        e => e.code === "WebGL_error"
      );
      if (compilationErrors.length === 0) {
        lastCompilingTransition = props.transition;
        mutation = {
          ...mutation,
          lastCompilingTransition,
        };
      }

      const newDefaultParams = lastCompilingTransition.defaultParams;
      const oldDefaultParams = this.props.transition.defaultParams;
      if (newDefaultParams !== oldDefaultParams) {
        // synchronise the params
        transitionParams = { ...transitionParams };
        for (let key in oldDefaultParams) {
          if (!(key in newDefaultParams)) {
            // key was removed !
            delete transitionParams[key];
          }
        }
        for (let key in newDefaultParams) {
          if (!(key in oldDefaultParams)) {
            // key was added !
            transitionParams[key] = newDefaultParams[key];
          }
        }
        mutation = { ...mutation, transitionParams };
      }
      return mutation;
    });
  }

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
    this.setState({ transitionParams });
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
    } = this.props;
    const { lastCompilingTransition, transitionParams, token } = this.state;

    return (
      <div className="Editor">
        {children}
        <div className="Editor-body">
          <div className="stats">
            <CompilationStats compilation={compilation} />
          </div>
          <div className="leftpanel">
            <Vignette
              transition={transition}
              from={fromImage}
              to={toImage}
              transitionParams={transitionParams}
              width={256}
              height={200}
            />
            <GlslUniformsEditor
              className="uniforms-editor"
              style={{ margin: "20px 0 20px -100px" }}
              types={lastCompilingTransition.paramsTypes}
              values={transitionParams}
              onChange={this.onTransitionParamsChange}
              width={356}
              renderNoUniforms={this.renderNoUniforms}
              labelStyle={this.labelStyle}
              inputStyle={this.inputStyle}
            />
            <div style={{ flex: 1 }} />
            <GlslContextualHelp token={token} />
            <div style={{ flex: 2 }} />
            <div className="links">
              <a
                href="https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf"
                target="_blank"
              >
                <i className="fa fa-book" />
                GLSL Spec.
              </a>
              <a
                href="https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf"
                target="_blank"
              >
                <i className="fa fa-file-code-o" />
                Quick Ref.
              </a>
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
