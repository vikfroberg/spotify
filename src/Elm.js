import React, { Fragment } from "react";

let _key = 0;

export const Cmd = fork => ({
  kind: "Cmd",
  fork,
  key: _key++,
  map: fn => Cmd(res => fork(x => res(fn(x)))),
});

Cmd.map = (msg, x) => {
  if (x.kind === "Cmd") {
    return x.map(msg);
  } else if (Array.isArray(x)) {
    return x.map(y => Cmd.map(msg, y));
  } else {
    return Object.keys(x).reduce(
      (acc, key) => ({ ...acc, [key]: Cmd.map(msg, x[key]) }),
      {},
    );
  }
};

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
    const execution = task.fork(x => fork(resFn(x)), y => fork(rejFn(y)));
    return () => {};
    // return () => execution.cancel();
  });

Cmd.fromIO = (resFn, io) =>
  Cmd(fork => {
    const execution = io.fork(x => fork(resFn(x)));
    return () => {};
    // return () => execution.cancel();
  });

Cmd.fromObservable = (resFn, rejFn, observable) =>
  Cmd(fork => {
    const execution = observable.subscribe(
      x => fork(resFn(x)),
      y => fork(rejFn(y)),
    );
    return () => execution.unsubscribe();
  });

export function createProgram(init, View, updater = id) {
  return class Program extends React.Component {
    state = { model: init };

    dispatch = data => {
      this.setState(state => ({ model: updater(data)(state.model) }));
    };

    render() {
      const [model, commands] = this.state.model;
      return (
        <Fragment>
          <View model={model} dispatch={this.dispatch} />
          <Commander cmd={commands} onFork={this.dispatch} />
        </Fragment>
      );
    }
  };
}

// COMPONENTS

class Mounter extends React.Component {
  componentDidMount() {
    this.x = this.props.componentDidMount();
  }
  componentWillUnmount() {
    this.props.componentWillUnmount(this.x);
  }
  render() {
    return null;
  }
}

class Commander extends React.Component {
  render() {
    const { cmd, onFork } = this.props;
    return cmd.kind === "Cmd" ? (
      <Mounter
        key={cmd.key}
        componentDidMount={() => cmd.fork(onFork)}
        componentWillUnmount={execution => execution()}
      />
    ) : (
      map(cmd, (_cmd, key) => (
        <Commander key={key} cmd={_cmd} onFork={onFork} />
      ))
    );
  }
}

// HELPERS

function id(x) {
  return x;
}

function map(x, fn) {
  if (Array.isArray(x)) {
    return x.map(fn);
  } else {
    return Object.keys(x).map(key => fn(x[key], key));
  }
}
