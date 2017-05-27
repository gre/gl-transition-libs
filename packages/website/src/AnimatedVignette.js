// @flow
import React, { Component } from "react";
import raf from "raf";
import Vignette from "./Vignette";

export default class AnimatedVignette extends Component {
  props: {
    transitions: Array<*>,
    transitionsParams?: Array<*>,
    easings?: Array<(x: number) => number>,
    images: Array<string>,
    delay: number,
    duration: number, // in ms
  };
  static defaultProps = {
    delay: 0,
    duration: 5000,
  };
  state = {
    i: 0,
  };
  vignette: Vignette;
  _raf: *;
  hovered = false;
  componentDidMount() {
    let lastT, endReachedSince = 0;
    const loop = t => {
      this._raf = raf(loop);
      if (!lastT) lastT = t;
      const dt = Math.min(t - lastT, 100);
      lastT = t;
      const { vignette, hovered } = this;
      if (hovered || !vignette) return;
      let progress = vignette.getProgress();
      progress += dt / this.props.duration;
      if (progress < 1) {
        // animating...
        vignette.setProgress(progress);
      } else if (endReachedSince < this.props.delay) {
        // nothing to do. pause for the delay.
        endReachedSince += dt;
        vignette.setProgress(1);
      } else {
        // schedule a new slide...
        this.setState({ i: this.state.i + 1 });
        endReachedSince = 0;
        vignette.setProgress(0);
      }
    };
    this._raf = raf(loop);
  }
  componentWillUnmount() {
    raf.cancel(this._raf);
  }
  onRef = (v: Vignette) => {
    this.vignette = v;
  };
  onHoverIn = () => {
    this.hovered = true;
  };
  onHoverOut = () => {
    this.hovered = false;
    return false;
  };
  render() {
    const {
      images,
      transitions,
      transitionsParams,
      easings,
      delay,
      duration,
      ...rest
    } = this.props;
    const { i } = this.state;
    const transition = transitions[i % transitions.length];
    const transitionParams =
      transitionsParams && transitionsParams[i % transitions.length];
    const fromImage = images[i % images.length];
    const toImage = images[(i + 1) % images.length];
    const easing = easings && easings[i % easings.length];
    return (
      <Vignette
        ref={this.onRef}
        from={fromImage}
        to={toImage}
        onHoverIn={this.onHoverIn}
        onHoverOut={this.onHoverOut}
        transition={transition}
        transitionParams={transitionParams}
        easing={easing}
        {...rest}
      />
    );
  }
}
