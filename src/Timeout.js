import React, { Fragment } from "react";
import { Commander } from "amigos";
import * as R from "ramda";

const Context = React.createContext(() => {});

export class Provider extends React.Component {
  state = {};
  perform = (cmd, onFork) => {
    this.setState(state => ({ ...state, [cmd.key]: [cmd, onFork] }));
  };
  drop = key => () => {
    this.setState(R.dissoc(key));
  };
  render() {
    return (
      <Context.Provider value={this.perform}>
        {Object.keys(this.state).length === 0 && this.props.children}
        {Object.keys(this.state).map(key => (
          <Commander
            key={key}
            command={this.state[key][0]}
            onChange={() => {}}
            onFork={R.pipe(this.drop(key), this.state[key][1])}
          />
        ))}
      </Context.Provider>
    );
  }
}

export const Consumer = Context.Consumer;
