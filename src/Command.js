import React, { Fragment } from "react";
import * as R from "ramda";

// CMD

let key = 0;

export const Cmd = fork => ({
  fork,
  key: key++,
});

Cmd.fromPromise = (resFn, rejFn, promise) =>
  Cmd(fork => {
    let isCancelled = false;
    promise
      .then(x => !isCancelled && fork(resFn(x)))
      .catch(y => !isCancelled && fork(rejFn(y)));
    return () => (isCancelled = true);
  });

Cmd.fromTask = (resFn, rejFn, task) =>
  Cmd(fork => {
    let isCancelled = false;
    task.fork(
      x => !isCancelled && fork(resFn(x)),
      y => !isCancelled && fork(rejFn(y)),
    );
    return () => (isCancelled = true);
  });

Cmd.fromIO = (resFn, io) =>
  Cmd(fork => {
    let isCancelled = false;
    io.fork(x => !isCancelled && fork(resFn(x)));
    return () => (isCancelled = true);
  });

// SUB

export const Sub = (_fork, updater, key) => ({
  _fork,
  updater,
  key,
  map: fn => Sub(_fork, x => R.pipe(updater(x), fn(x)), key),
  fork: res => _fork(x => res(updater(x))),
});

// CREATE PROGRAM

export function createProgram({ init, View, subscriptions }) {
  return class Program extends React.Component {
    state = init();

    dispatch = updater => {
      this.setState(updater);
    };

    render() {
      const subs = Object.values(
        subscriptions(this.state.model).reduce((acc, sub) => {
          const newSub = acc[sub.key] ? acc[sub.key].map(sub.updater) : sub;
          return { ...acc, [sub.key]: newSub };
        }, {}),
      );

      return (
        <Fragment>
          <View model={this.state.model} dispatch={this.dispatch} />
          {this.state.commands.map(cmd => (
            <Commander key={cmd.key} cmd={cmd} onFork={this.dispatch} />
          ))}
          {subs.map(sub => (
            <Subscriber key={sub.key} sub={sub} onFork={this.dispatch} />
          ))}
        </Fragment>
      );
    }
  };
}

// COMMANDER

export class Commander extends React.Component {
  componentDidMount() {
    this.cmd = this.props.cmd.fork(this.props.onFork);
  }
  componentWillUnmount() {
    this.cmd();
  }
  render() {
    return null;
  }
}

// SUBSCRIBER

export class Subscriber extends React.Component {
  componentDidMount() {
    this.sub = this.props.sub.fork(this.props.onFork);
  }
  componentWillUnmount() {
    this.sub();
  }
  render() {
    return null;
  }
}
