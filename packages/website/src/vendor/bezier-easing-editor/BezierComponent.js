import React from "react";

function interp(a, b, x) {
  return a * (1 - x) + b * x;
}

export default class BezierComponent extends React.Component {
  x = value => Math.round(interp(this.props.xFrom, this.props.xTo, value));
  y = value => Math.round(interp(this.props.yFrom, this.props.yTo, value));
  shouldComponentUpdate(nextProps) {
    const { xFrom, yFrom, xTo, yTo } = this.props;
    return (
      nextProps.xFrom !== xFrom ||
      nextProps.yFrom !== yFrom ||
      nextProps.xTo !== xTo ||
      nextProps.yTo !== yTo
    );
  }
}
