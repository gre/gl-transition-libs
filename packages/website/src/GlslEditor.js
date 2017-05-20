//@flow
import React, { Component } from "react";
const { ace } = window;
ace.require("ace/ext/language_tools");
import "./GlslEditor.css";

export default class GlslEditor extends Component {
  props: {
    value: string,
    onChange: Function,
    onCursorTokenChange: Function,
    errors: Array<*>,
  };

  marker: *;
  markerLine: ?number = null;
  editor: *;
  session: *;
  value: string = this.props.value;

  componentDidMount() {
    const { root } = this.refs;

    const editor = ace.edit(root);
    editor.setOptions({
      enableBasicAutocompletion: true,
    });
    editor.setFontSize("14px");
    editor.setShowPrintMargin(false);
    editor.setTheme("ace/theme/solarized_light");

    const session = editor.getSession();
    session.setTabSize(2);
    session.setMode("ace/mode/glsl");
    session.setUseWrapMode(true);
    session.setValue(this.props.value);
    session.on("change", () => {
      this.props.onChange((this.value = session.getValue()));
    });

    let lastToken = null;
    const onCursorTokenChange = (e, selection) => {
      const p = selection.getRange().end;
      const token = session.getTokenAt(p.row, p.column);
      if (lastToken !== token) {
        lastToken = token;
        this.props.onCursorTokenChange(token);
      }
    };
    session.selection.on("changeSelection", onCursorTokenChange);
    session.selection.on("changeCursor", onCursorTokenChange);

    this.session = session;
    this.editor = editor;

    this.setMarker(this.props);
  }

  componentWillUnmount() {
    this.editor.destroy();
  }

  componentWillReceiveProps(props: *) {
    if (props.value !== this.value) {
      // value have changed from the tracked value.
      this.session.setValue(props.value);
    }
    this.setMarker(props);
  }

  setMarker({ errors }: *) {
    const markerError = errors.find(e => "line" in e);
    const markerLine = markerError ? markerError.line : null;
    if (markerLine !== this.markerLine) {
      let { marker } = this;
      if (marker) {
        this.session.removeMarker(marker.id);
        marker = null;
      }
      if (markerLine && markerError) {
        marker = this.session.highlightLines(
          markerLine - 1,
          markerLine - 1,
          "ace_step " + markerError.type
        );
      }
      this.marker = marker;
      this.markerLine = markerLine;
    }
  }

  render() {
    return <div ref="root" className="glsl-editor" />;
  }
}
