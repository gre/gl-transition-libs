//@flow
import React from "react";
import UniformEditor from "./UniformEditor";

export default class UniformsEditor extends React.Component {
  props: {
    onChange: (value: *) => void,
    types: *,
    values: *,
    width: number,
    labelsWidth: number,
    uniformInputMargin: number,
    inputStyle: Function,
    labelStyle: Function,
    style: *,
    renderNoUniforms: Function,
    renderSampler2DInput: Function,
  };
  static defaultProps = {
    width: 300,
    labelsWidth: 100,
    values: {},
    uniformInputMargin: 6,
    labelStyle: (highlight, hover) => ({
      color: highlight ? "#49f" : hover ? "#9cf" : "#579",
      fontSize: "12px",
      lineHeight: "20px",
      fontFamily: "Monaco, monospace",
    }),
    inputStyle: (focus, hover, { primitiveType }) =>
      primitiveType === "bool"
        ? {}
        : {
            color: "#579",
            fontSize: "12px",
            fontFamily: "Monaco, monospace",
            lineHeight: "16px",
            padding: "0 3px",
            margin: "0",
            border: "1px solid " + (focus ? "#49F" : hover ? "#9cf" : "#eee"),
            outline: focus ? "#49F 1px solid" : "none",
            boxShadow: focus ? "0px 0px 2px #49F" : "none",
          },
    style: {},
    renderSampler2DInput(props) {
      // The Sampler2D can be enhanced for more "validation" and with a context.
      const onChange = e => {
        const value = e.target.value || null;
        props.onChange(value);
      };
      return <input {...props} type="url" onChange={onChange} />;
    },
    renderNoUniforms() {
      return <div>no uniforms.</div>;
    },
  };

  onUniformChange(u, value, index) {
    const uniformValues = { ...this.props.values };
    if (index !== null) {
      const current = [...uniformValues[u]];
      current[index] = value;
      uniformValues[u] = current;
    } else {
      uniformValues[u] = value;
    }
    this.props.onChange(uniformValues);
  }

  render() {
    const {
      types,
      values,
      width,
      labelsWidth,
      inputStyle,
      labelStyle,
      uniformInputMargin,
      renderSampler2DInput,
      style,
      renderNoUniforms,
    } = this.props;

    const styles = { ...style, width: width + "px" };

    const uniforms = Object.keys(types).map(u => {
      const type = types[u];
      const value = values[u];
      return (
        <UniformEditor
          key={u}
          id={u}
          type={type}
          name={u}
          value={value}
          onChange={this.onUniformChange.bind(this, u)}
          width={width}
          labelsWidth={labelsWidth}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
          uniformInputMargin={uniformInputMargin}
          renderSampler2DInput={renderSampler2DInput}
        />
      );
    });

    if (uniforms.length) {
      return <div style={styles}>{uniforms}</div>;
    } else {
      return (
        <div style={styles}>
          {renderNoUniforms()}
        </div>
      );
    }
  }
}
