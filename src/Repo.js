import React, { Fragment } from "react";
import axios from "axios";
import Task from "./Task";
import RemoteData from "./RemoteData";
import * as R from "ramda";
import * as Timeout from "./Timeout";
import { createProgram, Cmd, Commander } from "amigos";
import { pipe } from "./Utils";

function init({ url }) {
  return {
    repo: RemoteData.Loading,
    command: Cmd.fromTask(getSuccess, getFailure, get(url)),
  };
}

const getSuccess = data => model => {
  return {
    ...model,
    repo: RemoteData.Success(data),
  };
};

const getFailure = data => model => {
  return {
    ...model,
    repo: RemoteData.Failure(data),
  };
};

class View extends React.Component {
  render() {
    const { model, dispatch } = this.props;
    return (
      <Fragment>
        {pipe(model.repo, [
          RemoteData.fold({
            Loading: () => "Loading.........",
            Success: () => "Something went goooooood!",
            Failure: () => "Something went wroooong!",
            NotAsked: () => {
              throw new Error("DONT SHOW ME FOR FUCK SAKE");
            },
          }),
        ])}
        <Timeout.Consumer>
          {perform => (
            <Commander
              command={model.command}
              onChange={() => perform(model.command, dispatch)}
              onFork={() => {}}
            />
          )}
        </Timeout.Consumer>
      </Fragment>
    );
  }
}

function get(url) {
  return Task.fromPromise(() => axios.get(url));
}

export default createProgram(init, View);
