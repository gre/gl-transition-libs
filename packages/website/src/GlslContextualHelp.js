import React, { Component } from "react";
import glsldoc from "glsldoc";
import GlslCode from "./GlslCode";
import "./GlslContextualHelp.css";

const GlslDocumentation = glsldoc.concat([
  {
    type: "function",
    name: "getFromColor",
    usage: "vec4 c = getFromColor(uv)",
    description: "Get the color of the 'from' image at a given coordinate",
  },
  {
    type: "function",
    name: "getToColor",
    usage: "vec4 c = getToColor(uv)",
    description: "Get the color of the 'to' image at a given coordinate",
  },
  {
    type: "transition uniform",
    name: "progress",
    usage: "uniform float progress;",
    description: "The 'progress' moves from 0.0 to 1.0 during a transition. It is the only way to make your GLSL Transition animated.",
  },
  {
    type: "transition uniform",
    name: "ratio",
    usage: "uniform float ratio;",
    description: "A that corresponds to width/height",
  },
]);

const GlslDocumentationIndexedPerName = {};
GlslDocumentation.forEach(d => {
  GlslDocumentationIndexedPerName[d.name] = (GlslDocumentationIndexedPerName[
    d.name
  ] || [])
    .concat(d);
});

const prettyType = str => str.replace(/_/g, " ");

function findDocumentation(token) {
  var matches = GlslDocumentationIndexedPerName[token.value];
  if (!matches) return null;
  return matches[0]; // We may not have collision. Otherwise we can figure out some heuristics
}

export default class GlslContextualHelp extends Component {
  props: {
    token: ?{
      type: string,
      value: string,
    },
  };

  render() {
    const { token } = this.props;
    var documentation = token && findDocumentation(token);

    return !documentation
      ? null
      : <div className="glsl-documentation">
          <p className="glsl-token-type-name">
            <span className="glsl-token-type">
              {prettyType(documentation.type)}
            </span>
            <span className="glsl-token-name">{documentation.name}</span>
          </p>
          {!documentation.usage ? "" : <GlslCode code={documentation.usage} />}
          <p className="glsl-token-description">{documentation.description}</p>
        </div>;
  }
}
