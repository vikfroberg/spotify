import React, { Fragment } from "react";
import axios from "axios";
import * as R from "ramda";
import { createProgram, Cmd, Commander } from "amigos";
import { pipe } from "./Utils";
import Task from "./Task";
import RemoteData from "./RemoteData";

const noop = () => {};

const wait = ms => Task((res, rej) => setTimeout(res, ms), clearTimeout);
const debounce = (ms, task) => wait(ms).flatMap(() => task);

const getRepos = username =>
  debounce(
    600,
    Task.fromPromise(() =>
      axios.get("https://api.github.com/users/" + username + "/repos"),
    ),
  );

function init() {
  return {
    name: "",
    repos: RemoteData.NotAsked,
    command: Cmd.none,
  };
}

const getReposSuccess = res => model => {
  return { ...model, repos: RemoteData.Success(res.data) };
};

const getReposFailure = err => model => {
  return {
    ...model,
    repos: RemoteData.Failure(err.response.status, err.response.data),
  };
};

const onChangeName = name => model => ({
  ...model,
  name,
  repos: name.length > 0 ? RemoteData.Loading : RemoteData.NotAsked,
  command:
    name.length > 0
      ? Cmd.fromTask(getReposSuccess, getReposFailure, getRepos(name))
      : Cmd.none,
});

const targetValue = x => x.target.value;

function View({ model, dispatch, onRepoPress }) {
  return (
    <Fragment>
      <h2>Username:</h2>
      <input
        autoFocus
        type="text"
        value={model.name}
        onChange={R.pipe(targetValue, onChangeName, dispatch)}
      />
      <h2>Repos:</h2>
      {pipe(model.repos, [
        RemoteData.fold({
          NotAsked: () => <p>Search for a github username</p>,
          Loading: () => <p>Loading...</p>,
          Success: repos =>
            repos.length ? (
              repos.map(repo => (
                <button
                  style={{ display: "block", marginBottom: 10 }}
                  onClick={() => onRepoPress(repo)}
                  key={repo.id}
                >
                  {repo.name}
                </button>
              ))
            ) : (
              <p>No repos for this user</p>
            ),
          Failure: status => {
            switch (status) {
              case 404:
                return <p>Couldn't find any user with that name</p>;
              case 403:
                return <p>Access denied</p>;
              default:
                return <p>Something went wrong</p>;
            }
          },
        }),
      ])}
      <Commander command={model.command} onChange={noop} onFork={dispatch} />
    </Fragment>
  );
}

export default createProgram(init, View);
