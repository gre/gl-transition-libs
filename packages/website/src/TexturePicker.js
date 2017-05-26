//@flow
import React, { Component } from "react";
import textures from "./textures/luma";
import "./TexturePicker.css";

export default class TexturePicker extends Component {
  props: {
    onChange: Function,
    value: string,
  };
  state = {
    opened: false,
  };

  onPickerLeave = () => {
    this.setState({
      opened: false,
    });
  };

  openPicker = () => {
    this.setState({
      opened: true,
    });
  };

  onURLChange = (e: *) => {
    this.props.onChange(e.target.value);
  };

  onPickerChoice = (url: string) => {
    this.setState({
      opened: false,
    });
    return this.props.onChange(url);
  };

  render() {
    const { opened } = this.state;
    const value = this.props.value;
    return (
      <div className="texture-picker">
        <input
          className="picker-input"
          value={value}
          onChange={this.onURLChange}
          type="url"
        />
        <img
          src={value}
          key="overview"
          className="overview"
          onClick={this.openPicker}
        />
        {opened
          ? <div className="bg-overlay" onClick={this.onPickerLeave} />
          : null}
        <div className={"picker with-overlay" + (opened ? " visible" : "")}>
          {textures.map(url => {
            const isCurrent = url === value;
            return (
              <img
                key={url}
                src={url}
                className={"texture" + (isCurrent ? " current" : "")}
                onClick={() => this.onPickerChoice(url)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
