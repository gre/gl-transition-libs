//@flow
import React, { Component } from "react";
import { Visitor } from "gl-react";
import { Surface } from "gl-react-dom";
import GLTransition from "react-gl-transition";
import "./Vignette.css";

const initialProgress = 0.4;

class SurfaceVisitor extends Visitor {
  vignette: Vignette;
  constructor(vignette: *) {
    super();
    this.vignette = vignette;
  }
  onSurfaceDrawEnd() {
    if (this.vignette.state.failing) {
      this.vignette.setState({ failing: null });
    }
  }
  onSurfaceDrawError(failing: Error) {
    if (!this.vignette.state.failing) {
      this.vignette.setState({ failing });
    }
    return true;
  }
}

export default class Vignette extends Component {
  props: {
    transition: *,
    transitionParams?: Object,
    from: string,
    to: string,
    width: number,
    height: number,
    children?: *,
  };
  visitor = new SurfaceVisitor(this);
  static defaultProps = {
    width: 300,
    height: 200,
  };
  state: {
    progress: number,
    hover: boolean,
    failing: ?Object,
  } = {
    progress: initialProgress,
    hover: false,
    failing: null,
  };
  progressFromEvent = (e: *) => {
    const rect = e.target.getBoundingClientRect();
    return (e.clientX - rect.left) / rect.width;
  };
  onMouseEnter = (e: *) => {
    this.setState({
      progress: this.progressFromEvent(e),
      hover: true,
    });
  };
  onMouseMove = (e: *) => {
    this.setState({
      progress: this.progressFromEvent(e),
    });
  };
  onMouseLeave = () => {
    this.setState({
      progress: initialProgress,
      hover: false,
    });
  };
  render() {
    const {
      transition,
      transitionParams,
      from,
      to,
      width,
      height,
      children,
    } = this.props;
    const { hover, progress, failing } = this.state;
    return (
      <div
        onMouseMove={this.onMouseMove}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        className={[
          "vignette",
          hover ? "hover" : "",
          failing ? "failing" : "",
        ].join(" ")}
        style={{ width, height }}
      >
        <Surface width={width} height={height} visitor={this.visitor}>
          <GLTransition
            transition={transition}
            transitionParams={transitionParams}
            from={from}
            to={to}
            progress={progress}
          />
        </Surface>
        {children}
        <div
          className="cursor"
          style={{ left: (progress * 100).toFixed(2) + "%" }}
        />
        {failing
          ? <div className="failing">
              <i className="fa fa-warning" />
              <p>{failing.message}</p>
            </div>
          : null}
      </div>
    );
  }
}
