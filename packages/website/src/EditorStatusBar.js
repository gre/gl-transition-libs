import React, { Component } from "react";
import "./EditorStatusBar.css";
export default class EditorStatusBar extends Component {
  props: {
    errors: Array<*>,
  };
  render() {
    const { errors } = this.props;
    // TODO: need to be able to tap on the bar to expand all the errors list
    let type, message;
    if (errors.length > 0) {
      const e = errors[0];
      type = e.type;
      message = (e.line ? "line " + e.line + ": " : "") + " " + e.message;
    } else {
      type = "success";
      message = "✔︎ GL Transition is valid!";
    }
    return (
      <div className={"editor-status-bar " + type} title={message}>
        {message}
      </div>
    );
  }
}
