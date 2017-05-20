import React, { Component } from "react";
import escapeTextContentForBrowser
  from "react-dom/lib/escapeTextContentForBrowser";
import hljs from "highlight.js";

const highlightGlslHTML = glsl => {
  try {
    return hljs.highlight("glsl", glsl).value;
  } catch (e) {
    return escapeTextContentForBrowser(glsl);
  }
};

export default class GlslCode extends Component {
  props: {
    code: string,
  };

  render() {
    const { code } = this.props;
    return (
      <div
        className="glsl-token-usage hljs"
        dangerouslySetInnerHTML={{
          __html: highlightGlslHTML(code),
        }}
      />
    );
  }
}
