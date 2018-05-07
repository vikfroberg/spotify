import React, { Fragment } from "react";
import Dict from "./Dict";
import RemoteData from "./RemoteData";
import IO from "./IO";
import Task from "./Task";
import Cmd from "./Cmd";
import Maybe from "./Maybe";
import * as R from "ramda";
import * as Spotify from "./Spotify";
import * as Dom from "./Dom";
import { pipe } from "./Utils";

const traceFn = fn => x => {
  console.log(x);
  return fn(x);
};

const trace = x => {
  console.log(x);
  return x;
};

const wait = ms => Task((res, rej) => setTimeout(res, ms), clearTimeout);
const debounce = (ms, task) => wait(ms).flatMap(() => task);

// Model

const init = () => ({
  model: {
    artist: "",
    remoteToken: RemoteData.Loading,
    remoteSearch: RemoteData.NotAsked,
  },
  commands: [Cmd.fromTask(tokenSuccess, tokenFailure, accessTokenTask)],
  subscriptions: {
    remoteSearch: Cmd.none,
  },
});

// Updaters

const tokenSuccess = token => ({ model, commands }) => ({
  model: {
    ...model,
    remoteToken: RemoteData.Success(token),
  },
});

const tokenFailure = err => ({ model }) => ({
  model: {
    ...model,
    remoteToken: RemoteData.Failure(err),
  },
});

const changeArtist = (artist, token) => ({ model, subscriptions }) => ({
  model: {
    ...model,
    artist,
    remoteSearch: artist.length > 2 ? RemoteData.Loading : RemoteData.NotAsked,
  },
  subscriptions: {
    ...subscriptions,
    searchArtist:
      artist.length > 2
        ? Cmd.fromTask(
            searchArtistSuccess,
            searchArtistFailure,
            debounce(500, searchArtist(artist, token)),
          )
        : Cmd.none,
  },
});

const searchArtistSuccess = res => ({ model }) => ({
  model: {
    ...model,
    remoteSearch: RemoteData.Success(res.data.artists.items),
  },
});

const searchArtistFailure = err => ({ model }) => ({
  model: {
    ...model,
    remoteSearch: RemoteData.Failure(err),
  },
});

// View

function View({ model, dispatch }) {
  return (
    <div>
      {pipe(model.remoteToken, [
        RemoteData.fold({
          Loading: () => "Fetching token...",
          Success: token => (
            <Fragment>
              <Search
                onChange={e => dispatch(changeArtist(e.target.value, token))}
              />
              {pipe(model.remoteSearch, [
                RemoteData.fold({
                  NotAsked: () => "Search for an artist",
                  Loading: () => "Loading...",
                  Success: artists =>
                    artists.map(artist => {
                      const maybeImage = Maybe.from(artist.images[2]);
                      return (
                        <div key={artist.id}>
                          {pipe(maybeImage, [
                            Maybe.fold({
                              Just: image => (
                                <img
                                  src={image.url}
                                  height={image.height}
                                  width={image.width}
                                />
                              ),
                              Nothing: () => (
                                <div
                                  style={{
                                    backgroundColor: "#999",
                                    height: 64,
                                    width: 64,
                                  }}
                                />
                              ),
                            }),
                          ])}
                          <div>{artist.name}</div>
                        </div>
                      );
                    }),
                  Failure: () => "Failed to search artist",
                }),
              ])}
            </Fragment>
          ),
          _: () => <a href={Spotify.AUTH_URL}>Login</a>,
        }),
      ])}
    </div>
  );
}

function Search({ model, onChange }) {
  return (
    <div>
      <input
        autoFocus
        onChange={onChange}
        type="text"
        placeholder="Search for artist"
      />
    </div>
  );
}

// Helpers

const accessTokenTask = IO.toTask(Dom.getHashParams)
  .map(Dict.get("access_token"))
  .flatMap(
    Maybe.fold({
      Just: Task.succeed,
      Nothing: () => Task.fail("Could not find access_token"),
    }),
  );

const searchArtist = Spotify.searchArtist;

// App

class Commander extends React.Component {
  componentDidMount() {
    this.process = this.props.command.fork(this.props.onFork);
  }
  componentWillUnmount() {
    this.process.cancel();
  }
  render() {
    return null;
  }
}

function createProgram(init, View) {
  return class App extends React.Component {
    state = {
      commands: [],
      subscriptions: [],
      ...init(),
    };
    dispatch = updater => {
      this.setState(updater);
    };
    render() {
      const { model, commands, subscriptions } = this.state;
      return (
        <Fragment>
          <View model={model} dispatch={this.dispatch} />
          {commands.map(command => (
            <Commander
              key={command.key}
              command={command}
              onFork={this.dispatch}
            />
          ))}
          {Object.keys(subscriptions).map(key => (
            <Commander
              key={subscriptions[key].key}
              command={subscriptions[key]}
              onFork={this.dispatch}
            />
          ))}
        </Fragment>
      );
    }
  };
}

export default createProgram(init, View);
