import React from "react";
import BezierComponent from "./BezierComponent";

function range(from, to, step) {
  const t = [];
  for (let i = from; i < to; i += step)
    t.push(i);
  return t;
}

function sameShadowObject(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (let i in a) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default class Grid extends BezierComponent {
  gridX(div) {
    var step = 1 / div;
    return range(0, 1, step).map(this.x);
  }

  gridY(div) {
    var step = 1 / div;
    return range(0, 1, step).map(this.y);
  }

  shouldComponentUpdate(nextProps) {
    if (super.shouldComponentUpdate(nextProps)) return true;
    const { background, gridColor, textStyle } = this.props;
    return (
      nextProps.background !== background ||
      nextProps.gridColor !== gridColor ||
      !sameShadowObject(nextProps.textStyle, textStyle)
    );
  }

  render() {
    const { x, y } = this;
    const { background, gridColor, textStyle } = this.props;

    const sx = x(0);
    const sy = y(0);
    const ex = x(1);
    const ey = y(1);

    const xhalf = this.gridX(2);
    const yhalf = this.gridY(2);
    const xtenth = this.gridX(10);
    const ytenth = this.gridY(10);

    const gridbg = `M${sx},${sy} L${sx},${ey} L${ex},${ey} L${ex},${sy} Z`;

    const tenth = xtenth
      .map(xp => `M${xp},${sy} L${xp},${ey}`)
      .concat(ytenth.map(yp => `M${sx},${yp} L${ex},${yp}`))
      .join(" ");

    const half = xhalf
      .map(xp => `M${xp},${sy} L${xp},${ey}`)
      .concat(yhalf.map(yp => `M${sx},${yp} L${ex},${yp}`))
      .concat([`M${sx},${sy} L${ex},${ey}`])
      .join(" ");

    const ticksLeft = ytenth
      .map((yp, i) => {
        const w = 3 + (i % 5 === 0 ? 2 : 0);
        return `M${sx},${yp} L${sx - w},${yp}`;
      })
      .join(" ");

    const ticksBottom = xtenth
      .map((xp, i) => {
        const h = 3 + (i % 5 === 0 ? 2 : 0);
        return `M${xp},${sy} L${xp},${sy + h}`;
      })
      .join(" ");

    return (
      <g>
        <path fill={background} d={gridbg} />
        <path strokeWidth="1px" stroke={gridColor} d={tenth} />
        <path strokeWidth="2px" stroke={gridColor} d={half} />
        <path strokeWidth="1px" stroke={gridColor} d={ticksLeft} />
        <text
          style={{ textAnchor: "end", ...textStyle }}
          transform="rotate(-90)"
          x={-this.y(1)}
          y={this.x(0) - 8}
        >
          Progress Percentage
        </text>
        <path strokeWidth="1px" stroke={gridColor} d={ticksBottom} />
        <text
          style={{ dominantBaseline: "text-before-edge", ...textStyle }}
          textAnchor="end"
          x={this.x(1)}
          y={this.y(0) + 5}
        >
          Time Percentage
        </text>
      </g>
    );
  }
}
