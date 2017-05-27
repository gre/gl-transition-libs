import React, { Component } from "react";
import URL from "url";
import { githubRepoFolder, githubRepoPath } from "./conf";
import "./TransitionAuthorAndName.css";

export default class TransitionAuthorAndName extends Component {
  shouldComponentUpdate({ transition }) {
    const { author, name } = this.props.transition;
    return author !== transition.author || name !== transition.name;
  }
  render() {
    const { withGithubLink, transition } = this.props;
    let { name, author } = transition;
    const m = author.match(/^([^<]+).*$/);
    if (m) {
      const first = m[1].trim();
      if (first) {
        author = first;
      }
    }
    if (withGithubLink) {
      const fileHref = URL.format({
        pathname: "https://github.com/" +
          githubRepoPath +
          "/tree/master" +
          githubRepoFolder +
          "/" +
          name +
          ".glsl",
      });
      return (
        <a
          className="TransitionAuthorAndName"
          href={fileHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa fa-github" />
          {" "}
          <strong>{name}</strong>
          {" "}
          by
          {" "}
          <em title={transition.author}>{author}</em>
        </a>
      );
    } else {
      return (
        <span className="TransitionAuthorAndName">
          <strong>{name}</strong> by <em>{author}</em>
        </span>
      );
    }
  }
}
