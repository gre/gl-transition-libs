// @flow
import React, { Component } from "react";
import raf from "raf";
import Vignette from "./Vignette";

type Props = {
  paused?: boolean,
  transitions: Array<*>,
  transitionsParams?: Array<*>,
  easings?: Array<(x: number) => number>,
  images: Array<string>,
  delay: number,
  duration: number, // in ms
  keepRenderingDuringDelay?: boolean,
};

// NB this is our own abstraction specifically for the website, it's not meant to be used somewhere else, but if you want, feel free to fork the code.
export default class AnimatedVignette extends Component {
  props: Props;
  static defaultProps = {
    paused: false,
    delay: 0,
    duration: 5000,
    keepRenderingDuringDelay: false,
  };
  state = {
    i: 0,
  };
  vignette: Vignette;
  _raf: *;
  hovered = false;
  lastT = 0;
  endReachedSince = 0;
  loop = (t: number) => {
    this._raf = raf(this.loop);
    const dt = Math.min(t - this.lastT, 100);
    this.lastT = t;
    const { vignette, props: { duration, delay } } = this;
    let progress = vignette.getProgress();
    progress += dt / duration;
    if (progress < 1) {
      // animating...
      vignette.setProgress(progress);
    } else if (this.endReachedSince < delay) {
      // nothing to do. pause for the delay.
      this.endReachedSince += dt;
      vignette.setProgress(1, this.props.keepRenderingDuringDelay);
    } else {
      // schedule a new slide...
      this.setState({ i: this.state.i + 1 });
      this.endReachedSince = 0;
      vignette.setProgress(0);
    }
  };
  onStart = (t: number) => {
    this.lastT = t;
    this.loop(t);
  };
  running = false;
  start = () => {
    this.running = true;
    raf.cancel(this._raf);
    this._raf = raf(this.onStart);
  };
  stop = () => {
    this.running = false;
    raf.cancel(this._raf);
  };

  componentDidMount() {
    this.syncRunning(this.props);
  }
  componentWillUnmount() {
    this.start();
  }
  componentWillReceiveProps(props: Props) {
    this.syncRunning(props);
  }
  onRef = (v: Vignette) => {
    this.vignette = v;
    this.syncRunning(this.props);
  };
  onHoverIn = () => {
    this.hovered = true;
    this.syncRunning(this.props);
  };
  onHoverOut = () => {
    this.hovered = false;
    this.syncRunning(this.props);
    return false;
  };
  conditionToRun({ paused }: Props) {
    return !paused && !this.hovered && this.vignette;
  }
  syncRunning(props: Props) {
    const shouldRun = this.conditionToRun(props);
    if (shouldRun !== this.running) {
      if (shouldRun) {
        this.start();
      } else {
        this.stop();
      }
    }
  }
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
