import React from "react";
import Dict from "./Dict";
import RemoteData from "./RemoteData";
import IO from "./IO";
import Task from "./Task";
import Maybe from "./Maybe";
import * as Dom from "./Dom";
import * as Spotify from "./Spotify";
import { Type } from "burk";
import { pipe } from "./Utils";
import { Cmd } from "./Elm";

// MSG

const Msg = Type("Login.Msg", {
  TokenSuccess: ["token"],
  TokenFailure: ["err"],
  ArtistsMsg: ["msg"],
});

// MODEL

export const init = () => [
  RemoteData.Loading,
  Cmd.fromTask(Msg.TokenSuccess, Msg.TokenFailure, accessTokenTask),
  Maybe.Nothing,
];

// UPDATE

export const update = ([model, commands]) =>
  Msg.fold({
    TokenSuccess: token => [
      RemoteData.Success(token),
      commands,
      Maybe.Just(token),
    ],
    TokenFailure: err => [RemoteData.Error(err), commands, Maybe.Nothing],
  });

// VIEW

export function View({ model }) {
  return (
    <div>
      {pipe(model, [
        RemoteData.fold({
          Loading: () => "Fetching token...",
          Success: token => token,
          _: () => <a href={Spotify.AUTH_URL}>Login</a>,
        }),
      ])}
    </div>
  );
}

const accessTokenTask = IO.toTask(Dom.getHashParams)
  .map(Dict.get("access_token"))
  .flatMap(
    Maybe.fold({
      Just: Task.succeed,
      Nothing: () => Task.fail("Could not find access_token"),
    }),
  );
