//@flow
import React, { Component } from "react";
import { Visitor } from "gl-react";
import { Surface } from "gl-react-dom";
import GLTransition from "react-gl-transition";
import FaExclamationTriangle from "react-icons/lib/fa/exclamation-triangle";
import "./Vignette.css";

const defaultProgress = 0.3;

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
    easing?: (x: number) => number,
    children?: *,
    Footer?: *,
    onHoverIn?: Function,
    onHoverOut?: Function,
    interaction?: boolean,
    onDrawWithProgress?: (x: number) => void,
    preload?: Array<*>
  };
  visitor = new SurfaceVisitor(this);
  static defaultProps = {
    width: 300,
    height: 200,
    interaction: true
  };
  state: {
    hoverValue: number,
    hover: boolean,
    failing: ?Object
  } = {
    hoverValue: 0,
    hover: false,
    failing: null
  };

  componentDidMount() {
    const { onDrawWithProgress } = this.props;
    if (onDrawWithProgress) onDrawWithProgress(this.getProgress());
  }

  componentWillReceiveProps({ onHoverOut, interaction }: *, { hover }: *) {
    if (interaction && hover) {
      this.setState({ hover: false });
      if (onHoverOut) onHoverOut();
    }
  }

  componentDidUpdate() {
    const { onDrawWithProgress } = this.props;
    if (onDrawWithProgress) onDrawWithProgress(this.getProgress());
  }

  _setProgress: ?(progress: number) => void = null;
  onRef = (glt: *) => {
    this._setProgress = glt && glt.setProgress;
  };

  _cachedProgress: number = defaultProgress;
  getProgress = (): number => this._cachedProgress;
  setProgress = (value: number, forceRendering: boolean = false) => {
    if (this._cachedProgress === value && !forceRendering) return;
    this._cachedProgress = value;
    const { _setProgress } = this;
    if (_setProgress && !this.state.failing) {
      const { easing, onDrawWithProgress } = this.props;
      _setProgress(easing ? easing(value) : value);
      if (onDrawWithProgress) onDrawWithProgress(value);
    }
  };

  onMouseEnter = (e: *) => {
    this.setState({
      hoverValue: hoverValueFromEvent(e),
      hover: true
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
      hover: false
    });
    const { onHoverOut } = this.props;
    if (!onHoverOut || onHoverOut() !== false) {
      this.setProgress(defaultProgress);
    }
  };
  render() {
    const {
      transition,
      transitionParams,
      easing,
      from,
      to,
      width,
      height,
      Footer,
      interaction,
      preload
    } = this.props;
    const { hover, hoverValue, failing } = this.state;
    const pvalue = this.getProgress();
    const progress = easing ? easing(pvalue) : pvalue;
    return (
      <div
        className={[
          "vignette",
          hover ? "hover" : "",
          failing ? "failing" : ""
        ].join(" ")}
        style={{ width, height }}
      >
        <Surface
          onMouseMove={interaction ? this.onMouseMove : null}
          onMouseEnter={interaction ? this.onMouseEnter : null}
          onMouseLeave={interaction ? this.onMouseLeave : null}
          width={width}
          height={height}
          visitor={this.visitor}
          preload={preload}
        >
          <GLTransition
            onConnectSizeComponentRef={this.onRef}
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
        {failing ? (
          <div className="failing">
            <FaExclamationTriangle />
            <p>{failing.message}</p>
          </div>
        ) : null}
      </div>
    );
  }
}
