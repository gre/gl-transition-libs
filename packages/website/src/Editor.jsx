import React, { Component } from "react";
import UniformsEditor from "./UniformsEditor";
import AnimatedVignette from "./AnimatedVignette";
import GlslContextualHelp from "./GlslContextualHelp";
import GlslEditor from "./GlslEditor";
import EditorStatusBar from "./EditorStatusBar";
import CompilationStats from "./CompilationStats";
import GlslCode from "./GlslCode";
import TexturePicker from "./TexturePicker";
import img1 from "./images/512x400/barley.jpg";
import img2 from "./images/512x400/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg";
import img3 from "./images/512x400/bigbuckbunny_snapshot1.jpg";
import "./Editor.css";

const images = [img1, img2, img3];

export default class Editor extends Component {
  state = {
    token: null,
  };

  renderSampler2DInput = ({ id, value, onChange }) => (
    <TexturePicker key={id} onChange={onChange} value={value} />
  );

  renderNoUniforms = () => {
    return (
      <blockquote className="no-uniforms">
        <strong>Want more customizable transition?</strong>
        <div>
          <em>
            define transition parameters by declaring uniforms in the shader. Example:
          </em>
        </div>
        <div>
          <GlslCode code="uniform float value;" />
        </div>
      </blockquote>
    );
  };

  onCursorTokenChange = (token) => {
    this.setState({ token });
  };

  labelStyle = (highlight, hover) => ({
    color: highlight ? "#fc6" : hover ? "#fff" : "#d6d6da",
    fontSize: "12px",
    lineHeight: "24px",
    fontFamily: "Monoid, Monaco, monospace",
  });

  inputStyle = (focus, hover, { primitiveType }) =>
    primitiveType === "bool"
      ? {}
      : {
          fontSize: "12px",
          fontFamily: "Monoid, Monaco, monospace",
          color: "#ececec",
          background: "#0b0b0d",
          lineHeight: "22px",
          padding: "0 6px",
          margin: "0",
          border: "1px solid " + (focus ? "#fc6" : hover ? "#5a5a62" : "#3a3a40"),
          borderRadius: "4px",
          outline: "none",
          boxShadow: "none",
        };

  render() {
    const {
      errors,
      transition,
      compilation,
      onFragChange,
      transitionParams,
      onTransitionParamsChange,
      asideHead,
      actionBtn,
      children,
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
              <AnimatedVignette
                transitions={[transition]}
                transitionsParams={[transitionParams]}
                images={images}
                width={256}
                height={200}
                duration={4000}
                delay={500}
              />
              {shaderCompiles
                ? <UniformsEditor
                    className="uniforms-editor"
                    style={{ margin: "20px 0 20px -100px" }}
                    types={transition.paramsTypes}
                    values={{
                      ...transition.defaultParams,
                      ...transitionParams,
                    }}
                    onChange={onTransitionParamsChange}
                    width={356}
                    renderSampler2DInput={this.renderSampler2DInput}
                    renderNoUniforms={this.renderNoUniforms}
                    labelStyle={this.labelStyle}
                    inputStyle={this.inputStyle}
                  />
                : null}
            </div>
            <div className="section">
              <GlslContextualHelp token={token} />
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
        {children}
      </div>
    );
  }
}
