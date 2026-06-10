import React, { Component, createRef } from "react";
import "./GlslEditor.css";
const { ace } = window;
ace.require("ace/ext/language_tools");

export default class GlslEditor extends Component {
  rootRef = createRef();
  marker = null;
  markerLine = null;
  editor = null;
  session = null;
  value = this.props.value;

  componentDidMount() {
    const editor = ace.edit(this.rootRef.current);
    editor.setOptions({
      enableBasicAutocompletion: true,
    });
    editor.setFontSize("14px");
    editor.setShowPrintMargin(false);
    editor.setTheme("ace/theme/solarized_light");
    editor.commands.removeCommands(["gotoline"]);

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

  componentDidUpdate(prevProps) {
    // only sync on a real external value change: router v7 navigations are
    // async (startTransition), so a re-render can still carry the pre-keystroke
    // value and syncing it would revert what is being typed
    if (
      this.props.value !== prevProps.value &&
      this.props.value !== this.value
    ) {
      this.session.setValue((this.value = this.props.value));
    }
    this.setMarker(this.props);
  }

  setMarker({ errors }) {
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
    return <div ref={this.rootRef} className="glsl-editor" />;
  }
}
