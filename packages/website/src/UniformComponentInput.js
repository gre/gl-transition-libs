//@flow
import React, { Component } from "react";
import NumberInput from "./NumberInput";

const primitiveTypes: { [_: string]: * } = {
  float: {
    type: "number",
    step: 0.1,
    value: 0.0,
    get: (input: { value: string }) => parseFloat(input.value, 10),
  },
  int: {
    type: "number",
    step: 1,
    value: 0,
    get: (input: { value: string }) => parseInt(input.value, 10),
  },
  bool: {
    type: "checkbox",
    checked: false,
    get: (input: { checked: boolean }) => input.checked,
  },
};

export default class UniformComponentInput extends Component {
  props: {
    value: *,
    onChange: (value: *) => void,
    primitiveType: string,
    renderSampler2DInput: Function,
  };
  onChange = (e: {
    target: HTMLInputElement,
    checked: boolean,
    value: string,
  }) => {
    var primitive = primitiveTypes[this.props.primitiveType];
    var value = primitive ? primitive.get(e.target) : e;
    if (value !== this.props.value) {
      this.props.onChange(value);
    }
  };

  render() {
    const { primitiveType, value, renderSampler2DInput, ...rest } = this.props;
    if (primitiveType === "sampler2D") {
      return renderSampler2DInput({ ...rest, value });
    } else {
      const primitive = primitiveTypes[primitiveType];
      var props: { [_: string]: * } = {
        type: primitive.type,
        onChange: this.onChange,
      };
      if ("step" in primitive) props.step = primitive.step;
      if ("checked" in primitive) props.checked = value || primitive.checked;
      else props.value = value || primitive.value;
      props = { ...rest, ...props };
      if (props.type === "number") return <NumberInput {...props} />;
      else return <input {...props} />;
    }
  }
}
