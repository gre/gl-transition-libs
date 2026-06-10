import React, { Component, createRef } from "react";

import Grid from "./Grid.jsx";
import Handle from "./Handle.jsx";
import Progress from "./Progress.jsx";
import Curve from "./Curve.jsx";

function onEnterHandle(h) {
  if (!this.state.down) {
    this.setState({
      hover: h,
    });
  }
}
function onDownHandle(h, e) {
  e.preventDefault();
  this.setState({
    hover: null,
    down: h,
  });
}

function onLeaveHandle() {
  if (!this.state.down) {
    this.setState({
      hover: null,
    });
  }
}

export default class BezierEditor extends Component {
  static defaultProps = {
    value: [0.25, 0.25, 0.75, 0.75],
    width: 300,
    height: 300,
    padding: [25, 5, 25, 18],
    progress: 0,
    background: "#fff",
    color: "#000", // FIXME what is color?
    gridColor: "#eee",
    curveColor: "#333",
    progressColor: "#ccc",
    handleColor: "#f00",
    curveWidth: 2,
    handleRadius: 5,
    handleStroke: 2,
    textStyle: {
      fontFamily: "sans-serif",
      fontSize: "10px",
    },
    pointers: {
      down: "none",
      hover: "pointer",
      def: "default",
    },
  };

  state = {
    down: 0,
    hover: 0,
  };

  rootRef = createRef();

  onEnterHandle1 = onEnterHandle.bind(this, 1);
  onEnterHandle2 = onEnterHandle.bind(this, 2);
  onLeaveHandle1 = onLeaveHandle.bind(this, 1);
  onLeaveHandle2 = onLeaveHandle.bind(this, 2);
  onDownHandle1 = onDownHandle.bind(this, 1);
  onDownHandle2 = onDownHandle.bind(this, 2);

  onDownLeave = e => {
    if (this.state.down) {
      this.onDownMove(e);
      this.setState({
        down: null,
      });
    }
  };

  onDownMove = e => {
    if (this.state.down) {
      e.preventDefault();
      const i = 2 * (this.state.down - 1);
      const value = [].concat(this.props.value);
      const [x, y] = this.positionForEvent(e);
      value[i] = this.inversex(x);
      value[i + 1] = this.inversey(y);
      this.props.onChange(value);
    }
  };

  onDownUp = () => {
    // this.onDownMove(e);
    this.setState({
      down: 0,
    });
  };

  positionForEvent = e => {
    const rect = this.rootRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  x = value => {
    const padding = this.props.padding;
    const w = this.props.width - padding[1] - padding[3];
    return Math.round(padding[3] + value * w);
  };

  inversex = x => {
    const padding = this.props.padding;
    const w = this.props.width - padding[1] - padding[3];
    return Math.max(0, Math.min((x - padding[3]) / w, 1));
  };

  y = value => {
    const padding = this.props.padding;
    const h = this.props.height - padding[0] - padding[2];
    return Math.round(padding[0] + (1 - value) * h);
  };

  inversey = y => {
    const { height, handleRadius, padding } = this.props;
    const clampMargin = 2 * handleRadius;
    const h = height - padding[0] - padding[2];
    y = Math.max(clampMargin, Math.min(y, height - clampMargin));
    return 1 - (y - padding[0]) / h;
  };

  render() {
    const { x, y } = this;
    const {
      value,
      width,
      height,
      handleRadius,
      style,
      className,
      progress,
      handleStroke,
      background,
      gridColor,
      curveColor,
      curveWidth,
      handleColor,
      textStyle,
      progressColor,
      readOnly,
      pointers,
    } = this.props;

    const { down, hover } = this.state;

    const sharedProps = {
      xFrom: x(0),
      yFrom: y(0),
      xTo: x(1),
      yTo: y(1),
    };

    const cursor = { ...BezierEditor.defaultProps.pointers, ...pointers };

    const styles = {
      background,
      cursor: down ? cursor.down : hover ? cursor.hover : cursor.def,
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      ...style,
    };

    const containerEvents = readOnly || !down
      ? {}
      : {
          onMouseMove: this.onDownMove,
          onMouseUp: this.onDownUp,
          onMouseLeave: this.onDownLeave,
        };
    const handle1Events = readOnly || down
      ? {}
      : {
          onMouseDown: this.onDownHandle1,
          onMouseEnter: this.onEnterHandle1,
          onMouseLeave: this.onLeaveHandle1,
        };
    const handle2Events = readOnly || down
      ? {}
      : {
          onMouseDown: this.onDownHandle2,
          onMouseEnter: this.onEnterHandle2,
          onMouseLeave: this.onLeaveHandle2,
        };

    return (
      <svg
        ref={this.rootRef}
        className={className}
        style={styles}
        width={width}
        height={height}
        {...containerEvents}
      >
        <Grid
          {...sharedProps}
          background={background}
          gridColor={gridColor}
          textStyle={{ ...BezierEditor.defaultProps.textStyle, ...textStyle }}
        />
        <Progress
          {...sharedProps}
          value={value}
          progress={progress}
          progressColor={progressColor}
        />
        <Curve
          {...sharedProps}
          value={value}
          curveColor={curveColor}
          curveWidth={curveWidth}
        />
        {this.props.children}
        {readOnly
          ? undefined
          : <g>
              <Handle
                {...sharedProps}
                {...handle1Events}
                index={0}
                xval={value[0]}
                yval={value[1]}
                handleRadius={handleRadius}
                handleColor={handleColor}
                down={down === 1}
                hover={hover === 1}
                handleStroke={handleStroke}
                background={background}
              />
              <Handle
                {...sharedProps}
                {...handle2Events}
                index={1}
                xval={value[2]}
                yval={value[3]}
                handleRadius={handleRadius}
                handleColor={handleColor}
                down={down === 2}
                hover={hover === 2}
                handleStroke={handleStroke}
                background={background}
              />
            </g>}
      </svg>
    );
  }
}
