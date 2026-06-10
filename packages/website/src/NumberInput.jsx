import React, { Component } from "react";
// React have issues with input type=number – some workaround here

function isValidNumber(text) {
  return text && !isNaN(text) && text[text.length - 1] !== ".";
}

export default class NumberInput extends Component {
  static defaultProps = {
    step: 1,
  };
  state = { value: this.props.value };

  onChange = (e) => {
    var inputValue = e.target.value;
    this.setState({
      value: inputValue,
    });
    if (isValidNumber(inputValue)) this.props.onChange(e);
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.value !== prevProps.value &&
      this.props.value !== parseFloat(this.state.value)
    ) {
      this.setState({
        value: this.props.value,
      });
    }
  }

  render() {
    const props = {
      ...this.props,
      type: "number",
      value: "" + this.state.value,
      onChange: this.onChange,
    };
    return <input {...props} />;
  }
}
