//@flow
import React, { Component } from "react";
import "./PrimaryBtn.css";

export default class ActionBtn extends Component {
  render() {
    const { children, disabled, href } = this.props;
    return (
      <a
        className={["primary-btn", disabled ? "disabled" : ""].join(" ")}
        target="_blank"
        rel="noopener noreferrer"
        href={href}
      >
        {children}
      </a>
    );
  }
}
