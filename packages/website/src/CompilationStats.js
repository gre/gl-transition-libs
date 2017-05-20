//@flow
import React, { Component } from "react";
import "./CompilationStats.css";

const fpsFormat = (n: number) => (n > 60 ? "60+" : Math.round(n));
const niceDigits = (n: number) => (n < 1 ? n.toFixed(2) : Math.round(n));

const colorRange = (ranges: Array<number>, colors: Array<string>) => (
  value: number
) => {
  let i;
  for (i = 0; i < ranges.length && value > ranges[i]; i++);
  return colors[i];
};

class StatTime extends Component {
  render() {
    const { label, value, unit, color, format } = this.props;
    return (
      <div className="compilation-stats-time">
        <div className="label">{label}</div>
        <div className={"body color-" + color(value)}>
          <span className="value">
            {format(value)}
          </span>
          {" "}
          <span className="unit">
            {unit}
          </span>
        </div>
      </div>
    );
  }
}

const compileTimeColor = colorRange([10, 50], ["green", "yellow", "red"]);
const drawTimeColor = colorRange([6, 16], ["green", "yellow", "red"]);
const fpsColor = colorRange([30, 60], ["red", "yellow", "green"]);

export default class CompilationStats extends Component {
  props: {
    compilation: ?{
      compileTime: number,
      drawTime: number,
    },
  };
  render() {
    const { compilation } = this.props;
    return !compilation || compilation.drawTime === 0
      ? null
      : <div className="compilation-stats">
          <StatTime
            label="compile time"
            unit="ms"
            value={compilation.compileTime}
            format={niceDigits}
            color={compileTimeColor}
          />
          <StatTime
            label="draw time"
            unit="ms"
            value={compilation.drawTime}
            format={niceDigits}
            color={drawTimeColor}
          />
          <StatTime
            label="theoric FPS"
            unit="FPS"
            value={1000 / compilation.drawTime}
            format={fpsFormat}
            color={fpsColor}
          />
        </div>;
  }
}
