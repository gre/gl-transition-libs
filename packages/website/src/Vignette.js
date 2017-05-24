//@flow
import React, { Component } from "react";
import { Visitor } from "gl-react";
import { Surface } from "gl-react-dom";
import GLTransition from "react-gl-transition";
import "./Vignette.css";

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

const hoverValueFromEvent = (e: *) => {
  const rect = e.target.getBoundingClientRect();
  return (e.clientX - rect.left) / rect.width;
};

export default class Vignette extends Component {
  props: {
    transition: *,
    transitionParams?: Object,
    from: string,
    to: string,
    width: number,
    height: number,
    children?: *,
    Footer?: *,
    onHoverIn?: Function,
    onHoverOut?: Function,
    interaction?: boolean,
  };
  visitor = new SurfaceVisitor(this);
  static defaultProps = {
    width: 300,
    height: 200,
    interaction: true,
  };
  state: {
    hoverValue: number,
    hover: boolean,
    failing: ?Object,
  } = {
    hoverValue: 0,
    hover: false,
    failing: null,
  };

  componentWillReceiveProps({ onHoverOut, interaction }: *, { hover }: *) {
    if (interaction && hover) {
      this.setState({ hover: false });
      if (onHoverOut) onHoverOut();
    }
  }

  _setProgress: ?(progress: number) => void = null;
  onRef = (glt: GLTransition) => {
    this._setProgress = glt && glt.getComponent().setProgress;
  };

  _cachedProgress: number = 0.3;
  getProgress = () => this._cachedProgress;
  setProgress = (progress: number) => {
    if (this._cachedProgress === progress) return;
    this._cachedProgress = progress;
    if (this._setProgress && !this.state.failing) {
      this._setProgress(progress);
    }
  };

  onMouseEnter = (e: *) => {
    this.setState({
      hoverValue: hoverValueFromEvent(e),
      hover: true,
    });
    const { onHoverIn } = this.props;
    if (onHoverIn) onHoverIn();
  };
  onMouseMove = (e: *) => {
    const hoverValue = hoverValueFromEvent(e);
    this._cachedProgress = Math.max(0, Math.min(-0.1 + hoverValue / 0.8, 1));
    this.setState({ hoverValue });
  };
  onMouseLeave = () => {
    this.setState({
      hover: false,
    });
    const { onHoverOut } = this.props;
    if (onHoverOut) onHoverOut();
  };
  render() {
    const {
      transition,
      transitionParams,
      from,
      to,
      width,
      height,
      Footer,
      interaction,
    } = this.props;
    const { hover, hoverValue, failing } = this.state;
    const progress = this.getProgress();
    return (
      <div
        onMouseMove={interaction ? this.onMouseMove : null}
        onMouseEnter={interaction ? this.onMouseEnter : null}
        onMouseLeave={interaction ? this.onMouseLeave : null}
        className={[
          "vignette",
          hover ? "hover" : "",
          failing ? "failing" : "",
        ].join(" ")}
        style={{ width, height }}
      >
        <Surface width={width} height={height} visitor={this.visitor}>
          <GLTransition
            ref={this.onRef}
            transition={transition}
            transitionParams={transitionParams}
            from={from}
            to={to}
            progress={progress}
          />
        </Surface>
        {Footer ? <Footer transition={transition} /> : null}
        <div
          className="cursor"
          style={{ left: (hoverValue * 100).toFixed(2) + "%" }}
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
