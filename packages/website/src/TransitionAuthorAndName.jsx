import React, { Component } from "react";
import { githubRepoFolder, githubRepoPath } from "./conf";
import { FaGithub } from "react-icons/fa";
import "./TransitionAuthorAndName.css";

// drops the "<email>" or "(url)" that follows some authors' names
export const authorDisplayName = (author) =>
  (author || "").replace(/[<(].*$/, "").trim() || author || "";

export default class TransitionAuthorAndName extends Component {
  shouldComponentUpdate({ transition }) {
    const { author, name } = this.props.transition;
    return author !== transition.author || name !== transition.name;
  }
  render() {
    const { withGithubLink, transition } = this.props;
    const { name } = transition;
    const author = authorDisplayName(transition.author);
    if (withGithubLink) {
      const fileHref =
        "https://github.com/" +
        githubRepoPath +
        "/tree/master" +
        githubRepoFolder +
        "/" +
        name +
        ".glsl";
      return (
        <a
          className="TransitionAuthorAndName"
          href={fileHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub /> <strong>{name}</strong>{" "}
          <em title={transition.author}>{author}</em>
        </a>
      );
    } else {
      return (
        <span className="TransitionAuthorAndName">
          <strong>{name}</strong> <em>{author}</em>
        </span>
      );
    }
  }
}
