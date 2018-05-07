import React, { Fragment } from "react";
import RemoteData from "./RemoteData";

const init = {
  state: RemoteData.Loading,
  command: Cmd(res => setTimeout(res, 1000)).map(onSuccess),
};

const onSuccess = res => model => ({
  ...model,
  state: RemoteData.Success(res),
});

createProgram(init, ({ model }) => (
  <Fragment>
    <ChangeTracker onChange={x => this.props.onChange(x)} value={model.state} />
    <Commander command={model.command} />
  </Fragment>
));
let key = 0;

export const Cmd = fork => ({
  fork,
  key: key++,
});

Cmd.fromPromise = (resFn, rejFn, promise) =>
  Cmd(fork => {
    let isCancelled = false;
    promise()
      .then(x => !isCancelled && fork(resFn(x)))
      .catch(y => !isCancelled && fork(rejFn(y)));
    return () => (isCancelled = true);
  });

Cmd.fromTask = (resFn, rejFn, task) =>
  Cmd(fork => {
    const execution = task.fork(x => fork(resFn(x)), y => fork(rejFn(y)));
    return () => execution.cancel();
  });

Cmd.fromIO = (resFn, io) =>
  Cmd(fork => {
    let isCancelled = false;
    io.fork(x => !isCancelled && fork(resFn(x)));
    return () => (isCancelled = true);
  });

Cmd.fromObservable = (resFn, rejFn, observable) =>
  Cmd(fork => {
    const execution = observable.subscribe(
      x => fork(resFn(x)),
      y => fork(rejFn(y)),
    );
    return () => execution.unsubscribe();
  });

const { Provider, Consumer } = React.createContext(() => {});

const createProgram = (init, Component) => {
  class Program extends React.Component {
    state = init;
    dispatch = fn => this.setState(fn);
    render() {
      <Provider value={this.dispatch}>
        <Component model={this.state} />;
      </Provider>;
    }
  }
};

class ChangeTracker extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.value !== this.props.value) {
      return true;
    } else {
      return false;
    }
  }
  componentDidUpdate(prevProps) {
    this.props.onChange(prevProps.value, this.props.value);
  }
  render() {
    return null;
  }
}

const HocConsumer = (ComposedConsumer, prop, ComposedComponent) => (
  <ComposedConsumer>
    {value => <ComposedComponent {...{ [prop]: value }} />}
  </ComposedConsumer>
);

const Commander = HocConsumer(
  Consumer,
  "dispatch",
  class Command extends React.Component {
    componentDidMount() {
      this.fork();
    }
    componentWillUnmount() {
      this.cancel();
    }
    shouldComponentUpdate(nextProps) {
      if (this.props.command.key !== nextProps.command) {
        this.cancel();
        this.fork();
      }
    }
    fork() {
      this.command = this.props.command.fork(this.dispatch);
    }
    cancel() {
      this.command();
    }
    render() {
      return null;
    }
  },
);
