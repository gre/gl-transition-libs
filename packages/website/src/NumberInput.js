//@flow
import React, { Component } from "react";
// React have issues with input type=number – some workaround here

function isValidNumber(text) {
  return text && !isNaN(text) && text[text.length - 1] !== ".";
}

type Props = {
  value: number,
  onChange: (value: number) => void,
  step: number,
};
export default class NumberInput extends Component {
  props: Props;
  static defaultProps = {
    step: 1,
  };
  state = { value: this.props.value };

  onChange = (e: *) => {
    var inputValue = e.target.value;
    this.setState({
      value: inputValue,
    });
    if (isValidNumber(inputValue)) this.props.onChange(e);
  };

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.value !== this.props.value &&
      nextProps.value !== parseFloat(this.state.value, 10)
    ) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  render() {
    const props = {
      ...this.props,
      type: "string",
      value: "" + this.state.value,
      onChange: this.onChange,
    };
    return <input {...props} />;
  }
}
