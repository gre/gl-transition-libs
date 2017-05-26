import React, { PureComponent } from "react";
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

export default class GlslCode extends PureComponent {
  props: {
    code: string,
  };

  render() {
    const { code } = this.props;
    return (
      <pre
        className="GlslCode glsl-token-usage hljs"
        dangerouslySetInnerHTML={{
          __html: highlightGlslHTML(code),
        }}
      />
    );
  }
}
