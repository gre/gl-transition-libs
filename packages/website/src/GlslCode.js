import React, { PureComponent } from "react";
import hljs from "highlight.js";

const matchHtmlRegExp = /["'&<>]/;

function escapeHtml(string) {
  const str = "" + string;
  const match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  let escape;
  let html = "";
  let index;
  let lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 39: // '
        escape = "&#x27;"; // modified from escape-html; used to be '&#39'
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}

function escapeTextForBrowser(text) {
  if (typeof text === "boolean" || typeof text === "number") {
    return "" + text;
  }
  return escapeHtml(text);
}

const highlightGlslHTML = glsl => {
  try {
    return hljs.highlight("glsl", glsl).value;
  } catch (e) {
    return escapeTextForBrowser(glsl);
  }
};

export default class GlslCode extends PureComponent {
  props: {
    code: string
  };

  render() {
    const { code } = this.props;
    return (
      <pre
        className="GlslCode glsl-token-usage hljs"
        dangerouslySetInnerHTML={{
          __html: highlightGlslHTML(code)
        }}
      />
    );
  }
}
