import React from "react";
import BezierEasing from "bezier-easing";
import BezierComponent from "./BezierComponent";

export default class Progress extends BezierComponent {
  _easingValue = this.props.value;
  _easing = BezierEasing(...this.props.value);
  easing() {
    if (this.props.value !== this._easingValue) {
      this._easingValue = this.props.value;
      this._easing = BezierEasing(...this.props.value);
    }
    return this._easing;
  }

  shouldComponentUpdate(nextProps) {
    if (super.shouldComponentUpdate(nextProps)) return true;
    const { value, progress, progressColor } = this.props;
    return (
      nextProps.progress !== progress ||
      nextProps.progressColor !== progressColor ||
      nextProps.value !== value
    );
  }

  render() {
    const { progress, progressColor } = this.props;
    if (!progress) return <path />;
    const easing = this.easing();
    const sx = this.x(0);
    const sy = this.y(0);
    const px = this.x(progress);
    const py = this.y(easing ? easing(progress) : 0);
    const prog = `M${px},${sy} L${px},${py} L${sx},${py}`;
    return (
      <path fill="none" strokeWidth="1px" stroke={progressColor} d={prog} />
    );
  }
}
